"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Clock, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen, Video, FileText,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




const schemaBlog = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://insydz.com/logo.png"
      },
      "sameAs": [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool",
      "url": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool",
      "name": "Amazon Competitor Price Tracking Tool India – Complete Guide",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool#breadcrumb",
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
          "name": "Resources",
          "item": "https://insydz.com/resources"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Expert Blog",
          "item": "https://insydz.com/resources/expert-blog"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Amazon Competitor Price Tracking Tool",
          "item": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool"
        }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool#article",
      "headline": "Amazon Competitor Price Tracking Tool India – Complete Guide",
      "description": "Learn how Amazon competitor price tracking tools help sellers monitor pricing, analyze competitors, and optimize strategies to increase sales and win the Buy Box.",
      "image": "https://insydz.com/one.png",
      "author": {
        "@type": "Person",
        "name": "Vikrant Singh",
        "url": "https://insydz.com/author/vikrant-singh"
      },
      "publisher": {
        "@id": "https://insydz.com/#organization"
      },
      "datePublished": "2025-02-23",
      "dateModified": "2025-02-23",
      "mainEntityOfPage": {
        "@id": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool"
      },
      "keywords": [
        "Amazon competitor price tracking tool",
        "Amazon price monitoring tool",
        "competitor price tracking Amazon India",
        "Amazon pricing strategy",
        "Amazon seller tools"
      ],
      "articleSection": "Ecommerce Analytics",
      "inLanguage": "en"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the best Amazon competitor price tracking tool for India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For Indian sellers, the best tool covers Amazon.in and Flipkart, sends alerts, and fits within a reasonable budget. Insydz is built specifically for this."
          }
        },
        {
          "@type": "Question",
          "name": "How often does a price tracking tool check competitor prices?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Advanced tools check prices multiple times per hour to ensure quick reaction to competitor changes."
          }
        },
        {
          "@type": "Question",
          "name": "Can I track competitor prices on Flipkart?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Insydz supports Amazon, Flipkart, and other Indian marketplaces."
          }
        },
        {
          "@type": "Question",
          "name": "Will automation cause price wars?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Smart tools avoid price wars by optimizing pricing instead of blindly matching competitors."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need technical skills?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, tools like Insydz are designed for non-technical users."
          }
        }
      ]
    }
  ]
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
    { name: "Competitor Price Tracking", icon: <DollarSign className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
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
    { name: "Free Competitor Price Checker", icon: <DollarSign className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
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
    { name: "About Us", icon: <Presentation className="w-4 h-4" />, route: "/about/about-us" },
    { name: "Our Vision", icon: <Globe className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Users className="w-4 h-4" />, route: "/about/careers" },
  ],
};

const TOC = [
  { id: "what-is",        label: "What is Price Tracking?" },
  { id: "why-critical",   label: "Why It's Critical for India" },
  { id: "how-it-works",   label: "How It Works (5 Steps)" },
  { id: "comparison",     label: "Tracking Methods Compared" },
  { id: "mistakes",       label: "5 Common Mistakes" },
  { id: "best-practices", label: "Best Practices & Execution" },
  { id: "best-tools",     label: "Best Tools for India" },
  { id: "faq",            label: "FAQs" },
  { id: "conclusion",     label: "Final Thoughts" },
];

const FAQS = [
  {
    q: "What is the best Amazon competitor price tracking tool for India?",
    a: "For Indian sellers, the best tool covers Amazon.in AND Flipkart, sends WhatsApp alerts, and fits within the ₹500–3,000/month budget range that Indian SMBs can justify. Insydz is purpose-built for this — it's the only platform offering AI-powered price intelligence for all three major Indian marketplaces at this price point.",
  },
  {
    q: "How often does a price tracking tool check competitor prices?",
    a: "Basic free tools may check every 12–24 hours — which is too slow for competitive categories. AI-powered tools like Insydz check prices multiple times per hour, ensuring you're alerted within 60 minutes of any significant competitor price movement. For high-velocity categories like electronics or FMCG, faster tracking directly translates to Buy Box retention.",
  },
  {
    q: "Can I track competitor prices on Flipkart — not just Amazon?",
    a: "Most global tools (Helium 10, Jungle Scout) only cover Amazon. Since 60% of tier-2 and tier-3 city sellers in India do their primary business on Flipkart, this is a major gap. Insydz covers Flipkart alongside Amazon.in, making it the only complete solution for multi-platform Indian sellers.",
  },
  {
    q: "Will automating price tracking lead to price wars?",
    a: "Only if done poorly. Blind automation — matching any competitor drop instantly — does cause price wars. Smart tools like Insydz calculate the minimum adjustment needed to stay competitive (e.g., 'Adjust from ₹999 to ₹979 — not ₹899') based on ratings, delivery, and margin data. This protects your margins while recovering the Buy Box.",
  },
  {
    q: "How much do Indian e-commerce price tracking tools cost?",
    a: "Global tools like Helium 10 run ₹4,000–8,000/month. India-first platforms like Insydz offer plans from ₹1,999/month (Starter) to ₹2,999/month (Professional), with a forever-free plan for new sellers. Most Indian sellers find the Growth plan at ₹1,299/month the right balance of features and price.",
  },
  {
    q: "Do I need technical skills to use a price tracking tool?",
    a: "No. Platforms like Insydz are designed specifically for Indian sellers who don't have tech backgrounds. You connect your Amazon/Flipkart store with a few clicks, add the competitor ASINs you want to track, and receive WhatsApp alerts with plain-language recommendations. No dashboards to learn, no CSV exports to analyse.",
  },
];

const IMAGES = {
  hero: {
    src: "/one.png",
    alt: "Indian ecommerce seller working on laptop with Amazon analytics",
    caption: "Indian e-commerce sellers who implement AI-powered competitor price tracking recover an average of ₹45,000/month in revenue previously lost to unmonitored price changes.",
  },
  tracking: {
    src: "/two.png",
    alt: "Real-time price tracking analytics dashboard on screen",
    caption: "AI-powered price tracking dashboards convert raw competitor data into actionable decisions — showing you exactly what price to set, and why, for each ASIN.",
  },
  mobile: {
    src: "/three.png",
    alt: "Mobile online shopping in India",
    caption: "Over 78% of Amazon India orders originate from mobile. A competitor who undercuts you by ₹50 captures every one of those buyers — without you ever knowing it happened.",
  },
  festive: {
    src: "/Amazon Competitor Price Tracking Tool India-Blog1_image4.png",
    alt: "Festive season ecommerce shopping bags",
    caption: "During Big Billion Days and Great Indian Festival, 40–60% of annual e-commerce revenue concentrates into 4–7 days. Real-time price tracking is your only defence against losing the Buy Box during these windows.",
  },
  warehouse: {
    src: "/Amazon Competitor Price Tracking Tool India-Blog1_image5.png",
    alt: "Ecommerce warehouse fulfillment and shipping",
    caption: "India-first tools like Insydz cover Amazon.in, Flipkart simultaneously — closing the multi-platform gap that global tools leave open for Indian sellers.",
  },
};

interface ArticleImgProps { src: string; alt: string; caption?: string; }
function ArticleImg({ src, alt, caption }: ArticleImgProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className="article-img-wrap">
      {!loaded && <div className="img-shimmer" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "auto", display: loaded ? "block" : "none" }}
      />
      {caption && <figcaption className="img-caption">{caption}</figcaption>}
    </figure>
  );
}

