// backend/src/services/optionsService.ts
import { getOptionPrices } from './grpcClient';
import { OptionInputData } from '../models/optionTypes';

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
  }
};
