export interface DayStats {
  date: string; // "YYYY-MM-DD"
  committed: number;
  reserved: number;
  limit: number;
  utilization: number;
}

export interface PeakDay {
  date: string;
  count: number;
}

export interface UsageSummary {
  total_committed: number;
  avg_daily: number;
  peak_day: PeakDay;
  current_streak: number;
}

export interface UsageStatsResponse {
  plan: string;
  daily_limit: number;
  period: {
    from: string;
    to: string;
  };
  days: DayStats[];
  summary: UsageSummary;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
}
