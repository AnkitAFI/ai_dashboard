import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Search, Lock, Crown, CheckCircle, X, RefreshCw,
  TrendingUp, AlertCircle, Sparkles, ChevronDown, ChevronUp,
  BookOpen, ShoppingBag, Star, Users, ArrowRight,
} from "lucide-react";

const API = "http://localhost:8000/api";

const CHART_STYLE = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderRadius: "12px",
  border: "1.5px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 14px",
};

// ── Types ──────────────────────────────────────────────────────────────────

interface ScoreBreakdown {
  rating_gap: number;
  review_thinness: number;
  demand_signal: number;
  price_gap: number;
}

interface Competitor {
  asin?: string;
  title: string;
  rating: number;
  review_count: number;
  price: number;
  weakness: string;
  platform: "amazon" | "flipkart";
}

interface Opportunity {
  id: string;
  product_niche: string;
  score: number;
  gap_summary: string;
  category: string;
  platform: "amazon" | "flipkart" | "both";
  search_volume_estimate: number;
  avg_price: number;
  avg_rating: number;
  avg_reviews: number;
  competitor_count: number;
  est_revenue_min: number;
  est_revenue_max: number;
  top_keyword: string;
  score_breakdown: ScoreBreakdown;
  competitors: Competitor[];
  trend_direction: "up" | "down" | "steady";
  trend_pct: number;
}

interface ScanResult {
  query: string;
  category: string;
  platform: string;
  total_found: number;
  tier: string;
  scans_used: number;
  scans_limit: number;
  opportunities: Opportunity[];
  locked_count: number;
}

interface UpgradeModal {
  open: boolean;
  feature: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function inr(n: number | null | undefined): string {
  const num = Number(n);
  if (n === undefined || n === null || isNaN(num)) return "—";
  if (num >= 100000) return "₹" + (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return "₹" + Math.round(num).toLocaleString("en-IN");
  return "₹" + Math.round(num);
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 65) return "bg-blue-50 border-blue-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "High opportunity";
  if (score >= 65) return "Good opportunity";
  if (score >= 50) return "Moderate";
  return "Crowded";
}

function extractErr(e: unknown): string {
  const err = e as Record<string, unknown>;
  const detail = (err?.response as Record<string, unknown>)?.data
    ? ((err.response as Record<string, unknown>).data as Record<string, unknown>)?.detail
    : undefined;
  if (!detail) return (err?.message as string) ?? "Something went wrong.";
  if (typeof detail === "string") return detail;
  return JSON.stringify(detail);
}

// ── ScoreBar ───────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value * 3.125, 100)}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-6 text-right">+{value}</span>
    </div>
  );
}

// ── OpportunityCard ────────────────────────────────────────────────────────

