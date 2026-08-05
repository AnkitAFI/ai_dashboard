"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Clock,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  MessageCircle,
  Package,
  Trophy,
  Zap,
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ShoppingBag,
  Store,
  Briefcase,
  Users,
  Bell,
  Code,
  Globe,
  ArrowLeft,
  Flame,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const schemaBlogPriceTools = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: {
        "@type": "ImageObject",
        url: "https://insydz.com/logo.png",
      },
      sameAs: [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz",
      ],
    },
    {
      "@type": "WebPage",
      "@id":
        "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
      url: "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
      name: "Best Competitor Price Tracking Tools for Indian Sellers",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      about: {
        "@id": "https://insydz.com/#organization",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: "https://insydz.com/resources",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Expert Blog",
          item: "https://insydz.com/resources/expert-blog",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Best Competitor Price Tracking Tools India",
          item: "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#article",
      headline: "Best Competitor Price Tracking Tools for Indian Sellers",
      description:
        "Discover the best competitor price tracking tools for Amazon India and Flipkart sellers. Compare features and choose the right pricing intelligence tool.",
      image:
        "https://insydz.com/assets/images/blog/competitor-price-tools-india.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2026-03-19",
      dateModified: "2026-03-19",
      mainEntityOfPage: {
        "@id":
          "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
      },
      keywords: [
        "best competitor price tracking tools india",
        "amazon price tracking tools india",
        "competitor price monitoring tools",
        "amazon repricer tools india",
        "price tracking tools ecommerce",
      ],
      articleSection: "Ecommerce Tools",
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id":
        "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#list",
      name: "Best Competitor Price Tracking Tools in India",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Insydz" },
        { "@type": "ListItem", position: 2, name: "Helium 10" },
        { "@type": "ListItem", position: 3, name: "Jungle Scout" },
        { "@type": "ListItem", position: 4, name: "Viral Launch" },
        { "@type": "ListItem", position: 5, name: "Keepa" },
      ],
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What are competitor price tracking tools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "They monitor pricing changes across marketplaces like Amazon and Flipkart, helping sellers adjust strategies in real time.",
          },
        },
        {
          "@type": "Question",
          name: "Why are they important for Indian sellers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "They help sellers stay competitive, win the Buy Box, and react quickly to price changes.",
          },
        },
        {
          "@type": "Question",
          name: "What features should a good tool have?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Real-time tracking, alerts, competitor insights, historical data, and multi-platform support.",
          },
        },
        {
          "@type": "Question",
          name: "Are free tools available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, basic tracking is often free while advanced features require paid plans.",
          },
        },
      ],
    },
  ],
};

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
    {
      name: "All Solutions (Overview)",
      icon: <ShoppingBag className="w-4 h-4" />,
      route: "/solutions",
    },
    {
      name: "For Amazon Sellers (India)",
      icon: <ShoppingBag className="w-4 h-4" />,
      route: "/solutions/amazon-sellers",
    },
    {
      name: "For Flipkart Sellers",
      icon: <Store className="w-4 h-4" />,
      route: "/solutions/flipkart-sellers",
    },
    {
      name: "For E-commerce Agencies",
      icon: <Briefcase className="w-4 h-4" />,
      route: "/solutions/ecommerce-agencies",
    },
    {
      name: "For Brand Managers",
      icon: <Users className="w-4 h-4" />,
      route: "/solutions/brand-managers",
    },
  ],
  "Use Cases": [
    {
      name: "All Use Cases",
      icon: <TrendingUp className="w-4 h-4" />,
      route: "/use-cases",
    },
    {
      name: "Track Competitor Prices",
      icon: <TrendingUp className="w-4 h-4" />,
      route: "/use-cases/track-competitor-prices",
    },
    {
      name: "Find Profitable Products",
      icon: <Target className="w-4 h-4" />,
      route: "/use-cases/find-profitable-products",
    },
    {
      name: "Analyze Customer Reviews",
      icon: <MessageCircle className="w-4 h-4" />,
      route: "/use-cases/analyze-customer-reviews",
    },
    {
      name: "Improve Amazon & Flipkart SEO",
      icon: <Search className="w-4 h-4" />,
      route: "/use-cases/improve-seo",
    },
    {
      name: "Avoid Stockouts & Missed Sales",
      icon: <Package className="w-4 h-4" />,
      route: "/use-cases/avoid-stockouts",
    },
  ],
  Features: [
    {
      name: "Competitor Price Tracking",
      icon: <DollarSign className="w-4 h-4" />,
      route: "/features/competitor-price-tracking-feature",
    },
    {
      name: "Review Analytics",
      icon: <MessageCircle className="w-4 h-4" />,
      route: "/features/review-analytics-feature",
    },
    {
      name: "Price Optimization",
      icon: <TrendingUp className="w-4 h-4" />,
      route: "/features/price-optimization-feature",
    },
    {
      name: "Keyword & Rank Tracking",
      icon: <Search className="w-4 h-4" />,
      route: "/features/keyword-rank-tracking-feature",
    },
    {
      name: "Product Research",
      icon: <Package className="w-4 h-4" />,
      route: "/features/product-research-feature",
    },
    {
      name: "AI Recommendations",
      icon: <Zap className="w-4 h-4" />,
      route: "/features/ai-recommendations-feature",
    },
    {
      name: "WhatsApp Alerts",
      icon: <Bell className="w-4 h-4" />,
      badge: "NEW",
      route: "/features/whatsapp-alerts-feature",
    },
    {
      name: "Festive Trend Intelligence",
      icon: <Flame className="w-4 h-4" />,
      badge: "UPCOMING",
      route: "/features/festive-trend-feature",
    },
  ],
  "Free Tools": [
    {
      name: "Free Amazon Product Analyzer",
      icon: <BarChart3 className="w-4 h-4" />,
      route: "/free-tools/free-amazon-product-analyzer",
    },
    {
      name: "Free Review Sentiment Checker",
      icon: <MessageCircle className="w-4 h-4" />,
      route: "/free-tools/free-review-sentiment-checker",
    },
    {
      name: "Free Competitor Price Checker",
      icon: <DollarSign className="w-4 h-4" />,
      route: "/free-tools/free-competitor-price-checker",
    },
    {
      name: "Free Keyword Rank Checker",
      icon: <Search className="w-4 h-4" />,
      badge: "NEW",
      route: "/free-tools/free-keyword-rank-checker",
    },
  ],
  Resources: [
    {
      name: "Expert Blog",
      icon: <BookOpen className="w-4 h-4" />,
      route: "/resources/expert-blog",
    },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    {
      name: "Insydz vs Helium 10",
      icon: <Trophy className="w-4 h-4" />,
      route: "/compare/insydzvshelium",
    },
    {
      name: "Insydz vs Jungle Scout",
      icon: <Trophy className="w-4 h-4" />,
      route: "/compare/insydzvsjunglescout",
    },
    {
      name: "Insydz vs Viral Launch",
      icon: <Trophy className="w-4 h-4" />,
      route: "/compare/insydzvsvirallaunch",
    },
  ],
  About: [
    {
      name: "About Us",
      icon: <Presentation className="w-4 h-4" />,
      route: "/about/about-us",
    },
    {
      name: "Our Vision",
      icon: <Globe className="w-4 h-4" />,
      route: "/about/our-vision",
    },
    {
      name: "Careers",
      icon: <Users className="w-4 h-4" />,
      route: "/about/careers",
    },
  ],
};

