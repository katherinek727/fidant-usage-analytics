import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseStatsParams } from "@/lib/validation";
import { fromDateKey, todayKey, buildDateRange } from "@/lib/dateUtils";
import { getAggregatesWithCache } from "@/lib/usageCache";
import { buildStatsResponse } from "@/lib/statsComputer";
import { ApiErrorResponse } from "@/lib/types";

function errorResponse(
  message: string,
  code: string,
  status: number
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message, code }, { status });
}

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return errorResponse("Authentication required.", "UNAUTHORIZED", 401);
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const parsed = parseStatsParams(req.nextUrl.searchParams);
  if ("error" in parsed) {
    return errorResponse(parsed.error.message, parsed.error.code, 400);
  }

  const { days } = parsed.data;

  // ── Date range ──────────────────────────────────────────────────────────────
  const toKey = todayKey();
  const fromKey = fromDateKey(days);
  const dateRange = buildDateRange(fromKey, toKey);

  // ── Data ────────────────────────────────────────────────────────────────────
  const aggregates = await getAggregatesWithCache(user.id, dateRange);

  // ── Response ────────────────────────────────────────────────────────────────
  const body = buildStatsResponse(user.plan_tier, dateRange, aggregates);

  return NextResponse.json(body, { status: 200 });
}
