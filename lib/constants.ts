export const PLAN_LIMITS: Record<string, number> = {
  starter: 30,
  pro: 100,
  executive: 500,
} as const;

export const DEFAULT_DAYS = 7;
export const MIN_DAYS = 1;
export const MAX_DAYS = 90;

// Reserved events older than this are considered stale and excluded
export const STALE_RESERVATION_MINUTES = 15;

// Cache TTL for today's aggregates (past days are immutable)
export const CACHE_TTL_MINUTES = 5;
