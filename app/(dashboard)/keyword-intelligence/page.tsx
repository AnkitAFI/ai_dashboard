"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { API_BASE_URL } from "@/lib/config";
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
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/use-subscription-limits";
import { useKIUsage } from "@/hooks/use-ki-usage";
import { useRouter } from "next/navigation";
import {
  Loader2, X, TrendingUp, TrendingDown, Minus,
  Plus, Trash2, RefreshCw, BarChart3, Target, Crown,
  Lock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Lightbulb, ShoppingBag, AlertCircle, Search,
  ArrowUp, ArrowDown, Activity, Bot, Sparkles, Compass,
  MapPin, ArrowUpRight, Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ── Types (page) ──────────────────────────────────────────────────────────────

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

// ── Types (KeywordExplorer) ───────────────────────────────────────────────────

interface ExplorerSerpItem {
  position: number;
  title: string;
  brand: string | null;
  price: number | null;
  rating: number | null;
  reviews: number | null;
  sales_volume: number | null;
  asin_or_pid: string;
}

interface ExplorerVariationItem {
  keyword: string;
  search_volume: number;
  difficulty: number;
  intent: string;
  cpc: number;
}

interface KeywordExplorerResponse {
  keyword: string;
  platform: string;
  search_volume: number;
  difficulty: number;
  intent: string;
  cpc: number;
  estimated_impressions: number;
  estimated_clicks: number;
  geo_distribution: Record<string, number>;
  variations: ExplorerVariationItem[];
  serp: ExplorerSerpItem[];
  cached_at: string;
  trend: number[];
  global_search_volume: number;
  global_breakdown: Record<string, number>;
  competitive_density: number;
  serp_features: string[];
}

interface TrackedProduct {
  asin_or_pid: string;
  platform: string;
}

interface KeywordExplorerProps {
  showToast: (title: string, description: string, variant?: "success" | "error") => void;
  trackedProducts: TrackedProduct[];
  onKeywordAdded: () => void;
  userTier?: string;
}

const API = `${API_BASE_URL}/api/keyword-tracker`;

// ── Subscription Tier Gate ────────────────────────────────────────────────────

function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${tier === "premium" ? "bg-blue-50" : "bg-amber-50"}`}>
        <Lock className={`w-6 h-6 ${tier === "premium" ? "text-blue-500" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-6">
        <p className="font-bold text-slate-800 text-sm">{feature} is locked</p>
        <p className="text-xs text-slate-400 mt-1">{tier === "premium" ? "Available on Premium · ₹2,999/mo" : "Available on Basic · ₹1,999/mo"}</p>
      </div>
      <button
        onClick={() => router.push("/subscription")}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-md transition-all hover:scale-105 ${
          tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
        }`}
      >
        <Crown className="w-4 h-4" /> Upgrade to {tier === "premium" ? "Premium" : "Basic"}
      </button>
    </div>
  );
}

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

function MiniSparkline({ history }: { history: RankPoint[] }) {
  if (history.length < 2) return <span className="text-xs text-slate-400">No chart yet</span>;
  const ranks = history.map(h => h.rank ?? 0).filter(r => r > 0);
  if (!ranks.length) return null;
  const maxR = Math.max(...ranks);
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
  const [data, setData] = useState<KeywordHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/keywords/${kw.id}/history`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.detail?.error_code) setError(d.detail.message);
        else setData(d);
      })
      .catch(() => setError("Couldn't load history. Please refresh the page."))
      .finally(() => setLoading(false));
  }, [kw.id]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
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
            <div className="mb-4">
              <MiniSparkline history={data.history} />
            </div>

            {data.ai_trend_analysis && (
              <div className="mb-4">
                <AIInsightCard insight={data.ai_trend_analysis} label="AI Trend Analysis" />
              </div>
            )}

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

// ── KeywordExplorer Sub-components ────────────────────────────────────────────

