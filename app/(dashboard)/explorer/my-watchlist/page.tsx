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
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

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

const TabSlider = ({ activeTab, onChange, whiteSpaceCount, profitCount, isDark }: any) => {
  const { t } = useTranslation();
  return (
    <div className={cn(
      "bg-slate-200/50 p-1 rounded-2xl flex items-center w-full max-w-sm mx-auto shadow-inner",
      isDark && "bg-slate-800/50 shadow-none"
    )}>
      <button
        onClick={() => onChange("whitespace")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
          activeTab === "whitespace"
            ? isDark ? "bg-slate-900 text-violet-400 shadow-lg scale-[1.02]" : "bg-white text-violet-700 shadow-lg scale-[1.02]"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
        )}
      >
        <Sparkles className="w-4 h-4" />
        {t("myWatchlist.niches", "Niches")}
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-md", 
          activeTab === "whitespace" 
            ? isDark ? "bg-violet-950/80 text-violet-300" : "bg-violet-100 text-violet-600" 
            : isDark ? "bg-slate-800/60 text-slate-400" : "bg-slate-200 text-slate-500"
        )}>
          {whiteSpaceCount}
        </span>
      </button>
      <button
        onClick={() => onChange("profit")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
          activeTab === "profit"
            ? isDark ? "bg-slate-900 text-blue-400 shadow-lg scale-[1.02]" : "bg-white text-blue-700 shadow-lg scale-[1.02]"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
        )}
      >
        <Calculator className="w-4 h-4" />
        {t("myWatchlist.calculator", "Calculator")}
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-md", 
          activeTab === "profit" 
            ? isDark ? "bg-blue-950/80 text-blue-300" : "bg-blue-100 text-blue-600" 
            : isDark ? "bg-slate-800/60 text-slate-400" : "bg-slate-200 text-slate-500"
        )}>
          {profitCount}
        </span>
      </button>
    </div>
  );
};

