​"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  BarChart3, Package,
  ShoppingBag, Store, Briefcase,
  Code, Trophy, BookOpen,
  Search, MessageCircle, TrendingDown,
  Flame, Presentation, LayoutGrid,
  Star, Cpu, Filter, RefreshCw,
  KeyRound, LineChart, ListChecks, Eye, Rocket, Award
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

// ── SCHEMA ───────────────────────────────────────────────────────────
const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Improve Amazon and Flipkart SEO", "item": "https://insydz.com/use-cases/improve-seo" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Insydz help improve Amazon and Flipkart SEO?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz's SEO optimization tool analyses real search volumes, competitor keyword strategies, and listing gaps on Amazon India and Flipkart simultaneously. Every keyword is scored for search demand and competition so you can prioritise the terms that will move your rank." }
      },
      {
        "@type": "Question",
        "name": "How long does it take to see results from Amazon SEO optimization?",
        "acceptedAnswer": { "@type": "Answer", "text": "Most sellers see measurable rank improvements within 2 to 4 weeks of implementing Insydz's keyword recommendations. The Amazon SEO optimization tool tracks daily rank changes so you can see progress in real time." }
      },
      {
        "@type": "Question",
        "name": "Can I use Insydz for both Amazon India and Flipkart SEO?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz is the only SEO optimization tool that covers both Amazon India and Flipkart in a single dashboard. Keyword volumes, rank positions, and listing recommendations are platform-specific for accurate results." }
      },
      {
        "@type": "Question",
        "name": "What keywords does the Amazon keyword research platform track?",
        "acceptedAnswer": { "@type": "Answer", "text": "The Amazon keyword research platform tracks search volumes, rank positions, and ranking velocity for any keyword across Amazon India and Flipkart. You can monitor your own listings and compare directly against top competitors in your category." }
      },
      {
        "@type": "Question",
        "name": "How often is keyword rank data updated?",
        "acceptedAnswer": { "@type": "Answer", "text": "Keyword rank data refreshes daily. Search volume trends update every 24 hours so your SEO decisions are based on current marketplace signals, not stale data." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz identify keyword gaps that competitors are ranking for?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. The SEO optimization tool compares your listing's keyword coverage against top-ranking competitors and flags high-volume terms you are not targeting. These gaps represent the fastest route to rank improvement." }
      }
    ]
  }
];

