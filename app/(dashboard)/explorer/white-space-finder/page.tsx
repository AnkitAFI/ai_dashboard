"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "@/lib/config";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Search,
  Lock,
  Crown,
  CheckCircle,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ShoppingBag,
  Star,
  Users,
  ArrowRight,
  Download,
  Target,
  Zap,
  Eye,
  BarChart3,
  Shield,
  Bot,
  Menu,
  Minus,
  Package,
  Flame,
  SortAsc,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";

const API = API_BASE_URL + "/api";

axios.defaults.withCredentials = true;

const CHART_STYLE = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderRadius: "12px",
  border: "1.5px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 14px",
};

const INFO_MODALS: Record<
  string,
  { title: string; subtitle: string; content: React.ReactNode }
> = {
  "score-distribution": {
    title: "Score Distribution — Opportunity Tiers",
    subtitle: "How our algorithm categorizes market viability",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This bar chart groups all discovered product niches from your keyword search into four distinct quality tiers based on our 100-point algorithmic score.
        </p>
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Hot (80–100 points)
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              High buyer demand combined with weak competitor star ratings (&lt;4.0★) or low review counts. These are prime white spaces ripe for immediate entry.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
            <div className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Good (65–79 points)
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Healthy monthly demand and beatable competition. Highly profitable if you launch with better product quality or improved features.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Moderate (50–64 points)
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Competitors are entrenched with solid review counts. You will need aggressive pricing or unique branding to win market share.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              Skip (&lt;50 points)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Saturated category dominated by major brands or price wars. High risk of ad-spend burnout; recommended to skip.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Consultant Tip:</strong> Focus your product development on niches in the &quot;Hot&quot; and &quot;Good&quot; tiers to keep customer acquisition costs low and achieve organic page 1 rankings faster.
        </div>
      </div>
    ),
  },
  "score-anatomy": {
    title: "Top Pick Score Anatomy — 4 Opportunity Pillars",
    subtitle: "Radar analysis of your #1 highest-rated niche",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This radar chart visualizes exactly where your #1 ranked opportunity earns its points across the four foundational pillars of marketplace competition.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
              1. Rating Gap (up to +32 pts)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Awarded when average competitor ratings are below 4.1★. Signals unhappy buyers with quality problems you can fix.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-violet-600 dark:text-violet-400 mb-1">
              2. Review Thinness (up to +32 pts)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Awarded when competitors have fewer than 150 average reviews. Means listings are young and easy to outrank.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              3. Demand Signal (up to +24 pts)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Awarded for strong monthly unit sales velocity across active listings, proving high customer search intent.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
              4. Price Gap (up to +12 pts)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Awarded when the spread between MRP and selling price gives sellers healthy profit margin headroom (15–65%).
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Consultant Tip:</strong> A radar shape stretching wide toward &quot;Rating gap&quot; and &quot;Review thin.&quot; indicates a market where sellers can win on product quality alone without expensive price cuts.
        </div>
      </div>
    ),
  },
  "demand-signals": {
    title: "Demand Signals — Top Niche Comparison",
    subtitle: "Side-by-side score comparison of leading niches",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This panel provides a direct visual comparison of the overall algorithmic scores for the top 6 product niches identified in your search.
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <li>
            <strong>Color-Coded Bars:</strong> Quickly distinguish between high-conviction opportunities (Green for 80+, Blue for 65–79) and moderate opportunities (Orange).
          </li>
          <li>
            <strong>Relative Viability:</strong> Helps you evaluate whether the #1 pick is a standalone winner or if multiple sub-niches share similarly strong potential.
          </li>
        </ul>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Consultant Tip:</strong> Always compare the #2 and #3 niches on this chart against #1. Often a slightly lower-scoring niche has half the ad competition while still generating excellent monthly revenue.
        </div>
      </div>
    ),
  },
  "scoring-works": {
    title: "How Scoring Works — 100-Point Algorithm",
    subtitle: "The mathematical formula behind White-Space Finder",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          Every product niche is evaluated on a strict 100-point scale designed specifically for Indian marketplaces (Amazon India and Flipkart India).
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Rating Gap Pillar</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">+32 Max Pts</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Review Thinness Pillar</span>
            <span className="font-bold text-violet-600 dark:text-violet-400">+32 Max Pts</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Demand Velocity Pillar</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">+24 Max Pts</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Price Margin Gap Pillar</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">+12 Max Pts</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <span className="font-semibold text-red-700 dark:text-red-300">Crowded Top Penalty</span>
            <span className="font-bold text-red-600 dark:text-red-400">-6 Pts</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A penalty of -6 points is applied if a niche is already dominated by both an Amazon Best Seller and an Amazon&apos;s Choice brand.
        </p>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Consultant Tip:</strong> Any score above 75 indicates a statistically favorable market where new sellers have a high probability of profitability within 60 days of launch.
        </div>
      </div>
    ),
  },
  watchlist: {
    title: "Watchlist — Saved Opportunities",
    subtitle: "Track your shortlisted product niches over time",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          The Watchlist panel stores your saved product niches so you can monitor their algorithmic scores and competition over time.
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <li>
            <strong>Quick Reference:</strong> Displays your most recently bookmarked niches with their current score and category.
          </li>
          <li>
            <strong>One-Click Management:</strong> Click the bookmark icon on any opportunity card to add or remove it from your list.
          </li>
        </ul>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Consultant Tip:</strong> Add 5–10 candidate niches to your Watchlist and observe them over a 2-week period before committing your inventory budget!
        </div>
      </div>
    ),
  },
  "est-revenue": {
    title: "Estimated Seller Revenue / Month",
    subtitle: "What a typical listing earns in this product category",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This is the approximate monthly sales revenue (in Indian Rupees) that an active seller generates in this product category on Amazon India or Flipkart India.
        </p>
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              Why This Matters for You
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              It tells you the size of the business opportunity. The lower number represents what a newly launched listing typically makes, while the higher number represents what an established Top 5 seller earns in a month.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Seller Advice:</strong> Look for categories that generate enough monthly sales so your profit margins easily cover product manufacturing and shipping costs.
        </div>
      </div>
    ),
  },
  "avg-price": {
    title: "Average Selling Price",
    subtitle: "The typical price customers pay in this category",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This is the average selling price (in Indian Rupees) across the top-selling listings in this product category.
        </p>
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
              How to Price Your Product
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              It gives you a clear target for pricing your own product. When you launch a new listing, pricing your product around or slightly below this market average is an effective way to attract initial buyers and build quick sales velocity.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Seller Advice:</strong> Higher average prices (above ₹1,000) mean customers expect premium packaging and good customer support.
        </div>
      </div>
    ),
  },
  "avg-rating": {
    title: "Average Customer Star Rating",
    subtitle: "How satisfied customers are with current products",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This is the average star rating given by verified buyers to products currently selling in this category.
        </p>
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
              Why Low Ratings Are a Golden Opportunity
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If the average rating is below 4.0★, it means customers are unhappy with existing products on the market. This creates a prime opportunity for you to launch a better-quality product that solves their complaints and quickly win them over.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Seller Advice:</strong> Read the negative reviews of existing products to see what breaks or disappoints buyers, then fix those issues in your product!
        </div>
      </div>
    ),
  },
  "competitor-count": {
    title: "Total Active Competitors",
    subtitle: "How many sellers you are competing against",
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          This is the total number of competing product listings currently active in this category on Amazon India and Flipkart India.
        </p>
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
              What This Means for Entry
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A smaller competitor count means the market is uncrowded and much easier to enter. A larger competitor count means the category is popular, so having strong product images and good customer reviews will help you stand out.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
          <strong>Seller Advice:</strong> Categories with fewer competitors give new products a much faster path to ranking on Page 1!
        </div>
      </div>
    ),
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

