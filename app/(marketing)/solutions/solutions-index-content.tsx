"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, ChevronRight, Check, Users, Store, TrendingUp, 
  ShoppingBag, Briefcase, Target, Zap, AlertCircle, ArrowRight,
  CheckCircle2, Package, BarChart3, Smartphone, IndianRupee,
  Menu, X, Sun, Moon, Code, Globe, Trophy, ArrowLeft, BookOpen,
  Video, FileText, MessageCircle, Bell, Search, TrendingDown,
  Flame, 
  Presentation, LayoutGrid, Lightbulb, Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import { Button } from "@/components/ui/button";


export const dynamic = "force-static";

// ─── Schema Injection (runs once on mount) ───────────────────────────────────
const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "AI-powered ecommerce analytics solution for Amazon, Flipkart sellers in India.",
    "url": "https://insydz.com/solutions"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I switch between solutions later?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz is designed to adapt as your business grows. You can switch your solution type inside the product dashboard at any time — no data loss, no restart required." }
      },
      {
        "@type": "Question",
        "name": "Do the solutions work across multiple platforms — Amazon, Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports multi-platform intelligence from a single dashboard. The same data engine powers insights for Amazon India, Flipkart, with platform-specific signals surfaced based on your solution type." }
      },
      {
        "@type": "Question",
        "name": "Is pricing different for each solution?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. All solutions are powered by the same Insydz platform. Pricing is based on your plan tier, not the solution type you choose." }
      },
      {
        "@type": "Question",
        "name": "Can agencies access multiple solutions for different clients?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Agency solution includes multi-account access, allowing you to manage different client profiles — each with their own solution type, marketplace focus, and reporting view — from a single Insydz workspace." }
      },
      {
        "@type": "Question",
        "name": "Is the free plan available for all solutions?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can start free on any solution type. No credit card required. The free plan gives you access to core intelligence features so you can evaluate Insydz before upgrading." }
      },
      {
        "@type": "Question",
        "name": "Which solution is best for Amazon vs Flipkart sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Amazon sellers benefit most from Insydz's pricing AI, Buy Box tracking, and review mining features. Flipkart sellers get the most value from keyword visibility, SEO gap analysis, and competitor monitoring tools. Both are available on the same platform." }
      },
      {
        "@type": "Question",
        "name": "Can I use more than one solution at the same time?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. If you sell on both Amazon and Flipkart, or run both a D2C brand and a marketplace store, Insydz can be configured to surface insights across all your active channels simultaneously." }
      },
      {
        "@type": "Question",
        "name": "What is the best ecommerce analytics solution for Indian sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is purpose-built for Indian marketplace sellers — covering Amazon India, Flipkart. Unlike global analytics tools, Insydz provides India-specific pricing intelligence, Flipkart SEO tracking, regional trend analysis, and AI-powered review mining — all in one platform built for sellers doing ₹5L to ₹50L+ per month." }
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

