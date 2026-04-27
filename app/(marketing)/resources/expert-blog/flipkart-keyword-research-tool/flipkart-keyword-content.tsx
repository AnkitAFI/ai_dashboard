"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Clock, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen, Video, FileText,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Nav Types ─────────────────────────────────────────────────────────────────
type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
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
    { name: "Our Vision", icon: <Globe className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Users className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

const TOC = [
  { id: "s1", label: "Importance of Keywords" },
  { id: "s2", label: "Flipkart Algorithm Unpacked" },
  { id: "s3", label: "Why Attributes Matter" },
  { id: "s4", label: "Keyword Tracking Realities" },
  { id: "s5", label: "Big Billion Days Prep" },
  { id: "s6", label: "Weekly Growth Checklist" },
  { id: "s7", label: "Key Takeaways" },
  { id: "s8", label: "FAQ" },
];

const FAQS = [
  {
    q: "What is the best Flipkart keyword research tool for Indian sellers?",
    a: "Insydz is the only India-first platform providing simultaneous Flipkart and Amazon.in keyword tracking with real-time rank monitoring, WhatsApp alerts, and AI-powered listing optimisation at Rs 1,999/month with a free plan."
  },
  {
    q: "How does Flipkart SEO optimization differ from Amazon SEO?",
    a: "Flipkart places significantly more weight on product attribute completeness than Amazon A10 and has unique signals including F-Assured status and a Product Discovery AI."
  },
  {
    q: "How does Flipkart's search algorithm rank products?",
    a: "Flipkart scores listings across: keyword relevance 35%, attribute completeness 28%, seller performance 22%, buyer engagement 10%, and price competitiveness 5%."
  },
  {
    q: "Can I track my Flipkart keyword rank positions in real time?",
    a: "Yes with India-first tools like Insydz. Flipkart Seller Hub provides no organic keyword rank data and no global tool tracks Flipkart positions."
  },
  {
    q: "What are the most important keywords for Flipkart listings?",
    a: "F-Assured terms 18-24% conversion, attribute-specific queries 22-30%, and price-bracket terms 12-18% are the highest-converting Flipkart keyword categories."
  },
  {
    q: "How early should I optimise keywords for Flipkart Big Billion Days?",
    a: "Start 6-8 weeks before the event — early September for an October BBD. Flipkart pre-ranks category pages 3-4 weeks before the event goes live."
  }
];

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

const InLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); router.push(to); window.scrollTo(0, 0); }}
      style={{
        color: "#ea580c", textDecoration: "underline", textDecorationColor: "#fed7aa",
        textUnderlineOffset: "3px", fontWeight: 600, cursor: "pointer", transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#c2410c")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#ea580c")}
    >
      {children}
    </a>
  );
};

