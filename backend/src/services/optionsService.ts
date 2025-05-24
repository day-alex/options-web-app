// backend/src/services/optionsService.ts
import { getOptionPrices } from './grpcClient';
import { OptionInputData } from '../models/optionTypes';

// Local function
function calculateBlackScholes(input: {
  S: number;
  K: number;
  T: number;
  R: number;
  V: number;
}) : { c: Number, p: Number } {
  const { S, K, T, R, V } = input;
  const d1 = (Math.log(S / K) + (R + 0.5 * V * V) * T) / (V * Math.sqrt(T));
  const d2 = d1 - V * Math.sqrt(T);

  const N = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2))); // Approximate normal CDF
  const erf = (x: number) => {
    // Approximation of the error function
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  const c = S * N(d1) - K * Math.exp(-R * T) * N(d2);
  const p = K * Math.exp(-R * T) * N(-d2) - S * N(-d1);

  return { c, p };
}

export const optionsService = {
  async calculateOptionPrices(data: OptionInputData) {
    const grpcRequest = {
      S: Number(data.spot),
      K: Number(data.strike),
      T: Number(data.exp),
      R: Number(data.rate),
      V: Number(data.vol),
    };

    const result = await getOptionPrices(grpcRequest);
    return result;
  },

  calculateLocally(data: OptionInputData) {
    return calculateBlackScholes({
      S: Number(data.spot),
      K: Number(data.strike),
      T: Number(data.exp),
      R: Number(data.rate),
      V: Number(data.vol)
    });
  }
};
