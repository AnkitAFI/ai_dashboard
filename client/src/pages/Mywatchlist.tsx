import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bookmark, Trash2, ExternalLink, TrendingUp,
  Search, X, Menu, Star, Package,
  ArrowRight, Sparkles, Clock, BarChart3, RefreshCw,
} from "lucide-react";

const API = "http://localhost:8000/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WatchlistItem {
  niche: string;
  score: number;
  category: string;
  platform: string;
  avg_price: number;
  avg_rating: number;
  competitor_count: number;
  est_revenue_max: number;
  top_keyword: string;
  gap_summary: string;
  query: string;
  added_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function inr(n: number): string {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return "₹" + Math.round(n / 1000) + "K";
  return "₹" + Math.round(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 65) return "bg-blue-50 border-blue-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Hot pick";
  if (score >= 65) return "Good gap";
  if (score >= 50) return "Moderate";
  return "Skip";
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color  = score >= 80 ? "#10b981" : score >= 65 ? "#3b82f6" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }} className="flex items-center justify-center">
      <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`text-xs font-bold relative z-10 ${getScoreColor(score)}`}>{score}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MyWatchlist() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const userId      = user?.id;

  const [items,        setItems]        = useState<WatchlistItem[]>([]);
  const [apiLoading,   setApiLoading]   = useState(true);
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [isMobileMenu, setMobileMenu]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState<"added" | "score" | "revenue">("added");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing,     setClearing]     = useState(false);

  // ── Fetch from backend ───────────────────────────────────────────────────
  const fetchWatchlist = useCallback(async () => {
    if (!userId) { setApiLoading(false); return; }
    try {
      const res = await axios.get(`${API}/white-space/watchlist`, {
        params: { user_id: userId.toString() },
      });
      setItems(res.data.watchlist as WatchlistItem[]);
    } catch {
      // Silent — show empty state
    } finally {
      setApiLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // ── Remove single item (optimistic) ─────────────────────────────────────
  const removeItem = async (item: WatchlistItem) => {
    if (!userId || removing) return;
    setRemoving(item.niche);
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.niche !== item.niche));
    try {
      await axios.post(`${API}/white-space/watchlist/toggle`, {
        user_id:          userId.toString(),
        niche:            item.niche,
        score:            item.score,
        category:         item.category,
        platform:         item.platform,
        avg_price:        item.avg_price,
        avg_rating:       item.avg_rating,
        competitor_count: item.competitor_count,
        est_revenue_max:  item.est_revenue_max,
        top_keyword:      item.top_keyword,
        gap_summary:      item.gap_summary,
        query:            item.query,
      });
    } catch {
      // Revert on failure
      setItems((prev) => [item, ...prev]);
    } finally {
      setRemoving(null);
    }
  };

  // ── Clear all (optimistic) ───────────────────────────────────────────────
  const clearAll = async () => {
    if (!userId || clearing) return;
    setClearing(true);
    const snapshot = [...items];
    setItems([]);
    setConfirmClear(false);
    try {
      await Promise.all(
        snapshot.map((item) =>
          axios.delete(`${API}/white-space/watchlist/remove`, {
            params: { user_id: userId.toString(), niche: item.niche },
          })
        )
      );
    } catch {
      setItems(snapshot); // revert
    } finally {
      setClearing(false);
    }
  };

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = items
    .filter((i) =>
      !search ||
      i.niche.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.query.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score")   return b.score - a.score;
      if (sortBy === "revenue") return b.est_revenue_max - a.est_revenue_max;
      return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    });

  // ── Stats ────────────────────────────────────────────────────────────────
  const hotCount  = items.filter((i) => i.score >= 80).length;
  const avgScore  = items.length ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;
  const avgRevenue = items.length ? Math.round(items.reduce((s, i) => s + i.est_revenue_max, 0) / items.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">

      {/* Mobile sidebar */}
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
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      <div className="lg:ml-64 min-h-screen">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border border-sky-100 shadow-xl rounded-2xl px-6 py-4 mb-6 flex items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileMenu(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-inner">
                <Bookmark className="h-5 w-5 text-violet-600 fill-violet-200" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-900 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  My Watchlist
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  {apiLoading ? "Loading…" : `${items.length} niche${items.length !== 1 ? "s" : ""} saved · synced across all your devices`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => { setApiLoading(true); fetchWatchlist(); }}
              disabled={apiLoading}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-40"
              title="Refresh watchlist"
            >
              <RefreshCw className={`w-4 h-4 ${apiLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => navigate("/explorer/white-space-finder")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Find more gaps</span>
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto space-y-5">

          {/* Loading state */}
          {apiLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="w-7 h-7 text-violet-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading your watchlist…</p>
            </div>
          )}

          {/* Not signed in */}
          {!apiLoading && !userId && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                <Bookmark className="w-9 h-9 text-amber-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Sign in to see your watchlist</h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
                Your watchlist is saved to your account so it's available on all your devices.
              </p>
              <a
                href="/login"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 transition-all"
              >
                Sign in <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Empty state */}
          {!apiLoading && userId && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 border border-violet-100">
                <Bookmark className="w-9 h-9 text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Your watchlist is empty</h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
                Click the <span className="font-semibold text-violet-600">Watch</span> button on any opportunity card in the Opportunity Finder to save niches here.
              </p>
              <button
                onClick={() => navigate("/explorer/white-space-finder")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Open Opportunity Finder <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Watchlist content */}
          {!apiLoading && userId && items.length > 0 && (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total niches",    value: String(items.length), icon: <Package className="w-4 h-4 text-violet-500" />,          bg: "bg-violet-50 border-violet-200"  },
                  { label: "Hot picks (80+)", value: String(hotCount),     icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />, bg: "bg-amber-50 border-amber-200"   },
                  { label: "Avg score",       value: String(avgScore),     icon: <BarChart3 className="w-4 h-4 text-blue-500" />,            bg: "bg-blue-50 border-blue-200"     },
                  { label: "Avg max revenue", value: inr(avgRevenue) + "/mo", icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,   bg: "bg-emerald-50 border-emerald-200"},
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {s.icon}
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search niches, categories, keywords…"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="h-10 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-600 focus:ring-2 focus:ring-violet-300 outline-none"
                  >
                    <option value="added">Sort: Recently added</option>
                    <option value="score">Sort: Highest score</option>
                    <option value="revenue">Sort: Est. revenue</option>
                  </select>
                  {!confirmClear ? (
                    <button
                      onClick={() => setConfirmClear(true)}
                      disabled={clearing}
                      className="h-10 px-3 text-xs border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear all
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={clearAll}
                        disabled={clearing}
                        className="h-10 px-3 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {clearing ? "Clearing…" : "Confirm clear"}
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="h-10 px-3 text-xs border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* No search results */}
              {filtered.length === 0 && search && (
                <div className="text-center py-12 text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No niches match "{search}"</p>
                </div>
              )}

              {/* Watchlist cards */}
              <div className="space-y-3">
                {filtered.map((item) => (
                  <Card
                    key={item.niche}
                    className="shadow-sm border border-slate-200 rounded-2xl bg-white/90 hover:border-violet-200 hover:shadow-md transition-all group"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <ScoreRing score={item.score} />

                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1">{item.niche}</h3>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getScoreBg(item.score)} ${getScoreColor(item.score)}`}>
                                  {getScoreLabel(item.score)}
                                </span>
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {item.category}
                                </span>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.platform === "both" ? "bg-purple-100 text-purple-700" : item.platform === "amazon" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                  {item.platform === "both" ? "Amazon + Flipkart" : item.platform === "amazon" ? "Amazon.in" : "Flipkart"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />{timeAgo(item.added_at)}
                              </span>
                              <button
                                onClick={() => removeItem(item)}
                                disabled={removing === item.niche}
                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Remove from watchlist"
                              >
                                {removing === item.niche
                                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Gap summary */}
                          <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{item.gap_summary}</p>

                          {/* Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {[
                              { label: "Max revenue/mo", value: inr(item.est_revenue_max) },
                              { label: "Avg price",      value: "₹" + item.avg_price.toLocaleString("en-IN") },
                              { label: "Avg rating",     value: "★ " + item.avg_rating.toFixed(1) },
                              { label: "Competitors",    value: String(item.competitor_count) },
                            ].map((s) => (
                              <div key={s.label} className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
                                <p className="text-[9px] text-slate-400 mb-0.5 uppercase tracking-wide">{s.label}</p>
                                <p className="text-xs font-semibold text-slate-700">{s.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              Keyword: <span className="text-slate-600 font-medium">{item.top_keyword}</span>
                            </span>
                            <button
                              onClick={() => navigate(`/explorer/white-space-finder?q=${encodeURIComponent(item.query)}`)}
                              className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-800 font-medium transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Re-scan "{item.query}"
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-center pt-4">
                <button
                  onClick={() => navigate("/explorer/white-space-finder")}
                  className="flex items-center gap-2 px-6 py-3 border border-violet-300 text-violet-600 rounded-xl text-sm font-medium hover:bg-violet-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Find more opportunities <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}