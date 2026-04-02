import { prisma } from "@/lib/prisma";
import { minutesAgo } from "@/lib/dateUtils";
import { STALE_RESERVATION_MINUTES } from "@/lib/constants";

interface DayAggregate {
  date_key: string;
  committed: number;
  reserved: number;
}

/**
 * Queries raw daily_usage_events and returns per-day aggregates
 * for the given user and date range.
 *
 * - committed: events with status = "committed"
 * - reserved:  events with status = "reserved" and reserved_at within the
 *              stale threshold (i.e. not yet expired)
 */
export async function fetchRawAggregates(
  userId: number,
  fromKey: string,
  toKey: string
): Promise<DayAggregate[]> {
  const staleThreshold = minutesAgo(STALE_RESERVATION_MINUTES);

  // Two separate counts per day, unioned and grouped in application layer
  const [committed, reserved] = await Promise.all([
    prisma.daily_usage_events.groupBy({
      by: ["date_key"],
      where: {
        user_id: userId,
        date_key: { gte: fromKey, lte: toKey },
        status: "committed",
      },
      _count: { id: true },
    }),
    prisma.daily_usage_events.groupBy({
      by: ["date_key"],
      where: {
        user_id: userId,
        date_key: { gte: fromKey, lte: toKey },
        status: "reserved",
        reserved_at: { gte: staleThreshold },
      },
      _count: { id: true },
    }),
  ]);

  const map = new Map<string, DayAggregate>();

  for (const row of committed) {
    map.set(row.date_key, {
      date_key: row.date_key,
      committed: row._count.id,
      reserved: 0,
    });
  }

  for (const row of reserved) {
    const existing = map.get(row.date_key);
    if (existing) {
      existing.reserved = row._count.id;
    } else {
      map.set(row.date_key, {
        date_key: row.date_key,
        committed: 0,
        reserved: row._count.id,
      });
    }
  }

  return Array.from(map.values());
}
