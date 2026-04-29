"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Clock, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen, Video, FileText,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, User, Calendar, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation, LayoutGrid, Key, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ANALYZE_AMAZON_REVIEWS_1 from "public/analyze_amazon_reviews_1.png";
import ANALYZE_AMAZON_REVIEWS_2 from "public/analyze_amazon_reviews_2.png";

export const dynamic = "force-static";


type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
};

function ArticleImg({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ margin:"24px 0 0" }}>
      <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#f1f5f9", minHeight:200 }}>
        {!loaded && (
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize:"200% 100%", animation:"imgShimmer 1.5s infinite" }} />
        )}
        <Image src={src} alt={alt} onLoad={() => setLoaded(true)} style={{ width:"100%", display:"block", opacity: loaded ? 1 : 0, transition:"opacity .3s" }} />
      </div>
      <p className="art-img-cap">{caption}</p>
    </div>
  );
}

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)",      icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)",     icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers",           icon: <Store       className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies",        icon: <Briefcase   className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers",             icon: <Users       className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases",                  icon: <TrendingUp    className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices",        icon: <TrendingUp    className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products",       icon: <Target        className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews",       icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO",  icon: <Search        className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package       className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features",                   icon: <LayoutGrid    className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking",      icon: <DollarSign    className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics",               icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization",             icon: <TrendingUp    className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking",        icon: <Search        className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research",               icon: <Package       className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations",             icon: <Zap           className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts",                icon: <Bell          className="w-4 h-4" />, badge: "NEW",      route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence",     icon: <Flame         className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer",   icon: <BarChart3     className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker",  icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker",  icon: <DollarSign    className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker",      icon: <Search        className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name: "Expert Blog",         icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
  ],
  Integrations: [
    { name: "Amazon",            icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart",          icon: <Store       className="w-4 h-4" /> },
    { name: "Shopify",           icon: <Globe       className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code        className="w-4 h-4" /> },
  ],
  Compare: [
    { name: "Insydz vs Helium 10",    icon: <Trophy className="w-4 h-4" />, route: "/resources/expert-blog/insydz-vs-helium-10-india" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/resources/expert-blog/insydz-vs-jungle-scout-india" },
  ],
  About: [
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers",    icon: <Globe        className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact-us", icon: <Users        className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

const TOC = [
  { id: "intro",       label: "What is Amazon Review Analysis?" },
  { id: "critical",    label: "Why It's Critical for Indian Sellers" },
  { id: "ai-loop",     label: "How AI Review Analysis Works" },
  { id: "insights",    label: "Types of Review Insights to Track" },
  { id: "mistakes",    label: "5 Common Mistakes Sellers Make" },
  { id: "best-practices", label: "Weekly Execution Model" },
  { id: "tools",       label: "Best Tools for India 2026" },
  { id: "faq",         label: "Frequently Asked Questions" },
];

export default function AmazonReviewAnalysisContent() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("intro");
  const [scrollPct, setScrollPct]   = useState(0);
  const [tocOpen, setTocOpen]       = useState(false);
  const [openFaq, setOpenFaq]       = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown]     = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.documentElement.classList.toggle("dark", isDarkMode); }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      let found = false;
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && el.getBoundingClientRect().top <= 120) { 
          setActiveSection(TOC[i].id); 
          found = true;
          break; 
        }
      }
      if (!found && TOC.length > 0) setActiveSection(TOC[0].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setTocOpen(false); };
  const handleMenuItemClick = (item: MenuItemWithBadge) => { if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); } };
  const toggleMobileMenu = (name: string) => setMobileActiveMenu(p => p === name ? null : name);

  const DesktopDropdown = ({ label, menuKey, accent = "purple" }: { label: string; menuKey: keyof NavigationMenu; accent?: "purple" | "orange" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button onMouseEnter={() => setActiveDropdown(label)} className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
          {label}<ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
        {isActive && (
          <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {items.map((item, i) => (
              <button key={i} onClick={() => handleMenuItemClick(item)} className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                <span className={ac ? "text-orange-600" : "text-purple-600 dark:text-purple-400"}>{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</span>
                {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold">{item.badge}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const compRows = [
    { cap: "Amazon.in Review Coverage",      manual: "Manual only",          global: "Zero — US Only",        insydz: "Full Coverage" },
    { cap: "Flipkart Review Analysis",       manual: "Manual only",          global: "Not supported",          insydz: "Native integration" },
    { cap: "Hindi & Hinglish Processing",    manual: "No",                   global: "English only",           insydz: "Native NLP for both" },
    { cap: "WhatsApp Alerts",                manual: "Not available",        global: "Email only",             insydz: "Within 60 min" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        .read-progress{position:fixed;top:80px;left:0;height:3px;background:linear-gradient(90deg,#db2777,#7c3aed);z-index:200;transition:width .1s linear}
        .article-layout{max-width:1240px;margin:0 auto;padding:48px 24px 80px;display:grid;grid-template-columns:308px 1fr;gap:52px}
        @media(max-width:1024px){.article-layout{grid-template-columns:220px 1fr;gap:32px}}
        @media(max-width:768px){.article-layout{grid-template-columns:1fr;padding:24px 16px}}
        .toc-sidebar{position:sticky;top:80px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:22px; max-height: calc(100vh - 100px); overflow-y: auto; scrollbar-width: none;}
        .toc-sidebar::-webkit-scrollbar{display:none;}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}
        .article-body{font-family:'Lora',serif;font-size:16px;line-height:1.78;color:#1E293B}
        .dark .article-body{color:#d1d5db}
        .article-body h2{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#0D1B2A;margin:52px 0 14px;padding-bottom:12px;border-bottom:2px solid #e5e7eb; scroll-margin-top: 100px;}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .art-img-cap { font-family: 'Lora', serif; font-style: italic; font-size: 14px; color: #64748B; margin-top: 12px; line-height: 1.6; text-align: center; }
        .box{border-radius:10px;padding:20px 22px;margin:24px 0}
        .box-blue{background:#EFF6FF;border-left:4px solid #3B82F6}
        .dark .box-blue{background:#0c1e3d;border-color:#1d4ed8}
        .box-yellow{background:#FFFBEB;border-left:4px solid #F59E0B}
        .dark .box-yellow{background:#422006;border-color:#d97706}
        .box-purple{background:#F5F3FF;border-left:4px solid #7C3AED}
        .dark .box-purple{background:#2e1065;border-color:#9333ea}
        .box-red{background:#FFF1F2;border-left:4px solid #E11D48}
        .dark .box-red{background:#4c0519;border-color:#f43f5e}
        .tbl-wrap{overflow-x:auto;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:24px 0}
        table.dt{width:100%;border-collapse:collapse;font-size:13.5px;font-family:'Sora',sans-serif}
        table.dt thead tr{background:#0D1B2A}
        table.dt th{padding:13px 16px;color:white;text-align:left}
        table.dt td{padding:12px 16px;border-bottom:1px solid #E2E8F0}
        .dark table.dt td{border-color:#1f2937}
        .toc-link{display:block;font-size:12.5px;font-weight:500;color:#64748B;padding:6px 10px;border-radius:6px;cursor:pointer;text-align:left;width:100%;transition:all .15s}
        .toc-link:hover,.toc-link.active{color:#7C3AED;background:#F5F3FF}
        .dark .toc-link:hover,.dark .toc-link.active{background:#431407;color:#fb923c}
        .text-gradient { background: linear-gradient(to right, #9333ea, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .internal-cta { background: #0D1B2A; border-radius: 16px; padding: 32px; margin: 48px 0; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); }
        .internal-cta h3 { color: white !important; font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; border-bottom: none !important; }
        .internal-cta p { color: #94A3B8 !important; font-size: 15px; margin-bottom: 24px; }
        
        .tag-verdict { background: #F97316; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-left: 8px; text-transform: uppercase; }
        .p-badge { font-size: 10.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; display: inline-block; white-space: nowrap; }
        .p-red { background: #FEE2E2; color: #B91C1C; }
        .p-green { background: #DCFCE7; color: #15803D; }
        .p-orange { background: #FFEDD5; color: #9A3412; }
        .dark .p-red { background: #450a0a; color: #f87171; }
        .dark .p-green { background: #064e3b; color: #34d399; }
        .dark .p-orange { background: #431407; color: #fb923c; }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 shadow-lg" : "bg-background dark:bg-gray-900/80"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
              <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-2">Insydz</span>
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <button onClick={() => router.push("/pricing")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium">Pricing</button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button onClick={() => router.push("/login")} className="ml-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">Login</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 bg-white dark:bg-gray-950">
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", display: "flex", gap: 6, fontSize: 13, color: "#94A3B8" }}>
          <button onClick={() => router.push("/")} className="hover:text-purple-600 transition-colors">Home</button> 
          <span className="opacity-50">›</span> 
          <button onClick={() => router.push("/resources/expert-blog")} className="hover:text-purple-600 transition-colors">Blog</button> 
          <span className="opacity-50">›</span> 
          <span className="text-slate-600 dark:text-slate-400 font-medium">Analyze Amazon Reviews Tool India</span>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 24px 0" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-wider mb-6">
          <Search className="w-3.5 h-3.5" /> SELLER TOOLS & STRATEGY
        </div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 800, color: "#0D1B2A", lineHeight: 1.1, letterSpacing: "-0.03em" }} className="dark:text-white">
          How to <span className="text-gradient">Analyze 1000+ Amazon Reviews</span> in Minutes: India Seller Guide for 2026
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl" style={{ fontFamily: "'Lora', serif", marginTop:"2rem" }}> 
          AI-powered review mining for Amazon India and Flipkart to surface buyer pain points and competitor weaknesses before your next listing update.
        </p>

        <div className="flex flex-wrap items-center gap-y-4 gap-x-4 text-sm text-slate-500 dark:text-slate-400 mt-8 mb-10">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Insydz Research Team</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 ml-1">·</span>
          <div className="flex items-center gap-2 ml-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>April 2026</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 ml-1">·</span>
          <div className="flex items-center gap-2 ml-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>12 min read</span>
          </div>
          <div className="flex items-center gap-3 sm:ml-4">
             <span className="px-4 py-1.5 bg-[#F97316] text-white text-[11px] font-bold rounded-full">Updated for 2026</span>
             <span className="px-4 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[11px] font-bold rounded-full">D2C Playbook</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 mb-14">
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md group">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform origin-left" style={{ fontFamily: "'Sora', sans-serif" }}>1,000+</div>
            <p className="text-xs lg:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Reviews analyzed in &lt; 5 min by AI tools — vs 8 hours manually</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md group">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform origin-left" style={{ fontFamily: "'Sora', sans-serif" }}>25–35%</div>
            <p className="text-xs lg:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Indian D2C RTO rates — most are review-signalled before they spike</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md group">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform origin-left" style={{ fontFamily: "'Sora', sans-serif" }}>₹3.25Cr</div>
            <p className="text-xs lg:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Annual loss on a ₹10Cr brand at 25% RTO — review mining cuts it</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md group">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform origin-left" style={{ fontFamily: "'Sora', sans-serif" }}>66%</div>
            <p className="text-xs lg:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Festive orders from Tier 2/3 — different review patterns than metros</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>
        <ArticleImg 
          src={ANALYZE_AMAZON_REVIEWS_1}
          alt="Amazon Review Analysis Dashboard" 
          caption="Insydz AI review intelligence — clusters sentiment, flags RTO-driving themes, and benchmarks against competitor weaknesses across Amazon.in and Flipkart." 
        />
        <ArticleImg 
          src={ANALYZE_AMAZON_REVIEWS_2}
          alt="Key Takeaways from Insydz AI Review Analysis" 
          caption="" 
        />
      </div>

      <div className="article-layout">
        <aside className="toc-sidebar">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Table of Contents</h4>
          <ul className="space-y-1">
            {TOC.map(t => (
              <li key={t.id}><button className={`toc-link ${activeSection === t.id ? "active" : ""}`} onClick={() => go(t.id)}>{t.label}</button></li>
            ))}
          </ul>

          <div className="mt-8 p-6 rounded-2xl bg-[#0b0f1a] text-white shadow-xl">
            <h4 className="font-bold text-[17px] leading-tight mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              Mine Your Reviews —<br/>Free
            </h4>
            <p className="text-[#93c5fd] text-[13px] leading-relaxed mb-5">
              AI-powered review intelligence for Amazon.in & Flipkart with WhatsApp sentiment alerts.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Up to 1,000 reviews/month",
                "Sentiment + theme clustering",
                "Competitor pain-point gaps",
                "From ₹1,999/mo — or free forever"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-200">
                  <Check className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => router.push("/login")} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-5 rounded-xl text-[14px] transition-all transform hover:scale-105 flex flex-col gap-0.5 h-auto">
              <span>Start Free Trial</span>
            </Button>
          </div>
        </aside>

        <main className="article-body">
          <div className="box box-blue">
            <div className="flex items-center gap-2 text-[#3B82F6] dark:text-blue-400 text-[11px] font-black uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" /> IN SIMPLE TERMS
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              Instead of reading thousands of Amazon reviews to figure out why your conversions dropped or why returns are spiking, an Amazon review analysis tool reads them for you — clustering complaints by theme, ranking pain points by frequency and revenue impact, and flagging the exact phrases your buyers (and your competitors' buyers) keep repeating.
            </p>
          </div>

          <h2 id="intro">What is an Amazon Review Analysis Tool?</h2>
          <p>
            An <strong className="text-slate-900 dark:text-white font-bold">analyze Amazon reviews tool</strong> is software that ingests every review on a product listing — yours and your competitors' — and uses NLP to extract structured intelligence: sentiment polarity, theme clusters, feature requests, recurring complaints, and language patterns. Instead of scrolling through 800 reviews and guessing, you get a ranked list of what buyers actually love, hate, and wish you'd build.
          
            <br/><br/>
            For Indian D2C sellers, the unlock is bigger than for US sellers. Indian reviewers post in English, Hindi, Hinglish, and transliterated Tamil and Telugu — and they complain about things US-trained models often miss: courier handling damage, COD-driven trial purchases that come back, GST receipt confusion, and packaging that survives a Mumbai monsoon but not a Lucknow one.
            <br/><br/>
            Modern tools go further than sentiment scoring. They cluster the 1,247 reviews on your wireless earbuds listing into 14 themes, rank them by how often they correlate with 1- and 2-star ratings, and tell you which three fixes would move your average rating from 4.1 to 4.4. That's review mining — and it's the fastest path from customer voice to listing copy that converts.
          </p>

          <h2 id="critical">Why is Review Analysis Critical for Indian D2C Sellers?</h2>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>India's Returns Reality Hides in the Reviews</h3>
          <p>
            Indian e-commerce runs on a brutal RTO economics: return-to-origin rates of 25–35% are common for COD-heavy categories, and during festive quarters COD returns can hit 58%. A ₹10 crore D2C brand at 25% RTO loses roughly ₹3.25 crore a year to failed deliveries and returns — and a third of those returns are seeded by complaints already buried in your existing reviews.
          </p>
          <p>
            Manual review reading misses the pattern. Your team sees individual 1-star reviews and replies one at a time. A review analysis tool sees that 22% of negative reviews from pin codes outside metros mention "package was damaged" — which means your bubble wrap spec is fine for Bangalore but not for Bareilly, and that's a packaging SKU change worth ₹40,000 per crore in retained revenue.
          </p>

          <div className="box box-yellow">
            <div className="flex items-center gap-2 text-[#F59E0B] dark:text-orange-400 text-[11px] font-black uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 fill-current" /> REAL SELLER EXAMPLE
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              A Mumbai-based home appliances D2C brand was running ₹85L/month on Amazon.in with a 4.2 average. Returns hit 28%. Manual review reading turned up nothing actionable. AI clustering surfaced one theme: 31% of 1-star reviews mentioned "missing manual" — buyers in Tier 2 cities couldn't operate the product without printed instructions. They added a QR-code printed insert in eight languages. Within 6 weeks: returns dropped to 19%, rating climbed to 4.5, and conversion rate lifted 14%.
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Competitor Reviews Are Your Free Differentiation Brief</h3>
          <p>
            Your competitors' 1-star reviews are the cheapest market research you'll ever do. When 47 buyers complain that the rival earbuds "disconnect during Wynk Music" or that a competing kurta "runs small for Indian sizing," that's not noise — that's your next ad headline, your next bullet point, your next product tweak. Most Indian sellers never read competitor reviews systematically because the volume is overwhelming. AI clustering changes the math entirely.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Festive Review Velocity Is a Real-Time Demand Signal</h3>
          <p>
            During Big Billion Days and Great Indian Festival, 40–60% of category-annual revenue concentrates into a 4–7 day window. Review velocity in that window — both yours and your top three competitors' — is the closest thing to a real-time demand signal you'll get on Amazon.in. A spike in negative reviews on day 2 of BBD usually predicts the exact moment a competitor will pull ad spend; that's your window to surge.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>The A10 Algorithm Reads Reviews Too</h3>
          <p>
            Amazon's ranking algorithm factors review velocity, sentiment, and recency into rank position. Listings with declining sentiment slide silently in search results — and most sellers only notice when monthly revenue drops 15%. Continuous review monitoring catches sentiment drift on day 3, not week 8.
          </p>

          <div className="box box-blue">
            <div className="flex items-center gap-2 text-[#3B82F6] dark:text-blue-400 text-[11px] font-black uppercase tracking-wider mb-2">
              <LayoutGrid className="w-3.5 h-3.5 fill-current" /> AI OVERVIEW SUMMARY
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              Amazon review analysis tools help Indian D2C sellers cluster customer sentiment by theme, identify RTO-driving complaints, mine competitor pain points, and surface festive-season demand signals across Amazon.in and Flipkart — replacing 8 hours of manual review reading with a 5-minute automated dashboard.
            </p>
          </div>

          <h2 id="ai-loop">How Does AI Amazon Review Analysis Work?</h2>
          <p>
            Modern review analysis tools have replaced the manual spreadsheet workflow with an automated 5-step intelligence loop:
          </p>
          
          <ArticleImg 
            src={ANALYZE_AMAZON_REVIEWS_2}
            alt="How AI Amazon Review Analysis Work" 
            caption="The 5-step automated review intelligence loop from ASIN connection to WhatsApp-delivered sentiment alerts and AI listing recommendations." 
          />

          <div className="space-y-6 my-10">
            {[
              {
                step: 1,
                title: "Connect Your Seller Account",
                desc: "Link your Amazon.in or Flipkart seller account and add the ASINs you want to track — yours and up to 10 competitors. The tool starts pulling all historical reviews immediately. No CSV exports, no manual scraping."
              },
              {
                step: 2,
                title: "NLP Extraction & Language Handling",
                desc: "Each review is parsed for sentiment polarity, language (English / Hindi / Hinglish / regional transliteration), specific entities mentioned (battery, packaging, fit, delivery), and review-buyer signal (verified purchase, COD vs prepaid, location tier)."
              },
              {
                step: 3,
                title: "Sentiment Clustering & Theme Discovery",
                desc: "Reviews are grouped into 10–20 thematic clusters per ASIN — \"sound quality,\" \"packaging damage,\" \"fit too small,\" \"delivery delay,\" \"COD experience.\" Each cluster is ranked by frequency, sentiment severity, and correlation with 1–2 star ratings."
              },
              {
                step: 4,
                title: "Competitor Gap & WhatsApp Alerts",
                desc: "The tool benchmarks your theme clusters against the top 5–10 competitors in your category. Any new negative theme spike on a competitor — or on your own listing — triggers a WhatsApp alert within 60 minutes, with the affected ASIN, cluster name, and recommended fix."
              },
              {
                step: 5,
                title: "AI Listing Recommendations",
                desc: "Based on the highest-impact clusters, the platform generates concrete listing edits: \"Add 'water-resistant up to IPX5' to bullet 3\" — addresses 14% of negative reviews. Estimated conversion lift: +9%. Estimated rating impact: +0.2.\" Not data — decisions."
              }
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">{item.step}</div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>{item.title}</h4>
                    <p className="text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="box box-purple">
            <div className="flex items-center gap-2 text-[#7C3AED] dark:text-purple-400 text-[11px] font-black uppercase tracking-wider mb-2">
              <Key className="w-3.5 h-3.5 fill-current" /> KEY INSIGHT
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              Sentiment without clustering is theatre. Knowing "42% of reviews are negative" tells you nothing you can act on. Knowing "31% of negative reviews mention 'missing manual', concentrated in pin codes 226001–226021" tells you exactly what to fix and where.
            </p>
          </div>

          <h2 id="insights">Types of Review Insights Indian Sellers Must Track</h2>
          <p>
            Not all review data is equal. The clusters that move revenue are the ones tied to fixable listing or product changes — and Indian sellers using global tools usually miss the highest-conversion categories entirely.
          </p>

          <div className="tbl-wrap">
            <table className="dt">
              <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                <tr>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">
      INSIGHT TYPE
    </th>
    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">
      EXAMPLE (INDIA)
    </th>
    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">
      VOLUME
    </th>
    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">
      REVENUE IMPACT
    </th>
    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">
      PRIORITY
    </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "RTO Trigger Themes", example: "\"Wrong size,\" \"Different from photo\"", volume: "High", impact: "Very High (returns)", priority: "Critical", color: "red" },
                  { type: "Packaging & Transit", example: "\"Bottle leaked,\" \"Box crushed\"", volume: "Medium", impact: "High (Tier 2/3 specific)", priority: "Critical", color: "red" },
                  { type: "Feature Requests", example: "\"Should have come with charger\"", volume: "Medium", impact: "Medium (next SKU)", priority: "Important", color: "orange" },
                  { type: "Competitor Comparisons", example: "\"boAt is better at this price\"", volume: "Low-Medium", impact: "High (positioning)", priority: "Important", color: "orange" },
                  { type: "Regional Language Pain Points", example: "\"Manual Hindi mein nahi hai\"", volume: "Growing", impact: "High (Tier 2/3)", priority: "Opportunity", color: "green" },
                  { type: "Festive-Specific Complaints", example: "\"Ordered for Diwali, came after\"", volume: "Spike", impact: "Very High (BBD/GIF)", priority: "Critical", color: "red" },
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="font-bold text-slate-800 dark:text-slate-200">{r.type}</td>
                    <td className="text-slate-500 italic text-[13px]">{r.example}</td>
                    <td className="text-slate-600 dark:text-slate-400">{r.volume}</td>
                    <td className="text-slate-600 dark:text-slate-400">{r.impact}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit ${
                        r.color === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        r.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          r.color === 'red' ? 'bg-red-600' :
                          r.color === 'orange' ? 'bg-orange-600' :
                          'bg-emerald-600'
                        }`}></span>
                        {r.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="art-img-cap">Six review insight categories Indian sellers must track — ranked by RTO impact and competitive opportunity.</p>

          

          <h2 id="mistakes">5 Common Mistakes Indian Sellers Make with Review Analysis</h2>
          <p>
            Each of these mistakes silently costs Indian sellers conversion, rank, and margin every week they go uncorrected.
          </p>

          <div className="space-y-6 my-10">
            {[
              {
                step: 1,
                title: "Reading Only Your Own Reviews",
                desc: "Your reviews tell you what's wrong with your product. Your competitors' reviews tell you what's wrong with theirs — which is exactly what you should highlight in your listing copy. Indian D2C founders skip competitor review mining because the volume is intimidating; AI clustering makes it a 10-minute task."
              },
              {
                step: 2,
                title: "Trusting US Sentiment Models on Hinglish Reviews",
                desc: "Tools trained on Amazon.com reviews routinely mis-classify Hinglish complaints. \"Bahut bekaar product hai bhai\" reads as neutral to a US-trained sentiment model. India-first NLP catches it as strongly negative — and clusters it correctly with similar regional-language complaints you'd otherwise miss entirely."
              },
              {
                step: 3,
                title: "Ignoring Pin-Code-Level Patterns",
                desc: "Review complaints aren't evenly distributed. \"Package damaged\" concentrated in pin codes 700001–700099 (Kolkata) means your courier partner there is the problem, not your packaging. Sellers who don't segment review themes by location end up over-engineering products to fix a logistics issue."
              },
              {
                step: 4,
                title: "Acting on Single Reviews, Not Clusters",
                desc: "One angry 1-star review with a long story will pull a founder into a week of product redesign. A cluster of 47 mild 3-star reviews mentioning the same minor complaint is the bigger conversion drag — and easier to fix. Volume-weighted clustering forces you to prioritise the right battles."
              },
              {
                step: 5,
                title: "Not Closing the Loop With Listing Edits",
                desc: "Sellers analyse reviews, find insights, and never update their listings. Backend search terms, A+ content, bullet points, and the first three lines of the description should be re-written every quarter using the previous quarter's review intelligence. Sellers who don't do this leave 15–20% conversion lift on the table."
              }
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0 text-sm">{item.step}</div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>{item.title}</h4>
                    <p className="text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 id="comparison">Review Analysis Methods Compared</h2>

          <div className="tbl-wrap">
            <table className="dt">
              <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                <tr>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">METHOD</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">SPEED</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">INDIA DATA</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">ACTIONABILITY</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">COST</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: "Manual Review Reading", speed: "8–12 hrs", speedColor: "text-red-500", data: "Partial (skim only)", action: "Low — anecdotal", cost: "3–4 hrs/week labour", recommended: false },
                  { method: "ChatGPT + CSV Export", speed: "2–3 hrs", speedColor: "text-orange-500", data: "Limited (US bias)", action: "Medium — one-shot", cost: "₹0–₹1,500/mo", recommended: false },
                  { method: "Global SaaS (Helium 10)", speed: "1 hr", speedColor: "text-yellow-500", data: "No Flipkart, US sentiment", action: "Medium", cost: "₹4,000–8,000/mo", recommended: false },
                  { method: "India-First AI (Insydz)", speed: "< 5 min", speedColor: "text-green-500", data: "Amazon.in + Flipkart + Hinglish", action: "High — actionable AI", cost: "₹1,999–2,999/mo", recommended: true },
                ].map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div>
                        <span className={`font-bold ${r.recommended ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-200'}`}>{r.method}</span>
                        {r.recommended && (
                          <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase">Recommended</span>
                        )}
                      </div>
                    </td>
                    <td className={`font-semibold ${r.speedColor}`}>{r.speed}</td>
                    <td className="text-slate-600 dark:text-slate-400">{r.data}</td>
                    <td className="text-slate-600 dark:text-slate-400">{r.action}</td>
                    <td className="font-medium text-slate-700 dark:text-slate-300">{r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="art-img-cap">Review analysis methods compared — sorted by speed, data fit for India, and actionability of output.</p>

          <div className="box box-purple">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-600 text-[11px] font-black uppercase tracking-wider mb-2">EVERY WEEK YOU WAIT
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              Every week without structured review analysis is a week of buyer complaints silently bleeding into rank position, ad spend, and RTO — while your competitor's analyst spots the same patterns and moves first.
            </p>
          </div>

          <h2 id="best-practices">Best Practices: Weekly Execution Model for Indian D2C Sellers</h2>
          <p>
            The Indian D2C founders who get the most out of review analysis don't run it as a quarterly project. They build a daily–weekly–monthly rhythm that compounds insights into listing edits without requiring a dedicated analyst.
          </p>

          <div className="space-y-6 my-10">
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">1</div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Daily — Automated (0 minutes of your time)</h4>
              </div>
              <div className="space-y-2 pl-12">
                {[
                  "WhatsApp digest: top 3 sentiment shifts across tracked ASINs",
                  "Negative review alerts — any 1-star with verified purchase + photo evidence",
                  "Competitor review velocity — sudden spikes signal pricing or stock issues",
                  "RTO-trigger theme detection — if \"wrong size\" mentions jump 20%, alert fires"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5 font-bold">✓</span>
                    <p className="text-[14.5px] text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">2</div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Weekly — 30-Minute Review Session</h4>
              </div>
              <div className="space-y-2 pl-12">
                {[
                  "Full sentiment cluster report — top 5 themes ranked by revenue impact",
                  "Update bullet points on 1–2 ASINs using AI-generated recommendations",
                  "Check competitor gap report — what their reviewers complain about that you can fix",
                  "Identify out-of-stock competitors — review velocity drops are a leading indicator",
                  "Adjust A+ content for next week using cluster-driven copy"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-0.5 font-bold">✓</span>
                    <p className="text-[14.5px] text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">3</div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Monthly — Strategic Audit (45 minutes)</h4>
              </div>
              <div className="space-y-2 pl-12">
                {[
                  "Review-driven SKU roadmap — which clusters point to next product launch?",
                  "Backend keyword refresh — top reviewer phrases added to ASIN search terms",
                  "RTO root-cause review — pin-code-segmented complaint themes vs returns data",
                  "Competitor feature gap — what they ship that buyers ask you for in your reviews"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span>
                    <p className="text-[14.5px] text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-12 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Key Metrics to Track Monthly</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
            {[
              { color: "bg-blue-400", title: "Negative Theme Concentration", desc: "What % of negative reviews are driven by your top 3 clusters? Target: keep below 50%. Above that means one fix will move the needle." },
              { color: "bg-purple-400", title: "Sentiment Drift (90-day)", desc: "Direction of average rating across rolling 90 days — leading indicator of rank changes 4–6 weeks later." },
              { color: "bg-blue-400", title: "Competitor Pain-Gap Count", desc: "How many themes your competitor's buyers complain about that your product solves but your listing doesn't say. Target: under 3." },
              { color: "bg-purple-400", title: "Listing Edit Velocity", desc: "Number of bullet/A+ updates per ASIN per quarter driven by review insights. Target: minimum 4." },
              { color: "bg-blue-400", title: "RTO–Review Correlation", desc: "% of returned orders whose pain point was already mentioned in reviews 30+ days prior. Target: under 15%." },
              { color: "bg-purple-400", title: "Hinglish Coverage Rate", desc: "% of reviews correctly classified by your tool when written in Hinglish or transliterated regional languages. Target: above 90%." },
            ].map((m, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${m.color}`}></span>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{m.title}</h5>
                </div>
                <p className="text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="internal-cta">
            <h3>Mine 1,000+ Reviews in Under 30 Minutes — Free</h3>
            <p>Connect Amazon.in & Flipkart. Get your first sentiment-cluster report today. WhatsApp alerts on negative theme spikes included.</p>
            <Button onClick={() => router.push("/login")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-12 py-6 rounded-xl text-base transition-all transform hover:scale-105">
              Try InsydzFree →
            </Button>
          </div>

          <h2 id="tools">Best Tools for Amazon Review Analysis in India (2026)</h2>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Why Global Tools Underperform for Indian Sellers</h3>
          <p className="mb-8">
            Helium 10's Review Insights and Jungle Scout's review tools were built around Amazon.com sentiment patterns and English-only review text. Adapting them for India means your sentiment scores get distorted by Hinglish reviews flagged as neutral, your Flipkart reviews are simply absent, and your RTO-driving complaints — which look very different from the US returns profile — get clustered under the wrong themes.
          </p>

          <div className="tbl-wrap">
            <table className="dt">
              <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                <tr>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">TOOL</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">AMAZON.IN</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">FLIPKART</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">HINGLISH NLP</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">WHATSAPP ALERTS</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">PRICE (INR/MO)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Helium 10</td>
                  <td><span className="p-badge p-orange">Partial</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td className="text-slate-600 dark:text-slate-400">₹4,000–8,000</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Jungle Scout</td>
                  <td><span className="p-badge p-orange">Partial</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td className="text-slate-600 dark:text-slate-400">₹4,500–7,000</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">VOC AI / Shulex</td>
                  <td><span className="p-badge p-green">Yes</span></td>
                  <td><span className="p-badge p-red">No</span></td>
                  <td><span className="p-badge p-orange">Limited</span></td>
                  <td><span className="p-badge p-red">Email only</span></td>
                  <td className="text-slate-600 dark:text-slate-400">₹2,500–6,000</td>
                </tr>
                <tr className="bg-purple-50/50 dark:bg-purple-900/10">
                  <td className="font-bold text-purple-700 dark:text-purple-400">
                    Insydz <span className="tag-verdict">INDIA-FIRST</span>
                  </td>
                  <td><span className="p-badge p-green">Yes</span></td>
                  <td><span className="p-badge p-green">Yes</span></td>
                  <td><span className="p-badge p-green">Native</span></td>
                  <td><span className="p-badge p-green">&lt; 60 min</span></td>
                  <td className="font-bold text-purple-600 dark:text-purple-400">₹1,999/mo + Free</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-12 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Full Capability Comparison — India Market</h3>
          <div className="tbl-wrap">
            <table className="dt">
              <thead className="bg-[#0b0f1a] text-white">
                <tr>
                  <th className="bg-[#0b0f1a] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">CAPABILITY</th>
                  <th className="bg-[#0b0f1a] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">MANUAL + CHATGPT</th>
                  <th className="bg-[#0b0f1a] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">GLOBAL TOOLS (US-FIRST)</th>
                  <th className="bg-[#0b0f1a] text-white text-xs font-semibold tracking-wide uppercase px-4 py-3">INSYDZ (INDIA-FIRST)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Amazon.in Native Reviews", "Manual export", "Partial — US-primary", "Native Amazon.in"],
                  ["Flipkart Review Tracking", "Manual only", "Not supported", "Full coverage"],
                  ["Hindi / Hinglish NLP", "Hit or miss", "English only", "Native + transliteration"],
                  ["Sentiment Clustering", "Prompt-by-prompt", "Template themes", "Auto + custom themes"],
                  ["Competitor Review Mining", "Manual scrape", "Limited ASINs", "Up to 10 competitors"],
                  ["RTO Trigger Detection", "Not possible", "Not built for it", "India-calibrated AI"],
                  ["WhatsApp Sentiment Alerts", "None", "Email only", "Within 60 min"],
                  ["Festive Review Intelligence", "Manual", "Not available", "BBD, GIF, Diwali tuned"],
                  ["AI Listing Recommendations", "Manual rewrite", "Generic copy", "Per-ASIN, per-cluster"],
                  ["Pricing", "Your time + ChatGPT", "₹4,000–8,000/mo", "Free–₹1,999/mo"]
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="text-slate-600 dark:text-slate-400">{row[0]}</td>
                    <td className="text-slate-600 dark:text-slate-400">{row[1]}</td>
                    <td className="text-slate-600 dark:text-slate-400">{row[2]}</td>
                    <td className="font-bold text-slate-900 dark:text-slate-100">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="space-y-4 my-8">
            {[
              { emoji: "🔍", title: "Full Amazon.in + Flipkart review database", desc: "Reviews tracked natively on both platforms — not estimated from Amazon.com. Flipkart review coverage is unique to India-first tools." },
              { emoji: "💭", title: "Hindi & Hinglish sentiment classification", desc: "Regional language reviews, transliterated Hindi complaints, and Hinglish product feedback are clustered correctly — not filtered out as \"low confidence\" like US-trained models do." },
              { emoji: "🚚", title: "RTO trigger theme detection", desc: "\"Wrong size,\" \"different from photo,\" \"packaging damaged,\" \"COD courier rude\" — the four highest-converting RTO drivers are detected and scored automatically per ASIN." },
              { emoji: "📱", title: "WhatsApp sentiment alerts within 60 minutes", desc: "Any negative theme spike on a tracked ASIN — yours or a competitor's — triggers a WhatsApp alert with the cluster name, sample reviews, and a recommended listing fix." },
              { emoji: "🤖", title: "AI listing recommendations", desc: "For each top sentiment cluster, the platform generates the exact bullet point or A+ copy edit to test — no guesswork, no duplication." },
              { emoji: "🪔", title: "Festive-tuned review intelligence", desc: "Pre-festive review audits surface seasonal complaint themes specific to Big Billion Days, Great Indian Festival, Diwali, and Republic Day Sale — three weeks before the revenue window opens." }
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#F5F3FF] dark:bg-purple-900/20 flex gap-4 items-start">
                <span className="text-xl mt-0.5">{f.emoji}</span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>{f.title}</h4>
                  <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="box box-red">
            <div className="flex items-center gap-2 text-[#E11D48] dark:text-rose-400 text-[11px] font-black uppercase tracking-wider mb-3">
              📌 NO AGGRESSIVE PITCH
            </div>
            <p className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">
              If you're an Indian D2C seller on Amazon.in or Flipkart and you're still reading reviews manually — or running them through ChatGPT one CSV at a time — you're optimising on guesswork. The question isn't whether you need a review analysis tool — it's which one is built for your market and your budget. For most Indian D2C sellers, the answer is clearly an India-first platform.
            </p>
          </div>

          <h2 id="faq" className="mt-16 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {[
              {
                q: "What is the best Amazon review analysis tool for India?",
                a: "For Indian D2C sellers on Amazon.in and Flipkart, the best tool is one trained on Indian marketplace data — not adapted from a US platform. Insydz is the only AI review intelligence tool that natively supports Amazon.in and Flipkart together, classifies Hinglish and regional-language reviews correctly, and delivers WhatsApp alerts on negative sentiment spikes within 60 minutes. Pricing starts free."
              },
              {
                q: "How is review analysis different for Amazon.in vs Amazon.com?",
                a: "Indian reviews skew COD-driven, multilingual, and Tier 2/3-heavy — meaning sentiment patterns, complaint categories, and RTO-trigger themes are fundamentally different from the US. US-trained tools mis-classify Hinglish reviews as neutral, miss packaging- and transit complaints common in monsoon-affected pin codes, and have no Flipkart coverage. India-first tools are calibrated for all three."
              },
              {
                q: "How many reviews do I need before review analysis is useful?",
                a: "Theme clustering becomes statistically reliable around 100 reviews per ASIN. Below that, you can still spot recurring complaints manually. Above 500 reviews, AI clustering is the only sane way to extract patterns — and competitor analysis (which you should always run on listings with 1,000+ reviews) is impossible to do by hand at all."
              },
              {
                q: "Can I track competitor reviews on Flipkart, not just Amazon?",
                a: "Yes — but only with India-first tools. Helium 10 and Jungle Scout don't support Flipkart at all. Insydz tracks up to 10 competitor ASINs across both Amazon.in and Flipkart simultaneously, surfacing pain-point gaps where their buyers complain about something your product fixes but your listing doesn't mention."
              },
              {
                q: "How often should I review my sentiment-cluster report?",
                a: "Daily for WhatsApp alerts (0 minutes of effort). Weekly for the 30-minute cluster review and listing edits. Monthly for strategic audits — SKU roadmap, backend keyword refresh, and competitor gap analysis. Sellers who follow this rhythm typically see a 0.2–0.4 rating lift and 8–15% conversion improvement within 90 days."
              },
              {
                q: "How much do Amazon review analysis tools cost in India?",
                a: "Manual reading costs your time — 3–4 hours per week per major ASIN. Global SaaS like Helium 10 and Jungle Scout run ₹4,000–8,000/month and are US-tuned. ChatGPT + CSV export workflows are cheap but one-shot. India-first tools like Insydz start free for up to 1,000 reviews and scale to ₹1,999–2,999/month for full multi-ASIN, multi-platform coverage with WhatsApp alerts."
              }
            ].map((faq, i) => (
              <details key={i} className="group border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-slate-900 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-[15px]">{faq.q}</span>
                  <span className="transition group-open:rotate-45 text-purple-600 font-light text-2xl leading-none">+</span>
                </summary>
                <div className="p-5 pt-0 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="pt-3">{faq.a}</div>
                </div>
              </details>
            ))}
          </div>
        </main>
      </div>

      <section className="py-20 bg-blue-600 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-['Sora'] leading-tight">
            Winning on Amazon India and Flipkart in 2026 Isn't About Having the Best Product.
          </h2>
          <p className="text-blue-50 font-['Lora'] text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            It's about being the brand whose reviews tell the right story — and whose listings answer the complaints buried in your competitors'. Insydz delivers AI review intelligence built for Indian marketplace sellers, with Hinglish NLP and Flipkart coverage no global tool provides.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
            {[
              "Forever free plan",
              "No credit card",
              "Amazon.in + Flipkart",
              "WhatsApp alerts"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white font-['Sora'] text-sm md:text-base">
                <span className="text-white font-bold">✓</span> {item}
              </div>
            ))}
          </div>

          <Button 
            onClick={() => router.push("/login")} 
            className="bg-white text-purple-700 hover:bg-gray-100 font-bold px-8 md:px-12 py-6 md:py-8 text-base md:text-lg rounded-full shadow-2xl transition-all transform hover:scale-105 mb-6"
          >
            Start Free at insydz.com
          </Button>

          <p className="text-blue-200 text-sm font-['Lora']">
            No setup required · Amazon India, Flipkart supported · No credit card needed
          </p>
        </div>
      </section>
    </div>
  );
}
