import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Lock, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/config";
import { useFilters } from "@/components/dashboard/filters-context";
import { useAISummary } from "@/hooks/use-ai-summary";
import {
  useSubscriptionLimits,
  UNLIMITED,
} from "@/hooks/use-subscription-limits";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

interface TrendingProduct {
  product_title?: string;
  title?: string;
  daily_sales?: number;
  total_daily_sales?: number;
  sales_volume?: string | number;
  estimated_sales?: number;
  avg_price?: number;
  product_price?: number;
}

const scaleFlipkartProducts = (data: any[]) => {
  if (!data) return [];
  return data.map((p) => {
    const adjusted = { ...p };
    if (adjusted.daily_sales)
      adjusted.daily_sales = Math.round(adjusted.daily_sales / 450);
    if (adjusted.total_daily_sales)
      adjusted.total_daily_sales = Math.round(adjusted.total_daily_sales / 450);
    if (adjusted.estimated_sales)
      adjusted.estimated_sales = Math.round(adjusted.estimated_sales / 450);
    if (typeof adjusted.sales_volume === "string") {
      const num =
        parseFloat(adjusted.sales_volume.replace(/[^0-9.]/g, "")) || 0;
      adjusted.sales_volume = Math.round(num / 450);
    } else if (typeof adjusted.sales_volume === "number") {
      adjusted.sales_volume = Math.round(adjusted.sales_volume / 450);
    }
    return adjusted;
  });
};

