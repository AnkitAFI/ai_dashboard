"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/dashboard/filters-context";
import { useAISummary } from "@/hooks/use-ai-summary";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";

interface TrendingProduct {
  product_title?: string;
  title?: string;
  daily_sales?: number;
  total_daily_sales?: number;
  sales_volume?: string | number;
  estimated_sales?: number;
  avg_price?: number;
  product_price?: number;
}

function ProductCard({ product, index, source }: { product: TrendingProduct; index: number; source: string }) {
  const colors = ["bg-emerald-500", "bg-sky-500", "bg-indigo-500"];
  const gradients = ["from-emerald-50/50 to-emerald-100/50", "from-sky-50/50 to-sky-100/50", "from-indigo-50/50 to-indigo-100/50"];
  const name = product.product_title || product.title || "Unknown Product";
  const sales = product.daily_sales || product.total_daily_sales || product.estimated_sales || 0;
  const price = product.avg_price || product.product_price || 0;

  return (
    <div className={cn("flex items-center justify-between p-3 rounded-xl bg-gradient-to-r border border-white shadow-sm", gradients[index % 3])}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", colors[index % 3])}>{index + 1}</div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate" title={name}>{name.replace(/"/g, "")}</p>
          <p className="text-[10px] text-slate-500">{Math.round(Number(sales)).toLocaleString()} sales · ₹{price.toFixed(0)}</p>
        </div>
      </div>
      <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200 bg-white">{source}</Badge>
      <TrendingUp className="h-4 w-4 text-emerald-600" />
    </div>
  );
}

export default function ProductRankings({ selectedSource }: { selectedSource: string }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();

  const [flipkartProducts, setFlipkartProducts] = useState<TrendingProduct[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All Categories") params.append("category", filters.category);
    if (filters.priceRange[0] > 0) params.append("min_price", filters.priceRange[0].toString());
    if (filters.priceRange[1] < 5000000) params.append("max_price", filters.priceRange[1].toString());
    if (filters.rating > 0) params.append("min_rating", filters.rating.toString());
    if (filters.dateRange !== "all") params.append("date_range", filters.dateRange);
    if (filters.showTrendingOnly) params.append("trending_only", "true");
    if (filters.sortBy) params.append("sort_by", filters.sortBy);
    return params.toString();
  };

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const queryParams = buildQueryParams();
        const topN = filters.topN || 10;
        if (table === "both") {
          const halfN = Math.ceil(topN / 2);
          const [fRes, aRes] = await Promise.all([
            fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${halfN}&${queryParams}`),
            fetch(`${BASE_URL}/rapidapi/top-sales?limit=${halfN}&${queryParams}`)
          ]);
          setFlipkartProducts((await fRes.json()).data || []);
          setAmazonProducts((await aRes.json()).data || []);
        } else if (table === "amazon") {
          const res = await fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`);
          setAmazonProducts((await res.json()).data || []);
          setFlipkartProducts([]);
        } else {
          const res = await fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`);
          setFlipkartProducts((await res.json()).data || []);
          setAmazonProducts([]);
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchTrendingProducts();
  }, [selectedSource, filters, BASE_URL]);

  const allProducts = [...flipkartProducts, ...amazonProducts];
  const hasAISummaries = canAccessFeature('hasChartAISummaries');
  const { summary, loading: summaryLoading } = useAISummary(hasAISummaries ? "Summarize key patterns in trending products." : "", "market_movers", allProducts, allProducts.length, filters);

  return (
    <Card className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between px-6 py-4">
        <CardTitle className="text-lg font-bold text-slate-900">Market Movers</CardTitle>
        <Badge variant="secondary" className="text-[10px] font-bold">LIVE</Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {hasAISummaries ? (
          summaryLoading ? <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2"><Sparkles className="h-3 w-3" /> Generating insights...</div> :
          summary && <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed flex items-start gap-2"><Sparkles className="h-3 w-3 mt-0.5 shrink-0" />{summary}</div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 flex items-start gap-2"><Lock className="h-3 w-3 mt-0.5" /> Upgrade to {currentTier === 'free' ? 'Basic' : 'Premium'} for AI insights.</div>
        )}
        <div className="space-y-2">
          {isLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />) : 
            allProducts.length > 0 ? allProducts.map((p, i) => <ProductCard key={i} product={p} index={i} source={flipkartProducts.includes(p) ? "Flipkart" : "Amazon"} />) :
            <div className="text-center py-6 text-slate-400 text-sm">No movers found</div>
          }
        </div>
      </CardContent>
    </Card>
  );
}
