import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronDown, ChevronRight, Users, Store, TrendingUp,
  ShoppingBag, Briefcase, Target, Zap, ArrowRight,
  CheckCircle2, Package, BarChart3, Globe,
  Menu, X, Sun, Moon, Code, Trophy, BookOpen,
  Video, FileText, MessageCircle, Bell, Search, TrendingDown,
  Flame, Presentation, ArrowLeft, Play, AlertCircle,
  Link as LinkIcon, Layers, RefreshCw,
  Mail, Facebook, Instagram, Linkedin, Twitter, BellRing, Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

// ── Navigation Types & Data ────────────────────────────────────────────────────
type MenuItemWithBadge = {
  name: string;
  icon: JSX.Element;
  badge?: string;
  route?: string;
};

type NavigationMenu = {
  Solutions: MenuItemWithBadge[];
  "Use Cases": MenuItemWithBadge[];
  Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[];
  Resources: MenuItemWithBadge[];
  Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[];
  About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers", icon: <Store className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies", icon: <Briefcase className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers", icon: <Users className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features (Overview)", icon: <Layers className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <TrendingDown className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer", icon: <BarChart3 className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <TrendingDown className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker", icon: <Search className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name: "Expert Blog", icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    { name: "Insydz vs Helium 10", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
    { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name: "Our Vision", icon: <Globe className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Users className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Mail className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

// ── Feature Mock UI Components ─────────────────────────────────────────────────
function PriceTrackingMock() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1600); return () => clearInterval(t); }, []);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Price Monitor</span>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${pulse ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pulse ? "bg-green-500" : "bg-orange-500"} animate-pulse`} />
          {pulse ? "Monitoring" : "Alert Sent"}
        </span>
      </div>
      {[
        { name: "Competitor A", price: "₹1,249", change: "-₹150", color: "text-red-600", bg: "bg-red-50" },
        { name: "Your Product", price: "₹1,399", change: "₹0", color: "text-gray-500", bg: "bg-gray-50" },
        { name: "Competitor B", price: "₹1,299", change: "-₹80", color: "text-orange-600", bg: "bg-orange-50" },
      ].map((r, i) => (
        <div key={i} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl mb-2 ${r.bg} dark:bg-opacity-10`}>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`text-xs font-semibold ${r.color}`}>{r.change}</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{r.price}</span>
          </div>
        </div>
      ))}
      <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center gap-2">
        <span className="text-xs text-green-700 dark:text-green-400 font-medium">WhatsApp: Competitor A dropped ₹150. React now.</span>
      </div>
    </div>
  );
}

