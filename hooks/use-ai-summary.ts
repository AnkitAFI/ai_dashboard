"use client";

import { useEffect, useState } from "react";

interface Filters {
  table?: string;
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  dateRange?: string;
  showTrendingOnly?: boolean;
  sortBy?: string;
  topN?: number;
}

export function useAISummary(
  question: string,
  source: string,
  data: any[],
  triggerKey: number,
  filters?: Filters
) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!question || !data || data.length === 0) {
      setSummary("");
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const payload = {
          question: question,
          source: source,
          chartData: data,
          filters: filters || {}
        };

        const res = await fetch(`${BASE_URL}/ai/analyze-chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        setSummary(json.answer || "No insights available.");
      } catch (err: any) {
        console.error("❌ AI summary error:", err);
        setSummary("Unable to generate summary.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSummary, 100);
    return () => clearTimeout(timer);
  }, [question, source, JSON.stringify(data), triggerKey, BASE_URL]);

  return { summary, loading };
}
