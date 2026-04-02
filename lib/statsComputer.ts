import { PLAN_LIMITS } from "@/lib/constants";
import { DayStats, UsageSummary, UsageStatsResponse } from "@/lib/types";

interface RawDayAggregate {
  date_key: string;
  committed: number;
  reserved: number;
}

/**
 * Merges raw DB aggregates with the full date range (filling zeros for
 * missing days) and computes per-day utilization.
 */
export function buildDayStats(
  dateRange: string[],
  aggregates: RawDayAggregate[],
  dailyLimit: number
): DayStats[] {
  const byDate = new Map<string, RawDayAggregate>(
    aggregates.map((a) => [a.date_key, a])
  );

  return dateRange.map((date) => {
    const agg = byDate.get(date);
    const committed = agg?.committed ?? 0;
    const reserved = agg?.reserved ?? 0;
    const utilization =
      dailyLimit > 0
        ? Math.min(parseFloat(((committed + reserved) / dailyLimit).toFixed(4)), 1)
        : 0;

    return { date, committed, reserved, limit: dailyLimit, utilization };
  });
}

/**
 * Computes the summary block from the resolved day stats.
 */
export function computeSummary(days: DayStats[]): UsageSummary {
  const total_committed = days.reduce((sum, d) => sum + d.committed, 0);
  const avg_daily = days.length
    ? parseFloat((total_committed / days.length).toFixed(1))
    : 0;

  const peak = days.reduce(
    (best, d) => (d.committed > best.committed ? d : best),
    days[0] ?? { date: "", committed: 0 }
  );

  const current_streak = computeStreak(days);

  return {
    total_committed,
    avg_daily,
    peak_day: { date: peak.date, count: peak.committed },
    current_streak,
  };
}

/**
 * Counts consecutive days (going backwards from the last day in the range)
 * that have at least one committed event.
 */
function computeStreak(days: DayStats[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].committed > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Assembles the full API response shape.
 */
export function buildStatsResponse(
  plan: string,
  dateRange: string[],
  aggregates: RawDayAggregate[]
): UsageStatsResponse {
  const dailyLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS["starter"];
  const dayStats = buildDayStats(dateRange, aggregates, dailyLimit);
  const summary = computeSummary(dayStats);

  return {
    plan,
    daily_limit: dailyLimit,
    period: {
      from: dateRange[0],
      to: dateRange[dateRange.length - 1],
    },
    days: dayStats,
    summary,
  };
}
