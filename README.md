# Fidant.AI — Usage Analytics

Usage statistics API and dashboard for Fidant.AI's turn-based plan system.

---

## Stack

- **Next.js 14** (App Router)
- **Prisma** + PostgreSQL
- **Recharts** for visualisation
- **TypeScript** strict mode throughout

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd fidant-usage-analytics
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`.

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## API

### `GET /api/usage/stats`

Returns usage statistics for the authenticated user.

**Query parameters**

| Param | Type    | Default | Constraints |
|-------|---------|---------|-------------|
| days  | integer | 7       | 1 – 90      |

**Authentication**

Pass the user ID via the `x-user-id` header (development stub — see Assumptions below).

```bash
curl http://localhost:3000/api/usage/stats?days=7 \
  -H "x-user-id: 1"
```

**Response shape**

```json
{
  "plan": "starter",
  "daily_limit": 30,
  "period": { "from": "2026-03-27", "to": "2026-04-02" },
  "days": [
    {
      "date": "2026-04-02",
      "committed": 12,
      "reserved": 2,
      "limit": 30,
      "utilization": 0.4667
    }
  ],
  "summary": {
    "total_committed": 87,
    "avg_daily": 12.4,
    "peak_day": { "date": "2026-03-30", "count": 28 },
    "current_streak": 5
  }
}
```

**Error shape**

```json
{ "error": "Human-readable message.", "code": "MACHINE_READABLE_CODE" }
```

| Status | Code              | Reason                        |
|--------|-------------------|-------------------------------|
| 401    | UNAUTHORIZED      | Missing or invalid x-user-id |
| 400    | INVALID_DAYS      | days is not an integer        |
| 400    | DAYS_OUT_OF_RANGE | days outside 1–90             |

---

## UI Component

`UsageStats` is a self-contained client component. Drop it anywhere in your app:

```tsx
import { UsageStats } from "@/components/UsageStats";

export default function DashboardPage() {
  return <UsageStats />;
}
```

---

## Caching Strategy

The `daily_usage_cache` table stores pre-computed daily aggregates per user.

- **Past days** are immutable once committed — cached permanently.
- **Today's entry** has a 5-minute TTL and is recomputed on expiry.
- On a cache miss or stale entry, the API falls back to raw `daily_usage_events` queries and writes the result back to the cache (cache-aside pattern).

---

## Assumptions

1. **Authentication stub** — The `x-user-id` header is used in place of real auth to keep the implementation focused on the analytics feature. In production this should be replaced with JWT validation or a session library (NextAuth, Clerk, etc.).

2. **UTC dates** — All `date_key` values and date arithmetic use UTC. If per-timezone bucketing is needed, a `timezone` column would need to be added to `users` and applied during aggregation.

3. **Stale reservations** — Reserved events older than 15 minutes are excluded from the `reserved` counter. This threshold is configurable via `STALE_RESERVATION_MINUTES` in `lib/constants.ts`.

4. **Utilization formula** — `(committed + reserved) / limit`, capped at 1.0. This gives a real-time view of how close the user is to their limit including in-flight requests.

5. **Streak definition** — Consecutive days going backwards from today with at least one committed event. A day with zero committed events breaks the streak.

---

## What I Would Do Differently With More Time

- **Real authentication** — Integrate NextAuth or a JWT middleware instead of the header stub.
- **Unit tests** — The pure functions in `statsComputer.ts` and `validation.ts` are designed to be easily testable with Vitest. I would add a full test suite covering edge cases (zero days, all-zero data, streak boundaries).
- **Cache invalidation on commit** — Add a webhook or DB trigger to invalidate today's cache entry immediately when a new `committed` event is inserted, rather than waiting for TTL expiry.
- **Rate limiting** — Add per-user rate limiting on the stats endpoint to prevent abuse.
- **Pagination / cursor** — For very large `days` values (up to 90), consider cursor-based pagination or streaming the response.
- **Timezone support** — Allow users to specify their timezone so daily buckets align with their local midnight rather than UTC.
- **Error monitoring** — Integrate Sentry or similar for production error tracking on the API route.
