"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Search, TrendingUp, Package, X, Plus,
  RefreshCw, CheckCircle2, XCircle, Target, BarChart3, Clock,
  Star, MessageSquare, ThumbsUp, Lock, Crown, AlertCircle,
  Send, Bot, User, Download, Bell, Globe, Zap, TrendingDown, Minus, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrackedProduct {
  id: number;
  seller_id: string;
  asin: string;
  product_title: string;
  product_photo: string;
  country: string;
  user_email: string;
  review_comments: string[];
  review_ratings: number[];
}

interface KeywordRank {
  keyword: string;
  rank: number | null;
  velocity: number;
  checked_at: string;
  user_email: string;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

interface AIAnalysis {
  product_title: string;
  asin: string;
  total_keywords: number;
  analysis: {
    opening?: string;
    why_changed?: string | any;
    immediate_actions?: string[] | any;
    keyword_focus?: string | any;
    prediction?: string | any;
    roadmap?: { week_1_2?: string; week_3_4?: string; month_2_3?: string } | any;
    closing_thought?: string;
    what_to_do?: string | string[] | any;
    which_keywords_matter?: string | any[] | any;
    future_prediction?: string | any;
    product_optimization?: string | string[] | any;
  };
}

interface UsageLimits {
  count: number;
  limit: number;
  remaining: number;
  subscription_tier: string;
}

interface RankPrediction {
  predicted_7d: number | null;
  predicted_30d: number | null;
  confidence: string;
  trend: string;
  r2_score?: number;
  margin_7d?: number;
  margin_30d?: number;
}

interface SentimentTopic {
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  summary: string;
}

interface ReviewSentiment {
  overall_mood: string;
  score: number;
  topics: {
    quality?: SentimentTopic;
    packaging?: SentimentTopic;
    value?: SentimentTopic;
    shipping?: SentimentTopic;
    support?: SentimentTopic;
  };
  top_complaint: string;
  top_praise: string;
  seller_action: string;
}

interface KeywordSuggestions {
  branded: string[];
  generic: string[];
  long_tail: string[];
  problem_solving: string[];
  competitor_adjacent: string[];
  reasoning: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RateLimitStatus {
  rank_updates_used: number;
  rank_updates_limit: number;
  rank_updates_remaining: number;
  resets_at: string;
}

interface ProductDetail {
  product: any;
  keywords: Array<{
    keyword: string;
    current_rank: number;
    velocity: number;
    prediction: RankPrediction;
    history: Array<{ rank: number; checked_at: string }>;
  }>;
  competitors: any[];
  ai_recommendation: any;
  review_sentiment: ReviewSentiment;
  keyword_suggestions: KeywordSuggestions;
  overall_rank_prediction: RankPrediction;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com");

function renderAnalysisField(value: any): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value
      .map((item, idx) =>
        typeof item === "object"
          ? `${idx + 1}. ${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(" – ")}`
          : `${idx + 1}. ${item}`
      )
      .join("\n\n");
  if (typeof value === "object" && value !== null)
    return Object.entries(value)
      .map(([k, v]) => `• ${k.replace(/_/g, " ")}: ${v}`)
      .join("\n\n");
  return String(value ?? "");
}

function VelocityBadge({ velocity }: { velocity: number }) {
  if (velocity > 0.3)
    return (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1 text-xs">
        <TrendingUp className="h-3 w-3" />+{velocity.toFixed(2)}
      </Badge>
    );
  if (velocity < -0.3)
    return (
      <Badge className="bg-red-100 text-red-800 flex items-center gap-1 text-xs">
        <TrendingDown className="h-3 w-3" />{velocity.toFixed(2)}
      </Badge>
    );
  return (
    <Badge className="bg-slate-100 text-slate-600 flex items-center gap-1 text-xs">
      <Minus className="h-3 w-3" />stable
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KeywordTracker() {
  const { user, isLoading } = useAuth();
  const userEmail = user?.email || "";
  const userId = user?.id;

  const [sellerId, setSellerId] = useState("");
  const [country, setCountry] = useState("US");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<TrackedProduct | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([""]);
  const [rankHistory, setRankHistory] = useState<KeywordRank[]>([]);
  const [loadingRanks, setLoadingRanks] = useState(false);
  const [updatingRanks, setUpdatingRanks] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // New feature state
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewSentiment, setReviewSentiment] = useState<ReviewSentiment | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<KeywordSuggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [rankPrediction, setRankPrediction] = useState<RankPrediction | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  const [priceAlertThreshold, setPriceAlertThreshold] = useState("10");
  const [priceAlertEmail, setPriceAlertEmail] = useState("");
  const [settingAlert, setSettingAlert] = useState(false);
  const [crossMarketData, setCrossMarketData] = useState<any | null>(null);
  const [loadingCrossMarket, setLoadingCrossMarket] = useState(false);
  const [crossMarketCountries, setCrossMarketCountries] = useState("IN,US,UK,DE");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStarters, setChatStarters] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "keywords" | "sentiment" | "competitors" | "chat" | "export"
  >("overview");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (userId) fetchUsageLimits(); }, [userId]);

