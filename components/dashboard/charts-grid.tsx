"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useFilters } from "@/components/dashboard/filters-context";
import { useAISummary } from "@/hooks/use-ai-summary";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  summary?: string;
  summaryLoading?: boolean;
}

function ChartCard({ title, children, isLoading, summary, summaryLoading }: ChartCardProps) {
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const hasAISummaries = canAccessFeature('hasChartAISummaries');

  return (
    <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
        <Badge variant="secondary" className="text-xs">Live Data</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="chart-container relative h-80 w-full">
          {isLoading ? <Skeleton className="w-full h-full" /> : children}
        </div>
        {hasAISummaries ? (
          summaryLoading ? (
            <div className="mt-3 text-sm text-muted-foreground italic flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
              Generating Smart summary...
            </div>
          ) : summary ? (
            <div className="mt-3 text-sm font-medium p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{summary}</span>
            </div>
          ) : null
        ) : (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-900">🎯 AI Chart Insights Locked</p>
                <p className="text-xs text-amber-700 mt-1">Upgrade for AI-powered chart summaries.</p>
                <Button size="sm" variant="outline" className="mt-2 text-xs h-7 border-amber-400 text-amber-700 hover:bg-amber-100" onClick={() => window.location.href = "/subscription"}>
                  <Crown className="w-3 h-3 mr-1" /> Upgrade to {currentTier === 'free' ? 'Basic' : 'Premium'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChartsGrid({ selectedSource }: { selectedSource: string }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { filters } = useFilters();
  const { canAccessFeature } = useSubscriptionLimits();
  const router = useRouter();

  const [flipkartProducts, setFlipkartProducts] = useState<any[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<any[]>([]);
  const [flipkartCategories, setFlipkartCategories] = useState<any[]>([]);
  const [amazonCategories, setAmazonCategories] = useState<any[]>([]);
  const [flipkartRatings, setFlipkartRatings] = useState<any[]>([]);
  const [amazonRatings, setAmazonRatings] = useState<any[]>([]);
  const [flipkartSentiments, setFlipkartSentiments] = useState<any[]>([]);
  const [amazonSentiments, setAmazonSentiments] = useState<any[]>([]);
  const [flipkartSalesProducts, setFlipkartSalesProducts] = useState<any[]>([]);
  const [amazonSalesProducts, setAmazonSalesProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All Categories") params.append("category", filters.category);
    if (filters.priceRange[0] > 0) params.append("min_price", filters.priceRange[0].toString());
    if (filters.priceRange[1] < 5000000) params.append("max_price", filters.priceRange[1].toString());
    if (filters.rating > 0) params.append("min_rating", filters.rating.toString());
    if (filters.dateRange !== "all") params.append("date_range", filters.dateRange);
    if (filters.showTrendingOnly) params.append("trending_only", "true");
    if (filters.sortBy) params.append("sort_by", filters.sortBy);
    return params.toString();
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const queryParams = buildQueryParams();
        const topN = filters.topN || 10;

        if (table === "both") {
          const [flipkartRes, amazonRes, flipkartCatRes, amazonCatRes, flipkartRatingsRes, amazonRatingsRes, flipkartSentimentRes, amazonSentimentRes, flipkartSalesRes, amazonSalesRes] = await Promise.all([
            fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/flipkart/categories?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`, { cache: 'no-store' }),
          ]);
          const fJson = await flipkartRes.json();
          setFlipkartProducts(fJson.data || []);
          const aJson = await amazonRes.json();
          setAmazonProducts(aJson.data || []);
          const fCatJson = await flipkartCatRes.json();
          setFlipkartCategories(Array.isArray(fCatJson) ? fCatJson : (fCatJson?.data || []));
          const aCatJson = await amazonCatRes.json();
          setAmazonCategories(Array.isArray(aCatJson) ? aCatJson : (aCatJson?.data || []));
          const fRatJson = await flipkartRatingsRes.json();
          setFlipkartRatings(Array.isArray(fRatJson) ? fRatJson : (fRatJson?.data || []));
          const aRatJson = await amazonRatingsRes.json();
          setAmazonRatings(Array.isArray(aRatJson) ? aRatJson : (aRatJson?.data || []));
          const fSentJson = await flipkartSentimentRes.json();
          setFlipkartSentiments(Array.isArray(fSentJson) ? fSentJson : (fSentJson?.data || []));
          const aSentJson = await amazonSentimentRes.json();
          setAmazonSentiments(Array.isArray(aSentJson) ? aSentJson : (aSentJson?.data || []));
          const fSalesJson = await flipkartSalesRes.json();
          setFlipkartSalesProducts(fSalesJson.data || []);
          const aSalesJson = await amazonSalesRes.json();
          setAmazonSalesProducts(aSalesJson.data || []);
        } else if (table === "amazon") {
          const [productsRes, categoriesRes, ratingsRes, sentimentRes, salesRes] = await Promise.all([
            fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`, { cache: 'no-store' }),
          ]);
          const [pJson, cJson, rJson, sentJson, sJson] = await Promise.all([
            productsRes.json(), categoriesRes.json(), ratingsRes.json(), sentimentRes.json(), salesRes.json()
          ]);
          setAmazonProducts(pJson.data || []);
          setAmazonCategories(Array.isArray(cJson) ? cJson : (cJson?.data || []));
          setAmazonRatings(Array.isArray(rJson) ? rJson : (rJson?.data || []));
          setAmazonSentiments(Array.isArray(sentJson) ? sentJson : (sentJson?.data || []));
          setAmazonSalesProducts(sJson.data || []);
          setFlipkartProducts([]); setFlipkartCategories([]); setFlipkartRatings([]); setFlipkartSentiments([]); setFlipkartSalesProducts([]);
        } else {
          const [productsRes, categoryRes, ratingsRes, sentimentRes, salesRes] = await Promise.all([
            fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/flipkart/categories?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${queryParams}`, { cache: 'no-store' }),
            fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`, { cache: 'no-store' }),
          ]);
          const [pJson, cJson, rJson, sentJson, sJson] = await Promise.all([
            productsRes.json(), categoryRes.json(), ratingsRes.json(), sentimentRes.json(), salesRes.json()
          ]);
          setFlipkartProducts(pJson.data || []);
          setFlipkartCategories(Array.isArray(cJson) ? cJson : (cJson?.data || []));
          setFlipkartRatings(Array.isArray(rJson) ? rJson : (rJson?.data || []));
          setFlipkartSentiments(Array.isArray(sentJson) ? sentJson : (sentJson?.data || []));
          setFlipkartSalesProducts(sJson.data || []);
          setAmazonProducts([]); setAmazonCategories([]); setAmazonRatings([]); setAmazonSentiments([]); setAmazonSalesProducts([]);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [selectedSource, filters, BASE_URL]);

  const hasAISummaries = canAccessFeature('hasChartAISummaries');
  const { summary: flipCatSum, loading: flipCatLoad } = useAISummary(hasAISummaries ? "Summarize Flipkart category distribution" : "", "rapidapi_flipkart_products", flipkartCategories, flipkartCategories.length, filters);
  const { summary: flipRatSum, loading: flipRatLoad } = useAISummary(hasAISummaries ? "Summarize Flipkart rating distribution" : "", "rapidapi_flipkart_products", flipkartRatings, flipkartRatings.length, filters);
  const { summary: flipSentSum, loading: flipSentLoad } = useAISummary(hasAISummaries ? "Summarize Flipkart sentiment distribution" : "", "rapidapi_flipkart_products", flipkartSentiments, flipkartSentiments.length, filters);
  const { summary: flipSalesSum, loading: flipSalesLoad } = useAISummary(hasAISummaries ? "Summarize top selling Flipkart products" : "", "rapidapi_flipkart_products", flipkartSalesProducts, flipkartSalesProducts.length, filters);

  const { summary: amzCatSum, loading: amzCatLoad } = useAISummary(hasAISummaries ? "Summarize Amazon category distribution" : "", "rapidapi_amazon_products", amazonCategories, amazonCategories.length, filters);
  const { summary: amzRatSum, loading: amzRatLoad } = useAISummary(hasAISummaries ? "Summarize Amazon rating distribution" : "", "rapidapi_amazon_products", amazonRatings, amazonRatings.length, filters);
  const { summary: amzSentSum, loading: amzSentLoad } = useAISummary(hasAISummaries ? "Summarize Amazon sentiment distribution" : "", "rapidapi_amazon_products", amazonSentiments, amazonSentiments.length, filters);
  const { summary: amzSalesSum, loading: amzSalesLoad } = useAISummary(hasAISummaries ? "Summarize top selling Amazon products" : "", "rapidapi_amazon_products", amazonSalesProducts, amazonSalesProducts.length, filters);

  const createBarOptions = (clickHandler: (index: number) => void) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, position: "bottom" as const },
      tooltip: {
        callbacks: {
          afterLabel: () => "Click to view details"
        }
      }
    },
    onClick: (_: any, elements: any[]) => { if (elements.length > 0) clickHandler(elements[0].index); },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native?.target;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    }
  });

  const truncateName = (name: string) => name.replace(/"/g, "").substring(0, 30) + (name.length > 30 ? "..." : "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {flipkartCategories.length > 0 && (
        <ChartCard title="Product Category Landscape (Flipkart)" isLoading={isLoading} summary={flipCatSum} summaryLoading={flipCatLoad}>
          <Bar 
            data={{ labels: flipkartCategories.map(c => c.category || c.category_name || "Unknown"), datasets: [{ label: "Products", data: flipkartCategories.map(c => c.count || 0), backgroundColor: "hsl(142,76%,36%)", borderRadius: 8 }] }} 
            options={createBarOptions((index) => {
              const category = flipkartCategories[index];
              if (category && (category.category || category.category_name)) {
                router.push(`/category-products/flipkart/${encodeURIComponent(category.category || category.category_name)}?page=1&from=dashboard`);
              }
            })} 
          />
        </ChartCard>
      )}
      {flipkartRatings.length > 0 && (
        <ChartCard title="Customer Rating Profile (Flipkart)" isLoading={isLoading} summary={flipRatSum} summaryLoading={flipRatLoad}>
          <Bar data={{ labels: flipkartRatings.map(r => `${r.rating}★`), datasets: [{ label: "Products", data: flipkartRatings.map(r => r.count || 0), backgroundColor: "rgba(34,197,94,0.7)" }] }} options={createBarOptions(() => {})} />
        </ChartCard>
      )}
      {flipkartSentiments.length > 0 && (
        <ChartCard title="Voice of the Customer (Flipkart)" isLoading={isLoading} summary={flipSentSum} summaryLoading={flipSentLoad}>
          <Doughnut 
            data={{ labels: flipkartSentiments.map(s => (s.sentiment || "Unknown")), datasets: [{ data: flipkartSentiments.map(s => s.count || 0), backgroundColor: ["rgba(34,197,94,0.9)", "rgba(234,179,8,0.9)", "rgba(239,68,68,0.9)"], borderWidth: 3 }] }} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              onClick: (_: any, elements: any[]) => {
                if (elements.length > 0) {
                  const sentiment = flipkartSentiments[elements[0].index];
                  if (sentiment && sentiment.sentiment) {
                    router.push(`/sentiment-products/flipkart/${sentiment.sentiment.toLowerCase()}?from=dashboard`);
                  }
                }
              },
              onHover: (event: any, elements: any[]) => {
                const canvas = event.native?.target;
                if (canvas) canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
              }
            }} 
          />
        </ChartCard>
      )}
      {flipkartSalesProducts.length > 0 && (
        <ChartCard title="High-Velocity Products (Flipkart)" isLoading={isLoading} summary={flipSalesSum} summaryLoading={flipSalesLoad}>
          <Bar 
            data={{ labels: flipkartSalesProducts.map(p => truncateName(p.product_title || "Unknown")), datasets: [{ label: "Daily Sales", data: flipkartSalesProducts.map(p => p.daily_sales || 0), backgroundColor: "rgba(34,197,94,0.8)", borderRadius: 10 }] }} 
            options={createBarOptions((index) => {
              const product = flipkartSalesProducts[index];
              if (product && product.product_title) {
                router.push(`/product/${encodeURIComponent(product.product_title)}?from=dashboard&source=flipkart`);
              }
            })} 
          />
        </ChartCard>
      )}

      {amazonCategories.length > 0 && (
        <ChartCard title="Product Category Landscape (Amazon)" isLoading={isLoading} summary={amzCatSum} summaryLoading={amzCatLoad}>
          <Bar 
            data={{ labels: amazonCategories.map(c => c.category || c.category_name || "Unknown"), datasets: [{ label: "Products", data: amazonCategories.map(c => c.count || c.product_count || 0), backgroundColor: "rgba(245, 158, 11, 0.7)", borderRadius: 8 }] }} 
            options={createBarOptions((index) => {
              const category = amazonCategories[index];
              if (category && (category.category || category.category_name)) {
                router.push(`/category-products/amazon/${encodeURIComponent(category.category || category.category_name)}?page=1&from=dashboard`);
              }
            })} 
          />
        </ChartCard>
      )}
      {amazonRatings.length > 0 && (
        <ChartCard title="Customer Rating Profile (Amazon)" isLoading={isLoading} summary={amzRatSum} summaryLoading={amzRatLoad}>
          <Bar data={{ labels: amazonRatings.map(r => `${r.rating}★`), datasets: [{ label: "Products", data: amazonRatings.map(r => r.count || 0), backgroundColor: "rgba(59,130,246,0.7)" }] }} options={createBarOptions(() => {})} />
        </ChartCard>
      )}
      {amazonSentiments.length > 0 && (
        <ChartCard title="Voice of the Customer (Amazon)" isLoading={isLoading} summary={amzSentSum} summaryLoading={amzSentLoad}>
          <Doughnut 
            data={{ labels: amazonSentiments.map(s => (s.sentiment || "Unknown")), datasets: [{ data: amazonSentiments.map(s => s.count || 0), backgroundColor: ["rgba(34,197,94,0.9)", "rgba(234,179,8,0.9)", "rgba(239,68,68,0.9)"], borderWidth: 3 }] }} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              onClick: (_: any, elements: any[]) => {
                if (elements.length > 0) {
                  const sentiment = amazonSentiments[elements[0].index];
                  if (sentiment && sentiment.sentiment) {
                    router.push(`/sentiment-products/amazon/${sentiment.sentiment.toLowerCase()}?from=dashboard`);
                  }
                }
              },
              onHover: (event: any, elements: any[]) => {
                const canvas = event.native?.target;
                if (canvas) canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
              }
            }} 
          />
        </ChartCard>
      )}
      {amazonSalesProducts.length > 0 && (
        <ChartCard title="High-Velocity Products (Amazon)" isLoading={isLoading} summary={amzSalesSum} summaryLoading={amzSalesLoad}>
          <Bar 
            data={{ labels: amazonSalesProducts.map(p => truncateName(p.product_title || "Unknown")), datasets: [{ label: "Daily Sales", data: amazonSalesProducts.map(p => p.daily_sales || 0), backgroundColor: "rgba(59,130,246,0.8)", borderRadius: 10 }] }} 
            options={createBarOptions((index) => {
              const product = amazonSalesProducts[index];
              if (product && product.product_title) {
                router.push(`/product/${encodeURIComponent(product.product_title)}?from=dashboard&source=amazon`);
              }
            })} 
          />
        </ChartCard>
      )}
    </div>
  );
}
