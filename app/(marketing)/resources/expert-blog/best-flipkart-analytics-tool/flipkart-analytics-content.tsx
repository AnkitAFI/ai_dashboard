"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  MessageCircle,
  Package,
  Trophy,
  Zap,
  BookOpen,
  ChevronDown,
  ShoppingBag,
  Store,
  Briefcase,
  Users,
  Bell,
  Code,
  Globe,
  Flame,
  Presentation,
  LayoutGrid,
} from "lucide-react";
import BlogImageSection from "../components/BlogImageSection";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import Breadcrumb from "../components/Breadcrumb";
import HeroSection from "../components/HeroSection";
import SectionQA from "../components/SectionQA";
import FAQ from "../components/FAQ";
import ContentSection from "../components/ContentSection";

export const dynamic = "force-static";

// ─── Schema ──────────────────────────────────────────────────────────────────
const schemaData = {
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
      "@type": "Article",
      "@id": "https://insydz.com/best-flipkart-analytics-tool#article",
      headline:
        "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)",
      datePublished: "2026-01-15",
      dateModified: "2026-03-01",
      author: { "@type": "Organization", name: "Vikrant Singh" },
      publisher: { "@id": "https://insydz.com/#organization" },
      keywords:
        "best Flipkart analytics tool, Flipkart seller software comparison, Flipkart tracking tools India, marketplace intelligence, competitor insights, pricing automation, seller dashboard",
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/best-flipkart-analytics-tool#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the best Flipkart analytics tool for India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The best Flipkart analytics tool for Indian sellers is one built natively for Flipkart marketplace data — not adapted from an Amazon-focused global tool.",
          },
        },
        {
          "@type": "Question",
          name: "How is Flipkart analytics different from Amazon.in analytics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Flipkart has a distinct search algorithm, unique buyer intent patterns and pricing dynamics that differ from Amazon.in.",
          },
        },
      ],
    },
  ],
};

// ─── Navigation ───────────────────────────────────────────────────────────────
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
      name: "Contact Us",
      icon: <Users className="w-4 h-4" />,
      route: "/about/contact-us",
    },
  ],
};

// ─── TOC ─────────────────────────────────────────────────────────────────────
const TOC = [
  { id: "what-is", label: "What is a Flipkart Analytics Tool?" },
  { id: "why-critical", label: "Why Flipkart Analytics is Critical" },
  { id: "how-it-works", label: "How Marketplace Intelligence Works" },
  { id: "types", label: "7 Flipkart Data Types to Track" },
  { id: "mistakes", label: "5 Mistakes Indian Sellers Make" },
  { id: "comparison", label: "Methods Compared" },
  { id: "weekly-model", label: "Weekly Execution Model" },
  { id: "best-tools", label: "Best Tools for India 2026" },
  { id: "faq", label: "Frequently Asked Questions" },
];

const analyticsPrep = {
  title: "Using Analytics to Prepare for Flipkart's Big Billion Days",

  intro:
    "Big Billion Days is one of the highest-stakes windows on the Indian ecommerce calendar — and one of the easiest to get caught flat-footed in, if you're only checking your dashboard reactively. A few ways analytics changes the outcome:",

  bullets: [
    {
      title: "● Spot category demand rising early.",
      description:
        "Festive trend signals often show demand climbing two to three weeks out, giving you time to adjust stock levels before the rush instead of during it.",
    },
    {
      title: "● Watch competitor pricing daily in the run-up.",
      description:
        "Many sellers drop prices aggressively a few days before the sale starts — missing that shift means losing rank at exactly the moment traffic is highest.",
    },
    {
      title: "● Track review sentiment heading into the sale.",
      description:
        "A product carrying an unresolved review issue into peak traffic will convert worse right when volume matters most.",
    },
  ],

  conclusion:
    "Sellers who treat festive prep as a scramble the week before the sale are usually reacting to moves competitors made weeks earlier. Sellers checking analytics daily through the lead-up see those moves as they happen, not after.",
};

const featuresSection = {
  title: "What Features Should You Look For?",

  intro:
    "Whether you use Insydz or evaluate anything else, a proper Flipkart analytics setup should give you:",

  bullets: [
    {
      title: "● Daily competitor price monitoring",
      description: "so undercuts don't sit unnoticed for a week.",
    },
    {
      title: "● Review comparison,",
      description:
        "not just your own review count, so you know where you stand against competitors.",
    },
    {
      title: "● Listing quality scoring",
      description:
        'that flags fixable gaps instead of a vague "optimize your listing" note.',
    },
    {
      title: "● AI-based recommendations",
      description:
        "that suggest a next action instead of just showing a chart.",
    },
    {
      title: "● WhatsApp alerts",
      description:
        "for anything urgent, since checking a dashboard once a week is too slow for a price change that happened this morning.",
    },
    {
      title: "● Category and product research tools",
      description:
        "(Market Explorer, Product Research) if you're deciding what to sell next, not just optimizing what you already list.",
    },
  ],

  conclusion:
    "If you're comparing this against your day-to-day seller toolkit more broadly, our Flipkart seller solutions page covers the full picture beyond just analytics.",
};

