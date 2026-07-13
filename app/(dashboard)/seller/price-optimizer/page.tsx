"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useSelectedProduct } from "@/lib/selected-product-context";
import { useTheme } from "next-themes";
import {
  Lock, Crown, RefreshCw, Menu, Package,
  TrendingUp, TrendingDown, Minus, CheckCircle,
  AlertTriangle, XCircle, Zap, Target, BarChart2,
  ChevronDown, ChevronUp, Bell, Bot, Send, RotateCcw,
  ShieldCheck, ArrowUp, ArrowDown, Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const BASE_URL = API_BASE_URL;
const API      = `${BASE_URL}/api/seller/optimize`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  asin: string;
  product_title: string;
  product_photo?: string;
  is_prime?: boolean;
  is_best_seller?: boolean;
  is_amazon_choice?: boolean;
  currency: string;
  sales_volume?: string;
  star_rating?: number;
  num_ratings?: number;
  your_price: number;
  price_position: string;
  market_avg: number;
  pct_vs_avg: number;
  recommended_action_teaser: string;
  confidence_score_teaser: number;
  market_product_count: number;
  last_updated: string;
}

interface PriceGap {
  your_price: number;
  market_avg: number;
  market_min: number;
  market_max: number;
  gap_vs_avg: number;
  pct_vs_avg: number;
  price_position: string;
  your_mrp_discount_pct?: number;
  market_avg_discount_pct: number;
  your_rating: number;
  market_avg_rating: number;
  rating_gap: number;
  currency: string;
  product_title: string;
  price_bands: { band: string; count: number; your_price_in_band: boolean }[];
  competitors: CompetitorRow[];
}

interface CompetitorRow {
  product_title: string;
  asin: string;
  product_price: string;
  price_num: number;
  rating?: number;
  num_ratings?: number;
  is_best_seller?: boolean;
  is_amazon_choice?: boolean;
  sales_volume?: string;
}

interface Reprice {
  asin: string;
  product_title: string;
  currency: string;
  your_price: number;
  price_position: string;
  confidence_score: number;
  recommended_action: "raise" | "lower" | "hold";
  rec_price_low: number;
  rec_price_high: number;
  price_signal: string;
  rating_signal: string;
  velocity_signal: string;
  alerts: { type: string; message: string }[];
}

interface AlertData {
  asin: string;
  product_title: string;
  currency: string;
  your_price: number;
  total_competitors: number;
  price_movers: number;
  undercuts_you: number;
  deltas: Delta[];
  undercut_sellers: Delta[];
  alert_level: "ok" | "warn" | "critical";
}

interface Delta {
  seller_id: string;
  seller_name: string;
  old_price: number;
  new_price: number;
  change_pct: number;
  direction: "up" | "down";
  rating?: number;
  is_prime?: boolean;
  updated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sym(currency: string) {
  return currency === "USD" ? "$" : "₹";
}

function fmt(n: number | undefined | null, currency = "INR") {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return sym(currency) + Math.round(n).toLocaleString("en-IN");
}

function pct(n: number | undefined | null) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return (n > 0 ? "+" : "") + n.toFixed(1) + "%";
}

// ── useStream ─────────────────────────────────────────────────────────────────

