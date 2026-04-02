/**
 * Returns today's date key in "YYYY-MM-DD" format (UTC).
 */
export function todayKey(): string {
  return toDateKey(new Date());
}

/**
 * Formats a Date to "YYYY-MM-DD" (UTC).
 */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Generates an ordered array of date keys for the given range.
 * @param from  inclusive start date key "YYYY-MM-DD"
 * @param to    inclusive end date key "YYYY-MM-DD"
 */
export function buildDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);

  while (cursor <= end) {
    dates.push(toDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Returns the "from" date key given a number of days back from today.
 * e.g. days=7 → 6 days before today (7-day window inclusive of today)
 */
export function fromDateKey(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return toDateKey(d);
}

/**
 * Returns a Date that is `minutes` ago from now.
 */
export function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}
