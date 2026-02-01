import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";

function getRiskBadge(risk) {
  if (risk === "safe") return "bg-green-100 text-green-800";
  if (risk === "warning") return "bg-yellow-100 text-yellow-800";
  if (risk === "poor" || risk === "very_poor")
    return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

const riskPriority = {
  danger: 4,
  very_poor: 3,
  poor: 2,
  warning: 1,
  safe: 0,
};

function generateAdvisory(risk, alerts) {
  if (risk === "safe") {
    return "Water quality is within safe WHO limits. Continue routine monitoring.";
  }

  if (risk === "warning") {
    return "Minor contamination detected. Recommend basic filtration and re-testing within 7 days.";
  }

  if (risk === "poor" || risk === "very_poor") {
    return "Unsafe for direct consumption. Use RO/activated carbon filtration and identify contamination source immediately.";
  }

  if (risk === "danger") {
    return "CRITICAL: Water is highly unsafe. Immediate intervention required. Provide alternate drinking source and alert local authorities.";
  }

  // fallback
  return "Further laboratory investigation recommended.";
}

export default function ResultsDashboard(props) {
  const results = props.results;

  const sortedResults = [...results].sort(
    (a, b) =>
      (riskPriority[b.risk_level] || 0) -
      (riskPriority[a.risk_level] || 0)
  );

  // Critical Villages Only
  const criticalVillages = sortedResults.filter(
    (r) => r.risk_level !== "safe" && r.risk_level !== "warning"
  );

     // Export PDF Report
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AquaWatch Water Quality Report", 20, 20);

    doc.setFontSize(12);
    doc.text(
      "WHO-based contamination risk assessment + AI advisory recommendations",
      20,
      30
    );

    let y = 45;

    sortedResults.forEach((village, index) => {
      const advisory = generateAdvisory(
        village.risk_level,
        village.alerts
      );

      doc.setFontSize(13);
      doc.text(
        `${index + 1}. ${village.village} (${village.risk_level.toUpperCase()})`,
        20,
        y
      );

      y += 7;
      doc.setFontSize(11);
      doc.text(`WQI: ${village.wqi}`, 25, y);
      y += 6;
      doc.text(`HPI: ${village.hpi}`, 25, y);
      y += 6;

      doc.text(`Advisory: ${advisory}`, 25, y);
      y += 10;

      if (village.alerts.length > 0) {
        doc.text(`Alerts: ${village.alerts.join(", ")}`, 25, y);
        y += 10;
      }

      y += 4;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("AquaWatch_Report.pdf");
  };

  return (
    <section className="space-y-10">
      {/* Title + Export */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Risk Assessment Dashboard
        </h2>

        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition text-sm"
        >
          Export PDF Report
        </button>
      </div>

      {/*Critical Priority List */}
      {criticalVillages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <h3 className="font-semibold text-red-700 mb-2">
            🚨 Critical Priority Villages (Immediate Action Needed)
          </h3>

          <ul className="list-disc pl-5 text-sm text-red-800 space-y-1">
            {criticalVillages.map((v, i) => (
              <li key={i}>
                <strong>{v.village}</strong> —{" "}
                {v.risk_level.replace("_", " ").toUpperCase()}
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {/*WQI Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold mb-4">
          Water Quality Index (WQI) Comparison
        </h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={sortedResults}>
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

      {/*Village Cards + AI Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((r, i) => {
          const advisory = generateAdvisory(r.risk_level, r.alerts);

          return (
            <div
              key={i}
              className="bg-white border rounded-lg p-5 shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-2">{r.village}</h3>

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

              {/*AI Advisory */}
              <p className="mt-3 text-sm text-gray-600 italic">
                💡 Advisory: {advisory}
              </p>

              {/* Alerts */}
              {r.alerts.length > 0 && (
                <div className="mt-3 text-sm text-red-600">
                  {r.alerts.map((a, j) => (
                    <p key={j}>• {a}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}