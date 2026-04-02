import { useState, useEffect } from "react";
import { UsageStatsResponse, ApiErrorResponse } from "@/lib/types";

interface UseUsageStatsResult {
  data: UsageStatsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useUsageStats(days: number = 7): UseUsageStatsResult {
  const [data, setData] = useState<UsageStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch_() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/usage/stats?days=${days}`);
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          const err = json as ApiErrorResponse;
          setError(err.error ?? "Unexpected error.");
        } else {
          setData(json as UsageStatsResponse);
        }
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch_();
    return () => { cancelled = true; };
  }, [days]);

  return { data, loading, error };
}
