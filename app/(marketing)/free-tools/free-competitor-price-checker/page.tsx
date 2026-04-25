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
  LogIn, Lock, BarChart2, RefreshCw, ArrowDownUp, ArrowDown, Flame, Mail, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
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

export default function FreeCompetitorPriceCheckerPage() {
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

  const handleCheck = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is this competitor price checker free?',
      answer: "Yes. Insydz's Amazon competitor price checker is completely free no credit card required, no trial period, no expiry. Create a free Insydz account (takes 60 seconds) and you can check competitor prices for any Amazon India product immediately. The free tool shows competitor price range (lowest, highest, average), active seller count, your price positioning relative to the market, and a Buy Box opportunity signal. Paid plans unlock daily price monitoring, WhatsApp alerts when a competitor drops price, historical trend data, and AI-powered repricing recommendations.",
    },
    {
      id: 'faq-2',
      question: 'Does it work for Amazon India only?',
      answer: "The free competitor price checker is built and calibrated specifically for Amazon India (amazon.in). Pricing data, seller counts, and Buy Box dynamics all reflect the Indian marketplace not Amazon.com data. Tools like Keepa and Helium 10 are built for Western markets and provide only partial Amazon India coverage. Insydz is built exclusively for Indian marketplace sellers Amazon India, Flipkart, and Meesho.",
    },
    {
      id: 'faq-3',
      question: 'How current is the pricing data?',
      answer: "The free Amazon competitor price checker pulls current pricing from all active sellers on that ASIN at the time of your check live market pricing, not estimates. The free tool gives you a point-in-time snapshot. Paid plans (₹1,999/month) add continuous monitoring checking competitor prices regularly and sending WhatsApp alerts when a price drops below a threshold you set, so you can reprice before losing the Buy Box.",
    },
    {
      id: 'faq-4',
      question: 'Can I check prices for competitor products too?',
      answer: "Yes. The free competitor price checker works on any Amazon India product ASIN including competitor products you don't sell. This is one of the most valuable pre-launch use cases: before entering a category, check exactly what price points competitors are clustered at, how many sellers are competing, and whether there's a price gap worth targeting. If 12 sellers are bunched between ₹599–₹649, there may be a margin opportunity at ₹749 for a better-spec product.",
    },
    {
      id: 'faq-5',
      question: 'Is login required?',
      answer: "Yes, a free Insydz account is required just an email address, no credit card. Login saves your price check history so you can compare price snapshots across sessions and track categories over time. Your free account also unlocks basic versions of all Insydz features review sentiment analysis, product research, and keyword rank checking not just the competitor price checker.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── SEO HEAD ── */}
      

      {/* ─── NAVIGATION ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
               <a href="/" className="flex items-center space-x-1 group">
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Insydz</span>
              </a>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              {(['Solutions', 'Use Cases', 'Features'] as const).map((key) => (
                <div className="relative" key={key}>
                  <button onMouseEnter={() => setActiveDropdown(key)} className={`px-3 py-2 text-sm font-medium rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center gap-1 ${key === 'Solutions' ? 'text-teal-600 dark:text-teal-500 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'}`}>
                    {key} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === key && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                          item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex-1">{item.name}</span>
                            {item.badge && <span className="text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-teal-600 dark:text-teal-400">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">Pricing</Link>

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

              {(['Compare', 'Resources'] as const).map((key) => (
                <div className="relative" key={key}>
                  <button onMouseEnter={() => setActiveDropdown(key)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center gap-1">
                    {key} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === key && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className={`absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${key === 'Compare' ? 'right-0' : 'left-0'}`}>
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex-1">{item.name}</span>
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-teal-600 dark:text-teal-400">{item.icon}</span>
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

              <a href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
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
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(['Solutions', 'Use Cases', 'Features', 'Free Tools', 'Compare', 'Resources'] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button onClick={() => toggleMobileMenu(menuKey)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium">
                    {menuKey} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-teal-100 dark:border-teal-900 pl-3">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                          item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg">
                            {item.icon} {item.name}
                            {item.badge && <span className="ml-auto text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
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
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium">Pricing</Link>
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
             <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-2 rounded-xl font-semibold block">Login</a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-teal-200 dark:bg-teal-900/30 dark:border-teal-700 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">Free Tool · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Competitor Price Checker
            <br />
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">for Amazon India</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly see how competitors are pricing products in your category so you can position smarter, win the Buy Box, and protect your margins on Amazon India.
          </p>

          {/* LOGIN GATE */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-teal-100 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="text-5xl">🔒</div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                    Create a free Insydz account or log in to start checking competitor prices instantly. Live Amazon India data free forever.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                   <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-teal-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="Enter Amazon product URL or ASIN (e.g. B09XYZ123)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-colors text-sm" />
                <button onClick={handleCheck} disabled={analyzing} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2">
                  {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Checking...</> : <><TrendingDown className="w-4 h-4" /> Check Prices</>}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in — ready to check competitor prices.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL SHOWS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Tool Overview</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What This Free Price Checker <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Shows You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Four pricing intelligence signals every Amazon India seller needs to stay competitive whether setting a launch price, defending the Buy Box, or protecting margins during a festive sale.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <IndianRupee className="w-6 h-6" />, title: "Competitor Price Range", desc: "See the lowest, highest, and average ₹ pricing across all competing sellers on an ASIN. Know the full price battlefield before you set your own price.", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", border: "hover:border-teal-300" },
              { icon: <Users className="w-6 h-6" />, title: "Seller Count", desc: "Know how many sellers are competing on this ASIN and at which price points. A category with 2 sellers is a different fight than one with 47.", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20", border: "hover:border-cyan-300" },
              { icon: <ArrowDownUp className="w-6 h-6" />, title: "Price Positioning", desc: "Understand where your price sits relative to the market above, at, or below the Buy Box sweet spot. Are you leaving money on the table, or about to lose the Buy Box?", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "hover:border-blue-300" },
              { icon: <Target className="w-6 h-6" />, title: "Pricing Opportunity", desc: "Spot gaps where a smarter price could win more sales without sacrificing margin. The zone between the cheapest seller and what buyers actually pay tells you everything.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "hover:border-indigo-300" },
            ].map((card, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg ${card.border} transition-all group relative overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
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
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Why It Matters</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Why Competitor Price Tracking Is <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Critical</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Price is one of the top factors in Amazon's Buy Box algorithm. Sellers who don't track competitor pricing consistently lose sales to better-positioned rivals often without realising why.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {["Lose the Buy Box to lower-priced competitors", "Price too high and miss high-volume sales windows", "Price too low and erode all your profit margins", "Miss competitor price drops and promotions from rivals"].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
              </div>
            ))}
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Ignore Competitor Pricing?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {["Competitors undercut you and take your sales", "Your listings stagnate with no Buy Box rotation", "You're last to know about aggressive price drops", "You reprice manually too slow, too late"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic border-t border-red-200 dark:border-red-800/50 pt-4">Most sellers only reprice after losing significant sales. Don't be that seller.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">How It <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Works</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Three steps. Under two minutes. Paste any Amazon India product URL or ASIN yours or a competitor's and see the full price landscape instantly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+28px)] right-[calc(16.6%+28px)] h-[2px] bg-gradient-to-r from-teal-500 to-cyan-500 z-0"></div>
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN or Product Link", desc: "Paste any Amazon India product URL or ASIN yours or a competitor's listing. The free Amazon competitor price analyzer works on any publicly listed product." },
              { step: "02", icon: <RefreshCw className="w-7 h-7" />, title: "Insydz Scans the Market", desc: "We pull current pricing from all sellers competing on that ASIN in real time not stored estimates, not US Amazon data. Live Indian marketplace pricing." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Price Intelligence", desc: "See the full price landscape lowest, highest, average, seller count, Buy Box win probability, and 30-day price trend immediately." },
            ].map((s, i) => (
              <div key={i} className="relative z-10 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">{s.step}</div>
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-500 mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => { if (!isLoggedIn) router.push('/signup'); else window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Check Competitor Prices Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Example Output</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Example Competitor Price <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Report</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Here's what a real Amazon India price intelligence snapshot looks like so you know exactly what you're getting before you sign in.</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">Competitor Price Report</p>
                <p className="text-white font-bold text-lg">Stainless Steel Water Bottle · B09EXAMPLE</p>
              </div>
              <span className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">Amazon India</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
              {[
                { label: "↓ Lowest Price", value: "₹399", sub: "Cheapest seller on ASIN", color: "text-green-500" },
                { label: "↑ Highest Price", value: "₹1,299", sub: "Most expensive seller", color: "text-red-500" },
                { label: "₹ Avg. Market Price", value: "₹749", sub: "Category price midpoint", color: "text-gray-900 dark:text-white" },
                { label: "👥 Seller Count", value: "14", sub: "Active sellers competing", color: "text-teal-500" },
              ].map((m, i) => (
                <div key={i} className="p-5 sm:p-6">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{m.label}</p>
                  <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual snapshot */}
          <div className="mt-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">Visual Price Landscape <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Snapshot</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">See the full price spread across competitors at a glance distribution, Buy Box zone, and trend direction.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-9 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-teal-500" /> Price Distribution</p>
                  <div className="space-y-2.5">
                    {[{ range: "₹300–₹499", count: 2, pct: 28 }, { range: "₹500–₹699", count: 5, pct: 42 }, { range: "₹700–₹899", count: 3, pct: 36 }, { range: "₹900–₹1,099", count: 3, pct: 25 }, { range: "₹1,100+", count: 1, pct: 10 }].map((row) => (
                      <div key={row.range} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">{row.range}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: `${row.pct}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-4 shrink-0 text-right">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 self-start"><Target className="w-4 h-4 text-cyan-500" /> Buy Box Price Zone</p>
                  <div className="relative w-28 h-28 my-2">
                    <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(#0CCFB0 0% 65%, #e5e7eb 65% 100%)' }}></div>
                    <div className="absolute inset-3 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-teal-500">65%</span>
                      <span className="text-xs text-gray-400">win chance</span>
                    </div>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-3 font-semibold">At ₹749 — competitive zone</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><ArrowDown className="w-4 h-4 text-blue-500" /> 30-Day Price Trend</p>
                  <div className="flex items-end gap-1.5 h-20">
                    {[32, 38, 42, 40, 45, 42, 38, 36, 34, 30].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}px`, background: i === 9 ? '#0CCFB0' : '#99F6E4', opacity: 0.85 }}></div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-500 mt-3 font-semibold">↓ Avg. price declining 8% this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-teal-200 dark:border-teal-900/50 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Unlock the Full Price Intelligence Report</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7 max-w-sm mx-auto">Sign in to access seller-level pricing breakdown, historical trend data, and Buy Box positioning insights plus daily monitoring and WhatsApp alerts when a competitor drops price.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <a href="/login" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── SURESH SCENARIO ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Real Seller Story</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What Most Price Tools <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Don't Tell You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Most Amazon price comparison tools show a static number. A free competitor price checker that shows the Buy Box zone, seller distribution, and trend direction tells you something far more useful: where to price right now, not just what others are charging.</p>
          </div>

          <div className="rounded-3xl p-6 sm:p-10 text-white" style={{ background: 'linear-gradient(135deg, #0F2027, #0A3D3A)' }}>
            <h3 className="font-black text-lg sm:text-xl mb-1" style={{ color: '#5EEAD4' }}>Suresh's Big Billion Days Buy Box — ₹2.8L Recovered in 6 Hours</h3>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Electronics accessories, Pune | Amazon India | Bluetooth speakers ₹1,199 | Big Billion Days week | 18 active competing sellers</p>
            <div className="space-y-4">
              {[
                { label: "The Problem — Day Before Sale", text: "Suresh had been holding his Bluetooth speakers at ₹1,199 for 3 weeks a price that had been earning him the Buy Box consistently. The day before Big Billion Days, he checked his dashboard and saw sales had dropped 60% in 4 hours. He didn't know why. He assumed it was site traffic. It wasn't." },
                { label: "What the Price Checker Found", text: "The free Amazon competitor price checker showed 3 sellers had dropped to ₹999–₹1,049 in the same afternoon. Average market price had shifted from ₹1,165 to ₹1,042 in under 6 hours. His Buy Box win probability had fallen from 71% → 18%. The 30-day trend showed this was a coordinated pre-sale repricing pattern other sellers preparing for the sale window. Without the price snapshot, he would have assumed the problem was his listing or ads." },
                { label: "The Repricing Decision (14 minutes)", text: "Repriced to ₹1,079 above the cheapest competitors, but at the Buy Box sweet spot for his stock level. Not the lowest price. Not a margin-destroying race to the bottom. The right price for the right moment. Buy Box recovered within 22 minutes of repricing." },
                { label: "The Outcome (Big Billion Days)", text: "Buy Box held for 83% of the 48-hour sale window. Total Big Billion Days revenue: ₹4.1L vs ₹1.3L in the previous year's equivalent period. The difference wasn't his product, his ads, or his reviews. It was knowing the Buy Box zone at the right moment and acting on it in 14 minutes." },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #0CCFB0' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#5EEAD4' }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.text}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[{ num: "83%", label: "Buy Box hold rate during 48-hr sale window" }, { num: "₹4.1L", label: "Big Billion Days revenue (vs ₹1.3L prior year)" }, { num: "14 min", label: "Time from price check to Buy Box recovery" }].map((item, i) => (
                <div key={i} className="rounded-2xl p-5 text-center" style={{ background: 'rgba(12,207,176,0.1)', border: '1px solid rgba(12,207,176,0.2)' }}>
                  <span className="block text-3xl font-black mb-1" style={{ color: '#5EEAD4' }}>{item.num}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-5 mt-6 text-center text-sm leading-relaxed" style={{ background: 'rgba(12,207,176,0.08)', border: '1px solid rgba(12,207,176,0.18)', color: 'rgba(255,255,255,0.7)' }}>
              The repricing decision cost nothing just a free price check and 14 minutes. <strong style={{ color: '#5EEAD4' }}>The information gap cost him the Buy Box. Closing that gap with a single price snapshot recovered ₹2.8L in one sale window.</strong> The paid plan would have sent a WhatsApp alert the moment competitors dropped before he even noticed the sales dip.
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Data Quality</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by Real Marketplace <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Pricing Data</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">This is live market pricing not estimated guesswork. The free Amazon competitor price checker pulls current data from all active sellers on an ASIN at the time of your check.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-5">
            {["Tracks pricing across all active sellers per ASIN", "Monitors Buy Box price changes in near-real time", "Built for Amazon India ₹ pricing dynamics", "Benchmarks pricing against category averages"].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">Used by sellers managing pricing across Amazon India categories.</p>
          <div className="bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-100 dark:border-teal-900/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Want Daily Pricing Alerts?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-7 text-sm leading-relaxed">This free checker gives you a one-time snapshot. Upgrade to get daily price movement alerts, historical trend tracking, and automated repricing recommendations sent to WhatsApp.</p>
            <a href="/signup" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold px-10 py-3 rounded-full shadow-xl inline-flex items-center">
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
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Fit Assessment</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Who Should Use <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">This Tool</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 font-bold">✓</div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">Best For</h3>
              </div>
              {["Sellers who want to win the Buy Box consistently — not just occasionally", "Resellers tracking multiple competitors per ASIN across categories", "Private label brands setting launch pricing in a new category", "Agencies managing pricing strategy for multiple seller clients", "Sellers preparing for festive sales (Big Billion Days, Great Indian Festival) who want to enter at the right price point"].map((item, i) => (
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
              {["Sellers doing only offline or non-Amazon retail", "Businesses selling on marketplaces outside India where pricing dynamics differ", "Sellers with a single product and fewer than 3 active competitors on the ASIN"].map((item, i) => (
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
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">India-First Design</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Built for <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Indian Marketplace Reality</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">Global repricing tools don't understand Indian pricing patterns, festive sale dynamics, or how the Amazon India Buy Box algorithm differs from Amazon.com. This one does.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[{ icon: "🇮🇳", text: "Amazon India data focus" }, { icon: "₹", text: "₹ pricing norms & benchmarks" }, { icon: "🎯", text: "Buy Box intelligence built in" }, { icon: "🔗", text: "Connected to full Insydz platform" }].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-teal-50 dark:border-teal-900/30 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-700 hover:-translate-y-1 transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 border-2 border-teal-100 dark:border-teal-900/40 rounded-2xl p-6 sm:p-9 max-w-3xl mx-auto text-left">
            <p className="font-bold text-teal-600 dark:text-teal-400 mb-3 text-sm">What most tools don't tell you:</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">Keepa shows historical price charts. Helium 10 gives Buy Box estimates for Amazon.com. Neither is built for the specific pricing dynamics of Amazon India where festive sale seasons (Diwali, Big Billion Days, Holi) create 48–72 hour repricing windows that can shift average category prices by 20–35% in hours. A free Amazon competitor price analysis tool built for India reads these patterns. A US-built tool doesn't.</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">This is also why the free Amazon price comparison tool matters most in the 48–72 hours before and during major sales: the Buy Box moves continuously, and sellers who check prices once a day are already behind.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FREE vs PAID ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full mb-4">Free vs Paid</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What the Free Tool Shows And <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">What Goes Deeper</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">The free competitor price checker is a powerful point-in-time snapshot. Here's exactly what's included and what unlocks with a paid Insydz plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-6">✓ Free Forever Included</h3>
              {["Lowest, highest, and average competitor price in INR", "Active seller count on the ASIN", "Price distribution by price band (seller count at each price range)", "Buy Box win probability at current price", "30-day price trend direction", "Works on your products and competitor products", "Limited checks per day"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white mb-6">Paid Plans — ₹1,999/month</h3>
              {["Daily price monitoring across your full catalogue automated, not manual", "WhatsApp alerts when a competitor drops price below your threshold", "Historical price trend data 90 days of competitor pricing history", "Seller-level breakdown see exactly which competitor is undercutting you", "Festive sale mode heightened monitoring during Big Billion Days and Great Indian Festival", "AI repricing recommendations suggested price to maximise Buy Box hold and margin", "Unlimited checks across all your ASINs"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0"></div>
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
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Frequently Asked <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Questions</span></h2>
            <p className="text-gray-500 dark:text-gray-400">Answers to what Indian sellers ask before using the free Amazon competitor price checker.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className={`bg-white dark:bg-gray-800 border-2 ${expandedFaq === faq.id ? 'border-teal-300 dark:border-teal-700' : 'border-gray-200 dark:border-gray-700'} rounded-2xl overflow-hidden hover:border-teal-300 dark:hover:border-teal-700 transition-colors`}>
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                  <span className="text-xl text-teal-500 shrink-0 font-light">{expandedFaq === faq.id ? '−' : '+'}</span>
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
            This free Amazon competitor price checker helps Indian sellers track competitor pricing, understand Buy Box dynamics, and make smarter pricing decisions before and after launching products. Ideal for Amazon India sellers, resellers, private label brands, and D2C businesses looking to price competitively and protect their margins.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-teal-500 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white">Stop Guessing. Know Your Competitors' Prices.</h2>
          <p className="text-teal-100 text-lg mb-10">One price check today could be the difference between winning or losing the Buy Box.</p>
          <button onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="bg-white text-teal-600 font-black px-10 sm:px-14 py-5 rounded-full shadow-2xl hover:scale-105 transition-all text-lg inline-flex items-center gap-3">
            Check Competitor Prices Now <ArrowRight className="w-5 h-5" />
          </button>

          {/* ICP Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mt-12">
            {[
              { type: "New Seller", msg: "Set a launch price with data check the Buy Box zone before you go live, not after your first week of zero sales.", cta: "Start Free →", href: "/signup" },
              { type: "Growing Seller", msg: "Stop repricing after losing sales. Get daily pricing alerts and WhatsApp notifications on the Growth Plan.", cta: "Try Growth Plan →", href: "/signup?plan=growth" },
              { type: "Agency", msg: "Run live competitor price checks in client strategy sessions show the Buy Box zone in real time before recommending a repricing strategy.", cta: "Book Demo →", href: "/about/contact-us" },
            ].map((icp, i) => (
              <div key={i} className="bg-white/15 border border-white/30 rounded-2xl p-6 text-left backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-white/65 mb-2">{icp.type}</p>
                <p className="text-sm text-white/90 leading-relaxed mb-4">{icp.msg}</p>
                 <a href={icp.href} className="text-sm font-bold text-white border-b border-white/40 hover:border-white pb-0.5 transition-colors">{icp.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-teal-200 dark:border-teal-800 px-4 py-3 shadow-2xl">
        <button onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
          {isLoggedIn ? <><TrendingDown className="w-4 h-4" /> Check Competitor Prices Free</> : <><LogIn className="w-4 h-4" /> Log In to Check Prices</>}
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
 

