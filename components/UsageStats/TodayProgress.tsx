import { DayStats } from "@/lib/types";
import styles from "./UsageStats.module.css";

interface Props {
  today: DayStats;
}

const R = 30;
const CIRC = 2 * Math.PI * R;

export function TodayProgress({ today }: Props) {
  const used = today.committed + today.reserved;
  const pct = Math.min(Math.round((used / today.limit) * 100), 100);
  const remaining = Math.max(today.limit - used, 0);

  const isDanger = pct >= 85;
  const isWarning = pct >= 65 && pct < 85;

  const barClass = isDanger
    ? styles.progressDanger
    : isWarning
    ? styles.progressWarning
    : styles.progressNormal;

  const gaugeColor = isDanger ? "#c0392b" : isWarning ? "#c9975a" : "#e8748a";
  const offset = CIRC - (pct / 100) * CIRC;

  return (
    <div className={styles.todaySection}>
      <div className={styles.todayLeft}>
        <div className={styles.todayMeta}>
          <span className={styles.todayLabel}>Today</span>
          <span className={styles.todayNumbers}>
            <strong>{today.committed}</strong> committed
            {today.reserved > 0 && <> · <strong>{today.reserved}</strong> pending</>}
            {" / "}
            <strong>{today.limit}</strong>
          </span>
        </div>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={`${styles.progressFill} ${barClass}`} style={{ width: `${pct}%` }} />
        </div>

        <div className={styles.progressFooter}>
          <span className={styles.progressPct}>{pct}% used</span>
          <span className={styles.progressRemaining}>{remaining} remaining</span>
        </div>
      </div>

      {/* Radial gauge */}
      <div className={styles.gauge}>
        <svg viewBox="0 0 80 80" width="80" height="80" className={styles.gaugeCircle}>
          <circle className={styles.gaugeTrack} cx="40" cy="40" r={R} />
          <circle
            className={styles.gaugeFill}
            cx="40"
            cy="40"
            r={R}
            stroke={gaugeColor}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.gaugeText}>
          <span className={styles.gaugePct}>{pct}%</span>
          <span className={styles.gaugeSubLabel}>used</span>
        </div>
      </div>
    </div>
  );
}
