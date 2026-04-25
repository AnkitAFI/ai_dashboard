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

export const dynamic = "force-static";




// ─── Schema ──────────────────────────────────────────────────────────────────
const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz", "url": "https://insydz.com",
      "logo": { "@type": "ImageObject", "url": "https://insydz.com/logo.png" },
      "sameAs": ["https://www.instagram.com/growwithinsydz","https://www.linkedin.com/company/insydz/","https://www.facebook.com/profile.php?id=61586202582209","https://x.com/growwithinsydz"],
    },
    {
      "@type": "Article",
      "@id": "https://insydz.com/best-flipkart-analytics-tool#article",
      "headline": "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)",
      "datePublished": "2026-01-15", "dateModified": "2026-03-01",
      "author": { "@type": "Organization", "name": "Vikrant Singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "keywords": "best Flipkart analytics tool, Flipkart seller software comparison, Flipkart tracking tools India, marketplace intelligence, competitor insights, pricing automation, seller dashboard",
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/best-flipkart-analytics-tool#faq",
      "mainEntity": [
        { "@type": "Question", "name": "What is the best Flipkart analytics tool for India?", "acceptedAnswer": { "@type": "Answer", "text": "The best Flipkart analytics tool for Indian sellers is one built natively for Flipkart marketplace data — not adapted from an Amazon-focused global tool." } },
        { "@type": "Question", "name": "How is Flipkart analytics different from Amazon.in analytics?", "acceptedAnswer": { "@type": "Answer", "text": "Flipkart has a distinct search algorithm, unique buyer intent patterns and pricing dynamics that differ from Amazon.in." } },
      ],
    },
  ],
};

// ─── Navigation ───────────────────────────────────────────────────────────────
type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)",     icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)",   icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers",         icon: <Store       className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies",      icon: <Briefcase   className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers",           icon: <Users       className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases",                icon: <TrendingUp    className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices",      icon: <TrendingUp    className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products",     icon: <Target        className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews",     icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO",icon: <Search        className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales",icon:<Package       className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features",                 icon: <LayoutGrid   className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking",    icon: <DollarSign   className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics",             icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization",           icon: <TrendingUp   className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking",      icon: <Search       className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research",             icon: <Package      className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations",           icon: <Zap          className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts",              icon: <Bell         className="w-4 h-4" />, badge: "NEW",      route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence",   icon: <Flame        className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer",  icon: <BarChart3    className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <DollarSign   className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker",     icon: <Search       className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
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
    { name: "Insydz vs Helium 10",    icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
    { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers",    icon: <Globe        className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users        className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

// ─── TOC ─────────────────────────────────────────────────────────────────────
const TOC = [
  { id: "what-is",      label: "What is a Flipkart Analytics Tool?" },
  { id: "why-critical", label: "Why Flipkart Analytics is Critical" },
  { id: "how-it-works", label: "How Marketplace Intelligence Works" },
  { id: "types",        label: "7 Flipkart Data Types to Track" },
  { id: "mistakes",     label: "5 Mistakes Indian Sellers Make" },
  { id: "comparison",   label: "Methods Compared" },
  { id: "weekly-model", label: "Weekly Execution Model" },
  { id: "best-tools",   label: "Best Tools for India 2026" },
  { id: "faq",          label: "Frequently Asked Questions" },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "What is the best Flipkart analytics tool for India?", a: "The best Flipkart analytics tool for Indian sellers is one built natively for Flipkart marketplace data not adapted from an Amazon-focused global tool. Insydz is the only platform that provides simultaneous keyword rank tracking across Flipkart and Amazon.in, with WhatsApp alert delivery and AI-powered competitor insights covering the full Indian e-commerce landscape." },
  { q: "How is Flipkart analytics different from Amazon.in analytics?", a: "Flipkart has a distinct search algorithm, unique buyer intent patterns especially around price brackets and SmartBuy and pricing dynamics that differ from Amazon.in. Tools built for Amazon.com or even Amazon.in often have zero Flipkart keyword coverage. Flipkart-specific analytics accounts for its own search volume data, category ranking logic, and SmartBuy badge behaviour." },
  { q: "What is keyword gap analysis for Flipkart sellers?", a: "Keyword gap analysis identifies the high-volume Flipkart search terms your top competitors rank for and your listing doesn't. This gap represents lost organic traffic and lost revenue. Closing the gap is the fastest route to organic rank improvement on Flipkart." },
  { q: "Can I track competitor keywords on Flipkart?", a: "Yes with India-first tools like Insydz. Global tools like Helium 10 and Jungle Scout have no Flipkart competitor keyword tracking. India-first platforms crawl your top 5–10 competitors' listings on Flipkart and surface which high-volume terms they rank for that you don't." },
  { q: "How much do Flipkart analytics tools cost in India?", a: "Flipkart analytics tools range from free (basic, limited Flipkart data) to ₹4,000–8,000/month for global SaaS tools with no real Flipkart coverage, to ₹1,999–2,999/month for India-first AI platforms like Insydz that cover both Amazon.in and Flipkart natively with WhatsApp alerts included." },
  { q: "How often should I review my Flipkart analytics data?", a: "Best-performing Indian Flipkart sellers run a three-tier rhythm: daily automated WhatsApp digests (zero minutes of your time), a weekly 30-minute review of keyword gaps and competitor movements, and a monthly 45-minute strategic audit before festive seasons." },
  { q: "Does pricing automation work on Flipkart?", a: "Yes. Flipkart's SmartBuy badge and Featured Seller status are heavily influenced by competitive pricing. Pricing automation tools that monitor competitor prices on Flipkart in real time and trigger repricing rules can significantly improve SmartBuy badge win rate and overall category visibility." },
];

// ─── Image component ──────────────────────────────────────────────────────────
// ─── Inline link helper ──────────────────────────────────────────────────────
const InLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); router.push(to); window.scrollTo(0,0); }}
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

