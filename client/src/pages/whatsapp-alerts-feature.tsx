import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, Eye, Sparkles,
  ChevronDown, Award, DollarSign, Users,
  Brain, Package, ThumbsUp, MessageCircle,
  Clock, Smartphone, Menu, Sun, Moon,
  ShoppingBag, Store, Briefcase, Code,
  Globe, Trophy, ArrowLeft, BookOpen,
  Video, FileText, Star, RefreshCw,
  Presentation, Flame, MapPin, Building2, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

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
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/solutions" },
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

const schemaSoftwareWhatsAppAlerts = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#whatsapp-alerts",
  "name": "Insydz WhatsApp Alerts for Amazon Sellers",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/whatsapp-alerts-feature",
  "description": "Get instant WhatsApp alerts for price drops, Buy Box changes, stockouts, and new reviews on Amazon & Flipkart.",
  "featureList": [
    "Price change alerts — competitor drops below your threshold",
    "Stockout warning alerts — inventory running critically low",
    "Buy Box loss alerts — instant notification when Buy Box changes hands",
    "New review alerts — 1-star and 2-star reviews flagged immediately",
    "AI opportunity alerts — demand spikes and pricing gaps detected",
    "Keyword rank drop alerts — when a keyword falls a page",
    "Delivered via WhatsApp — no separate app install required"
  ],
  "offers": {
    "@type": "Offer",
    "price": "1999",
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "1999",
      "priceCurrency": "INR",
      "unitCode": "MON"
    }
  },
  "creator": {
    "@id": "https://insydz.com/#organization"
  }
};

const schemaBreadcrumbWhatsAppAlerts = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://insydz.com/features" },
    { "@type": "ListItem", "position": 3, "name": "WhatsApp Alerts", "item": "https://insydz.com/features/whatsapp-alerts-feature" }
  ]
};

const schemaFAQWhatsAppAlerts = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I set up WhatsApp alerts for Amazon seller notifications?",
      "acceptedAnswer": { "@type": "Answer", "text": "Connect your WhatsApp by scanning a QR code inside your Insydz dashboard, choose alert types, set thresholds, and you're live." }
    },
    {
      "@type": "Question",
      "name": "Which alerts can I receive on WhatsApp for my Amazon India store?",
      "acceptedAnswer": { "@type": "Answer", "text": "Price Change Alerts, Buy Box Lost Alert, Stockout Warnings, New Review Alerts, Rank Change Alerts, and AI Opportunity Alerts." }
    },
    {
      "@type": "Question",
      "name": "Will I be spammed with too many WhatsApp messages?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. You control alert frequency and thresholds. Most sellers get 3–8 targeted alerts per day." }
    },
    {
      "@type": "Question",
      "name": "Does this work with WhatsApp Business?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Works with WhatsApp and WhatsApp Business; multiple numbers can be added for teams or VAs." }
    },
    {
      "@type": "Question",
      "name": "Are WhatsApp alerts available on the free plan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Free plan includes alerts for price changes, stockouts, basic Buy Box alerts, and review notifications." }
    },
    {
      "@type": "Question",
      "name": "Can multiple team members receive the same WhatsApp alerts?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Paid plans allow multiple numbers with role-based alert assignments." }
    }
  ]
};

const SCHEMAS = [schemaSoftwareWhatsAppAlerts, schemaBreadcrumbWhatsAppAlerts, schemaFAQWhatsAppAlerts];

