import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ChevronDown, ChevronRight, Check, ArrowRight,
  CheckCircle2, DollarSign, Globe, Bell, Zap, 
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  Mail, Smartphone, BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown,
  Flame,
  Presentation, LayoutGrid, Facebook, Instagram, Twitter, Linkedin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://insydz.com/compare" },
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Helium 10", "item": "https://insydz.com/compare/insydz-vs-helium-10" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is Insydz a replacement for Helium 10 for Indian sellers?", "acceptedAnswer": { "@type": "Answer", "text": "For Indian sellers whose primary market is Amazon India, Flipkart — yes, Insydz is a direct replacement and covers ground Helium 10 cannot: Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. If you also sell on Amazon.com and need deep US-market PPC tools, you may want to keep Helium 10 specifically for that use case." } },
      { "@type": "Question", "name": "Why is Insydz cheaper than Helium 10?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is priced in INR for Indian sellers — starting at ₹1,999/month vs Helium 10's $39/month (~₹3,300). But the cost difference isn't just currency. Insydz is focused on five high-value use cases for Indian marketplace sellers rather than 20+ tools for a global audience. That focus means a product you can use from day one, without a learning curve." } },
      { "@type": "Question", "name": "Can I use Insydz and Helium 10 together?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — and some large sellers do exactly this. They use Helium 10 for Amazon.com PPC management and US-market research, and Insydz for Indian marketplace intelligence, Flipkart tracking, and WhatsApp alerts. If you're running a cross-border business with both US and India operations, this combination makes sense." } },
      { "@type": "Question", "name": "Does Insydz work for Flipkart sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — this is one of Insydz's most significant advantages over Helium 10. Insydz provides competitor price tracking, keyword rank monitoring, review analysis, and inventory management for Flipkart sellers. Helium 10 has no Flipkart support. If Flipkart is part of your business, Insydz is the only option between these two tools." } },
      { "@type": "Question", "name": "What is the best Helium 10 alternative for India?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is the most purpose-built Helium 10 alternative for Indian sellers. Built specifically for Amazon India, Flipkart — with WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. Other tools like SellerApp cover some Amazon India use cases but none combine Flipkart support, WhatsApp delivery, and multilingual review analysis at INR pricing." } },
      { "@type": "Question", "name": "Is there a free plan for Insydz?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz has a permanent free plan — not a trial. It covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Helium 10 offers a 30-day free trial with limited features, after which you must upgrade to continue." } },
      { "@type": "Question", "name": "Does Insydz support Amazon and Flipkart sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports Amazon India, Flipkart from a unified dashboard. For sellers operating across all three Indian marketplaces, Insydz is the only tool in this comparison that covers your full business." } }
    ]
  }
];

// Navigation types and data - same structure as other pages
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

