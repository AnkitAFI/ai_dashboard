"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, IndianRupee, ArrowUpDown, TrendingUp, Search, X, Filter, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";

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

export default function Sales() {
  const { t } = useTranslation();
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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TrendingProduct | null>(null);

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
  }, []);

  // Fetch categories & reset selection when source changes
  useEffect(() => {
    setSelectedCategory("All Categories");
    setCurrentPage(1);
    fetchCategories();
  }, [source]);

  // Re-fetch products when source or selected category changes
  useEffect(() => {
    fetchData();
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

  const fetchCategories = () => {
    setCategoriesLoading(true);
    const url =
      source === "flipkart"
        ? `${API_BASE_URL}/rapidapi_flipkart_products/categories`
        : `${API_BASE_URL}/rapidapi_amazon_products/categories`;

    axios
      .get(url)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const names = data
          .map((c: { category_name?: string; category?: string }) => c.category_name || c.category || "")
          .filter((name: string) => name.trim() !== "");
        setCategories(names);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  };

  const fetchData = () => {
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
          ? "bg-blue-950/20 font-bold"
          : "bg-blue-50/50 font-bold"
        : ""
    );

    switch (field) {
      case "price":
        return (
          <td key={field} className={cn(baseCellClass, "text-emerald-600 dark:text-emerald-450 font-semibold")}>
            <IndianRupee className="inline w-4 h-4" />
            {getProductPrice(p).toFixed(2)}
          </td>
        );
      case "rating":
        return (
          <td key={field} className={cn(baseCellClass, "text-yellow-500 font-medium")}>
            <Star className="inline w-4 h-4 mr-1" />
            {(p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0).toFixed(1)}
          </td>
        );
      case "reviews":
        return (
          <td key={field} className={cn(baseCellClass, isDark ? "text-blue-400 font-semibold" : "text-blue-600 font-semibold")}>
            {(p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0).toLocaleString()}
          </td>
        );
      case "sales":
        return (
          <td key={field} className={cn(baseCellClass, isDark ? "text-purple-400 font-semibold" : "text-purple-600 font-semibold")}>
            <TrendingUp className="inline w-4 h-4 mr-1" />
            {formatSalesDisplay(p)}
          </td>
        );
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
            Top {products.length} Selling Products ({source})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('sales.subtitle', 'Analyze and sort by sales, reviews, price, or rating for data-driven decisions.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
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

          <div className="relative">
            <Filter className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
              isDark ? "text-slate-400" : "text-slate-500"
            )} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              disabled={categoriesLoading}
              className={cn(
                "border pl-8 pr-3 py-2 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[220px] truncate",
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                categoriesLoading && "opacity-50 cursor-wait"
              )}
              data-track-id="sales_category_select"
              data-filter-value={selectedCategory}
            >
              <option value="All Categories" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                All Categories
              </option>
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar & Sort Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="relative w-full sm:w-80">
          <SmartSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('sales.searchPlaceholder', 'Search products...')}
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
              {t(`sales.sort_${field}`, field.charAt(0).toUpperCase() + field.slice(1))}
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
            {t('sales.showingPage', 'Showing Page')} {currentPage} {t('sales.of', 'of')} {totalPages} — {t('sales.sortedBy', 'Sorted by')}{" "}
            {t(`sales.sort_${sortField}`, sortField.charAt(0).toUpperCase() + sortField.slice(1))}{" "}
            ({sortOrder === "asc" ? t('sales.lowToHigh', 'Low → High') : t('sales.highToLow', 'High → Low')})
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
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>{t('sales.product', 'Product')}</th>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200")}>{t('sales.category', 'Category')}</th>
                {getMetricColumns().map((field) => {
                  const isSorted = sortField === field;
                  return (
                    <th
                      key={field}
                      onClick={() => toggleSort(field)}
                      className={cn(
                        "py-3 px-4 text-right border-b cursor-pointer select-none transition-colors",
                        isSorted
                          ? isDark
                            ? "bg-blue-950/40 text-blue-400 font-bold border-blue-500/40"
                            : "bg-blue-50 text-blue-700 font-bold border-blue-300"
                          : isDark
                            ? "bg-slate-800/80 border-slate-700 hover:bg-slate-750"
                            : "bg-slate-100 border-slate-200 hover:bg-slate-200/70"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{getMetricLabel(field)}</span>
                        {isSorted && (
                          <span className="text-xs font-extrabold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((p, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedProduct(p)}
                  className={cn(
                    "border-b transition-colors cursor-pointer",
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

                  <td className="py-3 px-4 max-w-md">
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          "font-semibold line-clamp-2 transition-colors hover:text-blue-500",
                          isDark ? "text-slate-100" : "text-slate-800"
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
                            {source === "flipkart" ? `PID: ${p.pid}` : `ASIN: ${p.asin}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className={cn("py-3 px-4", isDark ? "text-slate-400" : "text-slate-600")}>
                    {p.category || p.category_name || source}
                  </td>

                  {getMetricColumns().map((field) => renderMetricCell(p, field))}
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
          {t('sales.previous', 'Previous')}
        </Button>

        <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
          {t('sales.page', 'Page')} {currentPage} {t('sales.of', 'of')} {totalPages}
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
                        {source === "flipkart" ? `PID: ${selectedProduct.pid}` : `ASIN: ${selectedProduct.asin}`}
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
                      {formatSalesDisplay(selectedProduct)}
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
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}