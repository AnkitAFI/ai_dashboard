"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Star, AlertCircle, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Product {
  product_title: string;
  sentiment_score: number;
  price: number;
  rating: number;
  review_count: number;
  category: string;
  image_url?: string;
  brand?: string;
}

interface ApiResponse {
  success: boolean;
  sentiment: string;
  source: string;
  page: number;
  limit: number;
  total_products: number;
  total_pages: number;
  count: number;
  data: Product[];
}

export default function SentimentProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage] = useState(24);

  const source = (params?.source as string) || "flipkart";
  const sentiment = (params?.sentiment as string) || "positive";
  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com");

  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const categoryFilter = urlParams.get('category');
  const minPriceFilter = urlParams.get('min_price');
  const maxPriceFilter = urlParams.get('max_price');
  const minRatingFilter = urlParams.get('min_rating');
  const dateRangeFilter = urlParams.get('date_range');
  const trendingOnlyFilter = urlParams.get('trending_only');
  const sortByFilter = urlParams.get('sort_by');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const table = source === "flipkart"
          ? "rapidapi_flipkart_products"
          : "rapidapi_amazon_products";

        const queryParams = new URLSearchParams({
          table,
          sentiment,
          page: currentPage.toString(),
          limit: productsPerPage.toString()
        });

        if (categoryFilter) {
          queryParams.append('category', categoryFilter);
        }
        if (minPriceFilter) {
          queryParams.append('min_price', minPriceFilter);
        }
        if (maxPriceFilter) {
          queryParams.append('max_price', maxPriceFilter);
        }
        if (minRatingFilter) {
          queryParams.append('min_rating', minRatingFilter);
        }
        if (dateRangeFilter) {
          queryParams.append('date_range', dateRangeFilter);
        }
        if (trendingOnlyFilter) {
          queryParams.append('trending_only', trendingOnlyFilter);
        }
        if (sortByFilter) {
          queryParams.append('sort_by', sortByFilter);
        }

        const response = await fetch(
          `${BASE_URL}/products/by-sentiment?${queryParams.toString()}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.data) {
          setProducts(data.data);
          setTotalPages(data.total_pages);
          setTotalProducts(data.total_products);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching sentiment products:", error);
        setError(error instanceof Error ? error.message : "Product list failed to load. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [source, sentiment, currentPage, productsPerPage, categoryFilter, minPriceFilter, maxPriceFilter, minRatingFilter, dateRangeFilter, trendingOnlyFilter, sortByFilter, BASE_URL]);

  useEffect(() => {
    setCurrentPage(1);
  }, [source, sentiment, categoryFilter, minPriceFilter, maxPriceFilter, minRatingFilter, dateRangeFilter, trendingOnlyFilter, sortByFilter]);

  const calculateSentimentPercentage = (rating: number, sentimentScore: number) => {
    if (sentimentScore && sentimentScore > 0) {
      return Math.round(sentimentScore * 100);
    }
    if (!rating || rating === 0) return 50;
    if (sentiment === "positive") {
      if (rating >= 4.5) return Math.round(85 + (rating - 4.5) * 30);
      if (rating >= 4.0) return Math.round(75 + (rating - 4.0) * 20);
      return 75;
    } else if (sentiment === "neutral") {
      if (rating >= 3.7) return Math.round(55 + (rating - 3.7) * 16);
      return Math.round(45 + (rating - 3.5) * 25);
    } else {
      if (rating >= 3.2) return Math.round(35 + (rating - 3.2) * 16);
      if (rating >= 3.0) return Math.round(30 + (rating - 3.0) * 25);
      if (rating >= 2.5) return Math.round(25 + (rating - 2.5) * 10);
      return Math.round(15 + (rating - 1.0) * 6);
    }
  };

  const getProgressGradient = (percentage: number) => {
    if (percentage >= 80) return "from-emerald-400 to-emerald-600";
    if (percentage >= 60) return "from-lime-400 to-lime-600";
    if (percentage >= 40) return "from-yellow-400 to-yellow-600";
    if (percentage >= 20) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  const formatSentiment = (sent: string) => {
    return sent.charAt(0).toUpperCase() + sent.slice(1);
  };

  const getSentimentColor = (sent: string) => {
    if (sent === "positive") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (sent === "neutral") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getSentimentIcon = (sent: string) => {
    if (sent === "positive") return "😊";
    if (sent === "neutral") return "😐";
    return "😞";
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRemoveAllFilters = () => {
    const url = `/sentiment-analysis/${source}/${sentiment}`;
    router.push(url);
  };

  const activeFiltersCount = [
    categoryFilter,
    minPriceFilter && minPriceFilter !== '0',
    maxPriceFilter && maxPriceFilter !== '5000000',
    minRatingFilter && minRatingFilter !== '0',
    dateRangeFilter && dateRangeFilter !== 'all',
    trendingOnlyFilter === 'true',
    sortByFilter && sortByFilter !== 'default'
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-sky-900 break-words">
            {formatSentiment(sentiment)} Products
          </h2>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-xs sm:text-sm text-gray-500">
              {source === "flipkart" ? "Flipkart" : "Amazon"} • {totalProducts.toLocaleString()} products found
            </p>
            <p className="text-xs text-gray-400">
              {sentiment === "positive" && "⭐ Rating 4.0+"}
              {sentiment === "neutral" && "⭐ Rating 3.5-3.99"}
              {sentiment === "negative" && "⭐ Rating below 3.5"}
            </p>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
              {categoryFilter && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                  📁 {categoryFilter}
                </Badge>
              )}
              {(minPriceFilter && minPriceFilter !== '0') || (maxPriceFilter && maxPriceFilter !== '5000000') && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 px-3 py-1">
                  💰 ₹{minPriceFilter || '0'} - ₹{maxPriceFilter || '5000000'}
                </Badge>
              )}
              {minRatingFilter && minRatingFilter !== '0' && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1">
                  ⭐ {minRatingFilter}+
                </Badge>
              )}
              {dateRangeFilter && dateRangeFilter !== 'all' && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                  📅 {dateRangeFilter}
                </Badge>
              )}
              {trendingOnlyFilter === 'true' && (
                <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200 px-3 py-1">
                  🔥 Trending
                </Badge>
              )}
              {sortByFilter && sortByFilter !== 'default' && (
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1">
                  🔄 {sortByFilter}
                </Badge>
              )}
              <button
                onClick={handleRemoveAllFilters}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 ml-2"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${getSentimentColor(sentiment)}`}>
            {getSentimentIcon(sentiment)} {formatSentiment(sentiment)}
          </span>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="text-xs sm:text-sm font-medium border-sky-200 text-sky-700 hover:bg-sky-50"
          >
            ← Back
          </Button>
        </div>
      </div>

      {!isLoading && !error && totalPages > 1 && (
        <div className="bg-background opacity-100 backdrop-blur-none border border-sky-100 shadow-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Page <span className="font-semibold text-sky-900">{currentPage}</span> of{" "}
              <span className="font-semibold text-sky-900">{totalPages}</span> • Showing{" "}
              <span className="font-semibold text-sky-600">{products.length}</span> of{" "}
              <span className="font-semibold text-sky-600">{totalProducts.toLocaleString()}</span> products
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="backdrop-blur-none bg-rose-50/70 border border-rose-100 shadow-lg rounded-2xl p-6 mb-6 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Error Loading Products</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="bg-background opacity-100 backdrop-blur-none border border-sky-100 shadow-sm rounded-3xl overflow-hidden">
              <Skeleton className="w-full h-48 bg-sky-100" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2 bg-sky-100" />
                <Skeleton className="h-4 w-1/2 mb-4 bg-sky-100" />
                <Skeleton className="h-8 w-full bg-sky-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <Card className="bg-background opacity-100 backdrop-blur-none border border-sky-100 shadow-sm rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No products found with {sentiment} sentiment matching your filters</p>
          <button onClick={handleRemoveAllFilters} className="text-blue-600 hover:underline">Remove filters</button>
        </Card>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => {
            const sentimentPercentage = calculateSentimentPercentage(product.rating, product.sentiment_score);
            return (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => router.push(`/product/${encodeURIComponent(product.product_title)}?from=sentiment&source=${source}`)}>
                {product.image_url && (
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img src={product.image_url} alt={product.product_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    {product.rating && (
                      <div className="absolute top-3 right-3 bg-background opacity-100 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-blue-600">{product.product_title}</CardTitle>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {product.category && <Badge variant="outline" className="text-xs">{product.category}</Badge>}
                    {product.brand && <Badge variant="secondary" className="text-xs">{product.brand}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-800">₹{product.price?.toLocaleString('en-IN')}</span>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Sentiment Score</span>
                      <span className="font-bold text-slate-900">{sentimentPercentage}%</span>
                    </div>
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getProgressGradient(sentimentPercentage)} transition-all duration-1000`} style={{ width: `${sentimentPercentage}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
          <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}