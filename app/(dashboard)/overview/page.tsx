"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, DollarSign, Star, ShoppingBag } from "lucide-react";

interface Summary {
  total_products: number;
  avg_price: number;
  avg_rating: number;
  total_reviews: number;
}

export default function Overview() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [source, setSource] = useState<"flipkart" | "amazon" | "all">("flipkart");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSummary = async (selectedSource: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/analytics-summary?source=${selectedSource}`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(source);
  }, [source]);

  return (
    <div className="space-y-6">
      {/* Filters/Source Select */}
      <div className="flex justify-end">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as "flipkart" | "amazon" | "all")}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary"
        >
          <option value="flipkart">Flipkart India</option>
          <option value="amazon">Amazon India</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Loading State */}
      {loading || !summary ? (
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p>Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Hero Section */}
          <div className="text-left space-y-2">
            <h1 className="page-title">Performance Overview</h1>
            <p className="page-subtitle max-w-2xl">
              Get a snapshot of your store’s performance with total products, pricing,
              ratings, and reviews — all updated in real-time.
            </p>
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border shadow-sm p-2">
              <CardHeader className="flex flex-col items-start">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="card-label">
                  Total Products
                </CardTitle>
                <div className="card-metric text-blue-600 dark:text-blue-400 mt-2">
                  {summary.total_products?.toLocaleString() ?? "—"}
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-card border shadow-sm p-2">
              <CardHeader className="flex flex-col items-start">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="card-label">
                  Average Price
                </CardTitle>
                <div className="card-metric text-emerald-600 dark:text-emerald-400 mt-2">
                  ₹{summary.avg_price ? summary.avg_price.toFixed(2) : "—"}
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-card border shadow-sm p-2">
              <CardHeader className="flex flex-col items-start">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="card-label">
                  Average Rating
                </CardTitle>
                <div className="card-metric text-amber-600 dark:text-amber-400 mt-2">
                  {summary.avg_rating ? summary.avg_rating.toFixed(2) : "—"}
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-card border shadow-sm p-2">
              <CardHeader className="flex flex-col items-start">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="card-label">
                  Total Reviews
                </CardTitle>
                <div className="card-metric text-purple-600 dark:text-purple-400 mt-2">
                  {summary.total_reviews?.toLocaleString() ?? "—"}
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* AI Insight */}
          <Card className="bg-card border shadow-sm">
            <CardContent className="p-6 text-left">
              <h2 className="section-heading mb-2">AI Insight</h2>
              <p className="table-body-text text-muted-foreground leading-relaxed">
                Your <strong className="font-semibold text-foreground">{source}</strong> store is performing steadily with an
                average rating of <strong className="font-semibold text-foreground">{summary.avg_rating.toFixed(2)}</strong> and{" "}
                <strong className="font-semibold text-foreground">{summary.total_reviews.toLocaleString()}</strong> customer reviews.
                Continue optimizing product pricing to improve average margins.
              </p>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}