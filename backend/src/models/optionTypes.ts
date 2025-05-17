export interface OptionInputData {
  spot: number;
  strike: number;
  exp: number;
  rate: number;
  vol: number;
}

// Define the types for your response data
export interface OptionResultData {
  callPrice?: number;
  putPrice?: number;
}

// Combined type for request with processed data
export interface OptionCalculationResult {
  input: OptionInputData;
  results: OptionResultData;
  timestamp: Date;
}
