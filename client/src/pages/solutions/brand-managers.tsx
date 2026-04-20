import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  Users, IndianRupee, Smartphone, Award, Eye, Brain,
  Shield, Sparkles, LineChart, Layers, PieChart,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store,
  Briefcase, Code, Globe, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Flame,
  Presentation, LayoutGrid, Lightbulb, Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most comprehensive brand monitoring tool for Amazon and Flipkart brand managers.",
    "url": "https://insydz.com/solutions/brand-managers"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Brand Managers", "item": "https://insydz.com/solutions/brand-managers" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best brand monitoring tool for Amazon and Flipkart in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive brand monitoring tool built for Amazon.in and Flipkart. Unlike Brandwatch or BrandMentions that track social media, Insydz tracks marketplace-specific signals — competitor pricing, keyword rankings, review sentiment, and market share — in real time, in INR, with AI-powered recommendations for brand managers." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help brand managers protect market share on Indian marketplaces?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz monitors your brand's market share position across Amazon and Flipkart in real time. When a competitor launches at a lower price, gains keyword ranking, or accumulates reviews faster, you receive an immediate alert with exact data and an AI recommendation. Threats that took weeks to discover are now visible within hours." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Brandwatch or BrandMentions for Indian brand managers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Brandwatch and BrandMentions track social media mentions — excellent for PR monitoring. Insydz tracks what happens on the marketplaces where your brand actually sells: pricing moves, keyword shifts, competitor launches, review sentiment, and market share data — all in INR, all India-specific, all tied to your actual revenue." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz track brand sentiment through customer reviews on Amazon and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz's AI has analysed 250,000+ reviews on Indian marketplaces. It surfaces recurring positive and negative themes, tracks sentiment trends over time, compares your brand perception against competitors, and alerts you when a new negative pattern emerges — before it becomes a visible rating problem." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz support multi-brand portfolio tracking?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz's multi-brand portfolio view lets brand managers monitor all product lines and competitors simultaneously. Track GMV trends, market share shifts, keyword rankings, and review sentiment across every SKU — with executive-ready reports generated automatically for leadership review." }
      },
      {
        "@type": "Question",
        "name": "What is price elasticity analysis and how does Insydz use it?",
        "acceptedAnswer": { "@type": "Answer", "text": "Price elasticity analysis models how sales volume responds to price changes. Insydz's AI builds this model for your specific category on Amazon and Flipkart, then recommends the optimal price to hold market position without eroding margin. Brand managers can run pricing scenarios before making decisions that affect crores of revenue." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz generate executive reports for brand leadership reviews?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz auto-generates executive-ready performance reports in one click — market share trend charts, competitive landscape summaries, keyword position movement, sentiment scores, and GMV performance. What previously took 6+ analyst hours takes 90 seconds with Insydz." }
      }
    ]
  }
];

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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

