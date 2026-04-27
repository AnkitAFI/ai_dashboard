"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ShoppingCart, Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/dashboard/filters-context";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, color, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="metric-card bg-card rounded-xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-lg", color)}>
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </Card>
    );
  }

  return (
    <Card className="metric-card bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-lg", color)}>{icon}</div>
        <Badge variant="secondary" className="ai-badge text-xs">
          Live
        </Badge>
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </Card>
  );
}

export default function MetricsCards({ selectedSource }: { selectedSource: string }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { filters } = useFilters();

  const [flipkartStats, setFlipkartStats] = useState<any>(null);
  const [amazonStats, setAmazonStats] = useState<any>(null);
  const [flipkartCategories, setFlipkartCategories] = useState<any[]>([]);
  const [amazonCategories, setAmazonCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All Categories") params.append("category", filters.category);
    if (filters.priceRange[0] > 0) params.append("min_price", filters.priceRange[0].toString());
    if (filters.priceRange[1] < 5000000) params.append("max_price", filters.priceRange[1].toString());
    if (filters.rating > 0) params.append("min_rating", filters.rating.toString());
    if (filters.dateRange !== "all") params.append("date_range", filters.dateRange);
    if (filters.showTrendingOnly) params.append("trending_only", "true");
    return params.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const queryParams = buildQueryParams();

        if (table === "both") {
          const [flipkartStatsRes, amazonStatsRes, flipkartCatRes, amazonCatRes] = await Promise.all([
            fetch(`${BASE_URL}/analytics-summary?source=flipkart&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/analytics-summary?source=amazon&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/flipkart/categories?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`, { cache: 'no-store' }),
          ]);
          const [fStats, aStats, fCat, aCat] = await Promise.all([
            flipkartStatsRes.json(), amazonStatsRes.json(), flipkartCatRes.json(), amazonCatRes.json()
          ]);
          setFlipkartStats(fStats);
          setAmazonStats(aStats);
          setFlipkartCategories(Array.isArray(fCat) ? fCat : (fCat?.data || []));
          setAmazonCategories(Array.isArray(aCat) ? aCat : (aCat?.data || []));
        } else if (table === "amazon") {
          const [statsRes, catsRes] = await Promise.all([
            fetch(`${BASE_URL}/analytics-summary?source=amazon&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`, { cache: 'no-store' }),
          ]);
          const [aStats, aCat] = await Promise.all([statsRes.json(), catsRes.json()]);
          setAmazonStats(aStats);
          setAmazonCategories(Array.isArray(aCat) ? aCat : (aCat?.data || []));
          setFlipkartStats(null);
          setFlipkartCategories([]);
        } else {
          const [statsRes, catsRes] = await Promise.all([
            fetch(`${BASE_URL}/analytics-summary?source=flipkart&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/flipkart/categories?${queryParams}`, { cache: 'no-store' }),
          ]);
          const [fStats, fCat] = await Promise.all([statsRes.json(), catsRes.json()]);
          setFlipkartStats(fStats);
          setFlipkartCategories(Array.isArray(fCat) ? fCat : (fCat?.data || []));
          setAmazonStats(null);
          setAmazonCategories([]);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedSource, filters, BASE_URL]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const table = filters.table || selectedSource;
  const showBoth = table === "both";
  const isAmazon = table === "amazon";

  let totalReviews = 0;
  let avgRating = 0;
  let totalProducts = 0;
  let totalCategories = 0;

  if (showBoth) {
    totalReviews = (flipkartStats?.total_reviews || 0) + (amazonStats?.total_reviews || 0);
    const flipkartTotal = flipkartStats?.total_reviews || 0;
    const amazonTotal = amazonStats?.total_reviews || 0;
    const flipkartRating = flipkartStats?.avg_rating || 0;
    const amazonRating = amazonStats?.avg_rating || amazonStats?.average_rating || 0;
    if (totalReviews > 0) {
      avgRating = ((flipkartRating * flipkartTotal) + (amazonRating * amazonTotal)) / totalReviews;
    }
    totalProducts = (flipkartStats?.total_products || 0) + (amazonStats?.total_products || 0);
    totalCategories = (Array.isArray(flipkartCategories) ? flipkartCategories.length : 0) + (Array.isArray(amazonCategories) ? amazonCategories.length : 0);
  } else if (isAmazon) {
    totalReviews = amazonStats?.total_reviews || 0;
    avgRating = amazonStats?.avg_rating || amazonStats?.average_rating || 0;
    totalProducts = amazonStats?.total_products || 0;
    totalCategories = Array.isArray(amazonCategories) ? amazonCategories.length : 0;
  } else {
    totalReviews = flipkartStats?.total_reviews || 0;
    avgRating = flipkartStats?.avg_rating || 0;
    totalProducts = flipkartStats?.total_products || 0;
    totalCategories = Array.isArray(flipkartCategories) ? flipkartCategories.length : 0;
  }

  const cards = [
    { title: showBoth ? "Total Reviews (Both)" : isAmazon ? "Total Reviews (Amazon)" : "Total Reviews (Flipkart)", value: formatNumber(totalReviews), icon: <MessageSquare className="text-blue-600 h-6 w-6" />, color: "bg-blue-100" },
    { title: showBoth ? "Average Rating (Both)" : isAmazon ? "Average Rating (Amazon)" : "Average Rating (Flipkart)", value: avgRating ? avgRating.toFixed(2) : "0.0", icon: <Star className="text-yellow-600 h-6 w-6" />, color: "bg-yellow-100" },
    { title: showBoth ? "Products (Both)" : isAmazon ? "Products (Amazon)" : "Products (Flipkart)", value: totalProducts.toString(), icon: <ShoppingCart className="text-green-600 h-6 w-6" />, color: "bg-green-100" },
    { title: showBoth ? "Categories (Both)" : isAmazon ? "Categories (Amazon)" : "Categories (Flipkart)", value: totalCategories.toString(), icon: <TrendingUp className="text-purple-600 h-6 w-6" />, color: "bg-purple-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <MetricCard key={index} title={card.title} value={card.value} icon={card.icon} color={card.color} isLoading={isLoading} />
      ))}
    </div>
  );
}
