"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Sparkles, TrendingUp, AlertTriangle, Clock,
  Lock, ChevronRight, Star, Zap, BarChart3, ArrowUpRight,
  ArrowDownRight, Minus, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Auth header helper ───────────────────────────────────────────────────────
function authHeaders(userId: string | null): HeadersInit {
  return {}; // No longer needed as we use session cookies
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────

const TIER_ORDER: Record<string, number> = { free: 0, basic: 1, premium: 2, enterprise: 3 };

function hasTier(userTier: string, required: string): boolean {
  return (TIER_ORDER[userTier?.toLowerCase()] ?? 0) >= (TIER_ORDER[required] ?? 99);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FestiveEvent {
  name: string;
  intensity: "peak" | "high" | "medium" | "low";
  emoji: string;
  year: number;
  start_date: string;
  end_date: string;
  days_away: number;
  is_active: boolean;
  is_upcoming: boolean;
}

interface CategoryOverview {
  category_name: string;
  avg_price: number | null;
  avg_sales_volume: number | null;
  avg_rating: number | null;
  product_count: number;
  locked: boolean;
}

interface CalendarData {
  year: number;
  events: FestiveEvent[];
  upcoming: FestiveEvent[];
  today: string;
}

interface OverviewData {
  source: string;
  top_categories: CategoryOverview[];
  next_festival: FestiveEvent | null;
  upgrade_message: string;
}

interface TrendPoint {
  week?: string;
  avg_price: number;
  min_price?: number;
  max_price?: number;
  avg_sv?: number;
  sample_size?: number;
}

interface StockRisk {
  ratio?: number;
  risk_level: "critical" | "high" | "medium" | "low" | "unknown";
  avg_sv?: number;
  max_sv?: number;
  n_products?: number;
}

interface TrendData {
  category_name: string;
  source: string;
  price_trend: TrendPoint[];
  stock_risk: StockRisk;
  velocity_all: { category_name: string; velocity: number; avg_price: number; products: number }[];
  velocity_rank: number | null;
  price_delta_pct: number | null;
  next_festival: FestiveEvent | null;
  data_points: number;
}

interface MarginScenario {
  label: string;
  price: number;
  gross_margin: number;
  gross_pct: number;
  platform_fee: number;
  net_margin: number;
  net_pct: number;
  viable: boolean;
}

interface MarginData {
  base_cost: number;
  market_range: { min: number; avg: number; max: number };
  scenarios: MarginScenario[];
  recommended_price: number;
  recommended_label: string;
  platform_fee_pct: number;
  category_name?: string;
  source?: string;
}

interface LaunchData {
  optimal_week: string | null;
  recommendation: string;
  price_trend: TrendPoint[];
  weeks_available: number;
  best_score?: number;
  category_name?: string;
  source?: string;
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

const fmt = (n: any, decimals = 0) => {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const fmtPrice = (n: any) => (n == null ? "—" : `₹${fmt(n, 0)}`);

const INTENSITY_COLORS: Record<string, string> = {
  peak:   "bg-rose-100 text-rose-800 border-rose-200",
  high:   "bg-amber-100 text-amber-800 border-amber-200",
  medium: "bg-sky-100 text-sky-800 border-sky-200",
  low:    "bg-slate-100 text-slate-600 border-slate-200",
};

const RISK_COLORS: Record<string, string> = {
  critical: "text-rose-600 bg-rose-50",
  high:     "text-orange-600 bg-orange-50",
  medium:   "text-amber-600 bg-amber-50",
  low:      "text-emerald-600 bg-emerald-50",
  unknown:  "text-slate-500 bg-slate-50",
};

// ─── Components ───────────────────────────────────────────────────────────────

function FestiveCalendarStrip({ events, upcoming }: { events: FestiveEvent[]; upcoming: FestiveEvent[] }) {
  const active  = events?.filter(e => e.is_active) ?? [];
  const soon    = upcoming?.filter(u => !u.is_active) ?? [];
  const display = [...active, ...soon].slice(0, 6);
  if (!display.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
      {display.map((ev, i) => (
        <div
          key={i}
          className={cn(
            "flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border text-center min-w-[120px]",
            ev.is_active
              ? "bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-100"
              : "bg-white border-slate-100"
          )}
        >
          <span className="text-xl">{ev.emoji}</span>
          <p className={cn("text-xs font-black truncate max-w-[100px]", ev.is_active ? "text-white" : "text-slate-800")}>
            {ev.name}
          </p>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
            ev.is_active
              ? "bg-white/20 text-white border-white/30"
              : INTENSITY_COLORS[ev.intensity]
          )}>
            {ev.is_active ? "LIVE NOW" : `${ev.days_away}d away`}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryCard({ cat, index }: { cat: CategoryOverview; index: number }) {
  if (cat.locked) {
    return (
      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 flex flex-col items-center justify-center gap-2 z-10">
          <Lock className="w-5 h-5 text-slate-400" />
          <p className="text-xs font-bold text-slate-500">Upgrade to Basic</p>
        </div>
        <div className="flex items-start justify-between gap-2 opacity-30">
          <p className="text-sm font-black text-slate-800 leading-tight">{cat.category_name}</p>
          <Badge variant="outline" className="text-[10px] font-bold shrink-0">#{index + 1}</Badge>
        </div>
        <p className="text-3xl font-black text-sky-600 blur-sm mt-2">₹ ——</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 hover:border-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-black text-slate-800 leading-tight">{cat.category_name}</p>
        <Badge variant="outline" className="text-[10px] font-bold shrink-0">#{index + 1}</Badge>
      </div>
      <p className="text-3xl font-black text-sky-600 tracking-tighter">{fmtPrice(cat.avg_price)}</p>
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-wider">
        <span>{fmt(cat.avg_sales_volume)} avg sales</span>
        <span>{fmt(cat.product_count)} products</span>
      </div>
      {cat.avg_rating != null && (
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="text-xs font-black">{Number(cat.avg_rating).toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data, valueKey = "avg_price" }: { data: TrendPoint[]; valueKey?: keyof TrendPoint }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const vals = data.map(d => (d[valueKey] as number) || 0);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const range = mx - mn || 1;

    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    vals.forEach((v, i) => {
      const x = (i / (vals.length - 1)) * W;
      const y = H - ((v - mn) / range) * (H - 8) - 4;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = "rgba(2,132,199,0.08)";
    ctx.fill();
  }, [data, valueKey]);

  if (!data?.length) return (
    <div className="h-12 flex items-center justify-center text-xs text-slate-400">No data</div>
  );
  return <canvas ref={canvasRef} width={200} height={48} className="w-full h-12" />;
}

function StockRiskBadge({ risk }: { risk: StockRisk }) {
  if (!risk) return null;
  const label = risk.risk_level?.toUpperCase() ?? "UNKNOWN";
  return (
    <span className={cn("text-[10px] font-black px-3 py-1 rounded-full", RISK_COLORS[risk.risk_level] || RISK_COLORS.unknown)}>
      {label} RISK
    </span>
  );
}

function PriceDeltaBadge({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  if (pct > 0) return (
    <span className="flex items-center gap-1 text-emerald-600 text-sm font-black">
      <ArrowUpRight className="w-4 h-4" /> +{pct}%
    </span>
  );
  if (pct < 0) return (
    <span className="flex items-center gap-1 text-rose-600 text-sm font-black">
      <ArrowDownRight className="w-4 h-4" /> {pct}%
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-slate-400 text-sm font-black">
      <Minus className="w-4 h-4" /> 0%
    </span>
  );
}

function LockedOverlay({ tier = "basic" }: { tier?: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 rounded-[2rem] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
      <Lock className="w-8 h-8 text-slate-400" />
      <p className="text-sm font-black text-slate-700">
        {tier === "basic" ? "Upgrade to Basic — ₹1,999/mo" : "Upgrade to Premium — ₹2,999/mo"}
      </p>
      <Button 
        onClick={() => router.push("/subscription")}
        size="sm" 
        className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black"
      >
        Upgrade Now
      </Button>
    </div>
  );
}

// ─── AI Forecast streaming panel ──────────────────────────────────────────────

interface AIForecastPanelProps {
  category: string;
  source: string;
  baseCost: string;
  userTier: string;
  userId: string | null;
}

function AIForecastPanel({ category, source, baseCost, userTier, userId }: AIForecastPanelProps) {
  const { toast } = useToast();
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const locked = !hasTier(userTier, "premium");

  useEffect(() => { setText(""); setError(null); }, [category, source]);

  const runForecast = async () => {
    if (locked) {
      toast({ title: "Premium Feature", description: "Please upgrade to Premium to use AI Festive Forecasts.", variant: "destructive" });
      return;
    }
    if (!category || !baseCost) {
      toast({ title: "Missing fields", description: "Select a category and enter your landing cost first.", variant: "destructive" });
      return;
    }

    setStreaming(true); setText(""); setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/festive/ai/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(userId) },
        credentials: "include",
        body: JSON.stringify({ category_name: category, source, base_cost: parseFloat(baseCost) }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail?.message ?? "AI service unavailable");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.replace("data: ", "").trim();
          if (payload === "[DONE]") break;
          try { setText(prev => prev + JSON.parse(payload)); } catch { /* skip */ }
        }
      }
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Forecast Error", description: e.message, variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="relative">
      {locked && <LockedOverlay tier="premium" />}
      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(15,23,42,0.12)] rounded-[2.5rem] bg-slate-950 text-white overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-white">AI Festive Forecast</CardTitle>
              <CardDescription className="text-sky-300/60 text-xs font-bold uppercase tracking-widest mt-1">
                Premium · Powered by AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {!text && !streaming && (
            <p className="text-sky-100/60 text-sm leading-relaxed">
              Get a personalised festive surge forecast — demand prediction, optimal pricing,
              stock prep advice, and exact listing timing for your category.
            </p>
          )}
          {streaming && !text && (
            <div className="flex items-center gap-3 text-sky-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-bold">Analysing market data…</span>
            </div>
          )}
          {text && (
            <div className="text-sky-50/90 text-sm leading-relaxed whitespace-pre-wrap font-mono border-l-4 border-sky-500/40 pl-6 py-2">
              {text}
              {streaming && <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-1" />}
            </div>
          )}
          {error && (
            <div className="text-rose-400 text-sm font-bold bg-rose-500/10 px-4 py-3 rounded-xl">{error}</div>
          )}
          <Button
            onClick={runForecast}
            disabled={streaming || locked || !category || !baseCost}
            className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-base disabled:opacity-50"
          >
            {streaming
              ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating…</>
              : <><Sparkles className="w-5 h-5 mr-2" /> Run AI Forecast</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Margin Simulation Table ───────────────────────────────────────────────────

function MarginSimTable({ data, userTier }: { data: MarginData | null; userTier: string }) {
  const locked = !hasTier(userTier, "premium");
  if (!data) return null;

  return (
    <div className="relative">
      {locked && <LockedOverlay tier="premium" />}
      <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" /> Margin Simulation
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Base cost: {fmtPrice(data.base_cost)} · After {data.platform_fee_pct}% platform fee
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Scenario", "Price", "Gross %", "Net %", ""].map((h, i) => (
                    <th key={i} className={cn("p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", i > 0 ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.scenarios?.map((sc, i) => (
                  <tr key={i} className={cn("border-b border-slate-50 last:border-0", sc.label === data.recommended_label ? "bg-sky-50" : "bg-white")}>
                    <td className="p-4 font-black text-slate-800">{sc.label}</td>
                    <td className="p-4 text-right font-bold">{fmtPrice(sc.price)}</td>
                    <td className="p-4 text-right font-bold text-slate-600">{sc.gross_pct}%</td>
                    <td className={cn("p-4 text-right font-black", sc.net_pct > 0 ? "text-emerald-600" : "text-rose-600")}>{sc.net_pct}%</td>
                    <td className="p-4 text-right">
                      {sc.label === data.recommended_label && <Badge className="bg-sky-600 text-white text-[9px] font-black">Best</Badge>}
                      {!sc.viable && <Badge variant="outline" className="text-rose-500 border-rose-200 text-[9px]">Loss</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 font-bold mt-4">
            Market range: {fmtPrice(data.market_range?.min)} – {fmtPrice(data.market_range?.max)} · avg {fmtPrice(data.market_range?.avg)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Launch Window Card ────────────────────────────────────────────────────────

function LaunchWindowCard({ data, userTier }: { data: LaunchData | null; userTier: string }) {
  const locked = !hasTier(userTier, "premium");
  if (!data) return null;

  return (
    <div className="relative">
      {locked && <LockedOverlay tier="premium" />}
      <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Optimal Launch Window</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium insight</p>
          </div>
        </div>
        {data.optimal_week && <p className="text-3xl font-black text-indigo-600">{data.optimal_week}</p>}
        <p className="text-sm text-slate-600 font-medium leading-relaxed">{data.recommendation}</p>
        <MiniSparkline data={data.price_trend} valueKey="avg_price" />
        <p className="text-[10px] text-slate-400 font-bold">{data.weeks_available} weeks of data analysed</p>
      </Card>
    </div>
  );
}

// ─── Velocity Chart ────────────────────────────────────────────────────────────

function VelocityChart({ data }: { data: { category_name: string; velocity: number }[] }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.velocity || 0)) || 1;

  return (
    <div className="space-y-2">
      {data.slice(0, 8).map((cat, i) => (
        <div key={i} className="flex items-center gap-3">
          <p className="text-xs font-bold text-slate-600 w-36 truncate shrink-0">{cat.category_name}</p>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${(cat.velocity / max) * 100}%` }} />
          </div>
          <p className="text-xs font-black text-slate-800 w-16 text-right shrink-0">{fmt(cat.velocity)}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function FestiveTrendContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id?.toString() ?? null;

  // ─── Tier: read from /api/festive/tier-info (single source of truth) ───────
  // This endpoint already fires on every page load (visible in your server logs).
  // It returns the full users row with subscription_tier (snake_case from DB).
  // We do NOT rely on user?.subscriptionTier from the auth context because the
  // JS camelCase mapping may not match the DB column name.
  const [userTier, setUserTier] = useState<string>("free");
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    // /api/festive/tier-info reads subscription_tier directly from the users table.
    // This is the single source of truth — no auth context field name guessing.
    fetch(`${API_BASE}/api/festive/tier-info`, { 
      headers: authHeaders(userId),
      credentials: "include"
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUserTier(data.tier ?? "free"))
      .catch(() => setUserTier("free"))
      .finally(() => setTierLoading(false));
  }, [userId]); // re-run on login/logout
  // ─────────────────────────────────────────────────────────────────────────

  // Form state
  const [source,     setSource]     = useState("amazon");
  const [category,   setCategory]   = useState("");
  const [baseCost,   setBaseCost]   = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Data state
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [trendData,    setTrendData]    = useState<TrendData | null>(null);
  const [launchData,   setLaunchData]   = useState<LaunchData | null>(null);
  const [marginData,   setMarginData]   = useState<MarginData | null>(null);

  // Loading flags
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingTrend,    setLoadingTrend]    = useState(false);
  const [loadingLaunch,   setLoadingLaunch]   = useState(false);
  const [loadingMargin,   setLoadingMargin]   = useState(false);

  // ── Calendar (free) ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/festive/calendar`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setCalendarData)
      .catch(() => {});
  }, []);

  // ── Overview (free endpoint, but send header for tier-aware locking) ──────
  useEffect(() => {
    setLoadingOverview(true);
    fetch(`${API_BASE}/api/festive/overview?source=${source}`, { 
      headers: authHeaders(userId),
      credentials: "include"
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setOverviewData)
      .catch(() => {})
      .finally(() => setLoadingOverview(false));
  }, [source, userId]);

  // ── Categories (Basic+) ───────────────────────────────────────────────────
  useEffect(() => {
    if (!hasTier(userTier, "basic")) return;
    fetch(`${API_BASE}/api/festive/categories?source=${source}`, { 
      headers: authHeaders(userId),
      credentials: "include"
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { category: string }[]) => setCategories(d.map(c => c.category)))
      .catch(() => {});
  }, [source, userTier, userId]);

  // ── Run full trend analysis ────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!category) {
      toast({ title: "Selection Required", description: "Please select a category to analyze." });
      return;
    }
    if (!hasTier(userTier, "basic")) {
      toast({ title: "Upgrade Required", description: "Category trend analysis requires Basic or Premium.", variant: "destructive" });
      return;
    }

    setTrendData(null); setMarginData(null); setLaunchData(null);
    const params  = new URLSearchParams({ category_name: category, source });
    const opts    = { 
      headers: authHeaders(userId),
      credentials: "include" as RequestCredentials
    };

    // Trend (Basic+)
    setLoadingTrend(true);
    fetch(`${API_BASE}/api/festive/trend-analysis?${params}`, opts)
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail?.message ?? "Failed");
        return r.json();
      })
      .then(setTrendData)
      .catch((err: any) => toast({ title: "Analysis Error", description: err.message, variant: "destructive" }))
      .finally(() => setLoadingTrend(false));

    // Premium features
    if (hasTier(userTier, "premium")) {
      if (baseCost) {
        setLoadingMargin(true);
        const mp = new URLSearchParams(params);
        mp.append("base_cost", baseCost);
        fetch(`${API_BASE}/api/festive/margin-sim?${mp}`, opts)
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(setMarginData)
          .catch(() => {})
          .finally(() => setLoadingMargin(false));
      }

      setLoadingLaunch(true);
      fetch(`${API_BASE}/api/festive/launch-window?${params}`, opts)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(setLaunchData)
        .catch(() => {})
        .finally(() => setLoadingLaunch(false));
    }
  };

  const isLoading = loadingTrend || loadingLaunch || loadingMargin;

  // Show a subtle loading state while tier is being confirmed from the server
  if (tierLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Festive <span className="text-sky-600">Trends</span>
          </h1>
          <p className="text-base text-slate-500 font-medium mt-2">
            Ride India's festive demand cycles — price smarter, stock right, list on time
          </p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border h-12 flex items-center",
          userTier === "premium"   ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : userTier === "basic"   ? "bg-sky-50 text-sky-700 border-sky-200"
          :                         "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          {userTier} plan
        </div>
      </div>

      {/* Calendar strip */}
      {calendarData && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Festive Events</p>
          <FestiveCalendarStrip events={calendarData.events} upcoming={calendarData.upcoming} />
        </div>
      )}

      {/* Config card */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
            <BarChart3 className="h-6 w-6 text-sky-600" /> Trend Analysis Setup
          </CardTitle>
          <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Configure your market parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Marketplace */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketplace</Label>
              <select
                value={source}
                onChange={e => { setSource(e.target.value); setCategory(""); setTrendData(null); }}
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
              >
                <option value="amazon">Amazon India</option>
                <option value="flipkart">Flipkart India</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Target Category {!hasTier(userTier, "basic") && <Lock className="inline w-3 h-3 ml-1" />}
              </Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={!hasTier(userTier, "basic")}
                className={cn(
                  "w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none appearance-none",
                  !hasTier(userTier, "basic") && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="">
                  {hasTier(userTier, "basic") ? "Select category…" : "Upgrade required"}
                </option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Base Cost */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Landing Cost (₹) {!hasTier(userTier, "premium") && <Lock className="inline w-3 h-3 ml-1 text-slate-300" />}
              </Label>
              <Input
                value={baseCost}
                onChange={e => setBaseCost(e.target.value)}
                type="number"
                placeholder="e.g. 500"
                min={1}
                className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50"
                disabled={!hasTier(userTier, "premium")}
              />
            </div>

            {/* Analysis Window */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analysis Window</Label>
              <div className="h-14 flex items-center px-6 rounded-2xl bg-slate-50 text-sm font-bold text-slate-500">
                90 days (auto)
              </div>
            </div>
          </div>

          <Button
            onClick={runAnalysis}
            disabled={isLoading || !hasTier(userTier, "basic") || !category}
            className="w-full h-16 rounded-[1.25rem] bg-sky-600 hover:bg-sky-700 text-white font-black text-base shadow-2xl shadow-sky-100 disabled:opacity-60"
          >
            {isLoading
              ? <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Analysing…</>
              : <><TrendingUp className="h-5 w-5 mr-3" /> Analyse Festive Trends</>}
          </Button>
        </CardContent>
      </Card>

      {/* Overview: Top Categories */}
      {overviewData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Top Trending Categories · {overviewData.source === "flipkart" ? "Flipkart" : "Amazon"}
            </p>
            {overviewData.next_festival && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-lg">{overviewData.next_festival.emoji}</span>
                <span className="font-bold">{overviewData.next_festival.name}</span>
                <Badge variant="outline" className={INTENSITY_COLORS[overviewData.next_festival.intensity]}>
                  {overviewData.next_festival.days_away}d away
                </Badge>
              </div>
            )}
          </div>

          {loadingOverview ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overviewData.top_categories?.map((cat, i) => (
                <CategoryCard key={i} cat={cat} index={i} />
              ))}
            </div>
          )}

          {!hasTier(userTier, "basic") && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-sky-800">Unlock all categories + 90-day trend charts</p>
                <p className="text-xs text-sky-600 font-medium mt-0.5">Basic plan — ₹1,999/month</p>
              </div>
              <Button 
                onClick={() => router.push("/subscription")}
                size="sm" 
                className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black shrink-0"
              >
                Upgrade <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Trend Analysis Results */}
      {trendData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price trend</p>
              <PriceDeltaBadge pct={trendData.price_delta_pct} />
              <p className="text-xs text-slate-500 font-medium">vs last week</p>
            </Card>
            <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category rank</p>
              <p className="text-3xl font-black text-slate-900">#{trendData.velocity_rank ?? "—"}</p>
              <p className="text-xs text-slate-500 font-medium">by sales velocity</p>
            </Card>
            <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock risk</p>
              <div className="pt-1"><StockRiskBadge risk={trendData.stock_risk} /></div>
              <p className="text-xs text-slate-500 font-medium">ratio {trendData.stock_risk?.ratio ?? "—"}x</p>
            </Card>
            <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data points</p>
              <p className="text-3xl font-black text-slate-900">{trendData.data_points}</p>
              <p className="text-xs text-slate-500 font-medium">weekly snapshots</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
              <div>
                <p className="text-sm font-black text-slate-800">Price Trend — {trendData.category_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">90-day rolling average</p>
              </div>
              <MiniSparkline data={trendData.price_trend} valueKey="avg_price" />
              {trendData.price_trend?.length > 0 && (
                <div className="flex justify-between text-xs text-slate-500 font-bold">
                  <span>Min: {fmtPrice(Math.min(...trendData.price_trend.map(d => d.avg_price)))}</span>
                  <span>Max: {fmtPrice(Math.max(...trendData.price_trend.map(d => d.avg_price)))}</span>
                </div>
              )}
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
              <div>
                <p className="text-sm font-black text-slate-800">Category Velocity Leaderboard</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Avg sales volume</p>
              </div>
              <VelocityChart data={trendData.velocity_all} />
            </Card>
          </div>

          {(loadingLaunch || loadingMargin || launchData || marginData) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loadingLaunch
                ? <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></Card>
                : <LaunchWindowCard data={launchData} userTier={userTier} />
              }
              {loadingMargin
                ? <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-sky-400" /></Card>
                : <MarginSimTable data={marginData} userTier={userTier} />
              }
            </div>
          )}

          {!hasTier(userTier, "premium") && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-indigo-800">Unlock Launch Window, Margin Simulation &amp; AI Forecast</p>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">Premium plan — ₹2,999/month</p>
              </div>
              <Button 
                onClick={() => router.push("/subscription")}
                size="sm" 
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shrink-0"
              >
                Upgrade <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* AI Forecast */}
      {(hasTier(userTier, "basic") || trendData) && (
        <AIForecastPanel
          category={category}
          source={source}
          baseCost={baseCost}
          userTier={userTier}
          userId={userId}
        />
      )}
    </div>
  );
}

export default function FestiveTrendsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-sky-600" />
      </div>
    }>
      <FestiveTrendContent />
    </Suspense>
  );
}