const SCHEMAS = [schemaBlog];

export default function AmazonCompetitorPriceTrackingTool() {
  const router = useRouter();
  const [activeSection, setActiveSection]       = useState("what-is");
  const [scrollPct, setScrollPct]               = useState(0);
  const [tocOpen, setTocOpen]                   = useState(false);
  const [openFaq, setOpenFaq]                   = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen]             = useState(false);
  const [scrolled, setScrolled]                 = useState(false);
  const [isDarkMode, setIsDarkMode]             = useState(false);
  const [activeDropdown, setActiveDropdown]     = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-blog-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-blog-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveSection(TOC[i].id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };

  const toggleMobileMenu = (name: string) => setMobileActiveMenu(prev => prev === name ? null : name);

  const scrollToSection = (sectionId: string) => {
    router.push("/");
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  // ── Inline link helper ──────────────────────────────────────────────────────
  // Renders a styled anchor that navigates via wouter's setLocation
  const InLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); router.push(to); }}
      style={{
        color: "#ea580c",
        textDecoration: "underline",
        textDecorationColor: "#fed7aa",
        textUnderlineOffset: "3px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#c2410c")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#ea580c")}
    >
      {children}
    </a>
  );

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
    const accentCls =
      accent === "orange"
        ? "text-orange-600 dark:text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20";
    const dropHoverCls =
      accent === "orange"
        ? "hover:bg-orange-50 dark:hover:bg-orange-900/20 group-hover:text-orange-600"
        : "hover:bg-purple-50 dark:hover:bg-purple-900/20 group-hover:text-purple-600";
    const iconCls =
      accent === "orange" ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400";

    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
            isActive
              ? accent === "orange" ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold"
              : accentCls
          }`}
        >
          {label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
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
                className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 group ${dropHoverCls}`}
              >
                <span className={`${iconCls} group-hover:scale-110 transition-transform flex-shrink-0`}>{item.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        @keyframes imgShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .read-progress {
          position: fixed; top: 0; left: 0; height: 3px;
          background: linear-gradient(90deg,#f97316,#ef4444);
          z-index: 9999; transition: width .1s linear;
          border-radius: 0 2px 2px 0;
        }

        :root { --nav-h: 72px; }
        @media(min-width:1024px){ :root { --nav-h: 80px; } }

        .article-layout {
          max-width: 1200px; margin: 0 auto;
          padding: 40px 16px 80px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 40px;
          align-items: start;
        }
        @media(min-width:1280px){
          .article-layout { padding: 48px 24px 80px; grid-template-columns: 240px 1fr; gap: 48px; }
        }
        @media(max-width:1023px){
          .article-layout { grid-template-columns: 1fr; gap: 0; padding: 24px 16px 60px; }
        }
        @media(max-width:480px){
          .article-layout { padding: 16px 12px 48px; }
        }

        .toc-sidebar {
          position: sticky; top: calc(var(--nav-h) + 16px);
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 16px; padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          max-height: calc(100vh - var(--nav-h) - 32px);
          overflow-y: auto;
        }
        .dark .toc-sidebar { background: #111827; border-color: #1f2937; }
        @media(max-width:1023px){ .toc-sidebar { display: none !important; } }

        .mobile-toc-btn {
          display: none; width: 100%;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 13px 16px;
          font-family: 'Sora', sans-serif; font-size: 14px;
          font-weight: 600; color: #111; cursor: pointer;
          align-items: center; justify-content: space-between;
          margin-bottom: 16px; touch-action: manipulation;
        }
        .dark .mobile-toc-btn { background: #111827; border-color: #1f2937; color: #f9fafb; }
        @media(max-width:1023px){ .mobile-toc-btn { display: flex; } }

        .mobile-toc-panel {
          display: none; background: #fff;
          border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 12px; margin-bottom: 24px;
        }
        .dark .mobile-toc-panel { background: #111827; border-color: #1f2937; }
        .mobile-toc-panel.open { display: block; }

        .article-body {
          font-family: 'Lora', serif;
          font-size: clamp(15px, 1.8vw, 17px);
          line-height: 1.8; color: #374151;
        }
        .dark .article-body { color: #d1d5db; }
        .article-body h2 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(19px, 2.8vw, 28px);
          font-weight: 800; color: #111;
          letter-spacing: -.4px; margin: 48px 0 14px;
          line-height: 1.25; scroll-margin-top: calc(var(--nav-h) + 16px);
        }
        .dark .article-body h2 { color: #f9fafb; }
        .article-body h3 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(15px, 1.9vw, 19px);
          font-weight: 700; color: #111;
          margin: 28px 0 10px;
          scroll-margin-top: calc(var(--nav-h) + 16px);
        }
        .dark .article-body h3 { color: #f3f4f6; }
        .article-body p { margin-bottom: 18px; }
        .article-body ul, .article-body ol { padding-left: 20px; margin-bottom: 18px; }
        .article-body li { margin-bottom: 8px; }
        .article-body strong { font-weight: 700; color: #111; }
        .dark .article-body strong { color: #f9fafb; }

        .callout { border-radius: 12px; padding: 16px 18px; margin: 24px 0; }
        .callout.pro  { background: #f0fdf4; border: 1px solid #86efac; border-left: 4px solid #16a34a; }
        .callout.warn { background: #fffbeb; border: 1px solid #fcd34d; border-left: 4px solid #d97706; }
        .callout.info { background: #eff6ff; border: 1px solid #93c5fd; border-left: 4px solid #2563eb; }
        .callout.teal { background: #f0fdfa; border: 1px solid #99f6e4; border-left: 4px solid #0d9488; }
        .dark .callout.pro  { background: #052e16; border-color: #166534; }
        .dark .callout.warn { background: #1c1507; border-color: #78350f; }
        .dark .callout.info { background: #0c1a2e; border-color: #1e3a5f; }
        .dark .callout.teal { background: #042f2e; border-color: #134e4a; }
        .callout-label {
          font-family: 'Sora', sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .callout.pro  .callout-label { color: #16a34a; }
        .callout.warn .callout-label { color: #d97706; }
        .callout.info .callout-label { color: #2563eb; }
        .callout.teal .callout-label { color: #0d9488; }
        .callout-text {
          font-family: 'Lora', serif;
          font-size: clamp(14px, 1.6vw, 15px);
          color: #374151; line-height: 1.72;
        }
        .dark .callout-text { color: #d1d5db; }

        .inline-cta {
          background: linear-gradient(135deg,#fff7ed,#ffedd5);
          border: 1px solid #fed7aa; border-radius: 16px;
          padding: clamp(16px,3vw,28px) clamp(16px,4vw,32px);
          margin: 36px 0; display: flex;
          align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .dark .inline-cta { background: linear-gradient(135deg,#1c0a00,#2d1500); border-color: #7c2d12; }
        .inline-cta h4 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 800; color: #111; margin-bottom: 4px;
        }
        .dark .inline-cta h4 { color: #f9fafb; }
        .inline-cta p {
          font-family: 'Sora', sans-serif;
          font-size: clamp(12px, 1.4vw, 14px);
          color: #6b7280; margin: 0;
        }
        .dark .inline-cta p { color: #9ca3af; }
        .inline-cta-btn {
          background: linear-gradient(135deg,#f97316,#ef4444);
          color: white; font-family: 'Sora', sans-serif;
          font-weight: 700; font-size: 14px;
          padding: 12px 20px; border-radius: 12px;
          border: none; cursor: pointer; white-space: nowrap;
          transition: all .2s; touch-action: manipulation;
          min-height: 44px;
        }
        .inline-cta-btn:hover { opacity: .9; transform: translateY(-1px); }
        @media(max-width:480px){
          .inline-cta { flex-direction: column; align-items: stretch; }
          .inline-cta-btn { width: 100%; text-align: center; }
        }

        .dt-wrap {
          overflow-x: auto; margin: 20px 0;
          border-radius: 12px; border: 1px solid #e5e7eb;
          -webkit-overflow-scrolling: touch;
        }
        .dark .dt-wrap { border-color: #1f2937; }
        table.dt {
          width: 100%; border-collapse: collapse;
          font-family: 'Sora', sans-serif;
          font-size: clamp(11px, 1.3vw, 13px);
          min-width: 480px;
        }
        table.dt th {
          background: #111827; color: white;
          padding: 11px 14px; text-align: left;
          font-size: clamp(10px, 1.1vw, 11px);
          letter-spacing: .5px; text-transform: uppercase;
          white-space: nowrap;
        }
        table.dt td {
          padding: 11px 14px; border-bottom: 1px solid #e5e7eb;
          color: #374151; vertical-align: middle;
        }
        .dark table.dt td { border-color: #1f2937; color: #d1d5db; }
        table.dt tr:last-child td { border-bottom: none; }
        table.dt tr:nth-child(even) td { background: #f9fafb; }
        .dark table.dt tr:nth-child(even) td { background: #0f172a; }
        .bg { background: #dcfce7; color: #15803d; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-size: 11px; white-space: nowrap; }
        .bo { background: #fff7ed; color: #ea580c; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-size: 11px; white-space: nowrap; }
        .br { background: #fef2f2; color: #dc2626; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-size: 11px; white-space: nowrap; }
        .bb { background: #dbeafe; color: #1e40af; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-size: 11px; white-space: nowrap; }

        .step { display: flex; gap: 14px; margin-bottom: 20px; }
        .step-num {
          flex-shrink: 0; width: 34px; height: 34px;
          background: linear-gradient(135deg,#f97316,#ef4444);
          color: white; font-family: 'Sora', sans-serif;
          font-weight: 800; font-size: 14px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-top: 3px;
        }
        .step-content h4 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(14px, 1.5vw, 15px);
          font-weight: 700; color: #111; margin-bottom: 5px;
        }
        .dark .step-content h4 { color: #f9fafb; }
        .step-content p {
          font-size: clamp(14px, 1.5vw, 15px);
          margin: 0; font-family: 'Lora', serif;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 14px; margin-top: 16px;
        }
        @media(min-width:768px){ .related-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
        @media(max-width:600px){ .related-grid { grid-template-columns: 1fr; } }
        .related-card {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 14px; overflow: hidden; cursor: pointer;
          transition: all .2s; touch-action: manipulation;
        }
        .dark .related-card { background: #111827; border-color: #1f2937; }
        .related-card:hover { border-color: #f97316; box-shadow: 0 4px 16px rgba(249,115,22,.12); transform: translateY(-2px); }
        .related-thumb { width:100%; aspect-ratio:2.4 / 1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .related-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .related-body { padding: 12px; }
        .related-tag { font-size: 10px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 5px; }
        .related-title { font-size: 13px; font-weight: 700; color: #0d1b2a; line-height: 1.4; font-family: 'Sora', sans-serif; margin-bottom: 8px; }
        .dark .related-title { color: #f9fafb; }
        .related-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #94a3b8; }

        .faq-item {
          border: 1px solid #e5e7eb; border-radius: 12px;
          margin-bottom: 10px; overflow: hidden;
          background: #fff; transition: border-color .2s;
        }
        .dark .faq-item { background: #111827; border-color: #1f2937; }
        .faq-item.open { border-color: #f97316; }
        .faq-q {
          display: flex; justify-content: space-between;
          align-items: center; padding: 16px 18px;
          cursor: pointer; font-family: 'Sora', sans-serif;
          font-size: clamp(13px, 1.5vw, 15px);
          font-weight: 600; color: #111; gap: 12px;
          touch-action: manipulation; min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }
        .dark .faq-q { color: #f9fafb; }
        .faq-icon {
          flex-shrink: 0; width: 24px; height: 24px;
          background: #fff7ed; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #f97316; font-size: 16px; font-weight: 700;
          transition: transform .2s;
        }
        .faq-icon.open { transform: rotate(45deg); background: #f97316; color: white; }
        .faq-a {
          font-family: 'Lora', serif;
          font-size: clamp(14px, 1.5vw, 15px);
          line-height: 1.7; color: #374151;
          padding: 0 18px 16px;
        }
        .dark .faq-a { color: #d1d5db; }

        .article-img-wrap {
          margin: 28px 0; border-radius: 12px;
          overflow: hidden; border: 1px solid #e5e7eb;
          background: #f9fafb;
          box-shadow: 0 4px 20px rgba(0,0,0,.06);
        }
        .dark .article-img-wrap { border-color: #1f2937; background: #111827; }
        .img-shimmer {
          height: clamp(180px, 30vw, 300px);
          background: linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);
          background-size: 400% 100%;
          animation: imgShimmer 1.6s ease infinite;
        }
        .img-caption {
          padding: 9px 14px 11px;
          font-family: 'Sora', sans-serif; font-size: 12px;
          color: #9ca3af; line-height: 1.5;
          border-top: 1px solid #e5e7eb; background: #f9fafb;
        }
        .dark .img-caption { background: #111827; border-color: #1f2937; }

        .stat-strip {
          display: flex; flex-wrap: wrap;
          border: 1px solid #e5e7eb; border-radius: 14px;
          overflow: hidden; margin-top: 28px;
        }
        .dark .stat-strip { border-color: #1f2937; }
        .stat-item {
          flex: 1; min-width: 130px;
          padding: clamp(12px,2vw,16px);
          text-align: center; border-right: 1px solid #e5e7eb;
        }
        .dark .stat-item { border-color: #1f2937; }
        .stat-item:last-child { border-right: none; }
        @media(max-width:480px){
          .stat-item { min-width: 50%; }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item:nth-child(1), .stat-item:nth-child(2) { border-bottom: 1px solid #e5e7eb; }
          .dark .stat-item:nth-child(1), .dark .stat-item:nth-child(2) { border-bottom-color: #1f2937; }
        }

        .article-hero {
          background: #fff; border-bottom: 1px solid #e5e7eb;
          padding: 0 clamp(12px,4vw,32px);
          padding-top: calc(var(--nav-h) + clamp(24px,4vw,40px));
        }
        .dark .article-hero { background: #0f172a; border-color: #1f2937; }
        .hero-inner { max-width: 820px; margin: 0 auto; padding-bottom: 32px; }

        .final-cta-block {
          background: linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);
          padding: clamp(48px,8vw,40px) 20px;
          text-align: center; margin: 60px 0 0;
        }
        .final-cta-benefits {
          display: flex; justify-content: center;
          flex-wrap: wrap; gap: 8px 20px; margin-bottom: 28px;
        }
        .final-cta-benefit {
          font-size: clamp(12px,1.4vw,13.5px);
          display: flex; align-items: center; gap: 6px;
          font-family: 'Sora', sans-serif;
        }
        .final-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg,#f97316,#ef4444);
          color: white; font-family: 'Sora', sans-serif;
          font-weight: 700; font-size: clamp(14px,1.6vw,16px);
          padding: clamp(14px,2vw,16px) clamp(28px,4vw,40px);
          border-radius: 50px; border: none; cursor: pointer;
          transition: all .2s; touch-action: manipulation;
          min-height: 52px;
        }
        .final-cta-btn:hover { opacity: .9; transform: scale(1.04); }
        @media(hover:none){ .final-cta-btn:hover { transform: none; } }
        @media(max-width:400px){ .final-cta-btn { width: 100%; justify-content: center; } }

        .toc-link {
          display: block; font-size: clamp(12px,1.3vw,13px);
          font-weight: 500; color: #6b7280;
          padding: 7px 10px; border-radius: 8px;
          cursor: pointer; border: none; background: none;
          text-align: left; width: 100%; transition: all .15s;
          margin-bottom: 2px; line-height: 1.4;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .toc-link:hover { background: #fff7ed; color: #ea580c; }
        .toc-link.active {
          background: #fff7ed; color: #ea580c;
          font-weight: 700; border-left: 3px solid #f97316;
          padding-left: 8px;
        }
        .dark .toc-link { color: #9ca3af; }
        .dark .toc-link:hover, .dark .toc-link.active { background: #1c0a00; color: #fb923c; }

        .mistake-card {
          display: flex; border: 1px solid #e5e7eb;
          border-radius: 12px; overflow: hidden; margin-bottom: 12px;
        }
        .dark .mistake-card { border-color: #1f2937; }
        .mistake-num {
          flex-shrink: 0; width: 48px;
          background: #111827; color: white;
          font-family: 'Sora', sans-serif;
          font-size: clamp(16px,2vw,20px);
          font-weight: 800; display: flex;
          align-items: center; justify-content: center;
        }
        .mistake-body { padding: 14px 16px; }
        .mistake-body strong {
          display: block; font-family: 'Sora', sans-serif;
          font-size: clamp(13px,1.4vw,14px);
          font-weight: 700; color: #111; margin-bottom: 5px;
        }
        .dark .mistake-body strong { color: #f9fafb; }
        .mistake-body p {
          font-family: 'Sora', sans-serif;
          font-size: clamp(12px,1.3vw,13.5px);
          color: #6b7280; line-height: 1.6; margin: 0;
        }
        .dark .mistake-body p { color: #9ca3af; }

        .bp-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px; margin: 16px 0 28px;
        }
        @media(max-width:768px){ .bp-grid { grid-template-columns: 1fr; } }
        @media(min-width:640px) and (max-width:767px){ .bp-grid { grid-template-columns: repeat(2,1fr); } }
        .bp-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .dark .bp-card { border-color: #1f2937; }
        .bp-head {
          padding: 11px 14px;
          font-family: 'Sora', sans-serif; font-size: 12px;
          font-weight: 700; text-transform: uppercase;
          letter-spacing: .5px; color: white;
        }
        .bp-body { padding: 12px 14px; }
        .bp-body ul { list-style: none; padding: 0; margin: 0; }
        .bp-body li {
          font-family: 'Sora', sans-serif;
          font-size: clamp(11.5px, 1.2vw, 12.5px);
          color: #374151; line-height: 1.5;
          margin-bottom: 8px; padding-left: 16px;
          position: relative;
        }
        .bp-body li::before {
          content: "✓"; position: absolute; left: 0;
          color: #f97316; font-weight: 700; font-size: 11px; top: 1px;
        }
        .dark .bp-body li { color: #d1d5db; }

        .metrics-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin: 16px 0 28px;
        }
        @media(max-width:540px){ .metrics-grid { grid-template-columns: 1fr; } }
        .metric-card {
          border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 16px; display: flex; gap: 12px;
          align-items: flex-start; background: #fff;
        }
        .dark .metric-card { border-color: #1f2937; background: #111827; }
        .metric-icon {
          flex-shrink: 0; width: 38px; height: 38px;
          border-radius: 10px; background: #fff7ed;
          display: flex; align-items: center;
          justify-content: center; font-size: 18px;
        }
        .metric-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(12.5px,1.4vw,13.5px);
          font-weight: 700; color: #111; margin-bottom: 4px;
        }
        .dark .metric-title { color: #f9fafb; }
        .metric-desc {
          font-family: 'Sora', sans-serif;
          font-size: clamp(11.5px,1.2vw,12.5px);
          color: #6b7280; line-height: 1.5;
        }
        .dark .metric-desc { color: #9ca3af; }

        .takeaway-box {
          background: #111827; border-radius: 16px;
          padding: clamp(20px,3vw,28px) clamp(18px,3vw,30px);
          margin: 24px 0;
        }
        .takeaway-box h3 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(15px,1.7vw,17px);
          font-weight: 800; color: white; margin: 0 0 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .takeaway-item {
          display: flex; align-items: flex-start;
          gap: 10px; margin-bottom: 10px;
        }
        .takeaway-dot {
          flex-shrink: 0; width: 20px; height: 20px;
          border-radius: 50%; background: #f97316;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: white; margin-top: 2px;
        }
        .takeaway-text {
          font-family: 'Lora', serif;
          font-size: clamp(13.5px,1.5vw,14.5px);
          color: #cbd5e1; line-height: 1.6;
        }

        nav button { -webkit-tap-highlight-color: transparent; }

        .toc-sidebar::-webkit-scrollbar { width: 4px; }
        .toc-sidebar::-webkit-scrollbar-track { background: transparent; }
        .toc-sidebar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .dark .toc-sidebar::-webkit-scrollbar-thumb { background: #374151; }

        footer button, footer a { min-height: 36px; display: inline-flex; align-items: center; }
      `}</style>

      {/* Reading progress */}
      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ════════════════════════════════════════════ NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg"
            : "bg-background dark:bg-gray-900/80 backdrop-blur-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-[72px] lg:h-20">

            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="Insydz Logo"
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Insydz
                </span>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <button
                onClick={() => router.push("/pricing")}
                onMouseEnter={() => setActiveDropdown(null)}
                className="px-2 xl:px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Pricing
              </button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button
                onClick={() => router.push("/login")}
                onMouseEnter={() => setActiveDropdown(null)}
                className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Login
              </Button>
              <button
                className="ml-1 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-800" />}
              </button>
            </div>

            {/* Mobile right controls */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700 dark:text-gray-200" />}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-200" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100dvh-72px)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              <button
                onClick={() => { router.push("/resources/expert-blog"); setIsMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </button>
              {(
                [
                  ["Solutions",  "Solutions",  "purple"],
                  ["Use Cases",  "Use Cases",  "purple"],
                  ["Features",   "Features",   "purple"],
                  ["Free Tools", "Free Tools", "purple"],
                  ["Compare",    "Compare",    "purple"],
                  ["Resources",  "Resources",  "orange"],
                  ["About",      "About",      "purple"],
                ] as [string, keyof NavigationMenu, string][]
              ).map(([label, key, accent]) => (
                <div key={label}>
                  <button
                    onClick={() => toggleMobileMenu(label)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium text-sm ${
                      accent === "orange"
                        ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-4 mt-1 space-y-0.5 pb-1">
                      {navigationMenu[key].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleMenuItemClick(item)}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm rounded-lg ${
                            accent === "orange"
                              ? "text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              : "text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          }`}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => { router.push("/pricing"); setIsMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                Pricing
              </button>
              <div className="pt-2">
                <Button
                  onClick={() => { router.push("/login"); setIsMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 rounded-xl"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════════════ HERO */}
      <section className="article-hero">
        <div className="hero-inner" style={{marginLeft: "150px", marginRight: "auto"}}>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5 flex-wrap" aria-label="Breadcrumb">
            <button onClick={() => router.push("/")} className="hover:text-orange-500 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => router.push("/resources/expert-blog")} className="hover:text-orange-500 transition-colors">Expert Blog</button>
            <span>/</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-orange-500 font-medium">Price Tracking</span>
          </nav>

          {/* Category tag */}
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Seller Tools &amp; Strategy
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white mb-4">
            Amazon{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Competitor Price Tracking Tool
            </span>{" "}
            India: Complete Guide for Sellers (2026)
          </h1>

          <p className="text-base sm:text-sm md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-6" style={{ fontFamily: "'Lora', serif" }}>
            Track competitor prices on Amazon.in, Flipkart in real time. Discover how Indian sellers use
            AI-powered tools to protect margins, win the Buy Box, and outsell rivals — with a complete 2026 playbook.
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <strong className="text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>Vikrant Singh</strong>
            </div>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">·</span>
            <span className="hidden sm:inline">Last updated: <strong className="text-gray-700 dark:text-gray-300">January 2026</strong></span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <strong className="text-gray-700 dark:text-gray-300">14 min read</strong>
            </div>
            <span className="bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded">
              Updated for 2026
            </span>
          </div>

          {/* Stat strip */}
          <div className="stat-strip" style={{ width: "140%" }}>
            {[
              ["15–30%", "Monthly Profit Lost to Reactive Pricing"],
              ["70–80%", "Buy Box = Share of Category Sales"],
              ["₹45K",   "Avg. Revenue Lost Per Seller / Month"],
              ["<1 hr",  "AI Price Alert Response Time"],
            ].map(([num, lbl]) => (
              <div className="stat-item" key={num}>
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{num}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-tight">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: "80%",
            margin: "0 auto",
            borderTop: "1px solid #e5e7eb"
          }}
        >
          <ArticleImg {...IMAGES.hero} />
        </div>
      </section>

      {/* Key Takeaways */}
      <div className="takeaway-box" style={{ maxWidth: "1170px", margin: "40px auto" }}>
        <h3><span style={{ color: "#f97316" }}>✓</span> Key Takeaways</h3>
        {[
          <>Amazon competitor price tracking tools automate what currently takes Indian sellers 3–5 hours daily in manual Excel work.</>,
          <>Price changes affect your Amazon.in competitor price tracking search rank and Buy Box eligibility — not just your revenue.</>,
          <>Real-time WhatsApp alerts (not email) are critical for Indian SMB sellers to act within minutes, not hours.</>,
          <>AI-powered tools provide actionable recommendations — not just data dumps — which is the difference between insight and action.</>,
          <>Global tools like Helium 10 don't cover Flipkart and are priced out of reach for most Indian sellers.</>,
          <>India-first platforms like Insydz cover Amazon, Flipkart at 60–85% lower cost, with WhatsApp alerts.</>,
          <>Combining price tracking with review intelligence and keyword tracking gives Indian sellers a complete competitive picture.</>,
        ].map((t, i) => (
          <div className="takeaway-item" key={i}>
            <div className="takeaway-dot">✓</div>
            <div className="takeaway-text">{t}</div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════ ARTICLE LAYOUT */}
      <div className="article-layout">

        {/* Sidebar TOC */}
        <aside className="toc-sidebar" aria-label="Table of contents">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Table of Contents
          </div>
          {TOC.map(t => (
            <button
              key={t.id}
              className={`toc-link${activeSection === t.id ? " active" : ""}`}
              onClick={() => go(t.id)}
            >
              {t.label}
            </button>
          ))}
          <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold py-2.5 rounded-xl transition-all"
            >Start Free with Insydz
            </button>
          </div>
        </aside>

        {/* Article body */}
        <main>
          {/* Mobile TOC */}
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen}>
            📋 Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`} role="navigation">
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display: "block", marginBottom: 4 }} onClick={() => go(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">

            {/* ── S1: What Is ─────────────────────────────────────────── */}
            <h2 id="what-is">What is an Amazon Competitor Price Tracking Tool for India?</h2>
            <p>
              An <InLink to="/use-cases/track-competitor-prices">amazon competitor price tracking tool India</InLink> is software that automatically monitors your rivals' product prices, stock availability, and listing
              changes on Amazon.in, Flipkart in real time, without any manual effort. Unlike generic
              global tools built for US or European marketplaces, India-focused platforms account for the pricing
              dynamics, seller behaviour, and platform nuances unique to Indian e-commerce.
            </p>
            <p>
              Here's the scale of the problem: Indian sellers on Amazon.in collectively lose an estimated — rather than proactive pricing decisions cost sellers <strong>15–30% of potential monthly profit</strong>.
            </p>

            <div className="callout teal">
              <div className="callout-label">In Simple Terms</div>
              <div className="callout-text">
                Instead of manually checking 10 competitor listings every morning on Amazon.in (which takes 2–3 hours),
                a price tracking tool does it automatically, 24×7, and alerts you on WhatsApp the moment a competitor drops their price or goes out of stock — so you can act first.
              </div>
            </div>

            <ArticleImg {...IMAGES.tracking} />

            {/* ── S2: Why Critical ────────────────────────────────────── */}
            <h2 id="why-critical">Why is Competitor Price Tracking Critical for Indian Sellers?</h2>
            <p>
              Indian e-commerce is one of the most price-sensitive markets in the world. Shoppers compare prices across
              3–5 sellers before purchasing. Implementing <InLink to="/">dynamic pricing on Amazon India</InLink> is a necessity for survival — a ₹50 difference on a ₹500 product can shift the Buy Box
              — and with it, 70–80% of the category's sales volume.
            </p>

            <h3>Revenue Leakage is Silent and Compounding</h3>
            <p>
              Most Indian sellers price once and forget. Using <InLink to="/resources/expert-blog/amazon-competitor-price-tracking-tool">automated price tracking tools </InLink>improve accuracy and efficiency, allowing you to stay ahead. When a competitor dropped their price by ₹100 overnight, your product slides off the first page of Amazon search results. You don't even know it happened. Three
              weeks later, you've lost ₹45,000 in revenue you never even tracked.
            </p>

            <h3>Amazon &amp; Flipkart Algorithm Penalises Stale Pricing</h3>
            <p>
              Both Amazon and Flipkart factor in price competitiveness when deciding which products to feature in search
              results and 'Recommended' carousels. A product that's ₹200 more expensive than the category median gets
              suppressed — even if your reviews are better.
            </p>

            <div className="callout warn">
              <div className="callout-label">Real Seller Example</div>
              <div className="callout-text">
                A Delhi-based electronics accessories seller was doing ₹3.2 lakh/month on Amazon. A new competitor
                entered with a ₹30 lower price. Sales dropped to ₹1.8 lakh within 6 weeks. The seller found out via a
                customer message not a tool. Had they tracked prices in real time, they could have matched the
                competitor within an hour and retained the Buy Box.
              </div>
            </div>

            {/* AI Overview Summary callout */}
            <div
              className="callout warn"
              style={{
                backgroundColor: "#eef0f6",
                border: "1px solid #d9dce6",
                borderRadius: "12px",
                padding: "18px"
              }}
            >
              <div
                className="callout-label"
                style={{
                  color: "#4f46e5",
                  fontWeight: "700",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  marginBottom: "8px"
                }}
              >
                AI OVERVIEW SUMMARY
              </div>
              <div
                className="callout-text"
                style={{
                  color: "#1f2937",
                  fontSize: "16px",
                  lineHeight: "1.6"
                }}
              >
                Amazon competitor price tracking tools help Indian sellers rival prices on Amazon.in,
                Flipkart in real time. They reduce revenue leakage caused by reactive pricing, protect Buy Box position, and
                enable faster, smarter decisions especially for sellers managing 10–50 SKUs without a full-time
                analyst.
              </div>
            </div>

            <h3>The Festive Season Window is Unforgiving</h3>
            <p>
              During Big Billion Days and Great Indian Festival, 40–60% of annual e-commerce revenue concentrates into
              4–7 days. A seller who loses the Buy Box on Day 1 of a festive event often can't recover the algorithm
              has already reallocated visibility to competitors.
            </p>

            {/* ── S3: How It Works ────────────────────────────────────── */}
            <h2 id="how-it-works">How Does Amazon Competitor Price Tracking Work?</h2>
            <p>
              Modern tools have replaced the manual spreadsheet workflow with a 5-step automated intelligence loop:
            </p>

            {/* Steps — Step 2 gets the amazon price tracker link (#5) */}
            {(
              [
                {
                  title: "Connect Your Seller Account",
                  desc: <>Link your Amazon/Flipkart seller account and add your top 5–10 competitor ASINs to start monitoring immediately.</>,
                },
                {
                  title: "Automated Live Data Crawling",
                  desc: (
                    <>
                      The <InLink to="/free-tools/free-competitor-price-checker">amazon price tracker</InLink> crawler or API pulls live price data from product listings at frequent intervals every 15–60
                      minutes for AI-powered tools like Insydz.
                    </>
                  ),
                },
                {
                  title: "AI Engine Analysis",
                  desc: (
                    <>
                      The competitor monitoring tool AI engine compares your price against the category benchmark and competitor prices, factoring in
                      ratings, delivery speed, and stock levels.
                    </>
                  ),
                },
                {
                  title: "WhatsApp / Email Alert Triggered",
                  desc: <>You receive a WhatsApp or email alert the moment a competitor changes price by more than your defined threshold (e.g., ±5%).</>,
                },
                {
                  title: "Actionable AI Recommendation",
                  desc: <>{`The platform gives a decision, not just data: "Competitor A dropped to ₹899. Recommend adjusting to ₹919 to stay competitive while protecting ₹42 more margin."`}</>,
                },
              ]
            ).map((step, i) => (
              <div className="step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}

            <div className="callout pro">
              <div className="callout-label">Key Insight</div>
              <div className="callout-text">
                Manual tracking gives you data points. AI-powered intelligence gives you decisions.
                That gap is the difference between reacting tomorrow and winning today.
              </div>
            </div>

            {/* ── S4: Comparison ──────────────────────────────────────── */}
            <h2 id="comparison">Types of Amazon Price Tracking Approaches (Comparison)</h2>

            <figure style={{ margin: "24px 0", overflow: "hidden", borderRadius: "12px" }}>
              <img
                src="/Amazon Competitor Price Tracking Tool India-Blog1_image3.png"
                alt="Ecommerce pricing execution model"
                style={{ width: "100%", display: "block" }}
              />
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "14px 18px",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  color: "#64748b",
                  borderTop: "1px solid #e2e8f0"
                }}
              >
                AI-powered price tracking dashboards surface the exact adjustments needed to protect Buy Box position no manual analysis required.
              </div>
            </figure>

            <div className="dt-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Speed</th>
                    <th>Accuracy</th>
                    <th>Actionability</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Manual Excel Tracking</strong></td>
                    <td><span className="br">24–48 hours</span></td>
                    <td>Low (human error)</td>
                    <td>None</td>
                    <td>3–5 hrs/day labour</td>
                  </tr>
                  <tr>
                    <td><strong>Basic Free Alert Tools</strong></td>
                    <td><span className="bo">2–6 hours</span></td>
                    <td>Medium</td>
                    <td>Low (alerts only)</td>
                    <td>Free – ₹200/mo</td>
                  </tr>
                  <tr>
                    <td><strong>Global SaaS (Helium 10)</strong></td>
                    <td><span className="bb">1–2 hours</span></td>
                    <td>High</td>
                    <td>Medium (US-focused)</td>
                    <td>₹4,000–8,000/mo</td>
                  </tr>
                  <tr>
                    {/* Link #3 — "India-First AI Platform (Insydz)" → /pricing */}
                    <td>
                      <strong>India-First AI Platform (Insydz)</strong>
                    </td>
                    <td><span className="bg">&lt; 1 hour</span></td>
                    <td>High</td>
                    <td><span className="bg">High — Actionable AI</span></td>
                    <td>₹1,999–2,999/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="inline-cta">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4>Start Tracking Competitor Prices Free</h4>
                <p>WhatsApp alerts. No credit card. No dashboards to learn. Set up in 5 minutes.</p>
              </div>
              <button className="inline-cta-btn" onClick={() => router.push("/login")}>
                Try Insydz Free
              </button>
            </div>

            {/* ── S5: Mistakes ────────────────────────────────────────── */}
            <h2 id="mistakes">5 Common Mistakes Indian Sellers Make with Price Tracking</h2>

            {/* Mistake cards with inline links woven in */}
            <div className="mistake-card">
              <div className="mistake-num">1</div>
              <div className="mistake-body">
                <strong>Tracking Prices in Excel Every Morning</strong>
                <p>
                  If you're opening 10 competitor tabs every morning and copying prices into a spreadsheet you're
                  already 24 hours behind. The competitor changed their price at 11 PM last night. You found out at
                  9 AM today. You lost the Buy Box for 10 hours.
                </p>
              </div>
            </div>

            <div className="mistake-card">
              <div className="mistake-num">2</div>
              <div className="mistake-body">
                <strong>Ignoring Email Alerts (and Missing WhatsApp)</strong>
                <p>
                  Most Indian SMB sellers check email 2–3 times a day at most. They check WhatsApp 50+ times. A price
                  alert sent to an email that's opened 4 hours later is not an alert it's a history lesson.
                </p>
              </div>
            </div>

            <div className="mistake-card">
              <div className="mistake-num">3</div>
              <div className="mistake-body">
                <strong>Over-Discounting in a Panic</strong>
                <p>
                  When sellers notice a competitor undercutting, the instinct is to slash prices immediately. This
                  starts price wars that destroy margins across the entire category. Smart sellers use AI to find the minimum adjustment needed to stay competitive — not the maximum cut.
                </p>
              </div>
            </div>

            <div className="mistake-card">
              <div className="mistake-num">4</div>
              <div className="mistake-body">
                <strong>Not Tracking Competitor Reviews Alongside Prices</strong>
                <p>
                  Price is one signal. But a competitor with 500 reviews and 4.6 stars can charge ₹150 more than you
                  and still win. Sellers who only track price miss the full picture. Review Analytics — review velocity and sentiment tracking should run alongside price tracking.
                </p>
              </div>
            </div>

            <div className="mistake-card">
              <div className="mistake-num">5</div>
              <div className="mistake-body">
                <strong>Setting Prices Once at Launch and Never Revisiting</strong>
                <p>
                  Seasonal demand on Flipkart for electronics, apparel, and home goods swings 40–60% during festive
                  periods. A seller who doesn't adjust pricing dynamically for Diwali, Republic Day Sale, or Big Billion Days leaves significant profit on the table.
                </p>
              </div>
            </div>

            {/* ── S6: Best Practices ──────────────────────────────────── */}
            <h2 id="best-practices">Best Practices for Indian Sellers: Weekly Execution Model</h2>
            <p>
              The most successful Indian sellers don't react to pricing changes they run a structured weekly rhythm
              that keeps them consistently competitive without manual effort.
            </p>

            <div className="bp-grid">
              {[
                {
                  head: "Daily — Automated",
                  color: "#0D9488",
                  items: [
                    "Morning WhatsApp digest: top 3 competitor price movements overnight",
                    "Review Buy Box status for your top 10 SKUs",
                    "Act on any 'Critical Alert' (competitor dropped >10%)",
                  ],
                },
                {
                  head: "Weekly — 30 Min Review",
                  color: "#111827",
                  items: [
                    "Review competitor review sentiment recurring pain points?",
                    "Check keyword rank movements for top 5 keywords",
                    "Identify competitors that went out of stock (opportunity)",
                    "Adjust 1–2 product prices based on AI recommendations",
                  ],
                },
                {
                  head: "Monthly — Strategic",
                  color: "#f97316",
                  items: [
                    "Audit pricing for upcoming festive season or sale events",
                    "Identify 1 new product from AI gap analysis report",
                    "Review revenue impact of pricing changes (before vs. after)",
                  ],
                },
              ].map(col => (
                <div className="bp-card" key={col.head}>
                  <div className="bp-head" style={{ background: col.color }}>{col.head}</div>
                  <div className="bp-body">
                    <ul>{col.items.map(it => <li key={it}>{it}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>

            <ArticleImg {...IMAGES.festive} />

            <h3>Key Metrics to Track</h3>
            <div className="metrics-grid">
              {[
                {
                  title: "Buy Box Win Rate",
                  desc: "Target: >70% for your top SKUs. The single most important pricing health metric.",
                },
                {
                  title: "Price Competitiveness Index",
                  desc: "Are you within 5% of the category median price at all times?",
                },
                {
                  title: "Revenue per SKU (Monthly Trend)",
                  desc: "Track individual SKU revenue to catch silent revenue leakage early.",
                },
                {
                  title: "Competitor Stock-Out Capture Rate",
                  desc: "Did you gain sales when a rival went OOS? Often a 3–5× revenue opportunity.",
                },
              ].map((m, idx) => (
                <div className="metric-card" key={idx}>
                  <div>
                    <div className="metric-title">
                        {m.title}
                    </div>
                    <div className="metric-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Also add "track competitor prices" and "Keyword Rank Tracking" links in the weekly section prose */}
            <p>
              The weekly rhythm also means you regularly perform <InLink to="/use-cases/track-competitor-prices">real-time competitor price monitoring</InLink> and review Keyword Rank Tracking movements to understand the full competitive picture not just price.
            </p>

            {/* ── S7: Best Tools ──────────────────────────────────────── */}
            <h2 id="best-tools">Best Tools for Amazon Competitor Price Tracking in India</h2>
            <p>
              Not all tools are built equally and for Indian sellers, the platform choice is critical. Finding the <InLink to="/resources/expert-blog/best-competitor-price-tracking-tools-india">best competitor price tracking tools in India</InLink> is the first step — here's an
              honest, side-by-side comparison.
            </p>

            <div className="dt-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Amazon.in</th>
                    <th>Flipkart</th>
                    <th>WhatsApp</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Helium 10</strong></td>
                    <td><span className="bg">Yes</span></td>
                    <td><span className="br">No</span></td>
                    <td><span className="br">No</span></td>
                    <td><span className="br">No</span></td>
                    <td>₹4,000–8,000/mo</td>
                  </tr>
                  <tr>
                    <td><strong>Jungle Scout</strong></td>
                    <td><span className="bg">Yes</span></td>
                    <td><span className="br">No</span></td>
                    <td><span className="br">No</span></td>
                    <td><span className="br">No</span></td>
                    <td>₹4,500–7,000/mo</td>
                  </tr>
                  <tr>
                    <td><strong>Insydz</strong></td>
                    <td><span className="bg">Yes</span></td>
                    <td><span className="bg">Yes</span></td>
                    <td><span className="bg">Yes</span></td>
                    <td><span className="bg">Yes</span></td>
                    <td>₹1,999/mo + Free plan</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: "40px" }}>
              Global Tools: Powerful but Mismatched for India
            </h3>

            <p>
              Helium 10 and Jungle Scout are industry standards for Amazon sellers in the US and Europe.
              They offer deep keyword research, product research, and price tracking capabilities.
              However, for Indian sellers, they come with significant limitations.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginTop: "24px"
              }}
            >
              {/* Helium / Jungle Card */}
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb"
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <strong>Helium 10 / Jungle Scout</strong>
                  <span
                    style={{
                      background: "#e5e7eb",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px"
                    }}
                  >
                    US / Europe
                  </span>
                </div>
                <div style={{ padding: "18px" }}>
                  <p>
                    Industry standard globally — but significant gaps for Indian sellers:
                  </p>
                  <ul style={{ marginTop: "10px", lineHeight: "1.8" }}>
                    <li>₹4,000–8,000/month — too expensive for most SMB sellers</li>
                    <li>No Flipkart coverage</li>
                    <li>English-only dashboards</li>
                    <li>Email alerts only</li>
                  </ul>
                </div>
              </div>

              {/* Insydz Card */}
              <div
                style={{
                  borderRadius: "12px",
                  border: "1px solid #fdba74"
                }}
              >
                <div
                  style={{
                    background: "#f97316",
                    color: "white",
                    padding: "16px",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <strong>Insydz</strong>
                  <span
                    style={{
                      background: "#fb923c",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px"
                    }}
                  >
                    India-First AI
                  </span>
                </div>
                <div style={{ padding: "18px" }}>
                  <p>
                    Built ground-up for how Indian sellers actually work:
                  </p>
                  <ul style={{ marginTop: "10px", lineHeight: "1.8" }}>
                    <li>Real-time WhatsApp alerts</li>
                    <li>AI price recommendations</li>
                    <li>Amazon + Flipkart coverage</li>
                    <li>₹1,999–2,999/month pricing</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="callout pro">
              <div className="callout-label">No Aggressive Pitch</div>
              <div className="callout-text">
                If you're an Indian seller on Amazon.in or Flipkart and you're not tracking competitor prices with AI, you're operating on guesswork. The question isn't whether you need a tool it's which one fits your budget and platforms.
              </div>
            </div>

            <ArticleImg {...IMAGES.warehouse} />


            {/* ── FAQ ─────────────────────────────────────────────────── */}
            <h2 id="faq">Frequently Asked Questions</h2>

            {/* FAQ 1 — Link #2: "best Amazon competitor price tracking tool" self-references this page */}
            <div className={`faq-item${openFaq === 0 ? " open" : ""}`}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === 0 ? null : 0)} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && setOpenFaq(openFaq === 0 ? null : 0)}>
                <span>{FAQS[0].q}</span>
                <div className={`faq-icon${openFaq === 0 ? " open" : ""}`} aria-hidden="true">+</div>
              </div>
              {openFaq === 0 && (
                <div className="faq-a">
                  For Indian sellers, the{" "}
                  {/* Link #2 — "best Amazon competitor price tracking tool" → self (this page) */}
                  <InLink to="/resources/expert-blog/amazon-competitor-price-tracking-tool">
                    best Amazon competitor price tracking tool
                  </InLink>{" "}
                  covers Amazon.in AND Flipkart, sends WhatsApp alerts, and fits within the ₹500–3,000/month
                  budget range that Indian SMBs can justify. Insydz is purpose-built for this it's the only platform
                  offering AI-powered price intelligence for all three major Indian marketplaces at this price point.
                </div>
              )}
            </div>

            {/* FAQ 2 — Link #7: "price tracking tool checks competitor prices" */}
            <div className={`faq-item${openFaq === 1 ? " open" : ""}`}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === 1 ? null : 1)} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && setOpenFaq(openFaq === 1 ? null : 1)}>
                <span>{FAQS[1].q}</span>
                <div className={`faq-icon${openFaq === 1 ? " open" : ""}`} aria-hidden="true">+</div>
              </div>
              {openFaq === 1 && (
                <div className="faq-a">
                  Basic free tools may check every 12–24 hours — which is too slow for competitive categories. The way
                  an AI-powered{" "}
                  {/* Link #7 — "price tracking tool checks competitor prices" → /features/competitor-price-tracking-feature */}
                  <InLink to="/features/competitor-price-tracking-feature">
                    price tracking tool checks competitor prices
                  </InLink>{" "}
                  multiple times per hour ensures you're alerted within 60 minutes of any significant price movement.
                  For high-velocity categories like electronics or FMCG, faster tracking directly translates to Buy Box
                  retention.
                </div>
              )}
            </div>

            {/* FAQ 3 — no specific link required */}
            <div className={`faq-item${openFaq === 2 ? " open" : ""}`}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === 2 ? null : 2)} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && setOpenFaq(openFaq === 2 ? null : 2)}>
                <span>{FAQS[2].q}</span>
                <div className={`faq-icon${openFaq === 2 ? " open" : ""}`} aria-hidden="true">+</div>
              </div>
              {openFaq === 2 && <div className="faq-a">{FAQS[2].a}</div>}
            </div>

            {/* FAQ 4 — Link #14 already used in Mistake #3; repeat in FAQ answer naturally */}
            <div className={`faq-item${openFaq === 3 ? " open" : ""}`}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === 3 ? null : 3)} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && setOpenFaq(openFaq === 3 ? null : 3)}>
                <span>{FAQS[3].q}</span>
                <div className={`faq-icon${openFaq === 3 ? " open" : ""}`} aria-hidden="true">+</div>
              </div>
              {openFaq === 3 && (
                <div className="faq-a">
                  Only if done poorly. Blind automation matching any competitor drop instantly does cause price
                  wars. Smart tools like Insydz calculate the{" "}
                  {/* Link #13 — "Price Optimization" → /features/price-optimization-feature */}
                  <InLink to="/features/price-optimization-feature">
                    Price Optimization
                  </InLink>{" "}
                  minimum adjustment (e.g., 'Adjust from ₹999 to ₹979 — not ₹899') based on ratings, delivery, and
                  margin data. This protects your margins while recovering the Buy Box.
                </div>
              )}
            </div>

            {/* FAQs 5 & 6 — no new links required */}
            {[4, 5].map(i => (
              <div className={`faq-item${openFaq === i ? " open" : ""}`} key={i}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && setOpenFaq(openFaq === i ? null : i)}>
                  <span>{FAQS[i].q}</span>
                  <div className={`faq-icon${openFaq === i ? " open" : ""}`} aria-hidden="true">+</div>
                </div>
                {openFaq === i && <div className="faq-a">{FAQS[i].a}</div>}
              </div>
            ))}

            {/* ── Conclusion ──────────────────────────────────────────── */}
            <h2 id="conclusion">Final Thoughts</h2>
            <p>
              Winning on Amazon India and Flipkart in 2026 isn't about having the best product it's about having the
              best intelligence. Competitor price tracking is the foundation of that intelligence layer.
            </p>
            <p>
              Sellers who implement real-time AI-powered price monitoring stop reacting to the market and start leading
              it. They know when a rival goes out of stock before buyers do. They know when a competitor undercuts them
              within 45 minutes, not 45 hours. And they recover their Buy Box with a precise price adjustment enabled
              by a complete competitive picture — not a panicked discount.
            </p>
            <p>
              <strong>The data is clear: every hour without price tracking is an hour of revenue being silently
              redirected to a competitor who does.</strong>
            </p>

            {/* ── Related Guides ──────────────────────────────────────── */}
            <h2 style={{ marginTop: 60 }}>Related Guides</h2>
            <div className="related-grid">
              {[
                {
                  title: "Flipkart Price Tracker: Monitor & Beat Competitor Prices in 2026",
                  tag: "Flipkart Sellers",
                  time: "10 min",
                  imgSrc: "/01_hero_banner.png",
                  route: "/resources/expert-blog/flipkart-price-tracker-monitor-beat-competitor-prices-2026",
                },
                {
                  title: "How to Win the Amazon Buy Box Consistently as an Indian Seller",
                  tag: "Buy Box Strategy",
                  time: "11 min",
                  imgSrc: "/three.png",
                  route: "/use-cases/track-competitor-prices",
                },
                {
                  title: "Amazon Keyword Research India: Step-by-Step Guide for 2026",
                  tag: "Keyword Research",
                  time: "12 min",
                  imgSrc: "/keyword-research-hero.png",
                  route: "/features/keyword-rank-tracking-feature",
                },
              ].map(r => (
                <div className="related-card" key={r.title} onClick={() => router.push(r.route)}>
                  <div className="related-thumb">
                    <img src={r.imgSrc} alt={r.title} />
                  </div>
                  <div className="related-body">
                    <div className="related-tag">{r.tag}</div>
                    <div className="related-title">{r.title}</div>
                    <div className="related-meta">
                      <Clock className="w-3 h-3" /> {r.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div className="final-cta-block">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
          Beat Your Competitors to Every Price Move.
        </h2>
        <p className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Lora', serif", maxWidth: 520, margin: "0 auto 24px" }}>
          Insydz tracks Amazon.in competitor prices in real time and pushes Buy Box alerts to your WhatsApp — before you lose the sale.
        </p>
        <div className="final-cta-benefits">
          {["Real-time price intelligence", "Buy Box protection alerts", "Amazon.in + Flipkart", "Free forever"].map(t => (
            <div key={t} className="final-cta-benefit text-blue-100">
              <span className="text-white" style={{ fontWeight: 800 }}>✓</span> {t}
            </div>
          ))}
        </div>
        <button className="final-cta-btn" onClick={() => router.push("/login")}>
          <Zap className="w-5 h-5 flex-shrink-0" />
          Start Price Tracking Free →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          Live in under 30 min · WhatsApp alerts · No card needed
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



