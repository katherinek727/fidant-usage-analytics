"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DayStats } from "@/lib/types";
import styles from "./UsageStats.module.css";

interface Props {
  days: DayStats[];
  dailyLimit: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const committed = payload.find((p: any) => p.dataKey === "committed")?.value ?? 0;
  const reserved  = payload.find((p: any) => p.dataKey === "reserved")?.value  ?? 0;
  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(232,116,138,0.18)",
      borderRadius: 14,
      padding: "13px 16px",
      boxShadow: "0 8px 32px rgba(180,80,100,0.13)",
      minWidth: 130,
    }}>
      <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b89aa0", marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <Row color="#e8748a" label="Committed" value={committed} />
        {reserved > 0 && <Row color="#c084a0" label="Pending" value={reserved} />}
        <div style={{ borderTop: "1px solid rgba(180,100,100,0.1)", marginTop: 4, paddingTop: 6 }}>
          <Row color="#2a1a1f" label="Total" value={committed + reserved} bold />
        </div>
      </div>
    </div>
  );
};

function Row({ color, label, value, bold }: { color: string; label: string; value: number; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontSize: "0.72rem", color: "#7a5560", fontWeight: bold ? 600 : 400 }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.78rem", fontWeight: bold ? 700 : 600, color: bold ? "#2a1a1f" : "#4a2a35" }}>{value}</span>
    </div>
  );
}

export function UsageChart({ days, dailyLimit }: Props) {
  const data = days.map((d) => ({
    date: d.date.slice(5),
    committed: d.committed,
    reserved: d.reserved,
    total: d.committed + d.reserved,
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
            <span className={styles.legendDot} style={{ background: "#c084a0" }} />
            pending
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barCategoryGap="30%">
          <defs>
            <linearGradient id="gradCommitted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#e8748a" stopOpacity={1} />
              <stop offset="100%" stopColor="#f2a7b3" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="gradReserved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#c084a0" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#d4b8e0" stopOpacity={0.7} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="0"
            vertical={false}
            stroke="rgba(180,100,100,0.07)"
            strokeWidth={1}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10.5, fill: "#b89aa0", fontWeight: 400 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: "#b89aa0", fontWeight: 400 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232,116,138,0.05)", radius: 6 } as any} />
          <ReferenceLine
            y={dailyLimit}
            stroke="#c9975a"
            strokeDasharray="5 4"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            label={{ value: `limit ${dailyLimit}`, position: "insideTopRight", fontSize: 9.5, fill: "#c9975a", fontWeight: 500, dy: -4 }}
          />

          <Bar dataKey="committed" stackId="s" fill="url(#gradCommitted)" radius={[0, 0, 0, 0]} maxBarSize={32} />
          <Bar dataKey="reserved"  stackId="s" fill="url(#gradReserved)"  radius={[6, 6, 0, 0]} maxBarSize={32} />

          <Line
            type="monotone"
            dataKey="total"
            stroke="rgba(192,132,160,0.45)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "#c084a0", stroke: "#fff", strokeWidth: 2 }}
            strokeDasharray="4 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