export default function WhatsAppAlertsFeaturePage() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-wa-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      document.getElementById(`insydz-wa-schema-${i}`)?.remove();
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

  const handleGetStarted = () => setLocation("/login");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);
  const toggleMobileMenu = (menuName: string) => setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      setLocation(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const faqs = [
    {
      question: "How do I set up WhatsApp alerts for Amazon seller notifications?",
      answer: "Setting up Insydz WhatsApp alerts takes 60 seconds and requires no technical knowledge. Connect your WhatsApp by scanning a QR code inside your Insydz dashboard, choose which alert types you want (price changes, Buy Box, stockouts, reviews, rank changes), set your thresholds, and you're live. The first alert arrives within minutes of setup. No app installation required — alerts arrive directly in your existing WhatsApp."
    },
    {
      question: "Which alerts can I receive on WhatsApp for my Amazon India store?",
      answer: "Insydz delivers six types of WhatsApp alerts for Amazon India and Flipkart sellers: Price Change Alerts, Buy Box Lost Alert, Stockout Warnings, New Review Alerts (1-star and 2-star reviews flagged immediately), Rank Change Alerts, and AI Opportunity Alerts. All six are included on the free plan."
    },
    {
      question: "Will I be spammed with too many WhatsApp messages?",
      answer: "No. Insydz gives you full control over alert frequency and thresholds. You set the minimum price change percentage that triggers a price alert, the stock level that triggers a stockout warning, which review star ratings trigger a notification, and quiet hours. Most sellers receive 3–8 targeted alerts per day, not hundreds of noise notifications."
    },
    {
      question: "Does this work with WhatsApp Business?",
      answer: "Yes. Insydz WhatsApp alerts work with both regular WhatsApp and WhatsApp Business. You can also add multiple WhatsApp numbers — useful if you want alerts going to both you and a team member or VA who manages your listings."
    },
    {
      question: "Are WhatsApp alerts available on the free plan?",
      answer: "Yes. The free plan includes WhatsApp alerts for price changes, stockout warnings, basic Buy Box alerts, and review notifications — permanently, with no credit card required and no expiry date. Paid plans (₹1,999/month and ₹2,999/month) unlock unlimited alerts, multiple WhatsApp numbers, instant delivery (under 2 minutes), and custom alert templates."
    },
    {
      question: "Can multiple team members receive the same WhatsApp alerts?",
      answer: "Yes. On paid plans (₹1,999/month and ₹2,999/month), you can add multiple WhatsApp numbers. Each team member can be assigned specific alert types — the operations manager gets stockout warnings, the pricing manager gets price and Buy Box alerts, and the founder gets a daily digest. Agencies can send client-specific alerts directly to individual seller WhatsApp numbers."
    },
  ];

  const alertTypes = [
    {
      emoji: "💰",
      title: "Price Change Alerts",
      desc: "Competitor dropped price by 10%+ on your top product",
      detail: "Know the moment a competitor reprices — before you lose the Buy Box to a lower price. Set your sensitivity threshold so you only get alerted when it actually matters.",
      color: "border-green-400 bg-green-50 dark:bg-green-900/20"
    },
    {
      emoji: "📦",
      title: "Stockout Warnings",
      desc: "Only 12 units left. Reorder now to avoid stockout",
      detail: "Get notified when inventory drops below your reorder threshold — before you run out, lose rank, and hand sales to competitors during a festive sale peak.",
      color: "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
    },
    {
      emoji: "⭐",
      title: "New Review Alerts",
      desc: "1-star review received on Wireless Earbuds Pro",
      detail: "1-star and 2-star reviews flagged the moment they land — in Hindi and English. Respond, escalate, or request removal before it damages your rating. The only instant alert tool for sellers that processes both languages.",
      color: "border-red-400 bg-red-50 dark:bg-red-900/20"
    },
    {
      emoji: "🎯",
      title: "Buy Box Lost Alert",
      desc: "You lost Buy Box on Phone Case Bundle — act now",
      detail: "The single most expensive event for any Amazon seller — losing the Buy Box silently. Get alerted the moment it happens with the current competitor price, so you can reprice in minutes.",
      color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      emoji: "🚀",
      title: "AI Opportunity Alert",
      desc: '"budget earbuds" — low competition, 18K searches/mo',
      detail: "Not just alerts about what's going wrong — alerts about what's going right for you to act on. New low-competition, high-demand products surfaced in your category as AI detects them.",
      color: "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
    },
    {
      emoji: "📈",
      title: "Rank Change Alert",
      desc: "Your keyword rank improved from #12 to #4 today!",
      detail: "Track your keyword rank movement in real time. Get notified when you break into the top 10, or when a rank drop signals a listing issue you need to act on immediately.",
      color: "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/features/whatsapp-alerts-feature" />
        <title>WhatsApp Alerts — Get Notified Where You Actually Look</title>
        <meta name="description" content="India's only Amazon seller WhatsApp notification tool delivers instant price alerts, Buy Box warnings, stockout signals, and bad review flags — straight to the app you check 50 times a day. Because you check WhatsApp 50× a day — not your email." />
        <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareWhatsAppAlerts) }}
  />

  {/* Breadcrumb */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbWhatsAppAlerts) }}
  />

  {/* FAQ */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQWhatsAppAlerts) }}
  />
      </Helmet>
      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-1 group">
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Insydz</span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              {(["Solutions", "Use Cases"] as const).map((menu) => (
                <div key={menu} className="relative">
                  <button onMouseEnter={() => setActiveDropdown(menu)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center gap-1">
                    {menu} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === menu && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {navigationMenu[menu].map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 flex-1">{item.name}</span>
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-green-600 dark:text-green-400">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Features — highlighted */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-3 py-2 text-sm text-green-600 dark:text-green-500 font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Features.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-green-600 dark:text-green-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

               <Link href="/pricing" className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">Pricing</Link>

              {/* Free Tools */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Free Tools')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Free Tools' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Free Tools"].map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Compare */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Compare')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Compare.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Resources.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* About */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('About')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  About <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'About' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.About.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              <a href="/login" className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">Login</a>
              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
               <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(["Solutions", "Use Cases"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium">
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {navigationMenu[menu].map((item, i) => (
                        item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                          {item.icon}{item.name}
                        </Link>
                      ) : (
                        <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                          {item.icon}{item.name}
                        </span>
                      )
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div>
                <button onClick={() => toggleMobileMenu('Features')} className="flex items-center justify-between w-full px-4 py-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-semibold">
                  Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Features' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Features.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                          {item.icon}{item.name}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium">Pricing</Link>
              <div>
                <button onClick={() => toggleMobileMenu('Free Tools')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Free Tools <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Free Tools' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu["Free Tools"].map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                          {item.icon}{item.name}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => toggleMobileMenu('Compare')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Compare <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Compare' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Compare.map((item, i) => (
                       item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          {item.icon}{item.name}
                        </Link>
                      ) : (
                        <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                          {item.icon}{item.name}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => toggleMobileMenu('Resources')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Resources <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Resources' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Resources.map((item, i) => (
                       item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          {item.icon}{item.name}
                        </Link>
                      ) : (
                        <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                          {item.icon}{item.name}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => toggleMobileMenu('About')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  About <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'About' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.About.map((item, i) => (
                       item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          {item.icon}{item.name}
                        </Link>
                      ) : (
                        <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                          {item.icon}{item.name}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-lg font-semibold block">Login</a>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-4 py-2">
                <Bell className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Feature Spotlight • NEW</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                WhatsApp Alerts —
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">Get Notified</span>
                <br />
                Where You Actually Look
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                India's only Amazon seller WhatsApp notification tool delivers instant price alerts, Buy Box warnings, stockout signals, and bad review flags — straight to the app you check 50 times a day.
                <span className="text-green-700 font-semibold"> Because you check WhatsApp 50× a day — not your email.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl transition-all inline-flex items-center">
                  👉 Enable WhatsApp Alerts Free
                  <ArrowRight className="ml-2" />
                </a>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-green-600 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold px-8 py-6 text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Instant delivery", "No extra app needed", "Full alert control"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-6 shadow-2xl max-w-sm mx-auto">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Insydz Alerts</p>
                    <p className="text-xs text-green-600">● Online</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { emoji: "💰", msg: "🚨 Price Alert!\nCompetitor dropped Wireless Earbuds to ₹999 (was ₹1,299)\nYour price: ₹1,199\nAction needed to win Buy Box!", time: "10:23 AM", urgent: true },
                    { emoji: "📦", msg: "⚠️ Low Stock Warning!\nPhone Case Bundle: Only 8 units left\nReorder ASAP to avoid stockout this weekend", time: "11:45 AM", urgent: false },
                    { emoji: "⭐", msg: "📢 New Review Alert!\n1★ review on Gaming Mouse X1\n\"stopped working after 2 weeks\"\nRespond quickly to protect rating!", time: "2:17 PM", urgent: true },
                  ].map((msg, i) => (
                    <div key={i} className={`rounded-2xl rounded-tl-sm p-3 max-w-[90%] ${msg.urgent ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'}`}>
                      <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{msg.msg}</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">{msg.time} ✓✓</p>
                    </div>
                  ))}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto">
                    <p className="text-xs text-gray-700 dark:text-gray-300">Got it! Adjusting price now 👍</p>
                    <p className="text-xs text-gray-400 mt-1 text-right">2:18 PM ✓✓</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm flex items-center gap-1"><Smartphone className="w-4 h-4" /> WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 ALERT TYPES ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">6 Types of Alerts That Save Your Business</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Never miss a critical event again — get the right alert at the right time, directly on your WhatsApp.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alertTypes.map((alert, i) => (
              <div key={i} className={`border-2 ${alert.color} rounded-2xl p-6 hover:shadow-lg transition-all`}>
                <div className="text-4xl mb-4">{alert.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{alert.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{alert.detail}</p>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">"{alert.desc}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Email Alerts <br /><span className="text-red-600">Don't Work for Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">The problem isn't that Indian sellers aren't monitoring their stores. The problem is they're monitoring the wrong channel — and by the time they see the alert, the damage is done.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mt-10">
            {[
              { icon: <Clock className="w-8 h-8" />, title: "Emails sit unread for hours", detail: "A price alert at 11pm means you see it at 9am — by which point you've already lost 10 hours of Buy Box.", color: "from-red-500 to-orange-500" },
              { icon: <AlertCircle className="w-8 h-8" />, title: "Critical alerts lost in spam", detail: "Your email client doesn't know the difference between a Buy Box alert and a promotional newsletter.", color: "from-orange-500 to-yellow-500" },
              { icon: <Eye className="w-8 h-8" />, title: "You check WhatsApp, not dashboards", detail: "Most sellers check their phones dozens of times a day and their email twice.", color: "from-yellow-500 to-orange-500" },
              { icon: <TrendingDown className="w-8 h-8" />, title: "Slow reaction = lost sales", detail: "In a Big Billion Days scenario, 4 hours of missed Buy Box can mean ₹1–3L in lost revenue for a mid-size seller.", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-green-400 hover:shadow-lg transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold mb-1">{pain.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pain.detail}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-3xl p-8 text-center shadow-lg">
            <Smartphone className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Indians open <span className="text-green-600">WhatsApp 50+ times daily</span> — but check email twice</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Your alerts should be where your attention already is. Not where it isn't.</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">Set Up in 60 Seconds</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              No technical knowledge needed — no app installation, no API keys, no developer required.
              <span className="text-green-700 font-semibold"> Connect WhatsApp, choose alerts, and you're live.</span>
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-4 gap-8 relative">
              {[
                { step: "1", title: "Connect your WhatsApp", detail: "Scan the QR code inside your Insydz dashboard. Takes 10 seconds. Works with personal WhatsApp and WhatsApp Business.", icon: <Smartphone className="w-12 h-12" /> },
                { step: "2", title: "Choose your alerts", detail: "Pick which alert types matter to your business — price changes, Buy Box, stockouts, reviews, rank changes, or AI opportunities.", icon: <Bell className="w-12 h-12" /> },
                { step: "3", title: "Set your thresholds", detail: "Control when and how often you're notified. Set quiet hours, minimum price change %, and stock level triggers to avoid noise.", icon: <Shield className="w-12 h-12" /> },
                { step: "4", title: "React instantly", detail: "Take action before competitors do. Reprice, reorder, or respond to reviews in minutes — not the next morning when you check your email.", icon: <Zap className="w-12 h-12" /> },
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 text-center relative z-10 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-black text-white">{item.step}</div>
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4 mb-4 text-green-600">{item.icon}</div>
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl inline-flex items-center">
              👉 Enable WhatsApp Alerts Free
              <ChevronRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">What WhatsApp Alerts Do for Your Business</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Six outcomes Indian sellers unlock when critical events stop getting missed — and start getting acted on in minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {[
              {
                icon: <Zap />,
                title: "React in minutes, not hours",
                detail: "The window between a competitor repricing and you winning or losing the Buy Box is measured in minutes during peak sales. WhatsApp alerts make you the fastest responder in your category.",
                color: "text-green-600"
              },
              {
                icon: <Shield />,
                title: "Protect from stockouts",
                detail: "Running out of stock during Diwali, Big Billion Days, or a viral moment doesn't just cost today's sales — it collapses your rank and review velocity for weeks. Stockout warnings prevent this entirely.",
                color: "text-blue-600"
              },
              {
                icon: <Star />,
                title: "Guard your reputation",
                detail: "A 1-star review responded to within 2 hours has a materially different impact than one left unanswered for 48 hours. Fast response signals to buyers — and Amazon's algorithm — that you're an engaged seller.",
                color: "text-yellow-600"
              },
              {
                icon: <TrendingUp />,
                title: "Win the Buy Box faster",
                detail: "Immediate price change notifications mean you can reprice the moment a competitor drops their price — not the next time you happen to log into your dashboard.",
                color: "text-emerald-600"
              },
              {
                icon: <Users />,
                title: "Keep your team informed",
                detail: "Add multiple WhatsApp numbers. Your VA gets stockout alerts, your pricing manager gets Buy Box alerts, and you get the daily digest. The right person gets the right alert.",
                color: "text-purple-600"
              },
              {
                icon: <RefreshCw />,
                title: "Stay updated 24/7",
                detail: "AI watches your store while you sleep. Competitors don't stop repricing at 10pm — and your WhatsApp notifications don't either.",
                color: "text-orange-600"
              },
            ].map((outcome, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center ${outcome.color}`}>{outcome.icon}</div>
                  <ThumbsUp className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-2">{outcome.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW: INDIA-FIRST ADVANTAGE ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Insydz WhatsApp Alerts Are Built for Indian Sellers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Most Amazon seller alert tools are built for US sellers managing email-first workflows. Indian sellers are WhatsApp-first by nature. Insydz is the only alert tool built around this reality.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "WhatsApp is India's business channel — not a workaround",
                detail: "Indian sellers manage vendors, VAs, warehouses, and operations on WhatsApp every day. Insydz delivers to the channel you're already using — not one more dashboard you have to remember to check.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: <Store className="w-8 h-8" />,
                title: "Amazon India + Flipkart — not just one marketplace",
                detail: "Most Amazon seller alert tools cover Amazon only. Indian sellers increasingly operate across Amazon India, Flipkart. Insydz covers all three — so a price drop on Flipkart triggers the same instant WhatsApp notification as one on Amazon India.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Flame className="w-8 h-8" />,
                title: "Festive sale intelligence — alerts calibrated for Indian events",
                detail: "Big Billion Days, Great Indian Festival, Holi, and Diwali see 10–20× normal pricing volatility. Insydz automatically increases alert sensitivity during detected sale periods — so you get notified faster when the cost of a missed alert is highest.",
                color: "from-orange-500 to-amber-500",
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Hindi review alerts — the signal most tools can't read",
                detail: "60–70% of Amazon India reviews are written in Hindi. Most instant alert tools only process English reviews — meaning the majority of your customer feedback goes unmonitored. Insydz flags 1-star and 2-star reviews in both Hindi and English, so no bad review goes unnoticed.",
                color: "from-purple-500 to-pink-500",
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:border-green-400 hover:shadow-lg transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-4`}>{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          {/* What most tools don't tell you */}
          <div className="mt-10 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">What most tools don't tell you:</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  An Amazon suppression listing tool that only monitors listings in English misses the single most common reason Indian sellers get suppressed — a pattern of negative reviews that start in Hindi and compound over weeks before the seller even knows there's a problem. Insydz's new review alert tool reads both languages so you can act on the complaint before it becomes a suppression.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: SELLER SCENARIO (DEEPA) ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Most Alert Tools Don't Tell You
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Most seller alert tools send you to a dashboard. The insight is buried inside an app you need to log in to. By the time you see it, the opportunity has passed.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-green-200" />
                <span className="text-green-100 text-sm">Electronics seller, Hyderabad | Amazon India | 22 SKUs | Managing alone with one VA</span>
              </div>
              <h3 className="text-2xl font-black text-white">Deepa's ₹4.6L Big Billion Days — Saved by a WhatsApp Message at 11:47pm</h3>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Before Insydz</h4>
                </div>
                <div className="space-y-3">
                  {[
                    "Lost the Buy Box on her top-selling Bluetooth speaker at 11:14pm when a competitor dropped to ₹999 (her price: ₹1,149)",
                    "Discovered it the next morning at 8:30am checking her dashboard",
                    "9 hours 16 minutes of Buy Box lost on her highest-velocity product of the year",
                    "Estimated loss: ₹1.8L in missed revenue in a single event",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>
                  <h4 className="font-bold text-gray-900 dark:text-white">With Insydz WhatsApp Alerts</h4>
                </div>
                <div className="space-y-3">
                  {[
                    "11:47pm — WhatsApp alert: '🔴 Price Alert! Competitor dropped Bluetooth Speaker to ₹999. Your price: ₹1,149. Action needed to win Buy Box.' Deepa sees it immediately.",
                    "11:51pm — She reprices to ₹989 from her phone. Buy Box recovered in 4 minutes. She also sees a stockout warning — WhatsApps her VA to reorder before midnight.",
                    "Next day — 1★ review on her earbuds. She responds within 90 minutes, offers a replacement, buyer updates to 3★. Rating stays at 4.4★ through peak.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outcomes */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { metric: "₹4.6L", label: "Big Billion Days revenue (vs ₹1.8L prior year)" },
                  { metric: "4 min", label: "Time to recover Buy Box after alert (vs 9+ hours)" },
                  { metric: "4.4★", label: "Rating maintained throughout peak sale event" },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-green-600">{stat.metric}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-green-700 dark:text-green-400">
                  ROI: Insydz at ₹1,999/month. The WhatsApp Buy Box alert alone recovered ₹1.8L in missed revenue in a single sale event. Full year subscription: ₹23,988. <span className="text-lg">ROI: 75× on one alert. 192× on the year.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Email Alerts vs WhatsApp Alerts</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">The honest comparison — every dimension that determines whether your critical business events get acted on in minutes or the next morning.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 mt-10">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Aspect</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Email Alerts</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20">WhatsApp Alerts (Insydz)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: "Open Rate", manual: "~20% (if not in spam)", insydz: "98% open rate" },
                  { aspect: "Response Time", manual: "Hours later", insydz: "Within minutes" },
                  { aspect: "Visibility", manual: "Buried in inbox", insydz: "Front & centre on phone" },
                  { aspect: "Team Reach", manual: "One inbox only", insydz: "Multiple numbers" },
                  { aspect: "User Experience", manual: "Friction-heavy — login to act", insydz: "Natural & instant — act from alert" },
                  { aspect: "Spam Risk", manual: "High — often auto-filtered", insydz: "None — not a spam channel" },
                  { aspect: "Night / Weekend Alerts", manual: "Seen next morning", insydz: "Seen and acted on in minutes" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.aspect}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{row.manual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-10 py-6 text-lg rounded-full shadow-xl inline-block">
            👉 Switch to WhatsApp Alerts
          </a>
          </div>
        </div>
      </section>

      {/* ── FREE PLAN ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Start Free. Get Alerts Instantly.</h2>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black text-green-600">₹0</span>
                <span className="text-2xl text-gray-600 dark:text-gray-400">/ Forever</span>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300">Free Plan Includes:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {["Price change alerts", "Stockout warnings", "Review notifications", "Basic Buy Box alerts"].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-green-600">Upgrade Teaser:</span> Unlock unlimited alerts, multiple WhatsApp numbers, instant delivery (under 2 minutes), custom alert templates, and festive sensitivity mode on paid plans (₹1,999/month and ₹2,999/month).
              </p>
            </div>
            <div className="text-center">
              <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl inline-block">
                👉 Enable WhatsApp Alerts Free
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: IS IT RIGHT FOR YOU ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Is WhatsApp Alerts Right for You?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Perfect For</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Active Amazon India and Flipkart sellers managing live inventory",
                  "Sellers who've ever woken up to find they lost the Buy Box overnight",
                  "D2C brands running time-sensitive festive campaigns and flash sales",
                  "Agencies managing multiple seller accounts who need instant client alerts",
                  "Any seller who checks WhatsApp more than they check their seller dashboard",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Less Useful For</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Sellers with fixed prices who don't participate in Buy Box competition",
                  "Single-product businesses with very low SKU count and no inventory risk",
                  "Sellers who primarily sell in categories without active price competition",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: TESTIMONIALS ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Indian Sellers Who Stopped Missing Critical Alerts</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Prashant V.",
                context: "Electronics seller, Pune | Amazon India | 31 SKUs",
                quote: "I lost ₹2.1L during last year's Great Indian Festival because I missed a Buy Box alert at 1am. This year I got the WhatsApp at 1:17am, repriced by 1:21am, and had the best single day I've ever had on Amazon. This feature alone paid for the entire year.",
                stars: 5,
              },
              {
                name: "Shruti M.",
                context: "Home & Kitchen brand, Surat | Amazon India + Flipkart",
                quote: "My VA and I both get the alerts now. She handles stockout reorders and I handle pricing. Before, she'd email me about a stockout and I'd see it 4 hours later. Now I see her reply to the WhatsApp in 8 minutes. We haven't had a stockout in 5 months.",
                stars: 5,
              },
              {
                name: "Aditya B.",
                context: "E-commerce agency, Mumbai | 18 Amazon India accounts",
                quote: "As an agency managing 18 accounts, we use WhatsApp groups for each client with Insydz alerts piped in. Clients see real-time updates on their own stores, they feel in control, and our team can act fast. Client retention went from average to exceptional.",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-green-400 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">"{testimonial.quote}"</p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">WhatsApp Alerts — FAQs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-green-400 transition-all">
                <button onClick={() => toggleFaq(i)} className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-green-600 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED FEATURES ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Related Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Competitor Price Tracking", icon: <TrendingDown />, color: "from-orange-500 to-red-500", route: "/features/competitor-price-tracking-feature" },
              { title: "AI Recommendations", icon: <Zap />, color: "from-pink-500 to-rose-500", route: "/features/ai-recommendations-feature" },
              { title: "Price Optimization", icon: <DollarSign />, color: "from-green-500 to-emerald-500", route: "/features/price-optimization-feature" },
              { title: "Review Analytics", icon: <MessageCircle />, color: "from-purple-500 to-pink-500", route: "/features/review-analytics-feature" },
              { title: "Keyword Tracking", icon: <Search />, color: "from-blue-500 to-cyan-500", route: "/features/keyword-rank-tracking-feature" },
              { title: "Product Research", icon: <Target />, color: "from-indigo-500 to-purple-500", route: "/features/product-research-feature" },
            ].map((feature, i) => (
                 <Link key={i} href={feature.route} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group block">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{feature.title}</h3>
                <ArrowRight className="w-5 h-5 text-green-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — ICP SPLIT ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            Stop Missing Critical Alerts.
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Get Them on WhatsApp.</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">India's only Amazon seller WhatsApp notification tool — start free in 60 seconds.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* New Seller */}
            <div className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-left">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For New Sellers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start monitoring your first products for free — get price alerts, stockout warnings, and Buy Box signals from day one.</p>
              <a href="/login" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full py-2 block text-center">
                🚀 Start Free →
              </a>
            </div>

            {/* Growing Seller */}
            <div className="bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-600 rounded-2xl p-8 text-left shadow-xl">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For Growing Sellers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Unlock unlimited alerts, multiple WhatsApp numbers, and instant delivery on the Growth Plan.</p>
              <a href="/pricing" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full shadow-lg py-2 block text-center">
                📈 Try Growth Plan →
              </a>
            </div>

            {/* Agency */}
            <div className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-left">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For Agencies</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Set up WhatsApp alert groups for all your clients — they stay informed, you stay in control.</p>
              <a href="/about/contact-us" className="w-full bg-white dark:bg-gray-700 border-2 border-green-600 text-green-700 dark:text-green-400 font-bold rounded-full hover:bg-green-50 py-2 block text-center">
                🏢 Book Demo →
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {["No credit card required", "Live alerts in 60 seconds", "Cancel anytime"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-green-300 dark:border-green-700 p-4 shadow-2xl z-40">
        <a href="/login" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-full shadow-xl flex items-center justify-center">
          👉 Enable WhatsApp Alerts Free
        </a>
  
      </div>

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
                © 2025 <span className="text-purple-400 font-semibold">Insydz</span>. All rights reserved. Designed & Developed in India 🇮🇳
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
