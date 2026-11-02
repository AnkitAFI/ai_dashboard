"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, IndianRupee, ArrowUpDown, TrendingUp, Search, X, Filter, ExternalLink, Lock, Crown, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilters } from "@/components/dashboard/filters-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { cn } from "@/lib/utils";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";
import { analytics } from "@/lib/analytics";

// Unified interface for both Flipkart & Amazon
interface TrendingProduct {
  id?: number;
  title?: string;
  product_title?: string;
  category?: string;
  category_name?: string;
  price?: number;
  avg_price?: number;
  rating?: number;
  avg_rating?: number;
  product_star_rating?: number;
  product_star_rating_numeric?: number;
  reviews?: number;
  total_reviews?: number;
  total_ratings?: number;
  product_num_ratings?: number;
  product_rating_count?: number;
  sales_volume?: string;
  avg_sales_volume?: number;
  source?: string;
  product_price?: string | number;
  product_price_numeric?: number;
  pid?: string;
  asin?: string;
  product_subtitle?: string;
  description?: string;
  highlights?: any;
  brand?: string;
  product_url?: string;
  product_photo?: string;
}

function SalesContent() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters } = useFilters();

  const sourceParam = searchParams?.get("source");
  const initialSource: "flipkart" | "amazon" =
    sourceParam === "flipkart" || sourceParam === "amazon"
      ? sourceParam
      : (filters.table?.toLowerCase().includes("flipkart") ? "flipkart" : "amazon");

  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [source, setSource] = useState<"flipkart" | "amazon">(initialSource);
  const [sortField, setSortField] = useState<"reviews" | "price" | "rating" | "sales">("sales");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TrendingProduct | null>(null);
  const { currentTier } = useSubscriptionLimits();
  const isFreeTier = currentTier === "free";
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTriggerReason, setUpgradeTriggerReason] = useState<string>("");

  // Reactively sync source whenever searchParams or filters change
  useEffect(() => {
    const s = searchParams?.get("source");
    if (s === "flipkart" || s === "amazon") {
      setSource((prev) => (prev !== s ? s : prev));
      setFilters((prev) => (prev.table === s ? prev : { ...prev, table: s }));
    } else if (filters.table) {
      const fallback = filters.table.toLowerCase().includes("flipkart") ? "flipkart" : "amazon";
      setSource((prev) => (prev !== fallback ? fallback : prev));
    }
  }, [searchParams, filters.table, setFilters]);

  const handleSourceChange = (newSource: "flipkart" | "amazon") => {
    setSource(newSource);
    setFilters((prev) => ({ ...prev, table: newSource }));
    router.replace(`/sales?source=${newSource}`);
  };

  const triggerUpgrade = (reason: string) => {
    setUpgradeTriggerReason(reason);
    setShowUpgradeModal(true);
    analytics.track("upgrade_prompt_viewed", {
      feature: "top_selling_products",
      reason,
      tier: currentTier,
    });
  };

  // Refs for page-leave tracking (avoid stale closures in event listeners)
  const lastTrackedQueryRef = useRef<string>("");
  const searchQueryRef = useRef<string>("");
  const sourceRef = useRef<string>(source);
  const categoryRef = useRef<string>(selectedCategory);
  const productsRef = useRef<TrendingProduct[]>(products);

  useEffect(() => { productsRef.current = products; }, [products]);

  // Keep refs in sync with state
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);
  useEffect(() => { sourceRef.current = source; }, [source]);
  useEffect(() => { categoryRef.current = selectedCategory; }, [selectedCategory]);

  // Track search when user leaves the page or closes tab before 400ms debounce fires
  useEffect(() => {
    const handlePageLeave = () => {
      const q = searchQueryRef.current.trim();
      if (q.length >= 2 && q !== lastTrackedQueryRef.current) {
        const matches = (productsRef.current || []).filter(p =>
          (p.title || p.product_title || "").toLowerCase().includes(q.toLowerCase())
        );
        const topResults = matches.slice(0, 3).map(p => (p.title || p.product_title || "").trim()).filter(Boolean);

        analytics.track("product_search", {
          query: q,
          filter_value: q,
          track_id: "product_search_input",
          results_count: matches.length,
          has_results: matches.length > 0,
          top_results: topResults,
          source: sourceRef.current,
          category: categoryRef.current,
          page: "top_selling_products",
          trigger: "page_leave_or_close",
        });
        lastTrackedQueryRef.current = q;
        // Crucial: immediately flush the batch on tab close / leave
        analytics.flush();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handlePageLeave();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", handlePageLeave);
    window.addEventListener("beforeunload", handlePageLeave);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", handlePageLeave);
      window.removeEventListener("beforeunload", handlePageLeave);
    };
  }, []);

  // Debounce searchQuery by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
      const q = searchQuery.trim();
      // Only track if meaningful AND different from last tracked (avoids noise on partial erase)
      if (q.length >= 2 && q !== lastTrackedQueryRef.current) {
        const matches = products.filter(p =>
          (p.title || p.product_title || "").toLowerCase().includes(q.toLowerCase())
        );
        const topResults = matches.slice(0, 3).map(p => (p.title || p.product_title || "").trim()).filter(Boolean);

        analytics.track("product_search", {
          query: q,
          filter_value: q,
          track_id: "product_search_input",
          results_count: matches.length,
          has_results: matches.length > 0,
          top_results: topResults,
          source,
          category: selectedCategory,
          page: "top_selling_products",
          trigger: "debounce",
        });
        lastTrackedQueryRef.current = q;
      }
      // Reset last tracked when user fully clears the search box
      if (q.length === 0) {
        lastTrackedQueryRef.current = "";
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories & reset selection when source changes
  useEffect(() => {
    let ignore = false;
    setSelectedCategory("All Categories");
    setCurrentPage(1);
    setCategoriesLoading(true);

    const url =
      source === "flipkart"
        ? `${API_BASE_URL}/rapidapi_flipkart_products/categories`
        : `${API_BASE_URL}/rapidapi_amazon_products/categories`;

    axios
      .get(url)
      .then((res) => {
        if (!ignore) {
          const data = Array.isArray(res.data) ? res.data : [];
          const names = data
            .map((c: { category_name?: string; category?: string }) => c.category_name || c.category || "")
            .filter((name: string) => name.trim() !== "");
          setCategories(names);
        }
      })
      .catch(() => {
        if (!ignore) setCategories([]);
      })
      .finally(() => {
        if (!ignore) setCategoriesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [source]);

  // Re-fetch products when source or selected category changes
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const categoryParam =
      selectedCategory && selectedCategory !== "All Categories"
        ? `&category=${encodeURIComponent(selectedCategory)}`
        : "";

    const url =
      source === "flipkart"
        ? `${API_BASE_URL}/top?table=rapidapi_flipkart_products&n=500${categoryParam}`
        : `${API_BASE_URL}/rapidapi/top-sales?limit=500${categoryParam}`;

    axios
      .get(url)
      .then((res) => {
        if (!ignore) {
          const data = res.data.data || res.data;
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!ignore) setError("Failed to fetch top products");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [source, selectedCategory]);

  const isDark = mounted && resolvedTheme === "dark";

  // Parse sales_volume text like "9.4K+ bought" or "10K+ bought in past month"
  const parseSalesVolume = (salesText?: string, avgSales?: number): number => {
    if (avgSales) return avgSales;
    if (!salesText) return 0;

    // Extract number and multiplier (K, M, etc.)
    const match = salesText.match(/([\d.]+)([KMB])?/i);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const multiplier = match[2]?.toUpperCase();

    switch (multiplier) {
      case 'K': return num * 1000;
      case 'M': return num * 1000000;
      case 'B': return num * 1000000000;
      default: return num;
    }
  };

  const getProductPrice = (p: TrendingProduct): number => {
    if (typeof p.price === "number" && !isNaN(p.price) && p.price > 0) return p.price;
    if (typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0) return p.product_price;
    if (typeof p.product_price === "string") {
      const parsed = parseFloat(p.product_price);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (typeof p.product_price_numeric === "number" && !isNaN(p.product_price_numeric) && p.product_price_numeric > 0) return p.product_price_numeric;
    return p.avg_price ?? 0;
  };

  const getHighlightsArray = (highlights?: any): string[] => {
    if (!highlights) return [];
    if (Array.isArray(highlights)) {
      return highlights.map(h => typeof h === 'string' ? h : (h?.text || h?.title || JSON.stringify(h)));
    }
    if (typeof highlights === 'string') {
      try {
        const parsed = JSON.parse(highlights);
        if (Array.isArray(parsed)) {
          return parsed.map(h => typeof h === 'string' ? h : (h?.text || h?.title || JSON.stringify(h)));
        }
      } catch (e) {
        return highlights.split('•').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };


  const getFieldValue = (p: TrendingProduct, field: string) => {
    switch (field) {
      case "reviews":
        return p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0;
      case "price":
        return getProductPrice(p);
      case "rating":
        return p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0;
      case "sales":
        const rawSales = parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? (p as any).estimated_sales);
        return source === "flipkart" ? Math.round(rawSales / 125) : rawSales;
      default:
        return 0;
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!debouncedSearch) return true;
    const title = (p.title || p.product_title || "").toLowerCase();
    return title.includes(debouncedSearch.toLowerCase());
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const factor = sortOrder === "asc" ? 1 : -1;
    return (getFieldValue(a, sortField) - getFieldValue(b, sortField)) * factor;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const toggleSort = (field: "reviews" | "price" | "rating" | "sales") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleSortClick = (field: "reviews" | "price" | "rating" | "sales") => {
    if (isFreeTier) {
      if (field !== "sales") {
        triggerUpgrade(
          t(
            "sales.upgrade_sort_reason",
            `Sorting by ${field.toUpperCase()} requires an upgraded plan. Upgrade to spot high-margin, low-competition products.`
          )
        );
        return;
      }
      // Lock reversing to Lowest Selling for free tier
      if (field === "sales") {
        triggerUpgrade(
          "Sorting by Lowest Selling (Low → High) to discover untapped micro-niches requires an upgraded plan. Upgrade to unlock bidirectional sorting."
        );
        return;
      }
    }
    toggleSort(field);
  };

  const getMetricColumns = (): Array<"sales" | "reviews" | "price" | "rating"> => {
    const allMetrics: Array<"sales" | "reviews" | "price" | "rating"> = ["sales", "reviews", "price", "rating"];
    const rest = allMetrics.filter((m) => m !== sortField);
    return [sortField, ...rest];
  };

  const getMetricLabel = (field: "sales" | "reviews" | "price" | "rating") => {
    switch (field) {
      case "price":
        return t("sales.price", "Price (₹)");
      case "rating":
        return t("sales.rating", "Rating");
      case "reviews":
        return t("sales.reviews", "Reviews");
      case "sales":
        return t("sales.sales", "Sales");
    }
  };

  const renderMetricCell = (p: TrendingProduct, field: "sales" | "reviews" | "price" | "rating") => {
    const isSorted = sortField === field;
    const baseCellClass = cn(
      "py-3 px-4 text-right transition-colors",
      isSorted
        ? isDark
          ? "bg-slate-800/40 font-semibold"
          : "bg-blue-50/50 font-bold"
        : ""
    );

    switch (field) {
      case "price":
        return (
          <td key={field} className={cn(baseCellClass, "text-emerald-600 dark:text-emerald-400/80 font-medium")}>
            <IndianRupee className="inline w-3.5 h-3.5" />
            {getProductPrice(p).toFixed(2)}
          </td>
        );
      case "rating":
        return (
          <td key={field} className={cn(baseCellClass, "text-slate-700 dark:text-slate-300 font-medium")}>
            <Star className="inline w-3.5 h-3.5 mr-1 text-amber-400/80" />
            {(p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0).toFixed(1)}
          </td>
        );
      case "reviews":
        return (
          <td key={field} className={cn(baseCellClass, isDark ? "text-slate-300 font-medium" : "text-blue-600 font-semibold")}>
            {(p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0).toLocaleString()}
          </td>
        );
      case "sales":
        return (
          <td key={field} className={cn(baseCellClass, isDark ? "text-purple-300/80 font-medium" : "text-purple-600 font-semibold")}>
            <TrendingUp className="inline w-3.5 h-3.5 mr-1 text-purple-400/80" />
            {isFreeTier ? (
              <span className="filter blur-[4px] select-none opacity-70 inline-block" title="Upgrade to reveal exact sales count">
                {formatSalesDisplay(p)}
              </span>
            ) : (
              formatSalesDisplay(p)
            )}
          </td>
        );
    }
  };

  const handlePageChange = (page: number) => {
    if (isFreeTier && page > 1) {
      triggerUpgrade(
        t(
          "sales.upgrade_page_reason",
          "Pages 2 to 50 contain 490 hidden winning products. Upgrade to browse the complete database."
        )
      );
      return;
    }
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatSalesDisplay = (product: TrendingProduct): string => {
    const salesNum = getFieldValue(product, "sales");
    if (salesNum === 0 && product.sales_volume) {
      return product.sales_volume;
    }
    if (salesNum >= 1000000) {
      return `${(salesNum / 1000000).toFixed(1)}M`;
    }
    if (salesNum >= 1000) {
      return `${(salesNum / 1000).toFixed(1)}K`;
    }
    return salesNum.toLocaleString();
  };

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p>{t('sales.loading', 'Loading {{source}} top product data...', { source })}</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header & Source Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="page-title">
              Top {products.length} Selling Products ({source})
            </h1>
            {isFreeTier && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                <span>Free Preview • 5/500 Unlocked</span>
              </span>
            )}
          </div>
          <p className="page-subtitle">
            {t('sales.subtitle', 'Analyze and sort by sales, reviews, price, or rating for data-driven decisions.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={source}
            onChange={(e) => handleSourceChange(e.target.value as "flipkart" | "amazon")}
            className={cn(
              "border px-3 py-2 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm",
              isDark 
                ? "border-slate-700 bg-slate-900 text-slate-100" 
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            )}
            data-track-id="sales_source_select"
            data-filter-value={source}
          >
            <option value="flipkart" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Flipkart India</option>
            <option value="amazon" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Amazon India</option>
          </select>

          <div className="relative max-w-[170px] sm:max-w-[220px]">
            <Filter className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
              isDark ? "text-slate-400" : "text-slate-500"
            )} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value;
                if (isFreeTier && val !== "All Categories") {
                  triggerUpgrade(
                    t(
                      "sales.upgrade_category_reason",
                      "Filtering by this category requires an upgraded plan. Upgrade to view all categories."
                    )
                  );
                  return;
                }
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              disabled={categoriesLoading}
              className={cn(
                "border pl-8 pr-3 py-2 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full truncate text-xs sm:text-sm",
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                categoriesLoading && "opacity-50 cursor-wait"
              )}
              data-track-id="sales_category_select"
              data-filter-value={selectedCategory}
            >
              <option value="All Categories" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                All Categories {isFreeTier ? "(Free Preview)" : ""}
              </option>
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}
                >
                  {cat.length > 25 ? cat.slice(0, 25) + "…" : cat} {isFreeTier ? "(Locked)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Free Tier Premium Intelligence Banner */}
      {isFreeTier && (
        <div className={cn(
          "relative overflow-hidden rounded-2xl border p-4 transition-all shadow-xs",
          isDark
            ? "bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/30 border-slate-800"
            : "bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/40 border-blue-100"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-start sm:items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                isDark ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "bg-blue-600 text-white"
              )}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                    Seller Intelligence Tip
                  </span>
                </div>
                <p className={cn("text-xs leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>
                  Ranks #1–#5 are corporate giants with huge ad spend. The <strong className="font-semibold text-slate-900 dark:text-white">real profit margins</strong> for sellers are in Ranks #15–#75.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => triggerUpgrade("Unlock all 500 top-selling products across all 50 pages.")}
              className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs h-8 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Ranks #6–500</span>
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar & Sort Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="relative w-full sm:w-80">
          <SmartSearchInput
            value={isFreeTier ? "" : searchQuery}
            onChange={isFreeTier ? () => {} : setSearchQuery}
            placeholder={t('sales.searchPlaceholder', 'Search products...')}
            className="w-full"
            inputClassName={cn(
              "w-full text-sm font-medium transition-colors",
              isFreeTier && "cursor-pointer pr-24 opacity-80",
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500" 
                : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
            )}
          />
          {isFreeTier && (
            <div
              onClick={() => triggerUpgrade("Product search is locked on the Free Preview. Upgrade to search across all 500 top-selling products.")}
              className="absolute inset-y-0 right-0 z-10 cursor-pointer flex items-center pr-3 rounded-md"
              title="Upgrade to search products"
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-xs">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 flex-wrap">
          {["sales", "reviews", "price", "rating"].map((field) => {
            const isSelected = sortField === field;
            return (
              <Button
                key={field}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "flex items-center gap-2",
                  isSelected
                    ? isDark
                      ? "bg-sky-700/90 hover:bg-sky-600 text-white border-sky-500/40 shadow-xs"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    : isDark
                      ? "text-slate-300 border-slate-800 hover:bg-slate-800/60 bg-slate-900/60"
                      : "text-slate-700 border-slate-300 hover:bg-slate-100"
                )}
                onClick={() => handleSortClick(field as "reviews" | "price" | "rating" | "sales")}
                data-track-id="sales_sort_btn"
                data-filter-value={field}
                disabled={loading}
              >
                {isFreeTier ? (
                  <Lock className={cn("w-3.5 h-3.5", isSelected ? "text-amber-300" : "text-amber-500")} />
                ) : (
                  <ArrowUpDown className="w-4 h-4" />
                )}
                {t(`sales.sort_${field}`, field.charAt(0).toUpperCase() + field.slice(1))}
                {isSelected ? ` (${sortOrder === "asc" ? "↑" : "↓"})` : ""}
              </Button>
            );
          })}
        </div>
      </div>

      <Card className={cn(
        "shadow-sm rounded-2xl overflow-hidden border",
        isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
      )}>
        <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
            {t('sales.showingPage', 'Showing Page')} {currentPage} {t('sales.of', 'of')} {totalPages}
            {isFreeTier ? " — FREE PREVIEW (5 OF 500 UNLOCKED)" : ""} — {t('sales.sortedBy', 'Sorted by')}{" "}
            {t(`sales.sort_${sortField}`, sortField.charAt(0).toUpperCase() + sortField.slice(1))}{" "}
            ({sortOrder === "asc" ? t('sales.lowToHigh', 'Low → High') : t('sales.highToLow', 'High → Low')})
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto p-0 relative">
          <table className={cn("w-full text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
            <thead className={cn(
              "uppercase text-xs font-semibold",
              isDark ? "bg-slate-800/80 text-slate-400" : "bg-slate-100 text-slate-700"
            )}>
              <tr>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200")}>#</th>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200")}>{t('sales.product', 'Product')}</th>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200")}>{t('sales.category', 'Category')}</th>
                {getMetricColumns().map((field) => {
                  const isSorted = sortField === field;
                  return (
                    <th
                      key={field}
                      onClick={() => handleSortClick(field)}
                      className={cn(
                        "py-3 px-4 text-right border-b cursor-pointer select-none transition-colors",
                        isSorted
                          ? isDark
                            ? "bg-slate-800/80 text-sky-300 font-bold border-slate-700"
                            : "bg-blue-50 text-blue-700 font-bold border-blue-300"
                          : isDark
                            ? "bg-slate-800/80 border-slate-700 hover:bg-slate-750"
                            : "bg-slate-100 border-slate-200 hover:bg-slate-200/70"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{getMetricLabel(field)}</span>
                        {isSorted && (
                          <span className="text-xs font-extrabold flex items-center gap-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                            {isFreeTier && <Lock className="w-2.5 h-2.5 text-amber-500 inline" />}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((p, i) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + i;
                const isMysteryRow = isFreeTier && globalIndex === 0;
                const isBlurredRow = isFreeTier && globalIndex >= 5;

                return (
                  <tr
                    key={i}
                    onClick={() => {
                      if (isMysteryRow) {
                        triggerUpgrade(
                          `Reveal Rank #1: See the exact title, ${source === "flipkart" ? "PID" : "ASIN"}, and sales volume upon upgrading.`
                        );
                        return;
                      }
                      if (isBlurredRow) {
                        triggerUpgrade(
                          "Unlock all remaining products on Pages 2 to 50."
                        );
                        return;
                      }
                      setSelectedProduct(p);
                    }}
                    className={cn(
                      "border-b transition-colors cursor-pointer",
                      isMysteryRow && "bg-amber-500/[0.03] dark:bg-amber-500/[0.04] border-l-2 border-l-amber-500",
                      isBlurredRow
                        ? "filter blur-[3.5px] select-none opacity-40 hover:opacity-50"
                        : isDark 
                          ? "border-slate-800/80 hover:bg-slate-800/30" 
                          : "border-slate-200 hover:bg-slate-50"
                    )}
                    data-track-id="sales_product_row"
                    data-filter-value={p.title || p.product_title}
                  >
                    <td className={cn("py-3 px-4 font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
                      {globalIndex + 1}
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      {isMysteryRow ? (
                        <div className="flex flex-col gap-1.5 py-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                              <Crown className="w-3 h-3" /> #1 Secret Rank
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-400">
                              {source === "flipkart" ? "PID: ••••••••••••" : "ASIN: ••••••••••••"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                              #1 Selling Product ({source === "flipkart" ? "Flipkart" : "Amazon"})
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-sky-400 shrink-0 hover:underline">
                              <Lock className="w-3 h-3" /> Unlock Rank #1 →
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "font-medium line-clamp-2 transition-colors hover:text-blue-500 dark:hover:text-sky-400",
                              isDark ? "text-slate-300" : "text-slate-800"
                            )}
                            title={p.title || p.product_title}
                          >
                            {p.title || p.product_title}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                            {p.brand && <span className="font-medium text-slate-500 dark:text-slate-400">{p.brand}</span>}
                            {(p.description || p.product_subtitle) && (
                              <span className="truncate max-w-[240px]" title={p.description || p.product_subtitle}>
                                • {p.description || p.product_subtitle}
                              </span>
                            )}
                            {(p.pid || p.asin) && (
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                {isFreeTier
                                  ? (source === "flipkart" ? "PID: 🔒 Locked" : "ASIN: 🔒 Locked")
                                  : (source === "flipkart" ? `PID: ${p.pid}` : `ASIN: ${p.asin}`)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className={cn("py-3 px-4", isDark ? "text-slate-400" : "text-slate-600")}>
                      {p.category || p.category_name || source}
                    </td>

                    {getMetricColumns().map((field) => renderMetricCell(p, field))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Free Tier Blur Overlay */}
          {isFreeTier && (
            <div className="absolute inset-x-0 bottom-0 top-[275px] flex items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent z-10 px-4 pt-10 pb-6 pointer-events-auto">
              <div className={cn(
                "relative w-full max-w-md mx-auto p-6 rounded-2xl border text-center shadow-2xl backdrop-blur-xl space-y-3 transition-all",
                isDark
                  ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/80"
                  : "bg-white/95 border-slate-200/90 text-slate-800 shadow-slate-200/80"
              )}>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mx-auto">
                  <Lock className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                    ⚡ Complete Catalog Access
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Unlock All 500 Top-Selling Products
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Pages 2 to 50 contain all remaining products with exact sales volumes, reviews, and pricing.
                  </p>
                </div>

                <div className="pt-1">
                  <Button
                    onClick={() => triggerUpgrade("Unlock all 500 top-selling products across all 50 pages.")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade to Unlock All 50 Pages
                  </Button>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Instant activation • Exact sales volumes • Complete Top 500 catalog
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-3 mt-6">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={cn(
            "border transition-colors",
            isDark 
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
          )}
          data-track-id="sales_prev_page_btn"
        >
          {t('sales.previous', 'Previous')}
        </Button>

        <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
          {t('sales.page', 'Page')} {currentPage} {t('sales.of', 'of')} {totalPages}
          {isFreeTier && " (Free Preview)"}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!isFreeTier && (currentPage === totalPages || loading)}
          className={cn(
            "border transition-colors",
            isDark 
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
          )}
          data-track-id="sales_next_page_btn"
        >
          {isFreeTier && <Lock className="w-3.5 h-3.5 mr-1 text-amber-500 inline" />}
          {t('sales.next', 'Next')}
        </Button>
      </div>

      {/* Product Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className={cn("max-w-2xl max-h-[85vh] overflow-y-auto", isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white text-slate-800")}>
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      {selectedProduct.category || selectedProduct.category_name || source}
                    </span>
                    {selectedProduct.brand && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {selectedProduct.brand}
                      </span>
                    )}
                    {(selectedProduct.pid || selectedProduct.asin) && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {isFreeTier
                          ? (source === "flipkart" ? "PID: 🔒 Locked" : "ASIN: 🔒 Locked")
                          : (source === "flipkart" ? `PID: ${selectedProduct.pid}` : `ASIN: ${selectedProduct.asin}`)}
                      </span>
                    )}
                  </div>
                </div>
                <DialogTitle className="text-lg font-bold mt-2 text-left">
                  {selectedProduct.title || selectedProduct.product_title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-left">
                  {selectedProduct.brand ? `Brand: ${selectedProduct.brand}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-3">
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Price</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-450 mt-1">
                      ₹{getProductPrice(selectedProduct).toFixed(2)}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Rating</div>
                    <div className="text-base font-bold text-yellow-500 mt-1">
                      ★ {(selectedProduct.rating ?? selectedProduct.avg_rating ?? selectedProduct.product_star_rating_numeric ?? selectedProduct.product_star_rating ?? 0).toFixed(1)}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Reviews</div>
                    <div className="text-base font-bold text-blue-500 mt-1">
                      {(selectedProduct.reviews ?? selectedProduct.total_reviews ?? selectedProduct.total_ratings ?? selectedProduct.product_num_ratings ?? selectedProduct.product_rating_count ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Sales</div>
                    <div className="text-base font-bold text-purple-500 mt-1">
                      {isFreeTier ? (
                        <span className="filter blur-[4px] select-none opacity-70 inline-block" title="Upgrade to reveal exact sales count">
                          {formatSalesDisplay(selectedProduct)}
                        </span>
                      ) : (
                        formatSalesDisplay(selectedProduct)
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle / Description */}
                {(selectedProduct.description || selectedProduct.product_subtitle) && (
                  <div className={cn("p-3.5 rounded-xl border", isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Subtitle & Variant</div>
                    <p className="text-sm font-medium leading-relaxed">
                      {selectedProduct.description || selectedProduct.product_subtitle}
                    </p>
                  </div>
                )}

                {/* Highlights / Features List */}
                {getHighlightsArray(selectedProduct.highlights).length > 0 && (
                  <div className={cn("p-3.5 rounded-xl border", isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Highlights & Features</div>
                    <ul className="space-y-1.5 list-disc list-inside text-sm font-medium">
                      {getHighlightsArray(selectedProduct.highlights).map((h, i) => (
                        <li key={i} className="leading-snug text-slate-600 dark:text-slate-300">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {selectedProduct.product_url && (
                  <div className="flex justify-end pt-2">
                    {isFreeTier ? (
                      <Button
                        onClick={() => triggerUpgrade("Unlock direct marketplace listing links and ASIN tracking by upgrading.")}
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1.5"
                      >
                        <Lock className="w-4 h-4" />
                        Unlock Direct {source === "flipkart" ? "Flipkart" : "Amazon"} Link
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="default"
                        className="bg-blue-500 text-white hover:bg-blue-600 font-medium"
                      >
                        <a href={selectedProduct.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                          Open on {source === "flipkart" ? "Flipkart" : "Amazon"}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal for Free Tier Users */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className={cn("max-w-md p-6 rounded-2xl border shadow-2xl", isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800")}>
          <DialogHeader className="text-center space-y-2.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center tracking-tight">
              Unlock Top 500 Products
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto leading-relaxed">
              {upgradeTriggerReason || "Access all 500 top-selling products, exact sales volumes, and sorting."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3">
            {[
              "Complete Top 500 product list across all 50 pages",
              "Exact sales volume unblurred for every product",
              "Reveal Rank #1 product title, " + (source === "flipkart" ? "PID" : "ASIN") + ", and store link",
              "Sort by Reviews, Price, and Rating plus search"
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-colors",
                  isDark ? "bg-slate-800/40 border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200/80 text-slate-700"
                )}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={() => {
                setShowUpgradeModal(false);
                router.push("/subscription");
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2.5 rounded-xl shadow-md text-xs sm:text-sm active:scale-95 transition-all"
            >
              <Crown className="w-4 h-4 mr-2" />
              View Plans & Upgrade
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
    </div>
  );
}

export default function Sales() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[400px] items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p>Loading top product data...</p>
          </div>
        </div>
      }
    >
      <SalesContent />
    </Suspense>
  );
}
