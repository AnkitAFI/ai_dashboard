"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bookmark, Trash2, ExternalLink, TrendingUp,
  Search, X, Star, Package,
  ArrowRight, Sparkles, Clock, BarChart3, RefreshCw,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

interface SavedProductDB {
  id: string;
  name: string;
  inputs: {
    selling_price: number;
    product_cost: number;
    fba_fee: number;
    ad_spend_per_unit: number;
    monthly_units: number;
    referral_fee_pct: number;
    category: string;
    marketplace: string;
  };
  calc_snapshot: {
    profit_per_unit: number;
    net_margin_pct: number;
    monthly_profit: number;
    yearly_profit?: number;
    roi_pct?: number;
    acos_pct?: number;
    breakeven_units?: number;
    tier: string;
  };
  profit_per_unit: number;
  net_margin_pct: number;
  monthly_profit: number;
  created_at: string;
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

function getMarginColor(margin: number): string {
  if (margin >= 20) return "text-emerald-600";
  if (margin >= 10) return "text-amber-600";
  return "text-red-500";
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
      <span className={cn("text-xs font-bold relative z-10", getScoreColor(score))}>{score}</span>
    </div>
  );
}

function MarginRing({ margin, size = 48 }: { margin: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, margin));
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);
  const color = margin >= 20 ? "#10b981" : margin >= 10 ? "#f59e0b" : "#ef4444";
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
      <span className={cn("text-[10px] font-bold relative z-10", getMarginColor(margin))}>{Math.round(margin)}%</span>
    </div>
  );
}

// ── Tab Slider ─────────────────────────────────────────────────────────────────