export default function InsydzVsHeliumPage() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-helium-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-helium-schema-${i}`);
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

  // Page data — updated from SEO content doc
  const comparisonFeatures = [
    { area: 'Marketplace Coverage', insydz: 'Amazon India + Flipkart', helium: 'Amazon.com only — no Amazon.in, no Flipkart', insydzIcon: <Globe className="w-5 h-5 text-green-600" />, heliumIcon: <Package className="w-5 h-5 text-gray-500" /> },
    { area: 'Pricing', insydz: '₹0 / ₹1,999 / ₹2,999/month', helium: '$39–$99/month (~₹3,300–₹8,300)', insydzIcon: <IndianRupee className="w-5 h-5 text-green-600" />, heliumIcon: <DollarSign className="w-5 h-5 text-gray-500" /> },
    { area: 'Free Plan', insydz: 'Free forever — 25 products, no credit card', helium: '30-day trial only. Credit card required.', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Alert Channel', insydz: 'WhatsApp + Dashboard', helium: 'Email + Dashboard only', insydzIcon: <Smartphone className="w-5 h-5 text-green-600" />, heliumIcon: <Mail className="w-5 h-5 text-gray-500" /> },
    { area: 'Language Support', insydz: 'Hindi + Hinglish + English review analysis', helium: 'English only', insydzIcon: <Users className="w-5 h-5 text-green-600" />, heliumIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Keyword Research', insydz: 'Amazon.in + Flipkart data in Indian volumes', helium: 'Amazon.com keyword data — not calibrated for India', insydzIcon: <Search className="w-5 h-5 text-green-600" />, heliumIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Competitor Price Tracking', insydz: 'Real-time, WhatsApp alert, AI reprice in INR', helium: 'Available for Amazon.com — not Amazon.in or Flipkart', insydzIcon: <TrendingDown className="w-5 h-5 text-green-600" />, heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Review Analysis', insydz: 'AI complaint + praise clustering in Hindi & English', helium: 'English only', insydzIcon: <MessageCircle className="w-5 h-5 text-green-600" />, heliumIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Festive Demand Intelligence', insydz: 'Diwali, Big Billion Days, Republic Day forecasting', helium: 'Not available — built for US market', insydzIcon: <Flame className="w-5 h-5 text-green-600" />, heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Ease of Use', insydz: 'Action-driven — every alert includes next step', helium: 'Feature-rich but requires learning curve', insydzIcon: <Zap className="w-5 h-5 text-green-600" />, heliumIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Customer Support', insydz: 'Hindi + English support', helium: 'English only', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, heliumIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Amazon PPC Management', insydz: 'Not available (focus is organic intelligence)', helium: 'Adtomic — advanced PPC management', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, heliumIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is Insydz a replacement for Helium 10 for Indian sellers?',
      answer: 'For Indian sellers whose primary market is Amazon India, Flipkart — yes, Insydz is a direct replacement and covers ground Helium 10 cannot: Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. If you also sell on Amazon.com and need deep US-market PPC tools, you may want to keep Helium 10 specifically for that use case.'
    },
    {
      id: 'faq-2',
      question: 'Why is Insydz cheaper than Helium 10?',
      answer: 'Insydz is priced in INR for Indian sellers — starting at ₹1,999/month vs Helium 10\'s $39/month (~₹3,300). But the cost difference isn\'t just currency. Insydz is focused on five high-value use cases for Indian marketplace sellers rather than 20+ tools for a global audience. That focus means a product you can use from day one, without a learning curve.'
    },
    {
      id: 'faq-3',
      question: 'Can I use Insydz and Helium 10 together?',
      answer: 'Yes — and some large sellers do exactly this. They use Helium 10 for Amazon.com PPC management and US-market research, and Insydz for Indian marketplace intelligence, Flipkart tracking, and WhatsApp alerts. If you\'re running a cross-border business with both US and India operations, this combination makes sense.'
    },
    {
      id: 'faq-4',
      question: 'Does Insydz work for Flipkart sellers?',
      answer: 'Yes — this is one of Insydz\'s most significant advantages over Helium 10. Insydz provides competitor price tracking, keyword rank monitoring, review analysis, and inventory management for Flipkart sellers. Helium 10 has no Flipkart support. If Flipkart is part of your business, Insydz is the only option between these two tools.'
    },
    {
      id: 'faq-5',
      question: 'What is the best Helium 10 alternative for India?',
      answer: 'Insydz is the most purpose-built Helium 10 alternative for Indian sellers. Built specifically for Amazon India, Flipkart — with WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. Other tools like SellerApp cover some Amazon India use cases but none combine Flipkart support, WhatsApp delivery, and multilingual review analysis at INR pricing.'
    },
    {
      id: 'faq-6',
      question: 'Is there a free plan for Insydz?',
      answer: 'Yes. Insydz has a permanent free plan — not a trial. It covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Helium 10 offers a 30-day free trial with limited features, after which you must upgrade to continue.'
    },
    {
      id: 'faq-7',
      question: 'Does Insydz support Amazon and Flipkart sellers?',
      answer: 'Yes. Insydz supports Amazon India, Flipkart from a unified dashboard. For sellers operating across all three Indian marketplaces, Insydz is the only tool in this comparison that covers your full business.'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/compare/insydzvshelium" />
        <title>Insydz vs Helium 10 — Best Helium 10 Alternative for India?</title>
        <meta name="description" content="Insydz vs Helium 10. Compare features, pricing, and India analytics. See why Insydz is the top Helium 10 alternative for Amazon & Flipkart sellers in India." />
      </Helmet>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-1 group">
                <div className="relative">
                  <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Insydz</span>
              </a>              
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              
              {/* Solutions Dropdown */}
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

              {/* Use Cases Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Use Cases')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Use Cases <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Use Cases' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
                <button onMouseEnter={() => setActiveDropdown('Features')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Features' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Features.map((item, i) => (
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

              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">Pricing</Link>

              {/* Free Tools Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Free Tools')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Free Tools' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
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

              {/* Compare Dropdown - HIGHLIGHTED */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Compare')} className="px-3 py-2 text-sm text-blue-600 dark:text-blue-500 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-1">
                  Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Compare' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Compare.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-1">{item.name}</span>
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-blue-600 dark:text-blue-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown('Resources')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'Resources' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navigationMenu.Resources.map((item, i) => (
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
                <button onMouseEnter={() => setActiveDropdown('About')} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1">
                  About <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'About' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'About' && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
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

              <Link href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Login
              </Link>

              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <Check className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
               <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </a>

              {/* Mobile Solutions */}
              <div>
                <button onClick={() => toggleMobileMenu('Solutions')} className="flex items-center justify-between w-full px-4 py-2 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-semibold">
                  Solutions <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Solutions' ? 'rotate-180' : ''}`} />
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
                <button onClick={() => toggleMobileMenu('Use Cases')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Use Cases <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Use Cases' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Use Cases' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu["Use Cases"].map((item, i) => (
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

              {/* Mobile Features */}
              <div>
                <button onClick={() => toggleMobileMenu('Features')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Features' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Features' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Features.map((item, i) => (
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
              
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium">Pricing</Link>

              {/* Mobile Free Tools */}
              <div>
                <button onClick={() => toggleMobileMenu('Free Tools')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Free Tools <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Free Tools' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Free Tools' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu["Free Tools"].map((item, i) => (
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

              {/* Mobile Compare */}
              <div>
                <button onClick={() => toggleMobileMenu('Compare')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Compare <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Compare' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Compare' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Compare.map((item, i) => (
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

              {/* Mobile Resources */}
              <div>
                <button onClick={() => toggleMobileMenu('Resources')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  Resources <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'Resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileActiveMenu === 'Resources' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.Resources.map((item, i) => (
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

              {/* Mobile About */}
              <div>
                <button onClick={() => toggleMobileMenu('About')} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                  About <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === 'About' ? 'rotate-180' : ''}`} />
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

              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-lg font-semibold block">Login</a>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-8">
            <span className="text-sm font-medium text-blue-700">Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
            Insydz vs Helium 10 —
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Which Tool Fits Indian Sellers Better?</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
            Both tools help sellers grow on Amazon. The difference is who they're built for. Compare pricing, marketplace coverage, alerts, and language support — then decide for yourself.
          </p>

          {/* Verdict Strip */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 mb-10 max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium pb-3 pr-6">Metric</th>
                  <th className="text-center text-blue-400 font-bold pb-3 pr-6">Insydz</th>
                  <th className="text-center text-gray-400 font-medium pb-3">Helium 10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { label: 'Starting Price', insydz: '₹0 / month', helium: '~₹3,300+/month ($39)' },
                  { label: 'Flipkart Support', insydz: '✅ Yes', helium: '✗ No' },
                  { label: 'WhatsApp Alerts', insydz: '✅ Yes', helium: '✗ No' },
                  { label: 'Hindi Review Analysis', insydz: '✅ Yes', helium: '✗ No' },
                  { label: 'Free Plan (Permanent)', insydz: '✅ Yes', helium: '✗ 30-day trial only' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="text-gray-400 py-2.5 pr-6 text-left">{row.label}</td>
                    <td className="text-green-400 font-semibold py-2.5 pr-6 text-center">{row.insydz}</td>
                    <td className="text-gray-500 py-2.5 text-center">{row.helium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 py-6 rounded-full shadow-2xl group">
              👉 Start Free with Insydz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              size="lg"
              className="border-2 border-blue-400 text-blue-600 dark:text-blue-400 font-bold px-8 py-6 rounded-full"
            >
              See Full Comparison ↓
            </Button>
          </div>
        </div>
      </section>

      {/* Why Indian Sellers Struggle with Helium 10 */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Why Indian Sellers Struggle with Helium 10
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Helium 10 is a powerful tool — built for Amazon.com sellers in the US. Most Indian sellers who try it hit the same four walls within the first month.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                number: '01',
                title: 'The price feels like a fine, not a plan',
                desc: "Helium 10's paid plans start at $39/month — roughly ₹3,300 at current exchange rates. That's more than many Indian sellers spend on all their SaaS tools combined. And the free plan is a 30-day trial, not a real option for new sellers who need time to validate before committing.",
                color: 'from-red-500 to-orange-500',
              },
              {
                number: '02',
                title: 'No Flipkart. Full stop.',
                desc: "Helium 10 tracks Amazon.com. It has no data for Flipkart — two marketplaces where millions of Indian sellers run a significant portion of their business. If you sell on Flipkart and pay for Helium 10, you're paying for half your coverage.",
                color: 'from-orange-500 to-yellow-500',
              },
              {
                number: '03',
                title: 'Email alerts nobody checks',
                desc: "Helium 10 sends alerts by email. Indian sellers don't run their businesses out of their inbox — they run them from WhatsApp. By the time you check an email about a competitor price drop, the Buy Box is already gone.",
                color: 'from-yellow-500 to-green-500',
              },
              {
                number: '04',
                title: 'Amazon.com data in an Amazon.in world',
                desc: "Helium 10's keyword and demand data is calibrated for US consumer behaviour. Indian festive demand spikes — Diwali, Big Billion Days, Republic Day sales — are invisible to it. Demand estimates, keyword volumes, and revenue projections are built for a market 10,000 km away.",
                color: 'from-blue-500 to-cyan-500',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white font-black text-lg`}>
    {item.number}
  </div>
  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
    {item.title}
  </h3>
</div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-3xl mx-auto text-center">
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              <strong>A fair note:</strong> Helium 10 is an excellent product for Amazon.com sellers. If your primary business is selling on Amazon USA, it's a serious tool worth considering. This comparison is specifically for Indian sellers who sell on Amazon India, Flipkart.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison-table" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Insydz vs Helium 10 — Full Feature Breakdown
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            A direct comparison across every dimension that matters for Indian marketplace sellers — including areas where Helium 10 has the edge.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <th className="px-6 py-4 text-left text-white font-bold">Feature Area</th>
                  <th className="px-6 py-4 text-left text-white font-bold">🇮🇳 Insydz</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Helium 10</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr key={i} className={`border-b border-gray-200 dark:border-gray-700 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-white">{feature.area}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {feature.insydzIcon}
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature.insydz}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {feature.heliumIcon}
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{feature.helium}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Insydz vs Helium 10 Pricing — The Gap Is Real
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            When you're building a business in rupees, paying in dollars creates a hidden tax that compounds every month.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Insydz Pricing */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🇮🇳</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Insydz Pricing</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Free Plan', price: '₹0/month forever', desc: '25 products, no credit card, no expiry date' },
                  { plan: 'Basic', price: '₹1,999/month', desc: 'Full competitor price tracking, keyword monitoring, review analysis' },
                  { plan: 'Premium', price: '₹2,999/month', desc: 'All features, all three marketplaces, priority support' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{item.plan}: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.price}</span>
                      <span className="text-gray-600 dark:text-gray-400"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">All plans billed in INR. No USD billing, no exchange rate risk.</span>
                </li>
              </ul>
            </div>

            {/* Helium 10 Pricing */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🌐</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Helium 10 Pricing (India Reality)</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Starter', price: '$39/month (~₹3,300)', desc: 'Limited features' },
                  { plan: 'Platinum', price: '$99/month (~₹8,300)', desc: 'Full feature access' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{item.plan}: </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{item.price}</span>
                      <span className="text-gray-600 dark:text-gray-400"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
                {[
                  '30-day trial only — not a permanent free option',
                  'Billing in USD means your cost changes with the INR/USD exchange rate',
                  'Platinum-level features only work on Amazon.com — not Amazon.in or Flipkart',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ROI callout */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-black mb-3">Real Cost Over 12 Months</h3>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              A seller on Helium 10 Platinum pays roughly <strong>₹99,600/year</strong>. The same seller on Insydz Premium pays <strong>₹35,988/year</strong> — for a tool that covers Flipkart, sends WhatsApp alerts, and understands Hindi reviews.
            </p>
            <p className="text-white font-black text-3xl mt-4">That's ₹63,612 per year back into inventory.</p>
          </div>
        </div>
      </section>

      {/* Real Seller Scenario */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            What Most Tools Don't Tell You — Real Seller, Real Numbers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            A specific, honest scenario — the kind of situation that plays out every week for mid-size Indian sellers.
          </p>
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Arjun's Big Billion Days Problem — Electronics Category, Amazon India
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { label: 'The situation', value: 'Selling Bluetooth earphones, ₹899 price point, 3.8★ rating, Page 1 for 3 key keywords' },
                    { label: 'What happened', value: 'Went out of stock 11 days before Big Billion Days. Ranking dropped from #7 → #38.' },
                    { label: 'Why it happened', value: 'His tool gave no festive demand warning. No WhatsApp alert. He checked the dashboard 3 days too late.' },
                    { label: 'The loss', value: '₹2.4L in missed Big Billion Days revenue. 6 weeks to recover Page 1 ranking.' },
                    { label: 'With Insydz (same scenario)', value: '14-day early WhatsApp alert. Reordered on time. Sold 650 units vs planned 400.', highlight: true },
                    { label: 'Incremental revenue captured', value: '₹5.2L incremental Big Billion Days revenue', highlight: true },
                  ].map((row, i) => (
                    <tr key={i} className={row.highlight ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                      <td className="py-4 pr-6 font-bold text-gray-700 dark:text-gray-300 w-1/3">{row.label}</td>
                      <td className={`py-4 ${row.highlight ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm">
              The problem wasn't Arjun's product. The problem was that his tool wasn't watching Indian festive patterns — and it didn't tell him fast enough, in a channel he actually checks.
            </p>
          </div>
        </div>
      </section>

      {/* Honest Assessment */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Where Each Tool Has a Clear Edge
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            We believe honest comparisons build more trust than one-sided sales pitches.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Insydz wins */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🇮🇳 Insydz is better if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell on Flipkart alongside Amazon India',
                  'Want alerts on WhatsApp, not email',
                  'Need pricing in INR with no currency risk',
                  'Have customers who write reviews in Hindi or Hinglish',
                  'Want festive demand forecasting (Diwali, BBD, Great Indian Festival)',
                  'Are a new or mid-size seller who needs value before volume',
                  'Want action-driven insights — not just data to interpret',
                  'Are building a D2C brand on Indian marketplaces',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Helium 10 wins */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🌐 Helium 10 is better if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell primarily on Amazon.com (US marketplace)',
                  'Run advanced Amazon PPC campaigns and need Adtomic',
                  'Need deep listing optimization tools for the US market',
                  'Are already a large-scale Amazon US seller',
                  'Need the breadth of 20+ tools in a single platform',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm">
                If you're a purely Amazon US seller, Helium 10 remains a strong choice. But if India is your primary market, the tool you need was built here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Alerts */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            The Alert Nobody Else Sends
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Email alerts require you to be at your desk, logged in, and checking. Indian sellers are on the road, at the warehouse, at a supplier meeting. Insydz sends alerts to where you already are.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                type: 'Price Alert',
                icon: <IndianRupee className="w-6 h-6" />,
                color: 'from-green-500 to-emerald-500',
                message: 'Competitor repriced your category. Their new price: ₹749 (was ₹849). Your price: ₹799. Suggested response: ₹769 — stays above your ₹720 margin floor.',
              },
              {
                type: 'Stockout Warning',
                icon: <Package className="w-6 h-6" />,
                color: 'from-orange-500 to-amber-500',
                message: '14 days of stock remaining for Wireless Earbuds (Black). Big Billion Days starts in 12 days. Recommended reorder: 420 units. Supplier lead time: 8 days.',
              },
              {
                type: 'Ranking Alert',
                icon: <TrendingDown className="w-6 h-6" />,
                color: 'from-red-500 to-rose-500',
                message: '"bluetooth earphones under 1000" dropped from #4 → #11. Competitor listing updated title 3 days ago. Suggested fix: add "under 1000" to your listing title.',
              },
            ].map((alert, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className={`bg-gradient-to-r ${alert.color} p-4 flex items-center gap-3`}>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">{alert.icon}</div>
                  <span className="font-bold text-white text-sm">WhatsApp Alert — {alert.type}</span>
                </div>
                <div className="p-5">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center text-gray-900 dark:text-white">
            FAQs — Insydz vs Helium 10
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 text-white">
            Compare Clearly. Choose What Fits.
          </h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            Start with the free plan — no credit card, no 30-day expiry. See Insydz vs Helium 10 on your own products, with your own data, before spending a rupee.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icp: 'New Seller', headline: 'Just getting started on Amazon or Flipkart', cta: 'Start Free →', action: () => setLocation('/signup') },
              { icp: 'Growing Seller', headline: 'Scaling to ₹5L+ monthly on Indian marketplaces', cta: 'Try Growth Plan →', action: () => setLocation('/pricing') },
              { icp: 'Agency', headline: 'Managing multiple seller accounts across platforms', cta: 'Book Demo →', action: () => setLocation('/about/contact-us') },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-white border border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{card.icp}</p>
                <p className="text-sm mb-4 text-white/90">{card.headline}</p>
                {card.cta === "Try Growth Plan →" ? (
                  <Link href="/pricing" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center">{card.cta}</Link>
                ) : card.cta === "Book Demo →" ? (
                  <Link href="/about/contact-us" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center">{card.cta}</Link>
                ) : (
                  <a href="/signup" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center">{card.cta}</a>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleGetStarted} size="lg" className="bg-white text-blue-700 font-bold px-12 py-6 rounded-full shadow-2xl group">
            👉 Start Free with Insydz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
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
 
