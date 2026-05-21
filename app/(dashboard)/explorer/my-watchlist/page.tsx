"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API = `${API_BASE_URL}/api`;

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
    monthly_revenue: number;
    roas: number;
    total_cost: number;
  };
  created_at: string;
}

interface SavedProduct extends SavedProductDB {
  monthly_profit: number;
  net_margin_pct: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TabSlider = ({ activeTab, onChange, whiteSpaceCount, profitCount }: any) => {
  return (
    <div className="bg-slate-200/50 p-1 rounded-2xl flex items-center w-full max-w-sm mx-auto shadow-inner">
      <button
        onClick={() => onChange("whitespace")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
          activeTab === "whitespace"
            ? "bg-white text-violet-700 shadow-lg scale-[1.02]"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Sparkles className="w-4 h-4" />
        Niches
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md", activeTab === "whitespace" ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500")}>
          {whiteSpaceCount}
        </span>
      </button>
      <button
        onClick={() => onChange("profit")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
          activeTab === "profit"
            ? "bg-white text-blue-700 shadow-lg scale-[1.02]"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Calculator className="w-4 h-4" />
        Calculator
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md", activeTab === "profit" ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500")}>
          {profitCount}
        </span>
      </button>
    </div>
  );
};

export default function MyWatchlist() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"whitespace" | "profit">("whitespace");
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [wsLoading, setWsLoading] = useState(false);
  const [profitLoading, setProfitLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"added" | "score" | "revenue">("added");
  const [profitSortBy, setProfitSortBy] = useState<"added" | "margin" | "profit">("added");
  const [confirmClear, setConfirmClear] = useState(false);

  const userId = user?.id;

  const fetchWatchlist = useCallback(async () => {
    if (!userId) return;
    setWsLoading(true);
    try {
      const res = await axios.get(`${API}/white-space/watchlist?user_id=${userId}`);
      if (res.data.watchlist) {
        setItems(res.data.watchlist || []);
      }
    } catch (err) {
      console.error("Watchlist fetch error:", err);
    } finally {
      setWsLoading(false);
    }
  }, [userId]);

  const fetchSavedProducts = useCallback(async () => {
    if (!userId) return;
    setProfitLoading(true);
    try {
      const res = await axios.get(`${API}/profitability/saved`);
      if (Array.isArray(res.data)) {
        const flattened = res.data.map((p: SavedProductDB) => ({
          ...p,
          monthly_profit: p.calc_snapshot.monthly_profit,
          net_margin_pct: p.calc_snapshot.net_margin_pct
        }));
        setSavedProducts(flattened);
      }
    } catch (err) {
      console.error("Saved products fetch error:", err);
    } finally {
      setProfitLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
    fetchSavedProducts();
  }, [fetchWatchlist, fetchSavedProducts]);

  const removeItem = async (niche: string) => {
    if (!userId) return;
    try {
      await axios.delete(`${API}/white-space/watchlist/remove?niche=${encodeURIComponent(niche)}`);
      setItems((prev) => prev.filter((i) => i.niche !== niche));
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const removeSavedProduct = async (id: string) => {
    try {
      await axios.delete(`${API}/profitability/saved/${id}`);
      setSavedProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Remove product error:", err);
    }
  };

  const clearAll = async () => {
    if (!userId) return;
    try {
      await Promise.all(items.map(item => axios.delete(`${API}/white-space/watchlist/remove?user_id=${userId}&niche=${encodeURIComponent(item.niche)}`)));
      setItems([]);
      setConfirmClear(false);
    } catch (err) {
      console.error("Clear error:", err);
    }
  };

  const filteredItems = items
    .filter((i) =>
      !search ||
      i.niche.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => { fetchWatchlist(); fetchSavedProducts(); }}
            disabled={apiLoading}
            className="rounded-xl"
          >
            <RefreshCw className={cn("w-4 h-4", apiLoading && "animate-spin")} />
          </Button>

          <Button
            onClick={() => router.push("/explorer/white-space-finder")}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow hover:opacity-90 transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Find more gaps
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 w-full">
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
                  <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)} className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" onClick={clearAll} className="bg-red-500 text-white rounded-xl hover:bg-red-600">Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmClear(false)} className="rounded-xl">X</Button>
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
            <Button onClick={() => router.push("/login")}>Sign In Now</Button>
          </div>
        ) : apiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === "whitespace" ? (
          items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background border border-slate-200 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-7 h-7 text-slate-300" /></div>
              <p className="text-slate-500 font-medium">Your niche watchlist is empty</p>
              <Button variant="link" onClick={() => router.push("/explorer/white-space-finder")} className="mt-2 text-violet-600">Start exploring market gaps</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.query} className="overflow-hidden border-slate-200/60 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 group rounded-3xl">
                  <CardContent className="p-0">
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{item.niche}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            {item.platform === "flipkart" ? "🛒 Flipkart" : "📦 Amazon"} • {item.category}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                            item.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                              item.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          )}>
                            Score: {item.score}
                          </div>
                          <button onClick={() => removeItem(item.niche)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Rating</p>
                          <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-0.5">{item.avg_rating} <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /></p>
                        </div>
                        <div className="text-center border-x border-slate-200">
                          <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Price</p>
                          <p className="text-xs font-bold text-slate-700">₹{Math.round(item.avg_price)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Competition</p>
                          <p className="text-xs font-bold text-slate-700">{item.competitor_count}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          Top Keyword: <span className="text-violet-600">{item.top_keyword}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic border-l-2 border-violet-100 pl-3">"{item.gap_summary}"</p>
                      </div>
                    </div>

                    <div className="flex border-t border-slate-100">
                      <button
                        onClick={() => router.push(`/explorer/white-space-finder?q=${encodeURIComponent(item.query)}&platform=${item.platform}&category=${encodeURIComponent(item.category)}`)}
                        className="flex-1 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors border-r border-slate-100"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Analyze Now
                      </button>
                      <button
                        onClick={() => window.open(item.platform === "flipkart" ? `https://www.flipkart.com/search?q=${item.query}` : `https://www.amazon.in/s?k=${item.query}`, "_blank")}
                        className="flex-1 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Search Live
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          savedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background border border-slate-200 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4"><Calculator className="w-7 h-7 text-slate-300" /></div>
              <p className="text-slate-500 font-medium">No saved calculations yet</p>
              <Button variant="link" onClick={() => router.push("/explorer/profitability-optimizer")} className="mt-2 text-blue-600">Open Profit Calculator</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfit.map((p) => (
                <Card key={p.id} className="overflow-hidden border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group rounded-3xl">
                  <CardContent className="p-0">
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0">{p.inputs.marketplace}</Badge>
                            <span className="text-[10px] text-slate-400">{p.inputs.category}</span>
                          </div>
                        </div>
                        <button onClick={() => removeSavedProduct(p.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Profit</p>
                          <p className="text-lg font-black text-blue-600">₹{Math.round(p.monthly_profit).toLocaleString()}</p>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Net Margin</p>
                          <p className="text-lg font-black text-emerald-600">{p.net_margin_pct.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div><p className="text-[9px] text-slate-400 uppercase font-medium">Price</p><p className="text-xs font-bold text-slate-700">₹{p.inputs.selling_price}</p></div>
                        <div><p className="text-[9px] text-slate-400 uppercase font-medium">Cost</p><p className="text-xs font-bold text-slate-700">₹{p.inputs.product_cost}</p></div>
                        <div><p className="text-[9px] text-slate-400 uppercase font-medium">Volume</p><p className="text-xs font-bold text-slate-700">{p.inputs.monthly_units}</p></div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/explorer/profitability-optimizer?id=${p.id}`)}
                      className="w-full py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> View Full Breakdown
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
