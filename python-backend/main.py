from fastapi import FastAPI, HTTPException
from datetime import datetime
from models import OptionInputData, MonteCarloInputData
from services.options_services import calculate_option_prices, calculate_monte_carlo
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import math
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React/Next.js dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def safe_serialize(obj):
    if isinstance(obj, dict):
        return {k: safe_serialize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [safe_serialize(x) for x in obj]
    elif hasattr(obj, "tolist"):  # NumPy arrays, pd.Series
        return safe_serialize(obj.tolist())
    elif hasattr(obj, "item"):  # NumPy scalars
        return safe_serialize(obj.item())
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    return obj

def load_tickers():
    tickers_file = Path("data/sp500_tickers.json")
    with open(tickers_file, 'r') as f:
        return json.load(f)

TICKERS_CACHE = load_tickers()

@app.get("/")
async def root():
    return {"message":"Hello World!"}

@app.get("/tickers/all")
async def get_all_tickers():
    return {"tickers": TICKERS_CACHE}

@app.get("/options/lasts")
async def yf_option(ticker: str, expiration: str):
    try:
        calls = {}
        puts = {}
        stock = yf.Ticker(ticker)
        callOptions = safe_serialize(stock.option_chain(expiration).calls.to_dict())
        putOptions = safe_serialize(stock.option_chain(expiration).puts.to_dict())

        calls[expiration] = {}
        for idx, strike in callOptions["strike"].items():
            calls[expiration][strike] = callOptions["lastPrice"][idx]

        puts[expiration] = {}
        for idx, strike in putOptions["strike"].items():
            puts[expiration][strike] = putOptions["lastPrice"][idx]

        return { 
            "calls": calls,
            "puts": puts    
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/options/expirations")
async def yf_option(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        exps = stock.options

        return { "expirations" : exps }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/ticker/price")
async def get_ticker_price(ticker: str):
    stock = yf.Ticker(ticker)
    return {"last_price": stock.fast_info.last_price}

    

@app.post("/options/calculate")
async def calculate_options(input_data: OptionInputData):
    try:
        result = calculate_option_prices(input_data.model_dump())
        print(type(result), result)
        return {
            "success": True,
            "message": "Options calculated successfully",
            "data": {
                "results": {
                    "callPrice": result.c,
                    "putPrice": result.p
                },
                "input": input_data
            }
        }

    except Exception as e:
        print("Error calculating options:", e)
        raise HTTPException(status_code=500, detail="Server error processing options data")


@app.post("/options/monte-carlo")
async def monte_carlo_options(input_data: MonteCarloInputData):
    try:
        result = calculate_monte_carlo(input_data.model_dump())

        # Reshape flat path_data into 2D list: paths[i] = prices at each step
        paths = []
        if result.num_vis_paths > 0 and result.num_steps > 0:
            row_len = result.num_steps + 1
            flat = list(result.path_data)
            for i in range(result.num_vis_paths):
                paths.append(flat[i * row_len : (i + 1) * row_len])

        return {
            "success": True,
            "message": "Monte Carlo simulation completed",
            "data": {
                "results": {
                    "callPrice": result.call_price,
                    "putPrice": result.put_price,
                    "callStdError": result.call_std_error,
                    "putStdError": result.put_std_error,
                    "numPaths": result.num_paths,
                    "paths": paths,
                    "numVisualPaths": result.num_vis_paths,
                    "numSteps": result.num_steps,
                },
                "input": input_data
            }
        }
    except Exception as e:
        print("Error in Monte Carlo:", e)
        raise HTTPException(status_code=500, detail="Server error processing Monte Carlo simulation")
