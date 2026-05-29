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
import { Tag, BarChart2, Star, ChevronRight } from "lucide-react";

interface Category {
  category: string;
  total_products: number;
  avg_price: number | null;
  avg_rating: number | null;
  total_reviews: number;
  source: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableFilter, setTableFilter] = useState<"flipkart" | "amazon" | "all">(
    "all"
  );
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/analytics/category`)
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Failed to fetch category data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p>Loading categories...</p>
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
    if (tableFilter === "all") return true;
    return cat.source === tableFilter;
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4 shadow-inner">
          <Tag className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
          Product Categories
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Explore top-performing categories and jump directly to their
          product lists.
        </p>
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-4">
        <label className="font-medium text-slate-700">Filter by Table:</label>
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value as any)}
          className="border border-slate-300 rounded-md px-2 py-1 bg-white"
          data-track-id="table_filter_select"
          data-filter-value={tableFilter}
        >
          <option value="all">All</option>
          <option value="flipkart">Flipkart</option>
          <option value="amazon">Amazon</option>
        </select>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat, index) => (
          <Card
            key={index}
            className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <CardHeader className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-50 rounded-xl flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                {cat.category}
              </CardTitle>
              <CardDescription className="text-slate-500">
                {cat.total_products.toLocaleString()} products
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 font-semibold">
                  ₹{cat.avg_price ? cat.avg_price.toFixed(2) : "N/A"} avg. price
                </span>
                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                  <Star className="h-4 w-4" /> {cat.avg_rating?.toFixed(1) ?? "N/A"}
                </span>
              </div>
              <div className="text-slate-500 text-sm">
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
                className="flex items-center justify-center mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg py-2 hover:from-blue-600 hover:to-cyan-600 shadow-md transition-all"
              >
                View Products <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
