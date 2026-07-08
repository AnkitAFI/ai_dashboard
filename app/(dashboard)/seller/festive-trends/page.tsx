// import FeatureComingSoon from "@/components/dashboard/feature-coming-soon";

// export default function Page() {
//   return <FeatureComingSoon />;
// }


"use client";
import { API_BASE_URL } from "@/lib/config";

import { useSelectedProduct } from "@/lib/selected-product-context";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  Lock, Crown, Star, TrendingUp, TrendingDown, Minus,
  RefreshCw, Menu, Zap, CheckCircle, Package, AlertTriangle,
  Sparkles, Target, Activity, Calendar, Flame, ShoppingBag,
  BarChart2, ChevronRight, Info, ArrowUpRight, ArrowDownRight,
  MessageSquare, Shield, Clock, Boxes, CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine,
} from "recharts";

const BASE_URL = API_BASE_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtINR(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000)   return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${Number(val).toFixed(0)}`;
}

function fmtINRFull(val: number | null | undefined): string {
  if (val == null) return "—";
  return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function intensityColor(intensity: string): string {
  return intensity === "peak"   ? "#534AB7"
       : intensity === "high"   ? "#0F6E56"
       : intensity === "medium" ? "#854F0B"
       : "#64748b";
}

function intensityBg(intensity: string): string {
  return intensity === "peak"   ? "bg-violet-50 text-violet-700 border-violet-200"
       : intensity === "high"   ? "bg-emerald-50 text-emerald-700 border-emerald-200"
       : intensity === "medium" ? "bg-amber-50 text-amber-700 border-amber-200"
       : "bg-slate-50 text-slate-500 border-slate-200";
}

function readinessColor(score: number): string {
  return score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
}

function readinessLabel(score: number): string {
  return score >= 75 ? "Ready" : score >= 50 ? "Needs Work" : "At Risk";
}

function readinessBg(score: number): string {
  return score >= 75
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : score >= 50
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-600 border-red-200";
}

function positionBg(position: string): string {
  return position === "below_avg" || position === "below_floor"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : position === "on_market"
    ? "bg-sky-50 text-sky-700 border-sky-200"
    : position === "above_avg"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-600 border-red-200";
}

function positionLabel(position: string): string {
  return position === "below_floor" ? "Below Floor"
       : position === "below_avg"   ? "Below Avg"
       : position === "on_market"   ? "On Market"
       : position === "above_avg"   ? "Above Avg"
       : position === "premium"     ? "Premium"
       : position || "—";
}

function riskColor(level: string): string {
  return level === "critical" ? "#ef4444"
       : level === "high"     ? "#f59e0b"
       : level === "medium"   ? "#0ea5e9"
       : "#10b981";
}

function riskBg(level: string): string {
  return level === "critical" ? "bg-red-50 text-red-600 border-red-200"
       : level === "high"     ? "bg-amber-50 text-amber-700 border-amber-200"
       : level === "medium"   ? "bg-sky-50 text-sky-700 border-sky-200"
       : "bg-emerald-50 text-emerald-700 border-emerald-200";
}

// ── Helper to convert non-INR prices to INR ──────────────────────────────────
function getDisplayPrice(val: number | null | undefined, currency: string | null | undefined): number {
  if (val == null) return 0;
  const isINR = currency?.toUpperCase().trim() === "INR";
  return isINR ? val : val * 83;
}

// ── Tier Gate — identical pattern to price-comparison page ────────────────────
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
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${
          tier === "premium"
            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
            : "bg-gradient-to-r from-amber-500 to-orange-500"
        }`}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Festival chip ─────────────────────────────────────────────────────────────
