"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, MessageCircle, ThumbsUp, ThumbsDown,
  TrendingUp, Star, Heart, ChevronDown, Sparkles, Eye, Bell, Clock, Target,
  Menu, Sun, Moon, ArrowLeft, BookOpen, Video, FileText,
  ShoppingBag, Store, Briefcase, Users, Code, Globe, Trophy, Package,
  TrendingDown, Search, Zap, X,
  Presentation,
  Flame, Facebook, Instagram, Twitter, Linkedin,
  BarChart3,
  AlertCircle, LayoutGrid
} from "lucide-react";
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
    { name: "Track Competitor Prices", icon: <TrendingDown className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
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
    { name: "Free Amazon Product Analyzer", icon: <Target className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
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


export default function ReviewAnalyticsFeaturePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Manually reading 1000s of reviews",
      description: "Takes hours every week and still only covers a fraction of reviews.",
    },
    {
      icon: <ThumbsDown className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Negative trends are missed",
      description: "Until the rating has already dropped by which point the ranking damage is done.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Opportunity to improve ratings is delayed",
      description: "Weeks pass before the right fix is identified and implemented.",
    },
    {
      icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Poor prioritization of improvements",
      description: "Without data, sellers fix the last complaint they read not the most impactful one.",
    },
  ];

  const indiaPains = [
    {
      title: "Most reviews are in Hindi and most tools can't read them",
      description:
        "60–70% of Amazon India reviews for mass-market products are written in Hindi or Hinglish. Tools built for Western markets process them incorrectly or skip them entirely. That means the majority of your customer feedback is invisible.",
    },
    {
      title: "By the time you notice the rating drop, you've already lost the ranking",
      description:
        "Amazon India's ranking algorithm reacts to rating velocity the speed of new reviews and sentiment shift. A wave of negative reviews during a sale event can drop your listing 10 positions before you've even opened the seller app.",
    },
    {
      title: "Flipkart review data is almost never tracked",
      description:
        "Most Amazon review analyzer tools only cover Amazon listings. Sellers running the same product on Flipkart get zero insight from reviews there missing complaints that affect both platform rankings and product quality decisions.",
    },
    {
      title: "You fix the wrong thing because you can't see what's most complained about",
      description:
        "Without AI clustering, sellers act on the last review they read not the most common complaint. A product with 43 packaging complaints and 8 size complaints gets a size fix. The packaging issue keeps bleeding 1-star reviews for another 3 months.",
    },
  ];

  const indiaFirstFeatures = [
    {
      feature: "Hindi + Hinglish review analysis accurately",
      meaning: "100% of your customer feedback read and understood not skipped or approximated. No other Indian competitor offers this.",
    },
    {
      feature: "Amazon India + Flipkart in one view",
      meaning: "Track sentiment and complaints across both major Indian marketplaces from one dashboard.",
    },
    {
      feature: "WhatsApp alerts — not email digests",
      meaning: "Review trend alerts arrive where you already are on WhatsApp so you act in real time, not after the damage.",
    },
    {
      feature: "Ranked by revenue impact, not just frequency",
      meaning: "Know which complaint to fix first based on its rating impact not just how many times it appears.",
    },
    {
      feature: "Competitor review benchmarking",
      meaning: "See what customers complain about in competitor listings and make your product the obvious fix before they do.",
    },
    {
      feature: "Tells you the fix, not just the problem",
      meaning: "Every complaint cluster includes a recommended action: packaging change, listing update, or product quality fix.",
    },
  ];

  const testimonials = [
    {
      quote:
        "I had 800+ reviews and was manually spot-checking maybe 30. Insydz showed me in 5 minutes that 41 reviews mentioned the same delivery damage issue all in Hindi. Fixed the packaging, rating went from 3.8 to 4.2 in 8 weeks.",
      name: "Neha S.",
      role: "Home appliances seller, Delhi · Amazon India",
    },
    {
      quote:
        "The competitor review analysis is what surprised me most. I could see exactly what customers hate about my top 3 competitors. I fixed those issues before launch and used them in my listing. My new product launched at 4.5 average.",
      name: "Vikram P.",
      role: "D2C kitchenware brand, Bengaluru · Amazon India + Flipkart",
    },
    {
      quote:
        "Managing 14 seller accounts, review monitoring used to take 3 people half a day every week. Insydz replaced that entire process it surfaces the top issue per account each Monday morning on WhatsApp. We now act on feedback in hours, not weeks.",
      name: "Ananya K.",
      role: "E-commerce agency, Mumbai · 14 seller accounts",
    },
  ];

  const faqs = [
    {
      question: "How does AI analyze reviews?",
      answer:
        "Insydz's AI reads every customer review on your Amazon India and Flipkart listings in Hindi, Hinglish, and English. It uses natural language processing to classify each review as positive, neutral, or negative, extract main topics, and group similar complaints into ranked clusters. The AI then shows which issue has the highest impact on your star rating — so you know which fix to prioritize. Analysis runs automatically as new reviews appear, with no manual input required.",
    },
    {
      question: "Can I track multiple products at once?",
      answer:
        "Yes. Insydz tracks review analytics across all your products simultaneously on both Amazon India and Flipkart. The free plan covers up to 25 products. Paid plans (₹1,999/month and ₹2,999/month) expand the product limit. The dashboard shows your full product catalogue sorted by sentiment score so you can see which listings need the most urgent attention at a glance.",
    },
    {
      question: "Does it work for Amazon India & Flipkart?",
      answer:
        "Yes. Insydz is one of the only review analytics tools that covers both Amazon India and Flipkart from a single dashboard. Most global review monitoring platforms cover Amazon.com only or don't support Flipkart at all. Insydz was built specifically for Indian marketplace sellers with full support for both platforms, Hindi and Hinglish review analysis, and WhatsApp-based alerts.",
    },
    {
      question: "Can I get alerts for negative trends?",
      answer:
        "Yes. Set thresholds for negative sentiment for example, alert when a specific complaint appears more than 10 times in 7 days, or when star rating drops below 4.2. When a threshold is crossed, Insydz sends a WhatsApp notification with the specific complaint theme, its frequency, and a recommended action. This means you act on a review problem before it becomes a rating problem.",
    },
    {
      question: "Is there a free plan?",
      answer:
        "Yes. Insydz has a permanent free plan not a trial. It includes review sentiment analysis for up to 25 products, complaint clustering, and WhatsApp alerts. No credit card required, no expiry date. Paid plans start at ₹1,999/month and include unlimited products, competitor review analysis, and advanced trend reporting.",
    },
    {
      question: "Can I export insights?",
      answer:
        "Yes. Review analytics reports including complaint clusters, sentiment trends, and star rating breakdowns can be exported as PDF or CSV from the Insydz dashboard. This is particularly useful for agencies sharing monthly review performance reports with seller clients, or for brand managers presenting customer feedback data to product teams.",
    },
  ];

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
      

      {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg"
          : "bg-background dark:bg-gray-900/80 backdrop-blur-none"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Insydz Logo"
                    className="w-9 h-auto sm:w-10 sm:h-auto shadow-lg transform transition-transform group-hover:scale-110 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Insydz
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-3" ref={dropdownRef}>
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as const).map((menuKey) => (
                <div className="relative" key={menuKey}>
                  <button
                    onMouseEnter={() => setActiveDropdown(menuKey)}
                    className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                      menuKey === "Features"
                        ? "text-purple-600 dark:text-purple-500 font-semibold hover:bg-purple-50"
                        : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
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
                        <button
                          key={i}
                          onClick={() => handleMenuItemClick(item)}
                          className="w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
                        >
                          <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                          <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">{item.badge}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => router.push("/pricing")}
                className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all"
              >
                Pricing
              </button>

              <Button
                onClick={() => router.push("/login")}
                className="ml-1 xl:ml-2 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Login
              </Button>
              <button
                className="ml-1 xl:ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile toggle */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1 sm:space-y-2">
              <button
                onClick={() => { router.push("/"); setIsMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>

              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button
                    onClick={() => toggleMobileMenu(menuKey)}
                    className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${
                      menuKey === "Features"
                        ? "text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {menuKey}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleMenuItemClick(item)}
                          className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                        >
                          {item.icon}
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => router.push("/pricing")}
                className="block w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium"
              >
                Pricing
              </button>
              <Button
                onClick={() => { router.push("/login"); setIsMenuOpen(false); }}
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-sm py-2.5"
              >
                Login
              </Button>
              <button
                className="mt-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-pink-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-base sm:text-lg">🇮🇳</span>
                <span className="text-xs sm:text-sm font-medium text-purple-700">Built for Indian Sellers</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Review Analytics 
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Understand Customers
                </span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Without Reading 1000s of Reviews</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI-powered <strong>review analytics software</strong> analyzes every customer review
                across your Amazon India and Flipkart listings in Hindi and English to show you
                what customers love, hate, and want fixed.{" "}
                <span className="text-purple-700 dark:text-purple-400 font-semibold">
                  So you can act before ratings drop.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group"
                >
                  Start Free Review Analysis
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("feature-depth")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg rounded-full"
                >
                  See How It Works →
                </Button>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                {["Hindi + English analysis", "Amazon India & Flipkart", "WhatsApp-first alerts"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sentiment Analysis Widget */}
            <div className="relative bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl mt-4 lg:mt-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Sentiment Analysis</h3>
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold">Live</span>
              </div>

              {/* Sentiment scores */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                  {  value: "68%", icon: <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto" />, bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-700" },
                  {  value: "22%", icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mx-auto" />, bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700" },
                  {  value: "10%", icon: <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mx-auto" />, bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-700" },
                ].map((s, i) => (
                  <div key={i} className={`text-center p-2 sm:p-4 ${s.bg} border ${s.border} rounded-xl`}>
                    {s.icon}
                    <p className="font-black text-base sm:text-xl text-gray-900 dark:text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Star rating breakdown */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                {[
                  { stars: "5★", pct: 62, color: "bg-green-500" },
                  { stars: "4★", pct: 18, color: "bg-green-300" },
                  { stars: "3★", pct: 9, color: "bg-yellow-400" },
                  { stars: "2★", pct: 6, color: "bg-orange-400" },
                  { stars: "1★", pct: 5, color: "bg-red-500" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-5 sm:w-6">{row.stars}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div className={`${row.color} h-1.5 sm:h-2 rounded-full`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 sm:w-8">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Top complaint highlight */}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Top Complaint 23 mentions</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">"Packaging damaged during delivery" fix to improve rating</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl hidden sm:block">
                <p className="text-white font-bold text-xs sm:text-sm">AI-Powered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHY SELLERS MISS KEY INSIGHTS ───────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Sellers Miss Key Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {painPoints.map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-md group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base leading-snug">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Stat callout */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-400 dark:border-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              A 1-star rating drop on Amazon India can cost you{" "}
              <span className="text-purple-600">20–40% of organic traffic</span> overnight.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">Most sellers see the rating fall but never find out which complaint caused it.</p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: BUILT FOR SMART REVIEW INTELLIGENCE ─────────────────── */}
      <section id="feature-depth" className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Built for Smart Review Intelligence
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three capabilities that work together so you always know what customers are saying,
              which complaints matter most, and when to act.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12">
            {[
              {
                feature: "Real-Time Sentiment Analysis",
                description: "AI reads every new review the moment it appears and updates your sentiment score so negative trends surface in hours, not weeks.",
                benefit: "Identify negative trends immediately",
                icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />,
                color: "from-purple-600 to-pink-600",
              },
              {
                feature: "Customer Highlight Extraction",
                description: "AI clusters thousands of reviews into the top 5 issues customers mention most in Hindi and English with verbatim quotes and frequency counts.",
                benefit: "See key points at a glance",
                icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />,
                color: "from-indigo-500 to-purple-500",
              },
              {
                feature: "Automated WhatsApp Alerts",
                description: "When a complaint theme crosses a threshold you set say, 15 mentions in 7 days you get a WhatsApp alert with the issue and recommended fix. Not an email. WhatsApp.",
                benefit: "Never miss critical feedback",
                icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8" />,
                color: "from-red-500 to-pink-500",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-xl transition-all">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-3 sm:mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{item.description}</p>
                <p className="text-purple-600 dark:text-purple-400 flex items-center gap-2 text-xs sm:text-sm font-semibold">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" /> {item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: WHY INDIAN SELLERS STRUGGLE ─────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Indian Sellers Struggle to Act on Customer Feedback
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A 1-star review drop on Amazon India can cost you 20–40% of organic traffic overnight.
              Most sellers see the rating fall but never find out which complaint caused it, because
              reading 800 reviews manually isn't a business strategy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {indiaPains.map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm flex-shrink-0 mt-1">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">{pain.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{pain.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: SENTIMENT ANALYSIS FEATURE ROW ──────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                Know in Seconds If Customers Love or Hate Your Product Across Every Review
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Insydz's AI-powered <strong>sentiment analysis</strong> reads every customer review
                on your Amazon India and Flipkart listings in real time. Positive, neutral, or
                negative with a live score that updates the moment new reviews appear.
                No manual reading. No sampling.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Live sentiment score updated with every new review",
                  "Separate scores per product, per marketplace",
                  "Trend graph see if sentiment is improving or declining",
                  "Alert when negative sentiment crosses your threshold",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                See full use case:{" "}
                <a href="/use-cases/analyze-customer-reviews" className="text-purple-600 underline">
                  review analysis for Amazon India
                </a>
              </p>
            </div>

            {/* Review Intelligence Widget */}
            <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mt-4 lg:mt-0">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-4 sm:mb-6">Review Intelligence</h3>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {[
                  { stars: "5★", pct: 62, color: "bg-green-500", label: "Excellent" },
                  { stars: "4★", pct: 18, color: "bg-green-300", label: "Good" },
                  { stars: "3★", pct: 9, color: "bg-yellow-400", label: "Average" },
                  { stars: "2★", pct: 6, color: "bg-orange-400", label: "Poor" },
                  { stars: "1★", pct: 5, color: "bg-red-500", label: "Critical" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 w-7 sm:w-8">{row.stars}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                      <div className={`${row.color} h-2 sm:h-3 rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 sm:w-8">{row.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-xl p-3 sm:p-4">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Top Complaint 23 mentions</p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">"Packaging damaged during delivery" fix to improve rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: AI REVIEW CLUSTERING ────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left: Complaint Cluster Widget */}
            <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl order-2 lg:order-1">
              <h3 className="font-bold text-sm sm:text-base text-white mb-4 sm:mb-6">Complaint Clusters Mixer Grinder</h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    cluster: "Packaging",
                    freq: "43 mentions",
                    impact: "−0.4★",
                    example: '"Daibba tuta hua tha" / "Box damaged on arrival, product scratched"',
                    color: "border-red-500 bg-red-900/30",
                    badge: "bg-red-500",
                    label: "Fix First",
                  },
                  {
                    cluster: "Motor Noise",
                    freq: "27 mentions",
                    impact: "−0.2★",
                    example: '"Bahut shor karta hai" / "Very noisy after 2 months of use"',
                    color: "border-yellow-500 bg-yellow-900/20",
                    badge: "bg-yellow-500",
                    label: "Monitor",
                  },
                  {
                    cluster: "Value for Money",
                    freq: "61 mentions",
                    impact: "+0.3★",
                    example: '"Paise vasool" / "Best value for money in this category"',
                    color: "border-green-500 bg-green-900/20",
                    badge: "bg-green-500",
                    label: "Highlight",
                  },
                ].map((row, i) => (
                  <div key={i} className={`border-2 ${row.color} rounded-xl p-3 sm:p-4`}>
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold text-white ${row.badge} px-2 py-0.5 rounded-full whitespace-nowrap`}>{row.label}</span>
                        <span className="text-white font-semibold text-xs sm:text-sm">{row.cluster}</span>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-xs text-gray-400 whitespace-nowrap">{row.freq}</p>
                        <p className="text-xs font-bold text-gray-300">{row.impact}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs italic">{row.example}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 sm:mt-4 bg-purple-900/40 border border-purple-500 rounded-xl p-3 sm:p-4">
                <p className="text-purple-300 text-xs font-semibold">
                 AI: Fix packaging first 43 complaints, highest rating impact. Estimated rating recovery: +0.4★ over 60 days.
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                Find the 3 Complaints Costing You 1-Star Reviews Without Reading a Single Review
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Most sellers read reviews one at a time. Insydz reads all of them at once and groups
                similar complaints into clusters ranked by how often they appear and how much
                they're hurting your rating. Fix the top cluster first. Watch the star rating recover.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "AI clusters complaints and praise into named themes",
                  "Each cluster shows frequency, sentiment impact, and verbatim examples",
                  "Clusters in Hindi and Hinglish accurately, not approximated",
                  "Competitor comparison see what their customers complain about too",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{point}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full shadow-xl group"
              >
                See Your Complaint Clusters Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MID-PAGE CTA BANNER */}
      <section className="py-10 sm:py-12 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-2">Try all features free no credit card required.</h2>
          <p className="text-xs sm:text-sm md:text-base text-purple-100 mb-4 sm:mb-6">Start free and experience real insights on your own products.</p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base rounded-full shadow-2xl"
          >
            Start Free Review Analysis
          </Button>
        </div>
      </section>

      {/* ─── SECTION 7: AUTOMATED REVIEW ALERTS ─────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                Get Alerted When Customer Feedback Hits a Danger Level Before It Tanks Your Rating
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Set thresholds for what matters: a complaint mentioned more than 10 times, negative
                sentiment climbing above 15%, or your star rating dropping below 4.2. The moment it
                happens, Insydz sends a{" "}
                <a href="/features/whatsapp-alerts" className="text-purple-600 underline">WhatsApp review alert</a>{" "}
                with the specific complaint theme and a suggested action.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "WhatsApp alert when negative complaint count spikes",
                  "Alert includes the top complaint text and frequency",
                  "Suggested action: listing fix, packaging change, customer response",
                  "Covers Amazon India and Flipkart simultaneously",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp alert mockups */}
            <div className="space-y-3 sm:space-y-4 mt-4 lg:mt-0">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Review Alert</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Insydz:</strong> 23 reviews mention packaging damage on Mixer Grinder.
                  Sentiment −12% this week. Suggested fix: reinforce packaging with double-wall
                  box before next shipment.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Rating Alert</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your rating dropped 4.3 → 4.1 in 5 days. Root cause: packaging cluster
                  (43 mentions). Act now to stop further decline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: REAL SELLER SCENARIO — KAVITA ───────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              What Most Review Analytics Tools Don't Tell You
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
              Most <strong>product review analytics software</strong> counts reviews. Insydz reads them
              in Hindi and English and tells you exactly which fix will recover your rating the fastest.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-white font-bold text-sm sm:text-base md:text-lg">
                Kavita's Mixer Grinder The Complaint That Was Hiding in Hindi
              </h3>
              <p className="text-purple-200 text-xs sm:text-sm">Kitchen Appliances, Amazon India + Flipkart</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] sm:min-w-[560px]">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Scenario</th>
                    <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-xs font-bold text-red-600 uppercase">Without Insydz</th>
                    <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-xs font-bold text-green-600 uppercase">With Insydz</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { scenario: "Situation", without: "Rating dropped 4.4★ → 3.9★ over 6 weeks. Sales down 35%.", with: "Same product, same situation" },
                    { scenario: "What she saw", without: "Read 20 reviews manually found motor noise complaints", with: "AI clustered 43 Hindi packaging complaints immediately" },
                    { scenario: "Action taken", without: "Spent ₹35,000 sourcing quieter motor variant", with: "Changed to double-wall packaging ₹18/unit extra" },
                    { scenario: "Rating result", without: "Stayed at 3.9★ wrong problem fixed", with: "Recovered to 4.3★ within 60 days" },
                    { scenario: "Complaint volume", without: "Packaging complaints continued at 43/month", with: "Dropped to 3/month within 60 days" },
                    { scenario: "Revenue outcome", without: "Sales remained 35% below peak", with: "₹2.8L additional revenue in Q1" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.scenario}</td>
                      <td className="px-3 sm:px-5 py-2 sm:py-3 text-left">
                        <div className="flex items-start justify-left gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-left">{row.without}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-2 sm:py-3 text-left bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-start justify-left gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-900 dark:text-white font-medium text-left">{row.with}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Callout */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-400 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center">
            <p className="text-sm sm:text-base md:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Kavita pays ₹1,999/month for Insydz. Packaging fix cost ₹18/unit (₹18,000 on 1,000 units).
              The 0.4-star recovery and ranking improvement returned ₹2.8L in Q1 revenue — a{" "}
              <span className="text-purple-600">140x return</span> on the cost of the fix.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm italic">
              "She fixed the wrong thing for 6 weeks. The real complaint was written in Hindi and every review analytics tool she'd tried had silently skipped it."
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: INDIA-FIRST ADVANTAGE ───────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              How Insydz Review Analytics Is Built Differently
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Most <strong>online review monitoring platforms</strong> were built for English-language
              markets. Insydz was built for India where most product feedback isn't in English, and
              where the platforms your customers use aren't covered by global tools.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {indiaFirstFeatures.map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm mb-3 sm:mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-xs sm:text-sm">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
            <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg">
              <span className="text-purple-400 font-bold">What most Amazon review analyzer tools don't tell you:</span>{" "}
              Review volume is not the metric to optimize. Rating velocity how quickly sentiment is
              shifting is what determines your ranking position. Insydz tracks both, and alerts you on
              the leading indicator before the trailing one (your star rating) takes the hit.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Indian Sellers Who Fixed Products They Didn't Know Were Broken
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed italic mb-3 sm:mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{t.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: FAQ ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
              Review Analytics FAQs
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Each answer leads with a direct response for Google Featured Snippet and AI Overview extraction.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-purple-400 transition-all">
                <button
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left gap-3"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
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

      {/* ─── SECTION 13: FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Stop Guessing Customer Feedback.
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Act Before Ratings Drop.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[
              {
                icp: "New Seller",
                headline: "Just starting — understand your first reviews",
                cta: "Start Free →",
                action: handleGetStarted,
                style: "from-purple-600 to-pink-600",
              },
              {
                icp: "Growing Seller",
                headline: "Improve ratings and protect ranking",
                cta: "Try Growth Plan →",
                action: () => router.push("/pricing"),
                style: "from-pink-600 to-rose-500",
              },
              {
                icp: "Agency",
                headline: "Manage review intelligence for all clients",
                cta: "Book Demo →",
                action: handleGetStarted,
                style: "from-indigo-600 to-purple-600",
              },
            ].map((card, i) => (
  <div
    key={i}
    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 text-center hover:shadow-xl transition-all flex flex-col items-center h-full"
  >
    <div
      className={`inline-flex text-xs font-bold text-white bg-gradient-to-r ${card.style} px-3 py-1 rounded-full mb-3 sm:mb-4`}
    >
      {card.icp}
    </div>

    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed flex-grow">
      {card.headline}
    </p>

    <Button
      onClick={card.action}
      className={`w-full bg-gradient-to-r ${card.style} text-white font-bold rounded-full text-xs sm:text-sm py-2.5 sm:py-3 mt-auto`}
    >
      {card.cta}
    </Button>
  </div>
))}
            
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {["No credit card required", "Setup in 2 minutes", "Cancel anytime"].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-purple-300 dark:border-purple-700 p-3 sm:p-4 shadow-2xl z-40">
        <Button
          onClick={handleGetStarted}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 rounded-full shadow-xl text-sm sm:text-base"
        >
          👉 Start Free Review Analysis
        </Button>
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

