"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SecurityMetricsChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
}

export function SecurityMetricsChart({ data }: SecurityMetricsChartProps) {
  return (
    <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" allowDecimals={false} fontSize={12} />
          <Tooltip
            cursor={{ fill: "rgba(15, 23, 42, 0.6)" }}
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "0.5rem"
            }}
          />
          <Bar dataKey="value" fill="#22d3ee" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
