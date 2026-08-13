"use client";

import { API_BASE_URL } from "@/lib/config";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSessionState } from "@/hooks/use-session-state";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useSelectedProduct } from "@/lib/selected-product-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import ProductSwitcherPanel from "@/components/dashboard/product-switcher-panel";
import {
  Lock, Crown, RefreshCw, Menu, Package,
  AlertTriangle, Shield, ShieldAlert, ShieldOff,
  Star, Zap, Target, ChevronDown, ChevronUp,
  Eye, TrendingDown, TrendingUp, Users, Swords,
  Bell, BellOff, Pin, PinOff, Flame, Trophy,
  BarChart2, Activity, Radar, Clock, ArrowUpRight,
  ArrowDownRight, Minus, Info, Sparkles, CheckCircle,
  Badge as BadgeIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";

const BASE_URL = API_BASE_URL;

// ── Tier Gate ─────────────────────────────────────────────────────────────────
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

// ── Expandable Section ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true, count, accent, isDark }: any) {
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

// ── Threat Score Ring ─────────────────────────────────────────────────────────
function ThreatRing({ score, size = "md", isDark }: { score: number; size?: "sm" | "md" | "lg"; isDark: boolean }) {
  const dims = { sm: { w: 48, r: 18, sw: 5 }, md: { w: 64, r: 24, sw: 6 }, lg: { w: 80, r: 32, sw: 7 } };
  const d = dims[size];
  const circ = 2 * Math.PI * d.r;
  const offset = circ - (circ * score) / 10;
  const color =
    score >= 8 ? (isDark ? "#f87171" : "#ef4444") :
    score >= 6 ? (isDark ? "#fb923c" : "#f97316") :
    score >= 4 ? (isDark ? "#fbbf24" : "#f59e0b") : (isDark ? "#34d399" : "#10b981");
  const label =
    score >= 8 ? "Critical" :
    score >= 6 ? "High" :
    score >= 4 ? "Medium" : "Low";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: d.w, height: d.w }}>
        <svg width={d.w} height={d.w} className="-rotate-90" viewBox={`0 0 ${d.w} ${d.w}`}>
          <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke={isDark ? "#334155" : "#f1f5f9"} strokeWidth={d.sw} />
          <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke={color} strokeWidth={d.sw}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black tabular-nums ${isDark ? 'text-slate-200' : ''}`} style={{ fontSize: size === "sm" ? 12 : size === "md" ? 16 : 20, color }}>{score}</span>
          {size !== "sm" && <span className={`text-[8px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/10</span>}
        </div>
      </div>
      {size !== "sm" && <span className="text-[10px] font-bold" style={{ color }}>{label}</span>}
    </div>
  );
}

// ── Buy Box Risk Badge ────────────────────────────────────────────────────────
function BuyBoxBadge({ level, isDark, isPrivateLabel }: { level: "Safe" | "Watch" | "At Risk"; isDark: boolean; isPrivateLabel?: boolean }) {
  const styles = {
    "Safe":    { cls: isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Shield },
    "Watch":   { cls: isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-700 border-amber-200",       icon: ShieldAlert },
    "At Risk": { cls: isDark ? "bg-red-900/30 text-red-400 border-red-800/50" : "bg-red-50 text-red-700 border-red-200",             icon: ShieldOff },
  };
  const s = styles[level] || styles["Safe"];
  const Icon = s.icon;
  const displayText = isPrivateLabel ? "Sole Seller / Safe" : level;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${s.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {displayText}
    </span>
  );
}

// ── Platform Badge ────────────────────────────────────────────────────────────
function PlatformBadges({ isPrime, isBestSeller, isAmazonChoice, isDark }: {
  isPrime?: boolean; isBestSeller?: boolean; isAmazonChoice?: boolean; isDark: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {isPrime && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>PRIME</span>
      )}
      {isBestSeller && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>BEST SELLER</span>
      )}
      {isAmazonChoice && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>A's CHOICE</span>
      )}
    </div>
  );
}

