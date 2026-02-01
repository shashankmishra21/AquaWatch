from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import gspread
from google.oauth2.service_account import Credentials

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

# Google Sheets Scopes
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

WHO_LIMITS = {
    "lead": 0.01,
    "arsenic": 0.01,
    "fluoride": 1.5,
    "pH_min": 6.5,
    "pH_max": 8.5,
    "turbidity": 5.0,
    "bod": 3.0,
}

PARAM_WEIGHTS = {
    "pH": 1.0,
    "turbidity": 1.0,
    "lead": 1.5,
    "arsenic": 1.5,
    "fluoride": 1.0,
    "bod": 1.0,
}

def quality_rating(value, ideal, standard):
    if standard <= 0:
        return 0
    return ((value - ideal) / (standard - ideal)) * 100

def compute_wqi(data):
    # pH
    if data.pH < WHO_LIMITS["pH_min"] or data.pH > WHO_LIMITS["pH_max"]:
        pH_q = 100
    else:
        pH_q = 0

    # Turbidity
    turb_q = quality_rating(data.turbidity, 0, WHO_LIMITS["turbidity"])

    # BOD
    bod_q = quality_rating(data.bod, 0, WHO_LIMITS["bod"])

    # Lead
    lead_q = quality_rating(data.lead, 0, WHO_LIMITS["lead"])

    # Arsenic
    arsenic_q = quality_rating(data.arsenic, 0, WHO_LIMITS["arsenic"])

    # Fluoride
    fluoride_q = quality_rating(data.fluoride, 0, WHO_LIMITS["fluoride"])

    w_pH = PARAM_WEIGHTS["pH"]
    w_turb = PARAM_WEIGHTS["turbidity"]
    w_bod = PARAM_WEIGHTS["bod"]
    w_lead = PARAM_WEIGHTS["lead"]
    w_arsenic = PARAM_WEIGHTS["arsenic"]
    w_fluoride = PARAM_WEIGHTS["fluoride"]

    sum_w = w_pH + w_turb + w_bod + w_lead + w_arsenic + w_fluoride
    sum_wq = (
        w_pH * pH_q
        + w_turb * turb_q
        + w_bod * bod_q
        + w_lead * lead_q
        + w_arsenic * arsenic_q
        + w_fluoride * fluoride_q
    )

    return sum_wq / sum_w if sum_w > 0 else 0

def compute_hpi(data):
    metals = {"lead": data.lead, "arsenic": data.arsenic}
    sum_w = 0
    sum_wq = 0
    for metal, value in metals.items():
        standard = WHO_LIMITS[metal]
        if standard <= 0:
            continue
        q = quality_rating(value, 0, standard)
        w = PARAM_WEIGHTS[metal]
        sum_w += w
        sum_wq += w * q
    return sum_wq / sum_w if sum_w > 0 else 0

def classify_risk(wqi, hpi):
    if wqi > 100 or hpi > 100:
        return "unfit", ["Immediate action required"]
    elif wqi > 75 or hpi > 75:
        return "very_poor", ["Unsafe for consumption"]
    elif wqi > 50 or hpi > 50:
        return "poor", ["Needs treatment"]
    elif wqi > 25:
        return "warning", ["Acceptable but monitor"]
    else:
        return "safe", ["Safe for consumption"]

@app.post("/api/analyze")
def analyze_water(villages: List[VillageData]):
    results = []
    for v in villages:
        wqi = compute_wqi(v)
        hpi = compute_hpi(v)
        risk, alerts = classify_risk(wqi, hpi)

        results.append({
            "village": v.village,
            "wqi": round(wqi, 2),
            "hpi": round(hpi, 2),
            "risk_level": risk,
            "alerts": alerts,
        })
    return {"results": results}

# import GOOGLE SHEETS
@app.get("/api/fetch-from-sheet")
def fetch_from_sheet(sheet_id: str):
    try:
        clean_id = sheet_id.split('/')[0].split('?')[0]
        
        creds = Credentials.from_service_account_file(
            'credentials.json', 
            scopes=SCOPES
        )
        client = gspread.authorize(creds)
        sheet = client.open_by_key(clean_id).sheet1
        records = sheet.get_all_records()
        
        villages = []
        for i, record in enumerate(records[:5]):
            villages.append({
                "village": str(record.get("Village", f"Village {i+1}")),
                "pH": float(record.get("pH", 7.0)) or 7.0,
                "turbidity": float(record.get("Turbidity", 0)) or 0,
                "lead": float(record.get("Lead", 0)) or 0,
                "arsenic": float(record.get("Arsenic", 0)) or 0,
                "fluoride": float(record.get("Fluoride", 0)) or 0,
                "bod": float(record.get("BOD", 0)) or 0
            })
        
        return {"villages": villages, "source": "Google Sheets"}
        
    except FileNotFoundError:
        print("credentials.json not found - using mock data")
    except Exception as e:
        print(f"Google Sheets error: {e} - using mock data")
    
    #FALLBACK
    # villages = [
    #     {"village": "Raipur Village A", "pH": 7.2, "turbidity": 5.0, "lead": 0.01, "arsenic": 0.005, "fluoride": 0.8, "bod": 2.0},
    #     {"village": "Raipur Village B", "pH": 7.8, "turbidity": 3.2, "lead": 0.008, "arsenic": 0.003, "fluoride": 1.0, "bod": 1.5},
    #     {"village": "Raipur Village C", "pH": 9.1, "turbidity": 8.5, "lead": 0.03, "arsenic": 0.02, "fluoride": 2.2, "bod": 5.0},
    #     {"village": "Raipur Village D", "pH": 6.8, "turbidity": 2.1, "lead": 0.002, "arsenic": 0.001, "fluoride": 0.5, "bod": 1.0},
    #     {"village": "Raipur Village E", "pH": 7.5, "turbidity": 4.0, "lead": 0.015, "arsenic": 0.012, "fluoride": 1.2, "bod": 3.5}
    # ]
    # return {"villages": villages, "source": "Mock Data (Demo)"}