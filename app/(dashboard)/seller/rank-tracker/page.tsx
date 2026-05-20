"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useSelectedProduct } from "@/lib/selected-product-context";
import {
  Lock, Crown, RefreshCw, Menu, Package,
  TrendingUp, TrendingDown, Minus, CheckCircle,
  AlertTriangle, Zap, Target, BarChart2,
  ChevronDown, ChevronUp, Bell, Bot,
  Plus, X, Search, Sparkles, Activity,
  ArrowUp, ArrowDown, Hash, Clock,
  ShieldCheck, Eye, Flame, Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import ReactMarkdown from "react-markdown";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com";
const API = `${BASE_URL}/api/rank-tracker`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface RankSnapshot {
  keyword: string;
  rank_position: number | null;
  page_number: number | null;
  is_sponsored: boolean;
  checked_at: string;
}

interface TrackedKeyword {
  keyword: string;
  current_rank: number | null;
  previous_rank: number | null;
  rank_change: number | null;
  page_number: number | null;
  is_sponsored: boolean;
  best_rank: number | null;
  worst_rank: number | null;
  status: "up" | "down" | "stable" | "new" | "lost";
  history: { date: string; rank: number | null }[];
  last_checked: string;
  competitor_ranks?: { asin: string; title: string; rank: number | null }[];
  volatility_score?: number;
}

interface RankProfile {
  asin: string;
  product_title: string;
  product_photo?: string;
  is_prime?: boolean;
  is_best_seller?: boolean;
  currency: string;
  country: string;
  keyword_rank_score: number | null;
  tracked_keywords: TrackedKeyword[];
  total_tracked: number;
  keywords_in_top10: number;
  keywords_in_top50: number;
  keywords_lost: number;
  tier: string;
  keyword_limit: number;
  suggestions: string[];
  recent_alerts?: { type: "warn" | "danger" | "success"; msg: string; keyword: string; fired_at: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sym(currency: string) {
  return currency === "USD" ? "$" : "₹";
}

function rankLabel(rank: number | null): string {
  if (rank === null) return "Not found";
  if (rank <= 10) return "Top 10";
  if (rank <= 20) return "Top 20";
  if (rank <= 50) return "Top 50";
  return `#${rank}`;
}

function rankColor(rank: number | null): string {
  if (rank === null) return "text-slate-400";
  if (rank <= 10) return "text-emerald-600";
  if (rank <= 20) return "text-sky-600";
  if (rank <= 50) return "text-amber-600";
  return "text-slate-600";
}

function rankBg(rank: number | null): string {
  if (rank === null) return "bg-slate-50 border-slate-200 text-slate-400";
  if (rank <= 10) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (rank <= 20) return "bg-sky-50 border-sky-200 text-sky-700";
  if (rank <= 50) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-slate-50 border-slate-200 text-slate-600";
}

// ── useStream ─────────────────────────────────────────────────────────────────

function useStream() {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (url: string, body: object) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setText(""); setError(null); setStreaming(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err?.detail as any)?.error || "request_failed");
        setStreaming(false);
        return;
      }
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") break;
          try { setText((p) => p + JSON.parse(d)); } catch { setText((p) => p + d); }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError("stream_interrupted");
    } finally {
      setStreaming(false);
    }
  }, []);

  const stop = useCallback(() => { abortRef.current?.abort(); setStreaming(false); }, []);
  const reset = useCallback(() => { setText(""); setError(null); }, []);
  return { streaming, text, error, start, stop, reset };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 bg-white/88 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
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

// ── Keyword Rank Score Ring ───────────────────────────────────────────────────
function RankScoreRing({ score }: { score: number }) {
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
      <span className="text-xs font-bold" style={{ color }}>{label} Rank</span>
    </div>
  );
}

