"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Menu, X, Facebook, Twitter, Instagram, BarChart3, Zap, Shield, Mail, Phone, MapPin, Check, Crown, Building2, Sun, Moon, Trophy, Target, DollarSign, Globe, BookOpen, Video, FileText, Users, Presentation, Linkedin, ChevronDown, ShoppingBag, TrendingDown, MessageCircle, Search, Package, Bell, Code, BarChart, Briefcase, Store, ShoppingCart, Flame, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";


// Define types for menu items
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
    { name: "All Use Cases", icon: <TrendingDown className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices", icon: <TrendingDown className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <DollarSign className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
    ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer", icon: <BarChart className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <DollarSign className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
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

export default function LandingContent() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handlePlanSelect = (planId: string) => {
    router.push("/login");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
      setActiveDropdown(null);
    }
  };

  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };

  // ─── SEO helper: dropdown items rendered as <Link> so crawlers follow them ───
  const DropdownItem = ({ item }: { item: MenuItemWithBadge }) => {
    if (!item.route) {
      return (
        <span className="w-full px-4 py-3 flex items-center gap-3 text-gray-400 cursor-default">
          <span className="text-purple-400">{item.icon}</span>
          <span className="text-sm flex-1">{item.name}</span>
          {item.badge && (
            <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">
              {item.badge}
            </span>
          )}
        </span>
      );
    }
    return (
      <Link href={item.route}
        onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
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
      </Link>
    );
  };

  // Mobile dropdown item — same anchor-based approach
  const MobileDropdownItem = ({ item }: { item: MenuItemWithBadge }) => {
    if (!item.route) {
      return (
        <span className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-500 cursor-default">
          {item.icon}
          {item.name}
          {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
        </span>
      );
    }
    return (
      <Link href={item.route}
        onClick={() => { setIsMenuOpen(false); setMobileActiveMenu(null); }}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
      >
        {item.icon}
        {item.name}
        {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-background dark:to-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* ── Logo: <a> so crawlers pick up the homepage link ── */}
            <Link href="/" className="flex items-center space-x-3 group" aria-label="Insydz – Home">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Insydz Logo" 
                  className="w-10 h-auto shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Insydz
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>

              {/* Solutions Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Solutions')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'Solutions'}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Solutions
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Solutions' && (
                  <div 
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu.Solutions.map((item, i) => (
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Use Cases Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Use Cases')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'Use Cases'}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Use Cases
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Use Cases' && (
                  <div 
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["Use Cases"].map((item, i) => (
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Features Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Features')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'Features'}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Features
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div 
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu.Features.map((item, i) => (
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              <Link 
                href="/pricing"
                onMouseEnter={() => setActiveDropdown(null)}
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Pricing
              </Link>

              {/* Free Tools Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Free Tools')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'Free Tools'}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Free Tools
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Free Tools' && (
                  <div 
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["Free Tools"].map((item, i) => (
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Compare Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Compare')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'Compare'}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Compare
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div 
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu.Compare.map((item, i) => (
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Resources')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'Resources'}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Resources
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div 
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu.Resources.map((item, i) => (
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* About Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('About')}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'About'}
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
                      <DropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/login"
                onMouseEnter={() => setActiveDropdown(null)}
                className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Login
              </Link>
              
              <button 
                className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-800"/>}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              {/* ── Home: scroll-to anchor for UX, real href for crawlers ── */}
              <Link
                href="/"
                onClick={(e) => { e.preventDefault(); scrollToSection('Home'); }}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
              >
                Home
              </Link>

              {/* Mobile Solutions */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Solutions')}
                  aria-expanded={mobileActiveMenu === 'Solutions'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Solutions
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Solutions' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Solutions.map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Use Cases */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Use Cases')}
                  aria-expanded={mobileActiveMenu === 'Use Cases'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Use Cases
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Use Cases' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu["Use Cases"].map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Features */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Features')}
                  aria-expanded={mobileActiveMenu === 'Features'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Features
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Features' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Features.map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
              >
                Pricing
              </Link>

              {/* Mobile Free Tools */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Free Tools')}
                  aria-expanded={mobileActiveMenu === 'Free Tools'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Free Tools
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Free Tools' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu["Free Tools"].map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Integrations */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Integrations')}
                  aria-expanded={mobileActiveMenu === 'Integrations'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Integrations
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Integrations' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Integrations' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Integrations.map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Compare */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Compare')}
                  aria-expanded={mobileActiveMenu === 'Compare'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Compare
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Compare' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Compare.map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Resources */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('Resources')}
                  aria-expanded={mobileActiveMenu === 'Resources'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  Resources
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Resources' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Resources.map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile About */}
              <div>
                <button 
                  onClick={() => toggleMobileMenu('About')}
                  aria-expanded={mobileActiveMenu === 'About'}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  About
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'About' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.About.map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full mt-2 text-center bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-5 py-2 rounded-full"
              >
                Login
              </Link>
              
              <button 
                className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full flex justify-center items-center"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-800"/>}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="Home"
        className="relative min-h-screen flex items-center justify-center pt-32 lg:pt-40 pb-16 lg:pb-24 bg-gradient-to-br from-purple-50/40 via-white to-pink-50/20 dark:from-gray-900 dark:via-background dark:to-gray-900 overflow-hidden"
      >
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col space-y-6 text-left mt-4 lg:mt-0">
              {/* Pill */}
              <div className="inline-flex w-max items-center px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold shadow-sm">
                AI Ecommerce Analytical Software for Indian Sellers
              </div>

              {/* Platforms */}
              <div className="flex items-center space-x-3 text-sm text-gray-500 font-medium">
                <span>Works with</span>
                <span className="px-3 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100 font-semibold">Amazon India</span>
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-semibold">Flipkart</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
                <span className="text-6xl block mb-2 text-gray-900">Stop Guessing.</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text leading-tight text-transparent block mb-2">Make Selling</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block mb-2">Decisions</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">Better & Faster</span>
              </h1>

              {/* Paragraphs */}
              <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg max-w-xl">
                <p>
                  Insydz helps Amazon and Flipkart sellers understand their data and grow their business. No more guessing what works. Get clear insights and take action with confidence.
                </p>
                <p>
                  Our <span className="font-semibold text-gray-900 dark:text-white">seller analytics platform</span> shows you exactly which products are making money, what your competitors are doing, and where you are losing sales.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login"
                  className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-colors shadow-lg hover:shadow-purple-500/25"
                >
                  Start Free. No Card Needed.
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 mt-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5,000+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Sellers trust Insydz</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2.5 Lakh+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Reviews analysed</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Live market data</div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Mockup */}
            <div className="relative w-full max-w-xl mx-auto lg:ml-auto xl:max-w-2xl mt-12 lg:mt-0 lg:pl-10 hidden lg:block">
              {/* Floating elements */}
              <div className="absolute -top-6 -right-2 sm:-right-6 z-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl shadow-purple-500/30 animate-bounce" style={{ animationDuration: '3s' }}>
                Sales up 18% this week
              </div>
              
              <div className="absolute -bottom-6 -left-2 sm:-left-6 z-20 bg-white border border-purple-200 text-purple-600 text-sm font-bold px-5 py-4 rounded-2xl shadow-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <span className="block text-gray-900 mb-1">Competitor dropped price</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">on 3 of your products</span>
              </div>

              {/* Browser Window Mockup */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {/* Browser Header */}
                <div className="bg-[#1C1C28] px-4 py-4 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto bg-background opacity-100 rounded-md px-4 py-1.5 text-xs text-white/50 w-64 text-center truncate font-medium">
                    insydz.com/dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Good morning, Rahul</h3>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">22 Apr 2026</div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Revenue Today</div>
                      <div className="font-extrabold text-2xl text-gray-900 dark:text-white">₹48,200</div>
                      <div className="text-xs text-green-500 mt-2 font-bold">+12% vs yesterday</div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Orders</div>
                      <div className="font-extrabold text-2xl text-gray-900 dark:text-white">143</div>
                      <div className="text-xs text-green-500 mt-2 font-bold">+8 orders</div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Returns</div>
                      <div className="font-extrabold text-2xl text-gray-900 dark:text-white">4</div>
                      <div className="text-xs text-red-500 mt-2 font-bold">Review needed</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-white dark:bg-gray-900">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-semibold">Weekly Sales on Amazon India</div>
                    <div className="flex items-end gap-3 h-28">
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[30%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[40%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[35%]"></div>
                      <div className="flex-1 bg-purple-100 dark:bg-purple-900/40 rounded-t-md h-[60%]"></div>
                      <div className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-md h-[90%] relative"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[50%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[70%]"></div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-900/5 rounded-2xl p-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-purple-600 font-bold text-left">
                          <th className="pb-4 uppercase tracking-wider text-xs">Product</th>
                          <th className="pb-4 uppercase tracking-wider text-xs">Price</th>
                          <th className="pb-4 uppercase tracking-wider text-xs">Profit</th>
                          <th className="pb-4 uppercase tracking-wider text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 dark:text-gray-300">
                        <tr className="border-b border-purple-100/50 dark:border-purple-900/20 last:border-0">
                          <td className="py-3 font-semibold text-xs sm:text-sm">Steel Water Bottle</td>
                          <td className="py-3 text-xs sm:text-sm">₹749</td>
                          <td className="py-3 text-xs sm:text-sm">₹82</td>
                          <td className="py-3"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">Trending</span></td>
                        </tr>
                        <tr className="border-b border-purple-100/50 dark:border-purple-900/20 last:border-0">
                          <td className="py-3 font-semibold text-xs sm:text-sm">Yoga Mat 6mm</td>
                          <td className="py-3 text-xs sm:text-sm">₹599</td>
                          <td className="py-3 text-xs sm:text-sm">₹41</td>
                          <td className="py-3"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">Review</span></td>
                        </tr>
                        <tr className="border-b border-purple-100/50 dark:border-purple-900/20 last:border-0">
                          <td className="py-3 font-semibold text-xs sm:text-sm">Phone Stand Desk</td>
                          <td className="py-3 text-xs sm:text-sm">₹199</td>
                          <td className="py-3 text-xs sm:text-sm">₹12</td>
                          <td className="py-3"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">Low Margin</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section id="" className="py-24 bg-gradient-to-br from-white-50 to-white-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Built for Every E-commerce Growth Team
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Whether you're a solo Amazon seller or managing a portfolio of brands, Insydz is the marketplace analytics software that adapts to your needs. 
            </p>
          </div>

          {/* Comparison Cards — each card links to its solution page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Amazon Sellers */}
            <Link href="/solutions/amazon-sellers" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Amazon Seller</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Win Buy Box, optimize keywords & pricing with AI-powered intelligence</span>
                </li>
              </ul>
            </Link>

            {/* Flipkart Sellers */}
            <Link href="/solutions/flipkart-sellers" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Flipkart Sellers</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Track competitors & reviews effortlessly never get blindsided before Big Billion Days</span>
                </li>
              </ul>
            </Link>

            {/* E-commerce Agencies */}
            <Link href="/solutions/ecommerce-agencies" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">E-commerce Agencies</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Manage multiple clients with clarity prepare client reports in one click</span>
                </li>
              </ul>
            </Link>

            {/* Brand Managers */}
            <Link href="/solutions/brand-managers" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Brand Managers</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Make confident data-backed decisions present real intelligence to leadership</span>
                </li>
              </ul>
            </Link>
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section id="Compare" className="py-24 bg-gradient-to-br from-pink-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Indian Sellers Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover how Insydz outperforms the competition across key metrics, from real time listing intelligence to competitor tracking, built specifically for Indian marketplaces.
            </p>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {[
              { icon: <Target className="w-8 h-8" />, text: "Streamlined UX", color: "from-blue-500 to-blue-600" },
              { icon: <Zap className="w-8 h-8" />, text: "Superior AI Intelligence", color: "from-purple-500 to-purple-600" },
              { icon: <DollarSign className="w-8 h-8" />, text: "Exceptional Value", color: "from-green-500 to-green-600" },
              { icon: <Globe className="w-8 h-8" />, text: "India-First Expertise", color: "from-orange-500 to-orange-600" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white`}>
                  {item.icon}
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Insydz vs Helium 10 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Insydz</h3>
                    <p className="text-sm text-gray-500">vs Helium 10</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Indian marketplace coverage Helium 10 can't match</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium features at a fraction of the cost</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">₹ denominated pricing intelligence built for India</span>
                </li>
              </ul>
              <Link href="/compare/insydzvshelium"
                className="w-full inline-block text-center border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold py-2 rounded-lg"
              >
                Show More →
              </Link>
            </div>

            {/* Insydz vs Jungle Scout */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-blue-200 dark:border-blue-900 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Insydz</h3>
                    <p className="text-sm text-gray-500">vs Jungle Scout</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Amazon India + Flipkart in one dashboard</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Real time competitive intelligence for Indian markets</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI insights that understand Indian buyer behaviour</span>
                </li>
              </ul>
              <Link href="/compare/insydzvsjunglescout"
                className="w-full inline-block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-2 rounded-lg"
              >
                Show More →
              </Link>
            </div>

            {/* Insydz vs Viral Launch */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-green-200 dark:border-green-900 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Insydz</h3>
                    <p className="text-sm text-gray-500">vs Viral Launch</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Agency optimized workflows for Indian businesses</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Superior data precision for marketplaces</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Localized market intelligence designed for how Indian businesses scale</span>
                </li>
              </ul>
              <Link href="/compare/insydzvsvirallaunch"
                className="w-full inline-block text-center border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold py-2 rounded-lg"
              >
                Show More →
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/login"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-10 py-4 text-lg rounded-full shadow-xl"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="Resources" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Accelerate Your Growth With <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Access premium resources built for Indian e-commerce sellers from seller guides and success stories to video masterclasses and strategic playbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Blog */}
            <Link href="/resources/expert-blog"
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-blue-200 dark:border-blue-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Expert Blog</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                Cutting-edge strategies for Amazon India, Flipkart sellers written by practitioners, not theorists
              </p>
              <span className="text-blue-600 dark:text-blue-400 font-semibold mt-auto">
                Explore Articles →
              </span>
            </Link>

            {/* Case Studies */}
            <Link href="/resources/case-studies"
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-purple-200 dark:border-purple-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Success Stories</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                Real numbers from real Indian sellers who used Insydz to solve real marketplace problems
              </p>
              <span className="text-purple-600 dark:text-purple-400 font-semibold mt-auto">
                View Case Studies →
              </span>
            </Link>

            {/* Video Tutorials */}
            <Link href="/resources/videos"
              className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-pink-200 dark:border-pink-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Video Masterclasses</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                Step-by-step platform walkthroughs, seller workshops, marketplace strategy sessions
              </p>
              <span className="text-pink-600 dark:text-pink-400 font-semibold mt-auto">
                Start Learning →
              </span>
            </Link>

            {/* E-commerce Guides */}
            <Link href="/resources/guides"
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-green-200 dark:border-green-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Strategic Playbooks</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                In-depth growth frameworks for festive season prep, Buy Box recovery, new product launches, and competitive repositioning
              </p>
              <span className="text-green-600 dark:text-green-400 font-semibold mt-auto">
                Access Guides →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="About" className="py-24 bg-background dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We're democratizing ecommerce intelligence for the Indian market, building tools that empower the next generation of digital entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Seller Focused</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every feature we build starts with a conversation with a real seller navigating the Indian marketplace landscape.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Presentation className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Data Precision</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We believe in raw data accuracy. Our proprietary engine cleans and processes millions of data points specifically for marketplaces.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Beyond just tracking, we provide AI recommendations that help you act on data before your competitors do.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <h3 className="text-3xl font-bold mb-6 relative z-10">Ready to dominate the marketplace?</h3>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of Indian sellers who use Insydz to grow their revenue and profit every single day.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/login"
                className="bg-white text-purple-900 font-bold px-10 py-4 rounded-full shadow-xl hover:bg-purple-50 transition-colors"
              >
                Create Free Account
              </Link>
              <Link href="/about/our-vision"
                className="border-2 border-white/30 hover:border-white text-white font-bold px-10 py-4 rounded-full transition-colors"
              >
                Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is handled by MarketingLayout */}

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
