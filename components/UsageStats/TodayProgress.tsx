import { DayStats } from "@/lib/types";
import styles from "./UsageStats.module.css";

interface Props {
  today: DayStats;
}

export function TodayProgress({ today }: Props) {
  const pct = Math.min(
    Math.round(((today.committed + today.reserved) / today.limit) * 100),
    100
  );

  return (
    <div className={styles.todaySection}>
      <div className={styles.todayHeader}>
        <span>Today</span>
        <span>
          {today.committed} committed
          {today.reserved > 0 && ` · ${today.reserved} pending`}
          {" / "}
          {today.limit} limit
        </span>
      </div>
      <div className={styles.progressTrack} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={styles.progressFill}
          style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? "#ef4444" : "#6366f1" }}
        />
      </div>
      <span className={styles.progressPct}>{pct}%</span>
    </div>
  );
}
