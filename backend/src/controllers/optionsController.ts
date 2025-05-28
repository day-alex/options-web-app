import { Request, Response } from 'express';
import { optionsService } from '../services/optionsService';
import { OptionInputData } from '../models/optionTypes';
import { DateTime } from 'luxon'; 
import yahooFinance from 'yahoo-finance2';

export class OptionsController {
  public calculateOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const inputData = req.body as OptionInputData;
      
      if (!this.validateInput(inputData)) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data. All fields must be numeric.'
        });
        return;
      }
      
      // Process data using service
      const result = await optionsService.calculateOptionPrices(inputData);
      
      // Send successful response
      res.status(200).json({
      success: true,
      message: 'Options calculated successfully',
      data: {
        results: {
          callPrice: result.c,
          putPrice: result.p
        },
        input: inputData
      }
    });
      
    } catch (error) {
      console.error('Error calculating options:', error);
      res.status(500).json({
        success: false,
        message: 'Server error processing options data'
      });
    }
  }

  public yfOption = async (req: Request, res: Response): Promise<void> => {
    try {
      // const { ticker, expiration } = req.query;
      // if (typeof ticker !== 'string' || !ticker.trim()) {
      //   res.status(400).json({ success: false, message: 'Invalid ticker symbol' });
      //   return;
      // }
      const ticker = 'NVDA';
      // const easternDate = DateTime.fromObject({ year: 2025, month: 6, day: 13 }, { zone: 'America/New_York' });
      // const date = easternDate.toJSDate();
      // console.log(date);
      const queryOptions: any = { 
        lang: 'en-US',
        formatted: false,
        region: 'US',
        date: new Date("2025-05-30")
      };

      // if (typeof date === 'string' && date.trim()) {
      // }
      console.log(queryOptions.date);
      // Pass the date directly to yahooFinance.options
      const optionChain = await yahooFinance.options(ticker, queryOptions);

      res.status(200).json({
        success: true,
        message: `Options data for ${ticker}`,
        data: optionChain
      });

    } catch (error) {
      console.error('Error in testYf:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch options data from Yahoo Finance',
        error: (error as any).message,
      });
    }
  }


  
  private validateInput(data: OptionInputData): boolean {
    // Check that all inputs are valid numbers
    const { spot, strike, exp, rate, vol } = data;
    
    return (
      !isNaN(Number(spot)) &&
      !isNaN(Number(strike)) &&
      !isNaN(Number(exp)) &&
      !isNaN(Number(rate)) &&
      !isNaN(Number(vol))
    );
  }
}

// Export a singleton instance
export const optionsController = new OptionsController();
