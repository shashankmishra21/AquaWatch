from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VillageData(BaseModel):
    village: str
    pH: float
    turbidity: float
    lead: float
    arsenic: float
    fluoride: float
    bod: float

@app.post("/api/analyze")
def analyze_water(villages: List[VillageData]):
    results = []
    for v in villages:
        results.append({
            "village": v.village,
            "wqi": 50.0,
            "hpi": 70.0,
            "risk_level": "warning",
            "alerts": ["Lead slightly elevated"] if v.lead > 0.01 else []
        })
    return {"results": results}