// ── Rank Change Badge ─────────────────────────────────────────────────────────
function RankChangeBadge({ change, status }: { change: number | null; status: string }) {
  if (status === "new") return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200">NEW</span>
  );
  if (status === "lost") return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">LOST</span>
  );
  if (change === null || change === 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
      <Minus className="w-3 h-3" /> —
    </span>
  );
  if (change < 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
      <ArrowUp className="w-3 h-3" /> {Math.abs(change)}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
      <ArrowDown className="w-3 h-3" /> {change}
    </span>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ history, current }: { history: { date: string; rank: number | null }[]; current: number | null }) {
  const valid = history.filter((h) => h.rank !== null);
  if (valid.length < 2) return <span className="text-[10px] text-slate-400">No history</span>;

  // Invert Y: lower rank = higher position = better
  const maxRank = Math.max(...valid.map((h) => h.rank!));
  const minRank = Math.min(...valid.map((h) => h.rank!));
  const range = maxRank - minRank || 1;

  const w = 80, h = 28, pad = 3;

const pts = valid.map((item, i) => {
  const x = pad + (i / (valid.length - 1)) * (w - pad * 2);
  const y = pad + ((item.rank! - minRank) / range) * (h - pad * 2);
  return `${x},${y}`;
});

  const trend = valid.length >= 2
    ? valid[valid.length - 1].rank! < valid[0].rank! ? "up"
    : valid[valid.length - 1].rank! > valid[0].rank! ? "down" : "flat"
    : "flat";

  const color = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#94a3b8";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {valid.length > 0 && (() => {
        const last = valid[valid.length - 1];
        const x = pad + ((valid.length - 1) / (valid.length - 1)) * (w - pad * 2);
        const y = pad + ((last.rank! - minRank) / range) * (h - pad * 2);
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

// ── Rank Chart Tooltip ────────────────────────────────────────────────────────
const RankTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const rank = payload[0]?.value;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {rank ? (
        <p className={`font-bold ${rankColor(rank)}`}>Rank #{rank}</p>
      ) : (
        <p className="text-slate-400">Not found</p>
      )}
    </div>
  );
};

