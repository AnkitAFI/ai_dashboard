// app/(dashboard)/explorer/price-tracker/_components/PctPriceHistoryChart.tsx
"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface HistoryPoint {
  date: string;
  price: number;
}

interface CompetitorHistory {
  asin: string;
  title: string;
  history: HistoryPoint[];
}

interface PctPriceHistoryChartProps {
  ourAsin: string;
  ourTitle: string;
  ourHistory: HistoryPoint[];
  competitors: CompetitorHistory[];
  currency?: string;
}

const LINE_COLORS = [
  "#2563eb", // Blue (Our ASIN)
  "#dc2626", // Red (Comp 1)
  "#ea580c", // Orange (Comp 2)
  "#16a34a", // Green (Comp 3)
  "#9333ea", // Purple (Comp 4)
  "#0891b2", // Cyan (Comp 5)
  "#ca8a04", // Yellow (Comp 6)
  "#db2777", // Pink (Comp 7)
];

export function PctPriceHistoryChart({
  ourAsin,
  ourTitle,
  ourHistory,
  competitors,
  currency = "INR",
}: PctPriceHistoryChartProps) {
  const currSym = "₹";

  // Build a unified date-keyed map for Recharts
  const dateMap: Record<string, any> = {};

  // Insert our history points
  ourHistory.forEach((pt) => {
    if (!dateMap[pt.date]) dateMap[pt.date] = { date: pt.date };
    dateMap[pt.date][`our_${ourAsin}`] = pt.price;
  });

  // Insert competitors history points
  competitors.forEach((c) => {
    c.history.forEach((pt) => {
      if (!dateMap[pt.date]) dateMap[pt.date] = { date: pt.date };
      dateMap[pt.date][`comp_${c.asin}`] = pt.price;
    });
  });

  const chartData = Object.values(dateMap).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
        <p>No price history recorded yet.</p>
        <p className="text-[11px] mt-1">Price points are appended daily on each price refresh.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            30-Day Price Trend
          </h3>
          <p className="text-xs text-slate-500">
            Comparing your product vs. competitors over time
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${currSym}${v.toLocaleString("en-IN")}`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${currSym}${Number(value).toLocaleString("en-IN")}`,
                name.startsWith("our_") ? "Your Product" : name.replace("comp_", "Competitor: "),
              ]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

            {/* Our Product Line (Bold, Primary) */}
            <Line
              type="monotone"
              dataKey={`our_${ourAsin}`}
              name={`Your Product (${ourAsin})`}
              stroke={LINE_COLORS[0]}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />

            {/* Competitors Lines */}
            {competitors.slice(0, 7).map((c, idx) => (
              <Line
                key={c.asin}
                type="monotone"
                dataKey={`comp_${c.asin}`}
                name={`Competitor (${c.asin})`}
                stroke={LINE_COLORS[(idx + 1) % LINE_COLORS.length]}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