function FestivalChip({ fest, compact = false }: { fest: any; compact?: boolean }) {
  const col = intensityColor(fest.intensity);
  const bg  = intensityBg(fest.intensity);
  return (
    <div
      className={`flex-shrink-0 border rounded-2xl text-center bg-white ${
        fest.is_active ? "ring-2 ring-offset-1 ring-violet-400" : ""
      } ${compact ? "px-3 py-2 min-w-[90px]" : "px-4 py-3 min-w-[112px]"}`}
      style={{ borderColor: col + "40" }}
    >
      <p className="text-lg leading-none mb-1">{fest.emoji}</p>
      <p className={`font-bold text-slate-800 leading-tight ${compact ? "text-[10px]" : "text-[11px]"}`}>
        {fest.name}
      </p>
      {fest.is_active ? (
        <span className="text-[10px] font-bold text-violet-600">● Live now</span>
      ) : (
        <p className="font-black mt-0.5" style={{ color: col, fontSize: compact ? 15 : 18 }}>
          {fest.days_away}
        </p>
      )}
      {!fest.is_active && (
        <p className="text-[9px] text-slate-400">days away</p>
      )}
      <div className="mt-1.5">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${bg}`}>
          {fest.intensity}
        </span>
      </div>
    </div>
  );
}

// ── Score bar — identical to widget ──────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const col = readinessColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: col }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color: col }}>{score}</span>
    </div>
  );
}

// ── Custom tooltip for charts ─────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-sky-600 font-bold">{fmtINRFull(payload[0]?.value)}</p>
    </div>
  );
};

// ── Risk meter (3 segments) ───────────────────────────────────────────────────
function RiskMeter({ level }: { level: string }) {
  const filled = level === "critical" ? 3 : level === "high" ? 2 : level === "medium" ? 1 : 0;
  const col    = riskColor(level);
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-1.5 w-6 rounded-full" style={{ background: i < filled ? col : "#e2e8f0" }} />
      ))}
      <span className="text-xs font-bold ml-1" style={{ color: col }}>{level?.toUpperCase()}</span>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabBtn({
  active, onClick, children, locked,
}: { active: boolean; onClick: () => void; children: React.ReactNode; locked?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? "bg-sky-600 text-white shadow-sm"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
      }`}
    >
      {locked && <Lock className="w-3 h-3" />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page content
// ─────────────────────────────────────────────────────────────────────────────
function SellerFestiveTrendsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { user }     = useAuth();
  const { toggle }   = useSidebar();
  const { selected } = useSelectedProduct();

  const sellerId = searchParams.get("seller_id") || selected?.sellerId || user?.seller_id || "";

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState<"readiness" | "pricing" | "reviews" | "margin" | "launch" | "insights">("readiness");
  const [snapshot, setSnapshot]             = useState<any>(null);
  const [readiness, setReadiness]           = useState<any>(null);
  const [priceBench, setPriceBench]         = useState<any>(null);
  const [reviewHealth, setReviewHealth]     = useState<any>(null);
  const [marginSim, setMarginSim]           = useState<any>(null);
  const [launchWindow, setLaunchWindow]     = useState<any>(null);
  const [calendar, setCalendar]             = useState<any>(null);
  const [tierInfo, setTierInfo]             = useState<any>(null);
  const [loading, setLoading]               = useState<Record<string, boolean>>({});
  const [baseCost, setBaseCost]             = useState<string>("950");
  const [selectedAsin, setSelectedAsin]     = useState<string>("");
  const [categoryName, setCategoryName]     = useState<string>("");

  const tier      = tierInfo?.tier || user?.subscriptionTier || "free";
  const isBasic   = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const get = useCallback(
    async (path: string, params: Record<string, string> = {}) => {
      const qs = new URLSearchParams({ ...params }).toString();
      const r  = await fetch(`${BASE_URL}/api/festive/seller/${path}${qs ? "?" + qs : ""}`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    },
    []
  );

  const load = useCallback(
    async (key: string, fn: () => Promise<any>, setter: (d: any) => void) => {
      setLoading((p) => ({ ...p, [key]: true }));
      try {
        const d = await fn();
        setter(d);
      } catch (e) {
        console.error(key, e);
      } finally {
        setLoading((p) => ({ ...p, [key]: false }));
      }
    },
    []
  );

  // ── Initial loads ─────────────────────────────────────────────────────────
  useEffect(() => {
    load("tier", () => get("tier-info"), setTierInfo);
    load("calendar", () => get("calendar"), setCalendar);
  }, [user?.email]);

  useEffect(() => {
    if (!sellerId) return;
    const params: Record<string, string> = { seller_id: sellerId };
    if (categoryName) params.category_name = categoryName;
    load("snapshot", () => get("snapshot", params), (d) => {
      setSnapshot(d);
      if (d?.products?.length && !selectedAsin) setSelectedAsin(d.products[0].asin);
      if (d?.products?.length && !categoryName) setCategoryName(d?.category_name || "");
    });
  }, [sellerId, user?.email]);

  // ── Tab-driven loads ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sellerId || !isBasic) return;
    const params: Record<string, string> = { seller_id: sellerId };
    if (categoryName) params.category_name = categoryName;

    if (activeTab === "readiness" && !readiness)
      load("readiness", () => get("readiness", params), setReadiness);

    if (activeTab === "pricing" && !priceBench)
      load("pricing", () => get("price-benchmark", params), setPriceBench);

    if (activeTab === "reviews" && !reviewHealth)
      load("reviews", () => get("review-health", { seller_id: sellerId }), setReviewHealth);
  }, [activeTab, sellerId, isBasic, categoryName]);

  useEffect(() => {
    if (!sellerId || !isPremium) return;

    if (activeTab === "margin" && selectedAsin && baseCost) {
      const params: Record<string, string> = {
        seller_id: sellerId, asin: selectedAsin,
        base_cost_inr: baseCost,
      };
      if (categoryName) params.category_name = categoryName;
      load("margin", () => get("margin-sim", params), setMarginSim);
    }

    if (activeTab === "launch" && categoryName && !launchWindow)
      load("launch", () => get("launch-window", { seller_id: sellerId, category_name: categoryName }), setLaunchWindow);
  }, [activeTab, selectedAsin, baseCost, isPremium, categoryName]);

  const upcomingFests: any[] = calendar?.upcoming?.slice(0, isBasic ? 12 : 3) || [];
  const nextPeak = upcomingFests.find((f: any) => f.intensity === "peak" || f.intensity === "high");

  // ── Spinner ───────────────────────────────────────────────────────────────
  const isLoading = Object.values(loading).some(Boolean);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-transparent">

      {/* ── Header — exact pattern from price-comparison ───────────────────── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
            <Menu className="w-5 h-5 text-sky-900" />
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" /> Festive Trends
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Your catalog readiness for Indian festivals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />}
          <Badge className={`text-xs font-bold ${
            tier === "premium" ? "bg-blue-100 text-blue-700"
            : tier === "basic" ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-600"
          }`}>
            {tier.toUpperCase()}
          </Badge>
          {!isPremium && (
            <button
              onClick={() => router.push("/subscription")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all"
            >
              <Crown className="w-3 h-3" /> Upgrade
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 py-6 space-y-6">

        {/* ── No seller ──────────────────────────────────────────────────── */}
        {!sellerId && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">No seller selected</p>
              <p className="text-sm text-slate-400 mt-1">Go to My Products to select a seller catalog.</p>
            </div>
            <button
              onClick={() => router.push("/seller/my-products")}
              className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              Go to My Products
            </button>
          </div>
        )}

        {sellerId && (
          <>
            {/* ── Festival Strip ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Upcoming Indian Festivals
                </p>
                {!isBasic && (
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> +{(calendar?.upcoming?.length || 12) - 3} more on Basic
                  </span>
                )}
              </div>
              {upcomingFests.length === 0 && loading.calendar ? (
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-28 h-24 rounded-2xl bg-slate-100 animate-pulse flex-shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {upcomingFests.map((f: any, i: number) => (
                    <FestivalChip key={i} fest={f} />
                  ))}
                  {!isBasic && (
                    <button
                      onClick={() => router.push("/subscription")}
                      className="flex-shrink-0 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-2xl px-4 py-3 min-w-[80px] text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                    >
                      <Lock className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-semibold">Basic</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── KPI Row ─────────────────────────────────────────────────── */}
            {snapshot && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total SKUs",
                    value: snapshot.total_skus,
                    sub: `${snapshot.displayed_skus} shown`,
                    icon: <ShoppingBag className="w-4 h-4 text-sky-500" />,
                  },
                  {
                    label: "Avg Readiness",
                    value: snapshot.catalog_kpis?.avg_readiness != null
                      ? `${snapshot.catalog_kpis.avg_readiness}/100`
                      : "—",
                    sub: readinessLabel(snapshot.catalog_kpis?.avg_readiness || 0),
                    icon: <Target className="w-4 h-4 text-emerald-500" />,
                    color: readinessColor(snapshot.catalog_kpis?.avg_readiness || 0),
                  },
                  {
                    label: "High Velocity SKUs",
                    value: snapshot.catalog_kpis?.high_velocity_skus ?? "—",
                    sub: "1K+ units/month",
                    icon: <Flame className="w-4 h-4 text-orange-500" />,
                  },
                  {
                    label: "Total Reviews",
                    value: (snapshot.catalog_kpis?.total_reviews || 0).toLocaleString("en-IN"),
                    sub: "across your catalog",
                    icon: <Star className="w-4 h-4 text-amber-500" />,
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2">{s.icon}<p className="text-xs text-slate-400 font-medium">{s.label}</p></div>
                    <p className="text-2xl font-black" style={s.color ? { color: s.color } : { color: "#0f172a" }}>
                      {s.value}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Next peak festival banner ───────────────────────────────── */}
            {nextPeak && (
              <div className="bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4"
                style={{ borderColor: intensityColor(nextPeak.intensity) + "30" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: intensityColor(nextPeak.intensity) + "15" }}
                >
                  {nextPeak.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">
                    {nextPeak.name} in {nextPeak.days_away} days
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${intensityBg(nextPeak.intensity)}`}>
                      {nextPeak.intensity}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {nextPeak.days_away > 35
                      ? `Source inventory now — supplier lead time is 21–30 days + 7–10 days FBA processing.`
                      : nextPeak.days_away > 14
                      ? `List new SKUs and festive bundles this week to index before the search surge.`
                      : `Festival is imminent — apply festive price premium immediately on all SKUs.`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black" style={{ color: intensityColor(nextPeak.intensity) }}>
                    {nextPeak.days_away}
                  </p>
                  <p className="text-[10px] text-slate-400">days</p>
                </div>
              </div>
            )}

            {/* ── Tabs ────────────────────────────────────────────────────── */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              <TabBtn active={activeTab === "readiness"} onClick={() => setActiveTab("readiness")}>
                <Target className="w-3.5 h-3.5" /> Readiness
              </TabBtn>
              <TabBtn active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")} locked={!isBasic}>
                <BarChart2 className="w-3.5 h-3.5" /> Price Benchmark
              </TabBtn>
              <TabBtn active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} locked={!isBasic}>
                <MessageSquare className="w-3.5 h-3.5" /> Review Health
              </TabBtn>
              <TabBtn active={activeTab === "margin"} onClick={() => setActiveTab("margin")} locked={!isPremium}>
                <Activity className="w-3.5 h-3.5" /> Margin Sim
              </TabBtn>
              <TabBtn active={activeTab === "launch"} onClick={() => setActiveTab("launch")} locked={!isPremium}>
                <Clock className="w-3.5 h-3.5" /> Launch Window
              </TabBtn>
              <TabBtn active={activeTab === "insights"} onClick={() => setActiveTab("insights")} locked={!isBasic}>
                <Zap className="w-3.5 h-3.5" /> AI Insights
              </TabBtn>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TAB: READINESS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "readiness" && (
              <div className="space-y-4">
                {/* Free: top 3 only */}
                {loading.snapshot && (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                  </div>
                )}

                {snapshot && (
                  <>
                    {/* Summary pills (Basic+) */}
                    {isBasic && readiness && (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Ready", val: readiness.summary?.ready, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                          { label: "Needs Work", val: readiness.summary?.needs_work, cls: "bg-amber-50 text-amber-700 border-amber-200" },
                          { label: "At Risk", val: readiness.summary?.at_risk, cls: "bg-red-50 text-red-600 border-red-200" },
                          { label: "No Prime", val: readiness.summary?.no_prime, cls: "bg-slate-50 text-slate-600 border-slate-200" },
                          { label: "Overpriced vs Mkt", val: readiness.summary?.overpriced_vs_mkt, cls: "bg-orange-50 text-orange-600 border-orange-200" },
                        ].map((s) => (
                          <span key={s.label} className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${s.cls}`}>
                            {s.val ?? "—"} {s.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Products table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700">
                          {isBasic ? `All ${snapshot.total_skus} SKUs` : "Top 3 SKUs by Readiness"}
                        </p>
                        {!isBasic && (
                          <span className="text-[10px] text-amber-600 font-semibold">
                            {snapshot.total_skus - 3} more locked · Basic
                          </span>
                        )}
                      </div>

                      <div className="divide-y divide-slate-50">
                        {(isBasic ? readiness?.products : snapshot?.products)?.map((p: any, i: number) => {
                          const score = p.readiness_score ?? 0;
                          return (
                            <div key={p.asin} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors ${p.locked ? "opacity-40" : ""}`}>
                              {/* Photo */}
                              <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {p.photo
                                  ? <img src={p.photo} alt="" className="w-full h-full object-contain p-0.5" />
                                  : <Package className="w-4 h-4 text-slate-300" />
                                }
                              </div>

                              {/* Title + ASIN */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{p.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-mono">{p.asin}</span>
                                  {p.is_prime && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">PRIME</span>
                                  )}
                                  {p.sales_volume && (
                                    <span className="text-[10px] text-slate-400">{p.sales_volume}</span>
                                  )}
                                </div>
                                {/* Score bar */}
                                <div className="mt-1.5 max-w-[180px]">
                                  {p.locked ? (
                                    <div className="h-1.5 bg-slate-100 rounded-full" />
                                  ) : (
                                    <ScoreBar score={score} />
                                  )}
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-black text-slate-800">
                                  {p.price != null ? fmtINRFull(getDisplayPrice(p.price, p.currency)) : "—"}
                                </p>
                                {isBasic && p.price_vs_market_pct != null && (
                                  <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                                    p.price_vs_market_pct > 0 ? "text-red-500" : "text-emerald-600"
                                  }`}>
                                    {p.price_vs_market_pct > 0
                                      ? <ArrowUpRight className="w-3 h-3" />
                                      : <ArrowDownRight className="w-3 h-3" />
                                    }
                                    {Math.abs(p.price_vs_market_pct)}% vs mkt
                                  </p>
                                )}
                              </div>

                              {/* Readiness badge */}
                              <div className="flex-shrink-0 text-right ml-1">
                                {p.locked ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                                ) : (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${readinessBg(score)}`}>
                                    {readinessLabel(score)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Locked row for free tier */}
                      {!isBasic && snapshot?.total_skus > 3 && (
                        <button
                          onClick={() => router.push("/subscription")}
                          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-amber-600 bg-amber-50 border-t border-amber-100 hover:bg-amber-100 transition-colors"
                        >
                          <Lock className="w-3 h-3" />
                          Unlock {snapshot.total_skus - 3} more SKUs — Basic · ₹1,999/mo
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* 90-day price trend (Basic+) */}
                    {isBasic && readiness?.price_trend_90d?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-sm font-bold text-slate-800 mb-1">90-Day Category Price Trend</p>
                        <p className="text-xs text-slate-400 mb-4">Market avg price per week — your category</p>
                        <ResponsiveContainer width="100%" height={160}>
                          <LineChart data={readiness.price_trend_90d} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                              tickFormatter={(v: string) => v ? v.slice(5) : ""} />
                            <YAxis tickFormatter={(v) => fmtINR(v)} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="avg_price" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                )}

                {/* Upgrade CTA for free tier */}
                {!isBasic && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-base">Unlock All SKUs + Market Benchmark</p>
                      <p className="text-amber-100 text-sm mt-0.5">
                        See readiness scores for your full catalog, 90-day price trends, and per-SKU price position vs market.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {["All SKU readiness scores", "90-day price trend", "Market min/avg/max", "Review health"].map((f) => (
                          <span key={f} className="flex items-center gap-1 text-xs text-amber-100">
                            <CheckCircle className="w-3 h-3 text-amber-200" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/subscription")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0"
                    >
                      <Crown className="w-4 h-4" /> Basic · ₹1,999/mo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: PRICE BENCHMARK
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "pricing" && (
              <div className="relative space-y-4">
                {!isBasic && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center gap-3 text-center">
                    <TierGate tier="basic" feature="Price Benchmark" />
                    <div className="opacity-0 pointer-events-none h-40" />
                  </div>
                )}

                {isBasic && (
                  <>
                    {loading.pricing && (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                      </div>
                    )}
                    {priceBench && (
                      <>
                        {/* Market summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {[
                            { label: "Market Min", value: fmtINRFull(priceBench.market?.min_price || 0) },
                            { label: "P25",         value: fmtINRFull(priceBench.market?.p25 || 0) },
                            { label: "Market Avg",  value: fmtINRFull(priceBench.market?.avg_price || 0), accent: true },
                            { label: "P75",         value: fmtINRFull(priceBench.market?.p75 || 0) },
                            { label: "Market Max",  value: fmtINRFull(priceBench.market?.max_price || 0) },
                          ].map((s) => (
                            <div key={s.label} className={`bg-white rounded-2xl p-3 border shadow-sm text-center ${s.accent ? "border-sky-200" : "border-slate-100"}`}>
                              <p className="text-[10px] text-slate-400 font-medium mb-1">{s.label}</p>
                              <p className={`text-base font-black ${s.accent ? "text-sky-700" : "text-slate-800"}`}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Per-SKU benchmark rows */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <div className="px-5 py-3 border-b border-slate-100">
                            <p className="text-sm font-bold text-slate-700">Your Price vs Market Range</p>
                            <p className="text-xs text-slate-400 mt-0.5">Blue = your price · Amber = market avg</p>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {priceBench.benchmarks?.map((b: any) => {
                              const min = priceBench.market?.min_price || 0;
                              const max = priceBench.market?.max_price || 0;
                              const avg = priceBench.market?.avg_price || 0;
                              const myP = getDisplayPrice(b.your_price, b.currency);
                              const range = max - min || 1;
                              const myPct  = Math.min(100, Math.max(0, ((myP  - min) / range) * 100));
                              const avgPct = Math.min(100, Math.max(0, ((avg  - min) / range) * 100));
                              return (
                                <div key={b.asin} className="px-5 py-3.5">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[60%]">{b.title}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${positionBg(b.position)}`}>
                                      {positionLabel(b.position)}
                                    </span>
                                  </div>
                                  {/* Range bar */}
                                  <div className="relative h-2 bg-slate-100 rounded-full mb-1.5 overflow-visible">
                                    <div className="absolute top-0 left-0 h-full bg-sky-200 rounded-full" style={{ width: `${myPct}%` }} />
                                    {/* Your price marker */}
                                    <div className="absolute top-[-3px] w-0.5 h-[14px] bg-sky-500 rounded-full" style={{ left: `calc(${myPct}% - 1px)` }} />
                                    {/* Market avg marker */}
                                    <div className="absolute top-[-3px] w-0.5 h-[14px] bg-amber-400 rounded-full" style={{ left: `calc(${avgPct}% - 1px)` }} />
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Min {fmtINR(min)}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1">
                                        <span className="w-2 h-0.5 bg-sky-500 inline-block rounded" /> You: <b className="text-slate-700">{fmtINRFull(myP)}</b>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="w-2 h-0.5 bg-amber-400 inline-block rounded" /> Avg: <b className="text-slate-700">{fmtINRFull(avg)}</b>
                                      </span>
                                    </div>
                                    <span>Max {fmtINR(max)}</span>
                                  </div>
                                  {b.pct_vs_avg != null && (
                                    <p className={`text-[10px] font-bold mt-1 flex items-center gap-0.5 ${b.pct_vs_avg > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                      {b.pct_vs_avg > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                      {Math.abs(b.pct_vs_avg)}% vs market avg
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: REVIEW HEALTH
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "reviews" && (
              <div className="relative space-y-4">
                {!isBasic && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden min-h-[200px]">
                    <TierGate tier="basic" feature="Review Health Dashboard" />
                  </div>
                )}

                {isBasic && (
                  <>
                    {loading.reviews && (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                      </div>
                    )}
                    {reviewHealth && (
                      <>
                        {/* Warning banner */}
                        {reviewHealth.festive_warning && (
                          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{reviewHealth.festive_warning}</p>
                          </div>
                        )}

                        {/* Summary KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            {
                              label: "Response Rate",
                              value: `${reviewHealth.catalog_summary?.overall_response_rate_pct ?? 0}%`,
                              cls: reviewHealth.catalog_summary?.overall_response_rate_pct === 0
                                ? "text-red-600" : "text-emerald-600",
                            },
                            {
                              label: "At-Risk SKUs",
                              value: reviewHealth.catalog_summary?.at_risk_skus ?? "—",
                              cls: (reviewHealth.catalog_summary?.at_risk_skus || 0) > 0 ? "text-amber-600" : "text-emerald-600",
                            },
                            {
                              label: "Unanswered 1-Stars",
                              value: reviewHealth.catalog_summary?.unanswered_1stars ?? "—",
                              cls: (reviewHealth.catalog_summary?.unanswered_1stars || 0) > 0 ? "text-red-600" : "text-emerald-600",
                            },
                            {
                              label: "Avg Rating",
                              value: `${reviewHealth.catalog_summary?.avg_star_rating ?? "—"} ★`,
                              cls: (reviewHealth.catalog_summary?.avg_star_rating || 0) >= 4.5 ? "text-emerald-600" : "text-amber-600",
                            },
                          ].map((s) => (
                            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                              <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Per-SKU review rows */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <div className="px-5 py-3 border-b border-slate-100">
                            <p className="text-sm font-bold text-slate-700">Per-SKU Review Health</p>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {reviewHealth.review_health?.map((h: any) => (
                              <div key={h.asin} className="px-5 py-3.5 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{h.title}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-500">{h.star_rating} ★ · {(h.num_ratings || 0).toLocaleString("en-IN")} reviews</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                                      h.response_rate_pct === 0
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    }`}>
                                      {h.response_rate_pct}% response
                                    </span>
                                  </div>
                                  {h.unanswered_1star?.length > 0 && (
                                    <p className="text-[10px] text-red-500 mt-1 line-clamp-1">
                                      ⚠ Unanswered 1★: "{h.unanswered_1star[0]?.substring(0, 60)}…"
                                    </p>
                                  )}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                  h.risk_flag === "healthy"               ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : h.risk_flag === "no_responses"        ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : h.risk_flag === "unanswered_negative" ? "bg-red-50 text-red-600 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {h.risk_flag === "healthy"               ? "Healthy"
                                  : h.risk_flag === "no_responses"         ? "No Responses"
                                  : h.risk_flag === "unanswered_negative"  ? "1★ Unanswered"
                                  : "Rating Risk"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: MARGIN SIMULATOR
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "margin" && (
              <div className="relative space-y-4">
                {!isPremium && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden min-h-[280px]">
                    <TierGate tier="premium" feature="Margin Simulator" />
                  </div>
                )}

                {isPremium && (
                  <>
                    {/* Controls */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-4 items-end">
                      <div className="flex-1 min-w-[160px]">
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Select SKU</label>
                        <select
                          value={selectedAsin}
                          onChange={(e) => { setSelectedAsin(e.target.value); setMarginSim(null); }}
                          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          {snapshot?.products?.map((p: any) => (
                            <option key={p.asin} value={p.asin}>
                              {p.title?.substring(0, 40)}…
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="min-w-[140px]">
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Your Landing Cost (₹)</label>
                        <input
                          type="number"
                          value={baseCost}
                          onChange={(e) => { setBaseCost(e.target.value); setMarginSim(null); }}
                          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                          placeholder="950"
                          min={1}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setMarginSim(null);
                          const params: Record<string, string> = {
                            seller_id: sellerId, asin: selectedAsin,
                            base_cost_inr: baseCost,
                          };
                          if (categoryName) params.category_name = categoryName;
                          load("margin", () => get("margin-sim", params), setMarginSim);
                        }}
                        className="px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors"
                      >
                        Calculate
                      </button>
                    </div>

                    {loading.margin && (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                      </div>
                    )}

                    {marginSim && (
                      <>
                        {/* Market range */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Your Cost",   value: fmtINRFull(marginSim.base_cost), cls: "text-slate-800" },
                            { label: "Market Min",  value: fmtINRFull(marginSim.market_range?.min || 0) },
                            { label: "Market Avg",  value: fmtINRFull(marginSim.market_range?.avg || 0), cls: "text-sky-700" },
                            { label: "Platform Fee",value: `${marginSim.platform_fee_pct}%`, cls: "text-red-500" },
                          ].map((s) => (
                            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                              <p className={`text-xl font-black ${s.cls || "text-slate-800"}`}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Recommended banner */}
                        {marginSim.recommended_label && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-emerald-800">
                                Recommended: {marginSim.recommended_label} — {fmtINRFull(marginSim.recommended_price || 0)}
                              </p>
                              {marginSim.festive_context && (
                                <p className="text-xs text-emerald-700 mt-0.5">{marginSim.festive_context.pricing_advice}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Scenario cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {marginSim.scenarios?.map((sc: any) => (
                            <div key={sc.label} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                              sc.label === marginSim.recommended_label
                                ? "border-emerald-300 ring-1 ring-emerald-300"
                                : sc.viable ? "border-slate-100" : "border-red-100 opacity-70"
                            }`}>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{sc.label}</p>
                              <p className="text-xl font-black text-slate-800">{fmtINRFull(sc.price || 0)}</p>
                              <p className={`text-sm font-bold mt-1 ${sc.viable ? "text-emerald-600" : "text-red-500"}`}>
                                {sc.viable ? "+" : ""}{fmtINRFull(sc.net_margin)} net
                              </p>
                              <p className="text-[10px] text-slate-400">{sc.net_pct}% margin</p>
                              <p className="text-[10px] text-slate-400">Fee: {fmtINRFull(sc.platform_fee)}</p>
                              <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                sc.viable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                              }`}>
                                {sc.viable ? "Viable" : "Loss"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: LAUNCH WINDOW
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "launch" && (
              <div className="relative space-y-4">
                {!isPremium && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden min-h-[280px]">
                    <TierGate tier="premium" feature="Launch Window Detector" />
                  </div>
                )}

                {isPremium && (
                  <>
                    {loading.launch && (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                      </div>
                    )}
                    {launchWindow && (
                      <>
                        {/* Stock risk */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-500 mb-1">Category Stock-Out Risk</p>
                            <RiskMeter level={launchWindow.stock_risk?.risk_level || "unknown"} />
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>Avg: {(launchWindow.stock_risk?.avg_sv || 0).toLocaleString("en-IN")} u/mo</p>
                            <p>Peak: {(launchWindow.stock_risk?.max_sv || 0).toLocaleString("en-IN")} u/mo</p>
                            <p>Ratio: {launchWindow.stock_risk?.ratio ?? "—"}×</p>
                          </div>
                        </div>

                        {/* Assumptions */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Sourcing lead", val: `${launchWindow.assumptions?.sourcing_lead_days}d` },
                            { label: "FBA processing", val: `${launchWindow.assumptions?.fba_processing_days}d` },
                            { label: "Total buffer", val: `${launchWindow.assumptions?.total_buffer_days}d` },
                            { label: "Index time", val: `${launchWindow.assumptions?.listing_index_weeks}w` },
                          ].map((a) => (
                            <span key={a.label} className="text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                              {a.label}: {a.val}
                            </span>
                          ))}
                        </div>

                        {/* Launch window cards */}
                        <div className="space-y-3">
                          {launchWindow.launch_windows?.map((w: any) => {
                            const col = intensityColor(w.intensity);
                            const isUrgent = w.days_away <= 14;
                            return (
                              <div key={w.festival_name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{w.festival_emoji}</span>
                                    <div>
                                      <p className="font-bold text-slate-800 text-sm">{w.festival_name}</p>
                                      <p className="text-[10px] text-slate-400">{w.festival_date} · {w.days_away} days away</p>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                    isUrgent ? "bg-red-50 text-red-600 border-red-200" : "bg-sky-50 text-sky-700 border-sky-200"
                                  }`}>
                                    List by {new Date(w.optimal_list_by).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] text-slate-400">Stock-out risk:</span>
                                  <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => {
                                      const filled = w.intensity === "peak" ? 3 : w.intensity === "high" ? 2 : 1;
                                      return <div key={i} className="h-1.5 w-5 rounded-full" style={{ background: i < filled ? col : "#e2e8f0" }} />;
                                    })}
                                  </div>
                                  <span className="text-[10px] font-bold" style={{ color: col }}>{w.stock_multiplier}× normal</span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed">{w.recommendation}</p>

                                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Boxes className="w-3 h-3" /> Source by {new Date(w.source_by).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB: AI INSIGHTS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "insights" && (
              <div className="relative space-y-4">
                {!isBasic && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden min-h-[280px]">
                    <TierGate tier="basic" feature="AI Festive Insights" />
                  </div>
                )}

                {isBasic && (
                  <>
                    {/* Static insights derived from snapshot data */}
                    {snapshot && (() => {
                      const products = snapshot.products || [];
                      const kpis     = snapshot.catalog_kpis || {};
                      const highVel  = products.filter((p: any) => (p.monthly_units || 0) >= 1000);
                      const noPrime  = products.filter((p: any) => !p.is_prime);
                      const insights = [
                        highVel.length > 0 && {
                          icon: <Flame className="w-4 h-4 text-orange-500" />,
                          title: `${highVel.length} high-velocity SKU${highVel.length > 1 ? "s" : ""} — stock up 3× before Diwali`,
                          body: `${highVel.map((p: any) => p.title?.split(" ").slice(0, 4).join(" ")).join(", ")} sell 1K+ units/month. Diwali (Oct 28) amplifies demand 3–4×. Supplier lead time is 21–30 days. Place your order no later than Sep 28.`,
                        },
                        noPrime.length > 0 && {
                          icon: <Shield className="w-4 h-4 text-blue-500" />,
                          title: `${noPrime.length} SKU${noPrime.length > 1 ? "s" : ""} missing Prime — enrol in FBA before Raksha Bandhan`,
                          body: `Prime badge lifts conversion 18–25% during gifting festivals. Raksha Bandhan (Aug 9) is a major gifting moment. FBA processing takes 7–10 days — ship by late July.`,
                        },
                        {
                          icon: <MessageSquare className="w-4 h-4 text-red-500" />,
                          title: "0% seller response rate — fix before Navratri search surge",
                          body: "Amazon India weights seller engagement in listing score. Unanswered 1-star reviews before Navratri (Oct 1) will suppress your listings at the highest-traffic point of the year. Respond to all recent reviews within 48 hours.",
                        },
                        nextPeak && {
                          icon: <Calendar className="w-4 h-4" style={{ color: intensityColor(nextPeak.intensity) }} />,
                          title: `${nextPeak.name} in ${nextPeak.days_away} days — create festive bundles now`,
                          body: `Festive bundles (e.g. "Camera Ready Kit") rank in "gifts under ₹5,000" search during ${nextPeak.name}. List bundle ASINs ${Math.min(nextPeak.days_away - 7, 42)} days before the festival to allow search indexing.`,
                        },
                        isPremium && {
                          icon: <Activity className="w-4 h-4 text-violet-500" />,
                          title: "Price inflection window: +12–15% category lift starts 6 weeks before Diwali",
                          body: "Market data shows a consistent Diwali price surge starting Oct 1. List festive bundles and raise premium SKU prices 8% by Sep 15 to capture the full pricing window before competitors react.",
                        },
                      ].filter(Boolean);

                      return insights.map((ins: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                            {ins.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 mb-1">{ins.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{ins.body}</p>
                          </div>
                        </div>
                      ));
                    })()}

                    {/* Premium: AI SSE forecast card */}
                    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                      {!isPremium && <TierGate tier="premium" feature="AI Forecast (Insydz)" />}
                      <div className={`flex gap-3 ${!isPremium ? "blur-sm pointer-events-none" : ""}`}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm mb-1">AI Festive Forecast</p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Personalised demand forecast, pricing strategy, stock prep, and listing actions for your catalog — powered by Insydz, streamed in real-time.
                          </p>
                          {isPremium && (
                            <button
                              onClick={() => router.push(`/seller/festive-ai?seller_id=${sellerId}&category=${encodeURIComponent(categoryName)}`)}
                              className="mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Run AI Forecast
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Upgrade CTA (non-premium) ────────────────────────────────── */}
            {!isPremium && (
              <div className={`rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isBasic
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                  : "bg-gradient-to-r from-amber-500 to-orange-500"
              }`}>
                <div>
                  <p className="font-bold text-base">
                    {isBasic ? "Unlock Margin Simulator & Launch Windows" : "Unlock Full Festive Intelligence"}
                  </p>
                  <p className={`text-sm mt-0.5 ${isBasic ? "text-blue-100" : "text-amber-100"}`}>
                    {isBasic
                      ? "Know exactly when to list and what margin to target — Premium · ₹2,999/mo"
                      : "Price benchmarking, review health, and AI insights for your full catalog — Basic · ₹1,999/mo"}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {(isBasic
                      ? ["Margin simulator", "Launch window per festival", "AI SSE forecast", "Stock-out risk"]
                      : ["All SKU readiness", "90-day price trend", "Review health", "5 AI insights"]
                    ).map((f) => (
                      <span key={f} className="flex items-center gap-1 text-xs opacity-90">
                        <CheckCircle className="w-3 h-3 opacity-70" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => router.push("/subscription")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0"
                  style={{ color: isBasic ? "#2563eb" : "#d97706" }}
                >
                  <Crown className="w-4 h-4" /> {isBasic ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function SellerFestiveTrendsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    }>
      <SellerFestiveTrendsContent />
    </Suspense>
  );
}