const TOC = [
  { id: "intro", label: "What Actually Matters" },
  { id: "why-matters", label: "Why the Right Tool Matters" },
  { id: "how-it-works", label: "How Tracking Tools Work" },
  { id: "types", label: "Types of Tracking Tools" },
  { id: "mistakes", label: "5 Common Mistakes" },
  { id: "workflow", label: "Best Practices & Workflow" },
  { id: "best-tools", label: "Best Tools for India 2026" },
  { id: "faq", label: "Frequently Asked Questions" },
];

const FAQS = [
  {
    q: (
      <>
        What is the best competitor price tracking tool for Amazon.in sellers in
        India?
      </>
    ),
    a: `For Indian sellers on Amazon.in, the best tool covers Amazon.in price monitoring specifically (not Amazon.com), sends WhatsApp alerts, and provides AI-powered recommendations rather than raw data alone. Insydz is built specifically for this it covers Amazon.in, Flipkart simultaneously at ₹1,999–2,999/month, making it the most complete India-first option currently available.`,
  },
  {
    q: "Can I track competitor prices on Flipkart — not just Amazon?",
    a: "Most global tools only cover Amazon. For multi-platform Indian sellers, this is a significant gap — especially since Flipkart is the primary platform for 60% of tier-2 and tier-3 city sellers. India-first platforms like Insydz cover all three major Indian marketplaces in one system, so you're not managing separate tools for each platform.",
  },
  {
    q: "How often should competitor prices be tracked?",
    a: "For high-competition categories (electronics, mobile accessories, FMCG, home appliances), price checks every 30–60 minutes are ideal. For slower-moving categories (furniture, specialty products, B2B items), hourly to every 4-hour checks are sufficient. The key is ensuring your alert threshold is set appropriately a 5%+ drop should reach you within an hour.",
  },
  {
    q: "Will automated price tracking lead to price wars that destroy my margins?",
    a: "Only if you respond to every alert with a matching price cut which is the wrong approach. Smart use of price tracking means understanding why a competitor changed their price and calculating the minimum response needed to protect your Buy Box position and margin. AI-powered tools do this calculation for you. The goal is informed response, not reflexive reaction.",
  },
  {
    q: "Is there a free competitor price tracking tool for Indian sellers?",
    a: "Basic free options exist Keepa offers limited free Amazon price history, and some Chrome extensions provide basic alerts. However, these don't cover Flipkart, don't provide AI recommendations, and typically have significant delays. Insydz offers a forever-free plan that gives Indian sellers entry-level price tracking across Amazon.in and Flipkart enough to experience the value before upgrading.",
  },
  {
    q: "How do I set up competitor price tracking without technical knowledge?",
    a: "Modern India-first platforms are designed for sellers who aren't technical. The setup process typically takes under 30 minutes: connect your Amazon or Flipkart seller account, add your competitor product URLs or ASINs, set your alert preferences and thresholds, and enter your WhatsApp number for notifications. No coding, no integrations, no IT support required.",
  },
];

const SCHEMAS = [schemaBlogPriceTools];

