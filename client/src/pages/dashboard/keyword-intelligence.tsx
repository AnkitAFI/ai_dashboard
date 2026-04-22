import { useState, useEffect, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/App";
import Sidebar from "@/components/layout/sidebar";
import {
  Loader2, Menu, X, TrendingUp, TrendingDown, Minus,
  Plus, Trash2, RefreshCw, BarChart3, Target, Crown,
  Lock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Lightbulb, ShoppingBag, AlertCircle, Search,
  ArrowUp, ArrowDown, Activity, Bot, Sparkles,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TierLimits {
  keyword_limit: number;
  product_limit: number;
  history_days: number;
  competitor_limit: number;
  checks_per_day: number;
  alerts_email: boolean;
  alerts_whatsapp: boolean;
  keyword_suggestions: boolean;
  opportunity_score: boolean;
}

interface KeywordOut {
  id: number;
  keyword: string;
  asin_or_pid: string;
  platform: string;
  category: string | null;
  current_rank: number | null;
  previous_rank: number | null;
  rank_change: number | null;
  last_checked_at: string | null;
  created_at: string;
  is_active: boolean;
  ai_rank_insight: string | null;
}

interface Dashboard {
  tier: string;
  tier_limits: TierLimits;
  keywords_used: number;
  keywords_remaining: number;
  total_keywords: number;
  improving: number;
  declining: number;
  stable: number;
  not_ranked: number;
  keywords: KeywordOut[];
  ai_insight: string | null;
}

interface RankPoint {
  checked_at: string;
  rank: number | null;
  page: number | null;
}

interface KeywordHistory {
  keyword_id: number;
  keyword: string;
  asin_or_pid: string;
  platform: string;
  history: RankPoint[];
  ai_trend_analysis: string | null;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

const API = "http://localhost:8000/api/keyword-tracker";

// ── AI Insight Card ───────────────────────────────────────────────────────────

function AIInsightCard({ insight, label = "AI Insight" }: { insight: string; label?: string }) {
  return (
    <div className="flex gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />{label}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function RankBadge({ rank, change }: { rank: number | null; change: number | null }) {
  if (rank === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
        <Minus className="h-3 w-3" /> Not ranked
      </span>
    );
  }
  const page = Math.ceil(rank / 10);
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-bold text-slate-800 text-sm">#{rank}</span>
      <span className="text-[10px] text-slate-400">Page {page}</span>
      {change !== null && change !== 0 && (
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${change > 0 ? "text-green-600" : "text-red-500"}`}>
          {change > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
          {Math.abs(change)}
        </span>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    free:    "bg-slate-100 text-slate-700 border-slate-300",
    basic:   "bg-blue-100 text-blue-800 border-blue-300",
    premium: "bg-purple-100 text-purple-800 border-purple-300",
  };
  return (
    <Badge className={`${colors[tier] ?? colors.free} text-[10px] uppercase tracking-wider`}>
      {tier === "premium" && <Crown className="h-2.5 w-2.5 mr-1" />}
      {tier}
    </Badge>
  );
}

function MiniSparkline({ history }: { history: RankPoint[] }) {
  if (history.length < 2) return <span className="text-xs text-slate-400">No chart yet</span>;
  const ranks = history.map(h => h.rank ?? 0).filter(r => r > 0);
  if (!ranks.length) return null;
  const maxR  = Math.max(...ranks);
  const range = maxR - Math.min(...ranks) || 1;
  const W = 120, H = 36;
  const pts = ranks.map((r, i) => {
    const x = (i / (ranks.length - 1)) * W;
    const y = H - ((maxR - r) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
      {ranks.map((r, i) => {
        const x = (i / (ranks.length - 1)) * W;
        const y = H - ((maxR - r) / range) * (H - 4) - 2;
        return i === ranks.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />
          : null;
      })}
    </svg>
  );
}

// ── History modal ─────────────────────────────────────────────────────────────

function HistoryModal({ kw, onClose }: { kw: KeywordOut; onClose: () => void }) {
  const [data, setData]       = useState<KeywordHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`${API}/keywords/${kw.id}/history`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.detail?.error_code) setError(d.detail.message);
        else setData(d);
      })
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, [kw.id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800">{kw.keyword}</p>
            <p className="text-xs text-slate-400">{kw.asin_or_pid} · {kw.platform}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <Alert className="border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {data && !error && (
          <>
            {/* Sparkline */}
            <div className="mb-4">
              <MiniSparkline history={data.history} />
            </div>

            {/* AI Trend Analysis */}
            {data.ai_trend_analysis && (
              <div className="mb-4">
                <AIInsightCard insight={data.ai_trend_analysis} label="AI Trend Analysis" />
              </div>
            )}

            {/* History list */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {data.history.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No history yet — refresh rank to start logging.
                </p>
              )}
              {[...data.history].reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500">
                    {new Date(h.checked_at).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  <RankBadge rank={h.rank} change={null} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function KeywordTrackerIntelligence() {
  const { user, isLoading } = useAuth();
  const userId = user?.id;

  const [dashboard, setDashboard]     = useState<Dashboard | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add keyword form
  const [keyword, setKeyword]   = useState("");
  const [pid, setPid]           = useState("");
  const [platform, setPlatform] = useState("amazon");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [adding, setAdding]     = useState(false);

  // Per-keyword loading states
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});

  // AI rank insight shown inline per keyword after refresh
  const [kwInsights, setKwInsights] = useState<Record<number, string>>({});

  // History modal
  const [historyKw, setHistoryKw] = useState<KeywordOut | null>(null);

  // Suggestions panel
  const [showSuggest, setShowSuggest]     = useState(false);
  const [suggestPid, setSuggestPid]       = useState("");
  const [suggestions, setSuggestions]     = useState<any[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, title, description, variant }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  };

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;
    setLoadingDash(true);
    try {
      const res  = await fetch(`${API}/dashboard`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setDashboard(data);
      else showToast("Error", data.detail?.message ?? "Failed to load dashboard", "error");
    } catch {
      showToast("Network Error", "Could not reach the server", "error");
    } finally {
      setLoadingDash(false);
    }
  }, [userId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    fetch(`http://localhost:8000/categories?table=${platform}`)
      .then(r => r.json())
      .then(d => setCategories(d.map((c: any) => c.category)))
      .catch(() => setCategories([]));
  }, [platform]);

  // ── Add keyword ─────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!keyword.trim() || !pid.trim()) {
      showToast("Missing fields", "Please enter both a keyword and ASIN/PID", "error");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keyword: keyword.trim(),
          asin_or_pid: pid.trim(),
          platform,
          category: category || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Keyword added!", `Now tracking "${keyword}" for ${pid}`);
        setKeyword(""); setPid(""); setCategory("");
        fetchDashboard();
      } else if (res.status === 403) {
        showToast("Upgrade required", data.detail?.message ?? "Limit reached", "error");
      } else if (res.status === 409) {
        showToast("Already tracking", "This keyword is already tracked for this product", "error");
      } else {
        showToast("Error", data.detail?.message ?? "Failed to add", "error");
      }
    } catch {
      showToast("Network Error", "Could not reach the server", "error");
    } finally {
      setAdding(false);
    }
  };

  // ── Delete keyword ──────────────────────────────────────────────────────────

  const handleDelete = async (kwId: number, kwText: string) => {
    if (!window.confirm(`Remove "${kwText}" from tracking?`)) return;
    try {
      const res = await fetch(`${API}/keywords/${kwId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        showToast("Removed", `"${kwText}" removed`);
        setKwInsights(p => { const n = { ...p }; delete n[kwId]; return n; });
        fetchDashboard();
      } else {
        showToast("Error", "Failed to remove keyword", "error");
      }
    } catch {
      showToast("Network Error", "Could not reach the server", "error");
    }
  };

  // ── Refresh rank ────────────────────────────────────────────────────────────

  const handleRefresh = async (kwId: number) => {
    setRefreshing(p => ({ ...p, [kwId]: true }));
    try {
      const res  = await fetch(`${API}/keywords/${kwId}/refresh`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          "Rank updated!",
          `Current rank: ${data.current_rank !== null ? `#${data.current_rank}` : "Not ranked"}`,
        );
        // Store AI insight for this keyword if returned
        if (data.ai_rank_insight) {
          setKwInsights(p => ({ ...p, [kwId]: data.ai_rank_insight }));
        }
        fetchDashboard();
      } else if (res.status === 429) {
        showToast("Rate limited", data.detail?.message ?? "Too many checks", "error");
      } else if (res.status === 403) {
        showToast("Upgrade required", data.detail?.message ?? "Limit reached", "error");
      } else {
        showToast("Error", data.detail?.message ?? "Refresh failed", "error");
      }
    } catch {
      showToast("Network Error", "Could not reach the server", "error");
    } finally {
      setRefreshing(p => ({ ...p, [kwId]: false }));
    }
  };

  // ── Keyword suggestions ─────────────────────────────────────────────────────

  const fetchSuggestions = async () => {
    if (!suggestPid.trim()) {
      showToast("Enter ASIN/PID", "Please enter a product ID", "error");
      return;
    }
    setLoadingSuggest(true);
    try {
      const params = new URLSearchParams({ asin_or_pid: suggestPid.trim(), platform });
      if (category) params.set("category", category);
      const res  = await fetch(`${API}/suggestions?${params}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setSuggestions(data.suggestions);
      else showToast("Error", data.detail?.message ?? "Failed to load suggestions", "error");
    } catch {
      showToast("Network Error", "Could not reach the server", "error");
    } finally {
      setLoadingSuggest(false);
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────────

  const limits = dashboard?.tier_limits;
  const canAdd = limits
    ? (limits.keyword_limit === -1 || (dashboard?.keywords_used ?? 0) < limits.keyword_limit)
    : true;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-md animate-in slide-in-from-right ${
            t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}>
            {t.variant === "success"
              ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
            <div className="flex-1">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
              <p className={`text-sm mt-0.5 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
            </div>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
              <X className={`h-4 w-4 ${t.variant === "success" ? "text-green-600" : "text-red-600"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 rounded-xl shadow-md"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      <div className="lg:ml-64 transition-all min-h-screen">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border border-sky-100 shadow-xl rounded-2xl px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-inner border border-purple-50">
              <Search className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-900 to-blue-700 bg-clip-text text-transparent tracking-tight">
                Keyword Rank Tracker
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">
                Track where your products rank on Amazon & Flipkart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <p className="text-xs text-slate-400 animate-pulse">Checking session…</p>
            ) : dashboard ? (
              <div className="bg-white/50 rounded-xl px-4 py-2 border border-slate-200 shadow-sm min-w-[180px]">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Keywords</p>
                  <TierBadge tier={dashboard.tier} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${!canAdd ? "bg-red-500" : "bg-gradient-to-r from-purple-400 to-blue-400"}`}
                      style={{
                        width: limits?.keyword_limit === -1
                          ? "100%"
                          : `${Math.min(((dashboard.keywords_used) / (limits?.keyword_limit ?? 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-bold text-slate-600">
                    {dashboard.keywords_used}/{limits?.keyword_limit === -1 ? "∞" : limits?.keyword_limit}
                  </span>
                </div>
              </div>
            ) : !userId ? (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 gap-1 text-[10px]">
                <AlertCircle className="h-3 w-3" /> Guest Mode
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Summary stats ── */}
            {dashboard && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Improving",   value: dashboard.improving,  icon: TrendingUp,   color: "text-green-600",  bg: "bg-green-50 border-green-200" },
                  { label: "Declining",   value: dashboard.declining,  icon: TrendingDown, color: "text-red-500",    bg: "bg-red-50 border-red-200" },
                  { label: "Stable",      value: dashboard.stable,     icon: Minus,        color: "text-slate-500",  bg: "bg-slate-50 border-slate-200" },
                  { label: "Not Ranked",  value: dashboard.not_ranked, icon: Activity,     color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`rounded-xl border-2 p-4 ${bg} flex items-center gap-3`}>
                    <Icon className={`h-6 w-6 ${color} flex-shrink-0`} />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── AI Dashboard Insight (Basic+) ── */}
            {dashboard?.ai_insight && (
              <AIInsightCard insight={dashboard.ai_insight} label="AI Portfolio Insight" />
            )}

            {/* ── Add keyword form ── */}
            <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  Track a New Keyword
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Enter the keyword a customer would search, and your product's ASIN (Amazon) or PID (Flipkart).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Keyword</Label>
                    <Input
                      value={keyword}
                      onChange={e => setKeyword(e.target.value)}
                      placeholder='e.g., "wireless headphones under 1000"'
                      disabled={!canAdd}
                      onKeyDown={e => e.key === "Enter" && handleAdd()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ASIN / PID</Label>
                    <Input
                      value={pid}
                      onChange={e => setPid(e.target.value)}
                      placeholder="e.g., B08XYZ or ITMABCDEF"
                      disabled={!canAdd}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Marketplace</Label>
                    <Select value={platform} onValueChange={setPlatform} disabled={!canAdd}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amazon">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon
                          </div>
                        </SelectItem>
                        <SelectItem value="flipkart">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category <span className="text-slate-400 text-xs">(optional)</span></Label>
                    <Select value={category} onValueChange={setCategory} disabled={!canAdd}>
                      <SelectTrigger>
                        <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={adding || !canAdd}
                  className={`w-full ${!canAdd ? "bg-slate-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} text-white`}
                >
                  {adding ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding…</>
                  ) : !canAdd ? (
                    <><Lock className="h-4 w-4 mr-2" />Keyword Limit Reached — Upgrade to Continue</>
                  ) : (
                    <><Target className="h-4 w-4 mr-2" />Start Tracking Keyword</>
                  )}
                </Button>

                {!canAdd && dashboard && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Crown className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-sm">
                      You've used all {limits?.keyword_limit} keyword slots on the {dashboard.tier} plan.{" "}
                      <a href="/subscription" className="font-semibold underline">Upgrade now</a> to track more.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* ── Keyword Suggestions panel (Basic+) ── */}
            {dashboard && dashboard.tier !== "free" && (
              <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
                <CardHeader>
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowSuggest(v => !v)}
                  >
                    <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      AI Keyword Suggestions
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[10px]">
                        <Sparkles className="h-2.5 w-2.5 mr-1" />
                        {dashboard.tier_limits.opportunity_score ? "AI + Score" : "AI Powered"}
                      </Badge>
                    </CardTitle>
                    {showSuggest
                      ? <ChevronUp className="h-4 w-4 text-slate-400" />
                      : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                </CardHeader>

                {showSuggest && (
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={suggestPid}
                        onChange={e => setSuggestPid(e.target.value)}
                        placeholder="Enter ASIN or PID to get AI suggestions"
                        className="flex-1"
                      />
                      <Button
                        onClick={fetchSuggestions}
                        disabled={loadingSuggest}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {loadingSuggest
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Search className="h-4 w-4" />}
                      </Button>
                    </div>

                    {loadingSuggest && (
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                        <p className="text-sm text-purple-700">AI is generating keyword ideas for your product…</p>
                      </div>
                    )}

                    {suggestions.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {suggestions.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{s.keyword}</p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  s.estimated_search_volume === "High"   ? "bg-green-100 text-green-700" :
                                  s.estimated_search_volume === "Medium" ? "bg-yellow-100 text-yellow-700" :
                                                                           "bg-slate-100 text-slate-600"
                                }`}>{s.estimated_search_volume} vol</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  s.competition_level === "Low"    ? "bg-green-100 text-green-700" :
                                  s.competition_level === "Medium" ? "bg-yellow-100 text-yellow-700" :
                                                                     "bg-red-100 text-red-700"
                                }`}>{s.competition_level} comp</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              {s.opportunity_score != null && (
                                <div className="text-center">
                                  <p className="text-lg font-bold text-purple-600">{s.opportunity_score}</p>
                                  <p className="text-[9px] text-slate-400">Score</p>
                                </div>
                              )}
                              <button
                                onClick={() => { setKeyword(s.keyword); setSuggestPid(""); setShowSuggest(false); }}
                                className="p-1.5 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700 transition-colors"
                                title="Use this keyword"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* ── Tracked keywords list ── */}
            <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Tracked Keywords
                    {dashboard && (
                      <span className="text-sm font-normal text-slate-400">({dashboard.total_keywords})</span>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboard}
                    disabled={loadingDash}
                    className="gap-1 text-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingDash ? "animate-spin" : ""}`} />
                    Refresh all
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {loadingDash && !dashboard && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                )}

                {!userId && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-sm">
                      Please log in to track keywords.
                    </AlertDescription>
                  </Alert>
                )}

                {dashboard?.keywords.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No keywords tracked yet</p>
                    <p className="text-sm text-slate-400 mt-1">Add your first keyword above to start tracking.</p>
                  </div>
                )}

                {dashboard && dashboard.keywords.length > 0 && (
                  <div className="space-y-3">
                    {dashboard.keywords.map(kw => (
                      <div key={kw.id} className="rounded-xl border border-slate-200 overflow-hidden">

                        {/* Keyword row */}
                        <div className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 transition-colors">

                          {/* Platform icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            kw.platform === "amazon" ? "bg-orange-100" : "bg-yellow-100"
                          }`}>
                            <ShoppingBag className={`h-4 w-4 ${kw.platform === "amazon" ? "text-orange-600" : "text-yellow-600"}`} />
                          </div>

                          {/* Keyword info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">{kw.keyword}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[11px] text-slate-400 font-mono">{kw.asin_or_pid}</span>
                              {kw.category && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{kw.category}</span>
                              )}
                              {kw.last_checked_at && (
                                <span className="text-[10px] text-slate-400">
                                  Checked {new Date(kw.last_checked_at).toLocaleString("en-IN", {
                                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rank */}
                          <div className="flex-shrink-0">
                            <RankBadge rank={kw.current_rank} change={kw.rank_change} />
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleRefresh(kw.id)}
                              disabled={refreshing[kw.id]}
                              className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                              title="Refresh rank + get AI insight"
                            >
                              <RefreshCw className={`h-4 w-4 ${refreshing[kw.id] ? "animate-spin" : ""}`} />
                            </button>
                            {dashboard.tier !== "free" && (
                              <button
                                onClick={() => setHistoryKw(kw)}
                                className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
                                title="View history + AI trend"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(kw.id, kw.keyword)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                              title="Remove keyword"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* AI rank insight — shown after refresh */}
                        {refreshing[kw.id] && (
                          <div className="px-4 pb-3 pt-2 bg-purple-50 border-t border-purple-100">
                            <div className="flex items-center gap-2 text-purple-600">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span className="text-xs">AI is analysing your rank change…</span>
                            </div>
                          </div>
                        )}
                        {!refreshing[kw.id] && kwInsights[kw.id] && (
                          <div className="px-4 pb-4 pt-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-100">
                            <div className="flex gap-2">
                              <Bot className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-700 leading-relaxed">{kwInsights[kw.id]}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Tier feature info ── */}
            {dashboard && (
              <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-slate-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-700">
                    Your Plan — {dashboard.tier.charAt(0).toUpperCase() + dashboard.tier.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    {[
                      { label: "Keywords",   value: limits?.keyword_limit === -1 ? "∞" : limits?.keyword_limit },
                      { label: "Products",   value: limits?.product_limit === -1 ? "∞" : limits?.product_limit },
                      { label: "Checks/day", value: limits?.checks_per_day },
                      { label: "History",    value: limits?.history_days === 0 ? "None" : limits?.history_days === 9999 ? "Full" : `${limits?.history_days}d` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-xl border border-slate-200 p-3">
                        <p className="text-xl font-bold text-slate-800">{value}</p>
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  {dashboard.tier === "free" && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                      <p className="text-xs text-purple-700 text-center">
                        <Bot className="h-3.5 w-3.5 inline mr-1" />
                        Upgrade to Basic or Premium to unlock AI insights on your rankings, trends, and keyword suggestions.
                      </p>
                    </div>
                  )}

                  {dashboard.tier !== "premium" && (
                    <div className="mt-3 flex justify-center">
                      <a
                        href="/subscription"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-xl transition-all"
                      >
                        <Crown className="h-4 w-4" />
                        Upgrade for AI-powered features
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* History modal */}
      {historyKw && (
        <HistoryModal
          kw={historyKw}
          onClose={() => setHistoryKw(null)}
        />
      )}

    </div>
  );
}