function DifficultyGauge({ value }: { value: number }) {
  const radius = 32;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let strokeColor = "stroke-green-500";
  let bgClass = "bg-green-50 text-green-700 border-green-200";
  let label = "Easy";
  let desc = "Low organic barrier. Highly actionable to rank on page 1.";

  if (value >= 60) {
    strokeColor = "stroke-rose-500";
    bgClass = "bg-rose-50 text-rose-700 border-rose-200";
    label = "Hard";
    desc = "High brand concentration. Needs significant reviews to compete.";
  } else if (value >= 30) {
    strokeColor = "stroke-amber-500";
    bgClass = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Medium";
    desc = "Moderate listings authority. Possible with solid optimizations.";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`transition-all duration-700 ease-out ${strokeColor}`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-sm font-extrabold text-slate-800">{value}%</span>
      </div>
      <div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${bgClass}`}>
          {label}
        </span>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  let label = "Researching (Informational)";
  let desc = "Buyer is seeking product details, specs, or guides.";

  if (intent === "Transactional") {
    badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
    label = "Ready to Buy (Transactional)";
    desc = "Highest purchase intent. Buyer is looking to buy immediately.";
  } else if (intent === "Commercial") {
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Comparing Brands (Commercial)";
    desc = "Buyer is comparing prices, reviews, and features.";
  }

  return (
    <div>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}`}>
        {label}
      </span>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  );
}

// ── Quick Track Modal ─────────────────────────────────────────────────────────

