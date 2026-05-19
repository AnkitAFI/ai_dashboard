// import FeatureComingSoon from "@/components/dashboard/feature-coming-soon";

// export default function Page() {
//   return <FeatureComingSoon />;
// }




"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  Pin, PinOff, Package, RefreshCw, Menu,
  Star, Flame, ArrowUpRight, ArrowDownRight,
  Minus, Crown, Swords, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

// ── Helpers ───────────────────────────────────────────────────────────────────
function ThreatRing({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const dims = { sm: { w: 48, r: 18, sw: 5 }, md: { w: 64, r: 24, sw: 6 } };
  const d = dims[size];
  const circ = 2 * Math.PI * d.r;
  const offset = circ - (circ * score) / 10;
  const color =
    score >= 8 ? "#ef4444" :
    score >= 6 ? "#f97316" :
    score >= 4 ? "#f59e0b" : "#10b981";

  return (
    <div className="relative flex-shrink-0" style={{ width: d.w, height: d.w }}>
      <svg width={d.w} height={d.w} className="-rotate-90" viewBox={`0 0 ${d.w} ${d.w}`}>
        <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke="#f1f5f9" strokeWidth={d.sw} />
        <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke={color} strokeWidth={d.sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black tabular-nums text-xs" style={{ color }}>{score}</span>
        <span className="text-[7px] text-slate-400">/10</span>
      </div>
    </div>
  );
}

function PriceDelta({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  if (Math.abs(pct) < 1)
    return <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Minus className="w-2.5 h-2.5" /> Same</span>;
  if (pct < 0)
    return <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ArrowDownRight className="w-2.5 h-2.5" /> {Math.abs(pct).toFixed(0)}% cheaper</span>;
  return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" /> {pct.toFixed(0)}% pricier</span>;
}

// ── Watchlist Card — same visual as CompetitorCard in competitor-analysis ─────
function WatchlistCard({
  item, onUnpin, unpinLoading,
}: {
  item: any; onUnpin: () => void; unpinLoading: boolean;
}) {
  const sym = item.currency === "INR" ? "₹" : "$";
  const isTopThreat = item.threat_score >= 8;

  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${
      isTopThreat
        ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-md"
        : "border-slate-100 bg-white shadow-sm"
    }`}>
      {isTopThreat && (
        <div className="absolute -top-2 left-4 flex items-center gap-1 bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
          <Flame className="w-2.5 h-2.5" /> HIGH THREAT
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {item.photo
            ? <img src={item.photo} alt="" className="w-full h-full object-contain p-1" />
            : <Package className="w-6 h-6 text-slate-300" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{item.title}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.competitor_asin}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Threat ring */}
              {item.threat_score != null && (
                <ThreatRing score={item.threat_score} size="sm" />
              )}
              {/* Unpin button */}
              <button
                onClick={onUnpin}
                disabled={unpinLoading}
                title="Remove from Listing Audit"
                className={`p-1 rounded-lg transition-colors ${
                  unpinLoading
                    ? "opacity-50 cursor-not-allowed bg-slate-50"
                    : "bg-violet-100 text-violet-600 hover:bg-red-100 hover:text-red-500"
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
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">PRIME</span>
            )}
            {item.is_best_seller && (
              <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded">BEST SELLER</span>
            )}
            {item.is_amazon_choice && (
              <span className="text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-200 px-1.5 py-0.5 rounded">A's CHOICE</span>
            )}
            {item.sales_volume && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{item.sales_volume}</span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {item.price != null && (
              <span className="text-sm font-black text-slate-800">{sym}{Number(item.price).toFixed(2)}</span>
            )}
            {item.price_diff_pct != null && (
              <PriceDelta pct={item.price_diff_pct} />
            )}
            {item.rating != null && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {item.rating}
              </span>
            )}
            {item.num_ratings != null && (
              <span className="text-[10px] text-slate-400">{Number(item.num_ratings).toLocaleString()} reviews</span>
            )}
          </div>

          {/* Threat reason */}
          {item.threat_reason && (
            <p className="text-[11px] text-slate-500 mt-2 bg-white/60 rounded-lg px-2.5 py-1.5 border border-slate-100">
              {item.threat_reason}
            </p>
          )}

          {/* Source ASIN context */}
          {item.source_asin && (
            <p className="text-[10px] text-slate-400 mt-1.5">
              Tracked against your ASIN: <span className="font-mono">{item.source_asin}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ListingAuditContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();

  const sellerId = user?.seller_id || "";

  const [items, setItems]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [unpinLoading, setUnpinLoading] = useState<Set<string>>(new Set());
  const [error, setError]             = useState<string | null>(null);

  const tier      = user?.subscriptionTier || "free";
  const isPremium = tier === "premium";

  // ── Load watchlist from Postgres ──────────────────────────────────────────
  const loadWatchlist = () => {
    if (!user?.email && !sellerId) { setLoading(false); return; }
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

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
            <Menu className="w-5 h-5 text-sky-900" />
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
              <Pin className="w-5 h-5 text-violet-600" /> Listing Audit
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Competitors you're tracking — pinned from Competitor Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold ${
            tier === "premium" ? "bg-blue-100 text-blue-700" :
            tier === "basic"   ? "bg-amber-100 text-amber-700" :
                                 "bg-slate-100 text-slate-600"
          }`}>
            {tier.toUpperCase()}
          </Badge>
          <button
            onClick={() => router.push("/seller/competitor-analysis")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 hover:bg-sky-100 transition-all"
          >
            <Swords className="w-3 h-3" /> Competitor Analysis
          </button>
        </div>
      </header>

      <main className="flex-1 py-6 space-y-5">

        {/* Non-premium gate */}
        {!isPremium && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
              <Pin className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">Premium feature</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
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
            <p className="text-slate-600 font-semibold">Loading your tracked competitors…</p>
          </div>
        )}

        {/* Error */}
        {isPremium && !loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Failed to load watchlist</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
              <button onClick={loadWatchlist} className="mt-2 text-xs font-bold text-red-600 underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isPremium && !loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <PinOff className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">No rivals tracked yet</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                Go to Competitor Analysis and click the 📌 pin icon on any competitor card to start tracking them here.
              </p>
            </div>
            <button
              onClick={() => router.push("/seller/competitor-analysis")}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors"
            >
              <Swords className="w-4 h-4" /> Go to Competitor Analysis
            </button>
          </div>
        )}

        {/* Watchlist cards */}
        {isPremium && !loading && !error && items.length > 0 && (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-medium mb-1">Rivals Tracked</p>
                <p className="text-2xl font-black text-violet-600">{items.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-medium mb-1">High Threat (≥8)</p>
                <p className="text-2xl font-black text-red-500">
                  {items.filter(i => (i.threat_score || 0) >= 8).length}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-400 font-medium mb-1">Cheaper Than You</p>
                <p className="text-2xl font-black text-amber-500">
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
                  />
                ))
              }
            </div>

            {/* Bottom action */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => router.push("/seller/competitor-analysis")}
                className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors"
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