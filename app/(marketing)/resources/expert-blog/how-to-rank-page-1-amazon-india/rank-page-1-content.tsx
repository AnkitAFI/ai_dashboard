"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Video,
  FileText,
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
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Flame,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

// ─── Navigation data ───────────────────────────────────────────────────────────
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
        textDecorationColor: "rgba(249, 115, 22, 0.3)",
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

// ─── TOC ──────────────────────────────────────────────────────────────────────
const TOC = [
  { id: "s1", label: "What Does Page 1 Ranking Mean?" },
  { id: "s2", label: "Why Page 1 Matters More Than You Think" },
  { id: "s3", label: "How the A9 Algorithm Works" },
  { id: "s4", label: "6 Core Ranking Factors Explained" },
  { id: "s5", label: "5 Critical Mistakes to Avoid" },
  { id: "s6", label: "4-Phase Page 1 Execution Plan" },
  { id: "s7", label: "Best Tools for Indian Sellers" },
  { id: "s8", label: "Key Takeaways" },
  { id: "s9", label: "FAQ" },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How long does it take to rank on page 1 of Amazon India?",
    a: "For new listings in moderately competitive categories, well-optimised listings typically reach page 1 for long-tail keywords within 3–6 weeks, and for primary keywords within 6–12 weeks assuming consistent sales velocity and an optimised listing from the start. Highly competitive categories (electronics, fashion, kitchen) may take 12–20 weeks for primary keyword page 1 positions. Long-tail keywords, regardless of category, typically rank faster and are the recommended entry point for sellers newer to SEO.",
  },
  {
    q: "Does lowering my price help me rank higher on Amazon.in?",
    a: "Partially Amazon factors in price competitiveness, but it's not the dominant ranking signal. Drastically reducing your price to rank faster erodes margin without a proportional ranking benefit. The better lever is improving conversion rate through listing quality — better images, stronger title, more compelling bullet points. A product priced 15% above the category median with a 14% CVR will outrank a product priced at the median with a 7% CVR.",
  },
  {
    q: (
      <>
        What is the most important part of listing optimization tips for Amazon
        for Indian sellers?
      </>
    ),
    a: "The product title and backend search terms together have the highest impact on ranking on Amazon India. The title determines which searches Amazon considers you relevant for your primary keyword must appear in the first 80 characters. Backend search terms (250 bytes) are the single biggest untapped opportunity for most Indian sellers the majority leave them blank or populated with duplicates. Filling them correctly with Hinglish variants, long-tail phrases, and competitor brand names (where permitted) can unlock significant additional organic visibility with no visible listing change.",
  },
  {
    q: "How many keywords should I target in my Amazon listing?",
    a: "Focus on 1 primary keyword in your title, 3–5 secondary keywords spread across bullet points, and 10–20 long-tail keywords in your backend search terms. Total keyword count matters less than selection quality 15 high-intent, accurately-matched keywords will outperform 50 loosely related ones. Keyword stuffing in the title reduces CTR, which feeds back as a negative ranking signal. Aim for natural language in the title with your primary keyword placed prominently in the first 80 characters.",
  },
  {
    q: "Can I rank on page 1 without running paid ads on Amazon India?",
    a: "Yes. But it takes longer. Organic ranking relies on accumulating sales velocity and conversion signals over time. Paid ads accelerate this by driving early sales that signal to the A9 algorithm. For sellers with limited budgets, focus on listing optimisation first, then run a small targeted Sponsored Products campaign on your top 3 keywords once the listing is ready. Organic ranking is more sustainable long-term once achieved, it costs nothing to maintain compared to the ongoing cost of paid placement.",
  },
];

