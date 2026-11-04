"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, X, RotateCcw, Lock, Crown, Info, AlertCircle } from "lucide-react";
import { useFilters, Filters } from "./filters-context";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/use-subscription-limits";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
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


const TOP_N_OPTIONS = [
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: 20, label: "Top 20" },
  { value: 50, label: "Top 50" },
  { value: 100, label: "Top 100" },
];

export default function FiltersPanel() {
  const { t } = useTranslation();
  const { filters: appliedFiltersContext, setFilters: setAppliedFiltersContext, maxTopN } = useFilters();
  const { currentTier, limits, canAccessFeature } = useSubscriptionLimits();
  const isFreeTier = currentTier === "free";

  // Local state for temporary filter changes (before applying)
  const [localFilters, setLocalFilters] = useState<FilterState>(appliedFiltersContext);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalType, setModalType] = useState<"category" | "topN">("category");
  const [attemptedTopN, setAttemptedTopN] = useState<number | null>(null);
  const [attemptedCategory, setAttemptedCategory] = useState<string | null>(null);

  // Sync local filters with context on mount
  useEffect(() => {
    setLocalFilters(appliedFiltersContext);
  }, []);

  // Auto-reset category to "All Categories" for free tier users
  useEffect(() => {
    if (isFreeTier && (localFilters.category !== "All Categories" || appliedFiltersContext.category !== "All Categories")) {
      const reset = { ...localFilters, category: "All Categories" };
      setLocalFilters(reset);
      setAppliedFiltersContext((prev) => ({ ...prev, category: "All Categories" }));
    }
  }, [isFreeTier]);

  // ------------------ Fetch Categories ------------------
  const fetchCategories = async (table: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories?table=${table}`);
      const data = await res.json();
      const cats = data.map((c: any) => c.category);

      setCategories(["All Categories", ...cats]);

      // Reset category if current not in list or if user is on free tier
      setLocalFilters(prev => {
        if (isFreeTier || !["All Categories", ...cats].includes(prev.category)) {
          return { ...prev, category: "All Categories" };
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories(localFilters.table);
  }, [localFilters.table]);

  // ------------------ Helpers ------------------
  const updateLocalFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const formatPrice = (price: number) => (price >= 10000 ? `₹${(price / 1000).toFixed(0)}K` : `₹${price.toLocaleString()}`);

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      table: "amazon",
      category: "All Categories",
      priceRange: [0, 5000000],
      rating: 0,
      dateRange: "30d",
      showTrendingOnly: false,
      sortBy: "sales_desc",
      topN: Math.min(10, limits.maxTopN), // Respect subscription limit
    };

    setLocalFilters(defaultFilters);
    setAppliedFiltersContext(defaultFilters);
    setAppliedFilters([]);
  };

  const applyFilters = () => {
    // Free tier cannot filter by specific categories
    const finalFilters = isFreeTier
      ? { ...localFilters, category: "All Categories" }
      : localFilters;

    // Update the actual context with local filters
    setAppliedFiltersContext(finalFilters);

    // Generate applied filters badges
    const applied: string[] = [];
    applied.push(`Table: ${finalFilters.table}`);
    if (finalFilters.category !== "All Categories") applied.push(`Category: ${finalFilters.category}`);
    if (finalFilters.priceRange[0] > 0 || finalFilters.priceRange[1] < 5000000)
      applied.push(`Price: ${formatPrice(finalFilters.priceRange[0])} - ${formatPrice(finalFilters.priceRange[1])}`);
    if (finalFilters.rating > 0) applied.push(`Rating: ${finalFilters.rating}+ stars`);
    if (finalFilters.showTrendingOnly) applied.push("Trending Only");
    if (finalFilters.topN !== 10) applied.push(`Top ${finalFilters.topN} Products`);

    setAppliedFilters(applied);
  };

  const removeFilter = (filterToRemove: string) => {
    setAppliedFilters(prev => prev.filter(f => f !== filterToRemove));

    let updatedFilters = { ...localFilters };

    if (filterToRemove.startsWith("Table:")) updatedFilters.table = "amazon";
    else if (filterToRemove.startsWith("Category:")) updatedFilters.category = "All Categories";
    else if (filterToRemove.startsWith("Price:")) updatedFilters.priceRange = [0, 5000000];
    else if (filterToRemove.startsWith("Rating:")) updatedFilters.rating = 0;
    else if (filterToRemove === "Trending Only") updatedFilters.showTrendingOnly = false;
    else if (filterToRemove.startsWith("Top")) updatedFilters.topN = Math.min(10, limits.maxTopN);

    setLocalFilters(updatedFilters);
    setAppliedFiltersContext(updatedFilters);
  };

  // Handle Category change with subscription check
  const handleCategoryChange = (val: string) => {
    if (isFreeTier && val !== "All Categories") {
      setAttemptedCategory(val);
      setModalType("category");
      setShowUpgradeModal(true);
      return;
    }
    setAttemptedCategory(null);
    updateLocalFilter("category", val);
  };

  // Handle Top N change with subscription check
  const handleTopNChange = (value: string) => {
    const numValue = parseInt(value);

    if (numValue > limits.maxTopN) {
      setAttemptedTopN(numValue);
      setModalType("topN");
      setShowUpgradeModal(true);
      return;
    }

    setAttemptedTopN(null);
    updateLocalFilter("topN", numValue);
  };

  // Check if Top N option is locked
  const isTopNLocked = (value: number) => value > limits.maxTopN;

  // Get next tier name
  const getNextTierForTopN = (value: number): string => {
    if (value <= 5) return "Free";
    if (value <= 10) return "Starter";
    if (value <= 20) return "Basic";
    if (value <= 100) return "Premium";
    return "Enterprise";
  };

  // ------------------ Render ------------------
  return (
    <>
      <Card className="bg-card rounded-lg border mb-6 min-w-0 max-w-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title', 'Filters & Settings')}
            <Badge
              variant="outline"
              className={cn(
                "text-xs ml-2 border",
                currentTier === "starter"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                  : currentTier === "basic"
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                  : currentTier === "premium"
                  ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              {currentTier.toUpperCase()}
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters} data-track-id="filters_reset_btn">
            <RotateCcw className="h-4 w-4 mr-2" /> {t('filters.reset', 'Reset')}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Applied Filters */}
          {appliedFilters.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">{t('filters.appliedFilters', 'Applied Filters')}</Label>
              <div className="flex flex-wrap gap-2">
                {appliedFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeFilter(filter)}
                  >
                    {filter} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0 max-w-full items-end">
            {/* Table Selector */}
            <div className="space-y-2">
              <Label>{t('filters.dataSource', 'Data Source')}</Label>
              <Select value={localFilters.table} onValueChange={(v) => updateLocalFilter("table", v)}>
                <SelectTrigger className="w-full" data-track-id="filters_datasource_select" data-filter-value={localFilters.table}>
                  <SelectValue placeholder={t('filters.selectData', 'Select data source')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flipkart" data-track-id="filters_datasource_option" data-filter-value="flipkart">Flipkart India</SelectItem>
                  <SelectItem value="amazon" data-track-id="filters_datasource_option" data-filter-value="amazon">Amazon India</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('filters.category', 'Category')}</Label>
                {isFreeTier && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400 font-medium">Locked</span>
                  </span>
                )}
              </div>
              <Select value={localFilters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full" data-track-id="filters_category_select" data-filter-value={localFilters.category}>
                  <SelectValue placeholder={t('filters.selectCategory', 'Select category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const isLocked = isFreeTier && cat !== "All Categories";
                    return (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className={isLocked ? "opacity-75" : ""}
                        data-track-id="filters_category_option"
                        data-filter-value={cat}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{cat}</span>
                          {isLocked && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium ml-2">
                              <Lock className="h-3 w-3" />
                              Locked
                            </span>
                          )}
                          {!isLocked && cat === "All Categories" && isFreeTier && (
                            <span className="text-[11px] text-muted-foreground font-normal ml-2">
                              (Free Preview)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>



            {/* Rating */}
            <div className="space-y-2">
              <Label>{t('filters.minRating', 'Minimum Rating')}</Label>
              <Select value={localFilters.rating.toString()} onValueChange={(v) => updateLocalFilter("rating", parseFloat(v))}>
                <SelectTrigger className="w-full" data-track-id="filters_rating_select" data-filter-value={localFilters.rating.toString()}>
                  <SelectValue placeholder={t('filters.allRatings', 'All Ratings')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" data-track-id="filters_rating_option" data-filter-value="0">All Ratings</SelectItem>
                  <SelectItem value="1" data-track-id="filters_rating_option" data-filter-value="1">1+ Stars</SelectItem>
                  <SelectItem value="2" data-track-id="filters_rating_option" data-filter-value="2">2+ Stars</SelectItem>
                  <SelectItem value="3" data-track-id="filters_rating_option" data-filter-value="3">3+ Stars</SelectItem>
                  <SelectItem value="4" data-track-id="filters_rating_option" data-filter-value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5" data-track-id="filters_rating_option" data-filter-value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>



            {/* Top N Products - WITH SUBSCRIPTION LIMITS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  {t('filters.topN', 'Top N Products')}
                  <div className="group relative">
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    <div className="hidden group-hover:block absolute z-50 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg -top-2 left-6">
                      Your limit: {limits.maxTopN >= UNLIMITED ? "Unlimited" : `Top ${limits.maxTopN}`}
                    </div>
                  </div>
                </Label>
                {limits.maxTopN < UNLIMITED && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Max: {limits.maxTopN}
                  </span>
                )}
              </div>
              <Select
                value={localFilters.topN.toString()}
                onValueChange={handleTopNChange}
              >
                <SelectTrigger className="w-full" data-track-id="filters_topn_select" data-filter-value={localFilters.topN.toString()}>
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                  {TOP_N_OPTIONS.map((option) => {
                    const locked = isTopNLocked(option.value);
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        disabled={locked}
                        className={locked ? "opacity-50" : ""}
                        data-track-id="filters_topn_option"
                        data-filter-value={option.value.toString()}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {locked && (
                            <Lock className="h-3 w-3 ml-2 text-muted-foreground" />
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>





          {/* Apply & Clear Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={applyFilters} className="flex-1" data-track-id="filters_apply_btn" data-filter-value={JSON.stringify(localFilters)}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetFilters} data-track-id="filters_clear_btn">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Small Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-sm p-6 rounded-2xl border shadow-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <DialogHeader className="text-center space-y-2 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-center tracking-tight">
              {modalType === "category" ? "Unlock Category Filtering" : "Unlock More Products"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
              {modalType === "category" ? (
                <>
                  Filtering by <span className="font-semibold text-slate-900 dark:text-white">&ldquo;{attemptedCategory}&rdquo;</span> is locked on the Free plan. Upgrade to <span className="font-semibold text-emerald-600 dark:text-emerald-400">Starter</span> to search and filter products across all categories.
                </>
              ) : (
                <>
                  Viewing <span className="font-semibold text-slate-900 dark:text-white">Top {attemptedTopN}</span> products is locked on the Free plan. Upgrade to <span className="font-semibold text-emerald-600 dark:text-emerald-400">Starter</span> to unlock more top-selling products.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => {
                setShowUpgradeModal(false);
                window.location.href = "/subscription";
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl shadow-md text-xs sm:text-sm active:scale-95 transition-all"
            >
              <Crown className="w-4 h-4 mr-1.5" />
              Upgrade to Starter (₹499/mo)
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowUpgradeModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 h-8"
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
