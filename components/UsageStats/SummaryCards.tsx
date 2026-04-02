import { UsageSummary } from "@/lib/types";
import styles from "./UsageStats.module.css";

interface Props {
  summary: UsageSummary;
}

export function SummaryCards({ summary }: Props) {
  return (
    <div className={styles.cards}>
      <Card icon="◆" label="Total committed" value={summary.total_committed} />
      <Card icon="∿" label="Daily average" value={summary.avg_daily} />
      <Card icon="▲" label="Peak day" value={summary.peak_day.count} sub={summary.peak_day.date} />
      <Card icon="⬡" label="Streak" value={summary.current_streak} sub="days" />
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className={styles.card}>
      <span className={styles.cardIcon}>{icon}</span>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue}>{value}</span>
      {sub && <span className={styles.cardSub}>{sub}</span>}
    </div>
  );
}
