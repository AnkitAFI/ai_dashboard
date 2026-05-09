"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaVineProgram = {
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
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "url": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "name": "Amazon Vine Program India 2026: Everything You Need to Know",
      "description": "Learn everything about the Amazon Vine Program in India for 2026. How to join, benefits for sellers, and how it compares to other review programs.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon Vine Program India 2026", "item": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#article",
      "headline": "Amazon Vine Program India 2026: Everything You Need to Know",
      "description": "A comprehensive guide to the Amazon Vine Program in India for 2026. Replicating the success of top sellers with authentic reviews.",
      "image": "https://insydz.com/assets/images/blog/amazon-vine-program-india-2026.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-08",
      "dateModified": "2026-05-08",
      "keywords": ["amazon vine program india","amazon reviews india","vine voices india","amazon seller reviews 2026","ecommerce reviews india"],
      "articleSection": "Seller Tools & Strategy",
      "inLanguage": "en-IN",
      "wordCount": 4400,
      "timeRequired": "PT12M"
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
  { id:"what-is-vine", label:"What Is Amazon Vine?" },
  { id:"vine-cost",    label:"Is ₹19,200 Worth It?" },
  { id:"full-compare", label:"When the Math Works" },
  { id:"how-to-enrol", label:"How to Enrol Step-by-Step" },
  { id:"mistakes",     label:"Common Mistakes to Avoid" },
  { id:"compare",      label:"Vine vs Other Review Options" },
  { id:"real-cost",    label:"Real Cost of Not Using Vine" },
  { id:"after-vine",   label:"Post-Review Strategy" },
  { id:"faq",          label:"Frequently Asked Questions" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Is Amazon Vine available for all sellers in India?",
    a: "No. You must be Brand Registered on Amazon India with a Professional seller account. Individual sellers without Brand Registry cannot enrol. The ASIN must have under 30 existing reviews, and active FBA inventory must be available — no FBM listings."
  },
  {
    q: "Can I get a refund if Vine Voices do not review my product?",
    a: "No. The ₹19,200 fee is non-refundable regardless of how many reviews you receive. Amazon makes no guarantee that every enrolled unit will be claimed or reviewed — some sellers get 30 reviews, others fewer depending on category demand from Vine Voices. This is a risk you accept at enrolment."
  },
  {
    q: "How long does it take to get Vine reviews on Amazon India?",
    a: "Vine Voices start claiming units within 24–72 hours of enrolment approval. Reviews then take 2–6 weeks depending on how quickly reviewers evaluate the product. Plan for 4–8 weeks total from submission to your first Vine review appearing on your listing."
  },
  {
    q: "Does Amazon Vine work for Flipkart sellers?",
    a: "No. Vine is an Amazon-only programme. Flipkart has no equivalent verified review seeding option in 2026. Flipkart sellers need to rely on organic sales velocity, permitted buyer follow-up messaging within Flipkart's communication policies, and consistent product quality that drives unsolicited reviews."
  },
  {
    q: "What happens if I run out of FBA inventory after enrolling?",
    a: "If your FBA stock drops below the units enrolled in Vine, claims will fail and you get fewer reviews — while still paying the full ₹19,200 fee. Always maintain a dedicated Vine inventory buffer in FBA, separate from your live selling stock, for the entire Vine window duration."
  },
  {
    q: "Can I track whether Vine actually improved my keyword rankings?",
    a: "Not directly inside Amazon Seller Central — it shows review count but no keyword rank history. Insydz tracks daily keyword rank changes alongside your review count, so you can correlate exactly when your rankings moved and which review count thresholds (5, 10, 25 reviews) triggered the biggest jumps. This turns Vine from a spend item into a measurable investment."
  },
];

// ── Data ──────────────────────────────────────────────────────────────────────
const compareRows = [
  { factor:"Review Speed",       manual:"6–9 months (Organic)",  auto:"3–5 weeks (Vine)",      winner:"AI" },
  { factor:"Review Authority",   manual:"Standard Buyer",        auto:"Vetted 'Vine Voice'",  winner:"AI" },
  { factor:"Review Quality",     manual:"Highly Variable",       auto:"Detailed + Photos/Video",winner:"AI" },
  { factor:"Control",            manual:"Zero (Luck-based)",     auto:"Enrolment Control",     winner:"AI" },
  { factor:"Ranking Impact",     manual:"Slow Growth",           auto:"High Velocity Boost",  winner:"AI" },
  { factor:"Algorithmic Trust",  manual:"Low (Unverified risks)",auto:"Highest (Vine Badge)",  winner:"AI" },
  { factor:"Cost per ASIN",      manual:"₹0",                    auto:"₹19,200",              winner:"Manual" },
];

const costRows = [
  { method:"Organic Growth Only", speed:"6–12 Months", trust:"Variable", cost:"₹0" },
  { method:"Review Request Button", speed:"4–8 Months", trust:"Medium", cost:"₹0" },
  { method:"Influencer/External", speed:"2–4 Weeks", trust:"Low (unverified)", cost:"₹5,000–15,000" },
  { method:"Amazon Vine Program ★", speed:"3–5 Weeks", trust:"Highest (Verified)", cost:"₹19,200" },
];

const toolRows = [
  { tool:"Helium 10",   amz:"Partial", fk:"No",  wa:"No",  intent:"US Only",    price:"₹4,000–8,000/mo" },
  { tool:"Jungle Scout",amz:"Partial", fk:"No",  wa:"No",  intent:"US Only",    price:"₹4,500–7,000/mo" },
  { tool:"Sonar (Free)",amz:"Yes",     fk:"No",  wa:"No",  intent:"Basic",      price:"Free" },
  { tool:"Insydz ✦",   amz:"Yes",     fk:"Yes", wa:"Yes", intent:"AI-Powered", price:"₹1,999/mo + Free" },
];

