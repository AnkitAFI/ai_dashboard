"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Menu, X, BarChart3, Zap, Shield, Check, Crown, Building2, Sun, Moon,
  Trophy, Target, DollarSign, Globe, BookOpen, Video, FileText, Users, Linkedin,
  ChevronDown, ShoppingBag, TrendingDown, MessageCircle, Search, Package, Bell,
  Code, BarChart, Briefcase, Store, ShoppingCart, Flame, LayoutGrid
} from "lucide-react";
import { useTheme } from "next-themes";

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
    { name: "Amazon Advertising & PPC", icon: <BarChart3 className="w-4 h-4" />, badge: "COMING SOON", route: "/solutions/amazon-advertising" },
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
    { name: "Contact Us", icon: <MessageCircle className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Link
        href={item.route}
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
      <Link
        href={item.route}
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
          <a href="/" className="flex items-center space-x-3 group" aria-label="Insydz – Home">
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
          </a>

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
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {mounted && (resolvedTheme === "dark" ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-800"/>)}
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
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); scrollToSection('Home'); }}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
            >
              Home
            </a>

            {(["Solutions", "Use Cases", "Features", "Free Tools", "Integrations", "Compare", "Resources", "About"] as const).map((menuName) => (
              <div key={menuName}>
                <button
                  onClick={() => toggleMobileMenu(menuName)}
                  aria-expanded={mobileActiveMenu === menuName}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                >
                  {menuName}
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuName ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === menuName && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu[menuName].map((item, i) => (
                      <MobileDropdownItem key={i} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
            >
              Pricing
            </Link>

            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full mt-2 text-center bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-5 py-2 rounded-full"
            >
              Login
            </Link>

            <button
              className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full flex justify-center items-center"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {mounted && (resolvedTheme === "dark" ? (
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-400"/>
                  <span className="text-sm font-medium text-gray-300">Switch to Light Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-gray-800"/>
                  <span className="text-sm font-medium text-gray-700">Switch to Dark Mode</span>
                </div>
              ))}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