function useStream() {
  const [streaming, setStreaming] = useState(false);
  const [text, setText]           = useState("");
  const [error, setError]         = useState<string | null>(null);
  const abortRef                  = useRef<AbortController | null>(null);

  const start = useCallback(async (url: string, body: object) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setText(""); setError(null); setStreaming(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError((err?.detail as any)?.error || "request_failed");
        setStreaming(false);
        return;
      }
      const reader = res.body!.getReader();
      const dec    = new TextDecoder();
      let buf      = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") break;
          try { setText((p) => p + JSON.parse(d)); } catch { setText((p) => p + d); }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError("stream_interrupted");
    } finally {
      setStreaming(false);
    }
  }, []);

  const stop  = useCallback(() => { abortRef.current?.abort(); setStreaming(false); }, []);
  const reset = useCallback(() => { setText(""); setError(null); }, []);
  return { streaming, text, error, start, stop, reset };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TierGate({ tier, feature, isDark }: { tier: "basic" | "premium" | "enterprise"; feature: string; isDark: boolean }) {
  const router = useRouter();
  return (
    <div className={`absolute inset-0 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3 ${isDark ? 'bg-slate-900/85' : 'bg-white/88'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/50" : "bg-blue-50" : isDark ? "bg-amber-900/50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "text-blue-400" : "text-blue-500" : isDark ? "text-amber-400" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feature}</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
          {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
        </p>
      </div>
      <button
        onClick={() => router.push("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

function AlertBox({ type, message, isDark }: { type: string; message: string; isDark: boolean }) {
  const s: Record<string, string> = {
    danger:  isDark ? "bg-red-900/30 border-red-800/50 text-red-400" : "bg-red-50 border-red-300 text-red-800",
    warn:    isDark ? "bg-amber-900/30 border-amber-800/50 text-amber-400" : "bg-amber-50 border-amber-300 text-amber-800",
    success: isDark ? "bg-emerald-900/30 border-emerald-800/50 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800",
  };
  const ic: Record<string, JSX.Element> = {
    danger:  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    warn:    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />,
  };
  const k = type in s ? type : "warn";
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border-l-4 text-sm ${s[k]}`}>
      {ic[k]}
      <span>{message}</span>
    </div>
  );
}

