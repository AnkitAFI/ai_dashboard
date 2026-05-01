"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, ChevronRight, Check, Zap, TrendingUp, Star, Search, 
  Package, DollarSign, BarChart3, AlertCircle, ArrowRight, CheckCircle2,
  Target, Users, Briefcase, Clock, TrendingDown, MessageCircle, Menu, X,
  Sun, Moon, ArrowLeft, BookOpen, Video, FileText, Bell, ShoppingBag, Store,
  Code, Globe, Trophy,
  Flame,
  Presentation,
  Lightbulb, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

const UseCasesPage = () => {
  const router = useRouter();
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 20); };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add("dark");
    else html.classList.remove("dark");
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

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGetStarted = () => { router.push("/signup"); };
  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };

  // ── Shared DesktopDropdown component ────────────────────────────────────
  const DesktopDropdown = ({
    label, menuKey, accent = "purple",
  }: { label: string; menuKey: keyof NavigationMenu; accent?: "purple" | "orange" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
            isActive
              ? ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold"
              : ac
                ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          }`}
        >
          {label}
          <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
        {isActive && (
          <div
            onMouseLeave={() => setActiveDropdown(null)}
            className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
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

  const useCases = [
    {
      id: 'track-competitor-prices',
      icon: <DollarSign className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Track Competitor Prices',
      category: 'pricing',
      tag: 'Most Common',
      context: 'Common in price-sensitive categories on Amazon and Flipkart',
      problem: 'Know the moment a rival drops price on Amazon.in or Flipkart before your Buy Box rank slides. Get a WhatsApp alert and an AI-suggested reprice in seconds, not days.',
      steps: [
        'Connect ASINs or listings, auto-detect top competitors.',
        'Set alert thresholds, track 5%, 10% or custom price drops.',
        'Get instant alerts, see price changes & AI response price.',
        'Reprice confidently, protect margins above break-even.'
      ],
      roi: [
        { label: 'Weekly loss from late price response (before Insydz)', value: '−₹18,000', neg: true },
        { label: 'Weekly recovery after real-time alerts (with Insydz)', value: '+₹15,500', neg: false },
        { label: 'Monthly net gain', value: '+₹62,000', neg: false },
      ],
      outcomes: ['Marketplace Analytics Software', 'Buy Box tracking'],
      link: '/use-cases/track-competitor-prices',
      learnMore: { text: 'Amazon Price Tracker', href: '/features/competitor-price-tracking-feature' },
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'find-profitable-products',
      icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Find Profitable Products',
      category: 'product',
      tag: 'Popular',
      context: 'Ideal for seasonal & festive sellers launching new SKUs',
      problem: 'Surface high-demand, low-competition SKUs using real Indian marketplace data. The only ecommerce product research tool built for Amazon and Flipkart with margin intelligence',
      steps: [
        'Enter category or keyword, it scans Amazon & Flipkart demand.',
        'See demand vs competition, find high-intent low-competition gaps.',
        'Analyse review gaps, uncover complaints to improve products.',
        'Validate price points, know winning ranges before sourcing.'
      ],
      roi: [
        { label: 'Typical cost of failed product launch (dead inventory + ads)', value: '−₹2,50,000', neg: true },
        { label: 'Data-validated launch with Insydz first month GMV', value: '+₹3,40,000', neg: false },
      ],
      outcomes: ['Ecommerce Product Research Tool', 'Demand Data'],
      link: '/use-cases/find-profitable-products',
      learnMore: { text: 'Ecommerce Product Research Tool', href: '/features/product-research-feature' },
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'improve-amazon-flipkart-seo',
      icon: <Search className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Improve Amazon & Flipkart SEO',
      category: 'seo',
      context: 'Best for high-competition keywords and stagnating listings',
      problem: 'Find buyer-intent keywords your competitors rank for and close the gap. The only amazon seller analytics tool and flipkart seller analytics tool combined: daily rank tracking, keyword gap analysis, and plain-language listing fixes.',
      steps: [
        'Add ASINs or Flipkart listings, daily rank tracking starts instantly.',
        'Get keyword drop alerts, WhatsApp insights with causes.',
        'Receive AI fixes, title, bullets & keyword suggestions.',
        'Track recovery daily, see rankings improve fast.'
      ],
      roi: [
        { label: 'Monthly organic revenue lost during 6-week ranking drop', value: '−₹1,80,000', neg: true },
        { label: 'Organic revenue recovered after AI-guided listing fixes (30 days)', value: '+₹1,80,000', neg: false },
        { label: 'Ad spend saved (no longer compensating for lost organic rank)', value: '+₹42,000/month', neg: false },
      ],
      outcomes: ['Amazon Seller Analytics Tool', 'Flipkart Seller Analytics Tool'],
      link: '/use-cases/improve-seo',
      learnMore: { text: 'Flipkart & Amazon Keyword Rank Tracker', href: '/features/keyword-rank-tracking-feature' },
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analyze-customer-reviews',
      icon: <Star className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Analyse Customer Reviews',
      category: 'product',
      tag: '',
      context: 'Critical for listings with 100+ reviews before product update',
      problem: 'AI reads thousands of reviews across your listings and surfaces complaint patterns before they tank your rating. Insydz is the multi seller marketplace software that turns negative feedback into your next product improvement automatically.',
      steps: [
        'Add your ASIN or competitor, AI scans all reviews in seconds.',
        'See complaint clusters, top issues ranked with examples.',
        'Analyse 5-star reviews, discover what buyers love most.',
        'Get review alerts, notified on new negative trends.'
      ],
      roi: [
        { label: 'Monthly return cost before packaging fix (14% return rate)', value: '−₹28,000', neg: true },
        { label: 'Monthly return savings after fix (5% return rate)', value: '+₹22,400', neg: false },
        { label: 'Rating improvement (4.1 → 4.6) = estimated conversion rate uplift', value: '+₹35,000/month', neg: false },
      ],
      outcomes: ['Multi-Seller Marketplace Software', 'AI Sentiment Analysis'],
      link: '/use-cases/analyze-customer-reviews',
      learnMore: { text: 'AI Review Intelligence', href: '/features/review-analytics-feature' },
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'avoid-stockouts-missed-sales',
      icon: <Package className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Avoid Stockouts & Missed Sales',
      category: 'inventory',
      tag: '',
      context: 'Essential during festive & high-demand sale periods on Amazon & Flipkart',
      problem: 'Insydz models demand spikes — Big Billion Days, Diwali, Republic Day Sale — up to 15 days ahead. Stock, price, and rank for festive keywords before the rush hits and rivals run out.',
      steps: [
        'Track competitor stock, spot early stockouts fast.',
        'Monitor sales velocity, predict days of stock left.',
        'Get demand alerts, detect spikes before sale events.',
        'Plan procurement smartly, order with confidence.'
      ],
      roi: [
        { label: 'Additional revenue from 250 extra units sourced using Insydz demand data', value: '+₹5,20,000', neg: false },
        { label: 'Post-stockout rank recovery cost avoided (ads + lost organic)', value: '+₹45,000', neg: false },
      ],
      outcomes: ['Festive Demand Forecasting', 'Inventory Planning'],
      link: '/use-cases/avoid-stockouts',
      learnMore: { text: 'Inventory Intelligence', href: '/features/product-research-feature' },
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const faqs = [
    { id: 'faq-1', question: 'Can I access multiple use cases on the free plan?', answer: 'Yes. The free plan includes access to core use cases competitor price tracking, basic keyword ranking, and review summaries with no credit card required. Advanced capabilities like price elasticity modelling, deep product research, and full inventory demand signals are available on paid plans.' },
    { id: 'faq-2', question: 'Do these use cases work for Amazon India and Flipkart?', answer: 'Yes. Every Insydz use case is built specifically for Amazon.in and Flipkart. All data is in INR, all competitor tracking covers Indian marketplace categories, and all keyword rankings are tracked on Indian marketplace search not US or global platforms.' },
    { id: 'faq-3', question: 'Are these separate tools or one platform?', answer: 'One platform. All five use cases run inside a single Insydz dashboard. Insights from one use case automatically connect to others. When a competitor stocks out (inventory use case), you\'ll also see their keyword ranking impact (SEO use case) in the same view.' },
    { id: 'faq-4', question: 'Which use case should I start with?', answer: 'New sellers: Find Profitable Products. Active sellers in competitive categories: Track Competitor Prices. Stagnating listings with unexplained sales drops: Improve SEO and Analyse Reviews ranking slippage and review quality deterioration are the two most common hidden causes.' },
    { id: 'faq-5', question: 'Can agencies use these use cases for clients?', answer: 'Yes. Insydz\'s agency plan lets you run all five use cases across multiple client accounts from one dashboard. Each client gets their own workspace with full use case access. White-label reports covering all active use cases can be generated per client in one click.' },
    { id: 'faq-6', question: 'Which use case gives the fastest ROI?', answer: 'Track Competitor Prices typically delivers the fastest measurable ROI often within the first week. For new sellers, Find Profitable Products delivers the highest long-term ROI by preventing costly launch mistakes. Review Analysis often delivers the most surprising ROI sellers frequently discover hidden product issues costing thousands in returns monthly.' },
    { id: 'faq-7', question: 'Do I need to use all use cases together?', answer: 'No. Start with one use case that solves your most urgent problem today. Most sellers begin with competitor price tracking or product research, then expand to SEO and review analysis as their business grows. Insydz is designed to start simple and scale with you.' }
  ];

  function scrollToSection(arg0: string) {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      

      {/* ══ NAV ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background dark:bg-gray-900/80 backdrop-blur-none"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-1 group">
            <div className="relative">
              <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
          </a>
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" accent="orange" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</Link>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Link href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Link>
              <button className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile right controls */}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Home
              </a>
              {(["Solutions","Use Cases","Features","Free Tools","Compare","Resources","About"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${menu === 'Use Cases' ? 'text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-3 sm:ml-4 mt-0.5 space-y-0.5">
                      {(navigationMenu[menu as keyof NavigationMenu] as MenuItemWithBadge[]).map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg ${menu === 'Use Cases' ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
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
                <span className="text-xs sm:text-sm font-medium text-orange-700">Ecommerce Seller Analytics Software </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                How Sellers Use Insydz
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  to Make Better
                </span>
                <br />
                Decisions.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most trusted <strong>ecommerce seller analytics software</strong> built around how sellers actually think. From tracking competitor prices to preventing festive season stockouts, Insydz solves real, everyday marketplace problems.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
                  Start Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('use-cases-grid')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Use case cards */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-2 sm:space-y-3">
                {[
                  { icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Track Competitor Prices', sub: 'Real-time alerts • Margin protection', color: 'from-orange-500 to-red-500' },
                  { icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Find Profitable Products', sub: 'Demand analysis • Low competition', color: 'from-blue-500 to-cyan-500' },
                  { icon: <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Improve SEO Rankings', sub: 'Keyword tracking • Listing optimisation', color: 'from-purple-500 to-pink-500' },
                  { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Analyse Customer Reviews', sub: 'AI sentiment • Product insights', color: 'from-yellow-500 to-orange-500' },
                  { icon: <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Avoid Stockouts & Missed Sales', sub: 'Demand signals • Inventory planning', color: 'from-green-500 to-emerald-500' },
                ].map((card, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 sm:p-3 hover:shadow-md transition-all">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center flex-shrink-0`}>{card.icon}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{card.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.sub}</p>
                    </div>
                  </div>
                ))}
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm">5 Use Cases</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PAIN POINTS ══ */}
      <section className="pt-8 pb-18 sm:pt-10 sm:pb-12 lg:pt-10 lg:pb-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Different Problems.
              <br />
              <span className="text-orange-600 dark:text-orange-500">One Intelligence Platform.</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Indian sellers don't wake up thinking 'I need marketplace analytics software.' They wake up with specific and urgent problems. Insydz is designed around those problems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitors change prices without warning and steal your sales rank", desc: "", color: "from-orange-500 to-red-500" },
              { icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Reviews hide critical product issues that cost you ratings and returns", desc: "", color: "from-purple-500 to-pink-500" },
              { icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Products don't rank for the right keywords and traffic disappears", desc: "", color: "from-blue-500 to-cyan-500" },
              { icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Stockouts happen during peak demand right when you need inventory most", desc: "", color: "from-green-500 to-emerald-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{pain.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{pain.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sellers don't wake up looking for <span className="text-orange-600 dark:text-orange-500">"features."</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg">
              They look for answers to specific problems. Insydz is designed around how Indian sellers actually think and operate.
            </p>
          </div>
        </div>
      </section>

      {/* ══ USE CASES GRID ══ */}
      <section id="use-cases-grid" className="pt-6 pb-12 sm:pt-6 sm:pb-16 lg:pt-10 lg:pb-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Explore All
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Seller Use Cases</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {useCases.map((uc) => (
              <div key={uc.id} id={uc.category} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 hover:border-orange-400 hover:shadow-xl transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${uc.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>{uc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{uc.title}</h3>
                        {uc.tag && <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex-shrink-0">{uc.tag}</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">{uc.context}</p>
                    </div>
                  </div>
                </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{uc.problem}</p>
                  </div>

                {/* Steps */}
                <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">Step-by-Step with Insydz</p>
                  <div className="grid sm:grid-cols-1 gap-2 sm:gap-3">
                    {uc.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3">
                        <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${uc.color} text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5`}>{i + 1}</span>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outcomes */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {uc.outcomes.map((outcome, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 
                      bg-gradient-to-r from-green-50 to-emerald-50 
                      dark:from-green-900/20 dark:to-emerald-900/20 
                      border border-green-300 dark:border-green-700 
                      text-green-700 dark:text-green-400 
                      rounded-lg sm:rounded-xl 
                      text-[12px] sm:text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> 
                      {outcome}
                    </span>
                  ))}
                </div>

                {/* Expandable */}
                  <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                    <Link href={uc.link}>
                      <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold py-4 sm:py-5 px-5 sm:px-7 rounded-xl group text-sm sm:text-base w-full sm:w-auto">
                        Deep Dive: {uc.title}
                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHERE TO START ══ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Not Sure Which
              <br />
              <span className="text-orange-600 dark:text-orange-500">Use Case to Start With?</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Here's what we recommend based on where you are in your seller journey:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              { icon: <TrendingUp className="w-6 h-6 sm:w-10 sm:h-10" />, title: "New Sellers", tag: "Start with Find Profitable Products", desc: "Launch with data, not guesswork. Avoid costly inventory mistakes before they happen. Know your market before you invest your first rupee in stock.", link: "/use-cases/find-profitable-products", color: "from-blue-500 to-cyan-500" },
              { icon: <DollarSign className="w-6 h-6 sm:w-10 sm:h-10" />, title: "Active Sellers", tag: "Start with Track Competitor Prices", desc: "Protect margins and respond to market changes instantly. If you're doing ₹5L+ a month, every pricing lag is costing you measurable revenue.", link: "/use-cases/track-competitor-prices", color: "from-orange-500 to-red-500" },
              { icon: <Search className="w-6 h-6 sm:w-10 sm:h-10" />, title: "Struggling Listings", tag: "Start with Improve SEO & Analyse Reviews", desc: "Boost visibility and fix what's silently hurting conversion. If sales have dropped without obvious cause rankings and reviews are the first places to look.", link: "/use-cases/improve-seo", color: "from-purple-500 to-pink-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 hover:border-orange-400 hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-lg`}>{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">{item.tag}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm">{item.desc}</p>
                <Link href={item.link}>
                  <Button variant="ghost" className="text-orange-600 dark:text-orange-500 hover:text-orange-700 font-semibold p-0 h-auto group text-sm">
                    Explore This Use Case <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
              Start Free &amp; Explore
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ BETTER TOGETHER ══ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Use Cases That
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Work Better Together</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Most sellers face more than one problem at the same time. Insydz connects insights across use cases so decisions are faster and more complete.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { from: { icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Profitable product" }, to: { icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Price tracking" }, desc: "Launch smart, then immediately protect with competitor price tracking", gradient: "from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20", border: "border-blue-200 dark:border-blue-700" },
              { from: { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Review issues" }, to: { icon: <Search className="w-5 h-5 sm:w-6 sm:h-6" />, text: "SEO & listing fixes" }, desc: "Fix product problems, then push improved listing up search rankings", gradient: "from-yellow-50 to-purple-50 dark:from-yellow-900/20 dark:to-purple-900/20", border: "border-yellow-200 dark:border-yellow-700" },
              { from: { icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Demand spike" }, to: { icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Inventory planning" }, desc: "Detect unusual demand signals early, adjust procurement before lead times run out", gradient: "from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20", border: "border-green-200 dark:border-green-700" }
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.gradient} border-2 ${item.border} rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all`}>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-md">{item.from.icon}</div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-md">{item.to.icon}</div>
                </div>
                <p className="text-gray-900 dark:text-white font-bold text-center mb-2 text-sm sm:text-base">{item.from.text} → {item.to.text}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IS INSYDZ RIGHT FOR YOU ══ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 sm:mb-12 text-center text-gray-900 dark:text-white">
            Is Insydz <span className="text-orange-600 dark:text-orange-500">Right for You?</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <Check className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Best For</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {['Active Amazon India or Flipkart marketplace sellers','Sellers in competitive price-sensitive categories','Sellers making or wanting to make data-driven decisions','Sellers doing ₹2L+ monthly who want to protect margins','D2C brands launching new products on Indian marketplaces','Agencies managing multiple Amazon/Flipkart seller clients','Brand managers tracking category market share in INR'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Not Ideal For</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {['One-time sellers with a single product and no growth plan','Non-ecommerce businesses with no marketplace presence','Sellers whose primary challenge is logistics, not intelligence'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0 text-base sm:text-lg">•</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 sm:mb-12 text-center text-gray-900 dark:text-white">
            Use Cases <span className="text-orange-600 dark:text-orange-500">FAQs</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 transition-all">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg">{faq.question}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-3 sm:pt-4 text-sm sm:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">Solve Real Seller Problems with Insydz</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">For New Sellers</h3>
              <p className="text-xs font-semibold text-orange-600 mb-2 sm:mb-3">Free Plan</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Start with one use case. Setup in 2 minutes. Begin with Find Profitable Products and launch your next product with data, not guesswork.</p>
              <br /><Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-full text-sm">Start Free →</Button>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 border-2 border-orange-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all relative overflow-hidden">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 sm:px-3 py-1 rounded-full">Most Popular</div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-background opacity-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">For Growing Sellers</h3>
              <p className="text-xs font-semibold text-orange-100 mb-2 sm:mb-3">Growth Plan</p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Managing ₹5L–₹50L monthly? Activate all 5 use cases with full tracking, WhatsApp alerts, AI recommendations, and daily reporting.</p>
              <br /><Link href="/pricing" className="w-full bg-white hover:bg-gray-100 text-orange-700 font-bold rounded-full text-sm inline-block text-center py-2 px-4">Try Growth Plan →</Link>
            </div>

            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">For Agencies</h3>
              <p className="text-xs font-semibold text-purple-600 mb-2 sm:mb-3">Agency Demo</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">Managing multiple client accounts? Run all use cases across every client from one dashboard with white-label reporting.</p>
              <br /><Link href="/solutions/ecommerce-agencies" className="w-full border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold rounded-full text-sm inline-block text-center py-2 px-4">Book a Demo →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-orange-500 via-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white">
            Solve Real Seller Problems
            <br />
            <span className="text-orange-100">with Insydz</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            Start with one use case. Expand as you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group">
              Start Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={() => document.getElementById('use-cases-grid')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full border-2 border-orange-400">
              Explore All Use Cases →
            </Button>
          </div>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 2 minutes &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

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
 
export default UseCasesPage;

