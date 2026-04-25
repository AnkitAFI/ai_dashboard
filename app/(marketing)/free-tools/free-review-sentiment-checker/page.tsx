"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle,
  BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown, X,
  Star, ThumbsUp, ThumbsDown,
  Smile, Frown, Meh, BarChart2, LogIn, Lock, Flame, Mail, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
} from 'lucide-react';
import { Button } from "@/components/ui/button";


export const dynamic = "force-static";




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

export default function FreeReviewSentimentCheckerPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const [asinInput, setAsinInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleAnalyze = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is this review sentiment checker free?',
      answer: "Yes. Insydz's Amazon review sentiment checker is completely free no credit card required, no trial period, no expiry. Create a free account (60 seconds) and start analyzing immediately. The free tool provides an overall sentiment score, top complaint themes, top praise themes, and improvement opportunities for any Amazon India ASIN. Paid plans unlock daily monitoring, competitor comparison, and WhatsApp alerts when sentiment shifts negative.",
    },
    {
      id: 'faq-2',
      question: 'Does it work for Amazon India only?',
      answer: "The free review sentiment checker is calibrated specifically for Amazon India (amazon.in). It processes reviews written by Indian buyers including Hindi, Hinglish, and regional language patterns not just English reviews. Since 60–70% of Amazon India reviews are in Hindi, a tool that only reads English misses most of the buyer signal. The paid Insydz platform also covers Flipkart review sentiment analysis.",
    },
    {
      id: 'faq-3',
      question: 'How is sentiment calculated?',
      answer: "Insydz uses AI to scan hundreds of buyer reviews and classify them by sentiment (positive, neutral, negative), theme (packaging, battery, build quality, delivery), and emotional tone. The sentiment score (0–100) represents weighted buyer sentiment across all reviews not just star ratings. A product can have 70% 4-star reviews but score 45/100 if those reviews contain consistent specific complaints. Star ratings don't tell you why buyers are unhappy. Sentiment analysis does.",
    },
    {
      id: 'faq-4',
      question: "Can I check a competitor's product reviews?",
      answer: "Yes. The free Amazon review sentiment checker works on any Amazon India product ASIN including competitor products. This is one of the most valuable use cases: paste a competitor's ASIN, see their top complaints, and understand exactly what their buyers are frustrated with. That's your product brief. Build something that fixes those issues and you enter the market with a clear, data-backed advantage over an established seller.",
    },
    {
      id: 'faq-5',
      question: 'Is login required?',
      answer: "Yes, a free Insydz account is required just an email address, no credit card. Login saves your analysis history so you can compare sentiment across products and track changes over time. Your free account also unlocks basic versions of all Insydz features: product analysis, keyword monitoring, and price tracking not just the sentiment checker.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── SEO HEAD ── */}
      

      {/* ─── NAVIGATION ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg' : 'bg-background dark:bg-gray-900/80 backdrop-blur-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
              <a href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Insydz</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              {(['Solutions', 'Use Cases', 'Features'] as const).map((key) => (
                <div className="relative" key={key}>
                  <button onMouseEnter={() => setActiveDropdown(key)} className={`px-3 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1 ${key === 'Solutions' ? 'text-purple-600 dark:text-purple-500 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'}`}>
                    {key} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === key && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                            {item.badge && <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
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
              ))}

              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</Link>

              {(['Free Tools', 'Compare', 'Resources'] as const).map((key) => (
                <div className="relative" key={key}>
                  <button onMouseEnter={() => setActiveDropdown(key)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                    {key} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === key && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className={`absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${key === 'Compare' ? 'right-0' : 'left-0'}`}>
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                            {item.badge && <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
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
              ))}

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

               <a href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
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
                <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(['Solutions', 'Use Cases', 'Features', 'Free Tools', 'Compare', 'Resources'] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button onClick={() => toggleMobileMenu(menuKey)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                    {menuKey} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-100 dark:border-purple-900 pl-3">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                            {item.icon} {item.name}
                            {item.badge && <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
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
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-xl font-semibold block">Login</a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-purple-200 dark:bg-purple-900/30 dark:border-purple-700 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">Free Tool · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Amazon Review
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Sentiment Checker</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly understand what buyers love, hate, and complain about for any Amazon India product. Improve your listing, fix product gaps, and outperform competitors before they fix theirs.
          </p>

          {/* LOGIN GATE */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-purple-100 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="text-5xl">🔒</div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                    Create a free Insydz account or log in to start checking review sentiment instantly. Reads Hindi and English reviews free forever.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-purple-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="Enter Amazon product URL or ASIN (e.g. B09XYZ123)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors text-sm" />
                <button onClick={handleAnalyze} disabled={analyzing} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2">
                  {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</> : <><MessageCircle className="w-4 h-4" /> Check Sentiment</>}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in — ready to check sentiment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL SHOWS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Tool Overview</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What This Free Sentiment Checker <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Shows You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Four layers of buyer review intelligence every Amazon India seller needs before launching a product and after, to protect a listing that's already live.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Smile className="w-6 h-6" />, title: "Overall Sentiment Score", desc: "Positive, neutral, or negative see the overall buyer mood at a glance. Scored 0–100 so you can benchmark against competitors and track change over time.", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", border: "hover:border-green-300" },
              { icon: <ThumbsDown className="w-6 h-6" />, title: "Top Complaints", desc: "The most frequently raised issues across all recent buyer reviews grouped by theme (packaging, battery, fit, delivery) so you know exactly what to fix first.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "hover:border-red-300" },
              { icon: <ThumbsUp className="w-6 h-6" />, title: "What Buyers Praise", desc: "Understand what features and qualities buyers consistently love so you can amplify these strengths in your listing copy, images, and A+ content.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "hover:border-blue-300" },
              { icon: <Target className="w-6 h-6" />, title: "Improvement Opportunities", desc: "Review gaps that reveal where a better product could win the market. Specific, addressable issues not vague feedback that you can act on before your next inventory order.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "hover:border-purple-300" },
            ].map((card, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg ${card.border} transition-all group relative overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
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
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Why It Matters</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Why Review Sentiment Analysis Is <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Critical</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Reviews are the most honest signal in e-commerce. Most sellers ignore them or read them too slowly to act. This tool surfaces what matters, instantly.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {["Miss recurring complaints that damage conversions", "Launch products with known flaws buyers hate", "Ignore positive signals that should be in listings", "Lose to competitors who fixed the same issues"].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
              </div>
            ))}
          </div>

          {/* Skip box */}
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Ignore Review Sentiment?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {["Negative reviews accumulate and tank your search rankings", "Repeat product defects go unfixed for months", "Competitor products improve while yours stagnates", "Buyers abandon your listing for alternatives that solved what you didn't"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic border-t border-red-200 dark:border-red-800/50 pt-4">Most sellers only act on reviews after the damage is done.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">How It <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Works</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Three steps. Under two minutes. Paste any Amazon India product URL or ASIN yours or a competitor's and get a full sentiment breakdown instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+28px)] right-[calc(16.6%+28px)] h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 z-0"></div>
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN or Product Link", desc: "Paste any Amazon India product URL or ASIN. The AI review sentiment analyzer works on any publicly listed product yours or a competitor's." },
              { step: "02", icon: <MessageCircle className="w-7 h-7" />, title: "Insydz Processes Reviews", desc: "AI scans hundreds of buyer reviews in Hindi and English to extract sentiment, recurring themes, specific complaints and praise patterns." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Sentiment Insights", desc: "Receive a clear breakdown of sentiment score, top complaints, top praise, and improvement opportunities in seconds." },
            ].map((s, i) => (
              <div key={i} className="relative z-10 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">{s.step}</div>
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-500 mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
               <a href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Check Sentiment Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Example Output</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Example Sentiment Analysis <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Report</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Here's what a real Amazon India sentiment report looks like so you know exactly what you're getting before you sign in.</p>
          </div>

          {/* Report card */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">Review Sentiment Report</p>
                <p className="text-white font-bold text-lg">Noise Cancelling Earbuds · B09EXAMPLE</p>
              </div>
              <span className="bg-background opacity-100 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">Amazon India</span>
            </div>
            {/* Score bar */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Overall Sentiment Score</p>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">68 / 100</span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400" style={{ width: '68%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                <span>Negative</span>
                <span className="text-purple-500 font-semibold">Mostly Positive</span>
                <span>Excellent</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
              {[
                { label: "Sentiment", value: "Mostly Positive", sub: "68% positive reviews", icon: <Smile className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
                { label: "Top Complaint", value: "Battery life", sub: "Mentioned in 34% of 1–3★ reviews", icon: <Frown className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
                { label: "Top Praise", value: "Sound quality", sub: "Praised in 58% of 4–5★ reviews", icon: <ThumbsUp className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Opportunity", value: "Better case", sub: "Packaging gap identified", icon: <Target className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
              ].map((m, i) => (
                <div key={i} className="p-5 sm:p-6">
                  <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center ${m.color} mb-2`}>{m.icon}</div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{m.label}</p>
                  <p className={`text-lg font-black ${m.color} leading-tight`}>{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual snapshot */}
          <div className="mt-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">Visual Sentiment & Theme <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Snapshot</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">See rank position, movement, and opportunity across multiple keywords at once.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-9 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Star rating breakdown */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Star Rating Breakdown</p>
                  <div className="space-y-2.5">
                    {[{ stars: "5★", pct: 42, color: "bg-green-400" }, { stars: "4★", pct: 26, color: "bg-lime-400" }, { stars: "3★", pct: 12, color: "bg-yellow-400" }, { stars: "2★", pct: 9, color: "bg-orange-400" }, { stars: "1★", pct: 11, color: "bg-red-400" }].map((row) => (
                      <div key={row.stars} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-6 shrink-0">{row.stars}</span>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right shrink-0">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top complaint themes */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><Frown className="w-4 h-4 text-red-500" /> Top Complaint Themes</p>
                  <div className="space-y-3">
                    {[{ theme: "Battery life", pct: 34 }, { theme: "Packaging", pct: 22 }, { theme: "Connectivity", pct: 18 }, { theme: "Fit / comfort", pct: 14 }].map((item) => (
                      <div key={item.theme}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>{item.theme}</span><span>{item.pct}%</span></div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top praise themes */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-blue-500" /> Top Praise Themes</p>
                  <div className="space-y-3">
                    {[{ theme: "Sound quality", pct: 58 }, { theme: "Value for money", pct: 45 }, { theme: "Build quality", pct: 37 }, { theme: "Easy setup", pct: 28 }].map((item) => (
                      <div key={item.theme}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>{item.theme}</span><span>{item.pct}%</span></div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-900/50 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Unlock the Full Review Intelligence Report</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7 max-w-sm mx-auto">Sign in to receive detailed complaint breakdown, feature sentiment map, and improvement opportunity score and daily monitoring that alerts you when sentiment shifts negative.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <a href="/login" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── POOJA SCENARIO ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Real Seller Story</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What Most Review Tools <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Don't Tell You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Most review tools show you star ratings and word clouds. Insydz's free Amazon review sentiment checker tells you exactly what to fix and in which language Indian buyers are saying it.</p>
          </div>

          <div className="rounded-3xl p-6 sm:p-10 text-white" style={{ background: 'linear-gradient(135deg, #1C1828, #2D1B5A)' }}>
            <h3 className="font-black text-lg sm:text-xl mb-1" style={{ color: '#C4B5FD' }}>Pooja's ₹3.2L Recovery Found in Reviews She Couldn't Read</h3>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Kitchen appliances seller, Nagpur | Amazon India | Mixer grinder ₹1,899 | Rating fell 4.5★ → 3.8★ over 4 months</p>

            <div className="space-y-4">
              {[
                { label: "The Problem", text: "Pooja's mixer grinder had been her top product for 14 months. Then the rating started slipping. She read the English reviews: \"motor noise acceptable,\" \"good performance\" nothing obviously wrong. She spent ₹22,000 on new product photography and A+ content. Rating continued to fall. Sales down 41%." },
                { label: "What the Sentiment Checker Found", text: "The free Amazon review sentiment checker processed 340 reviews — including 218 in Hindi. The top complaint theme: \"डिब्बा टूटा हुआ आया\" (box arrived broken) mentioned in 47% of 1★ and 2★ reviews. The second: \"ढक्कन ठीक से बंद नहीं होता\" (lid doesn't close properly) mentioned in 31%. Neither complaint appeared in the English reviews she'd been reading." },
                { label: "The Fix (₹14/unit)", text: "New packaging with internal foam insert: ₹11/unit. New lid quality check added to factory QC: ₹3/unit. Total cost: ₹14 per unit. Fix applied within 6 weeks of the next inventory order." },
                { label: "The Outcome (90 days)", text: "Rating recovered from 3.8★ to 4.4★ in 90 days. New 1★ reviews down 78%. Sales recovered to previous levels plus 18% growth from improved ranking. Total revenue recovery + growth: ₹3.2L in 90 days." },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #A78BFA' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#C4B5FD' }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[{ num: "4.4★", label: "Rating recovered (from 3.8★ in 90 days)" }, { num: "78%", label: "Drop in new 1-star reviews after fix" }, { num: "₹3.2L", label: "Revenue recovery in 90 days" }].map((item, i) => (
                <div key={i} className="rounded-2xl p-5 text-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <span className="block text-2xl sm:text-3xl font-black mb-1" style={{ color: '#C4B5FD' }}>{item.num}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 mt-6 text-center text-sm leading-relaxed" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: 'rgba(255,255,255,0.75)' }}>
              The fix cost ₹14/unit. The problem was invisible until a free review sentiment checker read her Hindi reviews. <strong style={{ color: '#C4B5FD' }}>₹22,000 spent on photography fixed nothing. ₹14/unit fixed everything.</strong> The insight was in the reviews just written in a language the seller couldn't read at scale.
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Data Quality</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Real Review Data</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">This is not surface-level star counting it's deep review intelligence. The free review sentiment checker reads what buyers actually write, not just how many stars they clicked.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-5">
            {["Processes hundreds of buyer reviews per product", "Detects themes, emotions & recurring patterns", "Handles English and Hindi language reviews", "Built for Amazon India marketplace dynamics"].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">Used by sellers improving products across Amazon India categories.</p>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-900/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Want Deeper Review Intelligence?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-7 text-sm leading-relaxed">This free checker gives you a quick snapshot. Upgrade to track sentiment trends daily, get WhatsApp alerts when reviews shift negative, and compare your sentiment against competitors.</p>
            <a href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-10 py-3 rounded-full shadow-xl inline-flex items-center">
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
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Fit Assessment</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Who Should Use <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">This Tool</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 font-bold">✓</div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">Best For</h3>
              </div>
              {["Sellers with low ratings wanting to understand exactly why buyers are unhappy", "New sellers analyzing competitor review weaknesses before entering a category", "Private label brands improving product specs based on what current buyers complain about", "D2C brands entering Amazon India for the first time who want a product brief from buyer feedback", "Agencies auditing client listings to find the fastest path to improving ratings"].map((item, i) => (
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
              {["Sellers doing only offline or non-Amazon retail", "Businesses not interested in using review feedback to improve products or listings", "Sellers whose products have fewer than 20 reviews (insufficient data for reliable sentiment patterns)"].map((item, i) => (
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
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">India-First Design</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Built for <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Indian Marketplace Reality</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">Most sentiment tools are built for Western markets and ignore how Indian buyers actually write reviews. This one doesn't.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[{  text: "Amazon India data focus" }, {  text: "Hindi + English review parsing" }, {  text: "Category-specific sentiment norms" }, {  text: "Connected to full Insydz platform" }].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-purple-50 dark:border-purple-900/30 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 hover:-translate-y-1 transition-all">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>

          {/* India explainer */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-900/40 rounded-2xl p-6 sm:p-9 max-w-3xl mx-auto text-left">
            <p className="font-bold text-purple-600 dark:text-purple-400 mb-3 text-sm">What most tools don't tell you:</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">60–70% of Amazon India reviews are written in Hindi. A free sentiment analysis tool that only reads English reviews is ignoring the majority of buyer feedback. Insydz is the only free Amazon review sentiment checker that processes both so no complaint theme goes undetected, regardless of which language your buyers write in.</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">This applies equally to Flipkart review sentiment analysis where regional language reviews are even more common. The paid Insydz platform covers Flipkart review data for sellers operating across both marketplaces.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FREE vs PAID ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Free vs Paid</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What the Free Tool Shows And <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">What Goes Deeper</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">The free review sentiment checker is a powerful snapshot. Here's exactly what's included and what unlocks with a paid Insydz plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-6">✓ Free Forever Included</h3>
              {["Overall sentiment score (0–100)", "Top 4 complaint themes with frequency %", "Top 4 praise themes with frequency %", "Star rating breakdown visual", "Primary improvement opportunity", "Hindi + English review processing", "Works on your products and competitor products", "Limited analyses per day"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-6">Paid Plans — ₹1,999/month</h3>
              {["Daily sentiment monitoring see how your score moves over time", "WhatsApp alerts when a new 1★ or 2★ review arrives", "Full complaint breakdown not just top 4, all recurring themes", "Competitor sentiment comparison your score vs theirs side-by-side", "Review trend curves sentiment over 30, 60, 90 days", "Feature-level sentiment map which product features drive ratings up and down", "Unlimited analyses across your full product catalogue"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
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
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Frequently Asked <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Questions</span></h2>
            <p className="text-gray-500 dark:text-gray-400">Answers to what Indian sellers ask before using the free Amazon review sentiment checker.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className={`bg-white dark:bg-gray-800 border-2 ${expandedFaq === faq.id ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-700'} rounded-2xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 transition-colors`}>
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                  <span className="text-xl text-purple-500 shrink-0 font-light">{expandedFaq === faq.id ? '−' : '+'}</span>
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
            This free Amazon review sentiment checker helps Indian sellers understand buyer opinion, identify product flaws, and discover improvement opportunities before and after launching. Ideal for Amazon India sellers, private label brands, and D2C businesses who want to use real buyer feedback to build better products and listings.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white">Stop Ignoring Reviews. Start Acting on Them.</h2>
          <p className="text-purple-100 text-lg mb-10">One sentiment check today can reveal what your buyers have been trying to tell you.</p>
          <button onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="bg-white text-purple-600 font-black px-10 sm:px-14 py-5 rounded-full shadow-2xl hover:scale-105 transition-all text-lg inline-flex items-center gap-3">
            Check Sentiment Now <ArrowRight className="w-5 h-5" />
          </button>

          {/* ICP Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mt-12">
            {[
              { type: "New Seller", msg: "Analyze competitor reviews before you launch understand what buyers hate so you can build something better from day one.", cta: "Start Free →", href: "/signup" },
              { type: "Growing Seller", msg: "Diagnose why your rating is falling get daily sentiment monitoring and WhatsApp alerts on the Growth Plan.", cta: "Try Growth Plan →", href: "/signup?plan=growth" },
              { type: "Agency", msg: "Run sentiment audits across all your clients' listings identify the fastest improvements to present at your next review.", cta: "Book Demo →", href: "/about/contact-us" },
            ].map((icp, i) => (
              <div key={i} className="bg-background opacity-100 border border-white/25 rounded-2xl p-6 text-left backdrop-blur-none">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{icp.type}</p>
                <p className="text-sm text-white/90 leading-relaxed mb-4">{icp.msg}</p>
                 <a href={icp.href} className="text-sm font-bold text-white border-b border-white/40 hover:border-white pb-0.5 transition-colors">{icp.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-purple-200 dark:border-purple-800 px-4 py-3 shadow-2xl">
        <button onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
          {isLoggedIn ? <><MessageCircle className="w-4 h-4" /> Check Review Sentiment Free</> : <><LogIn className="w-4 h-4" /> Log In to Check Sentiment</>}
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
 

