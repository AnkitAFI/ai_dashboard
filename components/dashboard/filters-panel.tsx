"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  X,
  RotateCcw,
  Lock,
  Crown,
  Info,
  AlertCircle,
} from "lucide-react";
import { useFilters } from "./filters-context";
import {
  useSubscriptionLimits,
  UNLIMITED,
} from "@/hooks/use-subscription-limits";
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

export default function FiltersPanel() {
  const {
    filters: appliedFiltersContext,
    setFilters: setAppliedFiltersContext,
    maxTopN,
  } = useFilters();
  const { currentTier, limits, canAccessFeature } = useSubscriptionLimits();

  // Local state for temporary filter changes (before applying)
  const [localFilters, setLocalFilters] = useState<FilterState>(
    appliedFiltersContext,
  );
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [attemptedTopN, setAttemptedTopN] = useState<number | null>(null);

  // Sync local filters with context on mount
  useEffect(() => {
    setLocalFilters(appliedFiltersContext);
  }, []);

  // ------------------ Fetch Categories ------------------
  const fetchCategories = async (table: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories?table=${table}`);
      const data = await res.json();
      const cats = data.map((c: any) => c.category);

      setCategories(["All Categories", ...cats]);

      // Reset category if current not in list
      setLocalFilters((prev) => {
        if (!["All Categories", ...cats].includes(prev.category)) {
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
  const updateLocalFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const formatPrice = (price: number) =>
    price >= 10000
      ? `₹${(price / 1000).toFixed(0)}K`
      : `₹${price.toLocaleString()}`;

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
    // Update the actual context with local filters
    setAppliedFiltersContext(localFilters);

    // Generate applied filters badges
    const applied: string[] = [];
    applied.push(`Table: ${localFilters.table}`);
    if (localFilters.category !== "All Categories")
      applied.push(`Category: ${localFilters.category}`);
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000000)
      applied.push(
        `Price: ${formatPrice(localFilters.priceRange[0])} - ${formatPrice(localFilters.priceRange[1])}`,
      );
    if (localFilters.rating > 0)
      applied.push(`Rating: ${localFilters.rating}+ stars`);
    if (localFilters.showTrendingOnly) applied.push("Trending Only");
    if (localFilters.topN !== 10)
      applied.push(`Top ${localFilters.topN} Products`);

    setAppliedFilters(applied);
  };

  const removeFilter = (filterToRemove: string) => {
    setAppliedFilters((prev) => prev.filter((f) => f !== filterToRemove));

    let updatedFilters = { ...localFilters };

    if (filterToRemove.startsWith("Table:")) updatedFilters.table = "amazon";
    else if (filterToRemove.startsWith("Category:"))
      updatedFilters.category = "All Categories";
    else if (filterToRemove.startsWith("Price:"))
      updatedFilters.priceRange = [0, 5000000];
    else if (filterToRemove.startsWith("Rating:")) updatedFilters.rating = 0;
    else if (filterToRemove === "Trending Only")
      updatedFilters.showTrendingOnly = false;
    else if (filterToRemove.startsWith("Top"))
      updatedFilters.topN = Math.min(10, limits.maxTopN);

    setLocalFilters(updatedFilters);
    setAppliedFiltersContext(updatedFilters);
  };

  // Handle Top N change with subscription check
  const handleTopNChange = (value: string) => {
    const numValue = parseInt(value);

    if (numValue > limits.maxTopN) {
      setAttemptedTopN(numValue);
      setShowUpgradeDialog(true);
      return;
    }

    updateLocalFilter("topN", numValue);
  };

  // Check if Top N option is locked
  const isTopNLocked = (value: number) => value > limits.maxTopN;

  // Get next tier name
  const getNextTierForTopN = (value: number): string => {
    if (value <= 5) return "Free";
    if (value <= 20) return "Basic";
    if (value <= 100) return "Premium";
    return "Enterprise";
  };

  // ------------------ Render ------------------
  return (
    <>
      <Card className="bg-card rounded-lg border mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Settings
            <Badge
              variant="outline"
              className="text-xs ml-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 text-purple-700"
            >
              {currentTier.toUpperCase()}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            data-track-id="filters_reset_btn"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Applied Filters */}
          {appliedFilters.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Applied Filters
              </Label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Table Selector */}
            <div className="space-y-2">
              <Label>Data Source</Label>
              <Select
                value={localFilters.table}
                onValueChange={(v) => updateLocalFilter("table", v)}
              >
                <SelectTrigger
                  className="w-full"
                  data-track-id="filters_datasource_select"
                  data-filter-value={localFilters.table}
                >
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="flipkart"
                    data-track-id="filters_datasource_option"
                    data-filter-value="flipkart"
                  >
                    Flipkart
                  </SelectItem>
                  <SelectItem
                    value="amazon"
                    data-track-id="filters_datasource_option"
                    data-filter-value="amazon"
                  >
                    Amazon
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={localFilters.category}
                onValueChange={(v) => updateLocalFilter("category", v)}
              >
                <SelectTrigger
                  className="w-full"
                  data-track-id="filters_category_select"
                  data-filter-value={localFilters.category}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      data-track-id="filters_category_option"
                      data-filter-value={cat}
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="px-2">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(v) =>
                    updateLocalFilter("priceRange", v as [number, number])
                  }
                  min={0}
                  max={100000}
                  step={1000}
                  className="w-full"
                  data-track-id="filters_price_slider"
                  data-filter-value={JSON.stringify(localFilters.priceRange)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatPrice(localFilters.priceRange[0])}</span>
                  <span>{formatPrice(localFilters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select
                value={localFilters.rating.toString()}
                onValueChange={(v) =>
                  updateLocalFilter("rating", parseFloat(v))
                }
              >
                <SelectTrigger
                  className="w-full"
                  data-track-id="filters_rating_select"
                  data-filter-value={localFilters.rating.toString()}
                >
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="0"
                    data-track-id="filters_rating_option"
                    data-filter-value="0"
                  >
                    All Ratings
                  </SelectItem>
                  <SelectItem
                    value="1"
                    data-track-id="filters_rating_option"
                    data-filter-value="1"
                  >
                    1+ Stars
                  </SelectItem>
                  <SelectItem
                    value="2"
                    data-track-id="filters_rating_option"
                    data-filter-value="2"
                  >
                    2+ Stars
                  </SelectItem>
                  <SelectItem
                    value="3"
                    data-track-id="filters_rating_option"
                    data-filter-value="3"
                  >
                    3+ Stars
                  </SelectItem>
                  <SelectItem
                    value="4"
                    data-track-id="filters_rating_option"
                    data-filter-value="4"
                  >
                    4+ Stars
                  </SelectItem>
                  <SelectItem
                    value="4.5"
                    data-track-id="filters_rating_option"
                    data-filter-value="4.5"
                  >
                    4.5+ Stars
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={localFilters.dateRange}
                onValueChange={(v) => updateLocalFilter("dateRange", v)}
              >
                <SelectTrigger
                  className="w-full"
                  data-track-id="filters_daterange_select"
                  data-filter-value={localFilters.dateRange}
                >
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem
                      key={range.value}
                      value={range.value}
                      data-track-id="filters_daterange_option"
                      data-filter-value={range.value}
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={localFilters.sortBy}
                onValueChange={(v) => updateLocalFilter("sortBy", v)}
              >
                <SelectTrigger
                  className="w-full"
                  data-track-id="filters_sortby_select"
                  data-filter-value={localFilters.sortBy}
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-track-id="filters_sortby_option"
                      data-filter-value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Top N Products - WITH SUBSCRIPTION LIMITS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Top N Products
                  <div className="group relative">
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    <div className="hidden group-hover:block absolute z-50 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg -top-2 left-6">
                      Your limit:{" "}
                      {limits.maxTopN >= UNLIMITED
                        ? "Unlimited"
                        : `Top ${limits.maxTopN}`}
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
                <SelectTrigger
                  className="w-full"
                  data-track-id="filters_topn_select"
                  data-filter-value={localFilters.topN.toString()}
                >
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

              {/* Current selection display */}
              <div className="text-xs text-muted-foreground">
                Currently: Top {localFilters.topN} products
              </div>
            </div>
          </div>

          {/* Subscription Upgrade Prompt */}
          {limits.maxTopN < 100 && (
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900 mb-1">
                    🚀 Unlock More Data Insights
                  </p>
                  <p className="text-xs text-purple-700 mb-2">
                    {currentTier === "free"
                      ? "Unlock Full Access for Top 20 products or Premium for Top 100"
                      : currentTier === "basic"
                        ? "Upgrade to Premium for Top 100 products + real-time alerts"
                        : "Upgrade to Enterprise for unlimited products"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
                      onClick={() => (window.location.href = "/subscription")}
                      data-track-id="filters_upgrade_view_plans_btn"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      View Plans
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => setShowUpgradeDialog(true)}
                      data-track-id="filters_upgrade_learn_more_btn"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <Separator />
          <div className="space-y-4">
            <Label className="text-sm font-medium">Advanced Options</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Show Trending Products Only</Label>
                <p className="text-xs text-muted-foreground">
                  Filter to display only products that are currently trending
                </p>
              </div>
              <Switch
                checked={localFilters.showTrendingOnly}
                onCheckedChange={(checked) =>
                  updateLocalFilter("showTrendingOnly", checked)
                }
                data-track-id="filters_show_trending_only_switch"
                data-filter-value={localFilters.showTrendingOnly ? "on" : "off"}
              />
            </div>
          </div>

          {/* Apply & Clear Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={applyFilters}
              className="flex-1"
              data-track-id="filters_apply_btn"
              data-filter-value={JSON.stringify(localFilters)}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={resetFilters}
              data-track-id="filters_clear_btn"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-6 h-6 text-purple-600" />
              Upgrade to View More Products
            </DialogTitle>
            <DialogDescription>
              {attemptedTopN
                ? `You tried to select Top ${attemptedTopN}, but your ${currentTier} plan is limited to Top ${limits.maxTopN}`
                : `Your ${currentTier} plan is limited to Top ${limits.maxTopN} products`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Plan Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900">
                  Current Plan: {currentTier.toUpperCase()}
                </p>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-slate-700">
                <strong>Your Limit:</strong> Top {limits.maxTopN} products
              </p>
            </div>

            {/* Feature Comparison */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-800">
                📊 Upgrade Options:
              </h4>

              <div className="space-y-2">
                {currentTier === "free" && (
                  <>
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg">
                      <p className="font-semibold text-sm text-blue-900">
                        Basic - ₹1999/month
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1 mt-1 ml-4">
                        <li>✓ Top 20 products (4x more)</li>
                        <li>✓ AI chart summaries</li>
                        <li>✓ 15 notifications</li>
                        <li>✓ Export data</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-lg">
                      <p className="font-semibold text-sm text-purple-900">
                        Premium - ₹2999/month ⭐
                      </p>
                      <ul className="text-xs text-purple-700 space-y-1 mt-1 ml-4">
                        <li>✓ Top 100 products (20x more)</li>
                        <li>✓ Real-time data & alerts</li>
                        <li>✓ Unlimited notifications</li>
                        <li>✓ Advanced analytics</li>
                      </ul>
                    </div>
                  </>
                )}

                {currentTier === "basic" && (
                  <div className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-lg">
                    <p className="font-semibold text-sm text-purple-900">
                      Premium - ₹1999/month ⭐
                    </p>
                    <ul className="text-xs text-purple-700 space-y-1 mt-1 ml-4">
                      <li>✓ Top 100 products (5x more)</li>
                      <li>✓ Real-time data & alerts</li>
                      <li>✓ Unlimited notifications</li>
                      <li>✓ Advanced analytics</li>
                      <li>✓ AI chatbot support</li>
                    </ul>
                  </div>
                )}

                {currentTier === "premium" && (
                  <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded-r-lg">
                    <p className="font-semibold text-sm text-amber-900">
                      Enterprise - Custom 👑
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1 mt-1 ml-4">
                      <li>✓ Unlimited products</li>
                      <li>✓ Dedicated account manager</li>
                      <li>✓ Custom integrations</li>
                      <li>✓ 24/7 priority support</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => (window.location.href = "/subscription")}
                data-track-id="filters_upgrade_now_dialog_btn"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowUpgradeDialog(false)}
                data-track-id="filters_maybe_later_dialog_btn"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
