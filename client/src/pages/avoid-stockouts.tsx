import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, Package, AlertCircle, TrendingUp, ChevronRight, Bell, Clock,
  ChevronDown, Menu, Sun, Moon, ArrowLeft, BookOpen, Video, FileText,
  ShoppingBag, Store, Briefcase, Users, Code, Globe, Trophy,
  TrendingDown, MessageCircle, Search, Target, Zap, X,
  Flame, Presentation, CheckCircle2, Check, BarChart3, Smartphone,
  Shield, RefreshCw, Eye, LayoutGrid, Facebook, Instagram, Twitter, Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz AI Inventory Management Tool",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most powerful AI inventory management tool for Amazon and Flipkart sellers. Predict stockouts before they happen, receive WhatsApp alerts days in advance, and never lose rankings or sales to running out of stock.",
    "url": "https://insydz.com/use-cases/avoid-stockouts"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Avoid Stockouts & Missed Sales", "item": "https://insydz.com/use-cases/avoid-stockouts" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Prevent Stockouts on Amazon India and Flipkart",
    "description": "Set up AI-powered stockout prediction with WhatsApp alerts in under 5 minutes using Insydz.",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Connect Inventory", "text": "Link Amazon India, Flipkart inventory automatically. Insydz reads current stock levels and begins tracking real-time sales velocity across all products. Setup: under 5 minutes." },
      { "@type": "HowToStep", "position": 2, "name": "AI Predicts Stockouts", "text": "Calculates exactly when you'll run out based on actual sales velocity, velocity acceleration trends, competitor stock signals, and Indian festive demand multipliers." },
      { "@type": "HowToStep", "position": 3, "name": "Get Early Alerts", "text": "WhatsApp alerts days before you run out — first alert at 14 days remaining, critical at 7 days, urgent at 3 days. Each includes stock level, days remaining, velocity, and AI-suggested reorder quantity." }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Insydz predict when I will run out of stock?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz combines current inventory level with real sales velocity (last 7, 14, and 30 days), accounts for velocity acceleration, and applies festive demand multipliers for Indian sale events. First WhatsApp alert fires when projected stockout is 14 days away — early enough to reorder before running out." }
      },
      {
        "@type": "Question",
        "name": "What happens to my Amazon India ranking when I go out of stock?",
        "acceptedAnswer": { "@type": "Answer", "text": "Your listing becomes inactive — disappearing from search entirely. When you restock, Amazon treats it as a new listing. Rankings built over weeks can drop 5–15 positions immediately. Recovery takes 4–8 weeks and requires extra ad spend. Preventing stockouts is far more valuable than recovering from them." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz monitor competitor stock levels on Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz monitors competitor stock status signals on both platforms — detecting when top rivals are running low or going out of stock. When a competitor stocks out, demand shifts to remaining sellers including you. Insydz alerts you to act before they restock." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Amazon's built-in inventory management?",
        "acceptedAnswer": { "@type": "Answer", "text": "Amazon's tools show current stock levels and basic reorder alerts. Insydz predicts stockout dates using actual velocity trends (not static averages), monitors competitor stock signals, applies Indian festive demand multipliers, and delivers WhatsApp alerts. Works across Amazon India, Flipkart from a single dashboard." }
      },
      {
        "@type": "Question",
        "name": "How far in advance does Insydz alert me before a stockout?",
        "acceptedAnswer": { "@type": "Answer", "text": "First alert at 14 days remaining. Second critical alert at 7 days. Final urgent alert at 3 days. All customisable based on your supplier lead times — if your supplier needs 18 days, your first alert fires at 21 days." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz work for  and D2C sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports inventory tracking and stockout prediction across Amazon India, Flipkart from a single dashboard. D2C brands get a unified view of stock levels and projected stockout dates by product — prioritise restocking for the channel with the highest velocity and most to lose." }
      }
    ]
  }
];

