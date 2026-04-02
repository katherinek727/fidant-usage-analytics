"use client";

import { useState } from "react";
import { useUsageStats } from "@/hooks/useUsageStats";
import { UsageChart } from "./UsageChart";
import { SummaryCards } from "./SummaryCards";
import { TodayProgress } from "./TodayProgress";
import styles from "./UsageStats.module.css";

const DAY_OPTIONS = [7, 14, 30] as const;
type DayOption = (typeof DAY_OPTIONS)[number];

export function UsageStats() {
  const [days, setDays] = useState<DayOption>(7);
  const { data, loading, error } = useUsageStats(days);

  const today = data?.days[data.days.length - 1];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Dashboard</span>
          <h1 className={styles.title}>Usage Analytics</h1>
          {data && (
            <span className={styles.planBadge}>
              {data.plan} · {data.daily_limit} turns / day
            </span>
          )}
        </div>
        <div className={styles.dayToggle}>
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              className={`${styles.toggleBtn} ${days === d ? styles.toggleBtnActive : ""}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className={styles.stateContainer}>
          <div className={styles.skeletonBlock} />
          <div className={styles.skeletonRow} style={{ width: "55%" }} />
          <div className={styles.skeletonRow} style={{ width: "75%" }} />
        </div>
      )}

      {error && !loading && (
        <div className={styles.error} role="alert">{error}</div>
      )}

      {data && !loading && (
        <>
          <SummaryCards summary={data.summary} />
          {today && <TodayProgress today={today} />}
          <UsageChart days={data.days} dailyLimit={data.daily_limit} />
        </>
      )}
    </section>
  );
}
