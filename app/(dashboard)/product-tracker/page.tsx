"use client";

import { useState, useEffect } from "react";
import { useSessionState } from "@/hooks/use-session-state";
import { useTheme } from "next-themes";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Target, TrendingUp, DollarSign, Users, MapPin,
  AlertTriangle, Lightbulb, X, ShoppingBag, CheckCircle2,
  XCircle, History, Crown, Lock, Shield, Clock, Activity,
  ChevronDown, ChevronUp, Zap, BarChart3,
  AlertCircle, Star, TrendingDown, Truck, Trophy, Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface GapItem {
  gap_type: string;
  severity: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  count: number;
}

interface FinalVerdict {
  opportunity_score: number;
  verdict_label: string;
  verdict_color: string;
  beat_actions: string[];
  improvements: string[];
  risks: string[];
  high_gaps_count: number;
  medium_gaps_count: number;
}

/** Inner payload — lives inside ApiResponse.data */
interface ProductTrackerData {
  product_name: string;
  category: string;
  source: string;
  pricing: {
    recommended_price: number;
    min_price: number;
    max_price: number;
    profit_margin: number;
    confidence: string;
    market_avg_price: number;
    market_min_price: number;
    market_max_price: number;
  };
  sales: {
    estimated_monthly_sales: string;
    estimated_daily_sales: number;
    market_demand: string;
  };
  competition: {
    total_competitors: number;
    avg_competitor_price: number;
    avg_competitor_rating: number;
    top_competitor: {
      name: string;
      price: number;
      rating: number;
      reviews: number;
    } | null;
  };
  location_insights: Array<{
    country: string;
    market_share: string;
    demand_level: string;
  }>;
  ai_strategy: string;
  market_gaps: GapItem[];
  final_verdict: FinalVerdict | null;
  fallback_reason: string | null;
}

/** New uniform envelope — every endpoint returns this */
interface ApiResponse {
  success: boolean;
  request_id: string;
  latency_ms: number;
  source_type: string;   // "exact_match" | "keyword_match" | "broad_match" | "category_fallback" | "no_data"
  confidence_score: {
    score: number;          // 0.0 – 1.0
    label: string;          // "High" | "Medium" | "Low"
    tier_used: string;      // "tier_1_exact" … "no_data"
    sample_size: number;
    has_sales_data: boolean;
    has_review_data: boolean;
    price_spread_pct: number;
  } | null;
  warnings: string[];
  data: ProductTrackerData | null;
  step_timings: Record<string, number> | null;
}

