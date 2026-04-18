import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, RefreshCw, Eye,
  Sparkles, ChevronDown, LineChart, Award,
  Lightbulb, Package, DollarSign, Users,
  Brain, ShoppingCart, Filter, Layers,
  ThumbsUp, MessageCircle, Star, Activity,
  Clock, Crosshair, List, Maximize2, Gauge,
  Menu, Sun, Moon, ShoppingBag, Store,
  Briefcase, Code, Globe, Trophy, ArrowLeft,
  BookOpen, Video, FileText, Flame, CalendarDays,
  Gift, Rocket, Lock, BarChart2, Presentation,
  MapPin, IndianRupee, LayoutGrid, Facebook, Instagram, Twitter, Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

const schemaFestiveTrend = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://insydz.com/assets/logo.png"
      },
      "sameAs": [
        "https://www.linkedin.com/company/insydz/",
        "https://www.instagram.com/growwithinsydz/",
        "https://x.com/growwithinsydz/"
      ],
      "description": "Insydz is an AI-powered ecommerce intelligence platform that helps Amazon and Flipkart sellers with product research, keyword tracking, pricing insights, and review analytics."
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/features/festive-trends",
      "url": "https://insydz.com/features/festive-trends",
      "name": "Festive Trend Insights for Ecommerce Sellers | Insydz",
      "description": "Analyze festive season trends, product demand, pricing insights, and customer behavior with Insydz AI-powered ecommerce intelligence tools.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/features/festive-trends#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/features/festive-trends#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://insydz.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://insydz.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Festive Trend Insights",
          "item": "https://insydz.com/features/festive-trends"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://insydz.com/features/festive-trends#service",
      "name": "Festive Trend Analysis Tool",
      "provider": {
        "@id": "https://insydz.com/#organization"
      },
      "serviceType": "Ecommerce Trend Intelligence",
      "areaServed": {
        "@type": "Country",
        "name": "India"
      },
      "description": "Analyze festive season ecommerce trends including product demand, keyword trends, competitor pricing, and customer behavior insights to maximize sales during peak seasons.",
      "offers": {
        "@type": "Offer",
        "url": "https://insydz.com/features/festive-trends",
        "price": "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/features/festive-trends#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are festive ecommerce trends?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Festive ecommerce trends refer to changes in product demand, pricing, customer behavior, and sales patterns during peak shopping seasons like Diwali and Dussehra."
          }
        },
        {
          "@type": "Question",
          "name": "How can festive trend insights help sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They help identify high-demand products, optimize pricing, track competitors, and improve marketing strategies during peak seasons."
          }
        },
        {
          "@type": "Question",
          "name": "What data does Insydz festive trend feature provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Insights on product demand trends, keyword popularity, competitor pricing changes, and customer behavior."
          }
        },
        {
          "@type": "Question",
          "name": "Is this feature useful for Amazon and Flipkart sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, it is designed for both Amazon and Flipkart sellers to make data-driven decisions during high-demand periods."
          }
        }
      ]
    }
  ]
};

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

const SCHEMAS = [schemaFestiveTrend];

