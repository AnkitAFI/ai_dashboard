"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tag, Star, ChevronRight, Search, X } from "lucide-react";
import { getCategoryIconComponent, cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

interface Category {
  category: string;
  total_products: number;
  avg_price: number | null;
  avg_rating: number | null;
  total_reviews: number;
  source: string;
}

export default function Categories() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableFilter, setTableFilter] = useState<"flipkart" | "amazon" | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    axios
      .get(`${API_BASE_URL}/analytics/category`)
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Failed to fetch category data"))
      .finally(() => setLoading(false));
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p>{t('categories.loading', 'Loading categories...')}</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        {error}
      </div>
    );

  const filteredCategories = categories.filter((cat) => {
    const matchesFilter = tableFilter === "all" || cat.source === tableFilter;
    const matchesSearch = cat.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Hero Section */}
      <div className="text-left space-y-1">
        <h1 className="page-title">
          {t('categories.title', 'Product Categories')}
        </h1>
        <p className="page-subtitle">
          {t('categories.subtitle', 'Explore top-performing categories and jump directly to their product lists.')}
        </p>
      </div>

      {/* Search and Filters Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          <label className={cn("font-semibold text-sm tracking-wide", isDark ? "text-slate-300" : "text-slate-700")}>{t('categories.marketplace', 'Marketplace:')}</label>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value as any)}
            className={cn(
              "border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer",
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-100" 
                : "border-slate-200 bg-white text-slate-800 shadow-sm"
            )}
            data-track-id="table_filter_select"
            data-filter-value={tableFilter}
          >
            <option value="all" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>{t('categories.allMarketplaces', 'All Marketplaces')}</option>
            <option value="flipkart" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Flipkart India</option>
            <option value="amazon" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Amazon India</option>
          </select>
        </div>

        {/* Category Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={t('categories.searchPlaceholder', 'Search categories...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-10 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium",
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500" 
                : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
            )}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Cards */}
      {filteredCategories.length === 0 ? (
        <div className={cn(
          "text-center py-16 border rounded-2xl border-dashed",
          isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
        )}>
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-30 text-blue-500" />
          <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{t('categories.notFound', 'No categories found')}</p>
          <p className="text-sm opacity-80 mt-1">{t('categories.resetQuery', 'Try resetting your search query or marketplace filter.')}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 dark:from-sky-700 dark:to-blue-700 dark:hover:from-sky-600 dark:hover:to-blue-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, index) => {
            const CategoryIcon = getCategoryIconComponent(cat.category);
            return (
              <Card
                key={index}
                className={cn(
                  "relative rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border bg-card",
                  isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200"
                )}
              >
                {/* Marketplace Badge */}
                {cat.source === "flipkart" ? (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800/80 text-blue-600 dark:text-sky-300/80 border border-blue-200 dark:border-slate-700/80 tracking-wide">
                    Flipkart
                  </span>
                ) : cat.source === "amazon" ? (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-slate-800/80 text-orange-600 dark:text-amber-300/80 border border-orange-200 dark:border-slate-700/80 tracking-wide">
                    Amazon
                  </span>
                ) : null}

                <CardHeader className="flex flex-col items-center text-center space-y-2">
                  <div className="w-11 h-11 bg-gradient-to-br from-cyan-100 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl flex items-center justify-center border border-transparent dark:border-slate-700/50">
                    <CategoryIcon className="h-5 w-5 text-blue-600 dark:text-sky-400/80" />
                  </div>
                  <CardTitle className={cn("text-base font-bold", isDark ? "text-slate-100" : "text-slate-800")}>
                    {cat.category}
                  </CardTitle>
                  <CardDescription className={isDark ? "text-slate-400" : "text-slate-500"}>
                    {cat.total_products.toLocaleString()} products
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-2.5 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400/80 font-medium">
                      ₹{cat.avg_price ? cat.avg_price.toFixed(2) : "N/A"}{" "}
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">avg. price</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Star className="h-3.5 w-3.5 text-amber-400/80" /> {cat.avg_rating?.toFixed(1) ?? "N/A"}
                    </span>
                  </div>
                  <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                    Total Reviews: {cat.total_reviews?.toLocaleString() ?? 0}
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/category-products/${cat.source}/${encodeURIComponent(
                          cat.category
                        )}`
                      )
                    }
                    data-track-id="view_products_btn"
                    data-filter-value={cat.category}
                    className="flex items-center justify-center mt-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:border dark:border-slate-700/80 text-white dark:text-sky-300 rounded-xl py-2 shadow-xs transition-all font-semibold text-xs cursor-pointer"
                  >
                    View Products <ChevronRight className="ml-1.5 h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

