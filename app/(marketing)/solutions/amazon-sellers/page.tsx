"use client";


import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  ShoppingBag, IndianRupee, Smartphone, Menu, X, Sun, Moon,
  ChevronDown, Store, Briefcase, Users, Code, Globe, Trophy,
  ArrowLeft, BookOpen, Video, FileText,
  Flame,
  Presentation, LayoutGrid, Lightbulb, Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most comprehensive Amazon seller analytics tool — built for sellers doing ₹5L to ₹50L a month.",
    "url": "https://insydz.com/solutions/amazon-sellers"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Amazon India Sellers", "item": "https://insydz.com/solutions/amazon-sellers" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best Amazon seller analytics tool in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive Amazon seller analytics tool, built specifically for Amazon.in. Unlike US-based tools like Helium 10 or Jungle Scout, Insydz works with Indian pricing in INR, supports Amazon India categories, and sends real-time alerts via WhatsApp — not just email. It's designed for sellers doing ₹5L to ₹50L+ monthly." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz track competitor prices on Amazon India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz monitors 100+ competitors across your Amazon India category continuously. When a competitor changes their price, you receive an instant WhatsApp notification, so you can make a repricing decision within minutes — not after losing a day of sales." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz help me improve my Amazon keyword rankings?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz tracks your keyword positions daily on Amazon India and alerts you the moment a ranking slips. The AI then tells you exactly which listing changes or pricing adjustments to make to recover your position. It functions as a full Amazon product research tool and SEO assistant in one." }
      },
      {
        "@type": "Question",
        "name": "Is Insydz suitable for small sellers or beginners on Amazon India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Insydz has a free plan that requires no credit card and takes under 2 minutes to set up. Whether you're launching your first product or managing a growing catalogue, the platform adjusts to your needs." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Helium 10 or Jungle Scout for Indian sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Helium 10 and Jungle Scout are primarily built for Amazon.com in the US. They have limited and often inaccurate data for Amazon India. Insydz is built exclusively for Amazon India — with native INR data, India-specific keyword trends, local competitor dynamics, and WhatsApp alerts." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz work for D2C brands and Amazon agencies in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports multi-brand and multi-ASIN management, making it ideal for D2C brands managing multiple product lines and agencies managing portfolios for multiple clients. Agencies can book a demo for a walkthrough of team and white-label features." }
      },
      {
        "@type": "Question",
        "name": "What makes Insydz's review analysis different from manual reading?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz's AI has already analysed over 250,000 reviews on Amazon India. Instead of reading reviews yourself, you get a ranked list of your most pressing product issues, the percentage of customers mentioning each problem, and actionable fixes — saving 10+ hours a week." }
      }
    ]
  }
];

// ─── Navigation Menu Data ─────────────────────────────────────────────────────
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



// ─── Page Data ────────────────────────────────────────────────────────────────

