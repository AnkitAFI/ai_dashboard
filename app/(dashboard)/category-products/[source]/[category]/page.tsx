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
import { ChevronLeft, Star, Menu, Search, X } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { getCategoryIconComponent, cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";

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
        if (typeof res.data.total_count === "number") {
          setTotalCount(res.data.total_count);
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
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 capitalize">
            {decodeURIComponent((category as string) || "")} —{" "}
            <span className="text-blue-600">{source}</span>
          </h2>
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
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('catProd.searchPlaceholder', 'Search products in this category...')}
            className="w-full"
            inputClassName={cn(
              "w-full text-sm font-medium",
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500" 
                : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
            )}
          />
        </div>
        {debouncedSearch && (
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
              className="mt-5 px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition shadow-md"
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
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-x-auto p-0">
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
                  {products.map((p, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50 transition-all"
                    >
                      <td className="py-3 px-4">{(page - 1) * limit + index + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span
                          onClick={() =>
                            router.push(
                              `/product/${encodeURIComponent(p.product_name)}?source=${source}&category=${category}&page=${page}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline-offset-2 hover:underline transition"
                        >
                          {p.product_name}
                        </span>
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
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8 pb-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}