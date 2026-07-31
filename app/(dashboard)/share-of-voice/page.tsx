"use client";

import { useState, useEffect, useMemo } from "react";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { useTheme } from "next-themes";
import { API_BASE_URL as CONFIG_API_BASE_URL } from "@/lib/config";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrendingUp, Target, BarChart3, Search, RefreshCw, AlertCircle, CheckCircle, Users, Award, Filter, ChevronLeft, ChevronRight, Lock, Crown, XCircle, X, Zap, ShieldCheck, Map, Layers, Star, ArrowRight, } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, LabelList,
} from "recharts";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";

interface BrandShareData {
  brand: string;
  share_percentage: number;
  total_reviews: number;
  total_sales: number;
  avg_rating: number | null;
  avg_price: number | null;
  product_count: number;
}

interface CategorySOVResponse {
  category_name: string;
  total_products: number;
  total_reviews: number;
  total_sales: number;
  brands: BrandShareData[];
  your_brand_share: number | null;
  market_leader: string | null;
  marketplace: string;
}

interface ProgressTrackingData {
  date: string;
  share_percentage: number;
  reviews: number;
  sales: number;
}

interface ProgressTrackingResponse {
  category_name: string;
  your_brand: string;
  current_share: number;
  target_share: number;
  start_date: string;
  target_date: string;
  days_elapsed: number;
  days_remaining: number;
  is_on_track: boolean;
  required_growth_rate: number;
  actual_growth_rate: number;
  weekly_progress: ProgressTrackingData[];
}

interface CompetitorAnalysis {
  competitor_name: string;
  market_share: number;
  avg_price: number;
  total_products: number;
  avg_rating: number | null;
  total_reviews: number;
  total_sales: number;
}

interface KeywordSOVResponse {
  keyword: string;
  total_products: number;
  total_reviews: number;
  brands: BrandShareData[];
  price_range: { min: number; max: number };
  marketplace: string;
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

interface MarketConcentration {
  hhi_score: number;
  label: string;
  top3_share: number;
  top1_share: number;
  entry_difficulty: string;
  num_brands: number;
}

interface LaunchReadiness {
  score: number;
  label: string;
  color: string;
  fragmentation_score: number;
  price_gap_score: number;
  rating_gap_score: number;
  review_gap_score: number;
  reasoning: string[];
}

interface MarketDecision {
  verdict: string;
  color: string;
  emoji: string;
  headline: string;
  sub_reasons: string[];
}

interface ConfidenceScore {
  score: number;
  label: string;
  color: string;
  product_count: number;
  pct_with_ratings: number;
  rating_variance: number;
  price_completeness: number;
  caveats: string[];
}

interface ActionStep {
  step: number;
  area: string;
  action: string;
  detail: string;
  timeline: string;
  priority: string;
  impact: string;
}

interface ActionPlan {
  entry_price_recommendation: string | null;
  positioning_quadrant: string;
  steps: ActionStep[];
}

interface PriceGapItem {
  price_band: string;
  band_lo: number;
  band_hi: number;
  brand_count: number;
  total_products: number;
  avg_rating: number;
  opportunity: string;
}

interface ValueMapItem {
  brand: string;
  avg_price: number;
  avg_rating: number;
  total_reviews: number;
  share_pct: number;
  quadrant: string;
}

interface ReviewVelocityItem {
  brand: string;
  total_reviews: number;
  review_density: number;
  velocity_label: string;
  share_percentage: number;
}

interface CategoryTrend {
  trend: string;
  signal: string;
  avg_reviews_new: number;
  avg_reviews_old: number;
  growth_proxy_pct: number;
}

interface ListingQualityBenchmark {
  median_title_length: number;
  median_reviews: number;
  pct_with_ratings: number;
  review_density_median: number;
  your_brand_title_len: number | null;
  your_brand_density: number | null;
  your_brand_vs_median: string | null;
}

interface MarketHealthResponse {
  category_name: string;
  marketplace: string;
  generated_at: string;
  sov_summary: {
    total_brands: number;
    total_products: number;
    total_reviews: number;
    total_sales: number;
    market_leader: string | null;
    your_brand_share: number | null;
  };
  concentration: MarketConcentration;
  trend: CategoryTrend;
  launch_readiness: LaunchReadiness;
  market_decision: MarketDecision;
  confidence_score: ConfidenceScore;
  action_plan: ActionPlan;
  top_price_gaps: PriceGapItem[];
  all_price_gaps: PriceGapItem[];
  value_map: ValueMapItem[];
  review_velocity: ReviewVelocityItem[];
  listing_quality: ListingQualityBenchmark;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const QUADRANT_COLORS: Record<string, string> = {
  Star: "#10b981",
  "Budget Star": "#3b82f6",
  Overpriced: "#ef4444",
  "Poor Value": "#94a3b8",
};

const getTooltipStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)",
  borderRadius: "12px",
  border: isDark ? "1.5px solid #1e293b" : "1.5px solid #e2e8f0",
  boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.10)",
  fontSize: 13,
  padding: "10px 16px",
  color: isDark ? "#f8fafc" : "#0f172a",
});

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
        data-track-id="sov_prev_page_btn"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm transition-colors text-slate-700 dark:text-slate-300"
            data-track-id="sov_page_num_btn"
            data-filter-value="1"
          >
            1
          </button>
          {start > 2 && <span className="text-slate-400 dark:text-slate-500 text-sm">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            currentPage === p
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-sm"
              : "border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300"
          }`}
          data-track-id="sov_page_num_btn"
          data-filter-value={p}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-slate-400 dark:text-slate-500 text-sm">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm transition-colors text-slate-700 dark:text-slate-300"
            data-track-id="sov_page_num_btn"
            data-filter-value={totalPages}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
        data-track-id="sov_next_page_btn"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <span className="ml-3 text-xs text-gray-500 dark:text-slate-400">Page {currentPage} / {totalPages}</span>
    </div>
  );
}

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const colorMap: Record<string, string> = {
    green: "#10b981", blue: "#3b82f6", yellow: "#f59e0b", orange: "#f97316", red: "#ef4444",
  };
  const stroke = colorMap[color] || "#3b82f6";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={stroke} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

function OppBadge({ opp }: { opp: string }) {
  const map: Record<string, string> = {
    High: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    Medium: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    Low: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    Crowded: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[opp] || map.Low}`}>
      {opp}
    </span>
  );
}