function Section({
  title, icon: Icon, children, defaultOpen = true, count, accent, isDark
}: {
  title: string; icon: any; children: React.ReactNode;
  defaultOpen?: boolean; count?: number; accent?: string; isDark: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || (isDark ? 'bg-sky-900/30' : 'bg-sky-50')}`}>
            <Icon className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</span>
          {count != null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function ConfidenceRing({ score, isDark }: { score: number; isDark: boolean }) {
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color  = score >= 65 ? (isDark ? "#34d399" : "#10b981") : score >= 40 ? (isDark ? "#fbbf24" : "#f59e0b") : (isDark ? "#f87171" : "#ef4444");
  const label  = score >= 65 ? "Raise" : score >= 40 ? "Hold" : "Lower";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke={isDark ? "#334155" : "#f1f5f9"} strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{score}</span>
          <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function StreamBox({ stream, isDark }: { stream: ReturnType<typeof useStream>; isDark: boolean }) {
  return (
    <div className={`mt-3 min-h-12 max-h-72 overflow-y-auto rounded-xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      {stream.streaming && !stream.text && (
        <span className={`text-xs animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Analysing...</span>
      )}
      {(stream.text || stream.streaming) && (
        <div className={`prose prose-sm max-w-none leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          <ReactMarkdown>{stream.text}</ReactMarkdown>
          {stream.streaming && <span className="animate-pulse text-blue-500">▌</span>}
        </div>
      )}
      {stream.error === "upgrade_required" && (
        <span className={`text-xs font-medium ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>Available on Premium plan. Upgrade to unlock.</span>
      )}
      {stream.error === "ollama_offline" && (
        <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>AI is temporarily unavailable. Please try again shortly.</span>
      )}
      {stream.error === "stream_interrupted" && (
        <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>Analysis interrupted. Retry to continue — no data lost.</span>
      )}
      {stream.error && !["upgrade_required", "ollama_offline", "stream_interrupted"].includes(stream.error) && (
        <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>Couldn't complete analysis. Please try again.</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SellerPriceOptimizer() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { user }     = useAuth();
  const { toggle }   = useSidebar();
  const { selected } = useSelectedProduct();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const asin     = searchParams.get("asin")      || selected?.asin     || "";
  const sellerId = searchParams.get("seller_id") || selected?.sellerId || user?.seller_id || "";
  const userId   = user?.id?.toString() || "";
  const userEmail= user?.email || "";

  const [profile,    setProfile]    = useState<Profile | null>(null);
  const [priceGap,   setPriceGap]   = useState<PriceGap | null>(null);
  const [reprice,    setReprice]     = useState<Reprice | null>(null);
  const [alertData,  setAlertData]  = useState<AlertData | null>(null);
  const [activeTab,  setActiveTab]  = useState<"reprice" | "gap" | "alerts">("reprice");
  const [loading,    setLoading]    = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [tier,       setTier]       = useState(user?.subscriptionTier || "free");

  const repriceStream = useStream();
  const alertStream   = useStream();

  const isBasic   = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium = tier === "premium" || tier === "enterprise";

  const qs = (extra: Record<string, string> = {}) =>
    new URLSearchParams({ asin, seller_id: sellerId, user_id: userId, user_email: userEmail, ...extra }).toString();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile (free — always)
  useEffect(() => {
    if (!asin || !sellerId) return;
    setLoading(true);
    fetch(`${API}/asin-profile?${qs()}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) { setProfile(d); setTier(user?.subscriptionTier || "free"); } })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, userEmail]);

  // Load tab data when tab changes
  useEffect(() => {
    if (!asin || !sellerId || !profile) return;
    if (activeTab === "gap" && !priceGap && isBasic) {
      setTabLoading(true);
      fetch(`${API}/price-gap?${qs()}`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setPriceGap(d))
        .catch(console.error)
        .finally(() => setTabLoading(false));
    }
    if (activeTab === "reprice" && !reprice && isBasic) {
      setTabLoading(true);
      fetch(`${API}/reprice?${qs()}`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setReprice(d))
        .catch(console.error)
        .finally(() => setTabLoading(false));
    }
    if (activeTab === "alerts" && !alertData && isPremium) {
      setTabLoading(true);
      fetch(`${API}/competitor-alerts?${qs()}`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setAlertData(d))
        .catch(console.error)
        .finally(() => setTabLoading(false));
    }
  }, [activeTab, profile, isBasic, isPremium]);

  const currency = profile?.currency || reprice?.currency || "INR";

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
            <TrendingUp className={`w-6 h-6 animate-pulse ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              Price Optimizer
            </h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Live repricing intelligence and price optimization recommendations for your tracked products.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" : tier === "basic" ? isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
            {tier.toUpperCase()}
          </Badge>
          {!isPremium && (
            <button onClick={() => router.push("/subscription")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
              <Crown className="w-3 h-3" /> Upgrade
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 py-6 space-y-5">
        {/* No product selected */}
        {!asin && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-sky-900/30' : 'bg-sky-100'}`}>
              <TrendingUp className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No product selected</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Select a product from My Products to run the price optimizer.</p>
            </div>
            <button onClick={() => router.push("/seller/my-products")}
              className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
              Go to My Products
            </button>
          </div>
        )}

        {/* Loading profile */}
        {asin && loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading product data…</p>
          </div>
        )}

        {asin && !loading && profile && (
          <>
            {/* Product card */}
            <div className={`rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                {profile.product_photo
                  ? <img src={profile.product_photo} alt={profile.product_title} className="w-full h-full object-contain p-1" />
                  : <Package className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{profile.product_title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{profile.asin}</span>
                  {profile.is_prime && <Badge className={`text-[10px] px-1.5 py-0 border ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>PRIME</Badge>}
                  {profile.is_best_seller && <Badge className={`text-[10px] px-1.5 py-0 border ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>BEST SELLER</Badge>}
                  {profile.is_amazon_choice && <Badge className={`text-[10px] px-1.5 py-0 border ${isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>AMAZON'S CHOICE</Badge>}
                  {profile.sales_volume && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
                      {profile.sales_volume}
                    </span>
                  )}
                </div>
                {profile.star_rating && (
                  <p className="text-xs text-amber-500 font-bold mt-1">
                    {profile.star_rating}★
                    {profile.num_ratings && <span className={`font-normal ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({profile.num_ratings.toLocaleString()} ratings)</span>}
                  </p>
                )}
              </div>

              {/* Free price position pill */}
              <div className="shrink-0 text-right">
                <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 ${
                  profile.price_position === "Above market" ? (isDark ? "bg-purple-900/30 border-purple-800/50 text-purple-400" : "bg-purple-50 border-purple-300 text-purple-800")
                  : profile.price_position === "Below market" ? (isDark ? "bg-amber-900/30 border-amber-800/50 text-amber-400" : "bg-amber-50 border-amber-300 text-amber-800")
                  : (isDark ? "bg-green-900/30 border-green-800/50 text-green-400" : "bg-green-50 border-green-300 text-green-800")
                }`}>
                  {profile.price_position === "Above market" ? <ArrowUp className="w-3.5 h-3.5" />
                   : profile.price_position === "Below market" ? <ArrowDown className="w-3.5 h-3.5" />
                   : <Minus className="w-3.5 h-3.5" />}
                  {profile.price_position}
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{fmt(profile.your_price, currency)} vs {fmt(profile.market_avg, currency)} avg</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{pct(profile.pct_vs_avg)} vs market</p>
              </div>
            </div>

            {/* Free stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Your price",    value: fmt(profile.your_price, currency),  color: isDark ? "text-slate-200" : "text-slate-800" },
                { label: "Market avg",    value: fmt(profile.market_avg, currency),  color: isDark ? "text-sky-400" : "text-sky-600" },
                { label: "vs Market",     value: pct(profile.pct_vs_avg),            color: (profile.pct_vs_avg || 0) > 0 ? (isDark ? "text-purple-400" : "text-purple-600") : (isDark ? "text-amber-400" : "text-amber-600") },
                { label: "Action signal", value: (profile.recommended_action_teaser || "—").toUpperCase(), color: profile.recommended_action_teaser === "raise" ? (isDark ? "text-green-400" : "text-green-600") : profile.recommended_action_teaser === "lower" ? (isDark ? "text-red-400" : "text-red-600") : (isDark ? "text-slate-400" : "text-slate-600") },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Upgrade gate for free users */}
            {!isBasic && (
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <TierGate tier="basic" feature="Full Price Gap & Repricing Engine" isDark={isDark} />
                <div className="blur-sm pointer-events-none space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {["Confidence score", "Rec. price range", "Rating gap"].map((l) => (
                      <div key={l} className={`rounded-xl p-3 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-2xl font-black ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>—</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs — basic+ */}
            {isBasic && (
              <>
                <div className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className={`flex border-b overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    {([
                      { id: "reprice", label: "Reprice",         icon: <Target className="w-4 h-4" />,   min: "basic"   },
                      { id: "gap",     label: "Price gap",       icon: <BarChart2 className="w-4 h-4" />, min: "basic"   },
                      { id: "alerts",  label: "Competitor alerts", icon: <Bell className="w-4 h-4" />,    min: "premium" },
                    ] as const).map((tab) => {
                      const locked = tab.min === "premium" && !isPremium;
                      return (
                        <button key={tab.id}
                          onClick={() => locked ? router.push("/subscription") : setActiveTab(tab.id)}
                          className={`flex-1 min-w-[90px] py-3.5 px-3 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === tab.id
                              ? isDark ? "border-b-2 border-blue-500 text-blue-400 bg-blue-900/30" : "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50"
                              : isDark ? "text-slate-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-50"
                          }`}>
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                          {locked && <Lock className="w-3 h-3 text-amber-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {tabLoading && (
                  <div className="flex items-center justify-center h-40 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading…</p>
                  </div>
                )}

                {/* ── REPRICE TAB ── */}
                {activeTab === "reprice" && !tabLoading && reprice && (
                  <div className="space-y-4">
                    {/* Confidence + Rec */}
                    <div className={`rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <ConfidenceRing score={reprice.confidence_score} isDark={isDark} />
                      <div className="flex-1">
                        <p className={`text-xs uppercase tracking-wide font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Recommended action</p>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-black border-2 ${
                          reprice.recommended_action === "raise" ? (isDark ? "bg-green-900/30 border-green-800/50 text-green-400" : "bg-green-50 border-green-300 text-green-800")
                          : reprice.recommended_action === "lower" ? (isDark ? "bg-red-900/30 border-red-800/50 text-red-400" : "bg-red-50 border-red-300 text-red-800")
                          : (isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-300 text-slate-700")
                        }`}>
                          {reprice.recommended_action === "raise" ? <TrendingUp className="w-5 h-5" />
                           : reprice.recommended_action === "lower" ? <TrendingDown className="w-5 h-5" />
                           : <Minus className="w-5 h-5" />}
                          {reprice.recommended_action.toUpperCase()} PRICE
                        </div>
                        <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Recommended range: <span className={`font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{fmt(reprice.rec_price_low, currency)} – {fmt(reprice.rec_price_high, currency)}</span>
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Currently: {fmt(reprice.your_price, currency)}</p>
                      </div>
                    </div>

                    {/* Signal cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Price signal",    value: reprice.price_signal,    icon: <Target className="w-4 h-4" /> },
                        { label: "Rating signal",   value: reprice.rating_signal,   icon: <ShieldCheck className="w-4 h-4" /> },
                        { label: "Velocity signal", value: reprice.velocity_signal, icon: <Zap className="w-4 h-4" /> },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl border shadow-sm p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.icon}<span className="text-xs font-semibold">{s.label}</span></div>
                          <p className={`text-sm font-bold capitalize ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Alerts */}
                    {reprice.alerts?.length > 0 && (
                      <div className="space-y-2">
                        {reprice.alerts.map((a, i) => <AlertBox key={i} type={a.type} message={a.message} isDark={isDark} />)}
                      </div>
                    )}

                    {/* AI rationale — premium */}
                    <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      {!isPremium && <TierGate tier="premium" feature="AI Repricing Rationale" isDark={isDark} />}
                      <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI repricing rationale</span>
                          </div>
                          <div className="flex gap-2">
                            {repriceStream.text && (
                              <button onClick={repriceStream.reset} className={`text-xs hover:text-slate-600 ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>Clear</button>
                            )}
                            <button
                              onClick={() => repriceStream.start(`${API}/ai/reprice-advice`, { asin, seller_id: sellerId, user_id: userId, user_email: userEmail })}
                              disabled={repriceStream.streaming}
                              className={`flex items-center gap-2 px-4 py-2 text-white text-xs rounded-xl font-medium transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600' : 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400'}`}
                            >
                              {repriceStream.streaming ? <><RefreshCw className="w-3 h-3 animate-spin" /> Thinking…</> : "✦ Get AI advice"}
                            </button>
                          </div>
                        </div>
                        <div className="px-5 pb-5 pt-3">
                          {repriceStream.text || repriceStream.streaming || repriceStream.error
                            ? <StreamBox stream={repriceStream} isDark={isDark} />
                            : <div className={`rounded-xl p-5 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Click "Get AI advice" for a natural-language explanation of this recommendation</p>
                              </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PRICE GAP TAB ── */}
                {activeTab === "gap" && !tabLoading && priceGap && (
                  <div className="space-y-4">
                    {/* Stat row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Your price",    value: fmt(priceGap.your_price, priceGap.currency),   color: isDark ? "text-slate-200" : "text-slate-800" },
                        { label: "Market avg",    value: fmt(priceGap.market_avg, priceGap.currency),   color: isDark ? "text-sky-400" : "text-sky-600" },
                        { label: "Market low",    value: fmt(priceGap.market_min, priceGap.currency),   color: isDark ? "text-green-400" : "text-green-600" },
                        { label: "Market high",   value: fmt(priceGap.market_max, priceGap.currency),   color: isDark ? "text-purple-400" : "text-purple-600" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Rating + discount row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Your rating",        value: priceGap.your_rating ? `${priceGap.your_rating}★` : "—",      color: isDark ? "text-amber-400" : "text-amber-500" },
                        { label: "Market avg rating",  value: `${priceGap.market_avg_rating}★`,                              color: isDark ? "text-amber-300" : "text-amber-400" },
                        { label: "Rating gap",         value: pct(priceGap.rating_gap),                                      color: (priceGap.rating_gap || 0) >= 0 ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-600") },
                        { label: "Your MRP discount",  value: priceGap.your_mrp_discount_pct ? `${priceGap.your_mrp_discount_pct}%` : "—", color: isDark ? "text-slate-300" : "text-slate-700" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                          <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Price band chart */}
                    <Section title="Price band distribution" icon={BarChart2} defaultOpen={true} accent={isDark ? "bg-sky-900/30" : "bg-sky-50"} isDark={isDark}>
                      <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>How many competitors sit in each price band. Your band is highlighted.</p>
                      <div className="space-y-3">
                        {priceGap.price_bands.map((b, i) => {
                          const max = Math.max(...priceGap.price_bands.map((x) => x.count), 1);
                          return (
                            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${b.your_price_in_band ? (isDark ? "border-blue-800/50 bg-blue-900/30" : "border-blue-200 bg-blue-50") : (isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white")}`}>
                              <span className={`text-xs w-32 shrink-0 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {sym(priceGap.currency)}{b.band}
                              </span>
                              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${(b.count / max) * 100}%`, background: b.your_price_in_band ? "#3b82f6" : (isDark ? "#475569" : "#94a3b8") }}
                                />
                              </div>
                              <span className={`text-xs w-20 text-right shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{b.count} products</span>
                              {b.your_price_in_band && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-blue-600 bg-white border-blue-200'}`}>Your band</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Section>

                    {/* Competitor table */}
                    <Section title="Competitors in this category" icon={Target} count={priceGap.competitors.length} defaultOpen={false} accent={isDark ? "bg-purple-900/30" : "bg-purple-50"} isDark={isDark}>
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {priceGap.competitors.map((c, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${c.price_num === priceGap.your_price ? (isDark ? "bg-blue-900/30 border-blue-800/50" : "bg-blue-50 border-blue-200") : (isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}`}>
                            <span className={`text-xs w-4 shrink-0 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.product_title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.asin}</span>
                                {c.is_best_seller && <span className={`text-[9px] font-bold px-1 rounded ${isDark ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-50'}`}>BSR</span>}
                                {c.is_amazon_choice && <span className={`text-[9px] font-bold px-1 rounded ${isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-700 bg-amber-50'}`}>AC</span>}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{c.product_price}</p>
                              {c.rating && <p className="text-[10px] text-amber-500 font-bold">{c.rating}★</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                )}

                {/* ── ALERTS TAB ── */}
                {activeTab === "alerts" && (
                  <div className="relative overflow-hidden">
                    {!isPremium && (
                      <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <TierGate tier="premium" feature="Competitor Price Movement Alerts" isDark={isDark} />
                        <div className="blur-sm pointer-events-none space-y-3">
                          {["Competitor A", "Competitor B", "Competitor C"].map((n, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl ${isDark ? 'bg-red-900/30 border-red-800/50' : 'bg-red-50 border-red-100'}`}>
                              <span className={`text-xs font-mono font-bold flex-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{n}</span>
                              <span className={`text-xs font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>-12.5%</span>
                              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Undercuts you</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {isPremium && !tabLoading && alertData && (
                      <div className="space-y-4">
                        {/* Alert level banner */}
                        <AlertBox
                          type={alertData.alert_level === "critical" ? "danger" : alertData.alert_level === "warn" ? "warn" : "success"}
                          message={
                            alertData.alert_level === "critical"
                              ? `${alertData.undercuts_you} competitor${alertData.undercuts_you > 1 ? "s" : ""} are now priced below you — Buy Box risk.`
                              : alertData.alert_level === "warn"
                              ? `${alertData.price_movers} competitor${alertData.price_movers > 1 ? "s" : ""} moved their price recently. Review below.`
                              : "No significant competitor price movements detected."
                          }
                          isDark={isDark}
                        />

                        {/* Summary cards */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Total competitors", value: String(alertData.total_competitors), color: isDark ? "text-slate-200" : "text-slate-800" },
                            { label: "Price movers",      value: String(alertData.price_movers),      color: isDark ? "text-amber-400" : "text-amber-600" },
                            { label: "Undercutting you",  value: String(alertData.undercuts_you),     color: alertData.undercuts_you > 0 ? (isDark ? "text-red-400" : "text-red-600") : (isDark ? "text-green-400" : "text-green-600") },
                          ].map((s) => (
                            <div key={s.label} className={`rounded-2xl p-4 border shadow-sm text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Delta list */}
                        {alertData.deltas.length > 0 && (
                          <Section title="Price movements" icon={Bell} count={alertData.deltas.length} accent={isDark ? "bg-amber-900/30" : "bg-amber-50"} defaultOpen={true} isDark={isDark}>
                            <div className="space-y-2">
                              {alertData.deltas.map((d, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${d.new_price < alertData.your_price ? (isDark ? "bg-red-900/30 border-red-800/50" : "bg-red-50 border-red-200") : (isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}`}>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${d.direction === "down" ? (isDark ? "bg-red-900/50" : "bg-red-100") : (isDark ? "bg-green-900/50" : "bg-green-100")}`}>
                                    {d.direction === "down"
                                      ? <TrendingDown className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                      : <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                    }
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{d.seller_name}</p>
                                    <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d.updated_at?.split("T")[0]}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                      {fmt(d.old_price, currency)} → {fmt(d.new_price, currency)}
                                    </p>
                                    <p className={`text-xs font-black ${d.change_pct < 0 ? (isDark ? "text-red-400" : "text-red-600") : (isDark ? "text-green-400" : "text-green-600")}`}>
                                      {pct(d.change_pct)}
                                    </p>
                                  </div>
                                  {d.new_price < alertData.your_price && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isDark ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100'}`}>Undercuts you</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Section>
                        )}

                        {/* AI alert advice — premium SSE */}
                        {alertData.deltas.length > 0 && (
                          <div className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                  <Bot className="w-4 h-4 text-white" />
                                </div>
                                <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI alert analysis</span>
                              </div>
                              <div className="flex gap-2">
                                {alertStream.text && (
                                  <button onClick={alertStream.reset} className={`text-xs hover:text-slate-600 ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>Clear</button>
                                )}
                                <button
                                  onClick={() => alertStream.start(`${API}/ai/alert-advice`, { asin, seller_id: sellerId, user_id: userId, user_email: userEmail })}
                                  disabled={alertStream.streaming}
                                  className={`flex items-center gap-2 px-4 py-2 text-white text-xs rounded-xl font-medium transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600' : 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400'}`}
                                >
                                  {alertStream.streaming ? <><RefreshCw className="w-3 h-3 animate-spin" /> Thinking…</> : "✦ Analyse movements"}
                                </button>
                              </div>
                            </div>
                            <div className="px-5 pb-5 pt-3">
                              {alertStream.text || alertStream.streaming || alertStream.error
                                ? <StreamBox stream={alertStream} isDark={isDark} />
                                : <p className={`text-xs rounded-xl p-4 text-center border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                                    Click to get AI analysis of what these competitor price moves mean for you
                                  </p>
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Upgrade CTA */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-base">
                    {!isBasic ? "Unlock Full Price Intelligence" : "Unlock Competitor Alerts + AI Rationale"}
                  </p>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {!isBasic
                      ? "Get full price gap, repricing engine, confidence scores — Basic · ₹1,999/mo"
                      : "Detect competitor price drops in real time, AI explanation — Premium · ₹2,999/mo"}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {(!isBasic
                      ? ["Price gap", "Competitor table", "Repricing engine", "Confidence score"]
                      : ["Competitor alerts", "Undercut detection", "AI rationale", "Alert AI analysis"]
                    ).map((f) => (
                      <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                        <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => router.push("/subscription")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all shrink-0">
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