export default function MyWatchlist() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

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
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-sky-100/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/40 dark:to-indigo-950/40 rounded-2xl flex items-center justify-center shadow-inner">
            <Bookmark className="h-6 w-6 text-violet-600 fill-violet-200 dark:text-violet-400 dark:fill-violet-850/30" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              {t("myWatchlist.title", "My Watchlist")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t("myWatchlist.subtitle", "Your saved opportunities and product calculations, synced across all your devices.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => { fetchWatchlist(); fetchSavedProducts(); }}
            disabled={apiLoading}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={cn("w-4 h-4", apiLoading && "animate-spin")} />
          </Button>

          <Button
            onClick={() => router.push("/explorer/white-space-finder")}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow hover:opacity-90 transition-all border-none"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("myWatchlist.findMoreGaps", "Find more gaps")}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 w-full">
        <TabSlider
          activeTab={activeTab}
          onChange={setActiveTab}
          whiteSpaceCount={items.length}
          profitCount={savedProducts.length}
          isDark={isDark}
        />

        {/* Controls */}
        {userId && (items.length > 0 || savedProducts.length > 0) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <SmartSearchInput
                value={search}
                onChange={setSearch}
                placeholder={activeTab === "whitespace" ? t("myWatchlist.searchNiches", "Search niches, categories...") : t("myWatchlist.searchProducts", "Search products, categories...")}
                className="flex-1"
                inputClassName="py-2.5 border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                dictionary={[
                  ...items.map((i: any) => i.niche),
                  ...items.map((i: any) => i.category),
                  ...savedProducts.map((p: any) => p.name),
                ].filter(Boolean)}
                maxSuggestions={5}
              />
            </div>
            
            {activeTab === "whitespace" ? (
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3 text-xs border border-slate-300 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-800 outline-none"
                >
                  <option value="added">{t("myWatchlist.recentlyAdded", "Recently added")}</option>
                  <option value="score">{t("myWatchlist.highestScore", "Highest score")}</option>
                  <option value="revenue">{t("myWatchlist.estRevenue", "Est. revenue")}</option>
                </select>
                {!confirmClear ? (
                  <Button variant="outline" size="sm" onClick={() => setConfirmClear(true)} className="text-red-500 border-red-200 dark:border-red-950/30 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t("myWatchlist.clear", "Clear")}
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" onClick={clearAll} className="bg-red-500 text-white rounded-xl hover:bg-red-600 border-none">{t("myWatchlist.confirm", "Confirm")}</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmClear(false)} className="rounded-xl border-slate-200 dark:border-slate-800">X</Button>
                  </div>
                )}
              </div>
            ) : (
              <select
                value={profitSortBy}
                onChange={(e) => setProfitSortBy(e.target.value as any)}
                className="h-10 px-3 text-xs border border-slate-300 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 outline-none"
              >
                <option value="added">{t("myWatchlist.recentlyAdded", "Recently added")}</option>
                <option value="margin">{t("myWatchlist.bestMargin", "Best margin")}</option>
                <option value="profit">{t("myWatchlist.bestProfit", "Best profit")}</option>
              </select>
            )}
          </div>
        )}

        {/* Content */}
        {!userId ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-amber-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 dark:border-slate-800"><Bookmark className="w-9 h-9 text-amber-350" /></div>
            <h3 className="text-lg font-semibold text-slate-850 dark:text-slate-100 mb-2">{t("myWatchlist.signInTitle", "Sign in to see your watchlist")}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-6">{t("myWatchlist.signInDesc", "Your watchlist is saved to your account so it's available on all your devices.")}</p>
            <Button onClick={() => router.push("/login")} className="rounded-xl">{t("myWatchlist.signInNow", "Sign In Now")}</Button>
          </div>
        ) : apiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === "whitespace" ? (
          items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-7 h-7 text-slate-350" /></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t("myWatchlist.emptyNiches", "Your niche watchlist is empty")}</p>
              <Button variant="link" onClick={() => router.push("/explorer/white-space-finder")} className="mt-2 text-violet-600 dark:text-violet-400">{t("myWatchlist.startExploring", "Start exploring market gaps")}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.query} className="overflow-hidden border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-violet-500/5 dark:hover:shadow-violet-500/2 transition-all duration-300 group rounded-3xl">
                  <CardContent className="p-0">
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{item.niche}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-450 flex items-center gap-1">
                            {item.platform === "flipkart" ? "🛒 Flipkart" : "📦 Amazon"} • {item.category}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                            item.score >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400" :
                              item.score >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/35 dark:text-amber-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/35 dark:text-rose-400"
                          )}>
                            {t("myWatchlist.score", "Score")}: {item.score}
                          </div>
                          <button onClick={() => removeItem(item.niche)} className="p-1.5 text-slate-350 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/60">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mb-0.5">{t("myWatchlist.rating", "Rating")}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-0.5">{item.avg_rating} <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /></p>
                        </div>
                        <div className="text-center border-x border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mb-0.5">{t("myWatchlist.price", "Price")}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{Math.round(item.avg_price)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mb-0.5">{t("myWatchlist.competition", "Competition")}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.competitor_count}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          {t("myWatchlist.topKeyword", "Top Keyword")}: <span className="text-violet-600 dark:text-violet-400">{item.top_keyword}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic border-l-2 border-violet-100 dark:border-violet-900 pl-3">"{item.gap_summary}"</p>
                      </div>
                    </div>

                    <div className="flex border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => router.push(`/explorer/white-space-finder?q=${encodeURIComponent(item.query)}&platform=${item.platform}&category=${encodeURIComponent(item.category)}`)}
                        className="flex-1 py-3.5 text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors border-r border-slate-100 dark:border-slate-800"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> {t("myWatchlist.analyzeNow", "Analyze Now")}
                      </button>
                      <button
                        onClick={() => window.open(item.platform === "flipkart" ? `https://www.flipkart.com/search?q=${item.query}` : `https://www.amazon.in/s?k=${item.query}`, "_blank")}
                        className="flex-1 py-3.5 text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> {t("myWatchlist.searchLive", "Search Live")}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          savedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4"><Calculator className="w-7 h-7 text-slate-350" /></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t("myWatchlist.emptyProfit", "No saved calculations yet")}</p>
              <Button variant="link" onClick={() => router.push("/explorer/profitability-optimizer")} className="mt-2 text-blue-600 dark:text-blue-400">{t("myWatchlist.openCalculator", "Open Profit Calculator")}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfit.map((p) => (
                <Card key={p.id} className="overflow-hidden border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/2 transition-all duration-300 group rounded-3xl">
                  <CardContent className="p-0">
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{p.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">{p.inputs.marketplace}</Badge>
                            <span className="text-[10px] text-slate-400 dark:text-slate-550">{p.inputs.category}</span>
                          </div>
                        </div>
                        <button onClick={() => removeSavedProduct(p.id)} className="p-1.5 text-slate-350 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">{t("myWatchlist.monthlyProfit", "Monthly Profit")}</p>
                          <p className="text-lg font-black text-blue-600 dark:text-blue-400">₹{Math.round(p.monthly_profit).toLocaleString()}</p>
                        </div>
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">{t("myWatchlist.netMargin", "Net Margin")}</p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{p.net_margin_pct.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div><p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-medium">{t("myWatchlist.price", "Price")}</p><p className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{p.inputs.selling_price}</p></div>
                        <div><p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-medium">{t("myWatchlist.cost", "Cost")}</p><p className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{p.inputs.product_cost}</p></div>
                        <div><p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-medium">{t("myWatchlist.volume", "Volume")}</p><p className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.inputs.monthly_units}</p></div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/explorer/profitability-optimizer?id=${p.id}`)}
                      className="w-full py-3.5 text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> {t("myWatchlist.viewBreakdown", "View Full Breakdown")}
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
