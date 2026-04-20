import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  Users, IndianRupee, Smartphone, Award, Eye, Brain,
  Shield, Sparkles, LineChart, Layers, PieChart, Briefcase,
  Globe, Rocket, Settings, FileText, Layout, Workflow,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store,
  Code, Trophy, ArrowLeft, BookOpen, Video,
  Flame,
  Presentation, LayoutGrid, Lightbulb, Facebook, Linkedin, Instagram, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most comprehensive ecommerce analytics platform for agencies managing Amazon and Flipkart clients.",
    "url": "https://insydz.com/solutions/ecommerce-agencies"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Agencies", "item": "https://insydz.com/solutions/agencies" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best ecommerce analytics platform for agencies in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive ecommerce analytics platform built specifically for agencies managing Amazon and Flipkart clients. Unlike US tools like Triple Whale or StoreHero, Insydz covers Indian marketplace data natively in INR, supports multichannel tracking, and delivers white-label reports your clients will actually value — without per-seat pricing that makes scaling unaffordable." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help ecommerce agencies manage multiple clients?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz provides a unified multi-client dashboard where agencies monitor all client accounts, competitor movements, keyword rankings, and review trends from one place. Each client gets a separate workspace with full Amazon and Flipkart tracking. Onboarding a new client takes under 10 minutes." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz generate white-label reports for my agency clients?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz auto-generates branded monthly and weekly performance reports with your agency's logo. Reports include competitor analysis, keyword rankings, pricing trends, and AI review summaries — compiled automatically. What used to take 4 hours per client now takes one click. Agencies report 10x faster client reporting cycles." }
      },
      {
        "@type": "Question",
        "name": "How many clients can an Indian agency manage on Insydz?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz agency plans support unlimited client accounts on paid tiers. Each workspace includes dedicated tracking, competitor monitoring across 100+ rivals, custom KPI dashboards, and automated reporting. Volume discounts are available for agencies managing 10+ clients." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz support multichannel tracking across Amazon and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz is a true multichannel ecommerce software platform that simultaneously tracks performance across Amazon India and Flipkart for each client. Agencies get a consolidated ecommerce dashboard showing GMV, keyword rankings, competitor prices, and review trends across both marketplaces." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help Indian agencies reduce client churn?",
        "acceptedAnswer": { "@type": "Answer", "text": "The biggest reason clients churn is that they can't see the work being done. Insydz solves this with branded monthly reports showing exactly what happened — competitors caught, rankings recovered, pricing wins made, reviews addressed. Insydz agency users report an 85% client retention rate." }
      },
      {
        "@type": "Question",
        "name": "Is Insydz suitable for small Indian agencies (under 5 clients)?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. The free agency account lets you start managing up to 3 clients with core tracking and reporting features — no credit card required. As your agency grows, paid plans unlock unlimited clients, full white-label reporting, team access controls, and API access." }
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

