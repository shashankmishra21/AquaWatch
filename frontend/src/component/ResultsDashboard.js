import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getRiskBadge(risk) {
  if (risk === "safe") return "bg-green-100 text-green-800";
  if (risk === "warning") return "bg-yellow-100 text-yellow-800";
  if (risk === "poor" || risk === "very_poor")
    return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export default function ResultsDashboard(props) {
  const results = props.results;

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-semibold">
        Risk Assessment Dashboard
      </h2>

      {/*Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center shadow-sm">
          <p className="text-sm text-gray-500">Total Villages</p>
          <h3 className="text-2xl font-bold">{results.length}</h3>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700">Safe</p>
          <h3 className="text-2xl font-bold text-green-800">
            {results.filter((r) => r.risk_level === "safe").length}
          </h3>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-700">Warning</p>
          <h3 className="text-2xl font-bold text-yellow-800">
            {results.filter((r) => r.risk_level === "warning").length}
          </h3>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-red-700">Unsafe</p>
          <h3 className="text-2xl font-bold text-red-800">
            {
              results.filter(
                (r) =>
                  r.risk_level !== "safe" &&
                  r.risk_level !== "warning"
              ).length
            }
          </h3>
        </div>
      </div>

      {/*WQI Comparison Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold mb-4">
          Water Quality Index (WQI) Comparison
        </h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={results}>
              <XAxis dataKey="village" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wqi" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Higher WQI indicates poorer water quality.
        </p>
      </div>

      {/*Village Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r, i) => (
          <div
            key={i}
            className="bg-white border rounded-lg p-5 shadow-sm"
          >
            <h3 className="font-semibold text-lg mb-2">
              {r.village}
            </h3>

            <p className="text-sm">
              <strong>WQI:</strong> {r.wqi}
            </p>

            <p className="text-sm">
              <strong>HPI:</strong> {r.hpi}
            </p>

            <span
              className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${getRiskBadge(
                r.risk_level
              )}`}
            >
              {r.risk_level.replace("_", " ").toUpperCase()}
            </span>

            {r.alerts.length > 0 && (
              <div className="mt-3 text-sm text-red-600">
                {r.alerts.map((a, j) => (
                  <p key={j}>• {a}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}