export default function SolutionsPage() {
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
      const id = `insydz-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-schema-${i}`);
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

  const handleGetStarted = () => { router.push("/signup"); };
  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ─── Data ────────────────────────────────────────────────────────────────────

  const solutions = [
    {
      id: 'amazon-sellers',
      icon: <ShoppingBag className="w-10 h-10" />,
      title: 'Amazon Sellers',
      subtitle: 'For Amazon Sellers (India)',
      whoItsFor: 'Private label & reseller sellers on Amazon India',
      pain: 'Competing with 40+ sellers on the same ASIN with ₹180 per unit margin one wrong price move wipes the week.',
      problems: [
        'Real-time competitor price alerts never lose the Buy Box blindly',
        'Keyword & rank visibility for your top ASINs',
        'AI-powered review mining across your category',
        'Pricing AI to protect margin without losing rank'
      ],
      outcome: 'Sell smarter, react faster, protect your margins.',
      link: '/solutions/amazon-sellers',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'flipkart-sellers',
      icon: <Store className="w-10 h-10" />,
      title: 'Flipkart Sellers',
      subtitle: 'For Flipkart Sellers',
      whoItsFor: 'Sellers primarily operating on Flipkart',
      pain: 'Your listing drops from 200 to 60 daily views nothing changed, or so you think.',
      problems: [
        'SEO and visibility gap analysis find out exactly why your listing dropped',
        'Price war alerts on high-converting listings',
        'Competitor monitoring new entrants, flash sales, stock-out patterns'
      ],
      microScenario: null,
      outcome: 'Better visibility and faster reactions on Flipkart.',
      link: '/solutions/flipkart-sellers',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'ecommerce-agencies',
      icon: <Briefcase className="w-10 h-10" />,
      title: 'E-commerce Agencies',
      subtitle: 'For E-commerce Agencies',
      whoItsFor: 'Agencies managing multiple seller accounts',
      pain: 'Managing 8 seller accounts with 8 separate Excel trackers 30% of every week on reporting instead of strategy.',
      problems: [
        'Centralised multi-client reporting one dashboard, all clients and no manual pulls',
        'Aggregated competitor data, keyword trends and review signals across accounts',
        'Data-backed reports clients can actually understand'
      ],
      microScenario: null,
      outcome: 'Save time, scale clients, show impact.',
      link: '/solutions/ecommerce-agencies',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'brand-managers',
      icon: <Target className="w-10 h-10" />,
      title: 'Brand Managers',
      subtitle: 'For Brand Managers & Category Teams',
      whoItsFor: 'Category managers, growth & brand teams',
      pain: 'Leadership wants data-backed decisions you\'re working off last quarter\'s research and a gut feel.',
      problems: [
        'Real-time market intelligence dashboards not stale reports',
        'Competitive positioning vs key rivals on price, rating and visibility',
        'Performance tracking over time for listings and strategies'
      ],
      microScenario: null,
      outcome: 'Better strategic decisions with data.',
      link: '/solutions/brand-managers',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const caseStudies = [
    {
      type: 'Amazon Reseller',
      problem: 'Lost Buy Box due to sudden competitor price drops with no visibility',
      outcome: 'Reacted faster with alerts protected margins',
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      type: 'E-commerce Agency',
      problem: 'Manual reporting across multiple client accounts consuming the team',
      outcome: 'Centralised insights saved hours every week',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const roiComparison = [
    { without: 'Checks competitor price manually, once a day', with: 'Real-time alerts responds within the hour' },
    { without: 'Loses Buy Box 5–6x per week', with: 'Stabilises Buy Box wins it back faster' },
    { without: 'Reviews product reviews manually once a month', with: 'AI surfaces recurring quality complaints weekly' },
    { without: 'Launches new SKUs on intuition', with: 'Validates demand before buying inventory' },
    { without: 'Spends 10 hrs/week on market research', with: 'Gets same intelligence in 20 minutes' },
  ];

  const quickGuide = [
    { condition: 'Selling on Amazon India', solution: 'Amazon Seller Solution', link: '/solutions/amazon-sellers' },
    { condition: 'Selling on Flipkart', solution: 'Flipkart Seller Solution', link: '/solutions/flipkart-sellers' },
    { condition: 'Managing multiple client accounts', solution: 'Agency Solution', link: '/solutions/ecommerce-agencies' },
    { condition: 'Category manager or brand team', solution: 'Brand Manager Solution', link: '/solutions/brand-managers' },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Can I switch between solutions later?',
      answer: 'Yes. Insydz is designed to adapt as your business grows. You can switch your solution type inside the product dashboard at any time no data loss, no restart required.'
    },
    {
      id: 'faq-2',
      question: 'Do the solutions work across multiple platforms Amazon, Flipkart?',
      answer: 'Yes. Insydz supports multi-platform intelligence from a single dashboard. The same data engine powers insights for Amazon India, Flipkart, with platform-specific signals surfaced based on your solution type.'
    },
    {
      id: 'faq-3',
      question: 'Is pricing different for each solution?',
      answer: 'No. All solutions are powered by the same Insydz platform. Pricing is based on your plan tier, not the solution type you choose. See the Pricing page for current plans.'
    },
    {
      id: 'faq-4',
      question: 'Can agencies access multiple solutions for different clients?',
      answer: 'Yes. The Agency solution includes multi-account access, allowing you to manage different client profiles each with their own solution type, marketplace focus, and reporting view from a single Insydz workspace.'
    },
    {
      id: 'faq-5',
      question: 'Is the free plan available for all solutions?',
      answer: 'Yes. You can start free on any solution type. No credit card required. The free plan gives you access to core intelligence features so you can evaluate Insydz before upgrading.'
    },
    {
      id: 'faq-6',
      question: 'Which solution is best for Amazon vs Flipkart sellers?',
      answer: 'Amazon sellers benefit most from Insydz\'s pricing AI, Buy Box tracking, and review mining features. Flipkart sellers get the most value from keyword visibility, SEO gap analysis, and competitor monitoring tools. Both are available on the same platform.'
    },
    {
      id: 'faq-7',
      question: 'Can I use more than one solution at the same time?',
      answer: 'Yes. If you sell on both Amazon and Flipkart, or run both a D2C brand and a marketplace store, Insydz can be configured to surface insights across all your active channels simultaneously.'
    },
    {
      id: 'faq-8',
      question: 'What is the best ecommerce analytics solution for Indian sellers?',
      answer: 'Insydz is purpose-built for Indian marketplace sellers covering Amazon India, Flipkart. Unlike global analytics tools, Insydz provides India-specific pricing intelligence, Flipkart SEO tracking, regional trend analysis, and AI-powered review mining all in one platform built for sellers doing ₹5L to ₹50L+ per month.'
    }
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      

      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="text-sm font-medium text-orange-700">India's AI Ecommerce Analytics Software </span>
              </div> 

              <h2 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                The Ecommerce Analytics Platform Built for 
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Indian Sellers
                </span>
                {/* <br /> */}
                
              </h2>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Whether you sell on Amazon, Flipkart Insydz gives you the exact intelligence you need to
                <span className="text-orange-700 font-semibold"> price smarter, rank higher, and grow faster.</span>
              </p>

              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                Most analytics tools were built for US markets, enterprise teams, or data scientists. Insydz was built for you the Indian seller doing ₹5L to ₹50L a month who needs clear signals, not complicated dashboards.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
                >
                  Start Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById('solutions-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg" variant="outline"
                  className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  Find My Solution →
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  {[
                    { title: 'Amazon Seller Solution', sub: 'Price tracking • Review insights • Buy Box AI', grad: 'from-orange-500 to-red-500', Icon: ShoppingBag },
                    { title: 'Flipkart Seller Solution', sub: 'SEO monitoring • Competitor tracking', grad: 'from-blue-500 to-cyan-500', Icon: Store },
                    // { title: 'D2C Brand Solution', sub: 'Market validation • Positioning', grad: 'from-purple-500 to-pink-500', Icon: TrendingUp },
                    { title: 'Ecommerce Agencies Solution', sub: 'Market validation • Positioning', grad: 'from-yellow-500 to-orange-500', Icon: TrendingUp },
                    { title: 'Brand Managers Solution', sub: 'Market validation • Positioning', grad: 'from-green-500 to-teal-500', Icon: TrendingUp },
                  ].map(({ title, sub, grad, Icon }) => (
                    <div key={title} className={`bg-gradient-to-br ${grad.replace('from-', 'from-').replace('to-', 'to-').replace('500', '50').replace('500', '50')} border rounded-2xl p-4`}
                      style={{ background: undefined }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${grad} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">4 Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PROBLEM SECTION ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Why Indian Sellers Struggle
              <br />
              <span className="text-orange-600">and Why Generic Tools Make It Worse</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              You're not just "an ecommerce seller." You're managing price wars at midnight, losing the Buy Box to a seller who undercut you by ₹11, watching your Flipkart listing drop three pages with no idea why.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4 font-semibold">The problem isn't effort. It's intelligence.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 mb-12 shadow-lg">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">Here's what most Amazon seller tools don't tell you:</p>
            <div className="space-y-4">
              {[
                'The metrics Amazon shows you are trailing indicators, you need leading ones.',
                `Your data lives in 6 tabs across 3 different tools, that's not intelligence that's chaos.`,
                'Global tools are optimized for US/EU sellers, Indian marketplace logic is completely different.',
                'Automation tools without intelligence just automate your mistakes faster.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <Lightbulb className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-lg font-bold text-orange-600 mt-6">These aren't rare problems. They're Tuesday.</p>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-400 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Insydz is the <span className="text-orange-600">ecommerce analytics solution</span> designed around exactly these problems 
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              and built the right way to solve them
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: SOLUTIONS BY SELLER TYPE ──────────────────────────────── */}
      <section id="solutions-grid" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Different Sellers. Different Problems.
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">One Marketplace Software Platform.</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              No two sellers are the same, that's why Insydz applies real AI-powered intelligence to your unique marketplace software needs, giving you targeted insights instead of generic dashboards.  
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {solutions.map((solution) => (
              <div key={solution.id}
                className="flex flex-col h-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                      {solution.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{solution.subtitle}</h3>
                      <p className="text-sm text-gray-500">{solution.whoItsFor}</p>
                    </div>
                  </div>
                </div>

                {/* Pain */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-red-500 uppercase mb-1">The Pain</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">{solution.pain}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-2">What Insydz Solves</p>
                    <ul className="space-y-2">
                      {solution.problems.map((problem, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {solution.microScenario && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                      <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Real Example</p>
                      {/* <p className="text-sm text-gray-700 dark:text-gray-300">{solution.microScenario}</p> */}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Outcome</p>
                    <p className="text-gray-900 dark:text-white font-bold leading-relaxed">{solution.outcome}</p>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                <Link href={solution.link}>
                  <Button className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold py-6 rounded-xl group">
                    View {solution.title} Solution
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: REAL SELLERS / CASE STUDIES ───────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Real Indian Sellers.
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Real Problems. Real Outcomes.</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Real sellers use Insydz differently based on how they sell. Here are common examples.
            </p>
          </div>

          <div className="grid md:grid-cols-2 justify-center gap-8 max-w-4xl mx-auto">
            {caseStudies.map((study, index) => ( 
              <div key={index}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:border-orange-400 hover:shadow-xl transition-all group"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${study.color} 
                  rounded-2xl flex items-center justify-center mb-6 mx-auto
                  text-white group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <div className="w-10 h-10 flex items-center justify-center scale-90">
                    {study.icon}
              </div>
            </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{study.type}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Problem</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{study.problem}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Outcome</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">{study.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: INDIA-FIRST ADVANTAGE ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              What Makes Insydz Different as <br /> Marketplace Software.
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Built for India, Not Adapted for It</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Most ecommerce analytics tools are built for the US or EU seller. Insydz is the only marketplace software that starts with Indian marketplace logic, regional languages, category-specific insights, and local fulfillment data, not as an afterthought, but as the foundation.  
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: <ShoppingBag className="w-8 h-8" />,
                title: 'Amazon India-native',
                desc: 'We track Indian ASINs, Indian seller behaviour, and India-specific pricing dynamics not US market proxies.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: <Store className="w-8 h-8" />,
                title: 'Flipkart SEO Intelligence',
                desc: "One of the few AI ecommerce analytics software platforms that deeply maps Flipkart's search ranking signals.",
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <IndianRupee className="w-8 h-8" />,
                title: '₹-denominated ROI',
                desc: 'Every insight is framed around your margin in rupees, not abstract percentages.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Tier 1 to Tier 3',
                desc: 'Whether you\'re based in Mumbai or Meerut, the tool works for your catalogue size, category, and growth stage.',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all group text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-400 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              Same intelligence engine. Role-specific insights.{' '}
              <span className="text-orange-600">One platform that adapts to how you sell not the other way around.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ROI COMPARISON ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              What Does a Real Ecommerce <br />Optimization Platform 
              <br />
              <span className="text-orange-600">Actually Mean for Your Business? </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Scenario: Amazon seller, ₹20L/month GMV, electronics accessories category
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="grid grid-cols-2">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-bold text-red-700 dark:text-red-400 text-left">Without Insydz</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-bold text-green-700 dark:text-green-400 text-left">With Insydz</p>
              </div>
              {roiComparison.map((row, i) => (
                <React.Fragment key={i}>
                  <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{row.without}</p>
                  </div>
                  <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{row.with}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-400 rounded-2xl p-6 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              If recovering the Buy Box just 3 extra times per week adds ₹15,000 to your monthly revenue
            </p>
            <p className="text-2xl font-black text-orange-600 mt-2">Insydz pays for itself in days, not months.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: SOLUTION FINDER ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Not Sure Which Amazon Seller 
              <br />
              <span className="text-orange-600">Tool or Plan Fits You?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Here's a quick guide to help you choose:</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 mb-8 shadow-xl">
            <div className="space-y-2">
              {quickGuide.map((guide, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-4 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    <ChevronRight className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{guide.condition}</span>
                  </div>
                  <Link href={guide.link}>
                    <span className="text-orange-600 font-bold hover:text-orange-700 cursor-pointer">{guide.solution} →</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group w-full sm:w-auto"
            >Start your free trail now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── FREE-FIRST CTA ────────────────────────────────────────────────────── */}
      {/* <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            Start Free.
            <br />
            <span className="text-orange-600">Pick Your Solution Later.</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            You don't need to decide upfront. Start free and Insydz will adapt to how you sell.
          </p>
          <Button onClick={handleGetStarted} size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
          >
            Start Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">No credit card required.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start free choose your solution inside the product.</p>
          </div>
        </div>
      </section> */}

      {/* ── SECTION 8: FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900 dark:text-white">
            Solutions <span className="text-orange-600">FAQs</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4 text-lg">{faq.question}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA (ICP-segmented) ─────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 via-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
            Whatever You Sell.
            <br />
            However You Sell.
            <br />
            <span className="text-orange-100">Insydz Fits.</span>
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Start free choose your solution inside the product.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10 items-stretch">
            {[
              {

                label: 'New Seller?',
                desc: 'Get your first competitive intelligence report in minutes.',
                cta: 'Start Free No Credit Card Required →',
                action: handleGetStarted
              },
              {

                label: 'Growing Seller (₹5L–₹50L/month)?',
                desc: 'You need pricing AI, rank tracking, and review signals all working together.',
                cta: 'Try the Growth Plan →',
                action: () => router.push('/pricing#growth')
              },
              {
           
                label: 'Running an Agency?',
                desc: 'See how Insydz centralises intelligence across all your clients.',
                cta: 'Book a Demo →',
                action: () => router.push('/demo')
              }
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/20 rounded-2xl p-6 text-left 
                flex flex-col h-full"
              >
                <p className="font-bold text-white mb-2">{card.label}</p>

            <p className="text-white/80 text-sm mb-4">
              {card.desc}
            </p>

            <div className="mt-auto">
              <button
            onClick={card.action}
            className="text-orange-200 font-semibold text-sm hover:text-white transition-colors underline whitespace-nowrap"
          >
            {card.cta}
          </button>
            </div>
          </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
            >
              Start a Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* <Button
              onClick={() => document.getElementById('solutions-grid')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-12 py-6 text-lg rounded-full border-2 border-orange-400"
            >
              Explore Solutions →
            </Button> */}
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
 