function QuickTrackModal({
  keyword,
  platform,
  trackedProducts,
  onClose,
  showToast,
  onKeywordAdded,
}: {
  keyword: string;
  platform: string;
  trackedProducts: TrackedProduct[];
  onClose: () => void;
  showToast: (title: string, description: string, variant?: "success" | "error") => void;
  onKeywordAdded: () => void;
}) {
  const [useExisting, setUseExisting] = useState(trackedProducts.length > 0);
  const [pidInput, setPidInput] = useState("");
  const [selectedPid, setSelectedPid] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories?table=${platform}`)
      .then((r) => r.json())
      .then((d) => setCategories(d.map((c: any) => c.category)))
      .catch(() => setCategories([]));
  }, [platform]);

  useEffect(() => {
    const matched = trackedProducts.filter((p) => p.platform === platform);
    if (matched.length > 0) {
      setSelectedPid(matched[0].asin_or_pid);
    }
  }, [trackedProducts, platform]);

  const handleTrack = async () => {
    const finalPid = useExisting ? selectedPid : pidInput.trim();
    if (!finalPid) {
      showToast("Required Field", "Please enter or select a product ID / ASIN.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/keyword-tracker/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keyword: keyword,
          asin_or_pid: finalPid,
          platform: platform,
          category: category || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Success", `Now tracking keyword "${keyword}" for ${finalPid}`);
        onKeywordAdded();
        onClose();
      } else {
        showToast("Error", data.detail?.message ?? "Failed to track keyword", "error");
      }
    } catch {
      showToast("Network Error", "Unable to connect to service.", "error");
    } finally {
      setLoading(false);
    }
  };

  const platformMatchedProducts = trackedProducts.filter((p) => p.platform === platform);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          Track Keyword
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Add <strong className="text-slate-700">"{keyword}"</strong> on {platform === "amazon" ? "Amazon" : "Flipkart"} to your dashboard rankings.
        </p>

        <div className="space-y-4">
          {platformMatchedProducts.length > 0 && (
            <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  checked={useExisting}
                  onChange={() => setUseExisting(true)}
                  className="accent-purple-600"
                />
                Use Tracked Product
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  checked={!useExisting}
                  onChange={() => setUseExisting(false)}
                  className="accent-purple-600"
                />
                Track New ASIN/PID
              </label>
            </div>
          )}

          {useExisting && platformMatchedProducts.length > 0 ? (
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select value={selectedPid} onValueChange={setSelectedPid}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose target product" />
                </SelectTrigger>
                <SelectContent>
                  {platformMatchedProducts.map((p) => (
                    <SelectItem key={p.asin_or_pid} value={p.asin_or_pid}>
                      {p.asin_or_pid} ({platform === "amazon" ? "Amazon" : "Flipkart"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>ASIN / Product ID</Label>
              <Input
                value={pidInput}
                onChange={(e) => setPidInput(e.target.value)}
                placeholder={platform === "amazon" ? "e.g., B08XYZ" : "e.g., ITMABCDEF"}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleTrack} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Track Rank"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KeywordExplorer Panel ─────────────────────────────────────────────────────

function KeywordExplorerPanel({
  showToast,
  trackedProducts,
  onKeywordAdded,
  userTier = "free",
}: KeywordExplorerProps) {
  // ── Server-side usage tracking ───────────────────────────────────────
  const { isLocked, isAtLimit, remaining: remainingSearches, limit: searchLimit, incrementUsage } = useKIUsage();
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("amazon");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordExplorerResponse | null>(null);

  const [trackTarget, setTrackTarget] = useState<string | null>(null);

  const [strategyText, setStrategyText] = useState<string>("");
  const [strategyLoading, setStrategyLoading] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string>("");

  const [showAllStates, setShowAllStates] = useState<boolean>(false);

  const calculateRegions = () => {
    if (!data || !data.geo_distribution) return [];
    const zones = [
      {
        name: "South India",
        states: ["Tamil Nadu", "Karnataka", "Telangana", "Andhra Pradesh", "Kerala", "Puducherry", "Lakshadweep", "Andaman and Nicobar Islands"]
      },
      {
        name: "North India",
        states: ["Delhi", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan", "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir", "Ladakh", "Chandigarh"]
      },
      {
        name: "West India",
        states: ["Maharashtra", "Gujarat", "Goa", "Madhya Pradesh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu"]
      },
      {
        name: "East India",
        states: ["West Bengal", "Bihar", "Odisha", "Jharkhand", "Assam", "Sikkim", "Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Tripura"]
      }
    ];

    const regions = zones.map((zone) => {
      let pctSum = 0;
      zone.states.forEach((state) => {
        pctSum += data.geo_distribution[state] || 0;
      });
      const volume = Math.round((data.search_volume * pctSum) / 100);
      return { name: zone.name, percentage: Math.round(pctSum * 10) / 10, volume };
    });

    return regions.sort((a, b) => b.volume - a.volume);
  };

  const regionalBreakdown = calculateRegions();

  const fetchStrategy = async (searchVal: string, targetPlatform: string) => {
    setStrategyLoading(true);
    setStrategyError("");
    setStrategyText("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/keyword-tracker/explorer/strategy?keyword=${encodeURIComponent(searchVal)}&platform=${targetPlatform}`,
        { credentials: "include" }
      );
      const resJson = await res.json();
      if (res.ok) {
        setStrategyText(resJson.strategy || "");
      } else {
        setStrategyError(resJson.detail?.message ?? "Error generating strategy");
      }
    } catch {
      setStrategyError("Network error. Unable to load strategy.");
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleSearch = async (overrideKeyword?: string) => {
    if (isLocked) {
      showToast("Upgrade Required", "Keyword Intelligence requires a Basic or Premium plan.", "error");
      return;
    }
    if (isAtLimit) {
      showToast("Limit Reached", `You've used all ${searchLimit} searches for this month. Upgrade for more.`, "error");
      return;
    }

    const searchVal = (overrideKeyword || keyword || "wireless headphones").trim();
    if (!searchVal) {
      showToast("Error", "Please enter a search query.", "error");
      return;
    }

    setLoading(true);
    setShowAllStates(false);
    setStrategyText("");
    setStrategyError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/keyword-tracker/explorer?keyword=${encodeURIComponent(searchVal)}&platform=${platform}`,
        { credentials: "include" }
      );
      const resJson = await res.json();
      if (res.ok) {
        setData(resJson);
        if (overrideKeyword) setKeyword(overrideKeyword);
        // ── Increment usage on the backend ──────────────────────────────
        await incrementUsage();
        fetchStrategy(searchVal, platform);
      } else {
        showToast("Search failed", resJson.detail?.message ?? "Error exploring keyword", "error");
      }
    } catch {
      showToast("Network Error", "Could not query details from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keyword.trim()) {
      handleSearch();
    }
  }, [platform]);

  const handleQuickTrack = (kw: string) => {
    setTrackTarget(kw);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Section */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 relative">
        <CardContent className="p-5">
          {/* Usage counter badge */}
          {!isLocked && remainingSearches !== null && (
            <div className="flex justify-end mb-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                remainingSearches === 0
                  ? "bg-red-50 text-red-600 border-red-200"
                  : remainingSearches <= 1
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-purple-50 text-purple-600 border-purple-200"
              }`}>
                {remainingSearches === 0
                  ? "No searches left this month"
                  : `${remainingSearches} of ${searchLimit} searches left`}
              </span>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Search Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10 h-11 border-slate-200 focus-visible:ring-purple-600 rounded-xl"
                  placeholder="Analyze products, volume, & KD (e.g. bluetooth speakers, face serum)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="w-full md:w-44 space-y-2">
              <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Marketplace</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon India
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
            <Button
              className="w-full md:w-36 h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex gap-2 items-center justify-center transition-all disabled:opacity-60"
              onClick={() => handleSearch()}
              disabled={loading || isLocked || isAtLimit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {loading && (
        <Card className="border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm animate-pulse rounded-2xl">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <div>
              <h4 className="font-bold text-purple-950">
                Retrieving Marketplace Intel
              </h4>
              <p className="text-xs text-purple-700 mt-1 max-w-md">
                We are scanning local search index data, calculating product demand, classifying search intentions, and compiling search recommendations. This process operates 100% free of charge.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State Banner */}
      {!data && !loading && (
        <Card className="border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Compass className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Keyword Explorer</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1.5 mx-auto">
                Type in any search term above (e.g., "face serum", "water bottle") and click Analyze to retrieve search volumes, buyer intent, regional demand, competitor SERPs, and local AI advice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Panels */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">

          {/* Key Metrics Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Search Volume */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Monthly Volume
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-slate-800">
                  {data.search_volume.toLocaleString("en-IN")}
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Monthly searches by buyers. Higher means more potential customers.
                </p>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-100 mt-2">
                <div className="flex justify-between">
                  <span>Est. Impressions (Views):</span>
                  <span className="font-semibold text-slate-600">{data.estimated_impressions.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Clicks (Visits):</span>
                  <span className="font-semibold text-slate-600">{data.estimated_clicks.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Difficulty */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  KD%
                  <Info className="h-4 w-4 text-slate-400" />
                </CardDescription>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Competition level to rank. Lower is easier to reach Page 1.
                </p>
              </CardHeader>
              <CardContent className="pb-4">
                <DifficultyGauge value={data.difficulty} />
              </CardContent>
            </Card>

            {/* Regional Breakdown */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Regional Breakdown
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-slate-800">
                  India
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Estimated search volume by Indian region.
                </p>
              </CardHeader>
              <CardContent className="pt-2 border-t border-slate-100 mt-2 space-y-1 text-xs">
                {regionalBreakdown.length > 0 ? (
                  regionalBreakdown.map((region) => (
                    <div key={region.name} className="flex justify-between text-slate-600">
                      <span className="truncate">{region.name}</span>
                      <span className="font-bold text-slate-700">
                        {region.volume.toLocaleString("en-IN")} ({region.percentage}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">No regional data.</div>
                )}
              </CardContent>
            </Card>

            {/* Competitive Density */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Competitive Density
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-slate-800">
                  {data.competitive_density !== undefined ? data.competitive_density.toFixed(2) : "0.00"}
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  PPC competition index from 0.00 to 1.00.
                </p>
              </CardHeader>
              <CardContent className="pt-2 border-t border-slate-100 mt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>PPC Competition</span>
                    <span>
                      {data.competitive_density >= 0.80 ? "High" : data.competitive_density >= 0.50 ? "Medium" : "Low"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${data.competitive_density >= 0.80 ? "bg-rose-500" : data.competitive_density >= 0.50 ? "bg-amber-500" : "bg-green-500"
                        }`}
                      style={{ width: `${(data.competitive_density || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intent & CPC */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Mindset & Ad Cost
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </CardDescription>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Buyer intent and estimated sponsor cost.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                <IntentBadge intent={data.intent} />
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Est. CPC:</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-700">₹{data.cpc.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend & Geo Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Search Trend Chart */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl p-6 bg-white lg:col-span-3">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  12-Month Search Volume Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Historical search volume distribution over the past year.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    (data.trend || []).map((vol, idx) => {
                      const monthNames = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
                      return { month: monthNames[idx % 12], Volume: vol };
                    })
                  } margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="#94a3b8" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                      stroke="#94a3b8"
                      width={45}
                      tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                    />
                    <Tooltip
                      contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                      labelClassName="font-bold text-slate-700"
                    />
                    <Bar dataKey="Volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geo breakdown list */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl lg:col-span-2 relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  State-wise Interest Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Estimated percentage demand distribution across top Indian commerce hubs.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative min-h-[220px]">
                <div className={showAllStates ? "max-h-[280px] overflow-y-auto pr-2 space-y-3" : "space-y-3"}>
                  {Object.entries(data.geo_distribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, showAllStates ? undefined : 8)
                    .map(([state, pct]) => (
                      <div key={state} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{state}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
                <div className="pt-3 text-center border-t border-slate-100 mt-3">
                  <button
                    onClick={() => setShowAllStates(!showAllStates)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none inline-flex items-center gap-1.5"
                  >
                    {showAllStates ? "Show Top 8 States" : "Show All 36 States & UTs"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Keyword variations table */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl lg:col-span-5">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  Related Keyword Variations
                </CardTitle>
                <CardDescription className="text-xs">
                  Autocomplete keywords matching your search prefix.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                        <th className="p-3">Keyword</th>
                        <th className="p-3 text-right">Vol</th>
                        <th className="p-3 text-center">KD%</th>
                        <th className="p-3 text-center">Intent</th>
                        <th className="p-3 text-right">CPC</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {data.variations.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-medium text-slate-800">
                            <button
                              onClick={() => handleSearch(v.keyword)}
                              className="hover:underline text-purple-700 text-left"
                            >
                              {v.keyword}
                            </button>
                          </td>
                          <td className="p-3 text-right font-semibold">{v.search_volume.toLocaleString("en-IN")}</td>
                          <td className="p-3 text-center font-medium">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${v.difficulty >= 60
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : v.difficulty >= 30
                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                    : "bg-green-50 text-green-600 border border-green-100"
                                }`}
                            >
                              {v.difficulty}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold ${v.intent === "Transactional"
                                  ? "bg-purple-100 text-purple-700"
                                  : v.intent === "Commercial"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                            >
                              {v.intent.charAt(0)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">₹{v.cpc.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleQuickTrack(v.keyword)}
                              className="p-1 hover:bg-purple-100 text-purple-600 rounded transition-colors"
                              title="Add to Rank Tracker"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SERP Features Badges */}
          {data.serp_features && data.serp_features.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SERP Features:</span>
              {data.serp_features.map((feature, idx) => (
                <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-150 text-[10px] font-semibold">
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          {/* SERP Analysis top 10 products */}
          <Card className="shadow-xs border border-slate-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                SERP Analysis (Top 10 Results)
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time snapshot of the highest performing database listings for this search term.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                      <th className="p-3 text-center w-12">Pos</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-center">Rating</th>
                      <th className="p-3 text-right">Reviews</th>
                      <th className="p-3 text-right">Monthly Sales</th>
                      <th className="p-3 w-28">ASIN/PID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.serp.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No matching items cataloged in the database.
                        </td>
                      </tr>
                    ) : (
                      data.serp.map((item) => (
                        <tr key={item.position} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center font-bold text-slate-500">{item.position}</td>
                          <td className="p-3 max-w-sm font-medium text-slate-800 truncate" title={item.title}>
                            {item.title}
                          </td>
                          <td className="p-3 text-slate-500 font-medium">
                            {(() => {
                              const brandVal = item.brand;
                              if (brandVal && brandVal !== "None" && brandVal !== "—" && brandVal.trim() !== "") {
                                return brandVal;
                              }
                              if (item.title) {
                                const words = item.title.trim().split(/\s+/);
                                if (words.length > 0) {
                                  const firstWord = words[0].replace(/^\W+|\W+$/g, "");
                                  if (firstWord) return firstWord;
                                }
                              }
                              return "—";
                            })()}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {item.price ? `₹${item.price.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="p-3 text-center font-bold text-amber-600">
                            {item.rating ? `${item.rating}★` : "—"}
                          </td>
                          <td className="p-3 text-right font-medium text-slate-600">
                            {item.reviews ? item.reviews.toLocaleString("en-IN") : "—"}
                          </td>
                          <td className="p-3 text-right font-bold text-indigo-600">
                            {item.sales_volume ? item.sales_volume.toLocaleString("en-IN") : "—"}
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-[10px] select-all">
                            {item.asin_or_pid}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Copywriting & PPC Bidding Strategy Card */}
          <Card className="shadow-xs border border-slate-200 rounded-2xl overflow-hidden relative">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                AI Copywriting & PPC Bidding Strategy
              </CardTitle>
              <CardDescription className="text-xs">
                Local AI-generated strategy recommendations based on keyword intent, volume, and difficulty.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 min-h-[200px] relative">
              {strategyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <p className="text-xs text-slate-500 font-medium">Generating copywriting & PPC strategy via Llama 3.2...</p>
                </div>
              ) : strategyError ? (
                <div className="text-xs text-rose-600 p-4 border border-rose-100 rounded-lg bg-rose-50/50">
                  Failed to generate AI strategy: {strategyError}
                </div>
              ) : strategyText ? (
                <div
                  className="prose prose-sm max-w-none text-xs text-slate-600 space-y-4"
                  dangerouslySetInnerHTML={{ __html: strategyText }}
                />
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center">
                  Analyze a keyword to generate copywriting & advertising strategy advice from your local LLM.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cache footer indicator */}
          <div className="text-right text-[10px] text-slate-400 font-mono">
            Analysis Cache Created: {new Date(data.cached_at).toLocaleString("en-IN")}
          </div>
        </div>
      )}

      {/* Quick Track popup overlay */}
      {trackTarget && (
        <QuickTrackModal
          keyword={trackTarget}
          platform={platform}
          trackedProducts={trackedProducts}
          onClose={() => setTrackTarget(null)}
          showToast={showToast}
          onKeywordAdded={onKeywordAdded}
        />
      )}
    </div>
  );
}

// ── Main page content ─────────────────────────────────────────────────────────

function KeywordTrackerIntelligenceContent() {
  const { user, isLoading } = useAuth();
  const userId = user?.id;

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [historyKw, setHistoryKw] = useState<KeywordOut | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, title, description, variant }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  };

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;
    setLoadingDash(true);
    try {
      const res = await fetch(`${API}/dashboard`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setDashboard(data);
      else showToast("Error", data.detail?.message ?? "Failed to load dashboard", "error");
    } catch {
      showToast("Network Error", "Connection issue. Please retry shortly.", "error");
    } finally {
      setLoadingDash(false);
    }
  }, [userId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return (
    <div className="space-y-6">

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-none animate-in slide-in-from-right ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
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

      <div className="space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="text-center space-y-4 pt-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mb-2 shadow-inner">
              <Compass className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-transparent bg-clip-text">
              Keyword Intelligence
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
              Explore high-opportunity buyer search terms, analyze search volumes, and track buyer keywords.
            </p>
          </div>

          {/* Subscription gate wrapper */}
          <div className="relative">
            {(user?.subscriptionTier?.toLowerCase() || "free") === "free" && (
              <TierGate tier="basic" feature="Keyword Intelligence" />
            )}
            <div className={(user?.subscriptionTier?.toLowerCase() || "free") === "free" ? "blur-sm pointer-events-none" : ""}>
              <KeywordExplorerPanel
                showToast={showToast}
                trackedProducts={dashboard?.keywords.map(kw => ({ asin_or_pid: kw.asin_or_pid, platform: kw.platform })) || []}
                onKeywordAdded={fetchDashboard}
                userTier={dashboard?.tier}
              />
            </div>
          </div>

        </div>
      </div>

      {historyKw && (
        <HistoryModal
          kw={historyKw}
          onClose={() => setHistoryKw(null)}
        />
      )}

    </div>
  );
}

export default function KeywordTrackerIntelligence() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <KeywordTrackerIntelligenceContent />
    </Suspense>
  );
}
