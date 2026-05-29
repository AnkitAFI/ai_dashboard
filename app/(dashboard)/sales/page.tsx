"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, IndianRupee, ArrowUpDown, TrendingUp } from "lucide-react";

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
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [source, setSource] = useState<"flipkart" | "amazon">("flipkart");
  const [sortField, setSortField] = useState<"reviews" | "price" | "rating" | "sales">("sales");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [source]);

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

  const sortedProducts = [...products].sort((a, b) => {
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
    <div className="space-y-8">
      {/* Filters/Source Select */}
      <div className="flex justify-end">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as "flipkart" | "amazon")}
          className="border border-slate-300 bg-white px-3 py-2 rounded-md text-slate-700 font-medium shadow-sm hover:bg-slate-50"
          data-track-id="sales_source_select"
          data-filter-value={source}
        >
          <option value="flipkart">Flipkart</option>
          <option value="amazon">Amazon</option>
        </select>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
          Product Performance Overview ({source})
        </h1>
        <p className="text-slate-500 text-lg">
          Analyze and sort by sales, reviews, price, or rating for data-driven decisions.
        </p>
      </div>

      <div className="flex justify-end gap-3 flex-wrap">
        {["sales", "reviews", "price", "rating"].map((field) => (
          <Button
            key={field}
            variant={sortField === field ? "default" : "outline"}
            className={`flex items-center gap-2 ${sortField === field
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
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

      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-700">
            Showing Page {currentPage} of {totalPages} — Sorted by{" "}
            {sortField.charAt(0).toUpperCase() + sortField.slice(1)}{" "}
            ({sortOrder === "asc" ? "Low → High" : "High → Low"})
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-right">Price (₹)</th>
                <th className="py-3 px-4 text-right">Rating</th>
                <th className="py-3 px-4 text-right">Reviews</th>
                <th className="py-3 px-4 text-right">Sales</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-200 hover:bg-gradient-to-r hover:from-[#E0F2FE] hover:to-[#F0F9FF] transition-colors"
                  data-track-id="sales_product_row"
                  data-filter-value={p.title || p.product_title}
                >
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800 truncate max-w-xs">
                    {p.title || p.product_title}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {p.category || p.category_name || source}
                  </td>

                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                    <IndianRupee className="inline w-4 h-4" />
                    {(p.price ?? p.avg_price ?? 0).toFixed(2)}
                  </td>

                  <td className="py-3 px-4 text-right text-yellow-500 font-medium">
                    <Star className="inline w-4 h-4 mr-1" />
                    {(p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0).toFixed(1)}
                  </td>

                  <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                    {(p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right text-purple-600 font-semibold">
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
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
          data-track-id="sales_prev_page_btn"
        >
          Previous
        </Button>

        <span className="text-slate-600 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
          data-track-id="sales_next_page_btn"
        >
          Next
        </Button>
      </div>
    </div>
  );
}