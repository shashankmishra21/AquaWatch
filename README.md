# 🌊 AquaWatch – Water Quality Risk Assessment System

AquaWatch is an intelligent water safety monitoring platform that transforms raw laboratory water test values into instant, accurate, WHO-based contamination risk assessments.

Built for **FORGE A5 Hackathon**, AquaWatch reduces hours of manual calculation into seconds of automated precision.

---

## 🚨 Problem Statement

Water testing labs receive samples daily from multiple villages.  
Technicians must manually compute indices like **WQI** and **HPI**, compare metal concentrations against WHO limits, and classify contamination risk.

This process is slow, error-prone, and delays critical intervention.

---

## ✅ Our Solution

AquaWatch provides:

- Automated contamination index calculation  
- Instant risk classification (Safe → Danger)  
- Priority alerts for critical villages  
- AI-based advisory recommendations  
- Visual dashboards + charts  
- PDF export reports for authorities  

---

## 🔥 Key Features

### ✅ Multi-Village Water Analysis
Analyze any number of villages dynamically (not limited to 5).

### ✅ Risk Classification Dashboard
Color-coded risk levels based on WHO guidelines:

- Safe  
- Warning  
- Poor  
- Very Poor  
- Danger  

### 🚨 Critical Priority Villages
Unsafe villages are automatically surfaced first for urgent action.

### 📊 WQI Comparison Charts
Interactive chart visualization to compare water quality across villages.

### 💡 AI Advisory Recommendations
Actionable recommendations are generated for each risk level.

### 📄 PDF Export Reports
Generate authority-ready water safety reports in one click.

### 📥 Google Sheets Import
Supports importing village datasets directly from Google Sheets.

---

## 🖥️ Tech Stack

Frontend:
- React.js  
- Tailwind CSS  
- Recharts (Charts)

Backend:
- Automated WHO formula engine  
- Risk classification logic

Utilities:
- jsPDF (PDF export)
- Google Sheets API integration

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

git clone https://github.com/your-username/aquawatch.git
cd aquawatch

Install Dependencies
npm install

Start the Development Server
npm start

App will run at:
http://localhost:3000

How It Works

Enter water sample parameters for villages

Import values manually or via Google Sheets

AquaWatch computes WQI + HPI automatically

Risk levels and contamination alerts are generated

Critical villages are prioritized

Advisory recommendations are shown

PDF reports can be exported for authorities

Future Scope

GIS-based contamination risk maps

SMS alerts to village officers

Historical trend monitoring

AI anomaly detection for suspicious contamination patterns

District-level water safety dashboards

eam

Built with ❤️ for FORGE A5 Hackathon
by Shashank Team FLAWLESS