function ReviewAnalyticsMock() {
  const bars = [
    { label: "5★", pct: 62, color: "bg-green-500" },
    { label: "4★", pct: 18, color: "bg-green-400" },
    { label: "3★", pct: 9, color: "bg-yellow-400" },
    { label: "2★", pct: 6, color: "bg-orange-400" },
    { label: "1★", pct: 5, color: "bg-red-500" },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Review Intelligence</span>
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">2,841 reviews</span>
      </div>
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs w-6 text-gray-500">{b.label}</span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 sm:h-2">
              <div className={`${b.color} h-1.5 sm:h-2 rounded-full transition-all`} style={{ width: `${b.pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-7">{b.pct}%</span>
          </div>
        ))}
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-2.5 sm:p-3">
        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">⚠ Top complaint (23 mentions)</p>
        <p className="text-xs text-red-600 dark:text-red-300">"Packaging damaged during delivery" fix to improve rating</p>
      </div>
    </div>
  );
}

function PriceOptMock() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Price Suggestion</span>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Updated 2m ago</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {[
          { label: "Current", value: "₹1,399", note: "Your price", color: "border-gray-200" },
          { label: "Suggested", value: "₹1,279", note: "+12% sales", color: "border-orange-400 bg-orange-50 dark:bg-orange-900/20" },
          { label: "Floor", value: "₹1,180", note: "Min margin", color: "border-gray-200" },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border-2 p-2 sm:p-3 text-center ${c.color}`}>
            <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">{c.label}</p>
            <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-400">{c.note}</p>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-2.5 sm:p-3">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">AI: Drop ₹120 now — competitors are ₹1,249. Win more Buy Box without hurting margins.</p>
      </div>
    </div>
  );
}

function KeywordMock() {
  const kws = [
    { kw: "wireless earbuds india", rank: 3, change: +2, color: "text-green-600" },
    { kw: "bluetooth earphones under 1500", rank: 7, change: -1, color: "text-red-500" },
    { kw: "boat earbuds amazon", rank: 12, change: +5, color: "text-green-600" },
    { kw: "noise cancelling earbuds", rank: 18, change: 0, color: "text-gray-400" },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Keyword Rankings</span>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Daily update</span>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {kws.map((k, i) => (
          <div key={i} className="flex items-center gap-2 p-2 sm:p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span className="text-xs text-gray-400 w-5">#{k.rank}</span>
            <span className="text-xs flex-1 text-gray-700 dark:text-gray-300 truncate">{k.kw}</span>
            <span className={`text-xs font-bold ${k.color}`}>
              {k.change > 0 ? `↑${k.change}` : k.change < 0 ? `↓${Math.abs(k.change)}` : "–"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductResearchMock() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opportunity Score</span>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">High Demand</span>
      </div>
      <div className="text-center mb-3 sm:mb-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-400 flex items-center justify-center mx-auto mb-2">
          <span className="text-xl sm:text-2xl font-black text-orange-600">87</span>
        </div>
        <p className="text-xs text-gray-500">out of 100</p>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {[
          { label: "Search Demand", val: 92, color: "bg-green-500" },
          { label: "Competition Level", val: 34, color: "bg-orange-400" },
          { label: "Margin Potential", val: 78, color: "bg-blue-500" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24 sm:w-28">{m.label}</span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 sm:h-2">
              <div className={`${m.color} h-1.5 sm:h-2 rounded-full`} style={{ width: `${m.val}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-7 sm:w-8">{m.val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMock() {
  const insights = [
    {  text: "Reduce price by ₹80 to recapture Buy Box 3 competitors below you", tag: "Pricing", tagColor: "bg-orange-100 text-orange-700" },
    {  text: "Improve packaging: 31 reviews mention damage in transit this month", tag: "Product", tagColor: "bg-red-100 text-red-700" },
    {  text: "You lost rank for 'wireless earbuds' add keyword to title", tag: "SEO", tagColor: "bg-blue-100 text-blue-700" },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Recommendations</span>
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">3 new today</span>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{ins.text}</p>
                <span className={`inline-block mt-1 sm:mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${ins.tagColor}`}>{ins.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppMock() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => Math.min(v + 1, 3)), 900);
    return () => clearInterval(t);
  }, []);
  const msgs = [
    "Insydz Alert: Competitor A dropped price to ₹1,249 (-₹150)",
    "Buy Box at risk for ASIN B08X7GH21K — act within 2 hours",
    "You updated price to ₹1,269. Buy Box secured.",
  ];
  return (
    <div className="bg-[#0b141a] rounded-2xl border-2 border-gray-700 p-4 sm:p-5 shadow-lg min-h-[180px] sm:min-h-[200px]">
      <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-700">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Insydz Alerts</p>
          <p className="text-xs text-gray-400">WhatsApp Business</p>
        </div>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {msgs.slice(0, visible).map((m, i) => (
          <div key={i} className="bg-[#1f2c34] rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 max-w-[90%]">
            <p className="text-xs text-gray-200 leading-relaxed">{m}</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 text-right">✓✓</p>
          </div>
        ))}
        {visible === 0 && <p className="text-xs text-gray-600 text-center pt-3 sm:pt-4">Simulating alerts...</p>}
      </div>
    </div>
  );
}

function FestiveTrendMock() {
  const festivals = [
    { name: "Diwali", days: 12, demand: 94, color: "bg-orange-500" },
    { name: "Big Billion Day", days: 5, demand: 88, color: "bg-blue-500" },
    { name: "Dussehra", days: 19, demand: 71, color: "bg-yellow-500" },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Festive Demand Forecast</span>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">🔥 Upcoming</span>
      </div>
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {festivals.map((f, i) => (
          <div key={i} className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{f.name}</span>
              <span className="text-xs text-gray-500">in {f.days} days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div className={`${f.color} h-1.5 sm:h-2 rounded-full`} style={{ width: `${f.demand}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-7 sm:w-8">{f.demand}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-2.5 sm:p-3">
        <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Stock up on earbuds now — Diwali demand peaks 12 days out. Competitors already raising prices.</p>
      </div>
    </div>
  );
}

// ── Feature Section Component ──────────────────────────────────────────────────
interface FeatureSectionProps {
  id: string;
  tag?: string;
  tagColor?: string;
  h2: string;
  desc: string;
  outcomes: string[];
  howItWorks: string;
  scenario?: string;
  route: string;
  mock: JSX.Element;
  flip?: boolean;
  gradient: string;
  icon: JSX.Element;
  bg?: string;
}

function FeatureSection({ id, tag, tagColor, h2, desc, outcomes, howItWorks, scenario, route, mock, flip, gradient, icon, bg }: FeatureSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <section id={id} className={`py-12 sm:py-14 md:py-16 px-4 ${bg || "bg-white dark:bg-gray-950"}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center ${flip ? "lg:grid-flow-col" : ""}`}>
          {/* Text Side */}
          <div className={flip ? "lg:order-2" : ""}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                {icon}
              </div>
              {tag && (
                <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${tagColor || "bg-orange-100 text-orange-700"}`}>
                  {tag}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">{h2}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5">{desc}</p>

            <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              {outcomes.map((o, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{o}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 mb-3 sm:mb-4 group"
            >
              <Play className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
              {expanded ? "Hide details" : "See how this works"}
            </button>

            {expanded && (
              <div className="mb-4 sm:mb-5 space-y-2 sm:space-y-3">
                <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-xl">
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{howItWorks}</p>
                </div>
                {scenario && (
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">📌 Real Scenario</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">{scenario}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href={route} className={`bg-gradient-to-r ${gradient} text-white font-bold px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center text-xs sm:text-sm`}>
                View Feature
                <ArrowRight className="ml-1 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <a href="/signup" className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm inline-block">
                Try free
              </a>
            </div>
          </div>

          {/* Visual Side */}
          <div className={`${flip ? "lg:order-1" : ""} mt-4 lg:mt-0`}>
            {mock}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ Accordion ──────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Do I get access to all features on the free plan?", a: "Yes. When you start free on Insydz, you get access to all core features including competitor price tracking, review analytics, keyword rank tracking, and AI recommendations with usage limits. You can start tracking your first products immediately with no credit card required. Upgrade when you need more products, more competitors, or more alerts." },
  { q: "Is Insydz available for both Amazon India and Flipkart?", a: "Yes. Insydz is one of the only all-in-one seller tools built specifically for both Amazon India and Flipkart. You can track competitor prices, keyword rankings, and review analytics across both platforms from a single dashboard." },
  { q: "How does Insydz's competitor price tracking work for Indian sellers?", a: "Insydz continuously monitors competitor product listings on Amazon India and Flipkart. When a price change is detected, Insydz calculates the impact on your Buy Box position, compares it against your floor price, and sends you a WhatsApp alert in real time so you can act before you lose sales." },
  { q: "Can Insydz analyze Amazon reviews automatically?", a: "Yes. Insydz automatically analyzes customer reviews across your Amazon India and Flipkart listings. It identifies complaint clusters, recurring themes, and sentiment trends surfacing patterns like packaging damage, sizing issues, or quality complaints before they compound. You don't need to read every review manually." },
  { q: "Is this an amazon repricing software for Indian sellers?", a: "Insydz includes AI-powered price optimization that suggests the right price based on competitor data, demand signals, and your margin floor. Unlike automated repricing tools that just match the lowest price (and destroy margins), Insydz recommends the optimal price giving you context and control before you make the change." },
  { q: "Do I need technical knowledge to use Insydz?", a: "No. Insydz is built for Indian sellers not developers. Setup takes 2 minutes. You connect your seller account, add your products, and Insydz starts surfacing insights and recommendations immediately. No spreadsheets, no complex configurations, no technical skills required." },
  { q: "How often is data updated across features?", a: "Price tracking and competitor monitoring run continuously. Keyword rankings are updated daily. Review analytics are refreshed every 24–48 hours depending on your plan. WhatsApp alerts are sent in real time the moment a critical change is detected." },
  { q: "Can I upgrade only for specific features?", a: "Insydz is one integrated platform all features work together and are included in each plan tier. You cannot purchase features individually, because the intelligence value comes from features connecting with each other. You can start free and upgrade to a higher plan as your seller business scales." },
  { q: "How is Insydz different from SellerApp, Helium 10, or similar tools?", a: "SellerApp and Helium 10 are primarily built for global (US-centric) Amazon markets. They don't natively support Flipkart, don't send WhatsApp alerts, and aren't optimized for Indian seller economics (INR pricing, Indian festive seasons, Indian competition patterns). Insydz is built from the ground up for Amazon India and Flipkart sellers not adapted from a foreign tool." },
  { q: "What is the best all-in-one seller tool for Amazon India?", a: "For Indian sellers who need competitor price tracking, review analytics, keyword ranking, AI pricing, and WhatsApp alerts in one platform Insydz is built specifically for Amazon India and Flipkart. It's the only all-in-one seller tool India that combines all these features with native support for both marketplaces and WhatsApp-first alerts." },
];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AllFeaturesPage() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    isDarkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = (name: string) => setMobileActiveMenu(mobileActiveMenu === name ? null : name);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };

  const scrollToSection = (sectionId: string) => {
    setLocation('/');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ── Reusable Dropdown ────────────────────────────────────────────────────────
  const DesktopDropdown = ({ label, menuKey, accent = false }: { label: string; menuKey: keyof NavigationMenu; accent?: boolean }) => (
    <div className="relative">
      <button
        onMouseEnter={() => setActiveDropdown(label)}
        className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-${accent ? "semibold" : "medium"} rounded-lg flex items-center gap-1 transition-all ${
          accent
            ? "text-orange-600 dark:text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === label ? "rotate-180" : ""}`} />
      </button>
      {activeDropdown === label && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
        >
             {navigationMenu[menuKey].map((item, i) => (
            item.route ? (
              <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className={`w-full px-4 py-2.5 transition-colors flex items-center gap-3 group ${accent ? "hover:bg-orange-50 dark:hover:bg-orange-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                <span className={`group-hover:scale-110 transition-transform flex-shrink-0 ${accent ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">{item.badge}</span>}
              </Link>
            ) : (
              <span key={i} className={`w-full px-4 py-2.5 flex items-center gap-3 opacity-60 cursor-default`}>
                <span className={`flex-shrink-0 ${accent ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );

  const MobileMenuSection = ({ label, menuKey }: { label: string; menuKey: keyof NavigationMenu }) => (
    <div>
      <button
        onClick={() => toggleMobileMenu(label)}
        className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${
          label === "Solutions"
            ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
            : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        }`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
      </button>
      {mobileActiveMenu === label && (
        <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
         {navigationMenu[menuKey].map((item, i) => (
            item.route ? (
              <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg ${label === "Solutions" ? "hover:bg-orange-50 dark:hover:bg-orange-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
              </Link>
            ) : (
              <span key={i} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );

  // ── Feature Sections Data ─────────────────────────────────────────────────────
  const features: FeatureSectionProps[] = [
    {
      id: "price-tracking",
      h2: "Competitor Price Tracking React Before You Lose the Buy Box",
      desc: "Track every competitor price movement across Amazon India and Flipkart in real time. Not once a day. Continuously. When a competitor drops their price by ₹150 at 11 PM, Insydz catches it, calculates the impact on your Buy Box position, and pings you on WhatsApp before you wake up and before you lose sales.",
      outcomes: ["Real-time price change detection across unlimited competitors", "Floor price alerts so you never discount below your margin", "Buy Box win/loss tracking with actionable guidance", "Price history graphs to spot seasonal patterns"],
      howItWorks: "Insydz monitors every competitor listing linked to your products 24/7. The moment a price drops beyond your threshold, you get an instant WhatsApp alert with the competitor name, ASIN, price change, and a recommended response so you can act in minutes, not hours.",
      scenario: "A Bluetooth earbuds seller in Chennai tracks 8 competitors. When one drops to ₹1,249, Insydz sends a WhatsApp alert: 'Competitor A dropped ₹150. Your Buy Box is at risk. Suggested response: ₹1,279 (+12% sales, above floor price).' He acts in 8 minutes. Buy Box secured.",
      route: "/features/competitor-price-tracking-feature",
      mock: <PriceTrackingMock />,
      gradient: "from-orange-500 to-red-500",
      icon: <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-white dark:bg-gray-950",
    },
    {
      id: "review-analytics",
      h2: "Review Analytics Analyze Amazon Reviews Automatically",
      desc: "Most Indian sellers read reviews only when something goes wrong. By then, 30+ customers have already seen the complaints and chosen a competitor. Insydz automatically analyzes thousands of customer reviews across your listings to surface patterns, complaint clusters, and product improvement opportunities before they tank your rating.",
      outcomes: ["Automated theme detection: packaging complaints, size issues, delivery damage", "Sentiment tracking over time are ratings improving or declining?", "Competitor review gaps: what customers love about rivals that you're missing", "Actionable fix suggestions tied to review patterns"],
      howItWorks: "Insydz ingests all reviews for your products and competitors, runs sentiment analysis, clusters repeated complaints, and surfaces the top 3 things customers hate and love. You get a weekly digest and real-time flag when a new complaint pattern emerges.",
      scenario: "A kitchenware seller in Delhi notices her 4-star product keeps getting reviews mentioning 'handle broke after 2 weeks.' She didn't catch it for 6 weeks 23 mentions went unaddressed. With Insydz review analytics, the complaint cluster surfaces in day 3, tagged and prioritized. She sources a better handle. Rating goes from 4.1 to 4.6 in 8 weeks.",
      route: "/features/review-analytics-feature",
      mock: <ReviewAnalyticsMock />,
      flip: true,
      gradient: "from-purple-500 to-pink-500",
      icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-gray-50 dark:bg-gray-900",
    },
    {
      id: "price-optimization",
      h2: "AI Price Optimization Stop Guessing, Start Winning",
      desc: "Pricing on Amazon India isn't about being the cheapest. It's about pricing at the exact point where you win the most sales without destroying your margin. Insydz uses competitor data, demand signals, and market trends to generate AI-backed pricing suggestions specific to your product, your category, and your margin structure.",
      outcomes: ["AI price suggestions updated in real time based on live competitor pricing", "Demand-adjusted recommendations during festive seasons and sales events", "Clear 'suggested vs floor' breakdowns in INR", "No more manual spreadsheet repricing"],
      howItWorks: "The AI analyses your current price, floor price, competitor landscape, and historical demand patterns to recommend an optimal price point. It factors in festive periods, competitor gaps, and Buy Box velocity — giving you one clear number with a reason.",
      scenario: "A fashion accessories seller in Mumbai is pricing at ₹1,399. Insydz's AI price engine shows: Suggested ₹1,279 (+12% projected sales), Floor ₹1,180 (minimum margin). It flags: 'Drop ₹120 now — 3 competitors are at ₹1,249. Win more Buy Box without hurting margins.' She makes the change. Sales jump 18% in 3 days.",
      route: "/features/price-optimization-feature",
      mock: <PriceOptMock />,
      gradient: "from-blue-500 to-cyan-500",
      icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-white dark:bg-gray-950",
    },
    {
      id: "keyword-tracking",
      h2: "Keyword & Rank Tracking Own the Search Results on Amazon & Flipkart",
      desc: "If customers can't find your product, price and quality don't matter. Keyword rank on Amazon India and Flipkart is the invisible lever that controls your visibility and most sellers have no idea where they stand. Insydz tracks your daily keyword rankings, shows you exactly what your competitors rank for, and recommends the actions that will improve your organic visibility.",
      outcomes: ["Daily rank tracking for all target keywords on Amazon India & Flipkart", "Competitor keyword gap analysis keywords they rank for that you don't", "Rank movement alerts: when you drop, Insydz tells you why and what to fix", "SEO action recommendations: title updates, backend keyword fixes, A+ content suggestions"],
      howItWorks: "Enter your target keywords and competitor ASINs. Insydz tracks rank positions daily, shows movement trends, identifies keyword gaps your competitors exploit, and alerts you when you drop significantly so you can update listings before traffic drops.",
      scenario: "An electronics reseller in Hyderabad is losing rank for 'noise cancelling earbuds under 2000.' Insydz shows: Rank #12 → dropped 5 spots this week. Competitor A added this exact keyword to their title. Insydz recommends: 'Add to product title. Expected rank improvement: +4–6 positions.' He updates the title. Rank recovers in 11 days.",
      route: "/features/keyword-rank-tracking-feature",
      mock: <KeywordMock />,
      flip: true,
      gradient: "from-green-500 to-emerald-500",
      icon: <Search className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-gray-50 dark:bg-gray-900",
    },
    {
      id: "product-research",
      h2: "Product Research — Find What Sells Before You Invest a Rupee",
      desc: "The most expensive mistake in Indian e-commerce is sourcing the wrong product. A product that looks promising in a marketplace browse can have crushing competition, thin margins, and a 2.8-star review average all invisible until after you've paid a manufacturer. Insydz's product research tool gives you an Opportunity Score for any product before you launch.",
      outcomes: ["Opportunity Score out of 100 combining demand, competition, and margin potential", "Search demand data: how many buyers are actively looking", "Competition level: how hard is it to rank and win sales in this category?", "Margin potential: can this product actually make money at current market prices?"],
      howItWorks: "Search any category or keyword. Insydz scores each opportunity on demand volume, competition density, average margins, and review sentiment giving you an Opportunity Score so you can compare and prioritize before committing inventory.",
      scenario: "A new seller in Coimbatore is deciding between two product ideas. Product A: Score 87/100 Search Demand 92%, Competition 34%, Margin Potential 78%. Product B: Score 41/100 flooded category, thin margins. He goes with Product A. Sells ₹1.2L in the first month without any paid ads.",
      route: "/features/product-research-feature",
      mock: <ProductResearchMock />,
      gradient: "from-yellow-500 to-orange-500",
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-white dark:bg-gray-950",
    },
    {
      id: "ai-recommendations",
      h2: "AI Recommendations Know Exactly What to Do Next",
      desc: "Data without direction is noise. Most Amazon seller tools give you charts and leave you to figure out what to do. Insydz gives you a clear, prioritized action list every day so you always know your next move. No dashboard fatigue. No missed alerts buried in a report. Just three things that will move your business forward today.",
      outcomes: ["Daily AI-generated action recommendations across pricing, SEO, and product quality", "Priority-ranked actions: highest-impact tasks surface first", "Cross-feature intelligence: one recommendation combines insights from price, review, and keyword data", "Clear next steps tied to specific products and listings"],
      howItWorks: "Every morning, Insydz's AI synthesizes your price data, reviews, keyword movements, and competitor actions into a prioritized recommendation list. Each card explains what changed, why it matters, and exactly what you should do in plain language.",
      scenario: "A D2C skincare brand in Pune logs into Insydz. Three recommendations waiting: (1) Pricing 'Reduce price by ₹80 to recapture Buy Box 3 competitors are below you.' (2) Product 'Improve packaging: 31 reviews mention damage in transit this month.' (3) SEO 'You lost rank for wireless earbuds add keyword to title.' Three actions. Twenty minutes. Done.",
      route: "/features/ai-recommendations-feature",
      mock: <AIMock />,
      flip: true,
      gradient: "from-violet-500 to-purple-600",
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-gray-50 dark:bg-gray-900",
    },
    {
      id: "whatsapp-alerts",
      tag: "NEW",
      tagColor: "bg-green-100 text-green-700",
      h2: "WhatsApp Alerts Critical Seller Alerts, Delivered Where You Actually Are",
      desc: "Indian sellers don't sit at a desktop refreshing dashboards. You're at a factory, at a warehouse, on a call, or managing a family business from a phone. That's why Insydz delivers all critical alerts directly to WhatsApp. When something changes that needs your attention price drop, rank fall, review spike you hear about it in seconds, not hours.",
      outcomes: ["Instant WhatsApp notifications for price changes, Buy Box loss, and rank drops", "Formatted alerts with context: what happened, what's at risk, and what to do", "No more missed emails, ignored push notifications, or skipped dashboards", "Configurable alert types: choose what you want to be notified about"],
      howItWorks: "Connect your WhatsApp number in one click. You choose which events trigger alerts competitor price drops, Buy Box loss, ranking falls, review spikes. Each alert includes the context and a recommended action. No login required to act.",
      scenario: "It's 9:30 PM. A kitchenware seller from Rajkot is done for the day. His phone buzzes on WhatsApp: 'Insydz Alert: Competitor A dropped to ₹1,249 (−₹150). Buy Box at risk for ASIN B08X7GH21K act within 2 hours.' He adjusts price from his phone. WhatsApp confirms: 'You updated to ₹1,269. Buy Box secured.' Total time: 4 minutes.",
      route: "/features/whatsapp-alerts-feature",
      mock: <WhatsAppMock />,
      gradient: "from-green-500 to-emerald-600",
      icon: <Bell className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-white dark:bg-gray-950",
    },
    {
      id: "festive-trend",
      tag: "Coming Soon 2026",
      tagColor: "bg-orange-100 text-orange-700",
      h2: "Festive Trend Intelligence Win Diwali Before It Starts",
      desc: "Diwali, Big Billion Day, Navratri, and Republic Day Sale are the biggest revenue opportunities of the year for Indian sellers. Most miss them not because they don't try, but because they start preparing too late. Insydz Festive Trend Intelligence gives you demand forecasts 12–15 days ahead of major festive events, so you can stock, price, and rank before the rush hits.",
      outcomes: ["Festive demand forecast timelines: Diwali in 12 days demand at 94%", "Category-specific product recommendations for pre-festive stocking", "Festive keyword identification: which search terms spike before each event", "Competitor festive pricing alerts: when rivals start raising prices pre-event"],
      howItWorks: "Insydz tracks historical festive demand patterns across Amazon India and Flipkart, then forecasts demand curves for your category 30 days in advance. You get a countdown dashboard with recommended actions stock levels, pricing moves, and keyword priorities timed for maximum impact.",
      scenario: "It's October 10th. Insydz alerts a home décor seller: 'Diwali demand peaks in 12 days. Earbuds and lighting accessories trending. 4 competitors already raising prices. Stock up. Update festive keywords now.' The seller acts immediately, optimizes listings, and captures early festive traffic while competitors are still reacting.",
      route: "/features/festive-trend-feature",
      mock: <FestiveTrendMock />,
      flip: true,
      gradient: "from-orange-400 to-yellow-500",
      icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />,
      bg: "bg-gray-50 dark:bg-gray-900",
    },
  ];

  const flowSteps = [
    { from: "Competitor drops price", to: "Pricing insight triggered", icon: <TrendingDown className="w-4 h-4" /> },
    { from: "Review complaint spike", to: "Product improvement flagged", icon: <MessageCircle className="w-4 h-4" /> },
    { from: "Keyword rank drops", to: "SEO action recommended", icon: <Search className="w-4 h-4" /> },
    { from: "All critical events", to: "WhatsApp alert in seconds", icon: <Bell className="w-4 h-4" /> },
  ];

  const whyPoints = [
    { icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6" />, title: "No tool switching", desc: "Tool switching costs you time you're spending 90 minutes a day managing dashboards instead of your business. All intelligence in one place." },
    { icon: <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />, title: "No data overload", desc: "Isolated tools don't talk to each other. Insydz surfaces actions, not raw numbers. You see what to do not just what happened." },
    { icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Clear actions always", desc: "A chart showing keyword rank is not a recommendation. Every Insydz insight comes with an exact next step, not a chart to interpret." },
    { icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Built for India", desc: "Amazon India and Flipkart not a global tool retrofitted for Indian markets. INR pricing, Indian festive seasons, Indian competition patterns." },
  ];

  const sellerStages = [
    {  title: "New Sellers", desc: "Starting on Amazon or Flipkart and not sure what products to sell or how to price them? Use Insydz's product research tool to identify high-demand, low-competition opportunities before you spend a rupee on inventory.", cta: "Start Free →", ctaRoute: "/signup", gradient: "from-green-500 to-emerald-500" },
    {  title: "Growing Sellers", desc: "Already selling but feeling like competitors are always one step ahead? Insydz's competitor price tracking, WhatsApp alerts, and AI recommendations keep you ahead of price drops, rank changes, and review crises automatically.", cta: "Try Growth Plan →", ctaRoute: "/pricing", gradient: "from-blue-500 to-cyan-500" },
    {  title: "D2C Brands", desc: "Building a brand on Amazon India or Flipkart? Review analytics helps you understand how customers actually experience your product. AI recommendations surface the product quality improvements and pricing adjustments that protect your brand rating.", cta: "Start Free →", ctaRoute: "/signup", gradient: "from-purple-500 to-pink-500" },
    {  title: "Agencies & Brand Managers", desc: "Managing multiple seller accounts? Insydz gives you a single intelligence layer across all your clients — with daily AI recommendations, automated alerts, and clear reporting that makes client reviews faster and decisions sharper.", cta: "Book a Demo →", ctaRoute: "/about/contact-us", gradient: "from-orange-500 to-red-500" },
  ];

  const roiRows = [
    { situation: "Missed Buy Box for 4 days (competitor undercut by ₹100)", impact: "~₹8,000–15,000 in lost sales" },
    { situation: "Unaddressed review complaint pattern drops rating from 4.4 to 4.0", impact: "~15–20% drop in conversion rate" },
    { situation: "Keyword rank drops 6 positions without notice", impact: "~30–40% reduction in organic impressions" },
    { situation: "Wrong product launch (low demand, high competition)", impact: "₹30,000–₹1,50,000 in stranded inventory" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/features" />
        <title>Everything You Need to Sell Smarter on Amazon & Flipkart</title>
        <meta name="description" content="Insydz combines competitor intelligence, pricing insights, review analytics, SEO tracking, and real-time alerts — all built for Indian sellers." />
      </Helmet>

      {/* ═══ NAVIGATION ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <a href="/" className="flex items-center space-x-1 group">
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-auto shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </a>
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2" ref={dropdownRef}>
              <DesktopDropdown label="Solutions" menuKey="Solutions" accent />
              <DesktopDropdown label="Use Cases" menuKey="Use Cases" />
              <DesktopDropdown label="Features" menuKey="Features" />
              <Link href="/pricing" className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</Link>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare" menuKey="Compare" />
              <DesktopDropdown label="Resources" menuKey="Resources" />
              <DesktopDropdown label="About" menuKey="About" />
              <a href="/login" className="ml-1 xl:ml-2 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">Login</a>
              <button className="ml-1 xl:ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1 sm:space-y-2">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              <MobileMenuSection label="Solutions" menuKey="Solutions" />
              <MobileMenuSection label="Use Cases" menuKey="Use Cases" />
              <MobileMenuSection label="Features" menuKey="Features" />
               <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">Pricing</Link>
              <MobileMenuSection label="Free Tools" menuKey="Free Tools" />
              <MobileMenuSection label="Compare" menuKey="Compare" />
              <MobileMenuSection label="Resources" menuKey="Resources" />
              <MobileMenuSection label="About" menuKey="About" />
               <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2.5 rounded-lg font-semibold block text-sm">Login</a>
              <button className="mt-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pb-3 sm:pb-4 pt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800">
        <a href="/signup" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 sm:py-4 rounded-full shadow-xl text-sm sm:text-base flex items-center justify-center">
          Start Free — No Credit Card
        </a>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-red-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-orange-700">Built for Indian Sellers 🇮🇳</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                The Only All-in-One
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Seller Tool Built for India
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Stop juggling 5 different dashboards to run your Amazon or Flipkart business. Insydz combines competitor tracking, review intelligence, keyword ranking, AI pricing, and WhatsApp alerts
                <span className="text-orange-700 font-semibold"> one connected platform for India's growing sellers.</span>
              </p>

              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                Whether you're selling electronics in Surat, apparel in Tirupur, or managing 30 brands from an agency in Bengaluru Insydz gives you the intelligence to act first, price smarter, and sell more.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                    <a href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-16 sm:px-8 py-3 sm:py-2 text-sm sm:text-base md:text-sm rounded-full shadow-2xl transition-all inline-flex items-center justify-center">
                  Start Free No Credit Card Required
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
                <Button onClick={() => document.getElementById("price-tracking")?.scrollIntoView({ behavior: "smooth" })} size="lg" variant="outline" className="w-full sm:w-auto border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                {["Built for Amazon India & Flipkart 🇮🇳", "No credit card required", "Setup in 2 minutes"].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual — feature tiles grid */}
            <div className="relative mt-4 lg:mt-0">
              <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {[
                    { icon: <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Price Tracking", grad: "from-orange-500 to-red-500" },
                    { icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Review Analytics", grad: "from-purple-500 to-pink-500" },
                    { icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Price Optimization", grad: "from-blue-500 to-cyan-500" },
                    { icon: <Search className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Keyword Tracking", grad: "from-green-500 to-emerald-500" },
                    { icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Product Research", grad: "from-yellow-500 to-orange-500" },
                    { icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />, label: "AI Recommendations", grad: "from-violet-500 to-purple-600" },
                    { icon: <BellRing  className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Whatsapp Alerts", grad: "from-green-500 to-emerald-500" },
                    { icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Festive Trend Intelligence", grad: "from-yellow-500 to-orange-600" },
                  ].map((tile, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 sm:p-3 hover:border-orange-300 transition-all group cursor-default">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${tile.grad} rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {tile.icon}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tile.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm">8 Features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY INDIAN SELLERS STRUGGLE ═══ */}
      <section className="py-12 sm:py-14 md:py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Indian Sellers Lose Sales Every Day{" "}
              <span className="text-orange-600">And Don't Know Why</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Most Amazon and Flipkart sellers in India are running blind. You check your sales, see a drop, and have no idea if a competitor undercut you by ₹80 last night or if 23 customers complained about your packaging this month without you noticing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 rounded-2xl p-5 sm:p-6">
              <h3 className="font-black text-gray-900 dark:text-white text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Here's what a typical Indian seller's day looks like:</h3>
              <div className="space-y-2 sm:space-y-3">
                {["Manually checking competitor prices on different tabs", "Finding out your keyword ranking dropped after your sales already fell", "Getting no alert when a rival steals your Buy Box", "Importing a product that already has 400 sellers and a 2.8-star rating", "Guessing festive season pricing instead of knowing demand 12 days out"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3">
                    <span className="text-red-500 font-bold text-base sm:text-lg mt-0.5 flex-shrink-0">✗</span>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-bold text-red-600 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-red-100 dark:border-red-900/30">This is not a strategy. It's firefighting.</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2 sm:mb-3">Real Scenario</p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  A home goods seller in Jaipur was pricing at ₹1,399 while two competitors had dropped to ₹1,249. He didn't know for 4 days. He lost the Buy Box, 60+ sales, and ₹7,200 in revenue because he had no price tracking in place.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-orange-200 dark:border-orange-700">
                <p className="text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-400">With Insydz: He would have known in seconds and reacted in minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT MOST TOOLS DON'T TELL YOU ═══ */}
      <section className="py-12 sm:py-14 md:py-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              What Most Amazon Seller Tools{" "}
              <span className="text-red-500">Don't Tell You</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Most tools built for Amazon sellers are designed for the US market, then retrofitted with an Indian price tag. Here's what they quietly skip:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              {  title: "No Flipkart support", desc: "India's #2 marketplace, completely ignored by global tools." },
              {  title: "No WhatsApp alerts", desc: "Indian sellers don't live inside dashboards they live on WhatsApp." },
              {  title: "No festive forecasting", desc: "Big Billion Day and Diwali aren't on their radar at all." },
              {  title: "No Indian context", desc: "No INR examples, no Indian seller context, no localized guidance." },
              {  title: "Wrong pricing calibration", desc: "Advice calibrated for $50 products, not ₹499–₹2,999 products." },
              {  title: "Adapted, not built", desc: "When a tool built for US sellers tries to help you the logic simply doesn't translate." },
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white">
            <p className="text-base sm:text-lg md:text-xl font-black mb-1 sm:mb-2">Insydz was built from the ground up for Indian e-commerce.</p>
            <p className="text-orange-100 text-xs sm:text-sm">Not adapted. Not retrofitted. Built for India.</p>
          </div>
        </div>
      </section>

      {/* ═══ INDIA-FIRST ADVANTAGE ═══ */}
      <section className="py-12 sm:py-14 md:py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              How Insydz Is Different:{" "}
              <span className="text-orange-600">The India-First Intelligence Platform</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Insydz isn't a collection of isolated reports. It's a connected intelligence system where every data point talks to every other, and surfaces the one action you need to take right now.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { trigger: "A competitor drops their price", result: "Insydz flags it, calculates your margin floor, and sends a WhatsApp alert in seconds" },
              { trigger: "Your keyword rank slips", result: "Insydz recommends the exact SEO fix, not just a chart"},
              { trigger: "A review spike hits your listing", result: "Insydz identifies the complaint pattern before it hits your rating" },
              { trigger: "Diwali is 12 days away", result: "Insydz shows you which products to stock, price, and rank for festive keywords now" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-orange-400 transition-all">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">When</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{item.trigger}</p>
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-green-700 dark:text-green-400 font-bold text-sm sm:text-base md:text-lg">
              Sellers using Insydz report reacting to competitor price drops 4x faster protecting Buy Box without panic-discounting.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ HOW FEATURES WORK TOGETHER ═══ */}
      <section className="py-12 sm:py-14 md:py-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">
              Not Isolated Tools.{" "}
              <span className="text-orange-600">One Intelligence System.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Each feature works together so you make faster, better decisions without juggling multiple dashboards.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {flowSteps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-orange-400 hover:shadow-lg transition-all">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white mb-2 sm:mb-3">
                    {step.icon}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Trigger</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{step.from}</p>
                  <div className="flex items-center gap-1 text-orange-600">
                    <ArrowRight className="w-3 h-3" />
                    <p className="text-xs font-semibold">{step.to}</p>
                  </div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full items-center justify-center -translate-y-1/2">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE SECTIONS ═══ */}
      {features.map((feat, i) => (
        <React.Fragment key={feat.id}>
          <FeatureSection {...feat} />
          {(i === 1 || i === 3 || i === 5) && (
            <div className="py-8 sm:py-10 px-4 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-white font-black text-xl sm:text-2xl mb-1.5 sm:mb-2">Try all features free no credit card required.</p>
                <p className="text-orange-100 text-xs sm:text-sm mb-4 sm:mb-5">Start free and experience real insights on your own products.</p>
                <a href="/signup" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-orange-700 font-bold px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl text-sm sm:text-base inline-block text-center">
                  Start Free Today
                </a>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}

      {/* ═══ ROI SECTION ═══ */}
      <section className="py-12 sm:py-14 md:py-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              What Insydz Is Worth to Your Business:{" "}
              <span className="text-orange-600">A Real Numbers Example</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
              Insydz doesn't just save you time. It prevents the specific, costly, invisible mistakes that bleed Indian sellers dry month after month.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-x-auto shadow-lg">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-2 bg-gradient-to-r from-orange-500 to-red-500 p-3 sm:p-4">
                <p className="text-white font-bold text-xs sm:text-sm">Situation</p>
                <p className="text-white font-bold text-xs sm:text-sm">Impact (Monthly)</p>
              </div>
              {roiRows.map((row, i) => (
                <div key={i} className={`grid grid-cols-2 p-3 sm:p-4 gap-3 sm:gap-4 ${i % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"} border-b border-gray-200 dark:border-gray-700`}>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{row.situation}</p>
                  <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">{row.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY ALL-IN-ONE ═══ */}
      <section className="py-14 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Sellers Prefer an
              <br />
              <span className="text-orange-600">All-in-One Intelligence Platform</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              You could stitch together 4–5 separate tools to do what Insydz does. Many sellers try. Here's why that approach fails:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {whyPoints.map((p, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-xl transition-all group hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-md">
                  {p.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-base sm:text-lg">{p.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SELLER STAGES ═══ */}
      <section className="py-14 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Built for Every Stage of{" "}
              <span className="text-orange-600">Your Seller Journey</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sellerStages.map((stage, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-xl transition-all group hover:-translate-y-1 flex flex-col">
                <h3 className="font-black text-gray-900 dark:text-white text-lg sm:text-xl mb-2 sm:mb-3">{stage.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-5 flex-1">{stage.desc}</p>
                <a href={stage.ctaRoute} className={`w-full bg-gradient-to-r ${stage.gradient} text-white font-bold py-2 sm:py-2.5 rounded-full shadow-md hover:shadow-lg transition-all text-xs sm:text-sm block text-center`}>
                  {stage.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-14 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
            Features – <span className="text-orange-600">FAQs</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-3"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">{faq.q}</span>
                  {expandedFaq === i
                    ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-orange-50/50 dark:bg-orange-900/10">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEO SECTION ═══ */}
      <section className="py-12 sm:py-14 md:py-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
            Built for Indian E-commerce Sellers
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto text-xs sm:text-sm md:text-base">
            Insydz features are designed for Indian Amazon and Flipkart sellers who need competitor intelligence, pricing insights, review analytics, keyword tracking, and real-time alerts without expensive global tools or hours of manual effort. Whether you're a solo seller managing 10 products or an agency running 50 accounts, Insydz gives you structured intelligence that drives real decisions in INR, for Indian markets, with context that actually makes sense for your business.
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-14 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-white">
            One Platform.
            <br />
            All the Intelligence You Need.
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
            Start free and experience real insights on your own products no setup, no credit card, no commitment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6 sm:mb-8">
            {[
              { label: "For New Sellers", cta: "Start Free See Your First Insights in 2 Minutes", route: "/signup", bg: "bg-white text-orange-700" },
              { label: "For Growing Sellers", cta: "Try Growth Plan React Faster, Sell More", route: "/pricing", bg: "bg-orange-700 text-white border-2 border-orange-400" },
              { label: "For Agencies", cta: "Book a Demo See Insydz Across Multiple Accounts", route: "/about/contact-us", bg: "bg-white text-orange-700" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.route}
                className={`${item.bg} rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left hover:scale-105 transition-all shadow-xl block`}
              >
                <p className="text-xs font-bold opacity-70 mb-0.5 sm:mb-1">{item.label}</p>
                <p className="text-xs sm:text-sm font-black leading-snug">{item.cta} →</p>
              </a>
            ))}
          </div>
          <p className="text-white/70 mt-4 sm:mt-6 text-xs sm:text-sm">✓ No credit card required  ✓ Setup in 2 minutes  ✓ Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
          {/* 5 Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 mb-14">
 
            {/* Column 1 – Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <a href="/" className="flex items-center space-x-3 mb-4" aria-label="Insydz – Home">
                <img
                  src="/logo.png"
                  alt="Insydz Logo"
                  className="w-10 h-10 object-contain p-0.5"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Insydz
                </span>
              </a>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                India's AI-powered ecommerce analytics software for Amazon, Flipkart sellers.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free →
              </Link>
              <div className="flex space-x-3 mt-6">
                <a
                  title="Insydz on Facebook"
                  href="https://www.facebook.com/profile.php?id=61586202582209"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on Twitter / X"
                  href="https://x.com/growwithinsydz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on Instagram"
                  href="https://www.instagram.com/growwithinsydz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on LinkedIn"
                  href="https://www.linkedin.com/company/insydz/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
 
            {/* Column 2 – Solutions */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Solutions</h4>
              <ul className="space-y-3">
                <li><Link to="/solutions/amazon-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Amazon Sellers</Link></li>
                <li><Link to="/solutions/flipkart-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Flipkart Sellers</Link></li>
                <li><Link to="/solutions/ecommerce-agencies" className="text-sm text-gray-400 hover:text-white transition-colors">Agencies</Link></li>
                <li><Link to="/solutions/brand-managers" className="text-sm text-gray-400 hover:text-white transition-colors">Brand Managers</Link></li>
              </ul>
            </div>
 
            {/* Column 3 – Product */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features/competitor-price-tracking-feature" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/features/festive-trend-feature" className="text-sm text-gray-400 hover:text-white transition-colors">Festive Trends</Link></li>
                <li><Link to="/compare/insydzvshelium" className="text-sm text-gray-400 hover:text-white transition-colors">Compare</Link></li>
              </ul>
            </div>
 
            {/* Column 4 – Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/resources/expert-blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/resources/guides" className="text-sm text-gray-400 hover:text-white transition-colors">E-commerce Guides</Link></li>
                <li><Link to="/resources/videos" className="text-sm text-gray-400 hover:text-white transition-colors">Video Tutorials</Link></li>
                <li><Link to="/resources/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link to="/free-tools/free-amazon-product-analyzer" className="text-sm text-gray-400 hover:text-white transition-colors">Free Tools</Link></li>
              </ul>
            </div>
 
            {/* Column 5 – Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Company</h4>
              <ul className="space-y-3">
                {/* "About" scrolls on this page — use a hash href so it's crawlable */}
                <li><a href="#About" onClick={(e) => { e.preventDefault(); scrollToSection('About'); }} className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><Link to="/about/our-vision" className="text-sm text-gray-400 hover:text-white transition-colors">Our Vision</Link></li>
                <li><Link to="/about/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/about/contact-us" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
 
          </div>
 
          {/* Bottom Strip */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-gray-500 text-sm">
                © 2026 <span className="text-purple-400 font-semibold">Insydz</span>. All rights reserved. Designed & Developed in India 🇮🇳
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-gray-700">·</span>
                <a href="/terms-service" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="text-gray-700">·</span>
                <a href="/privacy-policy" className="hover:text-white transition-colors">Data Disclaimer</a>
              </div>
            </div>
          </div>
 
        </div>
      </footer>
 
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