const whoThisIsForSection = {
  title: "Who This Is For",

  intro:
    "A Flipkart analytics tool isn't only useful once you're already managing a large catalog. In practice, it tends to help three kinds of sellers in different ways:",

  bullets: [
    {
      title: "● Solo sellers",
      description:
        "running a handful of products, who don't have the time to manually check ten competitor listings every day and need alerts to do that checking for them.",
    },
    {
      title: "● Small teams",
      description:
        "managing a growing catalog, where keeping track of every product's rank and review trend from memory stops being realistic somewhere past 15–20 SKUs.",
    },
    {
      title: "● Sellers preparing to scale,",
      description:
        "who'd rather build the habit of data-backed decisions before adding more products than retrofit it later once the catalog is too large to check by hand.",
    },
  ],
};

const faqs = [
  {
    q: "Is a Flipkart analytics tool only useful for large sellers?",
    a: "No — the sellers who benefit most are often smaller ones managing everything themselves, since they're the ones least able to check competitor prices and reviews manually every day.",
  },
  {
    q: "Does this replace Flipkart's own seller dashboard?",
    a: "No. It works alongside it — Flipkart's dashboard shows your own numbers; an analytics tool shows you the competitive picture around those numbers.",
  },
  {
    q: "How often should I check my analytics dashboard?",
    a: "Daily, if possible — most of what matters (a price change, a new 1-star review, a rank drop) is only actionable in the first day or two after it happens.",
  },
  {
    q: "Can I track keyword rank with this tool too?",
    a: "Yes, at a basic level — but if keyword strategy is your main focus, our dedicated keyword research guide goes much deeper into that specifically.",
  },
  {
    q: "Do I need to be a large seller for this to be worth it?",
    a: "No — solo sellers and small teams often see the most value, since they're the ones with the least spare time to manually check competitor prices and reviews every day.",
  },
  {
    q: "How does this help specifically around big sale events like Big Billion Days?",
    a: "Festive trend tracking flags rising category demand weeks before a sale event, giving you time to adjust stock and pricing rather than reacting once the sale has already started and competitors have already moved.",
  },
];