  useEffect(() => {
    if (selectedProduct && userEmail) {
      fetchRankHistory(selectedProduct.id);
      fetchProductDetail(selectedProduct.id);
      fetchRateLimitStatus();
      setAiAnalysis(null);
      setReviewSentiment(null);
      setKeywordSuggestions(null);
      setRankPrediction(null);
      setCrossMarketData(null);
      setChatMessages([]);
      setChatStarters(null);
      setActiveTab("overview");
      setPriceAlertEmail(userEmail);
    }
  }, [selectedProduct, userEmail]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const calculateAverageRating = (ratings: number[]) => {
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
  };

  const getUpgradeMessage = () => {
    if (!usageLimits) return "";
    const tier = usageLimits.subscription_tier.toLowerCase();
    if (tier === "free") return "Upgrade to Basic for 10 product trackings per month";
    if (tier === "basic") return "Upgrade to Premium for up to 200,000 product trackings per month";
    return "Upgrade for more features";
  };

  const canTrack = usageLimits ? usageLimits.count < usageLimits.limit : true;

  const fetchUsageLimits = async () => {
    if (!userId) return;
    setLoadingUsage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/keyword-tracker-usage`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (res.ok) {
        const d = await res.json();
        setUsageLimits({
          count: d.count,
          limit: d.limit === -1 ? 200000 : d.limit,
          remaining: d.remaining === -1 ? 200000 - d.count : d.remaining,
          subscription_tier: d.subscription_tier,
        });
      }
    } catch (e) { console.error("Failed to fetch usage limits:", e); }
    finally { setLoadingUsage(false); }
  };

  const fetchRateLimitStatus = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/rate_limit_status?user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (res.ok) setRateLimitStatus(await res.json());
    } catch (e) { }
  };

  const fetchProductDetail = async (productId: number) => {
    if (!userEmail) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/product_detail/${productId}?user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (res.ok) {
        const d = await res.json();
        setProductDetail(d);
        if (d.review_sentiment && !d.review_sentiment.error) setReviewSentiment(d.review_sentiment);
        if (d.keyword_suggestions) setKeywordSuggestions(d.keyword_suggestions);
        if (d.overall_rank_prediction?.predicted_7d) setRankPrediction(d.overall_rank_prediction);
      }
    } catch (e) { console.error("Product detail error", e); }
    finally { setLoadingDetail(false); }
  };

  const fetchRankHistory = async (productId: number) => {
    setLoadingRanks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/rank_history/${productId}?user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Couldn't load history. Please refresh the page.");
      setRankHistory(await res.json());
    } catch (e: any) { showToast("Couldn't Load History", "Rank history unavailable. Please try again.", "error"); }
    finally { setLoadingRanks(false); }
  };

  const handleFetchProducts = async () => {
    if (userId && !canTrack) { setShowUpgradeModal(true); showToast("Tracking Limit Reached", `You've used all ${usageLimits?.limit} product trackings this month. Upgrade for more!`, "error"); return; }
    if (!sellerId.trim()) { showToast("Missing Information", "Please enter a seller ID", "error"); return; }
    if (!userEmail) { showToast("Login Required", "Please login to track products", "error"); return; }
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/keyword_tracker/fetch_and_store_products/${sellerId}?country=${country}&page=${page}&user_email=${encodeURIComponent(userEmail)}${userId ? `&user_id=${userId}` : ""}`;
      const res = await fetch(url, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 403) { setShowUpgradeModal(true); showToast("Tracking Limit Reached", err.detail, "error"); return; }
        throw new Error(err.detail || "Couldn't fetch products. Please try again.");
      }
      const data = await res.json();
      setProducts(data);
      if (userId) await fetchUsageLimits();
      showToast("Success!", `Found ${data.length} products with reviews for seller ${sellerId}`, "success");
    } catch (e: any) { showToast("Fetch Failed", "Couldn't load products. Please try again.", "error"); }
    finally { setLoading(false); }
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (!keywords.includes(keywordInput.trim())) setKeywords([...keywords, keywordInput.trim()]);
    setKeywordInput("");
  };

  const handleRemoveKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index));

  const handleTrackKeywords = async () => {
    if (!selectedProduct) { showToast("No Product Selected", "Please select a product first", "error"); return; }
    if (!userEmail) { showToast("Login Required", "Please login to track keywords", "error"); return; }
    const valid = keywords.filter((k) => k.trim() !== "");
    if (!valid.length) { showToast("No Keywords", "Please add at least one keyword", "error"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/track_keywords`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        cache: 'no-store',
        body: JSON.stringify({ tracked_product_id: selectedProduct.id, keywords: valid, user_email: userEmail }),
      });
      if (!res.ok) throw new Error("Couldn't add keywords. Please try again.");
      showToast("Keywords Tracked!", `${valid.length} keywords added for tracking`, "success");
      await fetchRankHistory(selectedProduct.id);
    } catch (e: any) { showToast("Tracking Failed", "Couldn't add keywords. Please try again.", "error"); }
  };

  const handleUpdateRanks = async () => {
    if (!userEmail) return;
    if (rateLimitStatus && rateLimitStatus.rank_updates_remaining <= 0) {
      showToast("Rate Limit Reached", `Resets at ${new Date(rateLimitStatus.resets_at).toLocaleTimeString()}`, "error"); return;
    }
    setUpdatingRanks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/update_daily_ranks`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        cache: 'no-store',
        body: JSON.stringify({ user_email: userEmail }),
      });
      if (res.status === 429) { const err = await res.json(); showToast("Rate Limited", err.detail, "error"); return; }
      if (!res.ok) throw new Error("Couldn't update ranks. Please try again.");
      const result = await res.json();
      showToast("Ranks Updated!", "All keyword ranks have been refreshed", "success");
      if (selectedProduct) await fetchRankHistory(selectedProduct.id);
      await fetchRateLimitStatus();
    } catch (e: any) { showToast("Update Failed", "Couldn't update ranks. Please try again.", "error"); }
    finally { setUpdatingRanks(false); }
  };

  const handleGetAIAnalysis = async () => {
    if (!selectedProduct || !userEmail) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/ai_analysis/${selectedProduct.id}?user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Analysis failed");
      setAiAnalysis(await res.json());
      showToast("AI Analysis Complete!", "Your keyword insights are ready", "success");
    } catch (e: any) { showToast("Analysis Failed", e.message, "error"); }
    finally { setLoadingAI(false); }
  };

  const handleGetSentiment = async () => {
    if (!selectedProduct || !userEmail) return;
    setLoadingSentiment(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/review_sentiment/${selectedProduct.id}?user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Sentiment failed");
      const d = await res.json();
      setReviewSentiment(d.sentiment);
      showToast("Sentiment Ready!", "Review analysis complete", "success");
    } catch (e: any) { showToast("Sentiment Failed", e.message, "error"); }
    finally { setLoadingSentiment(false); }
  };

  const handleGetSuggestions = async () => {
    if (!selectedProduct || !userEmail) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/suggest_keywords/${selectedProduct.id}?user_email=${encodeURIComponent(userEmail)}`, { 
        method: "POST", 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Suggestions failed");
      const d = await res.json();
      setKeywordSuggestions(d.suggestions);
      showToast("Suggestions Ready!", "AI keyword ideas generated", "success");
    } catch (e: any) { showToast("Suggestions Failed", e.message, "error"); }
    finally { setLoadingSuggestions(false); }
  };

  const handleSetPriceAlert = async () => {
    if (!selectedProduct || !userEmail) return;
    setSettingAlert(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/set_price_alert`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        cache: 'no-store',
        body: JSON.stringify({ tracked_product_id: selectedProduct.id, user_email: userEmail, threshold_percent: parseFloat(priceAlertThreshold), delivery_email: priceAlertEmail }),
      });
      if (!res.ok) throw new Error("Alert failed");
      const d = await res.json();
      showToast("Alert Set!", `Price alert set at ${d.threshold}${d.email_sent ? " – email sent!" : ""}`, "success");
    } catch (e: any) { showToast("Alert Failed", e.message, "error"); }
    finally { setSettingAlert(false); }
  };

  const handleCrossMarket = async () => {
    if (!selectedProduct) return;
    setLoadingCrossMarket(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/cross_market_comparison/${selectedProduct.asin}?countries=${crossMarketCountries}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Cross-market fetch failed");
      setCrossMarketData(await res.json());
    } catch (e: any) { showToast("Failed", e.message, "error"); }
    finally { setLoadingCrossMarket(false); }
  };

  const handleExport = async (format: "pdf" | "csv") => {
    if (!selectedProduct || !userEmail) return;
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/export/${selectedProduct.id}?format=${format}&user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${selectedProduct.asin}_report.${format}`;
      a.click();
      showToast("Export Ready!", `${format.toUpperCase()} downloaded`, "success");
    } catch (e: any) { showToast("Export Failed", e.message, "error"); }
  };

  const handleLoadChatStarters = async () => {
    if (!selectedProduct || !userEmail) return;
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/competitor_chat/starters/${selectedProduct.id}?user_email=${encodeURIComponent(userEmail)}`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (res.ok) setChatStarters(await res.json());
    } catch (e) { }
  };

  const handleSendChat = async (message?: string) => {
    const msg = (message ?? chatInput).trim();
    if (!msg || !selectedProduct || !userEmail) return;
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/keyword_tracker/competitor_chat`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        cache: 'no-store',
        body: JSON.stringify({ tracked_product_id: selectedProduct.id, user_email: userEmail, message: msg, history: chatMessages }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const d = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: d.reply }]);
      if (d.suggested_followups?.length) setChatStarters((prev: any) => ({ ...prev, _followups: d.suggested_followups }));
    } catch (e: any) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}` }]);
    } finally { setChatLoading(false); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Product Tracking Limit Reached</h3>
              <p className="text-slate-600 mb-4">
                You've used all <span className="font-bold text-red-600">{usageLimits?.limit}</span> product trackings this month on the{" "}
                <span className="font-semibold">{usageLimits?.subscription_tier?.toUpperCase()}</span> plan.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">{getUpgradeMessage()}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => (window.location.href = "/subscription")}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-none animate-in slide-in-from-right ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
            {t.variant === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
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

          {/* Step 1: Fetch Products */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />Step 1: Fetch Your Products
              </CardTitle>
              <CardDescription className="text-slate-500">Enter your Amazon Seller ID to load your products with reviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seller-id">Seller ID</Label>
                  <Input id="seller-id" value={sellerId} onChange={(e) => setSellerId(e.target.value)} placeholder="e.g., A02211013Q5HP3OMSZC7W" disabled={!userEmail || (!!userId && !canTrack)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white" disabled={!userEmail || (!!userId && !canTrack)}>
                    <option value="US">United States</option>
                    <option value="IN">India</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="AE">UAE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page">Page</Label>
                  <Input id="page" type="number" value={page} onChange={(e) => setPage(parseInt(e.target.value) || 1)} placeholder="1" min="1" disabled={!userEmail || (!!userId && !canTrack)} />
                </div>
              </div>
              <Button onClick={handleFetchProducts} disabled={loading || !userEmail || (!!userId && !canTrack)} className={`w-full ${userId && !canTrack ? "bg-slate-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Fetching Products & Reviews...</>
                  : userId && !canTrack ? <><Lock className="h-4 w-4 mr-2" />Limit Reached</>
                    : <><Search className="h-4 w-4 mr-2" />Fetch Products & Reviews</>}
              </Button>
              {loading && (
                <p className="text-slate-500 text-xs text-center mt-2 animate-pulse">
                  We are analyzing the data. This may take 1–2 minutes.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Products List */}
          {products.length > 0 && (
            <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />Your Products ({products.length})
                </CardTitle>
                <CardDescription className="text-slate-500">Click on a product to view reviews and start tracking keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} onClick={() => setSelectedProduct(product)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedProduct?.id === product.id ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-white hover:border-purple-300"}`}>
                      <div className="flex gap-3">
                        {product.product_photo && <img src={product.product_photo} alt={product.product_title} className="w-16 h-16 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{product.product_title}</p>
                          <p className="text-xs text-slate-500 mt-1">ASIN: {product.asin}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{product.country}</Badge>
                            {product.review_comments?.length > 0 && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />{product.review_comments.length} reviews
                              </Badge>
                            )}
                            {product.review_ratings?.length > 0 && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500" />{calculateAverageRating(product.review_ratings).toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Detail Panel */}
          {selectedProduct && (
            <div className="space-y-4">

              {/* Tab Navigation */}
              <div className="bg-background opacity-100 backdrop-blur-none border border-slate-200 rounded-2xl p-2 flex gap-1 flex-wrap shadow-sm">
                {(["overview", "keywords", "sentiment", "competitors", "chat", "export"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); if (tab === "chat" && !chatStarters) handleLoadChatStarters(); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-purple-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
                  >
                    {tab === "chat" ? "💬 Ask AI" : tab === "export" ? "⬇ Export" : tab}
                  </button>
                ))}
              </div>

              {/* ── Overview Tab ── */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {loadingDetail ? (
                    <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                      <CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Rank Prediction */}
                      {rankPrediction?.predicted_7d && (
                        <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-amber-500" />Rank Forecast
                            </CardTitle>
                            <CardDescription className="text-slate-500">Linear regression prediction based on your rank history</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                { label: "7-Day Forecast", value: `#${rankPrediction.predicted_7d}`, sub: `±${rankPrediction.margin_7d}`, color: "text-blue-600" },
                                { label: "30-Day Forecast", value: `#${rankPrediction.predicted_30d}`, sub: `±${rankPrediction.margin_30d}`, color: "text-purple-600" },
                                { label: "Trend", value: rankPrediction.trend, sub: "", color: rankPrediction.trend === "improving" ? "text-green-600" : rankPrediction.trend === "declining" ? "text-red-600" : "text-slate-600" },
                                { label: "Confidence", value: rankPrediction.confidence, sub: rankPrediction.r2_score ? `R² ${rankPrediction.r2_score}` : "", color: rankPrediction.confidence === "high" ? "text-green-600" : rankPrediction.confidence === "medium" ? "text-amber-600" : "text-slate-600" },
                              ].map((stat) => (
                                <div key={stat.label} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                  {stat.sub && <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Recommendation */}
                      {productDetail?.ai_recommendation && (
                        <Card className="shadow-sm border border-purple-200 rounded-2xl bg-gradient-to-br from-white to-purple-50">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                              <Bot className="h-5 w-5 text-purple-600" />Insydz AI Recommendation
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-purple-700 font-semibold">{productDetail.ai_recommendation.headline}</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{productDetail.ai_recommendation.where_you_stand}</p>
                            {productDetail.ai_recommendation.action_this_week && (
                              <div className="bg-purple-100 border border-purple-300 rounded-xl p-4">
                                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">This Week's Priority</p>
                                <p className="text-slate-800 text-sm">{productDetail.ai_recommendation.action_this_week}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Price Alert */}
                      <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-amber-500" />Price Alert
                          </CardTitle>
                          <CardDescription className="text-slate-500">Get emailed when a competitor drops below your price threshold</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Threshold %</Label>
                              <Input type="number" value={priceAlertThreshold} onChange={(e) => setPriceAlertThreshold(e.target.value)} placeholder="10" />
                            </div>
                            <div className="space-y-2">
                              <Label>Alert Email</Label>
                              <Input value={priceAlertEmail} onChange={(e) => setPriceAlertEmail(e.target.value)} placeholder="you@example.com" />
                            </div>
                            <div className="flex items-end">
                              <Button onClick={handleSetPriceAlert} disabled={settingAlert} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                {settingAlert ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}Set Alert
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cross-Market */}
                      <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-teal-600" />Cross-Market Comparison
                          </CardTitle>
                          <CardDescription className="text-slate-500">Compare this ASIN across multiple Amazon marketplaces</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-3 mb-4">
                            <Input value={crossMarketCountries} onChange={(e) => setCrossMarketCountries(e.target.value)} placeholder="IN,US,UK,DE" />
                            <Button onClick={handleCrossMarket} disabled={loadingCrossMarket} className="bg-teal-500 hover:bg-teal-600 text-white shrink-0">
                              {loadingCrossMarket ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Globe className="h-4 w-4 mr-2" />Compare</>}
                            </Button>
                          </div>
                          {crossMarketData && (
                            <div className="space-y-3">
                              {crossMarketData.ai_insight && (
                                <Alert className="border-teal-300 bg-teal-50">
                                  <AlertDescription className="text-teal-800 text-sm">{crossMarketData.ai_insight}</AlertDescription>
                                </Alert>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {crossMarketData.markets?.map((m: any) => (
                                  <div key={m.country} className={`rounded-xl p-3 border-2 ${m.found ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50 opacity-60"}`}>
                                    <p className="font-bold text-slate-800">{m.country}</p>
                                    {m.found ? (
                                      <>
                                        <p className="text-teal-700 text-sm font-semibold mt-1">{m.data?.product_price ?? "—"}</p>
                                        <p className="text-slate-500 text-xs">★ {m.data?.product_star_rating ?? "—"}</p>
                                        {m.rank_in_search && <p className="text-slate-500 text-xs">Rank #{m.rank_in_search}</p>}
                                      </>
                                    ) : <p className="text-slate-400 text-xs mt-1">Not found</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}

              {/* ── Keywords Tab ── */}
              {activeTab === "keywords" && (
                <div className="space-y-6">
                  {/* Add Keywords */}
                  <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <Search className="h-5 w-5 text-purple-600" />Step 2: Track Keywords for "{selectedProduct.product_title}"
                      </CardTitle>
                      <CardDescription className="text-slate-500">Add keywords you want to track rankings for</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="e.g., wireless headphones" onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()} disabled={!userEmail} />
                        <Button onClick={handleAddKeyword} className="bg-purple-500 hover:bg-purple-600" disabled={!userEmail}><Plus className="h-4 w-4" /></Button>
                      </div>
                      {keywords.filter((k) => k.trim()).length > 0 && (
                        <div className="space-y-2">
                          <Label>Keywords to Track:</Label>
                          <div className="flex flex-wrap gap-2">
                            {keywords.filter((k) => k.trim()).map((kw, i) => (
                              <Badge key={i} className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-2">
                                {kw}
                                <button onClick={() => handleRemoveKeyword(i)} className="hover:text-purple-900"><X className="h-3 w-3" /></button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button onClick={handleTrackKeywords} className="w-full bg-purple-500 hover:bg-purple-600" disabled={!userEmail}>
                        <Target className="h-4 w-4 mr-2" />Start Tracking Keywords
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Rank History */}
                  <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 backdrop-blur-none">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-600" />Keyword Rank History
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {rateLimitStatus && (
                            <span className="text-xs text-slate-500">{rateLimitStatus.rank_updates_remaining}/{rateLimitStatus.rank_updates_limit} updates left today</span>
                          )}
                          <Button onClick={handleUpdateRanks} disabled={updatingRanks || !userEmail} size="sm" className="bg-orange-500 hover:bg-orange-600">
                            {updatingRanks ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</> : <><RefreshCw className="h-4 w-4 mr-2" />Update Ranks</>}
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-slate-500">View current rankings for tracked keywords</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingRanks ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
                      ) : rankHistory.length === 0 ? (
                        <Alert className="border-blue-300 bg-blue-50">
                          <AlertDescription className="text-blue-700">No rank data yet. Add keywords and update ranks to start tracking!</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-3">
                          {rankHistory.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg border border-slate-200">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900">{item.keyword}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />{new Date(item.checked_at).toLocaleString()}
                                  </p>
                                  <VelocityBadge velocity={item.velocity ?? 0} />
                                  <Badge className="text-xs bg-blue-100 text-blue-800">{item.user_email}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${item.rank === null || item.rank === 0 ? "text-slate-400" : item.rank <= 10 ? "text-green-600" : item.rank <= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                  {item.rank === null || item.rank === 0 ? "—" : `#${item.rank}`}
                                </div>
                                <p className="text-xs text-slate-500">{item.rank === null || item.rank === 0 ? "Pending" : "Rank"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Analysis */}
                  {rankHistory.length > 0 && (
                    <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-none bg-gradient-to-br from-blue-50 to-purple-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI-Powered Strategic Insights
                          </CardTitle>
                          <Button onClick={handleGetAIAnalysis} disabled={loadingAI || !userEmail} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                            {loadingAI ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</> : <><svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Get AI Analysis</>}
                          </Button>
                        </div>
                        <CardDescription className="text-slate-600">AI-powered insights powered by Llama 3.2</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingAI ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                            <p className="text-slate-600 text-sm">AI is analyzing your keyword data...</p>
                            <p className="text-slate-400 text-xs mt-2">We are analyzing the data. This may take 1–2 minutes.</p>
                          </div>
                        ) : aiAnalysis ? (
                          <div className="space-y-6">
                            <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                              <h3 className="font-bold text-lg text-slate-800">{aiAnalysis.product_title}</h3>
                              <p className="text-sm text-slate-600">ASIN: {aiAnalysis.asin}</p>
                              <p className="text-sm text-slate-600">Total Keywords Tracked: {aiAnalysis.total_keywords}</p>
                            </div>
                            {aiAnalysis.analysis.opening && (
                              <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                                <p className="text-slate-700 leading-relaxed italic">{aiAnalysis.analysis.opening}</p>
                              </div>
                            )}
                            {[
                              { key: "why_changed", label: "Why Rankings Changed", borderColor: "border-blue-200" },
                              { key: "immediate_actions", label: "Immediate Action Steps", borderColor: "border-green-200" },
                              { key: "keyword_focus", label: "Priority Keywords", borderColor: "border-yellow-200" },
                              { key: "prediction", label: "30-Day Forecast", borderColor: "border-purple-200" },
                              { key: "product_optimization", label: "Listing Optimization", borderColor: "border-orange-200" },
                            ].map(({ key, label, borderColor }) => {
                              const val = (aiAnalysis.analysis as any)[key]
                                ?? (aiAnalysis.analysis as any)[key === "immediate_actions" ? "what_to_do" : key === "keyword_focus" ? "which_keywords_matter" : key === "prediction" ? "future_prediction" : key];
                              if (!val) return null;
                              return (
                                <div key={key} className={`bg-white rounded-xl p-6 border-2 ${borderColor}`}>
                                  <h4 className="font-bold text-slate-800 mb-3">{label}</h4>
                                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">{renderAnalysisField(val)}</div>
                                </div>
                              );
                            })}
                            {aiAnalysis.analysis.roadmap && (
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                  <BarChart3 className="h-5 w-5 text-purple-600" />30-60-90 Day Roadmap
                                </h4>
                                {typeof aiAnalysis.analysis.roadmap === "object" && !Array.isArray(aiAnalysis.analysis.roadmap) ? (
                                  <div className="space-y-3">
                                    {Object.entries(aiAnalysis.analysis.roadmap).map(([k, v]) => (
                                      <div key={k}>
                                        <p className="font-semibold text-purple-700 text-sm mb-1">{k.replace(/_/g, " ").toUpperCase()}</p>
                                        <p className="text-slate-700 text-sm">{String(v)}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : <div className="text-slate-700 leading-relaxed whitespace-pre-line">{renderAnalysisField(aiAnalysis.analysis.roadmap)}</div>}
                              </div>
                            )}
                            {aiAnalysis.analysis.closing_thought && (
                              <p className="text-slate-500 text-sm italic text-center">{aiAnalysis.analysis.closing_thought}</p>
                            )}
                          </div>
                        ) : (
                          <Alert className="border-purple-300 bg-purple-50">
                            <AlertDescription className="text-purple-700 flex items-center gap-2">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Click "Get AI Analysis" to receive AI-powered insights about your keyword rankings.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Keyword Suggestions */}
                  <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                          <Search className="h-5 w-5 text-teal-600" />AI Keyword Suggestions
                        </CardTitle>
                        <Button onClick={handleGetSuggestions} disabled={loadingSuggestions} size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
                          {loadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest"}
                        </Button>
                      </div>
                      <CardDescription className="text-slate-500">AI-generated keyword ideas grouped by search intent — click any to add to your tracking list</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {keywordSuggestions ? (
                        <div className="space-y-4">
                          {keywordSuggestions.reasoning && <p className="text-slate-500 text-xs italic">{keywordSuggestions.reasoning}</p>}
                          {Object.entries(keywordSuggestions)
                            .filter(([k]) => k !== "reasoning" && Array.isArray(keywordSuggestions[k as keyof typeof keywordSuggestions]))
                            .map(([group, words]) => (
                              <div key={group}>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{group.replace(/_/g, " ")}</p>
                                <div className="flex flex-wrap gap-2">
                                  {(words as string[]).map((w) => (
                                    <button key={w} onClick={() => { setKeywords((p) => [...new Set([...p, w])]); showToast("Added!", `"${w}" added to your tracking list`); }} className="text-xs bg-teal-50 border border-teal-300 text-teal-700 rounded-full px-3 py-1 hover:bg-teal-100 transition-colors">
                                      + {w}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm text-center py-4">Click "Suggest" to get AI-powered keyword ideas.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Sentiment Tab ── */}
              {activeTab === "sentiment" && (
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-none bg-gradient-to-br from-white to-blue-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-600" />Customer Reviews Analysis
                        </CardTitle>
                        <CardDescription className="text-slate-600 mt-2">
                          <span className="font-semibold">NLP sentiment breakdown</span> by topic — quality, packaging, value, shipping, support
                        </CardDescription>
                      </div>
                      <Button onClick={handleGetSentiment} disabled={loadingSentiment} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        {loadingSentiment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze Reviews"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loadingSentiment && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-600 text-sm font-medium">Analyzing reviews sentiment...</p>
                        <p className="text-slate-400 text-xs mt-2">We are analyzing the data. This may take 1–2 minutes.</p>
                      </div>
                    )}
                    {selectedProduct.review_comments?.length > 0 && !reviewSentiment && !loadingSentiment && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{selectedProduct.review_comments.length} reviews available</p>
                        {selectedProduct.review_comments.slice(0, 3).map((c, i) => (
                          <div key={i} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, j) => <Star key={j} className={`h-4 w-4 ${j < (selectedProduct.review_ratings[i] ?? 0) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`} />)}
                            </div>
                            <p className="text-slate-700 leading-relaxed text-sm line-clamp-2">{c}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {reviewSentiment && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-3 rounded-lg"><MessageSquare className="h-6 w-6 text-blue-600" /></div>
                              <div>
                                <p className="text-sm text-slate-600">Sentiment Score</p>
                                <p className={`text-2xl font-bold ${reviewSentiment.score >= 7 ? "text-green-600" : reviewSentiment.score >= 5 ? "text-yellow-600" : "text-red-600"}`}>{reviewSentiment.score}/10</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border-2 border-yellow-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-yellow-100 p-3 rounded-lg"><Star className="h-6 w-6 text-yellow-600 fill-yellow-600" /></div>
                              <div>
                                <p className="text-sm text-slate-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-yellow-600">{calculateAverageRating(selectedProduct.review_ratings).toFixed(1)} ⭐</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-3 rounded-lg"><ThumbsUp className="h-6 w-6 text-green-600" /></div>
                              <div>
                                <p className="text-sm text-slate-600">Overall Mood</p>
                                <p className="text-sm font-semibold text-slate-700 leading-tight">{reviewSentiment.overall_mood}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(reviewSentiment.topics ?? {}).map(([topic, data]) => (
                            <div key={topic} className="bg-white p-4 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-slate-800 capitalize">{topic}</p>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${data.score >= 7 ? "text-green-600" : data.score >= 5 ? "text-amber-600" : "text-red-600"}`}>{data.score}/10</span>
                                  <Badge className={`text-xs ${data.sentiment === "positive" ? "bg-green-100 text-green-800" : data.sentiment === "negative" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{data.sentiment}</Badge>
                                </div>
                              </div>
                              <p className="text-slate-500 text-xs">{data.summary}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1"><ThumbsUp className="h-3 w-3" />Top Praise</p>
                            <p className="text-slate-700 text-sm">{reviewSentiment.top_praise}</p>
                          </div>
                          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Top Complaint</p>
                            <p className="text-slate-700 text-sm">{reviewSentiment.top_complaint}</p>
                          </div>
                        </div>

                        {reviewSentiment.seller_action && (
                          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-purple-700 mb-1">Recommended Action</p>
                            <p className="text-slate-800 text-sm">{reviewSentiment.seller_action}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── Competitors Tab ── */}
              {activeTab === "competitors" && (
                <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />Competitor Intelligence
                    </CardTitle>
                    <CardDescription className="text-slate-500">Live competitor comparison with price, rating, and badge metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingDetail ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
                    ) : productDetail?.competitors?.length ? (
                      <div className="space-y-4">
                        {productDetail.competitors.slice(0, 5).map((c: any, i: number) => {
                          const comp = c.competitor_product ?? c;
                          const metrics = c.comparison_metrics ?? {};
                          const price = metrics.price_comparison ?? {};
                          const rating = metrics.rating_comparison ?? {};
                          return (
                            <div key={i} className="p-5 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-slate-200">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 text-sm line-clamp-2">{comp.product_title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{comp.asin}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  {comp.is_best_seller && <Badge className="text-xs bg-amber-100 text-amber-800">Best Seller</Badge>}
                                  {comp.is_amazon_choice && <Badge className="text-xs bg-teal-100 text-teal-800">Amazon's Choice</Badge>}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3 mb-3">
                                <div className="text-center bg-white rounded-lg p-2 border border-slate-200">
                                  <p className="text-xs text-slate-500">Price</p>
                                  <p className="text-sm font-bold text-slate-800">{comp.product_price ?? "—"}</p>
                                  {price.difference_percent != null && <p className={`text-xs font-semibold ${price.difference_percent < 0 ? "text-green-600" : "text-red-600"}`}>{price.difference_percent > 0 ? "+" : ""}{price.difference_percent?.toFixed(1)}%</p>}
                                </div>
                                <div className="text-center bg-white rounded-lg p-2 border border-slate-200">
                                  <p className="text-xs text-slate-500">Rating</p>
                                  <p className="text-sm font-bold text-slate-800">★ {comp.product_star_rating_numeric ?? "—"}</p>
                                  {rating.difference != null && <p className={`text-xs font-semibold ${rating.difference > 0 ? "text-green-600" : "text-red-600"}`}>{rating.difference > 0 ? "+" : ""}{rating.difference?.toFixed(1)}</p>}
                                </div>
                                <div className="text-center bg-white rounded-lg p-2 border border-slate-200">
                                  <p className="text-xs text-slate-500">Reviews</p>
                                  <p className="text-sm font-bold text-slate-800">{comp.product_num_ratings?.toLocaleString() ?? "—"}</p>
                                </div>
                              </div>
                              {(metrics.competitive_advantages?.length > 0 || metrics.competitive_disadvantages?.length > 0) && (
                                <div className="flex flex-wrap gap-1.5">
                                  {metrics.competitive_advantages?.map((a: string, j: number) => (
                                    <span key={j} className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5">✓ {a}</span>
                                  ))}
                                  {metrics.competitive_disadvantages?.map((d: string, j: number) => (
                                    <span key={j} className="text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5">✗ {d}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Alert className="border-blue-300 bg-blue-50">
                        <AlertDescription className="text-blue-700">No competitor data available yet. Select a product to load competitors.</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── Chat Tab ── */}
              {activeTab === "chat" && (
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background" style={{ height: "70vh", display: "flex", flexDirection: "column" }}>
                  <CardHeader className="border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-800">Insydz AI Strategist</CardTitle>
                        <CardDescription>Ask anything about your competitors, keywords, or pricing strategy</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 && chatStarters ? (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm text-center">{chatStarters.intro}</p>
                        {chatStarters.starters?.map((cat: any) => (
                          <div key={cat.category}>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">{cat.category}</p>
                            <div className="space-y-1.5">
                              {cat.questions?.map((q: string) => (
                                <button key={q} onClick={() => handleSendChat(q)} className="w-full text-left text-sm text-slate-700 bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl px-4 py-2.5 transition-all">
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /></div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-purple-500" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}>
                            {msg.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-sm" : "bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 text-slate-800 rounded-tl-sm"}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="flex gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><Bot className="h-4 w-4 text-white" /></div>
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                        </div>
                      </div>
                    )}
                    {chatStarters?._followups && chatMessages.length > 0 && !chatLoading && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {chatStarters._followups.map((q: string) => (
                          <button key={q} onClick={() => handleSendChat(q)} className="text-xs text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-full px-3 py-1.5 transition-colors">
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-4 border-t border-slate-200 flex gap-2 shrink-0">
                    <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }} placeholder="Ask about your competitors, keywords, pricing..." disabled={chatLoading} />
                    <Button onClick={() => handleSendChat()} disabled={chatLoading || !chatInput.trim()} className="bg-purple-500 hover:bg-purple-600 text-white px-4 shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* ── Export Tab ── */}
              {activeTab === "export" && (
                <Card className="shadow-sm border border-slate-200 rounded-2xl bg-background">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                      <Download className="h-5 w-5 text-slate-600" />Export Report
                    </CardTitle>
                    <CardDescription className="text-slate-500">Download your rank history and AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                          <Download className="h-7 w-7 text-red-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-slate-800">PDF Report</p>
                          <p className="text-xs text-slate-500 mt-1">Full analysis with rank history, AI insights, and rank predictions</p>
                        </div>
                        <Button onClick={() => handleExport("pdf")} className="w-full bg-red-500 hover:bg-red-600 text-white">Download PDF</Button>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                          <BarChart3 className="h-7 w-7 text-green-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-slate-800">CSV Data</p>
                          <p className="text-xs text-slate-500 mt-1">Raw keyword rank history for spreadsheet analysis</p>
                        </div>
                        <Button onClick={() => handleExport("csv")} className="w-full bg-green-500 hover:bg-green-600 text-white">Download CSV</Button>
                      </div>
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
