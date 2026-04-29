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




// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaAmazonVsFlipkart = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": { "@type": "ImageObject", "url": "https://insydz.com/logo.png" },
      "sameAs": [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz"
      ],
      "description": "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers."
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers",
      "url": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers",
      "name": "Amazon vs Flipkart: Which Marketplace is Better in India? (2026)",
      "description": "Complete 2026 guide for Indian sellers. Compare commission fees, seller competition, search traffic, pricing behavior and profit margins to choose the right marketplace.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "about": { "@id": "https://insydz.com/#organization" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",        "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",   "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon vs Flipkart India Sellers", "item": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers#article",
      "headline": "Amazon vs Flipkart: Which Marketplace is Better in India? (2026)",
      "description": "Complete 2026 guide for Indian sellers comparing Amazon.in vs Flipkart on commission fees, search traffic, seller competition, Buy Box mechanics, pricing behavior and profit margins.",
      "image": "https://insydz.com/assets/images/blog/amazon-vs-flipkart-india-sellers.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-01-15",
      "dateModified": "2026-01-15",
      "mainEntityOfPage": { "@id": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers" },
      "keywords": ["amazon vs flipkart india sellers","ecommerce marketplace comparison india","amazon flipkart profit margins","flipkart commission fees","amazon buy box india","seller strategy india 2026"],
      "articleSection": "Seller Tools & Strategy",
      "inLanguage": "en-IN",
      "wordCount": 4000,
      "timeRequired": "PT12M"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-india-sellers#faq",
      "mainEntity": [
        { "@type": "Question", "name": "Which is better for new sellers — Amazon or Flipkart?", "acceptedAnswer": { "@type": "Answer", "text": "For new sellers with limited budgets, Flipkart typically offers lower entry barriers — lower commission fees in most categories, a less aggressive repricing environment, and strong Tier-2 demand. However, if your category has strong Amazon search traffic (home, kitchen, or premium electronics), launching on Amazon first can build reviews faster through higher volume." } },
        { "@type": "Question", "name": "Do Amazon and Flipkart have the same commission fees?", "acceptedAnswer": { "@type": "Answer", "text": "No. Flipkart's commission fees are generally 2–5% lower across most categories, particularly fashion, books, and beauty. Electronics are roughly comparable. Always calculate the effective commission — including fulfilment charges — not just the headline rate." } },
        { "@type": "Question", "name": "Is it worth selling on both Amazon.in and Flipkart?", "acceptedAnswer": { "@type": "Answer", "text": "For most sellers managing 10–50 SKUs, yes — but only with a platform-specific strategy. Using identical listings, pricing, and keyword targeting across both platforms is worse than focussing on one. Use Flipkart for fashion and Tier-2 demand; use Amazon for higher-value search-driven categories." } },
        { "@type": "Question", "name": "How does pricing behavior differ between Amazon and Flipkart?", "acceptedAnswer": { "@type": "Answer", "text": "Amazon.in has far more aggressive pricing behavior. AI-powered repricing tools update prices every 15–60 minutes for top sellers. Flipkart sellers still predominantly reprice manually 1–2 times per week — creating temporary pricing windows for attentive sellers. This gap is narrowing as more sophisticated tools enter the Indian market." } },
        { "@type": "Question", "name": "Which platform is better during festive sales like Big Billion Days and Great Indian Festival?", "acceptedAnswer": { "@type": "Answer", "text": "Flipkart's Big Billion Days typically drives higher GMV for fashion, mobiles, and Tier-2 sellers. Amazon's Great Indian Festival is stronger for home goods, premium electronics, and branded products. Having a presence on both — with stock pre-positioned in their respective fulfilment centres — is the highest-revenue festive strategy." } }
      ]
    }
  ]
};