// ── Price Delta Pill ──────────────────────────────────────────────────────────
function PriceDelta({ pct, isDark }: { pct: number | null; isDark: boolean }) {
  if (pct == null) return null;
  if (Math.abs(pct) < 1) return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-200'}`}><Minus className="w-2.5 h-2.5" /> Same</span>;
  if (pct < 0)
    return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${isDark ? 'text-red-400 bg-red-900/30 border-red-800/50' : 'text-red-600 bg-red-50 border-red-200'}`}><ArrowDownRight className="w-2.5 h-2.5" /> {Math.abs(pct).toFixed(0)}% cheaper</span>;
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}><ArrowUpRight className="w-2.5 h-2.5" /> {pct.toFixed(0)}% pricier</span>;
}

// ── Competitor Identity Card ──────────────────────────────────────────────────
function CompetitorCard({
  comp, isTopThreat, isPinned, onPin, showThreat, currency, pinLoading, isDark
}: {
  comp: any; isTopThreat?: boolean; isPinned?: boolean;
  onPin?: () => void; showThreat?: boolean; currency?: string; pinLoading?: boolean; isDark: boolean;
}) {
  const sym = currency === "INR" ? "₹" : "$";
  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${
      isTopThreat
        ? isDark ? "border-red-900/50 bg-gradient-to-br from-red-900/20 to-orange-900/20 shadow-md" : "border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-md"
        : isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
    }`}>
      {isTopThreat && (
        <div className="absolute -top-2 left-4 flex items-center gap-1 bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
          <Flame className="w-2.5 h-2.5" /> #1 THREAT
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className={`w-14 h-14 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          {comp.photo
            ? <img src={comp.photo} alt="" className="w-full h-full object-contain p-1" />
            : <Package className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold line-clamp-2 leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{comp.title}</p>
              <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{comp.asin}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {showThreat && comp.threat_score != null && (
                <ThreatRing score={comp.threat_score} size="sm" isDark={isDark} />
              )}
              {onPin && (
                <button
                  onClick={onPin}
                  disabled={pinLoading}
                  className={`p-1 rounded-lg transition-colors ${
                    pinLoading ? "opacity-50 cursor-not-allowed" :
                    isPinned ? isDark ? "bg-violet-900/30 text-violet-400" : "bg-violet-100 text-violet-600" : isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                  title={isPinned ? "Remove from Listing Audit" : "Add to Listing Audit"}
                >
                  {pinLoading
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />
                  }
                </button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <PlatformBadges isPrime={comp.is_prime} isBestSeller={comp.is_best_seller} isAmazonChoice={comp.is_amazon_choice} isDark={isDark} />
            {comp.sales_volume && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>{comp.sales_volume}</span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {comp.price != null && (
              <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{sym}{comp.price.toFixed(2)}</span>
            )}
            {comp.price_diff_pct != null && (
              <PriceDelta pct={comp.price_diff_pct} isDark={isDark} />
            )}
            {comp.rating != null && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {comp.rating}
              </span>
            )}
            {comp.num_ratings != null && (
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{comp.num_ratings.toLocaleString()} reviews</span>
            )}
          </div>

          {/* Threat breakdown */}
          {showThreat && comp.threat_reason && (
            <p className={`text-[11px] mt-2 rounded-lg px-2.5 py-1.5 border ${isDark ? 'text-slate-400 bg-slate-800/50 border-slate-700' : 'text-slate-500 bg-white/60 border-slate-100'}`}>
              {comp.threat_reason}
            </p>
          )}

          {/* Pin hint */}
          {isPinned && (
            <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>
              <Pin className="w-2.5 h-2.5" /> Saved to Listing Audit
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Buy Box Panel ─────────────────────────────────────────────────────────────
function BuyBoxPanel({ data, isBasic, currency, isDark }: { data: any; isBasic: boolean; currency: string; isDark: boolean }) {
  const sym = currency === "INR" ? "₹" : "$";
  const riskLevel = data.buy_box_risk_level as "Safe" | "Watch" | "At Risk";
  const numOffers = data.num_offers ?? 1;
  const isPrivateLabel = numOffers === 1 && riskLevel === "Safe";

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <ShieldAlert className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
        </div>
        <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Buy Box Intelligence</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto border ${isDark ? 'text-red-400 bg-red-900/30 border-red-800/50' : 'text-red-500 bg-red-50 border-red-200'}`}>UNIQUE TO THIS PAGE</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Buy Box Status</p>
          <BuyBoxBadge level={riskLevel} isDark={isDark} isPrivateLabel={isPrivateLabel} />
        </div>
        <div className="flex flex-col gap-1">
          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Offers on Listing</p>
          <span className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {numOffers}
            {numOffers > 1 && (
              <span className={`text-xs font-normal ml-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>⚠ Shared listing</span>
            )}
          </span>
        </div>

        {isBasic ? (
          <>
            {data.min_offer_price != null && (
              <div className="flex flex-col gap-1">
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Lowest Offer Price</p>
                <span className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {sym}{data.min_offer_price.toFixed(2)}
                  {data.undercut_amount != null && data.undercut_amount > 0 && (
                    <span className={`text-xs font-bold ml-1.5 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                      You're undercut by {sym}{data.undercut_amount.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
            )}
            {data.sellers_undercutting != null && (
              <div className="flex flex-col gap-1">
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Sellers Undercutting You</p>
                <span className={`text-lg font-black ${isDark ? 'text-red-400' : 'text-red-500'}`}>{data.sellers_undercutting}</span>
              </div>
            )}
          </>
        ) : (
          <div className="relative flex flex-col gap-1 flex-1">
            <div className="blur-sm pointer-events-none">
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Lowest Offer Price</p>
              <span className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>$00.00 — 0 undercutting</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>Unlock with Basic</span>
            </div>
          </div>
        )}
      </div>

      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Risk Level</span>
          <BuyBoxBadge level={riskLevel} isDark={isDark} isPrivateLabel={isPrivateLabel} />
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="h-full rounded-full transition-all duration-700" style={{
            width: riskLevel === "At Risk" ? "90%" : riskLevel === "Watch" ? "50%" : "15%",
            background: riskLevel === "At Risk" ? (isDark ? "#f87171" : "#ef4444") : riskLevel === "Watch" ? (isDark ? "#fbbf24" : "#f59e0b") : (isDark ? "#34d399" : "#10b981"),
          }} />
        </div>
        <p className={`text-[10px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {riskLevel === "At Risk" && "Someone is actively undercutting you on your own listing."}
          {riskLevel === "Watch" && "Multiple sellers on your listing — monitor pricing closely."}
          {riskLevel === "Safe" && isPrivateLabel && "You are the only seller on this listing. As a private label brand, your Buy Box is secure."}
          {riskLevel === "Safe" && !isPrivateLabel && "You hold the Buy Box. No undercutting detected."}
        </p>
      </div>
    </div>
  );
}

// ── Change Feed Item ──────────────────────────────────────────────────────────
function ChangeFeedItem({ change, isDark }: { change: any; isDark: boolean }) {
  const iconMap: Record<string, any> = {
    price_drop:     { icon: TrendingDown, cls: isDark ? "text-red-400 bg-red-900/30" : "text-red-500 bg-red-50" },
    price_increase: { icon: TrendingUp,   cls: isDark ? "text-emerald-400 bg-emerald-900/30" : "text-emerald-500 bg-emerald-50" },
    badge_gained:   { icon: Trophy,       cls: isDark ? "text-orange-400 bg-orange-900/30" : "text-orange-500 bg-orange-50" },
    badge_lost:     { icon: BellOff,      cls: isDark ? "text-slate-400 bg-slate-800" : "text-slate-500 bg-slate-50" },
    rating_change:  { icon: Star,         cls: isDark ? "text-amber-400 bg-amber-900/30" : "text-amber-500 bg-amber-50" },
    default:        { icon: Activity,     cls: isDark ? "text-blue-400 bg-blue-900/30" : "text-blue-500 bg-blue-50" },
  };
  const meta = iconMap[change.type] || iconMap.default;
  const Icon = meta.icon;

  return (
    <div className={`flex items-start gap-3 py-2.5 border-b last:border-0 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.cls}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{change.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{change.asin}</span>
          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{change.date}</span>
        </div>
      </div>
    </div>
  );
}

// ── Market Gap Row ────────────────────────────────────────────────────────────
function MarketGapRow({ gap, currency, isDark }: { gap: any; currency: string; isDark: boolean }) {
  const sym = currency === "INR" ? "₹" : "$";
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl ${isDark ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{sym}{gap.price_lo}–{sym}{gap.price_hi} band</p>
        <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          {gap.demand_label === "Unknown" ? "" : `${gap.demand_label} demand · `}
          {gap.competitor_count} rival{gap.competitor_count !== 1 ? "s" : ""}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-700 bg-emerald-100 border-emerald-200'}`}>
        Launch opportunity
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function CompetitorAnalysisContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { selected } = useSelectedProduct();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const asin     = searchParams.get("asin")      || selected?.asin     || "";
  const sellerId = searchParams.get("seller_id") || selected?.sellerId || user?.seller_id || "";

  const [data, setData]           = useSessionState<any>("seller_comp_analysis_data", null);
  const [lastFetchedAsin, setLastFetchedAsin] = useSessionState<string>("seller_comp_analysis_asin", "");
  const [loading, setLoading]     = useState(false);
  const [pinned, setPinned]       = useState<Set<string>>(new Set());
  const [pinLoading, setPinLoading] = useState<Set<string>>(new Set());

  const tier      = data?.tier || user?.subscriptionTier || "free";
  const isBasic   = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium = tier === "premium" || tier === "enterprise";
  const currency  = data?.currency || "USD";
  const sym       = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch competitor data ─────────────────────────────────────────────────
  useEffect(() => {
    if (!asin || !sellerId) return;
    if (data && lastFetchedAsin === asin) return; // Already have data for this ASIN

    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    fetch(`${BASE_URL}/api/comparison/competitors?${params}`, { credentials: "include" })
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

  // ── Load persisted pins from Postgres on mount ────────────────────────────
  useEffect(() => {
    if (!user?.email || !sellerId) return;
    const params = new URLSearchParams();
    if (user?.email) params.append("user_email", user.email);
    if (sellerId)    params.append("seller_id", sellerId);

    fetch(`${BASE_URL}/api/watchlist?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.watchlist) {
          setPinned(new Set(d.watchlist.map((w: any) => w.competitor_asin)));
        }
      })
      .catch(console.error);
  }, [user?.email, sellerId]);

  // ── Toggle pin → save / delete in Postgres ────────────────────────────────
  const togglePin = async (competitorAsin: string, competitorData: any) => {
    if (!isPremium) return;

    const alreadyPinned = pinned.has(competitorAsin);
    setPinned(prev => {
      const next = new Set(prev);
      alreadyPinned ? next.delete(competitorAsin) : next.add(competitorAsin);
      return next;
    });

    setPinLoading(prev => new Set(prev).add(competitorAsin));

    try {
      if (alreadyPinned) {
        await fetch(`${BASE_URL}/api/watchlist`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email:       user?.email,
            seller_id:        sellerId,
            competitor_asin:  competitorAsin,
          }),
        });
      } else {
        await fetch(`${BASE_URL}/api/watchlist`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email:       user?.email,
            seller_id:        sellerId,
            source_asin:      asin,
            competitor_asin:  competitorAsin,
            title:            competitorData.title,
            photo:            competitorData.photo,
            price:            competitorData.price,
            rating:           competitorData.rating,
            num_ratings:      competitorData.num_ratings,
            threat_score:     competitorData.threat_score,
            threat_reason:    competitorData.threat_reason,
            is_prime:         competitorData.is_prime,
            is_best_seller:   competitorData.is_best_seller,
            is_amazon_choice: competitorData.is_amazon_choice,
            sales_volume:     competitorData.sales_volume,
            price_diff_pct:   competitorData.price_diff_pct,
          }),
        });
      }
    } catch (err) {
      console.error("Watchlist save error:", err);
      setPinned(prev => {
        const next = new Set(prev);
        alreadyPinned ? next.add(competitorAsin) : next.delete(competitorAsin);
        return next;
      });
    } finally {
      setPinLoading(prev => {
        const next = new Set(prev);
        next.delete(competitorAsin);
        return next;
      });
    }
  };

  const competitors     = data?.competitors      || [];
  const topThreat       = data?.top_threat       || null;
  const buyBox          = data?.buy_box          || {};
  const changeFeed      = data?.change_feed      || [];
  const marketGaps      = data?.market_gaps      || [];
  const sellerHealth    = data?.seller_health    || {};
  const aiWeeklySummary = data?.ai_weekly_summary|| null;
  const portfolioRisk   = data?.portfolio_threat || [];

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
            <Swords className={`w-6 h-6 animate-pulse ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              {t('sellerPages.compAnalysisTitle', 'Competitor Analysis')}
            </h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('sellerPages.compAnalysisSubtitle', 'Identity, threat score, and Buy Box intelligence for every rival.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : tier === "premium" ? isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" : tier === "basic" ? isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
            {tier.toUpperCase()}
          </Badge>
          {isPremium && pinned.size > 0 && (
            <button
              onClick={() => router.push("/seller/listing-audit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${isDark ? 'bg-violet-900/30 text-violet-400 border-violet-800/50 hover:bg-violet-900/50' : 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200'}`}
            >
              <Pin className="w-3 h-3" /> {pinned.size} in Listing Audit
            </button>
          )}
          {!isPremium && (
            <button onClick={() => router.push("/subscription")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
              <Crown className="w-3 h-3" /> Upgrade
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start flex-1 min-h-0">
        <div className="hidden lg:block sticky top-6 self-start z-10">
          <ProductSwitcherPanel currentAsin={asin} sellerId={sellerId} />
        </div>

        <main className="flex-1 min-w-0 space-y-5">
        {/* No product selected */}
        {!asin && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-sky-900/30' : 'bg-sky-100'}`}>
              <Swords className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{t('sellerPages.noProductSelected', 'No product selected')}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t('sellerPages.compAnalysisSub', 'Select a product from My Products to analyse its competitors.')}</p>
            </div>
            <button onClick={() => router.push("/seller/my-products")}
              className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
              {t('sellerPages.goToMyProducts', 'Go to My Products')}
            </button>
          </div>
        )}

        {/* Loading */}
        {asin && loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Scanning your competitive landscape…</p>
            <p className={`text-xs animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>We are analyzing the data. This may take 1–2 minutes.</p>
          </div>
        )}

        {asin && !loading && data && (
          <>
            {/* Product card */}
            <div className={`rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                {data.product_photo
                  ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" />
                  : <Package className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{data.product_title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.asin}</span>
                  <PlatformBadges isPrime={data.is_prime} isBestSeller={data.is_best_seller} isAmazonChoice={data.is_amazon_choice} isDark={isDark} />
                  {data.sales_volume && (
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {data.sales_volume}
                    </span>
                  )}
                  {data.seller_rating && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                      Seller ★ {data.seller_rating}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-3xl font-black text-sky-600">{data.competitor_count ?? competitors.length}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>rivals in your space</p>
                {!isBasic && (
                  <button onClick={() => router.push("/subscription")}
                    className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border transition-colors ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50 hover:bg-amber-900/50' : 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'}`}>
                    See full list →
                  </button>
                )}
              </div>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Your Price",
                  value: data.current_price ? `${sym}${data.current_price.toFixed(2)}` : "—",
                  sub: data.price_position || "vs market",
                  color: isDark ? "text-slate-200" : "text-slate-800",
                  tip: "Your current selling price on Amazon as seen by buyers right now.",
                },
                {
                  label: "Top Threat Score",
                  value: topThreat ? `${topThreat.threat_score}/10` : "—",
                  sub: topThreat?.title ? topThreat.title.slice(0, 22) + "…" : "No threats detected",
                  color: topThreat?.threat_score >= 7 ? (isDark ? "text-red-400" : "text-red-500") : (isDark ? "text-amber-400" : "text-amber-500"),
                  tip: "A score from 1–10 showing how dangerous your biggest competitor is. Score 7+ means they are undercutting your price, have more reviews, AND a Prime badge.",
                },
                {
                  label: "Buy Box Risk",
                  value: buyBox.buy_box_risk_level || "—",
                  sub: buyBox.num_offers > 1 ? `${buyBox.num_offers} sellers on listing` : "You own the Buy Box",
                  color: buyBox.buy_box_risk_level === "At Risk" ? (isDark ? "text-red-400" : "text-red-500") : buyBox.buy_box_risk_level === "Watch" ? (isDark ? "text-amber-400" : "text-amber-500") : (isDark ? "text-emerald-400" : "text-emerald-600"),
                  tip: buyBox.buy_box_risk_level === "At Risk" 
                    ? "At Risk: Another seller on your exact ASIN is offering a better price and stealing your 'Add to Cart' sales."
                    : buyBox.buy_box_risk_level === "Watch"
                    ? "Watch: Another seller has joined your exact ASIN. Keep your price low so they don't steal your 'Add to Cart' button."
                    : "Safe: You are the only seller on this exact ASIN, so nobody can steal your 'Add to Cart' button (even if other brands are cheaper).",
                },
                {
                  label: "Rivals Tracked",
                  value: String(competitors.length || "—"),
                  sub: isPremium ? `${pinned.size} saved to audit` : "Upgrade to pin rivals",
                  color: isDark ? "text-sky-400" : "text-sky-600",
                  tip: "The total number of similar competing products our system has detected in your category for this product.",
                },
              ].map((s: any) => (
                <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className={`text-xs font-medium mb-1 flex items-center ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    {s.label}<InfoTip text={s.tip} isDark={isDark} />
                  </div>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Buy Box Intelligence */}
            <BuyBoxPanel data={{ ...buyBox, ...data }} isBasic={isBasic} currency={currency} isDark={isDark} />

            {/* FREE TIER GATE: full competitor list */}
            {!isBasic ? (
              <div className={`relative rounded-2xl border shadow-sm p-5 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <TierGate tier="basic" feature="Competitor Threat Scores & Full Identity Cards" isDark={isDark} />
                <div className="blur-sm pointer-events-none space-y-3">
                  {[
                    { asin: "B0XXXXX1", title: "Competitor Alpha Pro 256GB High Speed Card Class 10", price: 19.99, rating: 4.8, is_prime: true, is_best_seller: true },
                    { asin: "B0XXXXX2", title: "RivalBrand Ultra SDXC Memory Card U3 V30 4K UHD", price: 21.49, rating: 4.6, is_prime: true },
                    { asin: "B0XXXXX3", title: "SpeedMax Professional Memory Card A2 U3 Class 10", price: 18.79, rating: 4.5 },
                  ].map((c, i) => (
                    <CompetitorCard key={i} comp={{ ...c, threat_score: 8 - i * 2, threat_reason: "Priced lower, Prime badge, more reviews", photo: null }} isTopThreat={i === 0} showThreat currency={currency} isDark={isDark} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Top threat highlight */}
                {topThreat && (
                  <div className="space-y-2">
                    <p className={`text-xs font-bold uppercase tracking-wide px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>⚠ Your #1 Threat Right Now</p>
                    <CompetitorCard
                      comp={topThreat}
                      isTopThreat
                      showThreat
                      isPinned={pinned.has(topThreat.asin)}
                      pinLoading={pinLoading.has(topThreat.asin)}
                      onPin={isPremium ? () => togglePin(topThreat.asin, topThreat) : undefined}
                      currency={currency}
                      isDark={isDark}
                    />
                  </div>
                )}

                {/* All competitors */}
                <Section title="All Competitors" icon={Users} count={competitors.length} accent={isDark ? "bg-sky-900/30" : "bg-sky-50"} defaultOpen={true} isDark={isDark}>
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    Ranked by threat score.{isPremium ? " Pin rivals with the 📌 icon to track them in Listing Audit." : ""}
                  </p>
                  <div className="space-y-3">
                    {competitors.map((comp: any, i: number) => (
                      <CompetitorCard
                        key={`${comp.asin}-${i}`}
                        comp={comp}
                        showThreat
                        isPinned={pinned.has(comp.asin)}
                        pinLoading={pinLoading.has(comp.asin)}
                        onPin={isPremium ? () => togglePin(comp.asin, comp) : undefined}
                        currency={currency}
                        isDark={isDark}
                      />
                    ))}
                    {competitors.length === 0 && (
                      <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No comparable competitors found in your price range.</p>
                    )}
                  </div>
                </Section>
              </>
            )}

            {/* Change Feed — Premium */}
            <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {!isPremium && <TierGate tier="premium" feature="Competitor Change Feed & Timeline" isDark={isDark} />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                    <Activity className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Competitor Change Feed</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto border ${isDark ? 'text-amber-400 bg-amber-900/30 border-amber-800/50' : 'text-amber-500 bg-amber-50 border-amber-200'}`}>TIME-AWARE</span>
                </div>
                <div className="px-5 pb-5 pt-3">
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>What changed since last week — price drops, badge gains, rating shifts.</p>
                  {changeFeed.length > 0 ? (
                    <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                      {changeFeed.map((change: any, i: number) => (
                        <ChangeFeedItem key={i} change={change} isDark={isDark} />
                      ))}
                    </div>
                  ) : isPremium ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <Clock className={`w-7 h-7 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No changes detected since last update.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {[
                        { icon: TrendingDown, text: "Rival A dropped price by ₹200 on Apr 28", cls: isDark ? "text-red-400 bg-red-900/30" : "text-red-500 bg-red-50" },
                        { icon: Trophy, text: "Rival B gained Best Seller badge on Apr 26", cls: isDark ? "text-orange-400 bg-orange-900/30" : "text-orange-500 bg-orange-50" },
                        { icon: Star, text: "Rival C rating moved from 4.3 → 4.6 on Apr 24", cls: isDark ? "text-amber-400 bg-amber-900/30" : "text-amber-500 bg-amber-50" },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${item.cls}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seller Health Card — Premium */}
            <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {!isPremium && <TierGate tier="premium" feature="Seller Health Card & Portfolio Intelligence" isDark={isDark} />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-sky-900/30' : 'bg-sky-50'}`}>
                    <Shield className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Seller Health Card</span>
                </div>
                <div className="px-5 pb-5 pt-4">
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Your seller identity — not just the product.</p>
                  {isPremium ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Seller Rating",    value: sellerHealth.seller_rating || "—",                                   color: isDark ? "text-amber-400" : "text-amber-500" },
                        { label: "Seller Reviews",   value: sellerHealth.seller_ratings_total?.toLocaleString() || "—",           color: isDark ? "text-slate-200" : "text-slate-800" },
                        { label: "Business Name",    value: sellerHealth.business_name || "—",                                   color: isDark ? "text-slate-200" : "text-slate-800" },
                        { label: "Products Tracked", value: sellerHealth.product_count || "—",                                   color: isDark ? "text-sky-400" : "text-sky-600" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-[10px] font-medium mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</p>
                          <p className={`text-sm font-black ${s.color} truncate`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {["Seller Rating", "Seller Reviews", "Business Name", "Products Tracked"].map((label) => (
                        <div key={label} className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <p className={`text-[10px] font-medium mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
                          <p className={`text-sm font-black ${isDark ? 'text-slate-700' : 'text-slate-200'}`}>—</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {isPremium && sellerHealth.seller_rating && data.product_star_rating && (
                    <div className={`mt-4 p-3 rounded-xl border text-xs ${
                      parseFloat(sellerHealth.seller_rating) < (data.product_star_rating || 5)
                        ? isDark ? "bg-amber-900/30 border-amber-800/50 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                        : isDark ? "bg-emerald-900/30 border-emerald-800/50 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}>
                      {parseFloat(sellerHealth.seller_rating) < (data.product_star_rating || 5)
                        ? `⚠ Your seller rating (${sellerHealth.seller_rating}★) is lower than your product rating (${data.product_star_rating}★). This gap may be reducing conversions.`
                        : `✓ Your seller rating matches or exceeds your product rating — good seller health signal.`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Market Gap Finder — Premium */}
            <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {!isPremium && <TierGate tier="premium" feature="Market Gap Finder — Launch Opportunities" isDark={isDark} />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                    <Target className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Market Gap Finder</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto border ${isDark ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>UNIQUE TO THIS PAGE</span>
                </div>
                <div className="px-5 pb-5 pt-4">
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Price bands with high demand but few competitors.</p>
                  {marketGaps.length > 0 ? (
                    <div className="space-y-2">
                      {marketGaps.map((gap: any, i: number) => (
                        <MarketGapRow key={i} gap={gap} currency={currency} isDark={isDark} />
                      ))}
                    </div>
                  ) : isPremium ? (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Insufficient data to identify market gaps.</p>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { price_lo: 25, price_hi: 35, demand_label: "High", competitor_count: 2 },
                        { price_lo: 15, price_hi: 20, demand_label: "Medium", competitor_count: 1 },
                      ].map((gap, i) => <MarketGapRow key={i} gap={gap} currency={currency} isDark={isDark} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Weekly Summary — Premium */}
            <div className={`relative rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {!isPremium && <TierGate tier="premium" feature="AI Biggest Threat This Week" isDark={isDark} />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI — Biggest Threat This Week</span>
                </div>
                <div className="px-5 pb-5 pt-4">
                  {aiWeeklySummary ? (
                    <p className={`text-sm leading-relaxed rounded-xl p-4 border ${isDark ? 'bg-blue-900/10 border-blue-900/30 text-slate-300' : 'bg-blue-50 border-blue-100 text-slate-700'}`}>
                      {aiWeeklySummary}
                    </p>
                  ) : isPremium ? (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>AI summary not available — no change data found for this period.</p>
                  ) : (
                    <p className={`text-sm rounded-xl p-4 border blur-sm select-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                      Rival A dropped their price by ₹200 this week and gained the Best Seller badge in your category.
                    </p>
                  )}
                  {!aiWeeklySummary && !isPremium && (
                    <p className={`text-xs text-center mt-2 flex items-center justify-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Info className="w-3 h-3" /> Generated from DB deltas — "what changed since last week"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Portfolio Threat Overview — Premium */}
            {isPremium && portfolioRisk.length > 0 && (
              <Section title="Portfolio Threat Overview — All Your ASINs" icon={Radar} defaultOpen={false} accent={isDark ? "bg-red-900/30" : "bg-red-50"} isDark={isDark}>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Which of your products is most at risk right now.</p>
                <div className="space-y-2">
                  {portfolioRisk.map((item: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <span className={`text-xs font-mono w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.title}</p>
                        <p className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.asin}</p>
                      </div>
                      <ThreatRing score={item.max_threat_score || 0} size="sm" isDark={isDark} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Upgrade CTA */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-base flex items-center gap-2"><Swords className="w-4 h-4 text-sky-400" /> Know Every Rival's Next Move</p>
                  <p className="text-slate-300 text-sm mt-0.5">
                    {!isBasic
                      ? "Get threat scores, Buy Box intelligence & full competitor identity — Basic · ₹1,999/mo"
                      : "Get change feed, market gaps, AI weekly brief & Listing Audit — Premium · ₹2,999/mo"}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {(!isBasic
                      ? ["Threat score 1–10", "Buy Box risk detail", "Full competitor cards", "Discount aggression"]
                      : ["Listing Audit page", "Change feed", "Market gap finder", "AI weekly brief"]
                    ).map((f) => (
                      <span key={f} className="flex items-center gap-1 text-xs text-slate-300">
                        <CheckCircle className="w-3 h-3 text-sky-400" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => router.push("/subscription")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
                  <Crown className="w-4 h-4" /> Upgrade Now
                </button>
              </div>
            )}
          </>
        )}
        </main>
      </div>
    </div>
  );
}

export default function CompetitorAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <CompetitorAnalysisContent />
    </Suspense>
  );
}