export default function FlipkartKeywordContent() {
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

  useEffect(() => { document.documentElement.classList.toggle("dark", isDarkMode); }, [isDarkMode]);

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

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };

  const toggleMobileMenu = (name: string) => setMobileActiveMenu(prev => prev === name ? null : name);

  const DesktopDropdown = ({ label, menuKey, accent = "purple" }: { label: string; menuKey: keyof NavigationMenu; accent?: "purple" | "orange" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive
            ? ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold"
            : ac
              ? "text-orange-600 dark:text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            }`}
        >
          {label}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
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
                className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 group ${ac ? "hover:bg-orange-50 dark:hover:bg-orange-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
              >
                <span className={`flex-shrink-0 ${ac ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">{item.badge}</span>}
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
        .read-progress { position:fixed; top:80px; left:0; height:3px; background:linear-gradient(90deg,#f97316,#ef4444); z-index:200; transition:width .1s linear; border-radius:0 2px 2px 0; }
        .article-layout { max-width:1200px; margin:0 auto; padding:48px 24px 80px; display:grid; grid-template-columns:240px 1fr; gap:48px; align-items: start; }
        @media(max-width:768px){ .article-layout { grid-template-columns:1fr; gap:0; padding:24px 16px 60px; } }
        .toc-sidebar { position:sticky; top:100px; background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,.05); max-height:calc(100vh - 120px); overflow-y:auto; }
        .dark .toc-sidebar { background:#111827; border-color:#1f2937; }
        @media(max-width:768px){ .toc-sidebar { display:none; } }
        .mobile-toc-btn { display:none; }
        @media(max-width:768px){ .mobile-toc-btn { display:flex; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; color:#111; cursor:pointer; align-items:center; justify-content:space-between; margin-bottom:14px; } }
        .dark .mobile-toc-btn { background:#111827; border-color:#1f2937; color:#f9fafb; }
        .mobile-toc-panel { display:none; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin-bottom:20px; }
        .dark .mobile-toc-panel { background:#111827; border-color:#1f2937; }
        .mobile-toc-panel.open { display:block; }
        .article-body { font-family:'Lora',serif; font-size:clamp(16px, 2vw, 18px); line-height:1.8; color:#374151; }
        .dark .article-body { color:#d1d5db; }
        .article-body h2 { font-family:'Sora',sans-serif; font-size:clamp(22px, 3vw, 32px); font-weight:800; color:#111; letter-spacing:-.8px; margin:52px 0 16px; line-height:1.2; scroll-margin-top:100px; border-bottom:2px solid #e5e7eb; padding-bottom:10px; }
        .dark .article-body h2 { color:#f9fafb; border-color:#1f2937; }
        .article-body h3 { font-family:'Sora',sans-serif; font-size:clamp(18px, 2.5vw, 22px); font-weight:700; color:#111; margin:32px 0 10px; scroll-margin-top:100px; }
        .dark .article-body h3 { color:#f3f4f6; }
        .article-body p { margin-bottom:24px; }
        .article-body ul,.article-body ol { padding-left:24px; margin-bottom:24px; }
        .article-body li { margin-bottom:10px; }
        .article-body li::marker { color:#f97316; }
        .article-body strong { font-weight:700; color:#111; }
        .dark .article-body strong { color:#f9fafb; }
        .callout { border-radius:16px; padding:24px 30px; margin:32px 0; }
        .callout.teal  { background:#f0fdfa; border:1px solid #99f6e4; border-left:6px solid #0d9488; }
        .callout.warn  { background:#fffbeb; border:1px solid #fcd34d; border-left:6px solid #d97706; }
        .callout.pro   { background:#f0fdf4; border:1px solid #86efac; border-left:6px solid #16a34a; }
        .callout.info  { background:#eff6ff; border:1px solid #93c5fd; border-left:6px solid #2563eb; }
        .callout.indigo{ background:#eef2ff; border:1px solid #c7d2fe; border-radius:12px; }
        .callout.pink  { background:#fdf2f8; border-left:6px solid #db2777; }
        .dark .callout.teal  { background:#042f2e; border-color:#134e4a; }
        .dark .callout.warn  { background:#1c1507; border-color:#78350f; }
        .dark .callout.pro   { background:#052e16; border-color:#166534; }
        .dark .callout.info  { background:#0c1a2e; border-color:#1e3a5f; }
        .dark .callout.indigo{ background:#1e1b4b; border-color:#3730a3; }
        .dark .callout.pink  { background:#500724; border-color:#9d174d; }
        .callout-label { font-family:'Sora',sans-serif; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
        .callout.teal  .callout-label { color:#0d9488; }
        .callout.warn  .callout-label { color:#d97706; }
        .callout.pro   .callout-label { color:#16a34a; }
        .callout.info  .callout-label { color:#2563eb; }
        .callout.indigo .callout-label { color:#4f46e5; }
        .callout.pink  .callout-label { color:#db2777; }
        .callout-text { font-family:'Lora',serif; font-size:16px; color:#374151; line-height:1.75; }
        .dark .callout-text { color:#d1d5db; }
        .dt-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; margin:28px 0; border-radius:16px; border:1px solid #e5e7eb; box-shadow:0 6px 24px rgba(0,0,0,.08); }
        .dark .dt-wrap { border-color:#1f2937; }
        table.dt { width:100%; border-collapse:collapse; font-family:'Sora',sans-serif; font-size:14px; min-width:600px; }
        table.dt th { background:#0d1b2a; color:white; padding:16px 20px; text-align:left; font-size:11px; letter-spacing:1px; text-transform:uppercase; }
        table.dt td { padding:16px 20px; border-bottom:1px solid #e5e7eb; color:#374151; vertical-align:middle; }
        .dark table.dt td { border-color:#1f2937; color:#d1d5db; }
        table.dt tr:last-child td { border-bottom:none; }
        table.dt tr:nth-child(even) td { background:#f8fafc; }
        .dark table.dt tr:nth-child(even) td { background:#0f172a; }
        table.dt tr:hover td { background:#fff7ed; }
        .dark table.dt tr:hover td { background:#1c0a00; }
        .bg { background:#dcfce7; color:#15803d; font-weight:700; padding:4px 12px; border-radius:20px; font-size:12px; white-space:nowrap; }
        .bo { background:#fff7ed; color:#ea580c; font-weight:700; padding:4px 12px; border-radius:20px; font-size:12px; white-space:nowrap; }
        .br { background:#fef2f2; color:#dc2626; font-weight:700; padding:4px 12px; border-radius:20px; font-size:12px; white-space:nowrap; }
        .bb { background:#dbeafe; color:#1e40af; font-weight:700; padding:4px 12px; border-radius:20px; font-size:12px; white-space:nowrap; }
        .step { display:flex; gap:20px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:24px; margin-bottom:16px; transition:box-shadow .2s; }
        .step:hover { box-shadow:0 8px 30px rgba(0,0,0,.08); }
        .dark .step { background:#111827; border-color:#1f2937; }
        .step-num { flex-shrink:0; width:40px; height:40px; background:#f97316; color:white; font-family:'Sora',sans-serif; font-weight:800; font-size:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-top:4px; }
        .step-content h4 { font-family:'Sora',sans-serif; font-size:17px; font-weight:700; color:#111; margin-bottom:6px; }
        .dark .step-content h4 { color:#f9fafb; }
        .step-content p { font-size:15px; margin:0; font-family:'Sora',sans-serif; color:#64748b; line-height:1.6; }
        .dark .step-content p { color:#9ca3af; }
        .metrics-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin:32px 0; }
        @media(max-width:640px){ .metrics-grid { grid-template-columns:1fr 1fr; } }
        .metric-card { background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:24px 20px; text-align:center; }
        .dark .metric-card { background:#111827; border-color:#1f2937; }
        .metric-num { font-family:'Sora',sans-serif; font-size:28px; font-weight:800; color:#f97316; line-height:1; display:block; }
        .metric-lbl { font-size:13px; font-weight:600; color:#64748b; margin-top:6px; display:block; line-height:1.4; }
        .dark .metric-lbl { color:#9ca3af; }
        .related-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:24px; }
        @media(max-width:768px){ .related-grid { grid-template-columns:1fr; } }
        .related-card { background:#fff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; cursor:pointer; transition:all .2s; }
        .dark .related-card { background:#111827; border-color:#1f2937; }
        .related-card:hover { border-color:#f97316; box-shadow:0 8px 30px rgba(249,115,22,.15); transform:translateY(-4px); }
        .related-thumb { width:100%; height:140px; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .related-thumb img { width:100%; height:100%; object-fit:cover; }
        .related-body { padding:20px; }
        .related-tag { font-size:11px; font-weight:700; color:#f97316; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
        .related-title { font-size:15px; font-weight:700; color:#0d1b2a; line-height:1.4; font-family:'Sora',sans-serif; }
        .dark .related-title { color:#f9fafb; }
        .faq-item { border:1px solid #e5e7eb; border-radius:16px; margin-bottom:12px; overflow:hidden; background:#fff; transition:border-color .2s, box-shadow .2s; }
        .dark .faq-item { background:#111827; border-color:#1f2937; }
        .faq-item.open { border-color:#f97316; box-shadow:0 4px 12px rgba(249,115,22,0.08); }
        .faq-q { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; cursor:pointer; font-family:'Sora',sans-serif; font-size:17px; font-weight:700; color:#111; gap:16px; user-select:none; }
        .dark .faq-q { color:#f9fafb; }
        .faq-q:hover { background:#f8fafc; }
        .dark .faq-q:hover { background:#1f2937; }
        .faq-icon { flex-shrink:0; width:28px; height:28px; background:#fff7ed; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#f97316; font-size:20px; font-weight:400; transition:transform .2s; }
        .faq-icon.open { transform:rotate(45deg); background:#f97316; color:white; }
        .faq-a { font-family:'Lora',serif; font-size:16px; line-height:1.8; color:#64748b; padding:0 24px 24px; }
        .dark .faq-a { color:#9ca3af; }
        .article-img-wrap { margin:32px 0 10px; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb; background:#f9fafb; box-shadow:0 8px 40px rgba(0,0,0,.08); }
        .dark .article-img-wrap { border-color:#1f2937; background:#111827; }
        .img-shimmer { height:400px; background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%); background-size:400% 100%; animation:imgShimmer 1.6s ease infinite; }
        .img-caption { padding:14px 20px; font-family:'Sora',sans-serif; font-size:13px; color:#9ca3af; line-height:1.6; border-top:1px solid #e5e7eb; background:#f9fafb; font-style:italic; text-align:center; }
        .dark .img-caption { background:#111827; border-color:#1f2937; }
        .stat-strip { display:flex; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; margin-top:40px; box-shadow:0 2px 8px rgba(0,0,0,.05); background:#fff; }
        .dark .stat-strip { border-color:#1f2937; background:#111827; }
        .stat-item { flex:1; padding:24px 30px; text-align:center; border-right:1px solid #e5e7eb; }
        .dark .stat-item { border-color:#1f2937; }
        .stat-item:last-child { border-right:none; }
        @media(max-width:640px){ .stat-strip { flex-direction:column; } .stat-item { border-right:none; border-bottom:1px solid #e5e7eb; } }
        .toc-link { display:block; font-size:13.5px; font-weight:500; color:#6b7280; padding:8px 12px; border-radius:8px; cursor:pointer; border:none; background:none; text-align:left; width:100%; transition:all .15s; margin-bottom:4px; line-height:1.4; border-left:3px solid transparent; }
        .toc-link:hover { background:#fff7ed; color:#ea580c; }
        .toc-link.active { background:#fff7ed; color:#ea580c; font-weight:700; border-left-color:#f97316; padding-left:12px; }
        .dark .toc-link { color:#9ca3af; }
        .dark .toc-link:hover,.dark .toc-link.active { background:#1c0a00; color:#fb923c; }
        .inline-cta { background:linear-gradient(135deg,#0d1b2a 0%,#1e3a5f 100%); border-radius:20px; padding:40px; margin:48px 0; display:flex; align-items:center; justify-content:space-between; gap:32px; box-shadow:0 12px 48px rgba(0,0,0,.15); }
        @media(max-width:768px){ .inline-cta { flex-direction:column; text-align:center; padding:32px 24px; gap:24px; } }
        .inline-cta h4 { font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:white; margin-bottom:8px; }
        .inline-cta p { font-family:'Sora',sans-serif; font-size:15px; color:#94a3b8; margin:0; line-height:1.6; }
        .takeaway-box { background:#0d1b2a; border-radius:20px; padding:40px 48px; margin:48px 0; }
        .takeaway-box h3 { font-family:'Sora',sans-serif; font-size:20px; font-weight:800; color:white; margin:0 0 24px; display:flex; align-items:center; gap:12px; }
        .takeaway-item { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
        .takeaway-dot { flex-shrink:0; width:20px; height:20px; border-radius:50%; background:#f97316; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:white; margin-top:4px; }
        .takeaway-text { font-family:'Lora',serif; font-size:17px; color:#cbd5e1; line-height:1.7; }
        .pipe-visual { background:linear-gradient(135deg,#F43F5E 0%,#EC4899 42%,#8B5CF6 100%); padding:48px; border-radius:16px; margin:40px 0 10px; box-shadow:0 12px 48px rgba(0,0,0,.15); display:flex; gap:48px; align-items: flex-start; }
        @media(max-width:768px){ .pipe-visual { flex-direction:column; padding:24px; gap:32px; } }
        .pipe-left { max-width:320px; }
        .pipe-left h3 { font-family:'Sora',sans-serif; font-size:48px; font-weight:900; color:white; line-height:1; letter-spacing:-2.5px; margin-bottom:16px; }
        .pipe-left h3 span { color:#FDE68A; }
        .pipe-left p { font-size:15px; color:rgba(255,255,255,.75); line-height:1.6; margin:0; }
        .pipe-card { background:white; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.35); flex:1; max-width:440px; }
        .pipe-card-bar { background:#f8fafc; border-bottom:1px solid #e5e7eb; padding:12px 16px; display:flex; align-items:center; gap:6px; }
        .pip-dot { width:8px; height:8px; border-radius:50%; }
        .pipe-card-title { font-size:11px; font-weight:700; color:#6b7280; margin-left:6px; }
        .live-badge { margin-left:auto; background:#dcfce7; color:#15803d; font-size:10px; font-weight:800; padding:3px 10px; border-radius:20px; }
        .pipe-step { display:flex; align-items:flex-start; gap:16px; padding:16px 20px; border-bottom:1px solid #f8fafc; }
        .pipe-step:last-child { border-bottom:none; }
        .pipe-step-n { width:24px; height:24px; border-radius:50%; color:white; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
        .pipe-step-name { font-size:13px; font-weight:700; color:#0d1b2a; display:block; }
        .pipe-step-desc { font-size:12px; color:#94a3b8; display:block; margin-top:2px; }
        .pipe-step-tag { font-size:9px; font-weight:700; padding:2px 10px; border-radius:4px; display:inline-block; margin-top:6px; }
        .auto-tag { background:#dbeafe; color:#1d4ed8; }
        .ai-tag { background:#ede9fe; color:#6d28d9; }
        .green-tag { background:#dcfce7; color:#15803d; }
        .dash-dark { background:#0f172a; border-radius:20px; overflow:hidden; box-shadow:0 40px 100px rgba(0,0,0,.6); }
        .dash-bar { background:#1e293b; border-bottom:1px solid rgba(255,255,255,.08); padding:12px 16px; display:flex; align-items:center; gap:6px; }
        .dash-title { font-size:11px; font-weight:700; color:rgba(255,255,255,.75); margin-left:6px; }
        .dash-live { margin-left:auto; font-size:10px; font-weight:800; background:rgba(74,222,128,.2); color:#4ade80; border:1px solid rgba(74,222,128,.3); padding:3px 10px; border-radius:20px; }
        .kw-row-dark { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:10px 14px; margin-bottom:6px; }
        .kw-term { font-size:12px; font-weight:600; color:rgba(255,255,255,.9); flex:1; }
        .kw-vol { font-size:11px; color:rgba(255,255,255,.4); min-width:60px; text-align:right; }
        .kw-pos { font-size:12px; font-weight:800; min-width:32px; text-align:center; padding:3px 8px; border-radius:6px; }
        .kp-g { background:rgba(74,222,128,.25); color:#4ade80; }
        .kp-a { background:rgba(251,191,36,.25); color:#fcd34d; }
        .kp-r { background:rgba(248,113,113,.25); color:#f87171; }
        .alert-bar { margin:0 12px 12px; background:rgba(249,115,22,.12); border:1px solid rgba(249,115,22,.3); border-radius:10px; padding:10px 14px; display:flex; align-items:center; gap:10px; }
        .alert-dot { width:6px; height:6px; border-radius:50%; background:#fb923c; box-shadow:0 0 8px #fb923c; flex-shrink:0; }
        .alert-txt { font-size:11px; color:rgba(255,255,255,.8); font-weight:500; flex:1; }
        .alert-act { font-size:10px; font-weight:700; color:#fb923c; white-space:nowrap; }
      `}</style>
      <div className="read-progress" style={{ width: `${scrollPct}%` }} />
      {/* ══ NAV ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background/80 dark:bg-gray-900/80 backdrop-blur-none"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-2">Insydz</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions" menuKey="Solutions" />
              <DesktopDropdown label="Use Cases" menuKey="Use Cases" />
              <DesktopDropdown label="Features" menuKey="Features" />
              <button onClick={() => router.push("/pricing")} onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare" menuKey="Compare" />
              <DesktopDropdown label="Resources" menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About" menuKey="About" />
              <Button onClick={() => router.push("/login")} onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Button>
              <button className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => { router.push("/resources/expert-blog"); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </button>
              {([["Solutions", "Solutions", "purple"], ["Use Cases", "Use Cases", "purple"], ["Features", "Features", "purple"], ["Free Tools", "Free Tools", "purple"], ["Compare", "Compare", "purple"], ["Resources", "Resources", "orange"], ["About", "About", "purple"]] as [string, keyof NavigationMenu, string][]).map(([label, key, accent]) => (
                <div key={label}>
                  <button onClick={() => toggleMobileMenu(label)} className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium text-sm ${accent === "orange" ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                    {label}<ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-4 mt-2 space-y-1">
                      {navigationMenu[key].map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          {item.icon}<span className="text-left flex-1">{item.name}</span>
                          {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => { router.push("/pricing"); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">Pricing</button>
              <Button onClick={() => { router.push("/login"); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500">Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="bg-white dark:bg-[#0f172a] pt-32 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <button onClick={() => router.push("/")} className="hover:text-orange-500 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => router.push("/resources/expert-blog")} className="hover:text-orange-500 transition-colors">Expert Blog</button>
            <span>/</span>
            <span className="text-orange-500 font-medium">Flipkart Keyword Research Tool</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Flipkart SEO & Seller Strategy
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white mb-6 max-w-4xl">
            Flipkart <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Keyword Research Tool</span> & SEO Optimization Guide for Sellers (2026)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-8" style={{ fontFamily: "'Lora', serif" }}>
            Master Flipkart keyword research and SEO optimization. Discover how India's top Flipkart sellers use AI-powered keyword tracking and search visibility tools to dominate search results and grow revenue.
          </p>
          <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 font-bold">IT</div>
              <div>
                <div className="text-gray-900 dark:text-gray-100 font-bold">Insydz Team</div>
                <div className="text-xs">Ecommerce Growth Experts</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Published: <strong className="text-gray-700 dark:text-gray-300">Jan 20, 2026</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <strong className="text-gray-700 dark:text-gray-300">14 min read</strong>
            </div>
          </div>
          <div className="stat-strip">
            <div className="stat-item">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">35%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Algorithm weight on keywords</div>
            </div>
            <div className="stat-item">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">28%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Weight on attribute completeness</div>
            </div>
            <div className="stat-item">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">₹1,999</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Starting price for professional tools</div>
            </div>
            <div className="stat-item">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">100%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">India-focused data sources</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ArticleImg
              src="/01_hero_banner.png"
              alt="Flipkart Keyword Research Tool dashboard showing search volume, keyword ranking, and AI-powered SEO suggestions."
              caption="The Insydz Flipkart Keyword Tool: Real-time search volume and organic rank tracking for Indian sellers."
            />
          </div>
        </div>
      </section>

      {/* ══ ARTICLE LAYOUT ══ */}
      <main className="article-layout">
        <aside className="toc-sidebar">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Table of Contents</div>
          <nav className="space-y-1">
            {TOC.map(item => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`toc-link ${activeSection === item.id ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-5 border border-orange-100 dark:border-orange-900/50">
              <h5 className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-2">Free SEO Audit</h5>
              <p className="text-xs text-orange-600 dark:text-orange-500/80 leading-relaxed mb-4">Check your Flipkart rank for any keyword instantly with our free tool.</p>
              <button onClick={() => router.push("/free-tools/free-keyword-rank-checker")} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">Audit My Listing</button>
            </div>
          </div>
        </aside>

        <article className="article-body">
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)}>
            <span>Table of Contents</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`mobile-toc-panel ${tocOpen ? "open" : ""}`}>
            <nav className="space-y-2">
              {TOC.map(item => (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${activeSection === item.id ? "bg-orange-50 text-orange-600" : "text-gray-600"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <p className="lead" style={{ fontSize: "1.2em", color: "#4b5563", marginBottom: 32 }}>
            Most Flipkart sellers operate in the dark. They choose keywords based on intuition, list their products, and wonder why their daily orders are stuck in single digits while competitors are clearing thousands of units. The difference isn't always product quality — it's <strong>discoverability</strong>.
          </p>

          <h2 id="s1">Why Flipkart Keywords are the Lifeblood of Your Sales</h2>
          <p>
            Flipkart is no longer a simple search engine; it's a sophisticated <strong>Product Discovery Platform</strong>. With over 150 million active shoppers, the competition for the top 5 spots is brutal. If you aren't ranking on page 1 for your primary keywords, you are effectively invisible.
          </p>
          <p>
            Unlike Amazon, where SEO is heavily weighted towards sales velocity, Flipkart's search algorithm — often referred to as the <strong>Product Discovery AI</strong> — places massive importance on how well your listing matches the specific linguistic and attribute-based search patterns of Indian buyers.
          </p>

          <div className="callout warn">
            <div className="callout-label"><Zap className="w-4 h-4" /> The "Hidden" SEO Cost</div>
            <div className="callout-text">
              Running Flipkart Ads (PLA) without organic SEO is a "money leak." If your listing isn't organically relevant to a keyword, your Ad rank will be lower and your Cost Per Click (CPC) will be significantly higher than a competitor whose listing is SEO-optimised.
            </div>
          </div>

          <h2 id="s2">Flipkart Algorithm Unpacked: The 2026 Ranking Signals</h2>
          <p>
            To win on Flipkart, you must understand what the algorithm wants. Based on our data at Insydz, we've mapped the primary signals that determine your organic position:
          </p>

          <div className="dt-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>Ranking Signal</th>
                  <th>Weight</th>
                  <th>What to Optimize</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Keyword Relevance</td>
                  <td><span className="bg">35%</span></td>
                  <td>Title, Search Terms, Product Highlights</td>
                </tr>
                <tr>
                  <td>Attribute Completeness</td>
                  <td><span className="bo">28%</span></td>
                  <td>Specific Attributes (Material, Size, Occasion)</td>
                </tr>
                <tr>
                  <td>Seller Performance</td>
                  <td><span className="br">22%</span></td>
                  <td>RTD (Ready to Dispatch), Returns, Ratings</td>
                </tr>
                <tr>
                  <td>Buyer Engagement</td>
                  <td><span className="bb">15%</span></td>
                  <td>Click-Through Rate (CTR) and Conversion (CVR)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="s3">The Secret Weapon: Attribute-Based SEO</h2>
          <p>
            Flipkart buyers rely heavily on filters. If you are selling "Cotton T-shirts" but haven't filled in the <strong>"Neck Type"</strong> or <strong>"Sleeve Length"</strong> attribute fields, your product will vanish the moment a buyer clicks the "Round Neck" or "Full Sleeve" filter — even if your product is exactly what they want.
          </p>
          <p>
            A professional <strong>Flipkart Keyword Research Tool</strong> doesn't just give you words; it tells you which attributes are being searched for. Indian buyers often search for "Material + Product" (e.g., <em>Pure Cotton Kurtis</em>) or "Occasion + Product" (e.g., <em>Diwali Decoration Lights</em>).
          </p>

          <div className="inline-cta">
            <div>
              <h4>Dominate Flipkart Search Results</h4>
              <p>Stop guessing. Start using real Flipkart keyword data today.</p>
            </div>
            <button onClick={() => router.push("/login")} className="bg-white text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-xl">Get Started Free</button>
          </div>

          <h2 id="s4">The Problem with "Global" Tools</h2>
          <p>
            Most ecommerce tools (like Helium 10 or Jungle Scout) were built for the US market. They have zero visibility into Flipkart's unique search ecosystem. Using Amazon US keyword data to optimize a Flipkart India listing is like using a map of New York to navigate New Delhi — you'll end up in the wrong place.
          </p>
          <p>
            Insydz is the first platform to provide <strong>Flipkart-specific rank tracking</strong>. We monitor your organic position across thousands of pincodes in India to give you a true picture of your visibility.
          </p>

          <h2 id="s5">Big Billion Days (BBD) SEO Strategy</h2>
          <p>
            Winning the Big Billion Days starts two months before the sale. Flipkart's algorithm begins "pre-ranking" category pages based on historical relevance and performance.
          </p>

          <div className="metrics-grid">
            <div className="metric-card"><span className="metric-num">6-8wks</span><span className="metric-lbl">Lead time for BBD SEO</span></div>
            <div className="metric-card"><span className="metric-num">2.4x</span><span className="metric-lbl">Avg CTR boost for F-Assured</span></div>
            <div className="metric-card"><span className="metric-num">18%</span><span className="metric-lbl">Higher conversion for attribute-rich listings</span></div>
            <div className="metric-card"><span className="metric-num">4-5h</span><span className="metric-lbl">Daily time saved with automation</span></div>
          </div>

          <h2 id="s6">Your Weekly Flipkart Growth Checklist</h2>
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>Monitor Top 10 Keywords</h4>
              <p>Check your organic rank daily for your highest-converting terms. A drop from pos #2 to #8 can cost you 40% of your daily sales.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>Analyze Competitor Listings</h4>
              <p>Use the <InLink to="/features/competitor-price-tracking-feature">Flipkart competitor price tracker</InLink> to see when rivals change their titles or attributes to capture new trends.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h4>Audit Attribute Gaps</h4>
              <p>Flipkart frequently adds new attribute fields to categories. Ensure your listings are 100% complete every Friday.</p>
            </div>
          </div>

          <h2 id="s7">Key Takeaways</h2>
          <div className="takeaway-box">
            <h3>Summary for Growth-Minded Sellers</h3>
            {[
              "Keywords are 35% of your rank — use tools with real India-first data.",
              "Attributes are the 'silent' ranking factor — fill every single field.",
              "Local context matters — Indian buyers search differently than US buyers.",
              "F-Assured status and RTD performance are critical for SEO visibility.",
              "BBD success is built on SEO ground-work done months in advance."
            ].map((text, i) => (
              <div className="takeaway-item" key={i}>
                <div className="takeaway-dot">✓</div>
                <div className="takeaway-text">{text}</div>
              </div>
            ))}
          </div>

          <h2 id="s8">Frequently Asked Questions</h2>
          <div className="faq-wrap">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <div className={`faq-icon ${openFaq === i ? "open" : ""}`}>+</div>
                </div>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>

          <div className="final-cta-block rounded-3xl text-white">
            <h3 className="text-3xl font-extrabold mb-4">Start Dominating Flipkart Today</h3>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of Indian sellers using Insydz to track ranks, find keywords, and grow their marketplace revenue.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => router.push("/login")} className="bg-white text-blue-600 font-bold px-10 py-4 rounded-xl shadow-xl hover:bg-gray-100 transition-all">Get Started Free</button>
              <button onClick={() => router.push("/pricing")} className="bg-blue-700 text-white font-bold px-10 py-4 rounded-xl border border-blue-500 hover:bg-blue-800 transition-all">View Pricing</button>
            </div>
          </div>

          <div className="related-grid">
            <div className="related-card" onClick={() => router.push("/resources/expert-blog/amazon-seo-tool-india")}>
              <div className="related-thumb"><Search className="text-orange-500 w-12 h-12" /></div>
              <div className="related-body">
                <div className="related-tag">SEO Guide</div>
                <div className="related-title">Amazon SEO Tool India: Rank Tracking Guide</div>
              </div>
            </div>
            <div className="related-card" onClick={() => router.push("/resources/expert-blog/amazon-vs-flipkart-india-seller")}>
              <div className="related-thumb"><Store className="text-purple-500 w-12 h-12" /></div>
              <div className="related-body">
                <div className="related-tag">Marketplace</div>
                <div className="related-title">Amazon vs Flipkart: Which is Better for Sellers?</div>
              </div>
            </div>
            <div className="related-card" onClick={() => router.push("/resources/expert-blog/manual-vs-automated-competitor-tracking-tool")}>
              <div className="related-thumb"><Zap className="text-blue-500 w-12 h-12" /></div>
              <div className="related-body">
                <div className="related-tag">Strategy</div>
                <div className="related-title">Manual vs Automated Competitor Tracking</div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <img src="/logo.png" alt="Insydz Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white">Insydz</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">AI-powered ecommerce intelligence for the next generation of marketplace leaders in India.</p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-orange-500 transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-orange-500 transition-colors" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-orange-500 transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-orange-500 transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Solutions</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/solutions/amazon-sellers" className="hover:text-orange-500 transition-colors">Amazon Sellers</Link></li>
              <li><Link href="/solutions/flipkart-sellers" className="hover:text-orange-500 transition-colors">Flipkart Sellers</Link></li>
              <li><Link href="/solutions/ecommerce-agencies" className="hover:text-orange-500 transition-colors">E-commerce Agencies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/resources/expert-blog" className="hover:text-orange-500 transition-colors">Expert Blog</Link></li>
              <li><Link href="/free-tools" className="hover:text-orange-500 transition-colors">Free Tools</Link></li>
              <li><Link href="/pricing" className="hover:text-orange-500 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li>support@insydz.com</li>
              <li>Mumbai, India</li>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          <p>© 2026 Insydz (A brand of AFI Digital Lab). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
