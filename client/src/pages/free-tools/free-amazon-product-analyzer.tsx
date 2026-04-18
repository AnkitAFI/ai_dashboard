import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown, X,
  Star, BarChart2, LogIn, Lock, Flame, Mail, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { navigate } from 'wouter/use-browser-location';
import { Helmet } from 'react-helmet-async';

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Free Amazon Product Analyzer",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Ecommerce Analytics Tool",
    "operatingSystem": "Web",
    "url": "https://insydz.com/free-tools/free-amazon-product-analyzer",
    "description": "Analyze product demand, competition, reviews, and pricing trends before you invest — built specifically for Amazon India Sellers who don't want to guess.",
    "inLanguage": "en-IN",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR", "availability": "https://schema.org/InStock" },
    "publisher": { "@type": "Organization", "name": "Insydz", "url": "https://insydz.com" }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is the Amazon product analyzer free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz's Amazon product analyzer is completely free with no credit card required. You can analyze Amazon India products instantly after creating a free account." } },
      { "@type": "Question", "name": "Does it work for Amazon India only?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, the analyzer is optimized specifically for Amazon India (amazon.in), providing accurate demand, pricing, and competition insights for the Indian marketplace." } },
      { "@type": "Question", "name": "How accurate is the demand estimate?", "acceptedAnswer": { "@type": "Answer", "text": "Demand signals are derived from real Amazon India marketplace data including search trends, sales velocity signals, and review recency patterns." } },
      { "@type": "Question", "name": "Is login required?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, a free account is required to use the tool. It allows saving analysis history and accessing additional features." } },
      { "@type": "Question", "name": "What is the difference between the free tool and the full platform?", "acceptedAnswer": { "@type": "Answer", "text": "The free tool provides demand level, pricing range, and opportunity insights. Paid plans add competitor tracking, keyword monitoring, alerts, forecasting, and margin calculations." } }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Analyse an Amazon India Product for Free",
    "description": "Use the Insydz product analyzer to evaluate any Amazon India product opportunity in 3 simple steps.",
    "totalTime": "PT2M",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Enter the Product ASIN", "text": "Paste any Amazon India product URL or ASIN into the analyzer." },
      { "@type": "HowToStep", "position": 2, "name": "Analyze Market Data", "text": "The tool evaluates demand, competition, pricing, and reviews." },
      { "@type": "HowToStep", "position": 3, "name": "Get Insights", "text": "Receive demand trends, pricing benchmarks, and improvement opportunities instantly." }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://insydz.com/free-tools" },
      { "@type": "ListItem", "position": 3, "name": "Free Amazon Product Analyzer", "item": "https://insydz.com/free-tools/free-amazon-product-analyzer" }
    ]
  }
];

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