// ─── Image component ──────────────────────────────────────────────────────────
// ─── Inline link helper ──────────────────────────────────────────────────────
const InLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        router.push(to);
        window.scrollTo(0, 0);
      }}
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
};

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
    <div style={{ margin: "24px 0 0" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f1f5f9",
          minHeight: 200,
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BestFlipkartAnalyticsTool() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("what-is");
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [tocOpen, setTocOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const id = "insydz-fkat-schema";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(schemaData);
      document.head.appendChild(s);
    }
    document.title =
      "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)";
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const fn = () => {
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
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
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
          className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
        >
          {label}
          <ChevronDown
            className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`}
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
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
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
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @keyframes imgShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── Read progress ── */
        .read-progress { position:fixed; top:64px; left:0; height:3px; background:linear-gradient(90deg,#7C3AED,#C026D3); z-index:200; transition:width .1s linear; border-radius:0 2px 2px 0; pointer-events:none; }
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        @media(min-width:1024px){ .toc-sidebar { top:80px; padding:22px; } }
        .dark .toc-sidebar { background:#111827; border-color:#1f2937; }

        /* ── Mobile TOC toggle ── */
        .mobile-toc-btn { display:flex; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; color:#111; cursor:pointer; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .dark .mobile-toc-btn { background:#111827; border-color:#1f2937; color:#f9fafb; }
        @media(min-width:768px){ .mobile-toc-btn { display:none; } }
        .mobile-toc-panel { display:none; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin-bottom:20px; }
        .dark .mobile-toc-panel { background:#111827; border-color:#1f2937; }
        .mobile-toc-panel.open { display:block; }

        /* ── Article body typography ── */
        .article-body { font-family:'Lora',serif; font-size:15px; line-height:1.78; color:#1E293B; }
        @media(min-width:640px){ .article-body { font-size:15.5px; } }
        @media(min-width:1024px){ .article-body { font-size:16px; } }
        .dark .article-body { color:#d1d5db; }

        .article-body h2 { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; color:#0D1B2A; margin:40px 0 12px; padding-bottom:10px; border-bottom:2px solid #e5e7eb; letter-spacing:-.3px; line-height:1.3; scroll-margin-top:72px; }
        @media(min-width:640px){ .article-body h2 { font-size:20px; margin:48px 0 14px; scroll-margin-top:80px; } }
        @media(min-width:1024px){ .article-body h2 { font-size:22px; margin:52px 0 14px; scroll-margin-top:84px; } }
        .dark .article-body h2 { color:#f9fafb; border-color:#1f2937; }
        .article-body h2:first-child { margin-top:0; }

        .article-body h3 { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:#0D1B2A; margin:24px 0 8px; letter-spacing:-.2px; scroll-margin-top:72px; }
        @media(min-width:640px){ .article-body h3 { font-size:16px; margin:28px 0 10px; } }
        @media(min-width:1024px){ .article-body h3 { font-size:17px; margin:32px 0 10px; scroll-margin-top:84px; } }
        .dark .article-body h3 { color:#f3f4f6; }

        .article-body p { margin-bottom:14px; font-size:14.5px; line-height:1.78; }
        @media(min-width:640px){ .article-body p { font-size:15px; margin-bottom:16px; } }
        .article-body strong { font-weight:700; color:#0D1B2A; }
        .dark .article-body strong { color:#f9fafb; }
        .article-body a { color:#7C3AED; font-weight:500; text-decoration:underline; }

        .art-img-cap { font-size:11px; color:#94A3B8; font-style:italic; text-align:center; margin-bottom:24px; padding:6px 10px; }
        @media(min-width:640px){ .art-img-cap { font-size:12px; margin-bottom:28px; padding:8px 12px; } }

        /* ── Callout boxes ── */
        .box { border-radius:10px; padding:16px 18px; margin:18px 0; }
        @media(min-width:640px){ .box { padding:20px 22px; margin:24px 0; } }
        .box-label { font-size:10px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .box-label { font-size:11px; } }
        .box p { margin:0; font-size:13.5px; line-height:1.72; font-family:'Lora',serif; }
        @media(min-width:640px){ .box p { font-size:14.5px; } }
        .box-purple   { background:#F5F3FF; border-left:4px solid #7C3AED; }
        .box-purple   .box-label { color:#7C3AED; }
        .box-purple   p { color:#4C1D95; }
        .box-amber    { background:#FFFBEB; border-left:4px solid #D97706; }
        .box-amber    .box-label { color:#D97706; }
        .box-amber    p { color:#78350F; }
        .box-green    { background:#F0FDF4; border-left:4px solid #16A34A; }
        .box-green    .box-label { color:#16A34A; }
        .box-green    p { color:#064E3B; }
        .box-red      { background:#FEF2F2; border-left:4px solid #EF4444; }
        .box-red      .box-label { color:#991B1B; }
        .box-red      p { color:#7F1D1D; }
        .box-indigo   { background:#EEF2FF; border:1px solid #C7D2FE; border-radius:10px; }
        .box-indigo   .box-label { color:#4F46E5; }
        .dark .box-purple  { background:#2e1065; border-color:#7c3aed; }
        .dark .box-amber   { background:#1c1507; border-color:#78350f; }
        .dark .box-green   { background:#052e16; border-color:#166534; }
        .dark .box-red     { background:#450a0a; border-color:#991b1b; }
        .dark .box-indigo  { background:#1e1b4b; border-color:#3730a3; }

        /* ── Internal link box ── */
        .int-link { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:8px; padding:12px 16px; margin:18px 0; display:flex; gap:10px; align-items:flex-start; }
        .int-link p { font-size:13px; color:#4C1D95; margin:0; line-height:1.55; font-family:'Sora',sans-serif; }
        .int-link a { color:#7C3AED; font-weight:600; text-decoration:underline; }
        @media(min-width:640px){ .int-link { padding:14px 18px; } .int-link p { font-size:14px; } }

        /* ── Steps ── */
        .steps { display:flex; flex-direction:column; gap:10px; margin:16px 0 22px; }
        @media(min-width:640px){ .steps { gap:12px; margin:20px 0 28px; } }
        .step { display:flex; gap:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px 16px; }
        @media(min-width:640px){ .step { gap:16px; padding:18px 20px; } }
        .dark .step { background:#111827; border-color:#1f2937; }
        .step-n { flex-shrink:0; width:30px; height:30px; background:#7C3AED; color:white; border-radius:50%; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .step-n { width:34px; height:34px; font-size:15px; } }
        .step-body strong { display:block; font-size:13px; color:#0D1B2A; margin-bottom:3px; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .step-body strong { font-size:14.5px; } }
        .dark .step-body strong { color:#f9fafb; }
        .step-body p { margin:0; font-size:12.5px; color:#64748B; line-height:1.6; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .step-body p { font-size:13.5px; } }

        /* ── Tables ── */
        .tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.09); margin:18px 0 24px; }
        @media(min-width:640px){ .tbl-wrap { margin:24px 0 32px; } }
        table.dt { width:100%; border-collapse:collapse; font-size:11.5px; font-family:'Sora',sans-serif; min-width:480px; }
        @media(min-width:640px){ table.dt { font-size:13px; min-width:560px; } }
        table.dt thead tr { background:#0D1B2A; }
        table.dt th { padding:10px 12px; color:white; font-weight:700; text-align:left; font-size:10.5px; letter-spacing:.2px; white-space:nowrap; }
        @media(min-width:640px){ table.dt th { padding:13px 16px; font-size:12px; } }
        table.dt tbody tr { border-bottom:1px solid #E2E8F0; transition:background .15s; }
        table.dt tbody tr:nth-child(even) td { background:#F8FAFC; }
        table.dt tbody tr:hover td { background:#F5F3FF; }
        table.dt td { padding:10px 12px; vertical-align:middle; color:#1E293B; font-size:11.5px; }
        @media(min-width:640px){ table.dt td { padding:12px 16px; font-size:13px; } }
        .dark table.dt td { color:#d1d5db; }
        .dark table.dt tbody tr { border-color:#1f2937; }
        .dark table.dt tbody tr:nth-child(even) td { background:#0f172a; }
        table.dt tr.hl td { background:#F5F3FF!important; border-left:3px solid #7C3AED; }
        table.dt tr.hl td:first-child { font-weight:700; color:#7C3AED; }
        .badge-tag { display:inline-block; padding:2px 9px; border-radius:20px; font-size:.72rem; font-weight:600; white-space:nowrap; font-family:'Sora',sans-serif; }
        .tag-yes         { background:#D1FAE5; color:#065F46; }
        .tag-no          { background:#FEE2E2; color:#991B1B; }
        .tag-partial     { background:#FEF3C7; color:#92400E; }
        .tag-recommended { background:#EDE9FE; color:#5B21B6; }
        .tag-critical    { background:#FEE2E2; color:#991B1B; border:1px solid #FECACA; }
        .tag-important   { background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; }
        .tag-opportunity { background:#D1FAE5; color:#065F46; border:1px solid #A7F3D0; }
        .insydz-col { color:#7C3AED; font-weight:700; }

        /* ── Stat strip ── */
        .stat-strip { display:flex; flex-wrap:wrap; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.07); }
        .dark .stat-strip { border-color:#1f2937; background:#111827; }
        .stat-item { flex:1; min-width:50%; padding:14px 16px; border-right:1px solid #E2E8F0; text-align:center; border-bottom:1px solid #E2E8F0; }
        @media(min-width:640px){ .stat-item { min-width:140px; padding:18px 24px; border-bottom:none; } }
        .dark .stat-item { border-color:#1f2937; }
        .stat-item:last-child { border-right:none; }
        @media(max-width:639px){ .stat-item:nth-child(2){border-right:none} .stat-item:nth-child(3){border-right:1px solid #E2E8F0} .stat-item:nth-child(4){border-right:none;border-bottom:none} .stat-item:nth-child(3){border-bottom:none} }

        /* ── Hero banner ── */
        .hero-banner { background:linear-gradient(135deg,#0F0F1A 0%,#1E1040 60%,#2D1B69 100%); border-radius:12px; padding:32px; margin:0 0 8px; display:grid; grid-template-columns:1fr; gap:24px; align-items:center; position:relative; overflow:hidden; }
        @media(min-width:768px){ .hero-banner { grid-template-columns:1fr 260px; gap:32px; padding:40px; } }
        @media(min-width:1024px){ .hero-banner { padding:48px; gap:40px; } }
        .hero-banner::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 70% 50%,rgba(124,58,237,.18) 0%,transparent 60%); }
        .hb-left { position:relative; z-index:1; }
        .platform-pills { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
        .pill { padding:3px 10px; border-radius:20px; font-size:.68rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; font-family:'Sora',sans-serif; }
        .pill-fk { background:#FFF8F0; color:#F97316; }
        .pill-az { background:#FFF3E0; color:#E67E00; }
        .pill-me { background:#F3E8FF; color:#7C3AED; }
        .hb-left h2 { font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:800; color:white; line-height:1.2; margin-bottom:10px; }
        @media(min-width:640px){ .hb-left h2 { font-size:1.8rem; } }
        @media(min-width:1024px){ .hb-left h2 { font-size:2rem; } }
        .hb-left h2 .accent { color:#F97316; }
        .hb-left p { color:rgba(255,255,255,.65); font-size:.9rem; line-height:1.65; }
        .hb-right { position:relative; z-index:1; display:flex; flex-direction:column; gap:12px; }
        @media(max-width:767px){ .hb-right { display:none; } }
        .metric-card { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:14px 16px; backdrop-filter:blur(8px); }
        .metric-card .mc-label { font-size:.66rem; color:rgba(255,255,255,.5); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin-bottom:4px; font-family:'Sora',sans-serif; }
        .metric-card .mc-value { font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:800; color:white; }
        .metric-card .mc-sub { font-size:.76rem; color:rgba(255,255,255,.6); margin-top:2px; }
        .alert-pill { background:rgba(16,185,129,.15); border:1px solid rgba(16,185,129,.3); border-radius:8px; padding:10px 14px; font-size:.76rem; color:#6EE7B7; font-family:'Sora',sans-serif; }

        /* ── Dashboard mockup ── */
        .dash-mock { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; margin:20px 0; }
        .dark .dash-mock { background:#111827; border-color:#1f2937; }
        .dash-header { background:#0F0F1A; color:white; padding:12px 16px; font-family:'Sora',sans-serif; font-weight:700; font-size:.875rem; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .dash-badge-live { background:#10B981; color:white; font-size:.68rem; padding:2px 8px; border-radius:10px; font-family:'Sora',sans-serif; }
        .dash-badge-plat { background:rgba(255,255,255,.1); color:rgba(255,255,255,.7); font-size:.68rem; padding:2px 8px; border-radius:10px; font-family:'Sora',sans-serif; }
        .dash-body { padding:16px; }
        .dash-metrics { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:14px; }
        @media(min-width:640px){ .dash-metrics { grid-template-columns:repeat(4,1fr); } }
        .dash-m { background:white; border:1px solid #E2E8F0; border-radius:8px; padding:12px; text-align:center; }
        .dark .dash-m { background:#0f172a; border-color:#1f2937; }
        .dash-m .dm-label { font-size:.65rem; color:#94A3B8; margin-bottom:4px; font-family:'Sora',sans-serif; }
        .dash-m .dm-val { font-family:'Sora',sans-serif; font-size:1.4rem; font-weight:800; color:#0D1B2A; }
        .dark .dash-m .dm-val { color:#f9fafb; }
        .dash-m .dm-sub { font-size:.7rem; margin-top:2px; font-family:'Sora',sans-serif; }
        .dash-alert { background:#FEF3C7; border:1px solid #F59E0B; border-radius:8px; padding:10px 14px; font-size:.82rem; color:#78350F; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; font-family:'Sora',sans-serif; }
        .dash-fix-btn { background:#7C3AED; color:white; border:none; padding:5px 12px; border-radius:6px; font-size:.76rem; font-weight:700; cursor:pointer; flex-shrink:0; font-family:'Sora',sans-serif; }

        /* ── Key Takeaways ── */
        .takeaway-box { background:#0D1B2A; border-radius:10px; padding:22px 20px; margin:22px 0; }
        @media(min-width:640px){ .takeaway-box { padding:28px 30px; margin:28px 0; } }
        .takeaway-box h3 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:white; margin:0 0 14px; }
        @media(min-width:640px){ .takeaway-box h3 { font-size:18px; margin:0 0 16px; } }
        .takeaway-item { display:flex; align-items:flex-start; gap:8px; margin-bottom:9px; }
        .takeaway-dot { flex-shrink:0; width:16px; height:16px; border-radius:50%; background:#7C3AED; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:white; margin-top:3px; }
        .takeaway-text { font-family:'Lora',serif; font-size:13px; color:#CBD5E1; line-height:1.6; }
        @media(min-width:640px){ .takeaway-text { font-size:14.5px; } }

        /* ── Mistakes ── */
        .mistakes { display:flex; flex-direction:column; gap:8px; margin:16px 0 22px; }
        .mistake { border:1px solid #E2E8F0; border-radius:10px; display:flex; overflow:hidden; }
        .dark .mistake { border-color:#1f2937; }
        .mistake-n { flex-shrink:0; width:38px; background:#0D1B2A; color:white; font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .mistake-n { width:46px; font-size:17px; } }
        .mistake-body { padding:12px 14px; }
        @media(min-width:640px){ .mistake-body { padding:16px 18px; } }
        .mistake-body strong { display:block; font-size:13px; color:#0D1B2A; margin-bottom:3px; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .mistake-body strong { font-size:14.5px; } }
        .dark .mistake-body strong { color:#f9fafb; }
        .mistake-body p { margin:0; font-size:12px; color:#64748B; line-height:1.65; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .mistake-body p { font-size:13.5px; } }

        /* ── Exec blocks ── */
        .exec-block { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:16px; margin-bottom:12px; }
        @media(min-width:640px){ .exec-block { padding:22px 24px; } }
        .dark .exec-block { background:#111827; border-color:#1f2937; }
        .exec-block h4 { font-family:'Sora',sans-serif; font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:center; gap:8px; color:#0D1B2A; }
        .dark .exec-block h4 { color:#f9fafb; }
        .exec-badge { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:800; color:white; flex-shrink:0; }
        .exec-d { background:#7C3AED; }
        .exec-w { background:#F97316; }
        .exec-m { background:#10B981; }
        .exec-item { font-size:12px; color:#64748B; padding:3px 0; display:flex; align-items:baseline; gap:7px; font-family:'Sora',sans-serif; line-height:1.6; }
        @media(min-width:640px){ .exec-item { font-size:13.5px; } }
        .exec-item::before { content:'✓'; color:#7C3AED; font-weight:700; flex-shrink:0; }

        /* ── Metrics grid ── */
        .metrics { display:grid; grid-template-columns:1fr; gap:10px; margin:16px 0 22px; }
        @media(min-width:480px){ .metrics { grid-template-columns:1fr 1fr; gap:12px; } }
        .metric { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px; display:flex; gap:10px; align-items:flex-start; }
        @media(min-width:640px){ .metric { padding:18px; gap:14px; } }
        .dark .metric { background:#111827; border-color:#1f2937; }
        .metric-icon { flex-shrink:0; width:32px; height:32px; border-radius:8px; background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .metric-t { font-size:12.5px; font-weight:700; color:#0D1B2A; margin-bottom:3px; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .metric-t { font-size:13.5px; } }
        .dark .metric-t { color:#f9fafb; }
        .metric-d { font-size:11.5px; color:#64748B; line-height:1.5; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .metric-d { font-size:12.5px; } }

        /* ── Feature highlights ── */
        .feat-highlight { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px; margin-bottom:10px; display:flex; gap:12px; align-items:flex-start; }
        @media(min-width:640px){ .feat-highlight { padding:18px 20px; gap:14px; } }
        .dark .feat-highlight { background:#111827; border-color:#1f2937; }
        .feat-icon { font-size:1.3rem; flex-shrink:0; margin-top:2px; }
        .feat-highlight h4 { font-family:'Sora',sans-serif; font-weight:700; font-size:.875rem; color:#0D1B2A; margin-bottom:3px; }
        .dark .feat-highlight h4 { color:#f9fafb; }
        .feat-highlight p { font-size:.84rem; color:#64748B; margin:0; line-height:1.6; font-family:'Sora',sans-serif; }

        /* ── Mid CTA ── */
        .mid-cta { background:linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%); border-radius:10px; padding:20px 22px; margin:32px 0; display:flex; flex-direction:column; gap:16px; }
        @media(min-width:640px){ .mid-cta { padding:24px 28px; flex-direction:row; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; } }
        .mid-cta h3 { font-size:16px; font-weight:800; color:white; margin-bottom:5px; letter-spacing:-.2px; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .mid-cta h3 { font-size:18px; } }
        .mid-cta p { color:#94A3B8; font-size:12.5px; margin:0; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .mid-cta p { font-size:13.5px; } }

        /* ── FAQ ── */
        .faq-item { border:1px solid #E2E8F0; border-radius:10px; margin-bottom:8px; overflow:hidden; background:#fff; transition:border-color .2s; }
        .dark .faq-item { background:#111827; border-color:#1f2937; }
        .faq-item.open { border-color:#7C3AED; }
        .faq-q { padding:14px 16px; font-size:13px; font-weight:700; color:#0D1B2A; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; user-select:none; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .faq-q { padding:16px 20px; font-size:14.5px; gap:12px; } }
        .dark .faq-q { color:#f9fafb; }
        .faq-q:hover { background:#F8FAFC; }
        .dark .faq-q:hover { background:#1f2937; }
        .faq-icon { flex-shrink:0; width:20px; height:20px; border-radius:50%; background:#EDE9FE; color:#7C3AED; display:flex; align-items:center; justify-content:center; font-size:14px; transition:transform .2s; }
        .faq-icon.open { transform:rotate(45deg); background:#7C3AED; color:white; }
        .faq-a { padding:0 16px 14px; font-size:13px; color:#64748B; line-height:1.75; font-family:'Lora',serif; }
        @media(min-width:640px){ .faq-a { padding:0 20px 16px; font-size:14px; } }
        .dark .faq-a { color:#9ca3af; }

        /* ── TOC links ── */
        .toc-link { display:block; font-size:11.5px; font-weight:500; color:#64748B; padding:5px 8px; border-radius:6px; cursor:pointer; border:none; background:none; text-align:left; width:100%; transition:all .15s; margin-bottom:2px; line-height:1.4; border-left:2px solid transparent; }
        @media(min-width:1024px){ .toc-link { font-size:12.5px; padding:6px 10px; } }
        .toc-link:hover, .toc-link.active { color:#7C3AED; background:#F5F3FF; border-left-color:#7C3AED; }
        .dark .toc-link { color:#9ca3af; }
        .dark .toc-link:hover, .dark .toc-link.active { background:#2e1065; color:#a78bfa; }

        // /* ── Related grid ── */
        // .related-grid { display:grid; grid-template-columns:1fr; gap:12px; }
        // @media(min-width:480px){ .related-grid { grid-template-columns:1fr 1fr; gap:14px; } }
        // @media(min-width:768px){ .related-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
        // .rel-card { border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; cursor:pointer; transition:box-shadow .2s,transform .2s; background:#fff; }
        // .dark .rel-card { background:#111827; border-color:#1f2937; }
        // .rel-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); transform:translateY(-2px); }
        // .rel-thumb { width:100%; aspect-ratio:2.4/1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        // .rel-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        // .rel-body { padding:12px; }
        // .rel-tag { font-size:10px; font-weight:700; color:#7C3AED; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; font-family:'Sora',sans-serif; }
        // .rel-title { font-size:12px; font-weight:700; color:#0D1B2A; line-height:1.4; font-family:'Sora',sans-serif; }
        // @media(min-width:640px){ .rel-title { font-size:13px; } }
        // .dark .rel-title { color:#f9fafb; }

        /* ── Related grid ── */
        .related-grid { display:grid; grid-template-columns:1fr; gap:12px; }
        @media(min-width:480px){ .related-grid { grid-template-columns:1fr 1fr; gap:14px; } }
        @media(min-width:768px){ .related-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
        .rel-card { border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; cursor:pointer; transition:box-shadow .2s,transform .2s; background:#fff; text-decoration:none !important; color:inherit; display:block; }
        .dark .rel-card { background:#111827; border-color:#1f2937; }
        .rel-card:hover, 
        .rel-card:focus, 
        .rel-card:visited { text-decoration:none !important; color:inherit; }
        .rel-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); transform:translateY(-2px); }
        .rel-thumb { width:100%; aspect-ratio:2.4/1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .rel-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .rel-body { padding:12px; }
        .rel-tag { font-size:10px; font-weight:700; color:#7C3AED; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; font-family:'Sora',sans-serif; }
        .rel-title { font-size:12px; font-weight:700; color:#0D1B2A; line-height:1.4; font-family:'Sora',sans-serif; text-decoration:none; }
        @media(min-width:640px){ .rel-title { font-size:13px; } }
        .dark .rel-title { color:#f9fafb; }

        /* ── Final CTA ── */
        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

        /* ── Breadcrumb ── */
        .breadcrumb { background:#F8FAFC; border-bottom:1px solid #E2E8F0; padding:8px 0; }
        .dark .breadcrumb { background:#0f172a; border-color:#1f2937; }
        .breadcrumb-inner { max-width:1240px; margin:0 auto; padding:0 16px; display:flex; align-items:center; gap:4px; font-size:11.5px; color:#94A3B8; flex-wrap:wrap; }
        @media(min-width:640px){ .breadcrumb-inner { padding:0 20px; gap:6px; font-size:12.5px; } }

        /* ── Article hero ── */
        .article-hero { max-width:1240px; margin:0 auto; padding:28px 16px 0; }
        @media(min-width:640px){ .article-hero { padding:36px 20px 0; } }
        @media(min-width:1024px){ .article-hero { padding:48px 24px 0; } }

        /* ── Sidebar CTA ── */
        .sidebar-cta-title { font-family:'Sora',sans-serif; font-size:14px; font-weight:800; color:white; margin-bottom:8px; line-height:1.35; }
        @media(min-width:1024px){ .sidebar-cta-title { font-size:16px; } }
        .sidebar-cta-body { font-size:11.5px; color:#94A3B8; margin-bottom:14px; line-height:1.6; font-family:'Sora',sans-serif; }

        body { overflow-x:hidden; }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Best Flipkart Analytics Tools India (2026)" },
        ]}
      />

      <HeroSection
        // resolvedTheme={resolvedTheme}
        badgeText="Flipkart Analytics Tool"
        title={
          <>
            Best{" "}
            <span style={{ color: "#2563EB" }}>Flipkart Analytics Tool</span>{" "}
            for <br />
            Indian Sellers (2026)
          </>
        }
        description={
          <>
            Stop flying blind on Flipkart. The right analytics tool surfaces
            which competitor keywords are stealing your rank, which SKUs are
            losing the Buy Box, and exactly what to fix before the next Big
            Billion Days window closes on you.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="March 2026"
        readTime="14 min read"
        bgColor={{ light: "#EFF6FF", dark: "#0a1628" }}
        highlightColor="#2563EB"
      />

      {/* Stat strip */}
      <div className="article-hero">
        <div className="stat-strip" style={{ marginBottom: 24 }}>
          {[
            [
              "71%",
              "Flipkart Purchases Start From a Search Not a Homepage Browse",
            ],
            [
              "₹42K/mo",
              "Avg. Monthly Revenue Lost to Poor Marketplace Visibility",
            ],
            [
              "4–6×",
              "Traffic Increase With Proper Competitor Keyword Tracking",
            ],
            [
              "Top 3",
              "Search Positions Capture 58% of All Flipkart Category Clicks",
            ],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(20px,4vw,26px)",
                  fontWeight: 800,
                  color: "#7C3AED",
                  fontFamily: "'Sora',sans-serif",
                  lineHeight: 1,
                }}
              >
                {num}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(10px,2vw,11.5px)",
                  color: "#64748B",
                  marginTop: 4,
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

      {/* ── KEY TAKEAWAYS ─────────────────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px 28px" }}
        className="sm:px-5 lg:px-6"
      >
        <BlogImageSection
          imageSrc="/Best-Flipkart-Analytics-Tool.png"
          altText="Flipkart Analytics Dashboard with Competitor Tracking and Price Intelligence"
          caption="Insydz Flipkart intelligence surfaces competitor keyword gaps, rank
          positions, and pricing automation opportunities across Flipkart and
          Amazon.in simultaneously."
        />

        <div className="takeaway-box">
          <h3>Key Takeaways</h3>
          {[
            "A Flipkart analytics tool tracks competitor pricing, review sentiment, listing quality, and keyword rank in one dashboard — so you stop finding out about problems days after they've already cost you sales.",
            "Sellers who check this data daily catch price undercuts and rank drops while there's still time to act, instead of noticing them a week later in a sales dip.",
            "One seller using daily rank tracking caught a product's slide out of the top search results and, after fixing a flagged listing issue, brought it back from rank #31 to rank #6 in about five weeks.",
          ].map((t, i) => (
            <div className="takeaway-item" key={i}>
              <div className="takeaway-dot">✓</div>
              <div className="takeaway-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ARTICLE LAYOUT ────────────────────────────────────────────────────── */}
      <div className="article-layout">
        {/* SIDEBAR */}
        <aside className="toc-sidebar">
          <h4
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#94A3B8",
              marginBottom: 12,
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
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <button
            className="mobile-toc-btn"
            onClick={() => setTocOpen(!tocOpen)}
          >
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
            {TOC.map((t) => (
              <button
                key={t.id}
                className="toc-link"
                style={{ display: "block", marginBottom: 3 }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            {/* S1: What is */}
            <h2 id="what-is">What is a Flipkart Analytics Tool?</h2>
            <p>
              A Flipkart analytics tool pulls together the data you'd otherwise
              have to check manually across dozens of product pages every day
              competitor prices, review changes, keyword rank, and listing
              health into one dashboard. Instead of opening ten competitor
              listings one by one, you see what changed overnight in a single
              view.
            </p>

            {/* S2: Why Critical */}
            <h2 id="why-critical">
              Why Do Flipkart Sellers Need This in 2026?
            </h2>
            <p>
              Flipkart's marketplace moves fast, and most of what costs sellers
              money happens quietly: <br /> <br /> • A competitor drops their
              price by ₹30 and takes your rank position before you notice.{" "}
              <br /> • A product picks up a run of 1–2 star reviews that quietly
              drags down conversion. <br /> • A listing's search visibility
              slips because a competitor optimized their title or images. <br />{" "}
              • A festive demand spike passes by unnoticed because nobody was
              tracking category trends that week. <br /> <br />
              None of these show up clearly until the sales report already
              reflects the damage. An analytics tool exists to catch them while
              there's still time to react.
            </p>

            {/* S3: How it works */}
            <h2 id="how-it-works">
              What Does a Flipkart Analytics Tool Actually Track?
            </h2>
            <p>
              A tool worth using should cover these layers, all built into
              Insydz:
            </p>

            <div className="steps">
              {[
                {
                  n: 1,
                  t: "Competitor price tracking (Price Comparison)",
                  d: "see when competitor prices move, so you can react the same day instead of the same month. A ₹20–30 undercut rarely announces itself; if you're not checking daily, a competitor can sit at a lower price for a full week before it shows up as a dip in your own sales. Daily tracking turns that week-long blind spot into a same-day fix.",
                },
                {
                  n: 2,
                  t: "Review sentiment (Review Comparison)",
                  d: "get an early read on how your reviews compare to competitors', not just your own star rating in isolation. A 4.2-star rating can look perfectly fine on its own, but if every competitor in your category sits at 4.5 and above, you're losing conversion you'd never spot from your own dashboard alone.",
                },
                {
                  n: 3,
                  t: "Listing quality (Listing Audit)",
                  d: "flag gaps in your title, images, or description before they quietly cost you rank. A missing attribute or a low-resolution image is often invisible to the seller who wrote the listing, but it's exactly what Flipkart's ranking signals pick up on.",
                },
                {
                  n: 4,
                  t: "Festive and category demand (Festive Trend Intelligence)",
                  d: "spot rising demand in a category early enough to stock and price for it. Category demand for things like festive décor or gifting items can start climbing two to three weeks before a sale event — sellers watching for it get a real head start on stock and pricing that latecomers don't.",
                },
                {
                  n: 5,
                  t: "Keyword and rank movement",
                  d: "a lighter check-in here; if you want the full breakdown of how to track and improve Flipkart keyword rank, see our complete keyword research guide.",
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

            <ContentSection
              title={analyticsPrep.title}
              intro={analyticsPrep.intro}
              bullets={analyticsPrep.bullets}
              conclusion={analyticsPrep.conclusion}
              // accentColor="#7B2FBE"
            />

            <ContentSection
              title={featuresSection.title}
              intro={featuresSection.intro}
              bullets={featuresSection.bullets}
              conclusion={featuresSection.conclusion}
            />

            <ContentSection
              title={whoThisIsForSection.title}
              intro={whoThisIsForSection.intro}
              bullets={whoThisIsForSection.bullets}
            />

            {/* S5: Mistakes */}
            <h2 id="mistakes">
              Common Mistakes Sellers Make Without Analytics
            </h2>
            <div className="mistakes">
              {[
                {
                  n: 1,
                  t: "Reacting to price drops late",
                  p: "By the time a sales dip shows up in your weekly report, a competitor's undercut has usually been live for days.",
                },
                {
                  n: 2,
                  t: "Ignoring review sentiment until it's a pattern",
                  p: "A handful of critical reviews left unaddressed can shift buyer trust before you've even noticed the trend.",
                },
                {
                  n: 3,
                  t: "Missing festive demand windows",
                  p: "Category demand for things like seasonal accessories or gifting items often spikes with only a short lead time to prepare.",
                },
                {
                  n: 4,
                  t: "Optimizing listings by guesswork",
                  p: "Without a listing audit, sellers often polish the wrong section of a page while the real gap a missing keyword in the title, say goes unfixed.",
                },
              ].map((m) => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body">
                    <strong>{m.t}</strong>
                    <p>{m.p}</p>
                  </div>
                </div>
              ))}
            </div>

            <SectionQA
              title="A Real Example"
              paragraph1="One Insydz seller noticed a top-selling product had quietly slipped out of Flipkart's visible search results, dropping to around rank #31. Using the listing audit and rank tracking together, they identified a fixable gap in the product's listing quality and adjusted their pricing to stay competitive. Within about five weeks, the same product had climbed back to rank #6 — without any paid promotion, just by acting on what the dashboard flagged early."
              // resolvedTheme={resolvedTheme}
            />

            <div id="s9">
              <SectionQA
                title="Frequently Asked Questions: Flipkart Analytics Tool"
                // resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#2563EB" faqs={faqs} />

            {/* Related */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 28,
                borderTop: "2px solid #E2E8F0",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(16px,3vw,20px)",
                  fontWeight: 800,
                  color: "#0D1B2A",
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
                  href="/resources/expert-blog/flipkart-keyword-research-tool"
                  className="rel-card"
                  title="Flipkart keyword research for Indian sellers"
                >
                  <div className="rel-thumb">
                    <img
                      src="/Flipkart Keyword Research Tool.png"
                      alt="Flipkart Keyword Research Guide"
                    />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Keyword Research</div>
                    <div className="rel-title">
                      Flipkart Keyword Research for Indian Sellers: Complete
                      2026 Guide
                    </div>
                  </div>
                </Link>
                <Link
                  href="/resources/expert-blog/insydz-vs-helium-10-india"
                  className="rel-card"
                  title="Insydz vs Helium 10 for Indian sellers"
                >
                  <div className="rel-thumb">
                    <img
                      src="/Insydz-vs-Helium-10.png"
                      alt="Insydz vs Helium 10 comparison"
                    />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Compare</div>
                    <div className="rel-title">
                      Insydz vs Helium 10: Which is the Right Tool for Indian
                      Sellers?
                    </div>
                  </div>
                </Link>
                <Link
                  href="/resources/expert-blog/amazon-competitor-price-tracking-tool"
                  className="rel-card"
                  title="Flipkart pricing automation strategy"
                >
                  <div className="rel-thumb">
                    <img
                      src="/Amazon Competitor Price Tracking Tool India.png"
                      alt="Flipkart Pricing Automation Strategy"
                    />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Pricing Strategy</div>
                    <div className="rel-title">
                      Flipkart Pricing Automation: How to Win the SmartBuy Badge
                      in 2026
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </article>
        </main>
      </div>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <div className="final-cta-block">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3"
          style={{ fontFamily: "'Sora',sans-serif" }}
        >
          Flipkart's Best Sellers Know Something You Don't — Yet.
        </h2>
        <p
          className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg"
          style={{
            fontFamily: "'Lora', serif",
            maxWidth: 520,
            margin: "0 auto 24px",
          }}
        >
          Insydz gives you the AI-powered rank tracking, keyword gaps, and
          WhatsApp alerts built exclusively for Flipkart India.
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
            "Flipkart rank tracking",
            "WhatsApp gap alerts",
            "Amazon.in also covered",
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
          <Zap className="w-5 h-5 flex-shrink-0 inline mr-2" />
          Get My Flipkart Gap Report →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          No setup · Live in minutes · India-only intelligence
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
