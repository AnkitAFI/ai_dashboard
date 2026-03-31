import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, RefreshCw, Eye, 
  Sparkles, ChevronDown, LineChart, Award,
  Lightbulb, Package, DollarSign, Users,
  Brain, ShoppingCart, Filter, Layers,
  ThumbsUp, MessageCircle, Star, Activity,
  Clock, Crosshair, List, Maximize2, Gauge,
  Menu, Sun, Moon, ShoppingBag, Store,
  Briefcase, Code, Globe, Trophy, ArrowLeft,
  BookOpen, Video, FileText, Flame, Mail, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigate } from 'wouter/use-browser-location';
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

const schemaSoftwareAI = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#ai-recommendations",
  "name": "Insydz AI Recommendations",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/ai-recommendations-feature",
  "description": "AI-powered recommendations for pricing, keywords, and product strategy for Amazon and Flipkart sellers.",
  "featureList": [
    "Prioritized recommendations with revenue impact",
    "Cross-signal analysis (price, reviews, keywords)",
    "One-click implementation",
    "Daily AI updates",
    "India marketplace optimized"
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

const schemaBreadcrumbAI = {
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
      "name": "AI Recommendations",
      "item": "https://insydz.com/features/ai-recommendations-feature"
    }
  ]
};

const schemaFAQAI = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI generate recommendations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz analyzes product data, competitor activity, and market trends to generate actionable recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Are recommendations updated automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Recommendations are updated daily based on market changes."
      }
    },
    {
      "@type": "Question",
      "name": "Can I implement recommendations with one click?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many recommendations can be applied directly, while others include step-by-step guidance."
      }
    },
    {
      "@type": "Question",
      "name": "What types of recommendations will I get?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You will get recommendations for pricing, keywords, inventory, listing optimization, and competitor strategy."
      }
    },
    {
      "@type": "Question",
      "name": "Is this available on the free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Basic AI recommendations are included in the free plan."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate are the AI recommendations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Recommendations are data-driven and based on patterns from successful seller strategies."
      }
    }
  ]
};

const SCHEMAS = [schemaSoftwareAI, schemaBreadcrumbAI, schemaFAQAI];

