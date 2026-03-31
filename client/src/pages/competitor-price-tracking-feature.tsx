import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, MessageCircle, Search, Package,
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  ShoppingBag, IndianRupee, Smartphone, X, Check,
  RefreshCw, FileSpreadsheet, Shield, Eye, Sparkles,
  ChevronDown, DollarSign, Menu, Sun, Moon, Store,
  Briefcase, Users, Code, Globe, Trophy, ArrowLeft,
  BookOpen, Video, FileText,
  Flame,
  Presentation, LayoutGrid,
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

// ─── SEO METADATA ────────────────────────────────────────────────────────────
// Page URL:        https://insydz.com/features/competitor-price-tracking
// Meta Title:      Competitor Price Tracking Software for Amazon India & Flipkart — Insydz
// Meta Description: Track competitor prices on Amazon India and Flipkart in real time.
//                  WhatsApp alerts with margin-safe AI reprice suggestions.
//                  Built for Indian sellers. Start free — no credit card.
// Primary Keyword: Competitor price tracking software
// Secondary:       Price tracking tool, Competitor price monitoring software,
//                  Amazon competitor price tracking software, Price history checker,
//                  Online price tracking software, Trend analysis tool
// Long-tail:       Amazon competitor price tracking India, price history checker Amazon India,
//                  online price tracking tool for Flipkart sellers,
//                  competitor price monitoring software India
// Schema Required: FAQPage + SoftwareApplication + HowTo
// ─────────────────────────────────────────────────────────────────────────────


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
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/solutions" },
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

const schemaSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Insydz Competitor Price Tracking",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/competitor-price-tracking-feature",
  "description": "Monitor competitor prices in real time on Amazon & Flipkart with Insydz. Track price history, get instant alerts, and never lose the Buy Box again.",
  "featureList": [
    "Real-time competitor price monitoring across all sellers on an ASIN",
    "Buy Box win probability scoring at any price point",
    "WhatsApp alerts when competitor drops below a price threshold",
    "30-day price trend analysis and seller price distribution",
    "Festive sale mode — heightened monitoring during Big Billion Days and Great Indian Festival",
    "Covers Amazon India, Flipkart, and Meesho"
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

const schemaBreadcrumb = {
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
      "name": "Competitor Price Tracking",
      "item": "https://insydz.com/features/competitor-price-tracking-feature"
    }
  ]
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Insydz competitor price tracking work on Flipkart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz tracks competitor prices on both Amazon India and Flipkart simultaneously from a single dashboard, with WhatsApp alerts for price changes on either marketplace. Most global price tracking tools cover Amazon only — Flipkart support is one of Insydz's core India-first advantages."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly does Insydz detect a competitor's price change?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz monitors competitor prices in real time. When a competing listing changes price, you receive a WhatsApp notification within minutes — including the AI-suggested reprice and confirmation that it stays above your margin floor. There's no waiting for a daily digest or checking a dashboard manually."
      }
    },
    {
      "@type": "Question",
      "name": "Can I set a minimum price so I never reprice below my margin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — this is one of Insydz's most important price tracking features. You set a floor price (your minimum acceptable margin) for each product. Every AI-suggested reprice automatically stays above that floor. Even during a competitor price war, Insydz will never suggest a reprice that puts you below cost. This prevents panic discounting during sale seasons."
      }
    },
    {
      "@type": "Question",
      "name": "Does Insydz track competitor prices on Amazon India specifically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — Insydz is built specifically for Amazon India (Amazon.in), not Amazon.com. Keyword volumes, demand data, fee calculations, and competitor pricing are all calibrated for the Indian marketplace. This is a key difference from global price tracking tools like Prisync or Competera, which are designed for Western markets."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free plan for competitor price tracking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz's free plan includes competitor price monitoring for up to 25 products — permanently, with no credit card required and no expiry date. You get real-time price alerts and the AI reprice suggestion feature. Paid plans (₹1,999/month and ₹2,999/month) expand the product limit and add Flipkart tracking."
      }
    },
    {
      "@type": "Question",
      "name": "How is Insydz different from other price tracking tools like Prisync?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Prisync is excellent for Western e-commerce retailers but designed for website-based price monitoring, not Indian marketplace sellers. Insydz is built for Amazon India and Flipkart: WhatsApp alerts (not email), INR reprice calculations with Amazon.in fee structures, Indian festive demand data in pricing suggestions, and dual-marketplace coverage from one dashboard."
      }
    }
  ]
};