function TabSlider({
  activeTab,
  onChange,
  whiteSpaceCount,
  profitCount,
}: {
  activeTab: "whitespace" | "profitability";
  onChange: (t: "whitespace" | "profitability") => void;
  whiteSpaceCount: number;
  profitCount: number;
}) {
  return (
    <div className="relative bg-slate-100 rounded-2xl p-1 flex gap-1">
      {/* Sliding pill */}
      <div
        className="absolute top-1 bottom-1 rounded-xl bg-white shadow-md transition-all duration-300 ease-out"
        style={{
          left:  activeTab === "whitespace" ? "4px" : "calc(50% + 2px)",
          width: "calc(50% - 6px)",
        }}
      />
      <button
        onClick={() => onChange("whitespace")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-200",
          activeTab === "whitespace" ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span>Opportunity Finder</span>
        {whiteSpaceCount > 0 && (
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", activeTab === "whitespace" ? "bg-violet-100 text-violet-700" : "bg-slate-200 text-slate-500")}>
            {whiteSpaceCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onChange("profitability")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-200",
          activeTab === "profitability" ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Calculator className="w-4 h-4" />
        <span>Price Optimizer</span>
        {profitCount > 0 && (
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", activeTab === "profitability" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500")}>
            {profitCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ── Main Page Content ─────────────────────────────────────────────────────────

export default function MyWatchlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  // ── White Space state ──────────────────────────────────────────────────────
  const [items,        setItems]        = useState<WatchlistItem[]>([]);
  const [wsLoading,    setWsLoading]    = useState(true);
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing,     setClearing]     = useState(false);

  // ── Profitability state ────────────────────────────────────────────────────
  const [savedProducts,    setSavedProducts]    = useState<SavedProductDB[]>([]);
  const [profitLoading,    setProfitLoading]    = useState(true);
  const [removingProduct,  setRemovingProduct]  = useState<string | null>(null);

  // ── Shared state ──────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<"whitespace" | "profitability">("whitespace");
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState<"added" | "score" | "revenue">("added");
  const [profitSortBy, setProfitSortBy] = useState<"added" | "margin" | "profit">("added");

  // ── Fetch White Space watchlist ────────────────────────────────────────────
  const fetchWatchlist = useCallback(async () => {
    if (!userId) { setWsLoading(false); return; }
    setWsLoading(true);
    try {
      const res = await axios.get(`${API}/white-space/watchlist`, {
        params: { user_id: userId.toString() },
      });
      setItems(res.data.watchlist as WatchlistItem[]);
    } catch { /* silent */ }
    finally { setWsLoading(false); }
  }, [userId]);

  // ── Fetch Profitability saved products ────────────────────────────────────
  const fetchSavedProducts = useCallback(async () => {
    if (!userId) { setProfitLoading(false); return; }
    setProfitLoading(true);
    try {
      const res = await axios.get(`${API}/profitability/saved/${userId}`);
      setSavedProducts(res.data as SavedProductDB[]);
    } catch { /* silent */ }
    finally { setProfitLoading(false); }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
    fetchSavedProducts();
  }, [fetchWatchlist, fetchSavedProducts]);

  useEffect(() => { setSearch(""); }, [activeTab]);

  const removeItem = async (item: WatchlistItem) => {
    if (!userId || removing) return;
    setRemoving(item.niche);
    setItems((prev) => prev.filter((i) => i.niche !== item.niche));
    try {
      await axios.post(`${API}/white-space/watchlist/toggle`, {
        user_id: userId.toString(), niche: item.niche, score: item.score,
        category: item.category, platform: item.platform, avg_price: item.avg_price,
        avg_rating: item.avg_rating, competitor_count: item.competitor_count,
        est_revenue_max: item.est_revenue_max, top_keyword: item.top_keyword,
        gap_summary: item.gap_summary, query: item.query,
      });
    } catch {
      setItems((prev) => [item, ...prev]);
    } finally {
      setRemoving(null);
    }
  };

  const removeProduct = async (id: string) => {
    if (!userId || removingProduct) return;
    setRemovingProduct(id);
    const original = [...savedProducts];
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await axios.delete(`${API}/profitability/saved/${userId}/${id}`);
    } catch {
      setSavedProducts(original);
    } finally {
      setRemovingProduct(null);
    }
  };

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
      setItems(snapshot);
    } finally {
      setClearing(false);
    }
  };

  const filteredWS = items
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

  const filteredProfit = savedProducts
    .filter((p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.inputs.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (profitSortBy === "margin") return b.net_margin_pct - a.net_margin_pct;
      if (profitSortBy === "profit") return b.monthly_profit - a.monthly_profit;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const apiLoading = activeTab === "whitespace" ? wsLoading : profitLoading;

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border border-sky-100 shadow-xl rounded-2xl px-6 py-4 mb-6 flex items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-inner">
            <Bookmark className="h-5 w-5 text-violet-600 fill-violet-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-900 to-indigo-700 bg-clip-text text-transparent tracking-tight">
              My Watchlist
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Synced across all your devices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchWatchlist(); fetchSavedProducts(); }}
            disabled={apiLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-40"
            title="Refresh watchlist"
          >
            <RefreshCw className={cn("w-4 h-4", apiLoading && "animate-spin")} />
          </button>

          <button
            onClick={() => router.push("/explorer/white-space-finder")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Find more gaps</span>
          </button>
        </div>
      </header>

      <div className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto space-y-6 w-full">
        <TabSlider
          activeTab={activeTab}
          onChange={setActiveTab}
          whiteSpaceCount={items.length}
          profitCount={savedProducts.length}
        />

        {/* Controls */}
        {userId && (items.length > 0 || savedProducts.length > 0) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "whitespace" ? "Search niches, categories..." : "Search products, categories..."}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {activeTab === "whitespace" ? (
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-600 focus:ring-2 focus:ring-violet-300 outline-none"
                >
                  <option value="added">Recently added</option>
                  <option value="score">Highest score</option>
                  <option value="revenue">Est. revenue</option>
                </select>
                {!confirmClear ? (
                  <button onClick={() => setConfirmClear(true)} className="h-10 px-3 text-xs border border-red-200 text-red-500 rounded-xl hover:bg-red-50 flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Clear</button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button onClick={clearAll} className="h-10 px-3 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600">Confirm</button>
                    <button onClick={() => setConfirmClear(false)} className="h-10 px-3 text-xs border border-slate-300 rounded-xl hover:bg-slate-50">X</button>
                  </div>
                )}
              </div>
            ) : (
              <select
                value={profitSortBy}
                onChange={(e) => setProfitSortBy(e.target.value as any)}
                className="h-10 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-600 focus:ring-2 focus:ring-blue-300 outline-none"
              >
                <option value="added">Recently added</option>
                <option value="margin">Best margin</option>
                <option value="profit">Best profit</option>
              </select>
            )}
          </div>
        )}

        {/* Content */}
        {!userId ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100"><Bookmark className="w-9 h-9 text-amber-300" /></div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Sign in to see your watchlist</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">Your watchlist is saved to your account so it's available on all your devices.</p>
            <button onClick={() => router.push("/login")} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 transition-all">Sign in <ArrowRight className="w-4 h-4 ml-2 inline" /></button>
          </div>
        ) : apiLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3"><RefreshCw className="w-7 h-7 text-violet-400 animate-spin" /><p className="text-sm text-slate-400">Loading...</p></div>
        ) : activeTab === "whitespace" ? (
          filteredWS.length === 0 ? (
            <div className="text-center py-24"><Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 text-sm">No items found.</p></div>
          ) : (
            <div className="space-y-4">
              {filteredWS.map((item) => (
                <Card key={item.niche} className="overflow-hidden border border-slate-200 rounded-2xl bg-white hover:border-violet-200 hover:shadow-md transition-all group p-5">
                  <div className="flex items-start gap-4">
                    <ScoreRing score={item.score} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1">{item.niche}</h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getScoreBg(item.score), getScoreColor(item.score))}>{getScoreLabel(item.score)}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.category}</span>
                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", item.platform === "both" ? "bg-purple-100 text-purple-700" : item.platform === "amazon" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                              {item.platform === "both" ? "Amazon + Flipkart" : item.platform === "amazon" ? "Amazon.in" : "Flipkart"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(item.added_at)}</span>
                          <button onClick={() => removeItem(item)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{item.gap_summary}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Max rev/mo", val: inr(item.est_revenue_max) },
                          { label: "Avg price",  val: "₹" + item.avg_price.toLocaleString("en-IN") },
                          { label: "Avg rating", val: "★ " + item.avg_rating.toFixed(1) },
                          { label: "Competitors", val: String(item.competitor_count) },
                        ].map((s) => (
                          <div key={s.label} className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
                            <p className="text-[9px] text-slate-400 mb-0.5 uppercase tracking-wide">{s.label}</p>
                            <p className="text-xs font-semibold text-slate-700">{s.val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Keyword: <span className="text-slate-600 font-medium">{item.top_keyword}</span></span>
                        <button onClick={() => router.push(`/explorer/white-space-finder?q=${encodeURIComponent(item.query)}`)} className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-800 font-medium"><ExternalLink className="w-3 h-3" /> Re-scan</button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          filteredProfit.length === 0 ? (
            <div className="text-center py-24"><Calculator className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 text-sm">No saved products found.</p></div>
          ) : (
            <div className="space-y-4">
              {filteredProfit.map((p) => (
                <Card key={p.id} className="overflow-hidden border border-slate-200 rounded-2xl bg-white hover:border-blue-200 hover:shadow-md transition-all group p-5">
                  <div className="flex items-start gap-4">
                    <MarginRing margin={p.net_margin_pct} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1">{p.name}</h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{p.inputs.category}</span>
                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", p.inputs.marketplace === "amazon" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                              {p.inputs.marketplace === "amazon" ? "Amazon.in" : "Flipkart"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(p.created_at)}</span>
                          <button onClick={() => removeProduct(p.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Price", val: "₹" + p.inputs.selling_price.toLocaleString("en-IN") },
                          { label: "Margin", val: p.net_margin_pct.toFixed(1) + "%" },
                          { label: "Profit/unit", val: "₹" + Math.round(p.profit_per_unit) },
                          { label: "Monthly Profit", val: inr(p.monthly_profit) },
                        ].map((s) => (
                          <div key={s.label} className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center">
                            <p className="text-[9px] text-slate-400 mb-0.5 uppercase tracking-wide">{s.label}</p>
                            <p className="text-xs font-semibold text-slate-700">{s.val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-end">
                        <button onClick={() => router.push(`/explorer/profitability-optimizer?id=${p.id}`)} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium"><ExternalLink className="w-3 h-3" /> Open in Optimizer</button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