export default function AIRecommendationsFeaturePage() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-air-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      document.getElementById(`insydz-air-schema-${i}`)?.remove();
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

  const handleGetStarted = () => setLocation("/login");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);
  const toggleMobileMenu = (menuName: string) => setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

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
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const faqs = [
    { question: "How does AI generate recommendations?", answer: "Insydz AI analyzes your product data, competitor behavior, market trends, and sales patterns to provide actionable recommendations tailored to your specific products and goals." },
    { question: "Are recommendations updated automatically?", answer: "Yes! AI continuously monitors your products and market conditions, updating recommendations as situations change. You'll get fresh insights daily." },
    { question: "Can I implement recommendations with one click?", answer: "Many recommendations can be applied directly from the dashboard. For others, we provide step-by-step guidance to make implementation easy." },
    { question: "What types of recommendations will I get?", answer: "You'll get recommendations for pricing, keywords to add/remove, inventory management, listing optimization, competitor response, and more." },
    { question: "Is this available on the free plan?", answer: "Yes! The free plan includes basic AI recommendations. Upgrade for advanced recommendations, priority actions, and automated implementation." },
    { question: "How accurate are the AI recommendations?", answer: "Our AI is trained on millions of successful seller actions. Recommendations are data-backed and proven to increase sales and profit when implemented." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/features/ai-recommendations-feature" />
        <title>AI Product Recommendation Engine for Ecommerce | Insydz</title>
        <meta name="description" content="Insydz's AI engine suggests the right products, pricing, and keywords to act on next. Smarter ecommerce decisions for Amazon & Flipkart sellers. See how." />
        <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schemaSoftwareAI),
    }}
  />

  {/* Breadcrumb */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schemaBreadcrumbAI),
    }}
  />

  {/* FAQ */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schemaFAQAI),
    }}
  />
      </Helmet>

      {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => setLocation('/')}>
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Insydz</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2" ref={dropdownRef}>
              {(["Solutions", "Use Cases"] as const).map((menu) => (
                <div key={menu} className="relative">
                  <button onMouseEnter={() => setActiveDropdown(menu)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 font-medium rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex items-center gap-1">
                    {menu} <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {activeDropdown === menu && (
                    <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      {navigationMenu[menu].map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-2.5 text-left hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                          <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-pink-600 flex-1">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Features Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-pink-600 dark:text-pink-500 font-semibold rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {navigationMenu.Features.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-2.5 text-left hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                        <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-pink-600 flex-1">{item.name}</span>
                        {item.badge && <span className="text-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setLocation('/pricing')} onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 font-medium rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all">Pricing</button>

              {/* Free Tools Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Free Tools')} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Free Tools <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Free Tools' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {navigationMenu["Free Tools"].map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                        <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 flex-1">{item.name}</span>
                        {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Compare')} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {navigationMenu.Compare.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                        <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 font-medium rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {navigationMenu.Resources.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-2.5 text-left hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                        <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-pink-600 flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* About Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('About')} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  About <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${activeDropdown === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'About' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {navigationMenu.About.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                        <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={() => navigate('/login')} onMouseEnter={() => setActiveDropdown(null)} className="ml-1 xl:ml-2 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Button>
              <button className="ml-1 xl:ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
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
              <button onClick={() => { setLocation('/'); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              {(["Solutions", "Use Cases"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg font-medium">
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {navigationMenu[menu].map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg">
                          <span className="flex-shrink-0">{item.icon}</span><span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Features */}
              <div>
                <button onClick={() => toggleMobileMenu('Features')} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm text-pink-600 dark:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg font-semibold">
                  Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Features' && (
                  <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                    {navigationMenu.Features.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg">
                        <span className="flex-shrink-0">{item.icon}</span><span className="flex-1 text-left">{item.name}</span>
                        {item.badge && <span className="text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setLocation('/pricing')} className="block w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg font-medium">Pricing</button>
              {/* Free Tools */}
              <div>
                <button onClick={() => toggleMobileMenu('Free Tools')} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Free Tools <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Free Tools' && (
                  <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                    {navigationMenu["Free Tools"].map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                        <span className="flex-shrink-0">{item.icon}</span><span className="flex-1 text-left">{item.name}</span>
                        {item.badge && <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Compare */}
              <div>
                <button onClick={() => toggleMobileMenu('Compare')} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Compare <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Compare' && (
                  <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                    {navigationMenu.Compare.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                        <span className="flex-shrink-0">{item.icon}</span><span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Resources */}
              <div>
                <button onClick={() => toggleMobileMenu('Resources')} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Resources <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Resources' && (
                  <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                    {navigationMenu.Resources.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                        <span className="flex-shrink-0">{item.icon}</span><span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* About */}
              <div>
                <button onClick={() => toggleMobileMenu('About')} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  About <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'About' && (
                  <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                    {navigationMenu.About.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                        <span className="flex-shrink-0">{item.icon}</span><span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-sm py-2.5">Login</Button>
              <button className="mt-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-pink-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-rose-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600" />
                <span className="text-xs sm:text-sm font-medium text-pink-700">Feature Spotlight</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                AI Recommendations —
                <br />
                <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 bg-clip-text text-transparent">Get Smart Actions,</span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Not Just Data</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI analyzes your products and tells you exactly what to do next.
                <span className="text-pink-700 font-semibold"> Pricing, keywords, inventory, listing optimization — all personalized to your business.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all group">
                  ✨ Get AI Recommendations Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="w-full sm:w-auto border-2 border-pink-600 text-pink-700 dark:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                {["Actionable insights daily", "Personalized to your products", "One-click implementation"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-pink-200 dark:border-pink-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">AI Recommendations</h3>
                    <span className="text-xs bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Brain className="w-3 h-3" /> AI Active
                    </span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {/* High priority card */}
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-400 dark:border-pink-600 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Price Adjustment Needed</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Wireless Earbuds Pro</p>
                          </div>
                        </div>
                        <span className="text-xs bg-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold whitespace-nowrap ml-2">High Priority</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Lower price to ₹1,349 to win Buy Box. Expected impact: +42% sales</p>
                      <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg">Apply Price Change →</Button>
                    </div>
                    {/* Medium priority card */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0"><Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Add Missing Keywords</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Gaming Mouse X1</p>
                          </div>
                        </div>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold ml-2">Medium</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Add "rgb gaming mouse" to backend keywords</p>
                      <div className="text-xs text-blue-600 font-semibold">+15K monthly searches</div>
                    </div>
                    {/* Low stock card */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0"><Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /></div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Restock Alert</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Phone Case Bundle</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold ml-2">Low Stock</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Order 500 units by Feb 10 to avoid stockout</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-pink-600">12</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Active Recommendations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">8</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Implemented Today</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl hidden sm:block">
                  <p className="text-white font-bold text-xs sm:text-sm flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> AI Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM SECTION ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Why Sellers Drown <br /><span className="text-red-600">in Data Without Action</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Too much data, no clear actions", color: "from-red-500 to-orange-500" },
              { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Hours analyzing what to do next", color: "from-orange-500 to-yellow-500" },
              { icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Missing opportunities hidden in data", color: "from-yellow-500 to-orange-500" },
              { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "No idea what to prioritize", color: "from-orange-500 to-red-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-pink-400 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Sellers waste <span className="text-red-600">10+ hours weekly</span> analyzing data</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg">Instead of taking action that grows their business.</p>
          </div>
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"><X className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div>
              <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Without AI Recommendations</h3>
              <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">Analysis paralysis, missed opportunities</p>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                {["Hours spent analyzing dashboards", "Unclear what action to take", "Opportunities slip away"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-300 dark:border-pink-700 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"><Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div>
              <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">With AI Recommendations</h3>
              <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">Clear actions, fast execution, results</p>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                {["AI tells you exactly what to do", "Prioritized by impact & urgency", "One-click implementation"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">How AI Recommendations Work</h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Insydz AI continuously analyzes your business and surfaces actionable recommendations —
              <span className="text-pink-700 font-semibold"> ranked by priority, with clear next steps.</span>
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8 relative z-10">
              {[
                { step: "1", title: "AI monitors your business", detail: "Products, competitors, market trends", icon: <Eye className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> },
                { step: "2", title: "Identifies opportunities", detail: "Price changes, keywords, inventory", icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> },
                { step: "3", title: "Generates recommendations", detail: "Ranked by impact & urgency", icon: <List className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> },
                { step: "4", title: "You implement fast", detail: "One-click or simple steps", icon: <Zap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-pink-300 dark:border-pink-700 rounded-2xl p-5 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-base sm:text-lg font-black text-white">{item.step}</div>
                  <div className="bg-pink-100 dark:bg-pink-900/20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-pink-600 flex items-center justify-center">{item.icon}</div>
                  <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">{item.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg rounded-full shadow-2xl group">
              ✨ Get Your First Recommendations Free
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU CAN DO ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">What You Can Do with AI Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Zap />, title: "Take action in minutes, not hours", detail: "AI does the analysis for you", color: "text-pink-600" },
              { icon: <Target />, title: "Focus on what matters most", detail: "Prioritized by impact", color: "text-purple-600" },
              { icon: <TrendingUp />, title: "Boost sales automatically", detail: "AI finds hidden opportunities", color: "text-green-600" },
              { icon: <Shield />, title: "Prevent costly mistakes", detail: "Alerts before problems happen", color: "text-blue-600" },
              { icon: <Lightbulb />, title: "Learn from AI insights", detail: "Understand what works & why", color: "text-orange-600" },
              { icon: <Maximize2 />, title: "Scale without complexity", detail: "AI handles analysis at scale", color: "text-cyan-600" }
            ].map((outcome, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 hover:border-pink-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 dark:bg-pink-900/20 rounded-xl flex items-center justify-center ${outcome.color}`}>{outcome.icon}</div>
                  <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                </div>
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base leading-relaxed mb-1">{outcome.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE DEPTH ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Smart AI-Powered Insights</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {[
              { feature: "Price Recommendations", benefit: "Win Buy Box without losing margin", icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-green-500 to-emerald-500" },
              { feature: "Keyword Optimization", benefit: "Add high-impact keywords", icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-blue-500 to-cyan-500" },
              { feature: "Inventory Alerts", benefit: "Avoid stockouts & overstocking", icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-orange-500 to-red-500" },
              { feature: "Listing Improvements", benefit: "Boost conversion with better copy", icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-purple-500 to-pink-500" },
              { feature: "Competitor Responses", benefit: "React to competitor moves", icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-red-500 to-orange-500" },
              { feature: "Priority Actions", benefit: "Know what to do first", icon: <Gauge className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-indigo-500 to-purple-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-pink-400 hover:shadow-xl transition-all">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-3 sm:mb-4`}>{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-xs sm:text-sm">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600 flex-shrink-0" />{item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Manual Analysis vs AI Recommendations</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-x-auto border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Aspect</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Manual Analysis</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20">AI Recommendations</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: "Time to Insights", manual: "Hours daily", insydz: "Instant & automatic" },
                  { aspect: "Action Clarity", manual: "Unclear what to do", insydz: "Exact next steps provided" },
                  { aspect: "Prioritization", manual: "Guessing importance", insydz: "Ranked by impact" },
                  { aspect: "Opportunity Detection", manual: "Easy to miss", insydz: "AI finds hidden gems" },
                  { aspect: "Implementation", manual: "Complex & manual", insydz: "One-click or simple steps" }
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.aspect}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{row.manual}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center bg-pink-50 dark:bg-pink-900/20">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-8 sm:px-10 py-4 sm:py-6 text-sm sm:text-lg rounded-full shadow-xl">
              ✨ Get AI-Powered Insights
            </Button>
          </div>
        </div>
      </section>

      {/* ─── PLG FREE PLAN ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Start Free. Get Smarter Recommendations.</h2>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-300 dark:border-pink-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-baseline gap-2 mb-2 sm:mb-4">
                <span className="text-5xl sm:text-6xl font-black text-pink-600">₹0</span>
                <span className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400">/ Forever</span>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300">Free Plan Includes:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {["Basic AI recommendations", "Daily priority actions", "Simple implementation guides", "Amazon & Flipkart support"].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-pink-600">Upgrade Teaser:</span> Unlock advanced recommendations, one-click implementation, and unlimited insights on paid plans.
              </p>
            </div>
            <div className="text-center">
              <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg rounded-full shadow-2xl">
                ✨ Start Getting AI Recommendations Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Is AI Recommendations Right for You?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-300 dark:border-pink-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Perfect For</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {["Busy sellers wanting clear next steps", "Those overwhelmed by data & dashboards", "Sellers wanting to act faster than competitors", "Agencies managing multiple accounts", "Anyone tired of analysis paralysis"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Less Useful For</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {["Sellers who prefer manual control over everything", "Those who don't want AI assistance", "Completely passive sellers"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">AI Recommendations – FAQs</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-pink-400 transition-all">
                <button onClick={() => toggleFaq(i)} className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left gap-3">
                  <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm border-t border-gray-100 dark:border-gray-700 pt-3">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RELATED FEATURES ────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Related Features</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "Price Optimization", icon: <DollarSign />, color: "from-green-500 to-emerald-500", route: "/features/price-optimization-feature" },
              { title: "Keyword Tracking", icon: <Search />, color: "from-blue-500 to-cyan-500", route: "/features/keyword-rank-tracking-feature" },
              { title: "Product Research", icon: <Target />, color: "from-indigo-500 to-purple-500", route: "/features/product-research-feature" },
              { title: "Competitor Tracking", icon: <Users />, color: "from-orange-500 to-red-500", route: "/features/competitor-price-tracking-feature" },
              { title: "Review Analytics", icon: <MessageCircle />, color: "from-purple-500 to-pink-500", route: "/features/review-analytics-feature" },
              { title: "WhatsApp Alerts", icon: <Bell />, color: "from-emerald-500 to-green-500", route: "/features/whatsapp-alerts-feature" }
            ].map((feature, i) => (
              <div key={i} onClick={() => feature.route && setLocation(feature.route)} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 hover:border-pink-400 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{feature.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-pink-600 transition-colors">{feature.title}</h3>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 mt-1 sm:mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
            Stop Analyzing Data.
            <br />
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Start Taking Smart Actions.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg rounded-full shadow-2xl group">
              ✨ Get AI Recommendations Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={() => setLocation("/")} size="lg" variant="outline" className="w-full sm:w-auto border-2 border-pink-600 text-pink-700 dark:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 font-semibold px-8 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg rounded-full">
              Explore All Features →
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-pink-300 dark:border-pink-700 p-3 sm:p-4 shadow-2xl z-40">
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3 sm:py-4 rounded-full shadow-xl text-sm sm:text-base">
          ✨ Get AI Recommendations Free
        </Button>
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