export default function EcommerceAgenciesPage() {
  const [, setLocation] = useLocation();
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
      const id = `insydz-agency-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-agency-schema-${i}`);
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

  const handleGetStarted = () => { setLocation("/login"); };
  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const scrollToSection = (sectionId: string) => {
    setLocation("/");
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ─── Page Data ────────────────────────────────────────────────────────────────

  const agencyFeatures = [
    {
      icon: <Layout className="w-10 h-10" />,
      title: "Unified Multi-Client Dashboard",
      desc: "Manage all client accounts from one central command hub no logging in and out, no switching tabs, no missed alerts. See every client's GMV, competitor movements, keyword rankings, and review trends at a glance.",
      scenario: "A Delhi-based agency managing 15 Amazon sellers was spending 3 hours every Monday pulling weekly reports. With Insydz's unified dashboard, their account manager now reviews all 15 clients in 25 minutes and spends the rest of Monday building strategy.",
      bullets: [
        "Bird's-eye view of all 12+ client accounts simultaneously",
        "Client-level performance alerts delivered in one feed",
        "Filter by client, marketplace (Amazon/Flipkart), or metric",
        "Custom KPI dashboards per client to track what matters",
      ],
      color: "from-blue-500 to-cyan-500",
      link: "/features/agency-dashboard",
    },
    {
      icon: <FileText className="w-10 h-10" />,
      title: "White-Label Client Reporting",
      desc: "Send clients professional, data-rich monthly reports with your agency's logo auto-generated in one click. No more weekends spent stitching screenshots into PowerPoint decks.",
      scenario: "An agency in Bengaluru was losing clients after 3 months because clients couldn't 'see the work.' After switching to Insydz white-label reports, their average client tenure went from 4 months to 14 months. The reports did the retention work.",
      bullets: [
        "Auto-generated monthly and weekly branded reports",
        "Includes competitor movements, ranking changes, review summaries",
        "Customisable per client show only what's relevant",
        "One-click share via email or PDF 10x faster than manual",
      ],
      color: "from-purple-500 to-pink-500",
      link: "/features/white-label-reporting",
    },
    {
      icon: <Workflow className="w-10 h-10" />,
      title: "Automated Client Intelligence Workflows",
      desc: "Set it once, monitor across all accounts. Insydz automates the intelligence gathering your team previously did by hand across every client account, every day, automatically.",
      scenario: "A Mumbai agency cut their analyst headcount requirement from 3 to 1 after deploying Insydz. The same team now manages 22 clients instead of 8 without sacrificing report quality or response time for any account.",
      bullets: [
        "Automated competitor price alerts per client (WhatsApp + email)",
        "Keyword ranking reports generated without analyst input",
        "AI review summaries delivered daily per client account",
        "Automated pricing and SEO recommendations per product",
      ],
      color: "from-orange-500 to-red-500",
      link: "/features/agency-tools",
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Team Collaboration & Access Controls",
      desc: "Assign team members to specific clients with role-based permissions. Your account managers see only their clients. Senior staff see everything.",
      scenario: "A Hyderabad agency onboarded 6 new clients in one quarter without hiring. Using Insydz's team controls, they redistributed client ownership across existing analysts each with their own filtered dashboard view and maintained quality across all accounts.",
      bullets: [
        "Role-based access: Admin, Manager, Analyst, Viewer",
        "Assign specific clients to specific team members",
        "Internal notes and task tracking per client",
        "API access to integrate Insydz data into your agency tech stack",
      ],
      color: "from-green-500 to-emerald-500",
      link: "/features/multichannel-tracking",
    },
  ];

  const comparisonRows = [
    { feature: "Multi-client dashboard", insydz: "✓ Built-in", others: "✗ Single brand only" },
    { feature: "Indian marketplace data (Amazon.in + Flipkart)", insydz: "✓ Native INR data", others: "✗ US/EU only" },
    { feature: "White-label branded reports", insydz: "✓ Auto-generated", others: "⚠ Limited / paid add-on" },
    { feature: "Competitor intelligence per client", insydz: "✓ Per-client tracking", others: "✗ Not supported" },
    { feature: "Multichannel tracking", insydz: "✓ Amazon + Flipkart", others: "✗ Single channel" },
    { feature: "AI pricing & SEO recommendations", insydz: "✓ Included", others: "✗ Not available" },
    { feature: "Agency volume pricing", insydz: "✓ Volume discounts", others: "✗ Per-seat / per-brand" },
  ];

  const roiWithout = [
    { label: "Manual reporting (50 hrs × analyst cost)", value: "−₹50,000" },
    { label: "Client churn from missed alerts (1 client/quarter)", value: "−₹60,000" },
    { label: "Tool subscription patchwork (5+ tools)", value: "−₹35,000" },
    { label: "Lost new business (no capacity to pitch)", value: "−₹80,000" },
  ];
  const roiWith = [
    { label: "Analyst hours freed → redeployed to strategy", value: "+₹50,000" },
    { label: "Higher retention (85% vs 60% industry avg)", value: "+₹60,000" },
    { label: "Tool consolidation saving", value: "+₹28,000" },
    { label: "2 new clients onboarded (capacity freed)", value: "+₹1,20,000" },
  ];

  const faqs = [
    {
      id: "faq-1",
      q: "What is the best ecommerce analytics platform for agencies in India?",
      a: "Insydz is India's most comprehensive ecommerce analytics platform built specifically for agencies managing Amazon and Flipkart clients. Unlike US tools like Triple Whale or StoreHero, Insydz covers Indian marketplace data natively in INR, supports multichannel tracking, and delivers white-label reports your clients will actually value — without per-seat pricing that makes scaling unaffordable.",
    },
    {
      id: "faq-2",
      q: "How does Insydz help ecommerce agencies manage multiple clients?",
      a: "Insydz provides a unified multi-client dashboard where agencies monitor all client accounts, competitor movements, keyword rankings, and review trends from one place. Each client gets a separate workspace with full Amazon and Flipkart tracking. Onboarding a new client takes under 10 minutes.",
    },
    {
      id: "faq-3",
      q: "Can Insydz generate white-label reports for my agency clients?",
      a: "Yes. Insydz auto-generates branded monthly and weekly performance reports with your agency's logo. Reports include competitor analysis, keyword rankings, pricing trends, and AI review summaries — compiled automatically. What used to take 4 hours per client now takes one click. Agencies report 10x faster client reporting cycles.",
    },
    {
      id: "faq-4",
      q: "How many clients can an Indian agency manage on Insydz?",
      a: "Insydz agency plans support unlimited client accounts on paid tiers. Each workspace includes dedicated tracking, competitor monitoring across 100+ rivals, custom KPI dashboards, and automated reporting. Volume discounts are available for agencies managing 10+ clients.",
    },
    {
      id: "faq-5",
      q: "Does Insydz support multichannel tracking across Amazon and Flipkart?",
      a: "Yes. Insydz is a true multichannel ecommerce software platform that simultaneously tracks performance across Amazon India and Flipkart for each client. Agencies get a consolidated ecommerce dashboard showing GMV, keyword rankings, competitor prices, and review trends across both marketplaces.",
    },
    {
      id: "faq-6",
      q: "How does Insydz help Indian agencies reduce client churn?",
      a: "The biggest reason clients churn is that they can't see the work being done. Insydz solves this with branded monthly reports showing exactly what happened — competitors caught, rankings recovered, pricing wins made, reviews addressed. Insydz agency users report an 85% client retention rate.",
    },
    {
      id: "faq-7",
      q: "Is Insydz suitable for small Indian agencies (under 5 clients)?",
      a: "Absolutely. The free agency account lets you start managing up to 3 clients with core tracking and reporting features — no credit card required. As your agency grows, paid plans unlock unlimited clients, full white-label reporting, team access controls, and API access.",
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/solutions/ecommerce-agencies" />
        <title>Ecommerce Analytics Platform for Agencies | Insydz</title>
        <meta name="description" content="Insydz is the ecommerce analytics platform for agencies managing multiple accounts. Multichannel dashboards, competitor intelligence, and white-label reporting." />
      </Helmet>
      {/* ── NAVIGATION ────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
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
              {/* Solutions */}
              <div className="relative">
                <button onMouseEnter={() => setActiveDropdown("Solutions")}
                  className="px-3 py-2 text-sm text-cyan-600 dark:text-cyan-500 hover:text-cyan-700 font-semibold rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all flex items-center gap-1"
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
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
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
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                >Features <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "Features" ? "rotate-180" : ""}`} /></button>
                {activeDropdown === "Features" && (
                  <div onMouseLeave={() => setActiveDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
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
                <button onMouseEnter={() => setActiveDropdown("Free Tools")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
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
                <button onMouseEnter={() => setActiveDropdown("Compare")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
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
                <button onMouseEnter={() => setActiveDropdown("Resources")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
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
                <button onMouseEnter={() => setActiveDropdown("About")}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
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
              {(["Solutions","Use Cases","Features","Free Tools","Compare","Resources","About"] as (keyof NavigationMenu)[]).map((key) => (
                <div key={key}>
                  <button onClick={() => toggleMobileMenu(key)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium ${key === "Solutions" ? "text-cyan-600 dark:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
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
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-cyan-100 border border-cyan-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
                </span>
                <span className="text-sm font-medium text-cyan-700">India's #1 Ecommerce Analytics Platform for Agencies</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Scale Your Agency.
                <br />
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">
                  Deliver Results
                </span>
                <br />
                That Wow Clients.
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Insydz is India's most powerful <strong>ecommerce analytics platform for agencies</strong> built to manage multiple clients effortlessly. Deliver data-driven strategies that drive real ROI, automate competitive intelligence across Amazon and Flipkart,
                <span className="text-cyan-700 font-semibold"> and keep clients coming back month after month.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-4 sm:px-8 py-6 text-sm sm:text-lg rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all group w-full sm:w-auto"
                >
                  Start Free Agency Account
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" variant="outline"
                  className="border-2 border-cyan-600 text-cyan-700 dark:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Multi-client dashboard all accounts in one place", "White-label reports with your agency's branding", "Agency pricing available no credit card required"].map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-cyan-200 dark:border-cyan-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Agency Dashboard</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Active Clients</p>
                            <p className="text-lg font-bold text-cyan-600">12</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total GMV</p>
                            <p className="text-lg font-bold text-blue-600">₹8.2Cr</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 rounded-r-2xl p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <Rocket className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Client Success Alert</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Client "XYZ Brand" sales up <span className="text-green-600 font-bold">34%</span> this month</p>
                        <p className="text-xs text-gray-500 mt-1">Your optimisation strategy is working!</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">White-Label Report Ready</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Monthly performance report generated — 1 click to send</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">Multi-Client</p>
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
              Why E-commerce Agencies
              <br />
              <span className="text-red-600">Struggle to Scale</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Managing multiple clients without the right tools is a recipe for burnout and client churn. Most Indian e-commerce agencies are stuck using a patchwork of spreadsheets, manual tracking, and generic tools that were never built for multi-client management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Clock className="w-8 h-8" />, title: "Hours wasted on manual reporting for each client every single month", color: "from-red-500 to-orange-500" },
              { icon: <Eye className="w-8 h-8" />, title: "Can't track all clients' competitors in real time blind spots everywhere", color: "from-orange-500 to-yellow-500" },
              { icon: <Settings className="w-8 h-8" />, title: "Switching between 5+ different tools per client kills team productivity", color: "from-cyan-500 to-blue-500" },
              { icon: <TrendingDown className="w-8 h-8" />, title: "Client churn rises when results aren't communicated with data and proof", color: "from-blue-500 to-indigo-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-cyan-400 hover:shadow-xl transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color}
  rounded-2xl flex items-center justify-center
  mb-4 mr-auto
  text-white group-hover:scale-110
  transition-transform shadow-lg`}>
  <div className="flex items-center justify-center w-full h-full">
    {pain.icon}
  </div>
</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Agencies waste <span className="text-red-600">40–60 hours/month</span> on manual work
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Time that could be spent acquiring new clients, optimising campaigns, or building strategies that actually move the needle.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENTIATION / COMPARISON ──────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Generic Ecommerce Tools Were Built
              <br />
              <span className="text-red-600">for Brands, Not for Agencies</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              US-built platforms like Triple Whale or StoreHero were designed for single-brand DTC marketers in the West. They don't support the multi-client, multi-marketplace complexity of Indian e-commerce agencies managing accounts across Amazon.in and Flipkart with all data in INR.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="grid grid-cols-3">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">Feature</p>
              </div>
              <div className="bg-cyan-600 px-6 py-4 border-b-2 border-cyan-500">
  <p className="font-bold text-white text-sm">✓ Insydz</p>
</div>

<div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
  <p className="font-bold text-gray-500 text-sm">Generic Tools</p>
</div>

              {comparisonRows.map((row, i) => (
                <>
                  <div key={`f-${i}`} className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{row.feature}</p>
                  </div>
                  <div
  key={`i-${i}`}
  className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 
  ${i % 2 === 0 ? "bg-cyan-50 dark:bg-cyan-900/10" : "bg-cyan-50/50 dark:bg-cyan-900/10"}`}
>
  <p className="text-sm text-cyan-700 dark:text-cyan-400 font-semibold">
    {row.insydz}
  </p>
</div>

<div
  key={`o-${i}`}
  className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 
  ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}
>
  <p className="text-sm text-gray-500">
    {row.others}
  </p>
</div>
                </>
              ))}
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-500">
            <button onClick={() => setLocation("/compare/insydzvshelium")} className="text-cyan-600 underline hover:text-cyan-700 font-medium">
              Compare Insydz vs. other ecommerce agency software options →
            </button>
          </p>
        </div>
      </section>

      {/* ── SECTION 4: AGENCY GROWTH ENGINE / DEEP FEATURES ──────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Meet Insydz 
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Your Agency Growth Engine</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The only <strong>ecommerce analytics platform</strong> built specifically for Indian agencies managing multiple clients.
              <span className="text-cyan-700 font-semibold"> Deliver premium intelligence without premium overhead and stop trading time for revenue.</span>
            </p>
          </div>

          <div className="space-y-12">
            {agencyFeatures.map((feat, i) => (
              <div key={i} className={`grid lg:grid-cols-2 gap-10 items-start ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={`bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl hover:border-cyan-400 transition-all ${i % 2 === 1 ? "lg:order-2" : ""}`}>
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
                  <button onClick={() => setLocation(feat.link)}
                    className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 underline"
                  >Learn more about this feature →</button>
                </div>

                <div className={`bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-300 dark:border-cyan-700 rounded-3xl p-8 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-2 mb-4">
                
                    <p className="text-sm font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Agency Scenario</p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic text-base">{feat.scenario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FULL FEATURE LIST ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything Your Agency Needs to Scale Without Limits
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Built for agencies, not adapted for them. Every feature exists to solve a real problem Indian e-commerce agencies face every day.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Layout className="w-8 h-8" />, title: "Client Management Dashboard", desc: "Bird's-eye view of all accounts, alerts, and performance no tab-switching" },
              { icon: <FileText className="w-8 h-8" />, title: "Branded White-Label Reports", desc: "Auto-generated monthly/weekly reports with your logo, one-click delivery" },
              { icon: <Users className="w-8 h-8" />, title: "Team Access Controls", desc: "Role permissions (Admin, Manager, Analyst, Viewer), client assignment, separated data views" },
              { icon: <Target className="w-8 h-8" />, title: "Custom Client KPIs", desc: "Unique success metrics per client tracked and reported automatically" },
              { icon: <Sparkles className="w-8 h-8" />, title: "API Access", desc: "Integrate Insydz data into your existing agency tech stack seamlessly" },
              { icon: <IndianRupee className="w-8 h-8" />, title: "Agency Pricing Tiers", desc: "Volume discounts and flexible billing as you scale no per-seat surprises" },
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-cyan-400 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-md">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              How Insydz Works
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">for E-commerce Agencies</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              No complex onboarding. No lengthy integrations. Start managing all clients from one ecommerce analytics platform in under a day.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
  {
    num: "1",
    title: "Onboard All Your Clients",
    desc: "Add unlimited clients to your agency dashboard. Each gets their own workspace with full tracking for Amazon, Flipkart, and competitor data. Onboarding a new client takes under 10 minutes.",
    icon: <Users className="w-12 h-12 text-cyan-600" />,
    bg: "bg-cyan-100 dark:bg-cyan-900/20"
  },
  {
    num: "2",
    title: "Automated Intelligence Gathering",
    desc: "Insydz monitors all clients 24/7 tracking competitors, prices, reviews, keyword rankings, and market trends automatically. Your team stops collecting data and starts acting on it.",
    icon: <Brain className="w-12 h-12 text-blue-600 animate-pulse" />,
    bg: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    num: "3",
    title: "Deliver White-Label Reports",
    desc: "Your clients receive professional, branded reports and you receive the alerts that need action. Intelligence flows without manual effort.",
    icon: null,
    bullets: [
      "One-click branded reports for clients",
      "Automated alerts on client performance",
      "Actionable AI recommendations to share",
    ],
    bg: null
  }
].map((step, i) => (
  <div key={i} className="relative h-full">
    
    <div className="h-full bg-white dark:bg-gray-900 border-2 border-cyan-300 dark:border-cyan-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col items-center text-center">

      {/* Number */}
      <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-6 text-2xl font-black text-white shadow-lg">
        {step.num}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {step.title}
      </h3>

      {/* Description */}
      {step.desc && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {step.desc}
        </p>
      )}

      {/* Icon (NOW PERFECTLY CENTERED) */}
      {step.icon && (
        <div className="w-full flex justify-center">
          <div className={`rounded-2xl p-5 ${step.bg} flex items-center justify-center`}>
            {step.icon}
          </div>
        </div>
      )}

      {/* Bullets */}
      {step.bullets && (
        <div className="mt-4 w-full space-y-3 text-left">
          {step.bullets.map((text, j) => (
            <div
              key={j}
              className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {text}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all group w-full sm:w-auto"
            >
              Start Free Agency Account
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: ROI EXAMPLE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              What Insydz Means for an Agency
              <br />
              <span className="text-cyan-600">Billing ₹8L/Month Retainer</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Without */}
            <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden shadow-lg">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4">
                <p className="font-bold text-red-700 dark:text-red-400 text-lg">Without Insydz — Monthly Cost Leakage</p>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {roiWithout.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{row.label}</p>
                    <p className="text-sm font-bold text-red-600 ml-4 whitespace-nowrap">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-red-50 dark:bg-red-900/20">
                  <p className="font-bold text-gray-900 dark:text-white">Total Monthly Opportunity Cost</p>
                  <p className="font-black text-red-700 text-lg">−₹2,25,000</p>
                </div>
              </div>
            </div>

            {/* With */}
            <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 overflow-hidden shadow-lg">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4">
                <p className="font-bold text-green-700 dark:text-green-400 text-lg">With Insydz — Monthly Value Created</p>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {roiWith.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{row.label}</p>
                    <p className="text-sm font-bold text-green-600 ml-4 whitespace-nowrap">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold text-gray-900 dark:text-white">Net Monthly Agency Gain</p>
                  <p className="font-black text-green-700 text-lg">+₹2,58,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 border-2 border-cyan-400 rounded-2xl p-6 text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              Net agency value unlocked by Insydz:
              <span className="text-cyan-600 ml-2">+₹4,83,000/month</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trusted by Growing Agencies</h2>
            <p className="text-gray-600 dark:text-gray-400">Real efficiency gains for real agencies</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "40–60hrs", label: "Saved Per Month on Manual Work", icon: <Clock className="w-8 h-8" /> },
              { stat: "10x", label: "Faster Client Reporting Cycles", icon: <FileText className="w-8 h-8" /> },
              { stat: "85%", label: "Client Retention Rate", icon: <Award className="w-8 h-8" /> },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200 dark:border-cyan-700 rounded-2xl p-8 text-center hover:scale-105 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">{item.icon}</div>
                <div className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">{item.stat}</div>
                <div className="text-gray-700 dark:text-gray-300 text-lg font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-500 mb-12 text-lg">About Ecommerce Agency Software in India</p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-cyan-300 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4 text-lg">{faq.q}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-5 h-5 text-cyan-500 flex-shrink-0" />
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

      {/* ── SECTION 9: ICP-BASED CTAs ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">Ready to Scale Your Agency?</h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Join e-commerce agencies delivering premium intelligence to clients without the premium overhead.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: "New Agencies (Free Account)",
                desc: "Just starting out with your first 3 clients? Get the full Insydz intelligence stack free. No credit card, no setup complexity.",
                cta: "Start Free Agency Account →",
                action: handleGetStarted
              },
              {
                label: "Growing Agencies (5–20 clients)",
                desc: "You've outgrown spreadsheets. The Agency Growth Plan gives you unlimited clients, full white-label reporting, team access controls, and automated intelligence.",
                cta: "Try Agency Growth Plan →",
                action: () => setLocation("/pricing")
              },
              {
                label: "High-Performance Agencies (20+ clients)",
                desc: "Custom needs? API access, custom KPIs, dedicated account manager, white-glove onboarding, and volume pricing everything you need to dominate at scale.",
                cta: "Book a Demo →",
                action: () => setLocation("/demo")
              }
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left">
              
                <p className="font-bold text-white mb-2">{card.label}</p>
                <p className="text-white/80 text-sm mb-4">{card.desc}</p>
                <button onClick={card.action} className="text-cyan-200 font-semibold text-sm hover:text-white transition-colors underline">{card.cta}</button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-white hover:bg-gray-100 text-cyan-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
            >
              Start Free Agency Account
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
 






