const coreFeatures = [
  {
    icon: <Target className="w-10 h-10" />,
    title: "Automatic Competitor Tracking",
    desc: "Monitor 100+ competitors across your Amazon India category without lifting a finger. Insydz watches price changes, new entrants, and stock levels 24/7.",
    bullets: [
      "Real-time price drop detection (not delayed reports)",
      "Stock-out alerts for top competitors",
      "New competitor launch notifications",
      "Price history charts for any product on Amazon.in",
    ],
    scenario: "Your competitor drops from ₹899 to ₹749 at 11pm. Insydz sends you a WhatsApp alert at 11:02pm. You reprice by morning — before your Buy Box rank slips.",
    link: "/features/competitor-price-tracking-feature",
    linkLabel: "See Amazon price tracker features →",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <MessageCircle className="w-10 h-10" />,
    title: "AI-Powered Review Insights",
    desc: "Stop reading 500 reviews one by one. Insydz's AI reads all your reviews and your competitors' reviews, then tells you what customers actually want and what's hurting your sales.",
    bullets: [
      "Surface top complaints before they become 1-star ratings",
      "See which product attributes drive 5-star scores",
      "Compare your review sentiment vs. top competitors",
      "Identify review patterns tied to returns or refund spikes",
    ],
    scenario: "342 reviews mention 'packaging breaks in transit.' You fix it. Your returns drop 18% and ratings recover within 3 weeks.",
    link: "/features/review-analytics-feature",
    linkLabel: "Explore review intelligence →",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <TrendingUp className="w-10 h-10" />,
    title: "Pricing AI & SEO Recommendations",
    desc: "Insydz doesn't just show you prices it tells you the exact price to set based on competitor moves, your margin floor, and keyword ranking impact. Your all-in-one Amazon seller tool for pricing and SEO, combined.",
    bullets: [
      "AI calculates optimal price against your cost of goods",
      "Keyword rank tracking across Amazon India search pages",
      "Title and bullet point SEO suggestions in plain Hindi/English",
      "Ranking recovery playbook when positions drop",
    ],
    scenario: "Keyword 'wireless earbuds under 1500' drops from rank #5 to #18. Insydz alerts you and recommends: lower price by ₹80, add keyword in bullet point 2. Rank recovers to #7 in 4 days.",
    link: "/features/keyword-rank-tracking-feature",
    linkLabel: "Explore Amazon keyword rank tracker →",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: <Bell className="w-10 h-10" />,
    title: "Instant WhatsApp Alerts",
    desc: "Email gets ignored. WhatsApp gets opened. Insydz sends real-time intelligence directly to your phone so you act in minutes, not days. This is the alert system Indian sellers have always needed.",
    bullets: [
      "Competitor price drops → instant WhatsApp alert",
      "Keyword rank slip → WhatsApp with recommended fix",
      "New negative review surge → alert + AI summary",
      "Configurable thresholds — no alert spam",
    ],
    scenario: "You're at a trade fair in Surat. Competitor drops price. Your phone buzzes. You check Insydz, reprice from mobile. No lost sales, no panic.",
    link: "/features/whatsapp-alerts-feature",
    linkLabel: "See WhatsApp alerts feature →",
    color: "from-green-500 to-emerald-500",
  },
];

const comparisonRows = [
  { feature: "Amazon India data accuracy", insydz: "✓ Native Amazon.in data", others: "⚠ Limited / inaccurate" },
  { feature: "INR pricing & Indian categories", insydz: "✓ Full INR support", others: "✗ USD-based only" },
  { feature: "WhatsApp alerts", insydz: "✓ Real-time WhatsApp", others: "✗ Email only" },
  { feature: "AI pricing recommendations", insydz: "✓ AI-driven", others: "⚠ Manual rules only" },
  { feature: "Review mining for Indian context", insydz: "✓ India-specific AI", others: "⚠ Generic analysis" },
  { feature: "Pricing", insydz: "✓ Free plan + INR tiers", others: "✗ $99–$399/month USD" },
];

const roiLeakage = [
  { label: "Late repricing (avg 3-day lag)", value: "−₹45,000" },
  { label: "Missed review issues (1-star surge)", value: "−₹30,000" },
  { label: "Keyword rank drops (from #5 to #22)", value: "−₹38,000" },
  { label: "Manual tracking hours (12 hrs/week)", value: "−₹20,000" },
];

const roiRecovery = [
  { label: "Repricing within 15 minutes", value: "+₹38,000" },
  { label: "Review fixes before sales drop", value: "+₹24,000" },
  { label: "Keyword rank recovery", value: "+₹32,000" },
  { label: "Time saved → reinvested in growth", value: "+₹18,000" },
];

