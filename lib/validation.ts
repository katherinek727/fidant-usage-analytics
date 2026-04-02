import { DEFAULT_DAYS, MAX_DAYS, MIN_DAYS } from "@/lib/constants";

export interface ParsedStatsParams {
  days: number;
}

export interface ValidationError {
  message: string;
  code: string;
}

export function parseStatsParams(
  searchParams: URLSearchParams
): { data: ParsedStatsParams } | { error: ValidationError } {
  const raw = searchParams.get("days");

  if (raw === null) {
    return { data: { days: DEFAULT_DAYS } };
  }

  const days = Number(raw);

  if (!Number.isInteger(days) || isNaN(days)) {
    return {
      error: { message: "`days` must be an integer.", code: "INVALID_DAYS" },
    };
  }

  if (days < MIN_DAYS || days > MAX_DAYS) {
    return {
      error: {
        message: `\`days\` must be between ${MIN_DAYS} and ${MAX_DAYS}.`,
        code: "DAYS_OUT_OF_RANGE",
      },
    };
  }

  return { data: { days } };
}
