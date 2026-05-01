"use client";

import { useState, useEffect, useRef } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function PricingContent() {
  const router = useRouter();
  
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
    router.push("/login");
  };

  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
              <Link href="/" className="flex items-center space-x-1 group">
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
              </Link>
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

               <Link href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
                Login
              </Link>

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
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>

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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-red-200/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-4 border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 px-4 py-1">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
            Choose the plan that fits your <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">growth journey</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            From solo sellers to large enterprises, our tools are built to help you scale your Amazon and Flipkart business with confidence.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.isPopular 
                  ? 'border-orange-500 scale-105 shadow-xl shadow-orange-500/10' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-orange-200'
              }`}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  plan.isPopular ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline justify-center">
                  {plan.price !== undefined ? (
                    <>
                      <span className="text-4xl font-extrabold tracking-tight">₹{plan.price.toLocaleString()}</span>
                      <span className="ml-1 text-slate-500 font-medium">/{plan.id === 'free' ? 'forever' : 'mo'}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Contact Us</span>
                  )}
                </div>
                {plan.oldPrice && (
                  <div className="text-slate-400 line-through text-sm font-medium">₹{plan.oldPrice.toLocaleString()}</div>
                )}
                {plan.badge && (
                  <div className="mt-2 text-xs font-bold text-orange-600 uppercase tracking-wider">{plan.badge}</div>
                )}
                <CardDescription className="mt-4 min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-6">
                <div className="mb-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Best For</div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{plan.bestFor}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">What's Included</div>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start opacity-40">
                      <X className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-400 line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <Button 
                    className={`w-full h-12 rounded-xl font-bold text-base transition-all ${
                      plan.isPopular 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                    }`}
                    onClick={() => router.push("/login")}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Features</h2>
          <p className="text-slate-600 dark:text-slate-400">Detailed breakdown of what you get with each plan.</p>
        </div>

        <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-gray-900/50 w-1/3">Feature</th>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <th key={plan.id} className="p-6 text-center text-sm font-bold uppercase tracking-widest">
                      <span className={plan.isPopular ? 'text-orange-600' : ''}>{plan.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-6 text-sm font-medium">Product Tracking</td>
                  <td className="p-6 text-center text-sm">25</td>
                  <td className="p-6 text-center text-sm">500</td>
                  <td className="p-6 text-center text-sm font-bold text-orange-600">Unlimited</td>
                  <td className="p-6 text-center text-sm">Custom</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">AI Chat Support</td>
                  <td className="p-6 text-center text-sm">5/mo</td>
                  <td className="p-6 text-center text-sm">20/mo</td>
                  <td className="p-6 text-center text-sm font-bold text-orange-600">Unlimited</td>
                  <td className="p-6 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">Marketplace Data</td>
                  <td className="p-6 text-center text-sm text-slate-400 italic">Delayed</td>
                  <td className="p-6 text-center text-sm">Daily</td>
                  <td className="p-6 text-center text-sm font-bold text-orange-600">Real-time</td>
                  <td className="p-6 text-center text-sm">Real-time</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">Email Alerts</td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">WhatsApp Alerts</td>
                  <td className="p-6 text-center"><X className="h-5 w-5 text-slate-300 mx-auto" /></td>
                  <td className="p-6 text-center"><X className="h-5 w-5 text-slate-300 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to know about our pricing and plans.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-slate-200 dark:border-slate-800">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-orange-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-red-500 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8">Ready to grow your e-commerce business?</h2>
          <p className="text-xl mb-12 text-orange-50 font-medium opacity-90">
            Join 5,000+ sellers who are making data-driven decisions with Insydz. <br className="hidden md:block" />
            No credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-6 rounded-2xl text-lg shadow-2xl"
              onClick={() => router.push("/login")}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-6 rounded-2xl text-lg"
              onClick={() => router.push("/about/contact-us")}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