const faqs = [
  {
    id: "faq-1",
    q: "What is the best Amazon seller analytics tool in India?",
    a: "Insydz is India's most comprehensive Amazon seller analytics tool, built specifically for Amazon.in. Unlike US-based tools like Helium 10 or Jungle Scout, Insydz works with Indian pricing in INR, supports Amazon India categories, and sends real-time alerts via WhatsApp — not just email. It's designed for sellers doing ₹5L to ₹50L+ monthly.",
  },
  {
    id: "faq-2",
    q: "How does Insydz track competitor prices on Amazon India?",
    a: "Insydz monitors 100+ competitors across your Amazon India category continuously. When a competitor changes their price, you receive an instant WhatsApp notification, so you can make a repricing decision within minutes — not after losing a day of sales.",
  },
  {
    id: "faq-3",
    q: "Can Insydz help me improve my Amazon keyword rankings?",
    a: "Yes. Insydz tracks your keyword positions daily on Amazon India and alerts you the moment a ranking slips. The AI then tells you exactly which listing changes or pricing adjustments to make to recover your position. It functions as a full Amazon product research tool and SEO assistant in one.",
  },
  {
    id: "faq-4",
    q: "Is Insydz suitable for small sellers or beginners on Amazon India?",
    a: "Absolutely. Insydz has a free plan that requires no credit card and takes under 2 minutes to set up. Whether you're launching your first product or managing a growing catalogue, the platform adjusts to your needs.",
  },
  {
    id: "faq-5",
    q: "How is Insydz different from Helium 10 or Jungle Scout for Indian sellers?",
    a: "Helium 10 and Jungle Scout are primarily built for Amazon.com in the US. They have limited and often inaccurate data for Amazon India. Insydz is built exclusively for Amazon India — with native INR data, India-specific keyword trends, local competitor dynamics, and WhatsApp alerts.",
  },
  {
    id: "faq-6",
    q: "Does Insydz work for D2C brands and Amazon agencies in India?",
    a: "Yes. Insydz supports multi-brand and multi-ASIN management, making it ideal for D2C brands managing multiple product lines and agencies managing portfolios for multiple clients. Agencies can book a demo for a walkthrough of team and white-label features.",
  },
  {
    id: "faq-7",
    q: "What makes Insydz's review analysis different from manual reading?",
    a: "Insydz's AI has already analysed over 250,000 reviews on Amazon India. Instead of reading reviews yourself, you get a ranked list of your most pressing product issues, the percentage of customers mentioning each problem, and actionable fixes — saving 10+ hours a week.",
  },
];

const schemaBreadcrumbAmazonSellers = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
    { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
    { "@type": "ListItem", "position": 3, "name": "Amazon India Sellers", "item": "https://insydz.com/solutions/amazon-sellers" }
  ]
};

const schemaFAQAmazonSellers = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best Amazon seller analytics tool in India?",
      "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive Amazon seller analytics tool, built specifically for Amazon.in. Unlike US-based tools like Helium 10 or Jungle Scout, Insydz works with Indian pricing in INR, supports Amazon India categories, and sends real-time alerts via WhatsApp — not just email. It's designed for sellers doing ₹5L to ₹50L+ monthly." }
    },
    {
      "@type": "Question",
      "name": "How does Insydz track competitor prices on Amazon India?",
      "acceptedAnswer": { "@type": "Answer", "text": "Insydz monitors 100+ competitors across your Amazon India category continuously. When a competitor changes their price, you receive an instant WhatsApp notification, so you can make a repricing decision within minutes — not after losing a day of sales." }
    },
    {
      "@type": "Question",
      "name": "Can Insydz help me improve my Amazon keyword rankings?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz tracks your keyword positions daily on Amazon India and alerts you the moment a ranking slips. The AI then tells you exactly which listing changes or pricing adjustments to make to recover your position. It functions as a full Amazon product research tool and SEO assistant in one." }
    },
    {
      "@type": "Question",
      "name": "Is Insydz suitable for small sellers or beginners on Amazon India?",
      "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Insydz has a free plan that requires no credit card and takes under 2 minutes to set up. Whether you're launching your first product or managing a growing catalogue, the platform adjusts to your needs." }
    },
    {
      "@type": "Question",
      "name": "How is Insydz different from Helium 10 or Jungle Scout for Indian sellers?",
      "acceptedAnswer": { "@type": "Answer", "text": "Helium 10 and Jungle Scout are primarily built for Amazon.com in the US. They have limited and often inaccurate data for Amazon India. Insydz is built exclusively for Amazon India — with native INR data, India-specific keyword trends, local competitor dynamics, and WhatsApp alerts." }
    },
    {
      "@type": "Question",
      "name": "Does Insydz work for D2C brands and Amazon agencies in India?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports multi-brand and multi-ASIN management, making it ideal for D2C brands managing multiple product lines and agencies managing portfolios for multiple clients. Agencies can book a demo for a walkthrough of team and white-label features." }
    },
    {
      "@type": "Question",
      "name": "What makes Insydz's review analysis different from manual reading?",
      "acceptedAnswer": { "@type": "Answer", "text": "Insydz's AI has already analysed over 250,000 reviews on Amazon India. Instead of reading reviews yourself, you get a ranked list of your most pressing product issues, the percentage of customers mentioning each problem, and actionable fixes — saving 10+ hours a week." }
    }
  ]
};

