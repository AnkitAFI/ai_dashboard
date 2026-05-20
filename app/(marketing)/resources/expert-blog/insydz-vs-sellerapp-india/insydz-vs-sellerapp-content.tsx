"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Clock, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen, Video, FileText,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation, LayoutGrid, Check, ArrowRight, ChevronRight, Share2, Rocket, Pin, Key, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SELLARIMAGE from "public/sellerapp.png";
import SELLARIMAGE2 from "public/sellerapp_2.png";
import SELLARIMAGE3 from "public/img6_comparison.png";
import HERO_GUIDE from "public/insydz-vs-seller-hero-guide.png";
import MISMATCH_IMAGE from "public/img2_mismatches.png";
import MARKET_INTEL_IMAGE from "public/img5_market_intel.png";
import KNOW_POSITION_IMAGE from "public/img4_know_position.png";
import TOP_PRODUCTS_IMAGE from "public/img1_top_products.png";
export const dynamic = "force-static";
import Image from "next/image";

// ─── Inline link helper ──────────────────────────────────────────────────────
const InLink = ({ to, children, color = "#F97316" }: { to: string; children: React.ReactNode, color?: string }) => {
  const router = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); router.push(to); window.scrollTo(0,0); }}
      style={{
        color: color,
        textDecoration: "underline",
        textDecorationColor: "rgba(249, 115, 22, 0.3)",
        textUnderlineOffset: "3px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
      onMouseLeave={(e) => (e.currentTarget.style.color = color)}
    >
      {children}
    </a>
  );
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

type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
};

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
  { id: "quick-answer",   label: "Quick Answer" },
  { id: "why-alternatives", label: "Why Indian Sellers Look for Alternatives" },
  { id: "side-by-side",   label: "Side-by-Side Comparison" },
  { id: "capability-matrix", label: "Full Capability Matrix" },
  { id: "where-wins",     label: "Where Each Tool Wins" },
  { id: "how-to-switch",  label: "How to Switch in 30 Days" },
  { id: "mistakes",       label: "5 Mistakes Sellers Make When Comparing" },
  { id: "faq",            label: "Frequently Asked Questions" },
];