// ─── Navigation Menu Data ─────────────────────────────────────────────────────
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
    { name: "Free Amazon Product Analyzer", icon: <Target className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
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

// ─── Page Data ────────────────────────────────────────────────────────────────
const comparisonRows = [
  { feature: "Stockout prediction", manual: "Static reorder point", insydz: "Real-time velocity + acceleration + festive multipliers" },
  { feature: "Festive demand planning", manual: "Based on last year's sales", insydz: "India festive multipliers applied automatically" },
  { feature: "Competitor stock monitoring", manual: "None", insydz: "Monitors competitor stockout signals in real time" },
  { feature: "Alert delivery", manual: "You remember to check", insydz: "WhatsApp at 14 days, 7 days, 3 days" },
  { feature: "Supplier lead time", manual: "Mental calculation", insydz: "Reorder date auto-calculated per product" },
  { feature: "Multi-platform", manual: "One platform manually", insydz: "Amazon India + Flipkart unified" },
];

const roiWithout = [
  { label: "5 days out of stock during Big Billion Days (₹50K/day)", value: "−₹2,50,000" },
  { label: "Keyword rank drops page 1 #5 → page 4 in 7 days", value: "Rankings destroyed" },
  { label: "4–8 weeks to recover rank (weekly organic loss)", value: "−₹60,000/week" },
  { label: "Extra ad spend to rebuild ranking momentum (6 weeks)", value: "−₹45,000" },
  { label: "Permanent customer loss to competitors", value: "Long-term damage" },
];

const roiWith = [
  { label: "Competitor stockout signal detected 14 days before event", value: "14 days secured" },
  { label: "250 additional units sourced before demand spike", value: "Stock secured" },
  { label: "Full 10-day event covered zero stockout days", value: "0 days lost" },
  { label: "Incremental revenue from additional units", value: "+₹5,20,000" },
  { label: "Keyword ranking maintained — no recovery spend needed", value: "+₹45,000 saved" },
];

const faqs = [
  {
    id: "faq-1",
    q: "How does Insydz predict when I will run out of stock?",
    a: "Insydz combines current inventory level with real sales velocity (last 7, 14, and 30 days), accounts for velocity acceleration, and applies festive demand multipliers for Indian sale events. Your first WhatsApp alert fires when your projected stockout is 14 days away early enough to reorder from most Indian suppliers before running out.",
  },
  {
    id: "faq-2",
    q: "What happens to my Amazon India ranking when I go out of stock?",
    a: "Your listing becomes inactive disappearing from search entirely. When you restock, Amazon treats it as a new listing. Rankings built over weeks can drop 5–15 positions immediately. Recovery takes 4–8 weeks and requires extra ad spend. Preventing stockouts is far more valuable than recovering from them.",
  },
  {
    id: "faq-3",
    q: "Can Insydz monitor competitor stock levels on Amazon India and Flipkart?",
    a: "Yes. Insydz monitors competitor stock status signals on both platforms detecting when top rivals are running low or going out of stock. When a competitor stocks out, demand shifts to remaining sellers including you. Insydz alerts you to act and capture that demand before they restock.",
  },
  {
    id: "faq-4",
    q: "How is Insydz different from Amazon's built-in inventory management?",
    a: "Amazon's tools show current stock levels and basic reorder alerts. Insydz predicts stockout dates using actual velocity trends (not static averages), monitors competitor stock signals, applies Indian festive demand multipliers, and delivers WhatsApp alerts. Works across Amazon India, Flipkart from a single dashboard.",
  },
  {
    id: "faq-5",
    q: "How far in advance does Insydz alert me before a stockout?",
    a: "First alert at 14 days remaining. Second critical alert at 7 days. Final urgent alert at 3 days. All customisable based on your supplier lead times if your supplier needs 18 days, your first alert fires at 21 days.",
  },
  {
    id: "faq-6",
    q: "Does Insydz work for and D2C sellers?",
    a: "Yes. Insydz supports inventory tracking and stockout prediction across Amazon India, Flipkart from a single dashboard. D2C brands get a unified view of stock levels and projected stockout dates by product so you can prioritise restocking for the channel with the highest velocity and most to lose.",
  },
];

const inventoryCapabilities = [
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: "Real-Time Sales Velocity Tracking",
    desc: "Tracks how fast products are actually selling updated continuously. When velocity accelerates, predicted stockout date adjusts automatically.",
    linkLabel: "inventory management tool",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Bell className="w-7 h-7" />,
    title: "Multi-Tier Stockout Alert Tool",
    desc: "Three-tier WhatsApp alert system: 14-day early warning, 7-day low stock alert, 3-day critical alert. Each includes stock level, days remaining, velocity, and AI-suggested reorder quantity.",
    linkLabel: "stockout alert tool",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: <Eye className="w-7 h-7" />,
    title: "Competitor Stock Monitoring",
    desc: "Monitors when top competitors are running low or going out of stock a leading indicator that demand for your product is about to spike. Get ahead before you run out yourself.",
    linkLabel: "competitor stock monitoring",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Flame className="w-7 h-7" />,
    title: "Festive Demand Intelligence",
    desc: "India-specific festive demand multipliers for Diwali, Big Billion Days, Great Indian Festival, Navratri, and Republic Day Sales applied automatically 4–6 weeks before each event.",
    linkLabel: "festive demand intelligence",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Inventory Management Analysis Dashboard",
    desc: "Full portfolio view sorted by urgency. Critical, healthy, and attention-needed products across Amazon India, Flipkart from one unified dashboard.",
    linkLabel: "inventory tracker software dashboard",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: "Supplier Lead Time Planning",
    desc: "Set your supplier lead time per product. Insydz back-calculates your reorder date automatically so alerts fire when you need to act, not when it's already too late.",
    linkLabel: "stock management tool",
    color: "from-indigo-500 to-blue-500",
  },
];

