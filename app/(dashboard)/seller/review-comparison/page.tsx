"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSessionState } from "@/hooks/use-session-state";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/lib/config";
import {
  Lock, Crown, Star, MessageSquare, RefreshCw,
  Menu, X, TrendingUp, CheckCircle, Zap,
  ThumbsUp, ThumbsDown, Minus, Package, Users,
  Activity, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useSelectedProduct } from "@/lib/selected-product-context";

const BASE_URL = API_BASE_URL;

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature, isDark }: { tier: "basic" | "premium" | "enterprise"; feature: string; isDark: boolean }) {
  const router = useRouter();
  return (
    <div className={`absolute inset-0 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3 ${isDark ? 'bg-slate-900/85' : 'bg-white/85'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/50" : "bg-blue-50" : isDark ? "bg-amber-900/50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "text-blue-400" : "text-blue-500" : isDark ? "text-amber-400" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feature}</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}</p>
      </div>
      <button onClick={() => router.push("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
function HealthScoreRing({ score, isDark }: { score: number; isDark: boolean }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dashOffset = circ - (circ * score) / 100;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke={isDark ? "#334155" : "#f1f5f9"} strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{score}</span>
          <span className={`text-[8px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function StarRow({ rating, count, total, isDark }: { rating: number; count: number; total: number; isDark: boolean }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const color = rating >= 4 ? "#10b981" : rating === 3 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-4 text-right font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{rating}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className={`flex-1 rounded-full h-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={`w-6 text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{count}</span>
    </div>
  );
}

function ReviewCard({ review, isDark, isPremium, productTitle }: { review: any; isDark: boolean; isPremium: boolean; productTitle?: string }) {
  const [showDraft, setShowDraft] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const ratingColor = review.rating >= 4 ? isDark ? "text-emerald-400 bg-emerald-900/30" : "text-emerald-600 bg-emerald-50" : review.rating === 3 ? isDark ? "text-amber-400 bg-amber-900/30" : "text-amber-600 bg-amber-50" : isDark ? "text-red-400 bg-red-900/30" : "text-red-600 bg-red-50";

  const handleToggleDraft = async () => {
    setShowDraft((v) => !v);
    // Only generate once — cache result in state
    if (!aiReply && !generating) {
      setGenerating(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/comparison/ai-review-reply`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review_text:   review.comment || "",
            rating:        review.rating  ?? 3,
            author:        review.author  || "Valued Customer",
            product_title: productTitle   || "",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiReply(data.reply || "");
        } else {
          setAiReply("Unable to generate reply. Please try again.");
        }
      } catch {
        setAiReply("Unable to generate reply. Please try again.");
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleCopy = () => {
    if (!aiReply) return;
    navigator.clipboard.writeText(aiReply).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-100 text-sky-700'}`}>
              {(review.author || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{review.author || "Anonymous"}</p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{review.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {review.rating != null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor}`}>★ {review.rating}</span>
            )}
            {review.has_response && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>Replied</span>
            )}
          </div>
        </div>
        <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{review.comment}</p>

        {/* Per-review AI Draft Reply Button (Premium only) */}
        {isPremium && (
          <button
            onClick={handleToggleDraft}
            className={`mt-3 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
              showDraft
                ? isDark ? 'bg-blue-900/40 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'
                : isDark ? 'bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            {generating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {showDraft ? 'Hide AI Draft' : aiReply ? 'AI Draft Reply' : 'AI Draft Reply'}
          </button>
        )}
      </div>

      {/* Draft reply expandable panel */}
      {isPremium && showDraft && (
        <div className={`mx-4 mb-4 rounded-xl p-3 border ${isDark ? 'bg-blue-900/20 border-blue-800/40' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <p className={`text-[11px] font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>AI-Drafted Reply</p>
            </div>
            {aiReply && !generating && (
              <button
                onClick={handleCopy}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  copied
                    ? isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            )}
          </div>
          {generating ? (
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Generating AI reply…</p>
            </div>
          ) : (
            <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>{aiReply}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SentimentBar({ label, pct, icon: Icon, color, isDark }: { label: string; pct: number; icon: any; color: string; isDark: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
          <span className="font-bold" style={{ color }}>{pct}%</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function SimilarityPill({ score, isDark }: { score: number; isDark: boolean }) {
  const pct = Math.round(score * 100);
  const cls = pct >= 50 ? isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 25 ? isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-700 border-amber-200"
    : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>{pct}% match</span>
  );
}

const ChartTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`border rounded-xl p-2.5 shadow-lg text-xs ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label} star</p>
      <p className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{payload[0]?.value} reviews</p>
    </div>
  );
};

function ReviewComparisonContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { selected } = useSelectedProduct();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const asin     = searchParams.get("asin")      || selected?.asin      || "";
  const sellerId = searchParams.get("seller_id") || selected?.sellerId  || user?.seller_id || "";

  const [data, setData]         = useSessionState<any>("seller_review_comp_data", null);
  const [lastFetchedAsin, setLastFetchedAsin] = useSessionState<string>("seller_review_comp_asin", "");
  const [loading, setLoading]   = useState(false);

  const tier      = data?.tier || user?.subscriptionTier || "free";
  const isBasic   = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium = tier === "premium" || tier === "enterprise";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!asin || !sellerId) return;
    if (data && lastFetchedAsin === asin) return; // Already have data for this ASIN
    
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    fetch(`${BASE_URL}/api/comparison/reviews?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setData(d);
          setLastFetchedAsin(asin);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email, data, lastFetchedAsin]);

  const ratingDist = data?.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalDist  = Object.values(ratingDist).reduce((a: any, b: any) => a + b, 0) as number;
  const barData = Object.entries(ratingDist)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([k, v]) => ({ star: `${k}★`, count: v as number, fill: Number(k) >= 4 ? "#10b981" : Number(k) === 3 ? "#f59e0b" : "#ef4444" }));

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
        <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
              <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
            </button>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
              <MessageSquare className={`w-6 h-6 animate-pulse ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            </div>
            <div>
              <h1 className="page-title">
                {t('sellerPages.reviewCompTitle', 'Review Comparison')}
              </h1>
              <p className="page-subtitle">
                {t('sellerPages.reviewCompSubtitle', 'Analyse your reviews and benchmark customer feedback against similar products.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs font-bold ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" : tier === "basic" ? isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
              {tier.toUpperCase()}
            </Badge>
            {!isPremium && (
              <button onClick={() => router.push("/subscription")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 py-6 space-y-6">
          {!asin && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-sky-900/30' : 'bg-sky-100'}`}>
                <MessageSquare className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{t('sellerPages.noProductSelected', 'No product selected')}</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t('sellerPages.reviewCompSub', 'Click any product from My Products to compare reviews.')}</p>
              </div>
              <button onClick={() => router.push("/seller/my-products")} className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
                {t('sellerPages.goToMyProducts', 'Go to My Products')}
              </button>
            </div>
          )}

          {asin && loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analysing reviews & finding similar competitors…</p>
              <p className={`text-xs animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>We are analyzing the data. This may take 1–2 minutes.</p>
            </div>
          )}

          {asin && !loading && data && (
            <>
              {/* ── Product Card ──────────────────────────────────────────────── */}
              <div className={`rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  {data.product_photo ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" /> : <Package className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{data.product_title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.asin}</span>
                    {data.is_prime && <Badge className={`text-[10px] px-1.5 py-0 ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>PRIME</Badge>}
                    {data.is_best_seller && <Badge className={`text-[10px] px-1.5 py-0 ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>BEST SELLER</Badge>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-4">
                  {isPremium && data.review_health_score != null && (
                    <HealthScoreRing score={data.review_health_score} isDark={isDark} />
                  )}
                  <div>
                    <div className="flex items-center gap-1 justify-end">
                      <p className="text-3xl font-black text-amber-500">{data.star_rating?.toFixed(1) || "—"}</p>
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.total_ratings?.toLocaleString() || "—"} ratings</p>
                    {data.seller_rating && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Seller: ★ {data.seller_rating}</p>}
                  </div>
                </div>
              </div>

              {/* ── Rating Overview + Chart ───────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className={`rounded-2xl border shadow-sm p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <h3 className={`font-bold text-sm mb-4 flex items-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Rating Overview
                    <InfoTip text="Your product's overall star rating and the breakdown of how many customers gave 1 to 5 stars. Higher ratings = more trust and more sales." isDark={isDark} />
                  </h3>
                  <div className="flex items-center gap-5 mb-5">
                    <div className="text-center">
                      <p className="text-5xl font-black text-amber-500">{data.star_rating?.toFixed(1) || "—"}</p>
                      <div className="flex items-center gap-0.5 mt-1 justify-center">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(data.star_rating || 0) ? "text-amber-400 fill-amber-400" : isDark ? "text-slate-700 fill-slate-700" : "text-slate-200 fill-slate-200"}`} />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.total_ratings?.toLocaleString()} total</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5,4,3,2,1].map((r) => <StarRow key={r} rating={r} count={ratingDist[r] || 0} total={totalDist} isDark={isDark} />)}
                    </div>
                  </div>
                  {data.seller_rating && (
                    <div className={`rounded-xl p-3 flex items-center justify-between text-xs ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Seller Rating</span>
                      <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {data.seller_rating} ({data.seller_ratings_total?.toLocaleString()} ratings)
                      </span>
                    </div>
                  )}
                </div>
                <div className={`rounded-2xl border shadow-sm p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <h3 className={`font-bold text-sm mb-4 flex items-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Rating Distribution
                    <InfoTip text="A bar chart showing exactly how many customers left 1, 2, 3, 4, or 5-star reviews. A healthy product should have most reviews at 4-5 stars." isDark={isDark} />
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
                      <XAxis dataKey="star" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip isDark={isDark} />} />
                      <Bar dataKey="count" radius={[6,6,0,0]} maxBarSize={48}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Recent Reviews ────────────────────────────────────── */}
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isBasic && <TierGate tier="basic" feature="Recent Customer Reviews" isDark={isDark} />}
                <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Recent Customer Reviews</h3>
                    {data.response_rate_label && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${(data.response_rate_pct || 0) > 50 ? isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-600 border-emerald-200" : isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                        {data.response_rate_label} responded
                      </span>
                    )}
                  </div>
                  {(data.recent_reviews || []).length > 0
                    ? <div className="space-y-3">{(data.recent_reviews || []).map((r: any, i: number) => <ReviewCard key={i} review={r} isDark={isDark} isPremium={isPremium} productTitle={data.product_title} />)}</div>
                    : <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No recent reviews tracked.</p>
                  }
                </div>
              </div>

              {/* ── Review Velocity Insight (moved here, right after reviews) ── */}
              {isPremium && data.review_velocity_insight && (
                <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-sky-900/20 border-sky-800/50' : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100'}`}>
                  <Activity className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-xs font-bold mb-0.5 ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>Review Velocity Insight</p>
                    <p className={`text-sm ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>{data.review_velocity_insight}</p>
                  </div>
                </div>
              )}

              {/* ── Cards ──────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Response rate */}
                <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  {!isBasic && <TierGate tier="basic" feature="Seller Response Rate" isDark={isDark} />}
                  <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
                    <h3 className={`font-bold text-sm mb-3 flex items-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Seller Response Rate
                      <InfoTip text="What percentage of customer reviews you (the seller) have replied to. Amazon rewards sellers who respond quickly — it improves your account health score." isDark={isDark} />
                    </h3>
                    <div className="flex items-end gap-3">
                      <p className={`text-4xl font-black ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{data.response_rate_pct != null ? `${data.response_rate_pct}%` : "—"}</p>
                      <p className={`text-sm pb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.response_rate_label || "of reviews"}</p>
                    </div>
                    <div className={`mt-3 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full bg-sky-500 transition-all duration-700" style={{ width: `${data.response_rate_pct || 0}%` }} />
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {(data.response_rate_pct || 0) > 50 ? "✓ Strong response rate — builds buyer trust" : "↑ Respond to more reviews to improve seller score"}
                    </p>
                  </div>
                </div>
                {/* Portfolio rating */}
                <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  {!isPremium && <TierGate tier="premium" feature="Portfolio Rating Benchmark" isDark={isDark} />}
                  <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                    <h3 className={`font-bold text-sm mb-3 flex items-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Your Portfolio Average
                      <InfoTip text="The average star rating across all your tracked products combined. A high portfolio average signals you are a trusted, quality seller on Amazon." isDark={isDark} />
                    </h3>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-black text-amber-500">{data.avg_seller_portfolio_rating?.toFixed(2) || "—"}</p>
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" />
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Average across {data.seller_product_count || "—"} tracked products</p>
                    {data.star_rating && data.avg_seller_portfolio_rating && (
                      <div className={`mt-3 rounded-xl p-2.5 text-xs flex items-center justify-between ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>This product vs portfolio</span>
                        <span className={`font-bold ${data.star_rating >= data.avg_seller_portfolio_rating ? isDark ? "text-emerald-400" : "text-emerald-600" : isDark ? "text-red-400" : "text-red-500"}`}>
                          {data.star_rating >= data.avg_seller_portfolio_rating ? "↑ Above avg" : "↓ Below avg"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Sentiment ───────────────────────────────────────── */}
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="Sentiment Breakdown" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <h3 className={`font-bold text-sm mb-4 flex items-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Review Sentiment Breakdown
                    <InfoTip text="AI-classified percentage of reviews that are Positive (4-5 star), Neutral (3 star), or Negative (1-2 star). Use this to quickly spot customer satisfaction issues." isDark={isDark} />
                  </h3>
                  <div className="space-y-3">
                    <SentimentBar label="Positive (4–5 ★)" pct={data.sentiment_breakdown?.positive ?? 80} icon={ThumbsUp} color="#10b981" isDark={isDark} />
                    <SentimentBar label="Neutral (3 ★)" pct={data.sentiment_breakdown?.neutral ?? 12} icon={Minus} color="#f59e0b" isDark={isDark} />
                    <SentimentBar label="Negative (1–2 ★)" pct={data.sentiment_breakdown?.negative ?? 8} icon={ThumbsDown} color="#ef4444" isDark={isDark} />
                  </div>
                </div>
              </div>

              {/* ── Smart Competitor Reviews ────────────────────────── */}
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {!isPremium && <TierGate tier="premium" feature="Competitor Review Comparison" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <h3 className={`font-bold text-sm mb-1 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    <Users className="w-4 h-4 text-sky-500" /> Most Similar Competitors by Reviews
                  </h3>
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Matched by product similarity, not just category</p>
                  <div className="space-y-2">
                    {/* Your product row */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-sky-900/20 border-sky-800/50' : 'bg-sky-50 border-sky-100'}`}>
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-sky-800/50' : 'bg-white border-sky-100'}`}>
                        {data.product_photo ? <img src={data.product_photo} alt="" className="w-full h-full object-contain p-0.5" /> : <Package className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold line-clamp-1 ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{(data.product_title || "").substring(0, 52)}</p>
                        <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.asin} · YOU</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-amber-500">{data.star_rating?.toFixed(1)}</p>
                        <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.total_ratings?.toLocaleString()} ratings</p>
                      </div>
                    </div>
                    {(data.competitor_reviews || []).map((c: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 hover:border-sky-800/50' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                          {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" /> : <Package className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.asin}</span>
                            {c.similarity_score > 0 && <SimilarityPill score={c.similarity_score} isDark={isDark} />}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-black ${c.rating >= (data.star_rating || 0) ? isDark ? "text-red-400" : "text-red-500" : isDark ? "text-emerald-400" : "text-emerald-500"}`}>
                            {c.rating?.toFixed(1) || "—"}
                            {c.rating_delta != null && (
                              <span className="text-[10px] ml-1">{c.rating_delta > 0 ? `+${c.rating_delta}` : c.rating_delta}</span>
                            )}
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.num_ratings?.toLocaleString()} ratings</p>
                        </div>
                      </div>
                    ))}
                    {(data.competitor_reviews || []).length === 0 && (
                      <div className={`p-4 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                        <p className="text-xs">No direct competitors found matching your specific product keywords.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── AI Response Suggestion (locked gate for non-premium) ── */}
              {!isPremium && (
                <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <TierGate tier="premium" feature="AI Draft Replies (Per Review)" isDark={isDark} />
                  <div className="blur-sm pointer-events-none">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI Draft Replies — Per Review</p>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unlock instant AI-drafted replies for every customer review. Click "AI Draft Reply" under any review to generate and copy a personalized response in one click.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Upgrade CTA ───────────────────────────────────────────────── */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-base">Unlock Full Review Intelligence</p>
                    <p className="text-blue-100 text-sm mt-0.5">
                      {!isBasic
                        ? "See recent reviews, response rates and seller insights — Basic · ₹1,999/mo"
                        : "Get sentiment analysis, smart competitor matching & AI response suggestions — Premium · ₹2,999/mo"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {(!isBasic
                        ? ["Recent reviews", "Response rate tracking", "Seller rating overview"]
                        : ["Sentiment breakdown", "Smart competitor matching", "AI response drafts", "Review health score", "Velocity insights"]
                      ).map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                          <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => router.push("/subscription")} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
                    <Crown className="w-4 h-4" /> Upgrade Now
                  </button>
                </div>
              )}
            </>
          )}
        </main>
    </div>
  );
}

export default function ReviewComparisonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <ReviewComparisonContent />
    </Suspense>
  );
}
