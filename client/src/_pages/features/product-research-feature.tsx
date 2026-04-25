import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { 
  ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, RefreshCw, Eye, 
  Sparkles, ChevronDown, LineChart, Award,
  Lightbulb, Package, DollarSign, Users,
  Percent, ShoppingCart, Filter, Layers,
  ThumbsUp, MessageCircle, Star,
  Clock, Activity, Crosshair, Brain,
  Menu, Sun, Moon, ShoppingBag, Store,
  Briefcase, Code, Globe, Trophy, ArrowLeft,
  BookOpen, Video, FileText, Flame, Mail, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigate } from 'wouter/use-browser-location';
import { Helmet } from 'react-helmet-async';
import { Footer } from "@/components/layout/Footer";

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

const schemaSoftwareProductResearch = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#product-research",
  "name": "Insydz Product Research Tool",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/product-research-feature",
  "description": "Find profitable products with Insydz's AI research tool. Analyse demand, competition, and margins on Amazon & Flipkart.",
  "featureList": [
    "Product opportunity score (0-100) calibrated for Amazon India",
    "Demand trend — monthly search volume and festive spike forecasting",
    "Competition density analysis — seller count and quality",
    "True margin calculator with actual Amazon India fee structures in INR",
    "Festive season opportunity scoring — Diwali, Big Billion Days timing",
    "Category entry timing recommendations"
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

const schemaBreadcrumbProductResearch = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://insydz.com/features" },
    { "@type": "ListItem", "position": 3, "name": "Product Research", "item": "https://insydz.com/features/product-research-feature" }
  ]
};

const schemaFAQProductResearch = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI product research work?",
      "acceptedAnswer": { "@type": "Answer", "text": "Insydz AI analyzes millions of products across Amazon & Flipkart, evaluating demand, competition, pricing trends, and profit margins." }
    },
    {
      "@type": "Question",
      "name": "Will I find products that aren't already saturated?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes! Our AI identifies emerging trends and underserved niches before they become oversaturated." }
    },
    {
      "@type": "Question",
      "name": "Can I filter by specific criteria?",
      "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Filter by category, price range, competition level, profit margin, search volume, and more." }
    },
    {
      "@type": "Question",
      "name": "Does this work for private label sellers?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes! Perfect for private label sellers to discover new winning products." }
    },
    {
      "@type": "Question",
      "name": "Is product research available on the free plan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes! Limited product research queries are included in the free plan." }
    },
    {
      "@type": "Question",
      "name": "How is this different from manual research?",
      "acceptedAnswer": { "@type": "Answer", "text": "Manual research takes weeks; AI analyzes thousands of data points in seconds to reveal hidden opportunities." }
    }
  ]
};

const SCHEMAS = [schemaSoftwareProductResearch, schemaBreadcrumbProductResearch, schemaFAQProductResearch];