export default function AmazonSellersPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inject JSON-LD schemas
  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-amazon-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-amazon-schema-${i}`);
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

  const handleGetStarted = () => { router.push("/login"); };
  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const scrollToSection = (sectionId: string) => {
    router.push("/");
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* ── NAVIGATION ────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background dark:bg-gray-900/80 backdrop-blur-none"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
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
              

              {/* Solutions — highlighted orange */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Solutions")}
                  className="px-3 py-2 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-semibold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-1"
                >Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Solutions" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Solutions" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
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
                <button onMouseEnter={() => setActiveDropdown("Use Cases")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >Use Cases <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Use Cases" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Use Cases" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
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
                <button onMouseEnter={() => setActiveDropdown("Features")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Features" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Features" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu.Features.map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
      {item.badge && (
        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
      )}
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

              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)}
  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
>
  Pricing
</Link>
              {/* Free Tools */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Free Tools")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Free Tools" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Free Tools" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["Free Tools"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
      {item.badge && (
        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
      )}
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
                <button onMouseEnter={() => setActiveDropdown("Compare")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >Compare <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Compare" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Compare" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["Compare"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
      {item.badge && (
        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
      )}
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
                <button onMouseEnter={() => setActiveDropdown("Resources")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Resources" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Resources" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["Resources"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
      {item.badge && (
        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
      )}
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

              {/* About */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("About")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >About <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "About" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "About" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {navigationMenu["About"].map((item, i) => (
  item.route ? (
    <Link href={item.route} key={i} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}
      className="w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-3 group"
    >
      <span className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">{item.icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-1">{item.name}</span>
      {item.badge && (
        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
      )}
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
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources", "About"] as (keyof NavigationMenu)[]).map((key) => (
                <div key={key}>
                  <button onClick={() => toggleMobileMenu(key)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium ${
                      key === "Solutions"
                        ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {key}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === key ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === key && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
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
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                </span>
                <span className="text-sm font-medium text-orange-700">India's #1 Amazon Seller Analytics Tool 🇮🇳</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Stop Guessing on Amazon.
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Sell Smarter
                </span>
                <br />
                with Real-Time Seller Intelligence.
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Insydz is India's most comprehensive <strong>Amazon seller analytics tool</strong> built for sellers doing ₹5L to ₹50L a month. Track competitors, decode reviews, and fix keyword rankings
                <span className="text-orange-700 font-semibold"> without expensive foreign tools or manual Excel work.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button onClick={handleGetStarted} size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
                >
                  Start Free for Amazon Sellers
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" variant="outline"
                  className="w-full sm:w-auto border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {[
                  "Works with Indian pricing & Amazon.in categories",
                  "WhatsApp alerts not ignored emails",
                  "No credit card required",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Premium Wireless Earbuds</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">4.5 (2,341)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-r-2xl p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Competitor Price Drop Alert!</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Top competitor reduced price by <span className="text-red-600 font-bold">12%</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">₹1,999 → ₹1,759</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Alert Sent</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Instant notification on your phone</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">Live Tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PAIN POINTS ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Most Amazon Sellers
              <br />
              <span className="text-red-600">Lose Money</span> (Without Realising It)
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              You're doing everything right running ads, maintaining inventory, writing listings. But a handful of invisible problems are quietly eating into your margins every single month.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <TrendingDown className="w-8 h-8" />, title: "You don't know when competitors change prices until it's too late", color: "from-red-500 to-orange-500" },
              { icon: <MessageCircle className="w-8 h-8" />, title: "You discover bad reviews days after your sales have already dropped", color: "from-orange-500 to-yellow-500" },
              { icon: <Search className="w-8 h-8" />, title: "You guess keywords instead of tracking where your rankings actually stand", color: "from-yellow-500 to-orange-500" },
              { icon: <Clock className="w-8 h-8" />, title: "Manual tracking wastes 8–12 hours every week that should go toward growing", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {pain.icon}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Most Amazon sellers lose <span className="text-red-600">15–30% of profit every month</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              due to late pricing decisions, ignored review signals, and poor keyword visibility none of which show up in your Seller Central dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENTIATION / COMPARISON ──────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Foreign Tools Were
              <br />
              <span className="text-red-600">Never Built for Indian Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Tools like Helium 10 and Jungle Scout are excellent for Amazon.com. But if you're selling on Amazon India, you're paying for data that doesn't match your market, your categories, or your pricing reality.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="grid grid-cols-3">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">Feature</p>
              </div>
              <div className="bg-orange-500 px-6 py-4 border-b-2 border-orange-400">
                <p className="font-bold text-white text-sm text-left">✓ Insydz</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-500 text-sm text-left">Helium 10 / Jungle Scout</p>
              </div>

              {comparisonRows.map((row, i) => (
                <>
                  <div key={`f-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{row.feature}</p>
                  </div>
                  <div key={`i-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 text-left ${i % 2 === 0 ? "bg-orange-50 dark:bg-orange-900/10" : "bg-orange-50/50 dark:bg-orange-900/10"}`}>
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-semibold">{row.insydz}</p>
                  </div>
                  <div key={`o-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 text-left ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-500">{row.others}</p>
                  </div>
                </>
              ))}
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-500">
            <button onClick={() => router.push("/compare/insydzvshelium")} className="text-orange-600 underline hover:text-orange-700 font-medium">
              See full Insydz vs Helium 10 comparison →
            </button>
          </p>
        </div>
      </section>

      {/* ── SECTION 4: DEEP FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Your Amazon Seller Intelligence Brain
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Built for India</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz is not another dashboard. It's an AI-powered decision engine. Instead of showing you numbers,
              <span className="text-orange-700 font-semibold"> it tells you exactly what to do and when to do it.</span>
            </p>
          </div>

          <div className="space-y-12">
            {coreFeatures.map((feat, i) => (
              <div key={i} className="grid lg:grid-cols-2 gap-10 items-start">
                <div className={`bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl hover:border-orange-400 transition-all ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{feat.desc}</p>
                  <ul className="space-y-2 mb-5">
                    {feat.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => router.push(feat.link)} className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline">
                    {feat.linkLabel}
                  </button>
                </div>

                <div className={`bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-8 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Real Scenario</p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic text-base">{feat.scenario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              How Insydz Works
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">for Amazon Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              You don't need a tech team. Setup takes 2 minutes. Intelligence starts flowing immediately.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-3 gap-12 relative items-stretch">

              <div className="relative">
                <div className="bg-white dark:bg-gray-900 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">1</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Amazon Store</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 min-h-[96px]">
                    Connect your Amazon seller account or add your ASINs. Insydz automatically begins tracking your products, competitors, and entire category no manual configuration needed.
                  </p>
                  <div className="bg-orange-100 dark:bg-orange-900/20 rounded-2xl p-4">
                    <ShoppingBag className="w-12 h-12 text-orange-600 mx-auto" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white dark:bg-gray-900 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">2</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Analyses Everything</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 min-h-[96px]">
                    Our AI scans prices, reviews, keyword rankings, and competitor trends across Amazon India 24/7, in real time. No manual data pulling. No Excel uploads.
                  </p>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-2xl p-4">
                    <BarChart3 className="w-12 h-12 text-purple-600 mx-auto animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white dark:bg-gray-900 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">3</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">You Get Clear Actions</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 min-h-[96px]">Instead of charts and confusing dashboards, you get direct, plain-language instructions:</p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-800 dark:text-gray-300">"Competitor dropped price by 12%"</span>
                    </div>
                    <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-800 dark:text-gray-300">"Keyword ranking fell from #8 to #21"</span>
                    </div>
                    <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-800 dark:text-gray-300">"342 reviews mention packaging issue"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group w-full sm:w-auto"
            >
              Start Free & See Your First Insights
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ROI EXAMPLE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              What Insydz Is Worth to a Seller
              <br />
              <span className="text-orange-600">Doing ₹15L/Month</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">A conservative look at what Indian sellers recover when they stop flying blind on Amazon.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Before */}
            <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden shadow-lg">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4">
                <p className="font-bold text-red-700 dark:text-red-400 text-lg">❌ Before Insydz — Monthly Profit Leakage</p>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {roiLeakage.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{row.label}</p>
                    <p className="text-sm font-bold text-red-600 ml-4 whitespace-nowrap">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-red-50 dark:bg-red-900/20">
                  <p className="font-bold text-gray-900 dark:text-white">Total Monthly Leakage</p>
                  <p className="font-black text-red-700 text-lg">−₹1,33,000</p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 overflow-hidden shadow-lg">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4">
                <p className="font-bold text-green-700 dark:text-green-400 text-lg">✅ After Insydz — Monthly Recovery</p>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {roiRecovery.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{row.label}</p>
                    <p className="text-sm font-bold text-green-600 ml-4 whitespace-nowrap">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold text-gray-900 dark:text-white">Net Monthly Gain</p>
                  <p className="font-black text-green-700 text-lg">+₹1,12,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-400 rounded-2xl p-6 text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              Net monthly value unlocked:
              <span className="text-orange-600 ml-2">+₹2,45,000/month</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "250K+", label: "Reviews Analysed on Amazon India", icon: <MessageCircle className="w-8 h-8" /> },
              { stat: "24/7", label: "Real-Time Competitor Tracking", icon: <Clock className="w-8 h-8" /> },
              { stat: "15–30%", label: "Average Profit Recovered", icon: <TrendingUp className="w-8 h-8" /> },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-8 text-center hover:scale-105 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">{item.icon}</div>
                <div className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">{item.stat}</div>
                <div className="text-gray-700 dark:text-gray-300 text-lg font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-500 mb-12 text-lg">About Amazon Seller Tools in India</p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4 text-lg">{faq.q}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: ICP-BASED CTAs ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
            Ready to Stop Losing Money on Amazon?
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Whether you're just starting out or running a ₹50L/month operation, there's a plan built for where you are right now.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: "New Sellers (Free Plan)",
                desc: "Just launched on Amazon India? Get your first competitor insights and keyword rankings without spending a rupee. Learn the market before you scale.",
                cta: "Start Free — No Card Needed →",
                action: handleGetStarted,
              },
              {
                label: "Growing Sellers (₹5L–₹50L/month)",
                desc: "At your scale, every pricing mistake and ranking drop costs real money. Get full competitor tracking, AI recommendations, and WhatsApp alerts.",
                cta: "Try Growth Plan →",
                action: () => router.push("/pricing"),
              },
              {
                label: "Agencies & Brand Managers",
                desc: "Managing multiple brands? Multi-account intelligence, white-label reporting, and portfolio-level competitor analysis built for scale.",
                cta: "Book a Demo →",
                action: () => router.push("/demo"),
              },
            ].map((card, i) => (
              <div key={i} className="bg-background opacity-100 backdrop-blur-none border border-white/20 rounded-2xl p-6 text-left">
                <p className="font-bold text-white mb-2">{card.label}</p>
                <p className="text-white/80 text-sm mb-4">{card.desc}</p>
                <button onClick={card.action} className="text-orange-200 font-semibold text-sm hover:text-white transition-colors underline">{card.cta}</button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
            >
              Start Free for Amazon Sellers
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
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
 















