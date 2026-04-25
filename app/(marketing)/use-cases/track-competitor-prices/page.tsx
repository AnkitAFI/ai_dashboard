"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, AlertCircle, Clock,
  ShoppingBag, Smartphone, X, Check,
  RefreshCw, FileSpreadsheet, Shield, Eye,
  ChevronDown, Menu, Sun, Moon, ArrowLeft, BookOpen, 
  Video, FileText, Store, Briefcase, Users, Code, Globe, Trophy,
  Flame, Presentation, DollarSign, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Competitor Price Tracker",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most powerful competitor price tracking tool for Amazon and Flipkart sellers.",
    "url": "https://insydz.com/use-cases/track-competitor-prices"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Track Competitor Prices", "item": "https://insydz.com/use-cases/track-competitor-prices" }
    ]
  }
];

type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
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
    { name: "Track Competitor Prices", icon: <TrendingDown className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
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

const comparisonRows = [
  { feature: "Monitoring", manual: "Checking listings manually", insydz: "Automatic 24/7 tracking" },
  { feature: "Response Time", manual: "Late reactions (hours/days)", insydz: "Instant alerts (minutes)" },
  { feature: "Data Management", manual: "Excel sheets, constantly stale", insydz: "Live dashboard, always current" },
  { feature: "Decision Quality", manual: "Panic discounts without margin data", insydz: "AI-guided, margin-aware repricing" },
  { feature: "Time Investment", manual: "8–12 hours wasted per week", insydz: "Minutes per day set and forget" },
  { feature: "Historical Data", manual: "No pattern detection", insydz: "90-day price history per competitor" },
];

const roiWithout = [
  { label: "Competitor drops Friday 9pm discovered Monday morning", value: "−₹22,000" },
  { label: "Panic discounting below margin floor to recover Buy Box", value: "−₹8,000" },
  { label: "Hours spent manually checking 8 competitors, 3× per week", value: "−14 hrs/month" },
  { label: "Missed upward pricing opportunity (all rivals raised prices)", value: "−₹12,000" },
];

const roiWith = [
  { label: "Friday 9:04pm WhatsApp alert repriced by 9:07pm", value: "+₹19,000" },
  { label: "AI margin floor shown no panic discounting", value: "+₹7,500" },
  { label: "Zero manual checking 14 hours freed", value: "+₹14,000" },
  { label: "Spot rival price increases early raised own price by ₹80", value: "+₹11,200" },
];

const faqs = [
  { id: "faq-1", q: "How often does Insydz track competitor prices?", a: "Insydz monitors competitor prices continuously — with checks running multiple times per hour on high-velocity products. During Flipkart Big Billion Days and Amazon Great Indian Festival, monitoring frequency increases automatically. You receive a WhatsApp alert within minutes of any competitor price change that crosses your set threshold." },
  { id: "faq-2", q: "Does this competitor price tracking work for Amazon India and Flipkart only?", a: "Yes. Insydz is built specifically for Indian marketplaces — Amazon.in and Flipkart. All pricing data is in INR, all competitor tracking covers Indian marketplace listings, and all Buy Box risk alerts are calibrated for how Indian marketplaces determine Buy Box eligibility." },
  { id: "faq-3", q: "Will constant price changes hurt my margins?", a: "Not with Insydz. The platform shows your margin floor alongside every competitor price drop alert, so you always know the minimum price you can go to without selling at a loss. The AI recommends a response price that protects your Buy Box while keeping your margin intact — not just matching the lowest price blindly." },
  { id: "faq-4", q: "Can I track multiple competitors per product?", a: "Yes. Insydz tracks up to 100+ competitors per product. You can monitor all sellers in your product category simultaneously — including new entrants. You'll be alerted when any seller makes a significant price change, not just the top 3." },
  { id: "faq-5", q: "Is the free plan limited for competitor price tracking?", a: "The free plan lets you track a limited number of products with real-time competitor price alerts and Amazon & Flipkart data — no credit card required. Paid plans unlock tracking across your full catalogue, more competitors per product, 90-day historical price trends, advanced Buy Box monitoring, and AI pricing recommendations." },
  { id: "faq-6", q: "Do I get WhatsApp alerts for competitor price changes?", a: "Yes. Every significant competitor price change triggers an instant WhatsApp notification with the competitor name, their old price, new price, percentage drop, and an AI-suggested response price for your product in INR." },
];

export default function TrackCompetitorPricesPage() {
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
      const id = `insydz-price-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id; script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => { SCHEMAS.forEach((_, i) => { document.getElementById(`insydz-price-schema-${i}`)?.remove(); }); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    isDarkMode ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDropdown(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGetStarted = () => router.push("/login");
  const toggleMobileMenu = (name: string) => setMobileActiveMenu(mobileActiveMenu === name ? null : name);
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
    const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const DesktopDropdown = ({ label, menuKey, accent = "purple" }: { label: string; menuKey: keyof NavigationMenu; accent?: "purple" | "orange" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button onMouseEnter={() => setActiveDropdown(label)} className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : (ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20")}`}>
          {label}<ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
        {isActive && (
          <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {items.map((item, i) => (
              item.route ? (
                <Link
                  key={i}
                  href={item.route}
                  onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 group transition-colors ${
                    ac ? "hover:bg-orange-50 dark:hover:bg-orange-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  }`}
                >
                  <span className={`flex-shrink-0 ${ac ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                  <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                  {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">{item.badge}</span>}
                </Link>
              ) : (
                <span
                  key={i}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 opacity-60 cursor-default`}
                >
                  <span className={`flex-shrink-0 ${ac ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                  <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                </span>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      

      {/* ══ NAV ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <a href="/" className="flex items-center space-x-1 group">
  <div className="relative">
    <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
  </div>
  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
</a>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-3" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" accent="orange" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">Pricing</Link>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Link href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Link>
              <button className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">
  <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Home
</a>
              {(["Solutions","Use Cases","Features","Free Tools","Compare","Resources","About"] as (keyof NavigationMenu)[]).map((key) => (
                <div key={key}>
                  <button onClick={() => toggleMobileMenu(key)} className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${key === "Use Cases" ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                    {key}<ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === key ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === key && (
                    <div className="ml-3 sm:ml-4 mt-0.5 space-y-0.5">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg ${key === 'Use Cases' ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="text-left flex-1">{item.name}</span>
                            {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="text-left flex-1">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">Pricing</Link>
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center text-sm py-2 rounded-lg font-semibold block">Login</a>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-red-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-orange-700">India's #1 Competitor Price Tracking Tool 🇮🇳</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Track Competitor Prices in Real Time.
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">Never Lose Sales</span>
                <br />
                to Sudden Price Drops.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>competitor price tracking tool</strong> for Amazon and Flipkart sellers. Monitor rival pricing automatically and react instantly
                <span className="text-orange-700 font-semibold"> without manual tracking or Excel chaos.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
                  Start Free Price Tracking
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} size="lg" variant="outline" className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 sm:pt-4">
                {["Built for Indian marketplaces all data in INR","Amazon & Flipkart supported simultaneously","WhatsApp price alerts no credit card required"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Premium Wireless Earbuds</h3>
                      <p className="text-xs text-gray-500">Tracking 5 competitors</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Your Price</span>
                        <span className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">₹1,199</span>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-2.5 sm:p-3 animate-pulse">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Competitor A</span>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-sm text-gray-400 line-through">₹1,199</span>
                          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                          <span className="text-base sm:text-lg font-bold text-red-600">₹999</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <p className="text-xs text-red-600 font-semibold">Price dropped 17% — Buy Box at risk</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Competitor B</span>
                        <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">₹1,299</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">WhatsApp Alert Sent — 9:04pm</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">"Competitor A dropped to ₹999 — AI suggests ₹1,049"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm">Live Tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY MANUAL FAILS ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Why Manual Price Tracking
              <br />
              <span className="text-red-600">Is Killing Your Profits</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Most Amazon and Flipkart sellers still check competitor prices by hand. Here's why that approach fails, every time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitors change prices multiple times a day you can't keep up manually", color: "from-red-500 to-orange-500" },
              { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "You notice price drops too late after your Buy Box rank has already fallen", color: "from-orange-500 to-yellow-500" },
              { icon: <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Excel tracking is outdated within hours the data is stale before you use it", color: "from-yellow-500 to-orange-500" },
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Price wars silently eat your margins panic discounting costs more than the lost sale", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-sm sm:text-base">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg mb-8 sm:mb-12">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Most sellers lose <span className="text-red-600">20–40% of potential revenue annually</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg">
              ...because they react late to competitor price changes or don't react at all until the damage is  <span className="text-red-600">already visible in their sales report.</span>
            </p>
          </div>

          {/* Manual vs Insydz */}
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"><X className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Manual Tracking</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {["Constantly refreshing product listings to check prices","Excel sheets become chaos within days","Missed Buy Box opportunities every night","No margin data available when repricing","Hours wasted every single week"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">With Insydz</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {["Automatic 24/7 competitor monitoring no manual checks needed","Instant WhatsApp alerts when any competitor changes price","Never miss a price change even at 2am during Big Billion Days","AI shows your margin floor before you reprice","Set it once monitor forever"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HALF THE JOB ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Tracking Prices Is Only Half the Job.
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">The Other Half Is Knowing How to React.</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Most competitor price tracking tools give you a spreadsheet of price changes. Insydz gives you the price change and the recommended response with your margin floor already calculated.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
            {[
              { icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Real-Time Price Monitoring", desc: "Insydz tracks competitor pricing across Amazon India and Flipkart continuously. Price changes are detected within minutes not at the end of the day when you check your dashboard.", link: "/features/price-tracker", linkLabel: "marketplace price tracking dashboard", color: "from-blue-500 to-cyan-500" },
              { icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Historical Price Trends", desc: "See how competitor prices have moved over the last 30, 60, or 90 days. Spot recurring pricing patterns like weekend flash drops or pre-sale inflation before they catch you off guard again.", link: "/features/price-history", linkLabel: "historical price tracker", color: "from-purple-500 to-pink-500" },
              { icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Buy Box Risk Alerts", desc: "Insydz monitors Buy Box eligibility signals in real time. When a competitor's price drops close to your threshold, you get an alert before you lose the Buy Box not after your sales velocity has already dropped.", link: "/features/buy-box-alerts", linkLabel: "buy box monitoring software", color: "from-red-500 to-orange-500" },
              { icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8" />, title: "WhatsApp Notifications", desc: "Indian sellers don't monitor email dashboards. Insydz delivers every critical price alert directly to your WhatsApp with the competitor name, old price, new price, percentage drop, and an AI-suggested response price in INR.", link: "/features/whatsapp-alerts-feature", linkLabel: "WhatsApp price alerts", color: "from-green-500 to-emerald-500" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 hover:border-orange-400 hover:shadow-xl transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>{item.icon}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">{item.desc}</p>
                    <button onClick={() => router.push(item.link)} className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline">See {item.linkLabel} →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Competitor Price Tracking
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Done Automatically</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Insydz continuously tracks competitor prices across Amazon & Flipkart and alerts you the moment something changes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 -translate-y-1/2 z-0" />
            {[
              { step: 1, title: "Add Your Product", desc: "Enter your ASIN or Flipkart listing. Insydz automatically identifies 100+ competitors in your category. Setup: under 2 minutes.", visual: <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mx-auto" />, bg: "bg-orange-100 dark:bg-orange-900/20", isAlerts: false },
              { step: 2, title: "AI Monitors Prices 24/7", desc: "We track competitor price changes, discounts, and stock signals continuously overnight, weekends, and during festive sale events.", visual: <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto animate-pulse" />, bg: "bg-purple-100 dark:bg-purple-900/20", isAlerts: false },
              { step: 3, title: "Get Instant Alerts & Actions", desc: "", visual: null, bg: "", isAlerts: true },
            ].map((step, i) => (
              <div key={i} className="relative z-10">
                <div className="bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg">{step.step}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{step.title}</h3>
                  {step.isAlerts ? (
                    <div className="space-y-2 sm:space-y-3 text-left">
                      {[
                        { cls: "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700", icon: "text-red-600", text: '"Competitor dropped price by 11%"' },
                        { cls: "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700", icon: "text-orange-600", text: '"Lowest price changed Buy Box at risk"' },
                        { cls: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700", icon: "text-green-600", text: '"AI suggests: ₹1,049 protects margin & Buy Box"' },
                      ].map((a, ai) => (
                        <div key={ai} className={`flex items-start gap-2 ${a.cls} border rounded-lg p-2.5 sm:p-3`}>
                          <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${a.icon} flex-shrink-0 mt-0.5`} />
                          <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-300">{a.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{step.desc}</p>
                      <div className={`${step.bg} rounded-2xl p-3 sm:p-4`}>{step.visual}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
              Track Your First Competitor Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ WHAT SELLERS DO ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              What Sellers Do with
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Competitor Price Insights</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real-time pricing intelligence is only valuable if it drives action. Here's what Indian sellers actually do once they have it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Zap className="w-5 h-5 sm:w-7 sm:h-7" />, title: "React Instantly to Price Drops", desc: "WhatsApp alert arrives within minutes of a competitor drop. Reprice from your phone before your Buy Box rank slips even at 11pm during sale season."},
              { icon: <Shield className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Protect Buy Box Without Panic Discounting", desc: "See your margin floor alongside every alert. Make informed price decisions not desperate ones knowing exactly how low you can go without selling at a loss."},
              { icon: <Eye className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Identify Fake Price Wars", desc: "Historical price trend data reveals which competitor drops are temporary tactics and which represent a real market shift so you don't cut prices unnecessarily."},
              { icon: <Clock className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Time Discounts Intelligently", desc: "Spot recurring competitor pricing patterns weekend drops, pre-sale inflation and time your own promotional pricing to maximise impact and margin."},
              { icon: <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Increase Profit Without Losing Volume", desc: "When all competitors raise prices, you see it immediately and can adjust upward with confidence capturing higher margins without losing market share."},
              { icon: <Target className="w-5 h-5 sm:w-7 sm:h-7" />, title: "Stay Competitive in Your Category", desc: "Never be the seller who finds out about a price war on Monday morning after losing the whole weekend's orders."},
            ].map((uc, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">{uc.icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{uc.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INDIA-FIRST + SELLER SCENARIO ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              How Insydz Is Different
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Built for Indian Marketplace Sellers</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Global price tracking tools weren't designed for the way Indian marketplaces work. Insydz is built specifically for Amazon.in and Flipkart with Indian seller behaviour, INR data, and WhatsApp-first alerts at its core.
            </p>
          </div>

          {/* Scenario */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 shadow-lg">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div>
                <p className="text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Real Seller Scenario</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Kitchenware Seller, Noida</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">Ravi sells premium non-stick cookware on Amazon India. Every Monday his sales would inexplicably drop but by Tuesday, they were back. For months, he assumed it was an algorithm issue.</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">When he started using Insydz, the pattern revealed itself immediately: a competitor was running a Sunday-night-to-Monday-morning flash price drop going from ₹1,299 to ₹899 at 10pm on Sundays and reverting by Tuesday morning.</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">With Insydz, he set a price alert for that competitor. The next Sunday at 10:07pm, his WhatsApp buzzed. He repriced from his phone in 3 minutes. By Monday morning, his Buy Box was secure.</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[{ label: "Saved in First Month", value: "₹18,000" },{ label: "Response Time", value: "3 minutes" },{ label: "Alert Received", value: "10:07pm Sunday" }].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-700 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-black text-orange-600 dark:text-orange-400">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl -webkit-overflow-scrolling-touch">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-3">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Task</p></div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-500 text-xs sm:text-sm text-left">Manual Tracking</p></div>
                <div className="bg-orange-500 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-orange-400"><p className="font-bold text-white text-xs sm:text-sm text-left">✓ Insydz</p></div>
                {comparisonRows.map((row, i) => (
                  <>
                    <div key={`f-${i}`} className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{row.feature}</p></div>
                    <div key={`m-${i}`} className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 text-center ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-xs sm:text-sm text-gray-500 flex items-left justify-left gap-1"><X className="w-3 h-3 text-red-500 flex-shrink-0" />{row.manual}</p></div>
                    <div key={`s-${i}`} className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-orange-50 dark:bg-orange-900/10" : "bg-orange-50/50 dark:bg-orange-900/10"}`}><p className="text-xs sm:text-sm text-orange-700 dark:text-orange-400 font-semibold flex items-left justify-left gap-1"><Check className="w-3 h-3 text-green-600 flex-shrink-0" />{row.insydz}</p></div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ROI ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              What Real-Time Price Tracking
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Is Worth to Your Business</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Two sellers in the same Flipkart category. Same products. Same pricing. The only difference: one has Insydz, one doesn't.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-6 sm:mb-8">
            {[
              { title: "Without Insydz Monthly Cost", rows: roiWithout, total: "Total Monthly Cost of Slow Reactions", totalValue: "−₹42,000", headerCls: "bg-red-50 dark:bg-red-900/30", textCls: "text-red-700 dark:text-red-400", valueCls: "text-red-600", totalBg: "bg-red-50 dark:bg-red-900/20", totalTextCls: "text-red-700", borderCls: "border-red-300 dark:border-red-700" },
              { title: "With Insydz Same Month", rows: roiWith, total: "Net Monthly Value with Insydz", totalValue: "+₹51,700", headerCls: "bg-green-50 dark:bg-green-900/30", textCls: "text-green-700 dark:text-green-400", valueCls: "text-green-600", totalBg: "bg-green-50 dark:bg-green-900/20", totalTextCls: "text-green-700", borderCls: "border-green-300 dark:border-green-700" },
            ].map((panel, pi) => (
              <div key={pi} className={`rounded-2xl border-2 ${panel.borderCls} overflow-hidden shadow-lg`}>
                <div className={`${panel.headerCls} px-4 sm:px-6 py-3 sm:py-4`}><p className={`font-bold ${panel.textCls} text-sm sm:text-lg`}>{panel.title}</p></div>
                <div className="bg-white dark:bg-gray-900">
                  {panel.rows.map((row, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 gap-2 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1">{row.label}</p>
                      <p className={`text-xs sm:text-sm font-bold ${panel.valueCls} whitespace-nowrap flex-shrink-0`}>{row.value}</p>
                    </div>
                  ))}
                  <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 ${panel.totalBg} gap-2`}>
                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm flex-1">{panel.total}</p>
                    <p className={`font-black ${panel.totalTextCls} text-base sm:text-lg ml-2 whitespace-nowrap flex-shrink-0`}>{panel.totalValue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-400 rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-2">₹93,700/month difference between a seller with real-time price intelligence and one without it</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Same category. Same products. The only variable: whether you have a <strong>competitor price tracking tool</strong> working for you 24/7.</p>
          </div>
        </div>
      </section>

      {/* ══ FREE PLAN ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Start Free.
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">See Real Price Movements</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">Free Plan — ₹0 / Forever No credit card required</p>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-left shadow-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-4 sm:mb-6 text-center">Free Plan Includes:</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {["Track limited products on Amazon India and Flipkart","Competitor price alerts via WhatsApp","Amazon & Flipkart data in INR","No credit card required"].map((feature, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-700 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-orange-600">Upgrade teaser:</span> Paid plans unlock deeper tracking, more competitors per product, 90-day historical price trends, advanced Buy Box monitoring, and AI pricing recommendations.
              </p>
            </div>
          </div>

          <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group">
            Start Free Price Tracking
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* ══ WHO SHOULD USE ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 sm:mb-12 text-center text-gray-900 dark:text-white">
            Who Should Use
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Competitor Price Tracking?</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Best For</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {["Amazon India and Flipkart active sellers in any category","Sellers in competitive, price-sensitive product categories","Sellers with Buy Box-sensitive products (electronics, personal care, home goods)","Sellers actively protecting their margins during sale events","D2C brands tracking category price positioning on Indian marketplaces","Agencies managing multiple Amazon/Flipkart client accounts"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"><X className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Not Ideal For</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {["One-time sellers with no growth plan","Fixed-price government or regulated categories","Sellers not actively monitoring competition"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-4 text-center text-gray-900 dark:text-white">Competitor Price Tracking FAQs</h2>
          <p className="text-center text-gray-500 mb-8 sm:mb-12 text-base sm:text-lg">Everything about tracking rival pricing on Amazon India & Flipkart</p>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 transition-all">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg">{faq.q}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-white dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-4 text-white">Three Paths </h2>
          <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-12">Based on Where You Are Now</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[
              { label: "New Sellers (Free Plan)", desc: "The free plan gives you real competitor pricing data from day one so you launch knowing what price the market will actually bear. No credit card required.", cta: "Start Free Price Tracking →", action: handleGetStarted },
              { label: "Growing Sellers (Growth Plan)", desc: "Doing ₹5L+ monthly? Every day of slow price reaction is costing you measurable revenue. The Growth Plan gives you full competitor tracking across your entire catalogue.", cta: "Try Growth Plan →", action: () => router.push("/pricing") },
              { label: "Agencies & Brand Managers (Demo)", desc: "Managing multiple seller accounts? Run competitor price tracking across all clients from one dashboard with white-label reporting per account.", cta: "Book a Demo →", action: () => router.push("/demo") },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 sm:p-6 text-left">
                <p className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{card.label}</p>
                <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4">{card.desc}</p>
                <button onClick={card.action} className="text-orange-100 font-semibold text-xs sm:text-sm hover:text-white transition-colors underline">{card.cta}</button>
              </div>
            ))}
          </div>

          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group">
            Start Free Price Tracking
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm">✓ No credit card required  ✓ Setup in 2 minutes  ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ══ RELATED USE CASES ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Related Seller Use Cases</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Explore more ways to grow your ecommerce business</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Find Profitable Products", icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-blue-500 to-cyan-500", route: "/use-cases/find-profitable-products" },
              { title: "Analyse Customer Reviews", icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-purple-500 to-pink-500", route: "/use-cases/analyze-customer-reviews" },
              { title: "Improve Amazon & Flipkart SEO", icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-green-500 to-emerald-500", route: "/use-cases/improve-seo" },
              { title: "Avoid Stockouts & Missed Sales", icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-orange-500 to-red-500", route: "/use-cases/avoid-stockouts" },
            ].map((uc, i) => (
              <div key={i} onClick={() => router.push(uc.route)} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${uc.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{uc.icon}</div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{uc.title}</h3>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-1.5 sm:mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STICKY MOBILE CTA ══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base">
         Start Free Price Tracking
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content on mobile */}
      <div className="lg:hidden h-16 sm:h-20" />

      {/* Footer */}
      
 
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
 









