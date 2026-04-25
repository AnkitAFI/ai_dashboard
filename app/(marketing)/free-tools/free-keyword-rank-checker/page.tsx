"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown, X,
  LogIn, Lock, Hash, BarChart2, ArrowUp, ArrowDown, Flame, Mail, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
} from 'lucide-react';
import { Button } from "@/components/ui/button";


export const dynamic = "force-static";




const schemaSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Insydz Free Amazon Keyword Rank Checker India",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/free-tools/free-keyword-rank-checker",
  "description": "Instantly check where your product ranks for any keyword on Amazon India — so you can optimize your listing, close visibility gaps, and outrank competitors on the search results page. Free forever.",
  "featureList": [
    "Current keyword rank position on Amazon India",
    "Page position — Page 1, Page 2, or Page 3+",
    "Rank movement week-over-week — improving, stable, or declining",
    "Search visibility score (0-100)",
    "Hindi + English keyword support"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "description": "Free forever — no credit card required"
  },
  "creator": {
    "@id": "https://insydz.com/#organization"
  }
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this Amazon keyword rank checker free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz's Amazon keyword rank checker is completely free — no credit card required. Create a free account in 60 seconds and start checking keyword rankings on Amazon India immediately. The free tool shows current rank position, page position, rank movement week-over-week, and search visibility score — in Hindi and English. Paid plans (₹1,999/month) unlock daily rank tracking across all keywords, WhatsApp alerts when a keyword drops a page, 90-day historical rank curves, multi-keyword dashboard (20-50 keywords per product), keyword opportunity scoring, and competitor keyword gap analysis."
      }
    },
    {
      "@type": "Question",
      "name": "Does it work for Amazon India only?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The free Amazon keyword rank checker is calibrated specifically for Amazon India (amazon.in) — it scans Amazon India's live organic search results, not Amazon.com data. This matters significantly: keyword rankings on Amazon India differ from Amazon.com because the search index, buyer behaviour, and A9 algorithm weights vary. A tool calibrated for Amazon.com gives you the wrong ranking data for your Amazon India listings. Insydz reads Amazon India's live search results directly — including Hindi and English keyword searches."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the rank data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The free Amazon keyword rank checker scans Amazon India's live organic search results at the time of your check — it reads where your product actually appears in the search results page. This is direct search result data, not estimated or modelled rank data. Position #14 means your product appears at result 14 on Amazon India for that keyword right now. Rank movement reflects change since the previous check."
      }
    },
    {
      "@type": "Question",
      "name": "Can I check keyword rankings for competitor products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The free keyword rank checker works on any Amazon India product ASIN — including competitor products. Enter a competitor's ASIN and check what keywords they rank for and at what position."
      }
    },
    {
      "@type": "Question",
      "name": "Is login required?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, a free Insydz account is required — just an email address, no credit card. Login saves your rank check history and unlocks additional features."
      }
    }
  ]
};

const schemaHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Check Amazon India Keyword Rankings for Free",
  "description": "Check where your Amazon India product ranks for any keyword in 3 steps.",
  "totalTime": "PT2M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Enter ASIN + Keyword",
      "text": "Provide the product ASIN and the keyword in English or Hindi."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Insydz Scans Search Results",
      "text": "We scan Amazon India's live organic search results to find exactly where your product appears."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Get Instant Rank Position",
      "text": "See current rank, page position, visibility score, and rank movement instantly."
    }
  ]
};


const schemaBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
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
      "name": "Free Tools",
      "item": "https://insydz.com/free-tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Free Amazon Keyword Rank Checker",
      "item": "https://insydz.com/free-tools/free-keyword-rank-checker"
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
    { name: "Our Vision", icon: <Globe className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Users className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Mail className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

const SCHEMAS = [
  schemaSoftware,
  schemaFAQ,
  schemaHowTo,
  schemaBreadcrumb
];

export default function FreeKeywordRankCheckerPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const [asinInput, setAsinInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-krc-schema-${i}`;

    // prevent duplicate injection
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);

    document.head.appendChild(script);
  });

  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-krc-schema-${i}`);
      if (el) el.remove();
    });
  };
}, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    isDarkMode ? html.classList.add('dark') : html.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetStarted = () => router.push('/signup');
  const toggleMobileMenu = (menuName: string) =>
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleCheck = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is this keyword rank checker free?',
      answer: "Yes. Insydz's Amazon keyword rank checker is completely free no credit card required, no trial period, no expiry. Create a free account (60 seconds) and start checking keyword rankings on Amazon India immediately. The free tool shows current rank position, rank movement week-over-week, search visibility score, and keyword opportunity signals. Paid plans (₹1,999/month) unlock daily tracking, WhatsApp alerts when a keyword drops, 90-day historical rank curves, and competitor keyword gap analysis.",
    },
    {
      id: 'faq-2',
      question: 'Does it work for Amazon India only?',
      answer: "The free Amazon keyword rank checker is calibrated specifically for Amazon India (amazon.in) it scans Amazon India's live organic search results, not Amazon.com data. This matters significantly: keyword rankings on Amazon India differ from Amazon.com because the search index, buyer behaviour, and A9 algorithm weights vary. A tool calibrated for Amazon.com gives you the wrong ranking data for your Amazon India listings. Insydz reads Amazon India's live search results directly including Hindi and English keyword searches.",
    },
    {
      id: 'faq-3',
      question: 'How accurate is the rank data?',
      answer: "The free Amazon keyword rank checker scans Amazon India's live organic search results at the time of your check it reads where your product actually appears in the results page. This is direct search result data, not estimated or modelled data. Position #14 means your product appears at result 14 on Amazon India for that keyword right now. Rank changes (e.g. ↑+6 from #20 to #14) reflect movement since the last check date.",
    },
    {
      id: 'faq-4',
      question: 'Can I check rankings for competitor products?',
      answer: "Yes. The free keyword rank checker works on any Amazon India product ASIN including competitor products. Enter a competitor's ASIN and check what keywords they rank for and at what position. If a competitor ranks #3 for a 40,000/month search term, you know that keyword is worth targeting. If they rank #47 for a term buyers frequently use, you have a clear gap to build a listing around and potentially outrank them.",
    },
    {
      id: 'faq-5',
      question: 'Is login required?',
      answer: "Yes, a free Insydz account is required just an email address, no credit card. Login saves your rank check history so you can compare rankings across sessions and track keyword movement over time. Your free account also unlocks basic versions of all Insydz features product analysis, competitor price checking, and review sentiment analysis not just the keyword rank checker.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── SEO HEAD ── */}
      

      {/* ─── NAVIGATION ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
              <a href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Insydz</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              {(['Solutions', 'Use Cases', 'Features'] as const).map((key) => (
                <div className="relative" key={key}>
                  <button onMouseEnter={() => setActiveDropdown(key)} className={`px-3 py-2 text-sm font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1 ${key === 'Solutions' ? 'text-indigo-600 dark:text-indigo-500 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                    {key} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === key && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-1">{item.name}</span>
                            {item.badge && <span className="text-xs bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-indigo-600 dark:text-indigo-400">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">Pricing</Link>

              {(['Free Tools', 'Compare', 'Resources'] as const).map((key) => (
                <div className="relative" key={key}>
                  <button onMouseEnter={() => setActiveDropdown(key)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1">
                    {key} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === key && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className={`absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${key === 'Compare' ? 'right-0' : 'left-0'}`}>
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-1">{item.name}</span>
                            {item.badge && <span className="text-xs bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-indigo-600 dark:text-indigo-400">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}

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

              <a href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
                Login
              </a>

              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile controls */}
            <div className="lg:hidden flex items-center gap-2">
              <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
              </button>
              <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
                <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(['Solutions', 'Use Cases', 'Features', 'Free Tools', 'Compare', 'Resources'] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button onClick={() => toggleMobileMenu(menuKey)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium">
                    {menuKey} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-indigo-100 dark:border-indigo-900 pl-3">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                          item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                            {item.icon} {item.name}
                            {item.badge && <span className="ml-auto text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
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
               <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium">Pricing</Link>
              <div>
                <button onClick={() => toggleMobileMenu('About')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  About <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'About' && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-100 dark:border-purple-900 pl-3">
                    {navigationMenu.About.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          {item.icon} {item.name}
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
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-center py-2 rounded-xl font-semibold block">Login</a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-violet-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Free Tool · NEW · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Amazon Keyword
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Rank Checker for India</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly check where your product ranks for any keyword on Amazon India so you can optimize your listing, close visibility gaps, and outrank competitors on the search results page.
          </p>

          {/* LOGIN GATE */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-indigo-100 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="text-5xl">🔒</div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                    Create a free Insydz account or log in to start checking keyword rankings on Amazon India instantly. Free forever no credit card required.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-indigo-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="Enter ASIN (e.g. B09XYZ123)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors text-sm" />
                  <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="Enter keyword (e.g. steel water bottle)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <button onClick={handleCheck} disabled={analyzing} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Checking Rank...</> : <><Search className="w-4 h-4" /> Check Keyword Rank</>}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in ready to check keyword rankings.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL SHOWS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Tool Overview</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What This Free Rank Checker <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Shows You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Four keyword intelligence signals that reveal your Amazon India search visibility so you know exactly which listings to fix, which keywords to add, and which ranking wins to protect.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Hash className="w-6 h-6" />, title: "Current Keyword Rank", desc: "See exactly where your product appears in Amazon India search results for a keyword. Position #3 is very different from position #43 and this tool shows you exactly which one you're at.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "hover:border-indigo-300" },
              { icon: <Search className="w-6 h-6" />, title: "Search Visibility Score", desc: "Understand how visible your product is for the keywords that matter most. A visibility score across your tracked keywords shows whether you're gaining or losing organic ground overall.", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", border: "hover:border-violet-300" },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Rank Movement", desc: "See if your ranking is improving, declining, or stable compared to last week. A keyword that slipped from #8 to #24 needs immediate attention. One that moved from #31 to #14 deserves to be protected.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "hover:border-blue-300" },
              { icon: <Target className="w-6 h-6" />, title: "Keyword Opportunity", desc: "Discover high-traffic keywords where small rank improvements drive big results. Moving from page 2 to page 1 can multiply organic traffic by 8–10x on the same keyword.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "hover:border-purple-300" },
            ].map((card, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg ${card.border} transition-all group relative overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color} mb-4`}>{card.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHY CRITICAL ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Why It Matters</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Why Keyword Rank Tracking Is <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Critical</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Over 70% of Amazon shoppers never go past the first page of search results. If your product isn't ranking for the right keywords, it simply doesn't exist to most buyers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {["Products buried on page 3+ get near-zero organic traffic", "Listing optimizations without rank data are guesswork", "Competitors climb rankings while yours drops silently", "Missing high-volume keywords means invisible products"].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
              </div>
            ))}
          </div>

          {/* Skip box */}
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Don't Track Keyword Rankings?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {["You lose organic visibility without knowing why sales dropped", "Listing changes have no measurable impact because you can't see what moved", "Competitors close the rank gap while you're unaware", "Ad spend rises as organic performance falls and you compensate with PPC"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic border-t border-red-200 dark:border-red-800/50 pt-4">Sellers who track keyword rank can fix problems before they become expensive.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">How It <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Works</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Two inputs. Instant result. Provide the product ASIN and the keyword and see exactly where your listing appears in Amazon India's organic search results right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+28px)] right-[calc(16.6%+28px)] h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 z-0"></div>
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN + Keyword", desc: "Provide the product ASIN and the keyword you want to check rank for on Amazon India. Works on any ASIN yours or a competitor's product." },
              { step: "02", icon: <Hash className="w-7 h-7" />, title: "Insydz Scans Search Results", desc: "We scan Amazon India's live organic search results to find exactly where your product appears for that keyword not estimated data, actual search position." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Rank Position", desc: "See the current rank, page position, and visibility score instantly. Plus rank movement compared to last week so you know if you're climbing or slipping." },
            ].map((s, i) => (
              <div key={i} className="relative z-10 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">{s.step}</div>
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
             <a href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Check Your Keyword Rank Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Example Output</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Example Keyword Rank <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Report</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Here's what a real keyword rank snapshot looks like for an Amazon India product so you know exactly what you'll receive before signing in.</p>
          </div>

          {/* Report card */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Keyword Rank Report</p>
                <p className="text-white font-bold text-lg">Steel Water Bottle · B09EXAMPLE</p>
              </div>
              <span className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">Amazon India</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
              {[
                { label: "Keyword", value: "steel water bottle", sub: "Search term checked", color: "text-indigo-500" },
                { label: "Current Rank", value: "#14", sub: "Page 1 position 14", color: "text-gray-900 dark:text-white" },
                { label: "Rank Change", value: "↑ +6", sub: "Improved from #20 last week", color: "text-green-500" },
                { label: "Visibility Score", value: "72 / 100", sub: "Above-average visibility", color: "text-orange-500" },
              ].map((m, i) => (
                <div key={i} className="p-5 sm:p-6">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{m.label}</p>
                  <p className={`text-xl font-black ${m.color} leading-tight`}>{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual snapshot */}
          <div className="mt-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">Visual Keyword Rank <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Snapshot</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">See rank position, movement, and opportunity across multiple keywords at once so you can prioritise which keywords to work on first.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-9 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Rank trend */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> Rank Trend (30 Days)</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[52, 48, 44, 46, 42, 40, 38, 36, 34, 30].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}px`, background: i === 9 ? '#6366F1' : '#A5B4FC', opacity: 0.85 }}></div>
                    ))}
                  </div>
                  <p className="text-xs text-green-500 mt-2 font-semibold">↑ Climbing — rank improving steadily</p>
                  <p className="text-xs text-gray-400 mt-0.5">(Lower bar = better rank position)</p>
                </div>

                {/* Keyword rankings table */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><Hash className="w-4 h-4 text-violet-500" /> Top Keyword Rankings</p>
                  <div className="space-y-2.5">
                    {[
                      { kw: "steel water bottle", rank: "#14", change: "↑ +6", up: true },
                      { kw: "insulated bottle", rank: "#31", change: "↓ -3", up: false },
                      { kw: "water bottle 1 litre", rank: "#8", change: "↑ +12", up: true },
                      { kw: "gym water bottle", rank: "#22", change: "→ +1", up: null },
                    ].map((item) => (
                      <div key={item.kw} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[120px]">{item.kw}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.rank}</span>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${item.up === true ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : item.up === false ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visibility bars */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500" /> Search Visibility</p>
                  <div className="space-y-3">
                    {[
                      { label: "Page 1 Keywords", pct: 35, opacity: 1 },
                      { label: "Page 2 Keywords", pct: 42, opacity: 0.6 },
                      { label: "Page 3+ Keywords", pct: 23, opacity: 0.35 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{item.label}</span><span>{item.pct}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${item.pct}%`, opacity: item.opacity }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-500 mt-3 font-semibold">35% of tracked keywords on Page 1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Unlock the Full Keyword Intelligence Report</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7 max-w-sm mx-auto">Sign in to access multi-keyword rank tracking, historical trend data, and keyword opportunity scoring plus daily rank monitoring and WhatsApp alerts when a keyword drops a page.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/login" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── PRIYA SCENARIO ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Real Seller Story</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What Most Keyword Tools <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Don't Tell You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Most keyword tools show you search volume. A free Amazon keyword rank checker shows you something more useful: whether you're actually appearing when buyers search those terms and which single listing edit caused you to disappear.</p>
          </div>

          <div className="rounded-3xl p-6 sm:p-10 text-white" style={{ background: 'linear-gradient(135deg, #1E1B4B, #2E1065)' }}>
            <h3 className="font-black text-lg sm:text-xl mb-1" style={{ color: '#C4B5FD' }}>Priya's Invisible Product Found by a Single Rank Check</h3>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Kitchenware seller, Jaipur | Amazon India | Copper water bottle ₹649 | 3 months of declining sales | Ad spend increasing monthly</p>

            <div className="space-y-4">
              {[
                { label: "The Problem", text: "Priya's copper water bottle had been her #2 revenue product for 8 months. In Month 9, sales started falling despite stable ad spend. By Month 11, she had doubled PPC bids and added a 15% discount. Sales continued to fall. Her Seller Central organic traffic report showed a 64% decline. She had no idea why." },
                { label: "What the Rank Checker Found (6 minutes)", text: "The free Amazon keyword rank checker showed her product at #4 for \"copper water bottle\" still strong. But for \"तांबे की बोतल\" (the Hindi search term, 28,000 searches/month on Amazon India), her product had fallen from #6 to #89. For \"copper bottle 1 litre\" (31,000/month), she had dropped from #9 to page 3. Both ranking collapses had happened within a 2-week window in Month 9 the same window when she had edited the product title to improve English SEO." },
                { label: "The Cause A Title Edit That Removed Hindi Terms", text: "Her previous title had included \"तांबे की बोतल\" alongside English keywords. The title edit — made to improve English readability had removed this entirely. Amazon India's A9 algorithm stopped indexing her for Hindi search terms within 10 days of the change. 59,000 monthly searches that previously found her product now couldn't." },
                { label: "The Fix (48 Hours)", text: "Restored Hindi keywords to the product title and backend search terms. Within 48 hours, both Hindi keywords were re-indexed. Within 3 weeks, ranking had recovered to #7 for \"तांबे की बोतल\" and #11 for \"copper bottle 1 litre.\" Sales recovered to Month 8 levels within 5 weeks without any increase in ad spend." },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #8B5CF6' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#C4B5FD' }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { num: "#89→#7", label: "Hindi keyword rank recovery in 3 weeks" },
                { num: "59K", label: "Monthly searches recovered after title fix" },
                { num: "₹1.4L", label: "Monthly revenue restored (no ad spend increase)" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-5 text-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)' }}>
                  <span className="block text-2xl sm:text-3xl font-black mb-1" style={{ color: '#C4B5FD' }}>{item.num}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 mt-6 text-center text-sm leading-relaxed" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(255,255,255,0.72)' }}>
              <strong style={{ color: '#C4B5FD' }}>₹40,000 in extra ad spend over 2 months fixed nothing.</strong> A 6-minute rank check revealed the cause instantly. The fix cost nothing. The rank collapse started with a title edit that removed 59,000 monthly searches from finding her product and no tool told her until she checked where she actually ranked.
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Data Quality</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by Real Amazon India <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Search Data</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">This is direct search result data not keyword volume estimates. The free keyword rank checker reads Amazon India's live search results exactly as a buyer would see them.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-5">
            {["Scans live Amazon India organic search results", "Tracks rank for multiple keywords per product", "Detects rank movements week-over-week", "Built for Amazon India search algorithm behaviour"].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">Used by sellers improving keyword visibility across Amazon India categories.</p>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Want Daily Rank Tracking Across All Keywords?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-7 text-sm leading-relaxed">This free checker gives you a one-time rank snapshot. Upgrade to track dozens of keywords daily, get WhatsApp alerts when rankings drop, and see historical rank trends over time.</p>
            <a href="/signup" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-10 py-3 rounded-full shadow-xl inline-flex items-center">
              Start Free Full Access <ArrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHO SHOULD USE ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Fit Assessment</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Who Should Use <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">This Tool</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 font-bold">✓</div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">Best For</h3>
              </div>
              {["Sellers optimizing listings for better organic visibility and reducing PPC dependency", "Brands tracking rank impact of listing changes titles, bullets, backend keywords", "Agencies managing Amazon SEO for multiple seller accounts and need keyword performance proof", "New sellers validating keyword strategy before launch checking what competitors actually rank for", "Sellers whose sales have dropped and want to diagnose whether keyword indexing is the cause"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-bold">!</div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">Not Ideal For</h3>
              </div>
              {["Sellers doing only offline or non-Amazon retail", "Businesses selling on non-Indian Amazon marketplaces (US, UK, UAE) different search index", "Sellers with brand-new listings with zero reviews indexing takes time to stabilise"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-gray-400 mt-0.5 shrink-0">○</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── BUILT FOR INDIA ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">India-First Design</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Built for <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Indian Marketplace Reality</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">Amazon India's A9 algorithm behaves differently from other marketplaces and this tool is calibrated for it. Most keyword rank checkers read the wrong search index entirely.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[{ text: "Amazon India search index" }, { text: "Hindi + English keyword support" }, { text: "Category-specific rank norms" }, { text: "Connected to full Insydz platform" }].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-indigo-50 dark:border-indigo-900/30 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 hover:-translate-y-1 transition-all">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>

          {/* India explainer */}
          <div className="bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 sm:p-9 max-w-3xl mx-auto text-left">
            <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-3 text-sm">What most keyword tools don't tell you:</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">Helium 10's Keyword Tracker, SellerApp, and most keyword research tools for Amazon are calibrated for Amazon.com or give partial Amazon India data. More critically: none of them check Hindi keyword rankings. On Amazon India, searches like <strong className="text-gray-900 dark:text-white">«स्टील की बोतल»</strong>, <strong className="text-gray-900 dark:text-white">«ताँबे का बर्तन»</strong>, and <strong className="text-gray-900 dark:text-white">«1 लीटर बोतल»</strong> can represent 40–60% of category search volume for some products.</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">A free Amazon keyword rank checker that only reads English results is blind to half the market and blind to the exact mechanism behind Priya's ₹1.4L revenue loss. Amazon India's A9 algorithm weighs Hindi search terms, regional language terms, and transliterated searches differently from how Amazon.com handles language variations.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FREE vs PAID ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Free vs Paid</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What the Free Tool Shows And <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">What Goes Deeper</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">The free Amazon keyword rank checker is a powerful diagnostic snapshot. Here's exactly what's included and what unlocks with a paid Insydz plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-6">✓ Free Forever Included</h3>
              {["Current rank position for a keyword on Amazon India", "Page position (Page 1 / Page 2 / Page 3+)", "Rank movement week-over-week (improving / stable / declining)", "Search visibility score (0–100)", "Hindi + English keyword checking", "Works on your products and competitor products", "Limited checks per day"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-6">Paid Plans — ₹1,999/month</h3>
              {["Daily rank tracking across all your keywords automated, continuous", "WhatsApp alerts when a keyword drops a page or falls below a rank threshold", "90-day historical rank curves see exactly when a rank change happened and correlate it to a listing edit", "Multi-keyword dashboard track 20–50 keywords per product simultaneously", "Keyword opportunity scoring identifies which keywords are easiest to move from page 2 to page 1", "Competitor keyword gap analysis keywords your competitors rank for that you don't", "Unlimited checks across your full product catalogue"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Frequently Asked <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Questions</span></h2>
            <p className="text-gray-500 dark:text-gray-400">Answers to what Indian sellers ask before using the free Amazon keyword rank checker.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className={`bg-white dark:bg-gray-800 border-2 ${expandedFaq === faq.id ? 'border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700'} rounded-2xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors`}>
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                  <span className="text-xl text-indigo-500 shrink-0 font-light">{expandedFaq === faq.id ? '−' : '+'}</span>
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8 max-w-lg mx-auto leading-relaxed">
            This free Amazon keyword rank checker helps Indian sellers track where their products appear in Amazon India search results for specific keywords. Ideal for Amazon India sellers, private label brands, and D2C businesses looking to improve organic visibility, optimize listings, and outrank competitors on high-traffic search terms.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-500 to-violet-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white">Stop Flying Blind. Know Where You Rank.</h2>
          <p className="text-indigo-100 text-lg mb-10">One rank check today reveals exactly where your listing stands and what to fix next.</p>
          <button onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="bg-white text-indigo-600 font-black px-10 sm:px-14 py-5 rounded-full shadow-2xl hover:scale-105 transition-all text-lg inline-flex items-center gap-3">
            Check Keyword Rank Now <ArrowRight className="w-5 h-5" />
          </button>

          {/* ICP Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mt-12">
            {[
              { type: "New Seller", msg: "Validate your keyword strategy before launch check what your top competitors actually rank for and build your listing around those gaps.", cta: "Start Free →", href: "/signup" },
              { type: "Growing Seller", msg: "Stop guessing why sales dropped. Daily rank tracking with WhatsApp alerts tells you the moment a keyword slips before the revenue impact hits.", cta: "Try Growth Plan →", href: "/signup?plan=growth" },
              { type: "Agency", msg: "Show clients exactly how your listing work moves rankings before and after keyword tracking data is the clearest proof of SEO impact.", cta: "Book Demo →", href: "/about/contact-us" },
            ].map((icp, i) => (
              <div key={i} className="bg-white/12 border border-white/25 rounded-2xl p-6 text-left backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{icp.type}</p>
                <p className="text-sm text-white/90 leading-relaxed mb-4">{icp.msg}</p>
                <a href={icp.href} className="text-sm font-bold text-white border-b border-white/40 hover:border-white pb-0.5 transition-colors">{icp.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-indigo-200 dark:border-indigo-800 px-4 py-3 shadow-2xl">
        <button onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
          {isLoggedIn ? <><Search className="w-4 h-4" /> Check Keyword Rank Free</> : <><LogIn className="w-4 h-4" /> Log In to Check Keyword Rank</>}
        </button>
      </div>

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
 

