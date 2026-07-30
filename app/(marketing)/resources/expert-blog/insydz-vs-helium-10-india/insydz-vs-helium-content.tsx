"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogImageSection from "../components/BlogImageSection";

export const dynamic = "force-static";

const schemaBlogComparison = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: { "@type": "ImageObject", url: "https://insydz.com/logo.png" },
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
        "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india",
      url: "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india",
      name: "Insydz vs Helium 10 India – Which Tool is Better for Amazon Sellers?",
      description:
        "Compare Insydz vs Helium 10 in India. Explore features, pricing, keyword tracking, product research, and pricing intelligence tools.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      about: { "@id": "https://insydz.com/#organization" },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india#breadcrumb",
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
          name: "Insydz vs Helium 10 India",
          item: "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india#article",
      headline:
        "Insydz vs Helium 10 India – Which Tool is Better for Amazon Sellers?",
      description:
        "Detailed comparison of Insydz and Helium 10 tools for Amazon India sellers.",
      image: "https://insydz.com/assets/images/blog/insydz-vs-helium10.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2025-01-01",
      dateModified: "2025-01-01",
      mainEntityOfPage: {
        "@id":
          "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india",
      },
      keywords: [
        "Insydz vs Helium 10 India",
        "Helium 10 alternative India",
        "Amazon seller tools comparison",
        "best Amazon tools India",
      ],
      articleSection: "Tool Comparison",
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id":
        "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india#comparison",
      name: "Insydz vs Helium 10 Feature Comparison",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Product Research" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Keyword Research & Tracking",
        },
        { "@type": "ListItem", position: 3, name: "Competitor Analysis" },
        { "@type": "ListItem", position: 4, name: "Pricing Intelligence" },
        {
          "@type": "ListItem",
          position: 5,
          name: "Review & Sentiment Analysis",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://insydz.com/resources/expert-blog/insydz-vs-helium-10-india#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the difference between Insydz and Helium 10?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Insydz focuses on AI-powered ecommerce intelligence for India, while Helium 10 offers global seller tools.",
          },
        },
        {
          "@type": "Question",
          name: "Does Helium 10 work in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Helium 10 supports Amazon India with keyword research and analytics features.",
          },
        },
        {
          "@type": "Question",
          name: "Which tool is better for Indian sellers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Insydz is optimized for Indian sellers, while Helium 10 is better for global marketplaces.",
          },
        },
        {
          "@type": "Question",
          name: "Is Insydz a good alternative?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, it provides localized insights and AI-driven analytics for India.",
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
      name: "All Features",
      icon: <LayoutGrid className="w-4 h-4" />,
      route: "/features",
    },
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
      name: "Our Vision",
      icon: <Presentation className="w-4 h-4" />,
      route: "/about/our-vision",
    },
    {
      name: "Careers",
      icon: <Globe className="w-4 h-4" />,
      route: "/about/careers",
    },
    {
      name: "Contact-us",
      icon: <Users className="w-4 h-4" />,
      route: "/about/contact-us",
    },
  ],
};

const TOC = [
  { id: "intro", label: "Why This Comparison Matters" },
  { id: "gaps", label: "3 Problems Global Tools Don't Solve" },
  { id: "comparison", label: "Feature-by-Feature Comparison" },
  { id: "helium-pros", label: "What Helium 10 Does Well" },
  { id: "helium-gaps", label: "Where Helium 10 Falls Short" },
  { id: "insydz-diff", label: "What Insydz Does Differently" },
  { id: "mistakes", label: "5 Mistakes When Choosing" },
  { id: "pricing", label: "Pricing Comparison" },
  { id: "who-uses", label: "Who Should Use Which Tool?" },
  { id: "faq", label: "Frequently Asked Questions" },
];

const SCHEMAS = [schemaBlogComparison];

// Footer company links — typed as string pairs to avoid TS union issues
const FOOTER_COMPANY_LINKS: [string, string][] = [
  ["About", "/about/about-us"],
  ["Our Vision", "/about/our-vision"],
  ["Careers", "/about/careers"],
  ["Contact", "/about/contact-us"],
];

function ArticleImg({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ margin: "28px 0 0" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f1f5f9",
          minHeight: 320,
        }}
      >
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
              backgroundSize: "200% 100%",
              animation: "imgShimmer 1.5s infinite",
            }}
          />
        )}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity .3s",
          }}
        />
      </div>
      <p className="art-img-cap">{caption}</p>
    </div>
  );
}

