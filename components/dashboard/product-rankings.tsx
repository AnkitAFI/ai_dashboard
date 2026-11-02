import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lock, Sparkles, Crown, CheckCircle2 } from "lucide-react";
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
import { analytics } from "@/lib/analytics";

interface TrendingProduct {
  id?: number | string;
  asin?: string;
  pid?: string;
  product_title?: string;
  title?: string;
  daily_sales?: number;
  total_daily_sales?: number;
  sales_volume?: string | number;
  estimated_sales?: number;
  avg_price?: number;
  product_price?: number;
  category_name?: string;
}

const parseSalesVolume = (salesText?: string | number, avgSales?: number): number => {
  if (typeof salesText === "number") return salesText;
  if (avgSales) return avgSales;
  if (!salesText) return 0;
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

function ProductCard({
  product,
  index,
  source,
  isFreeTier,
  onUpgrade,
}: {
  product: TrendingProduct;
  index: number;
  source: string;
  isFreeTier?: boolean;
  onUpgrade?: (reason: string) => void;
}) {
  const { t } = useTranslation();
  const isMysteryRow = isFreeTier && index === 0;

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

  const cardStyle = isMysteryRow
    ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.04] border-l-2 border-l-amber-500 border-amber-200/60 dark:border-amber-800/40"
    : index < 3 ? cardGradients[index] : defaultCardGradient;
  const circleStyle = isMysteryRow
    ? "bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-300 dark:border-amber-600 text-amber-500"
    : index < 3 ? circleBadges[index] : defaultCircleBadge;

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
      ? parseSalesVolume(salesVolumeRaw)
      : salesVolumeRaw;

  const price = product.avg_price || product.product_price || 0;

  const formatSalesDisplay = (salesNum: number): string => {
    if (salesNum >= 1000000) return `${(salesNum / 1000000).toFixed(1)}M`;
    if (salesNum >= 1000) return `${(salesNum / 1000).toFixed(1)}K`;
    return salesNum.toLocaleString();
  };

  return (
    <div
      onClick={() => {
        if (isFreeTier) {
          if (isMysteryRow) {
            onUpgrade?.(
              `Reveal Rank #1: See the exact title, ${source === "flipkart" ? "PID" : "ASIN"}, and sales volume upon upgrading.`
            );
          } else {
            onUpgrade?.("Upgrade to unlock exact sales counts across all products.");
          }
        }
      }}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl gap-3 border transition-all duration-200 shadow-2xs hover:shadow-xs",
        isFreeTier && "cursor-pointer",
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
          {isMysteryRow ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {isMysteryRow ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                #1 Selling Product ({source === "flipkart" ? "Flipkart" : "Amazon"})
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>
          ) : (
            <p
              className="font-semibold text-xs sm:text-sm truncate text-slate-900 dark:text-slate-100"
              title={productName.replace(/"/g, "")}
            >
              {productName.replace(/"/g, "")}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {isFreeTier ? (
              <span className="filter blur-[4px] select-none opacity-70 inline-block" title="Upgrade to reveal sales count">
                {formatSalesDisplay(salesVolume)}
              </span>
            ) : (
              formatSalesDisplay(salesVolume)
            )}{" "}
            {t("sales.sales", "Sales").toLowerCase()} • ₹{typeof price === "number" ? price.toFixed(0) : price}
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
  const router = useRouter();
  const { t } = useTranslation();
  const BASE_URL = API_BASE_URL;
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const isFreeTier = currentTier === "free";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [flipkartProducts, setFlipkartProducts] = useState<TrendingProduct[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTriggerReason, setUpgradeTriggerReason] = useState("");

  const triggerUpgrade = (reason: string) => {
    setUpgradeTriggerReason(reason);
    setShowUpgradeModal(true);
    analytics.track("upgrade_prompt_viewed", {
      feature: "market_movers_card",
      reason,
      tier: currentTier,
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (filters.category && filters.category !== "All Categories") {
      params.append("category", filters.category);
    }

    if (filters.priceRange && filters.priceRange[0] > 0) {
      params.append("min_price", filters.priceRange[0].toString());
    }
    if (filters.priceRange && filters.priceRange[1] < 5000000) {
      params.append("max_price", filters.priceRange[1].toString());
    }

    if (filters.rating && filters.rating > 0) {
      params.append("min_rating", filters.rating.toString());
    }

    if (filters.dateRange && filters.dateRange !== "all") {
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
        const table = (filters.table || selectedSource || "amazon").toLowerCase();
        const queryParams = buildQueryParams();
        const topN = filters.topN || 5;

        if (table === "both") {
          const halfN = Math.ceil(topN / 2);
          const [flipkartRes, amazonRes] = await Promise.all([
            fetch(
              `${BASE_URL}/top?table=rapidapi_flipkart_products&n=500${queryParams ? '&' + queryParams : ''}`,
            ),
            fetch(
              `${BASE_URL}/rapidapi/top-sales?limit=500${queryParams ? '&' + queryParams : ''}`,
            ),
          ]);

          const [flipkartJson, amazonJson] = await Promise.all([
            flipkartRes.json(),
            amazonRes.json(),
          ]);

          const rawFlipkart = Array.isArray(flipkartJson.data || flipkartJson) ? (flipkartJson.data || flipkartJson) : [];
          const rawAmazon = Array.isArray(amazonJson.data || amazonJson) ? (amazonJson.data || amazonJson) : [];

          const sortedFlipkart = [...rawFlipkart].sort((a: any, b: any) => {
            const sA = Math.round(parseSalesVolume(a.sales_volume, a.avg_sales_volume ?? a.estimated_sales) / 125);
            const sB = Math.round(parseSalesVolume(b.sales_volume, b.avg_sales_volume ?? b.estimated_sales) / 125);
            return sB - sA;
          });

          const sortedAmazon = [...rawAmazon].sort((a: any, b: any) => {
            const sA = parseSalesVolume(a.sales_volume, a.avg_sales_volume ?? a.estimated_sales);
            const sB = parseSalesVolume(b.sales_volume, b.avg_sales_volume ?? b.estimated_sales);
            return sB - sA;
          });

          setFlipkartProducts(sortedFlipkart.slice(0, halfN).map((p: any) => ({
            ...p,
            product_title: p.title || p.product_title,
            title: p.title || p.product_title,
            daily_sales: Math.round(parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? p.estimated_sales) / 125),
            sales_volume: p.sales_volume,
            avg_price: typeof p.price === "number" && !isNaN(p.price) && p.price > 0
              ? p.price
              : typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0
              ? p.product_price
              : parseFloat(p.product_price) || p.avg_price || 0,
            product_price: p.price || p.product_price,
            category_name: p.category || p.category_name || "General",
          })));

          setAmazonProducts(sortedAmazon.slice(0, halfN).map((p: any) => ({
            ...p,
            product_title: p.title || p.product_title,
            title: p.title || p.product_title,
            daily_sales: parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? p.estimated_sales),
            sales_volume: p.sales_volume,
            avg_price: typeof p.price === "number" && !isNaN(p.price) && p.price > 0
              ? p.price
              : typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0
              ? p.product_price
              : parseFloat(p.product_price) || p.avg_price || 0,
            product_price: p.price || p.product_price,
            category_name: p.category || p.category_name || p.categories || "General",
          })));
        } else if (table === "amazon" || table === "rapidapi_amazon_products") {
          const res = await fetch(
            `${BASE_URL}/rapidapi/top-sales?limit=500${queryParams ? '&' + queryParams : ''}`,
          );
          const json = await res.json();
          const rawAmazon = Array.isArray(json.data || json) ? (json.data || json) : [];
          const sortedAmazon = [...rawAmazon].sort((a: any, b: any) => {
            const sA = parseSalesVolume(a.sales_volume, a.avg_sales_volume ?? a.estimated_sales);
            const sB = parseSalesVolume(b.sales_volume, b.avg_sales_volume ?? b.estimated_sales);
            return sB - sA;
          });

          setFlipkartProducts([]);
          setAmazonProducts(sortedAmazon.slice(0, topN).map((p: any) => ({
            ...p,
            product_title: p.title || p.product_title,
            title: p.title || p.product_title,
            daily_sales: parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? p.estimated_sales),
            sales_volume: p.sales_volume,
            avg_price: typeof p.price === "number" && !isNaN(p.price) && p.price > 0
              ? p.price
              : typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0
              ? p.product_price
              : parseFloat(p.product_price) || p.avg_price || 0,
            product_price: p.price || p.product_price,
            category_name: p.category || p.category_name || p.categories || "General",
          })));
        } else {
          // Flipkart
          const res = await fetch(
            `${BASE_URL}/top?table=rapidapi_flipkart_products&n=500${queryParams ? '&' + queryParams : ''}`,
          );
          const json = await res.json();
          const rawFlipkart = Array.isArray(json.data || json) ? (json.data || json) : [];
          const sortedFlipkart = [...rawFlipkart].sort((a: any, b: any) => {
            const sA = Math.round(parseSalesVolume(a.sales_volume, a.avg_sales_volume ?? a.estimated_sales) / 125);
            const sB = Math.round(parseSalesVolume(b.sales_volume, b.avg_sales_volume ?? b.estimated_sales) / 125);
            return sB - sA;
          });

          setAmazonProducts([]);
          setFlipkartProducts(sortedFlipkart.slice(0, topN).map((p: any) => ({
            ...p,
            product_title: p.title || p.product_title,
            title: p.title || p.product_title,
            daily_sales: Math.round(parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? p.estimated_sales) / 125),
            sales_volume: p.sales_volume,
            avg_price: typeof p.price === "number" && !isNaN(p.price) && p.price > 0
              ? p.price
              : typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0
              ? p.product_price
              : parseFloat(p.product_price) || p.avg_price || 0,
            product_price: p.price || p.product_price,
            category_name: p.category || p.category_name || "General",
          })));
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
                      ? "Upgrade to Starter to get AI-powered analysis of market trends and product performance"
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
                        isFreeTier={isFreeTier}
                        onUpgrade={triggerUpgrade}
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
                        isFreeTier={isFreeTier}
                        onUpgrade={triggerUpgrade}
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
                  isFreeTier={isFreeTier}
                  onUpgrade={triggerUpgrade}
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

      {/* Upgrade Modal for Free Tier Users */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md p-6 rounded-2xl border shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <DialogHeader className="text-center space-y-2.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center tracking-tight">
              Unlock Top Market Movers
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto leading-relaxed">
              {upgradeTriggerReason || "Access exact sales volumes, reveal Rank #1, and unlock full AI market analysis."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3">
            {[
              "Exact sales volume unblurred for all market movers",
              "Reveal Rank #1 product title, ASIN/PID, and store link",
              "AI-powered market analysis and competitor trend intelligence",
              "Access all 500 top-selling products across all 50 pages"
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-colors bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={() => {
                setShowUpgradeModal(false);
                router.push("/subscription");
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2.5 rounded-xl shadow-md text-xs sm:text-sm active:scale-95 transition-all"
            >
              <Crown className="w-4 h-4 mr-2" />
              View Plans & Upgrade
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowUpgradeModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 h-8"
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