const signs = [
  { t:"Your CPC is High but Conversion is Low", d:"If you're spending heavily on PPC but buyers aren't converting, they likely don't trust your 0-review listing. In the Indian market, social proof is the #1 conversion driver. High ACoS on a new launch is the first sign you need Vine." },
  { t:"Competitors are Launching and Ranking Faster", d:"If rival brands are overtaking you in organic rank within weeks, they are likely using Vine to build a review moat. Waiting for organic reviews while competitors use Vine is a losing battle." },
  { t:"You're Approaching the 30-Review Eligibility Cap", d:"Once an ASIN hits 30 reviews, it's ineligible for Vine. If you have 20 reviews and haven't enrolled yet, you are about to lose the chance to get high-authority Vine Voice reviews forever." },
  { t:"Organic Reviews are Stagnant After 100+ Sales", d:"Indian buyers have a lower natural review rate. If you've sold 100+ units and have under 3 reviews, you cannot rely on organic growth to compete during peak sales events like Diwali." },
  { t:"You're Getting Generic 'Product OK' Reviews", d:"Vine Voices provide deep, detailed reviews with photos and videos. If your current reviews are short and provide no value to other buyers, your listing quality score will suffer." },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonVineProgramContent() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("what-is-vine");
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
    const id = "insydz-vine-program-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id   = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaVineProgram);
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#F4500A,#0ABFA4);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto}}
        @media(min-width:1024px){.toc-sidebar{top:80px;padding:22px}}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}

        .mobile-toc-btn{display:flex;width:100%;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px 16px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#111;cursor:pointer;align-items:center;justify-content:space-between;margin-bottom:14px}
        .dark .mobile-toc-btn{background:#111827;border-color:#1f2937;color:#f9fafb}
        @media(min-width:768px){.mobile-toc-btn{display:none}}
        .mobile-toc-panel{display:none;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:14px;margin-bottom:20px}
        .dark .mobile-toc-panel{background:#111827;border-color:#1f2937}
        .mobile-toc-panel.open{display:block}

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
        .article-body li::marker{color:#F4500A}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}
        .article-body a.al{color:#F4500A;font-weight:600;text-decoration:underline;text-decoration-color:rgba(244,80,10,.3);text-underline-offset:3px;transition:color .2s}
        .article-body a.al:hover{color:#D03D00}

        /* boxes */
        .box{border-radius:10px;padding:16px 18px;margin:18px 0}
        @media(min-width:640px){.box{padding:20px 22px;margin:24px 0}}
        .box-label{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.box-label{font-size:11px}}
        .box p{margin:0;font-size:13.5px;line-height:1.72;font-family:'Lora',serif}
        @media(min-width:640px){.box p{font-size:14.5px}}
        .box-blue{background:#EFF6FF;border-left:4px solid #3B82F6}
        .box-blue .box-label{color:#1D4ED8}
        .box-amber{background:#FFFBEB;border-left:4px solid #F59E0B}
        .box-amber .box-label{color:#B45309}
        .box-purple{background:#F5F3FF;border-left:4px solid #8B5CF6}
        .box-purple .box-label{color:#7C3AED}
        .box-teal{background:#F0FDFA;border-left:4px solid #0ABFA4}
        .box-teal .box-label{color:#0D9488}
        .box-green{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px}
        .box-green .box-label{color:#16A34A}
        .box-orange{background:#FFF7ED;border-left:4px solid #F4500A}
        .box-orange .box-label{color:#F4500A}
        .dark .box-blue{background:#0c1e3d;border-color:#1d4ed8}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-purple{background:#1e1b4b;border-color:#3730a3}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-orange{background:#1c0900;border-color:#9a3412}

        /* compare visual cards */
        .cv-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:20px 0 28px}
        @media(min-width:640px){.cv-grid{grid-template-columns:1fr 1fr;gap:16px}}
        .cv-card{border:1.5px solid #E5E7EB;border-radius:12px;padding:18px}
        @media(min-width:640px){.cv-card{padding:22px}}
        .cv-card.manual-card{background:#F7F8FC}
        .cv-card.auto-card{background:#FFF7ED;border-color:#F4500A}
        .dark .cv-card.manual-card{background:#111827;border-color:#1f2937}
        .dark .cv-card.auto-card{background:#1c0900;border-color:#F4500A}
        .cv-badge{font-family:'Sora',sans-serif;font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:10px;display:inline-block}
        .cv-badge.m{background:#F3F4F6;color:#6B7280}
        .cv-badge.a{background:#F4500A;color:white}
        .cv-card h4{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:#0A0F1A;margin-bottom:12px}
        .dark .cv-card h4{color:#f9fafb}
        .cv-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:7px}
        .cv-list li{font-family:'Sora',sans-serif;display:flex;align-items:flex-start;gap:7px;font-size:13px;color:#374151;line-height:1.5}
        .dark .cv-list li{color:#9ca3af}
        .cv-score{margin-top:14px;padding-top:12px;border-top:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#6B7280}
        .dark .cv-score{border-color:#1f2937}
        .cv-score-val{font-size:22px;font-weight:900;color:#0A0F1A}
        .dark .cv-score-val{color:#f9fafb}
        .cv-score-val.orange{color:#F4500A}

        /* when manual cards */
        .when-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:18px 0 24px}
        @media(min-width:640px){.when-grid{grid-template-columns:1fr 1fr;gap:12px}}
        .when-card{border:1px solid #E5E7EB;border-radius:10px;padding:16px 18px}
        @media(min-width:640px){.when-card{padding:18px 20px}}
        .dark .when-card{background:#111827;border-color:#1f2937}
        .when-card-title{font-family:'Sora',sans-serif;font-size:13px;font-weight:700;color:#0A0F1A;margin-bottom:6px}
        .dark .when-card-title{color:#f9fafb}
        .when-card p{font-family:'Sora',sans-serif;font-size:12.5px;color:#64748B;margin:0;line-height:1.6}

        /* steps */
        .steps{display:flex;flex-direction:column;gap:0;margin:16px 0 22px;border-radius:10px;overflow:hidden;border:1px solid #E5E7EB}
        .dark .steps{border-color:#1f2937}
        .step{display:flex;gap:12px;padding:16px 18px;border-bottom:1px solid #E5E7EB}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{border-color:#1f2937}
        .step:last-child{border-bottom:none}
        .step-n{flex-shrink:0;width:32px;height:32px;background:#F4500A;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;margin-top:2px}
        @media(min-width:640px){.step-n{width:36px;height:36px;font-size:15px}}
        .step-body h4{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:#0A0F1A;margin-bottom:4px}
        @media(min-width:640px){.step-body h4{font-size:15px}}
        .dark .step-body h4{color:#f9fafb}
        .step-body p{margin:0;font-size:12.5px;color:#64748B;line-height:1.65;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body p{font-size:13.5px}}

        /* tables */
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:18px 0 24px}
        @media(min-width:640px){.tbl-wrap{margin:24px 0 32px}}
        table.dt{width:100%;border-collapse:collapse;font-size:11.5px;font-family:'Sora',sans-serif;min-width:480px}
        @media(min-width:640px){table.dt{font-size:13px;min-width:560px}}
        table.dt thead tr{background:#0A0F1A}
        table.dt th{padding:10px 12px;color:white;font-weight:700;text-align:left;font-size:10.5px;letter-spacing:.2px;white-space:nowrap}
        @media(min-width:640px){table.dt th{padding:13px 16px;font-size:12px}}
        table.dt th.ai-head{background:#F4500A}
        table.dt th.fk-head{background:#0ABFA4}
        table.dt tbody tr{border-bottom:1px solid #E5E7EB;transition:background .15s}
        table.dt tbody tr:nth-child(even) td{background:#F7F8FC}
        table.dt tbody tr:hover td{background:#FFF7ED}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}
        table.dt tr.hl td{background:#FFF7ED!important;border-left:3px solid #F4500A}
        table.dt tr.hl td:first-child{font-weight:700;color:#F4500A}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bg{padding:2px 8px;font-size:11.5px}}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        .by{background:#FEF9C3;color:#92400E;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}

        /* mistakes */
        .mistakes{display:flex;flex-direction:column;gap:8px;margin:16px 0 22px}
        @media(min-width:640px){.mistakes{gap:10px}}
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

        /* weekly grid */
        .weekly-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.weekly-grid{grid-template-columns:repeat(3,1fr);gap:0;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB}}
        .dark .weekly-grid{border-color:#1f2937}
        .weekly-col{background:#F7F8FC;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden}
        @media(min-width:640px){.weekly-col{border:none;border-radius:0;border-right:1px solid #E5E7EB}}
        .weekly-col:last-child{border-right:none}
        .dark .weekly-col{background:#111827;border-color:#1f2937}
        .weekly-col-head{padding:10px 14px;font-family:'Sora',sans-serif;font-size:11px;font-weight:800;color:white;letter-spacing:.3px}
        .wh-daily{background:#0ABFA4}
        .wh-weekly{background:#6366F1}
        .wh-monthly{background:#F4500A}
        .weekly-col-body{padding:12px 14px}
        .weekly-col-body li{font-size:12px;color:#475569;margin-bottom:6px;line-height:1.55;font-family:'Sora',sans-serif;list-style:none;padding-left:16px;position:relative}
        .weekly-col-body li::before{content:'✓';position:absolute;left:0;color:#2ECC71;font-weight:700;font-size:12px;line-height:1.4}
        .dark .weekly-col-body li{color:#9ca3af}

        /* metrics grid */
        .metrics-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 24px}
        @media(min-width:640px){.metrics-grid{grid-template-columns:1fr 1fr;gap:12px}}
        .metric-card{border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;display:flex;align-items:flex-start;gap:12px}
        .dark .metric-card{border-color:#1f2937;background:#111827}
        .metric-icon{width:36px;height:36px;border-radius:9px;background:#FFF7ED;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .metric-card h4{font-family:'Sora',sans-serif;font-size:13.5px;font-weight:800;color:#0A0F1A;margin-bottom:4px}
        .dark .metric-card h4{color:#f9fafb}
        .metric-card p{font-family:'Sora',sans-serif;font-size:12.5px;color:#64748B;margin:0;line-height:1.5}

        /* verdict cards */
        .verdict-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:20px 0 28px}
        @media(min-width:640px){.verdict-grid{grid-template-columns:1fr 1fr;gap:16px}}
        .verdict-card{border-radius:12px;padding:20px;border:1.5px solid #E5E7EB}
        .verdict-card.v-manual{background:#F7F8FC}
        .verdict-card.v-auto{background:#FFF7ED;border-color:#F4500A}
        .dark .verdict-card.v-manual{background:#111827;border-color:#1f2937}
        .dark .verdict-card.v-auto{background:#1c0900}
        .verdict-label{font-family:'Sora',sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#94A3B8;margin-bottom:6px}
        .verdict-label.win{color:#F4500A}
        .verdict-card h4{font-family:'Sora',sans-serif;font-size:15px;font-weight:800;color:#0A0F1A;margin-bottom:8px}
        .dark .verdict-card h4{color:#f9fafb}
        .verdict-card p{font-family:'Sora',sans-serif;font-size:13px;color:#64748B;margin:0 0 10px;line-height:1.6}
        .verdict-tag{font-family:'Sora',sans-serif;display:inline-block;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px}
        .vtag-red{background:#FEE2E2;color:#B91C1C}
        .vtag-green{background:#DCFCE7;color:#15803D}

        /* mid CTA */
        .mid-cta{background:linear-gradient(135deg,#F4500A 0%,#D03D00 100%);border-radius:10px;padding:20px 22px;margin:32px 0;display:flex;flex-direction:column;gap:16px}
        @media(min-width:640px){.mid-cta{padding:2px 28px 32px;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:40px 0;gap:16px}}
        .mid-cta h3{font-size:16px;font-weight:800;color:white;margin-bottom:5px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta h3{font-size:18px}}
        .mid-cta p{color:rgba(255,255,255,.8);font-size:12.5px;margin:0;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta p{font-size:13.5px}}

        /* FAQ */
        .faq-item{border:1px solid #E5E7EB;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;transition:border-color .2s}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#F4500A}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0A0F1A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#FFF7ED}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#FEF9C3;color:#F4500A;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        .faq-icon.open{transform:rotate(45deg);background:#F4500A;color:white}
        .faq-a{padding:0 16px 14px;font-size:13px;color:#64748B;line-height:1.75;font-family:'Lora',serif}
        @media(min-width:640px){.faq-a{padding:0 20px 16px;font-size:14px}}
        .dark .faq-a{color:#9ca3af}

        /* related */
        .related-grid{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:480px){.related-grid{grid-template-columns:1fr 1fr;gap:14px}}
        @media(min-width:768px){.related-grid{grid-template-columns:repeat(2,1fr);gap:20px}}
        .rel-card{border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;background:#fff;text-decoration:none;display:block}
        .dark .rel-card{background:#111827;border-color:#1f2937}
        .rel-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);transform:translateY(-2px)}
        .rel-thumb{width:100%;aspect-ratio:2.4/1;overflow:hidden;background:#0A0F1A;display:flex;align-items:center;justify-content:center}
        .rel-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .rel-body{padding:12px}
        @media(min-width:640px){.rel-body{padding:14px}}
        .rel-tag{font-size:10px;font-weight:700;color:#F4500A;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        .rel-title{font-size:12px;font-weight:700;color:#0A0F1A;line-height:1.4;font-family:'Sora',sans-serif}
        .dark .rel-title{color:#f9fafb}

        /* TOC links */
        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#F4500A;background:#FFF7ED;border-left-color:#F4500A}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#1c0900;color:#FB923C}

        /* stat strip */
        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E5E7EB;text-align:center;border-bottom:1px solid #E5E7EB}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}
        @media(max-width:639px){.stat-item:nth-child(2){border-right:none}.stat-item:nth-child(3){border-right:1px solid #E5E7EB}.stat-item:nth-child(4){border-right:none;border-bottom:none}.stat-item:nth-child(3){border-bottom:none}}

        /* takeaway */
        .takeaway-box{background:#0A0F1A;border-radius:10px;padding:22px 20px;margin:22px 0}
        @media(min-width:640px){.takeaway-box{padding:28px 30px;margin:28px 0}}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:white;margin:0 0 14px}
        @media(min-width:640px){.takeaway-box h3{font-size:18px;margin:0 0 16px}}
        .takeaway-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#F4500A;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        /* hero image */
        .hero-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:32px;padding:6px 10px}

        /* sidebar */
        .sidebar-cta-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:white;margin-bottom:8px;line-height:1.35}
        @media(min-width:1024px){.sidebar-cta-title{font-size:16px}}
        .sidebar-cta-body{font-size:11.5px;color:#94A3B8;margin-bottom:14px;line-height:1.6;font-family:'Sora',sans-serif}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        /* hero */
        .article-hero{max-width:1240px;margin:0 auto;padding:28px 16px 0}
        @media(min-width:640px){.article-hero{padding:36px 20px 0}}
        @media(min-width:1024px){.article-hero{padding:48px 24px 0}}

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
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">Pricing</Link>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button asChild onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
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
              <Link href="/resources/expert-blog" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </Link>
              {([ ["Solutions","Solutions"],["Use Cases","Use Cases"],["Features","Features"],["Free Tools","Free Tools"],["Compare","Compare"],["Resources","Resources"],["About","About"] ] as [string, keyof NavigationMenu][]).map(([label, key]) => (
                <div key={label}>
                  <button onClick={() => toggleMobileMenu(label)} className="flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    {label}<ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {navigationMenu[key].map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-left flex-1">{item.name}</span>
                          {item.badge && <span className="ml-auto text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg font-medium text-sm">Pricing</Link>
              <Button asChild className="w-full mt-2 bg-gradient-to-r from-orange-500 to-teal-500 text-sm py-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb" style={{ marginTop: 80 }}>
        <div className="breadcrumb-inner">
          <Link href="/" style={{ color:"#64748B", fontWeight:500, textDecoration:"none" }}>Home</Link>
          <span>›</span>
          <Link href="/resources/expert-blog" style={{ color:"#64748B", fontWeight:500, textDecoration:"none" }}>Blog</Link>
          <span>›</span>
          <Link href="/resources/expert-blog" style={{ color:"#64748B", fontWeight:500, textDecoration:"none" }}>Amazon Vine</Link>
          <span>›</span>
          <span style={{ color:"#94A3B8" }}>Amazon Vine Program India 2026</span>
        </div>
      </div>

      {/* HERO */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#FFF7ED", color:"#F4500A", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase" as const, padding:"4px 12px", borderRadius:20, marginBottom:14, border:"1px solid rgba(244,80,10,.2)", fontFamily:"'Sora',sans-serif" }}>
          ● REVIEW STRATEGY · 2026 GUIDE
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:900, lineHeight:1.16, color:"#0A0F1A", letterSpacing:"-.5px", marginBottom:14, maxWidth:820 }} className="dark:text-white">
          <span style={{ color:"#F4500A" }}>Amazon Vine Program</span> for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started
        </h1>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
          <div className="text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>👤 <strong className="text-[#0A0F1A] transition-colors">Vikrant Singh</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>🕐 May 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>📖 <strong>11 min read</strong></div>
          <span style={{ background:"#FFF7ED", color:"#F4500A", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>BOFU · D2C Strategy</span>
          <span style={{ background:"#ECFDF5", color:"#059669", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>Review Pillar</span>
        </div>

        <div className="stat-strip" style={{ marginBottom:24 }}>
          {[
            { val:"₹19,200", col:"#F4500A", lbl:"flat fee per ASIN for up to 30 Vine reviews — the full cost of Amazon Vine India in 2026" },
            { val:"<30", col:"#F4500A", lbl:"existing reviews required on your ASIN before you can enrol — enrol early or lose eligibility" },
            { val:"4-8 wks", col:"#F4500A", lbl:"from enrolment to first Vine review appearing — plan your product launch timeline accordingly" },
            { val:"FBA only", col:"#F4500A", lbl:"Vine requires FBA fulfilment and active Brand Registry — no FBM or self-ship ASINs eligible" },
          ].map(s => (
            <div className="stat-item" key={s.val}>
              <span style={{ display:"block", fontSize:"clamp(20px,4vw,26px)", fontWeight:900, color:s.col, fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{s.val}</span>
              <span style={{ display:"block", fontSize:"clamp(10px,2vw,11.5px)", color:"#64748B", marginTop:4, lineHeight:1.4, fontWeight:500, fontFamily:"'Sora',sans-serif" }}>{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* QUICK ANSWER BOX */}
        <div style={{ background:"#F7F8FC", borderLeft:"4px solid #F4500A", borderRadius:8, padding:20, marginBottom:32 }} className="dark:bg-gray-900">
          <div style={{ fontSize:11, fontWeight:700, color:"#F4500A", textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontFamily:"'Sora',sans-serif" }}>Quick Answer</div>
          <p style={{ margin:0, fontSize:15, color:"#1E293B", lineHeight:1.6, fontFamily:"'Lora',serif" }} className="dark:text-gray-300">
            Amazon Vine India charges ₹19,200 per ASIN for up to 30 verified reviews from trusted Vine Voices. You enrol through Seller Central → Advertising → Vine. Your ASIN must have under 30 reviews and be Brand Registered on FBA. Vine reviewers keep the product — reviews are honest and cannot be removed.
          </p>
        </div>

        {/* Hero image placeholder - replication asked for same UI */}
        <img
          src="/manual-vs-automated-hero.png" 
          alt="Amazon Vine Program India 2026 guide for sellers"
          style={{ width:"100%", borderRadius:16, marginBottom:10, display:"block" }}
        />
        <p className="hero-img-cap">Amazon Vine continues to be the gold standard for generating high-quality, authentic reviews for new product launches in the Indian marketplace.</p>
      </div>

      {/* KEY TAKEAWAYS SECTION */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px 40px" }} className="sm:px-5 lg:px-6">
        <div style={{ height:1, background:"#E5E7EB", width:"100%", marginBottom:32 }} className="dark:bg-gray-800" />
        
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,3vw,26px)", fontWeight:800, color:"#0A0F1A", marginBottom:24, lineHeight:1.3 }} className="dark:text-white">
          What Do Indian Sellers Need to Know About Amazon Vine Before They Spend ₹19,200?
        </h2>

        <div className="takeaway-box" style={{ background:"#0A1524", borderRadius:12, padding:"clamp(20px,5vw,32px) clamp(16px,5vw,28px)" }}>
          <h3 style={{ fontSize:18, display:"flex", alignItems:"center", gap:10, marginBottom:24, color:"white" }}>
            <span>📋</span> Key Takeaways: Amazon Vine Program for Indian Sellers
          </h3>
          {[
            "Amazon Vine India charges ₹19,200 per ASIN for up to 30 verified reviews. The fee is fixed — whether you get 3 reviews or 30, you pay the same.",
            "Eligibility requires Brand Registry, a Professional selling plan, fewer than 30 existing reviews, and active FBA inventory. FBM listings are not eligible.",
            "The financial case works for ASINs priced above ₹700 with healthy margins — especially before peak seasons like Big Billion Days and Diwali.",
            "Timing is everything. Enrol within the first 2-3 weeks of launch, before you cross 10 organic reviews. Waiting until 25 reviews means only 5 Vine reviews for ₹19,200.",
            "Vine alone does not fix a weak listing. Optimise title, images, and bullets before you enrol. Vine Voices review what they see — a poor listing produces poor reviews.",
          ].map((t, idx) => (
            <div className="takeaway-item" key={idx} style={{ marginBottom:18, alignItems:"flex-start" }}>
              <div className="takeaway-dot" style={{ background:"#F4500A", color:"white", marginTop:4, width:20, height:20, flexShrink:0 }}>✓</div>
              <div className="takeaway-text" style={{ fontSize:15, color:"#E2E8F0", lineHeight:1.6, fontFamily:"'Sora',sans-serif" }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">

        {/* SIDEBAR */}
        <aside className="toc-sidebar">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Table of Contents</h4>
          <ul className="space-y-1" style={{ listStyle:"none", padding:0, margin:0 }}>
            {TOC.map(t => (
              <li key={t.id}>
                <button className={`toc-link${activeSection === t.id ? " active" : ""}`} onClick={() => go(t.id)}>{t.label}</button>
              </li>
            ))}
          </ul>

          <div className="mt-8 p-6 rounded-2xl bg-[#0b0f1a] text-white shadow-xl">
            <h4 className="font-bold text-[17px] leading-tight mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              Analyze Vine Reviews —<br/>Free
            </h4>
            <p className="text-[#93c5fd] text-[13px] leading-relaxed mb-5">
              AI-powered review intelligence for Amazon.in & Flipkart with WhatsApp sentiment alerts.
            </p>
            <ul className="space-y-3 mb-6" style={{ listStyle:"none", padding:0, margin:0 }}>
              {[
                "Sentiment + theme clustering",
                "Competitor pain-point gaps",
                "RTO-trigger theme detection",
                "From ₹1,999/mo — or free forever"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-200">
                  <span style={{ color:"#22c55e", fontWeight:800, flexShrink:0 }}>✓</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 rounded-xl text-[14px] transition-all transform hover:scale-105 flex items-center justify-center h-auto text-decoration-none">
              Audit My Listing Free →
            </Link>
          </div>
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

            {/* S1: What Is & How It Works */}
            <h2 id="what-is-vine">What Is the Amazon Vine Program and How Does It Work in India?</h2>
            <p>
              The <strong>amazon vine program india</strong> is an invitation-only programme where Amazon's most trusted reviewers — Vine Voices — receive free products and write honest, verified reviews. Amazon India launched it for brand-registered sellers in 2023. It is the only legitimate pre-launch review channel available to Indian sellers today.
            </p>

            <div className="box box-teal" style={{ background:"#F0FDFA", borderLeft:"4px solid #0ABFA4", borderRadius:8, padding:20, margin:"24px 0" }} className="dark:bg-teal-900/20">
              <div style={{ fontSize:11, fontWeight:700, color:"#0D9488", textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                💡 THE CORE PROBLEM VINE SOLVES
              </div>
              <p style={{ margin:0, fontSize:15, color:"#1E293B", lineHeight:1.6, fontFamily:"'Lora',serif" }} className="dark:text-gray-300">
                Without reviews, your listing doesn't rank — without ranking you don't get buyers, and without buyers you don't get reviews. Vine breaks this deadlock with up to 30 verified reviews before your organic velocity even starts.
              </p>
            </div>

            <p>
              After enrolment, Amazon makes your units available to Vine Voices in your category. They claim, receive, and review the product — positive, negative, or mixed — entirely at their discretion.
            </p>
            <p>
              Reviews appear tagged "Vine Customer Review of Free Product" and carry the same algorithmic weight as any verified purchase review. You cannot influence, dispute, or remove them.
            </p>
            <p>
              Indian buyers review far less frequently than US buyers — even after 100 sales, you may have under 5 reviews. Launching into Big Billion Days or Great Indian Festival without social proof means competing against listings with 50-500 reviews. Vine is the only tool that bridges that gap before you go live.
            </p>

            {/* S2: Cost Breakdown */}
            <h2 id="vine-cost">Is ₹19,200 Worth It? Breaking Down the Amazon Vine India Cost</h2>
            <p>
              The fee is <strong>₹19,200 per ASIN</strong> — fixed, regardless of how many Vine reviews you receive, up to a maximum of 30. It charges to your seller account at submission.
            </p>

            {/* S3: Vine Math Table */}
            <h2 id="full-compare">When Does the Vine Math Work for Indian Sellers?</h2>
            
            <div className="tbl-wrap" style={{ marginBottom:32 }}>
              <table className="dt">
                <thead style={{ background:"#0A1524", color:"white" }}>
                  <tr>
                    <th style={{ color:"white" }}>Scenario</th>
                    <th style={{ color:"white" }}>Product Price</th>
                    <th style={{ color:"white" }}>Units to Vine</th>
                    <th style={{ color:"white" }}>Total Vine Cost</th>
                    <th style={{ color:"white" }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Budget FMCG / sub-₹400</td>
                    <td>₹299–₹399</td>
                    <td>30</td>
                    <td>₹19,200 + ₹9,000 COGS</td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>Rarely worth it</span></td>
                  </tr>
                  <tr>
                    <td>Mid-range D2C (₹600–₹1,200)</td>
                    <td>₹799</td>
                    <td>20</td>
                    <td>₹19,200 + ₹6,000 COGS</td>
                    <td><span style={{ background:"#FEF3C7", color:"#92400E", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>Situational</span></td>
                  </tr>
                  <tr style={{ background:"#FFF7ED", borderLeft:"4px solid #F4500A" }}>
                    <td style={{ fontWeight:700, color:"#F4500A" }}>Branded product (₹1,200+)</td>
                    <td>₹1,499</td>
                    <td>30</td>
                    <td>₹19,200 + ₹9,000 COGS</td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>Strong ROI</span></td>
                  </tr>
                  <tr style={{ background:"#FFF7ED", borderLeft:"4px solid #F4500A" }}>
                    <td style={{ fontWeight:700, color:"#F4500A" }}>Pre-BBD / festive launch</td>
                    <td>Any ₹700+</td>
                    <td>30</td>
                    <td>₹19,200 + COGS</td>
                    <td><span style={{ background:"#ECFDF5", color:"#065F46", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>High priority</span></td>
                  </tr>
                  <tr>
                    <td>Already at 25 organic reviews</td>
                    <td>Any</td>
                    <td>5 max</td>
                    <td>₹19,200 for 5 reviews max</td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>Do not enrol</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="box box-amber" style={{ background:"#FFFBEB", borderLeft:"4px solid #D97706", borderRadius:8, padding:24, margin:"24px 0" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#92400E", textTransform:"uppercase", letterSpacing:1, marginBottom:12, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                ⚠️ THE RULE OF 10
              </div>
              <p style={{ margin:0, fontSize:15, color:"#451A03", lineHeight:1.6, fontFamily:"'Lora',serif" }}>
                Enrol in Vine before you cross 10 organic reviews. The earlier you enrol, the more Vine reviews you can accumulate before the 30-review cap is hit. Sellers who wait until 25 organic reviews get at most 5 Vine reviews for the full ₹19,200 fee — an expensive miscalculation.
              </p>
            </div>

            {/* S4: How to Enrol */}
            <h2 id="how-to-enrol">How Do You Enrol in Amazon Vine India? Step-by-Step Walkthrough</h2>
            <p>Check eligibility first — missing any single requirement disqualifies the ASIN immediately.</p>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16, margin:"24px 0" }}>
              {[
                { t:"Brand Registry active", d:"Must be registered on Amazon India's Brand Registry", icon:"✓" },
                { t:"Existing reviews", d:"ASIN must have under 30 reviews at enrolment", icon:"<30" },
                { t:"FBA fulfilment only", d:"Active FBA stock required — FBM not eligible", icon:"FBA" },
                { t:"Professional plan", d:"Individual sellers cannot access Vine", icon:"Pro" },
              ].map((item, idx) => (
                <div key={idx} style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:12, padding:24 }} className="dark:bg-gray-800/50 dark:border-gray-700">
                  <div style={{ fontSize:28, fontWeight:900, color:"#F4500A", marginBottom:12, fontFamily:"'Sora',sans-serif" }}>{item.icon}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#0A0F1A", marginBottom:6, fontFamily:"'Sora',sans-serif" }} className="dark:text-white">{item.t}</div>
                  <div style={{ fontSize:14, color:"#64748B", lineHeight:1.5 }}>{item.d}</div>
                </div>
              ))}
            </div>

            <div className="steps" style={{ margin:"32px 0" }}>
              {[
                { n:1, t:"Go to Advertising > Vine in Seller Central", d:"Log into sellercentral.amazon.in. Click Advertising in the top nav, select Vine. You land on the Vine ASIN management dashboard." },
                { n:2, t:"Search for and Select Your ASIN", d:"Enter the ASIN. If eligible, it appears with listing details. If ineligible, Amazon shows the exact reason — typically review count above 30, missing Brand Registry, or no FBA stock." },
                { n:3, t:"Set the Number of Units — Always Choose 30", d:"The ₹19,200 fee is fixed regardless of units enrolled. Always enrol 30. Every unit below 30 raises your cost per review without reducing the fee." },
                { n:4, t:"Confirm the ₹19,200 Fee and Submit", d:"Amazon shows the fee before you confirm. Check listing quality one final time — this is non-refundable. Vine Voices start claiming within 24-72 hours of submission." },
                { n:5, t:"Monitor the Vine Dashboard Weekly", d:"Reviews typically appear 2-6 weeks after a Vine Voice claims the unit. Track keyword rankings in Insydz alongside review count to measure actual search impact." },
              ].map(s => (
                <div className="step" key={s.n} style={{ border:"1px solid #E2E8F0", borderRadius:12, padding:24, marginBottom:16, background:"white", display:"flex", gap:16, alignItems:"flex-start" }} className="dark:bg-gray-800/30 dark:border-gray-700">
                  <div style={{ background:"#F4500A", color:"white", width:32, height:32, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, flexShrink:0, marginTop:2 }}>{s.n}</div>
                  <div className="step-body" style={{ marginLeft:0 }}>
                    <h4 style={{ fontSize:17, fontWeight:800, color:"#0A0F1A", marginBottom:8, fontFamily:"'Sora',sans-serif", border:"none", padding:0 }} className="dark:text-white">{s.t}</h4>
                    <p style={{ fontSize:15, color:"#64748B", margin:0, lineHeight:1.6 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:"#0A1524", borderRadius:12, padding:"clamp(24px,5vw,32px)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, flexWrap:"wrap", marginBottom:40 }}>
              <div style={{ flex:1, minWidth:280 }}>
                <h3 style={{ color:"white", fontSize:"clamp(18px,3vw,22px)", fontWeight:800, marginBottom:12, fontFamily:"'Sora',sans-serif", border:"none", padding:0 }}>Track Your Keyword Rankings Before and After Vine</h3>
                <p style={{ color:"#94A3B8", fontSize:15, margin:0, lineHeight:1.6 }}>Vine reviews improve your rank — but only if you measure it. Insydz tracks daily keyword rank movements on Amazon India so you can see exactly what ₹19,200 bought you.</p>
              </div>
              <Link href="/login" style={{ background:"#F4500A", color:"white", padding:"12px 24px", borderRadius:8, fontWeight:700, fontSize:14, whiteSpace:"nowrap", textDecoration:"none", fontFamily:"'Sora',sans-serif" }} className="sm:w-auto w-full text-center">Track Rankings Free →</Link>
            </div>

            {/* S5: Common Mistakes */}
            <h2 id="mistakes">What Are the Most Common Mistakes Indian Sellers Make With Vine?</h2>
            <p>Vine is quick to enrol in — but ₹19,200 is easy to waste. Here are the five mistakes that cost sellers the most.</p>

            <div style={{ margin:"32px 0" }}>
              {[
                { n:1, t:"Enrolling Before Optimising the Listing", d:"Vine Voices review based on what they receive and what your listing says. If your title is generic, your images are low quality, or your bullets are vague, your Vine reviews reflect that — not your product's actual capability. Spend a week improving your listing before you spend ₹19,200 on Vine." },
                { n:2, t:"Not Enrolling Enough Units", d:"The most common mistake: enrolling 5 or 10 units to \"test\" Vine because the fee feels large. But the fee is fixed — enrolling 10 units instead of 30 gives you fewer reviews for the same ₹19,200. Always enrol 30 units. And always keep a dedicated Vine inventory buffer in FBA, separate from your live selling stock, for the full Vine window." },
                { n:3, t:"Expecting Only 5-Star Reviews", d:"Vine Voices write honest reviews. A 3-star review from a Vine Voice is not a crisis — it is authentic feedback that makes your other 5-star reviews more credible to both buyers and Amazon's ranking algorithm. If your Vine reviews average 3 stars, that is a product or listing problem, not a Vine problem." },
                { n:4, t:"Waiting Too Long to Enrol", d:"Sellers often wait for a product to \"gain some traction\" before using Vine — then realise they already have 26 organic reviews and can only get 4 Vine reviews for the full fee. Enrol within the first 2 to 3 weeks of launch, ideally before you reach 10 organic reviews." },
                { n:5, t:"Not Measuring Rank Impact Post-Vine", d:"Most sellers enrol, see reviews arrive, and hope something improved. Track your keyword rankings before enrolment and then weekly for 8 weeks after your first Vine review appears. If you are using Insydz, you can see exactly which keywords your ASIN climbed on as your review count crossed 5, 10, and 25 reviews." },
              ].map(s => (
                <div key={s.n} style={{ border:"1px solid #E2E8F0", borderRadius:12, marginBottom:16, background:"white", display:"flex", overflow:"hidden" }} className="dark:bg-gray-800/30 dark:border-gray-700">
                  <div style={{ background:"#0A1524", color:"white", width:50, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:20, flexShrink:0 }}>{s.n}</div>
                  <div style={{ padding:24, flex:1 }}>
                    <h4 style={{ fontSize:17, fontWeight:800, color:"#0A0F1A", marginBottom:8, fontFamily:"'Sora',sans-serif", border:"none", padding:0 }} className="dark:text-white">{s.t}</h4>
                    <p style={{ fontSize:14, color:"#64748B", margin:0, lineHeight:1.6 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* S6: Comparison Table */}
            <h2 id="compare">How Does Amazon Vine Compare to Other Review Options Available in India?</h2>
            
            <div className="tbl-wrap" style={{ marginBottom:32 }}>
              <table className="dt">
                <thead style={{ background:"#0A1524", color:"white" }}>
                  <tr>
                    <th style={{ color:"white" }}>Feature</th>
                    <th style={{ color:"white" }}>Amazon Vine India</th>
                    <th style={{ color:"white" }}>Early Reviewer (Discontinued)</th>
                    <th style={{ color:"white" }}>Vine (US / Amazon.com)</th>
                    <th style={{ color:"white" }}>Organic Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cost</td>
                    <td>₹19,200 per ASIN</td>
                    <td>Discontinued</td>
                    <td>$200 per ASIN (~₹16,700)</td>
                    <td>Free</td>
                  </tr>
                  <tr>
                    <td>Max Reviews</td>
                    <td>30</td>
                    <td>5</td>
                    <td>30</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr style={{ background:"#FFF7ED", borderLeft:"4px solid #F4500A" }}>
                    <td style={{ fontWeight:700, color:"#F4500A" }}>Review Quality</td>
                    <td>Top Vine Voices</td>
                    <td>Regular buyers</td>
                    <td>Top Vine Voices</td>
                    <td>All buyer levels</td>
                  </tr>
                  <tr>
                    <td>Verified Tag</td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>✓ Verified</span></td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>✓ Verified</span></td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>✓ Verified</span></td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>✓ Verified</span></td>
                  </tr>
                  <tr>
                    <td>Brand Registry Required</td>
                    <td><span style={{ background:"#FEF3C7", color:"#92400E", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>Yes</span></td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>No</span></td>
                    <td><span style={{ background:"#FEF3C7", color:"#92400E", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>Yes</span></td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>No</span></td>
                  </tr>
                  <tr>
                    <td>Available in India</td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>✓ Yes</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>Discontinued</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>US only</span></td>
                    <td><span style={{ background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>✓ Yes</span></td>
                  </tr>
                  <tr>
                    <td>Speed to First Review</td>
                    <td>4–8 weeks</td>
                    <td>N/A</td>
                    <td>4–8 weeks</td>
                    <td>Unpredictable</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 id="real-cost">After Vine: Tracking Rank Impact — Insydz vs Helium 10 vs Jungle Scout</h2>
            <p>
              Vine gets you reviews. But knowing whether those reviews actually moved your keyword rankings requires a tracking tool. Here is how the main options compare for Indian sellers measuring post-Vine rank impact.
            </p>

            <div className="tbl-wrap" style={{ margin:"24px 0 48px" }}>
              <table className="dt">
                <thead style={{ background:"#0A1524", color:"white" }}>
                  <tr>
                    <th style={{ color:"white" }}>Capability</th>
                    <th style={{ background:"#FFF7ED", color:"#F4500A", borderLeft:"2px solid #F4500A", borderRight:"2px solid #F4500A" }}>Insydz</th>
                    <th style={{ color:"white" }}>Helium 10</th>
                    <th style={{ color:"white" }}>Jungle Scout</th>
                    <th style={{ color:"white" }}>Viral Launch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight:600 }}>Amazon India Rank Tracking</td>
                    <td style={{ background:"#FFF7ED", borderLeft:"2px solid #F4500A", borderRight:"2px solid #F4500A" }}><span style={{ background:"#DCFCE7", color:"#166534", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>✓ Native</span></td>
                    <td><span style={{ background:"#FEF3C7", color:"#92400E", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>Limited</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>US-focused</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>US-focused</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight:600 }}>Flipkart Tracking</td>
                    <td style={{ background:"#FFF7ED", borderLeft:"2px solid #F4500A", borderRight:"2px solid #F4500A" }}><span style={{ background:"#DCFCE7", color:"#166534", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>✓ Yes</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>No</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>No</span></td>
                    <td><span style={{ background:"#FEE2E2", color:"#991B1B", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>No</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight:600 }}>Review Count vs Rank Correlation</td>
                    <td style={{ background:"#FFF7ED", borderLeft:"2px solid #F4500A", borderRight:"2px solid #F4500A" }}><span style={{ background:"#DCFCE7", color:"#166534", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>✓ Dashboard view</span></td>
                    <td><span style={{ color:"#991B1B", fontWeight:700, fontSize:13 }}>Manual</span></td>
                    <td><span style={{ color:"#991B1B", fontWeight:700, fontSize:13 }}>Manual</span></td>
                    <td><span style={{ color:"#991B1B", fontWeight:700, fontSize:13 }}>Manual</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight:600 }}>Pricing for Indian Sellers</td>
                    <td style={{ background:"#FFF7ED", borderLeft:"2px solid #F4500A", borderRight:"2px solid #F4500A" }}><span style={{ background:"#DCFCE7", color:"#166534", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>₹0–₹4,999/mo</span></td>
                    <td><span style={{ color:"#991B1B", fontWeight:700, fontSize:13 }}>₹7,000+/mo</span></td>
                    <td><span style={{ color:"#991B1B", fontWeight:700, fontSize:13 }}>₹5,500+/mo</span></td>
                    <td><span style={{ color:"#991B1B", fontWeight:700, fontSize:13 }}>₹5,000+/mo</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight:600 }}>India-First Support</td>
                    <td style={{ background:"#FFF7ED", borderLeft:"2px solid #F4500A", borderRight:"2px solid #F4500A" }}><span style={{ background:"#DCFCE7", color:"#166534", padding:"4px 10px", borderRadius:12, fontSize:12, fontWeight:700 }}>✓ WhatsApp + Hindi</span></td>
                    <td><span style={{ color:"#64748B", fontSize:13 }}>Email only</span></td>
                    <td><span style={{ color:"#64748B", fontSize:13 }}>Email only</span></td>
                    <td><span style={{ color:"#64748B", fontSize:13 }}>Email only</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>The Before / Action / After</h3>
            
            <div style={{ display:"flex", flexDirection:"column", gap:16, margin:"24px 0 48px" }}>
              <div style={{ background:"#F0FDF4", borderLeft:"4px solid #22C55E", borderRadius:8, padding:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#166534", textTransform:"uppercase", letterSpacing:1, marginBottom:12, fontFamily:"'Sora',sans-serif" }}>BEFORE VINE</div>
                <p style={{ margin:0, fontSize:15, color:"#064E3B", lineHeight:1.6, fontFamily:"'Lora',serif" }}>
                  A D2C kitchenware brand from Jaipur launched a stainless steel tiffin box on Amazon India. After three weeks and 80 sales, they had 4 organic reviews and were ranking #34 for "steel tiffin box". Organic review velocity was too slow with Big Billion Days eight weeks away.
                </p>
              </div>

              <div style={{ background:"#FFFBEB", borderLeft:"4px solid #F59E0B", borderRadius:8, padding:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#92400E", textTransform:"uppercase", letterSpacing:1, marginBottom:12, fontFamily:"'Sora',sans-serif" }}>ACTION TAKEN</div>
                <p style={{ margin:0, fontSize:15, color:"#451A03", lineHeight:1.6, fontFamily:"'Lora',serif" }}>
                  They optimised their listing first — updated the title with "700ml large capacity" and improved their primary image. Then enrolled 20 units in Vine at ₹19,200. Reviews started appearing at week 3. Within 6 weeks, they had 18 Vine reviews averaging 4.3 stars, bringing total review count to 22.
                </p>
              </div>

              <div style={{ background:"#F0FDFA", borderLeft:"4px solid #0D9488", borderRadius:8, padding:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#0F766E", textTransform:"uppercase", letterSpacing:1, marginBottom:12, fontFamily:"'Sora',sans-serif" }}>AFTER VINE</div>
                <p style={{ margin:0, fontSize:15, color:"#042F2E", lineHeight:1.6, fontFamily:"'Lora',serif" }}>
                  Keyword rank for "steel tiffin box" moved from #34 to #11. Conversion rate improved from 4.2% to 7.8% as social proof built. They entered Big Billion Days at position #8 with 31 reviews, generating ₹2.4L that week — a 9.5x return on the total ₹25,200 Vine investment from that single BBD week alone.
                </p>
              </div>
            </div>

            {/* S12: FAQ */}
            <h2 id="faq">Frequently Asked Questions: Amazon Vine Program India</h2>
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

            {/* S13: Post-Review Strategy */}
            <h2 id="after-vine">What Should You Do After Your Vine Reviews Come In?</h2>
            <p>
              Vine gets you to your first 10 to 30 reviews. What you do in the 8 weeks after determines whether that investment compounds or plateaus.
            </p>

            <ul style={{ listStyle:"none", padding:0, margin:"24px 0" }}>
              <li style={{ marginBottom:20, display:"flex", gap:12 }}>
                <span style={{ color:"#F4500A", fontSize:18 }}>•</span>
                <p style={{ margin:0, fontSize:15, lineHeight:1.6 }}><strong style={{ color:"#0A0F1A" }} className="dark:text-white">Read every Vine review as a free product audit.</strong> Vine Voices are detail-oriented. A mention of "charging cable too rigid" or "sizing chart inaccurate" is a supplier brief — act on it within two weeks.</p>
              </li>
              <li style={{ marginBottom:20, display:"flex", gap:12 }}>
                <span style={{ color:"#F4500A", fontSize:18 }}>•</span>
                <p style={{ margin:0, fontSize:15, lineHeight:1.6 }}><strong style={{ color:"#0A0F1A" }} className="dark:text-white">Update your listing with Vine review vocabulary.</strong> The exact phrases Vine Voices use in 5-star reviews are the words your next buyer searches for. Mirror them in your title, bullets, and A+ content immediately.</p>
              </li>
              <li style={{ marginBottom:20, display:"flex", gap:12 }}>
                <span style={{ color:"#F4500A", fontSize:18 }}>•</span>
                <p style={{ margin:0, fontSize:15, lineHeight:1.6 }}><strong style={{ color:"#0A0F1A" }} className="dark:text-white">Track keyword rank weekly for 8 weeks.</strong> Review count triggers rank changes at non-linear thresholds — going from 0 to 10 reviews typically moves rank more than 10 to 30. Insydz tracks this daily so you can see your exact inflection points.</p>
              </li>
            </ul>

            <div style={{ background:"#EFF6FF", border:"1px solid #DBEAFE", borderRadius:12, padding:32, margin:"40px 0" }} className="dark:bg-blue-900/20 dark:border-blue-800">
              <div style={{ fontSize:12, fontWeight:800, color:"#3B82F6", textTransform:"uppercase", letterSpacing:1, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                📌 INTERNAL LINKS FOR FURTHER READING
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { t:"How to Track Amazon India Keyword Rankings in 2026", l:"/resources/expert-blog/amazon-india-keyword-tracking-guide" },
                  { t:"Amazon SEO for Indian Sellers: Title, Bullets and Backend Keywords", l:"/resources/expert-blog/amazon-seo-tool-india" },
                  { t:"AI Review Intelligence Tool for Amazon and Flipkart: Complete Guide", l:"/resources/expert-blog/amazon-review-analysis-guide-india" },
                  { t:"Big Billion Days Prep Checklist for Indian D2C Brands", l:"/resources/expert-blog/big-billion-days-prep-checklist" },
                  { t:"Flipkart vs Amazon India: Where to Launch First in 2026", l:"/resources/expert-blog/flipkart-vs-amazon-india-launch-guide" },
                ].map((link, idx) => (
                  <Link key={idx} href={link.l} style={{ fontSize:15, fontWeight:600, color:"#F4500A", textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
                    • {link.t} →
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Guides */}
            <div style={{ marginTop:48, paddingTop:28, borderTop:"2px solid #E5E7EB" }}>
              <h2 style={{ fontSize:"clamp(16px,3vw,20px)", fontWeight:800, color:"#0A0F1A", margin:"0 0 18px", border:"none", padding:0, fontFamily:"'Sora',sans-serif" }} className="dark:text-white">More on Amazon India Launch Strategy</h2>
              <div className="related-grid" style={{ marginBottom: 60 }}>
                <Link href="/resources/expert-blog/amazon-review-analysis-guide-india" className="rel-card">
                  <div className="rel-thumb">
                    <img src="/amazon-review-analysis-hero.png" alt="AI Review Analysis Tool" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">REVIEW INTELLIGENCE</div>
                    <div className="rel-title">AI Review Analysis Tool for Amazon India & Flipkart: Complete Guide (2026)</div>
                  </div>
                </Link>
                <Link href="/resources/expert-blog/how-to-rank-page-1-amazon-india" className="rel-card">
                  <div className="rel-thumb">
                    <img src="/twenty three.png" alt="Amazon Keyword Ranking" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">SEO STRATEGY</div>
                    <div className="rel-title">Amazon Keyword Ranking in India: How to Track and Improve Position in 2026</div>
                  </div>
                </Link>
                <Link href="/resources/expert-blog/flipkart-keyword-research-tool" className="rel-card">
                  <div className="rel-thumb">
                    <img src="/01_hero_banner.png" alt="Big Billion Days Prep" />
                  </div>
                  <div className="rel-body">
                    <div className="rel-tag">LAUNCH STRATEGY</div>
                    <div className="rel-title">Big Billion Days Prep for D2C Brands: 8-Week Launch Checklist</div>
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
          Stop Guessing What Your ₹19,200 Bought You
        </h2>
        <p className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Lora', serif", maxWidth: 640, margin: "0 auto 24px" }}>
          Vine reviews improve your keyword rankings — but only if you can see the movement. Insydz tracks daily rank changes on Amazon India so you know exactly which review count milestones moved your position.
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", marginBottom: 20 }}>
          {["Amazon India keyword rank tracking", "Review count vs rank correlation", "Competitor rank monitoring", "Free plan — no credit card"].map(t => (
            <div key={t} className="text-blue-100" style={{ fontSize:"clamp(11px,2vw,13.5px)", display:"flex", alignItems:"center", gap:6, fontFamily:"'Sora',sans-serif" }}>
              <span className="text-white" style={{ fontWeight: 800 }}>✓</span> {t}
            </div>
          ))}
        </div>
        <Link href="/login"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105 inline-block text-decoration-none"
        >
          Track Rankings Free on Insydz →
        </Link>
        <p className="text-blue-200 text-xs mt-4">
          5,000+ Indian sellers trust Insydz · 2.5 Lakh+ reviews analysed · 24/7 live market data
        </p>
      </div>
      
    </div>
  );
}