const SCHEMAS = [schemaSoftware, schemaBreadcrumb, schemaFAQ];
// ─────────────────────────────────────────────────────────────────────────────

export default function CompetitorPriceTrackingFeaturePage() {
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
    const id = `insydz-cpt-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      document.getElementById(`insydz-cpt-schema-${i}`)?.remove();
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
  const toggleMobileMenu = (menuName: string) =>
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      setLocation(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  // ─── SEO-OPTIMISED COPY FROM DOCX ─────────────────────────────────────────
  // Section 3: Pain points — Why Indian Sellers Lose the Buy Box
  const painPoints = [
    {
      title: "By the time you notice, it's already over",
      description:
        "A competitor reprices during the Diwali night sale. You're asleep. By morning, you've lost 6 hours of peak traffic. No alert. No reprice. Just lost sales.",
      icon: <Clock className="w-8 h-8" />,
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Panic discounting destroys margins",
      description:
        "Without a floor price set in advance, sellers drop prices impulsively — sometimes below their own profit margin. A price tracking tool without margin protection isn't tracking, it's guessing.",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "Most online price tracking tools don't cover Flipkart",
      description:
        "If you sell on both Amazon India and Flipkart, most competitor price monitoring software only shows half the picture. Competitors repricing on Flipkart can tank your category rank on both platforms.",
      icon: <RefreshCw className="w-8 h-8" />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Email alerts you check tomorrow — not tonight",
      description:
        "Most price tracking tools send email notifications. Indian sellers don't monitor business email around the clock. By the time you open that email, three competitors have already stolen the Buy Box back.",
      icon: <Shield className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
    },
  ];

  // Section 8: India-First advantages
  const indiaFirstAdvantages = [
    {
      num: "1",
      title: "Amazon India + Flipkart",
      description:
        "Track competitor prices across both major Indian marketplaces in one dashboard. Most tools cover one or the other.",
    },
    {
      num: "2",
      title: "WhatsApp, not email",
      description:
        "Alerts go to WhatsApp — where you already are. Not an email dashboard you check twice a week.",
    },
    {
      num: "3",
      title: "INR margin calculations",
      description:
        "Every reprice suggestion accounts for Amazon.in fees, your purchase cost, GST, and your target margin — in rupees. No currency conversion.",
    },
    {
      num: "4",
      title: "Festive demand intelligence",
      description:
        "Diwali, Big Billion Days, Great Indian Festival — pricing suggestions account for demand spikes, not just competitor moves. When demand is rising 4×, Insydz factors that into your reprice logic.",
    },
  ];

  // Section 9: Testimonials
  const testimonials = [
    {
      quote:
        "I used to check competitor prices manually every morning. By the time I reacted, the damage was done. Insydz WhatsApp alerts changed everything — I now respond to price drops within minutes, not hours. The Buy Box protection alone paid for the tool 10x over in one sale season.",
      name: "Suresh R.",
      role: "Electronics seller, Bengaluru · Amazon India",
    },
    {
      quote:
        "The floor price feature is what I needed most. Before Insydz, I'd panic-discount below my margin just to stay competitive during sales. Now I set a floor and let the AI suggest the right price. I've stopped selling at a loss and still hold the Buy Box.",
      name: "Priya M.",
      role: "Home goods D2C brand, Pune · Amazon India + Flipkart",
    },
    {
      quote:
        "We manage 12 seller accounts. Checking competitor prices manually was a full-time job for two people. Insydz handles the monitoring across all accounts and the accounts that use it have 40% fewer Buy Box losses than when we did it manually.",
      name: "Arjun T.",
      role: "E-commerce agency, Mumbai · 12 seller accounts",
    },
  ];

  // Intelligence flow strip (Section 2)
  const intelligenceSteps = [
    {
      step: "1",
      trigger: "Competitor drops price",
      what: "AI detects price change, calculates margin-safe reprice",
      result: "Price alert triggered",
    },
    {
      step: "2",
      trigger: "Analysis complete",
      what: "System checks your floor price, margin %, and Buy Box status",
      result: "Suggestion generated",
    },
    {
      step: "3",
      trigger: "Alert sent",
      what: "WhatsApp message delivered within minutes",
      result: "You act in seconds",
    },
    {
      step: "4",
      trigger: "You reprice",
      what: "Update price from your phone in 2 taps",
      result: "Buy Box protected. Margins held.",
    },
  ];

  // Section 10: All-in-one platform advantages
  const platformAdvantages = [
    {
      advantage: "No tool switching",
      meaning:
        "Prices, reviews, keywords, AI recommendations — all in one place. One decision from one dashboard.",
    },
    {
      advantage: "No data overload",
      meaning:
        "Features surface actions, not raw numbers. You see what to do, not just what happened.",
    },
    {
      advantage: "Clear actions always",
      meaning:
        "Every insight comes with a recommended next step — not a chart to interpret at midnight.",
    },
    {
      advantage: "Built for India",
      meaning:
        "Amazon India and Flipkart — not a global tool retrofitted for Indian markets.",
    },
  ];

  // Section 11: SEO-optimised FAQs
  const faqs = [
    {
      question: "Does Insydz competitor price tracking work on Flipkart?",
      answer:
        "Yes. Insydz tracks competitor prices on both Amazon India and Flipkart simultaneously from a single dashboard, with WhatsApp alerts for price changes on either marketplace. Most global price tracking tools cover Amazon only — Flipkart support is one of Insydz's core India-first advantages.",
    },
    {
      question: "How quickly does Insydz detect a competitor price change?",
      answer:
        "Insydz monitors competitor prices in real time. When a competing listing changes price, you receive a WhatsApp notification within minutes — including the AI-suggested reprice and confirmation that it stays above your margin floor. There's no waiting for a daily digest or checking a dashboard manually.",
    },
    {
      question: "Can I set a minimum price so I never reprice below my margin?",
      answer:
        "Yes — this is one of Insydz's most important price tracking features. You set a floor price (your minimum acceptable margin) for each product. Every AI-suggested reprice automatically stays above that floor. Even during a competitor price war, Insydz will never suggest a reprice that puts you below cost. This prevents panic discounting during sale seasons.",
    },
    {
      question: "Does Insydz track competitor prices on Amazon India specifically?",
      answer:
        "Yes — Insydz is built specifically for Amazon India (Amazon.in), not Amazon.com. Keyword volumes, demand data, fee calculations, and competitor pricing are all calibrated for the Indian marketplace. This is a key difference from global price tracking tools like Prisync or Competera, which are designed for Western markets.",
    },
    {
      question: "Is there a free plan for competitor price tracking?",
      answer:
        "Yes. Insydz's free plan includes competitor price monitoring for up to 25 products — permanently, with no credit card required and no expiry date. You get real-time price alerts and the AI reprice suggestion feature. Paid plans (₹1,999/month and ₹2,999/month) expand the product limit and add Flipkart tracking.",
    },
    {
      question: "How is Insydz different from other price tracking tools like Prisync?",
      answer:
        "Prisync is excellent for Western e-commerce retailers but designed for website-based price monitoring, not Indian marketplace sellers. Insydz is built for Amazon India and Flipkart: WhatsApp alerts (not email), INR reprice calculations with Amazon.in fee structures, Indian festive demand data in pricing suggestions, and dual-marketplace coverage from one dashboard.",
    },
  ];
  function scrollToSection(sectionId: string) {
    setLocation("/");
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/features/competitor-price-tracking-feature" />
        <title>Competitor Price Tracking & Price History Checker | Insydz</title>
        <meta name="description" content="Monitor competitor prices in real time on Amazon & Flipkart with Insydz. Track price history, get instant alerts, and never lose the Buy Box again." />
        <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schemaSoftware),
    }}
  />

  {/* ✅ Breadcrumb Schema */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schemaBreadcrumb),
    }}
  />

  {/* ✅ FAQ Schema */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schemaFAQ),
    }}
  />
      </Helmet>
      {/* ─── NAVIGATION ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Back Button */}
            <div className="flex items-center space-x-3">
              
            <a href="/" className="flex items-center space-x-1 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Insydz Logo"
                    className="w-10 h-auto shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Insydz
                </span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3" ref={dropdownRef}>
              

              {/* Solutions */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("Solutions")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
                >
                  Solutions
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Solutions" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Solutions" && (
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

              {/* Use Cases */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("Use Cases")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
                >
                  Use Cases
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Use Cases" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Use Cases" && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["Use Cases"].map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">{item.name}</span>
                        </Link>
                      ) : (
                        <span key={i} className="w-full px-4 py-3 flex items-center gap-3 opacity-60 cursor-default">
                          <span className="text-orange-600 dark:text-orange-400">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Features — highlighted (current page) */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("Features")}
                  className="px-3 py-2 text-sm text-orange-600 dark:text-orange-500 font-semibold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
                >
                  Features
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Features" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Features" && (
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

              <Link href="/pricing" className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">Pricing</Link>

              {/* Free Tools */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("Free Tools")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Free Tools
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Free Tools" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Free Tools" && (
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
                <button
                  onMouseEnter={() => setActiveDropdown("Compare")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  Compare
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Compare" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Compare" && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                     {navigationMenu.Compare.map((item, i) => (
                      item.route ? (
                        <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group">
                          <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
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

              {/* Resources */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("Resources")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
                >
                  Resources
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Resources" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "Resources" && (
                  <div
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
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

              {/* About */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("About")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >
                  About
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "About" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "About" && (
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

              <a href="/login" className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-block">
                Login
              </a>
              <button
                className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
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

              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as const).map((menuKey) => (
                <div key={menuKey}>
                  <button
                    onClick={() => toggleMobileMenu(menuKey)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium ${
                      menuKey === "Features"
                        ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    {menuKey}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menuKey ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === menuKey && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[menuKey] as MenuItemWithBadge[]).map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                            {item.icon}{item.name}
                            {item.badge && <span className="ml-auto text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
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
              ))}

              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium">Pricing</Link>

              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 rounded-lg font-semibold block">Login</a>

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
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      {/* SEO H1: "Stop Losing the Buy Box. React to Competitor Price Drops Before They Cost You Sales." */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="text-lg">🇮🇳</span>
                <span className="text-sm font-medium text-orange-700">Built for Indian Sellers</span>
              </div>

              {/* H1 — primary keyword in first 100 words */}
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Stop Losing the Buy Box.
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  React to Competitor Price Drops
                </span>
                <br />
                Before They Cost You Sales.
              </h1>

              {/* Hero body — competitor price tracking software keyword density target */}
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Insydz <strong>competitor price tracking software</strong> monitors every competing
                listing on Amazon India and Flipkart — in real time — and sends a WhatsApp alert
                the moment a competitor undercuts you.{" "}
                <span className="text-orange-700 font-semibold">
                  With a suggested reprice that protects your margins.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/login" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl transition-all inline-flex items-center">
                  🚀 Start Free →
                  <ArrowRight className="ml-2" />
                </a>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  See How It Works →
                </Button>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Built for Indian sellers", "Amazon & Flipkart", "WhatsApp-first alerts"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Price Monitor Widget */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Live Price Monitor</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-semibold">
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* Competitor A — price dropped */}
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-3 animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Competitor A</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 line-through">₹1,399</span>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-lg font-bold text-red-600">₹1,249</span>
                        </div>
                      </div>
                      <p className="text-xs text-red-600 font-semibold">↓ ₹150 — Buy Box at risk!</p>
                    </div>
                    {/* Your product */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Product</span>
                        <span className="text-lg font-bold text-green-700 dark:text-green-400">₹1,399</span>
                      </div>
                    </div>
                    {/* Competitor B */}
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Competitor B</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-lg font-bold text-gray-700 dark:text-gray-300">₹1,299</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp alert in widget */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Alert</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          "Competitor A dropped ₹150. Suggested reprice: ₹1,279 — stay above your ₹1,180 floor. React now."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">🔴 Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 2: INTELLIGENCE FLOW STRIP ─────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">Not Isolated Tools. One Intelligence System.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Each signal connects — so a competitor price drop doesn't just trigger an alert, it triggers a
              margin-safe reprice suggestion, a WhatsApp notification, and a decision you can act on in seconds.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {intelligenceSteps.map((s, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-orange-500 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-sm mb-3">
                  {s.step}
                </div>
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-1">{s.trigger}</p>
                <p className="text-gray-300 text-sm mb-2">{s.what}</p>
                <p className="text-green-400 text-xs font-bold">→ {s.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 3: WHY INDIAN SELLERS STRUGGLE ─────────────────────────── */}
      {/* Internal link anchor: /use-cases/track-competitor-prices */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Indian Sellers Lose the Buy Box —
              <br />
              <span className="text-red-600">Even With Good Products</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The Buy Box doesn't reward the best product. It rewards the most competitive price, at the right moment.
              Most Indian sellers find out they've lost it hours too late — after the damage is done.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {painPoints.map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {pain.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm leading-snug">{pain.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{pain.description}</p>
              </div>
            ))}
          </div>

          {/* Stat callout */}
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Late price reactions cause <span className="text-red-600">20–40% revenue leakage</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">in competitive categories.</p>
          </div>

          {/* Manual vs Automated comparison */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Manual Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Seller manually checking listings, missing price changes by hours</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Automated Alerts</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Insydz <a href="/use-cases/track-competitor-prices" className="text-orange-600 underline">tracks competitor prices on Amazon India</a> — instant WhatsApp notification, never miss a change
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 4: FEATURE ROW — COMPETITOR PRICE MONITORING ───────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                Track Every Price Move — Before It Costs You the Sale
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Insydz monitors competitor prices across Amazon India and Flipkart continuously.
                The moment a competing listing drops below yours — or near your margin floor — you know
                about it. Not tomorrow. <span className="font-semibold text-orange-600">Now.</span>
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time price change detection on Amazon.in and Flipkart",
                  "Track up to 500 competitor ASINs simultaneously",
                  "Price history chart — spot patterns before sale seasons",
                  "Set margin floor — never reprice below your profit threshold",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 rounded-full shadow-xl group"
              >
                👉 Track Your First Competitor Free
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Price History Widget */}
            <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 rounded-3xl p-8 shadow-xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Price History — 30 Days</h3>
              <div className="space-y-4">
                {[
                  { label: "Competitor A price (30 days ago)", value: "₹1,399", color: "text-gray-700 dark:text-gray-300" },
                  { label: "Competitor A price today", value: "₹1,149 (↓₹250)", color: "text-red-600 font-bold" },
                  { label: "Your floor price", value: "₹1,180 (18% margin min.)", color: "text-orange-600 font-semibold" },
                  { label: "AI suggested reprice", value: "₹1,279 (+12% est. sales lift)", color: "text-green-600 font-bold" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
                    <span className={`text-sm ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                  💡 AI: Drop ₹120 now — 3 competitors are at ₹1,249. Win more Buy Box without hurting margins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 5: FEATURE ROW — WHATSAPP-FIRST ALERTS ─────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* WhatsApp message mockups */}
            <div className="space-y-4">
              {/* Alert message */}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Price Alert</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Insydz Alert:</strong> Competitor A dropped to ₹1,249 (–₹150) on your Bluetooth Earphones listing.
                  Suggested: ₹1,279. Buy Box at risk. Act within 2 hours.
                </p>
              </div>
              {/* Confirmation message */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Action Taken</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You updated to ₹1,279. Buy Box secured. Margin protected.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                The Alert That Gets Read — Not Filed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Every price alert goes directly to your WhatsApp. Not an email digest. Not a notification
                you'll see on Monday. A WhatsApp message within seconds of a price change — with the exact
                reprice action already calculated for you.
              </p>
              <ul className="space-y-3">
                {[
                  "Instant WhatsApp notification on every competitor price move",
                  "Alert includes suggested reprice — not just raw data",
                  "Margin floor embedded — never reprice into a loss",
                  "Acknowledge and act in under 2 minutes from anywhere",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── MID-PAGE CTA BANNER ─────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-2">Try all features free — no credit card required.</h2>
          <p className="text-orange-100 mb-6">Start free and see real-time competitor price data on your own products.</p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-5 rounded-full shadow-2xl"
          >
            🚀 Start Free Today
          </Button>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 6: AI PRICE OPTIMIZATION ───────────────────────────────── */}
      {/* Internal link target: /features/price-optimization */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                Price to Win — Not to Panic
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Most sellers reprice based on gut feel — dropping too far, too fast, and crushing margins.
                Insydz's{" "}
                <a href="/features/price-optimization" className="text-orange-600 underline">AI price optimization</a>{" "}
                suggests the right price based on competitor moves, your margin floor, demand signals, and category
                trends — so every reprice is a calculated decision, not a panic response.
              </p>
              <ul className="space-y-3">
                {[
                  "AI-suggested price based on live competitive landscape",
                  "Accounts for Amazon fees, your purchase cost, and target margin",
                  "Festive demand multipliers built into price suggestions",
                  "One-click reprice from the WhatsApp alert itself",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Suggestion Widget */}
            <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">AI Price Suggestion</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Current price", value: "₹1,399", sublabel: "Your price", color: "text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700" },
                  { label: "Suggested price", value: "₹1,279", sublabel: "AI recommended (+12% sales)", color: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20" },
                  { label: "Floor price", value: "₹1,180", sublabel: "Minimum margin protection", color: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20" },
                ].map((row, i) => (
                  <div key={i} className={`rounded-xl p-4 ${row.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{row.label}</p>
                        <p className="text-xs opacity-60">{row.sublabel}</p>
                      </div>
                      <p className="text-2xl font-black">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 7: REAL SELLER SCENARIO — VIKRAM ───────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              What Most Price Tracking Tools Don't Tell You
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Most <strong>online price tracking software</strong> tells you what happened.
              Insydz tells you what to do — before the Buy Box is gone.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl mb-8">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h3 className="text-white font-bold text-lg">
                Vikram's Big Billion Days Buy Box Battle — Electronics, Amazon India
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Scenario</th>
                    <th className="px-5 py-3 text-center text-xs font-bold text-red-600 uppercase">Without Insydz</th>
                    <th className="px-5 py-3 text-center text-xs font-bold text-green-600 uppercase">With Insydz</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { scenario: "Competitor price drop", without: "11pm Day 1 — ₹1,099", with: "Detected at 11:03pm" },
                    { scenario: "Alert received", without: "Email — seen at 9am next day", with: "WhatsApp at 11:03pm" },
                    { scenario: "Time to react", without: "10 hours lost", with: "4 minutes" },
                    { scenario: "Buy Box status", without: "Lost 10 hours of peak season traffic", with: "Retained all night" },
                    { scenario: "Big Billion Days revenue", without: "₹1.8L in missed sales", with: "₹4.2L captured" },
                    { scenario: "Ad spend to recover", without: "₹42,000 recovery campaign", with: "₹0" },
                    { scenario: "Margin impact", without: "Panic discount below floor", with: "Repriced to ₹1,249 — 19% margin held" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.scenario}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{row.without}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-center justify-center gap-1">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-xs text-gray-900 dark:text-white font-medium">{row.with}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Callout */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 rounded-3xl p-8 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Vikram pays ₹1,999/month for Insydz. The single Big Billion Days intervention recovered ₹4.2L in revenue — a{" "}
              <span className="text-orange-600">210x return</span> on his monthly subscription.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm italic">
              "The competitor price drop happened at 11pm. The Insydz WhatsApp arrived at 11:03pm. The reprice happened at 11:07pm. The Buy Box never left."
            </p>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 8: INDIA-FIRST ADVANTAGE ───────────────────────────────── */}
      {/* Internal link: /solutions/flipkart-sellers for "competitor price monitoring for Flipkart" */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              What Most Competitor Price Monitoring Tools Don't Cover
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Global price tracking software is built for Amazon.com. Insydz is built for Amazon India
              and Flipkart — with the Indian festive calendar, INR margin calculations, and WhatsApp
              alerts baked in from day one.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {indiaFirstAdvantages.map((adv, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black flex-shrink-0">
                    {adv.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{adv.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{adv.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-8 text-center">
            <p className="text-gray-300 text-lg">
              <span className="text-orange-400 font-bold">What most price tracking tools don't tell you:</span>{" "}
              Tracking is only half the job. The harder problem is knowing what price to reprice to — accounting for
              your margin, the competitive position, and whether demand is rising or falling.
              Insydz does both. Global tools do one.
            </p>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 9: TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Indian Sellers Who Stopped Losing the Buy Box
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 10: WHY ALL-IN-ONE PLATFORM ────────────────────────────── */}
      {/* Internal links: /features/review-analytics, /use-cases/avoid-stockouts, /use-cases/improve-seo */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Why Sellers Prefer an All-in-One Intelligence Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Competitor price tracking is one signal. Insydz connects it to your{" "}
              <a href="/features/review-analytics" className="text-orange-600 underline">review analysis tool</a>,{" "}
              <a href="/use-cases/improve-seo" className="text-orange-600 underline">keyword rank tracking for Amazon India</a>, and{" "}
              <a href="/use-cases/avoid-stockouts" className="text-orange-600 underline">inventory management tool</a>{" "}
              — so every decision is informed by the full picture.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {platformAdvantages.map((adv, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{adv.advantage}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{adv.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 11: FAQ — Schema-optimised ─────────────────────────────── */}
      {/* FAQPage schema exported at top of file */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Competitor Price Tracking — FAQs
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              All answers are structured for Google Featured Snippet extraction.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-orange-400 transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-orange-600 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── COMPARISON TABLE ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Manual Price Tracking vs Insydz
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Task</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Manual Tracking</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">With Insydz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { task: "Monitoring", manual: "Checking listings manually", insydz: "Automatic 24/7 tracking" },
                  { task: "Response Time", manual: "Late reactions — hours later", insydz: "Instant WhatsApp alerts" },
                  { task: "Data Management", manual: "Excel sheets & spreadsheets", insydz: "Live price dashboards" },
                  { task: "Decision Quality", manual: "Panic discounting", insydz: "Margin-safe AI reprice" },
                  { task: "Flipkart Coverage", manual: "Manual — if at all", insydz: "Full dual-marketplace tracking" },
                  { task: "Time Investment", manual: "Hours wasted daily", insydz: "Minutes per day" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.task}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{row.manual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-10 py-6 text-lg rounded-full shadow-xl"
            >
              👉 Switch to Smart Price Tracking
            </Button>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── SECTION 13: FINAL CTA — ICP-Segmented ──────────────────────────── */}
      {/* Trust strip: No credit card required · Setup in 2 minutes · Cancel anytime */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              One Platform. All the Intelligence You Need.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start free and experience real insights on your own products — no setup, no credit card.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icp: "New Seller",
                headline: "Just starting on Amazon India or Flipkart?",
                cta: "Start Free →",
                action: handleGetStarted,
                style: "from-orange-500 to-red-500",
              },
              {
                icp: "Growing Seller",
                headline: "Scaling to ₹5L+ monthly — protect every rupee",
                cta: "Try Growth Plan →",
                action: () => setLocation("/pricing"),
                style: "from-red-500 to-pink-500",
              },
              {
                icp: "Agency",
                headline: "Managing multiple seller accounts across platforms",
                cta: "Book Demo →",
                action: handleGetStarted,
                style: "from-pink-500 to-rose-500",
              },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:shadow-xl transition-all">
                <div className={`inline-flex text-xs font-bold text-white bg-gradient-to-r ${card.style} px-3 py-1 rounded-full mb-4`}>
                  {card.icp}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-5 leading-relaxed">{card.headline}</p>
                <Button
                  onClick={card.action}
                  className={`w-full bg-gradient-to-r ${card.style} text-white font-bold rounded-full`}
                >
                  {card.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-6">
            {["No credit card required", "Setup in 2 minutes", "Cancel anytime"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── RELATED FEATURES ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Related Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Review Analytics", icon: <MessageCircle />, color: "from-purple-500 to-pink-500", route: "/features/review-analytics-feature" },
              { title: "AI Price Optimization", icon: <DollarSign />, color: "from-green-500 to-emerald-500", route: "/features/price-optimization-feature" },
              { title: "Keyword & Rank Tracking", icon: <Search />, color: "from-blue-500 to-cyan-500", route: "/features/keyword-rank-tracking-feature" },
              { title: "Product Research", icon: <Target />, color: "from-orange-500 to-red-500", route: "/features/product-research-feature" },
              { title: "AI Recommendations", icon: <Sparkles />, color: "from-indigo-500 to-purple-500", route: "/features/ai-recommendations-feature" },
              { title: "WhatsApp Alerts", icon: <Bell />, color: "from-green-500 to-emerald-500", route: "/features/whatsapp-alerts-feature" },
            ].map((feature, i) => (
              <div
                key={i}
                onClick={() => feature.route && setLocation(feature.route)}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{feature.title}</h3>
                <ArrowRight className="w-5 h-5 text-orange-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ─── FINAL CTA BAR ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            Stop Guessing Prices.
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Track Competitors Automatically.
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
            >
              👉 Start Free Price Tracking
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => setLocation("/")}
              size="lg"
              variant="outline"
              className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-12 py-6 text-lg rounded-full"
            >
              Explore All Features →
            </Button>
          </div>
        </div>
      </section>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-4 shadow-2xl z-40">
        <Button
          onClick={handleGetStarted}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-full shadow-xl"
        >
          👉 Start Free Price Tracking
        </Button>
      </div>

            {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0f1e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Insydz Logo" className="w-10 h-10 object-contain p-0.5" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Insydz</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                AI-powered ecommerce analytics solution for Indian marketplace sellers.
              </p>
              <a href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free →
              </a>

              <div className="flex space-x-3 mt-6">
                {[
                  { title: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61586202582209', icon: '🅕' },
                  { title: 'Twitter', href: 'https://x.com/growwithinsydz', icon: '𝕏' },
                  { title: 'Instagram', href: 'https://www.instagram.com/growwithinsydz/', icon: '📷' },
                  { title: 'LinkedIn', href: 'https://www.linkedin.com/company/insydz/?viewAsMember=true', icon: 'in' },
                ].map(s => (
                  <a key={s.title} title={s.title} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-xs font-bold"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Solutions</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Amazon Sellers', route: '/solutions/amazon-sellers' },
                  { label: 'Flipkart Sellers', route: '/solutions/flipkart-sellers' },
                  { label: 'Agencies', route: '/solutions/ecommerce-agencies' },
                  { label: 'Brand Managers', route: '/solutions/brand-managers' },
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.route} className="text-sm text-gray-400 hover:text-white transition-colors text-left">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Features', route: '/features' },
                  { label: 'Pricing', route: '/pricing' },
                  { label: 'Festive Trends', route: '/features/festive-trend-feature' },
                  { label: 'Compare', route: '/compare/insydzvshelium' },
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.route} className="text-sm text-gray-400 hover:text-white transition-colors text-left">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Resources</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Blog', route: '/resources/expert-blog' },
                  { label: 'E-commerce Guides', route: '/resources/guides' },
                  { label: 'Video Tutorials', route: '/resources/videos' },
                  { label: 'Case Studies', route: '/resources/case-studies' },
                  { label: 'Free Tools', route: '/free-tools/free-amazon-product-analyzer' },
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.route} className="text-sm text-gray-400 hover:text-white transition-colors text-left">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About', action: () => scrollToSection('About') },
                  { label: 'Our Vision', action: () => setLocation('/about/our-vision') },
                  { label: 'Careers', action: () => setLocation('/about/careers') },
                  { label: 'Contact', action: () => setLocation('/about/contact-us') },
                ].map((item, i) => (
                  <li key={i}>
                    <button onClick={item.action} className="text-sm text-gray-400 hover:text-white transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}