function ArticleImg({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ margin: "24px 0 0" }}>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#f1f5f9", minHeight: 200 }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "imgShimmer 1.5s infinite" }} />
        )}
        <img src={src} alt={alt} onLoad={() => setLoaded(true)} style={{ width: "100%", display: "block", opacity: loaded ? 1 : 0, transition: "opacity .3s" }} />
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

  useEffect(() => { document.documentElement.classList.toggle("dark", isDarkMode); }, [isDarkMode]);

  useEffect(() => {
    const id = "insydz-fkat-schema";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(schemaData);
      document.head.appendChild(s);
    }
    document.title = "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)";
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveSection(TOC[i].id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setTocOpen(false); };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const toggleMobileMenu = (name: string) => setMobileActiveMenu(p => p === name ? null : name);

  const DesktopDropdown = ({ label, menuKey, accent = "purple" }: { label: string; menuKey: keyof NavigationMenu; accent?: "purple" | "orange" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : (ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20")}`}
        >
          {label}<ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
        {isActive && (
          <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {items.map((item, i) => (
              <button key={i} onClick={() => handleMenuItemClick(item)} className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                <span className={`flex-shrink-0 ${ac ? "text-orange-600" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">{item.badge}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const keywordRows = [
    { type: "Buy Intent Terms",       example: '"buy mixer grinder online"',              vol: "Medium",         cvr: "High (14–20%)",      tag: "Critical",     tagClass: "tag-critical" },
    { type: "Price Bracket Terms",    example: '"laptop under 40000 rupees"',             vol: "Medium–High",    cvr: "High (11–17%)",      tag: "Critical",     tagClass: "tag-critical" },
    { type: "Category Head Terms",    example: '"wireless earphones"',                    vol: "Very High",      cvr: "Medium (3–6%)",      tag: "Important",    tagClass: "tag-important" },
    { type: "Long-Tail Specific",     example: '"tws earbuds noise cancel gym use"',      vol: "Low",            cvr: "Very High (22–30%)", tag: "Critical",     tagClass: "tag-critical" },
    { type: "Competitor Brand Terms", example: '"boAt airdopes alternative under 2000"',  vol: "Medium",         cvr: "Medium (7–13%)",     tag: "Important",    tagClass: "tag-important" },
    { type: "Regional Language",      example: '"earphones sasta wala" / Hindi variants', vol: "Growing",        cvr: "Very High (16–24%)", tag: "Opportunity",  tagClass: "tag-opportunity" },
    { type: "Festive & Seasonal",     example: '"Big Billion Days deals electronics"',    vol: "High (seasonal)",cvr: "Very High (event)",  tag: "Critical",     tagClass: "tag-critical" },
  ];

  const toolRows = [
    { tool: "Helium 10",    fk: false, az: "Partial", wa: false, intent: "US Only",    price: "₹4,000–8,000", hl: false },
    { tool: "Jungle Scout", fk: false, az: "Partial", wa: false, intent: "US Only",    price: "₹4,500–7,000", hl: false },
    { tool: "Sonar (Free)", fk: false, az: "Yes",     wa: false, intent: "Basic",      price: "Free",         hl: false },
    { tool: "Insydz+",      fk: true,  az: "Yes",     wa: true,  intent: "AI-Powered", price: "₹1,999–2,999", hl: true  },
  ];

  const capRows = [
    { cap: "Flipkart Keyword Data",            manual: "Manual only",             global: "Not supported",      insydz: "Native Flipkart" },
    { cap: "Flipkart Rank Tracking",           manual: "Manual only",             global: "Not supported",      insydz: "Full coverage" },
    { cap: "Competitor Keyword Gap Analysis",  manual: "3–5 days/FSN",            global: "Amazon.com focused", insydz: "Automated, <1 hour" },
    { cap: "Buy Intent & Price Bracket Terms", manual: "No systematic detection", global: "US intent data",     insydz: "India-calibrated AI" },
    { cap: "Regional Language Keywords",       manual: "No",                      global: "English only",       insydz: "Hindi + Hinglish" },
    { cap: "Pricing Automation (SmartBuy)",    manual: "Manual guesswork",        global: "Not available",      insydz: "Real-time rules" },
    { cap: "WhatsApp Rank Drop Alerts",        manual: "Not available",           global: "Email only",         insydz: "Within 60 min" },
    { cap: "Festive Keyword Intelligence",     manual: "Not available",           global: "Not available",      insydz: "BBD, GIF, Diwali" },
    { cap: "Cost",                             manual: "4–5 hrs/day",             global: "₹4,000–8,000/mo",    insydz: "Free–₹2,999/mo" },
  ];

  const features = [
    { title: "Full Flipkart Keyword Database",        body: "Rank positions tracked natively on Flipkart not estimated from Amazon.in data. Flipkart keyword coverage is unique to India-first tools and is the foundational capability everything else is built on." },
    { title: "Hindi and Hinglish Keyword Detection",  body: "Regional search terms, transliterated Hindi queries, and Hinglish product descriptors are surfaced and scored by conversion intent not filtered out as noise the way global tools treat them." },
    { title: "Price-Bracket Keyword Intelligence",    body: "'Under 999', 'below 5000', 'best budget' modifiers are detected and scored for India-specific purchase intent on Flipkart the highest-conversion keyword category most sellers miss entirely." },
    { title: "WhatsApp Rank Drop Alerts in 60 Min",   body: "Any rank drop of 3+ positions on a tracked Flipkart buy-intent keyword triggers a WhatsApp alert — with the affected FSN, the term, and a recommended listing fix." },
    { title: "AI Listing Optimisation",               body: "For each keyword gap identified on Flipkart, the platform generates the exact text to add to your listing title, bullets, and description no guesswork, no duplication." },
    { title: "Festive Keyword Intelligence",          body: "Pre-festive keyword audits surface seasonal search terms specific to Big Billion Days, Great Indian Festival, and Diwali 3 weeks before the revenue window opens." },
  ];

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

        /* ── Article layout ── */
        .article-layout { max-width:1240px; margin:0 auto; padding:32px 16px 60px; display:grid; grid-template-columns:1fr; gap:0; }
        @media(min-width:768px){ .article-layout { padding:40px 20px 70px; grid-template-columns:220px 1fr; gap:28px; } }
        @media(min-width:1024px){ .article-layout { padding:48px 24px 80px; grid-template-columns:280px 1fr; gap:40px; } }
        @media(min-width:1280px){ .article-layout { grid-template-columns:308px 1fr; gap:52px; } }

        /* ── TOC Sidebar ── */
        .toc-sidebar { display:none; }
        @media(min-width:768px){
          .toc-sidebar { display:block; position:sticky; top:76px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05); max-height:calc(100vh - 96px); overflow-y:auto; }
        }
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

        /* ── Related grid ── */
        .related-grid { display:grid; grid-template-columns:1fr; gap:12px; }
        @media(min-width:480px){ .related-grid { grid-template-columns:1fr 1fr; gap:14px; } }
        @media(min-width:768px){ .related-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
        .rel-card { border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; cursor:pointer; transition:box-shadow .2s,transform .2s; background:#fff; }
        .dark .rel-card { background:#111827; border-color:#1f2937; }
        .rel-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); transform:translateY(-2px); }
        .rel-thumb { width:100%; aspect-ratio:2.4/1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .rel-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .rel-body { padding:12px; }
        .rel-tag { font-size:10px; font-weight:700; color:#7C3AED; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; font-family:'Sora',sans-serif; }
        .rel-title { font-size:12px; font-weight:700; color:#0D1B2A; line-height:1.4; font-family:'Sora',sans-serif; }
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

      {/* ═══ NAV ════════════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <button onClick={() => router.push("/pricing")} onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button onClick={() => router.push("/login")} onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Button>
              <button className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile right controls */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <button onClick={() => { router.push("/resources/expert-blog"); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </button>
              {([["Solutions","Solutions","purple"],["Use Cases","Use Cases","purple"],["Features","Features","purple"],["Free Tools","Free Tools","purple"],["Compare","Compare","purple"],["Resources","Resources","orange"],["About","About","purple"]] as [string, keyof NavigationMenu, string][]).map(([label, key, accent]) => (
                <div key={label}>
                  <button onClick={() => toggleMobileMenu(label)} className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${accent === "orange" ? "text-orange-600 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                    {label}<ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {navigationMenu[key].map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 rounded-lg">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-left flex-1">{item.name}</span>
                          {item.badge && <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => { router.push("/pricing"); setIsMenuOpen(false); }} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 rounded-lg font-medium text-sm">Pricing</button>
              <Button onClick={() => { router.push("/login"); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-sm py-2">Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── BREADCRUMB ─────────────────────────────────────────────────────────── */}
      <div className="breadcrumb" style={{ marginTop: 80 }}>
        <div className="breadcrumb-inner">
          <button onClick={() => router.push("/")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Home</button>
          <span>›</span>
          <button onClick={() => router.push("/resources/expert-blog")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Blog</button>
          <span>›</span>
          <span style={{ color:"#94A3B8" }}>Best Flipkart Analytics Tools India (2026)</span>
        </div>
      </div>

      {/* ── ARTICLE HERO ───────────────────────────────────────────────────────── */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#EDE9FE", color:"#7C3AED", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase", padding:"4px 12px", borderRadius:20, marginBottom:14, fontFamily:"'Sora',sans-serif" }}>
          <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Flipkart Seller Tools &amp; Strategy
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:800, lineHeight:1.18, color:"#0D1B2A", letterSpacing:"-.5px", marginBottom:14, maxWidth:820 }} className="dark:text-white">
          Best <span style={{ color:"#7C3AED" }}>Flipkart Analytics Tool</span> India: Complete Guide for Sellers (2026)
        </h1>
        <p style={{ fontFamily:"'Lora',serif", fontSize:"clamp(14px,2.5vw,17px)", color:"#475569", lineHeight:1.75, maxWidth:700, marginBottom:20 }} className="dark:text-gray-400">
          Stop flying blind on Flipkart. The right analytics tool surfaces which competitor keywords are stealing your rank, which SKUs are losing the Buy Box, and exactly what to fix before the next Big Billion Days window closes on you.
        </p>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"4px 14px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>Vikrant Singh</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />March 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong>14 min read</strong></div>
          <span style={{ background:"#FEF3C7", color:"#92400E", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4, fontFamily:"'Sora',sans-serif" }}>Updated for 2026</span>
          <span style={{ background:"#EDE9FE", color:"#5B21B6", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4, fontFamily:"'Sora',sans-serif" }}>Seller Strategy Guide</span>
        </div>

        {/* Stat strip */}
        <div className="stat-strip" style={{ marginBottom:24 }}>
          {[
            ["71%",    "Flipkart Purchases Start From a Search Not a Homepage Browse"],
            ["₹42K/mo","Avg. Monthly Revenue Lost to Poor Marketplace Visibility"],
            ["4–6×",   "Traffic Increase With Proper Competitor Keyword Tracking"],
            ["Top 3",  "Search Positions Capture 58% of All Flipkart Category Clicks"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span style={{ display:"block", fontSize:"clamp(20px,4vw,26px)", fontWeight:800, color:"#7C3AED", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{num}</span>
              <span style={{ display:"block", fontSize:"clamp(10px,2vw,11.5px)", color:"#64748B", marginTop:4, lineHeight:1.4, fontWeight:500 }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px" }} className="sm:px-5 lg:px-6">
        <div className="hero-banner">
          <div className="hb-left">
            <div className="platform-pills">
              <span className="pill pill-fk">Flipkart</span>
              <span className="pill pill-az">Amazon.in</span>
              <span className="pill pill-me">Meesho</span>
            </div>
            <h2>Indian Sellers Are Invisible on Flipkart <span className="accent">Without the Right Analytics</span></h2>
            <p>AI-powered marketplace intelligence built for India — competitor insights, pricing automation, WhatsApp rank-drop alerts, and a seller dashboard covering Flipkart natively. Not adapted from global tools.</p>
          </div>
          <div className="hb-right">
            <div className="metric-card">
              <div className="mc-label">Competitor Keywords Found</div>
              <div className="mc-value">+312</div>
              <div className="mc-sub">Keywords you're missing on Flipkart</div>
            </div>
            <div className="metric-card">
              <div className="mc-label">Rank After Fix</div>
              <div className="mc-value">P6 → P1</div>
              <div className="mc-sub">After backend keyword update</div>
            </div>
            <div className="alert-pill">Rival ranking #1 for "mixer grinder under 3000" fix now</div>
          </div>
        </div>
        <p style={{ fontSize:"clamp(10px,2vw,12px)", color:"#94A3B8", textAlign:"center", margin:"6px 0 28px", fontStyle:"italic", fontFamily:"'Sora',sans-serif" }}>
          Insydz Flipkart intelligence surfaces competitor keyword gaps, rank positions, and pricing automation opportunities across Flipkart and Amazon.in simultaneously.
        </p>
      </div>

      {/* ── KEY TAKEAWAYS ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px 28px" }} className="sm:px-5 lg:px-6">
        <div className="takeaway-box">
          <h3>Key Takeaways</h3>
          {[
            "Most Flipkart sellers optimise with Amazon-centric tools tools that have zero Flipkart keyword volume data, no SmartBuy badge logic, and no Flipkart-specific competitor tracking.",
            "Competitor keyword gap analysis reveals which high-volume, buy-intent terms your top 3 Flipkart rivals rank for and you don't. This gap is where your revenue is being lost silently.",
            "Pricing automation on Flipkart is not optional for high-competition categories. The SmartBuy badge goes to the most competitive price not the best-reviewed product.",
            "Flipkart's search algorithm weighs listing quality differently from Amazon title keyword density, bullet structure, and image count all influence rank in ways global tools don't model.",
            "India-first platforms like Insydz track rank shifts on Flipkart and Amazon.in simultaneously with WhatsApp alerts, not weekly email digests that arrive after the damage is done.",
            "Combining Flipkart analytics with cross-platform pricing intelligence gives Indian sellers a complete, AI-powered view of marketplace performance.",
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
          <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#94A3B8", marginBottom:12 }}>Table of Contents</h4>
          <ul style={{ listStyle:"none", padding:0, margin:0 }}>
            {TOC.map(t => (
              <li key={t.id}><button className={`toc-link${activeSection === t.id ? " active" : ""}`} onClick={() => go(t.id)}>{t.label}</button></li>
            ))}
          </ul>
          <div style={{ background:"linear-gradient(160deg,#1E1040 0%,#2D1B69 100%)", borderRadius:10, padding:18, marginTop:16 }}>
            <h4 className="sidebar-cta-title">Find Your Flipkart Gaps Free</h4>
            <p className="sidebar-cta-body">AI-powered marketplace intelligence for Flipkart, Amazon.in &amp; WhatsApp alerts included.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 14px" }}>
              {["Competitor keyword gap analysis","Rank tracking — Flipkart + Amazon","WhatsApp alerts on rank drops","Pricing automation dashboard"].map(f => (
                <li key={f} style={{ fontSize:11.5, color:"#CBD5E1", marginBottom:7, display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.4, fontFamily:"'Sora',sans-serif" }}>
                  <span style={{ color:"#10B981", fontWeight:800, flexShrink:0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push("/login")} style={{ display:"block", background:"#7C3AED", color:"white", textAlign:"center", padding:10, borderRadius:8, fontWeight:700, fontSize:12.5, width:"100%", cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif" }}>
              Start Free →
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth:0 }}>
          {/* Mobile TOC */}
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)}>
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
            {TOC.map(t => <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>)}
          </div>

          <article className="article-body">

            {/* S1: What is */}
            <h2 id="what-is">What is a Flipkart Analytics Tool?</h2>
            <p>A <InLink to="/solutions/flipkart-sellers">best Flipkart analytics tool</InLink> is software that tracks exactly what Indian buyers search for on Flipkart before they purchase and reveals which of those terms your competitors rank for that your listing doesn't. This is called <strong>marketplace intelligence</strong>, and it's the fastest route to organic rank improvement available to any Flipkart seller.</p>
            <p>Unlike generic seller dashboards built for Amazon.com or Shopify, Flipkart-native analytics accounts for India-specific search intent: regional language queries, price-bracket buying patterns, Flipkart's SmartBuy badge algorithm, and cross-platform rank correlation between Flipkart and Amazon.in.</p>
            <p>Here's the reality: <strong>Indian sellers on Flipkart collectively leave an estimated ₹600–900 crore in annual organic revenue on the table</strong> simply because their listings are not optimised for the search terms Indian buyers actually use on Flipkart.</p>

            <div className="box box-purple">
              <div className="box-label">In Simple Terms</div>
              <p>Instead of guessing which keywords to put in your product title and Flipkart listing fields, a Flipkart analytics tool tells you precisely which terms drive actual sales on Flipkart right now including the hidden buy-intent terms your top competitors are ranking for and you've never even thought of.</p>
            </div>

            <div className="int-link">
              <p><strong>Part of the Flipkart Seller Guide Series:</strong> Read our complete Flipkart Seller Strategy pillar to understand how analytics fits into your full growth stack from listing optimisation to festive season planning.</p>
            </div>

            {/* S2: Why Critical */}
            <h2 id="why-critical">Why Flipkart Analytics is Critical for Indian Sellers</h2>
            <h3>Flipkart's Search Behaviour is Distinctly Indian</h3>
            <p>Flipkart's buyer base searches differently from Amazon.in and drastically differently from Amazon.com. Buyers search in Hindi transliterations, use hyper-specific price brackets ("mixer grinder under 3000"), and respond to regional colloquialisms that have zero equivalent in Helium 10's global keyword database. Keeping up with Flipkart marketplace analytics and seller performance insights is essential for long-term growth.</p>

            <h3>The Ranking Gap is Silent and Compounding</h3>
            <p>Most Flipkart sellers do analytics once at launch and never revisit it. Meanwhile, their competitors are continuously adding new terms, capturing new search traffic, and rising in rank. By the time the revenue impact becomes visible in your seller dashboard, you've already lost 4–8 months of compounding organic traffic.</p>

            <div className="box box-amber">
              <div className="box-label">Real Seller Example</div>
              <p>A Jaipur-based kitchenware seller was doing ₹3.4 lakh/month on Flipkart. A competitor entered the same category and captured the "non-stick tawa for induction" keyword cluster 22 related search terms with a fully optimised listing. The seller's revenue dropped to ₹1.6 lakh within 6 weeks. The competitor wasn't cheaper or better reviewed they were simply found first on 22 searches the original seller had never even tracked.</p>
            </div>

            <h3>The Festive Season Window is Worth Months of Revenue</h3>
            <p>During Big Billion Days, Republic Day Sale, and Diwali, <strong>35–55% of annual Flipkart e-commerce revenue concentrates into just 3–6 days.</strong> Sellers who rank for festive search terms on Day 1 win disproportionately. Mastering <InLink to="/">pricing automation on Flipkart</InLink> ensures you remain competitive during these high-volume windows.</p>

            <div className="box box-green">
              <div className="box-label">AI Overview Summary</div>
              <p>Flipkart analytics tools help Indian sellers identify which search terms drive buyer traffic on Flipkart, reveal competitor keyword gaps, enable pricing automation for SmartBuy badge wins, and alert sellers to rank drops especially critical for sellers managing 10–150 SKUs without a dedicated marketplace analyst.</p>
            </div>

            
            {/* S3: How it works */}
            <h2 id="how-it-works">How Does Flipkart Marketplace Intelligence Work?</h2>
            <p>Modern flipkart tracking tools India have replaced the manual spreadsheet workflow with a 5-step automated intelligence loop:</p>

            {/* Dashboard mockup */}
            <div className="dash-mock">
              <div className="dash-header">
                Insydz Flipkart Intelligence Dashboard
                <span className="dash-badge-live">Live</span>
                <span className="dash-badge-plat">Flipkart</span>
                <span className="dash-badge-plat">Amazon.in</span>
              </div>
              <div className="dash-body">
                <div className="dash-metrics">
                  {[
                    { label:"KEYWORDS TRACKED",   val:"187",  sub:"+23 this month",               subColor:"#10B981" },
                    { label:"AVG. RANK POSITION",  val:"P8.2", sub:"+2 from last quarter",          subColor:"#10B981" },
                    { label:"KEYWORD GAP SCORE",   val:"114",  sub:"Competitors rank, you don't",   subColor:"#EF4444" },
                    { label:"BUY INTENT TERMS",    val:"41",   sub:"High-priority fixes",            subColor:"#F97316" },
                  ].map((m, i) => (
                    <div className="dash-m" key={i}>
                      <div className="dm-label">{m.label}</div>
                      <div className="dm-val">{m.val}</div>
                      <div className="dm-sub" style={{ color: m.subColor }}>{m.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="dash-alert">
                  <span><strong>Keyword Alert:</strong> Competitor ranking #1 for "air fryer 4 litre under 4000" you're at position #17. Recommend: Add to title + listing. Est. traffic gain: +280 clicks/month</span>
                  {/* <button className="dash-fix-btn">Fix Now</button> */}
                </div>
              </div>
            </div>

            <div className="steps">
              {[
                { n:1, t:"Connect Your Flipkart Seller Account", d:"Link your Flipkart Seller Hub account and add the FSN IDs you want to track. The tool begins pulling your current keyword rank positions immediately no manual setup or CSV uploads required." },
                { n:2, t:"Competitor Keyword Crawling",           d:"The tool identifies your top 5–10 Flipkart competitors by category and crawls every keyword they rank for including long-tail, buy-intent, price-bracket, and regional Hindi variants." },
                { n:3, t:"Search Volume & Intent Scoring",        d:"Each keyword is scored by Flipkart monthly search volume, competition density, and buyer intent signal separating high-value 'buy now' terms from low-value browsing terms." },
                { n:4, t:"Pricing Automation & SmartBuy Alert",   d:"You receive a WhatsApp alert the moment a competitor undercuts you on a tracked SKU, or when a rival captures the SmartBuy badge with a recommended repricing rule to reclaim it." },
                { n:5, t:"AI Listing Optimisation Recommendation",d:"The platform delivers a concrete fix: 'Add air fryer 4 litre induction compatible to your Flipkart title. Estimated rank improvement: P17 → P4. Monthly traffic gain: +280 clicks.' Not data decisions." },
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t}</strong><p>{s.d}</p></div>
                </div>
              ))}
            </div>

            <div className="box box-purple">
              <div className="box-label">Key Insight</div>
              <p>Flipkart analytics without ranking context is useless. Knowing a term has 18,000 monthly Flipkart searches means nothing if you're already ranking P2 for it. The gap terms your competitors rank for and you don't is where your Flipkart growth actually lives.</p>
            </div>

            {/* S4: Types */}
            <h2 id="types">Types of Flipkart Data Indian Sellers Must Track</h2>
            <p>Buy Intent Terms and Price Bracket Keywords deliver the highest conversion rates on Flipkart yet are the most commonly missed by Indian sellers using global tools.</p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead><tr><th>Data Type</th><th>Example (India)</th><th>Search Vol.</th><th>Conversion Rate</th><th>Priority</th></tr></thead>
                <tbody>
                  {keywordRows.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.type}</strong></td>
                      <td style={{ fontStyle:"italic", color:"#6B7280" }}>{r.example}</td>
                      <td>{r.vol}</td>
                      <td><strong>{r.cvr}</strong></td>
                      <td><span className={`badge-tag ${r.tagClass}`}>{r.tag}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* S5: Mistakes */}
            <h2 id="mistakes">5 Common Mistakes Indian Sellers Make With Flipkart Analytics</h2>
            <div className="mistakes">
              {[
                { n:1, t:"Using Amazon.in Keyword Data for Flipkart Listings", p:"Amazon.in and Flipkart have completely different search indexes. A term with 40,000 monthly searches on Amazon.in may have 4,000 on Flipkart and vice versa." },
                { n:2, t:"Ignoring Pricing Automation Losing the SmartBuy Badge Silently", p:"Flipkart's SmartBuy badge is the single highest-converting placement on any product search page. Sellers who lose this badge to a ₹50 price undercut and don't know within the hour are hemorrhaging conversions daily." },
                { n:3, t:"Doing Analytics Once at Launch Then Never Again", p:<>Flipkart search trends shift festival to festival. A keyword strategy built in February is partially obsolete by Onam season. Sellers who don't continuously update their keyword sets lose ground silently. Following a structured guide for <InLink to="/resources/expert-blog/flipkart-keyword-research-tool">Flipkart keyword research for Indian sellers</InLink> can prevent this organic decay.</> },
                { n:4, t:"Tracking Rankings Only Missing Competitor Keyword Movements", p:"Knowing you're ranked P8 for a term tells you where you are. Knowing your top competitor just started ranking P1 for a term you haven't added to your listing tells you where you're about to fall behind." },
                { n:5, t:"Skipping Regional Language Keywords Entirely", p:"Hindi and Hinglish search queries on Flipkart are growing at over 28% year-on-year. Terms like 'sasta mobile under 8000' have high buy intent and very low competition from English-only optimised sellers." },
              ].map(m => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body"><strong>{m.t}</strong><p>{m.p}</p></div>
                </div>
              ))}
            </div>

            {/* S6: Comparison */}
            <h2 id="comparison">Flipkart Analytics Methods Compared</h2>
            <div className="tbl-wrap">
              <table className="dt">
                <thead><tr><th>Method</th><th>Speed</th><th>Flipkart Data</th><th>Actionability</th><th>Cost</th></tr></thead>
                <tbody>
                  <tr><td>Manual Seller Hub Research</td><td style={{ color:"#EF4444", fontWeight:700 }}>3–5 days</td><td>Partial</td><td>None — guesses</td><td>4–5 hrs/day</td></tr>
                  <tr><td>Basic Free Tools (Sonar)</td><td style={{ color:"#F59E0B", fontWeight:700 }}>Same day</td><td>Limited</td><td>Low — data only</td><td>Free–₹500/mo</td></tr>
                  <tr><td>Global SaaS (Helium 10)</td><td style={{ color:"#10B981", fontWeight:700 }}>1–2 hrs</td><td><span className="badge-tag tag-no">No Flipkart</span></td><td>Medium (Amazon only)</td><td>₹4,000–8,000/mo</td></tr>
                  <tr className="hl"><td><strong>India-First AI Tool (Insydz) <span className="badge-tag tag-recommended">Recommended</span></strong></td><td style={{ color:"#10B981", fontWeight:700 }}>&lt; 1 hour</td><td><span className="badge-tag tag-yes">Amazon.in + Flipkart</span></td><td style={{ color:"#7C3AED", fontWeight:700 }}>High — Actionable AI</td><td>₹1,999–2,999/mo</td></tr>
                </tbody>
              </table>
            </div>

            <div className="box box-red">
              <div className="box-label">Worth Noting</div>
              <p>Every week without structured Flipkart analytics is a week of organic traffic being silently redirected to a competitor who does it properly. A 3-month delay in adopting an analytics tool can translate to 8–12 months of catch-up time on rank recovery.</p>
            </div>


            {/* S7: Weekly model */}
            <h2 id="weekly-model">Best Practices: Weekly Execution Model for Flipkart Sellers</h2>
            <p>The most successful Indian Flipkart sellers don't run analytics in one-time sprints they run a structured weekly rhythm that keeps their listings consistently competitive without manual effort.</p>

            <div className="steps">
              {[
                {
                  n: 1,
                  t: "Daily Automated (0 Minutes of Your Time)",
                  d: [
                    "Morning WhatsApp digest: top 5 rank changes across tracked Flipkart FSNs",
                    "Act on Critical Rank Drop alerts — any position loss of 5+ spots on buy-intent keywords",
                    "Competitor new keyword entry alert — know when a rival starts ranking for a new term",
                    "SmartBuy badge status for top 10 SKUs — pricing position and visibility combined"
                  ]
                },
                {
                  n: 2,
                  t: "Weekly 30-Minute Review Session",
                  d: [
                    "Full keyword gap report — identify top 8 gaps between your rank and competitor rank on Flipkart",
                    "Update listing fields on 2–4 FSNs using AI-generated keyword recommendations",
                    "Check new buy-intent terms emerging in your Flipkart category this week",
                    "Review pricing automation rules — adjust floor/ceiling for 1–2 high-competition SKUs"
                  ]
                },
                {
                  n: 3,
                  t: "Monthly Strategic Audit (45 Minutes)",
                  d: [
                    "Keyword coverage audit before festive season — are all seasonal terms in your Flipkart title?",
                    "New product gap analysis — which keyword clusters have high volume and low competition?",
                    "Revenue impact review — compare organic traffic before vs after last month's keyword updates",
                    "Competitor new product keyword sets — what terms are rivals' new Flipkart launches targeting?"
                  ]
                }
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>

                  <div className="step-body">
                    <strong>{s.t}</strong>

                    {/* 👇 THIS is the key */}
                    <div style={{ marginTop: "8px" }}>
                      {s.d.map((item, i) => (
                        <div className="exec-item" key={i}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>

            {/* Mid CTA */}
            <div className="mid-cta">
              <div>
                <h3>Find Your Flipkart Keyword Gaps in Under 30 Minutes Free</h3>
                <p>Connect Flipkart Seller Hub &amp; Amazon.in. Get your first competitor keyword gap report today. WhatsApp rank alerts included.</p>
              </div>
              <button onClick={() => router.push("/login")} style={{ flexShrink:0, background:"#7C3AED", color:"white", padding:"11px 22px", borderRadius:8, fontWeight:700, fontSize:"clamp(13px,2vw,14.5px)", whiteSpace:"nowrap", cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif", width:"100%" }} className="sm:w-auto">
                Try Insydz Free →
              </button>
            </div>

            
            {/* S8: Best Tools */}
            <h2 id="best-tools">Best Tools for Flipkart Analytics in India (2026)</h2>
            <h3>Why Global Tools Fall Short for Flipkart Sellers</h3>
            <p>Global tools like Helium 10 and Jungle Scout are built for Amazon.com. Their keyword databases, search volume data, and intent models are calibrated for US buyers. For a detailed head-to-head, see our Insydz vs Helium 10 Flipkart seller software comparison, which highlights how <InLink to="/use-cases/track-competitor-prices">competitor insights and pricing intelligence</InLink> can transform your strategy.</p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead><tr><th>Tool</th><th>Flipkart Coverage</th><th>Amazon.in</th><th>WhatsApp Alerts</th><th>Buy Intent Data</th><th>Price (INR/mo)</th></tr></thead>
                <tbody>
                  {toolRows.map((r, i) => (
                    <tr key={i} className={r.hl ? "hl" : ""}>
                      <td><strong>{r.tool}</strong>{r.hl && <> <span className="badge-tag tag-recommended">Recommended</span></>}</td>
                      <td>{r.fk ? <span className="badge-tag tag-yes">Full Coverage</span> : <span className="badge-tag tag-no">No</span>}</td>
                      <td>{r.az === "Yes" ? <span className="badge-tag tag-yes">Yes</span> : <span className="badge-tag tag-partial">{r.az}</span>}</td>
                      <td>{r.wa ? <span className="badge-tag tag-yes">Within 60 min</span> : <span className="badge-tag tag-no">No</span>}</td>
                      <td style={r.hl ? { color:"#7C3AED", fontWeight:700 } : {}}>{r.intent}</td>
                      <td style={r.hl ? { color:"#7C3AED", fontWeight:700 } : {}}>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Full Capability Comparison</h3>
            <div className="tbl-wrap">
              <table className="dt">
                <thead><tr><th>Capability</th><th>Manual Research</th><th>Global Tools (US-first)</th><th style={{ background:"#7C3AED" }}>Insydz India-First</th></tr></thead>
                <tbody>
                  {capRows.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.cap}</strong></td>
                      <td style={{ color:"#9CA3AF" }}>{r.manual}</td>
                      <td style={{ color:"#9CA3AF" }}>{r.global}</td>
                      <td className="insydz-col">{r.insydz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>What Makes an India-First Flipkart Analytics Tool Different</h3>
            {features.map((f, i) => (
              <div className="feat-highlight" key={i}>
                <div><h4>{f.title}</h4><p>{f.body}</p></div>
              </div>
            ))}

            <div className="int-link">
              <span style={{ fontSize:"1.1rem", flexShrink:0, marginTop:1 }}>🔗</span>
              <p>Thinking about Insydz vs Helium 10 for your India business? Read our detailed Flipkart seller software comparison covering every feature that matters for Indian marketplace sellers.</p>
            </div>

            {/* S9: FAQ */}
            <h2 id="faq">Frequently Asked Questions</h2>
            <div style={{ marginTop:16 }}>
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className={`faq-icon${openFaq === i ? " open" : ""}`}>+</span>
                  </div>
                  {openFaq === i && <div className="faq-a"><p>{faq.a}</p></div>}
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

          </article>
        </main>
      </div>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <div className="final-cta-block">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
          Flipkart's Best Sellers Know Something You Don't — Yet.
        </h2>
        <p className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Lora', serif", maxWidth: 520, margin: "0 auto 24px" }}>
          Insydz gives you the AI-powered rank tracking, keyword gaps, and WhatsApp alerts built exclusively for Flipkart India.
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", marginBottom: 20 }}>
          {["Flipkart rank tracking", "WhatsApp gap alerts", "Amazon.in also covered", "Free forever"].map(t => (
            <div key={t} className="text-blue-100" style={{ fontSize:"clamp(11px,2vw,13.5px)", display:"flex", alignItems:"center", gap:6, fontFamily:"'Sora',sans-serif" }}>
              <span className="text-white" style={{ fontWeight: 800 }}>✓</span> {t}
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