export default function BestCompetitorPriceTrackingToolsIndia() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("intro");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-blog4-schema-${i}`;

      if (document.getElementById(id)) return;

      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);

      document.head.appendChild(script);
    });

    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-blog4-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };
  const toggleMobileMenu = (name: string) =>
    setMobileActiveMenu((p) => (p === name ? null : name));

  const DesktopDropdown = ({
    label,
    menuKey,
    accent = "purple",
  }: {
    label: string;
    menuKey: keyof NavigationMenu;
    accent?: "purple" | "orange";
  }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
        >
          {label}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`}
          />
        </button>
        {isActive && (
          <div
            onMouseLeave={() => setActiveDropdown(null)}
            className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
              >
                <span
                  className={`flex-shrink-0 ${ac ? "text-orange-600" : "text-purple-600 dark:text-purple-400"}`}
                >
                  {item.icon}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        /* ── CSS tokens ───────────────────────────────────────── */
        :root { --nav-h: 72px; }
        @media(min-width:1024px) { :root { --nav-h: 80px; } }

        /* ── Reading progress ─────────────────────────────────── */
        .read-progress {
          position: fixed; top: 0; left: 0; height: 3px;
          background: linear-gradient(90deg,#db2777,#7c3aed);
          z-index: 9999; transition: width .1s linear;
          border-radius: 0 2px 2px 0;
        }

        /* ── Article layout ──────────────────────────────────── */
        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        .dark .toc-sidebar { background: #111827; border-color: #1f2937; }
        @media(max-width:1023px) { .toc-sidebar { display: none !important; } }
        .toc-sidebar::-webkit-scrollbar { width: 4px; }
        .toc-sidebar::-webkit-scrollbar-track { background: transparent; }
        .toc-sidebar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .dark .toc-sidebar::-webkit-scrollbar-thumb { background: #374151; }

        /* ── Mobile TOC ──────────────────────────────────────── */
        .mobile-toc-btn {
          display: none; width: 100%;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 13px 16px;
          font-family: 'Sora',sans-serif; font-size: 14px;
          font-weight: 600; color: #111; cursor: pointer;
          align-items: center; justify-content: space-between;
          margin-bottom: 16px; touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .dark .mobile-toc-btn { background: #111827; border-color: #1f2937; color: #f9fafb; }
        @media(max-width:1023px) { .mobile-toc-btn { display: flex; } }
        .mobile-toc-panel {
          display: none; background: #fff;
          border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 12px; margin-bottom: 24px;
        }
        .dark .mobile-toc-panel { background: #111827; border-color: #1f2937; }
        .mobile-toc-panel.open { display: block; }

        /* ── Article body ────────────────────────────────────── */
        .article-body {
          font-family: 'Lora',serif;
          font-size: clamp(15px,1.8vw,16px);
          line-height: 1.78; color: #1E293B;
        }
        .dark .article-body { color: #d1d5db; }
        .article-body h2 {
          font-family: 'Sora',sans-serif;
          font-size: clamp(18px,2.4vw,22px);
          font-weight: 800; color: #0D1B2A;
          margin: 48px 0 14px; padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
          letter-spacing: -.3px; line-height: 1.3;
          scroll-margin-top: calc(var(--nav-h) + 16px);
        }
        .dark .article-body h2 { color: #f9fafb; border-color: #1f2937; }
        .article-body h2:first-child { margin-top: 0; }
        .article-body h3 {
          font-family: 'Sora',sans-serif;
          font-size: clamp(15px,1.8vw,17px);
          font-weight: 700; color: #0D1B2A;
          margin: 28px 0 10px; letter-spacing: -.2px;
          scroll-margin-top: calc(var(--nav-h) + 16px);
        }
        .dark .article-body h3 { color: #f3f4f6; }
        .article-body p { margin-bottom: 16px; font-size: clamp(14.5px,1.7vw,15.5px); line-height: 1.78; }
        .article-body ul,ol { margin: 4px 0 18px 20px; }
        .article-body li { font-size: clamp(14px,1.6vw,15px); line-height: 1.72; margin-bottom: 8px; }
        .article-body li::marker { color: #F97316; }
        .article-body strong { font-weight: 700; color: #0D1B2A; }
        .dark .article-body strong { color: #f9fafb; }

        /* ── Image caption ───────────────────────────────────── */
        .art-img-cap {
          font-size: 12px; color: #94A3B8; font-style: italic;
          text-align: center; margin-bottom: 28px; padding: 8px 12px;
        }

        /* ── Callout boxes ───────────────────────────────────── */
        .box { border-radius: 10px; padding: clamp(16px,2.5vw,20px) clamp(16px,2.5vw,22px); margin: 20px 0; }
        .box-label {
          font-size: 11px; font-weight: 700; letter-spacing: .7px;
          text-transform: uppercase; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .box p { margin: 0; font-size: clamp(13.5px,1.5vw,14.5px); line-height: 1.72; }
        .box-teal  { background: #F0FDFA; border-left: 4px solid #0D9488; }
        .box-teal .box-label  { color: #0D9488; }
        .box-amber { background: #FFFBEB; border-left: 4px solid #D97706; }
        .box-amber .box-label { color: #D97706; }
        .box-green { background: #F0FDF4; border-left: 4px solid #16A34A; }
        .box-green .box-label { color: #16A34A; }
        .box-pink  { background: #FDF2F8; border-left: 4px solid #DB2777; }
        .box-pink .box-label  { color: #DB2777; }
        .box-indigo { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; }
        .box-indigo .box-label { color: #4F46E5; }
        .dark .box-teal   { background: #042f2e; border-color: #134e4a; }
        .dark .box-amber  { background: #1c1507; border-color: #78350f; }
        .dark .box-green  { background: #052e16; border-color: #166534; }
        .dark .box-pink   { background: #500724; border-color: #9d174d; }
        .dark .box-indigo { background: #1e1b4b; border-color: #3730a3; }

        /* ── Steps ───────────────────────────────────────────── */
        .steps { display: flex; flex-direction: column; gap: 10px; margin: 16px 0 24px; }
        .step {
          display: flex; gap: 14px; background: #F8FAFC;
          border: 1px solid #E2E8F0; border-radius: 10px;
          padding: clamp(14px,2vw,18px) clamp(14px,2vw,20px);
          transition: box-shadow .2s;
        }
        .step:hover { box-shadow: 0 4px 16px rgba(0,0,0,.09); }
        .dark .step { background: #111827; border-color: #1f2937; }
        .step-n {
          flex-shrink: 0; width: 32px; height: 32px;
          background: #F97316; color: white; border-radius: 50%;
          font-weight: 800; font-size: 14px; display: flex;
          align-items: center; justify-content: center;
          font-family: 'Sora',sans-serif;
        }
        .step-body strong {
          display: block; font-size: clamp(13px,1.5vw,14.5px);
          color: #0D1B2A; margin-bottom: 3px; font-family: 'Sora',sans-serif;
        }
        .dark .step-body strong { color: #f9fafb; }
        .step-body p {
          margin: 0; font-size: clamp(12.5px,1.4vw,13.5px);
          color: #64748B; line-height: 1.6; font-family: 'Sora',sans-serif;
        }

        /* ── Data tables ─────────────────────────────────────── */
        .tbl-wrap {
          overflow-x: auto; border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,.09);
          margin: 20px 0 28px;
          -webkit-overflow-scrolling: touch;
        }
        table.dt {
          width: 100%; border-collapse: collapse;
          font-size: clamp(11px,1.3vw,13.5px);
          font-family: 'Sora',sans-serif; min-width: 460px;
        }
        table.dt thead tr { background: #0D1B2A; }
        table.dt th {
          padding: clamp(10px,1.5vw,13px) clamp(12px,1.5vw,16px);
          color: white; font-weight: 700; text-align: left;
          font-size: clamp(10px,1.2vw,12.5px); letter-spacing: .2px;
          white-space: nowrap;
        }
        table.dt tbody tr { border-bottom: 1px solid #E2E8F0; transition: background .15s; }
        table.dt tbody tr:nth-child(even) td { background: #F8FAFC; }
        table.dt tbody tr:hover td { background: #FFF7ED; }
        table.dt td {
          padding: clamp(10px,1.5vw,13px) clamp(12px,1.5vw,16px);
          vertical-align: middle; color: #1E293B;
        }
        .dark table.dt td { color: #d1d5db; }
        .dark table.dt tbody tr:nth-child(even) td { background: #0f172a; }
        table.dt tr.hl td { background: #FFF7ED !important; border-left: 3px solid #F97316; }
        table.dt tr.hl td:first-child { font-weight: 700; color: #F97316; }
        .bg { background:#DCFCE7;color:#15803D;font-weight:700;padding:3px 8px;border-radius:20px;font-size:11px;white-space:nowrap; }
        .br { background:#FEE2E2;color:#B91C1C;font-weight:700;padding:3px 8px;border-radius:20px;font-size:11px;white-space:nowrap; }
        .ba { background:#FEF3C7;color:#92400E;font-weight:700;padding:3px 8px;border-radius:20px;font-size:11px;white-space:nowrap; }
        .bb { background:#DBEAFE;color:#1E40AF;font-weight:700;padding:3px 8px;border-radius:20px;font-size:11px;white-space:nowrap; }

        /* ── Mistakes ────────────────────────────────────────── */
        .mistake-list { display: flex; flex-direction: column; gap: 10px; margin: 16px 0 24px; }
        .mistake { border: 1px solid #E2E8F0; border-radius: 10px; display: flex; overflow: hidden; }
        .dark .mistake { border-color: #1f2937; }
        .mistake-num {
          flex-shrink: 0; width: 44px; background: #0D1B2A;
          color: white; font-weight: 800; font-size: clamp(15px,2vw,17px);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora',sans-serif;
        }
        .mistake-body { padding: clamp(12px,2vw,16px) clamp(14px,2vw,18px); }
        .mistake-body strong {
          display: block; font-size: clamp(13px,1.5vw,14.5px);
          color: #0D1B2A; margin-bottom: 5px; font-family: 'Sora',sans-serif;
        }
        .dark .mistake-body strong { color: #f9fafb; }
        .mistake-body p {
          margin: 0; font-size: clamp(12px,1.3vw,13.5px);
          color: #64748B; line-height: 1.65; font-family: 'Sora',sans-serif;
        }
        .dark .mistake-body p { color: #9ca3af; }

        /* ── Metrics grid ────────────────────────────────────── */
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0 24px; }
        @media(max-width:580px) { .metrics { grid-template-columns: 1fr; } }
        .metric {
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 10px; padding: clamp(14px,2vw,18px);
          display: flex; gap: 12px; align-items: flex-start;
        }
        .dark .metric { background: #111827; border-color: #1f2937; }
        .metric-icon {
          flex-shrink: 0; width: 36px; height: 36px;
          border-radius: 9px; background: #FFEDD5;
          display: flex; align-items: center; justify-content: center;
        }
        .metric-t { font-size: clamp(12.5px,1.4vw,13.5px); font-weight: 700; color: #0D1B2A; margin-bottom: 3px; font-family: 'Sora',sans-serif; }
        .dark .metric-t { color: #f9fafb; }
        .metric-d { font-size: clamp(11.5px,1.2vw,12.5px); color: #64748B; line-height: 1.5; font-family: 'Sora',sans-serif; }
        .dark .metric-d { color: #9ca3af; }

        /* ── Mid-CTA ─────────────────────────────────────────── */
        .mid-cta {
          background: linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%);
          border-radius: 10px; padding: clamp(20px,3vw,28px) clamp(20px,3vw,32px);
          margin: 36px 0; display: flex;
          align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .mid-cta h3 {
          font-size: clamp(15px,1.8vw,18px); font-weight: 800;
          color: white; margin-bottom: 5px; letter-spacing: -.2px;
          font-family: 'Sora',sans-serif;
        }
        .mid-cta p { color: #94A3B8; font-size: clamp(12px,1.3vw,13.5px); margin: 0; font-family: 'Sora',sans-serif; }
        .mid-cta-btn {
          flex-shrink: 0; background: #F97316; color: white;
          padding: 12px 22px; border-radius: 8px;
          font-weight: 700; font-size: clamp(13px,1.5vw,14.5px);
          white-space: nowrap; cursor: pointer; border: none;
          font-family: 'Sora',sans-serif; touch-action: manipulation;
          min-height: 44px;
        }
        @media(max-width:480px) {
          .mid-cta { flex-direction: column; align-items: stretch; }
          .mid-cta-btn { width: 100%; text-align: center; }
        }

        /* ── FAQ ─────────────────────────────────────────────── */
        .faq-item {
          border: 1px solid #E2E8F0; border-radius: 10px;
          margin-bottom: 10px; overflow: hidden;
          background: #fff; transition: border-color .2s;
        }
        .dark .faq-item { background: #111827; border-color: #1f2937; }
        .faq-item.open { border-color: #F97316; }
        .faq-q {
          padding: clamp(13px,2vw,16px) clamp(14px,2vw,20px);
          font-size: clamp(13px,1.5vw,14.5px); font-weight: 700;
          color: #0D1B2A; cursor: pointer;
          display: flex; justify-content: space-between;
          align-items: center; gap: 12px;
          font-family: 'Sora',sans-serif;
          transition: background .15s; min-height: 44px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .dark .faq-q { color: #f9fafb; }
        .faq-q:hover { background: #F8FAFC; }
        .dark .faq-q:hover { background: #1f2937; }
        .faq-icon {
          flex-shrink: 0; width: 22px; height: 22px;
          border-radius: 50%; background: #FFEDD5; color: #F97316;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: transform .2s;
        }
        .faq-icon.open { transform: rotate(45deg); background: #F97316; color: white; }
        .faq-a {
          padding: 0 clamp(14px,2vw,20px) clamp(12px,2vw,16px);
          font-size: clamp(13.5px,1.5vw,14px); color: #64748B;
          line-height: 1.75; font-family: 'Lora',serif;
        }
        .dark .faq-a { color: #9ca3af; }

        /* ── Related grid ────────────────────────────────────── */
        .related-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media(max-width:768px) { .related-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px) { .related-grid { grid-template-columns: 1fr; } }
        .rel-card {
          border: 1px solid #E2E8F0; border-radius: 10px;
          overflow: hidden; cursor: pointer; transition: box-shadow .2s,transform .2s;
          background: #fff; touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .dark .rel-card { background: #111827; border-color: #1f2937; }
        .rel-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.09); transform: translateY(-2px); }
        @media(hover:none) { .rel-card:hover { transform: none; } }
        .rel-thumb { width: 100%; aspect-ratio: 2.4 / 1; overflow: hidden; background: #0A0F1A; display: flex; align-items: center; justify-content: center; }
        .rel-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .rel-body { padding: 12px 14px; }
        .rel-tag { font-size: 10.5px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 5px; font-family: 'Sora',sans-serif; }
        .rel-title { font-size: clamp(12px,1.3vw,13px); font-weight: 700; color: #0D1B2A; line-height: 1.4; font-family: 'Sora',sans-serif; }
        .dark .rel-title { color: #f9fafb; }

        /* ── TOC link ────────────────────────────────────────── */
        .toc-link {
          display: block; font-size: clamp(12px,1.2vw,12.5px);
          font-weight: 500; color: #64748B; padding: 6px 10px;
          border-radius: 6px; cursor: pointer; border: none;
          background: none; text-align: left; width: 100%;
          transition: all .15s; margin-bottom: 2px; line-height: 1.4;
          border-left: 2px solid transparent;
          touch-action: manipulation; -webkit-tap-highlight-color: transparent;
        }
        .toc-link:hover, .toc-link.active {
          color: #F97316; background: #FFF7ED; border-left-color: #F97316;
        }
        .dark .toc-link { color: #9ca3af; }
        .dark .toc-link:hover, .dark .toc-link.active { background: #431407; color: #fb923c; }

        /* ── Stat strip ──────────────────────────────────────── */
        .stat-strip {
          display: flex; flex-wrap: wrap;
          border: 1px solid #E2E8F0; border-radius: 10px;
          overflow: hidden; background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,.07);
        }
        .dark .stat-strip { border-color: #1f2937; background: #111827; }
        .stat-item {
          flex: 1; min-width: 130px;
          padding: clamp(12px,2vw,18px) clamp(14px,2.5vw,24px);
          border-right: 1px solid #E2E8F0; text-align: center;
        }
        .dark .stat-item { border-color: #1f2937; }
        .stat-item:last-child { border-right: none; }
        @media(max-width:580px) {
          .stat-item { min-width: 50%; }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item:nth-child(1),.stat-item:nth-child(2) { border-bottom: 1px solid #E2E8F0; }
          .dark .stat-item:nth-child(1),.dark .stat-item:nth-child(2) { border-bottom-color: #1f2937; }
        }

        /* ── Takeaway box ────────────────────────────────────── */
        .takeaway-box {
          background: #0D1B2A; border-radius: 10px;
          padding: clamp(20px,3vw,28px) clamp(18px,3vw,30px); margin: 24px 0;
        }
        .takeaway-box h3 {
          font-family: 'Sora',sans-serif;
          font-size: clamp(15px,1.8vw,18px);
          font-weight: 800; color: white; margin: 0 0 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .takeaway-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .takeaway-dot {
          flex-shrink: 0; width: 18px; height: 18px;
          border-radius: 50%; background: #F97316;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: white; margin-top: 3px;
        }
        .takeaway-text {
          font-family: 'Lora',serif;
          font-size: clamp(13.5px,1.5vw,14.5px);
          color: #CBD5E1; line-height: 1.6;
        }

        /* ── Blog image wrapper ──────────────────────────────── */
        .blog-img-wrap {
          width: 100%; border-radius: 12px; overflow: hidden;
          margin: 24px 0; box-shadow: 0 24px 64px rgba(0,0,0,.18);
        }
        .blog-img-wrap img {
          width: 100%; display: block;
        }

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

        /* ── Breadcrumb ──────────────────────────────────────── */
        .breadcrumb-bar {
          background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
          padding: 10px 0;
          margin-top: var(--nav-h);
        }
        .breadcrumb-inner {
          max-width: 1240px; margin: 0 auto;
          padding: 0 clamp(12px,3vw,24px);
          display: flex; align-items: center; gap: 6px;
          font-size: clamp(11px,1.2vw,12.5px); color: #94A3B8;
          flex-wrap: wrap;
        }
        .breadcrumb-btn {
          color: #64748B; font-weight: 500;
          background: none; border: none; cursor: pointer;
          font-family: 'Sora',sans-serif;
          padding: 2px 0; touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Hero section ────────────────────────────────────── */
        .hero-section {
          max-width: 1240px; margin: 0 auto;
          padding: clamp(28px,4vw,48px) clamp(12px,3vw,24px) clamp(24px,3vw,36px);
        }

        /* ── Footer grid ─────────────────────────────────────── */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 36px; margin-bottom: 40px;
        }
        @media(max-width:900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px) { .footer-grid { grid-template-columns: 1fr; } }
        .footer-bottom {
          border-top: 1px solid #162032; padding-top: 20px;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 10px;
          font-size: 12px; color: #334155;
          font-family: 'Sora',sans-serif;
        }

        /* ── Sidebar CTA card ────────────────────────────────── */
        .sidebar-cta {
          background: linear-gradient(160deg,#0D1B2A 0%,#162B45 100%);
          border-radius: 10px; padding: clamp(18px,2vw,24px); margin-top: 18px;
        }
        .sidebar-share {
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 10px; padding: 16px; margin-top: 18px;
        }
        .dark .sidebar-share { background: #111827; border-color: #1f2937; }

        /* ── Nav buttons tap areas ───────────────────────────── */
        nav button { -webkit-tap-highlight-color: transparent; }

        /* ── Footer buttons min tap target ───────────────────── */
        footer button, footer a { min-height: 36px; display: inline-flex; align-items: center; }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ════════════════════════════════ BREADCRUMB */}
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="breadcrumb-btn" onClick={() => router.push("/")}>
            Home
          </button>
          <span style={{ color: "#E2E8F0" }}>›</span>
          <button
            className="breadcrumb-btn"
            onClick={() => router.push("/resources/expert-blog")}
          >
            Blog
          </button>
          <span style={{ color: "#E2E8F0" }}>›</span>
          <span>Best Price Tracking Tools India</span>
        </div>
      </div>

      {/* ════════════════════════════════ HERO */}
      <div className="hero-section">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "#FFEDD5",
            color: "#F97316",
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#F97316",
            }}
          />
          Tool Comparison &amp; Reviews
        </div>

        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(22px,3.8vw,40px)",
            fontWeight: 800,
            lineHeight: 1.18,
            color: "#0D1B2A",
            letterSpacing: "-.5px",
            maxWidth: 820,
          }}
          className="dark:text-white"
        >
          Best{" "}
          <span style={{ color: "#F97316" }}>
            Competitor Price Tracking Tools
          </span>{" "}
          for Indian Sellers: The 2026 Guide
        </h1>
        <p
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "clamp(14px,2.5vw,17px)",
            color: "#475569",
            lineHeight: 1.75,
            maxWidth: 800,
            paddingTop: 10,
            marginBottom: 20,
          }}
          className="dark:text-gray-400"
        >
          Your competitors are repricing in real time while you're still
          checking prices manually — and losing the Buy Box because of it. See
          how India's smartest marketplace sellers use automated price
          intelligence across Amazon, Flipkart, and Meesho to protect margin and
          win more sales.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "5px 16px",
            marginBottom: 24,
          }}
        >
          {[
            <>
              <Users className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              <strong
                className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer"
                onClick={() => router.push("/author/vikrant-singh")}
              >
                Vikrant Singh
              </strong>
            </>,
            <>
              <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              January 2026
            </>,
            <>
              <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              <strong>12 min read</strong>
            </>,
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: clamp13,
                color: "#64748B",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="stat-strip" style={{ marginBottom: 28 }}>
          {[
            ["1.7M+", "Active Sellers Competing on Indian Marketplaces"],
            ["30–40%", "More Demand Captured With Real-Time Tracking"],
            ["60–85%", "Cost Savings vs Global Tools Like Helium 10"],
            ["<60 min", "WhatsApp Alert Response Time with Insydz AI"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(20px,3.5vw,26px)",
                  fontWeight: 800,
                  color: "#F97316",
                  fontFamily: "'Sora',sans-serif",
                  lineHeight: 1,
                }}
              >
                {num}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(10px,1.2vw,11.5px)",
                  color: "#64748B",
                  marginTop: 5,
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {lbl}
              </span>
            </div>
          ))}
        </div>

        {/* ── Hero Graphic — .png image */}
        <figure className="blog-img-wrap" style={{ marginBottom: 0 }}>
          <img
            src="/Best-Competitor-Price-Tracking-Tools.png"
            alt="Best Competitor Price Tracking Tools for Indian Sellers 2026 — Insydz hero graphic"
            style={{ width: "100%", display: "block", borderRadius: 12 }}
          />
        </figure>
      </div>
      {/* end hero-section */}

      {/* ════════════════════════════════ TAKEAWAYS */}
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 clamp(12px,3vw,24px) 36px",
        }}
      >
        <div className="takeaway-box">
          <h3>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Key Takeaways
          </h3>
          {[
            "Real-time competitor price tracking not daily or manual is the standard for competitive Indian sellers in 2026. A 12-hour information lag is a revenue gap.",
            "India-specific tools matter because Indian sellers operate across Amazon.in, Flipkart simultaneously. A tool covering only Amazon solves 60% of the problem at best.",
            "Price tracking without stock monitoring is incomplete intelligence. The most profitable decisions come from knowing when a competitor is about to go OOS, not just their current price.",
            "WhatsApp alerts convert to action significantly faster than email alerts for Indian SMB sellers alert delivery channel is a critical, underrated feature.",
            "AI-powered recommendations outperform raw alerts. The goal isn't to know what happened it's to know what to do next and why.",
            "Global tools like Helium 10 and Jungle Scout are excellent for Amazon.com but overpriced for Indian sellers and don't cover Flipkart.",
            "Price wars are avoidable. Smart tools calculate minimum necessary adjustments not maximum reactive discounts protecting margins while recovering Buy Box.",
          ].map((t) => (
            <div className="takeaway-item" key={t}>
              <div className="takeaway-dot">✓</div>
              <div className="takeaway-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════ ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* SIDEBAR */}
        <aside className="toc-sidebar" aria-label="Table of contents">
          <h4
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#94A3B8",
              marginBottom: 14,
            }}
          >
            Table of Contents
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {TOC.map((t) => (
              <li key={t.id}>
                <button
                  className={`toc-link${activeSection === t.id ? " active" : ""}`}
                  onClick={() => go(t.id)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN */}
        <main>
          <button
            className="mobile-toc-btn"
            onClick={() => setTocOpen(!tocOpen)}
            aria-expanded={tocOpen}
          >
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div
            className={`mobile-toc-panel${tocOpen ? " open" : ""}`}
            role="navigation"
          >
            {TOC.map((t) => (
              <button
                key={t.id}
                className="toc-link"
                style={{ display: "block", marginBottom: 4 }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            {/* S1 */}
            <h2 id="intro">
              The Best Competitor Price Tracking Tool for India What Actually
              Matters
            </h2>
            <p>
              The best{" "}
              <a
                href="https://insydz.com/use-cases/track-competitor-prices"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                competitor price tracking tools india
              </a>{" "}
              are those that monitor rival prices across Amazon.in, Flipkart in
              real time and tell you exactly what to do, not just what happened.
              With over <strong>1.7 million active sellers competing</strong> on
              Indian marketplaces, pricing intelligence has moved from a "nice
              to have" to a survival tool.
            </p>
            <p>
              Indian e-commerce is growing at 25% annually, which means new
              competitors enter your category every week and most of them are
              watching your prices even if you aren't watching theirs. This
              makes{" "}
              <a
                href="https://en.wikipedia.org/wiki/Price_comparison"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                price comparison and dynamic pricing
              </a>{" "}
              critical for survival. This guide cuts through the noise. We
              review what actually matters in a price tracking tool for the
              Indian market, what global tools miss, and which platforms are
              genuinely worth your ₹1,999–2,999/month.
            </p>
            <div className="box box-teal">
              <div className="box-label">In Simple Terms</div>
              <p>
                With{" "}
                <a
                  href="https://insydz.com/"
                  style={{ color: "#0d9488", textDecoration: "underline" }}
                >
                  real-time competitor price monitoring and alerts
                </a>
                , it watches your rivals' product prices 24×7 so you don't have
                to. When a competitor drops their price on Amazon.in or
                Flipkart, you get an alert with a recommendation on what to do
                next. It's the difference between reacting in 5 minutes versus
                finding out 2 days later.
              </p>
            </div>

            {/* S2 */}
            <h2 id="why-matters">
              Why Choosing the Right Tool Matters for Indian Sellers
            </h2>
            <h3>The Cost of Being One Step Behind</h3>
            <p>
              With{" "}
              <a
                href="https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                amazon competitor price tracking
              </a>
              , you will notice that price changes on Amazon.in happen
              constantly sometimes 5–8 times per day in high-competition
              categories like electronics, home appliances, and FMCG. A seller
              who finds out about a competitor's price drop 12 hours later has
              already lost Buy Box position, potentially dropped in search
              rankings, and surrendered sales to a faster-reacting rival.
            </p>
            <p>
              The numbers are stark: sellers who track competitor prices in real
              time{" "}
              <strong>
                capture 30–40% more demand during competitor stock-outs
              </strong>{" "}
              and respond to price changes within an hour instead of a day. Over
              a month, that's a measurable revenue difference not a marginal
              one.
            </p>
            <h3>Platform Coverage Is Non-Negotiable in India</h3>
            <p>
              Unlike the US where Amazon dominates, Indian sellers typically
              operate across 2–3 platforms simultaneously. A seller doing ₹5
              lakh/month might earn ₹3 lakh on Amazon.in, ₹1.5 lakh on Flipkart.
              A price tracking tool that only covers Amazon is only solving 60%
              of their problem. This is the fundamental gap in most
              globally-built tools and it's the clearest reason Indian sellers
              need an India-first solution with a{" "}
              <a
                href="https://insydz.com/flipkart-sellers"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                flipkart competitor tracking tool
              </a>{" "}
              built in.
            </p>
            <div className="box box-amber">
              <div className="box-label"> Real Seller Example</div>
              <p>
                A Jaipur-based seller of home décor products was manually
                checking 8 competitors on Flipkart every morning using the
                browser. It took 90 minutes daily and was still missing
                overnight price changes. After switching to an automated price
                tracking tool, she caught a competitor's 22% price drop at 2 AM
                on a Friday and adjusted her price by 9 AM Saturday, before the
                weekend shopping rush. That one response was worth an estimated{" "}
                <strong>₹28,000 in recovered weekend sales</strong>.
              </p>
            </div>

            {/* Graphic 2 — .png image */}
            <figure className="blog-img-wrap">
              <img
                src="/Best_Price_Tracer-Blog2_image2.png"
                alt="3 Markets. 1 Tool. — Amazon.in, Flipkart tracked live from one dashboard"
                style={{ width: "100%", display: "block" }}
              />
            </figure>
            <p className="art-img-cap">
              India-first tools like Insydz track Amazon.in, Flipkart
              simultaneously the only complete multi-platform solution for
              Indian sellers
            </p>

            <div
              className="box box-indigo"
              style={{ padding: "18px 20px", margin: "20px 0" }}
            >
              <div className="box-label">AI Overview Summary</div>
              <p
                style={{
                  fontSize: "clamp(13.5px,1.5vw,14.5px)",
                  margin: 0,
                  lineHeight: 1.72,
                }}
              >
                The best competitor pricing tracking tools for Indian sellers
                monitor prices on Amazon.in, Flipkart simultaneously, deliver
                alerts via WhatsApp rather than email, and provide AI-powered
                recommendations not just raw data. For Indian SMBs who can't
                afford ₹4,000–8,000/month global tools, India-first platforms
                offer equivalent or better functionality at 60–85% lower cost.
              </p>
            </div>

            {/* S3 */}
            <h2 id="how-it-works">How Competitor Price Tracking Tools Work</h2>
            <p>
              Understanding the mechanics behind price tracking tools helps you
              evaluate which platform is genuinely real-time versus which claims
              real-time but runs on hourly batch jobs. Here's what a properly
              built tool does:
            </p>
            <div className="steps">
              {[
                {
                  n: 1,
                  t: "Setup & Integration",
                  d: "Connect your Amazon/Flipkart seller account and input the ASINs or product URLs of competitors you want to monitor. Good tools allow you to add 10–50 competitors per product.",
                },
                {
                  n: 2,
                  t: "Continuous Crawling",
                  d: "The tool's engine checks competitor listing prices at regular intervals — anywhere from every 15 minutes to every few hours. AI-powered tools also track stock availability, ratings, and review velocity alongside price.",
                },
                {
                  n: 3,
                  t: "Anomaly Detection",
                  d: "When a competitor changes their price beyond your set threshold (e.g., drops more than 5%), the system flags it as a significant event requiring your attention.",
                },
                {
                  n: 4,
                  t: <>WhatsApp Alert Delivery</>,
                  d: "You receive an alert via WhatsApp, email, or in-app notification with the specifics: which competitor, which product, what the old price was, what the new price is, and how it compares to your current price.",
                },
                {
                  n: 5,
                  t: <>AI Recommendation Engine</>,
                  d: 'Advanced tools go beyond the alert: "Competitor A dropped to ₹849. Recommend adjusting to ₹869 you\'ll recapture Buy Box while protecting ₹47 more margin than a full match."',
                },
              ].map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body">
                    <strong>{s.t}</strong>
                    <p>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="box box-green">
              <div className="box-label">
                <a
                  href="https://insydz.com/resources/expert-blog/manual-vs-automated-competitor-tracking"
                  style={{ color: "#16A34A", textDecoration: "underline" }}
                >
                  manual vs automated competitor tracking
                </a>
              </div>
              <p>
                Manually tracking 10 competitors across 20 SKUs on 2 platforms
                requires checking <strong>400 data points daily</strong>. At 30
                seconds per check, that's 3.3 hours every single day just
                watching prices. Automated tools do this in milliseconds,
                continuously, without breaks.
              </p>
            </div>

            {/* Graphic 3 — already .png, unchanged */}
            <figure
              style={{
                margin: "24px 0",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              <img
                src="/Best_Price_Tracer-Blog2_image3.png"
                alt="How Insydz price tracking works 5 step pipeline"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "12px",
                }}
              />
              <figcaption
                style={{
                  background: "#f1f5f9",
                  padding: "14px 18px",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  color: "#64748b",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                Insydz automates the full 5-step pricing intelligence pipeline —
                from crawling to WhatsApp alerts to AI-powered recommendations.
              </figcaption>
            </figure>

            {/* S4 */}
            <h2 id="types">
              Types of Competitor Price Tracking Tools: Which Category Fits You?
            </h2>
            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool Type</th>
                    <th>Best For</th>
                    <th>Speed</th>
                    <th>India Fit</th>
                    <th>Price Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Manual Excel / Browser</strong>
                    </td>
                    <td>0–5 SKUs, early stage</td>
                    <td>
                      <span className="br">24–48 hrs</span>
                    </td>
                    <td>Poor</td>
                    <td>Free (your time)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Basic Scrapers / Chrome Extensions</strong>
                    </td>
                    <td>5–20 SKUs, budget-conscious</td>
                    <td>
                      <span className="ba">4–12 hrs</span>
                    </td>
                    <td>Partial</td>
                    <td>Free – ₹500/mo</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Global SaaS (Helium 10, Keepa)</strong>
                    </td>
                    <td>Amazon-heavy, 20+ SKUs</td>
                    <td>
                      <span className="bb">1–4 hrs</span>
                    </td>
                    <td>Limited</td>
                    <td>₹3,300–8,300/mo</td>
                  </tr>
                  <tr className="hl">
                    <td>
                      <strong>India-First AI Platform (Insydz)</strong>
                    </td>
                    <td>Any size, multi-platform</td>
                    <td>
                      <span className="bg">{"<"} 1 hour</span>
                    </td>
                    <td>
                      <span className="bg">Built for India</span>
                    </td>
                    <td>
                      <strong>₹1,999–2,999/mo</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Enterprise Custom Tools</strong>
                    </td>
                    <td>D2C brands, agencies, 100+ SKUs</td>
                    <td>
                      <span className="bb">Real-time</span>
                    </td>
                    <td>Custom</td>
                    <td>₹15K–75K/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mid-cta">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3>Start Tracking Competitor Prices Free</h3>
                <p>
                  Setup in under 30 minutes. WhatsApp alerts from day one. No
                  credit card required.
                </p>
              </div>
              <button
                className="mid-cta-btn"
                onClick={() => router.push("/login")}
              >
                Try Insydz Free →
              </button>
            </div>

            {/* S5 */}
            <h2 id="mistakes">
              5 Mistakes Indian Sellers Make When Tracking Competitor Prices
            </h2>
            <div className="mistake-list">
              {[
                {
                  n: 1,
                  t: "Using WhatsApp Screenshots Instead of Actual Tools",
                  d: "A surprisingly common practice in Indian seller communities: someone in a WhatsApp group notices a competitor's price change and shares a screenshot. By the time it circulates and you act — 6–8 hours have passed. This is community intelligence, not pricing intelligence.",
                },
                {
                  n: 2,
                  t: "Tracking Only Amazon and Ignoring Flipkart",
                  d: "Indian sellers who sell on both platforms often apply Amazon-derived pricing to Flipkart without checking Flipkart-specific competitor pricing. Flipkart's competitive dynamics differ different sellers dominate, price gaps are different, and the Buy Box equivalent works differently.",
                },
                {
                  n: 3,
                  t: "Setting Alerts Too Wide (Missing the Real Moves)",
                  d: "Setting a 15% threshold before you get alerted means a competitor dropping from ₹999 to ₹859 a 14% drop — goes unnoticed. In competitive categories, a ₹50 gap is enough to lose Buy Box. Set alerts at 3–5% for high-competition categories.",
                },
                {
                  n: 4,
                  t: "Reacting to Every Price Change Without Strategy",
                  d: (
                    <>
                      Some sellers match every competitor price drop within
                      minutes. This triggers retaliatory drops, creates
                      category-wide price compression, and erodes everyone's
                      margins including yours. Smart automated price tracking
                      tools calculate the minimum response needed, not the
                      maximum reaction.
                    </>
                  ),
                },
                {
                  n: 5,
                  t: "Not Connecting Price Tracking to Stock Monitoring",
                  d: (
                    <>
                      Price and stock are inseparable signals. When a competitor
                      drops their price, it might mean they're overstocked and
                      will be out of stock in 3 weeks. If you know they're about
                      to go OOS, you don't need to match their
                      discount.Automated price tracking connected to stock
                      monitoring lets you hold your price and prepare for the
                      demand surge.
                    </>
                  ),
                },
              ].map((m) => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-num">{m.n}</div>
                  <div className="mistake-body">
                    <strong>{m.t}</strong>
                    <p>{m.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="box box-pink">
              <div className="box-label">Key Insight</div>
              <p>
                The biggest pricing mistake isn't being too expensive it's being
                reactive without context. A price change is a signal, not a
                command.{" "}
                <strong>
                  Understanding why a competitor changed their price is as
                  important as knowing that they did.
                </strong>
              </p>
            </div>

            {/* S6 */}
            <h2 id="workflow">
              Best Practices: A Practical Pricing Intelligence Workflow
            </h2>
            <p>
              The most successful Indian sellers don't react to pricing changes
              they run a structured workflow that keeps them consistently
              competitive without manual effort. Here's the framework that
              works:
            </p>

            {/* Graphic 4 — already .png, unchanged */}
            <figure
              style={{
                margin: "24px 0",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              <img
                src="/Best_Price_Tracer-Blog2_image4.png"
                alt="Pricing intelligence workflow for Indian sellers"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "12px",
                }}
              />
              <figcaption
                style={{
                  background: "#f1f5f9",
                  padding: "14px 18px",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  color: "#64748b",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                A structured pricing intelligence workflow replaces 3+ hours of
                daily manual work with a 40-minute weekly discipline — powered
                by automation.
              </figcaption>
            </figure>

            <h3>Key Metrics to Track</h3>
            <div className="metrics">
              {[
                {
                  t: "Buy Box Win Rate per SKU",
                  d: "Target: >65% for primary products. The single most important pricing health metric.",
                },
                {
                  t: "Average Time-to-Response",
                  d: "Target: <2 hours when a competitor changes price in a high-velocity category.",
                },
                {
                  t: "Revenue Captured During OOS Events",
                  d: "Measure separately competitor stock-out is often a 3–5× revenue opportunity.",
                },
                {
                  t: "Gross Margin Trend",
                  d: "Are you maintaining margin or eroding it with reactive pricing? Track monthly.",
                },
              ].map((m) => (
                <div className="metric" key={m.t}>
                  <div>
                    <div className="metric-t">{m.t}</div>
                    <div className="metric-d">{m.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* S7 */}
            <h2 id="best-tools">
              Best Competitor Price Tracking Tools for India in 2026
            </h2>
            <h3>Global Tools: Honest Assessment for Indian Sellers</h3>
            <p>
              Several well-established tools serve Amazon sellers globally
              Keepa, Helium 10's competitor tools, and Jungle Scout's market
              tracker among them. For Indian sellers, here's an honest, direct
              assessment:
            </p>
            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Strengths</th>
                    <th>India Limitations</th>
                    <th>Price (INR/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Keepa</strong>
                    </td>
                    <td>Deep Amazon price history, free tier</td>
                    <td>Amazon.com only, no recommendations</td>
                    <td>Free – ₹1,700</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Helium 10</strong>
                    </td>
                    <td>Comprehensive Amazon suite</td>
                    <td>Amazon.com-focused, limited India data</td>
                    <td>₹4,000 – ₹10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Jungle Scout</strong>
                    </td>
                    <td>Strong product research + tracking</td>
                    <td>No Flipkart, India data limited</td>
                    <td>₹3,800 – ₹8,000</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Price2Spy</strong>
                    </td>
                    <td>Multi-website tracking</td>
                    <td>Not marketplace-native, no AI recommendations</td>
                    <td>₹2,500 – ₹7,000</td>
                  </tr>
                  <tr className="hl">
                    <td>
                      <strong>Insydz</strong>
                    </td>
                    <td>Amazon.in + Flipkart, WhatsApp AI</td>
                    <td>India-first purpose-built, no limitations</td>
                    <td>
                      <strong>Free – ₹2,999</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Insydz: Built Ground-Up for Indian Marketplace Sellers</h3>
            <p>
              Insydz isn't a US tool adapted for India it's the other way
              around. Built specifically for how Indian sellers operate across
              Amazon.in, Flipkart, it takes a connected ecommerce price tool
              approach for India tying competitor price tracking with review
              intelligence, SEO rank tracking, and stock monitoring in one
              system.
            </p>

            {/* Graphic 5 — .png image */}
            <figure className="blog-img-wrap">
              <img
                src="/Best_Price_Tracer-Blog2_image5.png"
                alt="All Features. One Tool. Insydz price tracking, review analytics, rank tracking and AI recommendations for India"
                style={{ width: "100%", display: "block" }}
              />
            </figure>
            <p className="art-img-cap">
              Insydz combines price tracking, stock monitoring, review
              intelligence and AI recommendations in one India-first platform
            </p>

            <div className="box box-green">
              <div className="box-label">A Note on Tool Selection</div>
              <p>
                Don't choose a tool based on the longest feature list.{" "}
                <strong>
                  Choose based on how quickly you'll act on what it tells you.
                </strong>{" "}
                A tool that sends you a competitor price tracking WhatsApp alert
                at 8 AM is more valuable than a tool that generates a beautiful
                dashboard you open once a week.
              </p>
            </div>

            {/* S8 FAQ */}
            <h2 id="faq">Frequently Asked Questions</h2>
            <div style={{ marginTop: 16 }}>
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className={`faq-item${openFaq === i ? " open" : ""}`}
                >
                  <div
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setOpenFaq(openFaq === i ? null : i)
                    }
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`faq-icon${openFaq === i ? " open" : ""}`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </div>
                  {openFaq === i && (
                    <div className="faq-a">
                      <p dangerouslySetInnerHTML={{ __html: faq.a }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related Guides */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 28,
                borderTop: "2px solid #E5E7EB",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(16px,3vw,20px)",
                  fontWeight: 800,
                  color: "#0A0F1A",
                  margin: "0 0 18px",
                  border: "none",
                  padding: 0,
                  fontFamily: "'Sora',sans-serif",
                }}
                className="dark:text-white"
              >
                Related Guides
              </h2>
              <div className="related-grid">
                <Link
                  href="/resources/expert-blog/amazon-vs-flipkart-india-sellers"
                  className="rel-card"
                  title="Amazon vs Flipkart India sellers guide 2026"
                >
                  <div className="rel-thumb">
                    <img
                      src="/Amazon vs Flipkart India Sellers.png"
                      alt="Amazon vs Flipkart India sellers 2026"
                    />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Marketplace Strategy</div>
                    <div className="rel-title">
                      Amazon vs Flipkart: Which Marketplace is Better in India?
                      (2026)
                    </div>
                  </div>
                </Link>
                <Link
                  href="/resources/expert-blog/flipkart-keyword-research-tool"
                  className="rel-card"
                  title="Flipkart keyword research tool guide 2026"
                >
                  <div className="rel-thumb">
                    <img
                      src="/Flipkart Keyword Research Tool.png"
                      alt="Flipkart Keyword Research Tool guide"
                    />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag" style={{ color: "#2874F0" }}>
                      Flipkart SEO
                    </div>
                    <div className="rel-title">
                      Flipkart Keyword Research Tool &amp; SEO Optimization
                      Guide for Sellers (2026)
                    </div>
                  </div>
                </Link>
                <Link
                  href="/compare/insydzvshelium"
                  className="rel-card"
                  title="Insydz vs Helium 10 for Indian sellers"
                >
                  <div className="rel-thumb">
                    <img
                      src="/Insydz-vs-Helium-10.png"
                      alt="Insydz vs Helium 10 comparison for Indian sellers"
                    />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Compare</div>
                    <div className="rel-title">
                      Insydz vs Helium 10: Which Is the Right Tool for Indian
                      Sellers?
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div className="final-cta-block">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3"
          style={{ fontFamily: "'Sora',sans-serif" }}
        >
          Your Competitors Are Tracking. Start Now.
        </h2>
        <p
          className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg"
          style={{
            fontFamily: "'Lora', serif",
            maxWidth: 520,
            margin: "0 auto 24px",
          }}
        >
          Insydz monitors rival prices on Amazon.in and Flipkart — and alerts
          you on WhatsApp before you lose the Buy Box.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "6px 20px",
            marginBottom: 20,
          }}
        >
          {[
            "Real-time price alerts",
            "Amazon.in + Flipkart",
            "WhatsApp notifications",
            "Free forever",
          ].map((t) => (
            <div
              key={t}
              className="text-blue-100"
              style={{
                fontSize: "clamp(11px,2vw,13.5px)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              <span className="text-white" style={{ fontWeight: 800 }}>
                ✓
              </span>{" "}
              {t}
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
        >
          Track Competitors Free →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          Live in 30 min · No setup needed · No card required
        </p>
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

// Helper constants to avoid TS "expression too complex" issues
const clamp13 = "clamp(12px,1.4vw,13px)" as const;
