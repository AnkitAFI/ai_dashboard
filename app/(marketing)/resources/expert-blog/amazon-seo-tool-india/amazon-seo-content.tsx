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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogImageSection from "../components/BlogImageSection";

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
  { id: "s1", label: "What is an Amazon SEO Tool?" },
  { id: "s2", label: "Why It Matters for Indian Sellers" },
  { id: "s3", label: "How an Amazon SEO Tool Works" },
  { id: "s4", label: "Core SEO Components" },
  { id: "s5", label: "5 Critical SEO Mistakes" },
  { id: "s6", label: "Weekly SEO Execution Model" },
  { id: "s7", label: "Best Tools for Indian Sellers" },
  { id: "s8", label: "Key Takeaways" },
  { id: "s9", label: "FAQ" },
];

// ─── Inline link helper ─────────────────────────────────────────────────────
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

const FAQS = [
  {
    q: "What is an Amazon SEO tool and do Indian sellers really need one?",
    a: "An Amazon SEO tool is software that helps you find the right keywords, optimise your product listing, and track your ranking on Amazon search results. Indian sellers who rely on gut feel for keyword selection typically rank on page 3–5 for their target terms invisible to most buyers. A tool replaces guesswork with data derived from actual Amazon.in search behaviour, directly impacting organic visibility and sales.",
  },
  {
    q: "How is Amazon SEO different from Google SEO?",
    a: (
      <>
        Google{" "}
        <a
          href="https://en.wikipedia.org/wiki/Search_engine_optimization"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#ea580c",
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          search engine optimization (SEO)
        </a>{" "}
        is about ranking web pages for information queries. Amazon SEO is about
        ranking product listings for purchase queries. Amazon's A9 algorithm
        weighs keyword relevance, sales velocity, pricing competitiveness,
        reviews, and conversion rate not backlinks or domain authority. A
        standard website SEO tool is useless for Amazon you need a
        marketplace-specific tool that understands e-commerce ranking signals.
      </>
    ),
  },
  {
    q: "Which keywords should I prioritise first as an Indian seller?",
    a: (
      <>
        Start with high-intent, mid-competition keywords not the most popular
        terms in your category. For example, 'buy yoga mat online' has enormous
        competition. 'Anti-slip yoga mat 6mm for women' has lower competition
        and higher purchase intent. An{" "}
        <InLink to="/resources/expert-blog/best-amazon-keyword-research-tool-india">
          amazon keyword research tool india
        </InLink>{" "}
        will show you search volume, competition level, and estimated conversion
        rate so you can prioritise intelligently rather than going after the
        hardest keywords first.
      </>
    ),
  },
  {
    q: "How long does it take to see results from Amazon listing optimisation?",
    a: "Most sellers see measurable ranking improvement within 3–6 weeks of a well-executed listing optimisation. Organic ranking changes aren't instant Amazon needs time to index changes and measure their impact on conversion rate. Combining listing optimisation with a targeted Sponsored Products campaign on your new keywords accelerates the timeline significantly. Track weekly, not daily, for accurate progress assessment.",
  },
  {
    q: "Can I do Amazon SEO without paid tools if I'm just starting out?",
    a: "Yes. With limitations. You can use Amazon's autocomplete, competitor listing analysis, and Seller Central's search term reports to build a basic keyword strategy. But this process is slow, incomplete, and hard to scale past 5–10 SKUs. Most sellers who try to do this manually spend 8–12 hours per product and still miss high-volume keywords that a tool would surface in minutes. A forever-free plan on platforms like Insydz lets you start with tool-level intelligence at zero cost.",
  },
  {
    q: "Does Amazon SEO work differently on Flipkart?",
    a: "Yes. Flipkart uses its own search algorithm, which weighs factors like listing completeness, sales velocity, price competitiveness, and customer ratings somewhat differently from Amazon's A9. Keywords that rank well on Amazon.in don't automatically transfer to Flipkart. Sellers running multi-platform businesses need separate keyword strategies for each marketplace or a unified tool that handles both simultaneously.",
  },
];

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

// Footer company links — stored as [label, route] string pairs to avoid TS union inference issues
const FOOTER_COMPANY_LINKS: [string, string][] = [
  ["About", "/about/about-us"],
  ["Our Vision", "/about/our-vision"],
  ["Careers", "/about/careers"],
  ["Contact", "/about/careers"],
];

