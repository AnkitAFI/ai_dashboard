"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  Lock, Crown, Star, TrendingUp, TrendingDown,
  Minus, BarChart2, RefreshCw, Menu, X,
  Zap, CheckCircle, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Sparkles,
  Target, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com");

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
function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 bg-white/85 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "premium" ? "bg-blue-50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "premium" ? "text-blue-500" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-slate-800 text-sm">{feature}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
        </p>
      </div>
      <button
        onClick={() => router.push("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Data Quality Badge ────────────────────────────────────────────────────────
function DataQualityBadge({ quality, count }: { quality: string; count?: number }) {
  if (quality === "live") return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {count ? `${count} matched` : "Live"}
    </span>
  );
  if (quality === "limited") return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> Limited data ({count})
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> No comparable products
    </span>
  );
}

// ── Position badge ────────────────────────────────────────────────────────────
function PositionBadge({ position }: { position: string }) {
  const map: Record<string, { icon: any; cls: string }> = {
    "Above Market": { icon: TrendingUp, cls: "bg-red-50 text-red-600 border-red-200" },
    "Below Market": { icon: TrendingDown, cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    "Competitive":  { icon: Minus, cls: "bg-blue-50 text-blue-600 border-blue-200" },
  };
  const cfg = map[position] || map["Competitive"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {position}
    </span>
  );
}

// ── Similarity pill ───────────────────────────────────────────────────────────
function SimilarityPill({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const cls = pct >= 50 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 25 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {pct}% match
    </span>
  );
}

const ChartTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-sky-600 font-bold">{fmt(payload[0]?.value, currency)}</p>
    </div>
  );
};

function PriceComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();

  const asin     = searchParams.get("asin") || "";
  const sellerId = searchParams.get("seller_id") || user?.seller_id || "";

  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(false);

  const tier       = data?.tier || user?.subscriptionTier || "free";
  const isBasic    = tier === "basic" || tier === "premium";
  const isPremium  = tier === "premium";
  const currency   = data?.currency || "USD";

  useEffect(() => {
    if (!asin || !sellerId) return;
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    fetch(`${BASE_URL}/api/comparison/price?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email]);

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

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
        <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
              <Menu className="w-5 h-5 text-sky-900" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-600" /> Price Comparison
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">Benchmark your pricing against real similar products</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {tier.toUpperCase()}
            </Badge>
            {!isPremium && (
              <button onClick={() => router.push("/subscription")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 py-6 space-y-6">
          {!asin && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                <BarChart2 className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">No product selected</p>
                <p className="text-sm text-slate-400 mt-1">Click any product from My Products to compare pricing.</p>
              </div>
              <button onClick={() => router.push("/seller/my-products")} className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
                Go to My Products
              </button>
            </div>
          )}

          {asin && loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-slate-500 font-medium">Finding similar products & analysing prices…</p>
            </div>
          )}

          {asin && !loading && data && (
            <>
              {/* ── Selected Product Card ─────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {data.product_photo
                    ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" />
                    : <Package className="w-8 h-8 text-slate-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-base line-clamp-2">{data.product_title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-400 font-mono">{data.asin}</span>
                    {data.is_prime && <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">PRIME</Badge>}
                    {data.is_best_seller && <Badge className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1.5 py-0">BEST SELLER</Badge>}
                    {data.sales_volume && <span className="text-xs text-slate-500">{data.sales_volume}</span>}
                    {isBasic && <DataQualityBadge quality={data.data_quality} count={data.competitor_count} />}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-black text-sky-700">{fmt(data.current_price, currency)}</p>
                  {data.original_price && data.original_price !== data.current_price && (
                    <p className="text-xs text-slate-400 line-through">{fmt(data.original_price, currency)}</p>
                  )}
                  {data.discount_pct != null && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{data.discount_pct}% off</span>
                  )}
                </div>
              </div>

              {/* ── Free Tier Stats ──────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Current Price", value: fmt(data.current_price, currency), sub: currency, accent: true },
                  { label: "Original / MRP", value: fmt(data.original_price, currency) },
                  { label: "Discount", value: data.discount_pct != null ? `${data.discount_pct}%` : "—", sub: "off MRP" },
                  { label: "No. of Offers", value: data.num_offers != null ? String(data.num_offers) : "—", sub: "competing sellers" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                    <p className={`text-xl font-black ${s.accent ? "text-sky-700" : "text-slate-800"}`}>{s.value}</p>
                    {s.sub && <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>}
                  </div>
                ))}
              </div>

              {/* ── Basic+: Market Stats ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Min Offer Price", value: fmt(data.min_offer_price, currency), sub: "lowest competing seller" },
                  { label: "Market Average", value: fmt(data.market_avg, currency), sub: `${data.competitor_count ?? "—"} similar products` },
                  { label: "Market Range", value: `${fmtShort(data.market_min, currency)} – ${fmtShort(data.market_max, currency)}`, sub: "min – max", wide: false },
                  { label: "Your Position", value: null, position: data.price_position, sub: data.price_percentile != null ? `top ${data.price_percentile}% of market` : null },
                ].map((s: any) => (
                  <div key={s.label} className="relative bg-white rounded-2xl p-4 border border-slate-100 shadow-sm overflow-hidden">
                    {!isBasic && <TierGate tier="basic" feature={s.label} />}
                    <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                    {s.position
                      ? <PositionBadge position={s.position} />
                      : <p className="text-xl font-black text-slate-800">{s.value}</p>
                    }
                    {s.sub && <p className="text-xs text-slate-400 mt-1">{s.sub}</p>}
                  </div>
                ))}
              </div>

              {/* ── Top Competitors Table (Basic+) ───────────────────────────── */}
              {isBasic && data.top_competitors?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-sky-500" /> Most Similar Competitors
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Ranked by product title & category match</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {/* Your product row */}
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <div className="w-9 h-9 rounded-lg bg-white border border-sky-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {data.product_photo
                          ? <img src={data.product_photo} alt="" className="w-full h-full object-contain p-0.5" />
                          : <Package className="w-4 h-4 text-slate-300" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-sky-700 line-clamp-1">{(data.product_title || "").substring(0, 55)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{data.asin} · YOU</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-sky-700">{fmt(data.current_price, currency)}</p>
                        {data.position && <PositionBadge position={data.price_position} />}
                      </div>
                    </div>
                    {data.top_competitors.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {c.photo
                            ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" />
                            : <Package className="w-4 h-4 text-slate-300" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 line-clamp-1">{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">{c.asin}</span>
                            <SimilarityPill score={c.similarity_score} />
                            {c.is_prime && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">PRIME</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-slate-800">{fmt(c.price, currency)}</p>
                          {c.price_diff_pct != null && (
                            <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${c.price_diff_pct > 0 ? "text-red-500" : "text-emerald-600"}`}>
                              {c.price_diff_pct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {Math.abs(c.price_diff_pct)}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Market Bar Chart (Basic+) ─────────────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                {!isBasic && <TierGate tier="basic" feature="Market Price Chart" />}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Your Price vs. Market</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Based on {data.competitor_count ?? "—"} similar products</p>
                  </div>
                  {data.price_position && <PositionBadge position={data.price_position} />}
                </div>
                <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} margin={{ left: 10, right: 10, top: 4, bottom: 4 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => fmtShort(v, currency)}
                        tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip currency={currency} />} />
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
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                {!isBasic && <TierGate tier="basic" feature="Price Band Density" />}
                <h3 className="font-bold text-slate-800 text-sm mb-1">Price Band Density</h3>
                <p className="text-xs text-slate-400 mb-4">Green = less competition · Red = crowded · Blue = your price band</p>
                <div className={`space-y-3 ${!isBasic ? "blur-sm pointer-events-none" : ""}`}>
                  {(data.price_bands || Array(5).fill({ label: "—", count: 0, density: "Low", your_price_in_band: false })).map((b: any, i: number) => {
                    const maxCount = Math.max(...(data.price_bands || [{ count: 1 }]).map((x: any) => x.count), 1);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 w-28 shrink-0 font-mono">{b.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{
                            width: `${Math.max((b.count / maxCount) * 100, 4)}%`,
                            background: b.your_price_in_band ? "#0ea5e9" : densityColor[b.density] || "#94a3b8",
                          }} />
                        </div>
                        <span className="text-xs text-slate-500 w-20 text-right">{b.count} products</span>
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
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">No comparable products found</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      This product may be in a niche category not yet covered in our database. Market stats will populate as more similar products are tracked.
                    </p>
                  </div>
                </div>
              )}

              {/* ── AI Pricing Tip (Premium) ──────────────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="AI Pricing Recommendation" />}
                <div className={`flex gap-3 ${!isPremium ? "blur-sm pointer-events-none" : ""}`}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 text-sm">AI Pricing Recommendation</p>
                      {isPremium && data.competitor_count && (
                        <span className="text-[10px] text-slate-400">based on {data.competitor_count} products</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {data.ai_pricing_tip || "Analysing your price vs market trends…"}
                    </p>
                    {isPremium && data.ai_velocity_insight && (
                      <div className="mt-3 flex items-start gap-2 bg-sky-50 rounded-xl p-3">
                        <Activity className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-sky-700">{data.ai_velocity_insight}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Your Other Products (Premium) ────────────────────────────── */}
              {isPremium && data.seller_other_products?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-sky-500" /> Your Other Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.seller_other_products.map((p: any, i: number) => (
                      <button key={i}
                        onClick={() => router.push(`/seller/price-comparison?asin=${p.asin}&seller_id=${sellerId}`)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {p.photo ? <img src={p.photo} alt={p.title} className="w-full h-full object-contain p-0.5" /> : <Package className="w-5 h-5 text-slate-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-sky-600 font-bold mt-0.5">{fmt(p.price, currency)}</p>
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
