from pydantic import BaseModel

class OptionInputData(BaseModel):
    spot: float
    strike: float
    exp: float
    rate: float
    vol: float