export default function AmazonSeoToolIndia() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("s1");
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
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
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
            isActive
              ? ac
                ? "text-orange-600 font-semibold"
                : "text-purple-600 font-semibold"
              : ac
                ? "text-orange-600 dark:text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          }`}
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
                className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 group ${
                  ac
                    ? "hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                <span
                  className={`flex-shrink-0 ${ac ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}
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

        .read-progress { position:fixed; top:64px; left:0; height:3px; background:linear-gradient(90deg,#f97316,#ef4444); z-index:200; transition:width .1s linear; border-radius:0 2px 2px 0; }
        @media(min-width:640px){ .read-progress { top:72px; } }
        @media(min-width:1024px){ .read-progress { top:80px; } }

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        @media(min-width:1024px){ .toc-sidebar { padding:24px; } }
        .dark .toc-sidebar { background:#111827; border-color:#1f2937; }

        .mobile-toc-btn { display:flex; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; color:#111; cursor:pointer; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .dark .mobile-toc-btn { background:#111827; border-color:#1f2937; color:#f9fafb; }
        @media(min-width:768px){ .mobile-toc-btn { display:none; } }
        .mobile-toc-panel { display:none; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin-bottom:20px; }
        .dark .mobile-toc-panel { background:#111827; border-color:#1f2937; }
        .mobile-toc-panel.open { display:block; }

        .article-body { font-family:'Lora',serif; font-size:15px; line-height:1.8; color:#374151; }
        @media(min-width:640px){ .article-body { font-size:15.5px; } }
        @media(min-width:1024px){ .article-body { font-size:clamp(15px,2vw,17px); } }
        .dark .article-body { color:#d1d5db; }

        .article-body h2 { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; color:#111; letter-spacing:-.4px; margin:40px 0 12px; line-height:1.25; scroll-margin-top:72px; border-bottom:2px solid #e5e7eb; padding-bottom:10px; }
        @media(min-width:640px){ .article-body h2 { font-size:22px; margin:48px 0 14px; scroll-margin-top:80px; } }
        @media(min-width:1024px){ .article-body h2 { font-size:clamp(20px,3vw,26px); margin:52px 0 16px; scroll-margin-top:100px; } }
        .dark .article-body h2 { color:#f9fafb; border-color:#1f2937; }
        .article-body h2:first-child { margin-top:0; }

        .article-body h3 { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:#111; margin:24px 0 8px; scroll-margin-top:72px; }
        @media(min-width:640px){ .article-body h3 { font-size:16px; margin:28px 0 10px; } }
        @media(min-width:1024px){ .article-body h3 { font-size:clamp(15px,2vw,18px); margin:32px 0 10px; scroll-margin-top:100px; } }
        .dark .article-body h3 { color:#f3f4f6; }

        .article-body p { margin-bottom:16px; font-size:14.5px; }
        @media(min-width:640px){ .article-body p { margin-bottom:20px; font-size:15px; } }
        .article-body ul,.article-body ol { padding-left:18px; margin-bottom:16px; }
        @media(min-width:640px){ .article-body ul,.article-body ol { padding-left:22px; margin-bottom:20px; } }
        .article-body li { margin-bottom:7px; font-size:14px; }
        @media(min-width:640px){ .article-body li { margin-bottom:8px; font-size:inherit; } }
        .article-body li::marker { color:#f97316; }
        .article-body strong { font-weight:700; color:#111; }
        .dark .article-body strong { color:#f9fafb; }

        .callout { border-radius:12px; padding:14px 16px; margin:20px 0; }
        @media(min-width:640px){ .callout { padding:18px 20px; margin:28px 0; } }
        .callout.teal  { background:#f0fdfa; border:1px solid #99f6e4; border-left:4px solid #0d9488; }
        .callout.warn  { background:#fffbeb; border:1px solid #fcd34d; border-left:4px solid #d97706; }
        .callout.pro   { background:#f0fdf4; border:1px solid #86efac; border-left:4px solid #16a34a; }
        .callout.info  { background:#eff6ff; border:1px solid #93c5fd; border-left:4px solid #2563eb; }
        .callout.indigo{ background:#eef2ff; border:1px solid #c7d2fe; border-radius:10px; }
        .callout.pink  { background:#fdf2f8; border-left:4px solid #db2777; }
        .dark .callout.teal  { background:#042f2e; border-color:#134e4a; }
        .dark .callout.warn  { background:#1c1507; border-color:#78350f; }
        .dark .callout.pro   { background:#052e16; border-color:#166534; }
        .dark .callout.info  { background:#0c1a2e; border-color:#1e3a5f; }
        .dark .callout.indigo{ background:#1e1b4b; border-color:#3730a3; }
        .dark .callout.pink  { background:#500724; border-color:#9d174d; }
        .callout-label { font-family:'Sora',sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:7px; display:flex; align-items:center; gap:6px; }
        @media(min-width:640px){ .callout-label { font-size:11px; margin-bottom:8px; } }
        .callout.teal  .callout-label { color:#0d9488; }
        .callout.warn  .callout-label { color:#d97706; }
        .callout.pro   .callout-label { color:#16a34a; }
        .callout.info  .callout-label { color:#2563eb; }
        .callout.indigo .callout-label { color:#4f46e5; }
        .callout.pink  .callout-label { color:#db2777; }
        .callout-text { font-family:'Lora',serif; font-size:13.5px; color:#374151; line-height:1.72; }
        @media(min-width:640px){ .callout-text { font-size:15px; } }
        .dark .callout-text { color:#d1d5db; }

        .dt-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; margin:18px 0; border-radius:12px; border:1px solid #e5e7eb; box-shadow:0 4px 16px rgba(0,0,0,.09); }
        @media(min-width:640px){ .dt-wrap { margin:24px 0; } }
        .dark .dt-wrap { border-color:#1f2937; }
        table.dt { width:100%; border-collapse:collapse; font-family:'Sora',sans-serif; font-size:11.5px; min-width:480px; }
        @media(min-width:640px){ table.dt { font-size:13px; min-width:520px; } }
        table.dt th { background:#0d1b2a; color:white; padding:10px 12px; text-align:left; font-size:10px; letter-spacing:.5px; text-transform:uppercase; }
        @media(min-width:640px){ table.dt th { padding:12px 16px; font-size:11px; } }
        table.dt td { padding:10px 12px; border-bottom:1px solid #e5e7eb; color:#374151; vertical-align:middle; }
        @media(min-width:640px){ table.dt td { padding:12px 16px; } }
        .dark table.dt td { border-color:#1f2937; color:#d1d5db; }
        table.dt tr:last-child td { border-bottom:none; }
        table.dt tr:nth-child(even) td { background:#f8fafc; }
        .dark table.dt tr:nth-child(even) td { background:#0f172a; }
        table.dt tr:hover td { background:#fff7ed; }
        .dark table.dt tr:hover td { background:#1c0a00; }
        .bg { background:#dcfce7; color:#15803d; font-weight:700; padding:2px 8px; border-radius:20px; font-size:10.5px; white-space:nowrap; display:inline-block; }
        @media(min-width:640px){ .bg { padding:3px 10px; font-size:11px; } }
        .bo { background:#fff7ed; color:#ea580c; font-weight:700; padding:2px 8px; border-radius:20px; font-size:10.5px; white-space:nowrap; display:inline-block; }
        .br { background:#fef2f2; color:#dc2626; font-weight:700; padding:2px 8px; border-radius:20px; font-size:10.5px; white-space:nowrap; display:inline-block; }
        .bb { background:#dbeafe; color:#1e40af; font-weight:700; padding:2px 8px; border-radius:20px; font-size:10.5px; white-space:nowrap; display:inline-block; }
        @media(min-width:640px){ .bo,.br,.bb { padding:3px 10px; font-size:11px; } }

        .step { display:flex; gap:12px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:14px 16px; margin-bottom:10px; transition:box-shadow .2s; }
        @media(min-width:640px){ .step { gap:16px; padding:18px 20px; margin-bottom:12px; } }
        .step:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); }
        .dark .step { background:#111827; border-color:#1f2937; }
        .step-num { flex-shrink:0; width:30px; height:30px; background:#f97316; color:white; font-family:'Sora',sans-serif; font-weight:800; font-size:13px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-top:2px; }
        @media(min-width:640px){ .step-num { width:34px; height:34px; font-size:15px; margin-top:3px; } }
        .step-content h4 { font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:#111; margin-bottom:3px; }
        @media(min-width:640px){ .step-content h4 { font-size:14.5px; margin-bottom:4px; } }
        .dark .step-content h4 { color:#f9fafb; }
        .step-content p { font-size:12px; margin:0; font-family:'Sora',sans-serif; color:#64748b; line-height:1.6; }
        @media(min-width:640px){ .step-content p { font-size:13.5px; } }
        .dark .step-content p { color:#9ca3af; }

        .mistake-card { display:flex; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:10px; }
        @media(min-width:640px){ .mistake-card { margin-bottom:12px; } }
        .dark .mistake-card { border-color:#1f2937; }
        .mistake-num { flex-shrink:0; width:42px; background:#0d1b2a; color:white; font-family:'Sora',sans-serif; font-size:17px; font-weight:800; display:flex; align-items:center; justify-content:center; }
        @media(min-width:640px){ .mistake-num { width:52px; font-size:20px; } }
        .mistake-body { padding:12px 14px; }
        @media(min-width:640px){ .mistake-body { padding:16px 20px; } }
        .mistake-body strong { display:block; font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:#111; margin-bottom:4px; }
        @media(min-width:640px){ .mistake-body strong { font-size:14px; margin-bottom:5px; } }
        .dark .mistake-body strong { color:#f9fafb; }
        .mistake-body p { font-family:'Sora',sans-serif; font-size:12px; color:#6b7280; line-height:1.65; margin:0; }
        @media(min-width:640px){ .mistake-body p { font-size:13.5px; } }
        .dark .mistake-body p { color:#9ca3af; }

        .metrics-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:16px 0 24px; }
        @media(min-width:640px){ .metrics-grid { grid-template-columns:repeat(4,1fr); gap:14px; margin:20px 0 32px; } }
        .metric-card { background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:14px 12px; text-align:center; }
        @media(min-width:640px){ .metric-card { padding:18px 16px; } }
        .dark .metric-card { background:#111827; border-color:#1f2937; }
        .metric-num { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; color:#f97316; line-height:1; display:block; }
        @media(min-width:640px){ .metric-num { font-size:22px; } }
        .metric-lbl { font-size:11px; font-weight:600; color:#64748b; margin-top:4px; display:block; line-height:1.4; }
        @media(min-width:640px){ .metric-lbl { font-size:12px; margin-top:5px; } }
        .dark .metric-lbl { color:#9ca3af; }

        .related-grid { display:grid; grid-template-columns:1fr; gap:12px; margin-top:16px; }
        @media(min-width:480px){ .related-grid { grid-template-columns:1fr 1fr; gap:14px; } }
        @media(min-width:768px){ .related-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
        .related-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; cursor:pointer; transition:all .2s; }
        .dark .related-card { background:#111827; border-color:#1f2937; }
        .related-card:hover { border-color:#f97316; box-shadow:0 4px 16px rgba(249,115,22,.12); transform:translateY(-2px); }
        .related-thumb { width:100%; aspect-ratio:2.4 / 1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .related-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .related-body { padding:12px; }
        @media(min-width:640px){ .related-body { padding:14px; } }
        .related-tag { font-size:10px; font-weight:700; color:#f97316; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
        @media(min-width:640px){ .related-tag { font-size:10.5px; margin-bottom:6px; } }
        .related-title { font-size:12px; font-weight:700; color:#0d1b2a; line-height:1.4; font-family:'Sora',sans-serif; }
        @media(min-width:640px){ .related-title { font-size:13px; } }
        .dark .related-title { color:#f9fafb; }

        .faq-item { border:1px solid #e5e7eb; border-radius:12px; margin-bottom:7px; overflow:hidden; background:#fff; transition:border-color .2s, box-shadow .2s; }
        @media(min-width:640px){ .faq-item { margin-bottom:8px; } }
        .dark .faq-item { background:#111827; border-color:#1f2937; }
        .faq-item.open { border-color:#f97316; }
        .faq-q { display:flex; justify-content:space-between; align-items:center; padding:13px 16px; cursor:pointer; font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:#111; gap:10px; user-select:none; }
        @media(min-width:640px){ .faq-q { padding:16px 20px; font-size:14.5px; gap:12px; } }
        .dark .faq-q { color:#f9fafb; }
        .faq-q:hover { background:#f8fafc; }
        .dark .faq-q:hover { background:#1f2937; }
        .faq-icon { flex-shrink:0; width:20px; height:20px; background:#fff7ed; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#f97316; font-size:14px; font-weight:400; line-height:1; transition:transform .2s; }
        @media(min-width:640px){ .faq-icon { width:22px; height:22px; font-size:16px; } }
        .faq-icon.open { transform:rotate(45deg); background:#f97316; color:white; }
        .faq-a { font-family:'Lora',serif; font-size:13px; line-height:1.75; color:#64748b; padding:0 16px 13px; }
        @media(min-width:640px){ .faq-a { font-size:14px; padding:0 20px 16px; } }
        .dark .faq-a { color:#9ca3af; }

        .article-img-wrap { margin:20px 0 6px; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb; background:#f9fafb; box-shadow:0 4px 20px rgba(0,0,0,.06); }
        @media(min-width:640px){ .article-img-wrap { margin:28px 0 8px; } }
        .dark .article-img-wrap { border-color:#1f2937; background:#111827; }
        .img-shimmer { height:200px; background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%); background-size:400% 100%; animation:imgShimmer 1.6s ease infinite; }
        @media(min-width:640px){ .img-shimmer { height:300px; } }
        .img-caption { padding:8px 14px 10px; font-family:'Sora',sans-serif; font-size:11px; color:#9ca3af; line-height:1.5; border-top:1px solid #e5e7eb; background:#f9fafb; font-style:italic; text-align:center; }
        @media(min-width:640px){ .img-caption { padding:10px 16px 12px; font-size:12px; } }
        .dark .img-caption { background:#111827; border-color:#1f2937; }

        .stat-strip { display:flex; flex-wrap:wrap; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; margin-top:20px; box-shadow:0 1px 3px rgba(0,0,0,.07); background:#fff; }
        @media(min-width:640px){ .stat-strip { margin-top:32px; } }
        .dark .stat-strip { border-color:#1f2937; background:#111827; }
        .stat-item { flex:1; min-width:50%; padding:14px 16px; text-align:center; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; }
        @media(min-width:640px){ .stat-item { min-width:140px; padding:18px 24px; border-bottom:none; } }
        .dark .stat-item { border-color:#1f2937; }
        .stat-item:nth-child(even) { border-right:none; }
        @media(min-width:640px){ .stat-item:nth-child(even) { border-right:1px solid #e5e7eb; } .stat-item:last-child { border-right:none; } }

        .toc-link { display:block; font-size:11.5px; font-weight:500; color:#6b7280; padding:5px 8px; border-radius:8px; cursor:pointer; border:none; background:none; text-align:left; width:100%; transition:all .15s; margin-bottom:2px; line-height:1.4; border-left:2px solid transparent; }
        @media(min-width:1024px){ .toc-link { font-size:12.5px; padding:6px 10px; } }
        .toc-link:hover { background:#fff7ed; color:#ea580c; }
        .toc-link.active { background:#fff7ed; color:#ea580c; font-weight:700; border-left-color:#f97316; padding-left:8px; }
        .dark .toc-link { color:#9ca3af; }
        .dark .toc-link:hover,.dark .toc-link.active { background:#1c0a00; color:#fb923c; }

        .inline-cta { background:linear-gradient(135deg,#0d1b2a 0%,#1e3a5f 100%); border-radius:16px; padding:18px 16px; margin:30px 0; display:flex; flex-direction:column; gap:14px; box-shadow:0 8px 32px rgba(0,0,0,.12); }
        @media(min-width:640px){ .inline-cta { padding:clamp(20px,4vw,28px) clamp(16px,4vw,32px); flex-direction:row; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; margin:40px 0; } }
        .inline-cta h4 { font-family:'Sora',sans-serif; font-size:15px; font-weight:800; color:white; margin-bottom:5px; }
        @media(min-width:640px){ .inline-cta h4 { font-size:17px; margin-bottom:6px; } }
        .inline-cta p { font-family:'Sora',sans-serif; font-size:12.5px; color:#94a3b8; margin:0; line-height:1.6; }
        @media(min-width:640px){ .inline-cta p { font-size:13.5px; } }

        .takeaway-box { background:#0d1b2a; border-radius:16px; padding:20px 18px; margin:20px 0; }
        @media(min-width:640px){ .takeaway-box { padding:28px 30px; margin:28px 0; } }
        .takeaway-box h3 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:white; margin:0 0 14px; display:flex; align-items:center; gap:8px; }
        @media(min-width:640px){ .takeaway-box h3 { font-size:18px; margin:0 0 16px; gap:10px; } }
        .takeaway-item { display:flex; align-items:flex-start; gap:8px; margin-bottom:9px; }
        .takeaway-dot { flex-shrink:0; width:16px; height:16px; border-radius:50%; background:#f97316; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:white; margin-top:3px; }
        @media(min-width:640px){ .takeaway-dot { width:18px; height:18px; font-size:10px; } }
        .takeaway-text { font-family:'Lora',serif; font-size:13px; color:#cbd5e1; line-height:1.6; }
        @media(min-width:640px){ .takeaway-text { font-size:14.5px; } }

        .pipe-visual { background:linear-gradient(135deg,#F43F5E 0%,#EC4899 42%,#8B5CF6 100%); padding:20px 16px; border-radius:10px; margin:20px 0 6px; box-shadow:0 8px 32px rgba(0,0,0,.12); display:flex; flex-direction:column; gap:20px; }
        @media(min-width:640px){ .pipe-visual { padding:28px 24px; gap:24px; } }
        @media(min-width:768px){ .pipe-visual { flex-direction:row; gap:32px; padding:36px; align-items:flex-start; margin:28px 0 8px; } }
        .pipe-left { max-width:100%; }
        @media(min-width:768px){ .pipe-left { max-width:280px; } }
        .pipe-left h3 { font-family:'Sora',sans-serif; font-size:32px; font-weight:900; color:white; line-height:1; letter-spacing:-1.5px; margin-bottom:10px; }
        @media(min-width:640px){ .pipe-left h3 { font-size:38px; letter-spacing:-2px; margin-bottom:12px; } }
        .pipe-left h3 span { color:#FDE68A; }
        .pipe-left p { font-size:12px; color:rgba(255,255,255,.65); line-height:1.6; margin:0; }
        @media(min-width:640px){ .pipe-left p { font-size:13px; } }
        .pipe-card { background:white; border-radius:14px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,.28); flex:1; min-width:0; max-width:100%; }
        @media(min-width:768px){ .pipe-card { min-width:260px; max-width:360px; } }
        .pipe-card-bar { background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:8px 12px; display:flex; align-items:center; gap:5px; }
        .pip-dot { width:7px; height:7px; border-radius:50%; }
        .pipe-card-title { font-size:9px; font-weight:700; color:#6b7280; margin-left:4px; }
        .live-badge { margin-left:auto; background:#dcfce7; color:#15803d; font-size:8px; font-weight:800; padding:2px 7px; border-radius:20px; }
        .pipe-step { display:flex; align-items:flex-start; gap:8px; padding:8px 12px; border-bottom:1px solid #f8fafc; }
        @media(min-width:640px){ .pipe-step { gap:10px; padding:9px 14px; } }
        .pipe-step:last-child { border-bottom:none; }
        .pipe-step-n { width:20px; height:20px; border-radius:50%; color:white; font-size:9px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        @media(min-width:640px){ .pipe-step-n { width:22px; height:22px; font-size:10px; } }
        .pipe-step-name { font-size:10px; font-weight:700; color:#0d1b2a; display:block; }
        @media(min-width:640px){ .pipe-step-name { font-size:11px; } }
        .pipe-step-desc { font-size:9px; color:#94a3b8; display:block; margin-top:1px; }
        @media(min-width:640px){ .pipe-step-desc { font-size:10px; } }
        .pipe-step-tag { font-size:7.5px; font-weight:700; padding:1px 6px; border-radius:3px; display:inline-block; margin-top:2px; }
        @media(min-width:640px){ .pipe-step-tag { font-size:8.5px; padding:1px 7px; margin-top:3px; } }
        .auto-tag   { background:#dbeafe; color:#1d4ed8; }
        .ai-tag     { background:#ede9fe; color:#6d28d9; }
        .green-tag  { background:#dcfce7; color:#15803d; }

        .dash-dark { background:#0f172a; border-radius:12px; overflow:hidden; box-shadow:0 28px 64px rgba(0,0,0,.5); }
        @media(min-width:640px){ .dash-dark { border-radius:16px; } }
        .dash-bar  { background:#1e293b; border-bottom:1px solid rgba(255,255,255,.06); padding:8px 12px; display:flex; align-items:center; gap:4px; }
        .dash-title{ font-size:9px; font-weight:700; color:rgba(255,255,255,.65); margin-left:4px; }
        @media(min-width:640px){ .dash-title { font-size:10px; margin-left:5px; } }
        .dash-live  { margin-left:auto; font-size:8px; font-weight:800; background:rgba(74,222,128,.15); color:#4ade80; border:1px solid rgba(74,222,128,.25); padding:2px 7px; border-radius:20px; }
        .kw-row-dark { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:7px; padding:6px 9px; margin-bottom:4px; }
        @media(min-width:640px){ .kw-row-dark { gap:8px; padding:7px 10px; margin-bottom:5px; } }
        .kw-term    { font-size:9.5px; font-weight:600; color:rgba(255,255,255,.8); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        @media(min-width:640px){ .kw-term { font-size:10.5px; } }
        .kw-vol     { font-size:8px; color:rgba(255,255,255,.3); min-width:44px; text-align:right; flex-shrink:0; }
        .kw-pos     { font-size:9px; font-weight:800; min-width:24px; text-align:center; padding:2px 4px; border-radius:4px; flex-shrink:0; }
        @media(min-width:640px){ .kw-pos { font-size:10px; min-width:28px; padding:2px 5px; } }
        .kp-g { background:rgba(74,222,128,.18); color:#4ade80; }
        .kp-a { background:rgba(251,191,36,.18); color:#fcd34d; }
        .kp-r { background:rgba(248,113,113,.18); color:#f87171; }
        .alert-bar { margin:0 9px 9px; background:rgba(249,115,22,.08); border:1px solid rgba(249,115,22,.2); border-radius:8px; padding:7px 10px; display:flex; align-items:center; gap:6px; }
        .alert-dot { width:5px; height:5px; border-radius:50%; background:#fb923c; box-shadow:0 0 6px #fb923c; flex-shrink:0; }
        .alert-txt  { font-size:9px; color:rgba(255,255,255,.65); font-weight:500; flex:1; min-width:0; }
        @media(min-width:640px){ .alert-txt { font-size:10px; } }
        .alert-act  { font-size:8.5px; font-weight:700; color:#fb923c; white-space:nowrap; flex-shrink:0; }

        .seo-graphic { width:100%; border-radius:10px; overflow:hidden; margin:20px 0 6px; box-shadow:0 8px 32px rgba(0,0,0,.12); }
        @media(min-width:640px){ .seo-graphic { margin:28px 0 8px; } }

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding:28px 20px; text-align:center; margin:48px 0 0; }
        @media(min-width:640px){ .final-cta-block { padding:clamp(48px,8vw,40px) 20px; margin:60px 0 0; } }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ══ NAV ══ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background dark:bg-gray-900/80 backdrop-blur-none"}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <div
              className="flex items-center space-x-1 group cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Insydz Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">
                Insydz
              </span>
            </div>

            <div
              className="hidden lg:flex items-center space-x-0.5 xl:space-x-1"
              ref={dropdownRef}
            >
              <DesktopDropdown label="Solutions" menuKey="Solutions" />
              <DesktopDropdown label="Use Cases" menuKey="Use Cases" />
              <DesktopDropdown label="Features" menuKey="Features" />
              <button
                onClick={() => router.push("/pricing")}
                onMouseEnter={() => setActiveDropdown(null)}
                className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Pricing
              </button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare" menuKey="Compare" />
              <DesktopDropdown
                label="Resources"
                menuKey="Resources"
                accent="orange"
              />
              <DesktopDropdown label="About" menuKey="About" />
              <Button
                onClick={() => router.push("/login")}
                onMouseEnter={() => setActiveDropdown(null)}
                className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Login
              </Button>
              <button
                className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />
                )}
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button
                className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                )}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <button
                onClick={() => {
                  router.push("/resources/expert-blog");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </button>
              {(
                [
                  ["Solutions", "Solutions", "purple"],
                  ["Use Cases", "Use Cases", "purple"],
                  ["Features", "Features", "purple"],
                  ["Free Tools", "Free Tools", "purple"],
                  ["Compare", "Compare", "purple"],
                  ["Resources", "Resources", "orange"],
                  ["About", "About", "purple"],
                ] as [string, keyof NavigationMenu, string][]
              ).map(([label, key, accent]) => (
                <div key={label}>
                  <button
                    onClick={() => toggleMobileMenu(label)}
                    className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${accent === "orange" ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
                  >
                    {label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-3 sm:ml-4 mt-0.5 space-y-0.5">
                      {navigationMenu[key].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleMenuItemClick(item)}
                          className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-left flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
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
                onClick={() => {
                  router.push("/pricing");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                Pricing
              </button>
              <Button
                onClick={() => {
                  router.push("/login");
                  setIsMenuOpen(false);
                }}
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-sm py-2"
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section
        className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800"
        style={{ paddingTop: "clamp(80px, 12vw, 100px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 flex-wrap">
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
              Expert Blog
            </button>
            <span>/</span>
            <span className="text-orange-500 font-medium">
              Amazon SEO Tool India
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full" />
            SEO &amp; Keyword Intelligence
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-5 max-w-3xl">
            Amazon{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              SEO Tool India:
            </span>{" "}
            Keyword Research &amp; Rank Tracking Guide for Sellers (2026)
          </h1>

          <p
            className="text-base sm:text-sm md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-5 sm:mb-7"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Discover how an{" "}
            <InLink to="/solutions/amazon-sellers">
              amazon SEO tool india
            </InLink>{" "}
            built for India helps sellers improve search ranking and product
            visibility on Amazon.in with India-specific keyword data, daily rank
            tracking, and AI-powered listing recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pb-5 sm:pb-7 border-b border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <strong
                className="text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors cursor-pointer"
                onClick={() => router.push("/author/vikrant-singh")}
              >
                Vikrant Singh
              </strong>
            </div>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">
              ·
            </span>
            <span className="hidden sm:inline">
              Last updated:{" "}
              <strong className="text-gray-700 dark:text-gray-300">
                January 2026
              </strong>
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <strong className="text-gray-700 dark:text-gray-300">
                13 min read
              </strong>
            </div>
            <span className="bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded">
              Updated 2026
            </span>
          </div>

          <div className="stat-strip">
            {(
              [
                ["70%", "of Amazon.in buyers never scroll past page 1"],
                [
                  "72%",
                  "revenue growth achieved by optimising one keyword gap",
                ],
                [
                  "3–6 wks",
                  "to see measurable rank improvement after optimisation",
                ],
                ["₹1999", "Insydz plans from — with a forever-free tier"],
              ] as [string, string][]
            ).map(([num, lbl]) => (
              <div className="stat-item" key={num}>
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {num}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-tight">
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogImageSection
              imageSrc="/Amazon-SEO-Tool-India.png"
              altText="Insydz Keyword Tracker — real-time keyword ranking and AI-powered listing recommendations for Amazon."
              caption="Insydz Keyword Tracker real-time keyword ranking and AI-powered listing recommendations for Amazon."
            />
          </div>
        </div>
      </section>

      {/* ══ KEY TAKEAWAYS ══ */}
      <div
        style={{ maxWidth: 1250, margin: "0 auto", padding: "20px 16px 0" }}
        className="sm:px-5 lg:px-6"
      >
        <div className="takeaway-box">
          <h3>Key Takeaways for Indian Amazon Sellers</h3>
          {[
            <span key="t0">
              70% of Amazon.in buyers never scroll past page 1 if you're not
              ranking, you're invisible, regardless of your product quality.
            </span>,
            <span key="t1">
              Amazon's A9 algorithm ranks products based on keyword relevance
              AND conversion performance poor SEO leads to wasted ad spend, not
              just low organic rank.
            </span>,
            <span key="t2">
              Indian buyers use Hinglish and regional search patterns that
              US-centric tools miss India-specific keyword data is a fundamental
              competitive advantage.
            </span>,
            <span key="t3">
              The biggest SEO opportunity for most Indian sellers is competitor
              keyword gap analysis ranking for terms your rivals use that you
              don't even have in your listing.
            </span>,
            <span key="t4">
              Listing optimisation is a one-time effort that compounds over time
              unlike ad spend, which stops the moment you pause it.
            </span>,
            <span key="t5">
              Running Sponsored Products without optimising organic SEO first is
              burning ad budget with one hand while blocking the other.
            </span>,
            <span key="t6">
              Weekly use of an{" "}
              <InLink to="/use-cases/track-competitor-prices">
                amazon rank tracking tool
              </InLink>{" "}
              catches ranking drops before they become revenue drops the earlier
              you act, the less you lose.
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
        <aside className="toc-sidebar">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 sm:mb-4">
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

        <main style={{ minWidth: 0 }}>
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
            {/* ── S1: What Is ─────────────────────────────────────────── */}
            <h2 id="s1">
              What is an Amazon SEO Tool for India? (And Why Most Sellers Don't
              Have One)
            </h2>
            <p>
              An <InLink to="/">Amazon SEO tool</InLink> for India is a software
              platform that helps Indian sellers find the right keywords track
              their product rankings and optimise product listings to rank
              higher on Amazon.in so their products appear higher in search
              results and in front of buyers who are ready to purchase.
            </p>
            <p>
              Here's the reality check:{" "}
              <strong>
                70% of Amazon.in customers never scroll past the first page
              </strong>{" "}
              of search results. If your product isn't ranking for the keywords
              your buyers are actually using, you're essentially invisible
              regardless of how good your product is.
            </p>

            <div className="callout teal">
              <div className="callout-label">In Simple Terms</div>
              <div className="callout-text">
                Amazon SEO means making your product show up when buyers search
                on Amazon.in. An Amazon SEO tool tells you exactly which words
                buyers are using, how well your product ranks for those words
                today, and what you need to fix in your listing to rank higher
                and sell more tomorrow.
              </div>
            </div>

            {/* ── S2: Why Critical ────────────────────────────────────── */}
            <h2 id="s2">
              Why Does an Amazon SEO Tool Matter for Indian Sellers?
            </h2>
            <h3>Search Visibility = Sales. No Visibility = No Sales.</h3>
            <p>
              On Amazon.in, the search bar is where the purchase decision
              begins. If your listing isn't optimised for the exact phrases
              buyers use, Amazon's A9 algorithm will rank you below competitors
              who are. The gap between page 1 and page 3 isn't inconvenient it's
              a <strong>90% drop in potential clicks</strong>.
            </p>

            <h3>Indian Buyers Search Differently</h3>
            <p>
              Indian buyers search in a mix of English and Hinglish "kitchen
              chimney under 5000", "best mobile under 15000", "cricket bat for
              beginners". A US-centric tool trained on American search behaviour
              will miss these patterns entirely. An Amazon SEO tool for India
              understands this language nuance and surfaces keywords that
              actually convert on Amazon.in.
            </p>

            <h3>The Algorithm Gap: Most Sellers Are Guessing</h3>
            <p>
              Amazon's A9 algorithm ranks products based on keyword relevance
              and performance. Most Indian sellers write their product titles
              and descriptions based on gut feel missing high-volume keywords,
              stuffing irrelevant terms, or ignoring backend search terms
              entirely. The result: poor ranking, low conversions, wasted ad
              spend.
            </p>

            <div className="callout warn">
              <div className="callout-label">
                Real Seller Example Pune Water Bottle Seller
              </div>
              <div className="callout-text">
                A Pune-based seller of stainless steel water bottles was doing
                ₹1.8 lakh/month on Amazon. After an SEO audit, they discovered
                their listing wasn't ranking for "leak proof water bottle
                office." They updated their listing and ran a small Sponsored
                Products campaign. Within 45 days,{" "}
                <strong>revenue grew to ₹3.1 lakh/month — a 72% jump</strong>{" "}
                without changing their product or price.
              </div>
            </div>

            <div className="callout indigo">
              <div className="callout-label">AI Overview Summary</div>
              <div className="callout-text">
                Amazon SEO tools for India help sellers identify high-converting
                keywords, track daily ranking positions, and optimise product
                listings to rank higher on Amazon.in's A9 algorithm. For Indian
                sellers, tools built specifically for the Indian market surface
                Hinglish search patterns and India-specific keyword data that
                global tools miss directly impacting product visibility and
                sales conversion.
              </div>
            </div>

            {/* ── S3: How It Works ────────────────────────────────────── */}
            <h2 id="s3">How Does an Amazon SEO Tool Work? (Step-by-Step)</h2>
            <p>
              Understanding what happens inside an Amazon SEO tool helps you use
              it more effectively. Here's the 5-step intelligence pipeline:
            </p>

            <div className="pipe-visual">
              <div className="pipe-left">
                <h3>
                  5 Steps.
                  <br />
                  <span>Rank #1.</span>
                </h3>
                <p>
                  From keyword gap to page-one ranking automated, 24×7, on
                  Amazon.in.
                </p>
              </div>
              <div className="pipe-card">
                <div className="pipe-card-bar">
                  <div className="pip-dot" style={{ background: "#ff5f57" }} />
                  <div className="pip-dot" style={{ background: "#febc2e" }} />
                  <div className="pip-dot" style={{ background: "#28c840" }} />
                  <span className="pipe-card-title">Insydz SEO Pipeline</span>
                  <span className="live-badge">● Active</span>
                </div>
                {[
                  {
                    n: 1,
                    color: "#EC4899",
                    name: "Keyword Discovery",
                    desc: "Pulls Amazon.in queries from your category",
                    tag: "auto-tag",
                    label: "Automated",
                  },
                  {
                    n: 2,
                    color: "#7C3AED",
                    name: "Competitor Keyword Gap",
                    desc: "Reveals what rivals rank for you don't",
                    tag: "ai-tag",
                    label: "AI-Powered",
                  },
                  {
                    n: 3,
                    color: "#2563EB",
                    name: "Listing Health Audit",
                    desc: "Scores title, bullets, backend 0–100",
                    tag: "ai-tag",
                    label: "AI-Powered",
                  },
                  {
                    n: 4,
                    color: "#0D9488",
                    name: "Daily Rank Tracking",
                    desc: "WhatsApp alert if you drop positions",
                    tag: "auto-tag",
                    label: "Automated",
                  },
                  {
                    n: 5,
                    color: "#16A34A",
                    name: "AI Optimisation Recommendations",
                    desc: '"Add this phrase 22K monthly searches"',
                    tag: "green-tag",
                    label: "AI Decision",
                  },
                ].map((s) => (
                  <div className="pipe-step" key={s.n}>
                    <div
                      className="pipe-step-n"
                      style={{ background: s.color }}
                    >
                      {s.n}
                    </div>
                    <div>
                      <span className="pipe-step-name">{s.name}</span>
                      <span className="pipe-step-desc">{s.desc}</span>
                      <span className={`pipe-step-tag ${s.tag}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="img-caption" style={{ textAlign: "center" }}>
              Insydz 5-step SEO intelligence pipeline from keyword discovery to
              actionable listing recommendations
            </p>

            <div className="callout pro">
              <div className="callout-label">Guesswork vs. Intelligence</div>
              <div className="callout-text">
                Guesswork means writing your listing based on what sounds right
                to you. Intelligence means writing it based on what 50,000
                actual Amazon buyers searched for last month. The difference is
                the gap between page 3 and page 1.
              </div>
            </div>

            {/* ── S4: Core Components ─────────────────────────────────── */}
            <h2 id="s4">Core Components of Amazon SEO for Indian Sellers</h2>
            <p>
              A complete Amazon SEO strategy covers six interconnected
              components. Missing any one of them leaves a gap your competitors
              will exploit.
            </p>

            <div
              className="seo-graphic"
              style={{
                background:
                  "linear-gradient(135deg,#0f172a 0%,#1e1b4b 42%,#4c1d95 100%)",
                padding: "clamp(16px,4vw,28px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "clamp(14px,3vw,24px)",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ maxWidth: 220, flexShrink: 0 }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: "rgba(124,58,237,.2)",
                      border: "1px solid rgba(124,58,237,.3)",
                      color: "#C4B5FD",
                      fontSize: "clamp(9px,1.5vw,11px)",
                      fontWeight: 700,
                      letterSpacing: ".7px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 20,
                      marginBottom: 12,
                    }}
                  >
                    Six Pillars
                  </div>
                  <div
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "clamp(18px,3vw,26px)",
                      fontWeight: 900,
                      color: "white",
                      lineHeight: 1.18,
                      letterSpacing: -1,
                      marginBottom: 10,
                    }}
                  >
                    Complete
                    <br />
                    Amazon
                    <br />
                    <span style={{ color: "#FDE68A" }}>SEO System</span>
                  </div>
                  <p
                    style={{
                      fontSize: "clamp(10px,1.5vw,12.5px)",
                      color: "rgba(255,255,255,.5)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Every SEO component tracked in one dashboard gaps, rank,
                    health score, all live.
                  </p>
                </div>
                <div className="dash-dark" style={{ flex: 1, minWidth: 0 }}>
                  <div className="dash-bar">
                    <div
                      className="pip-dot"
                      style={{ background: "#ff5f57" }}
                    />
                    <div
                      className="pip-dot"
                      style={{ background: "#febc2e" }}
                    />
                    <div
                      className="pip-dot"
                      style={{ background: "#28c840" }}
                    />
                    <span className="dash-title">
                      Keyword Intelligence — Amazon.in
                    </span>
                    <span className="dash-live">● Live</span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    {[
                      {
                        lbl: "Keywords",
                        val: "248",
                        color: "#f9a8d4",
                        delta: "↑ 34 this week",
                        dc: "#4ade80",
                      },
                      {
                        lbl: "Avg Rank",
                        val: "#8.4",
                        color: "#c4b5fd",
                        delta: "↑ from #12",
                        dc: "#4ade80",
                      },
                      {
                        lbl: "Health",
                        val: "84",
                        color: "#4ade80",
                        delta: "↑ from 61",
                        dc: "#4ade80",
                      },
                      {
                        lbl: "KW Gaps",
                        val: "17",
                        color: "#fb923c",
                        delta: "⚠ Fix now",
                        dc: "#f87171",
                      },
                    ].map((m) => (
                      <div
                        key={m.lbl}
                        style={{
                          padding: "clamp(7px,1.5vw,11px) clamp(4px,1vw,8px)",
                          borderRight: "1px solid rgba(255,255,255,.05)",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "clamp(7px,1vw,8px)",
                            fontWeight: 700,
                            color: "rgba(255,255,255,.3)",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                            marginBottom: 3,
                          }}
                        >
                          {m.lbl}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Sora',sans-serif",
                            fontSize: "clamp(13px,2.5vw,18px)",
                            fontWeight: 900,
                            color: m.color,
                            lineHeight: 1,
                          }}
                        >
                          {m.val}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(7px,1vw,8.5px)",
                            fontWeight: 600,
                            marginTop: 2,
                            color: m.dc,
                          }}
                        >
                          {m.delta}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    {[
                      {
                        term: "mixer grinder 750 watt induction",
                        vol: "31.2K/mo",
                        pos: "#4",
                        cls: "kp-g",
                      },
                      {
                        term: "juicer mixer grinder 3 jar",
                        vol: "28.7K/mo",
                        pos: "#9",
                        cls: "kp-a",
                      },
                      {
                        term: "best mixer under 3000",
                        vol: "19.4K/mo",
                        pos: "#6",
                        cls: "kp-g",
                      },
                      {
                        term: "mixer grinder for home use",
                        vol: "14.1K/mo",
                        pos: "#19",
                        cls: "kp-r",
                      },
                    ].map((k) => (
                      <div className="kw-row-dark" key={k.term}>
                        <span className="kw-term">{k.term}</span>
                        <span className="kw-vol">{k.vol}</span>
                        <span className={`kw-pos ${k.cls}`}>{k.pos}</span>
                      </div>
                    ))}
                  </div>
                  <div className="alert-bar">
                    <div className="alert-dot" />
                    <span className="alert-txt">
                      Gap: "chapati maker electric 1500w" — 26K searches, 0
                      ranking
                    </span>
                    <span className="alert-act">Fix ›</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="img-caption">
              Insydz Keyword Intelligence Dashboard tracking 248 keywords with
              live gap detection and rank movement alerts
            </p>

            <div className="dt-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>SEO Component</th>
                    <th>What It Is</th>
                    <th>Why It Matters</th>
                    <th>Manual vs. Tool</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      {
                        comp: "Keyword Research",
                        compLink: null,
                        what: "Finding search terms buyers actually use",
                        why: "Wrong keywords = zero visibility",
                        whyLink: null,
                        vs: "Manual: 3–5 hrs, incomplete",
                        tag: "bg",
                        vt: "Tool: minutes, data-backed",
                      },
                      {
                        comp: "Title Optimisation",
                        compLink: null,
                        what: "Structuring product title with primary keywords",
                        why: "Title has highest SEO weight in A9",
                        whyLink: null,
                        vs: "Manual: guesswork",
                        tag: "bg",
                        vt: "Tool: scored suggestions",
                      },
                      {
                        comp: "Backend Keywords",
                        compLink: null,
                        what: "Hidden keywords in Seller Central",
                        why: "Extra ranking signals without cluttering listing",
                        whyLink: null,
                        vs: "Manual: often forgotten",
                        tag: "bb",
                        vt: "Tool: AI-generated list",
                      },
                      {
                        comp: "Rank Tracking",
                        compLink: null,
                        what: "Daily ranking position for target keywords",
                        why: "Catch ranking drops before they become revenue drops",
                        whyLink: null,
                        vs: "Manual: impossible at scale",
                        tag: "bg",
                        vt: "Tool: automated daily",
                      },
                      {
                        comp: "Competitor Keyword Gap",
                        compLink: null,
                        what: "Keywords rivals rank for that you don't",
                        why: "Biggest source of untapped traffic",
                        whyLink: null,
                        vs: "Manual: hours per competitor",
                        tag: "bg",
                        vt: "Tool: instant audit",
                      },
                      {
                        comp: "Listing Health Score",
                        compLink: null,
                        what: "Overall SEO quality of your listing",
                        why: "Identifies weakest link in your ranking",
                        whyLink: null,
                        vs: "Manual: no benchmark",
                        tag: "bb",
                        vt: "Tool: 0–100 score with fixes",
                      },
                    ] as {
                      comp: string;
                      compLink: string | null;
                      what: string;
                      why: string;
                      whyLink: string | null;
                      vs: string;
                      tag: string;
                      vt: string;
                    }[]
                  ).map((r, i) => (
                    <tr key={i}>
                      <td>
                        <strong>
                          {r.compLink ? (
                            <InLink to={r.compLink}>{r.comp}</InLink>
                          ) : (
                            r.comp
                          )}
                        </strong>
                      </td>
                      <td>{r.what}</td>
                      <td>
                        {r.whyLink ? (
                          <InLink to={r.whyLink}>{r.why}</InLink>
                        ) : (
                          r.why
                        )}
                      </td>
                      <td>
                        {r.vs} | <span className={r.tag}>{r.vt}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── S5: Mistakes ────────────────────────────────────────── */}
            <h2 id="s5">5 Critical Amazon SEO Mistakes Indian Sellers Make</h2>
            <p>
              These five mistakes are costing Indian sellers ranking positions,
              organic traffic, and sales often without them realising it.
            </p>

            {/* Mistake 1 */}
            <div className="mistake-card">
              <div className="mistake-num">1</div>
              <div className="mistake-body">
                <strong>Writing Listings for Themselves, Not for Buyers</strong>
                <p>
                  A seller who makes 'premium handcrafted artisanal wooden phone
                  stand' when buyers are searching 'wooden mobile stand for
                  desk' has a listing that will never rank. The vocabulary you
                  use to describe your product and the vocabulary your buyers
                  use to find it are often completely different. An Amazon SEO
                  tool bridges this gap with actual search data.
                </p>
              </div>
            </div>

            {/* Mistake 2 */}
            <div className="mistake-card">
              <div className="mistake-num">2</div>
              <div className="mistake-body">
                <strong>Ignoring Hinglish and Regional Search Patterns</strong>
                <p>
                  Buyers in smaller cities search differently from metro buyers.
                  'Mixer grinder' vs 'juicer mixer grinder', 'chapati maker' vs
                  'roti maker', 'pressure cooker induction' vs 'induction
                  pressure cooker'. Missing regional search variants costs
                  sellers in tier-2 and tier-3 cities the fastest-growing
                  e-commerce segments in India right now.
                </p>
              </div>
            </div>

            {/* Mistake 3 */}
            <div className="mistake-card">
              <div className="mistake-num">3</div>
              <div className="mistake-body">
                <strong>
                  Keyword Stuffing (The Old Way That Now Hurts You)
                </strong>
                <p>
                  Amazon's A9 algorithm has gotten smarter. Stuffing 15 keywords
                  into your title doesn't improve ranking it reduces
                  click-through rate because the title reads like gibberish.{" "}
                  Amazon penalises poor conversion rates, which feeds back into
                  lower ranking. Smart keyword placement in title, bullets, and
                  backend is more effective than volume stuffing.
                </p>
              </div>
            </div>

            {/* Mistake 4 */}
            <div className="mistake-card">
              <div className="mistake-num">4</div>
              <div className="mistake-body">
                <strong>Running Ads Without an Organic SEO Foundation</strong>
                <p>
                  Many Indian sellers jump straight to Sponsored Products
                  without fixing their listing first. If your listing isn't
                  converting organically, your ad spend will also convert poorly
                  and Amazon's ad algorithm will throttle your ad visibility as
                  a result. Every rupee spent on ads performs better when the
                  underlying listing is SEO-optimised.
                </p>
              </div>
            </div>

            {/* Mistake 5 */}
            <div className="mistake-card">
              <div className="mistake-num">5</div>
              <div className="mistake-body">
                <strong>
                  Setting Up a Listing Once and Never Revisiting It
                </strong>
                <p>
                  Amazon search trends shift. New competitors enter. Seasonal
                  keywords spike. A listing optimised in January may be
                  significantly underperforming by July if you haven't tracked
                  and updated it. Rank tracking tools catch this drift early
                  before it becomes a revenue problem.
                </p>
              </div>
            </div>

            {/* Mid CTA */}
            <div className="inline-cta">
              <div>
                <h4>See Your Keyword Gaps in Minutes</h4>
                <p>
                  Free forever plan. No credit card. No jargon. Just clearer
                  decisions for your Amazon.in listings.
                </p>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm px-5 sm:px-6 py-3 rounded-xl transition-all whitespace-nowrap w-full sm:w-auto"
              >
                Start Free at insydz.com →
              </button>
            </div>

            {/* ── S6: Best Practices ──────────────────────────────────── */}
            <h2 id="s6">Best Practices: Weekly Amazon SEO Execution Model</h2>
            <p>
              The most effective Amazon SEO isn't a one-time project it's a
              repeatable weekly workflow. Here's the model that high-performing
              Indian sellers follow to maintain and grow organic rank
              consistently.
            </p>

            <BlogImageSection
              imageSrc="/eight.png"
              altText="Weekly Amazon SEO execution model for Indian sellers"
              caption="Insydz weekly SEO execution model — a structured workflow for sustained organic rank growth on Amazon.in"
            />

            <h3>Key Metrics to Track</h3>
            <div className="metrics-grid">
              {(
                [
                  {
                    num: "Top 10",
                    lbl: "Organic rank for target keywords (track daily)",
                    link: "/features/keyword-rank-tracking-feature",
                  },
                  {
                    num: "CTR",
                    lbl: "Click-through rate low CTR signals poor title or image",
                    link: null,
                  },
                  {
                    num: "CVR",
                    lbl: "Conversion rate low CVR means listing isn't convincing buyers",
                    link: null,
                  },
                  {
                    num: "Organic Split",
                    lbl: "Keyword-level organic vs. paid sales breakdown",
                    link: null,
                  },
                ] as { num: string; lbl: string; link: string | null }[]
              ).map((m, i) => (
                <div className="metric-card" key={i}>
                  <span className="metric-num">
                    {m.link ? <InLink to={m.link}>{m.num}</InLink> : m.num}
                  </span>
                  <span className="metric-lbl">{m.lbl}</span>
                </div>
              ))}
            </div>

            {/* ── S7: Best Tools ──────────────────────────────────────── */}
            <h2 id="s7">Best Amazon SEO Tools for Indian Sellers</h2>
            <h3>Global Tools: Powerful, But Built for a Different Market</h3>
            <p>
              Cerebro and Jungle Scout's keyword tools are the industry standard
              for Amazon sellers in the US and UK. But for Indian sellers, three
              gaps make them a poor fit:
            </p>
            <ul>
              <li>
                <strong>Price:</strong> Helium 10's plans start at $39–99/month
                (₹3,300–8,300). For a seller doing ₹3–5 lakh/month, this is a
                significant cost for one tool out of many you need.
              </li>
              <li>
                <strong>Data:</strong> Their keyword databases are built
                primarily on Amazon.com (US). Amazon.in search volumes, Hinglish
                patterns, and Indian buying intent keywords are significantly
                underrepresented.
              </li>
              <li>
                <strong>Platform:</strong> None of these tools support Flipkart
                SEO which matters enormously for sellers who run multi-platform
                businesses.
              </li>
            </ul>

            <h3>
              <strong>Insydz: Amazon SEO Intelligence Built for India</strong>
            </h3>
            <p>
              Insydz approaches Amazon SEO differently not as a standalone
              keyword tool, but as a connected intelligence layer that ties SEO
              to competitor pricing, review sentiment, and market trends
              simultaneously.
            </p>

            <BlogImageSection
              imageSrc="/nine.png"
              altText="Tool comparison: Insydz vs global SEO tools for Indian sellers"
              caption="Tool comparison: Insydz vs. global SEO tools — India-specific keyword data, Flipkart coverage, and WhatsApp alerts make the difference"
            />

            <div className="callout pink">
              <div className="callout-label">The India Advantage</div>
              <div className="callout-text">
                The real advantage of an India-first tool isn't just
                affordability it's that the data actually reflects how Indian
                buyers search. A keyword tool that doesn't understand "best
                laptop under 40000" or "mixer grinder 750 watt" as high-intent
                queries on Amazon.in is only giving you half the picture.
              </div>
            </div>

            {/* ── FAQ ─────────────────────────────────────────────────── */}
            <h2 id="s9">Frequently Asked Questions</h2>

            {/* FAQ 0 */}
            <div className={`faq-item${openFaq === 0 ? " open" : ""}`}>
              <div
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
              >
                <span>{FAQS[0].q}</span>
                <div className={`faq-icon${openFaq === 0 ? " open" : ""}`}>
                  +
                </div>
              </div>
              {openFaq === 0 && <div className="faq-a">{FAQS[0].a}</div>}
            </div>

            {/* FAQ 1 */}
            <div className={`faq-item${openFaq === 1 ? " open" : ""}`}>
              <div
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              >
                <span>{FAQS[1].q}</span>
                <div className={`faq-icon${openFaq === 1 ? " open" : ""}`}>
                  +
                </div>
              </div>
              {openFaq === 1 && (
                <div className="faq-a">
                  Google SEO is about ranking web pages for information queries.
                  Amazon SEO is about ranking product listings for purchase
                  queries. <InLink to="/features">Amazon's A9 algorithm</InLink>{" "}
                  weighs keyword relevance, sales velocity, pricing
                  competitiveness, reviews, and conversion rate not backlinks or
                  domain authority. A standard website SEO tool is useless for
                  Amazon you need a marketplace-specific tool that understands
                  e-commerce ranking signals.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className={`faq-item${openFaq === 2 ? " open" : ""}`}>
              <div
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              >
                <span>{FAQS[2].q}</span>
                <div className={`faq-icon${openFaq === 2 ? " open" : ""}`}>
                  +
                </div>
              </div>
              {openFaq === 2 && (
                <div className="faq-a">
                  Start with high-intent, mid-competition keywords not the most
                  popular terms in your category. For example, 'buy yoga mat
                  online' has enormous competition. 'Anti-slip yoga mat 6mm for
                  women' has lower competition and higher purchase intent. An{" "}
                  <InLink to="/resources/expert-blog/amazon-seo-tool-india">
                    Amazon Keyword Research India
                  </InLink>{" "}
                  tool will show you search volume, competition level, and
                  estimated conversion rate so you can prioritise intelligently
                  rather than going after the hardest keywords first.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className={`faq-item${openFaq === 3 ? " open" : ""}`}>
              <div
                className="faq-q"
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
              >
                <span>{FAQS[3].q}</span>
                <div className={`faq-icon${openFaq === 3 ? " open" : ""}`}>
                  +
                </div>
              </div>
              {openFaq === 3 && (
                <div className="faq-a">
                  Most sellers see measurable ranking improvement within 3–6
                  weeks of a well-executed listing optimisation. Organic ranking
                  changes aren't instant Amazon needs time to index changes and
                  measure their impact on conversion rate. Combining listing
                  optimisation with a targeted{" "}
                  <InLink to="/resources/expert-blog">
                    Sponsored Products
                  </InLink>{" "}
                  campaign on your new keywords accelerates the timeline
                  significantly. Use{" "}
                  <InLink to="/features/keyword-rank-tracking-feature">
                    daily rank tracking
                  </InLink>{" "}
                  weekly (not daily) for accurate progress assessment.
                </div>
              )}
            </div>

            {/* FAQs 4 & 5 */}
            {([4, 5] as const).map((i) => (
              <div
                className={`faq-item${openFaq === i ? " open" : ""}`}
                key={i}
              >
                <div
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{FAQS[i].q}</span>
                  <div className={`faq-icon${openFaq === i ? " open" : ""}`}>
                    +
                  </div>
                </div>
                {openFaq === i && <div className="faq-a">{FAQS[i].a}</div>}
              </div>
            ))}

            {/* ── Related Guides ──────────────────────────────────────── */}
            <h2 style={{ marginTop: "clamp(36px,6vw,56px)" }}>
              Related Guides
            </h2>
            <div className="related-grid">
              {(
                [
                  {
                    cardTitle:
                      "Amazon Competitor Price Tracking Tool India: Complete Guide (2026)",
                    tag: "Price Tracking",
                    imgSrc: "/one.png",
                    route:
                      "/resources/expert-blog/amazon-competitor-price-tracking-tool",
                  },
                  {
                    cardTitle:
                      "Best Competitor Price Tracking Tools for Indian Sellers: 2026 Guide",
                    tag: "Tool Comparison",
                    imgSrc: "/thirteen.png",
                    route: "/compare/insydzvshelium",
                  },
                  {
                    cardTitle:
                      "How to Win the Amazon Buy Box in India: Seller's Pricing Guide",
                    tag: "Buy Box Strategy",
                    imgSrc: "/three.png",
                    route: "/use-cases/track-competitor-prices",
                  },
                ] as {
                  cardTitle: string;
                  tag: string;
                  imgSrc: string;
                  route: string;
                }[]
              ).map((r) => (
                <div
                  key={r.cardTitle}
                  className="related-card"
                  onClick={() => router.push(r.route)}
                >
                  <div className="related-thumb">
                    <img src={r.imgSrc} alt={r.cardTitle} />
                  </div>
                  <div className="related-body">
                    <div className="related-tag">{r.tag}</div>
                    <div className="related-title">{r.cardTitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div className="final-cta-block">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-2 sm:mb-3"
          style={{ fontFamily: "'Sora',sans-serif" }}
        >
          The Amazon SEO Tool Built for India.
        </h2>
        <p
          className="text-blue-100 text-sm sm:text-base md:text-lg"
          style={{
            fontFamily: "'Lora', serif",
            maxWidth: 520,
            margin: "0 auto 20px",
          }}
        >
          Optimise your Amazon.in listings with AI-powered keyword data,
          real-time rank tracking, and WhatsApp alerts — all in one dashboard.
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
            "AI listing optimisation",
            "Real-time rank tracking",
            "WhatsApp SEO alerts",
            "Free to start",
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
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
          Optimise My Listings Free →
        </button>
        <p className="text-blue-200 text-xs mt-3 sm:mt-4">
          Amazon.in + Flipkart · Hinglish keywords · No card needed
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
