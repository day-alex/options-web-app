from pydantic import BaseModel

class OptionInputData(BaseModel):
    spot: float
    strike: float
    exp: float
    rate: float
    vol: float

class MonteCarloInputData(BaseModel):
    spot: float
    strike: float
    exp: float
    rate: float
    vol: float
    num_paths: int = 100000
    num_steps: int = 252
    num_vis_paths: int = 50