export default function AvoidStockoutsPage() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inject JSON-LD schemas
  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-stockout-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-stockout-schema-${i}`);
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

  const handleGetStarted = () => setLocation("/login");
  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const scrollToSection = (sectionId: string) => {
    setLocation('/');
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/use-cases/avoid-stockouts" />
        <title>AI Inventory Management Tool: Never Stockout Again | Insydz</title>
        <meta name="description" content="Predict and prevent stockouts with Insydz's AI inventory tool. Get low-stock alerts, demand forecasts, and smart reorder suggestions. Never miss a sale." />
      </Helmet>
      {/* ── NAVIGATION ────────────────────────────────────────────────────────── */}
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
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
             
              {/* Solutions */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Solutions")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Solutions" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Solutions" && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {navigationMenu.Solutions.map((item, i) => (
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

              {/* Use Cases — highlighted red */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Use Cases")} className="px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-1">
                  Use Cases <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Use Cases" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Use Cases" && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Use Cases"].map((item, i) => (
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

              {/* Features */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Features")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Features" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Features" && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Features.map((item, i) => (
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

              <Link href="/pricing" className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</Link>

              {/* Free Tools */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Free Tools")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Free Tools" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Free Tools" && (
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
                <button onMouseEnter={() => setActiveDropdown("Compare")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Compare" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Compare" && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Compare.map((item, i) => (
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

              {/* Resources */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Resources")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Resources" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Resources" && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Resources.map((item, i) => (
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

              {/* About */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("About")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  About <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "About" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "About" && (
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

              <Link href="/login" className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Link>
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
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as (keyof NavigationMenu)[]).map((key) => (
                <div key={key}>
                  <button onClick={() => toggleMobileMenu(key)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium ${
                      key === "Use Cases" ? "text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {key} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === key ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === key && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg ${
                              key === "Use Cases" ? "hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            }`}
                          >
                            {item.icon} {item.name}
                            {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                            {item.icon} {item.name}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">Pricing</Link>
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-lg font-semibold block">Login</a>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-red-100 border border-red-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-sm font-medium text-red-700">India's #1 AI Inventory Management Tool 🇮🇳</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Never Run Out of Stock
                <br />
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">& Miss Sales Again</span>
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>AI inventory management tool</strong> for Amazon, Flipkart sellers. Insydz predicts exactly when you'll run out of stock and alerts you before it's too late
                <span className="text-red-700 dark:text-red-400 font-semibold"> so you never lose sales, rankings, or momentum to a stockout.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} size="lg"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-red-500/50 transition-all group"
                >
                   Prevent Stockouts Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" variant="outline"
                  className="border-2 border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                {[
                  "Stockout prediction based on real sales velocity not guesswork",
                  "WhatsApp alerts 14 days before you run out",
                  "Amazon India, Flipkart no credit card required",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 dark:text-white">Inventory Intelligence Dashboard</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
                </div>
                <div className="space-y-3">
                  {/* Critical */}
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-xl p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">🔴 Critical Stock Alert</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Premium Earbuds — 12 units left</p>
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">Selling 4/day — will run out in <strong>3 days</strong></p>
                      </div>
                    </div>
                  </div>
                  {/* Warning */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">🟡 Low Stock Warning</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Smart Watch — 45 units remaining</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mt-1">Velocity increasing — restock in 7 days</p>
                      </div>
                    </div>
                  </div>
                  {/* Healthy */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">🟢 Stock Healthy</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">USB-C Cables — 280 units</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">42 days stock at current velocity — reorder due in 28 days</p>
                      </div>
                    </div>
                  </div>
                  {/* WhatsApp */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">WhatsApp Alert Sent</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">"Premium Earbuds — 3 days to stockout. Reorder now."</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">Live Prediction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: WHY STOCKOUTS KILL YOUR BUSINESS ──────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Stockouts
              <span className="text-red-600"> Kill Your Business</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Running out of stock feels like a small operational problem. It isn't. A stockout on Amazon India or Flipkart starts a chain reaction that costs far more than the units you couldn't sell.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <TrendingDown className="w-8 h-8" />,
                title: "Lost Sales & Revenue",
                desc: "Every day out of stock is zero revenue on that product. A ₹50,000/month product loses ₹8,000–₹10,000 in direct sales for a 5-day stockout before accounting for ranking damage.",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: <AlertCircle className="w-8 h-8" />,
                title: "Rankings Drop Instantly",
                desc: "Amazon's algorithm reads a stockout as a signal that your product is no longer viable. Keyword rankings built over weeks fall immediately. Recovery after restocking takes 4–8 weeks and requires extra ad spend.",
                color: "from-orange-500 to-yellow-500",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Customers Buy from Competitors",
                desc: "Buyers don't wait. They buy from whoever is available. Once a customer orders from a competitor and has a good experience, you've lost that buyer not just that order.",
                color: "from-yellow-500 to-red-500",
              },
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-red-400 hover:shadow-lg transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${p.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{p.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Ranking Timeline */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Keyword Ranking Timeline During a Stockout</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { stage: "Before Stockout", rank: "#5", status: "Page 1 strong velocity", color: "bg-green-100 border-green-300 text-green-800" },
                { stage: "Day of Stockout", rank: "#18", status: "Listing becomes inactive", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
                { stage: "Day 3 Out of Stock", rank: "#34", status: "Algorithm further demotes", color: "bg-orange-100 border-orange-300 text-orange-800" },
                { stage: "Day 7+", rank: "Page 4+", status: "Virtually invisible", color: "bg-red-100 border-red-300 text-red-800" },
                { stage: "After Restock", rank: "#22", status: "4–8 weeks to recover", color: "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" },
              ].map((t, i) => (
                <div key={i} className={`border-2 rounded-xl p-3 text-center ${t.color}`}>
                  <p className="text-xs font-semibold mb-1">{t.stage}</p>
                  <p className="text-xl font-black">{t.rank}</p>
                  <p className="text-xs mt-1 leading-tight">{t.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl p-6 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              The most expensive stockout isn't the 3-day gap.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              It's the <strong>6 weeks of rebuilding keyword rankings</strong> after you restock. For a seller at ₹3L/month revenue, one bad stockout during Big Billion Days can cost ₹60,000–₹90,000 in lost sales then another ₹30,000–₹45,000 in additional ad spend. All for a restocking failure that cost ₹8,000 to prevent.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHY MANUAL TRACKING FAILS ─────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Spreadsheets and Manual Counts
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Always Fail at the Worst Moment</span>
            </h2>
            <p className="text-1xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Every Indian seller starts with a spreadsheet or a mental note. Here's exactly why that approach breaks down always at the worst possible time, like the night before Diwali.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: <RefreshCw className="w-7 h-7" />,
                title: "Static Data in a Dynamic World",
                desc: "A spreadsheet shows stock levels as of the last update. It doesn't account for sales acceleration — when your product suddenly sells 3× faster due to a competitor stocking out, a festive promotion, or a ranking improvement. By the time you notice, you're already critical.",
              },
              {
                icon: <Flame className="w-7 h-7" />,
                title: "No Festive Season Intelligence",
                desc: "Manual planning uses last year's sales as baseline. But Indian festive demand doesn't follow a smooth curve — a product selling 50 units/day in October last year might sell 150/day this year. Static reorder points miss these spikes every single time.",
              },
              {
                icon: <Eye className="w-7 h-7" />,
                title: "Zero Competitor Stock Visibility",
                desc: "When a top competitor goes out of stock, demand for your product spikes. Manual tracking has no way to monitor competitor stock levels — so when the spike hits, you're already running lean.",
              },
              {
                icon: <Clock className="w-7 h-7" />,
                title: "Supplier Lead Time Blindness",
                desc: "Placing a reorder at 5 days of stock means nothing if your supplier needs 12 days. Manual tracking doesn't auto-factor your supplier lead times into reorder calculations.",
              },
            ].map((gap, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-red-300 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                    {gap.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{gap.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{gap.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-r-2xl p-6 shadow-md">
            <p className="font-bold text-red-700 dark:text-red-400 mb-2">What most stock management tools don't tell you:</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Most inventory tools show current stock levels with a simple reorder threshold. Insydz calculates days-of-stock remaining using real-time sales velocity accounting for acceleration, competitor stockout signals, and Indian festive demand multipliers. The gap between <em>"you have 45 units"</em> and <em>"you have 7 days of stock before running out during Diwali week"</em> is the difference between a reorder and a crisis.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              How Stock Monitoring Works
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From product connection to stockout prevention automated, accurate, and delivered where you'll actually act on it.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
                {
                  step: 1,
                  title: "Connect Inventory",
                  desc: "Link Amazon India, Flipkart inventory automatically. Insydz reads current stock levels and begins tracking real-time sales velocity across all products. Setup: under 5 minutes no manual data entry.",
                  visual: <Package className="w-12 h-12 text-red-600 mx-auto" />,
                  bg: "bg-red-100 dark:bg-red-900/20",
                },
                {
                  step: 2,
                  title: "AI Predicts Stockouts",
                  desc: "Calculates exactly when you'll run out based on actual sales velocity, velocity acceleration trends, competitor stock signals, and Indian festive demand multipliers. Not a static reorder point. A live, updating prediction.",
                  visual: <Zap className="w-12 h-12 text-orange-600 mx-auto animate-pulse" />,
                  bg: "bg-orange-100 dark:bg-orange-900/20",
                },
                {
                  step: 3,
                  title: "Get Early Alerts",
                  isAlerts: true,
                },
              ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">{step.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                  {step.isAlerts ? (
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                        <span className="text-red-600 font-bold text-sm">14 days</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300"> Early warning. Time to reorder.</span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
                        <span className="text-orange-600 font-bold text-sm">7 days</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300"> Low stock. Confirm order placed.</span>
                      </div>
                      <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 rounded-lg p-3">
                        <span className="text-red-700 font-bold text-sm">3 days</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300"> Critical. Escalate immediately.</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center pt-1">Each alert includes stock level, velocity & AI reorder qty</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-sm">{step.desc}</p>
                      <div className={`${step.bg} rounded-2xl p-4`}>{step.visual}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-red-500/50 transition-all group"
            >
              Never Miss Sales Again
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: 6 INVENTORY CAPABILITIES ──────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Stay Ahead of Stockouts</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryCapabilities.map((cap, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-red-400 hover:shadow-xl transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${cap.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-md`}>
                  {cap.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{cap.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: INDIA-FIRST + REAL SELLER SCENARIO ────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              How Insydz Is Different
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Built for Indian Festive Commerce</span>
            </h2>
          </div>

          {/* Festive Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { stat: "3–5×", label: "Diwali demand multiplier", desc: "Average for consumer electronics and home goods vs standard weekly velocity" },
              { stat: "6–10×", label: "Big Billion Days spike", desc: "Personal care, fashion, home decor routinely exhaust a month's supply in 48 hours" },
              { stat: "14+ days", label: "Advance planning needed", desc: "Insydz issues festive demand alerts 4–6 weeks before Indian sale events" },
            ].map((s, i) => (
              <div key={i} className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-6 text-center">
                <p className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">{s.stat}</p>
                <p className="font-bold text-gray-900 dark:text-white mb-2">{s.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Real Seller Scenario */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-8 mb-12 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <p className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Real Seller Scenario</p>
                <p className="font-bold text-gray-900 dark:text-white">Electronics Seller, Bengaluru</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Vikram sells Bluetooth speakers on Amazon India. Going into October, he had stocked 400 units for Big Billion Days based on last year's sales. He felt confident.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Two weeks before the event, Insydz flagged something he hadn't noticed: three of the top five competitors had already gone out of stock on their primary listings. Demand was being redistributed his listing was seeing 2.3× normal velocity, and his 400 units were projected to last only 5 days into the 10-day sale event.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              With 14 days to spare, Vikram placed an urgent order for 250 additional units. They arrived 3 days before Big Billion Days. He sold through all 650 units across the full 10-day window. Without Insydz, he would have stocked out on day 6 and missed the back half entirely.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Incremental Revenue", value: "₹5.2L" },
                { label: "Additional Units Sourced", value: "250 units" },
                { label: "Days Lead Time Available", value: "14 days" },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="grid grid-cols-3">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-700 dark:text-gray-300 text-sm">Capability</p></div>
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-500 text-sm text-left">Manual Tracking</p></div>
              <div className="bg-red-500 px-6 py-4 border-b-2 border-red-400"><p className="font-bold text-white text-sm text-left">✓ Insydz</p></div>
              {comparisonRows.map((row, i) => (
                <>
                  <div key={`f-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{row.feature}</p></div>
                  <div key={`m-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 text-center ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-sm text-gray-500 flex items-left justify-left gap-1"><X className="w-3 h-3 text-red-500 flex-shrink-0" />{row.manual}</p></div>
                  <div key={`s-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-red-50 dark:bg-red-900/10" : "bg-red-50/50 dark:bg-red-900/10"}`}><p className="text-sm text-red-700 dark:text-red-400 font-semibold flex items-left justify-left gap-1"><Check className="w-3 h-3 text-green-600 flex-shrink-0" />{row.insydz}</p></div>
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: ROI EXAMPLE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              What One Preventable Stockout
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Costs an Indian Seller</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A single stockout during a peak period preventable with a 14-day advance alert triggers a chain of costs most sellers never fully calculate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden shadow-lg">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4">
                <p className="font-bold text-red-700 dark:text-red-400 text-lg">Without Insydz Cost of One Festive Season Stockout</p>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {roiWithout.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 pr-2">{row.label}</p>
                    <p className="text-sm font-bold text-red-600 whitespace-nowrap">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-red-50 dark:bg-red-900/20">
                  <p className="font-bold text-gray-900 dark:text-white">Total Cost of One Preventable Stockout</p>
                  <p className="font-black text-red-700 text-lg ml-2 whitespace-nowrap">−₹6,55,000+</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 overflow-hidden shadow-lg">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4">
                <p className="font-bold text-green-700 dark:text-green-400 text-lg">With Insydz Same Festive Period, Stockout Prevented</p>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {roiWith.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 pr-2">{row.label}</p>
                    <p className="text-sm font-bold text-green-600 whitespace-nowrap">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold text-gray-900 dark:text-white">Total Value vs Unmanaged Stockout</p>
                  <p className="font-black text-green-700 text-lg ml-2 whitespace-nowrap">+₹11,75,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-400 rounded-2xl p-6 text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2">₹12.3L swing on one event</p>
            <p className="text-gray-600 dark:text-gray-400">Between a seller who had Insydz's 14-day advance warning and acted on it versus one who discovered the stockout in real time. Same category, same product, same Big Billion Days. The difference: an <strong>inventory management tool</strong> that looks forward, not just backward.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FREE PLAN ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
            Stop Losing Sales to Stockouts.
            <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Stay Ahead.</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">Free Plan — ₹0 / Forever No credit card required</p>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 mb-8 text-left shadow-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-6 text-center">Free Plan Includes:</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                "Inventory tracking (limited products) on Amazon India & Flipkart",
                "Sales velocity monitoring real-time",
                "Stockout prediction days remaining calculated live",
                "Basic WhatsApp restock alerts",
                "Inventory health dashboard",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-lg p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold text-red-600">Upgrade teaser:</span> Paid plans unlock full catalogue tracking, <Link href="/features/inventory-dashboard" className="underline font-semibold hover:text-red-700">competitor stock monitoring</Link>,               <Link href="/features/demand-forecasting" className="underline font-semibold hover:text-red-700">festive demand intelligence</Link>, multi-tier WhatsApp alerts (14/7/3 days), supplier lead time integration support.
              </p>
            </div>
          </div>

          <Button onClick={handleGetStarted} size="lg"
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
          >
            Prevent Stockouts Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* ── SECTION 9: ICP-BASED CTAs ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-600 via-orange-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">Stop Losing Sales.</h2>
          <p className="text-xl text-white/90 mb-12">Stay Ahead of Stockouts — Pick Your Path</p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: "New Sellers (Free Plan)",
                desc: "Even with 2–3 products, the free plan shows how fast your inventory is moving and when to reorder so you don't run out during your first festive season and lose the momentum you've built.",
                cta: "Start Free No Card Needed →",
                action: handleGetStarted,
              },
              {
                label: "Growing Sellers (Growth Plan)",
                desc: "At ₹5L+ monthly, one stockout during Big Billion Days or Diwali can cost more than a full month's profit. Growth Plan: full catalogue tracking, competitor stock alerts, festive demand intelligence, multi-tier WhatsApp alerts.",
                cta: "Try Growth Plan →",
                action: () => setLocation("/pricing"),
              },
              {
                label: "D2C Brands / Agencies (Demo)",
                desc: "Unified inventory intelligence across Amazon India, Flipkart cross-channel stockout prioritisation, white-label inventory reports, API access for supply chain integrations.",
                cta: "Book a Demo →",
                action: () => setLocation("/demo"),
              },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left">
                <p className="font-bold text-white mb-2">{card.label}</p>
                <p className="text-white/80 text-sm mb-4">{card.desc}</p>
                {card.cta === "Try Growth Plan →" ? (
                  <Link href="/pricing" className="text-orange-100 font-semibold text-sm hover:text-white transition-colors underline">{card.cta}</Link>
                ) : card.cta === "Book a Demo →" ? (
                  <Link href="/demo" className="text-orange-100 font-semibold text-sm hover:text-white transition-colors underline">{card.cta}</Link>
                ) : (
                  <a href="/login" className="text-orange-100 font-semibold text-sm hover:text-white transition-colors underline">{card.cta}</a>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleGetStarted} size="lg"
            className="bg-white hover:bg-gray-100 text-red-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
          >
            Prevent Stockouts Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-6 text-sm">✓ No credit card required  ✓ Setup in 5 minutes  ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ── SECTION 10: FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Inventory Management FAQs
          </h2>
          <p className="text-center text-gray-500 mb-12 text-lg">Everything about AI-powered stockout prevention for Indian sellers</p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-red-300 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4 text-lg">{faq.q}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-5 h-5 text-red-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5 bg-white dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED USE CASES ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Related Seller Use Cases</h2>
            <p className="text-gray-600 dark:text-gray-400">Explore more ways to grow your ecommerce business</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Track Competitor Prices", icon: <TrendingDown className="w-8 h-8" />, color: "from-orange-500 to-red-500", route: "/use-cases/track-competitor-prices" },
              { title: "Find Profitable Products", icon: <Target className="w-8 h-8" />, color: "from-blue-500 to-cyan-500", route: "/use-cases/find-profitable-products" },
              { title: "Analyse Customer Reviews", icon: <MessageCircle className="w-8 h-8" />, color: "from-purple-500 to-pink-500", route: "/use-cases/analyze-customer-reviews" },
              { title: "Improve Amazon & Flipkart SEO", icon: <Search className="w-8 h-8" />, color: "from-green-500 to-emerald-500", route: "/use-cases/improve-seo" },
            ].map((uc, i) => (
                <Link key={i} href={uc.route} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer group block">
                <div className={`w-14 h-14 bg-gradient-to-br ${uc.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{uc.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">{uc.title}</h3>
                <ArrowRight className="w-5 h-5 text-red-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ─────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-red-300 dark:border-red-700 p-4 shadow-2xl z-40">
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 rounded-full shadow-xl">
          Prevent Stockouts Free
        </Button>
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
                <li><Link to="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
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
 





