export default function ProductResearchFeaturePage() {
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
    const id = `insydz-pr-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      document.getElementById(`insydz-pr-schema-${i}`)?.remove();
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
    { question: "How does AI product research work?", answer: "Insydz AI analyzes millions of products across Amazon & Flipkart, evaluating demand, competition, pricing trends, and profit margins to surface high-potential opportunities you can capitalize on." },
    { question: "Will I find products that aren't already saturated?", answer: "Yes! Our AI identifies emerging trends and underserved niches before they become oversaturated. You get early access to opportunities competitors haven't discovered yet." },
    { question: "Can I filter by specific criteria?", answer: "Absolutely. Filter by category, price range, competition level, profit margin, search volume, and more. Find products that match your exact business goals." },
    { question: "Does this work for private label sellers?", answer: "Yes! Product research is perfect for private label sellers looking for their next winning product. See what's selling, what margins look like, and where white space exists." },
    { question: "Is product research available on the free plan?", answer: "Yes! The free plan includes limited product research queries. Upgrade for unlimited searches, advanced filters, and AI-powered opportunity scoring." },
    { question: "How is this different from manual research?", answer: "Manual research takes weeks and misses hidden gems. Our AI analyzes thousands of data points in seconds, revealing opportunities you'd never find manually." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/features/product-research-feature" />
        <title>AI Product Research Tool for Amazon & Flipkart | Insydz</title>
        <meta name="description" content="Find profitable products with Insydz's AI research tool. Analyse demand, competition, and margins on Amazon & Flipkart. Stop guessing sell with data." />
        <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareProductResearch) }}
  />

  {/* Breadcrumb */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbProductResearch) }}
  />

  {/* FAQ */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQProductResearch) }}
  />
      </Helmet>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => setLocation('/')}>
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Insydz</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>

              {/* Solutions Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Solutions')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1">
                  Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Solutions' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Solutions.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Use Cases Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Use Cases')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1">
                  Use Cases <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Use Cases' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Use Cases"].map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Features Dropdown - HIGHLIGHTED */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-500 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Features.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-1">{item.name}</span>
                        {item.badge && <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setLocation('/pricing')} onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">Pricing</button>
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
                                                              {navigationMenu.Compare.map((item, i) => (
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
                                                                </button>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </div>

              {/* Resources Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Resources.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3 group">
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-1">{item.name}</span>
                      </button>
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

              <Button onClick={() => navigate('/login')} onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Login
              </Button>

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
              <button onClick={() => { setLocation('/'); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <div>
                <button onClick={() => toggleMobileMenu('Solutions')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium">
                  Solutions <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Solutions' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Solutions.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                        {item.icon}{item.name}
                      </button>
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
                                                                <button 
                                                                  key={i} 
                                                                  onClick={() => handleMenuItemClick(item)}
                                                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                                                                >
                                                                  {item.icon}
                                                                  {item.name}
                                                                </button>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </div>
              {/* Features - highlighted */}
              <div>
                <button onClick={() => toggleMobileMenu('Features')} className="flex items-center justify-between w-full px-4 py-2 text-indigo-600 dark:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-semibold">
                  Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Features' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Features.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                        {item.icon}{item.name}
                        {item.badge && <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setLocation('/pricing')} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium">Pricing</button>
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
                                                                             <button 
                                                                               key={i} 
                                                                               onClick={() => handleMenuItemClick(item)}
                                                                               className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                                                                             >
                                                                               {item.icon}
                                                                               {item.name}
                                                                             </button>
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

              <Button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500">Login</Button>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-300 rounded-full px-4 py-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Feature Spotlight</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                AI Product Research
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">Find Winners</span>
                <br />
                Before Competitors Do
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI discovers high-demand, low-competition products with real profit potential.
                <span className="text-indigo-700 font-semibold"> Stop guessing. Start selling products that actually make money.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all group">
                  Discover Products Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-700 dark:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold px-8 py-6 text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["AI opportunity scoring", "Profit margin analysis", "Trend detection"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Product Opportunities</h3>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Analyzed
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-4 animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Wireless Phone Chargers</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Electronics › Mobile Accessories</p>
                        </div>
                        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Score: 94</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[{ label: "Demand", value: "High", color: "text-green-600" }, { label: "Competition", value: "Low", color: "text-green-600" }, { label: "Margin", value: "45%", color: "text-green-600" }].map((m, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded px-2 py-1.5">
                            <p className="text-gray-500 dark:text-gray-400">{m.label}</p>
                            <p className={`font-bold ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <p className="text-xs text-green-600 font-semibold">Growing trend - Act fast!</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Eco-Friendly Water Bottles</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Home & Kitchen › Drinkware</p>
                        </div>
                        <div className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">Score: 78</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[{ label: "Demand", value: "Medium", color: "text-yellow-600" }, { label: "Competition", value: "Low", color: "text-green-600" }, { label: "Margin", value: "38%", color: "text-yellow-600" }].map((m, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded px-2 py-1.5">
                            <p className="text-gray-500 dark:text-gray-400">{m.label}</p>
                            <p className={`font-bold ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-75">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">LED Desk Lamps</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Home Improvement › Lighting</p>
                        </div>
                        <div className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">Score: 62</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[{ label: "Demand", value: "Medium", color: "text-yellow-600" }, { label: "Competition", value: "Medium", color: "text-orange-600" }, { label: "Margin", value: "32%", color: "text-gray-600" }].map((m, i) => (
                          <div key={i} className="bg-white dark:bg-gray-700 rounded px-2 py-1.5">
                            <p className="text-gray-500 dark:text-gray-400">{m.label}</p>
                            <p className={`font-bold ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm flex items-center gap-1"><Lightbulb className="w-4 h-4" /> 1,247 Found</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Most Product Launches <br /><span className="text-red-600">Fail Within 6 Months</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Search className="w-8 h-8" />, title: "Picking products based on gut feeling", color: "from-red-500 to-orange-500" },
              { icon: <Users className="w-8 h-8" />, title: "Entering oversaturated markets", color: "from-orange-500 to-yellow-500" },
              { icon: <DollarSign className="w-8 h-8" />, title: "Low margins kill profitability", color: "from-yellow-500 to-orange-500" },
              { icon: <Clock className="w-8 h-8" />, title: "Weeks wasted on manual research", color: "from-orange-500 to-red-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2"><span className="text-red-600">70% of new products fail</span> in their first year</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Because sellers pick products without data.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><X className="w-10 h-10 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Manual Research</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">Weeks of guessing, high failure rate</p>
              <div className="space-y-2 text-left">
                {["Limited to surface-level data", "Miss emerging opportunities", "Can't analyze at scale"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-10 h-10 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Research</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">Minutes to find winners, data-backed success</p>
              <div className="space-y-2 text-left">
                {["Deep market analysis in seconds", "Spot trends before competitors", "Analyze thousands of products"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">How AI Product Research Works</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Insydz AI scans millions of products to find opportunities with high demand and low competition
              <span className="text-indigo-700 font-semibold"> so you launch products that actually sell.</span>
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-4 gap-8 relative">
              {[
                { step: "1", title: "Set your criteria", detail: "Category, budget, margin goals", icon: <Filter className="w-12 h-12" /> },
                { step: "2", title: "AI analyzes market data", detail: "Demand, competition, trends, pricing", icon: <Brain className="w-12 h-12" /> },
                { step: "3", title: "Opportunities ranked", detail: "Scored by profit potential", icon: <Target className="w-12 h-12" /> },
                { step: "4", title: "Launch with confidence", detail: "Data-backed product decisions", icon: <Award className="w-12 h-12" /> }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl p-6 text-center relative z-10 shadow-lg hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-black text-white">{item.step}</div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-xl p-4 mb-4 text-indigo-600 flex items-center justify-center">{item.icon}</div>
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl group w-full sm:w-auto">
              Find Your Next Product Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* What This Feature Helps You Do */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">What You Can Do with Product Research</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Lightbulb />, title: "Discover untapped niches", detail: "Find markets competitors missed", color: "text-indigo-600" },
              { icon: <TrendingUp />, title: "Spot trends early", detail: "Launch before market saturation", color: "text-green-600" },
              { icon: <DollarSign />, title: "Maximize profit margins", detail: "Focus on high-margin opportunities", color: "text-emerald-600" },
              { icon: <Shield />, title: "Reduce launch risk", detail: "Data-backed product decisions", color: "text-blue-600" },
              { icon: <Target />, title: "Beat competition", detail: "Enter markets with advantage", color: "text-purple-600" },
              { icon: <Award />, title: "Scale faster", detail: "Find multiple winners quickly", color: "text-orange-600" }
            ].map((outcome, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center ${outcome.color}`}>{outcome.icon}</div>
                  <ThumbsUp className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1">{outcome.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Depth */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Product Intelligence</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { feature: "AI Opportunity Scoring", benefit: "Every product ranked by potential", icon: <Star className="w-8 h-8" />, color: "from-indigo-500 to-purple-500" },
              { feature: "Demand Analysis", benefit: "See actual search volume & trends", icon: <BarChart3 className="w-8 h-8" />, color: "from-purple-500 to-pink-500" },
              { feature: "Competition Assessment", benefit: "Identify low-competition niches", icon: <Users className="w-8 h-8" />, color: "from-red-500 to-orange-500" },
              { feature: "Profit Margin Calculator", benefit: "Know profitability before launch", icon: <DollarSign className="w-8 h-8" />, color: "from-green-500 to-emerald-500" },
              { feature: "Trend Detection", benefit: "Catch rising products early", icon: <TrendingUp className="w-8 h-8" />, color: "from-orange-500 to-red-500" },
              { feature: "Category Insights", benefit: "Best-performing categories revealed", icon: <Layers className="w-8 h-8" />, color: "from-blue-500 to-cyan-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-xl transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-4`}>{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />{item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Manual Research vs AI Research</h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Aspect</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Manual Research</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20">AI Research</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: "Time Required", manual: "2-4 weeks", insydz: "5 minutes" },
                  { aspect: "Products Analyzed", manual: "20-50 products", insydz: "Thousands of products" },
                  { aspect: "Data Accuracy", manual: "Often outdated", insydz: "Real-time market data" },
                  { aspect: "Trend Detection", manual: "Too late", insydz: "Spot trends as they emerge" },
                  { aspect: "Success Rate", manual: "30% or less", insydz: "70%+ with data validation" }
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.aspect}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-left justify-left gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{row.manual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left bg-indigo-50 dark:bg-indigo-900/20">
                      <div className="flex items-left justify-left gap-2">
                        <Check className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-10 py-6 text-lg rounded-full shadow-xl">
              Switch to AI Research
            </Button>
          </div>
        </div>
      </section>

      {/* PLG Entry Point */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Start Free. Find Winning Products.</h2>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black text-indigo-600">₹0</span>
                <span className="text-2xl text-gray-600 dark:text-gray-400">/ Forever</span>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300">Free Plan Includes:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {["Limited product research queries", "AI opportunity scoring", "Basic demand & competition data", "Amazon & Flipkart coverage"].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-indigo-600">Upgrade Teaser:</span> Unlock unlimited searches, advanced filters, and trend alerts on paid plans.
              </p>
            </div>
            <div className="text-center">
              <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl w-full sm:w-auto">
                Start Product Research Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Feature Is For */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Is Product Research Right for You?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Perfect For</h3>
              </div>
              <ul className="space-y-4">
                {["Private label sellers finding new products", "New sellers entering e-commerce", "Brands expanding product lines", "Agencies researching for clients", "Sellers tired of failed launches"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-white" /></div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Less Useful For</h3>
              </div>
              <ul className="space-y-4">
                {["Sellers with fixed product catalogs", "Single-product businesses", "Those not looking to expand"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Product Research FAQs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-indigo-400 transition-all">
                <button onClick={() => toggleFaq(i)} className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-indigo-600 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Related Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Keyword Tracking", icon: <Search />, color: "from-blue-500 to-cyan-500", route: "/features/keyword-rank-tracking-feature" },
              { title: "Price Optimization", icon: <DollarSign />, color: "from-green-500 to-emerald-500", route: "/features/price-optimization-feature" },
              { title: "Competitor Analysis", icon: <Users />, color: "from-orange-500 to-red-500", route: "/features/competitor-price-tracking-feature" },
              { title: "Review Analytics", icon: <MessageCircle />, color: "from-purple-500 to-pink-500", route: "/features/review-analytics-feature" },
              { title: "AI Recommendations", icon: <Sparkles />, color: "from-cyan-500 to-blue-500", route: "/features/ai-recommendations-feature" },
              { title: "WhatsApp Alerts", icon: <Bell />, color: "from-emerald-500 to-green-500", route: "/features/whatsapp-alerts-feature" }
            ].map((feature, i) => (
              <div key={i} onClick={() => feature.route && setLocation(feature.route)} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                <ArrowRight className="w-5 h-5 text-indigo-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            Stop Guessing Products.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Find Winners with AI.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl group">
              Start Product Research Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={() => setLocation("/")} size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-700 dark:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold px-12 py-6 text-lg rounded-full">
              Explore All Features →
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-indigo-300 dark:border-indigo-700 p-4 shadow-2xl z-40">
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-full shadow-xl">
          Start Product Research Free
        </Button>
      </div>

      
            {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}























