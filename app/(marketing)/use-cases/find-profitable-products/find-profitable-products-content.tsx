"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  Smartphone, BarChart3, Package,
  ShoppingBag, Store, Briefcase,
  Code, Trophy, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown,
  Flame, Presentation, LayoutGrid,
  Star, Award, Database, Cpu, Filter, RefreshCw
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
      { "@type": "ListItem", "position": 3, "name": "Find Profitable Products", "item": "https://insydz.com/use-cases/find-profitable-products" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Insydz find profitable products on Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz's product research tool analyses real search volumes, competitor pricing, review sentiment, and margin data from Amazon India and Flipkart simultaneously. Every product receives an Opportunity Score out of 100, combining demand, competition, and profit potential in INR." }
      },
      {
        "@type": "Question",
        "name": "How long does Insydz take to analyse and score products?",
        "acceptedAnswer": { "@type": "Answer", "text": "Most sellers complete their first product research session in under 2 hours. Set your budget, category, and margin criteria and Insydz filters, scores, and ranks matching opportunities automatically." }
      },
      {
        "@type": "Question",
        "name": "Can I find profitable products for both Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz is the only product profitability analysis software that covers both Amazon India and Flipkart in a single dashboard." }
      },
      {
        "@type": "Question",
        "name": "What makes a product profitable according to Insydz?",
        "acceptedAnswer": { "@type": "Answer", "text": "The product margin calculator scores profitability based on your input costs, Amazon India or Flipkart fees, estimated sourcing price, and current competitive pricing. A product is flagged as profitable when projected margin exceeds your defined floor." }
      },
      {
        "@type": "Question",
        "name": "How often is the product opportunity data updated?",
        "acceptedAnswer": { "@type": "Answer", "text": "The opportunity finder tool refreshes marketplace data daily. Search volume trends, competitor pricing, and inventory levels are updated every 24 hours." }
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
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

// ── PAGE DATA ─────────────────────────────────────────────────────────

const wrongCards = [
  {
    title: "No demand validation",
    desc: "Sellers guess at demand without access to a product demand analysis tool. Real search volume on Amazon India and Flipkart stays invisible.",
    iconBg: "bg-red-50",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  {
    title: "No margin calculator",
    desc: "Without a product margin calculator, sellers discover poor margins only after sourcing. By that point the damage is already done.",
    iconBg: "bg-orange-50",
    icon: <IndianRupee className="w-5 h-5 text-orange-500" />,
  },
  {
    title: "Missing opportunity signals",
    desc: "Without an opportunity finder tool, sellers miss rising trends 3 to 4 weeks before they peak. That is exactly when first movers capture the highest margins.",
    iconBg: "bg-green-50",
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
  },
  {
    title: "No competitive context",
    desc: "Indian sellers choose saturated categories because they have no product opportunity analysis tool to benchmark real competition levels in INR markets.",
    iconBg: "bg-blue-50",
    icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
  },
];

const comparisonRows = [
  { label: "Demand data source", manual: "Amazon bestseller list (delayed)", insydz: "Live search volume on Amazon.in and Flipkart" },
  { label: "Margin calculation", manual: "Manual spreadsheet, error prone", insydz: "Automated product margin calculator in INR" },
  { label: "Competition analysis", manual: "Count listings manually", insydz: "AI-scored competition index per category" },
  { label: "Festive demand forecast", manual: "Not available", insydz: "Diwali, Big Billion Days, Republic Day forecasts" },
  { label: "Opportunity Scoring", manual: "Not available", insydz: "Opportunity Score out of 100 per SKU" },
  { label: "Time to research decision", manual: "3 to 4 weeks", insydz: "Under 2 hours" },
  { label: "Review language support", manual: "English only", insydz: "Hindi and English review sentiment analysis" },
];

const steps = [
  {
    num: "Step 01",
    title: "Set your criteria",
    desc: "Define your budget, target margin, and category. The product research tool filters millions of SKUs to only those that match your business parameters.",
    iconBg: "bg-blue-50",
    icon: <Filter className="w-5 h-5 text-blue-600" />,
  },
  {
    num: "Step 02",
    title: "AI analyses market data",
    desc: "Our product opportunity analysis tool scores every product across demand, competition, and margin. It combines real Amazon India and Flipkart data in one place.",
    iconBg: "bg-sky-50",
    icon: <Cpu className="w-5 h-5 text-sky-600" />,
  },
  {
    num: "Step 03",
    title: "Get winning products",
    desc: "Receive a ranked shortlist with Opportunity Scores. Each recommendation includes margin projections, trend trajectory, and competitor context.",
    iconBg: "bg-green-50",
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  },
];

const discoverCards = [
  { title: "Trending Products Before Launch", desc: "Identify products gaining momentum on Amazon India and Flipkart 3 to 4 weeks before they peak. First-mover advantage is captured with the opportunity finder tool.", kw: "profitable product finder", kwBg: "bg-blue-50 text-blue-700", icon: <TrendingUp className="w-5 h-5 text-blue-600" />, iconBg: "bg-blue-50" },
  { title: "Profit Margin Estimates in INR", desc: "The product margin calculator runs automatically for every SKU. It factors in Amazon fees, sourcing cost, and shipping so you know profit before placing a single order.", kw: "product margin calculator", kwBg: "bg-orange-50 text-orange-700", icon: <IndianRupee className="w-5 h-5 text-orange-500" />, iconBg: "bg-orange-50" },
  { title: "Competitor Analysis and Gaps", desc: "See exactly who ranks in your target category, what they charge, and where the gaps are. Surface categories where competition is low but demand is rising.", kw: "product opportunity analysis tool", kwBg: "bg-green-50 text-green-700", icon: <Search className="w-5 h-5 text-green-600" />, iconBg: "bg-green-50" },
  { title: "Search Volume and Demand Data", desc: "Real buyer search data from Amazon India and Flipkart. The product demand analysis tool shows monthly search trends so you know if demand is genuine or seasonal.", kw: "product demand analysis tool", kwBg: "bg-sky-50 text-sky-700", icon: <BarChart3 className="w-5 h-5 text-sky-500" />, iconBg: "bg-sky-50" },
  { title: "Best-Selling Categories", desc: "Category-level analysis surfaces where Indian buyers are spending most. Identify adjacent categories before your competitors discover them.", kw: "product research tool", kwBg: "bg-amber-50 text-amber-700", icon: <Star className="w-5 h-5 text-amber-500" />, iconBg: "bg-amber-50" },
  { title: "Opportunity Score out of 100", desc: "Every product gets a single Opportunity Score combining demand, competition, and margin. Instantly prioritise your shortlist using the product opportunity finder.", kw: "opportunity finder tool", kwBg: "bg-blue-50 text-blue-700", icon: <Target className="w-5 h-5 text-blue-600" />, iconBg: "bg-blue-50" },
];

const indiaAdvantages = [
  { title: "Indian Domain Data", desc: "Demand and pricing data sourced directly from Amazon India and Flipkart. Not extrapolated from Amazon.com.", color: "bg-blue-500/20", iconColor: "text-blue-300" },
  { title: "Accurate INR Profit Modelling", desc: "The product margin calculator accounts for Indian logistics, GST, and marketplace fees. Not US fulfilment rates.", color: "bg-sky-500/20", iconColor: "text-sky-300" },
  { title: "15-Day Festive Intelligence", desc: "Demand forecasts for Diwali, Big Billion Days, and Republic Day Sale delivered 12 to 15 days ahead of the spike.", color: "bg-orange-500/20", iconColor: "text-orange-300" },
  { title: "Review Gap Analyser", desc: "Hindi and English review analysis surfaces product weaknesses in your target category before you source.", color: "bg-green-500/20", iconColor: "text-green-300" },
];

const withoutRows = [
  { label: "Products sourced without validation", val: "3 products", neg: true },
  { label: "Average margin (guessed)", val: "8%", neg: true },
  { label: "Stranded inventory cost", val: "Rs 84,000", neg: true },
  { label: "Missed festive window revenue", val: "Rs 1,40,000", neg: true },
  { label: "Time spent on manual research", val: "18 hours/week", neg: true },
];

const withRows = [
  { label: "Products validated before sourcing", val: "5 products", neg: false },
  { label: "Average margin (data-backed)", val: "26%", neg: false },
  { label: "Stranded inventory cost", val: "Rs 0", neg: false },
  { label: "Festive window revenue captured", val: "Rs 3,10,000", neg: false },
  { label: "Time spent on research", val: "Under 2 hours/week", neg: false },
];

const pricingPlans = [
  {
    plan: "Free Plan",
    price: "Rs 0",
    period: "Forever, no credit card required",
    items: [
      "25 products tracked with full Opportunity Scores",
      "Product demand analysis tool, 30-day history",
      "Product margin calculator in INR",
      "Basic competitor analysis",
      "Profitable product finder access",
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
      "Unlimited products with full Opportunity Scores",
      "Product opportunity analysis tool, 12-month history",
      "Advanced product margin calculator with festive adjustments",
      "Festive demand forecasting 15 days ahead",
      "WhatsApp alerts for trending products",
      "Hindi and English review analysis",
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
      "Multi-marketplace opportunity finder tool",
      "Agency-level multi-account access",
      "Priority support in Hindi and English",
      "Custom product profitability analysis reports",
    ],
    cta: "Start Scale Plan",
    route: "/login",
    featured: false,
  },
];

const faqs = [
  {
    id: "faq-1",
    question: "How does Insydz find profitable products on Amazon India and Flipkart?",
    answer: "Insydz's product research tool analyses real search volumes, competitor pricing, review sentiment, and margin data from Amazon India and Flipkart simultaneously. Every product receives an Opportunity Score out of 100, combining demand, competition, and profit potential in INR so you can compare products objectively rather than guessing.",
  },
  {
    id: "faq-2",
    question: "How long does Insydz take to analyse and score products?",
    answer: "Most sellers complete their first product research session in under 2 hours. Set your budget, category, and margin criteria and Insydz filters, scores, and ranks matching opportunities automatically using the product opportunity analysis tool. No manual spreadsheets required.",
  },
  {
    id: "faq-3",
    question: "Can I find profitable products for both Amazon India and Flipkart?",
    answer: "Yes. Insydz is the only product profitability analysis software that covers both Amazon India and Flipkart in a single dashboard. You can compare Opportunity Scores across both marketplaces and identify products that perform well on one but have room to grow on the other.",
  },
  {
    id: "faq-4",
    question: "What makes a product profitable according to Insydz?",
    answer: "The product margin calculator scores profitability based on your input costs, Amazon India or Flipkart fees, estimated sourcing price, and current competitive pricing. A product is flagged as profitable when projected margin exceeds your defined floor, typically 20% or above for Indian marketplace sellers.",
  },
  {
    id: "faq-5",
    question: "How often is the product opportunity data updated?",
    answer: "The opportunity finder tool refreshes marketplace data daily. Search volume trends, competitor pricing, and inventory levels are updated every 24 hours. Festive season demand forecasts update every 48 hours as marketplace signals intensify closer to events like Diwali and Big Billion Days.",
  },
  {
    id: "faq-6",
    question: "Can products be shortlisted to be referred to in due course?",
    answer: "Yes. You can save any product to a watchlist and track how its Opportunity Score changes over time. Insydz sends WhatsApp alerts when a shortlisted product's demand spikes or a competitor's inventory drops, signalling the right moment to act.",
  },
];

// ── OPPORTUNITY CARD MOCK ─────────────────────────────────────────────
function OpportunityCard() {
  const bars = [
    { label: "Search Demand", pct: 88, color: "bg-blue-500" },
    { label: "Competition", pct: 32, color: "bg-amber-400" },
    { label: "Margin Potential", pct: 74, color: "bg-green-400" },
    { label: "Avg. Monthly Sales", pct: 91, color: "bg-sky-400" },
  ];
  return (
    <div className="hidden lg:block bg-white border border-blue-200 rounded-3xl p-6 shadow-2xl shadow-blue-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-900">Top Opportunity Today</span>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" /> Live
        </span>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-lg font-black text-blue-600 leading-none">87</span>
          <span className="text-xs text-gray-400">Score</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Stainless Steel Bottle 1L</p>
          <span className="text-xs text-gray-400">Amazon India, Kitchen</span>
        </div>
      </div>
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3 mb-2.5">
          <span className="text-xs text-gray-500 w-28 flex-shrink-0">{bar.label}</span>
          <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{bar.pct}%</span>
        </div>
      ))}
      <div className="mt-4 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-3">
        <p className="text-xs text-white leading-relaxed font-medium">
          Product demand analysis shows 2x growth ahead of festive season. Source now to get first-mover advantage.
        </p>
      </div>
    </div>
  );
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────
export default function FindProfitableProductsPage() {
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
      const id = `insydz-fpp-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-fpp-schema-${i}`);
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
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-sky-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/use-cases" className="hover:text-blue-500 transition-colors">Use Cases</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 dark:text-gray-300">Find Profitable Products</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <h1 className="text-xs font-medium text-blue-700 tracking-widest">
                  Product profitability analysis software
                </h1>
              </div>
              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
                Find{" "}
                <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                  Profitable Products
                </span>
                <br />
                Before Your
                <br />
                Competitors Do
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
                India's only <strong>product research tool</strong> built on real marketplace data. Surface high-demand, low-competition SKUs with Opportunity Scores, product margin calculators, and demand analysis before your rivals act.
              </p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold px-8 py-6 rounded-full shadow-2xl group"
              >
                Discover Profitable Products Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <OpportunityCard />
          </div>
        </div>
      </section>

      {/* ── WHY WRONG PRODUCTS ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">The problem</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why most sellers pick{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">the wrong products</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Sellers choose products based on gut feeling, not data. The result is inventory that sits still, margins that collapse, and capital that gets stranded.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {wrongCards.map((card, i) => (
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
              <strong className="block text-lg font-black text-amber-700 dark:text-amber-400 mb-1">67% of new sellers fail in their first year</strong>
              The primary cause is poor product selection. Insydz's <strong>product profitability analysis software</strong> closes that gap before you spend a rupee.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Manual vs Insydz</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why manual product research{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">fails Indian sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Most sellers spend 3 to 4 weeks on manual research and still launch the wrong product. Insydz cuts that to hours.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-gray-500 dark:text-gray-400 font-bold text-sm bg-gray-900 dark:bg-gray-950">Research Method</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-bold text-sm bg-gray-700">Manual Research</th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-sky-500">
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
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product discovery process</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              How product discovery works{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From idea to a validated product launch in under 2 hours. No guesswork, no wasted sourcing budget.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-7 flex flex-col h-full">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block w-fit mb-4">{step.num}</span>
                <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{step.icon}</div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold px-8 py-6 rounded-full shadow-xl group">
              Find Your First Profitable Product Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── DISCOVER GRID ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product research intelligence</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              What you discover with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">product research</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six actionable data layers for every product opportunity. Each one answers a specific question before you source.
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-12 items-start relative">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Built on Indian marketplace data</p>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">How Insydz is Different. Built on Indian Marketplace Data</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Global tools like Helium 10 and Jungle Scout use Amazon.com data. Indian sellers who rely on them get demand estimates calibrated for US consumers, US prices, and US festive patterns. Insydz is built entirely on Amazon India and Flipkart data with INR margins, Hindi review analysis, and Indian festive season forecasting built in.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { val: "Rs 5.4 Lakh", lbl: "Avg. annual sourcing waste prevented" },
                    { val: "4.8x", lbl: "Faster product selection" },
                    { val: "67 min", lbl: "Average time to first opportunity" },
                  ].map((s) => (
                    <div key={s.lbl}>
                      <div className="text-xl font-black text-blue-400 mb-1">{s.val}</div>
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
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product profitability analysis software</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              The cost of launching without{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">product profitability analysis</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A real comparison. Same category, same investment window. One seller uses Insydz. One does not.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Without */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-red-200 dark:border-red-900 p-7">
              <span className="text-sm font-bold text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">Without Insydz, 6 Month Period</span>
              {withoutRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-red-500">{row.val}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-red-200 dark:border-red-900">
                <span className="text-xl font-black text-red-600">Total loss: Rs 2,24,000</span>
              </div>
            </div>
            {/* With */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-green-200 dark:border-green-900 p-7">
              <span className="text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">With Insydz, 6 Month Period</span>
              {withRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-green-600">{row.val}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-900">
                <span className="text-xl font-black text-green-600">Total gain: +Rs 3,10,000</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
            <p className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed">
              <strong className="block text-lg font-black text-blue-700 dark:text-blue-400 mb-1">Rs 5.34 Lakh difference between a validated product launch and a gut-feel launch.</strong>
              That is the value Insydz's <strong>product profitability analysis software</strong> provides to Indian sellers every 6 months.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Start free. See real opportunities.</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Free plan includes{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">product research</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every plan includes the product research tool, opportunity finder tool, and product margin calculator. No credit card required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`rounded-3xl p-7 flex flex-col h-full ${plan.featured ? "bg-gradient-to-br from-blue-600 to-sky-500" : "bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700"}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-white/70" : "text-blue-600"}`}>{plan.plan}</p>
                <p className={`text-3xl font-black mb-1 ${plan.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.price}</p>
                <p className={`text-xs mb-5 ${plan.featured ? "text-white/60" : "text-gray-400"}`}>{plan.period}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.items.map((item, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/85" : "text-gray-600 dark:text-gray-400"}`}>
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${plan.featured ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                        <CheckCircle2 className={`w-2.5 h-2.5 ${plan.featured ? "text-white" : "text-blue-500"}`} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.route} className={`block w-full text-center font-bold py-3 px-6 rounded-full text-sm transition-all mt-auto ${plan.featured ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:opacity-90"}`}>
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
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product research FAQs</span>
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
                    ? <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" />
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
      <section className="py-20 px-4 bg-gradient-to-br from-blue-700 to-sky-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 text-white">Stop Guessing. Start Selling Winners.</h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            India's only platform that combines product profitability analysis software, real demand data, and margin intelligence built for Amazon India and Flipkart.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white text-blue-700 font-bold px-12 py-6 rounded-full shadow-2xl group hover:bg-blue-50 mb-12">
            Discover Profitable Products Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              { val: "Free", lbl: "25 products to start" },
              { val: "67 min", lbl: "To first opportunity" },
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
