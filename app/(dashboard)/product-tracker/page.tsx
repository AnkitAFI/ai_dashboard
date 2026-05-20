"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Target, TrendingUp, DollarSign, Users, MapPin,
  AlertTriangle, Lightbulb, X, ShoppingBag, CheckCircle2,
  XCircle, History, Crown, Lock, Shield, Clock, Activity,
  ChevronDown, ChevronUp, Zap, BarChart3,
  AlertCircle,
} from "lucide-react";

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
  exact_match: { label: "Exact Match", color: "bg-green-100 text-green-800 border-green-300" },
  keyword_match: { label: "Keyword Match", color: "bg-blue-100 text-blue-800 border-blue-300" },
  broad_match: { label: "Broad Match", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  category_fallback: { label: "Category Fallback", color: "bg-orange-100 text-orange-800 border-orange-300" },
  no_data: { label: "No Data", color: "bg-red-100 text-red-800 border-red-300" },
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
    cs.label === "High" ? "text-green-700" :
      cs.label === "Medium" ? "text-yellow-700" : "text-red-700";
  const bgColor =
    cs.label === "High" ? "bg-green-50 border-green-200" :
      cs.label === "Medium" ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

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
            <p className="text-xs text-slate-500 mt-0.5">
              {TIER_LABELS[cs.tier_used] ?? cs.tier_used} · {cs.sample_size} products analysed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-200 pt-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Sample Size</p>
            <p className="font-bold text-slate-800">{cs.sample_size}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Sales Data</p>
            <p className={`font-bold ${cs.has_sales_data ? "text-green-600" : "text-red-500"}`}>
              {cs.has_sales_data ? "✓ Present" : "✗ Missing"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Review Data</p>
            <p className={`font-bold ${cs.has_review_data ? "text-green-600" : "text-red-500"}`}>
              {cs.has_review_data ? "✓ Present" : "✗ Missing"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Price Spread</p>
            <p className="font-bold text-slate-800">{cs.price_spread_pct.toFixed(1)}%</p>
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
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`text-xs ${st.color}`}>{st.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {latencyMs.toFixed(0)} ms total
          </span>
          <span className="hidden sm:block text-xs text-slate-400 font-mono truncate max-w-[200px]">
            ID: {requestId}
          </span>
        </div>
        {stepTimings && Object.keys(stepTimings).length > 0 && (
          <button
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            onClick={() => setOpen(v => !v)}
          >
            <Activity className="h-3.5 w-3.5" />
            Step timings
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {open && stepTimings && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-200 pt-3">
          {Object.entries(stepTimings).map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="text-[10px] text-slate-400 capitalize">{k.replace(/_/g, " ")}</p>
              <p className="text-xs font-semibold text-slate-700">{typeof v === "number" ? `${v} ms` : String(v)}</p>
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
    <Alert className="border-orange-300 bg-orange-50">
      <Zap className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-sm text-orange-800">{reason}</AlertDescription>
    </Alert>
  );
}

export default function ProductTracker() {
  const { user, isLoading } = useAuth();
  const userEmail = user?.email || "";
  const userId = user?.id;

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [source, setSource] = useState("amazon");
  const [baseCost, setBaseCost] = useState("");
  const [loading, setLoading] = useState(false);

  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")}/users/${userId}/analysis-usage`, { 
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
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")}/categories?table=${src}`, { cache: 'no-store' });
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
    if (!productName || !category || !baseCost) {
      showToast("Missing Information", "Please fill in all fields to analyse your product.", "error");
      return;
    }
    const cost = parseFloat(baseCost);
    if (isNaN(cost) || cost <= 0) {
      showToast("Invalid Cost", "Please enter a valid cost price.", "error");
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

    try {
      const res = await fetch("https://api.insydz.com/product-tracker/analyze", {
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
        if (err.error_code === "QUOTA_EXCEEDED") setShowUpgradeModal(true);
        showToast("Analysis Failed", "Couldn't complete analysis. Please try again.", "error");
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
    c === "High" ? "bg-green-100 text-green-800 border-green-300" :
      c === "Medium" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
        c === "Critical" ? "bg-red-100 text-red-800 border-red-300" :
          "bg-red-100 text-red-800 border-red-300";

  const getDemandBadgeColor = (d: string) =>
    d === "High" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
      d === "Medium" ? "bg-blue-100 text-blue-800 border-blue-300" :
        "bg-slate-100 text-slate-800 border-slate-300";

  const getSourceColor = (s: string) =>
    s.toLowerCase() === "amazon"
      ? "bg-orange-100 text-orange-800 border-orange-300"
      : "bg-yellow-100 text-yellow-800 border-yellow-300";

  const getSeverityColor = (s: string) =>
    s === "High" ? "border-red-300 bg-red-50" :
      s === "Medium" ? "border-yellow-300 bg-yellow-50" :
        "border-slate-200 bg-slate-50";

  const getSeverityBadgeColor = (s: string) =>
    s === "High" ? "bg-red-100 text-red-800 border-red-300" :
      s === "Medium" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
        "bg-slate-100 text-slate-800 border-slate-300";

  return (
    <div className="space-y-6">

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Analysis Limit Reached</h3>
              <p className="text-slate-600 mb-4">
                You've used all <span className="font-bold text-red-600">{usageLimits?.limit}</span> analyses this month on the{" "}
                <span className="font-semibold">{usageLimits?.subscription_tier.toUpperCase()}</span> plan.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">{getUpgradeMessage()}</p>
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
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-none animate-in slide-in-from-right ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
            }`}>
            {t.variant === "success"
              ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
              <p className={`text-sm mt-1 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className={t.variant === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Input Form */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-700">Product Information</CardTitle>
                  <CardDescription className="text-slate-500">
                    Enter your product details to get AI-powered market insights from {source === "amazon" ? "Amazon" : "Flipkart"}
                  </CardDescription>
                </div>
                <a
                  href="/product-tracker/history"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Analytics History</span>
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="e.g., Wireless Headphones"
                    disabled={!!userId && !canAnalyze}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={!!userId && !canAnalyze}>
                    <SelectTrigger id="category">
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
                  <Label htmlFor="source">Marketplace</Label>
                  <Select value={source} onValueChange={setSource} disabled={!!userId && !canAnalyze}>
                    <SelectTrigger id="source"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">
                        <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon</div>
                      </SelectItem>
                      <SelectItem value="flipkart">
                        <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base-cost">Your Cost Price (₹)</Label>
                  <Input
                    id="base-cost"
                    type="number"
                    value={baseCost}
                    onChange={e => setBaseCost(e.target.value)}
                    placeholder="e.g., 500"
                    disabled={!!userId && !canAnalyze}
                  />
                </div>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || (!!userId && !canAnalyze)}
                className={`w-full ${userId && !canAnalyze ? "bg-slate-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analysing {source} Market…</>
                ) : userId && !canAnalyze ? (
                  <><Lock className="h-4 w-4 mr-2" />Limit Reached — Upgrade to Continue</>
                ) : (
                  <><Target className="h-4 w-4 mr-2" />Analyse on {source}</>
                )}
              </Button>
              {loading && (
                <p className="text-xs text-slate-500 text-center mt-2 animate-pulse">
                  We are analyzing the data. This may take 1–2 minutes.
                </p>
              )}
            </CardContent>
          </Card>

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
                <Alert className={
                  apiResponse.warnings[0].includes("CRITICAL") || apiResponse.warnings[0].includes("DANGER")
                    ? "border-red-300 bg-red-50"
                    : apiResponse.warnings[0].includes("EXCELLENT") || apiResponse.warnings[0].includes("VIABLE")
                      ? "border-green-300 bg-green-50"
                      : "border-yellow-300 bg-yellow-50"
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="space-y-1">
                      {apiResponse.warnings.map((w, i) => <li key={i} className="text-sm">{w}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Pricing */}
              <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
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
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-sm text-slate-600 mb-1">Recommended Price</p>
                      <p className="text-3xl font-bold text-blue-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Price Range</p>
                      <p className="text-xl font-semibold text-slate-700">
                        ₹{result.pricing.min_price.toLocaleString()} – ₹{result.pricing.max_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Market avg: ₹{result.pricing.market_avg_price.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                      <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                      <p className="text-3xl font-bold text-green-600">{result.pricing.profit_margin.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales & Competition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Sales Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Estimated Monthly Sales</p>
                      <p className="text-2xl font-bold text-slate-900">{result.sales.estimated_monthly_sales} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Daily Average</p>
                      <p className="text-xl font-semibold text-slate-700">{result.sales.estimated_daily_sales.toFixed(0)} units/day</p>
                    </div>
                    <Badge className={getDemandBadgeColor(result.sales.market_demand)}>
                      {result.sales.market_demand} Demand
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <Users className="h-5 w-5 text-orange-600" />
                      Competition Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Competitors</span>
                      <span className="text-xl font-bold text-slate-900">{result.competition.total_competitors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Avg Price</span>
                      <span className="text-lg font-semibold text-slate-700">₹{result.competition.avg_competitor_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Avg Rating</span>
                      <span className="text-lg font-semibold text-slate-700">{result.competition.avg_competitor_rating.toFixed(1)}★</span>
                    </div>
                    {result.competition.top_competitor && (
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 mb-2">Top Competitor on {result.source}</p>
                        <p className="text-sm text-slate-700 mb-1 truncate">{result.competition.top_competitor.name}</p>
                        <div className="flex gap-3 text-xs text-slate-600">
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
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <MapPin className="h-5 w-5 text-red-600" />
                      Market Distribution in India
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.location_insights.map((loc, i) => (
                        <div key={i} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200">
                          <p className="font-semibold text-slate-900">{loc.country}</p>
                          <p className="text-2xl font-bold text-blue-600">{loc.market_share}</p>
                          <Badge variant="outline" className="mt-2">{loc.demand_level} Demand</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Strategy */}
              <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-none bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    AI-Powered Strategy for {result.source}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{result.ai_strategy}</p>
                </CardContent>
              </Card>

              {/* Market Gaps */}
              {result.market_gaps?.length > 0 && (
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Market Gap Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Exploitable gaps found in your competitor landscape
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.market_gaps.map((gap, i) => (
                        <div key={i} className={`p-4 rounded-xl border-2 ${getSeverityColor(gap.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{gap.icon}</span>
                              <span className="font-semibold text-slate-800 text-sm">{gap.title}</span>
                            </div>
                            <Badge className={getSeverityBadgeColor(gap.severity)}>{gap.severity}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{gap.description}</p>
                          <div className="bg-background rounded-lg p-2 border border-slate-200">
                            <p className="text-xs font-semibold text-slate-500 mb-1">ACTION</p>
                            <p className="text-xs text-slate-700">{gap.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Verdict */}
              {result.final_verdict && (
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-none bg-gradient-to-br from-slate-50 to-blue-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                        <Target className="h-5 w-5 text-blue-600" />
                        Final Verdict
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Opportunity Score</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {result.final_verdict.opportunity_score}
                            <span className="text-base text-slate-400">/100</span>
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center bg-white">
                          <span className="text-lg font-bold text-blue-600">{result.final_verdict.opportunity_score}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className={`text-base px-4 py-1 ${result.final_verdict.verdict_color === "green" ? "bg-green-100 text-green-800 border-green-300" :
                        result.final_verdict.verdict_color === "blue" ? "bg-blue-100 text-blue-800 border-blue-300" :
                          result.final_verdict.verdict_color === "orange" ? "bg-orange-100 text-orange-800 border-orange-300" :
                            "bg-red-100 text-red-800 border-red-300"
                        }`}>
                        {result.final_verdict.verdict_label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">

                    {/* How to Beat Competitors */}
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" /> How to Beat Competitors
                      </p>
                      <div className="space-y-2">
                        {result.final_verdict.beat_actions.map((a, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-green-200">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                            <p className="text-sm text-slate-700">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Before You Launch */}
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" /> Before You Launch
                      </p>
                      <div className="space-y-2">
                        {result.final_verdict.improvements.map((item, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                            <p className="text-sm text-slate-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Flags */}
                    {result.final_verdict.risks?.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" /> Risk Flags
                        </p>
                        <div className="space-y-2">
                          {result.final_verdict.risks.map((r, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-sm text-slate-700">{r}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gap Summary + [NEW] confidence score inline */}
                    <div className="flex gap-3 pt-2">
                      <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">{result.final_verdict.high_gaps_count}</p>
                        <p className="text-xs text-slate-600">High Priority Gaps</p>
                      </div>
                      <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{result.final_verdict.medium_gaps_count}</p>
                        <p className="text-xs text-slate-600">Medium Priority Gaps</p>
                      </div>
                      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{result.final_verdict.opportunity_score}</p>
                        <p className="text-xs text-slate-600">Opportunity Score</p>
                      </div>
                      {apiResponse.confidence_score && (
                        <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(apiResponse.confidence_score.score * 100)}%
                          </p>
                          <p className="text-xs text-slate-600">Data Confidence</p>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <div className="mt-1 pt-1 border-t border-slate-100">
                <p className="text-[10px] text-center text-slate-400 leading-tight opacity-60">
                  <span className="font-medium">Disclaimer:</span> The data and insights presented are for informational purposes only.
                  While we strive for accuracy, we cannot guarantee completeness or reliability.
                  Please verify critical data independently before making business decisions.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
