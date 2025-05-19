import { OptionInputData, OptionResultData, OptionCalculationResult } from '../models/optionTypes';
import standardNormalCDF from '../utils/math';

export class OptionsService {
  /**
   * Process option pricing inputs and calculate results
   */
  public calculateOptionPrices(data: OptionInputData): OptionCalculationResult {
    const processedData: OptionInputData = {
      spot: parseFloat(data.spot as any),
      strike: parseFloat(data.strike as any),
      exp: parseFloat(data.exp as any),
      rate: parseFloat(data.rate as any),
      vol: parseFloat(data.vol as any),
    };
    
    const callPrice = this.calculateCallPrice(processedData);
    const putPrice = this.calculatePutPrice(processedData);
    
    const results: OptionResultData = {
      callPrice,
      putPrice,
    };
    
    return {
      input: processedData,
      results,
      timestamp: new Date()
    };
  }
  
  private calculateCallPrice(data: OptionInputData): number {
    const spot = data.spot;
    const strike = data.strike;
    const exp = data.exp;
    const rate = data.rate;
    const vol = data.vol

    const d1 = (Math.log(spot/strike)+(rate+((vol**2)/2))*exp)/(vol*Math.sqrt(exp));
    const d2 = d1 - (vol*Math.sqrt(exp));

    const nd1 = standardNormalCDF(d1);
    const nd2 = standardNormalCDF(d2);

    const call = (spot*nd1) - (strike*(Math.E**(-rate*exp))*nd2);
    return call;
  }
  
  private calculatePutPrice(data: OptionInputData): number {
    return 1;
  }
}

export const optionsService = new OptionsService();
