"use client";
import { API_BASE_URL } from "@/lib/config";

import { useSelectedProduct } from "@/lib/selected-product-context";
import { useState, useEffect, Suspense } from "react";
import { useSessionState } from "@/hooks/use-session-state";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Lock, Crown, Star, TrendingUp, TrendingDown,
  Minus, BarChart2, RefreshCw, Menu, X,
  Zap, CheckCircle, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Sparkles,
  Target, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const BASE_URL = API_BASE_URL;

function fmt(val: number | null | undefined, currency = "USD"): string {
  if (val == null) return "—";
  const sym = currency === "INR" ? "₹" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  return `${sym}${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtShort(val: number | null | undefined, currency = "USD"): string {
  if (val == null) return "—";
  const sym = currency === "INR" ? "₹" : "$";
  if (val >= 100000) return `${sym}${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${sym}${(val / 1000).toFixed(1)}K`;
  return `${sym}${val.toFixed(0)}`;
}

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature, isDark }: { tier: "basic" | "premium" | "enterprise"; feature: string; isDark: boolean }) {
  const router = useRouter();
  return (
    <div className={`absolute inset-0 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3 ${isDark ? 'bg-slate-900/85' : 'bg-white/85'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/50" : "bg-blue-50" : isDark ? "bg-amber-900/50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "text-blue-400" : "text-blue-500" : isDark ? "text-amber-400" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feature}</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
          {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
        </p>
      </div>
      <button
        onClick={() => router.push("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Data Quality Badge ────────────────────────────────────────────────────────
function DataQualityBadge({ quality, count, isDark }: { quality: string; count?: number; isDark: boolean }) {
  if (quality === "live") return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {count ? `${count} matched` : "Live"}
    </span>
  );
  if (quality === "limited") return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
      <AlertTriangle className="w-3 h-3" /> Limited data ({count})
    </span>
  );
  return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
      <AlertTriangle className="w-3 h-3" /> No comparable products
    </span>
  );
}

// ── Position badge ────────────────────────────────────────────────────────────
function PositionBadge({ position, isDark }: { position: string; isDark: boolean }) {
  const map: Record<string, { icon: any; lightCls: string; darkCls: string }> = {
    "Above Market": { icon: TrendingUp, lightCls: "bg-red-50 text-red-600 border-red-200", darkCls: "bg-red-900/30 text-red-400 border-red-800/50" },
    "Below Market": { icon: TrendingDown, lightCls: "bg-emerald-50 text-emerald-600 border-emerald-200", darkCls: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" },
    "Competitive":  { icon: Minus, lightCls: "bg-blue-50 text-blue-600 border-blue-200", darkCls: "bg-blue-900/30 text-blue-400 border-blue-800/50" },
  };
  const cfg = map[position] || map["Competitive"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${isDark ? cfg.darkCls : cfg.lightCls}`}>
      <Icon className="w-3.5 h-3.5" /> {position}
    </span>
  );
}

// ── Similarity pill ───────────────────────────────────────────────────────────
function SimilarityPill({ score, isDark }: { score: number; isDark: boolean }) {
  const pct = Math.round(score * 100);
  const cls = pct >= 50 ? isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 25 ? isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-700 border-amber-200"
    : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {pct}% match
    </span>
  );
}

const ChartTooltip = ({ active, payload, label, currency, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`border rounded-xl p-3 shadow-lg text-xs ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <p className={`font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</p>
      <p className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{fmt(payload[0]?.value, currency)}</p>
    </div>
  );
};

function PriceComparisonContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { selected } = useSelectedProduct();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const asin     = searchParams.get("asin")      || selected?.asin      || "";
  const sellerId = searchParams.get("seller_id") || selected?.sellerId  || user?.seller_id || "";

  const [data, setData]         = useSessionState<any>("seller_price_comp_data", null);
  const [lastFetchedAsin, setLastFetchedAsin] = useSessionState<string>("seller_price_comp_asin", "");
  const [loading, setLoading]   = useState(false);

  const tier       = data?.tier || user?.subscriptionTier || "free";
  const isBasic    = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium  = tier === "premium" || tier === "enterprise";
  const currency   = data?.currency || "USD";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!asin || !sellerId) return;
    if (data && lastFetchedAsin === asin) return; // Already have data for this ASIN

    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    fetch(`${BASE_URL}/api/comparison/price?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setData(d);
          setLastFetchedAsin(asin);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email, data, lastFetchedAsin]);

  const barData = data
    ? [
        { name: "Market Min", value: data.market_min,    fill: "#94a3b8" },
        { name: "Your Price", value: data.current_price, fill: "#0ea5e9" },
        { name: "Market Avg", value: data.market_avg,    fill: "#f59e0b" },
        { name: "Market Max", value: data.market_max,    fill: "#ef4444" },
      ].filter((d) => d.value != null)
    : [];

  const densityColor: Record<string, string> = {
    High: "#ef4444", Medium: "#f59e0b", Low: "#10b981",
  };

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
        <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
              <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
            </button>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
              <BarChart2 className={`w-6 h-6 animate-pulse ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                {t('sellerPages.priceCompTitle', 'Price Comparison')}
              </h1>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('sellerPages.priceCompSubtitle', 'Benchmark your pricing against real similar products.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs font-bold ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" : tier === "basic" ? isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
              {tier.toUpperCase()}
            </Badge>
            {!isPremium && (
              <button onClick={() => router.push("/subscription")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 py-6 space-y-6">
          {!asin && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-sky-900/30' : 'bg-sky-100'}`}>
                <BarChart2 className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{t('sellerPages.noProductSelected', 'No product selected')}</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t('sellerPages.priceCompSub', 'Click any product from My Products to compare pricing.')}</p>
              </div>
              <button onClick={() => router.push("/seller/my-products")} className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
                {t('sellerPages.goToMyProducts', 'Go to My Products')}
              </button>
            </div>
          )}

          {asin && loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Finding similar products & analysing prices…</p>
              <p className={`text-xs animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>We are analyzing the data. This may take 1–2 minutes.</p>
            </div>
          )}

          {asin && !loading && data && (
            <>
              {/* ── Selected Product Card ─────────────────────────────────────── */}
              <div className={`rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  {data.product_photo
                    ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" />
                    : <Package className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{data.product_title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.asin}</span>
                    {data.is_prime && <Badge className={`text-[10px] px-1.5 py-0 ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>PRIME</Badge>}
                    {data.is_best_seller && <Badge className={`text-[10px] px-1.5 py-0 ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>BEST SELLER</Badge>}
                    {data.sales_volume && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.sales_volume}</span>}
                    {isBasic && <DataQualityBadge quality={data.data_quality} count={data.competitor_count} isDark={isDark} />}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-3xl font-black ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{fmt(data.current_price, currency)}</p>
                  {data.original_price && data.original_price !== data.current_price && (
                    <p className={`text-xs line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmt(data.original_price, currency)}</p>
                  )}
                  {data.discount_pct != null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50'}`}>{data.discount_pct}% off</span>
                  )}
                </div>
              </div>

              {/* ── Free Tier Stats ──────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Current Price", value: fmt(data.current_price, currency), sub: currency, accent: true, tip: "The price at which your product is currently listed for sale on Amazon." },
                  { label: "Original / MRP", value: fmt(data.original_price, currency), tip: "The Maximum Retail Price (MRP) printed on your product. Amazon shows a strikethrough on this." },
                  { label: "Discount", value: data.discount_pct != null ? `${data.discount_pct}%` : "—", sub: "off MRP", tip: "How much percentage discount you are offering below the MRP. A higher discount attracts more buyers." },
                  { label: "No. of Offers", value: data.num_offers != null ? String(data.num_offers) : "—", sub: "competing sellers", tip: "How many different sellers are offering this same product. More sellers = more competition for the Buy Box." },
                ].map((s: any) => (
                  <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className={`text-xs font-medium mb-1 flex items-center ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      {s.label}<InfoTip text={s.tip} isDark={isDark} />
                    </div>
                    <p className={`text-xl font-black ${s.accent ? isDark ? "text-sky-400" : "text-sky-700" : isDark ? "text-slate-200" : "text-slate-800"}`}>{s.value}</p>
                    {s.sub && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.sub}</p>}
                  </div>
                ))}
              </div>

              {/* ── Basic+: Market Stats ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Min Offer Price", value: fmt(data.min_offer_price, currency), sub: "lowest competing seller", tip: "The cheapest price any other seller is offering this product for. If your price is higher, you may lose the Buy Box." },
                  { label: "Market Average", value: fmt(data.market_avg, currency), sub: `${data.competitor_count ?? "—"} similar products`, tip: "The average selling price of similar products in your category. Use this as a benchmark for your pricing strategy." },
                  { label: "Market Range", value: `${fmtShort(data.market_min, currency)} – ${fmtShort(data.market_max, currency)}`, sub: "min – max", wide: false, tip: "The price range across all competitors — from the cheapest to the most expensive product in this category." },
                  { label: "Your Position", value: null, position: data.price_position, sub: data.price_percentile != null ? `top ${data.price_percentile}% of market` : null, tip: "Where your price sits relative to the market — 'Cheap', 'Competitive', 'Premium', or 'Expensive'." },
                ].map((s: any) => (
                  <div key={s.label} className={`relative rounded-2xl p-4 border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    {!isBasic && <TierGate tier="basic" feature={s.label} isDark={isDark} />}
                    <div className={`text-xs font-medium mb-1 flex items-center ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      {s.label}<InfoTip text={s.tip} isDark={isDark} />
                    </div>
                    {s.position
                      ? <PositionBadge position={s.position} isDark={isDark} />
                      : <p className={`text-xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{s.value}</p>
                    }
                    {s.sub && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.sub}</p>}
                  </div>
                ))}
              </div>

              {/* ── Top Competitors Table (Basic+) ───────────────────────────── */}
              {isBasic && data.top_competitors && (
                <div className={`rounded-2xl border shadow-sm p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <Target className="w-4 h-4 text-sky-500" /> Most Similar Competitors
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Ranked by product title & category match</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {/* Your product row */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-sky-900/20 border-sky-800/50' : 'bg-sky-50 border-sky-100'}`}>
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-sky-800/50' : 'bg-white border-sky-100'}`}>
                        {data.product_photo
                          ? <img src={data.product_photo} alt="" className="w-full h-full object-contain p-0.5" />
                          : <Package className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold line-clamp-1 ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{(data.product_title || "").substring(0, 55)}</p>
                        <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.asin} · YOU</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-black ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{fmt(data.current_price, currency)}</p>
                        {data.position && <PositionBadge position={data.price_position} isDark={isDark} />}
                      </div>
                    </div>
                    {data.top_competitors.map((c: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 hover:border-sky-800/50' : 'bg-slate-50 border-slate-100 hover:border-sky-200'}`}>
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                          {c.photo
                            ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" />
                            : <Package className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{c.asin}</span>
                            <SimilarityPill score={c.similarity_score} isDark={isDark} />
                            {c.is_prime && <span className={`text-[10px] font-bold px-1 rounded ${isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'}`}>PRIME</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{fmt(c.price, currency)}</p>
                          {c.price_diff_pct != null && (
                            <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${c.price_diff_pct > 0 ? isDark ? "text-red-400" : "text-red-500" : isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                              {c.price_diff_pct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {Math.abs(c.price_diff_pct)}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {data.top_competitors.length === 0 && (
                      <div className={`p-4 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                        <p className="text-xs">No direct competitors found matching your specific product keywords.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Market Bar Chart (Basic+) ─────────────────────────────────── */}
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isBasic && <TierGate tier="basic" feature="Market Price Chart" isDark={isDark} />}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Your Price vs. Market</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Based on {data.competitor_count ?? "—"} similar products</p>
                  </div>
                  {data.price_position && <PositionBadge position={data.price_position} isDark={isDark} />}
                </div>
                <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} margin={{ left: 10, right: 10, top: 4, bottom: 4 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => fmtShort(v, currency)}
                        tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip currency={currency} isDark={isDark} />} />
                      {data.current_price && (
                        <ReferenceLine y={data.current_price} stroke="#0ea5e9" strokeDasharray="4 4" strokeWidth={1.5} />
                      )}
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Price Band Density (Basic+) ───────────────────────────────── */}
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isBasic && <TierGate tier="basic" feature="Price Band Density" isDark={isDark} />}
                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Price Band Density</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Green = less competition · Red = crowded · Blue = your price band</p>
                <div className={`space-y-3 ${!isBasic ? "blur-sm pointer-events-none" : ""}`}>
                  {(data.price_bands || Array(5).fill({ label: "—", count: 0, density: "Low", your_price_in_band: false })).map((b: any, i: number) => {
                    const maxCount = Math.max(...(data.price_bands || [{ count: 1 }]).map((x: any) => x.count), 1);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`text-xs w-28 shrink-0 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{b.label}</span>
                        <div className={`flex-1 rounded-full h-2.5 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className="h-full rounded-full transition-all duration-500" style={{
                            width: `${Math.max((b.count / maxCount) * 100, 4)}%`,
                            background: b.your_price_in_band ? "#0ea5e9" : densityColor[b.density] || (isDark ? "#475569" : "#94a3b8"),
                          }} />
                        </div>
                        <span className={`text-xs w-20 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{b.count} products</span>
                        <span className="text-xs font-bold w-16 text-right" style={{ color: b.your_price_in_band ? "#0ea5e9" : densityColor[b.density] }}>
                          {b.your_price_in_band ? "← You" : b.density}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Insufficient data warning ─────────────────────────────────── */}
              {isBasic && data.data_quality === "insufficient" && (
                <div className={`border rounded-2xl p-4 flex items-start gap-3 ${isDark ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'}`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>No comparable products found</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-500/80' : 'text-amber-700'}`}>
                      This product may be in a niche category not yet covered in our database. Market stats will populate as more similar products are tracked.
                    </p>
                  </div>
                </div>
              )}

              {/* ── AI Pricing Tip (Premium) ──────────────────────────────────── */}
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="AI Pricing Recommendation" isDark={isDark} />}
                <div className={`flex gap-3 ${!isPremium ? "blur-sm pointer-events-none" : ""}`}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI Pricing Recommendation</p>
                      {isPremium && data.competitor_count && (
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>based on {data.competitor_count} products</span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {data.ai_pricing_tip || "Analysing your price vs market trends…"}
                    </p>
                    {isPremium && data.ai_velocity_insight && (
                      <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 ${isDark ? 'bg-sky-900/20' : 'bg-sky-50'}`}>
                        <Activity className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                        <p className={`text-xs ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{data.ai_velocity_insight}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Your Other Products (Premium) ────────────────────────────── */}
              {isPremium && data.seller_other_products?.length > 0 && (
                <div className={`rounded-2xl border shadow-sm p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <h3 className={`font-bold text-sm mb-3 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    <Package className="w-4 h-4 text-sky-500" /> Your Other Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.seller_other_products.map((p: any, i: number) => (
                      <button key={i}
                        onClick={() => router.push(`/seller/price-comparison?asin=${p.asin}&seller_id=${sellerId}`)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isDark ? 'bg-slate-800 border-slate-700 hover:border-sky-800/50 hover:bg-sky-900/20' : 'bg-slate-50 border-slate-100 hover:border-sky-200 hover:bg-sky-50'}`}
                      >
                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                          {p.photo ? <img src={p.photo} alt={p.title} className="w-full h-full object-contain p-0.5" /> : <Package className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.title}</p>
                          <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{fmt(p.price, currency)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Upgrade CTA ───────────────────────────────────────────────── */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-base">Unlock Full Price Intelligence</p>
                    <p className="text-blue-100 text-sm mt-0.5">
                      {!isBasic
                        ? "Get smart competitor matching, market benchmarks & AI pricing tips — Basic · ₹1,999/mo"
                        : "Get AI pricing recommendations and cross-product comparisons — Premium · ₹2,999/mo"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {(!isBasic
                        ? ["Smart competitor matching", "Price band density", "Percentile ranking", "AI pricing tip"]
                        : ["AI pricing tip", "Velocity insight", "Portfolio comparison"]
                      ).map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                          <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => router.push("/subscription")} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
                    <Crown className="w-4 h-4" /> Upgrade Now
                  </button>
                </div>
              )}
            </>
          )}
        </main>
    </div>
  );
}

export default function PriceComparisonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <PriceComparisonContent />
    </Suspense>
  );
}