export default function BrandManagersPage() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-brand-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-brand-schema-${i}`);
      if (el) el.remove();
    });
  };
}, []);


  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 20); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add("dark");
    else html.classList.remove("dark");
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

  const handleGetStarted = () => { setLocation("/login"); };
  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const scrollToSection = (sectionId: string) => {
    setLocation('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/solutions/brand-managers" />
        <title>Brand Monitoring Tool for Marketplace Sellers | Insydz</title>
        <meta name="description" content="Track your brand across Amazon & Flipkart with Insydz. Real-time brand tracking, intelligence, and performance analytics for marketplace brand managers." />
      </Helmet>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-1 group">
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
              
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              {/* Solutions */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Solutions')} className="px-3 py-2 text-sm text-purple-600 dark:text-purple-500 hover:text-purple-700 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Solutions' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Solutions' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Solutions.map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group"
    >
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
                <button onMouseEnter={() => setActiveDropdown('Use Cases')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Use Cases <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Use Cases' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Use Cases"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
    </Link>
  ) : (
    <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
      <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
    </span>
  )
))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Features"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
    </Link>
  ) : (
    <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
      <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
    </span>
  )
))}
                  </div>
                )}
              </div>

              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)}
  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
>
  Pricing
</Link>
              {/* Free Tools */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Free Tools')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Free Tools' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Free Tools"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
    </Link>
  ) : (
    <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
      <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
    </span>
  )
))}
                  </div>
                )}
              </div>

              {/* Compare */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Compare')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Compare"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
    </Link>
  ) : (
    <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
      <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
    </span>
  )
))}
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["Resources"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
    </Link>
  ) : (
    <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
      <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
    </span>
  )
))}
                  </div>
                )}
              </div>

              {/* About */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('About')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  About <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'About' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu["About"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
    </Link>
  ) : (
    <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
      <span className="text-purple-600 dark:text-purple-400">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
    </span>
  )
))}
                  </div>
                )}
              </div>

              <Link href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
  Login
</Link>
              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-800"/>}
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
            <div className="px-4 py-4 space-y-2">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
  <ArrowLeft className="w-4 h-4" /> Back to Home
</a>
              {(["Solutions","Use Cases","Features","Free Tools","Compare","Resources","About"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium ${menu === 'Solutions' ? 'text-purple-600 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menu ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[menu] as MenuItemWithBadge[]).map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => setIsMenuOpen(false)}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
    >
      {item.icon} {item.name}
      {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
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
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
  Pricing
</Link>
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-lg font-semibold block">
  Login
</a>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-800"/>}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                </span>
                <span className="text-sm font-medium text-purple-700">Built for Strategic Brand Leaders</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Make Confident
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">Data-Backed</span>
                <br />
                Brand Decisions.
              </h1>

              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Insydz is India's most powerful <strong>brand monitoring tool</strong> for brand managers on Amazon and Flipkart
                <span className="text-purple-700 font-semibold"> so you can protect market share, optimise pricing strategies, and outmanoeuvre competitors with complete marketplace intelligence, not delayed reports.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group">
                  Start Free for Brand Managers
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-purple-600 text-purple-700 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-8 py-6 text-lg rounded-full">
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {[
                  "Multi-brand portfolio tracking across Amazon & Flipkart",
                  "Executive-ready reports one click, no manual work",
                  "No credit card required"
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Premium Brand Portfolio</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-purple-600">₹2.4Cr</span>
                          <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">+18%</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Monthly GMV across 3 brands</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-l-4 border-orange-500 rounded-r-2xl p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <Eye className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Market Share Alert</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Competitor launched similar product at <span className="text-orange-600 font-bold">23% lower price</span></p>
                        <p className="text-xs text-gray-500 mt-1">Category: Premium Skincare</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">AI Recommendation</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Optimise pricing on Brand X by 8–12%</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">Live Intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PAIN POINTS ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Brand Managers Struggle
              <br />
              <span className="text-red-600">Without Real-Time Intelligence</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Managing brands on e-commerce without live data is like driving blind. Competitors move at speed, customer sentiment shifts overnight, and by the time your monthly report is ready the market has already moved against you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Eye className="w-8 h-8" />, title: "Competitors move faster than your reporting cycle", desc: "and you find out too late", color: "from-red-500 to-orange-500" },
              { icon: <TrendingDown className="w-8 h-8" />, title: "Market share erosion goes unnoticed for weeks", desc: "while the damage compounds", color: "from-orange-500 to-yellow-500" },
              { icon: <MessageCircle className="w-8 h-8" />, title: "Customer feedback gets lost in spreadsheets", desc: "instead of driving brand strategy", color: "from-purple-500 to-pink-500" },
              { icon: <Clock className="w-8 h-8" />, title: "Manual analysis delays strategic decisions", desc: "leadership is always one report behind", color: "from-pink-500 to-red-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-purple-400 hover:shadow-xl transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-lg`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1">{pain.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{pain.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Brands lose <span className="text-red-600">20–40% market share annually</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              due to slow competitive response, delayed pricing decisions, and missed customer sentiment signals on the marketplaces that matter most to Indian consumers.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENTIATION ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Social Listening Tools Track What People Say.
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz Tracks What They Buy.</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Brandwatch, BrandMentions, and Locobuzz excel at tracking social media chatter. But for brand managers selling on Amazon and Flipkart, the signals that actually move market share pricing moves, keyword rankings, review sentiment, competitor product launches happen on the marketplace, not on social media.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <th className="text-left px-6 py-4 font-bold text-base">Feature</th>
                  <th className="px-6 py-4 font-bold text-base text-left">Insydz</th>
                  <th className="px-6 py-4 font-bold text-base text-left">Social Listening Tools</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Market share tracking on Amazon & Flipkart", insydz: "✓", other: "✗" },
                  { feature: "Competitor pricing intelligence (INR)", insydz: "✓", other: "✗ Doesn't track pricing" },
                  { feature: "Review sentiment & root-cause AI", insydz: "✓ 250K+ reviews", other: "⚠ Social only" },
                  { feature: "Keyword ranking on marketplace search", insydz: "✓", other: "✗" },
                  { feature: "AI pricing recommendations", insydz: "✓", other: "✗" },
                  { feature: "Competitive benchmarking on 20+ metrics", insydz: "✓", other: "⚠ Social metrics only" },
                  { feature: "Multi-brand portfolio view in INR", insydz: "✓", other: "⚠ No revenue-level data" },
                  { feature: "Executive-ready one-click reports", insydz: "✓", other: "⚠ Manual export required" },
                ].map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 dark:border-gray-700 ${i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-left font-semibold text-green-600">{row.insydz}</td>
                    <td className="px-6 py-4 text-left font-semibold">
                      <span className={row.other.startsWith('✓') ? 'text-green-600' : row.other.startsWith('⚠') ? 'text-yellow-600' : 'text-red-500'}>{row.other}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <button onClick={() => setLocation('/compare/insydzvshelium')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              → See how Insydz compares as a marketplace brand intelligence platform
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: FEATURES ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Meet Insydz
              <br />
              Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Strategic Brand Intelligence Platform</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Built for brand managers who need to make fast, confident decisions. Get complete market visibility across Amazon and Flipkart in one unified dashboard
              <span className="text-purple-700 font-semibold"> with AI that tells you what to do, not just what happened.</span>
            </p>
          </div>

          <div className="space-y-12">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">1. Multi-Brand Portfolio View</h3>
                  <p className="text-gray-600 dark:text-gray-400">Monitor all your brand's product lines and competitors simultaneously from one real-time brand tracking dashboard. Whether you manage 2 brands or 12 SKU families, Insydz gives you the complete picture GMV trends, market share shifts, and competitive threats without toggling between tools.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Total portfolio GMV view in INR across Amazon & Flipkart",
                  "Per-brand and per-SKU performance breakdowns",
                  "Market share position tracking against 100+ category competitors",
                  "Historical trend analysis for executive presentations"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-purple-700 dark:text-purple-400">Brand Manager scenario:</span> A skincare brand manager in Mumbai was tracking 4 sub-brands manually across two marketplaces. Category managers were presenting outdated data in Monday reviews. With Insydz, the entire portfolio ₹2.4Cr monthly GMV across 3 brands is visible in real time every morning before the standup.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-pink-200 dark:border-pink-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2. AI-Powered Market Intelligence</h3>
                  <p className="text-gray-600 dark:text-gray-400">Stop receiving data. Start receiving decisions. Insydz's brand intelligence platform doesn't just surface competitor moves it tells you exactly how to respond. Get strategic recommendations, not just numbers, backed by marketplace AI trained on Indian category data.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Competitor product launch detection with price & positioning analysis",
                  "AI-calculated optimal price range to protect share without margin erosion",
                  "Market share shift alerts with attribution (price/review/ranking cause)",
                  "Demand signal analysis where your category is growing or declining"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-pink-700 dark:text-pink-400">Brand Manager scenario:</span> A FMCG brand's premium hair care line started losing market share on Flipkart. Insydz identified the cause in 48 hours: a competitor had dropped price by 18% and gained 3 keyword positions simultaneously. The AI recommended a ₹45 price adjustment and two listing changes. Share recovered within 3 weeks.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <LineChart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">3. Executive Reporting &amp; Custom Dashboards</h3>
                  <p className="text-gray-600 dark:text-gray-400">One click. Board-ready. Insydz generates performance analytics reports formatted for leadership review market share trends, competitive landscape summaries, keyword position charts, and sentiment scores without a single hour of manual data compilation.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Executive summary reports generated weekly or monthly",
                  "Custom dashboard views tailored to leadership KPIs",
                  "GMV trends, competitor benchmarks, and sentiment in one view",
                  "Shareable report links for cross-functional team alignment"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-orange-700 dark:text-orange-400">Brand Manager scenario:</span> A brand manager at a consumer electronics company spent 6 hours every month compiling competitor data for the CMO review deck. With Insydz, the same report auto-generates in 90 seconds. Six hours returned to strategy every month.
                </p>
              </div>
              <button onClick={() => setLocation('/features/ai-recommendations-feature')} className="text-orange-600 dark:text-orange-400 font-semibold text-sm hover:underline">
                → Explore performance analytics software for brand leaders
              </button>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">4. Competitive Defence Alerts</h3>
                  <p className="text-gray-600 dark:text-gray-400">Real-time brand tracking means knowing about competitive threats the moment they happen not after your sales data confirms the damage. Insydz monitors the market 24/7 and delivers WhatsApp alerts for every significant competitive event that could affect your brand's position.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "New competitor product launch alert with full pricing intel",
                  "Market share erosion alert when position drops more than 5%",
                  "Keyword ranking loss alert with AI-recommended recovery action",
                  "Review sentiment deterioration alert before ratings visibly decline"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-green-700 dark:text-green-400">Brand Manager scenario:</span> A home appliances brand manager received an Insydz alert on a Tuesday afternoon: Competitor X launched a similar product at 23% lower price. By Thursday, she had approved a tactical pricing response and a review solicitation push. Market share held within 2% of pre-launch levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: COMPLETE SUITE ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Manage Your Brand Portfolio</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Comprehensive tools built for strategic decision-making</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <PieChart className="w-8 h-8" />, title: "Market Share Tracking", desc: "Real-time category position vs. all competitors across Amazon and Flipkart" },
              { icon: <TrendingUp className="w-8 h-8" />, title: "Price Elasticity Analysis", desc: "AI models category price sensitivity never price blind again" },
              { icon: <MessageCircle className="w-8 h-8" />, title: "Sentiment Analytics", desc: "AI-powered review analysis across 250K+ reviews; brand perception tracking" },
              { icon: <Target className="w-8 h-8" />, title: "Competitive Benchmarking", desc: "20+ metrics: pricing, reviews, keyword rankings, GMV estimates" },
              { icon: <Sparkles className="w-8 h-8" />, title: "Product Performance", desc: "Star performer vs. underperformer analysis across your portfolio" },
              { icon: <BarChart3 className="w-8 h-8" />, title: "Custom Dashboards", desc: "Executive views tailored to brand-specific KPIs and reporting needs" }
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-md">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              How Insydz Works
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">for Brand Managers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">No analyst required. No data team needed. Get brand intelligence flowing in under 5 minutes.</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
                {
                  num: "1", title: "Connect Your Brand Portfolio",
                  desc: "Add your brands and key competitors across Amazon and Flipkart. Insydz automatically tracks pricing, reviews, rankings, and market trends across your entire product catalogue and category.",
                  icon: <Layers className="w-12 h-12 text-purple-600" />, bg: "bg-purple-100 dark:bg-purple-900/20"
                },
                {
                  num: "2", title: "AI Analyses Market Dynamics",
                  desc: "Our AI continuously monitors market share shifts, pricing strategies, customer sentiment, and competitive positioning across your categories 24/7, in real time, in INR.",
                  icon: <Brain className="w-12 h-12 text-pink-600 animate-pulse" />, bg: "bg-pink-100 dark:bg-pink-900/20"
                },
                {
                  num: "3", title: "Get Strategic Recommendations", desc: "Instead of raw data, you receive decision-ready intelligence:", icon: null, bg: null
                }
              ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">{step.num}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                  {step.desc && <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{step.desc}</p>}
                  {step.icon && (
  <div className={`${step.bg} rounded-2xl p-4 flex items-center justify-center`}>
    <div className="flex items-center justify-center w-12 h-12">
      {step.icon}
    </div>
  </div>
)}
                  {i === 2 && (
                    <div className="space-y-3 text-left">
                      {[
                        { text: '"Competitor X launched at 25% discount"', color: "red" },
                        { text: '"Brand Y market share up 12% this month"', color: "orange" },
                        { text: '"Recommend 10% price adjustment on SKU Z"', color: "blue" }
                      ].map((item, j) => (
                        <div key={j} className={`flex items-start gap-2 bg-${item.color}-50 dark:bg-${item.color}-900/20 border border-${item.color}-300 dark:border-${item.color}-700 rounded-lg p-3`}>
                          <CheckCircle2 className={`w-5 h-5 text-${item.color}-600 flex-shrink-0 mt-0.5`} />
                          <span className="text-sm text-gray-800 dark:text-gray-300">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group w-full sm:w-auto">
              Start Free &amp; Get Brand Intelligence
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: ROI EXAMPLE ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              What Insydz Means for a Brand
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Doing ₹2Cr/Month on Indian Marketplaces</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Without */}
            <div className="bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-black text-red-600 mb-6 flex items-center gap-2">
                <div className="w-6 h-6" /> Without Insydz Monthly Value at Risk
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Slow response to competitor price drop (3-day lag)", value: "−₹60,000" },
                  { label: "Undetected keyword ranking loss (top 5 → top 20)", value: "−₹80,000" },
                  { label: "Review sentiment drop unaddressed for 6 weeks", value: "−₹45,000" },
                  { label: "Manual reporting hours (brand manager + analyst)", value: "−₹35,000" },
                  { label: "Missed market share window (new competitor launch)", value: "−₹90,000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-red-100 dark:border-red-900/30">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-bold text-red-600">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="font-black text-gray-900 dark:text-white text-lg">Total Monthly Risk Exposure</span>
                  <span className="font-black text-red-600 text-2xl">−₹3,10,000</span>
                </div>
              </div>
            </div>
            {/* With */}
            <div className="bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-black text-green-600 mb-6 flex items-center gap-2">
                <div className="w-6 h-6" /> With Insydz Monthly Value Protected
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Price response within 2 hours of competitor move", value: "+₹55,000" },
                  { label: "Keyword rankings recovered with AI guidance", value: "+₹70,000" },
                  { label: "Review issues caught before ratings drop", value: "+₹38,000" },
                  { label: "Reporting hours freed → returned to strategy", value: "+₹32,000" },
                  { label: "Competitive launch defended (share held)", value: "+₹80,000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-green-100 dark:border-green-900/30">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-bold text-green-600">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="font-black text-gray-900 dark:text-white text-lg">Net Monthly Value Protected</span>
                  <span className="font-black text-green-600 text-2xl">+₹2,75,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">About Brand Monitoring Tools for Indian Marketplaces</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "What is the best brand monitoring tool for Amazon and Flipkart in India?",
                a: "Insydz is India's most comprehensive brand monitoring tool built for Amazon.in and Flipkart. Unlike Brandwatch or BrandMentions that track social media, Insydz tracks marketplace-specific signals — competitor pricing, keyword rankings, review sentiment, and market share — in real time, in INR, with AI-powered recommendations for brand managers."
              },
              {
                q: "How does Insydz help brand managers protect market share on Indian marketplaces?",
                a: "Insydz monitors your brand's market share position across Amazon and Flipkart in real time. When a competitor launches at a lower price, gains keyword ranking, or accumulates reviews faster, you receive an immediate alert with exact data and an AI recommendation. Threats that took weeks to discover are now visible within hours."
              },
              {
                q: "How is Insydz different from Brandwatch or BrandMentions for Indian brand managers?",
                a: "Brandwatch and BrandMentions track social media mentions — excellent for PR monitoring. Insydz tracks what happens on the marketplaces where your brand actually sells: pricing moves, keyword shifts, competitor launches, review sentiment, and market share data — all in INR, all India-specific, all tied to your actual revenue."
              },
              {
                q: "Can Insydz track brand sentiment through customer reviews on Amazon and Flipkart?",
                a: "Yes. Insydz's AI has analysed 250,000+ reviews on Indian marketplaces. It surfaces recurring positive and negative themes, tracks sentiment trends over time, compares your brand perception against competitors, and alerts you when a new negative pattern emerges — before it becomes a visible rating problem."
              },
              {
                q: "Does Insydz support multi-brand portfolio tracking?",
                a: "Yes. Insydz's multi-brand portfolio view lets brand managers monitor all product lines and competitors simultaneously. Track GMV trends, market share shifts, keyword rankings, and review sentiment across every SKU — with executive-ready reports generated automatically for leadership review."
              },
              {
                q: "What is price elasticity analysis and how does Insydz use it?",
                a: "Price elasticity analysis models how sales volume responds to price changes. Insydz's AI builds this model for your specific category on Amazon and Flipkart, then recommends the optimal price to hold market position without eroding margin. Brand managers can run pricing scenarios before making decisions that affect crores of revenue."
              },
              {
                q: "Can Insydz generate executive reports for brand leadership reviews?",
                a: "Yes. Insydz auto-generates executive-ready performance reports in one click — market share trend charts, competitive landscape summaries, keyword position movement, sentiment scores, and GMV performance. What previously took 6+ analyst hours takes 90 seconds with Insydz."
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: ICP-BASED CTAs ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">Ready to Manage Your Brands with Confidence?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join brand managers who make strategic decisions backed by real-time market intelligence, not delayed reports.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Emerging Brands */}
            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Emerging Brands</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Building your brand on Indian marketplaces? Get competitor intelligence and market positioning data from day one. The free plan requires no credit card and gives new brand managers the visibility they need before making their first major strategic decision.
              </p>
              <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full">
                Start Free No Card Needed →
              </Button>
            </div>

            {/* Growing Brands */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-700 border-2 border-purple-500 rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">For Growing Brands</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Managing ₹50L–₹5Cr/month GMV? At your brand's scale, every market share point is worth lakhs. The Growth Plan gives you full real-time brand tracking, AI-powered competitive intelligence, price elasticity analysis, and executive reporting.
              </p>
              <Button onClick={() => setLocation('/pricing')} className="w-full bg-white hover:bg-gray-100 text-purple-700 font-bold rounded-full">
                Try Brand Growth Plan →
              </Button>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-gray-900 border-2 border-pink-200 dark:border-pink-800 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Enterprise &amp; Multi-Brand Leaders</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Managing a multi-brand portfolio? Custom dashboards, dedicated account manager, white-glove onboarding, API access, and enterprise pricing built for brand leaders managing complex multi-category portfolios across Indian marketplaces.
              </p>
              <Button onClick={() => setLocation('/solutions/ecommerce-agencies')} variant="outline" className="w-full border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold rounded-full">
                Book a Strategic Demo →
              </Button>
            </div>
          </div>
          <p className="text-white/80 mt-6 text-sm flex items-center justify-center gap-2 flex-wrap">
  <span>✓ No credit card required</span>
  <span className="text-white/40">·</span>
  <span>✓ Setup in 2 minutes</span>
  <span className="text-white/40">·</span>
  <span>✓ Cancel anytime</span>
</p>
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
 






















// FAQ Accordion Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left bg-white dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}
