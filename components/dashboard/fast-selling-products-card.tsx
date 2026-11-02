"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ArrowRight, Lock, Crown, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/config";
import { useFilters } from "@/components/dashboard/filters-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import ProductDetailModal, { FastProduct } from "@/components/modals/product-detail-modal";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface FastSellingProductsCardProps {
  selectedSource: string;
}

export default function FastSellingProductsCard({ selectedSource }: FastSellingProductsCardProps) {
  const router = useRouter();
  const BASE_URL = API_BASE_URL;
  const { filters } = useFilters();
  const { currentTier } = useSubscriptionLimits();
  const isFreeTier = currentTier === "free";

  const [products, setProducts] = useState<FastProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<FastProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTriggerReason, setUpgradeTriggerReason] = useState("");

  const triggerUpgrade = (reason: string) => {
    setUpgradeTriggerReason(reason);
    setShowUpgradeModal(true);
    analytics.track("upgrade_prompt_viewed", {
      feature: "fast_selling_products_card",
      reason,
      tier: currentTier,
    });
  };

  const activeSource = (filters.table || selectedSource || "amazon").toLowerCase();
  const isFlipkart = activeSource.includes("flipkart");

  const parseSalesVolume = (salesText?: string, avgSales?: number): number => {
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

  const formatSalesDisplay = (salesNum: number, salesText?: string): string => {
    if (salesNum === 0 && salesText) return salesText;
    if (salesNum >= 1000000) return `${(salesNum / 1000000).toFixed(1)}M`;
    if (salesNum >= 1000) return `${(salesNum / 1000).toFixed(1)}K`;
    return salesNum.toLocaleString();
  };

  useEffect(() => {
    const fetchFastProducts = async () => {
      setIsLoading(true);
      try {
        const categoryParam =
          filters.category && filters.category !== "All Categories"
            ? `&category=${encodeURIComponent(filters.category)}`
            : "";

        const url = isFlipkart
          ? `${BASE_URL}/top?table=rapidapi_flipkart_products&n=500${categoryParam}`
          : `${BASE_URL}/rapidapi/top-sales?limit=500${categoryParam}`;

        const res = await fetch(url);
        const json = await res.json();
        const data = json.data || json;

        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a: any, b: any) => {
            const rawSalesA = parseSalesVolume(a.sales_volume, a.avg_sales_volume ?? a.estimated_sales);
            const salesA = isFlipkart ? Math.round(rawSalesA / 125) : rawSalesA;

            const rawSalesB = parseSalesVolume(b.sales_volume, b.avg_sales_volume ?? b.estimated_sales);
            const salesB = isFlipkart ? Math.round(rawSalesB / 125) : rawSalesB;

            return salesB - salesA;
          });

          const mapped: FastProduct[] = sorted.slice(0, 5).map((p: any, idx: number) => {
            const rawSales = parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? p.estimated_sales);
            const salesNum = isFlipkart ? Math.round(rawSales / 125) : rawSales;
            const price =
              typeof p.price === "number" && !isNaN(p.price) && p.price > 0
                ? p.price
                : typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0
                ? p.product_price
                : parseFloat(p.product_price) || p.avg_price || 0;

            return {
              id: p.id || p.asin || p.pid || idx,
              asin: p.asin,
              pid: p.pid,
              product_title: p.title || p.product_title || "Product",
              title: p.title || p.product_title || "Product",
              product_photo: p.image || p.product_photo || "",
              category_name: p.category || p.category_name || "General",
              category: p.category || p.category_name || "General",
              daily_sales: salesNum,
              price,
              reviews: p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? 0,
              rating: p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0,
              source: isFlipkart ? "flipkart" : "amazon",
              product_url: p.product_url,
            };
          });

          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching fast selling products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFastProducts();
  }, [selectedSource, filters.table, filters.category]);

  const handleProductClick = (prod: FastProduct, idx: number) => {
    if (isFreeTier && idx === 0) {
      triggerUpgrade(
        `Reveal Rank #1: See the exact title, ${isFlipkart ? "PID" : "ASIN"}, and sales volume upon upgrading.`
      );
      return;
    }
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const formatNum = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <>
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-slate-800 shadow-sm flex flex-col justify-start overflow-hidden min-w-0 h-full">
        <CardHeader className="min-h-[52px] h-auto sm:h-[54px] px-3.5 sm:px-5 py-2.5 sm:py-2 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between shrink-0 gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-200 tracking-tight flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse shrink-0" />
              <span className="truncate">What products are selling fastest?</span>
              {isFreeTier && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  <Lock className="w-2.5 h-2.5" /> Free Preview
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
              Top selling products on {isFlipkart ? "Flipkart" : "Amazon"}
            </p>
          </div>

          <Link
            href={`/sales?source=${isFlipkart ? "flipkart" : "amazon"}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors shrink-0 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-3.5 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="h-[38px] border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80">
                  <th className="py-2 px-3 pl-4 sm:pl-5 w-10 align-middle">#</th>
                  <th className="py-2 px-3 sm:px-4 align-middle min-w-[200px]">Product</th>
                  <th className="py-2 px-3 sm:px-4 align-middle">Category</th>
                  <th className="py-2 px-3 sm:px-4 text-right align-middle whitespace-nowrap">Sales</th>
                  <th className="py-2 px-3 sm:px-4 text-right align-middle whitespace-nowrap">Price</th>
                  <th className="py-2 px-3 sm:px-4 text-right align-middle whitespace-nowrap">Reviews</th>
                  <th className="py-2 px-3 pr-4 sm:pr-5 text-right align-middle whitespace-nowrap">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {products.map((prod, idx) => {
                  const isMysteryRow = isFreeTier && idx === 0;
                  const title = prod.product_title || prod.title || "Product";
                  const photo = prod.product_photo || prod.image;
                  const category = prod.category_name || prod.category || "General";
                  const price = prod.price || 0;
                  const reviews = prod.reviews || 0;
                  const rating = prod.rating || 0;
                  const salesNum = prod.daily_sales || 0;

                  return (
                    <tr
                      key={prod.id || idx}
                      onClick={() => handleProductClick(prod, idx)}
                      className={cn(
                        "h-[44px] hover:bg-sky-50/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group",
                        isMysteryRow && "bg-amber-500/[0.03] dark:bg-amber-500/[0.04] border-l-2 border-l-amber-500"
                      )}
                    >
                      <td className="py-0 px-3 pl-4 sm:pl-5 font-bold text-slate-400 text-xs align-middle">{idx + 1}</td>
                      <td className="py-0 px-3 sm:px-4 min-w-[200px] max-w-[260px] align-middle">
                        {isMysteryRow ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-300 dark:border-amber-600 shrink-0 p-0.5 flex items-center justify-center">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs group-hover:text-amber-600 transition-colors">
                                  #1 Selling Product ({isFlipkart ? "Flipkart" : "Amazon"})
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                                  <Lock className="w-2.5 h-2.5" /> Locked
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {isFlipkart ? "PID: ••••••••••••" : "ASIN: ••••••••••••"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 p-0.5 flex items-center justify-center overflow-hidden">
                              {photo ? (
                                <img src={photo} alt="" className="w-full h-full object-contain rounded-sm" />
                              ) : (
                                <span className="text-[9px] font-bold text-slate-400">SKU</span>
                              )}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {title}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-0 px-3 sm:px-4 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[130px] align-middle">
                        {category}
                      </td>
                      <td className="py-0 px-3 sm:px-4 text-right font-extrabold text-blue-600 dark:text-blue-400 align-middle whitespace-nowrap">
                        {isFreeTier ? (
                          <span className="filter blur-[4px] select-none opacity-70 inline-block" title="Upgrade to reveal sales count">
                            {formatSalesDisplay(salesNum)}
                          </span>
                        ) : (
                          formatSalesDisplay(salesNum)
                        )}
                      </td>
                      <td className="py-0 px-3 sm:px-4 text-right font-bold text-slate-800 dark:text-slate-200 align-middle whitespace-nowrap">
                        ₹{typeof price === "number" ? (price % 1 === 0 ? price.toLocaleString() : price.toFixed(2)) : price}
                      </td>
                      <td className="py-0 px-3 sm:px-4 text-right text-slate-500 font-medium align-middle whitespace-nowrap">
                        {formatNum(reviews)}
                      </td>
                      <td className="py-0 px-3 pr-4 sm:pr-5 text-right align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                          {typeof rating === "number" ? rating.toFixed(1) : rating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isFreeTier={isFreeTier}
        onUpgrade={triggerUpgrade}
      />

      {/* Upgrade Modal for Free Tier Users */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md p-6 rounded-2xl border shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <DialogHeader className="text-center space-y-2.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
              <Crown className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center tracking-tight">
              Unlock Top 500 Products
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto leading-relaxed">
              {upgradeTriggerReason || "Access all 500 top-selling products, exact sales volumes, and sorting."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3">
            {[
              "Complete Top 500 product list across all 50 pages",
              "Exact sales volume unblurred for every product",
              "Reveal Rank #1 product title, " + (isFlipkart ? "PID" : "ASIN") + ", and store link",
              "Sort by Reviews, Price, and Rating plus search"
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
    </>
  );
}