interface ScoreBreakdown {
  rating_gap: number;
  review_thinness: number;
  demand_signal: number;
  price_gap: number;
}

interface Competitor {
  asin?: string;
  title: string;
  rating: number;
  review_count: number;
  price: number;
  weakness: string;
  platform: "amazon" | "flipkart";
  is_best_seller?: boolean;
  is_amazon_choice?: boolean;
  trend_signal?: string;
}

interface AIInsight {
  type: "entry_price" | "listing_gap" | "trend_alert" | "quick_win";
  headline: string;
  detail: string;
}

interface Opportunity {
  id: string;
  product_niche: string;
  score: number;
  gap_summary: string;
  category: string;
  platform: "amazon" | "flipkart" | "both";
  search_volume_estimate: number;
  avg_price: number;
  avg_rating: number;
  avg_reviews: number;
  competitor_count: number;
  est_revenue_min: number;
  est_revenue_max: number;
  top_keyword: string;
  score_breakdown: ScoreBreakdown;
  competitors: Competitor[];
  trend_direction: "up" | "down" | "steady";
  trend_pct: number;
  has_best_seller_gap: boolean;
  has_amazon_choice_gap: boolean;
  entry_price_suggestion?: number;
  ai_insights?: AIInsight[];
  watchlist_count?: number;
}

interface ScanResult {
  query: string;
  category: string;
  platform: string;
  total_found: number;
  tier: string;
  scans_used: number;
  scans_limit: number;
  opportunities: Opportunity[];
  locked_count: number;
  ai_market_summary?: string;
}

interface WatchlistItem {
  niche: string;
  score: number;
  category: string;
  platform: string;
  avg_price: number;
  avg_rating: number;
  competitor_count: number;
  est_revenue_max: number;
  top_keyword: string;
  gap_summary: string;
  query: string;
  added_at: string;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function inr(n: number | null | undefined): string {
  const num = Number(n);
  if (n === undefined || n === null || isNaN(num)) return "—";
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + "Cr";
  if (num >= 100000) return "₹" + (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return "₹" + Math.round(num).toLocaleString("en-IN");
  return "₹" + Math.round(num);
}

function extractErr(e: unknown): string {
  const err = e as Record<string, unknown>;
  const detail = (err?.response as Record<string, unknown>)?.data
    ? (
        (err.response as Record<string, unknown>).data as Record<
          string,
          unknown
        >
      )?.detail
    : undefined;
  if (!detail) return (err?.message as string) ?? "Something went wrong.";
  if (typeof detail === "string") return detail;
  return JSON.stringify(detail);
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreLabel(score: number, t: any): { label: string; color: string } {
  if (score >= 80) return { label: t("whiteSpaceFinder.hotPick", "Hot pick"), color: "bg-emerald-100 dark:bg-emerald-950/35 text-emerald-800 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/45" };
  if (score >= 65) return { label: t("whiteSpaceFinder.goodGap", "Good gap"), color: "bg-blue-100 dark:bg-blue-950/35 text-blue-800 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/45" };
  if (score >= 50) return { label: t("whiteSpaceFinder.moderate", "Moderate"), color: "bg-amber-100 dark:bg-amber-950/35 text-amber-850 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/45" };
  return { label: t("whiteSpaceFinder.skip", "Skip"), color: "bg-red-100 dark:bg-red-950/35 text-red-800 dark:text-red-400 border border-red-200/40 dark:border-red-900/45" };
}

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color =
    score >= 80
      ? "#10b981"
      : score >= 65
        ? "#3b82f6"
        : score >= 50
          ? "#f59e0b"
          : "#ef4444";
  return (
    <div
      style={{ width: size, height: size, position: "relative", flexShrink: 0 }}
      className="flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={5}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`text-sm font-bold relative z-10 ${getScoreColor(score)}`}
      >
        {score}
      </span>
    </div>
  );
}

// ── Score Breakdown Bars ──────────────────────────────────────────────────────

function ScoreBreakdownBars({ breakdown }: { breakdown: ScoreBreakdown }) {
  const { t } = useTranslation();
  const items = [
    { label: t("whiteSpaceFinder.ratingGap", "Rating gap"),      value: breakdown.rating_gap,      max: 32, color: "#3b82f6" },
    { label: t("whiteSpaceFinder.reviewThinness", "Review thinness"), value: breakdown.review_thinness, max: 32, color: "#8b5cf6" },
    { label: t("whiteSpaceFinder.demandSignal", "Demand signal"),   value: breakdown.demand_signal,   max: 24, color: "#10b981" },
    { label: t("whiteSpaceFinder.priceGap", "Price gap"),       value: breakdown.price_gap,       max: 12, color: "#f59e0b" },
  ];
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 w-28 shrink-0">
            {item.label}
          </span>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / item.max) * 100}%`,
                background: item.color,
              }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-650 dark:text-slate-300 w-6 text-right">
            +{item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Competitor Row ────────────────────────────────────────────────────────────

function CompetitorRow({ comp, index }: { comp: Competitor; index: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-650 dark:text-slate-400 shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 break-words leading-snug mb-1.5">
          {comp.title}
        </p>
        <div className="flex items-center gap-3 flex-wrap mb-1.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">★ {comp.rating.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{comp.review_count.toLocaleString()} {t("whiteSpaceFinder.reviews", "reviews")}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">₹{comp.price.toLocaleString("en-IN")}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${comp.platform === "amazon" ? "bg-amber-100 dark:bg-amber-950/35 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40" : "bg-blue-100 dark:bg-blue-950/35 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40"}`}>
            {comp.platform === "amazon" ? t("whiteSpaceFinder.amazonIn", "Amazon India") : t("whiteSpaceFinder.flipkart", "Flipkart India")}
          </span>
          {comp.is_best_seller && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950/35 text-yellow-750 dark:text-yellow-400 border border-yellow-250 dark:border-yellow-900/40">{t("whiteSpaceFinder.bestSeller", "Best Seller")}</span>
          )}
          {comp.is_amazon_choice && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/35 text-teal-705 dark:text-teal-400 border border-teal-250 dark:border-teal-900/40">{t("whiteSpaceFinder.asChoice", "A's Choice")}</span>
          )}
        </div>
        <p className="text-xs sm:text-[12.5px] text-slate-700 dark:text-slate-250 font-medium leading-relaxed mt-1.5">
          <span className="text-amber-600 dark:text-amber-400 font-semibold mr-1.5">⚠</span>
          {comp.weakness}
        </p>
      </div>
    </div>
  );
}

// ── AI Insight Badge ──────────────────────────────────────────────────────────