// ─── ArticleImg ───────────────────────────────────────────────────────────────
interface ArticleImgProps {
  src: string;
  alt: string;
  caption?: string;
}
function ArticleImg({ src, alt, caption }: ArticleImgProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className="article-img-wrap">
      {!loaded && <div className="img-shimmer" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "auto",
          display: loaded ? "block" : "none",
        }}
      />
      {caption && <figcaption className="img-caption">{caption}</figcaption>}
    </figure>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HowToRankPage1AmazonIndia() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const toggleMobileMenu = (name: string) =>
    setMobileActiveMenu((prev) => (prev === name ? null : name));

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
      accent === "orange"
        ? "text-orange-600 dark:text-orange-400"
        : "text-purple-600 dark:text-purple-400";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (accent === "orange" ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : accentCls}`}
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
                className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 group ${dropHoverCls}`}
              >
                <span
                  className={`${iconCls} group-hover:scale-110 transition-transform`}
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes imgShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .read-progress { position:fixed; top:80px; left:0; height:3px; background:linear-gradient(90deg,#f97316,#ef4444); z-index:200; transition:width .1s linear; border-radius:0 2px 2px 0; }

       .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        @media(max-width:768px){ .toc-sidebar { display:none; } }

        .mobile-toc-btn { display:none; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px 18px; font-family:'Sora',sans-serif; font-size:14px; font-weight:600; color:#111; cursor:pointer; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .dark .mobile-toc-btn { background:#111827; border-color:#1f2937; color:#f9fafb; }
        @media(max-width:768px){ .mobile-toc-btn { display:flex; } }
        .mobile-toc-panel { display:none; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:24px; }
        .dark .mobile-toc-panel { background:#111827; border-color:#1f2937; }
        .mobile-toc-panel.open { display:block; }

        .article-body { font-family:'Lora',serif; font-size:clamp(15px,2vw,17px); line-height:1.8; color:#374151; }
        .dark .article-body { color:#d1d5db; }
        .article-body h2 { font-family:'Sora',sans-serif; font-size:clamp(20px,3vw,26px); font-weight:800; color:#111; letter-spacing:-.4px; margin:52px 0 16px; line-height:1.25; scroll-margin-top:100px; border-bottom:2px solid #e5e7eb; padding-bottom:12px; }
        .dark .article-body h2 { color:#f9fafb; border-color:#1f2937; }
        .article-body h2:first-child { margin-top:0; }
        .article-body h3 { font-family:'Sora',sans-serif; font-size:clamp(15px,2vw,18px); font-weight:700; color:#111; margin:32px 0 10px; scroll-margin-top:100px; }
        .dark .article-body h3 { color:#f3f4f6; }
        .article-body p { margin-bottom:20px; }
        .article-body ul,.article-body ol { padding-left:22px; margin-bottom:20px; }
        .article-body li { margin-bottom:8px; }
        .article-body li::marker { color:#f97316; }
        .article-body strong { font-weight:700; color:#111; }
        .dark .article-body strong { color:#f9fafb; }

        /* Callouts */
        .callout { border-radius:12px; padding:18px 20px; margin:28px 0; }
        .callout.teal   { background:#f0fdfa; border:1px solid #99f6e4; border-left:4px solid #0d9488; }
        .callout.warn   { background:#fffbeb; border:1px solid #fcd34d; border-left:4px solid #d97706; }
        .callout.pro    { background:#f0fdf4; border:1px solid #86efac; border-left:4px solid #16a34a; }
        .callout.pink   { background:#fdf2f8; border-left:4px solid #db2777; }
        .callout.indigo { background:#eef2ff; border:1px solid #c7d2fe; border-radius:10px; }
        .dark .callout.teal  { background:#042f2e; border-color:#134e4a; }
        .dark .callout.warn  { background:#1c1507; border-color:#78350f; }
        .dark .callout.pro   { background:#052e16; border-color:#166534; }
        .dark .callout.pink  { background:#500724; border-color:#9d174d; }
        .dark .callout.indigo{ background:#1e1b4b; border-color:#3730a3; }
        .callout-label { font-family:'Sora',sans-serif; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
        .callout.teal  .callout-label { color:#0d9488; }
        .callout.warn  .callout-label { color:#d97706; }
        .callout.pro   .callout-label { color:#16a34a; }
        .callout.pink  .callout-label { color:#db2777; }
        .callout.indigo .callout-label { color:#4f46e5; }
        .callout-text { font-family:'Lora',serif; font-size:15px; color:#374151; line-height:1.72; }
        .dark .callout-text { color:#d1d5db; }

        /* Table */
        .dt-wrap { overflow-x:auto; margin:24px 0; border-radius:12px; border:1px solid #e5e7eb; box-shadow:0 4px 16px rgba(0,0,0,.09); }
        .dark .dt-wrap { border-color:#1f2937; }
        table.dt { width:100%; border-collapse:collapse; font-family:'Sora',sans-serif; font-size:13px; min-width:520px; }
        table.dt th { background:#0d1b2a; color:white; padding:12px 16px; text-align:left; font-size:11px; letter-spacing:.5px; text-transform:uppercase; }
        table.dt td { padding:12px 16px; border-bottom:1px solid #e5e7eb; color:#374151; vertical-align:middle; }
        .dark table.dt td { border-color:#1f2937; color:#d1d5db; }
        table.dt tr:last-child td { border-bottom:none; }
        table.dt tr:nth-child(even) td { background:#f8fafc; }
        .dark table.dt tr:nth-child(even) td { background:#0f172a; }
        table.dt tr:hover td { background:#fff7ed; }
        .bg { background:#dcfce7; color:#15803d; font-weight:700; padding:3px 10px; border-radius:20px; font-size:11px; white-space:nowrap; }
        .bo { background:#fff7ed; color:#ea580c; font-weight:700; padding:3px 10px; border-radius:20px; font-size:11px; white-space:nowrap; }
        .br { background:#fef2f2; color:#dc2626; font-weight:700; padding:3px 10px; border-radius:20px; font-size:11px; white-space:nowrap; }
        .bb { background:#dbeafe; color:#1e40af; font-weight:700; padding:3px 10px; border-radius:20px; font-size:11px; white-space:nowrap; }
        .ba { background:#fef3c7; color:#92400e; font-weight:700; padding:3px 10px; border-radius:20px; font-size:11px; white-space:nowrap; }

        /* Mistakes */
        .mistake-card { display:flex; gap:0; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:12px; }
        .dark .mistake-card { border-color:#1f2937; }
        .mistake-num { flex-shrink:0; width:52px; background:#0d1b2a; color:white; font-family:'Sora',sans-serif; font-size:20px; font-weight:800; display:flex; align-items:center; justify-content:center; }
        .mistake-body { padding:16px 20px; }
        .mistake-body strong { display:block; font-family:'Sora',sans-serif; font-size:14px; font-weight:700; color:#111; margin-bottom:5px; }
        .dark .mistake-body strong { color:#f9fafb; }
        .mistake-body p { font-family:'Sora',sans-serif; font-size:13.5px; color:#6b7280; line-height:1.65; margin:0; }
        .dark .mistake-body p { color:#9ca3af; }

        /* Phase cards */
        .phase-card { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:16px; }
        .dark .phase-card { border-color:#1f2937; }
        .phase-hd { display:flex; align-items:center; gap:14px; padding:14px 18px; background:#f8fafc; border-bottom:1px solid #e5e7eb; }
        .dark .phase-hd { background:#111827; border-color:#1f2937; }
        .phase-num { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:white; flex-shrink:0; }
        .ph1 { background:linear-gradient(135deg,#EC4899,#7C3AED); }
        .ph2 { background:linear-gradient(135deg,#F59E0B,#EF4444); }
        .ph3 { background:linear-gradient(135deg,#0D9488,#2563EB); }
        .ph4 { background:linear-gradient(135deg,#7C3AED,#4F46E5); }
        .phase-hd-title { font-family:'Sora',sans-serif; font-size:14.5px; font-weight:700; color:#111; }
        .dark .phase-hd-title { color:#f9fafb; }
        .phase-hd-sub { font-family:'Sora',sans-serif; font-size:12.5px; color:#6b7280; margin-top:2px; }
        .dark .phase-hd-sub { color:#9ca3af; }
        .phase-body { padding:16px 18px; }
        .phase-body ul { list-style:none; padding:0; margin:0; }
        .phase-body li { display:flex; align-items:flex-start; gap:10px; font-family:'Lora',serif; font-size:14px; color:#374151; line-height:1.65; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #f1f5f9; }
        .dark .phase-body li { color:#d1d5db; border-color:#1f2937; }
        .phase-body li:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }
        .phase-arrow { color:#f97316; font-weight:800; flex-shrink:0; font-size:12px; margin-top:3px; }

        /* Metrics */
        .metrics-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0 28px; }
        @media(max-width:480px){ .metrics-grid { grid-template-columns:1fr; } }
        .metric-card { background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:18px 20px; transition:box-shadow .2s; }
        .dark .metric-card { background:#111827; border-color:#1f2937; }
        .metric-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); }
        .metric-num { display:block; font-family:'Sora',sans-serif; font-size:20px; font-weight:800; color:#f97316; line-height:1; margin-bottom:6px; }
        .metric-lbl { display:block; font-family:'Sora',sans-serif; font-size:13px; color:#6b7280; line-height:1.5; }
        .dark .metric-lbl { color:#9ca3af; }

        /* Inline CTA */
        .inline-cta { background:linear-gradient(135deg,#0d1b2a 0%,#162032 100%); border-radius:16px; padding:clamp(20px,4vw,28px) clamp(16px,4vw,32px); margin:40px 0; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; box-shadow:0 8px 32px rgba(0,0,0,.12); }
        .inline-cta h4 { font-family:'Sora',sans-serif; font-size:17px; font-weight:800; color:white; margin-bottom:6px; }
        .inline-cta p  { font-family:'Sora',sans-serif; font-size:13.5px; color:#94a3b8; margin:0; line-height:1.6; }

        /* FAQ */
        .faq-item { border:1px solid #e5e7eb; border-radius:12px; margin-bottom:8px; overflow:hidden; background:#fff; transition:border-color .2s, box-shadow .2s; }
        .dark .faq-item { background:#111827; border-color:#1f2937; }
        .faq-item:hover { box-shadow:0 1px 6px rgba(0,0,0,.07); }
        .faq-item.open { border-color:#f97316; }
        .faq-q { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; cursor:pointer; font-family:'Sora',sans-serif; font-size:14.5px; font-weight:700; color:#111; gap:12px; user-select:none; }
        .dark .faq-q { color:#f9fafb; }
        .faq-q:hover { background:#f8fafc; }
        .dark .faq-q:hover { background:#1f2937; }
        .faq-icon { flex-shrink:0; width:22px; height:22px; background:#fff7ed; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#f97316; font-size:16px; transition:transform .2s; }
        .faq-icon.open { transform:rotate(45deg); background:#f97316; color:white; }
        .faq-a { font-family:'Lora',serif; font-size:14px; line-height:1.75; color:#64748b; padding:0 20px 16px; }
        .dark .faq-a { color:#9ca3af; }

        /* Images */
        .article-img-wrap { margin:28px 0 8px; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb; background:#f9fafb; box-shadow:0 4px 20px rgba(0,0,0,.06); }
        .dark .article-img-wrap { border-color:#1f2937; background:#111827; }
        .img-shimmer { height:300px; background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%); background-size:400% 100%; animation:imgShimmer 1.6s ease infinite; }
        .img-caption { padding:10px 16px 12px; font-family:'Sora',sans-serif; font-size:12px; color:#9ca3af; line-height:1.5; border-top:1px solid #e5e7eb; background:#f9fafb; font-style:italic; text-align:center; }
        .dark .img-caption { background:#111827; border-color:#1f2937; }

        /* Blog image (full-width, no height cap) */
        .blog-img-wrap { margin:28px 0 0; border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.12); }
        .blog-img-wrap img { width:100%; display:block; }

        /* Stat strip */
        .stat-strip { display:flex; flex-wrap:wrap; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; margin-top:32px; box-shadow:0 1px 3px rgba(0,0,0,.07); background:#fff; }
        .dark .stat-strip { border-color:#1f2937; background:#111827; }
        .stat-item { flex:1; min-width:140px; padding:18px 24px; text-align:center; border-right:1px solid #e5e7eb; }
        .dark .stat-item { border-color:#1f2937; }
        .stat-item:last-child { border-right:none; }
        @media(max-width:580px){ .stat-item { min-width:50%; border-bottom:1px solid #e5e7eb; } }

        /* Hero */
        .article-hero { background:#fff; border-bottom:1px solid #e5e7eb; padding:clamp(32px,5vw,56px) clamp(16px,4vw,32px) 0; }
        .dark .article-hero { background:#0f172a; border-color:#1f2937; }
        .hero-inner { max-width:820px; margin:0 auto; padding-bottom:40px; }

        /* Takeaway */
        .takeaway-box { background:#0d1b2a; border-radius:16px; padding:28px 30px; margin:28px 0; }
        .takeaway-box h3 { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; color:white; margin:0 0 16px; display:flex; align-items:center; gap:10px; }
        .takeaway-item { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; }
        .takeaway-dot { flex-shrink:0; width:18px; height:18px; border-radius:50%; background:#f97316; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:white; margin-top:3px; }
        .takeaway-text { font-family:'Lora',serif; font-size:14.5px; color:#cbd5e1; line-height:1.6; }

        /* Related */
        .related-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:20px; }
        @media(max-width:768px){ .related-grid { grid-template-columns:1fr 1fr; } }
        @media(max-width:540px){ .related-grid { grid-template-columns:1fr; } }
        .related-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; cursor:pointer; transition:all .2s; }
        .dark .related-card { background:#111827; border-color:#1f2937; }
        .related-card:hover { border-color:#f97316; box-shadow:0 4px 16px rgba(249,115,22,.12); transform:translateY(-2px); }
        .related-thumb { width:100%; aspect-ratio:2.4/1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .related-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .related-body { padding:14px; }
        .related-tag { font-size:10.5px; font-weight:700; color:#f97316; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
        .related-title { font-size:13px; font-weight:700; color:#0d1b2a; line-height:1.4; font-family:'Sora',sans-serif; }
        .dark .related-title { color:#f9fafb; }

        /* Final CTA */
        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding:clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

        /* TOC link */
        .toc-link { display:block; font-size:12.5px; font-weight:500; color:#6b7280; padding:6px 10px; border-radius:8px; cursor:pointer; border:none; background:none; text-align:left; width:100%; transition:all .15s; margin-bottom:2px; line-height:1.4; border-left:2px solid transparent; }
        .toc-link:hover { background:#fff7ed; color:#ea580c; }
        .toc-link.active { background:#fff7ed; color:#ea580c; font-weight:700; border-left-color:#f97316; padding-left:8px; }
        .dark .toc-link { color:#9ca3af; }
        .dark .toc-link:hover,.dark .toc-link.active { background:#1c0a00; color:#fb923c; }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ══════════ HERO ═════════════════════════════════════════════════════ */}
      <section className="article-hero" style={{ paddingTop: 100 }}>
        <div
          className="hero-inner"
          style={{ marginLeft: "150px", marginRight: "auto" }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
            <button
              onClick={() => router.push("/")}
              className="hover:text-orange-500 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/resources/expert-blog")}
              className="hover:text-orange-500 transition-colors"
            >
              Blog
            </button>
            <span>/</span>
            <span className="text-orange-500 font-medium">
              How to Rank on Page 1
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Amazon India Ranking Guide
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white mb-5">
            How to{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Rank on Page 1
            </span>{" "}
            of Amazon India: The Complete Guide for Sellers (2026)
          </h1>

          <p
            className="text-sm md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-7"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Learn exactly how to rank on page 1 of Amazon India using the A9
            algorithm, keyword optimization &amp; competitor intelligence. An
            actionable 4-phase guide for Indian sellers.
          </p>

          <div className="flex flex-wrap items-center gap-4 pb-7 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <strong
                className="text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors cursor-pointer"
                onClick={() => router.push("/author/vikrant-singh")}
              >
                Vikrant Singh
              </strong>
            </div>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span>
              <strong className="text-gray-700 dark:text-gray-300">
                February 2026
              </strong>
            </span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <strong className="text-gray-700 dark:text-gray-300">
                15 min read
              </strong>
            </div>
          </div>

          <div className="stat-strip" style={{ width: "140%" }}>
            {[
              [
                "70%",
                "of Amazon.in clicks go to page 1 — page 2 gets just 15%",
              ],
              [
                "10x",
                "more daily organic sales: page 1 vs page 3 for the same keyword",
              ],
              ["40%", "more active Amazon.in sellers over the past 3 years"],
              [
                "6–12 wks",
                "to reach page 1 for primary keywords with optimised listing",
              ],
            ].map(([num, lbl]) => (
              <div className="stat-item" key={num}>
                <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {num}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-tight">
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hero Graphic — IMG 1 */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <figure
            className="blog-img-wrap"
            style={{ borderRadius: 0, margin: 0 }}
          >
            <img
              src="/How-to-Rank-on-Page-1.png"
              alt="Insydz Rank Tracker — real-time page 1 ranking positions and AI-powered listing recommendations for Amazon.in sellers"
              style={{ width: "100%", display: "block" }}
            />
          </figure>
          <p className="img-caption">
            Insydz Rank Tracker real-time page 1 ranking positions and
            AI-powered listing recommendations for Amazon.in sellers
          </p>
        </div>
      </section>

      {/* ══════════ KEY TAKEAWAYS (full width) ═══════════════════════════════ */}
      <div style={{ maxWidth: "1200px", margin: "40px auto" }}>
        <div className="takeaway-box">
          <h3>Key Takeaways for Indian Amazon Sellers</h3>
          {[
            "Page 1 of Amazon.in captures over 70% of all buyer clicks for any search term the revenue difference between page 1 and page 3 for the same keyword can be 10x, with zero difference in ad spend.",
            "Amazon's A9 algorithm is a two-stage filter: first relevance (keyword indexing), then performance (CVR, velocity, CTR). You must win both stages optimising only one is not enough.",
            "Your product title carries the highest SEO weight on Amazon.in. Primary keywords must appear in the first 80 characters marketing language belongs in bullet points, not the title.",
            "Backend search terms (250 bytes in Seller Central) are a major untapped opportunity for most Indian sellers fill them with non-duplicate keywords, Hinglish variations, and long-tail phrases.",
            "Running ads before fixing your listing is the most expensive mistake in Amazon SEO ads amplify conversion rate, not compensate for it. Optimise listing first, then scale spend.",
            "Weekly keyword rank tracking is non-negotiable for competitive categories. Catching ranking drops early costs a listing update; catching them late costs months of revenue.",
            "India-specific keyword tools matter because Amazon.in search patterns differ significantly from Amazon.com Hinglish, regional buying intent, and platform-specific search require India-calibrated data.",
          ].map((t) => (
            <div className="takeaway-item" key={t}>
              <div className="takeaway-dot">✓</div>
              <div className="takeaway-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ ARTICLE LAYOUT ═══════════════════════════════════════════ */}
      <div className="article-layout">
        {/* Sidebar TOC */}
        <aside className="toc-sidebar">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Table of Contents
          </div>
          {TOC.map((t) => (
            <button
              key={t.id}
              className={`toc-link${activeSection === t.id ? " active" : ""}`}
              onClick={() => go(t.id)}
            >
              {t.label}
            </button>
          ))}
        </aside>

        {/* Article body */}
        <main>
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
                style={{ display: "block", marginBottom: 4 }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            {/* ── S1 ─────────────────────────────────────────────────────── */}
            <h2 id="s1">
              What Does Ranking on Page 1 of Amazon India Actually Mean?
            </h2>
            <p>
              To{" "}
              <InLink to="/solutions/amazon-sellers">
                rank on page 1 amazon india
              </InLink>{" "}
              means getting your product to appear within the first 16–24
              results when a buyer searches for your category on Amazon.in the
              prime real estate where 70% of all clicks occur. Sellers who
              occupy this space capture the majority of organic demand without
              paying for every click. Sellers outside it are essentially
              invisible, regardless of product quality or price.
            </p>
            <p>
              The scale of the opportunity is significant: the difference
              between ranking on page 1 vs. page 3 for the same keyword can mean
              a <strong>10x gap in daily organic sales</strong>, with zero
              additional ad spend required once the ranking is established. This
              is compounding leverage a well-optimised listing earns revenue
              around the clock, unlike a Sponsored Products campaign that stops
              the moment you pause it.
            </p>
            <div className="callout teal">
              <div className="callout-label">In Simple Terms</div>
              <div className="callout-text">
                Page 1 ranking on Amazon.in means your product shows up first
                when buyers search for what you're selling. Amazon decides who
                shows up there based on how relevant your listing is to the
                buyer's search query and how likely your product is to result in
                a purchase. Both factors are within your control and this guide
                explains exactly how to optimise them.
              </div>
            </div>

            {/* ── S2 ─────────────────────────────────────────────────────── */}
            <h2 id="s2">
              Why Ranking on Page 1 of Amazon India Matters More Than You Think
            </h2>

            <h3>The Page 1 Revenue Cliff</h3>
            <p>
              Amazon.in buyer behaviour follows a steep drop-off after the first
              page. Research consistently shows that page 1 captures over 70% of
              all clicks for any given search query. Page 2 gets around 15%.
              Everything after page 2 shares the remaining crumbs. The
              implication for ad spend is equally stark: sellers who rank poorly
              organically compensate by running Sponsored Products campaigns
              continuously paying ₹8–25 per click for visibility they could earn
              for free with better listing optimisation.
            </p>

            <h3>Indian Buyers Search at Scale and They Search Specifically</h3>
            <p>
              Amazon.in processes hundreds of millions of search queries every
              month across categories from electronics to kirana goods. Indian
              buyers have become increasingly specific in their searches: not
              just "water bottle" but "insulated water bottle for office 1 litre
              steel under 400". These long-tail queries have lower competition
              and higher purchase intent and a page 1 ranking for even three or
              four of them can meaningfully move your monthly revenue.
            </p>

            <h3>Competition Is Intensifying Every Quarter</h3>
            <p>
              The number of active sellers on Amazon.in has grown 40% over the
              past three years. In most categories, the seller who ranked on
              page 1 two years ago with a basic listing is now being displaced
              by sellers who treat listing optimisation as a systematic, ongoing
              process rather than a one-time setup task. Complacency is the
              fastest route off page 1.
            </p>

            <div className="callout warn">
              <div className="callout-label">
                Real Seller Example Surat Textile Seller
              </div>
              <div className="callout-text">
                A Surat-based textile seller was doing ₹2.4 lakh/month selling
                cotton bedsheets. After a keyword audit, they identified 11
                high-volume keywords their top competitors ranked for that were
                completely absent from their listing. Within 8 weeks of
                implementing the changes, organic revenue grew to{" "}
                <strong>
                  ₹4.1 lakh/month — a 72% increase with no change in ad spend.
                </strong>
              </div>
            </div>

            <div className="callout indigo">
              <div className="callout-label">AI Overview Summary</div>
              <div className="callout-text">
                Ranking on page 1 of Amazon India requires optimising your
                product listing for the{" "}
                <InLink to="/resources/expert-blog/amazon-seo-tool-india">
                  amazon search algorithm india
                </InLink>{" "}
                across four core signals: keyword relevance (title, bullets,
                backend), sales velocity, conversion rate, and click-through
                rate. Tools like Insydz provide the India-specific keyword data
                and daily rank tracking needed to systematically build and
                maintain page 1 positions on Amazon.in.
              </div>
            </div>

            {/* ── S3: A9 Algorithm ───────────────────────────────────────── */}
            <h2 id="s3">How Amazon India's A9 Algorithm Actually Works</h2>
            <p>
              The{" "}
              <a
                href="https://en.wikipedia.org/wiki/Amazon_(company)#A9"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#ea580c",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Amazon A9 algorithm
              </a>{" "}
              has two jobs: find products relevant to what the buyer searched,
              then rank them by which ones are most likely to result in a
              purchase. Understanding this two-step logic is the key to ranking
              on page 1 of Amazon India because the algorithm isn't just looking
              at your keywords, it's looking at your entire commercial track
              record.
            </p>

            {/* ── A9 Graphic — IMG 2 */}
            <figure className="blog-img-wrap">
              <img
                src="/Rank_page_1-Blog4_image2.png"
                alt="Amazon A9 algorithm ranking signals — relevance and performance factors that determine page 1 position on Amazon.in"
                style={{ width: "100%", display: "block" }}
              />
            </figure>
            <p className="img-caption">
              Amazon A9 algorithm ranking signals relative weights that
              determine your page 1 position on Amazon.in
            </p>

            <h3>Step 1 — Relevance: Can Amazon Find Your Product?</h3>
            <p>
              <strong>Keyword Indexing:</strong> Amazon scans your product
              title, bullet points, product description, and backend search
              terms to understand what your product is. If a keyword doesn't
              appear anywhere in your listing, Amazon will not rank you for it
              regardless of how relevant your product actually is. This is why
              keyword research must precede listing writing, not follow it.
            </p>
            <p>
              <strong>Title Weight:</strong> Your product title carries the
              highest SEO weight in the A9 algorithm. The first 80 characters of
              your title are most critical Amazon prioritises these for indexing
              and they're what buyers see in compressed mobile search results.
              Marketing language like "premium quality" or "best in class"
              wastes these characters without adding ranking value.
            </p>
            <p>
              <strong>Backend Search Terms:</strong> Amazon gives you 250 bytes
              of hidden search terms in Seller Central. These are invisible to
              buyers but fully indexed by the algorithm. Most sellers either
              leave these blank or fill them with duplicate keywords already in
              their title both are significant missed opportunities.
            </p>

            <h3>Step 2 — Performance: Will Your Product Convert?</h3>
            <p>
              <strong>Sales Velocity:</strong> Amazon tracks how many units you
              sell per day. Higher sales velocity signals a popular, trustworthy
              product and Amazon rewards it with better ranking.
            </p>
            <p>
              <strong>Conversion Rate (CVR):</strong> Of all the buyers who view
              your listing, what percentage actually buy? A product with a 12%
              CVR will outrank a product with a 6% CVR for the same keyword even
              if they have identical titles and backend keywords. CVR is
              improved through better images, stronger bullet points,
              competitive pricing, and social proof from reviews.
            </p>
            <p>
              The A9 algorithm is a feedback loop, not a one-time optimisation.
              Better keywords → more impressions → more clicks → more
              conversions → higher ranking → even more impressions. Breaking
              into this loop requires a well-optimised listing from day one,
              supported by targeted early-stage advertising to build{" "}
              <InLink to="/">CTR optimization and conversion signals</InLink>{" "}
              over time.
            </p>

            {/* ── S4: 6 Ranking Factors ──────────────────────────────────── */}
            <h2 id="s4">The 6 Core Ranking Factors on Amazon.in Explained</h2>
            <p>
              Understanding the A9 algorithm in detail allows you to
              systematically improve each ranking factor. Here is how each
              factor works and what it means in practice for Indian sellers.
            </p>

            {/* ── Ranking Health Dashboard — IMG 3 */}
            <figure className="blog-img-wrap">
              <img
                src="/Rank_page_1-Blog4_image3.png"
                alt="Insydz Listing Health Dashboard — tracking all 6 A9 ranking factors with actionable improvement scores for Amazon.in sellers"
                style={{ width: "100%", display: "block" }}
              />
            </figure>
            <p className="img-caption">
              Insydz Listing Health Dashboard tracking all 6 A9 ranking factors
              with actionable improvement scores for Amazon.in sellers
            </p>

            <div className="dt-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Ranking Factor</th>
                    <th>What Amazon Measures</th>
                    <th>How to Improve It</th>
                    <th>Impact Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Product Title</strong>
                    </td>
                    <td>Keyword relevance in first 80 characters</td>
                    <td>Lead with primary keyword; add 2–3 attributes</td>
                    <td>
                      <span className="br">Critical</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Sales Velocity</strong>
                    </td>
                    <td>Units sold per day, trend direction</td>
                    <td>Early-stage ads + deals to build sales history</td>
                    <td>
                      <span className="br">Critical</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Conversion Rate</strong>
                    </td>
                    <td>% of listing views that result in purchase</td>
                    <td>Better images, competitive price, strong reviews</td>
                    <td>
                      <span className="br">Critical</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Backend Keywords</strong>
                    </td>
                    <td>Hidden search terms (250 bytes in Seller Central)</td>
                    <td>Fill with Hinglish variants, long-tail, synonyms</td>
                    <td>
                      <span className="ba">High</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Click-Through Rate</strong>
                    </td>
                    <td>% of impressions that result in listing visits</td>
                    <td>Stronger hero image; competitive pricing badge</td>
                    <td>
                      <span className="ba">High</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Bullet Points</strong>
                    </td>
                    <td>Secondary keyword presence + conversion copy</td>
                    <td>Lead with buyer benefit, include 1–2 keywords each</td>
                    <td>
                      <span className="bb">Medium</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── S5: Mistakes ─────────────────────────────────────────────── */}
            <h2 id="s5">
              5 Critical Mistakes That Keep Indian Sellers Off Page 1
            </h2>
            <p>
              These five mistakes are the most common reasons Indian sellers
              fail to break into page 1 and stay there. Each one is entirely
              preventable once you understand the mechanics behind it.
            </p>

            {[
              {
                n: 1,
                title: "Writing Titles for Yourself, Not the Algorithm",
                body: 'A seller who titles their product "Premium Quality Handcrafted Copper Water Bottle Eco Friendly and Stylish" has written a marketing headline, not an SEO title. Amazon cannot rank you for "copper water bottle" if the exact phrase doesn\'t appear coherently in your title. The vocabulary buyers use to search and the vocabulary sellers use to describe are often entirely different and the algorithm sides with buyers, not sellers.',
              },
              {
                n: 2,
                title: "Leaving Backend Search Terms Empty or Duplicated",
                body: 'In Seller Central, the "Search Terms" field gives you 250 bytes of hidden indexing power. A consistent pattern across Indian seller accounts shows 60–70% of sellers either leave this blank or fill it with duplicates already in their title. This is the equivalent of leaving a full-page ad slot blank. Filling it correctly with non-duplicate Hinglish variants, competitor brand names (where permitted), and long-tail phrases can unlock dozens of additional ranking positions with zero visible listing changes.',
              },
              {
                n: 3,
                title: "Launching Ads Before Fixing the Listing",
                body: "Running Sponsored Products on an unoptimised listing is paying for traffic that won't convert. If your listing has poor images, thin bullet points, or no reviews ads bring visitors who leave. Amazon's algorithm interprets this low conversion as a signal to reduce your organic ranking further. Fix the listing first, then amplify it with ads. This sequence is not negotiable.",
              },
              {
                n: 4,
                title:
                  "Ignoring Long-Tail Keywords Where the Real Intent Lives",
                body: 'Most Indian sellers compete for 2–3 generic head keywords in their category ("water bottle", "yoga mat", "phone case") where competition is brutal and cost-per-click is high. The smarter play: rank for long-tail variations like "stainless steel water bottle 1 litre office use under ₹400" where buyer intent is specific, competition is low, and conversion rates are dramatically higher. Five page 1 long-tail rankings often deliver more revenue than one contested head keyword.',
              },
              {
                n: 5,
                title: "Treating SEO as a One-Time Task",
                body: "Sellers who optimise a listing once and never revisit it lose rankings as competitors update their listings, new search trends emerge, and seasonal keywords shift. Category leaders review and update their listings quarterly at minimum and track keyword rankings weekly to catch drops before they compound into sustained revenue losses. Ranking is not a destination; it's a position you defend with data.",
              },
            ].map((m) => (
              <div className="mistake-card" key={m.n}>
                <div className="mistake-num">{m.n}</div>
                <div className="mistake-body">
                  <strong>{m.title}</strong>
                  <p>{m.body}</p>
                </div>
              </div>
            ))}

            <div className="callout pink">
              <div className="callout-label">⚠ Counterintuitive Truth</div>
              <div className="callout-text">
                Running more ads will not fix a broken listing. Ads amplify
                what's already there. If your listing converts at 4%, ads just
                bring more people who don't buy and you pay for each one. The
                correct sequence is always: optimise the listing organically
                first, then scale with paid traffic once you know the listing
                converts.
              </div>
            </div>

            <div className="inline-cta">
              <div>
                <h4>Find Your Keyword Gaps in Minutes</h4>
                <p>
                  Insydz gives Indian sellers the exact keywords their top
                  competitors rank for that they don't even have in their
                  listing yet.
                </p>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all whitespace-nowrap"
              >
                Start Free at insydz.com →
              </button>
            </div>

            {/* ── S6: Execution Plan ───────────────────────────────────────── */}
            <h2 id="s6">
              Best Practices: A Page 1 Ranking Execution Plan for Indian Sellers
            </h2>
            <p>
              The sellers who consistently hold page 1 positions on Amazon.in
              don't rely on guesswork they follow a structured four-phase
              process. Here is the complete execution framework, from initial
              keyword research through ongoing tracking and iteration.
            </p>

            {/* ── 4-Phase Execution Graphic — IMG 4 */}
            <figure className="blog-img-wrap">
              <img
                src="/Rank_page_1-Blog4_image4.png"
                alt="Insydz 4-phase page 1 execution plan — keyword research, listing optimisation, velocity building, track and iterate"
                style={{ width: "100%", display: "block" }}
              />
            </figure>
            <p className="img-caption">
              Insydz 4-phase page 1 execution plan a structured, data-driven
              workflow for sustained organic rank growth on Amazon.in
            </p>

            {[
              {
                phase: "ph1",
                n: 1,
                title:
                  "Phase 1: Keyword Research (Before Touching Your Listing)",
                sub: "Foundation cannot be skipped",
                items: [
                  <>
                    Use a{" "}
                    <InLink to="/resources/expert-blog/best-amazon-keyword-research-tool-india">
                      keyword research tool
                    </InLink>{" "}
                    to find your primary keyword (highest volume, medium
                    competition), 3–5 secondary keywords (related terms), and
                    10–15 long-tail keywords (specific, high-intent phrases).
                  </>,

                  "Run a competitor reverse ASIN lookup on your top 3 rivals to find keywords they rank for that you don't even have in your listing.",

                  'Identify seasonal keywords relevant to your category (e.g., "Diwali gift ideas", "monsoon raincoat", "back to school stationery") and plan listing updates 4–6 weeks before the season.',

                  "Map keywords to their intended placement: primary keyword in title, secondary keywords in bullets, long-tail and Hinglish variants in backend search terms.",
                ],
              },
              {
                phase: "ph2",
                n: 2,
                title: "Phase 2: Listing Optimisation (One-Time Foundation)",
                sub: "Title, bullets, backend, images, A+ content",
                items: [
                  "Title: Brand + Primary Keyword + 2–3 Key Attributes + Size or Variant. Keep under 200 characters. Put the most important keyword in the first 80 characters.",
                  "Bullet Points: Address the top 5 buyer questions or objections. Lead each bullet with a benefit, not a feature. Include 1–2 secondary keywords per bullet naturally.",
                  "Backend Search Terms: Fill all 250 bytes with non-duplicate, relevant keywords, common misspellings, and Hinglish variations. Do not repeat keywords already in your title.",
                  "Images: Minimum 6 images. Main image on white background, product fills 85% of frame. Secondary images: lifestyle, dimensions, feature callouts, use-case scenarios.",
                  "A+ Content: If brand-registered, use A+ Content. Include keywords naturally in the narrative text this is indexed by Amazon and improves CTR with visual storytelling.",
                ],
              },
              {
                phase: "ph3",
                n: 3,
                title: "Phase 3: Sales Velocity Building",
                sub: "Weeks 1–4 post-optimisation",
                items: [
                  "Run a targeted Sponsored Products campaign on your top 5 keywords for the first 2–4 weeks post-optimisation not to profit, but to signal sales velocity to the A9 algorithm.",
                  'Use Amazon\'s "Request a Review" button for every order consistent review velocity helps ranking more than a burst of reviews followed by silence.',
                  "Consider a launch-period deal or coupon (5–10% off) to boost CTR in search results during the initial ranking push.",
                  "Monitor your conversion rate daily during this phase if CVR drops below 8%, revisit bullet points and main image before scaling ad spend.",
                ],
              },
              {
                phase: "ph4",
                n: 4,
                title: "Phase 4: Tracking and Iteration (Ongoing)",
                sub: "Weekly tracking, quarterly audits",
                items: [
                  "Track your keyword rankings weekly not just overall BSR. BSR is category-level; keyword rank tells you exactly where you stand for each target term.",
                  "Monitor CTR and CVR in Seller Central's Brand Analytics if CTR is low, test a new main image; if CVR is low, revisit bullet points and pricing.",
                  "Quarterly: full listing audit against your top competitor's listing where are they stronger? What keywords are they using that you aren't?",
                  "Set up rank drop alerts (WhatsApp or email) so you know within 24 hours if a key ranking position shifts early intervention prevents weeks-long ranking recovery.",
                ],
              },
            ].map((ph) => (
              <div className="phase-card" key={ph.n}>
                <div className="phase-hd">
                  <div className={`phase-num ${ph.phase}`}>{ph.n}</div>
                  <div>
                    <div className="phase-hd-title">{ph.title}</div>
                    <div className="phase-hd-sub">{ph.sub}</div>
                  </div>
                </div>
                <div className="phase-body">
                  <ul>
                    {ph.items.map((it, i) => (
                      <li key={i}>
                        <span className="phase-arrow">→</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <h3>Key Metrics to Track Weekly</h3>
            <div className="metrics-grid">
              {[
                {
                  num: "Keyword Rank",
                  lbl: "Track daily position for each target keyword not just overall BSR",
                },
                {
                  num: "CTR",
                  lbl: "Click-through rate in search low CTR signals weak main image or title",
                },
                {
                  num: "CVR",
                  lbl: "Conversion rate below 8% means your listing isn't convincing buyers",
                },
                {
                  num: "Organic Split",
                  lbl: "% of sales from organic vs. paid growth in organic share signals healthy ranking",
                },
              ].map((m) => (
                <div className="metric-card" key={m.num}>
                  <span className="metric-num">{m.num}</span>
                  <span className="metric-lbl">{m.lbl}</span>
                </div>
              ))}
            </div>

            {/* ── S7: Best Tools ────────────────────────────────────────────── */}
            <h2 id="s7">Best Tools for Amazon India Ranking in 2026</h2>

            <h3>Global Tools: Strong Capabilities, Indian Market Gaps</h3>
            <p>
              Jungle Scout, Helium 10's Cerebro and Magnet, and DataHawk are
              well-regarded for keyword research and rank tracking on Amazon.
              For Indian sellers evaluating these tools, three material gaps
              affect their usefulness:
            </p>
            <ul>
              <li>
                <strong>Jungle Scout:</strong> Excellent keyword research and
                rank tracking but database is US-centric. Amazon.in search
                volumes and Hinglish keyword patterns are significantly
                underrepresented. Plans start at approximately ₹3,800/month.
              </li>
              <li>
                <strong>Helium 10:</strong> Comprehensive suite including
                Cerebro (reverse ASIN), Magnet (keyword discovery), and Keyword
                Tracker. Same India data limitations. Plans range from
                ₹3,300–8,300/month.
              </li>
              <li>
                <strong>Platform gap:</strong> Neither tool covers Flipkart
                keyword intelligence a significant limitation for Indian sellers
                running multi-platform businesses.
              </li>
            </ul>

            {/* ── Tools Comparison Graphic — IMG 5 */}
            <figure className="blog-img-wrap">
              <img
                src="/Rank_page1_Blog4_image5.png"
                alt="Insydz vs global tools — India-specific keyword intelligence, Flipkart SEO, and WhatsApp rank alerts built for Amazon.in sellers"
                style={{ width: "100%", display: "block" }}
              />
            </figure>
            <p className="img-caption">
              Insydz vs. global tools India-specific keyword intelligence,
              Flipkart SEO, and WhatsApp rank alerts built for Amazon.in sellers
            </p>

            <h3>Insydz: Page 1 Ranking Intelligence Built for Amazon.in</h3>
            <p>
              Insydz takes a connected approach to Amazon ranking rather than
              treating SEO as a standalone function, it ties keyword
              intelligence to competitor pricing, review sentiment, and market
              trends in one dashboard. For sellers focused specifically on
              ranking on page 1 of Amazon India, the tool provides:
            </p>
            <ul>
              <li>
                <strong>
                  Keyword research powered by Amazon.in-specific data
                </strong>{" "}
                including Hinglish variants and India-specific buying intent
                patterns that global tools miss entirely.
              </li>
              <li>
                <strong>Competitor reverse ASIN analysis</strong> see exactly
                which keywords your rivals are ranking for, and which gaps you
                can target first to gain ground.
              </li>
              <li>
                <strong>
                  Daily keyword rank tracking with WhatsApp alerts
                </strong>{" "}
                when you drop positions so you catch ranking losses within
                hours, not weeks.
              </li>
              <li>
                <strong>
                  Listing optimisation recommendations in plain language
                </strong>{" "}
                not just a score, but actionable next steps like "Add this
                keyword to your title because it has 18,000 monthly searches and
                your top 3 competitors all use it."
              </li>
              <li>
                <strong>
                  Flipkart keyword intelligence alongside Amazon.in
                </strong>{" "}
                one tool for both platforms.
              </li>
              <li>
                <strong>Pricing from ₹1999/month</strong> with a forever-free
                plan for sellers starting out.
              </li>
            </ul>

            <div className="callout pro">
              <div className="callout-label">Real Outcome from Insydz</div>
              <div className="callout-text">
                A kitchen appliances seller used the competitor keyword gap tool
                to identify 14 high-volume keywords their top competitors ranked
                for that were missing from their listing entirely. After adding
                these keywords to their title, bullet points, and backend search
                terms, their average keyword rank improved from #18 to #6 across
                target terms and{" "}
                <strong>
                  organic sessions increased 340% within 6 weeks, with no change
                  in ad spend.
                </strong>
              </div>
            </div>

            {/* ── S9: FAQ ──────────────────────────────────────────────────── */}
            <h2 id="s9">Frequently Asked Questions</h2>
            {FAQS.map((faq, i) => (
              <div
                className={`faq-item${openFaq === i ? " open" : ""}`}
                key={i}
              >
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <div className={`faq-icon${openFaq === i ? " open" : ""}`}>
                    +
                  </div>
                </div>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}

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
          className="text-2xl md:text-3xl font-extrabold text-white mb-3"
          style={{ fontFamily: "'Sora',sans-serif" }}
        >
          Page 1 Is a System. Insydz Runs It.
        </h2>
        <p
          className="text-blue-100 mb-8 text-base md:text-lg"
          style={{
            fontFamily: "'Lora', serif",
            maxWidth: 520,
            margin: "0 auto 28px",
          }}
        >
          Track your Amazon.in keyword ranks daily, catch drops instantly on
          WhatsApp, and close the gaps your competitors are exploiting.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "8px 28px",
            marginBottom: 28,
          }}
        >
          {[
            "Daily rank tracking",
            "WhatsApp alerts",
            "India keyword data",
            "Free plan available",
          ].map((t) => (
            <div
              key={t}
              className="text-blue-100"
              style={{
                fontSize: 13.5,
                display: "flex",
                alignItems: "center",
                gap: 7,
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
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base px-10 py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
        >
          <Zap className="w-5 h-5 inline mr-2" />
          Find My Keyword Gaps →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          No setup · Amazon.in + Flipkart · Results in minutes
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
