import { prisma } from "@/lib/prisma";
import { todayKey, minutesAgo } from "@/lib/dateUtils";
import { CACHE_TTL_MINUTES } from "@/lib/constants";
import { fetchRawAggregates } from "@/lib/usageQueries";

interface DayAggregate {
  date_key: string;
  committed: number;
  reserved: number;
}

/**
 * Returns true if a cache entry is still considered fresh.
 *
 * Past days are immutable — always fresh once computed.
 * Today's entry expires after CACHE_TTL_MINUTES.
 */
function isFresh(dateKey: string, computedAt: Date): boolean {
  if (dateKey < todayKey()) return true; // past day — immutable
  return computedAt >= minutesAgo(CACHE_TTL_MINUTES);
}

/**
 * Fetches aggregates for the given date range, using the cache where possible
 * and falling back to raw DB queries for stale or missing entries.
 *
 * Cache-aside pattern:
 *   1. Load all cache entries for the range.
 *   2. Identify missing or stale date keys.
 *   3. Fetch raw aggregates only for those keys.
 *   4. Upsert fresh values back into the cache.
 *   5. Return the merged result.
 */
export async function getAggregatesWithCache(
  userId: number,
  dateRange: string[]
): Promise<DayAggregate[]> {
  const fromKey = dateRange[0];
  const toKey = dateRange[dateRange.length - 1];

  const cached = await prisma.daily_usage_cache.findMany({
    where: { user_id: userId, date_key: { gte: fromKey, lte: toKey } },
  });

  const freshMap = new Map<string, DayAggregate>();
  for (const entry of cached) {
    if (isFresh(entry.date_key, entry.computed_at)) {
      freshMap.set(entry.date_key, {
        date_key: entry.date_key,
        committed: entry.committed,
        reserved: entry.reserved,
      });
    }
  }

  const staleDateKeys = dateRange.filter((d) => !freshMap.has(d));

  if (staleDateKeys.length > 0) {
    const staleFrom = staleDateKeys[0];
    const staleTo = staleDateKeys[staleDateKeys.length - 1];

    const rawAggregates = await fetchRawAggregates(userId, staleFrom, staleTo);

    // Build a lookup so we can upsert zeros for days with no events too
    const rawMap = new Map(rawAggregates.map((a) => [a.date_key, a]));

    const upserts = staleDateKeys.map((dateKey) => {
      const agg = rawMap.get(dateKey) ?? {
        date_key: dateKey,
        committed: 0,
        reserved: 0,
      };

      freshMap.set(dateKey, agg);

      return prisma.daily_usage_cache.upsert({
        where: { user_id_date_key: { user_id: userId, date_key: dateKey } },
        create: {
          user_id: userId,
          date_key: dateKey,
          committed: agg.committed,
          reserved: agg.reserved,
        },
        update: {
          committed: agg.committed,
          reserved: agg.reserved,
          computed_at: new Date(),
        },
      });
    });

    // Fire upserts in parallel — non-blocking for the response
    await Promise.all(upserts);
  }

  return Array.from(freshMap.values());
}
