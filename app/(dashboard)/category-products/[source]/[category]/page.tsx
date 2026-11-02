"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useRouter, useParams } from "next/navigation";

import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star, Menu, Search, X, Lock, Crown, Sparkles, CheckCircle2 } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { getCategoryIconComponent, cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";
import { analytics } from "@/lib/analytics";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";

interface Product {
  product_name: string;
  avg_price: number;
  min_price?: number | null;
  max_price?: number | null;
  total_reviews: number;
  avg_rating: number;
  source: string;
}

export default function CategoryProducts() {
  const { t } = useTranslation();
  const params = useParams();
  const source = params?.source;
  const category = params?.category;
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const CategoryIcon = getCategoryIconComponent(
    decodeURIComponent((category as string) || "")
  );

  const [products, setProducts] = useState<Product[]>([]);
  const { toggle } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [fromDashboard, setFromDashboard] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  const { currentTier } = useSubscriptionLimits();
  const isFreeTier = currentTier === "free";
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTriggerReason, setUpgradeTriggerReason] = useState<string>("");

  const triggerUpgrade = (reason: string) => {
    setUpgradeTriggerReason(reason);
    setShowUpgradeModal(true);
    analytics.track("upgrade_prompt_viewed", {
      feature: "category_products",
      reason,
      tier: currentTier,
    });
  };

  const lastTrackedQueryRef = useRef<string>("");
  const searchQueryRef = useRef<string>("");
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  // Track search when user leaves the page or closes tab before 400ms debounce fires
  useEffect(() => {
    const handlePageLeave = () => {
      const q = searchQueryRef.current.trim();
      if (q.length >= 2 && q !== lastTrackedQueryRef.current) {
        analytics.track("product_search", {
          query: q,
          filter_value: q,
          track_id: "category_product_search_input",
          category: decodeURIComponent((category as string) || ""),
          source: (source as string) || "",
          page: "category_products",
          trigger: "page_leave_or_close",
        });
        lastTrackedQueryRef.current = q;
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
  }, [category, source]);

  // Debounce searchQuery by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Check if coming from dashboard
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get("from");
      const pageParam = urlParams.get("page");

      setFromDashboard(fromParam === "dashboard");
      if (pageParam) {
        setPage(parseInt(pageParam));
      }

      console.log("=== CATEGORY PRODUCTS PAGE LOADED ===");
      console.log("from param:", fromParam);
      console.log("fromDashboard:", fromParam === "dashboard");
      console.log("page:", pageParam);
      console.log("=====================================");
    }
  }, []);

  useEffect(() => {
    if (!source || !category) return;

    const decodedCategory = decodeURIComponent((category as string).trim());
    setLoading(true);

    const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";

    axios
      .get(
        `${API_BASE_URL}/category/products/${encodeURIComponent(
          decodedCategory
        )}?source=${source}&limit=${limit}&offset=${(page - 1) * limit}${searchParam}`
      )
      .then((res) => {
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
        const count = typeof res.data.total_count === "number" ? res.data.total_count : (Array.isArray(res.data.products) ? res.data.products.length : 0);
        if (typeof res.data.total_count === "number") {
          setTotalCount(res.data.total_count);
        }

        // Track what user searched and the results returned
        if (debouncedSearch && debouncedSearch.trim().length >= 2 && debouncedSearch.trim() !== lastTrackedQueryRef.current) {
          const q = debouncedSearch.trim();
          const fetchedProducts = Array.isArray(res.data.products) ? res.data.products : [];
          const topResults = fetchedProducts.slice(0, 3).map((p: Product) => p.product_name).filter(Boolean);

          analytics.track("product_search", {
            query: q,
            filter_value: q,
            track_id: "category_product_search_input",
            results_count: count,
            has_results: count > 0,
            top_results: topResults,
            category: decodedCategory,
            source: (source as string) || "",
            page: "category_products",
            trigger: "debounce",
          });
          lastTrackedQueryRef.current = q;
        } else if (!debouncedSearch) {
          lastTrackedQueryRef.current = "";
        }
      })
      .catch(() => setError("Failed to fetch products"))
      .finally(() => setLoading(false));
  }, [source, category, page, debouncedSearch]);

  const handleBackClick = () => {
    console.log("=== BACK BUTTON CLICKED ===");
    console.log("fromDashboard:", fromDashboard);

    // ✅ Direct window check as backup
    const currentURL = new URLSearchParams(window.location.search);
    const fromParam = currentURL.get("from");
    console.log("Direct URL check - from param:", fromParam);

    // Priority: If from dashboard, go back to dashboard
    if (fromDashboard || fromParam === "dashboard") {
      console.log("✅ Redirecting to Dashboard (/dashboard)");
      window.location.href = "/dashboard";
    } else {
      console.log("Redirecting to Categories page");
      router.push("/categories");
    }

    console.log("===========================");
  };

  const isDark = mounted && resolvedTheme === "dark";
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const handlePageChange = (newPage: number) => {
    if (isFreeTier && newPage > 1) {
      triggerUpgrade(
        `Pages 2 to ${totalPages} contain all remaining products in ${decodeURIComponent((category as string) || "")}. Upgrade to browse the complete category catalog.`
      );
      return;
    }
    setPage(newPage);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Sticky Header */}
      <header className="bg-background border border-sky-100 shadow-lg rounded-2xl px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors">
            <Menu className="w-5 h-5 text-sky-900" />
          </button>
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800 transition text-sm font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            {t('catProd.back', 'Back')}
          </button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 capitalize">
              {decodeURIComponent((category as string) || "")} —{" "}
              <span className="text-blue-600">{source}</span>
            </h2>
            {isFreeTier && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                <span>Free Preview • 4 Unlocked</span>
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('catProd.exploreTop', 'Explore top products in this category')}
        </p>
      </header>

      {/* Hero Section */}
      <div className="text-left space-y-1">
        <h1 className="page-title capitalize">
          {t('catProd.productsIn', 'Products in')} {decodeURIComponent((category as string) || "")}
        </h1>
        <p className="page-subtitle">
          {t('catProd.browseProducts', 'Browse {{source}} products with ratings, reviews, and prices.', { source })}
        </p>
      </div>

      {/* Search Bar Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="relative w-full sm:w-80">
          <SmartSearchInput
            value={isFreeTier ? "" : searchQuery}
            onChange={isFreeTier ? () => {} : setSearchQuery}
            placeholder={t('catProd.searchPlaceholder', 'Search products...')}
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
              onClick={() => triggerUpgrade(`Category Keyword Search requires an upgraded plan. Upgrade to search all products in ${decodeURIComponent((category as string) || "")}.`)}
              className="absolute inset-y-0 right-0 z-10 cursor-pointer flex items-center pr-3 rounded-md"
              title="Upgrade to search products"
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-xs">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </div>
          )}
        </div>
        {debouncedSearch && !isFreeTier && (
          <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
            Showing results for &ldquo;<span className="font-semibold text-slate-700 dark:text-slate-200">{debouncedSearch}</span>&rdquo;
          </div>
        )}
      </div>

      {/* Loading & Error */}
      {loading ? (
        <div className="text-center text-slate-400 py-20 text-lg">
          {t('catProd.loading', 'Loading products...')}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-20 text-lg">{error}</div>
      ) : products.length === 0 ? (
        <div className={cn(
          "text-center py-20 border rounded-2xl border-dashed",
          isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-450"
        )}>
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30 text-blue-500" />
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {debouncedSearch ? "No matching products found" : "No products found in this category"}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {debouncedSearch 
              ? `We couldn't find any products in this category matching "${debouncedSearch}".`
              : "There are no products listed in this category."
            }
          </p>
          {debouncedSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="mt-5 px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 dark:from-sky-700 dark:to-blue-700 dark:hover:from-sky-600 dark:hover:to-blue-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Product Table */}
          <Card className="bg-card border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800">
                {t('catProd.productList', 'Product List')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('catProd.showingProductsFor', 'Showing products for')} {decodeURIComponent((category as string) || "")}
                {isFreeTier && " • Free Preview (4 Unlocked)"}
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-x-auto p-0 relative">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-700 border-b">
                    <th className="py-3 px-4 text-left font-semibold">#</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      {t('catProd.productName', 'Product Name')}
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.avgPrice', 'Avg. Price')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.minPrice', 'Min Price')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.maxPrice', 'Max Price')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.rating', 'Rating')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.reviews', 'Reviews')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.source', 'Source')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => {
                    const isBlurredRow = isFreeTier && index >= 4;
                    return (
                      <tr
                        key={index}
                        onClick={() => {
                          if (isBlurredRow) {
                            triggerUpgrade("Unlock all products in this category with full pricing details and review counts.");
                          }
                        }}
                        className={cn(
                          "border-b transition-all",
                          isBlurredRow
                            ? "filter blur-[3.5px] select-none opacity-40 hover:opacity-50 cursor-pointer"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <td className="py-3 px-4">{(page - 1) * limit + index + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-md">
                          {isBlurredRow ? (
                            <span className="text-slate-700 select-none">
                              {p.product_name}
                            </span>
                          ) : (
                            <span
                              onClick={() =>
                                router.push(
                                  `/product/${encodeURIComponent(p.product_name)}?source=${source}&category=${category}&page=${page}`
                                )
                              }
                              data-track-id="category_product_row"
                              data-filter-value={p.product_name}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer underline-offset-2 hover:underline transition"
                            >
                              {p.product_name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">
                          ₹{p.avg_price?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-blue-600 font-semibold">
                          {p.min_price ? `₹${p.min_price.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-red-600 font-semibold">
                          {p.max_price ? `₹${p.max_price.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-yellow-500 font-medium flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {p.avg_rating?.toFixed(1) ?? "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {p.total_reviews.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-700">{p.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Free Tier Blur Overlay */}
              {isFreeTier && (
                <div className="absolute inset-x-0 bottom-0 top-[260px] flex items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent z-10 px-4 pt-10 pb-6 pointer-events-auto">
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
                        ⚡ Category Intelligence
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Unlock All Products in {decodeURIComponent((category as string) || "")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                        Browse all remaining products in this category with full pricing details, ratings, and reviews.
                      </p>
                    </div>

                    <div className="pt-1">
                      <Button
                        onClick={() => triggerUpgrade("Unlock all products in this category with full pricing details and review counts.")}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Upgrade to Unlock Complete Category
                      </Button>
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Instant activation • Full pricing & reviews • Unlimited catalog access
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8 pb-10">
            <button
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
              {isFreeTier && " (Free Preview)"}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!isFreeTier && page >= totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              {isFreeTier && <Lock className="w-3.5 h-3.5 text-amber-300" />}
              Next
            </button>
          </div>
        </>
      )}

      {/* Upgrade Modal for Free Tier Users */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className={cn("max-w-md p-6 rounded-2xl border shadow-2xl", isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800")}>
          <DialogHeader className="text-center space-y-2.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center tracking-tight">
              Unlock Full Category Intelligence
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto leading-relaxed">
              {upgradeTriggerReason || "Access all products, pricing, and reviews in this category."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3">
            {[
              "Complete catalog access for " + decodeURIComponent((category as string) || ""),
              "Unlimited product search across this category",
              "Full pricing details (Min, Max, Avg) and review metrics"
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