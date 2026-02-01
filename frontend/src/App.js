import React, { useState } from "react";
import { analyzeWater, fetchFromSheet } from "./api";
import ResultsDashboard from "./component/ResultsDashboard";

// Empty Village Template
const emptyVillage = {
  village: "",
  pH: "",
  turbidity: "",
  lead: "",
  arsenic: "",
  fluoride: "",
  bod: "",
};

export default function App() {
  // Start with 5 villages
  const [villages, setVillages] = useState(
    Array(5)
      .fill()
      .map(() => ({ ...emptyVillage }))
  );

  const [results, setResults] = useState(null);

  // ✅ Example Sheet ID already filled
  const [sheetId, setSheetId] = useState(
    "1svAmPbWX-XCZXN16nYsTlpug-MGZFj3-u6sskvzRWss"
  );

  // ✅ Handle Input Change
  const handleChange = (index, field, value) => {
    const updated = [...villages];
    updated[index][field] = value;
    setVillages(updated);
  };

  // ✅ Add Another Village Row
  const addVillage = () => {
    setVillages([...villages, { ...emptyVillage }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredVillages = villages.filter(
      (v) => v.village.trim() !== ""
    );

    if (filteredVillages.length === 0) {
      alert("Please enter at least 1 village name.");
      return;
    }
    const payload = filteredVillages.map((v) => ({
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
      alert("Error analyzing water quality.");
    }
  };

  // ✅ Import from Google Sheets
  const handleGoogleSheet = async () => {
    try {
      const res = await fetchFromSheet(sheetId);
      setVillages(res.data.villages);
      setResults(null);
    } catch (err) {
      console.error(err);
      alert("Invalid Sheet ID or connection error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">
            AquaWatch
          </h1>
          <p className="text-sm text-gray-500">
            Water Quality Risk Assessment System
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Intro */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-2">
            Automated Water Safety Analysis
          </h2>
          <p className="text-gray-600 text-sm">
            AquaWatch converts lab test values into instant contamination
            alerts and WHO-based risk classification for villages.
          </p>
        </section>

        {/* Google Sheets Import */}
        <section className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3">
            Import Data from Google Sheets
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <button
              onClick={handleGoogleSheet}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Import Example Data
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Example Sheet ID is pre-filled for demo.
          </p>
        </section>

        {/* Input Table */}
        <section className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4">
            Enter Water Sample Data ({villages.length} Villages)
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3">Village</th>
                    <th className="p-3">pH</th>
                    <th className="p-3">Turbidity</th>
                    <th className="p-3">Lead</th>
                    <th className="p-3">Arsenic</th>
                    <th className="p-3">Fluoride</th>
                    <th className="p-3">BOD</th>
                  </tr>
                </thead>

                <tbody>
                  {villages.map((v, i) => (
                    <tr key={i} className="border-t">
                      {Object.keys(v).map((field) => (
                        <td key={field} className="p-2">
                          <input
                            type={field === "village" ? "text" : "number"}
                            step="any"
                            value={v[field]}
                            onChange={(e) =>
                              handleChange(i, field, e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded-md"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Village */}
            <button
              type="button"
              onClick={addVillage}
              className="px-5 py-2 border border-blue-600 text-blue-700 rounded-md hover:bg-blue-50"
            >
              + Add Another Village
            </button>

            {/* Analyze */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800"
            >
              Analyze Water Quality
            </button>
          </form>
        </section>

        {/* Results Dashboard */}
        {results && <ResultsDashboard results={results} />}
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-xs py-6 border-t bg-white">
        AquaWatch © {new Date().getFullYear()} — Built for FORGE A5 Hackathon
      </footer>
    </div>
  );
}