export default function FestiveTrendFeaturePage() {
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
    const id = `insydz-ft-schema-${i}`;

    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);

    document.head.appendChild(script);
  });

  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-ft-schema-${i}`);
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
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);
  const toggleMobileMenu = (menuName: string) => setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      setLocation(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setLocation('/');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const faqs = [
    {
      question: "When will Festive Trend Intelligence be available?",
      answer: "Festive Trend Intelligence is currently in development and will launch before 2026. You can join the waitlist to be notified the moment it goes live waitlist members will get early access before the general release."
    },
    {
      question: "Which Indian festivals will be covered by this tool?",
      answer: "Insydz Festive Trend Intelligence will cover 15+ major Indian festivals including Diwali, Holi, Eid, Navratri, Dussehra, Pongal, Onam, Bihu, Big Billion Day, Republic Day Sale, Independence Day Sale, and more with category-specific demand predictions for each. Regional festivals with e-commerce impact will also be included."
    },
    {
      question: "How far in advance will festive demand predictions be available?",
      answer: "Demand forecasts will be available 4 to 8 weeks before each festive season giving you enough time to source and stock inventory, update your listings with festive keywords, set pricing windows, and rank before your competitors even start preparing."
    },
    {
      question: "Will it work for both Amazon India and Flipkart sellers?",
      answer: "Yes. Insydz Festive Trend Intelligence is built natively for both Amazon India and Flipkart giving you category-level demand signals, festive keyword alerts, and pricing window recommendations across both marketplaces in one dashboard."
    },
    {
      question: "What kind of predictions will it make?",
      answer: "The tool will predict category-level and product-level demand spikes, recommend optimal inventory levels before each festival, identify festive keywords starting to trend weeks before peak search volume, and signal the best pricing windows to maximize margins. All predictions are specific to the Indian marketplace not generic global trend data."
    },
    {
      question: "Is this the same as Amazon's trend tools or Helium 10?",
      answer: "No. Amazon's built-in tools show current trends — not advance forecasts. Helium 10 is built for the US market and doesn't account for Indian festive cycles Diwali, Big Billion Day, Onam, Pongal, or Eid. Insydz Festive Trend Intelligence is built specifically around the Indian festive calendar, with 4–8 week advance demand predictions for both Amazon India and Flipkart sellers."
    },
    {
      question: "Is this available on the free plan?",
      answer: "Festive Trend Intelligence will be available on paid Insydz plans. The exact plan tier details will be announced at launch. Join the waitlist to be notified about pricing and plan availability. Other Insydz features including competitor price tracking, review analytics, and keyword rank tracking — are available on the free plan today."
    },
    {
      question: "How is this different from just watching Google Trends?",
      answer: "Google Trends shows search volume it doesn't tell you what will happen 6 weeks from now on Amazon India or Flipkart, what inventory to stock, what keywords to optimize for, or what price to set. Insydz Festive Trend Intelligence combines years of Indian marketplace demand data with your specific product category and gives you actionable, specific recommendations — not just trend graphs."
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/features/festive-trend-feature" />
        <title>Festive Trend Intelligence — Sell Before the Season Peaks</title>
        <meta name="description" content="India's first festive deal forecasting tool for Amazon & Flipkart sellers — predicting demand spikes for Diwali, Holi, Eid, and every major Indian festive season, 4 to 8 weeks before the rush hits." />
      </Helmet>
      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div className="flex items-center space-x-3">
             <a href="/" className="flex items-center space-x-1 group">
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Insydz</span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>

              {(["Solutions", "Use Cases"] as const).map((menu) => (
                <div key={menu} className="relative">
                  <button onMouseEnter={() => setActiveDropdown(menu)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                    {menu} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === menu && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {navigationMenu[menu].map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-orange-600 dark:text-orange-400">{item.icon}</span>
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
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-3 py-2 text-sm text-orange-600 dark:text-orange-500 font-semibold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Features.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-orange-600 dark:text-orange-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

               <Link href="/pricing" className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">Pricing</Link>

              {/* Free Tools */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Free Tools')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Free Tools' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Free Tools"].map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-orange-600 dark:text-orange-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Compare */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Compare')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Compare.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-orange-600 dark:text-orange-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Resources.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-orange-600 dark:text-orange-400">{item.icon}</span>
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

              <a href="/login" className="ml-2 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">Login</a>
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
               <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(["Solutions", "Use Cases"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {navigationMenu[menu].map((item, i) => (
                        item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
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
                <button onClick={() => toggleMobileMenu('Features')} className="flex items-center justify-between w-full px-4 py-2 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-semibold">
                  Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Features' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Features.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
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

              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">Pricing</Link>

              <div>
                <button onClick={() => toggleMobileMenu('Free Tools')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                  Free Tools <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Free Tools' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu["Free Tools"].map((item, i) => (
                       item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
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
                <button onClick={() => toggleMobileMenu('Compare')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                  Compare <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Compare' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Compare.map((item, i) => (
                       item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
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
                <button onClick={() => toggleMobileMenu('Resources')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                  Resources <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Resources' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Resources.map((item, i) => (
                       item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
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

               <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-2 rounded-lg font-semibold block">Login</a>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Copy */}
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Feature Spotlight</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-400 dark:border-amber-600 rounded-full px-4 py-2 animate-pulse">
                  <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Coming Soon 2026</span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Festive Trend Intelligence
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">Sell Before the Season Peaks</span>
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                India's first festive deal forecasting tool for Amazon & Flipkart sellers predicting demand spikes for Diwali, Holi, Eid, and every major Indian festive season,{" "}
                <span className="text-orange-700 dark:text-orange-400 font-semibold">4 to 8 weeks before the rush hits.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl cursor-default opacity-90">
                Join Waitlist Coming 2026
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-orange-500 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-6 text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Diwali, Holi, Eid & 15+ festivals", "4–8 weeks advance predictions", "Amazon India & Flipkart"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual — Upcoming Dashboard Preview */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl">

                {/* Coming Soon overlay */}
                <div className="absolute inset-0 rounded-3xl bg-white/50 dark:bg-gray-900/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-6 py-4 shadow-xl text-center">
                    <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-white font-black text-lg">Coming Soon</p>
                    <p className="text-orange-100 text-sm">Feature launching soon — stay tuned</p>
                  </div>
                </div>

                {/* Blurred preview */}
                <div className="space-y-4 opacity-50">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Festive Trend Dashboard</h3>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Live Trends
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { festival: "🪔 Diwali 2025", weeks: "8 weeks away", spike: "+340%", category: "Lights & Decor", bg: "bg-orange-50 border-orange-300" },
                      { festival: "🎨 Holi 2026", weeks: "22 weeks away", spike: "+210%", category: "Colors & Clothing", bg: "bg-pink-50 border-pink-300" },
                      { festival: "🕌 Eid 2026", weeks: "30 weeks away", spike: "+180%", category: "Apparel & Gifts", bg: "bg-green-50 border-green-300" },
                    ].map((item, i) => (
                      <div key={i} className={`${item.bg} border rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.festival}</p>
                            <p className="text-xs text-gray-500">{item.weeks}</p>
                          </div>
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">{item.spike} demand</span>
                        </div>
                        <p className="text-xs text-gray-600">Top category: {item.category}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">15+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Festivals tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">8 wks</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Advance notice</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-4 py-2 shadow-xl z-20">
                  <p className="text-white font-bold text-sm flex items-center gap-1"><Rocket className="w-4 h-4" /> Launching 2026</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Indian Sellers Miss <br /><span className="text-red-600">Festive Season Profits</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              It's not lack of products. It's lack of preparation. Most Indian sellers find out about festive demand when it's already too late to act.
            </p>
          </div>

          <p className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-8">The 4 reasons sellers miss peak festive revenue:</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Clock className="w-8 h-8" />, title: "Stockouts during peak festive demand", detail: "Product gone exactly when buyers are searching", color: "from-red-500 to-orange-500" },
              { icon: <BarChart3 className="w-8 h-8" />, title: "No advance warning of demand spikes", detail: "You see the trend when it's already peaked", color: "from-orange-500 to-yellow-500" },
              { icon: <Brain className="w-8 h-8" />, title: "Wrong products stocked for the season", detail: "Lakhs in slow-moving inventory after every festival", color: "from-yellow-500 to-orange-500" },
              { icon: <Target className="w-8 h-8" />, title: "Competitors rank first on festive keywords", detail: "Because they started 6 weeks before you did", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold mb-1">{pain.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pain.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg mb-12">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Indian e-commerce sellers lose <span className="text-red-600">lakhs in festive revenue</span></p>
            <p className="text-gray-700 dark:text-gray-300 text-lg italic">Simply because they didn't prepare in time not because they lacked the products. The seller who stocks up on Diwali lights in September wins. The one who orders in October scrambles.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"><X className="w-6 h-6 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Without Festive Trend Intelligence</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Reactive always a step behind</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Scramble to restock when demand spikes stock already sold out",
                  "Miss the keyword trend window competitors already ranking",
                  "Lose sales to better-prepared sellers every single festival",
                  "Price too low during peak, leaving margin on the table",
                  "Guess which products to stock based on last year's memory",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">With Festive Trend Intelligence</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Proactive stocked, ranked, priced early</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Know demand spikes 4–8 weeks early stock before the rush",
                  "Rank for festive keywords before the season even starts",
                  "Never miss a peak sales window again",
                  "Set pricing windows at peak margins with AI guidance",
                  "AI-predicted product quantities per category, per festival",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: WHAT TOOLS DON'T TELL INDIAN SELLERS ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Most Ecommerce Trend Tools Don't Tell Indian Sellers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              There are tools that show you what's trending right now. That's not the problem. The problem is that by the time you see it trending, it's already too late to do anything about it.
            </p>
          </div>

          {/* Real scenario callout */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">Real scenario — Bengaluru apparel seller, Navratri 2023</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  She saw 'chaniya choli' trending on October 5th. By then, the top listings had been ranking for 6 weeks. Her product was buried on page 4. She ordered stock on October 8th it arrived October 22nd. Navratri ended October 24th. She sold 11 units out of 200 in stock. Dead inventory worth <span className="font-bold text-red-600">₹1.1L</span>.
                </p>
                <p className="text-orange-700 dark:text-orange-400 font-semibold mt-2">
                  With 8-week advance demand forecasting, she would have started optimizing her listing in mid-August and stocked in early September.
                </p>
              </div>
            </div>
          </div>

          {/* What global tools miss */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Here's what global competitor tools like Helium 10 miss for Indian sellers:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <X className="w-5 h-5" />, text: "No Diwali, Eid, Pongal, Onam, or Navratri demand forecasting built for US holidays, not Indian festivals" },
                { icon: <X className="w-5 h-5" />, text: "No Flipkart coverage India's #2 marketplace is completely invisible to them" },
                { icon: <X className="w-5 h-5" />, text: "No regional festival data Pongal in Tamil Nadu, Onam in Kerala, Bihu in Assam ignored entirely" },
                { icon: <X className="w-5 h-5" />, text: "No advance warning they show current trends, not what will spike 6 weeks from now" },
                { icon: <X className="w-5 h-5" />, text: "No INR-based pricing guidance for Indian festive windows" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real ₹ numbers table */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What Advance Festive Intelligence Is Worth Real ₹ Numbers</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Situation (Without Insydz)</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-red-600 dark:text-red-400">Monthly / Seasonal Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { situation: "Seller stockouts during Diwali peak couldn't restock in time", impact: "₹40,000–₹2,00,000 in missed peak-season sales" },
                    { situation: "Wrong products ordered for festive season slow-moving stock", impact: "₹30,000–₹1,50,000 in stranded inventory" },
                    { situation: "Missed festive keyword ranking window buried on page 3 during peak", impact: "~40–60% reduction in festive organic impressions" },
                    { situation: "Priced too low during peak demand sold out fast but left margin behind", impact: "₹15,000–₹80,000 in lost margin per season" },
                    { situation: "Missed regional festival opportunity Pongal, Onam, Bihu untapped", impact: "₹20,000–₹60,000 in untapped regional festive revenue" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.situation}</td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{row.impact}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">How Insydz Is Different: How Festive Trend Intelligence Will Work</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Insydz tracks festive demand patterns across years of Indian marketplace data
              <span className="text-orange-700 dark:text-orange-400 font-semibold"> and tells you exactly when and how to prepare, well before the season hits.</span>
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-4 gap-8 relative">
              {[
                {
                  step: "1",
                  title: "AI Tracks Festive Demand Patterns",
                  detail: "Across years of Indian marketplace data on Amazon India & Flipkart, Insydz's AI builds category-level demand models for every major Indian festival identifying when demand historically starts rising, peaks, and falls for your product type.",
                  icon: <BarChart2 className="w-12 h-12 " />
                },
                {
                  step: "2",
                  title: "Identifies Your Category Opportunities",
                  detail: "Diwali lights, Holi colors, Eid apparel, Pongal gifting Insydz maps demand signals to your specific category. Not generic top-line trends. Your product type, your festival, your window.",
                  icon: <CalendarDays className="w-12 h-12" />
                },
                {
                  step: "3",
                  title: "Sends Advance Alerts 4–8 Weeks Ahead",
                  detail: "Before demand spikes, Insydz sends you actionable alerts on WhatsApp and in-dashboard telling you exactly what to stock, what keywords to optimize, and what pricing window is approaching. In time to act, not in time to regret.",
                  icon: <Bell className="w-12 h-12" />
                },
                {
                  step: "4",
                  title: "You Prepare & Profit",
                  detail: "Stock, price, and rank before competitors even notice the trend. This is the compounding advantage Indian sellers who use Insydz will build every Diwali, every Big Billion Day, every festive season year after year.",
                  icon: <Gift className="w-12 h-12" />
                },
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6 text-center relative z-10 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-black text-white">{item.step}</div>
                  <div className="bg-orange-100 dark:bg-orange-900/20 rounded-xl p-4 mb-4 text-orange-600 dark:text-orange-400 flex items-center justify-center">{item.icon}</div>
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl cursor-default opacity-90">
            Coming Soon Join the Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU CAN DO ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">What You'll Be Able to Do with Festive Trend Intelligence</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Stop reacting. Start planning. Here's what every Indian seller on Amazon India and Flipkart will be able to do the moment this launches.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {[
              {
                icon: <CalendarDays />,
                title: "Predict Festive Demand 4–8 Weeks Early",
                detail: "Never get caught off guard again. Know which categories will spike before Diwali, Big Billion Day, or Eid while there's still time to act, source, and stock.",
                outcome: "Stock the right products before demand spikes. Never miss a peak window again.",
                color: "text-orange-600"
              },
              {
                icon: <Package />,
                title: "Know Exactly How Much to Stock",
                detail: "AI-driven inventory forecasts per category and per festival so you order the right quantity. Not too little to miss peak demand. Not too much to get stuck with dead stock.",
                outcome: "Optimal stock levels. No stockouts during Diwali. No post-festive inventory write-offs.",
                color: "text-amber-600"
              },
              {
                icon: <Search />,
                title: "Rank for Festive Keywords Before Rivals",
                detail: "Start listing optimization 6 weeks ahead so your product is already ranking when buyer intent peaks. Not scrambling to rank when the festival is 3 days away.",
                outcome: "Higher organic festive visibility. More sales without more ad spend.",
                color: "text-green-600"
              },
              {
                icon: <DollarSign />,
                title: "Set Festive Pricing Windows Strategically",
                detail: "Know exactly when to raise prices, when to hold, and when to run festive deals backed by data, not gut feel. Priced too low during Diwali peak? That's margin left on the table.",
                outcome: "Higher festive-season margins. No more underpricing during peak demand.",
                color: "text-blue-600"
              },
              {
                icon: <Flame />,
                title: "Discover Breakout Festive Products",
                detail: "Spot what's trending before it trends. The seller who adds 'eco-friendly Diwali diyas' to their catalogue in August beats the one who discovers the trend in October.",
                outcome: "First-mover advantage on emerging festive categories.",
                color: "text-red-600"
              },
              {
                icon: <Maximize2 />,
                title: "Scale Festive Revenue Year Over Year",
                detail: "Build a repeatable festive playbook so every Diwali, every Big Billion Day, you sell smarter than the year before. By year three, you have an institutional advantage.",
                outcome: "Compounding festive revenue growth. A selling system, not a guessing game.",
                color: "text-purple-600"
              },
            ].map((outcome, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-orange-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center ${outcome.color}`}>{outcome.icon}</div>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-2">{outcome.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{outcome.detail}</p>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                  <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold">✅ {outcome.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE DEPTH ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Festive Trend Intelligence Will Cover</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">A complete festive deal forecasting tool purpose-built for the Indian marketplace calendar, not adapted from a global tool that doesn't know Pongal from Christmas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {[
              {
                feature: "Festival Calendar",
                benefit: "Diwali, Holi, Eid, Navratri, Pongal, Onam, Dussehra, Bihu, Republic Day Sale & 10+ more all mapped to your category",
                icon: <CalendarDays className="w-8 h-8" />,
                color: "from-orange-500 to-amber-500"
              },
              {
                feature: "Demand Spike Forecasting",
                benefit: "Category-level demand predictions delivered weeks in advance specific to your product type, not just generic market trends",
                icon: <TrendingUp className="w-8 h-8" />,
                color: "from-green-500 to-emerald-500"
              },
              {
                feature: "Inventory Recommendations",
                benefit: "Optimal stock levels before each festival never run out at peak, never over-order for slow festivals",
                icon: <Package className="w-8 h-8" />,
                color: "from-blue-500 to-cyan-500"
              },
              {
                feature: "Festive Keyword Alerts",
                benefit: "Rising search terms specific to each festive season know which keywords to add weeks before buyers start searching",
                icon: <Search className="w-8 h-8" />,
                color: "from-purple-500 to-pink-500"
              },
              {
                feature: "Pricing Window Signals",
                benefit: "Best times to raise or lower prices during peak festive periods maximise margins at demand spikes, stay competitive in slow windows",
                icon: <DollarSign className="w-8 h-8" />,
                color: "from-yellow-500 to-orange-500"
              },
              {
                feature: "Regional Festival Coverage",
                benefit: "State-specific festive trends Pongal in Tamil Nadu, Onam in Kerala, Bihu in Assam hyperlocal demand intelligence",
                icon: <Globe className="w-8 h-8" />,
                color: "from-red-500 to-orange-500"
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-xl transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-4`}>{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />{item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Blind Guessing vs Festive Trend Intelligence</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">This is what separates sellers who win every festive season from sellers who catch up too late.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 mt-10">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Aspect</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Without It</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">With Festive Trend Intelligence</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: "Preparation Time", manual: "React when demand spikes already too late", insydz: "Prepare 4–8 weeks in advance" },
                  { aspect: "Inventory Planning", manual: "Guess based on last year's memory", insydz: "AI-predicted quantities per product, per festival" },
                  { aspect: "Keyword Strategy", manual: "Optimize during the festival — page rank already set", insydz: "Rank before the season starts" },
                  { aspect: "Pricing", manual: "React to competitor price changes during peak", insydz: "Set optimal price windows proactively" },
                  { aspect: "Category Discovery", manual: "Stick to known categories every season", insydz: "AI spots emerging festive trends early" },
                  { aspect: "Regional Intelligence", manual: "No state-specific festive data", insydz: "Pongal, Onam, Bihu region-level demand signals" },
                  { aspect: "Platform Coverage", manual: "Amazon only, no Flipkart festive data", insydz: "Amazon India & Flipkart both in one dashboard" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.aspect}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-left justify-left gap-2">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{row.manual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-left justify-left gap-2">
                        <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-10 py-6 text-lg rounded-full shadow-xl cursor-default opacity-90">
             Coming Soon Join Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* ── COMING SOON SECTION ── */}
      <section id="coming-soon" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-12 shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">This Feature Is Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto mb-8">
              Festive Trend Intelligence is currently in development and will be launching before 2026. Join the waitlist be the first seller in India to get access the moment it goes live.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {["Diwali, Holi, Eid & 15+ festivals", "4–8 weeks advance demand alerts", "Amazon India & Flipkart support"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-800 dark:text-white font-medium text-left">{item}</span>
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-full shadow-xl text-lg">
              <Clock className="w-5 h-5" /> Coming Soon 2026
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Is Festive Trend Intelligence Right for You?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Perfect For</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Amazon India & Flipkart sellers in seasonal categories",
                  "Private label brands selling gifts, décor, apparel, and food",
                  "Sellers who've lost out during Diwali or Holi before",
                  "Agencies managing festive campaigns for multiple clients",
                  "D2C brands building a festive revenue calendar",
                  "Anyone wanting to plan inventory 4–8 weeks ahead",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Less Useful For</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Sellers in non-seasonal, evergreen-only categories",
                  "Businesses that don't sell on Amazon India or Flipkart",
                  "Sellers who prefer reacting to trends over planning ahead",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Festive Trend Intelligence Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-orange-400 transition-all">
                <button onClick={() => toggleFaq(i)} className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
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
              { title: "AI Recommendations", icon: <Zap />, color: "from-pink-500 to-rose-500", route: "/features/ai-recommendations-feature" },
              { title: "Price Optimization", icon: <DollarSign />, color: "from-green-500 to-emerald-500", route: "/features/price-optimization-feature" },
              { title: "Keyword & Rank Tracking", icon: <Search />, color: "from-blue-500 to-cyan-500", route: "/features/keyword-rank-tracking-feature" },
              { title: "Product Research", icon: <Package />, color: "from-orange-500 to-red-500", route: "/features/product-research-feature" },
              { title: "Competitor Price Tracking", icon: <TrendingDown />, color: "from-red-500 to-orange-500", route: "/features/competitor-price-tracking-feature" },
              { title: "WhatsApp Alerts", icon: <Bell />, color: "from-emerald-500 to-green-500", route: "/features/whatsapp-alerts-feature" },
            ].map((feature, i) => (
               <Link key={i} href={feature.route} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group block">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{feature.title}</h3>
                <ArrowRight className="w-5 h-5 text-orange-500 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — BY ICP MATURITY ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            The Next Festive Season Is
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Closer Than You Think.</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">This feature is coming soon be ready to sell smarter this festive season. Join the waitlist today.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* New Sellers */}
            <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 
rounded-2xl p-8 text-left flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For New Sellers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Just starting out? Begin with free features today price tracking, reviews, keywords. Upgrade when Festive Intelligence launches.</p>
               <a href="/login" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full py-2 block text-center mt-auto">
                Start Free →
              </a>
            </div>

            {/* Growing Sellers */}
            <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 
rounded-2xl p-8 text-left flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For Growing Sellers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Missed last Diwali? Join the waitlist now. Be first to access Festive Intelligence and prep for next Diwali with 8-week advance data.</p>
              <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 rounded-full shadow-lg cursor-default mt-auto">
                Join Waitlist Coming 2026
              </div>
            </div>

            {/* Agencies */}
            <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 
rounded-2xl p-8 text-left flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For Agencies & Brand Managers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Managing multiple accounts? See how Festive Intelligence integrates across all your clients in one dashboard. Book a walkthrough with the Insydz team.</p>
               <a
  href="/about/contact-us"
  className="w-full bg-white dark:bg-gray-700 border-2 border-orange-500 text-orange-700 dark:text-orange-400 font-bold rounded-full hover:bg-orange-50 py-2 block text-center mt-auto"
>
  Book a Demo →
</a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {["No credit card required", "Setup in 2 minutes", "Cancel anytime"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-4 shadow-2xl z-40">
        <div className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-full shadow-xl flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" /> Coming Soon 2026
        </div>
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
 





















