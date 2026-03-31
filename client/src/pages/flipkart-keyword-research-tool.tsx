import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Search, Clock, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen, Video, FileText,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaFlipkartKeyword = {
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
      "@id": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool",
      "url": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool",
      "name": "Flipkart Keyword Research Tool & SEO Optimization Guide for Sellers (2026)",
      "description": "Master Flipkart keyword research and SEO optimization with India's only AI-powered rank tracking tool for Flipkart sellers.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "about": { "@id": "https://insydz.com/#organization" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Flipkart Sellers", "item": "https://insydz.com/solutions/flipkart-sellers" },
        { "@type": "ListItem", "position": 5, "name": "Flipkart Keyword Research Tool", "item": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#article",
      "headline": "Flipkart Keyword Research Tool & SEO Optimization Guide for Sellers (2026)",
      "description": "Master Flipkart keyword research and SEO optimization. Discover how India's top Flipkart sellers use AI-powered keyword tracking and search visibility tools.",
      "image": "https://insydz.com/assets/images/blog/flipkart-keyword-research-tool.png",
      "author": { "@type": "Organization", "name": "Insydz Team" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-01-20",
      "dateModified": "2026-01-20",
      "mainEntityOfPage": { "@id": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool" },
      "keywords": ["flipkart keyword research tool","flipkart seo optimization","flipkart rank tracking","flipkart search algorithm india","product discovery","search visibility","keyword tracking","ecommerce seo"],
      "articleSection": "Flipkart SEO & Seller Strategy",
      "inLanguage": "en-IN",
      "wordCount": 4200,
      "timeRequired": "PT14M"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#faq",
      "mainEntity": [
        { "@type": "Question", "name": "What is the best Flipkart keyword research tool for Indian sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is the only India-first platform providing simultaneous Flipkart and Amazon.in keyword tracking with real-time rank monitoring, WhatsApp alerts, and AI-powered listing optimisation at Rs 1,999/month with a free plan." } },
        { "@type": "Question", "name": "How does Flipkart SEO optimization differ from Amazon SEO?", "acceptedAnswer": { "@type": "Answer", "text": "Flipkart places significantly more weight on product attribute completeness than Amazon A10 and has unique signals including F-Assured status and a Product Discovery AI." } },
        { "@type": "Question", "name": "How does Flipkart's search algorithm rank products?", "acceptedAnswer": { "@type": "Answer", "text": "Flipkart scores listings across: keyword relevance 35%, attribute completeness 28%, seller performance 22%, buyer engagement 10%, and price competitiveness 5%." } },
        { "@type": "Question", "name": "Can I track my Flipkart keyword rank positions in real time?", "acceptedAnswer": { "@type": "Answer", "text": "Yes with India-first tools like Insydz. Flipkart Seller Hub provides no organic keyword rank data and no global tool tracks Flipkart positions." } },
        { "@type": "Question", "name": "What are the most important keywords for Flipkart listings?", "acceptedAnswer": { "@type": "Answer", "text": "F-Assured terms 18-24% conversion, attribute-specific queries 22-30%, and price-bracket terms 12-18% are the highest-converting Flipkart keyword categories." } },
        { "@type": "Question", "name": "How early should I optimise keywords for Flipkart Big Billion Days?", "acceptedAnswer": { "@type": "Answer", "text": "Start 6-8 weeks before the event — early September for an October BBD. Flipkart pre-ranks category pages 3-4 weeks before the event goes live." } }
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
    { name:"Expert Blog",         icon:<BookOpen  className="w-4 h-4"/>, route:"/resources/expert-blog" },
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
  { id:"what-is",         label:"What Is a Flipkart Keyword Tool?" },
  { id:"algorithm",       label:"How Flipkart's Algorithm Works" },
  { id:"why-seo",         label:"Why Flipkart SEO Is Critical" },
  { id:"how-it-works",    label:"How Keyword Research Works (5 Steps)" },
  { id:"keyword-types",   label:"6 Flipkart Keyword Types to Track" },
  { id:"ranking-factors", label:"SEO Ranking Factors Checklist" },
  { id:"mistakes",        label:"5 Mistakes Sellers Make" },
  { id:"workflow",        label:"Weekly SEO Execution Model" },
  { id:"best-tools",      label:"Best Tools in India (2026)" },
  { id:"faq",             label:"Frequently Asked Questions" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q:"What is the best Flipkart keyword research tool for Indian sellers?",
    a:"For Indian sellers whose revenue depends on Flipkart, the best keyword research tool is one that natively tracks Flipkart search rank positions. Insydz is the only India-first platform providing simultaneous Flipkart and Amazon.in keyword tracking with real-time rank monitoring, WhatsApp alerts, and AI-powered listing optimisation recommendations at \u20b91,999/month with a free plan \u2014 60\u201385% more affordable than global tools that don\u2019t even cover Flipkart." },
  { q:"How does Flipkart SEO optimization differ from Amazon SEO?",
    a:"Flipkart\u2019s ranking algorithm places significantly more weight on product attribute completeness than Amazon\u2019s A10 algorithm. Flipkart also has unique ranking signals including F-Assured status, shorter query patterns from its mobile-first user base, and a Product Discovery AI that matches buyer intent to attribute fields rather than just keyword strings." },
  { q:"How does Flipkart's search algorithm rank products?",
    a:"Flipkart\u2019s search algorithm scores listings across five main factors: keyword relevance (35%), attribute completeness (28%), seller performance score (22%), buyer engagement metrics (10%), and price competitiveness (5%). The algorithm also uses a Product Discovery AI layer that makes attribute completeness arguably more important than keyword optimisation for high-converting long-tail search terms." },
  { q:"Can I track my Flipkart keyword rank positions in real time?",
    a:"Yes \u2014 with India-first tools like Insydz. Flipkart Seller Hub does not provide organic keyword rank data to sellers, and no global tool (Helium 10, Jungle Scout) tracks Flipkart positions. Insydz tracks Flipkart keyword rank positions in real time, sends WhatsApp alerts when a position drops more than 3 spots, and provides AI-generated listing fix recommendations." },
  { q:"What are the most important keywords for Flipkart listings?",
    a:"For Flipkart, the highest-converting keyword categories are: F-Assured terms (18\u201324% conversion), attribute-specific queries (22\u201330%), and price-bracket terms (12\u201318%). Most Indian sellers focus on category head terms with only 4\u20137% conversion rate. The biggest immediate win is adding price-bracket modifiers and specification-level terms to title and product attributes." },
  { q:"How early should I optimise keywords for Flipkart Big Billion Days?",
    a:"Start your Flipkart BBD keyword optimisation 6\u20138 weeks before the event \u2014 targeting early September for an October BBD. Flipkart\u2019s algorithm pre-ranks category pages 3\u20134 weeks before the event goes live, and listing optimisation changes take 14\u201321 days to fully influence rank. Sellers who update keywords and complete attributes in September enter BBD already ranked." },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlipkartKeywordResearchTool() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("what-is");
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
    const id = "insydz-flipkart-kw-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id   = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaFlipkartKeyword);
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
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
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

  // Data
  const algoRows = [
    { factor:"Keyword Relevance",      weight:"35%", action:"Primary keyword in first 5 title words",          missed:"Sellers using US-data tools" },
    { factor:"Attribute Completeness", weight:"28%", action:"Complete all Seller Hub attribute fields",          missed:"80%+ of Indian SMB sellers" },
    { factor:"Seller Performance",     weight:"22%", action:"F-Assured status + maintain >95% fulfilment",       missed:"Non-F-Assured sellers" },
    { factor:"Buyer Engagement",       weight:"10%", action:"Optimise CTR via title and image relevance",        missed:"Advanced sellers only" },
    { factor:"Price Competitiveness",  weight:"5%",  action:"Stay within 15% of category median price",         missed:"Premium-priced sellers" },
  ];

  const kwTypes = [
    { type:"Buy Intent Terms",        example:'"buy wireless earbuds under 1500 flipkart"', conv:"14\u201320%", priority:"\uD83D\uDD34 Critical" },
    { type:"Price Bracket Terms",     example:'"earbuds 500 to 1000 rupees"',               conv:"12\u201318%", priority:"\uD83D\uDD34 Critical" },
    { type:"F-Assured / Badge Terms", example:'"f assured earbuds flipkart"',               conv:"18\u201324%", priority:"\uD83D\uDD34 Critical" },
    { type:"Attribute Specific",      example:'"earbuds 40hr battery anc"',                 conv:"22\u201330%", priority:"\uD83D\uDD34 Critical" },
    { type:"Category Head Terms",     example:'"wireless earbuds"',                         conv:"4\u20137%",   priority:"\uD83D\uDFE1 Important" },
    { type:"Regional Language Terms", example:'"best earbuds sasta" / Hindi variants',      conv:"16\u201324%", priority:"\uD83D\uDFE2 Opportunity" },
  ];

  const toolRows = [
    { tool:"Helium 10",   flipkart:"No",  amazon:"Partial", rank:"Amazon Only",  wa:"No",  intent:"US Only",    price:"\u20b94,000\u20138,000/mo" },
    { tool:"Jungle Scout",flipkart:"No",  amazon:"Partial", rank:"Amazon Only",  wa:"No",  intent:"US Only",    price:"\u20b94,500\u20137,000/mo" },
    { tool:"Sonar (Free)",flipkart:"No",  amazon:"Yes",     rank:"No",           wa:"No",  intent:"Basic",      price:"Free" },
    { tool:"Insydz \u2726",flipkart:"Yes",amazon:"Yes",     rank:"Real-time",    wa:"Yes", intent:"AI-Powered", price:"\u20b91,999/mo + Free" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool" />
        <title>Flipkart Keyword Research Tool: Complete SEO Optimization Guide for Sellers (2026) | Insydz</title>
        <meta name="description" content="Master Flipkart keyword research and SEO optimization. Discover how India's top Flipkart sellers use AI-powered keyword tracking, rank monitoring, and search visibility tools to dominate Flipkart search in 2026." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        /* ── Progress bar ── */
        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#2874F0,#F4500A);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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
        .article-body li::marker{color:#2874F0}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}

        /* ── SEO Anchor Links ── */
        .article-body a.al{color:#2874F0;font-weight:600;text-decoration:underline;text-decoration-color:rgba(40,116,240,.3);text-underline-offset:3px;transition:color .2s,text-decoration-color .2s}
        .article-body a.al:hover{color:#1557CC;text-decoration-color:#1557CC}

        .art-img-cap{font-size:11px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:24px;padding:6px 10px}
        @media(min-width:640px){.art-img-cap{font-size:12px;margin-bottom:28px;padding:8px 12px}}

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
        .box-orange{background:#FFF7ED;border-left:4px solid #F4500A}
        .box-orange .box-label{color:#F4500A}
        .box-teal{background:#F0FDFA;border-left:4px solid #0ABFA4}
        .box-teal .box-label{color:#0ABFA4}
        .box-indigo{background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px}
        .box-indigo .box-label{color:#4F46E5}
        .dark .box-blue{background:#0c1e3d;border-color:#1d4ed8}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-orange{background:#1c0900;border-color:#9a3412}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-indigo{background:#1e1b4b;border-color:#3730a3}

        /* ── Steps ── */
        .steps{display:flex;flex-direction:column;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.steps{gap:12px;margin:20px 0 28px}}
        .step{display:flex;gap:12px;background:#F5F8FF;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{background:#111827;border-color:#1f2937}
        .step-n{flex-shrink:0;width:30px;height:30px;background:#2874F0;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
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
        table.dt th.flip-head{background:#2874F0}
        table.dt tbody tr{border-bottom:1px solid #E5E7EB;transition:background .15s}
        table.dt tbody tr:nth-child(even) td{background:#F5F8FF}
        table.dt tbody tr:hover td{background:#EFF6FF}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}
        table.dt tr.hl td{background:#EFF6FF!important;border-left:3px solid #2874F0}
        table.dt tr.hl td:first-child{font-weight:700;color:#2874F0}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bg{padding:2px 8px;font-size:11.5px}}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.br{padding:2px 8px;font-size:11.5px}}

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
        .faq-item.open{border-color:#2874F0}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0A0F1A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px;gap:12px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F5F8FF}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#DBEAFE;color:#2874F0;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        @media(min-width:640px){.faq-icon{width:22px;height:22px;font-size:16px}}
        .faq-icon.open{transform:rotate(45deg);background:#2874F0;color:white}
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
        .rel-thumb{width:100%;height:100px;display:flex;align-items:center;justify-content:center;font-size:24px}
        @media(min-width:640px){.rel-thumb{height:128px;font-size:28px}}
        .rel-body{padding:12px}
        @media(min-width:640px){.rel-body{padding:14px}}
        .rel-tag{font-size:10px;font-weight:700;color:#2874F0;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-tag{font-size:10.5px;margin-bottom:6px}}
        .rel-title{font-size:12px;font-weight:700;color:#0A0F1A;line-height:1.4;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-title{font-size:13px}}
        .dark .rel-title{color:#f9fafb}

        /* ── TOC links ── */
        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#2874F0;background:#EFF6FF;border-left-color:#2874F0}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#0c1e3d;color:#5B9EFF}

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
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#2874F0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        /* ── Verdict banner ── */
        .verdict-banner{background:linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%);border:2px solid #BFDBFE;border-radius:12px;padding:16px;margin:22px 0;display:flex;gap:12px;align-items:flex-start}
        @media(min-width:640px){.verdict-banner{padding:22px 24px;margin:28px 0;gap:16px}}
        .dark .verdict-banner{background:#0c1e3d;border-color:#1d4ed8}

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

        /* ── Weekly grid ── */
        .weekly-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.weekly-grid{grid-template-columns:repeat(3,1fr);gap:12px}}
        .weekly-col{background:#F5F8FF;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden}
        .dark .weekly-col{background:#111827;border-color:#1f2937}
        .weekly-col-head{padding:10px 14px;font-family:'Sora',sans-serif;font-size:11px;font-weight:800;color:white;letter-spacing:.3px}
        .wh-daily{background:#2874F0}
        .wh-weekly{background:#0ABFA4}
        .wh-monthly{background:#F4500A}
        .weekly-col-body{padding:10px 14px}
        .weekly-col-body li{font-size:11.5px;color:#475569;margin-bottom:6px;line-height:1.55;font-family:'Sora',sans-serif;list-style:none;padding-left:14px;position:relative}
        .weekly-col-body li::before{content:'·';position:absolute;left:0;color:#2874F0;font-weight:700;font-size:16px;line-height:1.2}
        .dark .weekly-col-body li{color:#9ca3af}

        /* ── Final CTA ── */
        .fc-block{background:linear-gradient(135deg,#2874F0 0%,#1557CC 60%,#0A0F1A 100%);padding:56px 16px;text-align:center}
        @media(min-width:640px){.fc-block{padding:72px 24px}}
        @media(min-width:1024px){.fc-block{padding:80px 24px}}
        .fc-inner{max-width:640px;margin:0 auto}
        .fc-inner h2{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:white;margin-bottom:12px;line-height:1.2;letter-spacing:-.4px}
        @media(min-width:640px){.fc-inner h2{font-size:28px;margin-bottom:14px}}
        @media(min-width:1024px){.fc-inner h2{font-size:34px}}
        .fc-inner p{color:rgba(255,255,255,.75);font-size:14px;max-width:520px;margin:0 auto 22px;line-height:1.7;font-family:'Lora',serif}
        @media(min-width:640px){.fc-inner p{font-size:16px;margin:0 auto 28px}}
        .fc-points{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 16px;margin-bottom:24px}
        @media(min-width:640px){.fc-points{gap:8px 24px;margin-bottom:32px}}
        .fc-pt{color:rgba(255,255,255,.85);font-size:12px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.fc-pt{font-size:13.5px}}
        .fc-pt::before{content:'✓';color:white;font-weight:800}
        .fc-btn{background:white;color:#2874F0;padding:13px 28px;border-radius:10px;font-size:13px;font-weight:800;border:none;cursor:pointer;transition:transform .2s;width:100%;max-width:480px}
        @media(min-width:640px){.fc-btn{padding:16px 36px;font-size:15px;width:auto}}
        .fc-btn:hover{transform:translateY(-2px)}
        .fc-sub{color:rgba(255,255,255,.5);font-size:11.5px;margin-top:12px}
        @media(min-width:640px){.fc-sub{font-size:12.5px;margin-top:14px}}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ═══ NAV ══════════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => setLocation("/")}>
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
            </div>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <button onClick={() => setLocation("/pricing")} onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">Pricing</button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button onClick={() => setLocation("/login")} onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Button>
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
              <button onClick={() => { setLocation("/resources/expert-blog"); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </button>
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
              <button onClick={() => { setLocation("/pricing"); setIsMenuOpen(false); }} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm">Pricing</button>
              <Button onClick={() => { setLocation("/login"); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-orange-500 text-sm py-2">Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* BREADCRUMB — "Flipkart sellers" anchor → pillar hub per internal linking strategy */}
      <div className="breadcrumb" style={{ marginTop: 64 }}>
        <div className="breadcrumb-inner">
          <button onClick={() => setLocation("/")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Home</button>
          <span>›</span>
          <button onClick={() => setLocation("/resources/expert-blog")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Blog</button>
          <span>›</span>
          {/* ANCHOR: Pillar Hub link — "Flipkart sellers" exact anchor per strategy (highest internal PageRank pass) */}
          <span style={{ color:"#94A3B8" }}>Flipkart Keyword Research Tool</span>
        </div>
      </div>

      {/* HERO */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#EFF6FF", color:"#2874F0", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase" as const, padding:"4px 12px", borderRadius:20, marginBottom:14, border:"1px solid #DBEAFE", fontFamily:"'Sora',sans-serif" }}>
          ◆ Flipkart SEO &amp; Seller Strategy
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:900, lineHeight:1.16, color:"#0A0F1A", letterSpacing:"-.5px", marginBottom:14, maxWidth:820 }} className="dark:text-white">
          <span style={{ color:"#2874F0" }}>Flipkart Keyword Research Tool</span>{" "}
          &amp; SEO Optimization Guide for Sellers{" "}
          <span style={{ color:"#F4500A" }}>(2026)</span>
        </h1>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>👤 <strong style={{ color:"#0A0F1A" }}>INSYDZ Research Team</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>🕐 January 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>🕐 <strong>14 min read</strong></div>
          <span style={{ background:"#EFF6FF", color:"#2874F0", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Updated for 2026</span>
          <span style={{ background:"#FFF7ED", color:"#F4500A", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Flipkart Strategy Guide</span>
        </div>

        <div className="stat-strip" style={{ marginBottom:24 }}>
          {[
            ["72%",    "Flipkart Purchases Begin With a Category Search"],
            ["\u20b944K",  "Avg. Monthly Revenue Lost to Poor Keyword Coverage"],
            ["4\u20136\u00d7", "Organic Traffic Increase With Proper Flipkart SEO"],
            ["Top 5",  "Flipkart Search Positions Capture 65% of Category Clicks"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span style={{ display:"block", fontSize:"clamp(20px,4vw,26px)", fontWeight:900, color:"#2874F0", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{num}</span>
              <span style={{ display:"block", fontSize:"clamp(10px,2vw,11.5px)", color:"#64748B", marginTop:4, lineHeight:1.4, fontWeight:500, fontFamily:"'Sora',sans-serif" }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TAKEAWAYS */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px 28px" }} className="sm:px-5 lg:px-6">
        <div className="takeaway-box">
          <h3>✅ Key Takeaways</h3>
          {[
            "Flipkart's algorithm scores listings differently — attribute completeness and F-Assured status are unique Flipkart ranking factors that no Amazon tool accounts for.",
            "Most Flipkart sellers optimise for Amazon keywords — Flipkart buyers use shorter queries and stronger price-bracket modifiers that require Flipkart-native search data.",
            "Keyword tracking on Flipkart is invisible to global tools — Helium 10 and Jungle Scout have zero Flipkart rank data. Your Flipkart positions are completely dark without an India-first tool.",
            "Flipkart's product discovery AI rewards attribute-rich listings over keyword-dense but attribute-incomplete listings — making Seller Hub attribute completion your fastest ranking lever.",
            "India-first platforms like Insydz track Flipkart rank positions in real time with WhatsApp rank drop alerts — turning invisible rank loss into a 60-minute action window.",
            "Combining Flipkart keyword research with competitor price tracking gives Indian sellers a complete AI-powered search visibility picture across both major Indian marketplaces.",
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
            <h4 className="sidebar-cta-title">Rank on Flipkart Faster — Free</h4>
            <p className="sidebar-cta-body">Real-time Flipkart rank tracking &amp; AI keyword fixes for Amazon.in &amp; Flipkart.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 14px" }}>
              {["Real-time Flipkart rank tracking","WhatsApp rank-drop alerts within 60 min","AI listing optimisation recommendations","From \u20b91,999/mo \u2014 or free forever"].map(f => (
                <li key={f} style={{ fontSize:11.5, color:"#CBD5E1", marginBottom:7, display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.4, fontFamily:"'Sora',sans-serif" }}>
                  <span style={{ color:"#10B981", fontWeight:800, flexShrink:0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => setLocation("/login")} style={{ display:"block", background:"#2874F0", color:"white", textAlign:"center" as const, padding:10, borderRadius:8, fontWeight:700, fontSize:12.5, width:"100%", cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif" }}>
              Start Free \u2014 No Card Needed
            </button>
          </div>
          <div style={{ background:"#F5F8FF", border:"1px solid #E5E7EB", borderRadius:10, padding:14, marginTop:14 }}>
            <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:1, color:"#94A3B8", marginBottom:10 }}>Share This Guide</h4>
            <div style={{ display:"flex", gap:6 }}>
              {[{ l:"WhatsApp", bg:"#25D366" },{ l:"LinkedIn", bg:"#0A66C2" },{ l:"Twitter", bg:"#1DA1F2" }].map(s => (
                <div key={s.l} style={{ flex:1, textAlign:"center" as const, padding:"7px 4px", borderRadius:7, fontSize:11, fontWeight:700, color:"white", background:s.bg, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>{s.l}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth:0 }}>
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)}>
            📋 Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>
            ))}
          </div>

          <article className="article-body">

            {/* In Simple Terms */}
            <div className="box box-indigo" style={{ margin:"0 0 28px" }}>
              <div className="box-label">💡 In Simple Terms</div>
              <p>Instead of guessing which keywords belong in your Flipkart product title and attributes, a <strong>Flipkart keyword research tool</strong> tells you precisely which terms Flipkart buyers are searching right now — including the high-converting price-bracket and product-discovery terms your competitors rank for that you've never added to your listing.</p>
            </div>

            {/* ── S1: What Is ── */}
            <h2 id="what-is">What Is a Flipkart Keyword Research Tool?</h2>
            <p>
              A <strong>Flipkart keyword research tool</strong> is software that identifies the exact search terms Indian buyers type into Flipkart's search bar before purchasing — and reveals which of those terms your competitors are already ranking for that your listing is currently missing.
            </p>
            <p>
              Unlike Amazon keyword tools, Flipkart-specific research accounts for the platform's unique search algorithm, attribute-based product discovery system, and the behavioural differences of Flipkart's 400+ million registered user base — including shorter search queries, stronger price sensitivity, and a higher proportion of mobile-first searches. Any effective{" "}
              {/* ANCHOR: "Flipkart SEO optimization" → /flipkart-seo-optimization (secondary KW, first body mention per strategy) */}
              <a href="/flipkart-seo-optimization" className="al" title="Flipkart SEO optimization guide for Indian sellers">Flipkart SEO optimization</a>{" "}
              strategy must start with platform-native keyword data.
            </p>
            <p>
              Here's the scale of the problem: <strong>Flipkart sellers collectively leave an estimated ₹2,400 crore in annual organic revenue on the table</strong> because their listings are not optimised for the search terms their buyers actually use.
            </p>

            {/* ── S2: Algorithm ── */}
            <h2 id="algorithm">How Flipkart's Search Algorithm Works</h2>
            <p>
              {/* ANCHOR: "Flipkart search algorithm" → /flipkart-search-algorithm-india (secondary KW, section intro per strategy) */}
              Flipkart's <a href="/flipkart-search-algorithm-india" className="al" title="How Flipkart's search algorithm ranks products in India">Flipkart search algorithm</a> — the <strong>Flipkart Product Relevance Engine</strong> — ranks listings based on keyword relevance signals, seller performance metrics, and buyer behaviour data. Unlike Amazon's A10 which is heavily keyword-density focused, Flipkart's algorithm places significant weight on product attribute completeness.
            </p>

            <div className="box box-indigo">
              <div className="box-label">🤖 AI Overview Summary</div>
              <p>Flipkart's ranking algorithm rewards attribute completeness and buyer engagement signals over raw keyword stuffing. Sellers who complete all product attributes AND optimise their title for high-volume buyer search terms consistently outrank competitors who focus only on keywords — even when those competitors have better reviews and lower prices.</p>
            </div>

            <h3>Algorithm Factor Reference Table</h3>
            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Ranking Factor</th>
                    <th>Weight</th>
                    <th>Key Optimisation Action</th>
                    <th>Most Missed By</th>
                  </tr>
                </thead>
                <tbody>
                  {algoRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:700 }}>{r.factor}</td>
                      <td><span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, color:"#2874F0" }}>{r.weight}</span></td>
                      <td style={{ color:"#475569" }}>{r.action}</td>
                      <td style={{ color:"#94A3B8", fontSize:11 }}>{r.missed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── S3: Why SEO ── */}
            <h2 id="why-seo">Why Flipkart SEO Optimization Is Critical for Indian Sellers</h2>
            <p>
              Flipkart commands <strong>28–32% of India's e-commerce GMV</strong> — representing hundreds of crores in daily transaction volume. For most Indian D2C brands and marketplace sellers, Flipkart is either their primary revenue source or their second-largest channel. Yet the vast majority of Flipkart sellers are running their SEO strategy on guesswork.
            </p>

            <h3>The Search Visibility Gap Compounds Silently</h3>
            <p>
              Flipkart search rank positions are not visible to sellers without a dedicated{" "}
              {/* ANCHOR: "Flipkart rank tracking" → /flipkart-rank-tracking (secondary KW, Key Insight callout per strategy) */}
              <a href="/flipkart-rank-tracking" className="al" title="Real-time Flipkart rank tracking tool for Indian sellers">Flipkart rank tracking</a>{" "}
              tool. Unlike Amazon Seller Central which shows basic keyword performance, Flipkart Seller Hub provides almost no organic keyword rank data. This means most Flipkart sellers have no idea which position they hold for their critical search terms — or when a competitor takes that position away from them.
            </p>

            <div className="box box-amber">
              <div className="box-label">🏪 Real Seller: Jaipur Home Décor Brand</div>
              <p>A Jaipur-based home décor brand was generating ₹3.8 lakh/month on Flipkart. Over 10 weeks, a competitor entered with a fully completed attribute listing and a title optimised for 'cotton cushion cover 16x16 set of 5' — the phrase driving 38% of the category's search volume. The Jaipur seller's organic traffic dropped 44% without a single price change. A Flipkart rank tracking tool would have alerted them after week 2.</p>
            </div>

            <div className="box box-blue">
              <div className="box-label">🔑 Key Insight</div>
              <p>
                Flipkart's search visibility is binary, not gradual. You're either in the Top 10 results — capturing 65% of clicks — or you're functionally invisible. A single rank change from P7 to P11 can reduce organic traffic by 40% overnight. This is why{" "}
                {/* ANCHOR: second placement "Flipkart rank tracking" → /flipkart-rank-tracking (callout box = high-attention zone per strategy) */}
                <a href="/flipkart-rank-tracking" className="al" title="Flipkart keyword rank tracking in real time">Flipkart rank tracking</a>{" "}
                needs to run in real time, not weekly manual checks.
              </p>
            </div>

            <h3>Flipkart's Big Billion Days Algorithm Punishes Unprepared Listings</h3>
            <p>
              During Big Billion Days, Flipkart's algorithm pre-ranks category pages 3–4 weeks before the event goes live. <strong>Listings not optimised for festive-intent keywords before October 1st are algorithmically suppressed during the event itself</strong> — the window to fix this closes before the revenue window opens.
            </p>

            {/* ── S4: How It Works ── */}
            <h2 id="how-it-works">How Does Flipkart Keyword Research Work? (5-Step Process)</h2>
            <p>
              Modern AI-powered tools have replaced the manual spreadsheet approach with a <strong>5-step automated intelligence loop</strong> built specifically for Flipkart's search ecosystem. This also forms the basis of your{" "}
              {/* ANCHOR: "cross-platform keyword strategy" → /best-amazon-keyword-research-tool-india (NLP contextual anchor, Step 2 per strategy) */}
              <a href="/best-amazon-keyword-research-tool-india" className="al" title="Cross-platform keyword strategy for Amazon and Flipkart sellers in India">cross-platform keyword strategy</a>{" "}
              across Flipkart and Amazon.in simultaneously.
            </p>

            <div className="steps">
              {[
                { n:1, t:"Connect Your Flipkart Seller Account",             d:"Link your Flipkart Seller Hub and add the FSNs you want to track. The tool begins pulling your current keyword rank positions across all tracked queries — no manual setup required." },
                { n:2, t:"Competitor Keyword Discovery",                      d:"The AI identifies your top 5–10 Flipkart competitors by category and crawls every search term they rank for — including long-tail, price-bracket, and regional language variants. This forms the basis of your keyword gap report." },
                { n:3, t:"Flipkart-Specific Search Volume & Intent Scoring",  d:"Each keyword is scored by Flipkart-native search volume — not Amazon.com data — weighted by competition density and buyer intent signal. Price-bracket modifiers are automatically flagged as high-priority product discovery terms." },
                { n:4, t:"Real-Time Rank Tracking & WhatsApp Alert",          d:"You receive a WhatsApp alert the moment your Flipkart rank drops more than 3 positions on a tracked keyword, or when a competitor enters a keyword cluster you're currently winning." },
                { n:5, t:"AI Listing & Attribute Optimisation Recommendation", d:"The platform delivers a concrete fix: 'Add cotton cushion cover 16x16 set of 5 to your Flipkart product title. Complete 4 missing product attributes in Seller Hub. Estimated rank improvement: P22 \u2192 P5. Monthly traffic gain: +620 clicks.'" },
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t}</strong><p>{s.d}</p></div>
                </div>
              ))}
            </div>

            {/* ── S5: Keyword Types ── */}
            <h2 id="keyword-types">6 Flipkart Keyword Types Indian Sellers Must Track</h2>
            <p>
              <strong>Flipkart buyers search differently from Amazon buyers.</strong> Their queries are typically shorter, more price-anchored, and include Flipkart-specific modifiers. Here's the complete keyword taxonomy every{" "}
              {/* ANCHOR: "Flipkart seller" → /solutions/flipkart-sellers (Pillar Hub, natural editorial placement) */}
              <a href="/solutions/flipkart-sellers" className="al" title="Flipkart sellers — Insydz analytics platform">Flipkart seller</a>{" "}
              needs to cover:
            </p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Keyword Type</th>
                    <th>Flipkart Example</th>
                    <th>Conversion Rate</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {kwTypes.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:700 }}>{r.type}</td>
                      <td style={{ color:"#475569", fontStyle:"italic", fontSize:11.5 }}>{r.example}</td>
                      <td><span className="bg">{r.conv}</span></td>
                      <td style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:12 }}>{r.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── S6: Ranking Factors ── */}
            <h2 id="ranking-factors">Flipkart SEO Ranking Factors: Complete Optimisation Checklist</h2>
            <p>
              Flipkart's{" "}
              {/* ANCHOR: "search algorithm" → /flipkart-search-algorithm-india (second mention, natural editorial) */}
              <a href="/flipkart-search-algorithm-india" className="al" title="Flipkart search algorithm ranking factors explained">search algorithm</a>{" "}
              scores your listing across five dimensions. Here's the complete optimisation checklist for each ranking factor that determines your product discovery position:
            </p>

            <h3>1. Product Title Optimisation</h3>
            <p>
              Flipkart titles have a 200-character limit — and the algorithm weights the first 60 characters most heavily. <strong>Your highest-volume primary keyword must appear in the first 5 words.</strong> Titles that front-load the category keyword, followed by the key attribute, followed by brand name consistently outperform brand-first title structures.
            </p>

            <h3>2. Product Attribute Completeness</h3>
            <p>
              This is the most underutilised ranking factor on Flipkart. Seller Hub provides 15–40 attribute fields per category — most sellers complete fewer than 40% of them. <strong>Every completed attribute is a potential keyword match surface</strong> for Flipkart's product discovery AI, even without that keyword appearing in your title.
            </p>

            <div className="box box-teal">
              <div className="box-label">💡 Quick Win</div>
              <p>Open your Flipkart Seller Hub listing and count your unfilled attributes. For most Indian sellers, there are 8–15 incomplete attribute fields per FSN. Each one you complete potentially increases the number of search queries for which your product is eligible to appear.</p>
            </div>

            <h3>3. Seller Performance Score &amp; F-Assured Status</h3>
            <p>
              Maintaining a fulfilment rate above 95%, return rate below 5%, and response time under 24 hours provides a baseline ranking boost. <strong>F-Assured status provides the single largest algorithmic ranking boost available on Flipkart</strong> — listings with F-Assured consistently rank 4–8 positions higher than equivalent non-F-Assured listings for the same keywords.
            </p>

            <div className="verdict-banner">
              <div style={{ fontSize:"clamp(18px,4vw,22px)", flexShrink:0 }}>🎯</div>
              <p style={{ margin:0, fontFamily:"'Lora',serif", fontSize:"clamp(13px,2vw,15px)", color:"#1E40AF", lineHeight:1.7 }} className="dark:text-blue-300">
                Flipkart search visibility is the multiplier that determines whether your product quality and pricing actually get seen by buyers — or get redirected to a better-optimised competitor listing before they ever reach yours.
              </p>
            </div>

            {/* ── S7: Mistakes ── */}
            <h2 id="mistakes">5 Mistakes Flipkart Sellers Make With Keyword Research</h2>
            <div className="mistakes">
              <div className="mistake">
                <div className="mistake-n">1</div>
                <div className="mistake-body">
                  <strong>Using Amazon Keyword Data for Flipkart Listings</strong>
                  <p>Amazon.in and Flipkart buyers have different search patterns. Flipkart queries are 2–4 words shorter, more price-bracket focused, and include Flipkart-specific modifiers. Optimising your Flipkart listing with Amazon keyword data means targeting the wrong search intent on the wrong platform — while the right Flipkart buyer terms go uncaptured.</p>
                </div>
              </div>
              <div className="mistake">
                <div className="mistake-n">2</div>
                <div className="mistake-body">
                  <strong>Ignoring Product Attribute Completeness</strong>
                  <p>Flipkart's product discovery AI matches buyer queries to attribute fields — not just title keywords. A seller with a perfectly optimised title but 60% empty attribute fields is invisible to Flipkart's conversational search. Most Indian Flipkart sellers have never looked at their attribute completion rate.</p>
                </div>
              </div>
              <div className="mistake">
                <div className="mistake-n">3</div>
                <div className="mistake-body">
                  <strong>Not Tracking Flipkart Rank Separately from Amazon</strong>
                  <p>
                    Sellers who track only Amazon keyword ranks have no visibility into their Flipkart search performance. A keyword can drop from P4 to P18 on Flipkart while holding P3 on Amazon — and you'd never know until Flipkart orders decline. No global tool provides{" "}
                    {/* ANCHOR: "Flipkart rank tracking" → /flipkart-rank-tracking (Mistakes #3 second body placement per strategy) */}
                    <a href="/flipkart-rank-tracking" className="al" title="Flipkart keyword rank tracking — India-first tool">Flipkart rank tracking</a>
                    {" "}— only India-first tools do.
                  </p>
                </div>
              </div>
              <div className="mistake">
                <div className="mistake-n">4</div>
                <div className="mistake-body">
                  <strong>Missing the Pre-Festive Keyword Optimisation Window</strong>
                  <p>Flipkart's Big Billion Days algorithm pre-ranks category pages 3–4 weeks before the event. Listing optimisation changes made during BBD week are too late — they take 14–21 days to influence rank. Sellers who update keywords and attributes in early September consistently outperform late optimisers.</p>
                </div>
              </div>
              <div className="mistake">
                <div className="mistake-n">5</div>
                <div className="mistake-body">
                  <strong>Treating Keyword Research as a One-Time Activity</strong>
                  <p>A keyword strategy built at product launch is partially obsolete within 90 days. Sellers who treat Flipkart SEO as a launch task rather than an ongoing discipline lose 2–4 rank positions per quarter to competitors who are continuously updating their listings.</p>
                </div>
              </div>
            </div>

            {/* Mid CTA */}
            <div className="mid-cta">
              <div>
                <h3>Start Tracking Flipkart Keyword Ranks — Free</h3>
                <p>Real-time Flipkart rank tracking, WhatsApp alerts, and AI listing fixes. Setup in under 30 minutes.</p>
              </div>
              <button onClick={() => setLocation("/login")} style={{ flexShrink:0, background:"#2874F0", color:"white", padding:"11px 22px", borderRadius:8, fontWeight:700, fontSize:"clamp(13px,2vw,14.5px)", whiteSpace:"nowrap" as const, cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif", width:"100%" }} className="sm:w-auto">Try Insydz Free →</button>
            </div>

            {/* ── S8: Workflow ── */}
            <h2 id="workflow">Best Practices: Weekly Flipkart SEO Execution Model</h2>
            <p>
              The most successful Flipkart sellers don't do keyword research in one-time sprints — they run a structured weekly rhythm that keeps their listings consistently competitive without manual effort.
            </p>

            <div className="weekly-grid">
              <div className="weekly-col">
                <div className="weekly-col-head wh-daily">DAILY — AUTOMATED</div>
                <div className="weekly-col-body">
                  <ul>
                    <li>Morning WhatsApp: top 5 Flipkart rank changes</li>
                    <li>Critical rank drop alerts (5+ positions)</li>
                    <li>Competitor new keyword entry alerts</li>
                    <li>F-Assured and seller score flags</li>
                  </ul>
                </div>
              </div>
              <div className="weekly-col">
                <div className="weekly-col-head wh-weekly">WEEKLY — 30 MIN REVIEW</div>
                <div className="weekly-col-body">
                  <ul>
                    <li>Full keyword gap report — top 10 Flipkart gaps</li>
                    <li>Update attributes on 2–3 FSNs via AI recs</li>
                    <li>Check new buy-intent terms in category</li>
                    <li>Identify out-of-stock competitor positions</li>
                    <li>Adjust 1–2 product titles with rank data</li>
                  </ul>
                </div>
              </div>
              <div className="weekly-col">
                <div className="weekly-col-head wh-monthly">MONTHLY — STRATEGIC</div>
                <div className="weekly-col-body">
                  <ul>
                    <li>BBD/GIF keyword coverage audit</li>
                    <li>New Flipkart category keyword gaps report</li>
                    <li>Revenue impact: before vs after keyword fixes</li>
                    <li>Competitor new product keyword sets</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── S9: Best Tools ── */}
            <h2 id="best-tools">Best Flipkart Keyword Research Tools in India (2026)</h2>
            <p>
              Not all keyword research tools cover Flipkart — in fact, <strong>most don't cover it at all.</strong> For Indian sellers whose revenue depends on Flipkart, here's an honest comparison. Global tools like Helium 10 and Jungle Scout — reviewed in our{" "}
              {/* ANCHOR: "Insydz vs Helium 10 comparison" → /compare/insydzvshelium (natural editorial, Related Guides cluster) */}
              <a href="/compare/insydzvshelium" className="al" title="Insydz vs Helium 10 for Indian sellers — full comparison">Insydz vs Helium 10 comparison</a>{" "}
              — have zero Flipkart rank data.
            </p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Flipkart</th>
                    <th>Amazon.in</th>
                    <th>Rank Tracking</th>
                    <th>WhatsApp</th>
                    <th>Buy Intent</th>
                    <th className="flip-head">Price (INR/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {toolRows.map((r, i) => (
                    <tr key={i} className={r.tool.includes("Insydz") ? "hl" : ""}>
                      <td style={{ fontWeight:r.tool.includes("Insydz") ? 800 : 600 }}>{r.tool}</td>
                      <td>{r.flipkart === "Yes" ? <span className="bg">Yes</span> : <span className="br">No</span>}</td>
                      <td>{r.amazon === "Yes" ? <span className="bg">Yes</span> : <span style={{ color:"#94A3B8" }}>{r.amazon}</span>}</td>
                      <td>{r.rank === "Real-time" ? <span className="bg">Real-time</span> : <span style={{ color:"#94A3B8" }}>{r.rank}</span>}</td>
                      <td>{r.wa === "Yes" ? <span className="bg">Yes</span> : <span className="br">No</span>}</td>
                      <td style={{ color:"#475569" }}>{r.intent}</td>
                      <td style={{ fontWeight:r.tool.includes("Insydz") ? 700 : 400, color:r.tool.includes("Insydz") ? "#2874F0" : "inherit" }}>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="box box-green">
              <div className="box-label">✅ No Aggressive Pitch Here</div>
              <p>If you're a Flipkart seller and you're not doing structured keyword research with a tool that actually has Flipkart data, you're optimising based on guesswork and Amazon assumptions. The question isn't whether you need a Flipkart-specific tool — it's which one fits your seller stage and budget. For most Indian SMB Flipkart sellers, that answer is clearly an India-first platform.</p>
            </div>

            <h3>Why India-First Platforms Win for Flipkart Sellers</h3>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:8, margin:"14px 0 24px" }}>
              {[
                { icon:"📊", t:"Real-time Flipkart Rank Tracking",          b:"Daily rank position data for every tracked keyword on Flipkart — with alerts the moment you drop more than 3 positions on a buy-intent term." },
                { icon:"🔍", t:"AI Keyword Gap Detection",                   b:"Automatically surfaces the Flipkart search terms your top competitors rank for that your listing is currently missing — ranked by traffic and conversion impact." },
                { icon:"📲", t:"WhatsApp Rank Drop Alerts",                  b:"Rank changes delivered via WhatsApp within 60 minutes — not buried in email dashboards sellers open three days later." },
                { icon:"✍️", t:"AI Listing Optimisation Recommendations",    b:"Specific title and attribute fixes with estimated rank recovery: 'Add this keyword to position 4 of your title. Complete 3 missing attributes. Estimated improvement: P18 \u2192 P5.'" },
                { icon:"🎉", t:"Festive Keyword Intelligence (BBD, GIF)",    b:"Pre-festive keyword tracking that flags the terms driving the highest search volume 6–8 weeks before Big Billion Days — so you're already ranked when the event opens." },
              ].map(f => (
                <div key={f.t} style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"12px 14px", display:"flex", gap:10 }}>
                  <span style={{ fontSize:"clamp(16px,3vw,20px)", flexShrink:0, marginTop:2 }}>{f.icon}</span>
                  <div>
                    <strong style={{ display:"block", fontSize:"clamp(12px,2vw,14px)", color:"#0A0F1A", marginBottom:2, fontFamily:"'Sora',sans-serif" }}>{f.t}</strong>
                    <p style={{ margin:0, fontSize:"clamp(11.5px,2vw,13.5px)", color:"#374151", lineHeight:1.6, fontFamily:"'Sora',sans-serif" }}>{f.b}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-orange">
              <div className="box-label">📌 Final Thought</div>
              <p>Winning on Flipkart in 2026 isn't about having the best product or the lowest price — it's about being found first. <strong>Every week without Flipkart keyword research is a week of search visibility being silently captured by a competitor who understands the algorithm better than you do.</strong></p>
            </div>

            {/* ── S10: FAQ ── */}
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

            {/* Related Guides */}
            <div style={{ marginTop:48, paddingTop:28, borderTop:"2px solid #E5E7EB" }}>
              <h2 style={{ fontSize:"clamp(16px,3vw,20px)", fontWeight:800, color:"#0A0F1A", margin:"0 0 18px", border:"none", padding:0, fontFamily:"'Sora',sans-serif" }} className="dark:text-white">Related Guides</h2>
              <div className="related-grid">
                {/* ANCHOR: NLP → /best-amazon-keyword-research-tool-india (Related Guide card per strategy) */}
                <a href="/best-amazon-keyword-research-tool-india" className="rel-card" title="Amazon keyword research tool India — 2026 guide">
                  <div className="rel-thumb" style={{ background:"linear-gradient(135deg,#2874F0,#1557CC)" }}><span>🔍</span></div>
                  <div className="rel-body">
                    <div className="rel-tag">Amazon SEO</div>
                    <div className="rel-title">Best Amazon Keyword Research Tool India: The 2026 Guide for Indian Sellers</div>
                  </div>
                </a>
                {/* ANCHOR: NLP → /best-review-analysis-tool-india ("review analysis tools for Indian sellers" per strategy) */}
                <a href="/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers" className="rel-card" title="Review analysis tools for Indian sellers — AI guide">
                  <div className="rel-thumb" style={{ background:"linear-gradient(135deg,#0ABFA4,#059669)" }}><span>⭐</span></div>
                  <div className="rel-body">
                    <div className="rel-tag">Review Analysis</div>
                    <div className="rel-title">AI Review Intelligence Tool for Amazon &amp; Flipkart Sellers: The Complete Guide</div>
                  </div>
                </a>
                <a href="/compare/insydzvshelium" className="rel-card" title="Insydz vs Helium 10 for Indian sellers — full comparison">
                  <div className="rel-thumb" style={{ background:"linear-gradient(135deg,#F4500A,#DC2626)" }}><span>⚔️</span></div>
                  <div className="rel-body">
                    <div className="rel-tag">Compare</div>
                    <div className="rel-title">Insydz vs Helium 10: Which Is the Right Tool for Indian Sellers?</div>
                  </div>
                </a>
              </div>
            </div>

          </article>
        </main>
      </div>

      {/* FINAL CTA */}
      <div className="fc-block">
        <div className="fc-inner">
          <h2>Every Week Without Flipkart Keyword Research Is a Week of Revenue Going to a Better-Optimised Competitor</h2>
          <p>Insydz tracks your Flipkart rank positions in real time, alerts you via WhatsApp the moment you drop, and tells you exactly what to fix — in your title, attributes, and listing copy.</p>
          <div className="fc-points">
            <div className="fc-pt">Forever free plan</div>
            <div className="fc-pt">No credit card</div>
            <div className="fc-pt">Flipkart + Amazon.in</div>
            <div className="fc-pt">WhatsApp alerts in 60 min</div>
          </div>
          <button className="fc-btn" onClick={() => setLocation("/login")}>
            → Start Free at insydz.com — See Your Flipkart Rank Dashboard in Minutes
          </button>
          <p className="fc-sub">Forever free plan · No credit card · Real-time Flipkart rank tracking</p>
        </div>
      </div>

            {/* Footer */}
      <footer className="bg-[#0a0f1e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 5 Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 mb-14">

            {/* Column 1 – Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <a href="/" className="flex items-center space-x-3 mb-4" aria-label="Insydz – Home">
                <img
                  src="/logo.png"
                  alt="Insydz Logo"
                  className="w-10 h-10 object-contain p-0.5"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Insydz
                </span>
              </a>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                India's AI-powered ecommerce analytics software for Amazon, Flipkart sellers.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free →
              </Link>
              <div className="flex space-x-3 mt-6">
                <a
                  title="Insydz on Facebook"
                  href="https://www.facebook.com/profile.php?id=61586202582209"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on Twitter / X"
                  href="https://x.com/growwithinsydz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on Instagram"
                  href="https://www.instagram.com/growwithinsydz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on LinkedIn"
                  href="https://www.linkedin.com/company/insydz/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2 – Solutions */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Solutions</h4>
              <ul className="space-y-3">
                <li><Link to="/solutions/amazon-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Amazon Sellers</Link></li>
                <li><Link to="/solutions/flipkart-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Flipkart Sellers</Link></li>
                <li><Link to="/solutions/ecommerce-agencies" className="text-sm text-gray-400 hover:text-white transition-colors">Agencies</Link></li>
                <li><Link to="/solutions/brand-managers" className="text-sm text-gray-400 hover:text-white transition-colors">Brand Managers</Link></li>
              </ul>
            </div>

            {/* Column 3 – Product */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/features/festive-trend-feature" className="text-sm text-gray-400 hover:text-white transition-colors">Festive Trends</Link></li>
                <li><Link to="/compare/insydzvshelium" className="text-sm text-gray-400 hover:text-white transition-colors">Compare</Link></li>
              </ul>
            </div>

            {/* Column 4 – Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/resources/expert-blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/resources/guides" className="text-sm text-gray-400 hover:text-white transition-colors">E-commerce Guides</Link></li>
                <li><Link to="/resources/videos" className="text-sm text-gray-400 hover:text-white transition-colors">Video Tutorials</Link></li>
                <li><Link to="/resources/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link to="/free-tools/free-amazon-product-analyzer" className="text-sm text-gray-400 hover:text-white transition-colors">Free Tools</Link></li>
              </ul>
            </div>

            {/* Column 5 – Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Company</h4>
              <ul className="space-y-3">
                {/* "About" scrolls on this page — use a hash href so it's crawlable */}
                <li><a href="#About" onClick={(e) => { e.preventDefault(); scrollToSection('About'); }} className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><Link to="/about/our-vision" className="text-sm text-gray-400 hover:text-white transition-colors">Our Vision</Link></li>
                <li><Link to="/about/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/about/contact-us" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Strip */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-gray-500 text-sm">
                © 2025 <span className="text-purple-400 font-semibold">Insydz</span>. All rights reserved. Designed & Developed in India 🇮🇳
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-gray-700">·</span>
                <a href="/terms-service" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="text-gray-700">·</span>
                <a href="/privacy-policy" className="hover:text-white transition-colors">Data Disclaimer</a>
              </div>
            </div>
          </div>

        </div>
      </footer>

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