export default function InsydzVsHelium10India() {
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
      const id = `insydz-blog5-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        document.getElementById(`insydz-blog5-schema-${i}`)?.remove();
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
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // ── Inline link helper ─────────────────────────────────────────────────────
  const InLink = ({
    children,
  }: {
    to: string;
    children: React.ReactNode;
    color?: string;
  }) => {
    return <span style={{ fontWeight: 600 }}>{children}</span>;
  };
  const scrollToSection = (sectionId: string) => {
    router.push("/");
    setTimeout(
      () =>
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100,
    );
  };

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
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
        >
          {label}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`}
          />
        </button>
        {isActive && (
          <div
            onMouseLeave={() => setActiveDropdown(null)}
            className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
              >
                <span
                  className={
                    ac
                      ? "text-orange-600"
                      : "text-purple-600 dark:text-purple-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
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
    );
  };

  // ── Comparison table data ───────────────────────────────────────────────────
  const compRows: { feature: string; insydz: string; h10: string }[] = [
    {
      feature: "Amazon.in Coverage",
      insydz: "✅ Native, India-specific data",
      h10: "⚠️ Partial — optimised for Amazon.com",
    },
    {
      feature: "Flipkart Coverage",
      insydz: "✅ Full tracking + keyword intel",
      h10: "❌ Not supported",
    },
    {
      feature: "Hinglish Keywords",
      insydz: "✅ Built-in, India-calibrated",
      h10: "❌ Not available",
    },
    {
      feature: "Keyword Research",
      insydz: "✅ Amazon.in + Flipkart",
      h10: "✅ Amazon only (US-focused data)",
    },
    {
      feature: "Competitor Price Tracking",
      insydz: "✅ Real-time, all 3 platforms",
      h10: "✅ Amazon only",
    },
    {
      feature: "Rank Tracking",
      insydz: "✅ Daily, with WhatsApp alerts",
      h10: "✅ Daily, email-based",
    },
    {
      feature: "Review Analytics",
      insydz: "✅ Included",
      h10: "✅ Included (via Review Insights)",
    },
    {
      feature: "AI Recommendations",
      insydz: "✅ Action-oriented, plain language",
      h10: "⚠️ Available on higher plans",
    },
    {
      feature: "WhatsApp Alerts",
      insydz: "✅ Native, primary alert channel",
      h10: "❌ Email only",
    },
    {
      feature: "Festive Trend Tracking",
      insydz: "✅ India-specific (Diwali, BBD)",
      h10: "❌ Not available",
    },
    {
      feature: "Hindi Language Support",
      insydz: "✅ Available",
      h10: "❌ English only",
    },
    {
      feature: "Starter Plan Price",
      insydz: "₹1,999/month",
      h10: "₹3,300/month",
    },
    {
      feature: "Mid-Tier Plan Price",
      insydz: "₹1,499/month",
      h10: "₹6,500/month",
    },
    {
      feature: "Free Plan",
      insydz: "✅ Forever free tier",
      h10: "⚠️ 30-day trial only",
    },
    {
      feature: "India Customer Support",
      insydz: "✅ Local, IST hours",
      h10: "❌ US-based, time zone gap",
    },
  ];

  const pricingRows: {
    tier: string;
    insydz: string;
    h10: string;
    diff: string;
    highlight: boolean;
  }[] = [
    {
      tier: "Entry / Free",
      insydz: "₹0 (forever free)",
      h10: "₹0 (30-day trial)",
      diff: "Insydz: no time limit",
      highlight: false,
    },
    {
      tier: "Starter",
      insydz: "₹1,999/month",
      h10: "₹3,300/month",
      diff: "Insydz: 85% cheaper",
      highlight: false,
    },
    {
      tier: "Growth / Platinum",
      insydz: "₹1,499/month",
      h10: "₹6,500/month",
      diff: "Insydz: 77% cheaper",
      highlight: false,
    },
    {
      tier: "Pro / Diamond",
      insydz: "₹2,999/month",
      h10: "₹8,300/month",
      diff: "Insydz: 64% cheaper",
      highlight: false,
    },
    {
      tier: "Annual Savings (Growth)",
      insydz: "₹17,988/year",
      h10: "₹78,000/year",
      diff: "₹60,012 saved/year",
      highlight: true,
    },
  ];

  const cellColor = (val: string) => {
    if (val.startsWith("✅")) return "#F0FDF4";
    if (val.startsWith("❌")) return "#FEF2F2";
    if (val.startsWith("⚠️")) return "#FFFBEB";
    return "#fff";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes imgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .read-progress{position:fixed;top:80px;left:0;height:3px;background:linear-gradient(90deg,#db2777,#7c3aed);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}
        @media(max-width:768px){.toc-sidebar{display:none}}
        .mobile-toc-btn{display:none;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 18px;font-family:'Sora',sans-serif;font-size:14px;font-weight:600;color:#111;cursor:pointer;align-items:center;justify-content:space-between;margin-bottom:16px}
        .dark .mobile-toc-btn{background:#111827;border-color:#1f2937;color:#f9fafb}
        @media(max-width:768px){.mobile-toc-btn{display:flex}}
        .mobile-toc-panel{display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:24px}
        .dark .mobile-toc-panel{background:#111827;border-color:#1f2937}
        .mobile-toc-panel.open{display:block}
        .article-body{font-family:'Lora',serif;font-size:clamp(15px,2vw,16px);line-height:1.78;color:#1E293B}
        .dark .article-body{color:#d1d5db}
        .article-body h2{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#0D1B2A;margin:52px 0 14px;padding-bottom:12px;border-bottom:2px solid #e5e7eb;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:84px}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .article-body h2:first-child{margin-top:0}
        .article-body h3{font-family:'Sora',sans-serif;font-size:17px;font-weight:700;color:#0D1B2A;margin:32px 0 10px;letter-spacing:-.2px;scroll-margin-top:84px}
        .dark .article-body h3{color:#f3f4f6}
        .article-body p{margin-bottom:16px;font-size:15.5px;line-height:1.78}
        .article-body ul,ol{margin:4px 0 18px 22px}
        .article-body li{font-size:15px;line-height:1.72;margin-bottom:8px}
        .article-body li::marker{color:#F97316}
        .article-body strong{font-weight:700;color:#0D1B2A}
        .dark .article-body strong{color:#f9fafb}
        .art-img-cap{font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:28px;padding:8px 12px}
        .box{border-radius:10px;padding:20px 22px;margin:24px 0}
        .box-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        .box p{margin:0;font-size:14.5px;line-height:1.72;font-family:'Lora',serif}
        .box-teal{background:#F0FDFA;border-left:4px solid #0D9488}
        .box-teal .box-label{color:#0D9488}
        .box-amber{background:#FFFBEB;border-left:4px solid #D97706}
        .box-amber .box-label{color:#D97706}
        .box-green{background:#F0FDF4;border-left:4px solid #16A34A}
        .box-green .box-label{color:#16A34A}
        .box-pink{background:#FDF2F8;border-left:4px solid #DB2777}
        .box-pink .box-label{color:#DB2777}
        .box-indigo{background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px}
        .box-indigo .box-label{color:#4F46E5}
        .box-dark{background:#0D1B2A;border-radius:10px;padding:24px 28px;margin:24px 0}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-pink{background:#500724;border-color:#9d174d}
        .dark .box-indigo{background:#1e1b4b;border-color:#3730a3}
        .tbl-wrap{overflow-x:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:24px 0 32px}
        table.dt{width:100%;border-collapse:collapse;font-size:13.5px;font-family:'Sora',sans-serif;min-width:520px}
        table.dt thead tr{background:#0D1B2A}
        table.dt th{padding:13px 16px;color:white;font-weight:700;text-align:left;font-size:12.5px;letter-spacing:.2px;white-space:nowrap}
        table.dt tbody tr{border-bottom:1px solid #E2E8F0;transition:background .15s}
        table.dt tbody tr:hover td{background:#FFF7ED}
        table.dt td{padding:12px 16px;vertical-align:middle;color:#1E293B}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        table.dt tr.hl td{background:#FFF7ED!important;border-left:3px solid #F97316;font-weight:700}
        table.dt tr.hl td:first-child{color:#F97316}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:3px 10px;border-radius:20px;font-size:11.5px;display:inline-block}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:3px 10px;border-radius:20px;font-size:11.5px;display:inline-block}
        .mistakes{display:flex;flex-direction:column;gap:10px;margin:20px 0 28px}
        .mistake{border:1px solid #E2E8F0;border-radius:10px;display:flex;overflow:hidden}
        .dark .mistake{border-color:#1f2937}
        .mistake-n{flex-shrink:0;width:46px;background:#0D1B2A;color:white;font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        .mistake-body{padding:16px 18px}
        .mistake-body strong{display:block;font-size:14.5px;color:#0D1B2A;margin-bottom:5px;font-family:'Sora',sans-serif}
        .dark .mistake-body strong{color:#f9fafb}
        .mistake-body p{margin:0;font-size:13.5px;color:#64748B;line-height:1.65;font-family:'Sora',sans-serif}
        .mid-cta{background:linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%);border-radius:10px;padding:28px 32px;margin:40px 0;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
        .mid-cta h3{font-size:18px;font-weight:800;color:white;margin-bottom:6px;letter-spacing:-.2px;font-family:'Sora',sans-serif}
        .mid-cta p{color:#94A3B8;font-size:13.5px;margin:0;font-family:'Sora',sans-serif}
        .faq-item{border:1px solid #E2E8F0;border-radius:10px;margin-bottom:10px;overflow:hidden;background:#fff;transition:border-color .2s}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#F97316}
        .faq-q{padding:16px 20px;font-size:14.5px;font-weight:700;color:#0D1B2A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;user-select:none;transition:background .15s;font-family:'Sora',sans-serif}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F8FAFC}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#FFEDD5;color:#F97316;display:flex;align-items:center;justify-content:center;font-size:16px;transition:transform .2s}
        .faq-icon.open{transform:rotate(45deg);background:#F97316;color:white}
        .faq-a{padding:0 20px 16px;font-size:14px;color:#64748B;line-height:1.75;font-family:'Lora',serif}
        .dark .faq-a{color:#9ca3af}
        .related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        @media(max-width:768px){.related-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:540px){.related-grid{grid-template-columns:1fr}}
        .rel-card{border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;background:#fff}
        .dark .rel-card{background:#111827;border-color:#1f2937}
        .rel-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);transform:translateY(-2px)}
        .rel-thumb{width:100%;aspect-ratio:2.4/1;overflow:hidden;background:#0A0F1A;display:flex;align-items:center;justify-content:center}
        .rel-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .rel-body{padding:14px}
        .rel-tag{font-size:10.5px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-family:'Sora',sans-serif}
        .rel-title{font-size:13px;font-weight:700;color:#0D1B2A;line-height:1.4;font-family:'Sora',sans-serif}
        .dark .rel-title{color:#f9fafb}
        .toc-link{display:block;font-size:12.5px;font-weight:500;color:#64748B;padding:6px 10px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        .toc-link:hover,.toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#431407;color:#fb923c}
        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:140px;padding:18px 24px;border-right:1px solid #E2E8F0;text-align:center}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}
        @media(max-width:580px){.stat-item{min-width:50%;border-bottom:1px solid #E2E8F0}}
        .takeaway-box{background:#0D1B2A;border-radius:10px;padding:28px 30px;margin:28px 0}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:white;margin:0 0 16px}
        .takeaway-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
        .takeaway-dot{flex-shrink:0;width:18px;height:18px;border-radius:50%;background:#F97316;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;margin-top:3px}
        .takeaway-text{font-family:'Lora',serif;font-size:14.5px;color:#CBD5E1;line-height:1.6}
        .choose-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:24px 0}
        @media(max-width:640px){.choose-grid{grid-template-columns:1fr}}
        .choose-card{border-radius:12px;padding:2px 24px 20px}
        .choose-card h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px}
        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }
        .verdict-banner{background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border:2px solid #FED7AA;border-radius:12px;padding:22px 24px;margin:28px 0;display:flex;gap:16px;align-items:flex-start}
        .dark .verdict-banner{background:#431407;border-color:#78350f}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ══ BREADCRUMB ══ */}
      <div
        style={{
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          padding: "10px 0",
          marginTop: 80,
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: "#94A3B8",
            flexWrap: "wrap" as const,
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              color: "#64748B",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Home
          </button>
          <span>›</span>
          <button
            onClick={() => router.push("/resources/expert-blog")}
            style={{
              color: "#64748B",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Blog
          </button>
          <span>›</span>
          <span>Insydz vs Helium 10 India</span>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px 0" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "#EEF2FF",
            color: "#4F46E5",
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase" as const,
            padding: "5px 14px",
            borderRadius: 20,
            marginBottom: 18,
          }}
        >
          <Trophy className="w-3.5 h-3.5" />
          Pricing + Compare
        </div>
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(26px,3.8vw,40px)",
            fontWeight: 800,
            lineHeight: 1.18,
            color: "#0D1B2A",
            letterSpacing: "-.5px",
            maxWidth: 820,
          }}
          className="dark:text-white"
        >
          {/* Link #1 — self-referencing primary keyword */}
          <span style={{ color: "#4F46E5" }}>Insydz vs Helium 10 </span>
          comparison for Indian sellers: Which is the Right Amazon Intelligence
          Tool?
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
          Helium 10 was built for Amazon US — not for the way Indian
          marketplaces actually work. Find out why thousands of Indian sellers
          are switching to a tool built specifically for Amazon India, Flipkart,
          and Meesho.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap" as const,
            gap: "5px 18px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#64748B",
            }}
          >
            <Users className="w-3.5 h-3.5" />
            <strong
              className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer"
              onClick={() => router.push("/author/vikrant-singh")}
            >
              Vikrant Singh
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#64748B",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            January 2026
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#64748B",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <strong>14 min read</strong>
          </div>
        </div>

        {/* Stat strip */}
        <div className="stat-strip" style={{ marginBottom: 32 }}>
          {(
            [
              ["1.7M+", "Active Sellers on Amazon.in + Flipkart Combined"],
              ["60–85%", "Cost Savings with Insydz vs Helium 10"],
              ["30–50%", "More India-Relevant Keywords Surfaced by Insydz"],
              [
                "₹60,012",
                "Saved Per Year on Growth Plan vs Helium 10 Platinum",
              ],
            ] as [string, string][]
          ).map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span
                style={{
                  display: "block",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#4F46E5",
                  fontFamily: "'Sora',sans-serif",
                  lineHeight: 1,
                }}
              >
                {num}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
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
      </div>

      {/* IMG 1 */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        <BlogImageSection
          imageSrc="/Insydz-vs-Helium-10.png"
          altText="Insydz vs Helium 10 India comparison platform coverage, pricing, and features"
          caption="Insydz vs Helium 10: India market coverage, pricing, and data accuracy side by side"
        />
      </div>

      {/* ══ KEY TAKEAWAYS ══ */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px 40px" }}>
        <div className="takeaway-box">
          <h3>Key Takeaways</h3>
          {[
            /* #2 — "Helium 10 is the industry-standard Amazon tool built for US sellers" → /compare/insydzvshelium */
            <span key="t0">
              <InLink to="/compare/insydzvshelium" color="#f97316">
                Helium 10 is the industry-standard Amazon tool built for US
                sellers
              </InLink>
              . For Indian sellers on Amazon.in, Flipkart, its data accuracy,
              platform coverage, and pricing create three compounding gaps.
            </span>,
            /* #3 — "market fit, not feature count" → /compare/insydzvshelium */
            <span key="t1">
              The most important question isn't 'which tool has more features?'
              it's about{" "}
              <InLink to="/compare/insydzvshelium" color="#f97316">
                market fit, not feature count
              </InLink>
              . For Indian sellers, Insydz wins this question decisively.
            </span>,
            <span key="t2">
              Flipkart is not optional for most Indian growth sellers. A tool
              that ignores Flipkart is ignoring 25–50% of a typical Indian
              seller's revenue.
            </span>,
            <span key="t3">
              WhatsApp alerts vs. email alerts is a response time gap with a
              measurable rupee value. An 8-hour delayed Buy Box response costs a
              seller doing ₹2,000/day approximately ₹600–700 per hour.
            </span>,
            <span key="t4">
              Hinglish keywords are not a nice-to-have they represent how a
              massive segment of Indian buyers actually search. A tool that
              misses 'best mixer grinder under 3000' is missing
              category-defining behaviour.
            </span>,
            <span key="t5">
              The pricing difference between Insydz Growth (₹1,499/month) and
              Helium 10 Platinum (₹6,500/month) is ₹60,012/year for most Indian
              sellers, that's a month's net profit.
            </span>,
            /* #4 — "test both tools on the same keywords, on the same products" → /compare/insydzvshelium */
            <span key="t6">
              The right approach:{" "}
              <InLink to="/compare/insydzvshelium" color="#f97316">
                test both tools on the same keywords, on the same products
              </InLink>
              , in the same week. The data quality gap will be self-evident.
            </span>,
          ].map((t, i) => (
            <div className="takeaway-item" key={i}>
              <div className="takeaway-dot">✓</div>
              <div className="takeaway-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ ARTICLE LAYOUT ══ */}
      <div className="article-layout">
        {/* SIDEBAR */}
        <aside className="toc-sidebar">
          <h4
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
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
          >
            📋 Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
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
            {/* In Simple Terms */}
            <div
              className="box box-indigo"
              style={{ padding: "20px 22px", margin: "0 0 32px" }}
            >
              <div className="box-label">In Simple Terms</div>
              <p>
                {/* #2 alt — "Helium 10 is the industry-standard Amazon tool built for US sellers" → /compare/insydzvshelium */}
                Helium 10 is the industry-standard Amazon tool built for US
                sellers comprehensive, expensive, and calibrated for Amazon.com.{" "}
                {/* #15 — "Insydz is built ground-up for Indian sellers on Amazon.in, Flipkart" → /solutions/amazon-sellers */}
                <InLink to="/solutions/amazon-sellers" color="#4f46e5">
                  Insydz is built ground-up for Indian sellers on Amazon.in,
                  Flipkart
                </InLink>{" "}
                with India-specific keyword data, WhatsApp alerts, and INR
                pricing that fits Indian seller budgets. The question isn't
                which tool has more features. It's which tool gives you accurate
                data for the market you're actually selling in.
              </p>
            </div>

            {/* S1 */}
            <h2 id="intro">
              Why This Comparison Matters for Indian Sellers Right Now
            </h2>
            <h3>The Tool Adoption Gap Is a Revenue Gap</h3>
            <p>
              India has over <strong>1.7 million active sellers</strong> on
              Amazon.in and Flipkart combined. The majority are running their
              businesses on gut feel, WhatsApp screenshots, and manual price
              checks. A growing segment has discovered that{" "}
              {/* #17 — "professional intelligence tools" → /features */}
              <InLink to="/features" color="#db2777">
                professional intelligence tools
              </InLink>{" "}
              exist and now faces the choice between globally-recognised names
              like Helium 10 or{" "}
              {/* #16 — "India-first platform" → /solutions/amazon-sellers */}
              <InLink to="/solutions/amazon-sellers" color="#db2777">
                India-first platforms
              </InLink>{" "}
              like Insydz.
            </p>
            <p>
              The stakes are real: data-driven keyword tools consistently
              outrank those who don't, within 6–12 weeks. Sellers with an{" "}
              <a
                href="https://insydz.com/resources/expert-blog/amazon-competitor-price-tracking-tool"
                style={{
                  color: "#db2777",
                  textDecoration: "underline",
                  textDecorationColor: "#db277755",
                  textUnderlineOffset: "3px",
                  fontWeight: 600,
                }}
              >
                amazon competitor price tracking tool
              </a>{" "}
              respond to market changes in under an hour instead of a day. The
              tool you pick determines whether that advantage is calibrated for
              India or for a market 12,000 kilometres away.
            </p>

            {/* S2 */}
            <h2 id="gaps">
              Indian Sellers Have Three Problems Global Tools Don't Solve
            </h2>
            <p>
              The issue isn't that Helium 10 is bad it's that it was designed
              for a different seller in a different market. Three fundamental
              gaps persist regardless of which Helium 10 plan an Indian seller
              uses:
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 12,
                margin: "20px 0 28px",
              }}
            >
              {[
                {
                  n: 1,
                  color: "#EF4444",
                  title: "Platform Gap",
                  body: (
                    <span>
                      Amazon.in, Flipkart are the three marketplaces that matter
                      for Indian sellers. Helium 10 supports Amazon exclusively
                      and even then, its data is optimised for Amazon.com, not
                      Amazon.in. A seller doing ₹1.5 lakh/month on Flipkart gets
                      zero intelligence from Helium 10 for that revenue stream.
                    </span>
                  ),
                },
                {
                  n: 2,
                  color: "#F97316",
                  title: "Data Gap",
                  body: (
                    <span>
                      Helium 10's keyword databases are built primarily on
                      Amazon.com search behaviour. Indian buyers search in
                      Hinglish 'best mobile under 15000', 'mixer grinder 750
                      watt', 'cricket bat for beginners' patterns that
                      US-trained keyword databases significantly underrepresent.
                    </span>
                  ),
                },
                {
                  n: 3,
                  color: "#DB2777",
                  title: "Budget Gap",
                  body: (
                    <span>
                      {/* #6 — "Helium 10's plans start at ₹3,300/month (Starter) and climb to ₹8,300/month (Diamond)" → /compare/insydzvshelium */}
                      <InLink to="/compare/insydzvshelium" color="#db2777">
                        Helium 10's plans start at ₹3,300/month (Starter) and
                        climb to ₹8,300/month (Diamond)
                      </InLink>{" "}
                      before add-ons. For a seller doing ₹5 lakh/month with
                      15–20% margins, spending ₹8,000+/month on a single tool
                      that doesn't cover Flipkart is a difficult calculus.
                    </span>
                  ),
                },
              ].map((g) => (
                <div
                  key={g.n}
                  style={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 46,
                      background: g.color,
                      color: "white",
                      fontWeight: 800,
                      fontSize: 17,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {g.n}
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14.5,
                        color: "#0D1B2A",
                        marginBottom: 5,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {g.title}
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        color: "#64748B",
                        lineHeight: 1.65,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {g.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-amber">
              <div className="box-label">
                Real Seller: Bengaluru Beauty Accessories Seller
              </div>
              <p>
                A Bengaluru-based beauty accessories seller was on Helium 10's
                Platinum plan (₹6,500/month) for eight months. Her top keyword
                showed 45,000 monthly searches in Helium 10's database. Her
                actual Seller Central data showed 8,200 impressions/month for
                the same term on Amazon.in. She was optimising for a number that
                didn't exist in her market.
              </p>
              <p style={{ marginTop: 12 }}>
                After switching to an India-first platform, she identified 11{" "}
                <InLink
                  to="/resources/expert-blog/amazon-seo-tool-india"
                  color="#d97706"
                >
                  Hinglish keyword variants her Helium 10 research had missed
                  entirely
                </InLink>{" "}
                including 'hair curler for beginners' and 'automatic hair curler
                under 500' — both high-intent, high-conversion terms with
                near-zero competition on Amazon.in.{" "}
                <strong>Her organic sales grew 44% in 7 weeks.</strong>
              </p>
            </div>

            <div className="box box-indigo" style={{ padding: "20px 22px" }}>
              <div className="box-label">AI Overview Summary</div>
              <p>
                The{" "}
                <a
                  href="https://insydz.com/pricing"
                  style={{
                    color: "#4F46E5",
                    textDecoration: "underline",
                    textDecorationColor: "#4F46E555",
                    textUnderlineOffset: "3px",
                    fontWeight: 600,
                  }}
                >
                  insydz vs helium 10 india
                </a>{" "}
                comparison comes down to market fit, not feature count. Helium
                10 offers a mature, comprehensive Amazon suite but its data,
                pricing, and platform coverage are optimised for Amazon.com, not
                Amazon.in. Insydz is built specifically for India: Amazon.in
                keyword data including Hinglish patterns, Flipkart coverage,
                WhatsApp-first alerts, and pricing at 60–85% less than Helium
                10.
              </p>
            </div>

            {/* S3 — Feature comparison */}
            <h2 id="comparison">
              {/* #5 — "Feature-by-Feature Comparison: Insydz vs Helium 10" → /compare/insydzvshelium */}
              <InLink to="/compare/insydzvshelium" color="#0d1b2a">
                Feature-by-Feature Comparison: Insydz vs Helium 10
              </InLink>
            </h2>
            <p>
              The following comparison covers every major feature category
              relevant to Indian sellers. Note that "feature parity" is not the
              same as "data parity" a feature that exists in both tools may
              perform very differently when tested against actual Amazon.in
              search behaviour.
            </p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th style={{ width: "34%" }}>Feature</th>
                    <th style={{ width: "33%", background: "#F97316" }}>
                      Insydz
                    </th>
                    <th style={{ width: "33%" }}>Helium 10</th>
                  </tr>
                </thead>
                <tbody>
                  {compRows.map((row, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          fontWeight: 600,
                          color: "#0D1B2A",
                          background: "#F8FAFC",
                        }}
                      >
                        {row.feature}
                      </td>
                      <td
                        style={{
                          background: cellColor(row.insydz),
                          fontFamily: "'Sora',sans-serif",
                          fontSize: 13,
                        }}
                      >
                        {row.insydz}
                      </td>
                      <td
                        style={{
                          background: cellColor(row.h10),
                          fontFamily: "'Sora',sans-serif",
                          fontSize: 13,
                        }}
                      >
                        {row.h10}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="box box-amber">
              <div className="box-label">
                Important Note on "Feature Parity"
              </div>
              <p>
                Both tools list "keyword research" and "rank tracking" as
                features. A surface comparison makes them look equivalent. They
                are not equivalent for Indian sellers the data sources are
                fundamentally different. Always test keyword volume data against
                your own Seller Central impressions before trusting any tool's
                numbers for Amazon.in. If you want to see{" "}
                {/* #37 — "competitor keyword gap analysis" → /features/keyword-rank-tracking */}
                <InLink
                  to="/features/keyword-rank-tracking-feature"
                  color="#d97706"
                >
                  competitor keyword gap analysis
                </InLink>{" "}
                done right for Amazon.in, the difference becomes immediately
                apparent.
              </p>
            </div>

            {/* S4 — Helium 10 strengths */}
            <h2 id="helium-pros">Helium 10: What It Does Genuinely Well</h2>
            <p>
              Before going further Helium 10 earned its reputation for a reason.
              If you're selling on Amazon.com, or running a US-market operation
              from India, the platform is excellent. Here's what it does better
              than almost any alternative:
            </p>

            <BlogImageSection
              imageSrc="/fourteen.png"
              altText="India vs US market fit for Amazon seller tools"
              caption="Indian sellers need tools calibrated for Amazon.in, Flipkart — not Amazon.com"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                margin: "20px 0 28px",
              }}
            >
              {[
                {
                  t: "Cerebro (Reverse ASIN)",
                  tLink: "/compare/insydzvshelium",
                  d: "One of the most powerful reverse ASIN tools available. Enter a competitor's ASIN and it maps every keyword they rank for organically. For Amazon.com sellers, extraordinarily accurate.",
                },
                {
                  t: "Magnet (Keyword Discovery)",
                  tLink: null,
                  d: "Surfaces keyword ideas from a massive US database with strong search volume estimates. Provides a starting framework for Amazon.in even if it misses Hinglish variants.",
                },
                {
                  t: "Frankenstein + Scribbles",
                  tLink: null,
                  d: "Listing builder tools that help structure product listings with keyword-optimised content a genuine productivity tool for sellers managing large catalogues.",
                },
                {
                  t: "Black Box (Product Research)",
                  tLink: null,
                  d: "Category-level demand data and competition analysis for sourcing decisions. For India-specific sourcing, data accuracy drops but the workflow is solid.",
                },
                {
                  t: "Xray (Chrome Extension)",
                  tLink: null,
                  d: "Browser extension that overlays competitor data on Amazon search results. Genuinely useful as a quick research layer for any marketplace.",
                },
              ].map((f) => (
                <div
                  key={f.t}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "16px 18px",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 13.5,
                        color: "#0D1B2A",
                        marginBottom: 4,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {f.tLink ? (
                        <InLink to={f.tLink} color="#0d1b2a">
                          {f.t}
                        </InLink>
                      ) : (
                        f.t
                      )}
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12.5,
                        color: "#64748B",
                        lineHeight: 1.6,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {f.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="verdict-banner">
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Lora',serif",
                  fontSize: 15,
                  color: "#92400E",
                  lineHeight: 1.7,
                }}
                className="dark:text-amber-300"
              >
                <strong>The bottom line on Helium 10:</strong> it's a
                professional-grade tool that justifies its price for US market
                Amazon sellers. For Indian sellers, the feature set is strong —
                but the underlying data isn't calibrated for your market.
              </p>
            </div>

            {/* S5 — Helium 10 gaps */}
            <h2 id="helium-gaps">
              Where Helium 10 Falls Short for Indian Sellers
            </h2>
            <p>
              These aren't edge cases they are the core operational realities of
              running an Amazon.in or Flipkart business in India. Each gap below
              represents a daily business decision that Helium 10 leaves
              underserved.
            </p>

            <div className="mistakes">
              {[
                {
                  n: 1,
                  t: "Amazon.in Data Is an Afterthought, Not a Core Product",
                  b: (
                    <span>
                      Helium 10's keyword databases are built and calibrated on
                      Amazon.com data. Amazon.in was added as an additional
                      marketplace but the data quality gap is significant.
                      Search volumes for Indian keywords are often overstated,
                      understated, or simply absent.
                    </span>
                  ),
                },
                {
                  n: 2,
                  t: "Flipkart Doesn't Exist in Helium 10's World",
                  b: (
                    <span>
                      Flipkart is not a secondary platform in India it is the
                      primary platform for a large segment of tier-2 and tier-3
                      city buyers. A seller doing ₹8 lakh/month across Amazon.in
                      and Flipkart who uses Helium 10 is running half their
                      business completely blind. No keyword data. No price
                      tracking. No rank monitoring.{" "}
                      {/* #30 — "Flipkart keyword intelligence" → /resources/expert-blog/best-competitor-price-tracking-tools-india */}
                      <InLink
                        to="/resources/expert-blog/amazon-competitor-price-tracking-tool"
                        color="#64748b"
                      >
                        Flipkart keyword intelligence
                      </InLink>{" "}
                      matters as much as Amazon.in for most Indian sellers.
                    </span>
                  ),
                },
                {
                  n: 3,
                  t: "WhatsApp vs Email — The Action Rate Gap",
                  b: (
                    <span>
                      Helium 10 alerts are email-based. The average Indian SMB
                      seller checks email 2–3 times a day. They check WhatsApp
                      50+ times. A competitor price drop alert via email at 4 PM
                      may not be acted on until 9 AM the next day.{" "}
                      {/* #36 — "Buy Box has been lost for 17 hours" → /resources/expert-blog/amazon-competitor-price-tracking-tool */}
                      By then, the{" "}
                      <InLink
                        to="/resources/expert-blog/amazon-competitor-price-tracking-tool"
                        color="#64748b"
                      >
                        Buy Box has been lost for 17 hours
                      </InLink>
                      .
                    </span>
                  ),
                },
                {
                  n: 4,
                  t: "Pricing in Dollar Terms, Budget in Rupee Terms",
                  b: (
                    <span>
                      {/* #7 — "Starter plan is ₹3,300/month, Platinum is ₹6,500/month, and Diamond is ₹8,300/month" → /pricing */}
                      <InLink to="/pricing" color="#64748b">
                        Helium 10's Starter plan is ₹3,300/month, Platinum is
                        ₹6,500/month, and Diamond is ₹8,300/month
                      </InLink>
                      . For a seller doing ₹5 lakh/month with a 20% margin (₹1
                      lakh net),{" "}
                      {/* #10 — "6.5% of their entire margin" → /pricing */}
                      spending ₹6,500/month on one tool is{" "}
                      <InLink to="/pricing" color="#64748b">
                        6.5% of their entire margin
                      </InLink>{" "}
                      before ads, warehouse costs, and platform fees.
                    </span>
                  ),
                },
                {
                  n: 5,
                  t: "Hinglish and Regional Search Patterns — Completely Missing",
                  b: (
                    <span>
                      Indian buyers search in a mix of English and Hindi 'best
                      juicer mixer grinder under 3000', 'pressure cooker
                      induction base 5 litre', 'bedsheet king size cotton'.
                      These Hinglish patterns are high-intent, high-conversion
                      queries that Helium 10's US-trained database doesn't
                      surface.
                    </span>
                  ),
                },
              ].map((m) => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body">
                    <strong>{m.t}</strong>
                    <p>{m.b}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* S6 — Insydz differences */}
            <h2 id="insydz-diff">What Insydz Does Differently for India</h2>
            <p>
              Insydz wasn't built by adapting a US tool for the Indian market.
              It was built ground-up with three premises: Indian sellers sell on
              Amazon.in, Flipkart simultaneously; Indian buyers search in
              Hinglish; and{" "}
              {/* #27 — "Indian SMBs cannot justify ₹6,000+/month for a single tool" → /pricing */}
              <InLink to="/pricing" color="#db2777">
                Indian SMBs cannot justify ₹6,000+/month for a single tool
              </InLink>
              .
            </p>

            <BlogImageSection
              imageSrc="/fifteen.png"
              altText="Insydz India-first features Hinglish keywords, WhatsApp alerts, multi-platform coverage"
              caption="Insydz is built ground-up for India Hinglish keyword database, multi-platform coverage, and WhatsApp-first alerts"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 12,
                margin: "20px 0 28px",
              }}
            >
              {[
                {
                  title: "Amazon.in-Native Keyword Data",
                  titleLink: "/solutions/amazon-sellers",
                  body: "Insydz's keyword database is built on actual Amazon.in search behaviour not Amazon.com data retrofitted for India. Hinglish keywords, regional buying patterns, and India-specific search intent are surfaced as first-class data, not afterthoughts.",
                },
                {
                  title: "Flipkart Keyword Intelligence",
                  titleLink: null,
                  /* #22 — "verify platform coverage: does the tool actually track your Flipkart listings" → /solutions/flipkart-sellers */
                  body: "Insydz tracks keyword rankings and provides keyword research for Flipkart alongside Amazon.in. Before you choose any tool, verify platform coverage: does the tool actually track your Flipkart listings or only Amazon.in?",
                  bodyLinkText:
                    "verify platform coverage: does the tool actually track your Flipkart listings",
                  bodyLinkRoute: "/solutions/flipkart-sellers",
                },
                {
                  title: "WhatsApp-First Alerts",
                  titleLink: null,
                  body: "Critical price changes, rank drops, and competitor stock-out opportunities are delivered via WhatsApp within 60 minutes. Not email. Not a dashboard you check once a day. A message that reaches you where you already are.",
                },
                {
                  title: "AI Recommendations in Plain Language",
                  titleLink: null,
                  body: "Rather than showing a dashboard of competitor data and leaving interpretation to the seller, Insydz provides specific, actionable recommendations: 'Competitor A dropped to ₹849 on Flipkart. Recommend adjusting to ₹869 — recovers Buy Box while protecting ₹42 more margin per unit.'",
                },
                {
                  title: "Festive Intelligence Built for India",
                  titleLink: null,
                  body: "Diwali, Big Billion Days, the Great Indian Festival, Republic Day Sale these seasonal peaks drive 3–5x normal demand. Insydz tracks festive demand trends so sellers can plan inventory, pricing, and keyword strategy 4–6 weeks ahead of each event.",
                },
                {
                  title:
                    "Pricing at ₹1,999–2,999/month — with a forever-free plan",
                  titleLink: "/pricing",
                  body: "The Growth plan at ₹1,499/month is the most popular for sellers doing ₹3–20 lakh/month. It costs less per month than what most sellers lose in a single Buy Box loss event.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 10,
                    padding: "16px 18px",
                    display: "flex",
                    gap: 14,
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14.5,
                        color: "#0D1B2A",
                        marginBottom: 4,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {f.titleLink ? (
                        <InLink to={f.titleLink} color="#0d1b2a">
                          {f.title}
                        </InLink>
                      ) : (
                        f.title
                      )}
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        color: "#374151",
                        lineHeight: 1.65,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-pink">
              <div className="box-label">No Aggressive Pitch Here</div>
              <p>
                If you sell exclusively on Amazon.com and your business is
                calibrated for the US market, Helium 10 is probably the right
                tool. If you're an Indian seller doing business on Amazon.in,
                Flipkart, the fit calculus is different.
              </p>
            </div>

            {/* S8 — Pricing */}
            <h2 id="pricing">
              {/* #9 — "Pricing Comparison: The Real Cost of Each Tool for Indian Sellers" → /pricing */}
              <InLink to="/pricing" color="#0d1b2a">
                Pricing Comparison: The Real Cost of Each Tool for Indian
                Sellers
              </InLink>
            </h2>

            <BlogImageSection
              imageSrc="/sixteen.png"
              altText="Insydz vs Helium 10 pricing comparison in Indian Rupees"
              caption="Annual cost comparison: Insydz Growth vs Helium 10 Platinum — ₹60,012 difference per year"
            />

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Plan Tier</th>
                    <th style={{ background: "#F97316" }}>Insydz</th>
                    <th>Helium 10</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row, i) => (
                    <tr key={i} className={row.highlight ? "hl" : ""}>
                      <td style={{ fontWeight: 600 }}>{row.tier}</td>
                      <td style={{ color: "#16A34A", fontWeight: 700 }}>
                        {/* #11 — "Insydz 85% cheaper" (Starter row) */}
                        {row.tier === "Starter" ? (
                          <InLink to="/pricing" color="#16a34a">
                            {row.insydz}
                          </InLink>
                        ) : (
                          row.insydz
                        )}
                      </td>
                      <td>{row.h10}</td>
                      <td>
                        {/* #8 — "₹60,012 saved/year" → /pricing */}
                        {row.highlight ? (
                          <InLink to="/pricing" color="#f97316">
                            <span className="bg">{row.diff}</span>
                          </InLink>
                        ) : (
                          <span className="bg">{row.diff}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              For a seller doing ₹10 lakh/month with 20% margins, the{" "}
              {/* #6 alt — pricing link */}
              <InLink to="/pricing" color="#db2777">
                ₹6,500/month Helium 10 Platinum plan
              </InLink>{" "}
              represents <strong>3.25% of their total margin</strong>. The
              equivalent{" "}
              {/* #24 alt — "Growth plan at ₹1,499/month" → /pricing */}
              <InLink to="/pricing" color="#db2777">
                Insydz Growth plan at ₹1,499/month
              </InLink>{" "}
              represents <strong>0.75% of the same margin</strong> and covers
              Flipkart in addition to Amazon.in.
            </p>
            <p>
              The {/* #8 alt — "₹5,001 monthly difference" → /pricing */}
              <InLink to="/pricing" color="#db2777">
                ₹5,001 monthly difference
              </InLink>{" "}
              buys three things: Flipkart intelligence, and WhatsApp alerts. For
              most Indian growth sellers, that's not a marginal upgrade it's the
              core of their competitive intelligence.
            </p>

            {/* S7 — Mistakes */}
            <h2 id="mistakes">
              5 Mistakes Indian Sellers Make When Choosing Between These Tools
            </h2>
            <div className="mistakes">
              {[
                {
                  n: 1,
                  t: "Choosing by Brand Recognition Instead of Market Fit",
                  b: (
                    <span>
                      Helium 10 is the most-referenced Amazon seller tool in
                      YouTube tutorials and agency recommendations but the vast
                      majority of that content is produced for Amazon.com
                      sellers. The right question isn't 'which tool is more
                      famous?' it's 'which tool has accurate data for Amazon.in
                      and Flipkart?'
                    </span>
                  ),
                },
                {
                  n: 2,
                  t: "Comparing Feature Lists Without Checking Data Sources",
                  b: (
                    <span>
                      Both tools list 'keyword research' and 'rank tracking' as
                      features. A feature comparison table will show them as
                      equivalent. They are not because the data sources are
                      different. Helium 10's keyword volume for Amazon.in is an
                      extrapolation from Amazon.com data.{" "}
                      {/* #37 alt — "competitor keyword gap analysis" → /features/keyword-rank-tracking */}
                      Run a{" "}
                      <InLink
                        to="/features/keyword-rank-tracking-feature"
                        color="#64748b"
                      >
                        competitor keyword gap analysis
                      </InLink>{" "}
                      on the same product in both tools the gap in Hinglish
                      keyword coverage will be self-evident.
                    </span>
                  ),
                },
                {
                  n: 3,
                  t: "Ignoring the Flipkart Revenue Stream When Calculating ROI",
                  b: (
                    <span>
                      Indian sellers often evaluate tools exclusively in the
                      context of their Amazon business. But Flipkart typically
                      contributes 25–50% of a multi-platform seller's total
                      revenue. A tool that delivers zero Flipkart intelligence
                      is only serving half your business.
                    </span>
                  ),
                },
                {
                  n: 4,
                  t: "Underestimating the Cost of Slow Alerts",
                  b: (
                    <span>
                      The difference between an email alert and a WhatsApp alert
                      isn't just convenience — it's response time with direct
                      revenue value. A Buy Box loss on a product doing
                      ₹2,000/day costs approximately ₹1,400–1,600 for every
                      8-hour delay. A tool that costs ₹3,000 less per month but
                      results in 4-hour slower alerts may not actually be
                      cheaper.
                    </span>
                  ),
                },
                {
                  n: 5,
                  t: "Treating the Decision as Permanent",
                  b: (
                    <span>
                      The best approach for sellers who are genuinely uncertain:
                      test Insydz's{" "}
                      {/* #26 — "forever-free plan for sellers who want to start before committing" → /pricing */}
                      <InLink to="/pricing" color="#64748b">
                        forever-free plan
                      </InLink>{" "}
                      for sellers who want to start before committin and Helium
                      10's trial simultaneously on the same product and the same
                      set of keywords and compare data quality directly. The
                      keyword volumes, Hinglish terms surfaced, and platform
                      coverage will make the decision obvious within 2 weeks.
                    </span>
                  ),
                },
              ].map((m) => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body">
                    <strong>{m.t}</strong>
                    <p>{m.b}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mid-cta">
              <div>
                <h3>Compare Both Tools Free No Risk</h3>
                <p>
                  Insydz forever-free plan. Helium 10 30-day trial. Test on the
                  same keywords. The data speaks.
                </p>
              </div>
              <button
                onClick={() => router.push("/login")}
                style={{
                  flexShrink: 0,
                  background: "#F97316",
                  color: "white",
                  padding: "12px 26px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14.5,
                  whiteSpace: "nowrap" as const,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                Try Insydz Free →
              </button>
            </div>

            {/* S9 — Who should use what */}
            <h2 id="who-uses">Who Should Use Which Tool?</h2>
            <div className="choose-grid">
              <div
                className="choose-card"
                style={{ background: "#F1F5F9", border: "1px solid #CBD5E1" }}
              >
                <h3 style={{ color: "#0D1B2A" }}> Choose Helium 10 if:</h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 6,
                  }}
                >
                  {[
                    "You sell primarily on Amazon.com (US market) or other non-Indian Amazon marketplaces",
                    "You're an Indian seller with a large Amazon.in catalogue (50+ ASINs) and ₹50 lakh+/month revenue where the per-unit cost becomes negligible",
                    "You have a dedicated analytics team that can work with imperfect Amazon.in data and supplement it",
                    "You've tested Helium 10's Amazon.in data against your Seller Central data and found it accurate enough for your category",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        marginBottom: 0,
                        color: "#374151",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 7,
                        listStyle: "none",
                      }}
                    >
                      <span
                        style={{
                          color: "#6B7280",
                          fontWeight: 800,
                          fontSize: 12,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="choose-card"
                style={{ background: "#F0FDF4", border: "2px solid #86EFAC" }}
              >
                <h3 style={{ color: "#15803D" }}> Choose Insydz if:</h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 6,
                  }}
                >
                  {[
                    "You sell on Amazon.in and Flipkart and want one tool covering all three",
                    "You're in the ₹2–30 lakh/month revenue range where tool cost is a real budget consideration",
                    "You need Hinglish keyword data that reflects how Indian buyers actually search",
                    "You want alerts on WhatsApp not dashboards you remember to check",
                    "You want to start with a free plan before committing any budget",
                    "You want AI recommendations in plain language, not just raw data to interpret yourself",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        marginBottom: 0,
                        color: "#374151",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 7,
                      }}
                    >
                      <span
                        style={{
                          color: "#16A34A",
                          fontWeight: 800,
                          fontSize: 12,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <BlogImageSection
              imageSrc="/seventeen.png"
              altText="How to evaluate Amazon tools for India before signup, trial period, monthly ROI check"
              caption="A structured 3-phase evaluation framework for Indian sellers choosing between Amazon intelligence tools"
            />

            <h3>
              <a
                href="https://insydz.com/"
                style={{
                  color: "#0d1b2a",
                  textDecoration: "underline",
                  textDecorationColor: "#0d1b2a55",
                  textUnderlineOffset: "3px",
                  fontWeight: 600,
                }}
              >
                amazon seller tools india
              </a>
              : Best Practices for Evaluation
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 12,
                margin: "16px 0 28px",
              }}
            >
              {[
                {
                  /* #21 — "Before You Sign Up (One-Time, 30 Minutes)" → /features */
                  phase: "Before You Sign Up (One-Time, 30 Minutes)",
                  phaseLink: "/features",
                  items: [
                    "List the 5 highest-volume keywords for your top product on Amazon.in and Flipkart separately",
                    "Run both tools' keyword research on those same terms compare search volumes against your Seller Central impressions data",
                    "Check whether the tool surfaces Hinglish variants of your keywords",
                    /* #22 alt inline text */
                    "Verify platform coverage: does the tool actually track your Flipkart listings or only Amazon.in?",
                  ],
                },
                {
                  phase: "First 2 Weeks (Trial Period)",
                  phaseLink: null,
                  items: [
                    "Track rank for the same 10 keywords on both platforms simultaneously compare accuracy",
                    "Trigger a competitor price change test: manually lower a non-critical product's price by 10% and measure alert time",
                    "Compare keyword gap analysis results: which keywords does each tool identify that the other misses?",
                  ],
                },
                {
                  phase: "Monthly (Ongoing ROI Check)",
                  phaseLink: null,
                  items: [
                    "Calculate tool cost as a percentage of net margin (not revenue) it should be under 2%",
                    "Measure revenue impact: responding faster to competitor pricing? Ranking for more keywords? Organic traffic increasing?",
                    "Track Flipkart revenue separately if a tool doesn't cover it, that revenue stream is unoptimised by definition",
                  ],
                },
              ].map((section, si) => (
                <div
                  key={si}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#0D1B2A",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#0D1B2A",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {si + 1}
                    </div>
                    {section.phaseLink ? (
                      <InLink to={section.phaseLink} color="#0d1b2a">
                        {section.phase}
                      </InLink>
                    ) : (
                      section.phase
                    )}
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column" as const,
                      gap: 6,
                    }}
                  >
                    {section.items.map((item, ii) => (
                      <li
                        key={ii}
                        style={{
                          fontFamily: "'Sora',sans-serif",
                          fontSize: 13,
                          color: "#475569",
                          lineHeight: 1.6,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            color: "#F97316",
                            fontWeight: 800,
                            fontSize: 12,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          ✓
                        </span>
                        {/* #25 — link "tool cost as a percentage of net margin" */}
                        {ii === 0 && si === 2 ? (
                          <span>
                            <InLink to="/pricing" color="#475569">
                              Calculate tool cost as a percentage of net margin
                            </InLink>{" "}
                            (not revenue) it should be under 2%
                          </span>
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* S10 — FAQ */}
            <h2 id="faq">Frequently Asked Questions</h2>
            <div style={{ marginTop: 20 }}>
              {/* FAQ 0 — Is Helium 10 worth it */}
              <div className={`faq-item${openFaq === 0 ? " open" : ""}`}>
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                >
                  Is Helium 10 worth it for Amazon India sellers?
                  <span className={`faq-icon${openFaq === 0 ? " open" : ""}`}>
                    +
                  </span>
                </div>
                {openFaq === 0 && (
                  <div className="faq-a">
                    <p>
                      For most Indian sellers, Helium 10 is not worth the cost
                      for Amazon.in. The platform's keyword data, search volume
                      estimates, and product research metrics are calibrated
                      primarily for Amazon.com, not Amazon.in. Indian sellers
                      who test Helium 10's keyword volumes against their actual
                      Seller Central impressions data consistently find
                      significant discrepancies. Additionally, Helium 10 offers
                      no Flipkart coverage which is a fundamental gap for
                      sellers who earn 25–50% of their revenue on those
                      platforms. At {/* #6 inline FAQ */}
                      <InLink to="/pricing" color="#64748b">
                        ₹3,300–8,300/month
                      </InLink>
                      , the cost-to-value ratio for India-market selling is
                      difficult to justify when{" "}
                      {/* #13 — "India-first alternatives exist at ₹1,999–2,999/month" → /pricing */}
                      <InLink to="/pricing" color="#64748b">
                        India-first alternatives exist at ₹1,999–2,999/month
                      </InLink>
                      .
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 1 — Does Helium 10 work for Flipkart */}
              <div className={`faq-item${openFaq === 1 ? " open" : ""}`}>
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                >
                  Does Helium 10 work for Flipkart?
                  <span className={`faq-icon${openFaq === 1 ? " open" : ""}`}>
                    +
                  </span>
                </div>
                {openFaq === 1 && (
                  <div className="faq-a">
                    <p>
                      No. Helium 10 does not support Flipkart in any capacity no
                      keyword research, no rank tracking, no competitor price
                      monitoring, no listing analytics. It is exclusively an
                      Amazon tool, and within Amazon, its primary data quality
                      is for Amazon.com rather than Amazon.in. Indian sellers
                      who operate on Flipkart which includes the majority of
                      sellers with significant tier-2 and tier-3 city revenue
                      need a separate solution for Flipkart intelligence.{" "}
                      {/* #32 — "keyword research and price tracking across Amazon.in and Flipkart" → /resources/expert-blog/amazon-competitor-price-tracking-tool */}
                      <InLink
                        to="/resources/expert-blog/amazon-competitor-price-tracking-tool"
                        color="#64748b"
                      >
                        Insydz covers keyword research and price tracking across
                        Amazon.in and Flipkart
                      </InLink>{" "}
                      within a single platform.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 2 — Best Helium 10 alternative */}
              <div className={`faq-item${openFaq === 2 ? " open" : ""}`}>
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                >
                  {/* #12 — question heading itself as anchor */}
                  <InLink to="/compare/insydzvshelium" color="#0d1b2a">
                    What is the best Helium 10 alternative for Indian sellers?
                  </InLink>
                  <span className={`faq-icon${openFaq === 2 ? " open" : ""}`}>
                    +
                  </span>
                </div>
                {openFaq === 2 && (
                  <div className="faq-a">
                    <p>
                      For Indian sellers specifically, the best{" "}
                      <a
                        href="https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india"
                        style={{
                          color: "#64748B",
                          textDecoration: "underline",
                          textDecorationColor: "#64748B55",
                          textUnderlineOffset: "3px",
                          fontWeight: 600,
                        }}
                      >
                        helium 10 alternative india
                      </a>{" "}
                      is a platform that covers Amazon.in natively (with
                      Hinglish keyword support), includes Flipkart tracking,
                      sends WhatsApp alerts, and fits within the {/* #13 alt */}
                      <InLink to="/pricing" color="#64748b">
                        ₹1,999–2,999/month budget range
                      </InLink>{" "}
                      that Indian SMBs can justify. Insydz is currently the only
                      platform that meets all four of these criteria
                      simultaneously — with a{" "}
                      {/* #28 — "no-time-limit free plan" → /pricing */}
                      <InLink to="/pricing" color="#64748b">
                        no-time-limit free plan
                      </InLink>{" "}
                      for sellers who want to experience the value before
                      committing.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 3 — Can I use both */}
              <div className={`faq-item${openFaq === 3 ? " open" : ""}`}>
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                >
                  Can I use both Insydz and Helium 10 together?
                  <span className={`faq-icon${openFaq === 3 ? " open" : ""}`}>
                    +
                  </span>
                </div>
                {openFaq === 3 && (
                  <div className="faq-a">
                    <p>
                      Technically yes some high-volume Indian sellers (₹50
                      lakh+/month) run both tools simultaneously, using Helium
                      10 for its Amazon.com database depth when researching
                      global keyword trends and Insydz for India-specific
                      intelligence, Flipkart tracking, and WhatsApp alerts. For
                      sellers below ₹20–30 lakh/month, running both tools
                      simultaneously adds ₹5,000–10,000/month in combined tool
                      costs difficult to justify when Insydz covers the
                      India-market use cases comprehensively at a fraction of
                      the cost.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 4 — Keyword research */}
              <div className={`faq-item${openFaq === 4 ? " open" : ""}`}>
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                >
                  How does Insydz compare to Helium 10 for keyword research on
                  Amazon.in?
                  <span className={`faq-icon${openFaq === 4 ? " open" : ""}`}>
                    +
                  </span>
                </div>
                {openFaq === 4 && (
                  <div className="faq-a">
                    <p>
                      Insydz's keyword research is built on Amazon.in search
                      behaviour the actual queries Indian buyers enter on
                      Amazon.in, including Hinglish variants and regional search
                      patterns. Helium 10's keyword data for Amazon.in is
                      largely extrapolated from its Amazon.com database, which
                      means it misses significant Hinglish keyword volume and
                      tends to produce inaccurate search volume estimates for
                      Indian-specific queries. In direct tests on the same
                      product category, Insydz typically surfaces 30–50% more
                      India-relevant keyword variations than Helium 10
                      particularly for Hinglish and regional search terms.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 5 — Free plan */}
              <div className={`faq-item${openFaq === 5 ? " open" : ""}`}>
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                >
                  Is there a free plan available on either platform?
                  <span className={`faq-icon${openFaq === 5 ? " open" : ""}`}>
                    +
                  </span>
                </div>
                {openFaq === 5 && (
                  <div className="faq-a">
                    <p>
                      Insydz offers a{" "}
                      {/* #26 alt — "forever-free plan" → /pricing */}
                      <InLink to="/pricing" color="#64748b">
                        forever-free plan for sellers who want to start before
                        committing
                      </InLink>{" "}
                      no credit card required, no time limit — that gives Indian
                      sellers entry-level access to{" "}
                      {/* #32 alt — "keyword research and price tracking across Amazon.in and Flipkart" → Blog 1 */}
                      <InLink
                        to="/resources/expert-blog/amazon-competitor-price-tracking-tool"
                        color="#64748b"
                      >
                        keyword research and price tracking across Amazon.in and
                        Flipkart
                      </InLink>
                      . Helium 10 offers a 30-day free trial on its paid plans.
                      After the trial ends, Helium 10 requires a paid
                      subscription starting at ₹3,300/month. For sellers who
                      want to evaluate the tools before committing budget,
                      Insydz's {/* #28 alt — "no-time-limit free plan" */}
                      <InLink to="/pricing" color="#64748b">
                        no-time-limit free plan
                      </InLink>{" "}
                      allows a more thorough evaluation without the clock
                      pressure of a 30-day window.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Related */}
            <div
              style={{
                marginTop: 56,
                paddingTop: 36,
                borderTop: "2px solid #E2E8F0",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0D1B2A",
                  margin: "0 0 22px",
                  border: "none",
                  padding: 0,
                  fontFamily: "'Sora',sans-serif",
                }}
                className="dark:text-white"
              >
                Related Guides
              </h2>
              <div className="related-grid">
                {(
                  [
                    {
                      cardTitle:
                        "Best Competitor Price Tracking Tools for Indian Sellers: The 2026 Guide",
                      tag: "Price Tracking",
                      image: "/Best_Price_Tracer-blog2_image1.png?v=1",
                      r: "/resources/expert-blog/best-competitor-price-tracking-tools-india",
                    },
                    {
                      cardTitle:
                        "Amazon SEO Tool India: The Complete 2026 Guide for Indian Sellers",
                      tag: "SEO Guide",
                      image: "/Amazon_SEO_Tool-Blog3_image1.png",
                      r: "/resources/expert-blog/amazon-seo-tool-india",
                    },
                    {
                      cardTitle:
                        "How to Rank on Page 1 of Amazon India in 2026",
                      tag: "Ranking Guide",
                      image: "/twenty three.png",
                      r: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
                    },
                  ] as {
                    cardTitle: string;
                    tag: string;
                    image: string;
                    r: string;
                  }[]
                ).map((rc) => (
                  <div
                    key={rc.cardTitle}
                    className="rel-card"
                    onClick={() => router.push(rc.r)}
                  >
                    <div className="rel-thumb">
                      <img src={rc.image} alt={rc.cardTitle} />
                    </div>
                    <div className="rel-body">
                      <div className="rel-tag">{rc.tag}</div>
                      <div className="rel-title">{rc.cardTitle}</div>
                    </div>
                  </div>
                ))}
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
          The Right Tool Isn't the Most Expensive One. <br /> It's the Most
          Accurate One for Your Market.
        </h2>
        <p
          className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg"
          style={{
            fontFamily: "'Lora', serif",
            maxWidth: 520,
            margin: "0 auto 24px",
          }}
        >
          Every rupee spent on a tool that ignores Flipkart, returns inaccurate
          Amazon.in data, and sends alerts to an email inbox — is a rupee
          working against you.
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
          {["Hinglish keyword data", "Amazon.in + Flipkart", "Free plan"].map(
            (t) => (
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
            ),
          )}
        </div>
        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
        >
          See Your Keyword Gaps Free →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          Hinglish keyword data · Amazon.in + Flipkart · Free plan
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