function CardInfoModal({
  title,
  description,
  items,
  variant = "dark",
}: {
  title: string;
  description: string;
  items?: { label: string; detail: string }[];
  variant?: "light" | "dark";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all shrink-0 ml-1.5 focus:outline-none shadow-sm ${
            variant === "light"
              ? "bg-white/20 hover:bg-white/40 text-white border border-white/30"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          }`}
          title="Click for explanation"
        >
          <span className="text-xs font-black">!</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 z-50">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black">
              !
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        {items && items.length > 0 && (
          <div className="mt-4 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {items.map((item, index) => (
              <div key={index} className="text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                  • {item.label}
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-xs leading-normal">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ShareOfVoice() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const userEmail = user?.email || "";
  const userId = user?.id;

  const [sovMounted, setSovMounted] = useState(false);
  useEffect(() => { setSovMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = sovMounted && resolvedTheme === "dark";

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [marketplace, setMarketplace] = useState<"flipkart" | "amazon">("flipkart");
  const [yourBrand, setYourBrand] = useState("");
  const [sovData, setSovData] = useState<CategorySOVResponse | null>(null);
  const [marketHealth, setMarketHealth] = useState<MarketHealthResponse | null>(null);
  const [progressData, setProgressData] = useState<ProgressTrackingResponse | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [targetShare, setTargetShare] = useState(20);
  const [targetDays, setTargetDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [competitorPage, setCompetitorPage] = useState(1);
  const [competitorsPerPage] = useState(6);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const API_BASE_URL = `${CONFIG_API_BASE_URL}/api`;

  useEffect(() => { if (userId) fetchUsageLimits(); }, [userId]);
  useEffect(() => { fetchCategories(); }, [marketplace]);
  useEffect(() => { setCurrentPage(1); }, [sovData]);
  useEffect(() => { setCompetitorPage(1); }, [competitors]);

  const fetchUsageLimits = async () => {
    if (!userId) return;
    setLoadingUsage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/sov-usage`, { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setUsageLimits({
          count: d.count,
          limit: d.limit === -1 ? Infinity : d.limit,
          remaining: d.remaining === -1 ? Infinity : d.remaining,
          subscription_tier: d.subscription_tier,
        });
      }
    } catch { /* silent */ } finally { setLoadingUsage(false); }
  };

  const canAnalyze = usageLimits ? usageLimits.limit === Infinity || usageLimits.count < usageLimits.limit : true;

  const getUpgradeMessage = () => {
    if (!usageLimits) return "";
    const tier = usageLimits.subscription_tier.toLowerCase();
    if (tier === "free") return "Upgrade to Basic for 10 SOV analyses per month";
    if (tier === "basic") return "Upgrade to Premium for unlimited SOV analyses";
    return "Upgrade for more features";
  };

  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/sov/categories?marketplace=${marketplace}`);
      if (res.data.categories) setCategories(res.data.categories);
    } catch { /* silent */ }
  };

  const analyzeCategorySov = async () => {
    if (userId && !canAnalyze) { setShowUpgradeModal(true); return; }
    if (!selectedCategory) { setError("Please select a category"); return; }

    setLoading(true); setError("");
    setSovData(null); setProgressData(null); setCompetitors(null as any);
    setMarketHealth(null); setAiInsights(null);

    try {
      const url = `${API_BASE_URL}/sov/category/${encodeURIComponent(selectedCategory)}?marketplace=${marketplace}${yourBrand ? `&your_brand=${encodeURIComponent(yourBrand)}` : ""
        }${userId ? `&user_id=${userId}` : ""}`;
      const res = await axios.get(url);

      if (res.data.error) {
        if (res.data.error.includes("limit")) setShowUpgradeModal(true);
        else setError(res.data.error);
      } else {
        setSovData(res.data);
        if (userId) await fetchUsageLimits();

        const promises: Promise<any>[] = [
          fetchMarketHealth(),
        ];
        if (yourBrand && res.data.your_brand_share !== null) {
          promises.push(fetchCompetitors(), fetchProgress(), fetchAIInsights());
        }
        await Promise.allSettled(promises);

        showToast("Analysis Complete!", `${marketplace} SOV analysis completed.`, "success");
        setTimeout(() => window.scrollTo({ top: 500, behavior: "smooth" }), 100);
      }
    } catch (err: any) {
      const msg = sanitizeApiError(err.response?.data?.detail || err.message, "Market data unavailable. Please retry shortly.");
      if (err.response?.status === 403) setShowUpgradeModal(true);
      setError(msg);
      showToast("Analysis Failed", msg, "error");
    } finally { setLoading(false); }
  };


  const fetchMarketHealth = async () => {
    if (!selectedCategory) return;
    setLoadingHealth(true);
    try {
      const url = `${API_BASE_URL}/sov/market-health/${encodeURIComponent(selectedCategory)}?marketplace=${marketplace}${yourBrand ? `&your_brand=${encodeURIComponent(yourBrand)}` : ""
        }${userId ? `&user_id=${userId}` : ""}`;
      const res = await axios.get(url);
      if (!res.data.error) setMarketHealth(res.data);
    } catch { /* silent */ } finally { setLoadingHealth(false); }
  };

  const fetchCompetitors = async () => {
    try {
      const url = `${API_BASE_URL}/sov/competitors/${encodeURIComponent(selectedCategory)}?your_brand=${encodeURIComponent(yourBrand)}&marketplace=${marketplace}&limit=20`;
      const res = await axios.get(url);
      if (res.data.competitors) setCompetitors(res.data.competitors);
    } catch { /* silent */ }
  };

  const fetchProgress = async () => {
    try {
      const url = `${API_BASE_URL}/sov/progress/${encodeURIComponent(selectedCategory)}?your_brand=${encodeURIComponent(yourBrand)}&target_share=${targetShare}&target_days=${targetDays}&marketplace=${marketplace}`;
      const res = await axios.get(url);
      if (!res.data.error) setProgressData(res.data);
    } catch { /* silent */ }
  };

  const fetchAIInsights = async () => {
    if (!yourBrand || !selectedCategory) return;
    setLoadingInsights(true);
    try {
      const url = `${API_BASE_URL}/sov/ai-insights?category_name=${encodeURIComponent(selectedCategory)}&your_brand=${encodeURIComponent(yourBrand)}&target_share=${targetShare}&target_days=${targetDays}&marketplace=${marketplace}`;
      const res = await axios.post(url);
      if (!res.data.error) setAiInsights(res.data);
    } catch { /* silent */ } finally { setLoadingInsights(false); }
  };

  const paginatedBrands = useMemo(() => {
    const list = sovData?.brands || [];
    return list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sovData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    const list = sovData?.brands || [];
    return Math.ceil(list.length / itemsPerPage);
  }, [sovData, itemsPerPage]);

  const paginatedCompetitors = useMemo(() =>
    (competitors ?? []).slice((competitorPage - 1) * competitorsPerPage, competitorPage * competitorsPerPage),
    [competitors, competitorPage, competitorsPerPage]
  );
  const totalCompetitorPages = Math.ceil((competitors?.length || 0) / competitorsPerPage);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    document.getElementById("brands-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCompetitorPageChange = (p: number) => {
    setCompetitorPage(p);
    document.getElementById("competitor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const verdictBg: Record<string, string> = {
    green: "from-emerald-500 to-green-600",
    yellow: "from-yellow-500 to-amber-500",
    red: "from-red-500 to-rose-600",
  };
  const confColor: Record<string, string> = {
    green: "text-emerald-600", yellow: "text-amber-600", red: "text-red-600",
  };

  const scatterData = useMemo(() =>
    (marketHealth?.value_map || []).slice(0, 20).map((v) => ({
      x: v.avg_price,
      y: v.avg_rating,
      z: Math.max(v.total_reviews, 10),
      name: v.brand,
      quadrant: v.quadrant,
      share: v.share_pct,
    })),
    [marketHealth]
  );

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto space-y-4 relative">

        {/* Visual Usage Meter (Top Right Header) */}
        <div className="absolute top-0 right-4 sm:right-0 z-10">
          {!loadingUsage && userId && usageLimits && (
            <div className="bg-background opacity-100 rounded-xl px-4 py-2 border border-slate-200 shadow-sm min-w-[160px]">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{t('sov.analysesUsed', 'Analyses used')}</p>
                <Badge className={`h-4 text-[10px] border-none px-1.5 ${usageLimits.subscription_tier.toLowerCase() === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : usageLimits.subscription_tier.toLowerCase() === "premium" ? "bg-violet-100 text-violet-800" : usageLimits.subscription_tier.toLowerCase() === "basic" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                  {(usageLimits.subscription_tier || "free").toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${usageLimits.limit === Infinity ? 0 : Math.min((usageLimits.count / usageLimits.limit) * 100, 100)}%`, 
                      background: (usageLimits.limit === Infinity ? 0 : Math.min((usageLimits.count / usageLimits.limit) * 100, 100)) >= 80 ? "#ef4444" : "#7F77DD" 
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {usageLimits.count}/{usageLimits.limit === Infinity ? "∞" : usageLimits.limit}
                </span>
              </div>
            </div>
          )}
        </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 pt-6 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-2 shadow-inner">
          <BarChart3 className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
          {t('sov.title', 'Market Visibility')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          {t('sov.subtitle', 'Analyze brand visibility, measure search market share, track competitors, and uncover category opportunities.')}
        </p>
      </div>

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 !mt-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">SOV Limit Reached</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You&apos;ve used all{" "}
                <span className="font-bold text-red-600 dark:text-red-400">{usageLimits?.limit}</span>{" "}
                analyses this month on the{" "}
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

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 ${
              t.variant === "success"
                ? "bg-green-50 dark:bg-green-950/60 border-green-300 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800"
            }`}
          >
            {t.variant === "success" ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900 dark:text-green-300" : "text-red-900 dark:text-red-300"}`}>{t.title}</p>
              <p className={`text-xs mt-0.5 ${t.variant === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{t.description}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <Card className="bg-background border border-slate-200 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4 text-blue-600" /> {t('sov.searchParams', 'Search Parameters')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('sov.marketplace', 'Marketplace')}</label>
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value as any)}
                  disabled={loading}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                  data-track-id="marketplace_select"
                  data-filter-value={marketplace}
                >
                  <option value="flipkart" className="bg-white dark:bg-slate-800">Flipkart India</option>
                  <option value="amazon" className="bg-white dark:bg-slate-800">Amazon India</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('sov.category', 'Category')}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                  data-track-id="category_select"
                  data-filter-value={selectedCategory}
                >
                  <option value="" className="bg-white dark:bg-slate-800">{t('sov.selectCategory', 'Select Category')}</option>
                  {categories.map((c, i) => <option key={i} value={c} className="bg-white dark:bg-slate-800">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('sov.yourBrand', 'Your Brand')} <span className="text-gray-400 dark:text-slate-500 text-xs">({t('sov.optional', 'Optional')})</span></label>
                <SmartSearchInput
                  value={yourBrand}
                  onChange={setYourBrand}
                  placeholder={t('sov.enterBrandName', 'Enter your brand name')}
                  disabled={loading}
                  inputClassName="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                  id="your_brand_input"
                  onEnter={analyzeCategorySov}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={analyzeCategorySov}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                    userId && !canAnalyze ? "bg-slate-600 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 shadow-md" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md"
                  }`}
                  data-track-id="analyze_category_sov_btn"
                >
                  {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('sov.analyzing', 'Analyzing…')}</>
                    : userId && !canAnalyze ? <><Lock className="w-4 h-4" /> {t('sov.limitReached', 'Limit Reached')}</>
                      : <><Search className="w-4 h-4" /> {t('sov.analyze', 'Analyze')}</>}
                </Button>
              </div>
            </div>

            {yourBrand && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Target Share (%)</label>
                  <input type="number" value={targetShare} onChange={(e) => setTargetShare(Number(e.target.value))} min="0" max="100" disabled={loading}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm"
                    data-track-id="target_share_input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Target Days</label>
                  <input type="number" value={targetDays} onChange={(e) => setTargetDays(Number(e.target.value))} min="1" disabled={loading}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm"
                    data-track-id="target_days_input" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 rounded-xl p-4 flex items-center gap-2 text-red-700 dark:text-red-400 shadow">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card className="bg-background border border-slate-200 rounded-2xl shadow-lg">
            <CardContent className="p-12 flex flex-col items-center gap-4">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-medium">Analyzing market data…</p>
              <p className="text-slate-400 text-xs mt-1">We are analyzing the data. This may take 1–2 minutes.</p>
            </CardContent>
          </Card>
        )}

        {!loading && sovData && (
          <>
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2 px-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{sovData.marketplace}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{sovData.category_name}</span>
              {yourBrand && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{yourBrand}</span>
                </>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Products", value: sovData.total_products.toLocaleString(), icon: <BarChart3 className="w-6 h-6 text-blue-100" />, grad: "from-blue-600 to-indigo-700", sub: "In this category", desc: "Total number of products currently selling in this category on the marketplace. Helps you understand how big and active this product market is." },
                { label: "Total Reviews", value: sovData.total_reviews.toLocaleString(), icon: <Users className="w-6 h-6 text-emerald-100" />, grad: "from-emerald-600 to-teal-700", sub: "Customer feedback", desc: "Total customer reviews across all products here. Shows overall customer demand and how actively buyers leave ratings." },
                { label: "Market Leader", value: sovData.market_leader || "—", icon: <Award className="w-6 h-6 text-purple-100" />, grad: "from-purple-600 to-pink-700", sub: "Top brand", truncate: true, desc: "The #1 top-selling brand with the most reviews and visibility in this category. This is your main competitor to learn from." },
                ...(sovData.your_brand_share !== null
                  ? [{ label: "Your Share", value: `${sovData.your_brand_share}%`, icon: <Target className="w-6 h-6 text-amber-100" />, grad: "from-amber-600 to-orange-700", sub: "Market position", desc: "Your brand's share of total customer attention and reviews compared to all other competitors selling here." }]
                  : [{ label: "Total Brands", value: String(sovData.brands.length), icon: <Layers className="w-6 h-6 text-cyan-100" />, grad: "from-cyan-600 to-blue-700", sub: "Competing brands", desc: "The total number of different brands competing for customer orders in this category." }]),
              ].map((c, i) => (
                <Card key={i} className={`relative bg-gradient-to-br ${c.grad} text-white border-0 rounded-3xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform`}>
                  <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-white/90 text-xs font-semibold">{c.label}</p>
                          <CardInfoModal
                            title={c.label}
                            description={(c as any).desc}
                            variant="light"
                            items={[
                              { label: "Overview", detail: (c as any).desc }
                            ]}
                          />
                        </div>
                        <p className={`font-black text-white ${(c as any).truncate ? "text-xl truncate" : "text-3xl"}`}>{c.value}</p>
                        <p className="text-white/70 text-xs mt-1 font-medium">{c.sub}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 ml-2 border border-white/20 shadow-inner">{c.icon}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {marketHealth && (
              <>
                <div className={`relative bg-gradient-to-r ${verdictBg[marketHealth.market_decision.color] || "from-blue-500 to-cyan-500"} text-white rounded-3xl shadow-2xl p-6 overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
                  <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-5xl shrink-0">{marketHealth.market_decision.emoji}</div>
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">Market Verdict</p>
                      <h3 className="text-2xl md:text-3xl font-black">{marketHealth.market_decision.verdict}</h3>
                      <p className="text-white/90 text-sm mt-1">{marketHealth.market_decision.headline}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-white/70 text-xs mb-1">Launch Score</p>
                      <p className="text-4xl font-black">{marketHealth.launch_readiness.score}<span className="text-lg font-normal">/100</span></p>
                      <p className="text-white/80 text-sm">{marketHealth.launch_readiness.label}</p>
                    </div>
                  </div>
                  {marketHealth.market_decision.sub_reasons.length > 0 && (
                    <div className="relative mt-4 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {marketHealth.market_decision.sub_reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/90">
                          <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" /> {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                      <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-500" /> Market Concentration
                        </span>
                        <CardInfoModal
                          title="Market Monopoly Check"
                          description="Checks if a few big brands dominate all sales in this category, or if sales are well-distributed among many sellers."
                          items={[
                            { label: "Why it matters", detail: "If a few brands don't own the whole market, it is much easier for your new product to get orders and rank higher." }
                          ]}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                          <ScoreRing score={Math.min(marketHealth.concentration.hhi_score / 100, 100)} color="blue" size={76} />
                          <span className="absolute text-xs font-bold text-slate-700">{marketHealth.concentration.hhi_score.toFixed(0)}</span>
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800">{marketHealth.concentration.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Entry: <span className="font-semibold">{marketHealth.concentration.entry_difficulty}</span></p>
                          <p className="text-xs text-slate-500">Top 3: <span className="font-semibold">{marketHealth.concentration.top3_share.toFixed(1)}%</span></p>
                          <p className="text-xs text-slate-500">{marketHealth.concentration.num_brands} brands</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                      <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" /> Category Trend
                        </span>
                        <CardInfoModal
                          title="Category Sales Growth Trend"
                          description="Compares the number of reviews on new listings versus older listings to see if customer demand in this category is growing."
                          items={[
                            { label: "Why it matters", detail: "A growing category means more customers are buying here every day, giving your brand a bigger chance to get fast sales." }
                          ]}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          marketHealth.trend.trend === "Growing" ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" :
                          marketHealth.trend.trend === "Declining" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}>
                          {marketHealth.trend.trend === "Growing" ? "📈" : marketHealth.trend.trend === "Declining" ? "📉" : "➡️"} {marketHealth.trend.trend}
                        </div>
                        <span className={`text-lg font-black ${marketHealth.trend.growth_proxy_pct > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {marketHealth.trend.growth_proxy_pct > 0 ? "+" : ""}{marketHealth.trend.growth_proxy_pct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{marketHealth.trend.signal}</p>
                      <div className="flex gap-4 mt-2">
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Old avg</p>
                          <p className="text-sm font-bold text-slate-700">{marketHealth.trend.avg_reviews_old.toFixed(0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400">New avg</p>
                          <p className="text-sm font-bold text-slate-700">{marketHealth.trend.avg_reviews_new.toFixed(0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                      <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-500" /> Data Confidence
                        </span>
                        <CardInfoModal
                          title="Data Reliability & Accuracy"
                          description="Shows how trustworthy this category data is based on the number of products and genuine customer reviews analyzed."
                          items={[
                            { label: "Why it matters", detail: "A high score (80+) means you can trust these numbers to make pricing, inventory, and launch decisions without worry." }
                          ]}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                          <ScoreRing score={marketHealth.confidence_score.score} color={marketHealth.confidence_score.color} size={76} />
                          <span className="absolute text-xs font-bold text-slate-700">{marketHealth.confidence_score.score}</span>
                        </div>
                        <div>
                          <p className={`text-xl font-black ${confColor[marketHealth.confidence_score.color] || "text-blue-600"}`}>
                            {marketHealth.confidence_score.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{marketHealth.confidence_score.product_count} products</p>
                          <p className="text-xs text-slate-500">{marketHealth.confidence_score.pct_with_ratings}% rated</p>
                          {marketHealth.confidence_score.caveats[0] && (
                            <p className="text-xs text-amber-600 mt-1 line-clamp-2">{marketHealth.confidence_score.caveats[0]}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                  <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                    <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                      <span className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="block leading-snug">Launch Readiness Breakdown</span>
                          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Four pillars scored 0–25 each</span>
                        </div>
                      </span>
                      <CardInfoModal
                        title="Should You Launch Here? (Readiness Score)"
                        description="A simple 100-point check that looks at competition, price gaps, customer ratings, and reviews to see if launching a new product here is safe and profitable."
                        items={[
                          { label: "Why it matters", detail: "Gives you a clear green light on whether you can easily win sales or if the competition is too tough." }
                        ]}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {[
                          { label: "Market Fragmentation", val: marketHealth.launch_readiness.fragmentation_score },
                          { label: "Price Gap Opportunity", val: marketHealth.launch_readiness.price_gap_score },
                          { label: "Rating Gap", val: marketHealth.launch_readiness.rating_gap_score },
                          { label: "Review Gap", val: marketHealth.launch_readiness.review_gap_score },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100">{item.val}/25</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${item.val >= 20 ? "bg-green-500" : item.val >= 10 ? "bg-blue-500" : "bg-slate-400"}`}
                                style={{ width: `${(item.val / 25) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {marketHealth.launch_readiness.reasoning.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                            <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span> {r}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Market Share Distribution</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Top 8 brands by review share</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Brand Market Share %"
                      description="Shows what percentage of total customer reviews and sales each top brand is getting in this category."
                      items={[
                        { label: "Why it matters", detail: "Helps you see if one big brand is taking all the orders or if sales are spread across many sellers." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <ResponsiveContainer width="100%" height={330}>
                    <PieChart>
                      <Pie
                        data={(sovData.brands ?? []).slice(0, 8).map((b) => ({ name: b.brand, value: b.share_percentage }))}
                        cx="50%" cy="50%"
                        innerRadius={72} outerRadius={110}
                        paddingAngle={4} dataKey="value"
                        label={({ name, value }) => `${value}%`}
                        labelLine={false}
                      >
                        {(sovData.brands ?? []).slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke={isDark ? "#0f172a" : "#fff"} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={getTooltipStyle(isDark)} formatter={(v: any) => [`${v}%`, "Share"]} />
                      <Legend
                        iconType="circle" iconSize={9}
                        wrapperStyle={{ paddingTop: 16 }}
                        formatter={(v) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{v.length > 14 ? v.slice(0, 14) + "…" : v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Top Brands by Reviews</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Customer engagement comparison</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Top Brands by Customer Reviews"
                      description="Compares the total number of customer reviews collected by each top brand selling in this category."
                      items={[
                        { label: "Why it matters", detail: "Customer reviews are the #1 trust factor for buyers. This shows how many reviews you need to compete with top sellers." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <ResponsiveContainer width="100%" height={330}>
                    <BarChart
                      data={sovData.brands.slice(0, 8).map((b) => {
                        const rawName = b.brand.length > 15 ? b.brand.slice(0, 15) + "…" : b.brand;
                        const cleanName = rawName.replace(/ /g, "\u00A0");
                        return {
                          brand: cleanName,
                          reviews: b.total_reviews,
                          share: b.share_percentage,
                        };
                      })}
                      layout="vertical" margin={{ left: 10, right: 55, top: 12, bottom: 12 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                        tick={{ fontSize: 11, fontWeight: 500, fill: isDark ? "#64748b" : "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="brand"
                        tick={{ fontSize: 12, fontWeight: 600, fill: isDark ? "#cbd5e1" : "#334155" }}
                        width={130}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={getTooltipStyle(isDark)} formatter={(v: any, n: string) => [n === "reviews" ? v.toLocaleString() : `${v}%`, n === "reviews" ? "Reviews" : "Share"]} />
                      <Bar dataKey="reviews" radius={[0, 8, 8, 0]} maxBarSize={20}>
                        {sovData.brands.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        <LabelList
                          dataKey="reviews"
                          position="right"
                          formatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString()}
                          style={{ fontSize: 11, fontWeight: 700, fill: isDark ? "#cbd5e1" : "#475569" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {marketHealth && marketHealth.all_price_gaps.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Map className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Price Band Whitespace Map</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Brand density per price band — green = opportunity, red = crowded</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Best Price Point to Sell (Price Gaps)"
                      description="Shows which price ranges (MRP/selling price) are crowded with too many sellers, and which price ranges have high customer demand with low competition."
                      items={[
                        { label: "Why it matters", detail: "Helps you choose an attractive price point where buyers want to spend but very few good competitors exist." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={marketHealth.all_price_gaps.map((g) => ({
                        band: g.price_band.replace("₹", "").replace(",", ""),
                        brands: g.brand_count,
                        opp: g.opportunity,
                        rating: g.avg_rating,
                      }))}
                      margin={{ left: 10, right: 10, top: 24, bottom: 50 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                      <XAxis dataKey="band" tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? "#64748b" : "#94a3b8" }} angle={-35} textAnchor="end" interval="preserveStartEnd" minTickGap={20} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={getTooltipStyle(isDark)}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={getTooltipStyle(isDark)}>
                              <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">₹{d.band}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">{d.brands} brand(s) · {d.rating}★ avg</p>
                              <p className="text-xs font-bold mt-1"><OppBadge opp={d.opp} /></p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="brands" radius={[6, 6, 0, 0]} maxBarSize={36}>
                        {marketHealth.all_price_gaps.map((g, i) => (
                          <Cell key={i} fill={
                            g.opportunity === "High" ? "#10b981" :
                              g.opportunity === "Medium" ? "#f59e0b" :
                                g.opportunity === "Low" ? "#3b82f6" : "#ef4444"
                          } />
                        ))}
                        <LabelList
                          dataKey="brands"
                          position="top"
                          style={{ fontSize: 11, fontWeight: 700, fill: isDark ? "#cbd5e1" : "#475569" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    {[["#10b981", "High Opportunity"], ["#f59e0b", "Medium Opportunity"], ["#3b82f6", "Low Opportunity"], ["#ef4444", "Crowded Band"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md shadow-sm" style={{ background: c }} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{l}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && scatterData.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Brand Value Map</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Price vs Rating — bubble size = review count · color = quadrant</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Price vs. Customer Rating Map"
                      description="Shows where every brand stands based on their selling price and customer rating, helping you choose the right price and quality for your product."
                      items={[
                        { label: "Why it matters", detail: "Lets you see who is selling premium high-rated products and who is winning with affordable budget prices." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <ScatterChart margin={{ top: 16, right: 20, bottom: 16, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                      <XAxis type="number" dataKey="x" name="Avg Price" tickFormatter={(v) => `₹${v.toLocaleString()}`}
                        tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "Avg Price (₹)", position: "insideBottom", offset: -8, fontSize: 11, fontWeight: 600, fill: isDark ? "#64748b" : "#94a3b8" }} />
                      <YAxis type="number" dataKey="y" name="Avg Rating" domain={[2.5, 5]} tickFormatter={(v) => `${v}★`}
                        tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "Rating", angle: -90, position: "insideLeft", fontSize: 11, fontWeight: 600, fill: isDark ? "#64748b" : "#94a3b8" }} />
                      <ZAxis type="number" dataKey="z" range={[40, 600]} />
                      <Tooltip
                        contentStyle={getTooltipStyle(isDark)}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={getTooltipStyle(isDark)}>
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{d.name}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">₹{d.x.toLocaleString()} · {d.y}★</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{d.z.toLocaleString()} reviews · {d.share.toFixed(1)}% share</p>
                              <span className="text-xs font-bold" style={{ color: QUADRANT_COLORS[d.quadrant] || "#64748b" }}>{d.quadrant}</span>
                            </div>
                          );
                        }}
                      />
                      {Object.entries(QUADRANT_COLORS).map(([q, color]) => {
                        const pts = scatterData.filter((d) => d.quadrant === q);
                        return pts.length > 0 ? (
                          <Scatter key={q} name={q} data={pts} fill={color} opacity={0.75} />
                        ) : null;
                      })}
                      <Legend
                        wrapperStyle={{ paddingTop: 16 }}
                        payload={Object.entries(QUADRANT_COLORS).map(([q, c]) => ({ value: q, type: "circle" as const, color: c }))}
                        formatter={(v) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{v}</span>}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {marketHealth && marketHealth.review_velocity.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Review Velocity</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Reviews per product — who has momentum</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Fastest Growing Brands (Review Speed)"
                      description="Shows which brands are getting new customer reviews the fastest right now—a strong sign of who is winning daily sales."
                      items={[
                        { label: "Why it matters", detail: "Brands with high review speed are growing fast. Watch their listings and pricing to see what is working for them." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={(marketHealth?.review_velocity ?? []).slice(0, 12).map((v) => ({
                        brand: v.brand.length > 12 ? v.brand.slice(0, 12) + "…" : v.brand,
                        density: v.review_density,
                        label: v.velocity_label,
                      }))}
                      margin={{ left: 10, right: 10, top: 24, bottom: 45 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                      <XAxis dataKey="brand" tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? "#64748b" : "#94a3b8" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={getTooltipStyle(isDark)} formatter={(v: any) => [v.toFixed(1), "Reviews/product"]} />
                      <Bar dataKey="density" radius={[6, 6, 0, 0]} maxBarSize={32}>
                        {marketHealth.review_velocity.slice(0, 12).map((v, i) => (
                          <Cell key={i} fill={v.velocity_label === "Rising" ? "#10b981" : v.velocity_label === "Declining" ? "#ef4444" : "#3b82f6"} />
                        ))}
                        <LabelList
                          dataKey="density"
                          position="top"
                          formatter={(v: number) => v.toFixed(1)}
                          style={{ fontSize: 11, fontWeight: 700, fill: isDark ? "#cbd5e1" : "#475569" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    {[["#10b981", "Rising Velocity"], ["#3b82f6", "Stable Velocity"], ["#ef4444", "Declining Velocity"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md shadow-sm" style={{ background: c }} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{l}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && marketHealth.action_plan.steps.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">📋</span>
                      <div>
                        <span className="block leading-snug">Step-by-Step Action Plan</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">AI-generated roadmap based on market whitespace & HHI</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Recommended Launch Roadmap"
                      description="Easy-to-follow steps to launch your new product safely, attract customers faster, and avoid wasting money."
                      items={[
                        { label: "Why it matters", detail: "Gives you clear guidance on pricing, reviews, and listing improvements so you can rank higher on Amazon/Flipkart." }
                      ]}
                    />
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {marketHealth.action_plan.entry_price_recommendation && (
                      <span>Recommended entry price: <strong>{marketHealth.action_plan.entry_price_recommendation}</strong> · </span>
                    )}
                    Positioning: <strong>{marketHealth.action_plan.positioning_quadrant}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <div className="space-y-4">
                    {marketHealth.action_plan.steps.map((step) => (
                      <div key={step.step} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow ${
                          step.priority === "Critical" ? "bg-red-500" : step.priority === "High" ? "bg-orange-500" : "bg-blue-500"
                        }`}>
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">{step.area}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              step.priority === "Critical" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" :
                              step.priority === "High" ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400" :
                              "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>{step.priority}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{step.timeline}</span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{step.action}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{step.detail}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">💡 {step.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && marketHealth.all_price_gaps.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Map className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Full Price-Gap Analysis</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Complete breakdown of all price bands and competition levels</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="All Price Ranges Breakdown Table"
                      description="A detailed table showing every price range (e.g., ₹200-₹500), how many brands sell there, and which price point is the best opportunity."
                      items={[
                        { label: "Why it matters", detail: "Helps you pick the exact MRP and selling price where customer demand is high and competition is low." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          <th className="p-3 text-left font-semibold">Price Band</th>
                          <th className="p-3 text-right font-semibold">Brands</th>
                          <th className="p-3 text-right font-semibold">Products</th>
                          <th className="p-3 text-right font-semibold">Avg Rating</th>
                          <th className="p-3 text-center font-semibold">Opportunity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketHealth.all_price_gaps.map((g, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{g.price_band}</td>
                            <td className="p-3 text-right text-slate-600 dark:text-slate-300">{g.brand_count}</td>
                            <td className="p-3 text-right text-slate-600 dark:text-slate-300">{g.total_products}</td>
                            <td className="p-3 text-right"><span className="text-yellow-600 dark:text-yellow-400 font-semibold">⭐ {g.avg_rating}</span></td>
                            <td className="p-3 text-center"><OppBadge opp={g.opportunity} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="block leading-snug">Listing Quality Benchmarks</span>
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Category medians to help you calibrate your listings</span>
                      </div>
                    </span>
                    <CardInfoModal
                      title="Category Standards (Title & Reviews)"
                      description="Shows the average title length, review count, and customer rating of top products selling in this category."
                      items={[
                        { label: "Why it matters", detail: "Check these average numbers to make sure your product title is descriptive enough and you have enough reviews to win buyers' trust." }
                      ]}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Median Title Length", value: `${marketHealth.listing_quality.median_title_length} chars`, icon: "✏️" },
                      { label: "Median Reviews", value: marketHealth.listing_quality.median_reviews.toLocaleString(), icon: "💬" },
                      { label: "% With Ratings", value: `${marketHealth.listing_quality.pct_with_ratings}%`, icon: "⭐" },
                      { label: "Review Density Median", value: `${marketHealth.listing_quality.review_density_median}/product`, icon: "📊" },
                    ].map((m) => (
                      <div key={m.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-2xl mb-1">{m.icon}</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100">{m.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {marketHealth.listing_quality.your_brand_vs_median && (
                    <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${marketHealth.listing_quality.your_brand_vs_median === "Above" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800" :
                      marketHealth.listing_quality.your_brand_vs_median === "Below" ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      }`}>
                      {marketHealth.listing_quality.your_brand_vs_median === "Above" ? "✅" : marketHealth.listing_quality.your_brand_vs_median === "Below" ? "⚠️" : "➡️"}
                      Your brand is <strong>&nbsp;{marketHealth.listing_quality.your_brand_vs_median}&nbsp;</strong> median review density
                      {marketHealth.listing_quality.your_brand_density && ` (${marketHealth.listing_quality.your_brand_density} reviews/product)`}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card id="brands-table" className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden transition-all">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 p-6 pb-4">
                <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                  <span className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="block leading-snug">Detailed Brand Analysis</span>
                      <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        {paginatedBrands.length} of {sovData.brands.length} brands
                        {yourBrand && <span className="text-blue-600 font-semibold"> · Your brand highlighted</span>}
                      </span>
                    </div>
                  </span>
                  <CardInfoModal
                    title="All Competitors Comparison Table"
                    description="A complete list of every brand selling in this category, showing their market share, reviews, rating, and average selling price (MRP/Selling Price)."
                    items={[
                      { label: "Why it matters", detail: "Lets you see exactly who your biggest competitors are, how many products they list, and at what price they sell." }
                    ]}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                        <th className="p-3 text-left">Brand</th>
                        <th className="p-3 text-right">Share %</th>
                        <th className="p-3 text-right">Reviews</th>
                        <th className="p-3 text-right">Products</th>
                        <th className="p-3 text-right">Rating</th>
                        <th className="p-3 text-right">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBrands.map((brand, idx) => {
                        const rank = (currentPage - 1) * itemsPerPage + idx + 1;
                        const isYours = yourBrand && brand.brand.toLowerCase() === yourBrand.toLowerCase();
                        return (
                          <tr key={idx} className={`border-b border-slate-100 transition-colors ${isYours ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-slate-50"}`}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0 ${rank === 1 ? "bg-yellow-400" : rank === 2 ? "bg-slate-400" : rank === 3 ? "bg-orange-400" : "bg-blue-400"
                                  }`}>{rank}</span>
                                <span className="font-medium text-slate-800">{brand.brand}</span>
                                {isYours && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">You</span>}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-2 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden shadow-inner flex items-center">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(Math.max(brand.share_percentage * 5, 15), 100)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-blue-700 dark:text-blue-400 text-xs w-10 text-right">{brand.share_percentage}%</span>
                              </div>
                            </td>
                            <td className="p-3 text-right text-slate-700 font-medium">{brand.total_reviews.toLocaleString()}</td>
                            <td className="p-3 text-right text-slate-600">{brand.product_count}</td>
                            <td className="p-3 text-right">
                              {brand.avg_rating ? <span className="text-yellow-600 font-semibold">⭐ {brand.avg_rating}</span> : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-700">
                              {brand.avg_price ? `₹${brand.avg_price.toLocaleString()}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </CardContent>
            </Card>

            {yourBrand && progressData && (
              <>
                <div className="flex items-center gap-3 mt-4">
                  <Target className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-sky-900">Progress Tracking</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`border-l-4 ${progressData.is_on_track ? "border-green-500" : "border-red-500"} bg-background rounded-2xl shadow-lg`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <p className="text-2xl font-black text-slate-800">{progressData.is_on_track ? "On Track" : "Behind"}</p>
                      </div>
                      {progressData.is_on_track ? <CheckCircle className="w-10 h-10 text-green-500" /> : <AlertCircle className="w-10 h-10 text-red-500" />}
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-blue-500 bg-background rounded-2xl shadow-lg">
                    <CardContent className="p-5">
                      <p className="text-xs text-slate-500 mb-1">Current Share</p>
                      <p className="text-3xl font-black text-blue-600">{progressData.current_share}%</p>
                      <p className="text-xs text-slate-400 mt-1">Target: {progressData.target_share}%</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-purple-500 bg-background rounded-2xl shadow-lg">
                    <CardContent className="p-5">
                      <p className="text-xs text-slate-500 mb-1">Days Remaining</p>
                      <p className="text-3xl font-black text-purple-600">{progressData.days_remaining}</p>
                      <p className="text-xs text-slate-400 mt-1">Target: {progressData.target_date}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                  <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                    <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                      <span className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="block leading-snug">Weekly Progress Projection</span>
                          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Projected trajectory toward your target market share</span>
                        </div>
                      </span>
                      <CardInfoModal
                        title="Weekly Market Share Forecast"
                        description="Shows your expected week-by-week progress toward your target market share goal."
                        items={[
                          { label: "Why it matters", detail: "Helps you see if you are growing fast enough to reach your target share on time." }
                        ]}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={progressData.weekly_progress} margin={{ left: 10, right: 20, top: 24, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={getTooltipStyle(isDark)} />
                        <Line type="monotone" dataKey="share_percentage" stroke="#10b981" strokeWidth={3} name="Market Share %" dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {yourBrand && (aiInsights || loadingInsights) && (
              <>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-2xl">🧠</span>
                  <h2 className="text-2xl font-bold text-sky-900">AI-Powered Insights</h2>
                </div>

                {loadingInsights && (
                  <Card className="bg-background rounded-2xl shadow-lg">
                    <CardContent className="p-8 flex items-center gap-4">
                      <RefreshCw className="w-8 h-8 text-purple-500 animate-spin shrink-0" />
                      <div>
                        <p className="text-slate-600 font-medium">AI is analyzing your competitive landscape…</p>
                        <p className="text-slate-400 text-xs mt-1">We are analyzing the data. This may take 1–2 minutes.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {aiInsights && !loadingInsights && (
                  <>
                    {aiInsights.ai_generated_insights && (
                      <Card className="bg-background border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden border-t-4 border-t-blue-600 transition-all">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 p-6 pb-4">
                          <CardTitle className="text-xl flex items-center justify-between text-slate-800 dark:text-slate-100">
                            <span className="flex items-center gap-3">
                              <span className="text-2xl">🤖</span>
                              <div>
                                <span className="block leading-snug">Insydz Strategic Analysis</span>
                                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Deep-dive AI narrative on competitive moats and growth vectors</span>
                              </div>
                            </span>
                            <CardInfoModal
                              title="AI Strategy Guide for Your Brand"
                              description="Our AI analyzes your competitors and gives you simple, practical advice on how to win more sales and grow your brand."
                              items={[
                                { label: "Why it matters", detail: "Explains in plain language what top competitors are doing right and where you have an advantage." }
                              ]}
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600">
                            <ReactMarkdown>
                              {(() => {
                                let txt = aiInsights.ai_generated_insights;
                                // Clean up annoying AI preambles
                                txt = txt.replace(/^(Here is the analysis.*?:\s*)/i, "");
                                txt = txt.replace(/^(Here's the analysis.*?:\s*)/i, "");
                                txt = txt.replace(/^(Based on the data.*?:\s*)/i, "");
                                return txt.trim();
                              })()}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiInsights.market_decision && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-background rounded-2xl shadow-lg border border-slate-200">
                          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Market Decision</CardTitle></CardHeader>
                          <CardContent>
                            <div className={`inline-block px-4 py-2 rounded-xl font-black text-white bg-gradient-to-r ${verdictBg[aiInsights.market_decision.color] || "from-blue-500 to-cyan-500"}`}>
                              {aiInsights.market_decision.emoji} {aiInsights.market_decision.verdict}
                            </div>
                            <p className="text-xs text-slate-600 mt-2">{aiInsights.market_decision.headline}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-background rounded-2xl shadow-lg border border-slate-200">
                          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Current Position</CardTitle></CardHeader>
                          <CardContent className="grid grid-cols-2 gap-3">
                            {[
                              { l: "Share", v: `${aiInsights.current_analysis.current_share}%` },
                              { l: "Target", v: `${aiInsights.current_analysis.target_share}%` },
                              { l: "Gap", v: `${aiInsights.current_analysis.gap}%` },
                              { l: "Rank", v: `#${aiInsights.market_position.rank}` },
                            ].map((x) => (
                              <div key={x.l} className="bg-slate-50 rounded-lg p-2 text-center">
                                <p className="text-xs text-slate-400">{x.l}</p>
                                <p className="text-lg font-black text-slate-800">{x.v}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {aiInsights.actionable_recommendations?.length > 0 && (
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                            <span className="flex items-center gap-3">
                              <span className="text-xl">💡</span>
                              <div>
                                <span className="block leading-snug">Actionable Recommendations</span>
                                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Prioritized tactical moves to improve your category rank</span>
                              </div>
                            </span>
                            <CardInfoModal
                              title="Priority Action Steps"
                              description="Clear, practical tasks you should do right now to rank higher and get more customer orders."
                              items={[
                                { label: "Why it matters", detail: "Instead of guessing what to fix, follow these priority steps to improve your listings and reviews." }
                              ]}
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-4">
                          <div className="space-y-3">
                            {aiInsights.actionable_recommendations.map((rec: any, idx: number) => (
                              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-700 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all">
                                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm ${rec.priority === "High" ? "bg-red-500" : rec.priority === "Medium" ? "bg-yellow-500" : "bg-blue-500"
                                  }`}>{idx + 1}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rec.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priority === "High" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" : rec.priority === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                                      }`}>{rec.priority}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300">{rec.action}</p>
                                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">💡 {rec.impact}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-slate-400 dark:text-slate-500">Now → Target</p>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{rec.current} → {rec.benchmark}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiInsights.growth_strategy?.length > 0 && (
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                            <span className="flex items-center gap-3">
                              <span className="text-xl">🚀</span>
                              <div>
                                <span className="block leading-snug">Growth Strategy Roadmap</span>
                                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Phased approach to {aiInsights.current_analysis.target_share}% market share</span>
                              </div>
                            </span>
                            <CardInfoModal
                              title="Step-by-Step Growth Plan"
                              description="A simple phase-by-phase plan showing what to do in the first 30, 60, and 90 days to grow your market share."
                              items={[
                                { label: "Why it matters", detail: "Breaks big sales targets into simple monthly goals you and your team can easily achieve." }
                              ]}
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiInsights.growth_strategy.map((phase: any, idx: number) => (
                              <div key={idx} className="bg-gradient-to-br from-slate-50 to-green-50/40 dark:from-slate-800/60 dark:to-green-900/10 rounded-2xl border border-green-200/60 dark:border-green-800/60 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow">{idx + 1}</div>
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{phase.phase}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{phase.focus}</p>
                                  </div>
                                </div>
                                <ul className="space-y-1.5 mb-3">
                                  {phase.actions.map((a: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                      <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span> {a}
                                    </li>
                                  ))}
                                </ul>
                                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                  <Target className="w-3 h-3" /> {phase.target}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiInsights.product_gaps?.length > 0 && (
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                            <span className="flex items-center gap-3">
                              <span className="text-xl">🔍</span>
                              <div>
                                <span className="block leading-snug">Top Product Opportunities & Market Gaps</span>
                                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">High-demand competitor products showing strong sales velocity</span>
                              </div>
                            </span>
                            <CardInfoModal
                              title="High-Demand Products You Should Launch"
                              description="Shows popular types of products in this category that customers are buying fast, but your brand is not selling yet."
                              items={[
                                { label: "Why it matters", detail: "Great ideas for new product launches that already have proven customer demand on Amazon/Flipkart." }
                              ]}
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  <th className="p-3 text-left font-semibold">Product Type</th>
                                  <th className="p-3 text-right font-semibold">Competitors</th>
                                  <th className="p-3 text-right font-semibold">Avg Price</th>
                                  <th className="p-3 text-right font-semibold">Rating</th>
                                  <th className="p-3 text-right font-semibold">Demand</th>
                                  <th className="p-3 text-center font-semibold">Opportunity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {aiInsights.product_gaps.map((g: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{g.format}</td>
                                    <td className="p-3 text-right text-slate-600 dark:text-slate-300">{g.competitors_offering}</td>
                                    <td className="p-3 text-right text-slate-600 dark:text-slate-300">{g.avg_price}</td>
                                    <td className="p-3 text-right"><span className="text-yellow-600 dark:text-yellow-400 font-semibold">⭐ {g.avg_rating}</span></td>
                                    <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">{g.est_demand}</td>
                                    <td className="p-3 text-center"><OppBadge opp={g.opportunity} /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiInsights.pricing_insights && Object.keys(aiInsights.pricing_insights).length > 0 && (
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                          <CardTitle className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                            <span className="flex items-center gap-3">
                              <span className="text-xl">💰</span>
                              <div>
                                <span className="block leading-snug">Pricing Intelligence</span>
                                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Your price position relative to budget and premium competitors</span>
                              </div>
                            </span>
                            <CardInfoModal
                              title="Price Competitiveness Check"
                              description="Compares your selling price with the market average and shows if your competitors are selling budget or premium products."
                              items={[
                                { label: "Why it matters", detail: "Helps you set the right price so you don't lose customers by being too expensive or lose profit by selling too cheap." }
                              ]}
                            />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-3">Price Position</h4>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-xs text-slate-400">Your price</p>
                                  <p className="text-2xl font-black text-purple-700 dark:text-purple-400">₹{aiInsights.pricing_insights.your_price?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400">Market avg</p>
                                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">₹{aiInsights.pricing_insights.market_average?.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="mt-3 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold inline-block">
                                {aiInsights.pricing_insights.price_positioning}
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-3">Competitive Landscape</h4>
                              <div className="space-y-2">
                                {[
                                  { l: "Budget competitors", v: aiInsights.pricing_insights.budget_competitors, c: "text-blue-600 dark:text-blue-400" },
                                  { l: "Similar price", v: aiInsights.pricing_insights.similar_price_competitors, c: "text-green-600 dark:text-green-400" },
                                  { l: "Premium", v: aiInsights.pricing_insights.premium_competitors, c: "text-purple-600 dark:text-purple-400" },
                                ].map((x) => (
                                  <div key={x.l} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">{x.l}</span>
                                    <span className={`font-black ${x.c}`}>{x.v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </>
            )}

            {/* Competitor Analysis section removed to avoid redundancy with Detailed Brand Analysis table */}
          </>
        )}


        </div>
      </div>
    </div>
  );
}