function AIInsightBadge({ insight }: { insight: AIInsight }) {
  const configs = {
    entry_price: {
      icon: <Target className="w-3.5 h-3.5" />,
      bg: "bg-purple-50 dark:bg-purple-950/15 border-purple-200 dark:border-purple-900/35",
      text: "text-purple-700 dark:text-purple-400",
    },
    listing_gap: {
      icon: <Eye className="w-3.5 h-3.5" />,
      bg: "bg-blue-50 dark:bg-blue-950/15 border-blue-200 dark:border-blue-900/35",
      text: "text-blue-700 dark:text-blue-400",
    },
    trend_alert: {
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/35",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    quick_win: {
      icon: <Zap className="w-3.5 h-3.5" />,
      bg: "bg-amber-50 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/35",
      text: "text-amber-750 dark:text-amber-400",
    },
  };
  const c = configs[insight.type] ?? configs.quick_win;
  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${c.bg}`}>
      <span className={`${c.text} shrink-0 mt-0.5`}>{c.icon}</span>
      <div>
        <p className={`text-xs font-semibold ${c.text}`}>{insight.headline}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {insight.detail}
        </p>
      </div>
    </div>
  );
}

// ── Opportunity Card ──────────────────────────────────────────────────────────

function OpportunityCard({
  opp,
  tier,
  onUpgrade,
  onWatchlist,
  watchlistItems,
  watchlistLoading,
  onOpenInfoModal,
}: {
  opp: Opportunity;
  tier: string;
  onUpgrade: (f: string) => void;
  onWatchlist: (opp: Opportunity) => void;
  watchlistItems: WatchlistItem[];
  watchlistLoading: boolean;
  onOpenInfoModal?: (key: string) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isBasicPlus  = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium    = tier === "premium" || tier === "enterprise";
  const sl           = getScoreLabel(opp.score, t);
  const alreadyWatched = watchlistItems.some((i) => i.niche === opp.product_niche);

  const trendEl = isPremium ? (
    opp.trend_direction === "up" ? (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/35 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/30">
        <TrendingUp className="w-2.5 h-2.5" />+{opp.trend_pct}%
      </span>
    ) : opp.trend_direction === "down" ? (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/35 px-2 py-0.5 rounded-full border border-red-200/50 dark:border-red-900/30">
        <TrendingDown className="w-2.5 h-2.5" />-{opp.trend_pct}%
      </span>
    ) : (
      <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/30">
        <Minus className="w-2.5 h-2.5" />{t("whiteSpaceFinder.steady", "steady")}
      </span>
    )
  ) : null;

  return (
    <Card
      className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-background hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
      data-track-id="whitespace_result_card"
      data-filter-value={opp.product_niche}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <ScoreRing score={opp.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {opp.product_niche}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {trendEl}
                <button
                  type="button"
                  onClick={() => onWatchlist(opp)}
                  disabled={watchlistLoading}
                  className={`p-1.5 rounded-lg border transition-colors ${alreadyWatched ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                  title={alreadyWatched ? t("whiteSpaceFinder.inWatchlist", "In Watchlist") : t("whiteSpaceFinder.addToWatchlist", "Add to Watchlist")}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={alreadyWatched ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                {opp.category}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sl.color}`}>
                {sl.label}
              </span>
              <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${opp.platform === "both" ? "bg-purple-100 dark:bg-purple-950/35 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40" : opp.platform === "amazon" ? "bg-amber-100 dark:bg-amber-950/35 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40" : "bg-blue-100 dark:bg-blue-950/35 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40"}`}>
                {opp.platform === "both" ? t("whiteSpaceFinder.amazonFlipkart", "Amazon India + Flipkart India") : opp.platform === "amazon" ? t("whiteSpaceFinder.amazonIn", "Amazon India") : t("whiteSpaceFinder.flipkart", "Flipkart India")}
              </span>
              {opp.has_best_seller_gap && (
                <span className="text-[10px] bg-yellow-100 dark:bg-yellow-950/35 text-yellow-750 dark:text-yellow-400 px-2.5 py-0.5 rounded-full font-medium border border-yellow-200/50 dark:border-yellow-900/30">{t("whiteSpaceFinder.noBestSellerYet", "No Best Seller yet")}</span>
              )}
              {opp.has_amazon_choice_gap && (
                <span className="text-[10px] bg-teal-100 dark:bg-teal-950/35 text-teal-705 dark:text-teal-400 px-2.5 py-0.5 rounded-full font-medium border border-teal-200/50 dark:border-teal-900/30">{t("whiteSpaceFinder.noAsChoice", "No A's Choice")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Gap summary */}
        <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-3">
          <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-605 dark:text-slate-300 leading-relaxed">
            {opp.gap_summary}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { 
              label: t("whiteSpaceFinder.estRevenueMo", "Est. Seller Rev / mo"), 
              value: `${inr(opp.est_revenue_min)}–${inr(opp.est_revenue_max)}`,
              tooltip: "Expected monthly earnings range for a single active seller in this niche",
              modalKey: "est-revenue"
            },
            { 
              label: t("whiteSpaceFinder.avgPrice", "Avg price"),
              value: `₹${opp.avg_price.toLocaleString("en-IN")}`, 
              tooltip: "Typical selling price across top competitors",
              modalKey: "avg-price" 
            },
            { 
              label: t("whiteSpaceFinder.avgRating", "Avg rating"),
              value: `★ ${opp.avg_rating.toFixed(1)}`, 
              tooltip: "Average customer rating in this niche",
              modalKey: "avg-rating"
            },
            { 
              label: t("whiteSpaceFinder.competitors", "Competitors"),
              value: String(opp.competitor_count), 
              tooltip: "Total active competing listings found",
              modalKey: "competitor-count" 
            },
          ].map((s) => (
            <div
              key={s.label}
              onClick={() => onOpenInfoModal?.(s.modalKey)}
              title={s.tooltip}
              className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2.5 border border-slate-100 dark:border-slate-850/60 text-center cursor-pointer transition-all hover:bg-violet-50/50 dark:hover:bg-slate-800/60 hover:border-violet-300 dark:hover:border-violet-700/60 group"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <p className="text-[9px] text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                  {s.label}
                </p>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInfoModal?.(s.modalKey);
                  }}
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-bold group-hover:bg-violet-600 group-hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="Click for detailed explanation"
                >
                  !
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Score breakdown */}
        {isBasicPlus ? (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("whiteSpaceFinder.scoreBreakdown", "Score breakdown")}</p>
            <ScoreBreakdownBars breakdown={opp.score_breakdown} />
          </div>
        ) : (
          <div className="relative mb-3">
            <div className="space-y-2 opacity-60 blur-[3px] pointer-events-none select-none">
              {[[t("whiteSpaceFinder.ratingGap", "Rating gap"), 22], [t("whiteSpaceFinder.reviewThinness", "Review thinness"), 18], [t("whiteSpaceFinder.demandSignal", "Demand signal"), 15], [t("whiteSpaceFinder.priceGap", "Price gap"), 10]].map(([l, v]) => (
                <div key={String(l)} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 shrink-0">{l}</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="h-full rounded-full bg-slate-400 dark:bg-slate-600"
                      style={{ width: `${(Number(v) / 32) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right text-slate-400">
                    +{v}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => onUpgrade("Score breakdown")}
                className="flex items-center gap-1.5 text-xs px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-750 rounded-full shadow-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-600 transition-colors"
              >
                <Lock className="w-3 h-3 text-amber-500" /> {t("whiteSpaceFinder.unlockBreakdown", "Unlock breakdown — Basic")}
              </button>
            </div>
          </div>
        )}

        {/* Entry price — Premium */}
        {isPremium && opp.entry_price_suggestion && (
          <div className="flex items-center gap-2 p-2.5 bg-purple-50 dark:bg-purple-950/15 border border-purple-200 dark:border-purple-900/35 rounded-lg mb-3">
            <Target className="w-3.5 h-3.5 text-purple-650 dark:text-purple-400 shrink-0" />
            <p className="text-xs text-purple-750 dark:text-purple-300">
              <span className="font-semibold">{t("whiteSpaceFinder.suggestedEntryPrice", "Suggested entry price:")}</span>{" "}
              ₹{opp.entry_price_suggestion.toLocaleString("en-IN")} — 12% {t("whiteSpaceFinder.belowMarketAvg", "below market avg for \"Lowest New Price\" badge")}
            </p>
          </div>
        )}

        {/* AI Insights — Premium */}
        {isPremium && opp.ai_insights && opp.ai_insights.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("whiteSpaceFinder.aiInsights", "AI insights")}</p>
              <span className="text-[9px] font-mono text-slate-405 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Insydz</span>
            </div>
            {opp.ai_insights.map((ins, i) => (
              <AIInsightBadge key={i} insight={ins} />
            ))}
          </div>
        )}

        {/* Competitors — Basic+ */}
        {isBasicPlus && opp.competitors.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium mb-2"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? t("whiteSpaceFinder.hide", "Hide") : t("whiteSpaceFinder.show", "Show")} {t("whiteSpaceFinder.top", "top")} {opp.competitors.length} {t("whiteSpaceFinder.competitorsAndWeaknesses", "competitors & weaknesses")}
            </button>
            {expanded && (
              <div className="space-y-2">
                {opp.competitors.map((c, i) => (
                  <CompetitorRow key={i} comp={c} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onWatchlist(opp)}
            disabled={watchlistLoading}
            className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-medium border transition-all ${
              alreadyWatched
                ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700"
                : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-850 hover:text-violet-600 dark:hover:text-violet-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {watchlistLoading
              ? <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              : <Bookmark className={`w-2.5 h-2.5 ${alreadyWatched ? "fill-white" : ""}`} />}
            {alreadyWatched ? t("whiteSpaceFinder.watching", "Watching") : t("whiteSpaceFinder.watch", "Watch")}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Locked Card ───────────────────────────────────────────────────────────────

function LockedCard({ position, onUpgrade }: { position: number; onUpgrade: (f: string) => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-background opacity-100 overflow-hidden cursor-pointer group"
      onClick={() => onUpgrade("Full results")}
      data-track-id="whitespace_locked_result_card"
      data-filter-value={position.toString()}
    >
      <div className="p-5 blur-[3px] opacity-60 pointer-events-none select-none">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-13 h-13 rounded-full bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {position}
          </div>
          <div>
            <div className="h-3 w-44 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-2 w-28 bg-slate-100 dark:bg-slate-850/50 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/95 dark:bg-background/95 backdrop-blur-none">
        <Lock className="w-4 h-4 text-amber-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("whiteSpaceFinder.resultLocked", "Result #{{position}} locked", { position })}</p>
        <p className="text-xs text-slate-550 dark:text-slate-400">{t("whiteSpaceFinder.upgradeToUnlock", "Upgrade to Basic to unlock all results")}</p>
        <span className="mt-1 text-xs px-5 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium shadow group-hover:shadow-md transition-all">
          {t("whiteSpaceFinder.unlockFor", "Unlock — ₹1,999/mo")}
        </span>
      </div>
    </div>
  );
}

// ── Tier Feature Table ────────────────────────────────────────────────────────

const getTierFeatures = (t: any) => [
  { key: "scans",       label: t("whiteSpaceFinder.scansMonth", "Scans / month"),         free: "3",   basic: "20",  premium: t("whiteSpaceFinder.unlimited", "Unlimited") },
  { key: "results",     label: t("whiteSpaceFinder.resultsPerScan", "Results per scan"),       free: "3",   basic: t("whiteSpaceFinder.all", "All"), premium: t("whiteSpaceFinder.all", "All")       },
  { key: "breakdown",   label: t("whiteSpaceFinder.scoreBreakdown", "Score breakdown"),        free: false, basic: true,  premium: true        },
  { key: "competitors", label: t("whiteSpaceFinder.competitorWeaknesses", "Competitor weaknesses"),  free: false, basic: true,  premium: true        },
  { key: "demand",      label: t("whiteSpaceFinder.demandSignalsChart", "Demand signals chart"),   free: false, basic: true,  premium: true        },
  { key: "trend",       label: t("whiteSpaceFinder.trendData", "Trend data (90-day)"),    free: false, basic: false, premium: true        },
  { key: "entry_price", label: t("whiteSpaceFinder.entryPriceSuggestion", "Entry price suggestion"), free: false, basic: false, premium: true        },
  { key: "ai_insights", label: t("whiteSpaceFinder.aiStrategicInsights", "AI strategic insights"),  free: false, basic: false, premium: true        },
  { key: "watchlist",   label: t("whiteSpaceFinder.watchlist", "Watchlist"),              free: true,  basic: true,  premium: true        },
  { key: "export",      label: t("whiteSpaceFinder.csvExport", "CSV export"),             free: false, basic: false, premium: true        },
  { key: "badges",      label: t("whiteSpaceFinder.bestSellerGapSignal", "Best Seller gap signal"), free: false, basic: true,  premium: true        },
];

function TierCell({ val }: { val: boolean | string }) {
  if (val === true)
    return <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (val === false) return <X className="w-4 h-4 text-slate-300 mx-auto" />;
  return <span className="text-xs font-semibold text-slate-700">{val}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

function WhiteSpaceFinderContent() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const userEmail = user?.email || "";
  const userId = user?.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState<"amazon" | "flipkart" | "both">(
    "both",
  );
  const [sortBy, setSortBy] = useState<"score" | "revenue" | "competition">(
    "score",
  );
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showTierTable, setShowTierTable] = useState(false);
  const [categories, setCategories] = useState<string[]>(["all"]);

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [usageLimits, setUsageLimits] = useState<{
    count: number;
    limit: number;
    remaining: number;
    subscription_tier: string;
  } | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<{
    status: "ready" | "no_model" | "offline" | "error" | "checking";
    model?: string;
    setup_hint?: string;
  }>({ status: "checking" });
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setLiveSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/white-space/suggestions`, {
          params: { query: q },
        });
        if (res.data?.suggestions && Array.isArray(res.data.suggestions)) {
          setLiveSuggestions(res.data.suggestions);
        } else {
          setLiveSuggestions([]);
        }
      } catch (err) {
        setLiveSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const inputRef = useRef<HTMLInputElement>(null);

  const tier = result?.tier ?? user?.subscriptionTier ?? "free";
  const isBasicPlus =
    tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium = tier === "premium" || tier === "enterprise";
  const scansUsed = result?.scans_used ?? 0;
  const scansLimit = result?.scans_limit ?? 3;
  const scanPct = Math.min((scansUsed / scansLimit) * 100, 100);

  const showToast = (
    title: string,
    description: string,
    variant: "success" | "error" = "success",
  ) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description, variant }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };

  const fetchWatchlist = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API}/white-space/watchlist`);
      setWatchlistItems(res.data.watchlist as WatchlistItem[]);
    } catch {
      // Non-critical
    }
  }, [userId]);

  const fetchUsageLimits = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API}/white-space/usage/${userId}`);
      setUsageLimits(res.data);
    } catch {
      // silent
    }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
    fetchUsageLimits();
  }, [fetchWatchlist, fetchUsageLimits]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setTimeout(() => document.getElementById("ws-scan-btn")?.click(), 150);
    }
  }, [searchParams]);

  useEffect(() => {
    axios
      .get(`${API}/white-space/ai/status`)
      .then((res) => setOllamaStatus(res.data))
      .catch(() =>
        setOllamaStatus({ status: "offline", setup_hint: "ollama serve" }),
      );
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/white-space/categories`, { params: { platform } })
      .then((res) => {
        setCategories(["all", ...res.data.categories]);
        setCategory("all");
      })
      .catch(() => {});
  }, [platform]);

  const runScan = useCallback(async () => {
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/white-space/scan`, {
        query: query.trim(),
        category: category === "all" ? null : category,
        platform,
      });
      setResult(res.data as ScanResult);
      setTimeout(() => window.scrollTo({ top: 300, behavior: "smooth" }), 100);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response
        ?.status;
      if (status === 403) {
        showToast(
          "Limit reached",
          "You've used all scans this month. Upgrade for more.",
          "error",
        );
      } else if (status === 429) {
        setError("Monthly scan limit reached. Upgrade for more scans.");
      } else {
        setError(extractErr(e));
      }
    } finally {
      setLoading(false);
    }
  }, [query, category, platform, userId]);

  const handleExport = async () => {
    if (!isPremium) {
      showToast(
        "Premium feature",
        "CSV export requires the Premium plan.",
        "error",
      );
      return;
    }
    if (!result) return;
    setExporting(true);
    try {
      const rows = [
        [
          "Niche",
          "Score",
          "Category",
          "Platform",
          "Avg Price",
          "Avg Rating",
          "Competitors",
          "Est Rev Min",
          "Est Rev Max",
          "Trend",
          "Top Keyword",
        ],
        ...result.opportunities.map((o) => [
          o.product_niche,
          o.score,
          o.category,
          o.platform,
          o.avg_price,
          o.avg_rating,
          o.competitor_count,
          o.est_revenue_min,
          o.est_revenue_max,
          o.trend_direction,
          o.top_keyword,
        ]),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `white_space_${query.replace(/\s+/g, "_")}_${Date.now()}.csv`;
      a.click();
      showToast("Export ready!", "CSV downloaded successfully.");
    } catch {
      showToast("Export failed", "Could not generate CSV.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleWatchlist = async (opp: Opportunity) => {
    if (!userId) {
      showToast(
        "Sign in required",
        "Please sign in to use the watchlist.",
        "error",
      );
      return;
    }
    const alreadyIn = watchlistItems.some((i) => i.niche === opp.product_niche);
    setWatchlistLoading(true);
    try {
      await axios.post(`${API}/white-space/watchlist/toggle`, {
        niche: opp.product_niche,
        score: opp.score,
        category: opp.category,
        platform: opp.platform,
        avg_price: opp.avg_price,
        avg_rating: opp.avg_rating,
        competitor_count: opp.competitor_count,
        est_revenue_max: opp.est_revenue_max,
        top_keyword: opp.top_keyword,
        gap_summary: opp.gap_summary,
        query,
      });
      await fetchWatchlist();
      if (alreadyIn) {
        showToast("Removed from watchlist", opp.product_niche);
      } else {
        showToast(
          "Added to watchlist!",
          `"${opp.product_niche}" saved — redirecting…`,
        );
        setTimeout(() => router.push("/explorer/my-watchlist"), 800);
      }
    } catch {
      showToast("Error", "Could not update watchlist. Try again.", "error");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleSidebarRemove = async (item: WatchlistItem) => {
    if (!userId) return;
    try {
      await axios.post(`${API}/white-space/watchlist/toggle`, {
        niche: item.niche,
        score: item.score,
        category: item.category,
        platform: item.platform,
        avg_price: item.avg_price,
        avg_rating: item.avg_rating,
        competitor_count: item.competitor_count,
        est_revenue_max: item.est_revenue_max,
        top_keyword: item.top_keyword,
        gap_summary: item.gap_summary,
        query: item.query,
      });
      await fetchWatchlist();
    } catch {
      showToast("Error", "Could not remove item.", "error");
    }
  };

  const sortedOpps = [...(result?.opportunities ?? [])]
    .filter((o) => o.score >= minScore)
    .sort((a, b) => {
      if (sortBy === "revenue") return b.est_revenue_max - a.est_revenue_max;
      if (sortBy === "competition")
        return a.competitor_count - b.competitor_count;
      return b.score - a.score;
    });

  const radarData =
    sortedOpps.slice(0, 1).map((o) => [
      { subject: "Rating gap", A: o.score_breakdown.rating_gap, fullMark: 32 },
      {
        subject: "Review thin.",
        A: o.score_breakdown.review_thinness,
        fullMark: 32,
      },
      { subject: "Demand", A: o.score_breakdown.demand_signal, fullMark: 24 },
      { subject: "Price gap", A: o.score_breakdown.price_gap, fullMark: 12 },
    ])[0] ?? [];

  const distData = [
    { name: `Hot 80+`,    count: (result?.opportunities ?? []).filter((o) => o.score >= 80).length,                 fill: "#639922" },
    { name: `Good 65–79`, count: (result?.opportunities ?? []).filter((o) => o.score >= 65 && o.score < 80).length, fill: "#378ADD" },
    { name: `Mod 50–64`,  count: (result?.opportunities ?? []).filter((o) => o.score >= 50 && o.score < 65).length, fill: "#BA7517" },
    { name: `Skip <50`,   count: (result?.opportunities ?? []).filter((o) => o.score < 50).length,                  fill: "#E24B4A" },
  ];

  const chartStyle =
    resolvedTheme === "dark"
      ? {
          backgroundColor: "rgba(30,41,59,0.97)",
          borderRadius: "12px",
          border: "1.5px solid #334155",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          fontSize: 12,
          padding: "8px 14px",
          color: "#f3f4f6",
        }
      : CHART_STYLE;

  return (
    <div className="space-y-1">
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 backdrop-blur-none ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
          >
            {t.variant === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}
              >
                {t.title}
              </p>
              <p
                className={`text-xs mt-0.5 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}
              >
                {t.description}
              </p>
            </div>
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles className="h-6 w-6 text-violet-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                {t("whiteSpaceFinder.opportunityFinder", "Opportunity Finder")}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {t("whiteSpaceFinder.discoverUntapped", "Discover untapped product gaps and find hidden opportunities across Amazon India and Flipkart India.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Scan counter — shown always if usageLimits or result is available */}
            {(result || usageLimits) && (
              <div className="bg-background opacity-100 rounded-xl px-4 py-2 border border-slate-200 shadow-sm min-w-[160px]">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{t("whiteSpaceFinder.scansUsed", "Scans used")}</p>
                  <Badge className={`h-4 text-[10px] border-none px-1.5 ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-violet-100 text-violet-800" : tier === "basic" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                    {tier.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result ? scanPct : usageLimits?.limit !== -1 && usageLimits?.limit !== undefined ? Math.min(((usageLimits?.count || 0) / usageLimits.limit) * 100, 100) : 0}%`,
                        background:
                          (result
                            ? scanPct
                            : usageLimits?.limit !== -1 &&
                                usageLimits?.limit !== undefined
                              ? Math.min(
                                  ((usageLimits?.count || 0) /
                                    usageLimits.limit) *
                                    100,
                                  100,
                                )
                              : 0) >= 80
                            ? "#ef4444"
                            : "#7F77DD",
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">
                    {result ? scansUsed : usageLimits?.count || 0}/
                    {isPremium
                      ? "∞"
                      : result
                        ? scansLimit
                        : usageLimits?.limit || 3}
                  </span>
                </div>
              </div>
            )}

            {!result && !usageLimits && authLoading && (
              <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
            )}

            {/* Action buttons */}
            {result && (
              <div className="flex items-center gap-2">
                {isPremium && (
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    data-track-id="export-btn"
                    className="flex items-center gap-1.5 text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    {exporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {t("whiteSpaceFinder.exportCsv", "Export CSV")}
                  </button>
                )}
                <button
                  onClick={() => setShowTierTable(!showTierTable)}
                  data-track-id="plans-toggle-btn"
                  data-filter-value={showTierTable ? "hide" : "show"}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" /> {t("whiteSpaceFinder.plans", "Plans")}
                </button>
              </div>
            )}

            {/* Plans button shown even before scan */}
            {!result && (
              <button
                onClick={() => setShowTierTable(!showTierTable)}
                data-track-id="plans-toggle-btn"
                data-filter-value={showTierTable ? "hide" : "show"}
                className="flex items-center gap-1.5 text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" /> {t("whiteSpaceFinder.plans", "Plans")}
              </button>
            )}

            {authLoading ? (
              <p className="text-xs text-slate-400 animate-pulse">{t("whiteSpaceFinder.checkingSession", "Checking session…")}</p>
            ) : !userEmail ? (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 gap-1 text-[10px]">
                <AlertCircle className="h-3 w-3" /> {t("whiteSpaceFinder.guestMode", "Guest Mode")}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="pb-12 space-y-5">
          {/* Tier table */}
          {showTierTable && (
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-background">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-250 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" /> {t("whiteSpaceFinder.planComparison", "Plan comparison")}
                  </CardTitle>
                  <button
                    onClick={() => setShowTierTable(false)}
                    className="text-slate-400 hover:text-slate-650"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left p-2.5 text-xs text-slate-500 dark:text-slate-405 font-medium w-48 bg-transparent">{t("whiteSpaceFinder.feature", "Feature")}</th>
                        <th className="text-center p-2.5 text-xs font-semibold text-slate-600 dark:text-slate-350 bg-transparent">{t("whiteSpaceFinder.free", "Free")}</th>
                        <th className="text-center p-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/25 rounded-t">
                          {t("whiteSpaceFinder.basic", "Basic")}<br /><span className="text-[10px] font-normal">₹1,999{t("whiteSpaceFinder.monthText", "/mo")}</span>
                        </th>
                        <th className="text-center p-2.5 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/25 rounded-t">
                          {t("whiteSpaceFinder.premium", "Premium")}<br /><span className="text-[10px] font-normal">₹2,999{t("whiteSpaceFinder.monthText", "/mo")}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTierFeatures(t).map((f) => (
                        <tr key={f.key} className="border-b border-slate-100 dark:border-slate-800/60">
                          <td className="p-2.5 text-xs text-slate-600 dark:text-slate-300 bg-transparent">{f.label}</td>
                          <td className="p-2.5 text-center bg-transparent"><TierCell val={f.free} /></td>
                          <td className="p-2.5 text-center bg-amber-50/40 dark:bg-amber-950/10"><TierCell val={f.basic} /></td>
                          <td className="p-2.5 text-center bg-violet-50/40 dark:bg-violet-950/10"><TierCell val={f.premium} /></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="bg-transparent" />
                        {(["free", "basic", "premium"] as const).map((planTier) => (
                          <td
                            key={planTier}
                            className={`p-3 text-center ${planTier === "basic" ? "bg-amber-50/40 dark:bg-amber-950/10" : planTier === "premium" ? "bg-violet-50/40 dark:bg-violet-950/10" : "bg-transparent"}`}
                          >
                            {tier === planTier ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/30 px-3 py-1 rounded-full border border-violet-200/55 dark:border-violet-900/35">
                                <CheckCircle className="w-3 h-3" /> {t("whiteSpaceFinder.yourPlan", "Your plan")}
                              </span>
                            ) : planTier !== "free" ? (
                              <a
                                href="/subscription"
                                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors ${
                                  planTier === "basic"
                                    ? "bg-amber-500 text-white hover:bg-amber-600"
                                    : "bg-violet-600 text-white hover:bg-violet-700"
                                }`}
                              >
                                {t("whiteSpaceFinder.upgrade", "Upgrade")}
                              </a>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search & Filters */}
          <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-background">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <SmartSearchInput
                    value={query}
                    onChange={setQuery}
                    onEnter={runScan}
                    placeholder={t("whiteSpaceFinder.searchPlaceholder", "Search a product...")}
                    inputClassName="py-3 border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/40"
                    dictionary={[
                      "kitchen organizer",
                      "baby feeding",
                      "pet grooming",
                      "sleep aid",
                      "skincare tools",
                      "home scent",
                      "gaming accessories",
                      "fitness gear",
                      "pet care",
                      "desk organizer",
                      "water bottle",
                      "yoga mat",
                      "air purifier",
                      "led lights",
                      "bluetooth speaker",
                    ]}
                    maxSuggestions={5}
                  />
                </div>
                <button
                  id="ws-scan-btn"
                  data-track-id="ws-scan-btn"
                  onClick={runScan}
                  disabled={loading || !query.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[130px] justify-center"
                >
                  {loading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" />{t("whiteSpaceFinder.scanning", "Scanning…")}</>
                    : <><Sparkles className="w-4 h-4" />{t("whiteSpaceFinder.findGaps", "Find gaps")}</>}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Platform toggle */}
                <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                  {(["both", "amazon", "flipkart"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-2 text-xs font-medium transition-all ${platform === p ? "bg-violet-600 text-white" : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      data-track-id="platform_filter_btn"
                      data-filter-value={p}
                    >
                      {p === "both" ? t("whiteSpaceFinder.both", "Both") : p === "amazon" ? t("whiteSpaceFinder.amazonIn", "Amazon India") : t("whiteSpaceFinder.flipkart", "Flipkart India")}
                    </button>
                  ))}
                </div>

                {/* Category */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 px-3 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-200 focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/20 outline-none"
                  data-track-id="category_filter_select"
                  data-filter-value={category}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === "all" ? t("whiteSpaceFinder.allCategories", "All categories") : c}</option>
                  ))}
                </select>


              </div>

              {/* Quick pills */}
              {!result && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                    Try:
                  </span>
                  {[
                    "kitchen organizer",
                    "baby feeding",
                    "pet grooming",
                    "sleep aid",
                    "skincare tools",
                    "home scent",
                    "gaming accessories",
                    "fitness gear",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error / Paywall Nudge */}
          {error &&
          error === "Monthly scan limit reached. Upgrade for more scans." ? (
            <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-900/30 rounded-2xl shadow-sm text-center overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <CardContent className="p-10 flex flex-col items-center justify-center relative">
                <div className="absolute top-0 right-0 p-32 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />

                <Crown className="w-12 h-12 text-violet-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  You've reached your free scan limit
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
                  Upgrade to unlock unlimited opportunity scans, competitor
                  weakness analysis, and real-time demand trend charts.
                  <br className="hidden sm:block" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Don't let your competitors find these opportunities before
                    you do.
                  </span>
                </p>
                <a
                  href="/subscription"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <Sparkles className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-transform" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </CardContent>
            </Card>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-400 rounded-r-2xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          ) : null}

          {/* Loading state */}
          {loading && (
            <Card className="bg-background border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <CardContent className="p-16 flex flex-col items-center justify-center gap-4 text-center min-h-[450px]">
                <div className="relative flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-violet-600 dark:text-violet-400 animate-spin" />
                  <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/30 scale-150 -z-10 animate-ping opacity-25" />
                </div>
                <div className="space-y-1.5 mt-2">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
                    Scanning competitive landscape…
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm animate-pulse">
                    We are analyzing the data. This may take 1–2 minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Left — cards */}
              <div className="xl:col-span-2 space-y-4">
                {/* Summary bar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {result.total_found} opportunities —{" "}
                      <span className="text-violet-600 dark:text-violet-400">
                        "{result.query}"
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(result?.opportunities ?? []).filter((o) => o.score >= 80).length} {t("whiteSpaceFinder.hotPicks", "hot picks")} ·{" "}
                      {(result?.opportunities ?? []).filter((o) => o.score >= 65 && o.score < 80).length} {t("whiteSpaceFinder.goodGaps", "good gaps")} ·{" "}
                      {(result?.opportunities ?? []).filter((o) => o.score < 50).length} {t("whiteSpaceFinder.toSkip", "to skip")}
                    </p>
                  </div>
                  {result.total_found > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{t("whiteSpaceFinder.topScore", "Top score")}</p>
                      <p className={`text-xl font-bold ${getScoreColor((result?.opportunities ?? []).length > 0 ? Math.max(...result.opportunities.map((o) => o.score)) : 0)}`}>
                        {(result?.opportunities ?? []).length > 0 ? Math.max(...result.opportunities.map((o) => o.score)) : 0}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI market summary — Premium */}
                {isPremium && result.ai_market_summary && (
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-900/40 rounded-2xl">
                    <Bot className="w-4 h-4 text-violet-600 dark:text-violet-450 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">{t("whiteSpaceFinder.aiMarketSummary", "AI market summary")}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono border ${ollamaStatus.status === "ready" ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                          {ollamaStatus.status === "ready" ? "Insydz" : "static fallback"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {result.ai_market_summary}
                      </p>
                    </div>
                  </div>
                )}
                {isPremium && !result.ai_market_summary && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Bot className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("whiteSpaceFinder.aiMarketSummaryUnavailable", "AI market summary unavailable")}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        AI summary could not be generated at this time. Please try again later.
                      </p>
                    </div>
                  </div>
                )}
                {!isPremium && result.total_found > 0 && (
                  <div
                    className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30 rounded-xl cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                    onClick={() => router.push("/subscription")}
                  >
                    <Bot className="w-4 h-4 text-violet-400 dark:text-violet-450 shrink-0" />
                    <p className="text-xs text-violet-600 dark:text-violet-400 flex-1">
                      AI market summary + strategic insights (Insydz) — Premium
                    </p>
                    <ChevronRight className="w-3.5 h-3.5 text-violet-400 dark:text-violet-500" />
                  </div>
                )}

                {/* Related Product Search Suggestions (100% Live DB Only) */}
                {query.trim() && liveSuggestions.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-violet-50/90 via-indigo-50/60 to-purple-50/90 dark:from-slate-900/80 dark:via-indigo-950/25 dark:to-violet-950/35 border border-violet-200/80 dark:border-violet-900/50 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Related high-gap niches to explore for &ldquo;{query}&rdquo;
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        (Click any suggestion to scan instantly)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {liveSuggestions.map((sugg) => (
                        <button
                          key={sugg}
                          onClick={() => {
                            setQuery(sugg);
                            setTimeout(() => {
                              document.getElementById("ws-scan-btn")?.click();
                            }, 50);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-violet-600 hover:text-white hover:border-violet-600 dark:hover:bg-violet-600 dark:hover:border-violet-600 transition-all shadow-2xs group cursor-pointer"
                        >
                          <span>{sugg}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunity cards */}
                {sortedOpps.length > 0 ? (
                  sortedOpps.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opp={opp}
                      tier={tier}
                      onUpgrade={(f) =>
                        showToast(
                          "Upgrade required",
                          `"${f}" requires a higher plan.`,
                          "error",
                        )
                      }
                      onWatchlist={handleWatchlist}
                      watchlistItems={watchlistItems}
                      watchlistLoading={watchlistLoading}
                      onOpenInfoModal={(key) => setActiveInfoModal(key)}
                    />
                  ))
                ) : result.opportunities.length > 0 ? (
                  <Card className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 p-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      No opportunities match your current score filter.
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Try lowering the minimum score or select "Any score".
                    </p>
                    <button
                      onClick={() => setMinScore(0)}
                      className="mt-3 text-xs px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full font-medium text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-850 hover:text-violet-600 dark:hover:text-violet-450 transition-colors shadow-sm"
                    >
                      Clear score filter
                    </button>
                  </Card>
                ) : result.total_found === 0 ? (
                  <Card className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 p-10 text-center shadow-sm">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                      No opportunities found
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                      We couldn't find any products matching{" "}
                      <strong>&quot;{result.query}&quot;</strong>
                      {category !== "all" ? (
                        <span>
                          {" "}
                          in the <strong>{category}</strong> category. Try searching for different product or switch the
                          category to &quot;All categories&quot;.
                        </span>
                      ) : (
                        <span>
                          . This usually means the niche is too small, or there might be a typo. Try searching for a different product.
                        </span>
                      )}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setQuery("");
                          inputRef.current?.focus();
                        }}
                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Clear search
                      </button>
                      {category !== "all" && (
                        <button
                          onClick={() => {
                            setCategory("all");
                            setTimeout(() => {
                              document.getElementById("ws-scan-btn")?.click();
                            }, 50);
                          }}
                          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
                        >
                          Search all categories
                        </button>
                      )}
                    </div>
                  </Card>
                ) : null}

                {/* Locked results */}
                {result.locked_count > 0 &&
                  Array.from({ length: result.locked_count }).map((_, i) => (
                    <LockedCard
                      key={`locked-${i}`}
                      position={sortedOpps.length + i + 1}
                      onUpgrade={(f) =>
                        showToast(
                          "Upgrade required",
                          `"${f}" requires Basic or above.`,
                          "error",
                        )
                      }
                    />
                  ))}

                {/* Free → Basic nudge */}
                {!isBasicPlus && result.total_found > 0 && (
                  <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-900/30 rounded-2xl shadow-sm">
                    <CardContent className="p-6 text-center">
                      <Sparkles className="w-7 h-7 text-violet-400 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {result.locked_count > 0
                          ? `${result.locked_count} more opportunities waiting`
                          : "Unlock the full opportunity analysis"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
                        Basic unlocks all results, score breakdowns, competitor
                        weaknesses, demand signal charts, and the Best Seller
                        gap indicator.
                      </p>
                      <a
                        href="/subscription"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 transition-all"
                      >
                        <Crown className="w-4 h-4" /> Upgrade to Basic —
                        ₹1,999/mo <ArrowRight className="w-4 h-4" />
                      </a>
                    </CardContent>
                  </Card>
                )}

                {/* Basic → Premium nudge */}
                {isBasicPlus && !isPremium && result.total_found > 0 && (
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/35 rounded-2xl shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-amber-600 dark:text-amber-450" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Unlock the full intelligence layer
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Premium adds 90-day trend data, AI strategic insights,
                          entry price recommendations, and CSV export.
                        </p>
                      </div>
                      <a
                        href="/subscription"
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5" /> ₹2,999/mo
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">
                {/* Score distribution */}
                {result.total_found > 0 && (
                  <Card className="shadow-sm border border-slate-200 dark:border-slate-850 rounded-2xl bg-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-violet-500" /> Score
                          distribution
                        </CardTitle>
                        <button
                          type="button"
                          onClick={() => setActiveInfoModal("score-distribution")}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                          title="Click to learn what this card shows"
                        >
                          !
                        </button>
                      </div>
                      <CardDescription className="text-slate-400 dark:text-slate-500">
                        Opportunity quality breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart
                          data={distData}
                          margin={{ left: 0, right: 5, top: 4, bottom: 4 }}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={
                              resolvedTheme === "dark" ? "#1e293b" : "#f1f5f9"
                            }
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 9,
                              fill:
                                resolvedTheme === "dark" ? "#64748b" : "#94a3b8",
                            }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{
                              fontSize: 9,
                              fill:
                                resolvedTheme === "dark" ? "#64748b" : "#94a3b8",
                            }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={chartStyle}
                            formatter={(v: unknown) => [String(v), "Count"]}
                          />
                          <Bar
                            dataKey="count"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          >
                            {distData.map((d, i) => (
                              <Cell key={i} fill={d.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Radar — Basic+ */}
                {isBasicPlus &&
                  radarData.length > 0 &&
                  sortedOpps.length > 0 && (
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-850 rounded-2xl bg-background">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" /> Top pick
                            — score anatomy
                          </CardTitle>
                          <button
                            type="button"
                            onClick={() => setActiveInfoModal("score-anatomy")}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                            title="Click to learn what this card shows"
                          >
                            !
                          </button>
                        </div>
                        <CardDescription className="text-slate-450 dark:text-slate-400 truncate">
                          {sortedOpps[0]?.product_niche}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                          <RadarChart data={radarData}>
                            <PolarGrid
                              stroke={
                                resolvedTheme === "dark" ? "#334155" : "#e2e8f0"
                              }
                            />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{
                                fontSize: 10,
                                fill:
                                  resolvedTheme === "dark"
                                    ? "#94a3b8"
                                    : "#64748b",
                              }}
                            />
                            <PolarRadiusAxis
                              angle={30}
                              tick={{
                                fontSize: 8,
                                fill:
                                  resolvedTheme === "dark"
                                    ? "#64748b"
                                    : "#94a3b8",
                              }}
                            />
                            <Radar
                              name="Score"
                              dataKey="A"
                              stroke="#7F77DD"
                              fill="#7F77DD"
                              fillOpacity={0.18}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                {/* Demand signals */}
                {result.total_found > 0 && (
                  isBasicPlus ? (
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-850 rounded-2xl bg-background">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" /> Demand
                            signals
                          </CardTitle>
                          <button
                            type="button"
                            onClick={() => setActiveInfoModal("demand-signals")}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                            title="Click to learn what this card shows"
                          >
                            !
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        {sortedOpps.slice(0, 6).map((o) => (
                          <div key={o.id} className="flex items-center gap-2.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-28 shrink-0">
                              {o.product_niche.split(" ").slice(0, 3).join(" ")}
                            </span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${o.score}%`,
                                  background:
                                    o.score >= 80
                                      ? "#639922"
                                      : o.score >= 65
                                        ? "#378ADD"
                                        : "#BA7517",
                                }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold w-6 text-right ${getScoreColor(o.score)}`}
                            >
                              {o.score}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-850 rounded-2xl bg-background">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" /> Demand
                            signals
                          </CardTitle>
                          <button
                            type="button"
                            onClick={() => setActiveInfoModal("demand-signals")}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                            title="Click to learn what this card shows"
                          >
                            !
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <div className="space-y-2.5 opacity-60 blur-[3px] pointer-events-none select-none">
                            {[70, 85, 55, 90, 60].map((s, i) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24 shrink-0" />
                                <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-2">
                                  <div
                                    className="h-full rounded-full bg-slate-350 dark:bg-slate-750"
                                    style={{ width: `${s}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Lock className="w-4 h-4 text-amber-500" />
                            <button
                              onClick={() => router.push("/subscription")}
                              className="text-xs px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full shadow-sm font-medium text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-800 hover:text-violet-650 dark:hover:text-violet-400 transition-colors"
                            >
                              Unlock — Basic ₹1,999/mo
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}

                {/* Watchlist preview */}
                {watchlistItems.length > 0 && (
                  <Card className="shadow-sm border border-violet-200 dark:border-violet-850/45 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-sm font-semibold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                            <Bookmark className="w-4 h-4 fill-violet-600 dark:fill-violet-500" />{" "}
                            Watchlist ({watchlistItems.length})
                          </CardTitle>
                          <button
                            type="button"
                            onClick={() => setActiveInfoModal("watchlist")}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 hover:bg-violet-200 dark:hover:bg-violet-800 text-[11px] font-bold text-violet-600 dark:text-violet-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                            title="Click to learn what this card shows"
                          >
                            !
                          </button>
                        </div>
                        <button
                          onClick={() => router.push("/explorer/my-watchlist")}
                          className="text-[10px] text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium flex items-center gap-1"
                        >
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {watchlistItems.slice(0, 4).map((item) => (
                        <div
                          key={item.niche}
                          className="flex items-center justify-between text-xs group"
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-slate-700 dark:text-slate-305 truncate font-medium">
                              {item.niche}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              {item.category} · score {item.score}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSidebarRemove(item)}
                            className="text-slate-300 dark:text-slate-600 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {watchlistItems.length > 4 && (
                        <button
                          onClick={() => router.push("/explorer/my-watchlist")}
                          className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline mt-1 font-medium"
                        >
                          +{watchlistItems.length - 4} more — view all
                        </button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* How scoring works */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-850 rounded-2xl bg-background">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-705 dark:text-slate-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />{" "}
                        How scoring works
                      </CardTitle>
                      <button
                        type="button"
                        onClick={() => setActiveInfoModal("scoring-works")}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors shrink-0 shadow-sm cursor-pointer"
                        title="Click to learn what this card shows"
                      >
                        !
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      {
                        label: "Rating gap",
                        desc: "Avg competitor rating below 4.0 = opportunity",
                        pts: "+32",
                        color: "#3b82f6",
                      },
                      {
                        label: "Review thinness",
                        desc: "Fewer than 150 reviews = easy to outrank",
                        pts: "+32",
                        color: "#8b5cf6",
                      },
                      {
                        label: "Demand signal",
                        desc: "High sales volume = proven buyer intent",
                        pts: "+24",
                        color: "#10b981",
                      },
                      {
                        label: "Price gap",
                        desc: "MRP vs. selling price spread = margin room",
                        pts: "+12",
                        color: "#f59e0b",
                      },
                    ].map((s) => (
                      <div key={s.label} className="flex items-start gap-2.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: s.color }}
                        />
                        <div>
                          <p className="text-xs font-medium text-slate-750 dark:text-slate-350">
                            {s.label}{" "}
                            <span className="text-slate-400 dark:text-slate-500 font-normal">
                              ({s.pts})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-1 text-center">
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/20 rounded-2xl flex items-center justify-center mb-4 border border-violet-100 dark:border-violet-900/30">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                Find your next winning product
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md leading-relaxed mb-4">
                Scan any product to surface real white spaces — niches with high
                demand and weak competition on Amazon India and Flipkart India.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 w-full max-w-xl">
                {[
                  {
                    icon: <Star className="w-4 h-4 text-amber-500" />,
                    label: "Rating gap analysis",
                  },
                  {
                    icon: <Users className="w-4 h-4 text-blue-500" />,
                    label: "Real competitor data",
                  },
                  {
                    icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
                    label: "Live sales estimates",
                  },
                  {
                    icon: <Package className="w-4 h-4 text-violet-500" />,
                    label: "Best Seller gap signal",
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col items-center gap-2 p-3.5 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm"
                  >
                    {f.icon}
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/30 text-xs text-amber-750 dark:text-amber-400 mb-6">
                <BookOpen className="w-4 h-4 shrink-0" />
                Free: 3 scans / 3 results · Basic: 20 scans + all results ·
                Premium: unlimited + AI insights
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "kitchen organizer",
                  "baby feeding",
                  "pet grooming",
                  "sleep aid",
                  "skincare tools",
                  "home scent",
                  "gaming accessories",
                  "fitness gear",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      setTimeout(runScan, 50);
                    }}
                    className="text-xs px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-200 dark:hover:border-violet-850 hover:text-violet-600 dark:hover:text-violet-300 transition-colors shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Interactive Info Modal (Clickable for Mobile & Desktop) ── */}
        {activeInfoModal &&
          INFO_MODALS[activeInfoModal] &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setActiveInfoModal(null)}
            >
              <div
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {INFO_MODALS[activeInfoModal].title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {INFO_MODALS[activeInfoModal].subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Detailed Explanatory Content */}
                <div className="max-h-[65vh] overflow-y-auto pr-1">
                  {INFO_MODALS[activeInfoModal].content}
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal(null)}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}

export default function WhiteSpaceFinder() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      }
    >
      <WhiteSpaceFinderContent />
    </Suspense>
  );
}