// ── Keyword Row ───────────────────────────────────────────────────────────────
function KeywordRow({
  kw, isBasic, isPremium, expanded, onToggle, onRemove,
}: {
  kw: TrackedKeyword;
  isBasic: boolean;
  isPremium: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const chartData = (kw.history || [])
    .filter((h) => h.rank !== null)
    .map((h) => ({ date: h.date, rank: h.rank }));

  // Invert for chart — lower rank number = better = should appear higher
  const invertedData = chartData.map((d) => ({
    ...d,
    displayRank: d.rank ? 101 - d.rank : null, // invert so #1 = top of chart
  }));

  return (
    <div className={`rounded-xl border transition-all ${
      kw.status === "lost" ? "border-slate-200 bg-slate-50 opacity-60"
      : kw.current_rank && kw.current_rank <= 10 ? "border-emerald-200 bg-emerald-50/30"
      : "border-slate-100 bg-white"
    }`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Keyword + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800 font-mono">{kw.keyword}</span>
            {kw.is_sponsored && (
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full">SPONSORED</span>
            )}
            {kw.current_rank && kw.current_rank <= 10 && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Trophy className="w-2.5 h-2.5" /> TOP 10
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {kw.page_number && (
              <span className="text-[10px] text-slate-400">Page {kw.page_number}</span>
            )}
            {kw.last_checked && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> {new Date(kw.last_checked).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Current rank */}
        <div className="text-center shrink-0">
          <span className={`text-2xl font-black ${rankColor(kw.current_rank)}`}>
            {kw.current_rank ? `#${kw.current_rank}` : "—"}
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">{rankLabel(kw.current_rank)}</p>
        </div>

        {/* Change */}
        <div className="shrink-0 w-16 flex justify-center">
          <RankChangeBadge change={kw.rank_change} status={kw.status} />
        </div>

        {/* Sparkline — basic+ */}
        {isBasic && (
          <div className="shrink-0 hidden sm:block">
            <Sparkline history={kw.history || []} current={kw.current_rank} />
          </div>
        )}

        {/* Expand + Remove */}
        <div className="flex items-center gap-1 shrink-0">
          {isBasic && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-300 hover:text-red-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded detail — basic+ */}
      {expanded && isBasic && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Best Rank", value: kw.best_rank ? `#${kw.best_rank}` : "—", color: "text-emerald-600" },
              { label: "Worst Rank", value: kw.worst_rank ? `#${kw.worst_rank}` : "—", color: "text-red-500" },
              { label: "Volatility", value: kw.volatility_score != null ? `${kw.volatility_score}/10` : "—", color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 30-day chart — premium */}
          <div className="relative">
            {!isPremium && chartData.length > 0 && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10 gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-600">30-day chart — Premium</span>
                <button
                  onClick={() => window.location.href = "/subscription"}
                  className="ml-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 rounded-full"
                >
                  Upgrade
                </button>
              </div>
            )}
            {chartData.length >= 2 ? (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">Rank History (lower = better)</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={invertedData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      reversed
                      domain={["dataMin - 5", "dataMax + 5"]}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => `#${101 - v}`}
                    />
                    <Tooltip content={<RankTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="displayRank"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ fill: "#0ea5e9", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                Not enough history yet — check back after the next tracking run
              </p>
            )}
          </div>

          {/* Competitor ranks — premium */}
          {isPremium && kw.competitor_ranks && kw.competitor_ranks.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-sky-500" /> Competitor Ranks for this keyword
              </p>
              <div className="space-y-1.5">
                {/* Your rank row */}
                <div className="flex items-center gap-3 px-3 py-2 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-xs font-bold text-sky-700 flex-1">You</span>
                  <span className={`text-sm font-black ${rankColor(kw.current_rank)}`}>
                    {kw.current_rank ? `#${kw.current_rank}` : "—"}
                  </span>
                </div>
                {kw.competitor_ranks.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-600 flex-1 truncate">{c.title || c.asin}</span>
                    <span className={`text-sm font-black ${rankColor(c.rank)}`}>
                      {c.rank ? `#${c.rank}` : "—"}
                    </span>
                    {c.rank && kw.current_rank && (
                      <span className={`text-[10px] font-bold ${c.rank > kw.current_rank ? "text-emerald-600" : "text-red-500"}`}>
                        {c.rank > kw.current_rank ? "You're ahead" : "Ahead of you"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Keyword Input Box ─────────────────────────────────────────────────────────
function KeywordInputBox({
  suggestions,
  trackedKeywords,
  keywordLimit,
  onAdd,
  adding,
}: {
  suggestions: string[];
  trackedKeywords: string[];
  keywordLimit: number;
  onAdd: (keyword: string) => void;
  adding: boolean;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !trackedKeywords.includes(s)
  );

  const handleAdd = (kw: string) => {
    const clean = kw.trim().toLowerCase();
    if (!clean || trackedKeywords.includes(clean)) return;
    onAdd(clean);
    setInput("");
    setShowSuggestions(false);
  };

  const atLimit = trackedKeywords.length >= keywordLimit;

  return (
    <div className="relative">
      <div className={`flex gap-2 ${atLimit ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) handleAdd(input); }}
            placeholder="Type a keyword to track..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all"
          />
          {/* Suggestions dropdown */}
          {showSuggestions && input.length >= 2 && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {filtered.slice(0, 6).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAdd(s)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-sky-50 text-left text-sm text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => input.trim() && handleAdd(input)}
          disabled={adding || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold rounded-xl transition-all"
        >
          {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>
      {atLimit && (
        <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Keyword limit reached ({keywordLimit}). Upgrade to track more.
        </p>
      )}
      {/* Suggestion pills */}
      {!atLimit && suggestions.length > 0 && input.length < 2 && (
        <div className="mt-2">
          <p className="text-[10px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Suggested from your product title
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions
              .filter((s) => !trackedKeywords.includes(s))
              .slice(0, 8)
              .map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAdd(s)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors font-mono"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stream Box ────────────────────────────────────────────────────────────────
function StreamBox({ stream }: { stream: ReturnType<typeof useStream> }) {
  return (
    <div className="mt-3 min-h-12 max-h-72 overflow-y-auto bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      {stream.streaming && !stream.text && (
        <span className="text-slate-400 text-xs animate-pulse">Analysing your rank data…</span>
      )}
      {(stream.text || stream.streaming) && (
        <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
          <ReactMarkdown>{stream.text}</ReactMarkdown>
          {stream.streaming && <span className="animate-pulse text-blue-500">▌</span>}
        </div>
      )}
      {stream.error === "upgrade_required" && (
        <span className="text-amber-600 text-xs font-medium">Available on Premium plan. Upgrade to unlock.</span>
      )}
      {stream.error === "ollama_offline" && (
        <span className="text-red-600 text-xs font-medium">AI is temporarily unavailable. Please try again shortly.</span>
      )}
      {stream.error === "stream_interrupted" && (
        <span className="text-red-600 text-xs font-medium">Analysis interrupted. Retry to continue — no data lost.</span>
      )}
      {stream.error && !["upgrade_required", "ollama_offline", "stream_interrupted"].includes(stream.error) && (
        <span className="text-red-600 text-xs font-medium">Couldn't complete analysis. Please try again.</span>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function RankTrackerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { selected } = useSelectedProduct();

  const asin = searchParams.get("asin") || selected?.asin || "";
  const sellerId = searchParams.get("seller_id") || selected?.sellerId || user?.seller_id || "";
  const userId = user?.id?.toString() || "";
  const userEmail = user?.email || "";

  const [profile, setProfile] = useState<RankProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [expandedKw, setExpandedKw] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "top10" | "up" | "down" | "lost">("all");
  const [refreshing, setRefreshing] = useState(false);

  const aiStream = useStream();

  const tier = profile?.tier || user?.subscriptionTier || "free";
  const isBasic = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  const qs = (extra: Record<string, string> = {}) =>
    new URLSearchParams({ asin, seller_id: sellerId, ...extra }).toString();

  // Load profile
  useEffect(() => {
    if (!asin || !sellerId) return;
    setLoading(true);
    fetch(`${API}/profile?${qs()}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setProfile(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId]);

  const handleAddKeyword = async (keyword: string) => {
    if (!profile) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/keywords/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ asin, seller_id: sellerId, keyword }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const handleRemoveKeyword = async (keyword: string) => {
    setRemoving(keyword);
    try {
      const res = await fetch(`${API}/keywords/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ asin, seller_id: sellerId, keyword }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        if (expandedKw === keyword) setExpandedKw(null);
      }
    } catch (e) { console.error(e); }
    finally { setRemoving(null); }
  };

  const handleRefresh = async () => {
    if (!asin || !sellerId) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ asin, seller_id: sellerId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  const trackedKeywords = profile?.tracked_keywords || [];

  const filteredKeywords = trackedKeywords.filter((kw) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "top10") return kw.current_rank !== null && kw.current_rank <= 10;
    if (filterStatus === "up") return kw.status === "up";
    if (filterStatus === "down") return kw.status === "down";
    if (filterStatus === "lost") return kw.status === "lost";
    return true;
  });

  const currency = profile?.currency || "USD";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
            <Menu className="w-5 h-5 text-sky-900" />
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
              <Hash className="w-5 h-5 text-sky-600" /> Rank Tracker
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">Track your Amazon search position for any keyword</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
            {tier.toUpperCase()}
          </Badge>
          {profile && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
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

      <main className="flex-1 py-6 space-y-5">

        {/* No product selected */}
        {!asin && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
              <Hash className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">No product selected</p>
              <p className="text-sm text-slate-400 mt-1">Select a product from My Products to start tracking its rank.</p>
            </div>
            <button
              onClick={() => router.push("/seller/my-products")}
              className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              Go to My Products
            </button>
          </div>
        )}

        {/* Loading */}
        {asin && (loading || refreshing) && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-slate-600 font-semibold">{refreshing ? "Refreshing and analyzing rank positions..." : "Loading rank data…"}</p>
            <p className="text-slate-400 text-xs animate-pulse">We are analyzing the data. This may take 1–2 minutes.</p>
          </div>
        )}

        {asin && !loading && !refreshing && profile && (
          <>
            {/* Product card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {profile.product_photo
                  ? <img src={profile.product_photo} alt={profile.product_title} className="w-full h-full object-contain p-1" />
                  : <Package className="w-8 h-8 text-slate-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-base line-clamp-2">{profile.product_title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400 font-mono">{profile.asin}</span>
                  {profile.is_prime && <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">PRIME</Badge>}
                  {profile.is_best_seller && <Badge className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1.5 py-0">BEST SELLER</Badge>}
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {profile.country === "IN" ? "Amazon.in" : "Amazon.com"}
                  </span>
                </div>
              </div>
              {isBasic && profile.keyword_rank_score != null && (
                <div className="shrink-0">
                  <RankScoreRing score={profile.keyword_rank_score} />
                </div>
              )}
              {!isBasic && (
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-black text-sky-600">{profile.total_tracked}</p>
                  <p className="text-xs text-slate-400 mt-0.5">keywords tracked</p>
                </div>
              )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Tracked Keywords", value: String(profile.total_tracked), sub: `of ${profile.keyword_limit} limit`, color: "text-slate-800" },
                { label: "In Top 10", value: String(profile.keywords_in_top10), sub: "search positions", color: "text-emerald-600" },
                { label: "In Top 50", value: String(profile.keywords_in_top50), sub: "visible to buyers", color: "text-sky-600" },
                { label: "Not Found", value: String(profile.keywords_lost), sub: "outside top 100", color: "text-red-500" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Add keywords */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Track a Keyword</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {profile.total_tracked}/{profile.keyword_limit} keywords used
                    {!isBasic && " · Upgrade for more"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Tier pill */}
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 text-slate-500 bg-slate-50">
                    {!isBasic ? "1 keyword (Free)" : isBasic && !isPremium ? "Up to 10 (Basic)" : "Up to 50 (Premium)"}
                  </span>
                </div>
              </div>
              <KeywordInputBox
                suggestions={profile.suggestions || []}
                trackedKeywords={trackedKeywords.map((k) => k.keyword)}
                keywordLimit={profile.keyword_limit}
                onAdd={handleAddKeyword}
                adding={adding}
              />
            </div>

            {/* Keywords list */}
            {trackedKeywords.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Filter bar */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-500" /> Tracked Keywords
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredKeywords.length}</span>
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {([
                      { id: "all", label: "All" },
                      { id: "top10", label: "Top 10" },
                      { id: "up", label: "↑ Rising" },
                      { id: "down", label: "↓ Falling" },
                      { id: "lost", label: "Lost" },
                    ] as const).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilterStatus(f.id)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                          filterStatus === f.id
                            ? f.id === "top10" ? "bg-emerald-500 text-white border-emerald-500"
                            : f.id === "up" ? "bg-sky-500 text-white border-sky-500"
                            : f.id === "down" ? "bg-red-500 text-white border-red-500"
                            : f.id === "lost" ? "bg-slate-400 text-white border-slate-400"
                            : "bg-sky-600 text-white border-sky-600"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column headers */}
                <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100 hidden sm:grid grid-cols-[1fr_80px_80px_80px_40px] gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Keyword</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">Rank</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">Change</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">7d Trend</span>
                  <span />
                </div>

                {/* Rows */}
                <div className="p-3 space-y-2">
                  {filteredKeywords.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No keywords match this filter.</p>
                  ) : (
                    filteredKeywords.map((kw) => (
                      <div key={kw.keyword} className={removing === kw.keyword ? "opacity-40 pointer-events-none" : ""}>
                        <KeywordRow
                          kw={kw}
                          isBasic={isBasic}
                          isPremium={isPremium}
                          expanded={expandedKw === kw.keyword}
                          onToggle={() => setExpandedKw(expandedKw === kw.keyword ? null : kw.keyword)}
                          onRemove={() => handleRemoveKeyword(kw.keyword)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Empty state — no keywords yet */}
            {trackedKeywords.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center">
                  <Search className="w-7 h-7 text-sky-400" />
                </div>
                <p className="font-bold text-slate-700">No keywords tracked yet</p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Add keywords above — type them manually or pick from the suggestions based on your product title.
                </p>
              </div>
            )}

            {/* Rank Change Alerts — premium */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="Rank Change Alerts" />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" /> Rank Change Alerts
                </h3>
                <div className="space-y-2">
                  {profile?.recent_alerts && profile.recent_alerts.length > 0 ? (
                    profile.recent_alerts.map((a, i) => (
                      <div key={i} className={`flex items-start gap-2 p-3 rounded-xl border-l-4 text-xs ${
                        a.type === "danger" ? "bg-red-50 border-red-400 text-red-800"
                        : a.type === "warn" ? "bg-amber-50 border-amber-400 text-amber-800"
                        : "bg-emerald-50 border-emerald-400 text-emerald-800"
                      }`}>
                        {a.type === "danger" ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                         : a.type === "warn" ? <ArrowDown className="w-4 h-4 shrink-0 mt-0.5" />
                         : <ArrowUp className="w-4 h-4 shrink-0 mt-0.5" />}
                        <span>{a.msg}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                      No rank changes detected in the last 7 days.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Rank Insight — premium */}
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="AI Rank Insight" />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">AI Rank Insight</span>
                  </div>
                  <div className="flex gap-2">
                    {aiStream.text && (
                      <button onClick={aiStream.reset} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                    )}
                    <button
                      onClick={() => aiStream.start(`${API}/ai/rank-insight`, { asin, seller_id: sellerId })}
                      disabled={aiStream.streaming}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
                    >
                      {aiStream.streaming
                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> Thinking…</>
                        : "✦ Analyse my ranks"}
                    </button>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-3">
                  {aiStream.text || aiStream.streaming || aiStream.error
                    ? <StreamBox stream={aiStream} />
                    : <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                        <p className="text-slate-400 text-xs">
                          Click to get an AI explanation of your rank trends — connects rank drops to price, review, and competitor events
                        </p>
                      </div>
                  }
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-base">
                    {!isBasic ? "Unlock Full Rank Tracking" : "Unlock Competitor Ranks + AI Insight"}
                  </p>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {!isBasic
                      ? "Track up to 10 keywords, see 7-day history & rank trends — Basic · ₹1,999/mo"
                      : "Track 50 keywords, competitor rank comparison, alerts & AI analysis — Premium · ₹2,999/mo"}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {(!isBasic
                      ? ["10 keywords per product", "7-day rank history", "Sparkline trends", "Rank score"]
                      : ["50 keywords", "Competitor rank table", "Rank change alerts", "AI rank insight"]
                    ).map((f) => (
                      <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                        <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => router.push("/subscription")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all shrink-0"
                >
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

export default function RankTrackerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <RankTrackerContent />
    </Suspense>
  );
}