/** Error shape returned by the new AppError handlers */
interface ApiErrorResponse {
  success: false;
  error_code: string;   // "QUOTA_EXCEEDED" | "VALIDATION_ERROR" | "DATABASE_ERROR" | …
  message: string;
  detail: any;
  request_id: string | null;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

interface UsageLimits {
  count: number;
  limit: number;
  remaining: number;
  subscription_tier: string;
}

const SOURCE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  exact_match: { label: "Exact Match", color: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800" },
  keyword_match: { label: "Keyword Match", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800" },
  broad_match: { label: "Broad Match", color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800" },
  category_fallback: { label: "Category Fallback", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800" },
  no_data: { label: "No Data", color: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800" },
};

const TIER_LABELS: Record<string, string> = {
  tier_1_exact: "Tier 1 — Exact",
  tier_2_keyword: "Tier 2 — Keyword",
  tier_3_broad: "Tier 3 — Broad",
  tier_4_category: "Tier 4 — Category",
  no_data: "No Data",
};

/** Confidence score pill + expandable breakdown */
function ConfidencePanel({ cs }: { cs: NonNullable<ApiResponse["confidence_score"]> }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(cs.score * 100);
  const barColor =
    cs.label === "High" ? "bg-green-500" :
      cs.label === "Medium" ? "bg-yellow-500" : "bg-red-500";
  const textColor =
    cs.label === "High" ? "text-green-700 dark:text-green-400" :
      cs.label === "Medium" ? "text-yellow-700 dark:text-yellow-400" : "text-red-700 dark:text-red-400";
  const bgColor =
    cs.label === "High" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
      cs.label === "Medium" ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";

  return (
    <div className={`rounded-xl border-2 p-4 ${bgColor}`}>
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <Shield className={`h-5 w-5 ${textColor}`} />
          <div className="text-left">
            <p className={`font-semibold text-sm ${textColor}`}>
              Data Confidence: {cs.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {TIER_LABELS[cs.tier_used] ?? cs.tier_used} · {cs.sample_size} products analysed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sample Size</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{cs.sample_size}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sales Data</p>
            <p className={`font-bold ${cs.has_sales_data ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
              {cs.has_sales_data ? "✓ Present" : "✗ Missing"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Review Data</p>
            <p className={`font-bold ${cs.has_review_data ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
              {cs.has_review_data ? "✓ Present" : "✗ Missing"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Price Spread</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{cs.price_spread_pct.toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Latency / request metadata bar */
function MetaBar({
  requestId, latencyMs, sourceType, stepTimings,
}: {
  requestId: string;
  latencyMs: number;
  sourceType: string;
  stepTimings: Record<string, number> | null;
}) {
  const [open, setOpen] = useState(false);
  const st = SOURCE_TYPE_LABELS[sourceType] ?? { label: sourceType, color: "bg-slate-100 text-slate-700 border-slate-300" };

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`text-xs ${st.color}`}>{st.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {latencyMs.toFixed(0)} ms total
          </span>
          <span className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[200px]">
            ID: {requestId}
          </span>
        </div>
        {stepTimings && Object.keys(stepTimings).length > 0 && (
          <button
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => setOpen(v => !v)}
          >
            <Activity className="h-3.5 w-3.5" />
            Step timings
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {open && stepTimings && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
          {Object.entries(stepTimings).map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{k.replace(/_/g, " ")}</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{typeof v === "number" ? `${v} ms` : String(v)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Fallback / category-match warning banner */
function FallbackBanner({ reason }: { reason: string }) {
  return (
    <Alert className="border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
      <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="text-sm text-orange-800 dark:text-orange-300">{reason}</AlertDescription>
    </Alert>
  );
}

const getGapIcon = (iconText: string) => {
  if (!iconText) return <AlertCircle className="h-5 w-5" />;
  const t = iconText.toUpperCase();
  if (t.includes('MONEY') || t.includes('DOLLAR') || t.includes('PRICE') || t.includes('PROFIT')) return <DollarSign className="h-5 w-5" />;
  if (t.includes('TROPHY') || t.includes('WIN') || t.includes('BEST') || t.includes('LEAD')) return <Trophy className="h-5 w-5" />;
  if (t.includes('STAR') || t.includes('RATING') || t.includes('REVIEW')) return <Star className="h-5 w-5" />;
  if (t.includes('DOWN') || t.includes('LOW') || t.includes('DROP')) return <TrendingDown className="h-5 w-5" />;
  if (t.includes('UP') || t.includes('HIGH') || t.includes('GROW')) return <TrendingUp className="h-5 w-5" />;
  if (t.includes('TRUCK') || t.includes('SHIP') || t.includes('DELIVER') || t.includes('PRIME')) return <Truck className="h-5 w-5" />;
  if (t.includes('WARN') || t.includes('ALERT') || t.includes('RISK')) return <AlertTriangle className="h-5 w-5" />;
  if (t.includes('BOX') || t.includes('PACKAGE') || t.includes('PRODUCT') || t.includes('INVENT')) return <Package className="h-5 w-5" />;
  
  // Emoji fallback if it's actually an emoji or short symbol
  if (t.length <= 2) return <span className="text-xl">{iconText}</span>;

  return <AlertCircle className="h-5 w-5" />;
};

export default function ProductTracker() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const userEmail = user?.email || "";
  const userId = user?.id;

  const [ptMounted, setPtMounted] = useState(false);
  useEffect(() => { setPtMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = ptMounted && resolvedTheme === "dark";

  const [productName, setProductName] = useSessionState("pt_productName", "");
  const [category, setCategory] = useSessionState("pt_category", "");
  const [categories, setCategories] = useState<string[]>([]);
  const [source, setSource] = useSessionState("pt_source", "amazon");
  const [baseCost, setBaseCost] = useSessionState("pt_baseCost", "");
  const [loading, setLoading] = useState(false);

  const [apiResponse, setApiResponse] = useSessionState<ApiResponse | null>("pt_apiResponse", null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const result = apiResponse?.data ?? null;

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const UNLIMITED = 1_000_000;

  useEffect(() => { if (userId) fetchUsageLimits(); }, [userId]);

  const fetchUsageLimits = async () => {
    if (!userId) return;
    setLoadingUsage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/analysis-usage`, { 
        credentials: "include",
        cache: 'no-store'
      });
      const body = await res.json();
      const d = body.data ?? body;
      if (res.ok) {
        setUsageLimits({
          count: d.count,
          limit: d.limit === -1 ? UNLIMITED : d.limit,
          remaining: d.remaining === -1 ? UNLIMITED : d.remaining,
          subscription_tier: d.subscription_tier,
        });
      }
    } catch (err) {
      console.error("Failed to fetch usage limits:", err);
    } finally {
      setLoadingUsage(false);
    }
  };

  const canAnalyze = usageLimits
    ? usageLimits.limit >= UNLIMITED || usageLimits.count < usageLimits.limit
    : true;

  const getUpgradeMessage = () => {
    if (!usageLimits) return "";
    const tier = usageLimits.subscription_tier.toLowerCase();
    if (tier === "free") return "Upgrade to Basic for 20 analyses per month";
    if (tier === "basic") return "Upgrade to Premium for unlimited analyses";
    return "Upgrade for more features";
  };

  const fetchCategories = async (src: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories?table=${src}`, { cache: 'no-store' });
      const data = await res.json();
      const cats = data.map((c: any) => c.category);
      setCategories(cats);
      if (!cats.includes(category)) setCategory("");
    } catch {
      setCategories([]);
      setCategory("");
    }
  };
  useEffect(() => { fetchCategories(source); }, [source]);

  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleAnalyze = async () => {
    if (userId && !canAnalyze) {
      setShowUpgradeModal(true);
      showToast("Analysis Limit Reached", `You've used all ${usageLimits?.limit} analyses this month.`, "error");
      return;
    }
    if (!productName || !category) {
      showToast("Missing Information", "Please fill in Product Name and Category to analyse your product.", "error");
      return;
    }
    const cost = baseCost.trim() ? parseFloat(baseCost) : 0;
    if (baseCost.trim() && (isNaN(cost) || cost < 0)) {
      showToast("Invalid Cost", "Please enter a valid cost price (or leave it blank).", "error");
      return;
    }
    if (cost > 50000) {
      const ok = window.confirm(
        `⚠️ Warning: Your cost is ₹${cost.toLocaleString()}. This seems very high.\n\nCommon mistakes:\n• Extra zeros?\n• Per-carton vs per-unit?`
      );
      if (!ok) return;
    }

    setLoading(true);
    setApiResponse(null);
    setNotFoundMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/product-tracker/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
        body: JSON.stringify({
          product_name: productName,
          category,
          source,
          base_cost: cost,
          user_email: userEmail || null,
        }),
      });

      const body: ApiResponse | ApiErrorResponse = await res.json();

      if (!res.ok) {
        const err = body as ApiErrorResponse;
        if (res.status === 404 || err.detail?.toLowerCase().includes("no products found")) {
          setNotFoundMessage(err.detail || `No products found for "${productName}" in "${category}" on ${source === "both" ? "Amazon India and Flipkart India" : source === "amazon" ? "Amazon India" : "Flipkart India"}. Try a simpler product name or different category.`);
          return;
        }
        if (err.error_code === "QUOTA_EXCEEDED") setShowUpgradeModal(true);
        showToast("Analysis Failed", err.detail || "Couldn't complete analysis. Please try again.", "error");
        return;
      }

      const envelope = body as ApiResponse;
      setApiResponse(envelope);

      if (userId) await fetchUsageLimits();

      const saved = userEmail ? ` & saved to ${userEmail}` : " — login to save history";
      showToast("Analysis Complete!", `${source} market analysed${saved}`, "success");
      setTimeout(() => window.scrollTo({ top: 500, behavior: "smooth" }), 100);

    } catch (err: any) {
      showToast("Network Error", "Connection issue. Please retry shortly.", "error");
      console.error("Analyse error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadgeColor = (c: string) =>
    c === "High" ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800" :
      c === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800" :
        "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800";

  const getDemandBadgeColor = (d: string) =>
    d === "High" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" :
      d === "Medium" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800" :
        "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";

  const getDemandExplanation = (demand: string) => {
    switch (demand?.toLowerCase()) {
      case "high": return "🔥 High customer demand & active buying interest in this category. Excellent market opportunity.";
      case "medium": return "⚖️ Moderate customer demand & steady search volume in this category. Balanced market.";
      case "low": return "🌱 Niche market with specialized customer demand. Lower competition, ideal for targeted audiences.";
      default: return "📊 Overall market demand estimate based on category activity.";
    }
  };

  const getSourceColor = (s: string) =>
    s.toLowerCase() === "amazon"
      ? "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800"
      : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800";

  const getSeverityColor = (s: string) =>
    s === "High" ? "border-red-200 dark:border-red-900/40 bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/40 dark:to-rose-950/20 shadow-sm" :
      s === "Medium" ? "border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-950/40 dark:to-yellow-950/20 shadow-sm" :
        "border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-gray-50/50 dark:from-slate-900/40 dark:to-gray-800/20 shadow-sm";

  const getSeverityBadgeColor = (s: string) =>
    s === "High" ? "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 shadow-sm" :
      s === "Medium" ? "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-sm" :
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm";

  return (
    <div className="space-y-6">

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Analysis Limit Reached</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You&apos;ve used all <span className="font-bold text-red-600 dark:text-red-400">{usageLimits?.limit}</span> analyses this month on the{" "}
                <span className="font-semibold dark:text-slate-200">{usageLimits?.subscription_tier.toUpperCase()}</span> plan.
              </p>
              <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-purple-50 dark:to-purple-900/20 rounded-xl p-4 mb-6 border-2 border-blue-200 dark:border-blue-800">
                <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{getUpgradeMessage()}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => window.location.href = "/subscription"}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 animate-in slide-in-from-right ${
            t.variant === "success"
              ? "bg-green-50 dark:bg-green-950/60 border-green-300 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800"
          }`}>
            {t.variant === "success"
              ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900 dark:text-green-300" : "text-red-900 dark:text-red-300"}`}>{t.title}</p>
              <p className={`text-sm mt-1 ${t.variant === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{t.description}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className={t.variant === "success" ? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200" : "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Header & Usage Meter */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="text-left space-y-1">
              <h1 className="page-title">
                {t('pr.title', 'Product Radar (AI)')}
              </h1>
              <p className="page-subtitle">
                {t('pr.subtitle', 'Scan specific products to analyze market competition, pricing metrics, and project AI reports.')}
              </p>
            </div>

            {!loadingUsage && userId && usageLimits && (
              <div className="shrink-0 bg-background opacity-100 rounded-xl px-4 py-2 border border-slate-200 shadow-sm min-w-[160px] self-start sm:self-auto">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{t('pr.analysesUsed', 'Analyses used')}</p>
                  <Badge className={`h-4 text-[10px] border-none px-1.5 ${usageLimits.subscription_tier.toLowerCase() === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : usageLimits.subscription_tier.toLowerCase() === "premium" ? "bg-violet-100 text-violet-800" : usageLimits.subscription_tier.toLowerCase() === "basic" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                    {(usageLimits.subscription_tier || "free").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${usageLimits.limit >= UNLIMITED ? 0 : Math.min((usageLimits.count / usageLimits.limit) * 100, 100)}%`, 
                        background: (usageLimits.limit >= UNLIMITED ? 0 : Math.min((usageLimits.count / usageLimits.limit) * 100, 100)) >= 80 ? "#ef4444" : "#7F77DD" 
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {usageLimits.count}/{usageLimits.limit >= UNLIMITED ? "∞" : usageLimits.limit}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-visible bg-background opacity-100 backdrop-blur-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-200">{t('pr.productInfo', 'Product Information')}</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {t('pr.enterDetails', 'Enter your product details to get AI-powered market insights from')} Amazon India / Flipkart India
                  </CardDescription>
                </div>
                <a
                  href="/product-tracker/history"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                  data-track-id="analytics_history_btn"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{t('pr.analyticsHistory', 'Analytics History')}</span>
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">{t('pr.productName', 'Product Name')}</Label>
                  <SmartSearchInput
                    id="product-name"
                    value={productName}
                    onChange={setProductName}
                    placeholder="e.g., Wireless Headphones"
                    disabled={!!userId && !canAnalyze}
                    inputClassName="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t('pr.category', 'Category')}</Label>
                  <Select value={category} onValueChange={setCategory} disabled={!!userId && !canAnalyze}>
                    <SelectTrigger id="category" data-track-id="category_select" data-filter-value={category}>
                      <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0
                        ? <SelectItem value="disabled" disabled>No categories available</SelectItem>
                        : categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">{t('pr.marketplace', 'Marketplace')}</Label>
                  <Select value={source} onValueChange={setSource} disabled={!!userId && !canAnalyze}>
                    <SelectTrigger id="source" data-track-id="marketplace_select" data-filter-value={source}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">
                        <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon India</div>
                      </SelectItem>
                      <SelectItem value="flipkart">
                        <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart India</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base-cost">{t('pr.yourCostPrice', 'Your Cost Price (₹) (Optional)')}</Label>
                  <Input
                    id="base-cost"
                    data-track-id="base-cost-input"
                    type="number"
                    value={baseCost}
                    onChange={e => setBaseCost(e.target.value)}
                    placeholder="e.g., 500 (Auto-calculated if blank)"
                    disabled={!!userId && !canAnalyze}
                  />
                </div>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || (!!userId && !canAnalyze)}
                className={`w-full ${userId && !canAnalyze ? "bg-slate-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                data-track-id="analyze-btn"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('pr.analyzingMarket', 'Analyzing Market...')}</>
                ) : (userId && !canAnalyze) ? (
                  <><Lock className="mr-2 h-4 w-4" /> {t('pr.limitReached', 'Limit Reached')}</>
                ) : (
                  <><Target className="mr-2 h-4 w-4" /> {t('pr.analyzeMarket', 'Analyze Market')}</>
                )}
              </Button>
              {loading && (
                <p className="text-xs text-slate-500 text-center mt-2 animate-pulse">
                  {t('pr.analysisNote', 'We are analyzing the data. This may take 1–2 minutes.')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── NOT FOUND MESSAGE CARD ── */}
          {!loading && notFoundMessage && (
            <Card className="border-2 border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6 shadow-md">
              <CardContent className="p-0 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Similar Products Found</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {notFoundMessage}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                    💡 Tip: Use general keywords (e.g., &quot;Wireless Headphones&quot;)
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                    💡 Tip: Try checking a broader category
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── RESULTS ── */}
          {apiResponse && result && (
            <div className="space-y-6">

              {/* Source Badge */}
              <div className="flex justify-center">
                <Badge className={`${getSourceColor(result.source)} text-base px-4 py-2`}>
                  📊 Analysis for {result.source}
                </Badge>
              </div>

              {/* [NEW] Meta bar — request ID, latency, source type, step timings */}
              <MetaBar
                requestId={apiResponse.request_id}
                latencyMs={apiResponse.latency_ms}
                sourceType={apiResponse.source_type}
                stepTimings={apiResponse.step_timings}
              />

              {/* [NEW] Confidence score panel */}
              {apiResponse.confidence_score && (
                <ConfidencePanel cs={apiResponse.confidence_score} />
              )}

              {/* [NEW] Fallback reason banner (Tier 3/4 only) */}
              {result.fallback_reason && (
                <FallbackBanner reason={result.fallback_reason} />
              )}

              {/* Warnings (now from ApiResponse.warnings, not result.warnings) */}
              {apiResponse.warnings && apiResponse.warnings.length > 0 && (
                <div className="space-y-3">
                  {apiResponse.warnings.map((w, i) => {
                    const isCritical = w.includes("CRITICAL") || w.includes("DANGER") || w.includes("impossible") || w.includes("Cannot compete");
                    const isPositive = w.includes("EXCELLENT") || w.includes("VIABLE");
                    const isSolution = w.toLowerCase().startsWith("solution");
                    
                    let typeColor = "border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-950/40 dark:to-yellow-950/20 text-amber-800 dark:text-amber-300";
                    let Icon = AlertTriangle;
                    let iconColor = "text-amber-600 dark:text-amber-400";

                    if (isCritical) {
                      typeColor = "border-red-200 dark:border-red-900/40 bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/40 dark:to-rose-950/20 text-red-800 dark:text-red-300";
                      Icon = XCircle;
                      iconColor = "text-red-600 dark:text-red-400";
                    } else if (isPositive) {
                      typeColor = "border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 to-green-50/50 dark:from-emerald-950/40 dark:to-green-950/20 text-emerald-800 dark:text-emerald-300";
                      Icon = CheckCircle2;
                      iconColor = "text-emerald-600 dark:text-emerald-400";
                    } else if (isSolution) {
                      typeColor = "border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 text-blue-800 dark:text-blue-300";
                      Icon = Lightbulb;
                      iconColor = "text-blue-600 dark:text-blue-400";
                    }

                    const renderText = (text: string) => {
                      const match = text.match(/^(CRITICAL|DANGER|Solution|WARNING|EXCELLENT|VIABLE):\s*(.*)/i);
                      if (match) {
                        return (
                          <>
                            <span className="font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 mr-2 shadow-sm border border-black/5 dark:border-white/10">{match[1]}</span>
                            {match[2]}
                          </>
                        );
                      }
                      return text;
                    };

                    return (
                      <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${typeColor}`}>
                        <div className="mt-0.5 shrink-0 bg-white/50 dark:bg-black/20 p-1.5 rounded-lg shadow-sm border border-black/5 dark:border-white/5">
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        <div className="text-sm font-medium leading-relaxed pt-1.5 flex-1">
                          {renderText(w)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pricing */}
              <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-background">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Pricing Strategy
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getSourceColor(result.source)}>{result.source}</Badge>
                      <Badge className={getConfidenceBadgeColor(result.pricing.confidence)}>
                        {result.pricing.confidence} Confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-cyan-50 dark:to-cyan-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Recommended Price</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{result.pricing.recommended_price.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Price Range</p>
                      <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        ₹{result.pricing.min_price.toLocaleString()} – ₹{result.pricing.max_price.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${
                      result.pricing.profit_margin >= 20 ? 'bg-gradient-to-br from-green-50 dark:from-green-900/30 to-emerald-50 dark:to-emerald-900/20 border-green-200 dark:border-green-800' :
                      result.pricing.profit_margin >= 0 ? 'bg-gradient-to-br from-amber-50 dark:from-amber-900/30 to-yellow-50 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800' :
                      'bg-gradient-to-br from-red-50 dark:from-red-900/30 to-rose-50 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Profit Margin</p>
                      <p className={`text-3xl font-bold ${
                        result.pricing.profit_margin >= 20 ? 'text-green-600 dark:text-green-400' :
                        result.pricing.profit_margin >= 0 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>{result.pricing.profit_margin.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales & Competition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Sales Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estimated Monthly Sales</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{result.sales.estimated_monthly_sales} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Daily Average</p>
                      <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">{result.sales.estimated_daily_sales.toFixed(0)} units/day</p>
                    </div>
                    <div className="space-y-1.5">
                      <Badge className={getDemandBadgeColor(result.sales.market_demand)}>
                        {result.sales.market_demand} Demand
                      </Badge>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {getDemandExplanation(result.sales.market_demand)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      <Users className="h-5 w-5 text-orange-600" />
                      Competition Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Competitors</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{result.competition.total_competitors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Avg Price</span>
                      <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">₹{result.competition.avg_competitor_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</span>
                      <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{result.competition.avg_competitor_rating.toFixed(1)}★</span>
                    </div>
                    {result.competition.top_competitor && (
                      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 mb-2">Top Competitor on {result.source}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 mb-1 truncate">{result.competition.top_competitor.name}</p>
                        <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400">
                          <span>₹{result.competition.top_competitor.price.toLocaleString()}</span>
                          <span>{result.competition.top_competitor.rating}★</span>
                          <span>{result.competition.top_competitor.reviews.toLocaleString()} reviews</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Location Insights */}
              {result.location_insights?.length > 0 && (
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      <MapPin className="h-5 w-5 text-red-600" />
                      Market Distribution in India
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.location_insights.map((loc, i) => (
                        <div key={i} className="p-4 bg-gradient-to-br from-slate-50 dark:from-slate-800 to-blue-50 dark:to-blue-900/20 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{loc.country}</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loc.market_share}</p>
                          <Badge variant="outline" className="mt-2">{loc.demand_level} Demand</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Strategy */}
              <Card className="shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-pink-50 dark:to-pink-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    AI-Powered Strategy for {result.source}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{result.ai_strategy.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')}</p>
                </CardContent>
              </Card>

              {/* Market Gaps */}
              {result.market_gaps?.length > 0 && (
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Market Gap Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Exploitable gaps found in your competitor landscape
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {result.market_gaps.map((gap, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${getSeverityColor(gap.severity)} relative overflow-hidden group hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl bg-white/60 dark:bg-slate-950/40 shadow-sm border ${gap.severity === 'High' ? 'border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400' : gap.severity === 'Medium' ? 'border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                {getGapIcon(gap.icon)}
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight">{gap.title}</span>
                            </div>
                            <Badge className={getSeverityBadgeColor(gap.severity)}>{gap.severity}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed relative z-10">{gap.description}</p>
                          <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 relative z-10">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recommended Action</p>
                            </div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{gap.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Verdict */}
              {result.final_verdict && (
                <Card className="shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 dark:from-slate-800/60 to-blue-50 dark:to-blue-900/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                        <Target className="h-5 w-5 text-blue-600" />
                        Final Verdict
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Opportunity Score</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {result.final_verdict.opportunity_score}
                            <span className="text-base text-slate-400 dark:text-slate-500">/100</span>
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-800 flex items-center justify-center bg-white dark:bg-slate-900">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{result.final_verdict.opportunity_score}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className={`text-base px-4 py-1 ${
                        result.final_verdict.verdict_color === "green" ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800" :
                        result.final_verdict.verdict_color === "blue" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800" :
                        result.final_verdict.verdict_color === "orange" ? "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800" :
                        "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800"
                      }`}>
                        {result.final_verdict.verdict_label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">

                    {/* How to Beat Competitors */}
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" /> How to Beat Competitors
                      </p>
                      <div className="space-y-2">
                        {result.final_verdict.beat_actions.map((a, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Before You Launch */}
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" /> Before You Launch
                      </p>
                      <div className="space-y-2">
                        {result.final_verdict.improvements.map((item, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Flags */}
                    {result.final_verdict.risks?.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" /> Risk Flags
                        </p>
                        <div className="space-y-2">
                          {result.final_verdict.risks.map((r, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm text-slate-700 dark:text-slate-300">{r}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gap Summary */}
                    <div className="flex gap-3 pt-2">
                      <div className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.final_verdict.high_gaps_count}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">High Priority Gaps</p>
                      </div>
                      <div className="flex-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.final_verdict.medium_gaps_count}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Medium Priority Gaps</p>
                      </div>
                      <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.final_verdict.opportunity_score}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Opportunity Score</p>
                      </div>
                      {apiResponse.confidence_score && (
                        <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(apiResponse.confidence_score.score * 100)}%
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Data Confidence</p>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              )}



            </div>
          )}
        </div>
      </div>
    </div>
  );
}
