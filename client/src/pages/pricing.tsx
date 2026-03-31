import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/App";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, X, Loader2, AlertCircle, Crown, Zap, Building2, ArrowRight,
  Menu, X as XIcon, Sun, Moon, ChevronDown, ShoppingBag, Store,
  Briefcase, Users, Target, Package, BarChart3, MessageCircle,
  Bell, Search, TrendingDown, TrendingUp, Code, Globe, Trophy,
  ArrowLeft, BookOpen, Video, FileText, Flame, Mail, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { navigate } from 'wouter/use-browser-location';
import { Helmet } from 'react-helmet-async';

// Navigation Menu Data
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

interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
  oldPrice?: number;
  description: string;
  bestFor: string;
  features: string[];
  limitations: string[];
  icon: React.ReactNode;
  isPopular?: boolean;
  badge?: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Forever",
    bestFor: "New & growing sellers exploring insights",
    badge: "No Credit Card Required",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Basic dashboard access",
      "25 product tracking",
      "Top 5 products filter",
      "5 AI chat messages/month",
      "5 notifications",
      "Weekly reports",
    ],
    limitations: [
      "AI Chart Summaries",
      "Advanced analytics",
      "Real-time data",
      "Premium AI features",
      "Priority support",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    oldPrice: 3999,
    description: "per month",
    bestFor: "Solo sellers getting serious",
    isPopular: true,
    icon: <Crown className="h-6 w-6" />,
    features: [
      "All Free features",
      "500 product tracking",
      "Top 20 products filter",
      "20 AI chat messages/month",
      "15 notifications",
      "AI Chart Summaries",
      "Daily reports",
      "Basic competitor alerts",
      "Email support",
    ],
    limitations: [
      "Real-time alerts",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 2999,
    oldPrice: 7999,
    description: "per month",
    bestFor: "Full-time Amazon & Flipkart sellers",
    icon: <Crown className="h-6 w-6 text-yellow-500" />,
    features: [
      "All Basic features",
      "Unlimited product tracking",
      "Top 100 products filter",
      "Unlimited AI chat",
      "Unlimited notifications",
      "Advanced AI chatbot",
      "Real-time data & alerts",
      "Priority support",
      "Advanced analytics",
    ],
    limitations: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom pricing",
    bestFor: "Tailored solutions for large businesses",
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    features: [
      "All Premium features",
      "White-label options",
      "24/7 premium support",
      "Dedicated account manager",
      "Custom integrations",
    ],
    limitations: [],
  },
];