export default function FreeAmazonProductAnalyzerPage() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
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
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-amazon-analyzer-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-amazon-analyzer-schema-${i}`);
      if (el) el.remove();
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

  const handleGetStarted = () => setLocation("/signup");
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
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleAnalyze = () => {
    if (!isLoggedIn) { setLocation('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    { id: 'faq-1', question: 'Is this Amazon product analyzer free?', answer: 'Yes, completely free. No credit card, no login required. Just enter an ASIN or product URL and get instant analysis.' },
    { id: 'faq-2', question: 'Does it work for Amazon India only?', answer: 'Currently, this tool is optimized for Amazon India (amazon.in). It understands INR pricing, India-specific demand signals, and competition dynamics in the Indian marketplace.' },
    { id: 'faq-3', question: 'How accurate is the demand estimate?', answer: 'The demand estimate is based on structured marketplace signals including review velocity, BSR trends, and category benchmarks. It is an indicator not a guarantee and is useful for directional decision-making.' },
    { id: 'faq-4', question: 'Can I analyze multiple products?', answer: 'Yes, you can analyze as many products as you want. Simply enter a new ASIN or URL each time. For bulk analysis and continuous tracking, consider upgrading to the full Insydz platform.' },
    { id: 'faq-5', question: 'Is login required?', answer: 'No. The free tool works without any account or login. If you want to save reports, track over time, or get deeper insights, you can sign up for free.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/free-tools/free-amazon-product-analyzer" />
        <title>Free Amazon Product Analyzer for Indian Sellers</title>
        <meta name="description" content="Analyze product demand, competition, reviews, and pricing trends before you invest-built specifically for Amazon India Sellers who don't want to guess." />
      </Helmet>
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

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>

              {/* Solutions */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Solutions')} className="px-3 py-2 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-semibold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Solutions' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
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

              {/* Use Cases */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Use Cases')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Use Cases <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Use Cases' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Use Cases"].map((item, i) => (
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

              {/* Features */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Features.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
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

               <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
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

              {/* Compare */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Compare')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Compare.map((item, i) => (
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

              {/* Resources */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Resources.map((item, i) => (
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

              <a href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
                Login
              </a>

              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
               <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>

              {(['Solutions', 'Use Cases', 'Features', 'Compare', 'Resources'] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button onClick={() => toggleMobileMenu(menuKey)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">
                    {menuKey}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                         item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                            {item.icon} {item.name}
                            {item.badge && <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
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

              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">Pricing</Link>
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
                          {item.icon}{item.name}
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

              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-2 rounded-lg font-semibold block">Login</a>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Free Tool · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Amazon Product Analyzer
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">for Indian Sellers</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Analyze product demand, competition, reviews, and pricing trends before you invest — built specifically for Amazon India sellers who don't want to guess.
          </p>

          {/* ── LOGIN GATE (shown when not logged in) ── */}
          {!isLoggedIn ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-2xl flex items-center justify-center shadow-inner">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto">Create a free Insydz account or log in to start analyzing Amazon products instantly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                   <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            /* ── TOOL INPUT (shown when logged in) ── */
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-orange-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={asinInput}
                  onChange={(e) => setAsinInput(e.target.value)}
                  placeholder="Enter Amazon product URL or ASIN (e.g. B09XYZ123)"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 transition-colors text-sm"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                >
                  {analyzing ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
                  ) : (
                    <><BarChart3 className="w-4 h-4" /> Analyze Product</>
                  )}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in — ready to analyze.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL DOES ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-4">What This Free Product Analyzer Shows You</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">Four critical data points every seller needs before investing in a product.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <TrendingUp className="w-6 h-6" />, title: "Estimated Demand Signals", desc: "Understand if a product has real buyer demand or low traction." },
              { icon: <IndianRupee className="w-6 h-6" />, title: "Competitor Pricing Range", desc: "See the ₹ price band across top sellers in the category." },
              { icon: <Star className="w-6 h-6" />, title: "Review Sentiment Summary", desc: "Spot common complaints and what buyers actually praise." },
              { icon: <Target className="w-6 h-6" />, title: "Opportunity Insights", desc: "Understand where gaps exist and if this product is worth entering." },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all group">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHY ANALYSIS MATTERS ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-6">Why Amazon Product Analysis Is Critical</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Most sellers lose money because they launch without validating demand, ignore competitor strength, misjudge pricing, and miss review insights. This tool helps reduce guesswork before investing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              "Launch without validating demand",
              "Ignore competitor strength",
              "Misjudge pricing strategy",
              "Miss review-driven insights",
            ].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOSS FRAMING ─── */}
      <section className="py-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Skip Product Analysis?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                "Overstock unsellable inventory",
                "Enter saturated categories",
                "Undercut pricing without profit",
                "Ignore review-driven product gaps",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">Most sellers only realize mistakes after spending money.</p>
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN or Product Link", desc: "Paste any Amazon India product URL or ASIN code." },
              { step: "02", icon: <BarChart3 className="w-7 h-7" />, title: "Insydz Analyzes", desc: "We process demand, competition, reviews, and pricing signals." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Insights", desc: "Receive a clear snapshot to make an informed decision." },
            ].map((s, i) => (
              <div key={i} className="relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all">
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">{s.step}</div>
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500 mb-5 mt-2">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                {i < 2 && <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-300 dark:text-orange-700 z-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── SAMPLE OUTPUT / EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-3">Example Product Analysis Report</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Here's what a typical analysis looks like so you know exactly what to expect.</p>

          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-5 flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">Product Analysis Report</p>
                <p className="text-white font-bold text-lg mt-0.5">Stainless Steel Water Bottle · B09EXAMPLE</p>
              </div>
              <div className="text-right">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Amazon India</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700 p-0">
              {[
                { label: "Demand Level", value: "Medium", sub: "Moderate buyer interest", icon: <TrendingUp className="w-5 h-5" />, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", indicator: "▲" },
                { label: "Competition", value: "High", sub: "Many established sellers", icon: <Users className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", indicator: "▼" },
                { label: "Avg. Price Band", value: "₹799–₹1,099", sub: "INR price range", icon: <IndianRupee className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", indicator: "" },
                { label: "Review Insight", value: "Poor packaging", sub: "Top complaint from buyers", icon: <MessageCircle className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", indicator: "" },
              ].map((metric, i) => (
                <div key={i} className="p-6 flex flex-col gap-2">
                  <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color}`}>
                    {metric.icon}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{metric.label}</p>
                  <p className={`text-xl font-black ${metric.color}`}>{metric.value} <span className="text-base">{metric.indicator}</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{metric.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISUAL DEMAND GRAPH ─── */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-3">Visual Demand & Competition Snapshot</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-sm">This visual summary helps sellers understand opportunity in seconds.</p>

          <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Demand Trend */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Demand Trend</p>
                <div className="flex items-end gap-1.5 h-20">
                  {[30, 45, 40, 55, 60, 70, 78, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-400 dark:bg-green-600 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">↑ Rising demand</p>
              </div>

              {/* Competition Bar */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-red-500" /> Competition Level</p>
                <div className="space-y-3">
                  {[{ label: "Low", w: "25%", color: "bg-green-400" }, { label: "Medium", w: "55%", color: "bg-yellow-400" }, { label: "High", w: "85%", color: "bg-red-400" }].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>{bar.label}</span></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: bar.w }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-500 mt-3 font-semibold">High competition detected</p>
              </div>

              {/* Price Band */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-orange-500" /> Price Band (₹)</p>
                <div className="relative">
                  <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="absolute left-[20%] right-[15%] top-0 bottom-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2">
                    <span>₹399</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">₹799 – ₹1,199</span>
                    <span>₹2,499</span>
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-3 font-semibold">Opportunity in ₹799–₹1,199 range</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGIN CAPTURE (after report) ─── */}
      <section className="py-14 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10 shadow-sm text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Unlock the Full Product Intelligence Report</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to receive extended competitor analysis, opportunity score breakdown, and pricing strategy insight.</p>
          {isLoggedIn ? (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold">
              <CheckCircle2 className="w-5 h-5" /> You're logged in full report access enabled.
            </div>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/login" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-sm hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-lg">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-bold rounded-xl text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                Sign Up Free
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by Real Marketplace Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8 mb-6">
            {[
              "Analyzes thousands of product listings",
              "Processes large volumes of review signals",
              "Tracks competitor pricing behavior",
              "Built for Amazon India marketplace dynamics",
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2">This is not scraped guesswork it's structured marketplace intelligence.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Used by sellers evaluating products across Amazon India categories.</p>
        </div>
      </section>

      {/* ─── WHO SHOULD USE ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">Who Should Use This Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white text-xl mb-5 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Best For</h3>
              <div className="space-y-3">
                {["New sellers validating product ideas", "Growing sellers expanding into new categories", "D2C brands testing Amazon as a channel", "Agencies evaluating market opportunities"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full shrink-0"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white text-xl mb-5 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-gray-400" /> Not Ideal For</h3>
              <div className="space-y-3">
                {["Sellers who only do offline retail", "Businesses not selling on Amazon India"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full shrink-0"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHY DIFFERENT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Built for Indian Marketplace Reality</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto text-sm">Most tools are built for US sellers. This one is built for you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Globe className="w-6 h-6" />, text: "Amazon India data focus" },
              { icon: <IndianRupee className="w-6 h-6" />, text: "₹ pricing logic & benchmarks" },
              { icon: <Target className="w-6 h-6" />, text: "Competitor-level insights" },
              { icon: <Shield className="w-6 h-6" />, text: "Connected to full Insydz platform" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500 mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── UPGRADE PATH ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-100 dark:border-orange-900/40 rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Want Deeper Insights?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">This free analyzer gives you a quick snapshot. Upgrade to track competitors, pricing, keywords, and reviews daily.</p>
           <a href="/signup" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-10 py-6 rounded-full shadow-2xl inline-flex items-center">
            Start Free Full Access <ArrowRight className="ml-2" />
          </a>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-200 dark:hover:border-orange-700 transition-colors">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-orange-500" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO PARAGRAPH ─── */}
      <section className="py-8 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center leading-relaxed">
            This free Amazon product analyzer helps Indian sellers evaluate product demand, competition, pricing, and review sentiment before launching. Ideal for Amazon FBA sellers, private label brands, and D2C businesses looking to make data-driven decisions on the Amazon India marketplace.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-4 text-white">Stop Guessing. Validate Before You Invest ₹.</h2>
          <p className="text-orange-100 text-lg mb-10">One small analysis today can save months of loss.</p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-white text-orange-600 font-black px-12 py-5 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-lg inline-flex items-center gap-3"
          >
            Analyze Product Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-orange-200 dark:border-orange-800 px-4 py-3 shadow-2xl">
        <button
          onClick={() => { if (!isLoggedIn) { setLocation('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {isLoggedIn ? <><BarChart3 className="w-4 h-4" /> Analyze Product Now Free</> : <><LogIn className="w-4 h-4" /> Log In to Analyze Free</>}
        </button>
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
 
