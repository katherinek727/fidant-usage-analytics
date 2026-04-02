import { UsageSummary } from "@/lib/types";
import styles from "./UsageStats.module.css";

interface Props {
  summary: UsageSummary;
}

export function SummaryCards({ summary }: Props) {
  return (
    <div className={styles.cards}>
      <Card label="Total committed" value={summary.total_committed} />
      <Card label="Daily average" value={summary.avg_daily} />
      <Card
        label="Peak day"
        value={summary.peak_day.count}
        sub={summary.peak_day.date}
      />
      <Card label="Current streak" value={`${summary.current_streak}d`} />
    </div>
  );
}

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue}>{value}</span>
      {sub && <span className={styles.cardSub}>{sub}</span>}
    </div>
  );
}