const FAQS = [
  {
    question: "Is the free plan really free forever?",
    answer: "Yes! Our free plan is completely free forever. No credit card required, no hidden charges. Start tracking your products and competitors right away, and upgrade only when you see real value.",
  },
  {
    question: "Do I need a credit card to start?",
    answer: "Absolutely not. You can start with our free plan without entering any payment information. Just sign up and start exploring Insydz immediately.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes, you have complete flexibility. Upgrade when you need more features, downgrade if you need to scale back. No long-term contracts, no penalties. Your data and settings remain safe.",
  },
  {
    question: "Is pricing different for Amazon / Flipkart sellers?",
    answer: "No, our pricing is the same for all marketplaces. Whether you sell on Amazon, Flipkart, you get the same great value and features at the same price.",
  },
  {
    question: "Are there any hidden charges?",
    answer: "None whatsoever. The price you see is exactly what you pay. No setup fees, no extra charges, no surprises. We believe in transparent, honest pricing.",
  },
  {
    question: "Can agencies manage multiple clients?",
    answer: "Yes! Our Professional and Enterprise plans are designed for agencies. You can manage multiple brands, give team access, and even get white-label options on the Enterprise plan.",
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  // Navigation state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
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

  const handleGetStarted = () => {
    setLocation("/login");
  };

  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };

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
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
	

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/pricing" />
        <title>Insydz Pricing — Plans, Subscriptions & Free Trial</title>
        <meta name="description" content="View Insydz pricing plans, flexible monthly and annual subscriptions for solo sellers, agencies, and brands. Compare features and start your free trial today." />
      </Helmet>
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
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-1 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Insydz Logo"
                    className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Insydz
                </span>
              </a>

            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>

              {/* Solutions Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Solutions')}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
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

              {/* Use Cases Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Use Cases')}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
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

              {/* Features Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Features')}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
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
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
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

              {/* Pricing - HIGHLIGHTED (current page) */}
              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-semibold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                Pricing
              </Link>
               {/* Free Tools Dropdown */}
                            <div className="relative">
                              <button
                                onMouseEnter={() => setActiveDropdown('Free Tools')}
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
              {/* Compare Dropdown */}
                                                        <div className="relative">
                                                          <button
                                                            onMouseEnter={() => setActiveDropdown('Compare')}
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
                                                                {navigationMenu["Compare"].map((item, i) => (
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
              

              {/* Resources Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown('Resources')}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
                >
                  Resources
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                      {navigationMenu["Resources"].map((item, i) => (
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
                      {navigationMenu["About"].map((item, i) => (
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

               <a href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
                Login
              </a>

              <button
                className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </a>

              {/* Mobile Solutions */}
              <div>
                <button
                  onClick={() => toggleMobileMenu('Solutions')}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium"
                >
                  Solutions
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Solutions' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Solutions.map((item, i) => (
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
              {/* Mobile Use Cases */}
                                                        <div>
                                                          <button 
                                                            onClick={() => toggleMobileMenu('Use Cases')}
                                                            className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                                                          >
                                                            Use Cases
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Use Cases' ? 'rotate-180' : ''}`} />
                                                          </button>
                                                          {mobileActiveMenu === 'Use Cases' && (
                                                            <div className="ml-4 mt-2 space-y-1">
                                                              {navigationMenu["Use Cases"].map((item, i) => (
                                                                 item.route ? (
                                                                <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                                                                  {item.icon}
                                                                  {item.name}
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
                                          
                                                        {/* Mobile Features */}
                                                        <div>
                                                          <button 
                                                            onClick={() => toggleMobileMenu('Features')}
                                                            className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                                                          >
                                                            Features
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                                                          </button>
                                                          {mobileActiveMenu === 'Features' && (
                                                            <div className="ml-4 mt-2 space-y-1">
                                                              {navigationMenu.Features.map((item, i) => (
                                                                 item.route ? (
                                                                <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                                                                  {item.icon}
                                                                  {item.name}
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

              {/* Pricing - highlighted */}
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-semibold">
                Pricing
              </Link>
              {/* Mobile Free Tools */}
                                                        <div>
                                                          <button 
                                                            onClick={() => toggleMobileMenu('Free Tools')}
                                                            className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                                                          >
                                                            Free Tools
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Free Tools' ? 'rotate-180' : ''}`} />
                                                          </button>
                                                          {mobileActiveMenu === 'Free Tools' && (
                                                            <div className="ml-4 mt-2 space-y-1">
                                                              {navigationMenu["Free Tools"].map((item, i) => (
                                                                 item.route ? (
                                                                <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                                                                  {item.icon}
                                                                  {item.name}
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
                                          
                                                       {/* Mobile Compare */}
                                                                     <div>
                                                                       <button 
                                                                         onClick={() => toggleMobileMenu('Compare')}
                                                                         className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                                                                       >
                                                                         Compare
                                                                         <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Compare' ? 'rotate-180' : ''}`} />
                                                                       </button>
                                                                       {mobileActiveMenu === 'Compare' && (
                                                                         <div className="ml-4 mt-2 space-y-1">
                                                                           {navigationMenu.Compare.map((item, i) => (
                                                                              item.route ? (
                                                                <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                                                                  {item.icon}
                                                                  {item.name}
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
                                          
                                                         {/* Mobile Resources */}
                                                        <div>
                                                          <button 
                                                            onClick={() => toggleMobileMenu('Resources')}
                                                            className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
                                                          >
                                                            Resources
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Resources' ? 'rotate-180' : ''}`} />
                                                          </button>
                                                          {mobileActiveMenu === 'Resources' && (
                                                            <div className="ml-4 mt-2 space-y-1">
                                                              {navigationMenu.Resources.map((item, i) => (
                                                                 item.route ? (
                                                                <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                                                                  {item.icon}
                                                                  {item.name}
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
                       item.route ? (
                                                                <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                                                                  {item.icon}
                                                                  {item.name}
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

              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-lg font-semibold block">
                Login
              </a>

              <button
                className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full flex justify-center items-center"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 text-center bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Simple Pricing.
            <br />
            <span className="text-orange-600">Pay Only When You See Value.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Start free. Upgrade only when Insydz actually helps you make better decisions and more profit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all w-full sm:w-auto inline-flex items-center justify-center">
              👉 Start Free (No Credit Card)
              <ArrowRight className="ml-2" />
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-6 text-lg rounded-full w-full sm:w-auto hover:bg-orange-50 dark:hover:bg-orange-900/20"
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Compare Plans →
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <span>Built for Indian sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">₹</span>
              <span>₹ pricing, not dollars</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing Philosophy */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Why Insydz Pricing Is Different
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12">
            Most seller tools lock features behind expensive plans before you see value.
            <br className="hidden sm:block" />
            <span className="font-semibold text-slate-900 dark:text-white">Insydz works the opposite way.</span>
          </p>

          {/* Flow Diagram */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-green-200 dark:border-green-700 w-full sm:w-auto">
              <div className="text-3xl mb-2">🆓</div>
              <div className="font-bold text-slate-900 dark:text-white">See real insights first</div>
            </div>
            <div className="text-2xl text-slate-400 rotate-90 sm:rotate-0">→</div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-blue-200 dark:border-blue-700 w-full sm:w-auto">
              <div className="text-3xl mb-2">💡</div>
              <div className="font-bold text-slate-900 dark:text-white">Value becomes clear</div>
            </div>
            <div className="text-2xl text-slate-400 rotate-90 sm:rotate-0">→</div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-orange-200 dark:border-orange-700 w-full sm:w-auto">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-bold text-slate-900 dark:text-white">Upgrade when ready</div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Check className="h-8 w-8 text-green-600 mb-3" />
              <div className="font-semibold text-slate-900 dark:text-white mb-2">See real insights first</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Start tracking immediately with our free plan</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Check className="h-8 w-8 text-blue-600 mb-3" />
              <div className="font-semibold text-slate-900 dark:text-white mb-2">Upgrade only when it helps</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pay only when you see business value</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Check className="h-8 w-8 text-orange-600 mb-3" />
              <div className="font-semibold text-slate-900 dark:text-white mb-2">No forced annual contracts</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Monthly billing, cancel anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="plans" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Choose a Plan That Fits Your Selling Stage
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">Monthly pricing • No hidden fees • Cancel anytime</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrentPlan = false;
              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl shadow-md border rounded-2xl ${
                    plan.isPopular ? "ring-2 ring-orange-500 ring-offset-2" : "border-slate-200 dark:border-gray-700"
                  } ${isCurrentPlan ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700" : "bg-white dark:bg-gray-900"}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 shadow-lg rounded-full">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-600 text-white px-3 py-1 shadow-lg rounded-full">
                        Current
                      </Badge>
                    </div>
                  )}

                  {plan.badge && !isCurrentPlan && !plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-slate-700 text-white px-3 py-1 text-xs whitespace-nowrap">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrentPlan ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-slate-100 dark:bg-gray-800'
                      }`}>
                        {plan.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {plan.name}
                    </CardTitle>

                    {plan.price !== undefined ? (
                      <div className="mb-2">
                        {plan.oldPrice && (
                          <div className="text-gray-400 text-lg line-through mb-1">
                            ₹{plan.oldPrice}
                          </div>
                        )}
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">
                          ₹{plan.price}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {plan.description}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                          Custom
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {plan.description}
                        </div>
                      </div>
                    )}

                    <CardDescription className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {plan.bestFor}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}

                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2 opacity-50">
                          <X className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-500 dark:text-slate-400 line-through">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
  {plan.id === "enterprise" ? (
    <Button
      variant="outline"
      className="w-full border-2 hover:bg-slate-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
      onClick={() => window.location.href = "mailto:sales@insydz.com?subject=Enterprise Plan Inquiry"}
    >
      Book a Demo
    </Button>
  ) : (
    <Link href="/login" className={`w-full inline-block text-center py-2 px-4 rounded-md font-medium ${
      plan.id === "free"
        ? "bg-slate-600 hover:bg-slate-700 text-white"
        : "bg-orange-600 hover:bg-orange-700 text-white"
    }`}>
      {plan.id === "free" ? "Start Free" : "Get Started"}
    </Link>
  )}
</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Reassurance */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-8">
            Most Sellers Upgrade Only After Seeing This
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="text-3xl mb-3">🚨</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">First competitor price alert</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">See when competitors undercut you</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📉</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">First keyword ranking drop</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Catch visibility issues early</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="text-3xl mb-3">⭐</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">First review insight</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Understand rating patterns</div>
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 italic">
            That's when pricing stops feeling expensive.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Why Sellers Switch to Insydz
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-slate-600 dark:text-slate-400 font-semibold">Typical Seller Tools</th>
                  <th className="text-center py-4 px-4 text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/20">Insydz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Pricing</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">$39–99/month</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400 text-sm line-through">₹3,999–₹7,999</span>
                      <span>₹1999–₹2,999/month</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Free Access</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">Limited trial</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">Free forever plan</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Product Tracking</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">10-50 products</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">25-Unlimited products</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">AI Features</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">Not available</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">AI chat & summaries</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Support</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">Email only</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">Email + Priority support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Pricing FAQs
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">Everything you need to know</p>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Start Free.
            <br />
            Upgrade Only When Insydz Helps You Win.
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-90">
            No credit card required. No risk. Just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="bg-white text-orange-600 hover:bg-slate-100 px-8 py-6 text-lg rounded-full shadow-2xl w-full sm:w-auto font-bold inline-flex items-center justify-center">
              👉 Start Free Now
              <ArrowRight className="ml-2" />
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full w-full sm:w-auto"
              onClick={() => window.location.href = "mailto:sales@insydz.com"}
            >
              Talk to Sales →
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-6 px-4 text-center text-sm text-slate-500 dark:text-slate-500 bg-white dark:bg-gray-950 border-t dark:border-gray-800">
        <p>Built for Indian sellers 🇮🇳 • ₹ pricing • Cancel anytime</p>
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
 
