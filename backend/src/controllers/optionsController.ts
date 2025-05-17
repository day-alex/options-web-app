import { Request, Response } from 'express';
import { optionsService } from '../services/optionsService';
import { OptionInputData } from '../models/optionTypes';

export class OptionsController {
  public async calculateOptions(req: Request, res: Response): Promise<void> {
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
      const result = optionsService.calculateOptionPrices(inputData);
      
      // Send successful response
      res.status(200).json({
        success: true,
        message: 'Options calculated successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error calculating options:', error);
      res.status(500).json({
        success: false,
        message: 'Server error processing options data'
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
