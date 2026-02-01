import React, { useState } from "react";
import { analyzeWater } from "./api";

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

  const getRiskColor = (risk) => {
    if (risk === "safe") return "bg-green-100 text-green-800";
    if (risk === "warning") return "bg-yellow-100 text-yellow-800";
    if (risk === "poor" || risk === "very_poor") return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">AquaWatch – Water Quality Risk Assessment</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Enter data for 5 villages</h2>
        {villages.map((v, i) => (
          <div key={i} className="grid grid-cols-8 gap-2 items-center">
            <input
              type="text"
              placeholder="Village"
              value={v.village}
              onChange={(e) => handleChange(i, "village", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="pH"
              value={v.pH}
              onChange={(e) => handleChange(i, "pH", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Turbidity"
              value={v.turbidity}
              onChange={(e) => handleChange(i, "turbidity", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Lead"
              value={v.lead}
              onChange={(e) => handleChange(i, "lead", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Arsenic"
              value={v.arsenic}
              onChange={(e) => handleChange(i, "arsenic", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Fluoride"
              value={v.fluoride}
              onChange={(e) => handleChange(i, "fluoride", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="BOD"
              value={v.bod}
              onChange={(e) => handleChange(i, "bod", e.target.value)}
              className="col-span-1 p-2 border rounded"
            />
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Analyze Water Quality
        </button>
      </form>

      {results && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Risk Assessment Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r, i) => (
              <div key={i} className="border rounded p-4 shadow-sm">
                <h3 className="font-bold">{r.village}</h3>
                <p>WQI: {r.wqi}</p>
                <p>HPI: {r.hpi}</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRiskColor(r.risk_level)}`}
                >
                  {r.risk_level.replace("_", " ")}
                </span>
                <ul className="mt-2 text-sm">
                  {r.alerts.map((a, j) => (
                    <li key={j} className="text-red-600">{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}