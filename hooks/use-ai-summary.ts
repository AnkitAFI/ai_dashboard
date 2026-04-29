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
  data: any[],  // ✅ The ACTUAL chart data
  triggerKey: number,
  filters?: Filters
) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("🔍 useAISummary called:", {
      question,
      source,
      actualDataCount: data?.length,
      filters
    });

    if (!data || data.length === 0) {
      setSummary("");
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);

      try {
        // ✅ CRITICAL: Send the ACTUAL chart data
        const payload = {
          question: question,
          source: source,
          chartData: data,  // ✅ Send exact data from charts
          filters: filters || {}
        };

        console.log("📤 Sending chart data to AI:", {
          dataCount: data.length,
          sampleItem: data[0]
        });

        const res = await fetch("https://api.insydz.com/ai/analyze-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const json = await res.json();

        if (json.answer) {
          setSummary(json.answer);
        } else {
          setSummary("No insights available.");
        }
      } catch (err: any) {
        console.error("❌ AI summary error:", err);
        setSummary("Unable to generate summary.");
      } finally {
        setLoading(false);
      }
    };

    // Small delay to batch requests
    const timer = setTimeout(fetchSummary, 100);
    return () => clearTimeout(timer);
  }, [
    question,
    source,
    JSON.stringify(data),  // ✅ Re-run when data changes
    triggerKey
  ]);

  return { summary, loading };
}