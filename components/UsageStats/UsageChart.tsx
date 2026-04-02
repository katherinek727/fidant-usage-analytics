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
} from "recharts";
import { DayStats } from "@/lib/types";
import styles from "./UsageStats.module.css";

interface Props {
  days: DayStats[];
  dailyLimit: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid rgba(180,100,100,0.15)",
      borderRadius: 14,
      padding: "12px 16px",
      fontSize: "0.78rem",
      color: "#2a1a1f",
      boxShadow: "0 8px 28px rgba(180,100,100,0.12)",
    }}>
      <div style={{ marginBottom: 9, color: "#b89aa0", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 22, marginBottom: 3 }}>
          <span style={{ color: "#7a5560", textTransform: "capitalize" }}>{p.dataKey}</span>
          <span style={{ fontWeight: 600, color: "#2a1a1f" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function UsageChart({ days, dailyLimit }: Props) {
  const data = days.map((d) => ({
    date: d.date.slice(5),
    committed: d.committed,
    reserved: d.reserved,
  }));

  return (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <span className={styles.chartLabel}>Daily breakdown</span>
        <div className={styles.chartLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#e8748a" }} />
            committed
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#f5c2cb" }} />
            pending
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="rgba(180,100,100,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10.5, fill: "#b89aa0", fontWeight: 400 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: "#b89aa0", fontWeight: 400 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232,116,138,0.05)" }} />
          <ReferenceLine
            y={dailyLimit}
            stroke="#c9975a"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
          <Bar dataKey="committed" stackId="a" fill="#e8748a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="reserved"  stackId="a" fill="#f5c2cb" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