export default function InsydzVsSellerAppContent() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("quick-answer");
  const [scrollPct, setScrollPct]   = useState(0);
  const [tocOpen, setTocOpen]       = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
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
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveSection(TOC[i].id); break; }
      }
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
        <button onMouseEnter={() => setActiveDropdown(label)} className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"}`}>
          {label}<ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
        {isActive && (
          <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {items.map((item, i) => (
              <button key={i} onClick={() => handleMenuItemClick(item)} className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                <span className={ac ? "text-orange-600" : "text-purple-600 dark:text-purple-400"}>{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                {item.badge && <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-semibold">{item.badge}</span>}
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
        
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes imgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        
        .internal-cta { background: #0D1B2A; border-radius: 16px; padding: 32px; margin: 48px 0; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); }
        .internal-cta h3 { color: white !important; font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; border-bottom: none !important; }
        .internal-cta p { color: #94A3B8 !important; font-size: 15px; margin-bottom: 24px; }

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#db2777,#7c3aed);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

        .breadcrumb{background:transparent;padding-top:80px;padding-bottom:12px}
        @media(min-width:640px){.breadcrumb{padding-top:90px;padding-bottom:16px}}
        @media(min-width:1024px){.breadcrumb{padding-top:100px}}
        
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .article-hero{max-width:1240px;margin:0 auto;padding:0 16px 0}
        @media(min-width:640px){.article-hero{padding:0 20px 0}}
        @media(min-width:1024px){.article-hero{padding:0 24px 0}}

        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07);margin:24px 0}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        @media(min-width:640px){.stat-strip{margin:32px 0}}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E2E8F0;text-align:center;border-bottom:1px solid #E2E8F0}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}
        @media(max-width:639px){.stat-item:nth-child(2){border-right:none}.stat-item:nth-child(3){border-right:1px solid #E2E8F0}.stat-item:nth-child(4){border-right:none;border-bottom:none}.stat-item:nth-child(3){border-bottom:none}}

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px}}

        .toc-sidebar{display:none}
        @media(min-width:768px){
          .toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto}
        }
        @media(min-width:1024px){.toc-sidebar{top:80px;padding:22px}}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}

        .mobile-toc-btn{display:flex;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#111;cursor:pointer;align-items:center;justify-content:space-between;margin-bottom:14px}
        .dark .mobile-toc-btn{background:#111827;border-color:#1f2937;color:#f9fafb}
        @media(min-width:768px){.mobile-toc-btn{display:none}}
        .mobile-toc-panel{display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:20px}
        .dark .mobile-toc-panel{background:#111827;border-color:#1f2937}
        .mobile-toc-panel.open{display:block}

        .article-body{font-family:'Lora',serif;font-size:15px;line-height:1.78;color:#1E293B}
        @media(min-width:640px){.article-body{font-size:15.5px}}
        @media(min-width:1024px){.article-body{font-size:16px}}
        .dark .article-body{color:#d1d5db}

        .article-body h2{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#0D1B2A;margin:40px 0 12px;padding-bottom:10px;border-bottom:2px solid #e5e7eb;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h2{font-size:20px;margin:48px 0 14px;scroll-margin-top:80px}}
        @media(min-width:1024px){.article-body h2{font-size:22px;margin:52px 0 14px;scroll-margin-top:84px}}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}

        .article-body h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:#0D1B2A;margin:28px 0 10px;letter-spacing:-.2px;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h3{font-size:17px;margin:32px 0 10px;scroll-margin-top:80px}}
        @media(min-width:1024px){.article-body h3{font-size:18px;scroll-margin-top:84px}}
        .dark .article-body h3{color:#f3f4f6}

        .article-body p{margin-bottom:16px}
        .article-body ul,ol{margin:4px 0 18px 22px}
        .article-body li{line-height:1.72;margin-bottom:8px}
        .article-body li::marker{color:#F97316}
        .article-body strong{font-weight:700;color:#0D1B2A}
        .dark .article-body strong{color:#f9fafb}
        .art-img-cap{font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:28px;padding:8px 12px;font-family:'Sora', sans-serif}

        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent;font-family:'Sora', sans-serif}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#431407;color:#fb923c}

        .takeaway-box{background:#0D1B2A;border-radius:10px;padding:22px 20px;margin:22px 0}
        @media(min-width:640px){.takeaway-box{padding:28px 30px;margin:28px 0}}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:white;margin:0 0 14px}
        @media(min-width:640px){.takeaway-box h3{font-size:18px;margin:0 0 16px}}
        .takeaway-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
        @media(min-width:640px){.takeaway-item{gap:10px;margin-bottom:10px}}
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#F97316;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        .verdict-box {
          background: #0D1B2A; border-radius: 20px;
          padding: 32px; margin: 40px 0; color: #F8FAFC;
          display: flex; gap: 24px; border: 1px solid rgba(249, 115, 22, 0.2);
        }
        @media(max-width: 640px) { .verdict-box { flex-direction: column; } }
        .verdict-icon { width: 48px; height: 48px; background: #DB2777; border-radius: 12px; display: flex; items-center; justify-content: center; color: white; flex-shrink: 0; }

        .quick-answer {
          background: #F0F9FF; border-left: 4px solid #3B82F6;
          border-radius: 12px; padding: 24px; margin: 40px 0;
          font-size: 15px; display: flex; gap: 16px;
        }
        .dark .quick-answer { background: #0c1c2c; border-color: #0ea5e9; }

        .reality-box { background: #FFFBF0; border-left: 4px solid #F59E0B; border-radius: 12px; padding: 24px 28px; margin: 32px 0; position: relative; }
        .dark .reality-box { background: #1c1507; border-color: #451a03; }
        .reality-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #D97706; letter-spacing: 1px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

        .switch-step { display: flex; gap: 20px; margin-bottom: 20px; background: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .dark .switch-step { background: #111827; border-color: #1f2937; }
        .step-num { width: 32px; height: 32px; background: #7C3AED; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; font-family: 'Sora', sans-serif; flex-shrink: 0; }
        .key-insight-box { background: #F5F3FF; border-left: 4px solid #8B5CF6; border-radius: 12px; padding: 24px 28px; margin: 32px 0; }
        .dark .key-insight-box { background: #1e1b4b66; border-color: #8b5cf6; }

        .matrix-table { width: 100%; border-collapse: collapse; font-family: 'Sora', sans-serif; font-size: 13.5px; }
        .matrix-table th { background: #0D1B2A; color: white; text-align: left; padding: 14px 16px; font-weight: 700; }
        .matrix-table td { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; vertical-align: middle; }
        .dark .matrix-table td { border-color: #1f2937; color: #d1d5db; }
        .matrix-table tr:nth-child(even) { background: #F8FAFC; }
        .dark .matrix-table tr:nth-child(even) { background: #0f172a; }

        .tag-verdict { background: #F97316; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-left: 8px; text-transform: uppercase; }

        .p-badge { font-size: 10.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; display: inline-block; white-space: nowrap; }
        .p-red { background: #FEE2E2; color: #B91C1C; }
        .p-green { background: #DCFCE7; color: #15803D; }
        .p-orange { background: #FFEDD5; color: #9A3412; }
        .dark .p-red { background: #450a0a; color: #f87171; }
        .dark .p-green { background: #064e3b; color: #34d399; }
        .dark .p-orange { background: #431407; color: #fb923c; }

        .choice-box { padding: 24px 28px; border-radius: 12px; margin: 24px 0; border-left: 4px solid; position: relative; }
        .box-green { background: #F0FDF4; border-color: #10B981; }
        .box-purple { background: #F5F3FF; border-color: #8B5CF6; }
        .dark .box-green { background: #064e3b44; border-color: #10b981; }
        .dark .box-purple { background: #4c1d9544; border-color: #8b5cf6; }
        .choice-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

        .case-study-box { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin: 32px 0; background: white; }
        .dark .case-study-box { border-color: #1f2937; background: #0D1B2A; }
        .cs-header { background: #0D1B2A; color: white; padding: 12px 24px; font-family: 'Sora', sans-serif; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .cs-grid { display: grid; grid-template-columns: 1fr; }
        @media(min-width: 768px) { .cs-grid { grid-template-columns: repeat(3, 1fr); } }
        .cs-item { padding: 24px; border-bottom: 1px solid #F1F5F9; }
        @media(min-width: 768px) { .cs-item { border-bottom: none; border-right: 1px solid #F1F5F9; } .cs-item:last-child { border-right: none; } }
        .dark .cs-item { border-color: #1f2937; }
        .cs-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 8px; display: block; }
        .cs-val { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 8px; display: block; }
        .cs-desc { font-family: 'Lora', serif; font-size: 13px; color: #475569; line-height: 1.5; }
        .dark .cs-desc { color: #9ca3af; }

        .internal-cta { background: #0D1B2A; border-radius: 16px; padding: 32px; margin: 48px 0; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); }
        .internal-cta h3 { color: white; font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .internal-cta p { color: #94A3B8; font-family: 'Lora', serif; font-size: 14px; margin-bottom: 24px; }

        .feature-pick-box { background: #F5F3FF; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 16px; border: 1px solid transparent; transition: all 0.2s; }
        .dark .feature-pick-box { background: #1e1b4b; }
        .feature-pick-box:hover { border-color: #8B5CF6; }
        .fp-icon { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .fp-title { font-family: 'Sora', sans-serif; font-size: 14.5px; font-weight: 800; color: #0D1B2A; margin-bottom: 4px; display: block; }
        .dark .fp-title { color: white; }
        .fp-desc { font-family: 'Lora', serif; font-size: 13.5px; color: #475569; line-height: 1.5; m-0; }
        .dark .fp-desc { color: #9ca3af; }

        .soft-pitch-box { background: #FFF1F2; border-left: 4px solid #F43F5E; border-radius: 12px; padding: 24px 28px; margin-top: 32px; }
        .dark .soft-pitch-box { background: #4c051944; border-color: #f43f5e; }
        .soft-pitch-label { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #E11D48; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

        .insight-box { background: #F5F3FF; border-radius: 12px; padding: 20px 24px; margin: 40px 0; border-left: 4px solid #7C3AED; display: flex; gap: 16px; }
        .dark .insight-box { background: #1e1b4b; border-color: #7c3aed; }

        .dark .faq-item { border-color: #1f2937; }
        .faq-item.active { border-color: #F97316; }
        .faq-q { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #0D1B2A; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: color 0.2s; }
        .dark .faq-q { color: #f9fafb; }
        .faq-a { font-family: 'Lora', serif; font-size: 14.5px; color: #475569; margin-top: 16px; line-height: 1.7; padding-top: 16px; border-top: 1px solid #F1F5F9; }
        .dark .faq-a { color: #9ca3af; border-color: #1f2937; }

        .faq-icon-container { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .faq-icon-plus { background: #FFF7ED; color: #F97316; }
        .faq-icon-x { background: #F97316; color: white; transform: rotate(0deg); }

        .faq-item { border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 24px; margin-bottom: 12px; background: white; transition: all 0.3s; }
        .dark .faq-item { background: #0D1B2A; border-color: #1f2937; }

        /* ── Related grid ── */
        .related-grid{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:480px){.related-grid{grid-template-columns:1fr 1fr;gap:14px}}
        @media(min-width:768px){.related-grid{grid-template-columns:repeat(3,1fr);gap:16px}}
        .rel-card{border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;background:#fff;text-decoration:none;display:block}
        .dark .rel-card{background:#111827;border-color:#1f2937}
        .rel-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);transform:translateY(-2px)}
        .rel-thumb{width:100%;aspect-ratio:2.4/1;overflow:hidden;background:#0A0F1A;display:flex;align-items:center;justify-content:center}
        .rel-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .rel-body{padding:12px}
        @media(min-width:640px){.rel-body{padding:14px}}
        .rel-tag{font-size:10px;font-weight:700;color:#FF9900;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-tag{font-size:10.5px;margin-bottom:6px}}
        .rel-title{font-size:12px;font-weight:700;color:#0A0F1A;line-height:1.4;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-title{font-size:13px}}
        .dark .rel-title{color:#f9fafb}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 shadow-lg h-16 sm:h-18 lg:h-20" : "bg-background dark:bg-gray-900/80 h-16 sm:h-18 lg:h-20"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
              <img src="/logo.png" alt="Insydz Logo" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent ml-2">Insydz</span>
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <button onClick={() => router.push("/pricing")} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium transition-colors">Pricing</button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button onClick={() => router.push("/login")} className="ml-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Button>
            </div>
            <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <button onClick={() => router.push("/")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Home</button>
          <span style={{ fontSize: 10 }}>›</span>
          <button onClick={() => router.push("/resources/expert-blog")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Blog</button>
          <span style={{ fontSize: 10 }}>›</span>
          <button onClick={() => router.push("/resources/expert-blog")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Compare</button>
          <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color:"#94A3B8" }}>Insydz vs SellerApp</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F5F3FF", color:"#7C3AED", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase" as const, padding:"4px 12px", borderRadius:20, marginBottom:14 }}>
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Compare · Tool Comparison
        </div>
        
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:800, lineHeight:1.18, color:"#0D1B2A", letterSpacing:"-.5px", marginBottom:14, maxWidth:820 }} className="dark:text-white">
          <span style={{ color:"#7C3AED" }}>Insydz vs SellerApp</span>: Which Amazon Seller Tool Actually Works for the Indian Market?
        </h1>

        <p style={{ fontFamily:"'Lora',serif", fontSize:"clamp(14px,2vw,17px)", color:"#475569", lineHeight:1.65, maxWidth:760, marginBottom:16 }} className="dark:text-gray-400">
          A practitioner's comparison built for ₹5L–50L/month Indian sellers — INR pricing vs USD billing, 
          Flipkart-native vs Amazon-only, WhatsApp alerts vs email digests. Read this before you commit to a 12-month contract.
        </p>

        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>Vikrant Singh</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />May 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong>11 min read</strong></div>
          <span style={{ background:"#FFEDD5", color:"#F97316", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Updated for 2026</span>
          <span style={{ background:"#F5F3FF", color:"#7C3AED", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Tool Comparison</span>
        </div>

        <div className="stat-strip">
          {[
            ["₹8,300+", "SellerApp Pro starting price/mo (USD billed) — vs ₹1,999 Insydz"],
            ["0",      "Native Flipkart features in SellerApp — Indian sellers leave half their data behind"],
            ["16",     "Marketplaces SellerApp supports — but only 1 (Amazon.in) is Indian"],
            ["< 60 min",  "WhatsApp rank-drop alerts on Insydz — SellerApp only sends email"]
          ].map(([val, lbl], i) => (
            <div className="stat-item" key={i}>
              <span style={{ display:"block", fontSize:24, fontWeight:800, color:"#F97316", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{val}</span>
              <span style={{ display:"block", fontSize:11, color:"#64748B", marginTop:5, lineHeight:1.4, fontWeight:500 }}>{lbl}</span>
            </div>
          ))}
        </div>

        <ArticleImg 
          src={HERO_GUIDE}
          alt="Insydz vs SellerApp India Hero Guide" 
          caption="Insydz is purpose-built for Indian sellers operating on Amazon.in + Flipkart — not a global tool retrofitted for India." 
        />
        <ArticleImg 
          src={SELLARIMAGE}
          alt="SellerApp vs Insydz Comparison Dashboard" 
          caption="SellerApp vs Insydz at a glance — pricing model, marketplace coverage, and India-first feature gaps surfaced upfront." 
        />
        <ArticleImg 
          src={SELLARIMAGE2}
          alt="SellerApp vs Insydz Comparison Dashboard" 
          caption="SellerApp vs Insydz at a glance — pricing model, marketplace coverage, and India-first feature gaps surfaced upfront." 
        />
      </div>

      {/* Main Content Layout */}
      <div className="article-layout">
        <aside className="toc-sidebar">
          <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#94A3B8", marginBottom: 14 }}>Inside This Comparison</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {TOC.map(t => (
              <li key={t.id}><button className={`toc-link${activeSection === t.id ? " active" : ""}`} onClick={() => go(t.id)}>{t.label}</button></li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gray-900 rounded-xl p-5 text-white">
              <h5 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.35 }}>See Insydz vs Your Stack</h5>
              <p style={{ fontSize: "11.5px", color: "#94A3B8", marginBottom: 14, lineHeight: 1.6, fontFamily: "'Sora',sans-serif" }}>Free 30-min audit — we map your SellerApp data to Insydz and show you the INR savings.</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }} className="text-[10px] space-y-2 font-['Sora'] font-semibold">
                <li className="flex items-center gap-2 text-green-400"><Check className="w-3 h-3" /> Free forever plan</li>
                <li className="flex items-center gap-2 text-green-400"><Check className="w-3 h-3" /> Amazon.in + Flipkart</li>
                <li className="flex items-center gap-2 text-green-400"><Check className="w-3 h-3" /> WhatsApp rank alerts</li>
              </ul>
              <Button onClick={() => router.push("/login")} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-5 rounded-lg shadow-lg font-bold">Start Free</Button>
            </div>
          </div>
        </aside>

        <main className="article-body">
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)}>
            <span className="flex items-center gap-2"><Menu className="w-4 h-4" /> Table of Contents</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`mobile-toc-panel ${tocOpen ? "open" : ""}`}>
             {TOC.map(t => (
                <button key={t.id} onClick={() => go(t.id)} className={`toc-link ${activeSection === t.id ? "active" : ""}`}>{t.label}</button>
             ))}
          </div>

          <div id="quick-answer" className="quick-answer">
             <div className="flex-shrink-0 mt-1">
                <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
             </div>
             <div>
                <span className="block font-['Sora'] text-[11px] font-[800] text-blue-600 tracking-wider mb-2 uppercase">Quick Answer</span>
                <p className="text-[#1E293B] dark:text-gray-300 m-0 font-['Lora'] text-[15px] leading-relaxed">
                  For Indian sellers active on both Amazon.in and Flipkart, Insydz is the better SellerApp alternative — it costs roughly 75% less, supports Flipkart natively, sends WhatsApp rank-drop alerts within 60 minutes, and is calibrated on Indian marketplace data. SellerApp remains a strong choice for India-based sellers focused exclusively on Amazon.com or other global marketplaces.
                </p>
             </div>
          </div>

          <h2 id="why-alternatives">Why Are Indian Sellers Searching for a SellerApp Alternative?</h2>
          <p>
            SellerApp is a competent platform — there's no need to oversell the criticism. The reason Indian sellers keep typing "sellerapp alternative india" into Google is rarely about feature gaps. It's about three structural mismatches that show up the moment you actually try to run an Indian D2C business on the platform.
          </p>

          <h3>1. Pricing is in USD — Your Revenue is in INR</h3>
          <p>
            SellerApp's paid plans start at $99/month and scale to $199+/month for the Pro tier most growth sellers need. At current FX, that's roughly ₹8,300–₹16,500/month — a real number when your monthly Amazon.in revenue is ₹5L and PPC eats another ₹40K. Worse, USD billing means your tool cost moves every month with the rupee. Most Indian SMB sellers also can't claim GST input credit cleanly on USD invoices issued from a foreign entity.
            <br /><br />
            Insydz prices in rupees, issues GST-compliant invoices from an Indian entity, and starts at ₹1,999/month with a forever-free tier for sellers under 1,000 reviews tracked. For a ₹15L/month seller, that's roughly ₹78,000 saved per year on tooling alone.
          </p>

          <h3>2. Flipkart is the Missing Marketplace</h3>
          <p>
            SellerApp supports 16 marketplaces — almost all Amazon. Flipkart is not among them. For an Indian seller, that means roughly 30–45% of your marketplace data simply isn't visible in the platform you're paying for. You can't track Flipkart keyword ranks, you can't see Flipkart competitor pricing, you can't run unified review analysis across both marketplaces. Most Indian sellers end up running SellerApp for Amazon and a separate manual process for Flipkart — paying for half a tool.
            <br /><br />
            Insydz tracks Amazon.in and Flipkart natively in the same dashboard. Same competitor lists, same keyword universe, unified PPC and rank reporting.
          </p>

          <h3>3. The Feature Set Is Calibrated on US Buyer Behaviour</h3>
          <p>
            SellerApp's keyword research, listing optimization, and review intelligence are tuned on Amazon.com data and English-language buyer signals. That means Hinglish reviews ("bahut bekaar product hai bhai") get classified as neutral, Hindi-transliterated search queries don't surface in keyword reports, and the festive window logic that drives 40–60% of Indian category revenue in 4–7 days doesn't exist. You're paying for a global platform and adapting it to India — every week.
          </p>

          <ArticleImg 
            src={MISMATCH_IMAGE}
            alt="3 Structural Mismatches in Global Seller Tools" 
            caption="Three structural gaps that make global tools fail Indian D2C sellers — and how Insydz closes each one." 
          />

          <div className="reality-box">
             <span className="reality-label">Practitioner Reality</span>
             <p className="text-[#1E293B] dark:text-gray-300 m-0 font-['Lora'] text-[15px] leading-relaxed">
               A Bengaluru-based home goods seller running ₹22L/month on Amazon.in summed it up: "SellerApp's PPC dashboard is genuinely better than what most Indian tools offer. But I was paying ₹14,000/month for something that ignored my Flipkart business completely and couldn't tell me when a Hindi-language competitor stole my festive rank. I wasn't getting 70% of my own data back."
             </p>
          </div>

          <h2 id="side-by-side">Insydz vs SellerApp: Side-by-Side Comparison</h2>
          <p>Here is the comparison most Indian growth sellers actually need to make before signing a 12-month contract.</p>
          <ArticleImg 
            src={SELLARIMAGE3}
            alt="SellerApp vs Insydz Side-by-Side Comparison" 
            caption="SellerApp vs Insydz — what changes when the platform is actually built for the Indian seller workflow." 
          />
          <h3>Full Capability Matrix</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm my-8 mb-12">
             <table className="matrix-table">
                <thead>
                   <tr>
                      <th>CAPABILITY</th>
                      <th>SELLERAPP</th>
                      <th>INSYDZ (INDIA-FIRST)</th>
                   </tr>
                </thead>
                <tbody>
                   <tr>
                      <td><strong>Pricing (Starting)</strong></td>
                      <td style={{ color: "#D97706" }}>~₹8,300/mo (USD)</td>
                      <td><span className="p-badge p-green">₹1,999/mo + Free Plan</span></td>
                   </tr>
                   <tr>
                      <td><strong>Billing Currency</strong></td>
                      <td>USD — FX volatility</td>
                      <td><strong>INR — predictable</strong></td>
                   </tr>
                   <tr>
                      <td><strong>GST Invoice / Input Credit</strong></td>
                      <td><span className="p-badge p-red">No — foreign entity</span></td>
                      <td><span className="p-badge p-green">Yes — Indian entity</span></td>
                   </tr>
                   <tr>
                      <td><strong>Amazon.in Native Data</strong></td>
                      <td>Partial — global engine</td>
                      <td><strong>Native — India-first</strong></td>
                   </tr>
                   <tr>
                      <td><strong>Flipkart Rank & Reviews</strong></td>
                      <td><span className="p-badge p-red">Not supported</span></td>
                      <td><span className="p-badge p-green">Full coverage</span></td>
                   </tr>
                   <tr>
                      <td><strong>Meesho Visibility</strong></td>
                      <td>Not supported</td>
                      <td className="text-gray-500">Roadmap (Q3 2026)</td>
                   </tr>
                   <tr>
                      <td><strong>Hindi / Hinglish NLP</strong></td>
                      <td><span className="p-badge p-red">English only</span></td>
                      <td><span className="p-badge p-green">Native + transliteration</span></td>
                   </tr>
                   <tr>
                      <td><strong>Festive Calendar Logic (BBD, GIF, Diwali)</strong></td>
                      <td className="text-gray-500">Generic seasonality</td>
                      <td><strong>India calendar tuned</strong></td>
                   </tr>
                   <tr>
                      <td><strong>Rank Drop Alerts</strong></td>
                      <td className="text-gray-500">Email — daily digest</td>
                      <td><strong>WhatsApp — &lt; 60 min</strong></td>
                   </tr>
                   <tr>
                      <td><strong>PPC Automation Depth</strong></td>
                      <td><span className="p-badge p-green">Mature, multi-marketplace</span></td>
                      <td className="text-gray-500">India-Amazon focused</td>
                   </tr>
                   <tr>
                      <td><strong>Profit Dashboard</strong></td>
                      <td className="text-gray-500">Strong — multi-currency</td>
                      <td>India fee + GST aware</td>
                   </tr>
                   <tr>
                      <td><strong>RTO / COD Returns Intelligence</strong></td>
                      <td><span className="p-badge p-red">Not built for it</span></td>
                      <td><span className="p-badge p-green">India-calibrated</span></td>
                   </tr>
                   <tr>
                      <td><strong>Customer Support Channel</strong></td>
                      <td className="text-gray-500">Email + chat (US/SG hours)</td>
                      <td><strong>WhatsApp (IST hours)</strong></td>
                   </tr>
                   <tr style={{ background: "#F5F3FF" }}>
                      <td style={{ color: "#7C3AED" }}><strong>Best For</strong> <span className="tag-verdict">VERDICT</span></td>
                      <td style={{ color: "#7C3AED" }}>Sellers on Amazon.com / global SKUs</td>
                      <td style={{ color: "#7C3AED" }}><strong>Indian SMB on Amazon.in + Flipkart</strong></td>
                   </tr>
                </tbody>
             </table>
          </div>

          <ArticleImg 
            src={MARKET_INTEL_IMAGE}
            alt="Real-time competitor price and rank monitoring" 
            caption="Insydz surfaces real-time competitor price moves across Amazon.in and Flipkart in one unified view — with WhatsApp alerts under 60 minutes." 
          />

          <h2 id="where-wins">Where Does Each Tool Genuinely Win?</h2>
          <p className="text-gray-600 dark:text-gray-400 font-['Lora'] mb-8">This isn't a hit piece — both tools have strengths. Knowing which fits your seller profile prevents a 12-month regret.</p>
          
          <div className="choice-box box-green">
            <span className="choice-label text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 bg-emerald-500 text-white rounded-[2px] p-[1px]" /> Choose SellerApp if...
            </span>
            <p className="text-[#1E293B] dark:text-gray-300 m-0 font-['Lora'] text-[15px] leading-relaxed">
              You sell primarily on Amazon.com (or UAE / UK / DE marketplaces), USD billing isn't a problem, you don't need Flipkart visibility, and you need mature multi-marketplace PPC automation. SellerApp's keyword tools, profit dashboard, and ad automation are genuinely strong for a global Amazon-only operation. If your Amazon.in revenue is under ₹2L/month and your bigger play is US export, SellerApp's depth justifies the price.
            </p>
          </div>

          <div className="choice-box box-purple">
            <span className="choice-label text-purple-700 dark:text-purple-400">
              <Check className="w-4 h-4 bg-purple-500 text-white rounded-[2px] p-[1px]" /> Choose Insydz if...
            </span>
            <p className="text-[#1E293B] dark:text-gray-300 m-0 font-['Lora'] text-[15px] leading-relaxed">
              You run Amazon.in and Flipkart together (most Indian SMB sellers), your monthly tool budget is in rupees and matters, you want WhatsApp alerts at 11pm during Big Billion Days, and your reviews and search queries include Hinglish or regional language. Insydz is built specifically for the ₹5L–50L/month Indian D2C operator who needs an integrated marketplace view, GST-compliant invoicing, and India-calibrated AI — without a US-priced contract.
            </p>
          </div>

          <h3 className="mt-12 mb-4 font-['Sora'] font-extrabold text-xl">The Honest Trade-Off</h3>
          <p className="text-gray-700 dark:text-gray-300 font-['Lora'] leading-relaxed mb-12">
            SellerApp's PPC automation depth on global Amazon is more mature than what any India-first tool, including Insydz, currently offers — that's a fair admission. The question is whether you'll actually use that depth on Amazon.in, where your ₹35K/month ad budget needs sharper INR-priced tooling and Flipkart visibility more than it needs multi-marketplace bid stacking.
          </p>

          <ArticleImg 
            src={KNOW_POSITION_IMAGE}
            alt="Know Your Position rank intelligence dashboard" 
            caption="Insydz tracks rank positions across Amazon.in and Flipkart in real time — so Indian sellers never lose their position during festive windows." 
          />

          <h2 id="how-to-switch">How Do You Switch From SellerApp to Insydz in 30 Days?</h2>
          <p className="text-gray-600 dark:text-gray-400 font-['Lora'] mb-8">If you've decided to test the alternative, here's the sequence Indian sellers we've onboarded actually follow. No big-bang migration, no data loss, no mid-month subscription overlap drama.</p>
          
          <div className="space-y-4 mb-8">
             <div className="switch-step">
                <div className="step-num">1</div>
                <div className="step-body">
                   <strong className="block text-[#0D1B2A] dark:text-white font-['Sora'] text-base mb-2">Week 1: Run Both Tools in Parallel</strong>
                   <p className="text-sm text-gray-600 dark:text-gray-400 m-0 font-['Lora'] leading-relaxed">Activate the Insydz free plan. Connect your Amazon.in and Flipkart seller accounts. Don't cancel SellerApp yet. For the first week, do nothing except let both tools track the same ASINs side-by-side — you'll instantly see the Flipkart data SellerApp was missing.</p>
                </div>
             </div>
             <div className="switch-step">
                <div className="step-num">2</div>
                <div className="step-body">
                   <strong className="block text-[#0D1B2A] dark:text-white font-['Sora'] text-base mb-2">Week 2: Export and Map Your SellerApp Data</strong>
                   <p className="text-sm text-gray-600 dark:text-gray-400 m-0 font-['Lora'] leading-relaxed">Export your tracked keyword list, competitor ASINs, and PPC negatives from SellerApp as CSV. Insydz import handles all three in one upload. Your historical PPC learnings come with you — you don't restart from zero.</p>
                </div>
             </div>
             <div className="switch-step">
                <div className="step-num">3</div>
                <div className="step-body">
                   <strong className="block text-[#0D1B2A] dark:text-white font-['Sora'] text-base mb-2">Week 3: Set Up WhatsApp Alerts and Festive Calendar</strong>
                   <p className="text-sm text-gray-600 dark:text-gray-400 m-0 font-['Lora'] leading-relaxed">Configure WhatsApp rank-drop alerts (the single biggest behavioural change you'll feel — no more email dashboards at 9am after a 2am festive event). Tag your top 10 ASINs to the BBD/GIF/Diwali festive calendar so the AI primes 21 days before each window.</p>
                </div>
             </div>
             <div className="switch-step">
                <div className="step-num">4</div>
                <div className="step-body">
                   <strong className="block text-[#0D1B2A] dark:text-white font-['Sora'] text-base mb-2">Week 4: Cancel SellerApp at Renewal</strong>
                   <p className="text-sm text-gray-600 dark:text-gray-400 m-0 font-['Lora'] leading-relaxed">By Week 4 you'll have a parallel data set across both tools. Cancel SellerApp at next renewal — no early-cancellation drama, no contract cliff. Re-route your ₹8,300+/month savings into PPC budget or product photography. Most sellers see ROI inside the first 60 days from the freed-up budget alone.</p>
                </div>
             </div>
          </div>

          <div className="key-insight-box">
             <span className="choice-label text-purple-700 dark:text-purple-400">KEY INSIGHT</span>
             <p className="text-[#1E293B] dark:text-gray-300 m-0 font-['Lora'] text-[15px] leading-relaxed">
               The biggest switching mistake isn't picking the wrong tool — it's running them sequentially instead of in parallel for two weeks. Parallel tracking gives you actual Insydz vs SellerApp data on your own ASINs, not marketing-page screenshots.
             </p>
          </div>

          <h2 id="mistakes">5 Mistakes Indian Sellers Make When Comparing Tools</h2>
          <p className="text-gray-600 dark:text-gray-400 font-['Lora'] mb-8">Most tool-comparison decisions go wrong before the trial even starts. These are the patterns we see across hundreds of Indian seller switch conversations.</p>

          <div className="space-y-4 my-8">
            {[
              ["Comparing on Feature Count, Not Feature Fit", "SellerApp lists 30+ features. Insydz lists fewer. That's irrelevant if the features you'll actually use weekly are the same six — keyword research, rank tracking, review mining, PPC alerts, competitor pricing, profit dashboard. Map your weekly workflow first, then compare."],
              ["Ignoring USD-to-INR FX Risk", "A $99/month plan was ₹7,200 in 2022, ₹8,000 in 2024, ₹8,300+ in 2026. That's a 15% silent price increase no one asked you to approve. Tool cost should be predictable — INR billing makes it so."],
              ["Trusting G2 / Capterra Reviews Without an Indian Filter", "SellerApp's G2 page is dominated by US sellers raving about ACoS reduction on Amazon.com. That's a different product context than yours. Filter reviews by India-based sellers, or — better — find sellers in your category on r/IndianEcommerce and ask directly."],
              ["Skipping the Free Trial Because You're Already Paying", "Sunk-cost thinking is the most expensive bias in SaaS. You're paying SellerApp ₹14,000 this month whether or not you trial Insydz. The cost of running both for 14 days is ₹0 — and the cost of staying on the wrong tool for 12 months is ₹1.6L+."],
              ["Not Asking About Festive Support Hours", "Big Billion Days runs through October. If your tool's support is in PT or SGT timezone, your 11pm IST rank drop on Day 2 of BBD waits till morning. Ask the support timezone question before signing anything. WhatsApp-based IST support is the difference between catching a ₹4L revenue dip and not."]
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-5 p-6 rounded-xl border border-[#F1F5F9] bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                <span className="flex-shrink-0 w-8 h-8 rounded-md bg-black text-white flex items-center justify-center text-xs font-black font-['Sora']">{i+1}</span>
                <div>
                  <strong className="block text-[#0D1B2A] dark:text-white mb-2 font-['Sora'] text-base">{title}</strong>
                  <p className="text-[14.5px] text-gray-600 dark:text-gray-400 m-0 font-['Lora'] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 id="story" className="mt-16">Real Switch Story: Surat Apparel Brand</h2>
          <p className="text-gray-600 dark:text-gray-400 font-['Lora'] mb-8">A Surat-based apparel D2C brand selling kurtas across Amazon.in and Flipkart was running SellerApp for 14 months before switching to Insydz in late 2025. Same SKUs, same team, same ad budget. Here's what changed.</p>

          <div className="case-study-box">
            <div className="cs-header">CASE STUDY · SURAT APPAREL · ₹28L/MO REVENUE</div>
            <div className="cs-grid">
              <div className="cs-item">
                <span className="cs-label">BEFORE — ON SELLERAPP</span>
                <span className="cs-val text-red-600">₹14,200/mo</span>
                <p className="cs-desc">USD billing, no Flipkart data, missed 3 of 5 BBD rank drops because email alerts arrived next morning. Flipkart managed manually in spreadsheets.</p>
              </div>
              <div className="cs-item">
                <span className="cs-label">ACTION — SWITCH TO INSYDZ</span>
                <span className="cs-val text-blue-600">30 days</span>
                <p className="cs-desc">Parallel run for 2 weeks, exported keywords + PPC negatives, set up WhatsApp festive alerts on top 12 ASINs, cancelled SellerApp at renewal.</p>
              </div>
              <div className="cs-item">
                <span className="cs-label">AFTER — 90 DAYS IN</span>
                <span className="cs-val text-emerald-600">+₹4.6L/mo</span>
                <p className="cs-desc">Tool cost down to ₹1,999/mo (-86%), Flipkart revenue up 31% from previously invisible keyword gaps, festive rank recovery time cut from 18 hours to 90 minutes.</p>
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 font-['Lora'] leading-relaxed mb-12">
            The Flipkart upside surprised everyone — including the Insydz team. The brand had 22 SKUs on Flipkart that were ranking P3–P8 for buy-intent terms, but no one was watching them because SellerApp simply didn't show that data. Surfacing it took 11 days. Acting on it added ₹4.6L in monthly Flipkart revenue inside one quarter.
          </p>

          <ArticleImg 
            src={TOP_PRODUCTS_IMAGE}
            alt="Product Intelligence Top Products Ranked" 
            caption="Insydz's India-calibrated AI ranks your products by opportunity across Amazon.in and Flipkart — with Hinglish sentiment and festive priming built in." 
          />

          <div className="internal-cta">
            <h3>Run Insydz and SellerApp in Parallel — Free for 14 Days</h3>
            <p>No card, no contract. See your Amazon.in + Flipkart data side-by-side. If Insydz isn't sharper for the Indian market, keep SellerApp.</p>
            <Button onClick={() => router.push("/login")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-12 py-6 rounded-xl text-base transition-all transform hover:scale-105">
              Start Free Trial →
            </Button>
          </div>
          <h2 id="why-pick" className="mt-16">Why Indian SMB Sellers Pick Insydz Specifically</h2>
          <div className="space-y-3 mb-12">
            {[
              ["🇮🇳", "INR-priced, GST-compliant from day 1", "Predictable monthly cost in rupees, GST input credit available, no FX surprises mid-quarter. Built and billed from an Indian entity."],
              ["🛒", "Amazon.in + Flipkart in one dashboard", "Same competitor lists, same keyword universe, unified review and rank tracking — no spreadsheet juggling between two tools."],
              ["📱", "WhatsApp alerts within 60 minutes", "Rank drops, competitor moves, festive sentiment spikes — delivered to where Indian sellers already work, not buried in email at 6am."],
              ["🪔", "Festive calendar tuned for Indian e-commerce", "BBD, Great Indian Festival, Diwali, Republic Day Sale — keyword priming starts 21 days before each window. Generic seasonality models miss this entirely."],
              ["💬", "Hinglish & regional NLP", "Reviews and search queries in Hindi, Hinglish, and transliterated Tamil/Telugu are clustered correctly — not flagged as low-confidence and dropped."],
              ["🚚", "RTO & COD-aware analytics", "Returns, COD refusal patterns, and pin-code-level RTO signals are part of the standard view — because in India, that's where margin actually leaks."]
            ].map(([icon, title, desc], i) => (
              <div key={i} className="feature-pick-box">
                {/* <div className="fp-icon">{icon}</div> */}
                <div>
                  <span className="fp-title">{title}</span>
                  <p className="fp-desc">{desc}</p>
                </div>
              </div>
            ))}

            <div className="soft-pitch-box">
              <span className="soft-pitch-label"><Pin className="w-4 h-4 fill-[#E11D48]" /> SOFT PITCH — NOT A SALES PUSH</span>
              <p className="text-[#1E293B] dark:text-gray-300 m-0 font-['Lora'] text-[15.5px] leading-relaxed">
                SellerApp is genuinely good at what it does. It's just not designed for the Indian SMB seller's actual workflow — and paying USD prices for a tool that can't see your Flipkart revenue is a math problem, not a brand argument. If you're already on SellerApp and your Amazon.in business is the larger half of your revenue, run Insydz alongside for 14 days. The data will tell you which one to keep.
              </p>
            </div>
          </div>

          <h2 id="faq">Frequently Asked Questions</h2>
          <div className="mb-24">
            {[
              ["Is Insydz really cheaper than SellerApp, or are features cut?", "Insydz starts at ₹1,999/mo with a forever-free tier; SellerApp paid plans start around $99/mo (~₹8,300). Insydz hasn't cut features — it's cut the global-marketplace overhead Indian sellers don't use, and added Flipkart, Hinglish NLP, and WhatsApp alerts that SellerApp doesn't offer. The savings are real because the product scope is different."],
              ["Can I migrate my SellerApp keyword and competitor data to Insydz?", "Yes. Insydz import accepts SellerApp's standard CSV exports — tracked keywords, competitor ASINs, PPC negatives, and historical rank data all map across without manual reformatting. Most growth sellers complete migration in under 30 minutes. Your historical PPC learnings carry over; you don't start from zero."],
              ["Does SellerApp support Flipkart at all?", "No — SellerApp's 16-marketplace coverage is built around Amazon properties (US, UK, IN, JP, DE, etc.). Flipkart is not a supported marketplace. Indian sellers using SellerApp typically run Flipkart in spreadsheets or a separate tool. Insydz tracks Amazon.in and Flipkart natively in the same dashboard."],
              ["What about PPC automation? Isn't SellerApp stronger there?", "For multi-marketplace global sellers, yes — SellerApp's PPC depth across Amazon US/EU/JP is more mature. For Amazon.in-focused sellers running ₹20K–₹2L/month in ad spend, Insydz's India-tuned automation closes the gap and adds Flipkart ad signals SellerApp can't see. Above ₹5L/month Amazon.in ad spend, run both for 30 days and compare ACoS directly."],
              ["Is Insydz reliable for serious growth sellers, or just SMB?", "Insydz is built for ₹5L–50L/month Indian D2C operators — exactly the growth-seller segment. The platform handles 500+ ASINs per account, tracks 100+ competitors, supports agency workspaces, and delivers SLA-backed WhatsApp alerts. Enterprise brands above ₹2Cr/month typically still benefit from running Insydz for India + a global tool for export markets."],
              ["What happens to my data if I cancel Insydz later?", "All your tracked keywords, competitor lists, PPC history, and review intelligence exports as CSV anytime — including after cancellation, for 90 days. There's no data lock-in; you own your seller intelligence. Indian data is hosted on Indian cloud regions, so GST and data-residency questions are handled cleanly."]
            ].map(([q, a], idx) => (
              <div key={idx} className={`faq-item ${activeIndex === idx ? 'active' : ''}`}>
                <div className="faq-q" onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}>
                  {q}
                  <div className={`faq-icon-container ${activeIndex === idx ? 'faq-icon-x' : 'faq-icon-plus'}`}>
                    {activeIndex === idx ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </div>
                </div>
                {activeIndex === idx && (
                  <div className="faq-a">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Related */}
            <div style={{ marginTop:48, paddingTop:28, borderTop:"2px solid #E2E8F0" }}>
              <h2 style={{ fontSize:"clamp(16px,3vw,20px)", fontWeight:800, color:"#0D1B2A", margin:"0 0 18px", border:"none", padding:0, fontFamily:"'Sora',sans-serif" }} className="dark:text-white">Related Guides</h2>
              <div className="related-grid">
                <Link href="/resources/expert-blog/flipkart-keyword-research-tool" className="rel-card" title="Flipkart keyword research for Indian sellers">
                  <div className="rel-thumb">
                    <img src="/01_hero_banner.png" alt="Flipkart Keyword Research Guide" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Keyword Research</div>
                    <div className="rel-title">Flipkart Keyword Research for Indian Sellers: Complete 2026 Guide</div>
                  </div>
                </Link>
                <Link href="/resources/expert-blog/insydz-vs-helium-10-india" className="rel-card" title="Insydz vs Helium 10 for Indian sellers">
                  <div className="rel-thumb">
                    <img src="/thirteen.png" alt="Insydz vs Helium 10 comparison" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Compare</div>
                    <div className="rel-title">Insydz vs Helium 10: Which is the Right Tool for Indian Sellers?</div>
                  </div>
                </Link>
                <Link href="/resources/expert-blog/amazon-competitor-price-tracking-tool" className="rel-card" title="Flipkart pricing automation strategy">
                  <div className="rel-thumb">
                    <img src="/one.png" alt="Flipkart Pricing Automation Strategy" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Pricing Strategy</div>
                    <div className="rel-title">Flipkart Pricing Automation: How to Win the SmartBuy Badge in 2026</div>
                  </div>
                </Link>
              </div>
            </div>
        </main>
      </div>

      <section className="py-20 bg-blue-600 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-['Sora'] leading-tight">
            Stop Paying USD Prices for a Tool That Can't See Half Your Indian Revenue.
          </h2>
          <p className="text-blue-50 font-['Lora'] text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Insydz is built ground-up for Indian Amazon and Flipkart sellers — INR pricing, GST invoices, WhatsApp alerts, and AI calibrated on Amazon.in plus Flipkart data. Try it parallel to SellerApp, free, for 14 days. The numbers will speak for themselves.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
            {[
              "Forever free plan",
              "₹1,999/mo paid",
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
            → Start Free Trial
          </Button>

          <p className="text-blue-200 text-sm font-['Lora']">
            No credit card · GST invoice on first paid plan · Migration help included
          </p>
        </div>
      </section>
    </div>
  );
}
