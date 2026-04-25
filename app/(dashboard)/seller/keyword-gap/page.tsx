"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Lock, Crown, RefreshCw, Package,
  Search, TrendingUp, CheckCircle, AlertTriangle,
  Zap, Target, BarChart2, ChevronDown, ChevronUp,
  Lightbulb, FileText, Star, ArrowRight, Info,
  Sparkles, Eye, EyeOff, Filter, Layers, Cpu, Loader2,
  Menu, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface KeywordItem {
  keyword: string;
  comp_freq: number;
  priority: "High" | "Medium" | "Low";
  is_partial?: boolean;
  is_bigram?: boolean;
  semantic_sim_to_yours?: number;
}

interface Competitor {
  asin: string;
  title: string;
  photo?: string;
  similarity: number;
  is_prime?: boolean;
  star_rating?: number;
  num_ratings?: number;
}

interface HeatmapItem {
  keyword: string;
  freq: number;
  in_yours: boolean;
}

// ── Cluster Metadata ──────────────────────────────────────────────────────────
const CLUSTER_META: Record<string, any> = {
  "Capacity & Storage": { emoji: "💾", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  "Speed & Performance": { emoji: "⚡", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  "Durability & Build": { emoji: "🛡️", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  "Brand & Series": { emoji: "🏷️", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  "Compatibility": { emoji: "🔌", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  "Other": { emoji: "📦", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
};

function clusterMeta(name: string) {
  return CLUSTER_META[name] || CLUSTER_META["Other"];
}

// ── Components ────────────────────────────────────────────────────────────────

function PlacementBadge({ placement }: { placement: string }) {
  const map: Record<string, string> = {
    title: "bg-violet-100 text-violet-700 border-violet-200",
    bullets: "bg-amber-100 text-amber-700 border-amber-200",
    backend: "bg-sky-100 text-sky-700 border-sky-200",
  };
  const label: Record<string, string> = {
    title: "→ Title",
    bullets: "→ Bullets",
    backend: "→ Backend",
  };
  const key = (placement || "backend").toLowerCase();
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", map[key] || map.backend)}>
      {label[key] || "→ Backend"}
    </span>
  );
}

function SemanticBadge({ sim }: { sim: number }) {
  if (sim == null) return null;
  if (sim >= 0.5)
    return <span title="Semantically close — easy to add" className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">≈ Similar</span>;
  if (sim >= 0.25)
    return <span title="Partially related concept" className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">~ Partial</span>;
  return <span title="Genuinely new concept — high discovery value" className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">✦ New concept</span>;
}

function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 bg-white/88 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3 text-center p-4">
      <div className={cn("w-11 h-11 rounded-full flex items-center justify-center shadow-sm", tier === "premium" ? "bg-blue-50" : "bg-amber-50")}>
        <Lock className={cn("w-5 h-5", tier === "premium" ? "text-blue-500" : "text-amber-500")} />
      </div>
      <div>
        <p className="font-bold text-slate-800 text-sm">{feature}</p>
        <p className="text-xs text-slate-400 mt-0.5">{tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}</p>
      </div>
      <button onClick={() => router.push("/subscription")} className={cn("flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105", tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500")}>
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

function CoverageRing({ score }: { score: number }) {
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800">{score}</span>
          <span className="text-[9px] text-slate-400 font-semibold">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label} Coverage</span>
    </div>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    High: "bg-red-50 text-red-600 border-red-200",
    Medium: "bg-amber-50 text-amber-600 border-amber-200",
    Low: "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", map[priority] || map.Low)}>
      {priority}
    </span>
  );
}

function OpportunityBar({ score, keyword, reason, add_to, is_spec }: any) {
  const color = score >= 8 ? "#ef4444" : score >= 6 ? "#f59e0b" : score >= 4 ? "#3b82f6" : "#94a3b8";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-slate-800 font-mono">{keyword}</span>
          <span className="text-xs font-black tabular-nums" style={{ color }}>{score}/10</span>
          {add_to && <PlacementBadge placement={add_to} />}
          {is_spec && (
            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">SPEC</span>
          )}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score * 10}%`, background: color }}
          />
        </div>
        <p className="text-[11px] text-slate-400">{reason}</p>
      </div>
    </div>
  );
}

function KwPill({ kw, variant }: { kw: string; variant: "gap" | "shared" | "unique" | "review" }) {
  const styles = {
    gap: "bg-red-50 text-red-700 border-red-200",
    shared: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unique: "bg-purple-50 text-purple-700 border-purple-200",
    review: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-semibold font-mono", styles[variant])}>
      {kw}
    </span>
  );
}

function HeatmapRow({ item, maxFreq }: { item: any; maxFreq: number }) {
  const pct = Math.max((item.freq / maxFreq) * 100, 3);
  const color = item.in_yours ? "#0ea5e9" : item.freq / maxFreq >= 0.5 ? "#ef4444" : "#f59e0b";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs font-mono text-slate-700 w-36 shrink-0 truncate">{item.keyword}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-400 w-14 text-right shrink-0">
        {item.freq} title{item.freq !== 1 ? "s" : ""}
      </span>
      <span className="w-16 text-right shrink-0">
        {item.in_yours
          ? <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">✓ Yours</span>
          : <span className="text-[10px] font-semibold text-red-400">Missing</span>
        }
      </span>
    </div>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = true, count, accent }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent || "bg-sky-50")}>
            <Icon className="w-4.5 h-4.5 text-sky-600" />
          </div>
          <span className="font-bold text-slate-800 text-base">{title}</span>
          {count != null && (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 animate-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

function GapClusters({ clusters }: { clusters: Record<string, string[]> }) {
  const entries = Object.entries(clusters).filter(([, kws]) => kws.length > 0);
  if (entries.length === 0) return null;

  return (
    <Section title="Semantic Keyword Clusters" icon={Layers} defaultOpen={true} accent="bg-violet-50">
      <p className="text-xs text-slate-400 mb-4">
        Gap keywords grouped by concept. Each cluster represents a content area your listing is missing.
        Focus on clusters with the most keywords first.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([name, kws]) => {
            const meta = clusterMeta(name);
            return (
              <div key={name} className={cn("rounded-2xl border p-4", meta.bg, meta.border)}>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("text-xs font-black flex items-center gap-1.5 uppercase tracking-wider", meta.color)}>
                    <span>{meta.emoji}</span> {name}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 border shadow-sm", meta.border, meta.color)}>
                    {kws.length} keyword{kws.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kws.slice(0, 6).map((kw, i) => (
                    <span key={i} className={cn("text-[10px] font-semibold font-mono px-2 py-0.5 rounded-lg bg-white/60 border", meta.border, meta.color)}>
                      {kw}
                    </span>
                  ))}
                  {kws.length > 6 && (
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/40", meta.color)}>
                      +{kws.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </Section>
  );
}

function GapKeywordsTable({ items }: { items: KeywordItem[] }) {
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [showBigrams, setShowBigrams] = useState(true);
  const [showSemantic, setShowSemantic] = useState(true);

  const filtered = useMemo(() => {
    return items.filter((k) => {
      if (filter !== "All" && k.priority !== filter) return false;
      if (!showBigrams && k.is_bigram) return false;
      return true;
    });
  }, [items, filter, showBigrams]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(["All", "High", "Medium", "Low"] as const).map((f) => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={cn("text-xs font-bold px-4 py-1.5 rounded-full border transition-all shadow-sm",
              filter === f
                ? f === "High" ? "bg-rose-500 text-white border-rose-500 shadow-rose-100"
                  : f === "Medium" ? "bg-amber-400 text-white border-amber-400 shadow-amber-100"
                    : f === "All" ? "bg-sky-500 text-white border-sky-500 shadow-sky-100"
                      : "bg-slate-500 text-white border-slate-500 shadow-slate-100"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowSemantic(!showSemantic)}
            className={cn("flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full border transition-all shadow-sm",
              showSemantic ? "bg-violet-50 text-violet-600 border-violet-200" : "bg-white text-slate-400 border-slate-200"
            )}
          >
            <Cpu className="w-3.5 h-3.5" /> Semantic
          </button>
          <button
            onClick={() => setShowBigrams(!showBigrams)}
            className={cn("flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full border transition-all shadow-sm",
              showBigrams ? "bg-white text-slate-600 border-slate-200" : "bg-slate-100 text-slate-400 border-slate-200"
            )}
          >
            {showBigrams ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Multi-word
          </button>
        </div>
      </div>

      {showSemantic && (
        <div className="flex flex-wrap gap-3 mb-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-1 self-center">AI Insights:</span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">≈ Similar</span>
          <span className="text-[10px] text-slate-500 self-center font-medium">Easy to integrate</span>
          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">✦ New concept</span>
          <span className="text-[10px] text-slate-500 self-center font-medium">Unique discovery</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.slice(0, 30).map((item, i) => (
          <div key={i} className={cn("flex items-center gap-2 px-4 py-3 rounded-[1.25rem] transition-all border group hover:shadow-md",
            item.priority === "High" ? "bg-rose-50/50 border-rose-100 hover:border-rose-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"
          )}>
            <span className="text-xs font-mono font-bold text-slate-800 flex-1 min-w-0 truncate">
              {item.keyword}
              {item.is_partial && (
                <span className="ml-1.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-black uppercase">Partial</span>
              )}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {showSemantic && item.semantic_sim_to_yours != null && (
                <SemanticBadge sim={item.semantic_sim_to_yours} />
              )}
              <PriorityPill priority={item.priority} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10 col-span-full">No keywords match this filter.</p>
        )}
      </div>
      {filtered.length > 30 && (
        <p className="text-xs text-slate-400 text-center pt-4 font-medium italic">
          Showing top 30 of {filtered.length} — narrow filter to see more
        </p>
      )}
    </div>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

function KeywordGapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const asin = searchParams.get("asin") || "";
  const sellerId = searchParams.get("seller_id") || user?.seller_id || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tier = data?.tier || user?.subscriptionTier || "free";
  const isBasic = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  const fetchAnalysis = useCallback(async () => {
    if (!asin || !sellerId) return;
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    try {
      const res = await fetch(`${API_BASE}/api/keyword-gap/analyse?${params}`, { credentials: "include" });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [asin, sellerId, user?.email]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const gapKeywords = data?.gap_keywords || [];
  const sharedKeywords = data?.shared_keywords || [];
  const uniqueKeywords = data?.unique_keywords || [];
  const reviewKeywords = data?.review_keywords || [];
  const heatmap = data?.heatmap || [];
  const aiScores = data?.ai_opportunity_scores || [];
  const actionPlan = data?.ai_action_plan || [];
  const competitors = data?.competitors_analysed || [];
  const gapClusters = data?.gap_clusters || {};
  const maxHeatFreq = heatmap.length ? Math.max(...heatmap.map((h: any) => h.freq)) : 1;
  const embeddingModel = data?.embedding_model || null;

  if (!asin) return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-sky-100 rounded-[2rem] flex items-center justify-center shadow-inner shadow-sky-200">
        <Search className="w-10 h-10 text-sky-500" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-black text-slate-800 tracking-tight">No product selected</p>
        <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Deploy analysis by selecting an asset from your product catalog.</p>
      </div>
      <button onClick={() => router.push("/seller/my-products")} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95">
        Go to My Products
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-slate-900 font-black tracking-tight text-lg">Analysing Search DNA…</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mining competitor titles and AI clusters</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Keyword Gap Intelligence</h1>
            {embeddingModel && embeddingModel !== "jaccard_fallback" && (
              <Badge className="bg-violet-50 text-violet-600 border-violet-100 flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Cpu className="w-3 h-3" /> AI Powered
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium">Discover missed search opportunities by cross-referencing your top competitors.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("px-4 py-2 text-xs font-bold uppercase tracking-widest", tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>{tier}</Badge>
          {!isPremium && <button onClick={() => router.push("/subscription")} className="px-5 py-2.5 rounded-2xl bg-sky-950 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-900 transition-all shadow-xl shadow-sky-950/20 active:scale-95">Upgrade Now</button>}
        </div>
      </div>

      {data && (
        <div className="space-y-8">
          {/* Main Product Card */}
          <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] bg-white overflow-hidden group">
            <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-28 h-28 bg-slate-50 rounded-[2rem] flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                {data.product_photo ? <img src={data.product_photo} alt="" className="w-full h-full object-contain p-3" /> : <Package className="w-12 h-12 text-slate-200" />}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight">{data.product_title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-mono font-bold text-slate-400 tracking-wider bg-slate-50 px-2 py-0.5 rounded">{data.asin}</span>
                    {data.is_prime && <Badge variant="outline" className="text-[9px] font-black uppercase bg-sky-50 text-sky-600 border-sky-100 px-2 py-0">Prime</Badge>}
                    {data.is_best_seller && <Badge variant="outline" className="text-[9px] font-black uppercase bg-amber-50 text-amber-600 border-amber-100 px-2 py-0">Best Seller</Badge>}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {data.competitor_count} Competitors
                    </span>
                  </div>
                </div>
              </div>

              {isBasic && data.coverage_score != null && (
                <div className="shrink-0 scale-110">
                  <CoverageRing score={data.coverage_score} />
                </div>
              )}

              {!isBasic && (
                <div className="text-center md:text-right px-10 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 min-w-[240px] shadow-inner">
                  <p className="text-5xl font-black text-rose-500 leading-none tabular-nums">{data.gap_count_teaser || 0}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Gap Keywords Found</p>
                  <button onClick={() => router.push("/subscription")} className="mt-4 text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors uppercase tracking-widest">Unlock Analysis →</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          {isBasic && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Gap Keywords", value: data.gap_count_teaser || 0, sub: "Absent from title", color: "text-rose-600", bg: "bg-rose-50", icon: AlertTriangle },
                { label: "Shared Keywords", value: sharedKeywords.length, sub: "Matching competitors", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
                { label: "Unique Advantage", value: uniqueKeywords.length, sub: "Only in your title", color: "text-indigo-600", bg: "bg-indigo-50", icon: Star },
                { label: "Coverage Score", value: `${data.coverage_score || 0}/100`, sub: "Vs top competitors", color: "text-sky-600", bg: "bg-sky-50", icon: Target },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", s.bg)}>
                    <s.icon className={cn("w-5 h-5", s.color)} />
                  </div>
                  <p className={cn("text-3xl font-black tabular-nums", s.color)}>{s.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Main Analysis Sections */}
          <div className="space-y-8">
            {/* Free: Your Keywords */}
            <Section title="Active Listing Keywords" icon={FileText} count={data.your_keyword_count} accent="bg-sky-50">
              <p className="text-xs text-slate-400 mb-4 font-medium italic">Keywords currently extracted from your product title.</p>
              <div className="flex flex-wrap gap-2">
                {(data.your_keywords || []).map((kw: string, i: number) => (
                  <KwPill key={i} kw={kw} variant="shared" />
                ))}
                {(data.your_keywords || []).length === 0 && <p className="text-sm text-slate-400 font-medium">No keywords identified.</p>}
              </div>
            </Section>

            {/* Basic+: Missing Keywords Table */}
            {isBasic && (
              <Section title="Gap Keywords (Opportunity)" icon={AlertTriangle} count={gapKeywords.length} accent="bg-rose-50" defaultOpen={true}>
                <p className="text-xs text-slate-400 mb-5 font-medium leading-relaxed">
                  High-frequency keywords used by your competitors but missing from your listing.
                  <span className="text-rose-500 font-bold ml-1">High priority</span> items are used by &gt;50% of your top competitors.
                </p>
                {gapKeywords.length > 0
                  ? <GapKeywordsTable items={gapKeywords} />
                  : <p className="text-sm text-slate-400 text-center py-10 font-bold uppercase tracking-widest">Maximum Coverage Achieved!</p>
                }
              </Section>
            )}

            {/* Basic+: Semantic Clusters */}
            {isBasic && Object.keys(gapClusters).length > 0 && <GapClusters clusters={gapClusters} />}

            {/* Basic+: Heatmap */}
            {isBasic && heatmap.length > 0 && (
              <Section title="Competitor Heatmap" icon={BarChart2} defaultOpen={false}>
                <p className="text-xs text-slate-400 mb-5 font-medium leading-relaxed">
                  Visual distribution of keywords across the competitor landscape.
                  <span className="text-sky-500 font-bold ml-1">Blue</span> indicates your presence;
                  <span className="text-rose-500 font-bold ml-1">Red</span> indicates a significant gap.
                </p>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {heatmap.map((item: any, i: number) => (
                    <HeatmapRow key={i} item={item} maxFreq={maxHeatFreq} />
                  ))}
                </div>
              </Section>
            )}

            {/* Basic+: Shared/Unique Split */}
            {isBasic && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Section title="Shared Keywords" icon={CheckCircle} count={sharedKeywords.length} accent="bg-emerald-50" defaultOpen={false}>
                  <p className="text-xs text-slate-400 mb-4 font-medium">Keywords you share with the market.</p>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {sharedKeywords.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <KwPill kw={s.keyword} variant="shared" />
                        {s.comp_freq > 1 && <span className="text-[10px] text-slate-300 font-black">×{s.comp_freq}</span>}
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Unique Differentiators" icon={Star} count={uniqueKeywords.length} accent="bg-indigo-50" defaultOpen={false}>
                  <p className="text-xs text-slate-400 mb-4 font-medium">Keywords unique to your title — your competitive edge.</p>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {uniqueKeywords.map((kw: string, i: number) => (
                      <KwPill key={i} kw={kw} variant="unique" />
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Premium: Review Mining */}
            <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="AI Customer Review Mining" />}
              <div className={cn("transition-all duration-700", !isPremium && "blur-[6px] grayscale pointer-events-none")}>
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-lg tracking-tight">Customer Voice Mining</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sentiment-driven keyword discovery</p>
                    </div>
                  </div>
                  {isPremium && <span className="text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{reviewKeywords.length} Insights</span>}
                </div>
                <div className="p-8 pt-6">
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
                    Mining customer feedback for conversion-driving keywords. These terms are frequently used by buyers but often overlooked by sellers in titles.
                  </p>
                  {reviewKeywords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviewKeywords.map((rk: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] hover:bg-blue-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-black text-slate-800 font-mono tracking-tight">{rk.keyword}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{rk.review_freq} Mentions</span>
                              {rk.in_competitors > 0 && <span className="text-[9px] text-sky-600 font-bold">Found in {rk.in_competitors} comps</span>}
                            </div>
                          </div>
                          <PriorityPill priority={rk.priority} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {["highly durable", "easy to setup", "fast delivery", "premium feel"].map((kw, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4 bg-blue-50/30 border border-blue-100/50 rounded-[1.5rem]">
                          <span className="text-sm font-black text-slate-400 font-mono flex-1">{kw}</span>
                          <PriorityPill priority="High" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium: AI Opportunity Scores */}
            <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="AI Opportunity Scoring & Placement" />}
              <div className={cn("transition-all duration-700", !isPremium && "blur-[6px] grayscale pointer-events-none")}>
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-lg tracking-tight">AI Strategy & Placement</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prioritized deployment map</p>
                  </div>
                </div>
                <div className="p-8 pt-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <PlacementBadge placement="title" />
                    <PlacementBadge placement="bullets" />
                    <PlacementBadge placement="backend" />
                  </div>
                  <div className="space-y-2">
                    {aiScores.length > 0 ? (
                      aiScores.map((s: any, i: number) => (
                        <OpportunityBar key={i} {...s} />
                      ))
                    ) : (
                      [{ score: 9.4, keyword: "ultra fast speed", reason: "Core market term used by top 3 best-sellers", add_to: "title" },
                      { score: 8.2, keyword: "class 10 u3", reason: "Critical specification for high-end photography", add_to: "title", is_spec: true },
                      { score: 6.5, keyword: "water resistant", reason: "Secondary USP found in high-rated reviews", add_to: "bullets" }].map((s, i) => (
                        <OpportunityBar key={i} {...s} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium: AI Rewrite */}
            <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="AI Powered Listing Rewrite" />}
              <div className={cn("transition-all duration-700", !isPremium && "blur-[6px] grayscale pointer-events-none")}>
                <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-lg tracking-tight">AI Smart Rewrite</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dynamic title optimization</p>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] items-center gap-6">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Current Title <ArrowRight className="w-3 h-3" /></p>
                      <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed shadow-inner">
                        {data.product_title}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100 shadow-sm">
                        <ArrowRight className="w-5 h-5 text-violet-500 lg:rotate-0 rotate-90" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> AI Suggested Rewrite</p>
                      <div className="p-6 bg-gradient-to-br from-violet-900 to-indigo-950 rounded-[1.5rem] text-white text-sm font-semibold leading-relaxed shadow-2xl shadow-indigo-200 animate-in zoom-in-95 duration-700">
                        "{data.ai_listing_rewrite || "Generating optimized pattern..."}"
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 font-semibold leading-normal">
                      Note: AI suggestions incorporate gap keywords and semantic density. Ensure compliance with marketplace character limits and brand guidelines before deploying.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          {!isPremium && (
            <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-sky-200">
              <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-2xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upgrade to Premium</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight leading-tight">Master the market with AI-powered keyword strategies.</h2>
                  <p className="text-sky-100/70 text-sm font-medium leading-relaxed">
                    Unlock semantic clusters, competitor heatmaps, AI opportunity scores, and dynamic listing rewrites to stay ahead of the competition.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {[
                      "Semantic Clusters",
                      "Opportunity Map",
                      "Review Sentiment Mining",
                      "AI Dynamic Rewriting"
                    ].map((f) => (
                      <span key={f} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-sky-200">
                        <CheckCircle className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => router.push("/subscription")} className="shrink-0 px-10 py-5 bg-white text-sky-950 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all active:scale-95 group flex items-center gap-3">
                  Start Premium Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function KeywordGapPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 gap-6 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-inner">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-black text-slate-800 tracking-tight">Initializing Analysis Engine…</p>
          <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-sky-500 w-1/3 animate-[loading_2s_infinite_linear]" />
          </div>
        </div>
      </div>
    }>
      <KeywordGapContent />
    </Suspense>
  );
}
