import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  TrendingDown, ArrowRight, Target, Zap, Bell, TrendingUp,
  MessageCircle, Search, Package, BarChart3, ShoppingBag,
  Menu, X, Sun, Moon, ChevronDown, Store, Briefcase, Users,
  Code, Globe, Trophy, BookOpen, Video, FileText,
  RefreshCw, MessageSquare, BarChart2, ArrowUpRight, XCircle,
  CheckCircle2, Layers, Cpu, Sparkles, Calendar, Network,
  Flame, Mail, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
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

export default function OurVisionPage() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const toggleMobileMenu = (menuName: string) => setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const scrollToSection = (sectionId: string) => {
    setLocation('/');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/about/our-vision" />
        <title>Building the Intelligence Layer for Indian E-commerce</title>
        <meta name="description" content="INSYDZ exists to help Indian sellers make smarter, faster, and more confident decisions using real marketplace data." />
      </Helmet>
      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setLocation('/')}>
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Insydz</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2" ref={dropdownRef}>
              {(["Solutions", "Use Cases", "Features", "Pricing", "Free Tools", "Compare", "Resources"] as const).map((menu) => (
                 menu === "Pricing" ? (
    <button
      key={menu}
      onClick={() => setLocation('/pricing')}
      onMouseEnter={() => setActiveDropdown(null)}
      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all"
    >
      Pricing
    </button>
  ) : (
    <div key={menu} className="relative">
      <button
        onMouseEnter={() => setActiveDropdown(menu)}
        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all flex items-center gap-1"
      >
        {menu}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            activeDropdown === menu ? 'rotate-180' : ''
          }`}
        />
      </button>

      {activeDropdown === menu && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
        >
          {(navigationMenu[menu as keyof NavigationMenu] as MenuItemWithBadge[]).map((item, i) => (
            <button
              key={i}
              onClick={() => handleMenuItemClick(item)}
              className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group"
            >
              <span className="text-orange-500 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 flex-1">
                {item.name}
              </span>
              {item.badge && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
))}
              {/* About Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('About')}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  About
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'About' && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu.About.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleMenuItemClick(item)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
                      >
                        <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleGetStarted} onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition-all transform hover:scale-105">Login</Button>
              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
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
            <div className="px-4 py-4 space-y-3">
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 rounded-lg font-medium">
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[menu as keyof NavigationMenu] as MenuItemWithBadge[]).map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile About */}
              <div>
                <button
                  onClick={() => toggleMobileMenu('About')}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  About
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'About' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.About.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleMenuItemClick(item)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      >
                        {item.icon}
                        {item.name}
                        {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setLocation('/pricing')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-medium">Pricing</button>
              <Button onClick={handleGetStarted} className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white">Login</Button>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO  (bg: white)
      ══════════════════════════════════════════ */}
      <section className="relative pt-36 pb-24 px-4 bg-white dark:bg-gray-950 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 border border-orange-300 bg-orange-50 dark:bg-orange-900/20 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Our Vision</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] text-gray-900 dark:text-white tracking-tight">
                Building the Intelligence Layer for
                <span className="block mt-2 text-orange-500"> Indian E-commerce</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl font-light">
                INSYDZ exists to help Indian sellers make smarter, faster, and more confident decisions using real marketplace data.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button onClick={handleGetStarted} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-base rounded-full shadow-xl hover:shadow-orange-400/40 transition-all group">
                  👉 Start Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => setLocation('/solutions')} size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 font-semibold px-8 py-6 text-base rounded-full transition-all">
                  Explore Solutions →
                </Button>
              </div>
            </div>

            {/* Right: Abstract Dashboard Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-80">
                {/* Central INSYDZ node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-300 z-10">
                  <span className="text-white font-black text-xs text-center leading-tight">IN<br />SYDZ</span>
                </div>

                {/* Marketplace nodes */}
                {[
                  { label: "Amazon", bg: "bg-yellow-400", top: "top-4", left: "left-8" },
                  { label: "Flipkart", bg: "bg-blue-500", top: "top-4", right: "right-8" },
                  { label: "Shopify", bg: "bg-green-500", bottom: "bottom-4", right: "right-8" },
                ].map((node, i) => (
                  <div key={i} className={`absolute ${node.top || ''} ${node.bottom || ''} ${node.left || ''} ${node.right || ''} ${node.bg} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-[9px] font-bold text-center leading-tight px-1">{node.label}</span>
                  </div>
                ))}

                {/* SVG network lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
                  <line x1="56" y1="56" x2="200" y2="150" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
                  <line x1="344" y1="56" x2="200" y2="150" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
                  <line x1="56" y1="244" x2="200" y2="150" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
                  <line x1="344" y1="244" x2="200" y2="150" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
                  <circle cx="200" cy="150" r="55" stroke="#f97316" strokeWidth="1" opacity="0.15" strokeDasharray="4 3" />
                  <circle cx="200" cy="150" r="85" stroke="#f97316" strokeWidth="1" opacity="0.1" strokeDasharray="4 3" />
                </svg>

                {/* Mini metric chips */}
                <div className="absolute top-1/3 right-0 bg-white dark:bg-gray-800 border border-orange-200 rounded-xl px-3 py-2 shadow-lg">
                  <p className="text-xs text-gray-500">Price Alert</p>
                  <p className="text-sm font-bold text-orange-500">↓ 12%</p>
                </div>
                <div className="absolute bottom-1/3 left-0 bg-white dark:bg-gray-800 border border-orange-200 rounded-xl px-3 py-2 shadow-lg">
                  <p className="text-xs text-gray-500">Rank</p>
                  <p className="text-sm font-bold text-green-600">#3 ↑</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — WHO WE ARE  (bg: light grey)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#f7f7f7] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-7">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Who We Are</h2>
              </div>
              <div className="w-12 h-0.5 bg-orange-400"></div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                INSYDZ is an AI-powered e-commerce intelligence platform built specifically for Indian marketplace sellers — on Amazon, Flipkart.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                We don't adapt global tools. We build for Indian pricing dynamics, Indian competition patterns, and Indian seller workflows from the ground up.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { stat: "250K+", label: "Reviews Analyzed" },
                  { stat: "24/7", label: "Real-Time Tracking" },
                  { stat: "2+", label: "Platforms Supported" },
                  { stat: "₹1999", label: "Starting Price/Month" },
                ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="text-2xl font-black text-orange-500">{item.stat}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Abstract Data Intelligence Graphic */}
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl">
              <div className="space-y-4">
                {/* Chart bars */}
                <div className="flex items-end gap-2 h-28">
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all" style={{ height: `${h}%`, background: i % 2 === 0 ? '#f97316' : '#fed7aa', opacity: 0.85 }}></div>
                  ))}
                </div>
                <div className="h-0.5 bg-gray-100 dark:bg-gray-700 w-full"></div>

                {/* Signal waves */}
                <svg viewBox="0 0 300 50" className="w-full h-12">
                  <path d="M0 25 Q37.5 5 75 25 T150 25 T225 25 T300 25" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M0 35 Q37.5 15 75 35 T150 35 T225 35 T300 35" stroke="#fed7aa" strokeWidth="1.5" fill="none" opacity="0.5" />
                </svg>

                {/* Connected nodes */}
                <div className="flex items-center justify-between pt-2">
                  {["Price", "Review", "Rank", "Trend", "Alert"].map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ${i % 2 === 0 ? 'bg-orange-500' : 'bg-orange-300'}`}>{label[0]}</div>
                      <span className="text-[9px] text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Label */}
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Live Intelligence</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — THE PROBLEM  (bg: white)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">The Problem with Selling Blind</h2>
          </div>
          <div className="w-12 h-0.5 bg-orange-400 mb-8"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                Most Indian marketplace sellers operate without structured intelligence. Decisions are driven by guesswork, price wars, and reactive strategies.
              </p>
              <div className="space-y-3">
                {[
                  "Launching products without demand validation",
                  "Competing only on price",
                  "Ignoring review insights",
                  "Relying on spreadsheets",
                  "Using global tools not built for India",
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-8 flex flex-col justify-center min-h-56">
              <p className="text-3xl lg:text-4xl font-black text-white leading-snug">
                We believe Indian sellers deserve <span className="text-orange-400">better.</span>
              </p>
              <p className="text-gray-400 mt-4 text-base">Intelligence shouldn't be a privilege for large enterprises or foreign markets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — OUR CORE BELIEF  (bg: light grey)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#f7f7f7] dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">We Believe Intelligence Should Be Accessible</h2>
          </div>
          <div className="w-12 h-0.5 bg-orange-400 mb-8"></div>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
            E-commerce intelligence should not be expensive, overwhelming, or designed only for global enterprises.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <CheckCircle2 className="w-6 h-6" />, title: "Affordable", desc: "For growing sellers at every stage", color: "from-green-500 to-emerald-500" },
              { icon: <Store className="w-6 h-6" />, title: "India-Built", desc: "For Indian marketplace dynamics", color: "from-orange-500 to-orange-600" },
              { icon: <Zap className="w-6 h-6" />, title: "Actionable", desc: "Not just analytical — tells you what to do", color: "from-yellow-500 to-orange-500" },
              { icon: <Layers className="w-6 h-6" />, title: "Clear Design", desc: "Designed for clarity, not complexity", color: "from-blue-500 to-cyan-500" },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group cursor-default">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — OUR VISION MANIFESTO  (bg: white)
      ══════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">Our Long-Term Vision</span>
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent mx-auto mb-10"></div>

          <blockquote className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
            To become the{" "}
            <span className="text-orange-500">intelligence backbone</span>{" "}
            for Indian marketplace sellers — powering pricing decisions, product research, review analysis, seasonal planning, and competitor tracking across platforms.
          </blockquote>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent mx-auto mt-10 mb-8"></div>

          <p className="text-xl text-gray-500 dark:text-gray-400 font-light italic max-w-2xl mx-auto">
            We envision a future where every serious Indian seller operates with structured intelligence — not intuition.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — INDIA-FIRST  (bg: light grey)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#f7f7f7] dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Built for India, Not Adapted for India</h2>
          </div>
          <div className="w-12 h-0.5 bg-orange-400 mb-10"></div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              { icon: <ShoppingBag className="w-5 h-5" />, text: "Supports Amazon, Flipkart" },
              { icon: <span className="text-base font-black">₹</span>, text: "₹ pricing model — no USD conversion" },
              { icon: <MessageCircle className="w-5 h-5" />, text: "WhatsApp-first alert behavior" },
              { icon: <BarChart2 className="w-5 h-5" />, text: "Designed for Indian competition dynamics" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-orange-400 transition-all">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl px-8 py-5 inline-block">
            <p className="text-white font-bold text-lg">🇮🇳 India is not a secondary market. It is our primary focus.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — WHAT WE ARE NOT  (bg: white)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">What INSYDZ Is Not</h2>
          </div>
          <div className="w-12 h-0.5 bg-orange-400 mb-10"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-snug mb-4">
                We are intentional about what we don't build.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Clarity of purpose matters. Knowing what we're not helps us stay focused on what we are — and it helps sellers know exactly what to expect.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Not a global tool clone",
                "Not an analytics dashboard for vanity metrics",
                "Not built only for large enterprises",
                "Not a tool that overwhelms sellers with data",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 border-2 border-red-200 dark:border-red-800 rounded-xl px-4 py-3 hover:border-red-400 transition-colors">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — WHAT WE'RE BUILDING  (bg: light grey)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#f7f7f7] dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">What We're Building</h2>
          </div>
          <div className="w-12 h-0.5 bg-orange-400 mb-8"></div>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-10 max-w-2xl">
            A seller intelligence brain — one that helps Indian sellers make the right decisions at the right time.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "AI Recommendations", desc: "Not just data — specific actions to take next", color: "from-yellow-500 to-orange-500" },
              { icon: <Bell className="w-6 h-6" />, title: "Real-Time Alerts", desc: "WhatsApp notifications the moment something changes", color: "from-green-500 to-emerald-500" },
              { icon: <BarChart2 className="w-6 h-6" />, title: "Marketplace Insights", desc: "Deep data from Amazon, Flipkart", color: "from-blue-500 to-cyan-500" },
              { icon: <Calendar className="w-6 h-6" />, title: "Festive Trend Intelligence", desc: "Plan ahead for Diwali, Big Billion Days, and more", color: "from-purple-500 to-pink-500" },
              { icon: <Network className="w-6 h-6" />, title: "Multi-Platform Intelligence", desc: "One dashboard across all your marketplaces", color: "from-orange-500 to-red-500" },
              { icon: <MessageCircle className="w-6 h-6" />, title: "Review Analytics", desc: "Understand what customers actually say and feel", color: "from-pink-500 to-rose-500" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all group cursor-default">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 9 — COMMITMENT  (bg: white)
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mb-12"></div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">A Long-Term Commitment to Indian Sellers</h2>
          </div>
          <div className="w-12 h-0.5 bg-orange-400 mb-8"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              INSYDZ is not a short-term product experiment. We are building infrastructure for Indian e-commerce growth — for the long haul.
            </p>

            <div className="space-y-5">
              {[
                { icon: <RefreshCw className="w-5 h-5 text-orange-500" />, text: "Continuous improvement of our AI and data models" },
                { icon: <MessageSquare className="w-5 h-5 text-orange-500" />, text: "Listening to sellers and building what they actually need" },
                { icon: <TrendingUp className="w-5 h-5 text-orange-500" />, text: "Expanding platform support beyond current marketplaces" },
                { icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />, text: "Improving affordability as we grow" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 last:border-0">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 10 — FINAL STATEMENT
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#f7f7f7] dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Smarter Sellers Build <span className="text-orange-500">Stronger Brands</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            When sellers operate with intelligence instead of guesswork, they compete better, scale faster, and build sustainable businesses.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA  (light orange bg)
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-orange-50 dark:bg-orange-900/10 border-t border-orange-200 dark:border-orange-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ArrowUpRight className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Join the Next Generation of Data-Driven Sellers
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">No credit card required.</p>
          <Button onClick={handleGetStarted} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-12 py-7 text-lg rounded-full shadow-2xl hover:shadow-orange-400/40 transition-all group">
            👉 Start Free with INSYDZ
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      
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
 
