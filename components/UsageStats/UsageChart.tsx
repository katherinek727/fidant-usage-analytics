"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DayStats } from "@/lib/types";

interface Props {
  days: DayStats[];
  dailyLimit: number;
}

export function UsageChart({ days, dailyLimit }: Props) {
  const data = days.map((d) => ({
    date: d.date.slice(5), // "MM-DD" for readability
    committed: d.committed,
    reserved: d.reserved,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={dailyLimit} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "limit", fontSize: 11 }} />
        <Bar dataKey="committed" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
        <Bar dataKey="reserved" stackId="a" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
