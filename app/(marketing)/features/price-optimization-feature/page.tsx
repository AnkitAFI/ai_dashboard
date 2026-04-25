"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  DollarSign, X, Check, RefreshCw, Eye,
  Sparkles, ChevronDown, LineChart, Percent,
  ShoppingCart, Award, Calculator, Maximize2,
  Brain, ThumbsUp, MessageCircle, Search,
  Package, Clock, Users, Menu, Sun, Moon,
  ShoppingBag, Store, Briefcase, Code, Globe,
  Trophy, ArrowLeft, BookOpen, Video, FileText,
  Flame, Presentation,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




// ─── NAVIGATION MENU DATA ────────────────────────────────────────────────────
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

const schemaSoftwarePrice = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#price-optimization",
  "name": "Insydz AI Price Optimization",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/price-optimization-feature",
  "description": "Maximise margins with Insydz AI price optimization software. Set dynamic pricing rules, win the Buy Box, and improve revenue.",
  "featureList": [
    "AI-recommended optimal price",
    "Buy Box probability scoring",
    "Margin floor protection",
    "Festive pricing intelligence",
    "Category benchmark pricing"
  ],
  "offers": {
    "@type": "Offer",
    "price": "1999",
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "1999",
      "priceCurrency": "INR",
      "unitCode": "MON"
    }
  },
  "creator": {
    "@id": "https://insydz.com/#organization"
  }
};

const schemaBreadcrumbPrice = {
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
      "name": "Features",
      "item": "https://insydz.com/features"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "AI Price Optimization",
      "item": "https://insydz.com/features/price-optimization-feature"
    }
  ]
};

const schemaFAQPrice = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI price optimization work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz analyzes competitor prices, demand signals, and Buy Box probability to recommend optimal pricing while maintaining your margin."
      }
    },
    {
      "@type": "Question",
      "name": "Will I lose the Buy Box if prices are optimized?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Insydz maximizes Buy Box win probability and provides predictions for each recommended price."
      }
    },
    {
      "@type": "Question",
      "name": "Can I set minimum profit margins?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can define a margin floor and Insydz will never recommend pricing below it."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work for seasonal products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz accounts for Indian festive demand like Diwali and Big Billion Days in pricing recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Is price optimization available on the free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Free plan includes basic AI pricing recommendations with limits on products."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from competitor price tracking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Price tracking shows competitor prices, while optimization recommends the best price based on demand, margins, and Buy Box probability."
      }
    }
  ]
};
const SCHEMAS = [schemaSoftwarePrice, schemaBreadcrumbPrice, schemaFAQPrice];

export default function PriceOptimizationFeaturePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-po-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      document.getElementById(`insydz-po-schema-${i}`)?.remove();
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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGetStarted = () => router.push("/login");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);
  const toggleMobileMenu = (menuName: string) =>
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const painPoints = [
    {
      icon: <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Guessing prices based on gut feeling",
      description: "Without data on competitor movements, Buy Box probability, or demand velocity, every pricing decision is a bet.",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Panic discounting kills margins",
      description: "Sellers who see Buy Box drop immediately cut price often below their own cost, especially after Amazon fees.",
      color: "from-orange-500 to-yellow-500",
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Losing Buy Box to a competitor who priced ₹10 smarter",
      description: "The Buy Box isn't won by the cheapest seller. It's won by the seller who understands the algorithm.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Percent className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Overpricing = zero sales",
      description: "Hold too high during a demand dip and you're invisible. No clicks, no sales, no data and a ranking that slides.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const outcomes = [
    { icon: <DollarSign />, title: "Increase profit per sale", detail: "AI finds the highest profitable price point the market will bear without losing sales velocity.", color: "text-green-600" },
    { icon: <ShoppingCart />, title: "Win more Buy Boxes", detail: "Competitive without panic discounting because the AI knows exactly how low to go and no lower.", color: "text-blue-600" },
    { icon: <TrendingUp />, title: "Boost revenue 15–30%", detail: "Smart pricing means more conversions at better margins. Revenue compounds faster than manual pricing.", color: "text-emerald-600" },
    { icon: <Shield />, title: "Protect margins automatically", detail: "Set your floor price once. AI respects it always. Never sell below your profit target again.", color: "text-purple-600" },
    { icon: <Award />, title: "Beat competitors strategically", detail: "Data wins over guesswork. Know when a competitor has priced themselves out of the Buy Box.", color: "text-orange-600" },
    { icon: <Maximize2 />, title: "Scale without manual work", detail: "AI optimizes pricing 24/7 for 10 products or 500. Your time scales. The results don't drop.", color: "text-indigo-600" },
  ];

  const indiaPains = [
    {
      title: "Most Indian sellers price by watching one competitor",
      description: "The real Buy Box is won by understanding all active competitors, demand velocity, your category's price elasticity, and Buy Box probability simultaneously. Watching one ASIN manually misses 80% of what's actually driving the algorithm.",
    },
    {
      title: "Festive season pricing is the hardest to get right manually",
      description: "During Diwali, Big Billion Days, and Great Indian Festival, demand multipliers shift category dynamics hourly. A price that wins Buy Box at 2pm can lose it by 6pm as competitors stack discounts. Manual pricing can't keep pace with hourly shifts.",
    },
    {
      title: "Margin floor calculations are done wrong or not at all",
      description: "Most sellers know their purchase cost. Few correctly account for Amazon commission (8–15%), GST implications, fulfilment fees, return rates, and ad spend before setting a margin floor. AI does all of this automatically in INR, every time.",
    },
    {
      title: "Global pricing tools don't understand Flipkart or Indian demand signals",
      description: "Western dynamic pricing platforms are calibrated for Amazon.com and European retail. They don't model Flipkart Buy Box mechanics, Indian festive demand multipliers, or INR fee structures. An Indian seller using them is optimizing against the wrong market.",
    },
  ];

  const intelligenceModules = [
    { feature: "Dynamic Price Recommendations", result: "AI adjusts to market changes hourly not when you remember to check", icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-blue-500 to-cyan-500" },
    { feature: "Buy Box Win Probability", result: "See exact Buy Box win probability at any price point before committing", icon: <Percent className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-purple-500 to-pink-500" },
    { feature: "Margin Protection Rules", result: "Set floor once. AI respects it unconditionally even during a 2am flash sale", icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-red-500 to-orange-500" },
    { feature: "Competitor Price Analysis", result: "Track all active competitors simultaneously not just the one you last checked", icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-green-500 to-emerald-500" },
    { feature: "Seasonal Demand Detection", result: "Diwali, Big Billion Days, GIF demand multipliers built into every recommendation", icon: <LineChart className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-orange-500 to-red-500" },
    { feature: "A/B Price Testing", result: "Test two price points simultaneously find the winner with data, not instinct", icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-indigo-500 to-purple-500" },
  ];

  const comparisonRows = [
    { aspect: "Data Analysis", manual: "Gut feeling, limited data", ai: "Thousands of data points analyzed hourly" },
    { aspect: "Speed", manual: "Hours to days", ai: "Recommendations in seconds" },
    { aspect: "Accuracy", manual: "Hit or miss", ai: "Proven 15–30% revenue increase" },
    { aspect: "Margin Safety", manual: "Manual calculations, errors common", ai: "Automated margin protection floor never breached" },
    { aspect: "Scalability", manual: "Impossible for 100+ products", ai: "Works for unlimited products simultaneously" },
    { aspect: "Festive Demand", manual: "Priced the same as off-season", ai: "Demand multipliers built in Diwali, BBD, GIF" },
    { aspect: "Flipkart Support", manual: "Separate process, usually skipped", ai: "Amazon India + Flipkart in one recommendation" },
  ];

  const indiaFirstFeatures = [
    { feature: "Amazon India + Flipkart optimization", meaning: "Price recommendations account for both marketplace Buy Box mechanics simultaneously." },
    { feature: "Indian festive demand multipliers", meaning: "Diwali, Big Billion Days, Great Indian Festival, Republic Day built into every hourly recommendation." },
    { feature: "Amazon.in fee structure built in", meaning: "Commission rates, fulfilment fees, GST, and return rates factored into every margin floor calculation in INR." },
    { feature: "WhatsApp recommendations, not dashboards", meaning: "Price recommendations arrive on WhatsApp with suggested price, Buy Box probability, and one-tap apply." },
  ];

  const testimonials = [
    {
      quote: "Before Insydz I was repricing manually twice a day during Big Billion Days. I was always reactive seeing what competitors did and matching it. Insydz showed me the Buy Box win probability at each price before I moved. I stopped following and started leading.",
      name: "Sanjay M.",
      role: "Electronics accessories, Hyderabad · Amazon India + Flipkart",
    },
    {
      quote: "The margin protection feature alone is worth the subscription. I used to panic discount below my own cost during sale events without realising it. Insydz set the floor, and now I know every recommendation is already profitable before I apply it.",
      name: "Divya R.",
      role: "D2C home decor brand, Jaipur · Amazon India",
    },
    {
      quote: "We manage 22 seller accounts. Manual pricing at scale was impossible especially across Amazon and Flipkart simultaneously. Our clients average Buy Box rate went from 51% to 74% in 45 days.",
      name: "Karan T.",
      role: "E-commerce agency, Delhi · 22 seller accounts",
    },
  ];

  const faqs = [
    {
      question: "How does AI price optimization work?",
      answer: "Insydz AI scans competitor prices, demand signals, Buy Box win probability at different price points, seasonal demand multipliers, and your margin floor every hour. It then recommends the price that maximizes revenue and Buy Box probability while staying above your profit threshold. The recommendation appears on your dashboard and as a WhatsApp notification. The AI recalculates automatically as market conditions change no manual intervention required.",
    },
    {
      question: "Will I lose the Buy Box if prices are optimized?",
      answer: "No. the AI is specifically designed to maximize Buy Box win probability, not just lower your price. Every recommendation includes the predicted Buy Box probability at that price point. In testing with Indian sellers, Insydz-optimized pricing increased Buy Box win rates from an average of 51% to 74% over 45 days while maintaining or improving margins because the AI found the optimal competitive position rather than blindly following competitors down.",
    },
    {
      question: "Can I set minimum profit margins?",
      answer: "Yes. margin floor protection is core to how Insydz price optimization works. You set your minimum acceptable margin or absolute floor price per product. Insydz automatically accounts for Amazon.in commission, fulfilment fees, and your purchase cost when calculating this floor. No recommendation will ever suggest a price below your floor even during a competitor price war or a flash sale at 2am when you're asleep.",
    },
    {
      question: "Does this work for seasonal products?",
      answer: "Yes. Indian festive demand multipliers (Diwali, Big Billion Days, Great Indian Festival, Republic Day, Holi) are built into every hourly recommendation. During high-demand seasons, the AI recognizes that higher prices can still win the Buy Box because all sellers are operating at elevated demand and recommends the most profitable price accordingly, not a conservative one based on off-season dynamics.",
    },
    {
      question: "Is price optimization available on the free plan?",
      answer: "Yes. The free plan includes AI price recommendations for a limited number of products, Buy Box probability analysis, margin protection settings, and basic optimization alerts permanently, with no credit card required and no expiry date. Paid plans (₹1,999/month and ₹2,999/month) unlock automated price changes, unlimited products, A/B price testing, and advanced seasonal demand detection.",
    },
    {
      question: "How is this different from competitor price tracking?",
      answer: "Competitor price tracking tells you what competitors are charging. AI price optimization tells you what you should charge accounting for your margin, Buy Box probability, demand signals, and competitive position simultaneously. Price tracking is reactive. Price optimization is proactive. For Indian sellers on Amazon India and Flipkart, both are useful but optimization drives revenue. Tracking alone does not.",
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      

      {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg"
          : "bg-background dark:bg-gray-900/80 backdrop-blur-none"
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
                <a href="/" className="flex items-center space-x-1 sm:space-x-1.5 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Insydz Logo"
                    className="w-9 h-auto sm:w-10 sm:h-auto lg:w-12 lg:h-auto shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                  />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Insydz</span>
              </a>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2" ref={dropdownRef}>
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as const).map((menuKey) => (
                <div className="relative" key={menuKey}>
                  <button
                    onMouseEnter={() => setActiveDropdown(menuKey)}
                    className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                      menuKey === "Features"
                        ? "text-green-600 dark:text-green-500 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                  >
                    {menuKey}
                    <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === menuKey ? "rotate-180" : ""}`} />
                  </button>
                  {activeDropdown === menuKey && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                    >
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-3 group">
                            <span className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                            <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 flex-1 text-left">{item.name}</span>
                            {item.badge && <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="w-full px-4 py-2.5 flex items-center gap-3 opacity-60 cursor-default">
                            <span className="text-green-600 dark:text-green-400 flex-shrink-0">{item.icon}</span>
                            <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link href="/pricing" className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium rounded-lg hover:bg-green-50 transition-all">Pricing</Link>

              <a href="/login" className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
                Login
              </a>
              <button
                className="ml-1 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile/Tablet right controls */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5 sm:space-y-2">
               <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button
                    onClick={() => toggleMobileMenu(menuKey)}
                    className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base ${
                      menuKey === "Features"
                        ? "text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                  >
                    {menuKey}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5 sm:space-y-1">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="text-left flex-1">{item.name}</span>
                            {item.badge && <span className="ml-auto text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
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

               <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium text-sm sm:text-base">Pricing</Link>
               <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 sm:py-2.5 rounded-lg font-semibold block text-sm sm:text-base">Login</a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-3 sm:px-4 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 sm:opacity-30 pointer-events-none">
          <div className="absolute top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-700">Feature Spotlight</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                AI Price Optimization 
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Maximize Profit
                </span>
                <br />
                Without Losing Sales
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI-powered <strong>price optimization software</strong> that finds the perfect price
                point for every product, every hour. Win Buy Box, protect margins, and increase
                revenue all at once.{" "}
                <span className="text-green-700 dark:text-green-400 font-semibold">
                  No manual repricing. No gut feeling. No panic discounting.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-16 sm:px-8 py-4 sm:py-3 text-base sm:text-sm rounded-full shadow-2xl transition-all inline-flex items-center justify-center w-full sm:w-auto">
                   Start Optimizing Prices Free
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                {["AI-powered recommendations", "Margin protection built-in", "Buy Box optimization"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI Price Recommendation Widget */}
            <div className="relative mt-4 sm:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">AI Price Recommendation</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Brain className="w-3 h-3" /> AI Active
                    </span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Current Price</span>
                        <span className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">₹1,499</span>
                      </div>
                      <div className="text-xs text-gray-500">Buy Box: 45% | Margin: 18%</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">AI Recommended</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">₹1,349</span>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 font-semibold">Buy Box: 78% ↑ | Margin: 22% ↑</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2.5 sm:p-3 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue Impact</div>
                      <div className="text-lg sm:text-xl font-bold text-green-600">+32%</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-2.5 sm:p-3 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Profit Impact</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-600">+18%</div>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                    Apply Recommended Price →
                  </Button>
                </div>
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> AI Optimized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHY MOST SELLERS LEAVE MONEY ON THE TABLE ───────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Why Most Sellers <br />
              <span className="text-red-600">Leave Money on the Table</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Wrong pricing isn't just about being too expensive. It's about every rupee of margin
              lost to panic discounting, every Buy Box lost to a competitor who priced ₹10 smarter,
              and every sale missed because you held the price too high during a demand surge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
            {painPoints.map((pain, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-green-400 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${pain.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {pain.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-xs sm:text-sm leading-snug">{pain.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{pain.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center shadow-lg mb-8 sm:mb-10 lg:mb-12">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Wrong pricing costs sellers{" "}
              <span className="text-red-600">15–35% of potential revenue</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Every day, across every category on Amazon India and Flipkart.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Manual Pricing</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Guesswork + delayed reactions = lost profit</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {["No data-driven insights", "Emotional pricing decisions", "Constant manual monitoring needed", "Can't keep pace with festive demand shifts"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">AI Optimization</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Smart pricing = maximum profit + sales</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {["AI analyzes market dynamics hourly", "Data-driven recommendations", "Automated price optimization 24/7", "Indian festive demand multipliers built in"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              How AI Price Optimization Works
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Insydz AI analyzes thousands of data points every hour to recommend the perfect price
              balancing competitiveness, margins, and{" "}
              <a href="/features/price-optimization-feature#buybox" className="text-green-600 underline">
                Buy Box win probability
              </a>.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
              {[
                { step: "1", title: "AI scans market data", detail: "Competitor prices, demand signals, and seasonality updated every hour, not once a day.", icon: <Eye className="w-8 h-8 sm:w-10 sm:h-10" /> },
                { step: "2", title: "Analyzes Buy Box dynamics", detail: "Win probability calculated at multiple price points showing the optimal competitive position.", icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10" /> },
                { step: "3", title: "Calculates optimal price", detail: "Maximum profit while staying competitive margin floor built into every calculation.", icon: <Calculator className="w-8 h-8 sm:w-10 sm:h-10" /> },
                { step: "4", title: "Recommends & alerts you", detail: "Dashboard recommendation + WhatsApp notification act in seconds from anywhere.", icon: <Bell className="w-8 h-8 sm:w-10 sm:h-10" /> },
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-base sm:text-lg font-black text-white">
                    {item.step}
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-green-600 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <p className="text-gray-900 dark:text-white font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">{item.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
              <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-full shadow-2xl inline-flex items-center justify-center w-full sm:w-auto">
              Get AI Price Recommendations Free
              <ChevronRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: OUTCOMES ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              What You Can Do with Price Optimization
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six outcomes Indian sellers get from switching to AI-powered pricing in the first 30 days.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {outcomes.map((outcome, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 lg:p-6 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center ${outcome.color}`}>
                    {outcome.icon}
                  </div>
                  <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{outcome.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHY INDIAN SELLERS STRUGGLE ─────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Indian Sellers Struggle with Pricing Even When They Have the Right Product
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A seller with a 4.5-star product, good reviews, and a competitive landing cost can
              still lose 30% of potential revenue to pricing decisions made on gut feel.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            {indiaPains.map((pain, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm flex-shrink-0 mt-0.5 sm:mt-1">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{pain.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{pain.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: AI INTELLIGENCE MODULES ─────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Advanced AI Pricing Intelligence
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six intelligence modules working simultaneously so every price recommendation is
              built on the full picture, not a single data point.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {intelligenceModules.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-green-400 hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-3 sm:mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex items-start gap-2 leading-relaxed">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" /> {item.result}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: RIYA'S DIWALI SCENARIO ──────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              What Most Price Optimization Tools Don't Tell You
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Most <strong>ecommerce price optimization tools</strong> optimize for the Buy Box.
              Insydz optimizes for the Buy Box <em>and</em> your margin simultaneously. There's a
              difference worth ₹2.4L.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-white font-bold text-base sm:text-lg">
                Riya's Diwali Pricing The ₹10 Decision That Changed Everything
              </h3>
              <p className="text-green-200 text-xs sm:text-sm">Fashion Accessories, Amazon India + Flipkart</p>
            </div>
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase whitespace-nowrap">Scenario</th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-center text-xs font-bold text-red-600 uppercase whitespace-nowrap">Without Insydz</th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-center text-xs font-bold text-green-600 uppercase whitespace-nowrap">With Insydz</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { scenario: "Product", without: "Ethnic jewellery set at ₹1,499. 4.3 stars, 180+ reviews. Diwali approaching.", with: "Same product, same season" },
                    { scenario: "Pricing decision", without: "Dropped to ₹1,199 to stay competitive ₹300/unit margin lost", with: "Insydz showed Buy Box at ₹1,349 was 74% nearly same as ₹1,199 at 71%" },
                    { scenario: "What happened next", without: "Competitors matched. Price war to ₹999. Margin fell below cost after Amazon fees.", with: "Held ₹1,349. Margin protected. Competitors raced to the bottom around her." },
                    { scenario: "Diwali revenue", without: "Below cost at scale unrecoverable during sale window", with: "₹21.6L Diwali revenue at 22% margin" },
                    { scenario: "The ₹150 difference", without: "N/A", with: "1,600 units × ₹150 = ₹2,40,000 more revenue vs ₹1,199 pricing" },
                    { scenario: "Post-Diwali", without: "Depleted margin, ranking fell after sale event", with: "Ranked #2 in category. Held position for next sale cycle." },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.scenario}</td>
                      <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-left">
                        <div className="flex items-start justify-left gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-left">{row.without}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-center bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-start justify-left gap-1">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-900 dark:text-white font-medium text-left">{row.with}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center">
            <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Riya pays ₹2,999/month for Insydz. The single Diwali pricing decision returned
              ₹2,40,000 in recovered revenue an{" "}
              <span className="text-green-600">80x return</span> on her monthly subscription in one
              sale season.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm italic">
              "The difference wasn't the price. It was knowing that ₹1,349 had 74% Buy Box win
              probability nearly identical to ₹1,199 before making the decision."
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: COMPARISON TABLE ─────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Manual Pricing vs AI Optimization
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              The honest comparison every dimension that matters for an Indian marketplace seller.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Aspect</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-red-600 uppercase">Manual Pricing</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-green-600 uppercase bg-green-50 dark:bg-green-900/20">AI Optimization</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 sm:px-6 py-2.5 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.aspect}</td>
                      <td className="px-3 sm:px-6 py-2.5 sm:py-4 text-left">
                        <div className="flex items-start justify-left gap-1.5 sm:gap-2">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-left">{row.manual}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2.5 sm:py-4 text-left bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-start justify-left gap-1.5 sm:gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-900 dark:text-white font-medium text-left">{row.ai}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-xl inline-flex items-center justify-center w-full sm:w-auto">
              Switch to AI Pricing
              <ArrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: FREE PLAN ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Start Free. Optimize Prices Instantly.
            </h2>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-baseline gap-2 mb-1.5 sm:mb-2">
                <span className="text-5xl sm:text-6xl font-black text-green-600">₹0</span>
                <span className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400">/ Forever</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Free Plan Includes:</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                "AI price recommendations for limited products",
                "Buy Box probability analysis",
                "Margin protection settings",
                "Basic optimization alerts",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 border border-green-200 dark:border-green-700">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-green-600">Upgrade:</span> Unlock automated price
                changes, unlimited products, and advanced A/B testing on paid plans{" "}
                <a href="/pricing" className="text-green-600 underline">₹1,999/month and ₹2,999/month</a>.
              </p>
            </div>
            <div className="text-center">
              <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-full shadow-2xl inline-block w-full sm:w-auto text-center">
                Start AI Price Optimization Free
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: INDIA-FIRST ─────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              How Insydz Price Optimization Is Built for India
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Global <strong>dynamic pricing platforms</strong> aren't calibrated for{" "}
              <a href="/solutions/flipkart-sellers" className="text-green-600 underline">Flipkart Buy Box mechanics</a>,
              Indian festive demand, or INR margin calculations with Amazon.in's specific fee structure.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10">
            {indiaFirstFeatures.map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm flex-shrink-0 mt-0.5 sm:mt-1">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{item.feature}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{item.meaning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center">
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
              <span className="text-green-400 font-bold">What most ecommerce price optimization tools don't tell you:</span>{" "}
              Buy Box probability isn't linear. Dropping price 10% doesn't increase Buy Box win
              probability by 10% it depends on who else is competing, at what price, and what
              Amazon's current weighting factors are. Insydz models this in real time.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Indian Sellers Who Stopped Guessing Prices
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, s) => (
                    <TrendingUp key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed italic mb-4 sm:mb-5">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{t.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 12: IS IT RIGHT FOR YOU? ───────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Is AI Price Optimization Right for You?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Perfect For</h3>
              </div>
              <ul className="space-y-2.5 sm:space-y-3">
                {[
                  "Sellers in competitive categories (electronics, home, fashion)",
                  "D2C brands protecting margins while scaling",
                  "High-volume sellers with 10+ SKUs",
                  "Agencies managing multiple seller accounts",
                  "Sellers tired of manual repricing during sale seasons",
                  "Anyone who has ever panic-discounted below cost",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Less Useful For</h3>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                {[
                  "Products sold at fixed MRP with no pricing flexibility",
                  "One-time sellers with 1–2 products, minimal competition",
                  "Sellers who never check analytics or act on recommendations",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-orange-200 dark:border-orange-700">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-orange-600">Note:</span> Even with 1–2 products,
                  the free plan costs nothing. The Buy Box probability data alone is useful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 13: FAQ ──────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Price Optimization FAQs
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Each answer leads with a direct response for Google Featured Snippet and AI Overview extraction.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-green-400 transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-left gap-3"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3 sm:pt-4 text-xs sm:text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 15: RELATED FEATURES ───────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Related Features
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[
              { title: "Competitor Price Tracking", desc: "Monitor competitor price movements in real time", icon: <TrendingDown />, color: "from-orange-500 to-red-500", route: "/features/competitor-price-tracking-feature" },
              { title: "Review Analytics", desc: "AI review clustering Hindi + English", icon: <MessageCircle />, color: "from-purple-500 to-pink-500", route: "/features/review-analytics-feature" },
              { title: "Keyword & Rank Tracking", desc: "Track organic position and keyword movement", icon: <Search />, color: "from-blue-500 to-cyan-500", route: "/features/keyword-rank-tracking-feature" },
              { title: "Product Research", desc: "Find profitable products before launch", icon: <Target />, color: "from-indigo-500 to-purple-500", route: "/features/product-research-feature" },
              { title: "AI Recommendations", desc: "Unified AI-driven growth suggestions", icon: <Sparkles />, color: "from-green-500 to-emerald-500", route: "/features/ai-recommendations-feature" },
              { title: "WhatsApp Alerts", desc: "Real-time alerts to WhatsApp not email", icon: <Bell />, color: "from-emerald-500 to-green-500", route: "/features/whatsapp-alerts-feature" },
            ].map((feature, i) => (
               <Link
                key={i}
                href={feature.route}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 lg:p-6 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group block"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors mb-1">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">{feature.desc}</p>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 16: FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Stop Guessing Prices.
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Let AI Maximize Your Profit.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10">
             {[
                { icp: "New Seller", headline: "Start free AI pricing for your first products", cta: "Start Free →", href: "/login", style: "from-green-600 to-emerald-600" },
                { icp: "Growing Seller", headline: "Protect margins while scaling to ₹10L+/month", cta: "Try Growth Plan →", href: "/pricing", style: "from-emerald-600 to-green-700" },
                { icp: "Agency", headline: "AI pricing for every account you manage", cta: "Book Demo →", href: "/login", style: "from-teal-600 to-green-600" },
              ].map((card, i) => (
  <div
    key={i}
    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center hover:shadow-xl transition-all flex flex-col h-full"
  >
    <div
      className={`inline-flex text-xs font-bold text-white bg-gradient-to-r ${card.style} px-3 py-1 rounded-full mb-3 sm:mb-4 self-center`}
    >
      {card.icp}
    </div>

    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed flex-grow">
      {card.headline}
    </p>

    <a
      href={card.href}
      className={`w-full bg-gradient-to-r ${card.style} text-white font-bold rounded-full text-sm sm:text-base py-2 sm:py-2.5 block text-center mt-auto`}
    >
      {card.cta}
    </a>
  </div>
              ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
            {["No credit card required", "Setup in 2 minutes", "Cancel anytime"].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
             <a href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-full shadow-2xl inline-flex items-center justify-center w-full sm:w-auto">
              Start AI Pricing Free
              <ArrowRight className="ml-2" />
            </a>
            <a href="/features" className="border-2 border-green-600 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-full inline-block text-center w-full sm:w-auto">
              Explore All Features →
            </a>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA — shown only on mobile/tablet, with bottom padding for safe area */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-green-300 dark:border-green-700 p-3 sm:p-4 shadow-2xl z-40 pb-safe">
        <a href="/login" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 rounded-full shadow-xl text-sm sm:text-base flex items-center justify-center">
          Start AI Pricing Free
        </a>
      </div>

      {/* Bottom padding to prevent sticky CTA from overlapping content on mobile */}
      <div className="lg:hidden h-16 sm:h-20" />

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0f1e] text-white py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 mb-10 sm:mb-12 lg:mb-14">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <img src="/logo.png" alt="Insydz Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain p-0.5" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Insydz</span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                AI-powered ecommerce analytics solution for Indian marketplace sellers.
              </p>
              <a href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free →
              </a>
              <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                {[
                  { title: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61586202582209', icon: '🅕' },
                  { title: 'Twitter', href: 'https://x.com/growwithinsydz', icon: '𝕏' },
                  { title: 'Instagram', href: 'https://www.instagram.com/growwithinsydz/', icon: '📷' },
                  { title: 'LinkedIn', href: 'https://www.linkedin.com/company/insydz/?viewAsMember=true', icon: 'in' },
                ].map(s => (
                  <a key={s.title} title={s.title} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-background opacity-100 rounded-full flex items-center justify-center hover:bg-background opacity-100 transition-colors text-xs font-bold"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 sm:mb-5">Solutions</h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { label: 'Amazon Sellers', route: '/solutions/amazon-sellers' },
                  { label: 'Flipkart Sellers', route: '/solutions/flipkart-sellers' },
                  { label: 'Agencies', route: '/solutions/ecommerce-agencies' },
                  { label: 'Brand Managers', route: '/solutions/brand-managers' },
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.route} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 sm:mb-5">Product</h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { label: 'Features', route: '/features/competitor-price-tracking-feature' },
                  { label: 'Pricing', route: '/pricing' },
                  { label: 'Festive Trends', route: '/features/festive-trend-feature' },
                  { label: 'Compare', route: '/compare/insydzvshelium' },
                ].map((item, i) => (
                  <li key={i}>
                    <button onClick={() => router.push(item.route)} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 sm:mb-5">Resources</h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { label: 'Blog', route: '/resources/expert-blog' },
                  { label: 'E-commerce Guides', route: '/resources/guides' },
                  { label: 'Video Tutorials', route: '/resources/videos' },
                  { label: 'Case Studies', route: '/resources/case-studies' },
                  { label: 'Free Tools', route: '/free-tools/free-amazon-product-analyzer' },
                ].map((item, i) => (
                  <li key={i}>
                    <button onClick={() => router.push(item.route)} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 sm:mb-5">Company</h4>
              <ul className="space-y-2 sm:space-y-3">
                 {[
                  { label: 'About', action: () => scrollToSection('About') },
                  { label: 'Our Vision', route: '/about/our-vision' },
                  { label: 'Careers', route: '/about/careers' },
                  { label: 'Contact', route: '/about/contact-us' },
                ].map((item: any, i) => (
                  <li key={i}>
                    {item.label === 'About' ? (
                      <button onClick={item.action} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors text-left">About</button>
                    ) : (
                      <Link href={item.route} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">{item.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
                © 2026 <span className="text-purple-400 font-semibold">Insydz</span>. All rights reserved. Designed & Developed in India 🇮🇳
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .delay-1000 { animation-delay: 1s; }
        /* iOS safe area support for sticky CTA */
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
        /* Prevent horizontal overflow on mobile */
        * { box-sizing: border-box; }
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
        /* Better touch targets on mobile */
        @media (max-width: 640px) {
          button, a { min-height: 36px; }
        }
        /* Prevent text overflow on very small screens */
        @media (max-width: 375px) {
          .text-3xl { font-size: 1.6rem; line-height: 1.2; }
          .text-2xl { font-size: 1.35rem; }
        }
      `}</style>
    </div>
  );
}

