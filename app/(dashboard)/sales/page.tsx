"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, IndianRupee, ArrowUpDown, TrendingUp, Search, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import SmartSearchInput from "@/components/ui/smart-search-input";

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
  product_price?: string;
}

export default function Sales() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [source, setSource] = useState<"flipkart" | "amazon">("flipkart");
  const [sortField, setSortField] = useState<"reviews" | "price" | "rating" | "sales">("sales");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce searchQuery by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [source]);

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

  const fetchData = () => {
    setLoading(true);
    const url =
      source === "flipkart"
        ? `${API_BASE_URL}/top?table=rapidapi_flipkart_products&n=500`
        : `${API_BASE_URL}/rapidapi/top-sales?limit=500`;

    axios
      .get(url)
      .then((res) => {
        const data = res.data.data || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to fetch top products"))
      .finally(() => setLoading(false));
  };

  const getFieldValue = (p: TrendingProduct, field: string) => {
    switch (field) {
      case "reviews":
        return p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0;
      case "price":
        return p.price ?? p.avg_price ?? 0;
      case "rating":
        return p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0;
      case "sales":
        return parseSalesVolume(p.sales_volume, p.avg_sales_volume);
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

  const handlePageChange = (page: number) => {
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
          <p>Loading {source} top product data...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
            Product Performance Overview ({source})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Analyze and sort by sales, reviews, price, or rating for data-driven decisions.
          </p>
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as "flipkart" | "amazon")}
          className={cn(
            "border px-3 py-2 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            isDark 
              ? "border-slate-700 bg-slate-900 text-slate-100" 
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          )}
          data-track-id="sales_source_select"
          data-filter-value={source}
        >
          <option value="flipkart" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Flipkart</option>
          <option value="amazon" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Amazon</option>
        </select>
      </div>

      {/* Search Bar & Sort Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="relative w-full sm:w-80">
          <SmartSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
            className="w-full"
            inputClassName={cn(
              "w-full text-sm font-medium",
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500" 
                : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
            )}
          />
        </div>
        <div className="flex justify-end gap-3 flex-wrap">
          {["sales", "reviews", "price", "rating"].map((field) => (
            <Button
              key={field}
              variant={sortField === field ? "default" : "outline"}
              className={cn(
                "flex items-center gap-2",
                sortField === field
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : isDark
                    ? "text-slate-300 border-slate-700 hover:bg-slate-800"
                    : "text-slate-700 border-slate-300 hover:bg-slate-100"
              )}
              onClick={() => toggleSort(field as "reviews" | "price" | "rating" | "sales")}
              data-track-id="sales_sort_btn"
              data-filter-value={field}
              disabled={loading}
            >
              <ArrowUpDown className="w-4 h-4" />
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {sortField === field ? ` (${sortOrder === "asc" ? "↑" : "↓"})` : ""}
            </Button>
          ))}
        </div>
      </div>

      <Card className={cn(
        "shadow-sm rounded-2xl overflow-hidden border",
        isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
      )}>
        <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className={cn("text-base font-semibold", isDark ? "text-slate-200" : "text-slate-700")}>
            Showing Page {currentPage} of {totalPages} — Sorted by{" "}
            {sortField.charAt(0).toUpperCase() + sortField.slice(1)}{" "}
            ({sortOrder === "asc" ? "Low → High" : "High → Low"})
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto p-0">
          <table className={cn("w-full text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
            <thead className={cn(
              "uppercase text-xs font-semibold",
              isDark ? "bg-slate-800/80 text-slate-200" : "bg-slate-100 text-slate-700"
            )}>
              <tr>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>#</th>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>Product</th>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>Category</th>
                <th className={cn("py-3 px-4 text-right border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>Price (₹)</th>
                <th className={cn("py-3 px-4 text-right border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>Rating</th>
                <th className={cn("py-3 px-4 text-right border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>Reviews</th>
                <th className={cn("py-3 px-4 text-right border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>Sales</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((p, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b transition-colors",
                    isDark 
                      ? "border-slate-800/80 hover:bg-slate-800/30" 
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                  data-track-id="sales_product_row"
                  data-filter-value={p.title || p.product_title}
                >
                  <td className={cn("py-3 px-4 font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>

                  <td className={cn("py-3 px-4 font-semibold truncate max-w-xs", isDark ? "text-slate-100" : "text-slate-800")} title={p.title || p.product_title}>
                    {p.title || p.product_title}
                  </td>

                  <td className={cn("py-3 px-4", isDark ? "text-slate-400" : "text-slate-600")}>
                    {p.category || p.category_name || source}
                  </td>

                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-450 font-semibold">
                    <IndianRupee className="inline w-4 h-4" />
                    {(p.price ?? p.avg_price ?? 0).toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-right text-yellow-500 font-medium">
                    <Star className="inline w-4 h-4 mr-1" />
                    {(p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0).toFixed(1)}
                  </td>

                  <td className={cn("py-3 px-4 text-right font-semibold", isDark ? "text-blue-400" : "text-blue-600")}>
                    {(p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0).toLocaleString()}
                  </td>

                  <td className={cn("py-3 px-4 text-right font-semibold", isDark ? "text-purple-400" : "text-purple-600")}>
                    <TrendingUp className="inline w-4 h-4 mr-1" />
                    {formatSalesDisplay(p)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          Previous
        </Button>

        <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
          Page {currentPage} of {totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={cn(
            "border transition-colors",
            isDark 
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
          )}
          data-track-id="sales_next_page_btn"
        >
          Next
        </Button>
      </div>
    </div>
  );
}