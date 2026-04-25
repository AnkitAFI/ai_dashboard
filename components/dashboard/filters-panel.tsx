"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, X, RotateCcw, Lock, Crown, Info } from "lucide-react";
import { useFilters } from "./filters-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FilterState {
  table: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  dateRange: string;
  showTrendingOnly: boolean;
  sortBy: string;
  topN: number;
}

const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
];

const SORT_OPTIONS = [
  { value: "sales_desc", label: "Sales (High to Low)" },
  { value: "sales_asc", label: "Sales (Low to High)" },
  { value: "profit_desc", label: "Profit Margin (High to Low)" },
  { value: "profit_asc", label: "Profit Margin (Low to High)" },
  { value: "rating_desc", label: "Rating (High to Low)" },
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "trending", label: "Trending" },
];

const TOP_N_OPTIONS = [
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: 20, label: "Top 20" },
  { value: 50, label: "Top 50" },
  { value: 100, label: "Top 100" },
];

export default function FiltersPanel({ selectedSource }: { selectedSource: string }) {
  const { filters: appliedFiltersContext, setFilters: setAppliedFiltersContext, maxTopN } = useFilters();
  const { currentTier, limits } = useSubscriptionLimits();

  const [localFilters, setLocalFilters] = useState<FilterState>(appliedFiltersContext);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [attemptedTopN, setAttemptedTopN] = useState<number | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    setLocalFilters(appliedFiltersContext);
  }, [appliedFiltersContext]);

  const fetchCategories = async (table: string) => {
    try {
      const res = await fetch(`${BASE_URL}/categories?table=${table}`);
      const data = await res.json();
      const cats = data.map((c: any) => c.category);
      setCategories(["All Categories", ...cats]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories(localFilters.table);
  }, [localFilters.table, BASE_URL]);

  const updateLocalFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const formatPrice = (price: number) => (price >= 10000 ? `₹${(price / 1000).toFixed(0)}K` : `₹${price.toLocaleString()}`);

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      table: "flipkart",
      category: "All Categories",
      priceRange: [0, 5000000],
      rating: 0,
      dateRange: "30d",
      showTrendingOnly: false,
      sortBy: "sales_desc",
      topN: Math.min(10, limits.maxTopN),
    };
    setLocalFilters(defaultFilters);
    setAppliedFiltersContext(defaultFilters);
    setAppliedFilters([]);
  };

  const applyFilters = () => {
    setAppliedFiltersContext(localFilters);
    const applied: string[] = [];
    applied.push(`Table: ${localFilters.table}`);
    if (localFilters.category !== "All Categories") applied.push(`Category: ${localFilters.category}`);
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000000)
      applied.push(`Price: ${formatPrice(localFilters.priceRange[0])} - ${formatPrice(localFilters.priceRange[1])}`);
    if (localFilters.rating > 0) applied.push(`Rating: ${localFilters.rating}+ stars`);
    if (localFilters.showTrendingOnly) applied.push("Trending Only");
    if (localFilters.topN !== 10) applied.push(`Top ${localFilters.topN} Products`);
    setAppliedFilters(applied);
  };

  const removeFilter = (filterToRemove: string) => {
    setAppliedFilters(prev => prev.filter(f => f !== filterToRemove));
    let updatedFilters = { ...localFilters };
    if (filterToRemove.startsWith("Table:")) updatedFilters.table = "flipkart";
    else if (filterToRemove.startsWith("Category:")) updatedFilters.category = "All Categories";
    else if (filterToRemove.startsWith("Price:")) updatedFilters.priceRange = [0, 5000000];
    else if (filterToRemove.startsWith("Rating:")) updatedFilters.rating = 0;
    else if (filterToRemove === "Trending Only") updatedFilters.showTrendingOnly = false;
    else if (filterToRemove.startsWith("Top")) updatedFilters.topN = Math.min(10, limits.maxTopN);
    setLocalFilters(updatedFilters);
    setAppliedFiltersContext(updatedFilters);
  };

  return (
    <>
      <Card className="bg-card rounded-lg border mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters & Settings
            <Badge variant="outline" className="text-[10px] ml-2 bg-purple-50 text-purple-700">{currentTier.toUpperCase()}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {appliedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] cursor-pointer hover:bg-rose-100" onClick={() => removeFilter(f)}>
                  {f} <X className="h-2.5 w-2.5 ml-1" />
                </Badge>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2"><Label className="text-xs">Data Source</Label><Select value={localFilters.table} onValueChange={(v) => updateLocalFilter("table", v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="flipkart">Flipkart</SelectItem><SelectItem value="amazon">Amazon</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs">Category</Label><Select value={localFilters.category} onValueChange={(v) => updateLocalFilter("category", v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs">Price Range</Label><div className="px-2"><Slider value={localFilters.priceRange} onValueChange={(v) => updateLocalFilter("priceRange", v as [number, number])} min={0} max={100000} step={1000} /><div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>{formatPrice(localFilters.priceRange[0])}</span><span>{formatPrice(localFilters.priceRange[1])}</span></div></div></div>
            <div className="space-y-2"><Label className="text-xs">Min Rating</Label><Select value={localFilters.rating.toString()} onValueChange={(v) => updateLocalFilter("rating", parseFloat(v))}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">All Ratings</SelectItem><SelectItem value="4">4+ Stars</SelectItem><SelectItem value="4.5">4.5+ Stars</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs">Date Range</Label><Select value={localFilters.dateRange} onValueChange={(v) => updateLocalFilter("dateRange", v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{DATE_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs">Top N Products</Label><Select value={localFilters.topN.toString()} onValueChange={(v) => { const n = parseInt(v); if(n > limits.maxTopN) { setAttemptedTopN(n); setShowUpgradeDialog(true); } else updateLocalFilter("topN", n); }}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{TOP_N_OPTIONS.map(o => <SelectItem key={o.value} value={o.value.toString()} disabled={o.value > limits.maxTopN}>{o.label} {o.value > limits.maxTopN && "🔒"}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2"><Switch checked={localFilters.showTrendingOnly} onCheckedChange={(c) => updateLocalFilter("showTrendingOnly", c)} /><Label className="text-xs">Trending Only</Label></div>
            <div className="flex gap-2"><Button variant="outline" onClick={resetFilters} className="h-9 text-xs">Clear</Button><Button onClick={applyFilters} className="h-9 text-xs bg-sky-600 hover:bg-sky-700">Apply</Button></div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /> Upgrade Plan</DialogTitle><DialogDescription>Your current plan is limited to Top {limits.maxTopN} products.</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-sm text-sky-900">Upgrade to Basic for Top 20 or Premium for Top 100 products.</div>
            <Button className="w-full bg-sky-600 hover:bg-sky-700 h-11 font-bold rounded-xl" onClick={() => window.location.href="/subscription"}>View Plans</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