// ── NAVIGATION ────────────────────────────────────────────────────────
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
    { name: "Improve Amazon and Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts and Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <TrendingDown className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword and Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

// ── PAGE DATA ─────────────────────────────────────────────────────────

const rankProblems = [
  {
    title: "Wrong keywords in titles",
    desc: "Most sellers stuff titles with brand names and generic terms that buyers never search. The Amazon SEO optimization tool identifies the exact phrases your customers type.",
    iconBg: "bg-red-50",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  {
    title: "Competitors outrank you",
    desc: "Rivals with weaker products appear above you because they have optimised for high-volume search terms. The SEO optimization tool shows you exactly which keywords to target to close the gap.",
    iconBg: "bg-orange-50",
    icon: <TrendingDown className="w-5 h-5 text-orange-500" />,
  },
  {
    title: "No rank tracking means no improvement",
    desc: "Without an Amazon keyword research platform, sellers make listing changes blind. You cannot improve what you do not measure.",
    iconBg: "bg-amber-50",
    icon: <Eye className="w-5 h-5 text-amber-500" />,
  },
  {
    title: "Keyword gaps your competitors exploit",
    desc: "High-demand search terms that top-ranking listings use but yours does not. These are the fastest opportunities to capture organic traffic on Amazon India and Flipkart.",
    iconBg: "bg-green-50",
    icon: <Target className="w-5 h-5 text-green-500" />,
  },
];

const comparisonRows = [
  { label: "Keyword data source", manual: "Amazon suggest (guesswork)", insydz: "Live search volume on Amazon India and Flipkart" },
  { label: "Rank tracking", manual: "Manual search, not scalable", insydz: "Daily automated rank tracking per keyword" },
  { label: "Competitor keyword analysis", manual: "Not available", insydz: "Full competitor keyword gap analysis" },
  { label: "Listing optimisation tips", manual: "Generic blog advice", insydz: "Listing-specific keyword recommendations" },
  { label: "Festive keyword forecasting", manual: "Not available", insydz: "Diwali, Big Billion Days, Republic Day keyword spikes" },
  { label: "Time to keyword shortlist", manual: "3 to 5 days", insydz: "Under 1 hour" },
  { label: "Language support", manual: "English only", insydz: "Hindi and English keyword analysis" },
];

const steps = [
  {
    num: "Step 01",
    title: "Find high-value keywords",
    desc: "Enter your product category and the Amazon keyword research platform returns ranked keyword opportunities by search volume, competition, and ranking difficulty.",
    iconBg: "bg-green-50",
    icon: <Search className="w-5 h-5 text-green-600" />,
  },
  {
    num: "Step 02",
    title: "Track your rankings",
    desc: "Monitor where your listings rank for every target keyword on Amazon India and Flipkart. The SEO optimization tool shows daily rank movement and competitor positions side by side.",
    iconBg: "bg-teal-50",
    icon: <LineChart className="w-5 h-5 text-teal-600" />,
  },
  {
    num: "Step 03",
    title: "Optimise and improve",
    desc: "Receive specific listing recommendations. Know which keywords to add to your title, bullet points, and backend search terms to rank higher and convert more buyers.",
    iconBg: "bg-emerald-50",
    icon: <Rocket className="w-5 h-5 text-emerald-600" />,
  },
];

const discoverCards = [
  { title: "High-Volume Keyword Discovery", desc: "The Amazon keyword research platform surfaces the exact terms buyers type into Amazon India and Flipkart. Search volume is pulled live, not estimated from US data.", kw: "amazon keyword research platform", kwBg: "bg-green-50 text-green-700", icon: <Search className="w-5 h-5 text-green-600" />, iconBg: "bg-green-50" },
  { title: "Daily Rank Position Tracking", desc: "Track where each of your listings ranks for every target keyword. The SEO optimization tool sends WhatsApp alerts the moment your rank improves or drops.", kw: "SEO optimization tool", kwBg: "bg-teal-50 text-teal-700", icon: <LineChart className="w-5 h-5 text-teal-600" />, iconBg: "bg-teal-50" },
  { title: "Competitor Keyword Gap Analysis", desc: "See every high-volume keyword your top competitors rank for that your listing does not target. Close the gap before they build an unassailable lead.", kw: "advanced SEO optimization tool", kwBg: "bg-emerald-50 text-emerald-700", icon: <Target className="w-5 h-5 text-emerald-600" />, iconBg: "bg-emerald-50" },
  { title: "Listing Optimisation Recommendations", desc: "Insydz tells you exactly where to place each keyword for maximum impact — title, bullet points, description, and backend fields. Platform-specific for Amazon India and Flipkart.", kw: "amazon SEO optimization tool", kwBg: "bg-sky-50 text-sky-700", icon: <ListChecks className="w-5 h-5 text-sky-500" />, iconBg: "bg-sky-50" },
  { title: "Festive Keyword Intelligence", desc: "Track which search terms spike during Diwali, Big Billion Days, and Republic Day Sale. Optimise listings 10 to 15 days before the surge and capture buyers at peak intent.", kw: "flipkart SEO tool", kwBg: "bg-amber-50 text-amber-700", icon: <Flame className="w-5 h-5 text-amber-500" />, iconBg: "bg-amber-50" },
  { title: "Hindi and English Keyword Coverage", desc: "Indian buyers search in both Hindi and English. Insydz surfaces high-volume search terms in both languages so your listings reach the full breadth of the Indian market.", kw: "flipkart keyword research tool", kwBg: "bg-green-50 text-green-700", icon: <Globe className="w-5 h-5 text-green-600" />, iconBg: "bg-green-50" },
];

const indiaAdvantages = [
  { title: "Indian Search Volume Data", desc: "Keyword volumes pulled directly from Amazon India and Flipkart. Not extrapolated from Amazon.com or US search trends.", color: "bg-green-500/20", iconColor: "text-green-300" },
  { title: "Platform-Specific Rank Tracking", desc: "Separate rank data for Amazon India and Flipkart in one view. Each platform has different ranking signals and the SEO optimization tool accounts for both.", color: "bg-teal-500/20", iconColor: "text-teal-300" },
  { title: "Festive Keyword Forecasting", desc: "Keyword demand forecasts for Diwali, Big Billion Days, and Republic Day delivered 12 to 15 days ahead of the traffic spike.", color: "bg-orange-500/20", iconColor: "text-orange-300" },
  { title: "Hindi Keyword Analysis", desc: "Insydz identifies high-volume Hindi search terms your English-only competitors are missing. More keyword coverage means more organic reach.", color: "bg-emerald-500/20", iconColor: "text-emerald-300" },
];

const withoutRows = [
  { label: "Keywords targeted per listing", val: "4 to 6 terms", neg: true },
  { label: "Average organic rank position", val: "Page 3 or below", neg: true },
  { label: "Keyword gap vs top competitor", val: "40 to 60 terms", neg: true },
  { label: "Festive traffic captured", val: "Below 10%", neg: true },
  { label: "Time spent on keyword research", val: "12 hours/week", neg: true },
];

const withRows = [
  { label: "Keywords targeted per listing", val: "25 to 40 terms", neg: false },
  { label: "Average organic rank position", val: "Page 1 within 3 weeks", neg: false },
  { label: "Keyword gap vs top competitor", val: "Under 5 terms", neg: false },
  { label: "Festive traffic captured", val: "Above 60%", neg: false },
  { label: "Time spent on keyword research", val: "Under 1 hour/week", neg: false },
];

const pricingPlans = [
  {
    plan: "Free Plan",
    price: "Rs 0",
    period: "Forever, no credit card required",
    items: [
      "25 keywords tracked with daily rank updates",
      "Amazon keyword research platform, 30-day history",
      "Basic competitor keyword gap analysis",
      "Listing optimisation recommendations",
      "Amazon India and Flipkart SEO coverage",
    ],
    cta: "Start Free Now",
    route: "/login",
    featured: false,
  },
  {
    plan: "Growth Plan",
    price: "Rs 1,999",
    period: "per month, billed in INR",
    items: [
      "Unlimited keywords with daily rank tracking",
      "Advanced SEO optimization tool, 12-month history",
      "Full competitor keyword gap analysis",
      "Festive keyword forecasting 15 days ahead",
      "WhatsApp alerts for rank changes",
      "Hindi and English keyword analysis",
    ],
    cta: "Start Growth Plan",
    route: "/login",
    featured: true,
  },
  {
    plan: "Scale Plan",
    price: "Rs 2,999",
    period: "per month, billed in INR",
    items: [
      "Everything in Growth Plan",
      "Multi-marketplace Flipkart SEO tool",
      "Agency-level multi-account access",
      "Priority support in Hindi and English",
      "Custom SEO performance reports",
    ],
    cta: "Start Scale Plan",
    route: "/login",
    featured: false,
  },
];

const faqs = [
  {
    id: "faq-1",
    question: "How does Insydz help improve Amazon and Flipkart SEO?",
    answer: "Insydz's SEO optimization tool analyses real search volumes, competitor keyword strategies, and listing gaps on Amazon India and Flipkart simultaneously. Every keyword is scored for search demand and competition so you can prioritise the terms that will move your rank the fastest.",
  },
  {
    id: "faq-2",
    question: "How long does it take to see results from Amazon SEO optimization?",
    answer: "Most sellers see measurable rank improvements within 2 to 4 weeks of implementing Insydz's keyword recommendations. The Amazon SEO optimization tool tracks daily rank changes so you can see progress in real time without waiting for monthly reports.",
  },
  {
    id: "faq-3",
    question: "Can I use Insydz for both Amazon India and Flipkart SEO?",
    answer: "Yes. Insydz is the only SEO optimization tool that covers both Amazon India and Flipkart in a single dashboard. Keyword volumes, rank positions, and listing recommendations are platform-specific for accurate results on each marketplace.",
  },
  {
    id: "faq-4",
    question: "What keywords does the Amazon keyword research platform track?",
    answer: "The Amazon keyword research platform tracks search volumes, rank positions, and ranking velocity for any keyword across Amazon India and Flipkart. You can monitor your own listings and compare directly against top competitors in your category.",
  },
  {
    id: "faq-5",
    question: "How often is keyword rank data updated?",
    answer: "Keyword rank data refreshes daily. Search volume trends update every 24 hours so your SEO decisions are based on current marketplace signals, not stale data from weeks ago.",
  },
  {
    id: "faq-6",
    question: "Can Insydz identify keyword gaps that competitors are ranking for?",
    answer: "Yes. The SEO optimization tool compares your listing's keyword coverage against top-ranking competitors and flags high-volume terms you are not targeting. These gaps represent the fastest route to rank improvement on Amazon India and Flipkart.",
  },
];

// ── KEYWORD PERFORMANCE CARD MOCK ─────────────────────────────────────
function KeywordPerformanceCard() {
  const keywords = [
    { term: "wireless earbuds", volume: "45K/mo searches", rank: "#8", trend: "up" },
    { term: "bluetooth headphones", volume: "30K/mo searches", rank: "#15", trend: "up" },
    { term: "noise cancelling", volume: "28K/mo searches", rank: "#23", trend: "down" },
  ];
  return (
    <div className="hidden lg:block bg-white border border-green-200 rounded-3xl p-6 shadow-2xl shadow-green-100">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">Keyword Performance</span>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" /> Live
        </span>
      </div>
      {keywords.map((kw) => (
        <div key={kw.term} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
          <div>
            <p className="text-sm font-semibold text-gray-900">{kw.term}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kw.volume}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-green-600">{kw.rank}</span>
            {kw.trend === "up"
              ? <TrendingUp className="w-4 h-4 text-green-500" />
              : <TrendingDown className="w-4 h-4 text-red-400" />}
          </div>
        </div>
      ))}
      <div className="mt-4 bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-3">
        <p className="text-xs text-white leading-relaxed font-medium">
          3 high-volume keyword gaps identified. Add these to your title and bullet points to rank above your top competitor.
        </p>
      </div>
    </div>
  );
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────
export default function ImproveAmazonFlipkartSEOPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-seo-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-seo-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetStarted = () => router.push("/login");
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const toggleMobileMenu = (menuName: string) =>
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-teal-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/use-cases" className="hover:text-green-500 transition-colors">Use Cases</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 dark:text-gray-300">Improve Amazon and Flipkart SEO</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <h1 className="text-xs font-medium text-green-700 tracking-widest">
                  SEO Optimization Tool
                </h1>
              </div>
              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
                Rank Higher on{" "}
                <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
                  Amazon and Flipkart
                </span>
                <br />
                With Smart SEO
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
                Insydz shows you exactly which keywords to target, how to optimise your listings, and where you rank so more customers find your products on Amazon India and Flipkart.
              </p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-teal-500 text-white font-bold px-8 py-6 rounded-full shadow-2xl group"
              >
                Start Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <KeywordPerformanceCard />
          </div>
        </div>
      </section>

      {/* ── WHY PRODUCTS DON'T RANK ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700 uppercase tracking-widest">The problem</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why your products{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">don't rank</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Most Indian sellers optimise listings based on guesswork. Without a real SEO optimization tool, your products stay buried while competitors take the traffic.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {rankProblems.map((card, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col h-full">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>
                  {card.icon}
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
            <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
              <strong className="block text-lg font-black text-amber-700 dark:text-amber-400 mb-1">72% of Amazon India clicks go to page 1 results</strong>
              If your listing is not on page 1, you are invisible to the majority of buyers. Insydz's <strong>SEO optimization tool</strong> gives you a clear path to get there.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700 uppercase tracking-widest">Manual vs Insydz</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why manual SEO research{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">fails Indian sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Most sellers spend days on keyword research and still miss the terms buyers actually use. Insydz cuts that to under an hour.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-gray-500 dark:text-gray-400 font-bold text-sm bg-gray-900 dark:bg-gray-950">Research Method</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-bold text-sm bg-gray-700">Manual Research</th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm bg-gradient-to-r from-green-600 to-teal-500">
                    Insydz <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2 font-medium">India-First</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">{row.label}</td>
                    <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-sm">{row.manual}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700 uppercase tracking-widest">SEO optimization process</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              How SEO optimization works{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From keyword discovery to page 1 rank in a structured process. No guesswork, no generic advice.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-7 flex flex-col h-full">
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block w-fit mb-4">{step.num}</span>
                <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{step.icon}</div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-green-600 to-teal-500 text-white font-bold px-8 py-6 rounded-full shadow-xl group">
              Start Ranking Higher Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── DISCOVER GRID ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700 uppercase tracking-widest">SEO intelligence</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              What you get with{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Insydz SEO</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six SEO data layers for every listing and keyword. Each one answers a specific question before you make a change.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {discoverCards.map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col h-full">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{card.icon}</div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">{card.desc}</p>
                <span className={`text-xs font-medium px-3 py-1 rounded-full inline-block w-fit ${card.kwBg}`}>{card.kw}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDIA DIFFERENCE ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-12 items-start relative">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Built on Indian marketplace data</p>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">Why Insydz SEO Data is Different for Indian Sellers</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Global SEO tools like Helium 10 use Amazon.com keyword data. Indian sellers who rely on them target terms that US buyers use, not what customers on Amazon India and Flipkart actually search. Insydz is built entirely on Indian marketplace data with Hindi keyword support, INR-calibrated competition scores, and Indian festive season forecasting built in.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { val: "2.4x", lbl: "Average rank improvement in 30 days" },
                    { val: "4.6x", lbl: "More keyword coverage vs manual" },
                    { val: "58 min", lbl: "Average time to first keyword shortlist" },
                  ].map((s) => (
                    <div key={s.lbl}>
                      <div className="text-xl font-black text-green-400 mb-1">{s.val}</div>
                      <div className="text-xs text-gray-500">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {indiaAdvantages.map((adv, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className={`w-8 h-8 rounded-lg ${adv.color} flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle2 className={`w-4 h-4 ${adv.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">{adv.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COST COMPARISON ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700 uppercase tracking-widest">SEO optimization tool impact</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              The cost of selling without{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">proper SEO</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A real comparison. Same category, same investment window. One seller uses Insydz SEO. One does not.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Without */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-red-200 dark:border-red-900 p-7">
              <span className="text-sm font-bold text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">Without Insydz, 3 Month Period</span>
              {withoutRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-red-500">{row.val}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-red-200 dark:border-red-900">
                <span className="text-xl font-black text-red-600">Result: Buried on page 3, revenue below potential</span>
              </div>
            </div>
            {/* With */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-green-200 dark:border-green-900 p-7">
              <span className="text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">With Insydz, 3 Month Period</span>
              {withRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-green-600">{row.val}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-900">
                <span className="text-xl font-black text-green-600">Result: Page 1 rank, 3x more organic traffic</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
            <p className="text-green-900 dark:text-green-300 text-sm leading-relaxed">
              <strong className="block text-lg font-black text-green-700 dark:text-green-400 mb-1">Page 1 rank generates 3x to 5x more organic traffic than page 3.</strong>
              That is the visibility gap Insydz's <strong>SEO optimization tool</strong> closes for Indian sellers on Amazon India and Flipkart.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700 uppercase tracking-widest">Start free. See real opportunities.</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Free plan includes{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">keyword tracking</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every plan includes the SEO optimization tool, Amazon keyword research platform, and rank tracker. No credit card required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`rounded-3xl p-7 flex flex-col h-full ${plan.featured ? "bg-gradient-to-br from-green-600 to-teal-500" : "bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700"}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-white/70" : "text-green-600"}`}>{plan.plan}</p>
                <p className={`text-3xl font-black mb-1 ${plan.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.price}</p>
                <p className={`text-xs mb-5 ${plan.featured ? "text-white/60" : "text-gray-400"}`}>{plan.period}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.items.map((item, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/85" : "text-gray-600 dark:text-gray-400"}`}>
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${plan.featured ? "bg-white/20" : "bg-green-100 dark:bg-green-900/30"}`}>
                        <CheckCircle2 className={`w-2.5 h-2.5 ${plan.featured ? "text-white" : "text-green-500"}`} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.route} className={`block w-full text-center font-bold py-3 px-6 rounded-full text-sm transition-all mt-auto ${plan.featured ? "bg-white text-green-700 hover:bg-green-50" : "bg-gradient-to-r from-green-600 to-teal-500 text-white hover:opacity-90"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-xs font-medium text-green-700 uppercase tracking-widest">Amazon and Flipkart SEO FAQs</span>
          </div>
          <h2 className="text-4xl font-black mb-12 text-gray-900 dark:text-white">Common questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  aria-expanded={expandedFaq === faq.id}
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-5 h-5 text-green-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-700 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 text-white">Stop Being Invisible. Get Found.</h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            India's only platform that combines an SEO optimization tool, live keyword data, and rank tracking built for Amazon India and Flipkart sellers.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white text-green-700 font-bold px-12 py-6 rounded-full shadow-2xl group hover:bg-green-50 mb-12">
            Improve SEO Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              { val: "Free", lbl: "25 keywords to start" },
              { val: "58 min", lbl: "To first keyword shortlist" },
              { val: "Rs 1,999", lbl: "Growth plan per month" },
            ].map((s) => (
              <div key={s.lbl} className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center min-w-36">
                <div className="text-xl font-black text-white mb-1">{s.val}</div>
                <div className="text-xs text-white/60">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out; }
      `}</style>
    </div>
  );
}