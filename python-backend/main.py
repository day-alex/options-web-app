from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yfinance as yf
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import math

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

@app.get("/")
async def root():
    return {"message":"Hello World!"}

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
