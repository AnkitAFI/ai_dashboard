"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart3, Search, RefreshCw, AlertCircle, CheckCircle, Users, Award, Filter, ChevronLeft, ChevronRight, Lock, Crown, XCircle, X, Zap, ShieldCheck, Map, Layers, Star, ArrowRight, } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from "recharts";

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

const CustomTooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderRadius: "12px",
  border: "1.5px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
  fontSize: 13,
  padding: "10px 16px",
};

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
        className="p-2 rounded-lg border border-slate-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-blue-50 text-sm transition-colors">1</button>
          {start > 2 && <span className="text-slate-400 text-sm">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${currentPage === p
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-sm"
            : "border-slate-300 hover:bg-blue-50"
            }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-slate-400 text-sm">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-blue-50 text-sm transition-colors">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <span className="ml-3 text-xs text-gray-500">Page {currentPage} / {totalPages}</span>
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
    High: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Low: "bg-slate-100 text-slate-600 border border-slate-200",
    Crowded: "bg-red-100 text-red-600 border border-red-200",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[opp] || map.Low}`}>
      {opp}
    </span>
  );
}

export default function ShareOfVoice() {
  const { user, isLoading } = useAuth();
  const userEmail = user?.email || "";
  const userId = user?.id;

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [marketplace, setMarketplace] = useState<"flipkart" | "amazon">("flipkart");
  const [yourBrand, setYourBrand] = useState("");
  const [sovData, setSovData] = useState<CategorySOVResponse | null>(null);
  const [marketHealth, setMarketHealth] = useState<MarketHealthResponse | null>(null);
  const [progressData, setProgressData] = useState<ProgressTrackingResponse | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [keywordData, setKeywordData] = useState<KeywordSOVResponse | null>(null);
  const [targetShare, setTargetShare] = useState(20);
  const [targetDays, setTargetDays] = useState(90);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"category" | "keyword">("category");
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

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com/api");

  useEffect(() => { if (userId) fetchUsageLimits(); }, [userId]);
  useEffect(() => { fetchCategories(); }, [marketplace]);
  useEffect(() => { setCurrentPage(1); }, [sovData, keywordData]);
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
    if (tier === "free") return "Upgrade to Basic for 15 SOV analyses per month";
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
      const msg = err.response?.data?.detail || "Failed to fetch SOV data";
      if (err.response?.status === 403) setShowUpgradeModal(true);
      setError(msg);
      showToast("Analysis Failed", msg, "error");
    } finally { setLoading(false); }
  };

  const analyzeKeywordSov = async () => {
    if (userId && !canAnalyze) { setShowUpgradeModal(true); return; }
    if (!keywordSearch) { setError("Please enter a keyword"); return; }

    setLoading(true); setError(""); setKeywordData(null);

    try {
      let url = `${API_BASE_URL}/sov/keyword/${encodeURIComponent(keywordSearch)}?marketplace=${marketplace}`;
      if (priceMin) url += `&price_min=${priceMin}`;
      if (priceMax) url += `&price_max=${priceMax}`;
      if (userId) url += `&user_id=${userId}`;

      const res = await axios.get(url);
      if (res.data.error) {
        if (res.data.error.includes("limit")) setShowUpgradeModal(true);
        else setError(res.data.error);
      } else {
        setKeywordData(res.data);
        if (userId) await fetchUsageLimits();
        showToast("Search Complete!", `Keyword "${keywordSearch}" analyzed.`, "success");
        setTimeout(() => window.scrollTo({ top: 500, behavior: "smooth" }), 100);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to fetch keyword SOV";
      if (err.response?.status === 403) setShowUpgradeModal(true);
      setError(msg); showToast("Search Failed", msg, "error");
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
    const list = activeTab === "category" ? sovData?.brands || [] : keywordData?.brands || [];
    return list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sovData, keywordData, currentPage, itemsPerPage, activeTab]);

  const totalPages = useMemo(() => {
    const list = activeTab === "category" ? sovData?.brands || [] : keywordData?.brands || [];
    return Math.ceil(list.length / itemsPerPage);
  }, [sovData, keywordData, itemsPerPage, activeTab]);

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
    <div className="space-y-6">

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl opacity-100 backdrop-blur-none">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">SOV Limit Reached</h3>
              <p className="text-slate-600 mb-4">
                You've used all{" "}
                <span className="font-bold text-red-600">{usageLimits?.limit}</span>{" "}
                analyses this month on the{" "}
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

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 backdrop-blur-none ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
              }`}
          >
            {t.variant === "success" ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
              <p className={`text-xs mt-0.5 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <Card className="bg-background border border-slate-200 rounded-2xl shadow-lg">
          <CardContent className="p-0">
            <div className="flex border-b border-slate-200">
              {(["category", "keyword"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`flex-1 py-4 px-6 font-medium transition-all ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {tab === "category" ? <BarChart3 className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    {tab === "category" ? "Category Analysis" : "Keyword Search"}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="bg-background border border-slate-200 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4 text-blue-600" /> Search Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marketplace</label>
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value as any)}
                  disabled={!!userId && !canAnalyze}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="flipkart">Flipkart</option>
                  <option value="amazon">Amazon</option>
                </select>
              </div>

              {activeTab === "category" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={!!userId && !canAnalyze}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Brand <span className="text-gray-400 text-xs">(Optional)</span></label>
                    <input
                      type="text" value={yourBrand}
                      onChange={(e) => setYourBrand(e.target.value)}
                      placeholder="Enter your brand name"
                      disabled={!!userId && !canAnalyze}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={analyzeCategorySov}
                      disabled={loading || (!!userId && !canAnalyze)}
                      className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${userId && !canAnalyze ? "bg-slate-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md"
                        }`}
                    >
                      {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</>
                        : userId && !canAnalyze ? <><Lock className="w-4 h-4" /> Limit Reached</>
                          : <><Search className="w-4 h-4" /> Analyze</>}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Keyword</label>
                    <input
                      type="text" value={keywordSearch}
                      onChange={(e) => setKeywordSearch(e.target.value)}
                      placeholder="e.g., wireless earbuds"
                      disabled={!!userId && !canAnalyze}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Min (₹)</label>
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" disabled={!!userId && !canAnalyze}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Max (₹)</label>
                      <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" disabled={!!userId && !canAnalyze}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100" />
                    </div>
                    <Button
                      onClick={analyzeKeywordSov}
                      disabled={loading || (!!userId && !canAnalyze)}
                      className={`mb-0 py-3 px-5 rounded-lg text-white font-medium flex items-center gap-2 ${userId && !canAnalyze ? "bg-slate-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md"
                        }`}
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {activeTab === "category" && yourBrand && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Share (%)</label>
                  <input type="number" value={targetShare} onChange={(e) => setTargetShare(Number(e.target.value))} min="0" max="100" disabled={!!userId && !canAnalyze}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Days</label>
                  <input type="number" value={targetDays} onChange={(e) => setTargetDays(Number(e.target.value))} min="1" disabled={!!userId && !canAnalyze}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-center gap-2 text-red-700 shadow">
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
            </CardContent>
          </Card>
        )}

        {!loading && activeTab === "category" && sovData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Products", value: sovData.total_products.toLocaleString(), icon: <BarChart3 className="w-6 h-6 text-white" />, grad: "from-blue-500 to-blue-600", sub: "In this category" },
                { label: "Total Reviews", value: sovData.total_reviews.toLocaleString(), icon: <Users className="w-6 h-6 text-white" />, grad: "from-green-500 to-emerald-600", sub: "Customer feedback" },
                { label: "Market Leader", value: sovData.market_leader || "—", icon: <Award className="w-6 h-6 text-white" />, grad: "from-purple-500 to-pink-600", sub: "Top brand", truncate: true },
                ...(sovData.your_brand_share !== null
                  ? [{ label: "Your Share", value: `${sovData.your_brand_share}%`, icon: <Target className="w-6 h-6 text-white" />, grad: "from-orange-500 to-red-600", sub: "Market position" }]
                  : [{ label: "Total Brands", value: String(sovData.brands.length), icon: <Layers className="w-6 h-6 text-white" />, grad: "from-cyan-500 to-sky-600", sub: "Competing brands" }]),
              ].map((c, i) => (
                <Card key={i} className={`relative bg-gradient-to-br ${c.grad} text-white border-0 rounded-3xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform`}>
                  <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-white/80 text-xs font-medium mb-1">{c.label}</p>
                        <p className={`font-black text-white ${(c as any).truncate ? "text-xl truncate" : "text-3xl"}`}>{c.value}</p>
                        <p className="text-white/60 text-xs mt-1">{c.sub}</p>
                      </div>
                      <div className="w-12 h-12 bg-background opacity-100 rounded-xl flex items-center justify-center shrink-0 ml-2">{c.icon}</div>
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
                  <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-500" /> Market Concentration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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

                  <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" /> Category Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${marketHealth.trend.trend === "Growing" ? "bg-green-100 text-green-700" :
                          marketHealth.trend.trend === "Declining" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                          }`}>
                          {marketHealth.trend.trend === "Growing" ? "📈" : marketHealth.trend.trend === "Declining" ? "📉" : "➡️"} {marketHealth.trend.trend}
                        </div>
                        <span className={`text-lg font-black ${marketHealth.trend.growth_proxy_pct > 0 ? "text-green-600" : "text-red-600"}`}>
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

                  <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-500" /> Data Confidence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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

                <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" /> Launch Readiness Breakdown
                    </CardTitle>
                    <CardDescription>Four pillars scored 0–25 each</CardDescription>
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
                              <span className="text-slate-600 font-medium">{item.label}</span>
                              <span className="font-bold text-slate-800">{item.val}/25</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-2.5">
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
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Market Share Distribution
                  </CardTitle>
                  <CardDescription>Top 8 brands by review share</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={(sovData.brands ?? []).slice(0, 8).map((b) => ({ name: b.brand, value: b.share_percentage }))}
                        cx="50%" cy="50%"
                        innerRadius={65} outerRadius={100}
                        paddingAngle={3} dataKey="value"
                        label={({ name, value }) => `${value}%`}
                        labelLine={false}
                      >
                        {sovData.brands.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: any) => [`${v}%`, "Share"]} />
                      <Legend
                        iconType="circle" iconSize={8}
                        formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Top Brands by Reviews
                  </CardTitle>
                  <CardDescription>Customer engagement comparison</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={sovData.brands.slice(0, 8).map((b) => ({ brand: b.brand.length > 10 ? b.brand.slice(0, 10) + "…" : b.brand, reviews: b.total_reviews, share: b.share_percentage }))}
                      layout="vertical" margin={{ left: 0, right: 20, top: 4, bottom: 4 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="brand" tick={{ fontSize: 11, fill: "#64748b" }} width={80} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: any, n: string) => [n === "reviews" ? v.toLocaleString() : `${v}%`, n === "reviews" ? "Reviews" : "Share"]} />
                      <Bar dataKey="reviews" radius={[0, 6, 6, 0]} maxBarSize={22}>
                        {sovData.brands.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {marketHealth && marketHealth.all_price_gaps.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Map className="w-5 h-5 text-blue-600" /> Price Band Whitespace Map
                  </CardTitle>
                  <CardDescription>Brand density per price band — green = opportunity, red = crowded</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={marketHealth.all_price_gaps.map((g) => ({
                        band: g.price_band.replace("₹", "").replace(",", ""),
                        brands: g.brand_count,
                        opp: g.opportunity,
                        rating: g.avg_rating,
                      }))}
                      margin={{ left: 0, right: 10, top: 4, bottom: 40 }}
                      barCategoryGap="12%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="band" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={CustomTooltipStyle}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={CustomTooltipStyle}>
                              <p className="font-semibold text-slate-800 text-xs">₹{d.band}</p>
                              <p className="text-xs text-slate-600">{d.brands} brand(s) · {d.rating}★ avg</p>
                              <p className="text-xs font-bold mt-1"><OppBadge opp={d.opp} /></p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="brands" radius={[4, 4, 0, 0]} maxBarSize={36}>
                        {marketHealth.all_price_gaps.map((g, i) => (
                          <Cell key={i} fill={
                            g.opportunity === "High" ? "#10b981" :
                              g.opportunity === "Medium" ? "#f59e0b" :
                                g.opportunity === "Low" ? "#3b82f6" : "#ef4444"
                          } />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {[["#10b981", "High Opportunity"], ["#f59e0b", "Medium"], ["#3b82f6", "Low"], ["#ef4444", "Crowded"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
                        <span className="text-xs text-slate-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && scatterData.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="w-5 h-5 text-yellow-500" /> Brand Value Map
                  </CardTitle>
                  <CardDescription>Price vs Rating — bubble size = review count · color = quadrant</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="x" name="Avg Price" tickFormatter={(v) => `₹${v.toLocaleString()}`}
                        tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "Avg Price (₹)", position: "insideBottom", offset: -4, fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis type="number" dataKey="y" name="Avg Rating" domain={[2.5, 5]} tickFormatter={(v) => `${v}★`}
                        tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "Rating", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" }} />
                      <ZAxis type="number" dataKey="z" range={[40, 600]} />
                      <Tooltip
                        contentStyle={CustomTooltipStyle}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={CustomTooltipStyle}>
                              <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                              <p className="text-xs text-slate-600">₹{d.x.toLocaleString()} · {d.y}★</p>
                              <p className="text-xs text-slate-500">{d.z.toLocaleString()} reviews · {d.share.toFixed(1)}% share</p>
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
                        payload={Object.entries(QUADRANT_COLORS).map(([q, c]) => ({ value: q, type: "circle" as const, color: c }))}
                        formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {marketHealth && marketHealth.review_velocity.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> Review Velocity
                  </CardTitle>
                  <CardDescription>Reviews per product — who has momentum</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={(marketHealth?.review_velocity ?? []).slice(0, 12).map((v) => ({
                        brand: v.brand.length > 12 ? v.brand.slice(0, 12) + "…" : v.brand,
                        density: v.review_density,
                        label: v.velocity_label,
                      }))}
                      margin={{ left: 0, right: 10, top: 4, bottom: 40 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="brand" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: any) => [v.toFixed(1), "Reviews/product"]} />
                      <Bar dataKey="density" radius={[4, 4, 0, 0]} maxBarSize={32}>
                        {marketHealth.review_velocity.slice(0, 12).map((v, i) => (
                          <Cell key={i} fill={v.velocity_label === "Rising" ? "#10b981" : v.velocity_label === "Declining" ? "#ef4444" : "#3b82f6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2">
                    {[["#10b981", "Rising"], ["#3b82f6", "Stable"], ["#ef4444", "Declining"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
                        <span className="text-xs text-slate-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && marketHealth.action_plan.steps.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📋</span> Step-by-Step Action Plan
                  </CardTitle>
                  <CardDescription>
                    {marketHealth.action_plan.entry_price_recommendation && (
                      <span>Recommended entry price: <strong>{marketHealth.action_plan.entry_price_recommendation}</strong> · </span>
                    )}
                    Positioning: <strong>{marketHealth.action_plan.positioning_quadrant}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketHealth.action_plan.steps.map((step) => (
                      <div key={step.step} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow ${step.priority === "Critical" ? "bg-red-500" : step.priority === "High" ? "bg-orange-500" : "bg-blue-500"
                          }`}>
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{step.area}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${step.priority === "Critical" ? "bg-red-100 text-red-700" : step.priority === "High" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"
                              }`}>{step.priority}</span>
                            <span className="text-xs text-slate-400">{step.timeline}</span>
                          </div>
                          <p className="font-semibold text-slate-800 text-sm mb-1">{step.action}</p>
                          <p className="text-xs text-slate-600 line-clamp-2">{step.detail}</p>
                          <p className="text-xs text-emerald-600 font-medium mt-1.5">💡 {step.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {marketHealth && marketHealth.top_price_gaps.length > 0 && (
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Map className="w-5 h-5 text-green-600" /> Top Price-Gap Opportunities
                  </CardTitle>
                  <CardDescription>High/medium opportunity bands with low competition</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                          <th className="p-3 text-left font-semibold">Price Band</th>
                          <th className="p-3 text-right font-semibold">Brands</th>
                          <th className="p-3 text-right font-semibold">Products</th>
                          <th className="p-3 text-right font-semibold">Avg Rating</th>
                          <th className="p-3 text-center font-semibold">Opportunity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketHealth.top_price_gaps.map((g, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-semibold text-slate-800">{g.price_band}</td>
                            <td className="p-3 text-right text-slate-600">{g.brand_count}</td>
                            <td className="p-3 text-right text-slate-600">{g.total_products}</td>
                            <td className="p-3 text-right"><span className="text-yellow-600 font-semibold">⭐ {g.avg_rating}</span></td>
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
              <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="w-5 h-5 text-purple-500" /> Listing Quality Benchmarks
                  </CardTitle>
                  <CardDescription>Category medians to help you calibrate your listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Median Title Length", value: `${marketHealth.listing_quality.median_title_length} chars`, icon: "✏️" },
                      { label: "Median Reviews", value: marketHealth.listing_quality.median_reviews.toLocaleString(), icon: "💬" },
                      { label: "% With Ratings", value: `${marketHealth.listing_quality.pct_with_ratings}%`, icon: "⭐" },
                      { label: "Review Density Median", value: `${marketHealth.listing_quality.review_density_median}/product`, icon: "📊" },
                    ].map((m) => (
                      <div key={m.label} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                        <p className="text-2xl mb-1">{m.icon}</p>
                        <p className="text-lg font-black text-slate-800">{m.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {marketHealth.listing_quality.your_brand_vs_median && (
                    <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${marketHealth.listing_quality.your_brand_vs_median === "Above" ? "bg-green-50 text-green-700" :
                      marketHealth.listing_quality.your_brand_vs_median === "Below" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      }`}>
                      {marketHealth.listing_quality.your_brand_vs_median === "Above" ? "✅" : marketHealth.listing_quality.your_brand_vs_median === "Below" ? "⚠️" : "➡️"}
                      Your brand is <strong>&nbsp;{marketHealth.listing_quality.your_brand_vs_median}&nbsp;</strong> median review density
                      {marketHealth.listing_quality.your_brand_density && ` (${marketHealth.listing_quality.your_brand_density} reviews/product)`}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card id="brands-table" className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> Detailed Brand Analysis
                </CardTitle>
                <CardDescription>
                  {paginatedBrands.length} of {sovData.brands.length} brands
                  {yourBrand && <span className="text-blue-600 font-semibold"> · Your brand highlighted</span>}
                </CardDescription>
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
                              <div className="flex items-center justify-end gap-1.5">
                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(brand.share_percentage * 2, 100)}%` }} />
                                </div>
                                <span className="font-bold text-blue-700 text-xs w-10 text-right">{brand.share_percentage}%</span>
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

                <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-5 h-5 text-green-500" /> Weekly Progress Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={progressData.weekly_progress} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={CustomTooltipStyle} />
                        <Line type="monotone" dataKey="share_percentage" stroke="#10b981" strokeWidth={2.5} name="Market Share %" dot={{ fill: "#10b981", r: 3 }} activeDot={{ r: 6 }} />
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
                      <p className="text-slate-600 font-medium">AI is analyzing your competitive landscape…</p>
                    </CardContent>
                  </Card>
                )}

                {aiInsights && !loadingInsights && (
                  <>
                    {aiInsights.ai_generated_insights && (
                      <Card className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white border-0 rounded-3xl shadow-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-3">
                            <span className="text-3xl">🤖</span> Insydz Strategic Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-background opacity-100 backdrop-blur-none rounded-2xl p-6 border border-white/20">
                            <pre className="whitespace-pre-wrap text-white font-mono text-xs leading-relaxed">{aiInsights.ai_generated_insights}</pre>
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
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-xl">💡</span> Actionable Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {aiInsights.actionable_recommendations.map((rec: any, idx: number) => (
                              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm ${rec.priority === "High" ? "bg-red-500" : rec.priority === "Medium" ? "bg-yellow-500" : "bg-blue-500"
                                  }`}>{idx + 1}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-bold text-slate-800 text-sm">{rec.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priority === "High" ? "bg-red-100 text-red-700" : rec.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                                      }`}>{rec.priority}</span>
                                  </div>
                                  <p className="text-xs text-slate-600">{rec.action}</p>
                                  <p className="text-xs text-emerald-600 font-medium mt-1">💡 {rec.impact}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-slate-400">Now → Target</p>
                                  <p className="text-sm font-bold text-slate-700">{rec.current} → {rec.benchmark}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {aiInsights.growth_strategy?.length > 0 && (
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-xl">🚀</span> Growth Strategy Roadmap
                          </CardTitle>
                          <CardDescription>Phased approach to {aiInsights.current_analysis.target_share}% market share</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiInsights.growth_strategy.map((phase: any, idx: number) => (
                              <div key={idx} className="bg-gradient-to-br from-slate-50 to-green-50/40 rounded-2xl border border-green-200/60 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow">{idx + 1}</div>
                                  <div>
                                    <p className="font-bold text-slate-800 text-sm">{phase.phase}</p>
                                    <p className="text-xs text-green-600 font-semibold">{phase.focus}</p>
                                  </div>
                                </div>
                                <ul className="space-y-1.5 mb-3">
                                  {phase.actions.map((a: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
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
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-xl">🔍</span> Top Product Gaps
                          </CardTitle>
                          <CardDescription>High-demand products competitors offer but you don't</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                                  <th className="p-3 text-left">Product Type</th>
                                  <th className="p-3 text-right">Competitors</th>
                                  <th className="p-3 text-right">Avg Price</th>
                                  <th className="p-3 text-right">Rating</th>
                                  <th className="p-3 text-right">Demand</th>
                                  <th className="p-3 text-center">Opportunity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {aiInsights.product_gaps.map((g: any, i: number) => (
                                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-medium text-slate-800">{g.product_type}</td>
                                    <td className="p-3 text-right text-slate-600">{g.competitors_offering}</td>
                                    <td className="p-3 text-right font-bold text-emerald-700">₹{g.avg_price.toLocaleString()}</td>
                                    <td className="p-3 text-right"><span className="text-yellow-600 font-semibold">⭐ {g.avg_rating}</span></td>
                                    <td className="p-3 text-right text-slate-700 font-medium">{g.total_demand.toLocaleString()}</td>
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
                      <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-xl">💰</span> Pricing Intelligence
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <h4 className="font-bold text-slate-700 text-sm mb-3">Price Position</h4>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-xs text-slate-400">Your price</p>
                                  <p className="text-2xl font-black text-purple-700">₹{aiInsights.pricing_insights.your_price?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400">Market avg</p>
                                  <p className="text-xl font-bold text-slate-700">₹{aiInsights.pricing_insights.market_average?.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="mt-3 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold inline-block">
                                {aiInsights.pricing_insights.price_positioning}
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <h4 className="font-bold text-slate-700 text-sm mb-3">Competitive Landscape</h4>
                              <div className="space-y-2">
                                {[
                                  { l: "Budget competitors", v: aiInsights.pricing_insights.budget_competitors, c: "text-blue-600" },
                                  { l: "Similar price", v: aiInsights.pricing_insights.similar_price_competitors, c: "text-green-600" },
                                  { l: "Premium", v: aiInsights.pricing_insights.premium_competitors, c: "text-purple-600" },
                                ].map((x) => (
                                  <div key={x.l} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">{x.l}</span>
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

            {competitors?.length > 0 && (
              <div id="competitor-section">
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-sky-900">Competitor Analysis</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedCompetitors.map((c, idx) => {
                    const rank = (competitorPage - 1) * competitorsPerPage + idx + 1;
                    return (
                      <Card key={idx} className="bg-background border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow ${rank === 1 ? "bg-yellow-400" : rank === 2 ? "bg-slate-400" : rank === 3 ? "bg-orange-400" : "bg-blue-500"
                                }`}>{rank}</div>
                              <div>
                                <h4 className="font-bold text-slate-800">{c.competitor_name}</h4>
                                <p className="text-xs text-slate-500">{c.total_products} products</p>
                              </div>
                            </div>
                            <div className="text-right bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-xl shadow">
                              <p className="text-2xl font-black">{c.market_share}%</p>
                              <p className="text-xs opacity-80">Share</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { l: "Reviews", v: c.total_reviews.toLocaleString(), c: "text-green-700" },
                              { l: "Rating", v: c.avg_rating ? `⭐ ${c.avg_rating}` : "—", c: "text-yellow-700" },
                              { l: "Avg Price", v: `₹${c.avg_price.toLocaleString()}`, c: "text-purple-700" },
                            ].map((x) => (
                              <div key={x.l} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                                <p className="text-xs text-slate-400 mb-0.5">{x.l}</p>
                                <p className={`font-bold text-sm ${x.c}`}>{x.v}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {totalCompetitorPages > 1 && (
                  <Pagination currentPage={competitorPage} totalPages={totalCompetitorPages} onPageChange={handleCompetitorPageChange} />
                )}
              </div>
            )}
          </>
        )}

        {!loading && activeTab === "keyword" && keywordData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { l: "Total Products", v: keywordData.total_products.toLocaleString(), icon: <BarChart3 className="w-5 h-5 text-blue-600" />, c: "text-blue-600" },
                { l: "Total Reviews", v: keywordData.total_reviews.toLocaleString(), icon: <Users className="w-5 h-5 text-green-600" />, c: "text-green-600" },
                { l: "Price Range", v: `₹${keywordData.price_range.min.toLocaleString()} – ₹${keywordData.price_range.max.toLocaleString()}`, icon: <Award className="w-5 h-5 text-purple-600" />, c: "text-purple-600" },
              ].map((x) => (
                <Card key={x.l} className="bg-background border border-slate-200 rounded-2xl shadow-lg">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{x.l}</p>
                      <p className={`text-2xl font-black ${x.c}`}>{x.v}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">{x.icon}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Brand Distribution for "{keywordData.keyword}"</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={keywordData.brands.slice(0, 10).map((b) => ({
                      brand: b.brand.length > 12 ? b.brand.slice(0, 12) + "…" : b.brand,
                      share: b.share_percentage,
                    }))}
                    margin={{ left: 0, right: 10, top: 4, bottom: 40 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="brand" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: any) => [`${v}%`, "Share"]} />
                    <Bar dataKey="share" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {keywordData.brands.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card id="brands-table" className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-base">Brand Details</CardTitle>
                <CardDescription>{paginatedBrands.length} of {keywordData.brands.length} brands</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                        <th className="p-3 text-left">Brand</th>
                        <th className="p-3 text-right">Share</th>
                        <th className="p-3 text-right">Reviews</th>
                        <th className="p-3 text-right">Products</th>
                        <th className="p-3 text-right">Rating</th>
                        <th className="p-3 text-right">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBrands.map((b, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-medium text-slate-800">{b.brand}</td>
                          <td className="p-3 text-right font-bold text-blue-700">{b.share_percentage}%</td>
                          <td className="p-3 text-right text-slate-700">{b.total_reviews.toLocaleString()}</td>
                          <td className="p-3 text-right text-slate-600">{b.product_count}</td>
                          <td className="p-3 text-right">{b.avg_rating ? <span className="text-yellow-600 font-semibold">⭐ {b.avg_rating}</span> : "—"}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">{b.avg_price ? `₹${b.avg_price.toLocaleString()}` : "—"}</td>
                        </tr>
                      ))}
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
          </>
        )}
      </div>
    </div>
  );
}
