from fastapi import FastAPI, HTTPException
from datetime import datetime
from models import OptionInputData
from services.options_services import calculate_option_prices
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