function OpportunityCard({
  opp, index, isBasicPlus, isPremium, onUpgrade,
}: {
  opp: Opportunity;
  index: number;
  isBasicPlus: boolean;
  isPremium: boolean;
  onUpgrade: (f: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const trendIcon = opp.trend_direction === "up"
    ? <span className="text-emerald-600 font-semibold text-xs">↑ {opp.trend_pct}% trending</span>
    : opp.trend_direction === "down"
    ? <span className="text-red-500 font-semibold text-xs">↓ {opp.trend_pct}% declining</span>
    : <span className="text-slate-400 text-xs">— steady</span>;

  return (
    <Card className={`bg-white/90 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all ${expanded ? "ring-1 ring-blue-200" : ""}`}>
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${scoreBg(opp.score)}`}>
              <span className={scoreColor(opp.score)}>{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 leading-tight">{opp.product_niche}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-400">{opp.category}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  opp.platform === "both" ? "bg-purple-100 text-purple-700" :
                  opp.platform === "amazon" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {opp.platform === "both" ? "Amazon + Flipkart" : opp.platform === "amazon" ? "Amazon.in" : "Flipkart"}
                </span>
                {isPremium && trendIcon}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className={`shrink-0 text-center px-3 py-1.5 rounded-xl border ${scoreBg(opp.score)}`}>
            <div className={`text-xl font-black ${scoreColor(opp.score)}`}>{opp.score}</div>
            <div className={`text-[10px] font-medium ${scoreColor(opp.score)}`}>{scoreLabel(opp.score)}</div>
          </div>
        </div>

        {/* Gap summary */}
        <div className="flex items-start gap-2 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">{opp.gap_summary}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
          {[
            { label: "Est. revenue", val: `${inr(opp.est_revenue_min)}–${inr(opp.est_revenue_max)}/mo` },
            { label: "Avg price", val: inr(opp.avg_price) },
            { label: "Avg rating", val: `★ ${Number(opp.avg_rating).toFixed(1)}` },
            { label: "Avg reviews", val: opp.avg_reviews.toLocaleString() },
            { label: "Competitors", val: String(opp.competitor_count) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 mb-0.5">{s.label}</p>
              <p className="text-xs font-bold text-slate-700">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Score breakdown — Basic+ */}
        {isBasicPlus ? (
          <div className="space-y-1.5 mb-3">
            <ScoreBar label="Rating gap" value={opp.score_breakdown.rating_gap} color="#3b82f6" />
            <ScoreBar label="Review thinness" value={opp.score_breakdown.review_thinness} color="#8b5cf6" />
            <ScoreBar label="Demand signal" value={opp.score_breakdown.demand_signal} color="#10b981" />
            <ScoreBar label="Price gap" value={opp.score_breakdown.price_gap} color="#f59e0b" />
          </div>
        ) : (
          <div className="relative mb-3">
            <div className="space-y-1.5 opacity-20 blur-sm pointer-events-none select-none">
              <ScoreBar label="Rating gap" value={22} color="#3b82f6" />
              <ScoreBar label="Review thinness" value={18} color="#8b5cf6" />
              <ScoreBar label="Demand signal" value={15} color="#10b981" />
              <ScoreBar label="Price gap" value={10} color="#f59e0b" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => onUpgrade("Score breakdown")}
                className="flex items-center gap-1.5 text-xs px-4 py-1.5 bg-white border border-slate-300 rounded-full shadow-sm font-medium text-slate-700 hover:border-blue-300 transition-colors"
              >
                <Lock className="w-3 h-3 text-amber-500" /> Unlock breakdown — Basic
              </button>
            </div>
          </div>
        )}

        {/* Expand button for competitors */}
        {isBasicPlus && opp.competitors && opp.competitors.length > 0 && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide" : "Show"} top {opp.competitors.length} competitors
          </button>
        )}

        {!isBasicPlus && (
          <button
            onClick={() => onUpgrade("Competitor deep-dive")}
            className="flex items-center gap-1.5 text-xs text-amber-600 font-medium hover:text-amber-800 transition-colors"
          >
            <Lock className="w-3 h-3" /> View competitor weaknesses — Basic
          </button>
        )}

        {/* Competitors expanded */}
        {expanded && isBasicPlus && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top competitors &amp; weaknesses</p>
            {opp.competitors.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="shrink-0 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{c.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">★ {Number(c.rating).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400">{c.review_count.toLocaleString()} reviews</span>
                    <span className="text-[10px] text-slate-400">{inr(c.price)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      c.platform === "amazon" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}>{c.platform}</span>
                  </div>
                  <p className="text-[10px] text-red-600 font-medium mt-1">⚠ {c.weakness}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium: watchlist + trend */}
        {isPremium && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Top keyword: <span className="font-semibold text-slate-600">{opp.top_keyword}</span></span>
            <button className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors">
              + Watch niche
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── LockedCard ─────────────────────────────────────────────────────────────

function LockedCard({ position, onUpgrade }: { position: number; onUpgrade: (f: string) => void }) {
  return (
    <div
      className="relative rounded-2xl border border-slate-200 bg-white/60 overflow-hidden cursor-pointer group"
      onClick={() => onUpgrade("Full results")}
    >
      <div className="p-5 blur-sm opacity-30 pointer-events-none select-none">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-black text-emerald-600">{position}</div>
          <div>
            <div className="h-3 w-40 bg-slate-200 rounded mb-2" />
            <div className="h-2 w-24 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 backdrop-blur-[1px]">
        <Lock className="w-5 h-5 text-amber-500" />
        <p className="text-sm font-semibold text-slate-700">Result #{position} locked</p>
        <p className="text-xs text-slate-500">Upgrade to Basic to unlock all results</p>
        <span className="mt-1 text-xs px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium shadow group-hover:shadow-md transition-all">
          Unlock — ₹1,999/mo
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function WhiteSpaceFinder() {
  const { user } = useAuth();
  const userId = user?.id;

  const [query, setQuery]             = useState("");
  const [category, setCategory]       = useState("all");
  const [platform, setPlatform]       = useState<"amazon" | "flipkart" | "both">("both");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<ScanResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [upgradeModal, setUpgrade]    = useState<UpgradeModal>({ open: false, feature: "" });
  const [isMobileMenu, setMobileMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tier         = result?.tier ?? "free";
  const isBasicPlus  = tier === "basic" || tier === "premium";
  const isPremium    = tier === "premium";
  const scansUsed    = result?.scans_used ?? 0;
  const scansLimit   = result?.scans_limit ?? 3;
  const scanPct      = Math.min((scansUsed / scansLimit) * 100, 100);

  const [categories, setCategories] = useState<string[]>(["all"]);

useEffect(() => {
  axios.get(`${API}/white-space/categories`, { params: { platform } })
    .then(res => {
      setCategories(["all", ...res.data.categories]);
      setCategory("all"); // reset selection when platform changes
    })
    .catch(() => {});
}, [platform]); // re-runs when platform changes

  const runScan = useCallback(async () => {
    if (!query.trim()) { inputRef.current?.focus(); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/white-space/scan`, {
        query:     query.trim(),
        category:  category === "all" ? null : category,
        platform,
        user_id:   userId?.toString() ?? "",
      });
      setResult(res.data as ScanResult);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setUpgrade({ open: true, feature: "White space scan" });
      } else if (status === 429) {
        setError("You've used all your scans for this month. Upgrade for more.");
      } else {
        setError(extractErr(e));
      }
    } finally {
      setLoading(false);
    }
  }, [query, category, platform, userId]);

  const visibleOpps   = result?.opportunities ?? [];
  const lockedCount   = result?.locked_count ?? 0;

  // Chart data for score distribution
  const chartData = visibleOpps.map((o) => ({
    name: o.product_niche.length > 18 ? o.product_niche.slice(0, 18) + "…" : o.product_niche,
    score: o.score,
    revenue: o.est_revenue_max,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#E3F2FD] to-[#DFF5FF] flex flex-col lg:flex-row">

      {/* ── Upgrade Modal ── */}
      {upgradeModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{upgradeModal.feature}</h3>
              <p className="text-slate-500 text-sm mb-5">Upgrade to unlock this feature.</p>
              <div className="grid grid-cols-2 gap-3 mb-5 text-left text-xs">
                {[
                  {
                    tier: "Basic · ₹1,999/mo",
                    feats: ["20 scans/month", "Full results unlocked", "Score breakdown", "Top 5 competitors", "Amazon + Flipkart combined"],
                  },
                  {
                    tier: "Premium · ₹2,999/mo",
                    feats: ["Unlimited scans", "Watchlist & weekly alerts", "Trend data (90 days)", "Export to CSV", "IndiaMart supplier links"],
                  },
                ].map((plan) => (
                  <div key={plan.tier} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="font-semibold text-slate-700 mb-2">{plan.tier}</p>
                    {plan.feats.map((f) => (
                      <p key={f} className="text-slate-500 flex items-center gap-1 mb-0.5">
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {f}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  onClick={() => setUpgrade({ open: false, feature: "" })}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow"
                  onClick={() => (window.location.href = "/subscription")}
                >
                  <Crown className="w-4 h-4" /> Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      {isMobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenu(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileMenu(false)}><X className="w-5 h-5" /></button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30"><Sidebar /></aside>

      {/* ── Main ── */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">

        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-2xl px-6 sm:px-12 py-4 sm:py-5 mb-6 flex items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenu(true)} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
              <span className="text-xl font-bold">☰</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-sky-900">Opportunity Finder</h2>
              <p className="text-slate-500 text-sm mt-0.5">Discover untapped product opportunities — India market</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-xs font-semibold ${
              tier === "premium" ? "bg-blue-100 text-blue-800" :
              tier === "basic"   ? "bg-amber-100 text-amber-800" :
              "bg-slate-100 text-slate-600"
            }`}>
              {tier.toUpperCase()}
            </Badge>
          </div>
        </header>

        <main className="px-4 sm:px-6 flex-1 pb-12 space-y-5">

          {/* ── Search Card ── */}
          <Card className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runScan()}
                    placeholder='Search a category, e.g. "kitchen", "baby care", "fitness"'
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button
                  onClick={runScan}
                  disabled={loading || !query.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[120px]"
                >
                  {loading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</>
                    : <><Sparkles className="w-4 h-4" /> Find gaps</>
                  }
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                  {categories.map((c) => (
    <option key={c} value={c}>
      {c === "all" ? "All categories" : c}
    </option>
  ))}
</select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Platform</label>
                  <div className="flex rounded-lg overflow-hidden border border-slate-300">
                    {(["both", "amazon", "flipkart"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`px-3 py-2 text-xs font-medium transition-all ${
                          platform === p
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {p === "both" ? "Both" : p === "amazon" ? "Amazon.in" : "Flipkart"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scan counter */}
                {result && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-slate-500">Scans:</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${scanPct >= 90 ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${scanPct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${scanPct >= 90 ? "text-red-600" : "text-slate-600"}`}>
                      {scansUsed}/{isBasicPlus ? (isPremium ? "∞" : 20) : 3}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick search pills */}
              {!result && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400">Try:</span>
                  {["kitchen", "baby care", "fitness", "health supplements", "home organization", "pet care"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); }}
                      className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors border border-slate-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-2xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/70 rounded-2xl shadow-sm animate-pulse">
                  <CardContent className="p-5">
                    <div className="flex gap-3 mb-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-3.5 w-48 bg-slate-200 rounded mb-2" />
                        <div className="h-2.5 w-24 bg-slate-100 rounded" />
                      </div>
                      <div className="w-14 h-12 bg-slate-200 rounded-xl" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded-xl mb-3" />
                    <div className="grid grid-cols-5 gap-2">
                      {[1,2,3,4,5].map((j) => <div key={j} className="h-10 bg-slate-100 rounded-xl" />)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Results ── */}
          {result && !loading && (
            <>
              {/* Summary bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800">
                    {result.total_found} opportunities found
                  </h3>
                  <span className="text-sm text-slate-400">for "{result.query}"</span>
                </div>
                {result.total_found > 0 && (
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Top score: <strong className="text-emerald-600">{Math.max(...visibleOpps.map((o) => o.score))}</strong></span>
                    <span>Avg competition: <strong className="text-slate-700">{Math.round(visibleOpps.reduce((a, o) => a + o.competitor_count, 0) / (visibleOpps.length || 1))}</strong></span>
                  </div>
                )}
              </div>

              {/* Chart (Basic+) */}
              {isBasicPlus && chartData.length > 0 && (
                <Card className="bg-white/80 border border-slate-200 rounded-2xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" /> Opportunity scores
                    </CardTitle>
                    <CardDescription>Higher = less competition + stronger demand signal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData} margin={{ left: 0, right: 10, top: 4, bottom: 40 }} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={CHART_STYLE}
                          formatter={(v: unknown) => [String(v), "Score"]}
                        />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                          {chartData.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={entry.score >= 80 ? "#10b981" : entry.score >= 65 ? "#3b82f6" : entry.score >= 50 ? "#f59e0b" : "#ef4444"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Opportunity cards */}
              <div className="space-y-4">
                {visibleOpps.map((opp, i) => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    index={i}
                    isBasicPlus={isBasicPlus}
                    isPremium={isPremium}
                    onUpgrade={(f) => setUpgrade({ open: true, feature: f })}
                  />
                ))}

                {/* Locked results */}
                {lockedCount > 0 && Array.from({ length: lockedCount }).map((_, i) => (
                  <LockedCard
                    key={`locked-${i}`}
                    position={visibleOpps.length + i + 1}
                    onUpgrade={(f) => setUpgrade({ open: true, feature: f })}
                  />
                ))}
              </div>

              {/* Upgrade nudge for free tier */}
              {!isBasicPlus && result.total_found > 0 && (
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {lockedCount} more opportunities are waiting
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                      Basic unlocks all results, score breakdowns, and the top 5 competitor weaknesses per niche.
                      If it saves you from one bad ₹50K inventory mistake — it's paid for itself.
                    </p>
                    <button
                      onClick={() => setUpgrade({ open: true, feature: "Full results" })}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 transition-all"
                    >
                      <Crown className="w-4 h-4" /> Upgrade to Basic — ₹1,999/mo <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              )}

              {/* Premium nudge for basic */}
              {isBasicPlus && !isPremium && result.total_found > 0 && (
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">Want weekly alerts on these niches?</p>
                      <p className="text-xs text-slate-500 mt-0.5">Premium adds watchlists, trend data, alerts when a new competitor enters, and CSV export.</p>
                    </div>
                    <button
                      onClick={() => setUpgrade({ open: true, feature: "Watchlist & alerts" })}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all"
                    >
                      <Crown className="w-3.5 h-3.5" /> Upgrade
                    </button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ── Empty state ── */}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                <Search className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Find your next winning product</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Search any category to see real white spaces — niches with high demand and weak competition on Amazon.in and Flipkart.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm w-full">
                {[
                  { icon: <Star className="w-4 h-4 text-amber-500" />, label: "Rating gap analysis" },
                  { icon: <Users className="w-4 h-4 text-blue-500" />, label: "Real competitor data" },
                  { icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />, label: "Live sales estimates" },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-200 text-center">
                    {f.icon}
                    <span className="text-xs text-slate-500">{f.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
                <BookOpen className="w-4 h-4 shrink-0" />
                Free tier: 3 scans/month · 3 results per scan · upgrade to unlock all
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}