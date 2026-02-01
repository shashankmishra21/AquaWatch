import React, { useState } from "react";
import { analyzeWater, fetchFromSheet } from "./api";

const initialVillages = Array(5).fill({
  village: "",
  pH: "",
  turbidity: "",
  lead: "",
  arsenic: "",
  fluoride: "",
  bod: "",
}).map((v, i) => ({ ...v }));

export default function App() {
  const [villages, setVillages] = useState(initialVillages);
  const [results, setResults] = useState(null);
  const [sheetId, setSheetId] = useState("");

  const handleChange = (index, field, value) => {
    const newVillages = [...villages];
    newVillages[index][field] = value;
    setVillages(newVillages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = villages.map((v) => ({
      village: v.village,
      pH: parseFloat(v.pH) || 0,
      turbidity: parseFloat(v.turbidity) || 0,
      lead: parseFloat(v.lead) || 0,
      arsenic: parseFloat(v.arsenic) || 0,
      fluoride: parseFloat(v.fluoride) || 0,
      bod: parseFloat(v.bod) || 0,
    }));
    try {
      const res = await analyzeWater(payload);
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleSheet = async () => {
    try {
      const res = await fetchFromSheet(sheetId);
      setVillages(res.data.villages);
    } catch (err) {
      console.error(err);
      alert("Invalid Sheet ID or connection error");
    }
  };

  const getRiskColor = (risk) => {
    if (risk === "safe") return "bg-green-100 text-green-800";
    if (risk === "warning") return "bg-yellow-100 text-yellow-800";
    if (risk === "poor" || risk === "very_poor") return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">AquaWatch</h1>

      <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 mb-8">
        <h2 className="text-xl font-bold mb-4 text-purple-800">Import from Google Sheets</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Paste your Google Sheet ID here (from URL)"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            className="flex-1 p-3 border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
          />
          <button
            onClick={handleGoogleSheet}
            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg"
          >
            Import Data
          </button>
        </div>
        <p className="text-sm text-purple-700 mt-2">
          Example: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
        </p>
      </div>

      {/* Rest of your form stays the same */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">Enter data for 5 villages</h2>
        {villages.map((v, i) => (
          <div key={i} className="grid grid-cols-8 gap-2 items-center bg-white p-4 rounded-lg shadow-sm">
            <input type="text" placeholder={`Village ${i+1}`} value={v.village} onChange={(e) => handleChange(i, "village", e.target.value)} className="col-span-1 p-2 border rounded" />
            <input type="number" step="any" placeholder="pH" value={v.pH} onChange={(e) => handleChange(i, "pH", e.target.value)} className="col-span-1 p-2 border rounded" />
            <input type="number" step="any" placeholder="Turbidity" value={v.turbidity} onChange={(e) => handleChange(i, "turbidity", e.target.value)} className="col-span-1 p-2 border rounded" />
            <input type="number" step="any" placeholder="Lead" value={v.lead} onChange={(e) => handleChange(i, "lead", e.target.value)} className="col-span-1 p-2 border rounded" />
            <input type="number" step="any" placeholder="Arsenic" value={v.arsenic} onChange={(e) => handleChange(i, "arsenic", e.target.value)} className="col-span-1 p-2 border rounded" />
            <input type="number" step="any" placeholder="Fluoride" value={v.fluoride} onChange={(e) => handleChange(i, "fluoride", e.target.value)} className="col-span-1 p-2 border rounded" />
            <input type="number" step="any" placeholder="BOD" value={v.bod} onChange={(e) => handleChange(i, "bod", e.target.value)} className="col-span-1 p-2 border rounded" />
          </div>
        ))}
        <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
          Analyze Water Quality
        </button>
      </form>

      {results && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Risk Assessment Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r, i) => (
              <div key={i} className="border rounded-lg p-6 shadow-lg bg-white">
                <h3 className="font-bold text-xl mb-3">{r.village}</h3>
                <p className="text-lg"><strong>WQI:</strong> {r.wqi}</p>
                <p className="text-lg"><strong>HPI:</strong> {r.hpi}</p>
                <span className={`px-4 py-2 rounded-full text-sm font-bold mt-3 inline-block ${getRiskColor(r.risk_level)}`}>
                  {r.risk_level.replace("_", " ").toUpperCase()}
                </span>
                {r.alerts.map((alert, j) => (
                  <p key={j} className="text-red-600 mt-2 text-sm">{alert}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}