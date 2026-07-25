"use client";

import { useState, useEffect, Suspense } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Pin, PinOff, Package, RefreshCw, Menu,
  Star, Flame, ArrowUpRight, ArrowDownRight,
  Minus, Crown, Swords, AlertTriangle, Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE_URL = API_BASE_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────
function ThreatRing({ score, size = "sm", isDark }: { score: number; size?: "sm" | "md"; isDark: boolean }) {
  const dims = { sm: { w: 48, r: 18, sw: 5 }, md: { w: 64, r: 24, sw: 6 } };
  const d = dims[size];
  const circ = 2 * Math.PI * d.r;
  const offset = circ - (circ * score) / 10;
  const color =
    score >= 8 ? (isDark ? "#f87171" : "#ef4444") :
    score >= 6 ? (isDark ? "#fb923c" : "#f97316") :
    score >= 4 ? (isDark ? "#fbbf24" : "#f59e0b") : (isDark ? "#34d399" : "#10b981");

  return (
    <div className="relative flex-shrink-0" style={{ width: d.w, height: d.w }}>
      <svg width={d.w} height={d.w} className="-rotate-90" viewBox={`0 0 ${d.w} ${d.w}`}>
        <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke={isDark ? "#334155" : "#f1f5f9"} strokeWidth={d.sw} />
        <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke={color} strokeWidth={d.sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black tabular-nums text-xs" style={{ color }}>{score}</span>
        <span className={`text-[7px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/10</span>
      </div>
    </div>
  );
}

function PriceDelta({ pct, isDark }: { pct: number | null; isDark: boolean }) {
  const { t } = useTranslation();
  if (pct == null) return null;
  if (Math.abs(pct) < 1)
    return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-200'}`}><Minus className="w-2.5 h-2.5" /> {t('common.same', 'Same')}</span>;
  if (pct < 0)
    return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${isDark ? 'text-red-400 bg-red-900/30 border-red-800/50' : 'text-red-600 bg-red-50 border-red-200'}`}><ArrowDownRight className="w-2.5 h-2.5" /> {Math.abs(pct).toFixed(0)}% {t('common.cheaper', 'cheaper')}</span>;
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}><ArrowUpRight className="w-2.5 h-2.5" /> {pct.toFixed(0)}% {t('common.pricier', 'pricier')}</span>;
}

// ── Watchlist Card — same visual as CompetitorCard in competitor-analysis ─────
function WatchlistCard({
  item, onUnpin, unpinLoading, isDark
}: {
  item: any; onUnpin: () => void; unpinLoading: boolean; isDark: boolean;
}) {
  const { t } = useTranslation();
  const sym = item.currency === "INR" ? "₹" : "$";
  const isTopThreat = item.threat_score >= 8;

  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${
      isTopThreat
        ? isDark ? "border-red-900/50 bg-gradient-to-br from-red-900/20 to-orange-900/20 shadow-md" : "border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-md"
        : isDark ? "border-slate-800 bg-slate-900 shadow-sm" : "border-slate-100 bg-white shadow-sm"
    }`}>
      {isTopThreat && (
        <div className="absolute -top-2 left-4 flex items-center gap-1 bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
          <Flame className="w-2.5 h-2.5" /> {t('common.highThreat', 'HIGH THREAT')}
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className={`w-14 h-14 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          {item.photo
            ? <img src={item.photo} alt="" className="w-full h-full object-contain p-1" />
            : <Package className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold line-clamp-2 leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.title}</p>
              <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.competitor_asin}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Threat ring */}
              {item.threat_score != null && (
                <ThreatRing score={item.threat_score} size="sm" isDark={isDark} />
              )}
              {/* Unpin button */}
              <button
                onClick={onUnpin}
                disabled={unpinLoading}
                title={t('common.removeFromAudit', 'Remove from Listing Audit')}
                className={`p-1 rounded-lg transition-colors ${
                  unpinLoading
                    ? isDark ? "opacity-50 cursor-not-allowed bg-slate-800" : "opacity-50 cursor-not-allowed bg-slate-50"
                    : isDark ? "bg-violet-900/30 text-violet-400 hover:bg-red-900/50 hover:text-red-400" : "bg-violet-100 text-violet-600 hover:bg-red-100 hover:text-red-500"
                }`}
              >
                {unpinLoading
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <Pin className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.is_prime && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{t('common.prime', 'PRIME')}</span>
            )}
            {item.is_best_seller && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>{t('common.bestSeller', 'BEST SELLER')}</span>
            )}
            {item.is_amazon_choice && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>{t('common.asChoice', "A's CHOICE")}</span>
            )}
            {item.sales_volume && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>{item.sales_volume}</span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {item.price != null && (
              <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{sym}{Number(item.price).toFixed(2)}</span>
            )}
            {item.price_diff_pct != null && (
              <PriceDelta pct={item.price_diff_pct} isDark={isDark} />
            )}
            {item.rating != null && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {item.rating}
              </span>
            )}
            {item.num_ratings != null && (
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{Number(item.num_ratings).toLocaleString()} {t('common.reviews', 'reviews')}</span>
            )}
          </div>

          {/* Threat reason */}
          {item.threat_reason && (
            <p className={`text-[11px] mt-2 rounded-lg px-2.5 py-1.5 border ${isDark ? 'text-slate-400 bg-slate-800/50 border-slate-700' : 'text-slate-500 bg-white/60 border-slate-100'}`}>
              {item.threat_reason}
            </p>
          )}

          {/* Source ASIN context */}
          {item.source_asin && (
            <p className={`text-[10px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('sellerPages.trackedAgainst', 'Tracked against your ASIN')}: <span className="font-mono">{item.source_asin}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ListingAuditContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const sellerId = user?.seller_id || "";

  const [items, setItems]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [unpinLoading, setUnpinLoading] = useState<Set<string>>(new Set());
  const [error, setError]             = useState<string | null>(null);

  const tier      = user?.subscriptionTier || "free";
  const isPremium = tier === "premium" || tier === "enterprise";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load watchlist from Postgres ──────────────────────────────────────────
  const loadWatchlist = () => {
    if (!user?.email || !sellerId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (user?.email) params.append("user_email", user.email);
    if (sellerId)    params.append("seller_id", sellerId);

    fetch(`${BASE_URL}/api/watchlist?${params}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load watchlist");
        return r.json();
      })
      .then((d) => setItems(d?.watchlist || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWatchlist(); }, [user?.email, sellerId]);

  // ── Unpin (DELETE) ────────────────────────────────────────────────────────
  const handleUnpin = async (competitorAsin: string) => {
    // Optimistic remove
    setItems(prev => prev.filter(i => i.competitor_asin !== competitorAsin));
    setUnpinLoading(prev => new Set(prev).add(competitorAsin));

    try {
      const res = await fetch(`${BASE_URL}/api/watchlist`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email:      user?.email,
          seller_id:       sellerId,
          competitor_asin: competitorAsin,
        }),
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      // Revert if failed
      loadWatchlist();
    } finally {
      setUnpinLoading(prev => {
        const next = new Set(prev);
        next.delete(competitorAsin);
        return next;
      });
    }
  };

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-violet-900/50 to-indigo-900/50' : 'bg-gradient-to-br from-violet-100 to-indigo-100'}`}>
            <Pin className={`w-6 h-6 animate-pulse ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              {t('sellerPages.listingAuditTitle', 'Listing Audit')}
            </h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('sellerPages.listingAuditSubtitle', "Competitors you're tracking — pinned from Competitor Analysis.")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold ${
            tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" :
            tier === "basic"   ? isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" :
                                 isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
          }`}>
            {tier.toUpperCase()}
          </Badge>
          <button
            onClick={() => router.push("/seller/competitor-analysis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${isDark ? 'bg-sky-900/30 text-sky-400 border-sky-800/50 hover:bg-sky-900/50' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'}`}
          >
            <Swords className="w-3 h-3" /> Competitor Analysis
          </button>
        </div>
      </header>

      <main className="flex-1 py-6 space-y-5">

        {/* Non-premium gate */}
        {!isPremium && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-violet-900/30' : 'bg-violet-100'}`}>
              <Pin className={`w-8 h-8 ${isDark ? 'text-violet-400' : 'text-violet-400'}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Premium feature</p>
              <p className={`text-sm mt-1 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Listing Audit lets you pin and persistently track competitors across sessions. Available on Premium.
              </p>
            </div>
            <button
              onClick={() => router.push("/subscription")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all"
            >
              <Crown className="w-4 h-4" /> Upgrade to Premium
            </button>
          </div>
        )}

        {/* Loading */}
        {isPremium && loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading your tracked competitors…</p>
          </div>
        )}

        {/* Error */}
        {isPremium && !loading && sellerId && error && (
          <div className={`border rounded-2xl p-4 flex items-start gap-3 ${isDark ? 'bg-red-900/20 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-800'}`}>Failed to load watchlist</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
              <button onClick={loadWatchlist} className={`mt-2 text-xs font-bold underline ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Missing Seller ID State */}
        {isPremium && !loading && !sellerId && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
              <Store className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Connect your store</p>
              <p className={`text-sm mt-1 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                A seller ID is required to use the Listing Audit. Please link your store on the Dashboard.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Empty state */}
        {isPremium && !loading && sellerId && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <PinOff className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{t('sellerPages.listingAuditNoRivals', 'No rivals tracked yet')}</p>
              <p className={`text-sm mt-1 max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                {t('sellerPages.listingAuditGoTo', 'Go to Competitor Analysis and click the 📌 pin icon on any competitor card to start tracking them here.')}
              </p>
            </div>
            <button
              onClick={() => router.push("/seller/competitor-analysis")}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              <Swords className="w-4 h-4" /> {t('sellerPages.goToCompetitorAnalysis', 'Go to Competitor Analysis')}
            </button>
          </div>
        )}

        {/* Watchlist cards */}
        {isPremium && !loading && !error && items.length > 0 && (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Rivals Tracked</p>
                <p className={`text-2xl font-black ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{items.length}</p>
              </div>
              <div className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>High Threat (≥8)</p>
                <p className={`text-2xl font-black ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                  {items.filter(i => (i.threat_score || 0) >= 8).length}
                </p>
              </div>
              <div className={`rounded-2xl p-4 border shadow-sm col-span-2 sm:col-span-1 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Cheaper Than You</p>
                <p className={`text-2xl font-black ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                  {items.filter(i => (i.price_diff_pct || 0) < -1).length}
                </p>
              </div>
            </div>

            {/* Cards list */}
            <div className="space-y-3">
              {/* Sort: high threat first */}
              {[...items]
                .sort((a, b) => (b.threat_score || 0) - (a.threat_score || 0))
                .map((item) => (
                  <WatchlistCard
                    key={item.competitor_asin}
                    item={item}
                    onUnpin={() => handleUnpin(item.competitor_asin)}
                    unpinLoading={unpinLoading.has(item.competitor_asin)}
                    isDark={isDark}
                  />
                ))
              }
            </div>

            {/* Bottom action */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => router.push("/seller/competitor-analysis")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Swords className="w-4 h-4" /> Back to Competitor Analysis
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ListingAuditPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    }>
      <ListingAuditContent />
    </Suspense>
  );
}