// ── Nav Types ─────────────────────────────────────────────────────────────────
type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name:"All Solutions (Overview)",      icon:<ShoppingBag className="w-4 h-4"/>, route:"/solutions" },
    { name:"For Amazon Sellers (India)",     icon:<ShoppingBag className="w-4 h-4"/>, route:"/solutions/amazon-sellers" },
    { name:"For Flipkart Sellers",           icon:<Store     className="w-4 h-4"/>, route:"/solutions/flipkart-sellers" },
    { name:"For E-commerce Agencies",        icon:<Briefcase className="w-4 h-4"/>, route:"/solutions/ecommerce-agencies" },
    { name:"For Brand Managers",             icon:<Users     className="w-4 h-4"/>, route:"/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name:"All Use Cases",                  icon:<TrendingUp    className="w-4 h-4"/>, route:"/use-cases" },
    { name:"Track Competitor Prices",        icon:<TrendingUp    className="w-4 h-4"/>, route:"/use-cases/track-competitor-prices" },
    { name:"Find Profitable Products",       icon:<Target        className="w-4 h-4"/>, route:"/use-cases/find-profitable-products" },
    { name:"Analyze Customer Reviews",       icon:<MessageCircle className="w-4 h-4"/>, route:"/use-cases/analyze-customer-reviews" },
    { name:"Improve Amazon & Flipkart SEO",  icon:<Search        className="w-4 h-4"/>, route:"/use-cases/improve-seo" },
    { name:"Avoid Stockouts & Missed Sales", icon:<Package       className="w-4 h-4"/>, route:"/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name:"All Features",                   icon:<LayoutGrid    className="w-4 h-4"/>, route:"/features" },
    { name:"Competitor Price Tracking",      icon:<DollarSign    className="w-4 h-4"/>, route:"/features/competitor-price-tracking-feature" },
    { name:"Review Analytics",               icon:<MessageCircle className="w-4 h-4"/>, route:"/features/review-analytics-feature" },
    { name:"Price Optimization",             icon:<TrendingUp    className="w-4 h-4"/>, route:"/features/price-optimization-feature" },
    { name:"Keyword & Rank Tracking",        icon:<Search        className="w-4 h-4"/>, route:"/features/keyword-rank-tracking-feature" },
    { name:"Product Research",               icon:<Package       className="w-4 h-4"/>, route:"/features/product-research-feature" },
    { name:"AI Recommendations",             icon:<Zap           className="w-4 h-4"/>, route:"/features/ai-recommendations-feature" },
    { name:"WhatsApp Alerts",                icon:<Bell          className="w-4 h-4"/>, badge:"NEW",      route:"/features/whatsapp-alerts-feature" },
    { name:"Festive Trend Intelligence",     icon:<Flame         className="w-4 h-4"/>, badge:"UPCOMING", route:"/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name:"Free Amazon Product Analyzer",   icon:<BarChart3     className="w-4 h-4"/>, route:"/free-tools/free-amazon-product-analyzer" },
    { name:"Free Review Sentiment Checker",  icon:<MessageCircle className="w-4 h-4"/>, route:"/free-tools/free-review-sentiment-checker" },
    { name:"Free Competitor Price Checker",  icon:<DollarSign    className="w-4 h-4"/>, route:"/free-tools/free-competitor-price-checker" },
    { name:"Free Keyword Rank Checker",      icon:<Search        className="w-4 h-4"/>, badge:"NEW", route:"/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name:"Expert Blog", icon:<BookOpen className="w-4 h-4"/>, route:"/resources/expert-blog" },
  ],
  Integrations: [
    { name:"Amazon",            icon:<ShoppingBag className="w-4 h-4"/> },
    { name:"Flipkart",          icon:<Store       className="w-4 h-4"/> },
    { name:"Shopify",           icon:<Globe       className="w-4 h-4"/> },
    { name:"API Documentation", icon:<Code        className="w-4 h-4"/> },
  ],
  Compare: [
    { name:"Insydz vs Helium 10",    icon:<Trophy className="w-4 h-4"/>, route:"/compare/insydzvshelium" },
    { name:"Insydz vs Jungle Scout", icon:<Trophy className="w-4 h-4"/>, route:"/compare/insydzvsjunglescout" },
    { name:"Insydz vs Viral Launch", icon:<Trophy className="w-4 h-4"/>, route:"/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name:"Our Vision",   icon:<Presentation className="w-4 h-4"/>, route:"/about/our-vision" },
    { name:"Careers",      icon:<Globe        className="w-4 h-4"/>, route:"/about/careers" },
    { name:"Contact Us",   icon:<Users        className="w-4 h-4"/>, route:"/about/contact-us" },
  ],
};

// ── TOC ───────────────────────────────────────────────────────────────────────
const TOC = [
  { id:"overview",   label:"What the Amazon vs Flipkart Battle Means" },
  { id:"commission", label:"Commission Fees: Where Margin Goes" },
  { id:"traffic",    label:"Search Traffic by Platform" },
  { id:"competition",label:"Seller Competition Compared" },
  { id:"buybox",     label:"Buy Box Mechanics" },
  { id:"pricing",    label:"Pricing Behavior: The Margin Killer" },
  { id:"margins",    label:"Profit Margins by Category" },
  { id:"mistakes",   label:"5 Mistakes Indian Sellers Make" },
  { id:"execution",  label:"Weekly Execution Model" },
  { id:"tools",      label:"Best Tools for India (2026)" },
  { id:"faq",        label:"Frequently Asked Questions" },
  { id:"final",      label:"Final Thoughts" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Which is better for new sellers — Amazon or Flipkart?",
    a: "For new sellers with limited budgets, Flipkart typically offers lower entry barriers lower commission fees in most categories, a less aggressive repricing environment, and strong Tier-2 demand. However, if your category has strong Amazon search traffic (home, kitchen, or premium electronics), launching on Amazon first can build reviews faster through higher volume.",
  },
  {
    q: "Do Amazon and Flipkart have the same commission fees?",
    a: "No. Flipkart's commission fees are generally 2–5% lower across most categories, particularly fashion, books, and beauty. Electronics are roughly comparable. Always calculate the effective commission including fulfilment charges — not just the headline rate.",
  },
  {
    q: "Is it worth selling on both Amazon.in and Flipkart?",
    a: "For most sellers managing 10–50 SKUs, yes but only with a platform-specific strategy. Using identical listings, pricing, and keyword targeting across both platforms is worse than focussing on one. Use Flipkart for fashion and Tier-2 demand; use Amazon for higher-value search-driven categories.",
  },
  {
    q: "How does pricing behavior differ between Amazon and Flipkart?",
    a: "Amazon.in has far more aggressive pricing behavior. AI-powered repricing tools update prices every 15–60 minutes for top sellers. Flipkart sellers still predominantly reprice manually 1–2 times per week creating temporary pricing windows for attentive sellers. This gap is narrowing as more sophisticated tools enter the Indian market.",
  },
  {
    q: "Which platform is better during festive sales like Big Billion Days and Great Indian Festival?",
    a: "Flipkart's Big Billion Days typically drives higher GMV for fashion, mobiles, and Tier-2 sellers. Amazon's Great Indian Festival is stronger for home goods, premium electronics, and branded products. Having a presence on both with stock pre-positioned in their respective fulfilment centres — is the highest-revenue festive strategy.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonVsFlipkartIndiaSellers() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
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
    const id = "insydz-amz-vs-fk-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id   = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaAmazonVsFlipkart);
    document.head.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

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
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const toggleMobileMenu = (name: string) => setMobileActiveMenu(p => p === name ? null : name);

  const DesktopDropdown = ({ label, menuKey, accent = "blue" }: { label: string; menuKey: keyof NavigationMenu; accent?: "blue" | "orange" }) => {
    const items    = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const isOrange = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
            isActive
              ? (isOrange ? "text-orange-500 font-semibold" : "text-blue-600 font-semibold")
              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          }`}
        >
          {label}
          <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
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
                className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className="text-xs bg-gradient-to-r from-blue-600 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
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

  // ── Data ─────────────────────────────────────────────────────────────────────
  const commissionRows = [
    { cat:"Electronics",            amz:"5–8%",   fk:"5–7%",   winner:"Tie" },
    { cat:"Fashion / Apparel",      amz:"10–17%", fk:"7–12%",  winner:"Flipkart" },
    { cat:"Home & Kitchen",         amz:"8–12%",  fk:"10–15%", winner:"Amazon" },
    { cat:"Books & Media",          amz:"15–18%", fk:"10–14%", winner:"Flipkart" },
    { cat:"Beauty & Personal Care", amz:"10–14%", fk:"8–13%",  winner:"Flipkart" },
    { cat:"Sports & Fitness",       amz:"10–15%", fk:"9–13%",  winner:"Flipkart" },
    { cat:"Toys & Baby",            amz:"10–14%", fk:"9–12%",  winner:"Flipkart" },
    { cat:"Average Across Categories", amz:"~11%",fk:"~9%",    winner:"Flipkart" },
  ];

  const marginRows = [
    { cat:"Electronics Accessories", platform:"Flipkart", reason:"Lower commission, less cross-border competition", delta:"+4–6%" },
    { cat:"Fashion / Ethnic Wear",   platform:"Flipkart", reason:"Dominant traffic, lower commission fees",         delta:"+5–8%" },
    { cat:"Home Décor",              platform:"Amazon",   reason:"Higher search intent, premium buyer profile",     delta:"+3–5%" },
    { cat:"Kitchen Appliances",      platform:"Amazon",   reason:"Strong FBA logistics, higher AOV buyer",          delta:"+4–7%" },
    { cat:"Books & Stationery",      platform:"Flipkart", reason:"Significantly lower commission rate",             delta:"+6–9%" },
    { cat:"Sports Equipment",        platform:"Both",     reason:"Roughly equal margin after ad costs",             delta:"<2%"   },
    { cat:"Beauty / Skincare",       platform:"Flipkart", reason:"Lower commission, growing Tier-2 demand",         delta:"+3–5%" },
  ];

  const toolRows = [
    { tool:"Helium 10",    amz:"Yes", fk:"No",  wa:"No",  price:"₹4,000–8,000/mo" },
    { tool:"Jungle Scout", amz:"Yes", fk:"No",  wa:"No",  price:"₹4,500–7,000/mo" },
    { tool:"Insydz ✦",    amz:"Yes", fk:"Yes", wa:"Yes", price:"₹1,999/mo + Free" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        /* ── Progress bar ── */
        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#FF9900,#2874F0);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

        /* ── Layout ── */
        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px}}

        /* ── TOC Sidebar ── */
        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto}}
        @media(min-width:1024px){.toc-sidebar{top:80px;padding:22px}}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}

        /* ── Mobile TOC ── */
        .mobile-toc-btn{display:flex;width:100%;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px 16px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#111;cursor:pointer;align-items:center;justify-content:space-between;margin-bottom:14px}
        .dark .mobile-toc-btn{background:#111827;border-color:#1f2937;color:#f9fafb}
        @media(min-width:768px){.mobile-toc-btn{display:none}}
        .mobile-toc-panel{display:none;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:14px;margin-bottom:20px}
        .dark .mobile-toc-panel{background:#111827;border-color:#1f2937}
        .mobile-toc-panel.open{display:block}

        /* ── Article body ── */
        .article-body{font-family:'Lora',serif;font-size:15px;line-height:1.78;color:#1E293B}
        @media(min-width:640px){.article-body{font-size:15.5px}}
        @media(min-width:1024px){.article-body{font-size:16px}}
        .dark .article-body{color:#d1d5db}

        .article-body h2{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#0A0F1A;margin:40px 0 12px;padding-bottom:10px;border-bottom:2px solid #E5E7EB;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h2{font-size:20px;margin:48px 0 14px;scroll-margin-top:80px}}
        @media(min-width:1024px){.article-body h2{font-size:22px;margin:52px 0 14px;scroll-margin-top:84px}}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .article-body h2:first-child{margin-top:0}

        .article-body h3{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0A0F1A;margin:24px 0 8px;letter-spacing:-.2px;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h3{font-size:16px;margin:28px 0 10px}}
        @media(min-width:1024px){.article-body h3{font-size:17px;margin:32px 0 10px;scroll-margin-top:84px}}
        .dark .article-body h3{color:#f3f4f6}

        .article-body p{margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body ul,ol{margin:4px 0 16px 18px}
        @media(min-width:640px){.article-body ul,ol{margin:4px 0 18px 22px}}
        .article-body li{font-size:14px;line-height:1.72;margin-bottom:7px}
        @media(min-width:640px){.article-body li{font-size:15px;margin-bottom:8px}}
        .article-body li::marker{color:#FF9900}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}

        /* ── Anchor links ── */
        .article-body a.al{color:#2874F0;font-weight:600;text-decoration:underline;text-decoration-color:rgba(40,116,240,.3);text-underline-offset:3px;transition:color .2s,text-decoration-color .2s}
        .article-body a.al:hover{color:#1557CC;text-decoration-color:#1557CC}

        /* ── Boxes ── */
        .box{border-radius:10px;padding:16px 18px;margin:18px 0}
        @media(min-width:640px){.box{padding:20px 22px;margin:24px 0}}
        .box-label{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.box-label{font-size:11px}}
        .box p{margin:0;font-size:13.5px;line-height:1.72;font-family:'Lora',serif}
        @media(min-width:640px){.box p{font-size:14.5px}}
        .box p+p{margin-top:10px}
        .box-blue{background:#EFF6FF;border-left:4px solid #2874F0}
        .box-blue .box-label{color:#2874F0}
        .box-amber{background:#FFFBEB;border-left:4px solid #D97706}
        .box-amber .box-label{color:#D97706}
        .box-green{background:#F0FDF4;border-left:4px solid #10B981}
        .box-green .box-label{color:#10B981}
        .box-orange{background:#FFF7ED;border-left:4px solid #FF9900}
        .box-orange .box-label{color:#FF9900}
        .box-purple{background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px}
        .box-purple .box-label{color:#7C3AED}
        .dark .box-blue{background:#0c1e3d;border-color:#1d4ed8}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-orange{background:#1c0900;border-color:#9a3412}
        .dark .box-purple{background:#1e1b4b;border-color:#3730a3}

        /* ── VS Grid ── */
        .vs-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:20px 0 28px}
        @media(min-width:640px){.vs-grid{grid-template-columns:1fr auto 1fr;gap:16px;align-items:start}}
        .vs-card{border:1px solid #E5E7EB;border-radius:12px;padding:18px}
        @media(min-width:640px){.vs-card{padding:20px}}
        .vs-card.amazon{border-top:3px solid #FF9900}
        .vs-card.flipkart{border-top:3px solid #2874F0}
        .dark .vs-card{background:#111827;border-color:#1f2937}
        .vs-platform{font-family:'Sora',sans-serif;font-size:15px;font-weight:800;margin-bottom:12px}
        .vs-card.amazon .vs-platform{color:#FF9900}
        .vs-card.flipkart .vs-platform{color:#2874F0}
        .vs-item{display:flex;align-items:flex-start;gap:7px;margin-bottom:8px;font-family:'Sora',sans-serif;font-size:12.5px;color:#374151;line-height:1.5}
        @media(min-width:640px){.vs-item{font-size:13px}}
        .dark .vs-item{color:#9ca3af}
        .vs-item::before{content:"✓";font-weight:700;color:#10B981;flex-shrink:0;margin-top:1px}
        .vs-item.con::before{content:"✗";color:#EF4444}
        .vs-label{text-align:center;font-family:'Sora',sans-serif;font-size:22px;font-weight:900;color:#9CA3AF;display:flex;align-items:center;justify-content:center;padding:10px 0}

        /* ── Steps ── */
        .steps{display:flex;flex-direction:column;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.steps{gap:12px;margin:20px 0 28px}}
        .step{display:flex;gap:12px;background:#F5F8FF;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{background:#111827;border-color:#1f2937}
        .step-n{flex-shrink:0;width:30px;height:30px;background:#FF9900;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-n{width:34px;height:34px;font-size:15px}}
        .step-body strong{display:block;font-size:13px;color:#0A0F1A;margin-bottom:3px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body strong{font-size:14.5px}}
        .dark .step-body strong{color:#f9fafb}
        .step-body p{margin:0;font-size:12.5px;color:#64748B;line-height:1.6;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body p{font-size:13.5px}}

        /* ── Tables ── */
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:18px 0 24px}
        @media(min-width:640px){.tbl-wrap{margin:24px 0 32px}}
        table.dt{width:100%;border-collapse:collapse;font-size:11.5px;font-family:'Sora',sans-serif;min-width:480px}
        @media(min-width:640px){table.dt{font-size:13px;min-width:560px}}
        table.dt thead tr{background:#0A0F1A}
        table.dt th{padding:10px 12px;color:white;font-weight:700;text-align:left;font-size:10.5px;letter-spacing:.2px;white-space:nowrap}
        @media(min-width:640px){table.dt th{padding:13px 16px;font-size:12px}}
        table.dt th.amz-head{background:#FF9900}
        table.dt th.fk-head{background:#2874F0}
        table.dt tbody tr{border-bottom:1px solid #E5E7EB;transition:background .15s}
        table.dt tbody tr:nth-child(even) td{background:#F5F8FF}
        table.dt tbody tr:hover td{background:#EFF6FF}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}
        table.dt tr.hl td{background:#FFF7ED!important;border-left:3px solid #FF9900}
        table.dt tr.hl td:first-child{font-weight:700;color:#FF9900}
        table.dt tr.ins td{background:#EFF6FF!important;border-left:3px solid #2874F0}
        table.dt tr.ins td:first-child{font-weight:700;color:#2874F0}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bg{padding:2px 8px;font-size:11.5px}}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.br{padding:2px 8px;font-size:11.5px}}
        .by{background:#FEF9C3;color:#92400E;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}

        /* ── Mistakes ── */
        .mistakes{display:flex;flex-direction:column;gap:8px;margin:16px 0 22px}
        @media(min-width:640px){.mistakes{gap:10px;margin:20px 0 28px}}
        .mistake{border:1px solid #E5E7EB;border-radius:10px;display:flex;overflow:hidden}
        .dark .mistake{border-color:#1f2937}
        .mistake-n{flex-shrink:0;width:38px;background:#0A0F1A;color:white;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-n{width:46px;font-size:17px}}
        .mistake-body{padding:12px 14px}
        @media(min-width:640px){.mistake-body{padding:16px 18px}}
        .mistake-body strong{display:block;font-size:13px;color:#0A0F1A;margin-bottom:4px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-body strong{font-size:14.5px;margin-bottom:5px}}
        .dark .mistake-body strong{color:#f9fafb}
        .mistake-body p{margin:0;font-size:12px;color:#64748B;line-height:1.65;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-body p{font-size:13.5px}}

        /* ── Weekly grid ── */
        .weekly-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.weekly-grid{grid-template-columns:repeat(3,1fr);gap:12px}}
        .weekly-col{background:#F5F8FF;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden}
        .dark .weekly-col{background:#111827;border-color:#1f2937}
        .weekly-col-head{padding:10px 14px;font-family:'Sora',sans-serif;font-size:11px;font-weight:800;color:white;letter-spacing:.3px}
        .wh-daily{background:#10B981}
        .wh-weekly{background:#2874F0}
        .wh-monthly{background:#FF9900}
        .weekly-col-body{padding:10px 14px}
        .weekly-col-body li{font-size:11.5px;color:#475569;margin-bottom:6px;line-height:1.55;font-family:'Sora',sans-serif;list-style:none;padding-left:14px;position:relative}
        .weekly-col-body li::before{content:'·';position:absolute;left:0;color:#FF9900;font-weight:700;font-size:16px;line-height:1.2}
        .dark .weekly-col-body li{color:#9ca3af}

        /* ── Mid CTA ── */
        .mid-cta{background:linear-gradient(135deg,#0A0F1A 0%,#0D1E3A 100%);border-radius:10px;padding:20px 22px;margin:32px 0;display:flex;flex-direction:column;gap:16px}
        @media(min-width:640px){.mid-cta{padding:24px 28px;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:40px 0;gap:20px}}
        @media(min-width:1024px){.mid-cta{padding:28px 32px}}
        .mid-cta h3{font-size:16px;font-weight:800;color:white;margin-bottom:5px;letter-spacing:-.2px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta h3{font-size:18px;margin-bottom:6px}}
        .mid-cta p{color:#94A3B8;font-size:12.5px;margin:0;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta p{font-size:13.5px}}

        /* ── FAQ ── */
        .faq-item{border:1px solid #E5E7EB;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;transition:border-color .2s}
        @media(min-width:640px){.faq-item{margin-bottom:10px}}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#FF9900}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0A0F1A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px;gap:12px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#FFF7ED}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#FEF9C3;color:#FF9900;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        @media(min-width:640px){.faq-icon{width:22px;height:22px;font-size:16px}}
        .faq-icon.open{transform:rotate(45deg);background:#FF9900;color:white}
        .faq-a{padding:0 16px 14px;font-size:13px;color:#64748B;line-height:1.75;font-family:'Lora',serif}
        @media(min-width:640px){.faq-a{padding:0 20px 16px;font-size:14px}}
        .dark .faq-a{color:#9ca3af}

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

        /* ── TOC links ── */
        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#FF9900;background:#FFF7ED;border-left-color:#FF9900}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#1c0900;color:#FBBF24}

        /* ── Stat strip ── */
        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E5E7EB;text-align:center;border-bottom:1px solid #E5E7EB}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}
        @media(max-width:639px){.stat-item:nth-child(2){border-right:none}.stat-item:nth-child(3){border-right:1px solid #E5E7EB}.stat-item:nth-child(4){border-right:none;border-bottom:none}.stat-item:nth-child(3){border-bottom:none}}

        /* ── Takeaway box ── */
        .takeaway-box{background:#0A0F1A;border-radius:10px;padding:22px 20px;margin:22px 0}
        @media(min-width:640px){.takeaway-box{padding:28px 30px;margin:28px 0}}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:white;margin:0 0 14px}
        @media(min-width:640px){.takeaway-box h3{font-size:18px;margin:0 0 16px}}
        .takeaway-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
        @media(min-width:640px){.takeaway-item{gap:10px;margin-bottom:10px}}
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#FF9900;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        /* ── Verdict banner ── */
        .verdict-banner{background:linear-gradient(135deg,#FFF7ED 0%,#FEF9C3 100%);border:2px solid #FED7AA;border-radius:12px;padding:16px;margin:22px 0;display:flex;gap:12px;align-items:flex-start}
        @media(min-width:640px){.verdict-banner{padding:22px 24px;margin:28px 0;gap:16px}}
        .dark .verdict-banner{background:#1c0900;border-color:#9a3412}

        /* ── Breadcrumb ── */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        @media(min-width:640px){.breadcrumb{padding:10px 0}}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        /* ── Hero ── */
        .article-hero{max-width:1240px;margin:0 auto;padding:28px 16px 0}
        @media(min-width:640px){.article-hero{padding:36px 20px 0}}
        @media(min-width:1024px){.article-hero{padding:48px 24px 0}}

        /* ── Sidebar CTA ── */
        .sidebar-cta-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:white;margin-bottom:8px;line-height:1.35}
        @media(min-width:1024px){.sidebar-cta-title{font-size:16px}}
        .sidebar-cta-body{font-size:11.5px;color:#94A3B8;margin-bottom:14px;line-height:1.6;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.sidebar-cta-body{font-size:12.5px;margin-bottom:16px}}

        /* ── Hero image caption ── */
        .hero-caption{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:32px;padding:6px 10px}

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ═══ NAV ══════════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background dark:bg-gray-900/80 backdrop-blur-none"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <Link href="/" className="flex items-center space-x-1 group">
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">Pricing</Link>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button asChild onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Link href="/login">Login</Link>
              </Button>
              <button className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <Link href="/resources/expert-blog" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </Link>
              {([ ["Solutions","Solutions"],["Use Cases","Use Cases"],["Features","Features"],["Free Tools","Free Tools"],["Compare","Compare"],["Resources","Resources"],["About","About"] ] as [string, keyof NavigationMenu][]).map(([label, key]) => (
                <div key={label}>
                  <button onClick={() => toggleMobileMenu(label)} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    {label}<ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {navigationMenu[key].map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-left flex-1">{item.name}</span>
                          {item.badge && <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm">Pricing</Link>
              <Button asChild className="w-full mt-2 bg-gradient-to-r from-blue-600 to-orange-500 text-sm py-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb" style={{ marginTop: 80}}>
        <div className="breadcrumb-inner">
          <Link href="/" style={{ color:"#64748B", fontWeight:500, textDecoration:"none" }}>Home</Link>
          <span>›</span>
          <Link href="/resources/expert-blog" style={{ color:"#64748B", fontWeight:500, textDecoration:"none" }}>Blog</Link>
          <span>›</span>
          <span style={{ color:"#94A3B8" }}>Amazon vs Flipkart India Sellers</span>
        </div>
      </div>

      {/* HERO */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#FFF7ED", color:"#FF9900", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase" as const, padding:"4px 12px", borderRadius:20, marginBottom:14, border:"1px solid #FED7AA", fontFamily:"'Sora',sans-serif" }}>
          ◆ Seller Tools &amp; Strategy
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:800, lineHeight:1.18, color:"#0A0F1A", letterSpacing:"-.5px", maxWidth:820 }} className="dark:text-white">
          <span style={{ color:"#FF9900" }}>Amazon vs Flipkart:</span>{" "}
          Which Marketplace is Better in India?{" "}
          <span style={{ color:"#2874F0" }}>(2026)</span>
        </h1>
        <p style={{ fontFamily:"'Lora',serif", fontSize:"clamp(14px,2.5vw,17px)", color:"#475569", lineHeight:1.75, maxWidth:800,paddingTop:10, marginBottom:20 }} className="dark:text-gray-400">
          Most Indian sellers are bleeding margin by choosing the wrong platform without running the numbers first. See how successful D2C brands evaluate fees, traffic, and competition data to decide where every rupee of inventory should go.
        </p>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>👤 <strong className="text-[#0A0F1A] hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>Vikrant Singh</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>🕐 January 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>📖 <strong>12 min read</strong></div>
          <span style={{ background:"#ECFDF5", color:"#10B981", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Updated for 2026</span>
          <span style={{ background:"#FFF7ED", color:"#FF9900", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Marketplace Comparison</span>
        </div>

        {/* Hero Visual Card */}
        <img
          src="/amazon-vs-flipkart-hero-metrics.png"
          alt="Amazon vs Flipkart India — commission fees, search traffic and Tier-2 buyer data comparison"
          style={{ width:"100%", borderRadius:16, marginBottom:10, display:"block" }}
        />
        <p className="hero-caption">Data based on Insydz seller intelligence across 10,000+ Indian sellers · January 2026</p>

        <div className="stat-strip" style={{ marginBottom:24 }}>
          {[
            ["8–18%",  "Amazon.in Commission Fees by Category"],
            ["5–12%",  "Flipkart Commission Fees by Category"],
            ["2.4×",   "More Search Traffic on Amazon.in"],
            ["60–70%", "Tier-2/3 City Buyers on Flipkart"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span style={{ display:"block", fontSize:"clamp(20px,4vw,26px)", fontWeight:900, color:"#FF9900", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{num}</span>
              <span style={{ display:"block", fontSize:"clamp(10px,2vw,11.5px)", color:"#64748B", marginTop:4, lineHeight:1.4, fontWeight:500, fontFamily:"'Sora',sans-serif" }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TAKEAWAYS */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px 28px" }} className="sm:px-5 lg:px-6">
        <div className="takeaway-box">
          <h3>Key Takeaways</h3>
          {[
            "Amazon.in has higher search traffic but also higher commission fees and intense seller competition.",
            "Flipkart dominates fashion, mobiles, and Tier-2/3 buyers with lower commission fees in most categories.",
            "Amazon Flipkart profit margins differ significantly by category electronics sellers earn more on Flipkart; home goods earn more on Amazon.",
            "Pricing behavior on Amazon is more aggressive competitors reprice every 15–60 minutes using AI tools.",
            "For most Indian SMB sellers, listing on both platforms with category-specific strategy is the highest-ROI move.",
            "Without real-time marketplace intelligence, reactive pricing on either platform silently destroys margins.",
          ].map(t => (
            <div className="takeaway-item" key={t}>
              <div className="takeaway-dot">✓</div>
              <div className="takeaway-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">

        {/* SIDEBAR */}
        <aside className="toc-sidebar">
          <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:1, color:"#94A3B8", marginBottom:12 }}>Table of Contents</h4>
          <ul style={{ listStyle:"none", padding:0, margin:0 }}>
            {TOC.map(t => (
              <li key={t.id}>
                <button className={`toc-link${activeSection === t.id ? " active" : ""}`} onClick={() => go(t.id)}>{t.label}</button>
              </li>
            ))}
          </ul>
          <div style={{ background:"linear-gradient(160deg,#0A0F1A 0%,#0D1E3A 100%)", borderRadius:10, padding:18, marginTop:16 }}>
            <h4 className="sidebar-cta-title">Track Prices on Both Platforms Free</h4>
            <p className="sidebar-cta-body">Real-time price intelligence for Amazon.in &amp; Flipkart delivered on WhatsApp.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 14px" }}>
              {["Amazon.in + Flipkart in one dashboard","WhatsApp price-drop alerts within 60 min","AI buy-box recommendations per platform","From ₹1,999/mo — or free forever"].map(f => (
                <li key={f} style={{ fontSize:11.5, color:"#CBD5E1", marginBottom:7, display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.4, fontFamily:"'Sora',sans-serif" }}>
                  <span style={{ color:"#10B981", fontWeight:800, flexShrink:0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/login" style={{ display:"block", background:"#FF9900", color:"white", textAlign:"center" as const, padding:10, borderRadius:8, fontWeight:700, fontSize:12.5, width:"100%", textDecoration:"none", fontFamily:"'Sora',sans-serif" }}>
              Start Free — No Card Needed
            </Link>
          </div>
          {/* <div style={{ background:"#F5F8FF", border:"1px solid #E5E7EB", borderRadius:10, padding:14, marginTop:14 }}>
            <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:1, color:"#94A3B8", marginBottom:10 }}>Share This Guide</h4>
            <div style={{ display:"flex", gap:6 }}>
              {[{ l:"WhatsApp", bg:"#25D366" },{ l:"LinkedIn", bg:"#0A66C2" },{ l:"Twitter", bg:"#1DA1F2" }].map(s => (
                <div key={s.l} style={{ flex:1, textAlign:"center" as const, padding:"7px 4px", borderRadius:7, fontSize:11, fontWeight:700, color:"white", background:s.bg, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>{s.l}</div>
              ))}
            </div>
          </div> */}
        </aside>

        {/* MAIN */}
        <main style={{ minWidth:0 }}>
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)}>
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>
            ))}
          </div>

          <article className="article-body">

            {/* In Simple Terms */}
            <div className="box box-purple" style={{ margin:"0 0 28px" }}>
              <div className="box-label">In Simple Terms</div>
              <p>The <strong><a href="https://insydz.com/flipkart-sellers" className="al" title="Flipkart sellers solution">amazon vs flipkart india sellers</a></strong> debate isn't a brand preference it's a margin and strategy question. Amazon and Flipkart reward very different seller behaviours. A strategy that wins you the Buy Box on Amazon.in can actively hurt your ranking on Flipkart because their algorithms weigh seller competition, pricing behaviour, and fulfilment speed differently.</p>
            </div>

            {/* ── S1: Overview ── */}
            <h2 id="overview">What Does the Amazon vs Flipkart Battle Actually Mean for Indian Sellers?</h2>
            <p>
              The <strong>amazon vs flipkart india sellers</strong> debate isn't just a business-school case study. It's a real decision that affects your commission structure, Buy Box win rate, search traffic, and ultimately how much profit lands in your account at month-end.
            </p>
            <p>
              Both platforms are behemoths. Amazon.in handles over <strong>280 million monthly product searches</strong>. Flipkart, backed by Walmart, commands <strong>60–70% of fashion sales</strong> and dominates Tier-2 and Tier-3 city shoppers. They are the primary drivers of <a href="https://en.wikipedia.org/wiki/E-commerce_in_India" className="al" title="E-commerce in India" target="_blank" rel="noopener noreferrer">e-commerce in India</a>. The problem? Most sellers list on both platforms the same way, with the same pricing, the same strategy and then wonder why margins keep shrinking.
            </p>
            <p>
              This guide cuts through the noise. We compare both platforms across the metrics that actually move the needle for Indian SMB sellers: <a href="https://insydz.com/resources/expert-blog/amazon-seo-tool-india" className="al" title="Amazon SEO Blog">commission fees and seller competition</a>, search traffic, Buy Box mechanics, and pricing dynamics with a final verdict for each category type. For sellers already running both platforms, pair this with our{" "}
              {/* <a href="/features/competitor-price-tracking-feature" className="al" title="Competitor price tracking for Amazon and Flipkart India">competitor price tracking feature</a>{" "} */}
              competitor price tracking feature to close the intelligence gap between the two marketplaces.
            </p>

            {/* ── S2: Commission ── */}
            <h2 id="commission">Commission Fees: Where Does Your Margin Actually Go?</h2>
            <p>
              Commission fees are the most direct cost comparison and the gap between Amazon and Flipkart is larger than most sellers realise.
            </p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="amz-head">Amazon.in Commission</th>
                    <th className="fk-head">Flipkart Commission</th>
                    <th>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionRows.map((r, i) => (
                    <tr key={i} className={r.cat.includes("Average") ? "hl" : ""}>
                      <td style={{ fontWeight: r.cat.includes("Average") ? 700 : 400 }}>{r.cat}</td>
                      <td>{r.amz}</td>
                      <td>{r.fk}</td>
                      <td>
                        {r.winner === "Flipkart" ? <span className="bg">Flipkart ✓</span>
                        : r.winner === "Amazon"   ? <span className="br">Amazon ✓</span>
                        : <span className="by">Tie</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>The 2% average commission difference may sound small. On a ₹1,000 product selling 500 units per month, that's <strong>₹10,000/month in pure margin</strong> compounding across your entire SKU catalogue.</p>

            <div className="box box-blue">
              <div className="box-label">Key Insight</div>
              <p>Commission fees are just one cost layer. Amazon charges higher fulfilment (FBA) fees in some tiers, while Flipkart's Flipkart Fulfilment (FF) pricing is more competitive for sellers outside metro warehouses. Always model the total cost not just the commission rate.</p>
            </div>

            {/* ── S3: Traffic ── */}
            <h2 id="traffic">Search Traffic: Which Platform Sends More Buyers?</h2>
            <p>
              Amazon.in generates approximately <strong>2.4× more organic product search traffic</strong> than Flipkart. This isn't just about volume it's about buyer intent. Amazon shoppers are more likely to be in purchase mode, using specific search queries tied directly to product names, ASINs, and specifications.
            </p>

            <h3>Amazon's Search Advantage</h3>
            <p>
              Amazon.in's search algorithm, A9, prioritises conversion rate, relevance, and pricing competitiveness. Sellers with strong keyword targeting and competitive prices get disproportionate organic visibility. The platform also benefits from Google Shopping integrations, which drive significant search traffic from external sources. Sellers looking to maximise this advantage should read our guide on{" "}
              Amazon keyword research for Indian sellers.
            </p>

            <h3>Flipkart's Audience Strengths</h3>
            <p>
              Flipkart's traffic is geographically different. It over-indexes on Tier-2 and Tier-3 cities Patna, Indore, Jaipur, Surat where smartphone penetration drove first-time online buyers. These buyers are <strong>price-sensitive and brand-agnostic</strong>, making Flipkart the dominant platform for value-oriented products and local/regional brands. To capture this traffic effectively, sellers should consult a comprehensive <a href="https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool" className="al" title="Flipkart Keyword Research Tool">flipkart keyword research and SEO optimization guide</a>.
            </p>

            <div className="box box-amber">
              <div className="box-label">Real Seller Example</div>
              <p>A Surat-based apparel brand shifted 40% of its Flipkart SKUs to the front page by optimising for Tier-2 city search terms like "cotton kurta under ₹500 Patna delivery." Their Amazon listings targeted urban search patterns. Result: <strong>28% revenue increase without adding a single new SKU</strong> just smarter platform-specific keyword targeting.</p>
            </div>

            {/* ── S4: Competition ── */}
            <h2 id="competition">Seller Competition: How Crowded Is Each Marketplace?</h2>
            <p>Both platforms have over 500,000 registered sellers. But the nature of competition is structurally different.</p>

            <div className="vs-grid">
              <div className="vs-card amazon">
                <div className="vs-platform">Amazon.in</div>
                <div className="vs-item">Pan-India seller base with heavy metro representation</div>
                <div className="vs-item">Chinese cross-border sellers active in electronics &amp; accessories</div>
                <div className="vs-item">Brand Registry programme reduces generic competition</div>
                <div className="vs-item con">More aggressive repricing AI tools reprice every 15–60 min</div>
                <div className="vs-item con">Amazon Retail competes directly on high-velocity ASINs</div>
                <div className="vs-item con">Higher advertising costs (ACoS typically 20–35%)</div>
              </div>
              <div className="vs-label">VS</div>
              <div className="vs-card flipkart">
                <div className="vs-platform">Flipkart</div>
                <div className="vs-item">Stronger Tier-2/3 seller diversity less metro concentration</div>
                <div className="vs-item">Fashion brands get exclusive listing windows during sales</div>
                <div className="vs-item">Flipkart Assured badge creates quality-tier differentiation</div>
                <div className="vs-item con">Less sophisticated competitor repricing manual pricing common</div>
                <div className="vs-item con">Advertising platform less mature than Amazon Ads</div>
                <div className="vs-item con">Category exclusivity deals can lock out new entrants</div>
              </div>
            </div>

            <div className="box box-purple">
              <div className="box-label">AI Overview Summary</div>
              <p>On Amazon.in, <strong>pricing behavior is the primary competitive weapon</strong> sellers who don't use {" "}
              real-time competitor price tracking lose the Buy Box within hours of a competitor repricing. Flipkart's competition is currently less algorithmically driven, but this is changing rapidly as more sophisticated sellers move onto the platform.</p>
            </div>

            {/* ── S5: Buy Box ── */}
            <h2 id="buybox">Buy Box Mechanics: Amazon vs Flipkart</h2>
            <p>The Buy Box (Amazon) and the "Add to Cart" default (Flipkart) are where sales are won or lost. The rules are different and most sellers apply Amazon logic to Flipkart, costing them significant revenue.</p>

            <div className="steps">
              {[
                { n:1, t:"Price Competitiveness", d:"Amazon's A9 algorithm is ruthless about price. Being ₹50 above the category median on a ₹500 product can drop you off page one within 24 hours. Flipkart's algorithm is less aggressive price matters, but seller rating and fulfilment history carry more weight." },
                { n:2, t:"Fulfilment Method",     d:"FBA (Fulfilled by Amazon) gives a significant Buy Box advantage on Amazon.in. Flipkart Fulfilment (FF) similarly boosts the Assured badge but self-fulfilled sellers with strong on-time delivery records can still compete effectively on Flipkart." },
                { n:3, t:"Seller Rating & Reviews", d:"Both platforms weight seller metrics heavily. A competitor with 4.6 stars and 500 reviews can charge ₹150 more than you and still win the Buy Box on Flipkart. On Amazon, review velocity (new reviews per week) increasingly influences search rank." },
                { n:4, t:"Response to Competitor Stock-Outs", d:"When a top competitor goes out of stock, both platforms immediately reallocate visibility. Sellers who capture this window typically 3–5× conversion lift are the ones monitoring competitor inventory in real time." },
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t}</strong><p>{s.d}</p></div>
                </div>
              ))}
            </div>

            {/* ── S6: Pricing ── */}
            <h2 id="pricing">Pricing Behavior: The Invisible Margin Killer</h2>
            <p>
              This is where most <strong><a href="https://insydz.com/" className="al" title="Insydz Homepage">ecommerce marketplace comparison india</a></strong> guides miss the story. Commission fees are visible. Pricing behavior is silent and it's where most margin actually disappears.
            </p>

            <h3>Amazon: AI-Powered Repricing at Scale</h3>
            <p>
              Top Amazon.in sellers reprice their entire catalogue every 15–60 minutes using tools like Insydz's competitor price tracking. A competitor who drops their price by ₹100 at 11 PM will have already recaptured the Buy Box before you wake up. Three weeks later, you've lost ₹45,000 in revenue you never even tracked.
            </p>

            <h3>Flipkart: Manual Repricing For Now</h3>
            <p>
              Flipkart's seller base is currently less sophisticated about repricing. The majority still manually update prices 1–2 times per week. This creates <strong>pricing windows</strong> moments where a seller who monitors competitor price movements can gain a temporary margin advantage without triggering a price war.
            </p>

            <div className="box box-amber">
              <div className="box-label">⚠ Warning</div>
              <p>Flipkart's manual-repricing window is closing. As AI-powered seller tools become more accessible at ₹1,999–2,999/month, the repricing gap between Amazon and Flipkart will narrow to zero by 2027. <strong>Sellers who build real-time pricing systems now will have a compounding advantage.</strong></p>
            </div>

            {/* ── S7: Margins ── */}
            <h2 id="margins">Amazon Flipkart Profit Margins by Category: The Real Data</h2>
            <p>Choosing the right primary platform for each product category is the single highest-leverage decision most sellers aren't making deliberately, as <a href="https://insydz.com/resources/expert-blog/manual-vs-automated-competitor-tracking" className="al" title="Amazon Flipkart profit margins">amazon flipkart profit margins</a> can drastically vary.</p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Better Margin Platform</th>
                    <th>Reason</th>
                    <th>Avg. Margin Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {marginRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{r.cat}</td>
                      <td>
                        {r.platform === "Flipkart" ? <span className="bg">Flipkart ✓</span>
                        : r.platform === "Amazon"   ? <span className="br">Amazon ✓</span>
                        : <span className="by">Both</span>}
                      </td>
                      <td style={{ color:"#475569" }}>{r.reason}</td>
                      <td style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#10B981" }}>{r.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mid CTA */}
            <div className="mid-cta">
              <div>
                <h3>Track Prices on Both Platforms Free</h3>
                <p>Real-time Amazon.in &amp; Flipkart price intelligence with AI Buy Box recommendations. Setup in under 30 minutes.</p>
              </div>
              <Link href="/login" style={{ flexShrink:0, background:"#FF9900", color:"white", padding:"11px 22px", borderRadius:8, fontWeight:700, fontSize:"clamp(13px,2vw,14.5px)", whiteSpace:"nowrap" as const, textDecoration:"none", fontFamily:"'Sora',sans-serif" }} className="sm:w-auto w-full text-center">Try Insydz Free →</Link>
            </div>

            {/* ── S8: Mistakes ── */}
            <h2 id="mistakes">5 Mistakes Indian Sellers Make When Choosing Between Amazon &amp; Flipkart</h2>
            <div className="mistakes">
              {[
                { t:"Treating Both Platforms as Identical",                      d:"Copying the same listing, same pricing, same keywords across both platforms ignores fundamental algorithmic differences. What ranks on Amazon doesn't automatically rank on Flipkart." },
                { t:"Ignoring Category-Specific Commission Structures",           d:"Most sellers calculate commissions based on headline rates without accounting for category-specific tiers, festival surcharges, or fulfilment add-ons that can swing effective commission by 3–5%." },
                { t:"Underestimating Flipkart's Festive Season Power",            d:"During Big Billion Days, Flipkart drives 40–60% of annual e-commerce revenue for many fashion and electronics sellers. Sellers who haven't built their Flipkart presence before October lose this window entirely." },
                { t:"Not Tracking Competitor Pricing Separately Per Platform",    d:"Your top competitor on Amazon.in is often not your top competitor on Flipkart. Running the same price intelligence across both platforms means your data is always partially wrong." },
                { t:"Setting a Launch Price and Never Revisiting It",             d:"Seasonal demand on Flipkart for fashion swings 40–60% during festive periods. A seller who doesn't adjust pricing dynamically for Diwali, Republic Day Sale, or Big Billion Days leaves significant margin on the table." },
              ].map((m, i) => (
                <div className="mistake" key={i}>
                  <div className="mistake-n">{i + 1}</div>
                  <div className="mistake-body"><strong>{m.t}</strong><p>{m.d}</p></div>
                </div>
              ))}
            </div>

            {/* ── S9: Execution ── */}
            <h2 id="execution">Best Practices: The Weekly Execution Model for Dual-Platform Sellers</h2>
            <p>The most successful Indian sellers don't manage Amazon and Flipkart reactively they run a structured weekly rhythm that keeps them consistently competitive on both platforms without doubling their effort.</p>

            <div className="weekly-grid">
              <div className="weekly-col">
                <div className="weekly-col-head wh-daily">DAILY AUTOMATED</div>
                <div className="weekly-col-body">
                  <ul>
                    <li>WhatsApp digest: top 3 competitor price moves on both platforms overnight</li>
                    <li>Check Buy Box status for top 10 SKUs on each marketplace</li>
                    <li>Act on any 'Critical Alert' (competitor dropped &gt;10%)</li>
                  </ul>
                </div>
              </div>
              <div className="weekly-col">
                <div className="weekly-col-head wh-weekly">WEEKLY 30 MIN REVIEW</div>
                <div className="weekly-col-body">
                  <ul>
                    <li>Review platform-specific competitor review sentiment recurring pain points?</li>
                    <li>Check keyword rank movements for top 5 keywords on each platform</li>
                    <li>Identify OOS competitors (3–5× revenue window)</li>
                    <li>Adjust 1–2 product prices based on AI recommendations per platform</li>
                  </ul>
                </div>
              </div>
              <div className="weekly-col">
                <div className="weekly-col-head wh-monthly">MONTHLY STRATEGIC</div>
                <div className="weekly-col-body">
                  <ul>
                    <li>Audit commission effective rates for each SKU per platform</li>
                    <li>Identify 1 new product gap from AI gap analysis report</li>
                    <li>Review if any SKU should switch primary platform based on margin data</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── S10: Tools ── */}
            <h2 id="tools">Best Tools for Amazon vs Flipkart Management in India (2026)</h2>
            <p>
              Global tools like Helium 10 and Jungle Scout cover Amazon.in but <strong>miss Flipkart entirely</strong>. For Indian sellers managing both platforms, you need a tool built for India-first dynamics. See our full{" "}
              Insydz vs Helium 10 comparison{" "}
              for a detailed breakdown.
            </p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Amazon.in</th>
                    <th className="fk-head">Flipkart</th>
                    <th>WhatsApp Alerts</th>
                    <th className="amz-head">Price (INR/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {toolRows.map((r, i) => (
                    <tr key={i} className={r.tool.includes("Insydz") ? "ins" : ""}>
                      <td style={{ fontWeight: r.tool.includes("Insydz") ? 800 : 600 }}>{r.tool}</td>
                      <td>{r.amz === "Yes" ? <span className="bg">Yes</span> : <span className="br">No</span>}</td>
                      <td>{r.fk === "Yes" ? <span className="bg">Yes</span> : <span className="br">No</span>}</td>
                      <td>{r.wa === "Yes" ? <span className="bg">Yes</span> : <span className="br">No</span>}</td>
                      <td style={{ fontWeight: r.tool.includes("Insydz") ? 700 : 400, color: r.tool.includes("Insydz") ? "#2874F0" : "inherit" }}>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="box box-green">
              <div className="box-label">No Aggressive Pitch Here</div>
              <p>If you're an Indian seller on Amazon.in or Flipkart and you're not tracking competitor prices across both platforms, you're operating on guesswork. The question isn't whether you need a tool it's which one covers both marketplaces and fits your budget.</p>
            </div>

            {/* ── S11: FAQ ── */}
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

            {/* ── S12: Final ── */}
            <h2 id="final">Final Thoughts</h2>
            <p>
              Winning on Amazon India and Flipkart in 2026 isn't about picking a side it's about deploying the right strategy on the right platform for the right product. Commission fees matter. Search traffic matters. Seller competition matters. But what matters most is whether you're <strong>reacting to pricing behavior or leading it.</strong>
            </p>
            <p>
              Sellers who treat both platforms as interchangeable will keep losing margin silently. Sellers who build platform-specific intelligence tracking competitor prices, review velocity, and Buy Box movements separately for each marketplace are the ones who scale consistently through festive seasons and category shakeouts.
            </p>

            <div className="verdict-banner">
              <p style={{ margin:0, fontFamily:"'Lora',serif", fontSize:"clamp(13px,2vw,15px)", color:"#92400E", lineHeight:1.7 }} className="dark:text-orange-200">
                <strong>The data is clear:</strong> every hour without cross-platform intelligence is an hour your competitors are adjusting prices and taking your Buy Box with them.
              </p>
            </div>

            {/* Related Guides */}
            <div style={{ marginTop:48, paddingTop:28, borderTop:"2px solid #E5E7EB" }}>
              <h2 style={{ fontSize:"clamp(16px,3vw,20px)", fontWeight:800, color:"#0A0F1A", margin:"0 0 18px", border:"none", padding:0, fontFamily:"'Sora',sans-serif" }} className="dark:text-white">Related Guides</h2>
              <div className="related-grid">
                <Link href="/resources/expert-blog/flipkart-keyword-research-tool" className="rel-card" title="Flipkart keyword research tool — 2026 guide">
                  <div className="rel-thumb">
                    <img src="/01_hero_banner.png" alt="Flipkart Keyword Research Tool guide" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Flipkart SEO</div>
                    <div className="rel-title">Flipkart Keyword Research Tool &amp; SEO Optimization Guide for Sellers (2026)</div>
                  </div>
                </Link>
                <Link href="/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers" className="rel-card" title="Review analysis tools for Indian sellers">
                  <div className="rel-thumb">
                    <img src="/eighteen.png" alt="AI Review Intelligence Tool for Amazon and Flipkart" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag" style={{ color:"#10B981" }}>Review Intelligence</div>
                    <div className="rel-title">AI Review Intelligence Tool for Amazon &amp; Flipkart Sellers: The Complete Guide</div>
                  </div>
                </Link>
                <Link href="/resources/expert-blog/insydz-vs-helium-10-india" className="rel-card" title="Insydz vs Helium 10 for Indian sellers">
                  <div className="rel-thumb">
                    <img src="/thirteen.png" alt="Insydz vs Helium 10 comparison for Indian sellers" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">Compare</div>
                    <div className="rel-title">Insydz vs Helium 10: Which Is the Right Tool for Indian Sellers?</div>
                  </div>
                </Link>
              </div>
            </div>

          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div className="final-cta-block">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
          Your Competitors Track Both Platforms. Now You Can Too.
        </h2>
        <p className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Lora', serif", maxWidth: 520, margin: "0 auto 24px" }}>
          Insydz gives you unified price intelligence across Amazon.in and Flipkart — with real-time WhatsApp alerts the moment a rival moves, and AI guidance on exactly how to respond.
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", marginBottom: 20 }}>
          {["Free plan", "Amazon.in + Flipkart", "WhatsApp alerts in 60 min"].map(t => (
            <div key={t} className="text-blue-100" style={{ fontSize:"clamp(11px,2vw,13.5px)", display:"flex", alignItems:"center", gap:6, fontFamily:"'Sora',sans-serif" }}>
              <span className="text-white" style={{ fontWeight: 800 }}>✓</span> {t}
            </div>
          ))}
        </div>
        <Link href="/login"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105 inline-block text-decoration-none"
        >
          Track Both Platforms Free →
        </Link>
        <p className="text-blue-200 text-xs mt-4">
          Free plan · Amazon.in + Flipkart · WhatsApp alerts in 60 min
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