function ProductCard({
  product,
  index,
  source,
}: {
  product: TrendingProduct;
  index: number;
  source: string;
}) {
  const { t } = useTranslation();

  // Color accents per rank item index
  const cardGradients = [
    "bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white dark:from-slate-900/90 dark:to-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40",
    "bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white dark:from-slate-900/90 dark:to-blue-950/20 border-blue-200/70 dark:border-blue-900/40",
    "bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-white dark:from-slate-900/90 dark:to-purple-950/20 border-purple-200/70 dark:border-purple-900/40",
  ];
  const defaultCardGradient =
    "bg-gradient-to-r from-slate-50/90 to-white dark:from-slate-900/90 dark:to-slate-900/90 border-slate-200/70 dark:border-slate-800";

  const circleBadges = [
    "bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30",
    "bg-blue-500 text-white dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/30",
    "bg-purple-500 text-white dark:bg-purple-500/20 dark:text-purple-300 dark:border dark:border-purple-500/30",
  ];
  const defaultCircleBadge =
    "bg-slate-500 text-white dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-700/60";

  const cardStyle = index < 3 ? cardGradients[index] : defaultCardGradient;
  const circleStyle = index < 3 ? circleBadges[index] : defaultCircleBadge;

  const productName =
    product.product_title || product.title || "Unknown Product";

  const salesVolumeRaw =
    product.daily_sales ||
    product.total_daily_sales ||
    product.sales_volume ||
    product.estimated_sales ||
    0;
  const salesVolume =
    typeof salesVolumeRaw === "string"
      ? parseFloat(salesVolumeRaw.replace(/[^0-9.]/g, "")) || 0
      : salesVolumeRaw;

  const price = product.avg_price || product.product_price || 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl gap-3 border transition-all duration-200 shadow-2xs hover:shadow-xs",
        cardStyle,
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div
          className={cn(
            "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 shadow-2xs",
            circleStyle,
          )}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-xs sm:text-sm truncate text-slate-900 dark:text-slate-100"
            title={productName.replace(/"/g, "")}
          >
            {productName.replace(/"/g, "")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {Math.round(salesVolume).toLocaleString()}{" "}
            {t("sales.sales", "Sales").toLowerCase()} • ₹{price.toFixed(0)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge
          variant="outline"
          className="text-[11px] font-semibold whitespace-nowrap bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300"
        >
          {source === "flipkart" ? "Flipkart" : "Amazon"}
        </Badge>
        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
    </div>
  );
}
export default function ProductRankings({
  selectedSource,
}: {
  selectedSource: string;
}) {
  const { t } = useTranslation();
  const BASE_URL = API_BASE_URL;
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const [flipkartProducts, setFlipkartProducts] = useState<TrendingProduct[]>(
    [],
  );
  const [amazonProducts, setAmazonProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (filters.category && filters.category !== "All Categories") {
      params.append("category", filters.category);
    }

    if (filters.priceRange[0] > 0) {
      params.append("min_price", filters.priceRange[0].toString());
    }
    if (filters.priceRange[1] < 5000000) {
      params.append("max_price", filters.priceRange[1].toString());
    }

    if (filters.rating > 0) {
      params.append("min_rating", filters.rating.toString());
    }

    if (filters.dateRange !== "all") {
      params.append("date_range", filters.dateRange);
    }

    if (filters.showTrendingOnly) {
      params.append("trending_only", "true");
    }

    if (filters.sortBy) {
      params.append("sort_by", filters.sortBy);
    }

    return params.toString();
  };

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const queryParams = buildQueryParams();
        const topN = filters.topN || 10;

        if (table === "both") {
          const halfN = Math.ceil(topN / 2);
          const [flipkartRes, amazonRes] = await Promise.all([
            fetch(
              `${BASE_URL}/rapidapi/flipkart/top-sales?limit=${halfN}&${queryParams}`,
            ),
            fetch(
              `${BASE_URL}/rapidapi/top-sales?limit=${halfN}&${queryParams}`,
            ),
          ]);

          const [flipkartJson, amazonJson] = await Promise.all([
            flipkartRes.json(),
            amazonRes.json(),
          ]);

          setFlipkartProducts(scaleFlipkartProducts(flipkartJson.data) || []);
          setAmazonProducts(amazonJson.data || []);
        } else if (table === "amazon" || table === "rapidapi_amazon_products") {
          const res = await fetch(
            `${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`,
          );
          const json = await res.json();
          setFlipkartProducts([]);
          setAmazonProducts(json.data || []);
        } else {
          const res = await fetch(
            `${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`,
          );
          const json = await res.json();
          setFlipkartProducts(scaleFlipkartProducts(json.data) || []);
          setAmazonProducts([]);
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
        setFlipkartProducts([]);
        setAmazonProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [selectedSource, filters]);

  const table = filters.table || selectedSource;
  const showBoth = table === "both";
  const isAmazon = table === "amazon" || table === "rapidapi_amazon_products";

  const allProducts = showBoth
    ? [...flipkartProducts, ...amazonProducts]
    : isAmazon
      ? amazonProducts
      : flipkartProducts;

  const hasAISummaries = canAccessFeature("hasChartAISummaries");

  const question = showBoth
    ? "Compare top selling Flipkart and Amazon products by sales volume."
    : isAmazon
      ? "Summarize key patterns and insights from top selling Amazon products by sales volume."
      : "Summarize key patterns and insights from top selling Flipkart products by sales volume.";

  const sourceTable = isAmazon
    ? "rapidapi_amazon_products"
    : table === "flipkart" || table === "rapidapi_flipkart_products"
      ? "rapidapi_flipkart_products"
      : "combined_sources";

  const { summary, loading: summaryLoading } = useAISummary(
    hasAISummaries ? question : "",
    sourceTable,
    allProducts,
    allProducts.length,
    filters,
  );

  return (
    <div className="grid grid-cols-1 gap-6 min-w-0 max-w-full">
      <Card className="bg-card rounded-xl p-4 sm:p-6 border hover:shadow-md transition-shadow min-w-0 max-w-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
          <CardTitle className="section-heading text-base sm:text-lg font-semibold truncate pr-2">
            {showBoth
              ? t("charts.marketMoversBoth", "Market Movers (Both Sources)")
              : isAmazon
                ? t("charts.marketMoversAmazon", "Market Movers (Amazon)")
                : t("charts.marketMoversFlipkart", "Market Movers (Flipkart)")}
          </CardTitle>
          <Badge variant="secondary" className="badge-pill bg-muted">
            {t("charts.liveData", "Live Data")}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {/* AI Summary Section with Subscription Gate */}
          {hasAISummaries ? (
            summaryLoading ? (
              <div className="mb-3 text-sm text-muted-foreground italic flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
                {t("charts.generating", "Generating Smart summary...")}
              </div>
            ) : summary ? (
              <div
                className={cn(
                  "mb-3 text-sm font-medium p-3 rounded-lg border flex items-start gap-2 bg-gradient-to-r",
                  isDark
                    ? "from-purple-950/30 to-blue-950/30 border-purple-900/40"
                    : "from-purple-50 to-blue-50 border-purple-200",
                )}
              >
                <Sparkles
                  className={cn(
                    "w-4 h-4 flex-shrink-0 mt-0.5",
                    isDark ? "text-purple-400" : "text-purple-600",
                  )}
                />
                <span className={isDark ? "text-slate-200" : "text-slate-700"}>
                  {summary}
                </span>
              </div>
            ) : null
          ) : (
            <div className="mb-3.5 p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    🎯 AI Market Insights Locked
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {currentTier === "free"
                      ? "Upgrade to get AI-powered analysis of market trends and product performance"
                      : "Get instant insights on top-performing products"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : showBoth ? (
              <>
                {flipkartProducts.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                      {t("charts.flipkartTop", "Flipkart Top")}{" "}
                      {flipkartProducts.length}
                    </h3>
                    {flipkartProducts.map((product, index) => (
                      <ProductCard
                        key={`flipkart-${index}`}
                        product={product}
                        index={index}
                        source="flipkart"
                      />
                    ))}
                  </>
                )}

                {amazonProducts.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                      {t("charts.amazonTop", "Amazon Top")}{" "}
                      {amazonProducts.length}
                    </h3>
                    {amazonProducts.map((product, index) => (
                      <ProductCard
                        key={`amazon-${index}`}
                        product={product}
                        index={index}
                        source="amazon"
                      />
                    ))}
                  </>
                )}
              </>
            ) : allProducts.length > 0 ? (
              allProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  index={index}
                  source={isAmazon ? "amazon" : "flipkart"}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {t(
                    "charts.noTrendingProducts",
                    "No trending products available",
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
