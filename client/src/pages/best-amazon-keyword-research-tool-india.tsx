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
import { Helmet } from 'react-helmet-async';

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://insydz.com/#organization",
    "name": "Insydz",
    "legalName": "Insydz Technologies Private Limited",
    "url": "https://insydz.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://insydz.com/logo.png",
      "width": 200,
      "height": 60
    },
    "description": "AI-powered ecommerce analytics solution for Indian marketplace sellers on Amazon.in, Flipkart.",
    "foundingDate": "2023",
    "foundingLocation": "India",
    "areaServed": "IN",
    "sameAs": [
      "https://twitter.com/insydz",
      "https://www.linkedin.com/company/insydz",
      "https://www.instagram.com/insydz"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["English", "Hindi"],
      "areaServed": "IN"
    }
  },

  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#article",
    "headline": "Best Amazon Keyword Research Tool India: Complete Guide for Sellers (2026)",
    "description": "Discover the best Amazon keyword research tools for India. Compare keyword gap analysis, search volume trackers, and buy intent tools.",
    "url": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india",
    "datePublished": "2026-01-10T08:00:00+05:30",
    "dateModified": "2026-01-10T08:00:00+05:30",
    "inLanguage": "en-IN",
    "author": {
      "@type": "Organization",
      "name": "Insydz Research Team"
    },
    "publisher": {
      "@id": "https://insydz.com/#organization"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://insydz.com/keyword-research-hero.png",
      "width": 1200,
      "height": 630
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india"
    },
    "keywords": [
      "amazon keyword research tool india",
      "amazon seo tools india",
      "keyword gap analysis",
      "amazon keyword tracking india",
      "flipkart keyword research"
    ],
    "articleSection": "Seller Tools & Strategy",
    "wordCount": 3800,
    "timeRequired": "PT13M"
  },

  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#howto",
    "name": "How to Do Amazon Keyword Research in India",
    "description": "Step-by-step process to find and use high-converting keywords for Amazon India listings.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Find Seed Keywords",
        "text": "Start with basic product keywords that buyers search for on Amazon.in."
      },
      {
        "@type": "HowToStep",
        "name": "Expand Keywords",
        "text": "Use tools to find related long-tail keywords and variations in Hindi and English."
      },
      {
        "@type": "HowToStep",
        "name": "Analyze Competitors",
        "text": "Check what keywords top competitors rank for and identify gaps."
      },
      {
        "@type": "HowToStep",
        "name": "Optimize Listing",
        "text": "Add keywords to title, bullets, backend fields, and description."
      }
    ]
  },

  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best Amazon keyword research tool for India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best tool for Indian sellers is one built specifically for Amazon.in data. Insydz provides keyword tracking across Amazon, Flipkart with India-specific insights."
        }
      },
      {
        "@type": "Question",
        "name": "How is keyword research different for Amazon.in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon India uses different search behavior including Hindi keywords, price-based searches, and regional variations."
        }
      },
      {
        "@type": "Question",
        "name": "What is keyword gap analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Keyword gap analysis finds keywords competitors rank for but your listing does not."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I update keywords?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Review monthly and refresh fully before major sale events like Diwali or Big Billion Days."
        }
      },
      {
        "@type": "Question",
        "name": "Can I track Flipkart keywords?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, India-focused tools allow tracking across Amazon and Flipkart."
        }
      }
    ]
  },

  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://insydz.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://insydz.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Seller Tools",
        "item": "https://insydz.com/blog/seller-tools"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Best Amazon Keyword Research Tool India",
        "item": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india"
      }
    ]
  }
];

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

const TOC = [
  { id:"what-is",        label:"What is Amazon Keyword Research for India?" },
  { id:"why-critical",   label:"Why Keyword Research is Critical" },
  { id:"how-it-works",   label:"How AI Keyword Research Works" },
  { id:"types",          label:"Types of Keywords Indian Sellers Must Track" },
  { id:"mistakes",       label:"5 Common Mistakes Sellers Make" },
  { id:"best-practices", label:"Weekly Execution Model" },
  { id:"best-tools",     label:"Best Tools for India 2026" },
  { id:"faq",            label:"Frequently Asked Questions" },
];

const FAQS = [
  {
    q: "What is the best Amazon keyword research tool for India?",
    a: "For Indian sellers on Amazon.in and Flipkart, the best tool is one built specifically for Indian marketplace data not adapted from a US tool. Insydz is the only platform that provides simultaneous keyword rank tracking across Amazon.in, Flipkart with WhatsApp alert delivery covering the full Indian e-commerce landscape, not just the Amazon.com data global tools are built on.",
  },
  {
    q: "How is keyword research different for Amazon.in vs Amazon.com?",
    a: "Amazon.in search behaviour is significantly different from Amazon.com. Indian buyers use price-bracket modifiers ('under 500,' 'below 2000'), Hindi and regional language terms, and highly specific festive search patterns. A term with 40,000 monthly searches on Amazon.com may have fewer than 1,000 searches on Amazon.in and conversely, uniquely Indian search patterns like 'fast charging cable 65W Type C for Realme' have no US equivalent at all. Insydz is calibrated to Amazon.in search intent, not US data.",
  },
  {
    q: "What is keyword gap analysis and why does it matter for Indian sellers?",
    a: "Keyword gap analysis identifies all the high-value search terms your top competitors rank for on Amazon.in that your listing currently doesn't target. It's the fastest way to find rank-growth opportunities without guessing because instead of researching new keywords from scratch, you start with a validated list of terms that are already driving real buyer traffic for your category.",
  },
  {
    q: "How often should I update my keyword strategy?",
    a: "At minimum, review your keyword performance monthly and update backend keyword fields every 2–3 months. For high-competition categories (electronics, fashion, home goods), weekly rank tracking is essential category keyword dynamics shift fast enough that monthly-only monitoring misses meaningful rank changes. During festive season (October–November), daily monitoring is worth the effort.",
  },
  {
    q: "Can I track competitor keywords on Flipkart not just Amazon?",
    a: "Yes — with India-first tools like Insydz. Global tools like Helium 10 and Jungle Scout only track Amazon.com (and partially Amazon.in) they have no Flipkart keyword data at all. Since Flipkart accounts for a significant share of India's e-commerce search volume, sellers who ignore Flipkart keyword data are operating with a fundamentally incomplete picture of their category's competitive landscape.",
  },
  {
    q: "How much do Amazon keyword research tools cost in India?",
    a: "Pricing ranges from free (Sonar — basic Amazon.in data only) to ₹500–2,000/month for mid-range India-focused tools, to ₹4,000–8,000/month for global platforms like Helium 10. Insydz offers a free plan and paid plans from ₹1,999/month, with full AI-powered keyword gap analysis, rank tracking across Amazon.in and Flipkart, and WhatsApp alert delivery included from the Starter tier.",
  },
];

function ArticleImg({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ margin:"24px 0 0" }}>
      <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#f1f5f9", minHeight:200 }}>
        {!loaded && (
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize:"200% 100%", animation:"imgShimmer 1.5s infinite" }} />
        )}
        <img src={src} alt={alt} onLoad={() => setLoaded(true)} style={{ width:"100%", display:"block", opacity: loaded ? 1 : 0, transition:"opacity .3s" }} />
      </div>
      <p className="art-img-cap">{caption}</p>
    </div>
  );
}



export default function BestAmazonKeywordResearchToolIndia() {
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
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-po-schema-${i}`;
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);

    document.head.appendChild(script);
  });

  return () => {
    SCHEMAS.forEach((_, i) => {
      document.getElementById(`insydz-po-schema-${i}`)?.remove();
    });
  };
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
    window.addEventListener("scroll", onScroll, { passive:true });
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

  const scrollToSection = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); };
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" }); setTocOpen(false); };
  const handleMenuItemClick = (item: MenuItemWithBadge) => { if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); } };
  const toggleMobileMenu   = (name: string) => setMobileActiveMenu(p => p === name ? null : name);

  const DesktopDropdown = ({ label, menuKey, accent = "purple" }: { label:string; menuKey:keyof NavigationMenu; accent?:"purple"|"orange" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button onMouseEnter={() => setActiveDropdown(label)} className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive?(ac?"text-orange-600 font-semibold":"text-purple-600 font-semibold"):(ac?"text-orange-600 dark:text-orange-500 hover:bg-orange-50":"text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20")}`}>
          {label}<ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive?"rotate-180":""}`} />
        </button>
        {isActive && (
          <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {items.map((item, i) => (
              <button key={i} onClick={() => handleMenuItemClick(item)} className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac?"hover:bg-orange-50":"hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                <span className={`flex-shrink-0 ${ac?"text-orange-600":"text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">{item.badge}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const keywordTypes = [
    { icon:"🛒", type:"Buy Intent Terms",       example:"\"buy wireless earbuds under 1500\"",    conv:"High (12–18%)",     priority:"Critical" },
    { icon:"📦", type:"Category Head Terms",    example:"\"wireless earbuds\"",                   conv:"Medium (4–7%)",     priority:"Important" },
    { icon:"🔍", type:"Long-Tail Specific",     example:"\"earbuds noise cancelling gym\"",        conv:"Very High (20–28%)",priority:"Critical" },
    { icon:"💰", type:"Price Bracket Terms",    example:"\"earbuds 500 to 1000 rupees\"",          conv:"High (10–16%)",     priority:"Critical" },
    { icon:"🏷️", type:"Competitor Brand",       example:"\"boAt airdopes alternative\"",           conv:"Medium (8–12%)",    priority:"Important" },
    { icon:"🗣️", type:"Regional Language",      example:"\"earbuds kam daam mein\"",               conv:"Very High (15–22%)",priority:"Opportunity" },
  ];

  const compRows = [
    { cap:"Amazon.in Keyword Data",           manual:"Manual only",             global:"Partial — US-primary",      insydz:"Native Amazon.in" },
    { cap:"Flipkart Keyword Tracking",        manual:"Manual only",             global:"Not supported",             insydz:"Full coverage" },
    { cap:"Competitor Keyword Gap Analysis",  manual:"2–4 days/ASIN",           global:"Amazon.com focused",        insydz:"Automated, <1 hour" },
    { cap:"Buy Intent & Price Bracket Terms", manual:"No systematic detection", global:"US intent data",            insydz:"India-calibrated AI" },
    { cap:"Regional Language Keywords",       manual:"No",                      global:"English only",              insydz:"Hindi + Hinglish" },
    { cap:"Backend Field Recommendations",    manual:"Manual guesswork",        global:"Basic",                     insydz:"AI-generated, per ASIN" },
    { cap:"WhatsApp Rank Drop Alerts",        manual:"Not available",           global:"Email only",                insydz:"Within 60 min" },
    { cap:"Festive Keyword Intelligence",     manual:"Not available",           global:"Not available",             insydz:"BBD, GIF, Diwali data" },
    { cap:"Rank Tracking Frequency",          manual:"Manual — whenever you check", global:"Daily/weekly",          insydz:"Real-time + daily digest" },
    { cap:"Pricing",                          manual:"Your time (3–5 hrs/day)", global:"₹4,000–8,000/month",        insydz:"Free – ₹1,999/month" },
  ];

  const toolRows = [
    { tool:"Helium 10",      amz:"Partial", flip:"No",  mee:"No",  wa:"No",  intent:"US Only",    price:"₹4,000–8,000/mo" },
    { tool:"Jungle Scout",   amz:"Partial", flip:"No",  mee:"No",  wa:"No",  intent:"US Only",    price:"₹4,500–7,000/mo" },
    { tool:"Sonar (Free)",   amz:"Yes",     flip:"No",  mee:"No",  wa:"No",  intent:"Basic",      price:"Free" },
    { tool:"Insydz ✦",       amz:"Yes",     flip:"Yes", mee:"Yes", wa:"Yes", intent:"AI-Powered", price:"₹1,999/mo + Free" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes imgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#7c3aed,#db2777);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

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
        .article-body h2:first-child{margin-top:0}

        .article-body h3{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0D1B2A;margin:24px 0 8px;letter-spacing:-.2px;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h3{font-size:16px;margin:28px 0 10px}}
        @media(min-width:1024px){.article-body h3{font-size:17px;margin:32px 0 10px;scroll-margin-top:84px}}
        .dark .article-body h3{color:#f3f4f6}

        .article-body p{margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body ul,ol{margin:4px 0 16px 18px}
        @media(min-width:640px){.article-body ul,ol{margin:4px 0 18px 22px}}
        .article-body li{font-size:14px;line-height:1.72;margin-bottom:7px}
        @media(min-width:640px){.article-body li{font-size:15px;margin-bottom:8px}}
        .article-body li::marker{color:#7C3AED}
        .article-body strong{font-weight:700;color:#0D1B2A}
        .dark .article-body strong{color:#f9fafb}

        .art-img-cap{font-size:11px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:24px;padding:6px 10px}
        @media(min-width:640px){.art-img-cap{font-size:12px;margin-bottom:28px;padding:8px 12px}}

        .box{border-radius:10px;padding:16px 18px;margin:18px 0}
        @media(min-width:640px){.box{padding:20px 22px;margin:24px 0}}
        .box-label{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.box-label{font-size:11px}}
        .box p{margin:0;font-size:13.5px;line-height:1.72;font-family:'Lora',serif}
        @media(min-width:640px){.box p{font-size:14.5px}}
        .box p+p{margin-top:10px}
        .box-teal{background:#F0FDFA;border-left:4px solid #0D9488}
        .box-teal .box-label{color:#0D9488}
        .box-amber{background:#FFFBEB;border-left:4px solid #D97706}
        .box-amber .box-label{color:#D97706}
        .box-green{background:#F0FDF4;border-left:4px solid #16A34A}
        .box-green .box-label{color:#16A34A}
        .box-pink{background:#FDF2F8;border-left:4px solid #DB2777}
        .box-pink .box-label{color:#DB2777}
        .box-purple{background:#F5F3FF;border-left:4px solid #7C3AED}
        .box-purple .box-label{color:#7C3AED}
        .box-indigo{background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px}
        .box-indigo .box-label{color:#4F46E5}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-pink{background:#500724;border-color:#9d174d}
        .dark .box-purple{background:#2e1065;border-color:#5b21b6}
        .dark .box-indigo{background:#1e1b4b;border-color:#3730a3}

        .steps{display:flex;flex-direction:column;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.steps{gap:12px;margin:20px 0 28px}}
        .step{display:flex;gap:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{background:#111827;border-color:#1f2937}
        .step-n{flex-shrink:0;width:30px;height:30px;background:#7C3AED;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-n{width:34px;height:34px;font-size:15px}}
        .step-body strong{display:block;font-size:13px;color:#0D1B2A;margin-bottom:3px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body strong{font-size:14.5px}}
        .dark .step-body strong{color:#f9fafb}
        .step-body p{margin:0;font-size:12.5px;color:#64748B;line-height:1.6;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body p{font-size:13.5px}}

        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:18px 0 24px}
        @media(min-width:640px){.tbl-wrap{margin:24px 0 32px}}
        table.dt{width:100%;border-collapse:collapse;font-size:11.5px;font-family:'Sora',sans-serif;min-width:480px}
        @media(min-width:640px){table.dt{font-size:13px;min-width:560px}}
        table.dt thead tr{background:#0D1B2A}
        table.dt th{padding:10px 12px;color:white;font-weight:700;text-align:left;font-size:10.5px;letter-spacing:.2px;white-space:nowrap}
        @media(min-width:640px){table.dt th{padding:13px 16px;font-size:12px}}
        table.dt tbody tr{border-bottom:1px solid #E2E8F0;transition:background .15s}
        table.dt tbody tr:nth-child(even) td{background:#F8FAFC}
        table.dt tbody tr:hover td{background:#F5F3FF}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}
        table.dt tr.hl td{background:#F5F3FF!important;border-left:3px solid #7C3AED}
        table.dt tr.hl td:first-child{font-weight:700;color:#7C3AED}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bg{padding:2px 8px;font-size:11.5px}}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.br{padding:2px 8px;font-size:11.5px}}
        .bp{background:#F5F3FF;color:#6D28D9;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bp{padding:2px 8px;font-size:11.5px}}
        .bo{background:#FFF7ED;color:#C2410C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bo{padding:2px 8px;font-size:11.5px}}

        .mistakes{display:flex;flex-direction:column;gap:8px;margin:16px 0 22px}
        @media(min-width:640px){.mistakes{gap:10px;margin:20px 0 28px}}
        .mistake{border:1px solid #E2E8F0;border-radius:10px;display:flex;overflow:hidden}
        .dark .mistake{border-color:#1f2937}
        .mistake-n{flex-shrink:0;width:38px;background:#0D1B2A;color:white;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-n{width:46px;font-size:17px}}
        .mistake-body{padding:12px 14px}
        @media(min-width:640px){.mistake-body{padding:16px 18px}}
        .mistake-body strong{display:block;font-size:13px;color:#0D1B2A;margin-bottom:4px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-body strong{font-size:14.5px;margin-bottom:5px}}
        .dark .mistake-body strong{color:#f9fafb}
        .mistake-body p{margin:0;font-size:12px;color:#64748B;line-height:1.65;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-body p{font-size:13.5px}}

        .mid-cta{background:linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%);border-radius:10px;padding:20px 22px;margin:32px 0;display:flex;flex-direction:column;gap:16px}
        @media(min-width:640px){.mid-cta{padding:24px 28px;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:40px 0;gap:20px}}
        @media(min-width:1024px){.mid-cta{padding:28px 32px}}
        .mid-cta h3{font-size:16px;font-weight:800;color:white;margin-bottom:5px;letter-spacing:-.2px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta h3{font-size:18px;margin-bottom:6px}}
        .mid-cta p{color:#94A3B8;font-size:12.5px;margin:0;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta p{font-size:13.5px}}

        .faq-item{border:1px solid #E2E8F0;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;transition:border-color .2s}
        @media(min-width:640px){.faq-item{margin-bottom:10px}}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#7C3AED}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0D1B2A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px;gap:12px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F8FAFC}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#F5F3FF;color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        @media(min-width:640px){.faq-icon{width:22px;height:22px;font-size:16px}}
        .faq-icon.open{transform:rotate(45deg);background:#7C3AED;color:white}
        .faq-a{padding:0 16px 14px;font-size:13px;color:#64748B;line-height:1.75;font-family:'Lora',serif}
        @media(min-width:640px){.faq-a{padding:0 20px 16px;font-size:14px}}
        .dark .faq-a{color:#9ca3af}

        .related-grid{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:480px){.related-grid{grid-template-columns:1fr 1fr;gap:14px}}
        @media(min-width:768px){.related-grid{grid-template-columns:repeat(3,1fr);gap:16px}}
        .rel-card{border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;background:#fff}
        .dark .rel-card{background:#111827;border-color:#1f2937}
        .rel-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);transform:translateY(-2px)}
        .rel-thumb{width:100%;height:100px;display:flex;align-items:center;justify-content:center;font-size:24px}
        @media(min-width:640px){.rel-thumb{height:128px;font-size:28px}}
        .rel-body{padding:12px}
        @media(min-width:640px){.rel-body{padding:14px}}
        .rel-tag{font-size:10px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-tag{font-size:10.5px;margin-bottom:6px}}
        .rel-title{font-size:12px;font-weight:700;color:#0D1B2A;line-height:1.4;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-title{font-size:13px}}
        .dark .rel-title{color:#f9fafb}

        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#7C3AED;background:#F5F3FF;border-left-color:#7C3AED}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#2e1065;color:#a78bfa}

        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E2E8F0;text-align:center;border-bottom:1px solid #E2E8F0}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}
        @media(max-width:639px){.stat-item:nth-child(2){border-right:none}.stat-item:nth-child(3){border-right:1px solid #E2E8F0}.stat-item:nth-child(4){border-right:none;border-bottom:none}.stat-item:nth-child(3){border-bottom:none}}

        .takeaway-box{background:#0D1B2A;border-radius:10px;padding:22px 20px;margin:22px 0}
        @media(min-width:640px){.takeaway-box{padding:28px 30px;margin:28px 0}}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:white;margin:0 0 14px}
        @media(min-width:640px){.takeaway-box h3{font-size:18px;margin:0 0 16px}}
        .takeaway-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
        @media(min-width:640px){.takeaway-item{gap:10px;margin-bottom:10px}}
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        .metrics{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 22px}
        @media(min-width:480px){.metrics{grid-template-columns:1fr 1fr;gap:12px}}
        @media(min-width:640px){.metrics{gap:14px;margin:20px 0 28px}}
        .metric{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;display:flex;gap:10px;align-items:flex-start}
        @media(min-width:640px){.metric{padding:18px;gap:14px}}
        .dark .metric{background:#111827;border-color:#1f2937}
        .metric-icon{flex-shrink:0;width:32px;height:32px;border-radius:8px;background:#F5F3FF;display:flex;align-items:center;justify-content:center;font-size:16px}
        @media(min-width:640px){.metric-icon{width:38px;height:38px;border-radius:9px;font-size:18px}}
        .metric-t{font-size:12.5px;font-weight:700;color:#0D1B2A;margin-bottom:3px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.metric-t{font-size:13.5px}}
        .dark .metric-t{color:#f9fafb}
        .metric-d{font-size:11.5px;color:#64748B;line-height:1.5;font-family:'Sora',sans-serif}
        @media(min-width:640px){.metric-d{font-size:12.5px}}

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

        .verdict-banner{background:linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 100%);border:2px solid #DDD6FE;border-radius:12px;padding:16px;margin:22px 0;display:flex;gap:12px;align-items:flex-start}
        @media(min-width:640px){.verdict-banner{padding:22px 24px;margin:28px 0;gap:16px}}
        .dark .verdict-banner{background:#2e1065;border-color:#4c1d95}

        .breadcrumb{background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:8px 0}
        @media(min-width:640px){.breadcrumb{padding:10px 0}}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .article-hero{max-width:1240px;margin:0 auto;padding:28px 16px 0}
        @media(min-width:640px){.article-hero{padding:36px 20px 0}}
        @media(min-width:1024px){.article-hero{padding:48px 24px 0}}

        .sidebar-cta-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:white;margin-bottom:8px;line-height:1.35}
        @media(min-width:1024px){.sidebar-cta-title{font-size:16px}}
        .sidebar-cta-body{font-size:11.5px;color:#94A3B8;margin-bottom:14px;line-height:1.6;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.sidebar-cta-body{font-size:12.5px;margin-bottom:16px}}

        body{overflow-x:hidden}
      `}</style>

      <div className="read-progress" style={{ width:`${scrollPct}%` }} />

      {/* ═══ NAV ════════════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg":"bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => setLocation("/")}>
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
            </div>

            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <button onClick={() => setLocation("/pricing")} onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" accent="orange" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Button onClick={() => setLocation("/login")} onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Button>
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
              <button onClick={() => { setLocation("/resources/expert-blog"); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </button>
              {([["Solutions","Solutions","purple"],["Use Cases","Use Cases","purple"],["Features","Features","purple"],["Free Tools","Free Tools","purple"],["Compare","Compare","purple"],["Resources","Resources","orange"],["About","About","purple"]] as [string,keyof NavigationMenu,string][]).map(([label,key,accent]) => (
                <div key={label}>
                  <button onClick={() => toggleMobileMenu(label)} className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${accent==="orange"?"text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20":"text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                    {label}<ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu===label?"rotate-180":""}`} />
                  </button>
                  {mobileActiveMenu===label && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {navigationMenu[key].map((item,i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-left flex-1">{item.name}</span>
                          {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => { setLocation("/pricing"); setIsMenuOpen(false); }} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">Pricing</button>
              <Button onClick={() => { setLocation("/login"); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-sm py-2">Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* BREADCRUMB */}
      <div className="pt-[64px] sm:pt-[72px] lg:pt-[80px]">
        <div className="breadcrumb-inner">
          <button onClick={() => setLocation("/")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Home</button>
          <span>›</span>
          <button onClick={() => setLocation("/resources/expert-blog")} style={{ color:"#64748B", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontSize:"inherit" }}>Blog</button>
          <span>›</span>
          <span style={{ color:"#94A3B8" }}>Amazon Keyword Research Tools India</span>
        </div>
      </div>

      {/* HERO */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F5F3FF", color:"#7C3AED", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase" as const, padding:"4px 12px", borderRadius:20, marginBottom:14 }}>
          <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Seller Tools &amp; Strategy
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:800, lineHeight:1.18, color:"#0D1B2A", letterSpacing:"-.5px", marginBottom:14, maxWidth:820 }} className="dark:text-white">
          Best <span style={{ color:"#7C3AED" }}>Amazon Keyword Research Tool</span> India: Complete Guide for Sellers (2026)
        </h1>
        <p style={{ fontFamily:"'Lora',serif", fontSize:"clamp(14px,2vw,17px)", color:"#475569", lineHeight:1.65, maxWidth:760, marginBottom:16 }} className="dark:text-gray-400">
          Find buyer-intent keywords your competitors are ranking for on Amazon.in and win the search result before they know you're there. India's definitive guide to keyword gap analysis, search volume tracking, and rank monitoring.
        </p>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong style={{ color:"#0D1B2A" }}>Insydz Research Team</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />January 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong>13 min read</strong></div>
          <span style={{ background:"#FFEDD5", color:"#F97316", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Updated for 2026</span>
          <span style={{ background:"#F5F3FF", color:"#7C3AED", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Seller Strategy Guide</span>
        </div>

        <div className="stat-strip" style={{ marginBottom:24 }}>
          {[
            ["68%",     "Amazon Purchases Start With a Keyword Search"],
            ["₹38K/mo", "Avg. Monthly Revenue Lost to Poor Keyword Coverage"],
            ["3–5×",    "Organic Traffic Increase with Proper Keyword Research"],
            ["Top 3",   "Search Positions Capture 60% of All Category Clicks"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span style={{ display:"block", fontSize:"clamp(20px,4vw,26px)", fontWeight:800, color:"#7C3AED", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{num}</span>
              <span style={{ display:"block", fontSize:"clamp(10px,2vw,11.5px)", color:"#64748B", marginTop:4, lineHeight:1.4, fontWeight:500 }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Image */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px" }} className="sm:px-5 lg:px-6">
        <ArticleImg
          src="/keyword-research-hero.png"
          alt="Best Amazon keyword research tool India keyword gap analysis dashboard for Amazon.in and Flipkart sellers"
          caption="Insydz AI keyword intelligence surfaces competitor keyword gaps, rank positions, and backend optimisation opportunities across Amazon.in, Flipkart"
        />
      </div>

      {/* KEY TAKEAWAYS */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px 28px" }} className="sm:px-5 lg:px-6">
        <div className="takeaway-box">
          <h3>✅ Key Takeaways</h3>
          {[
            "Most Indian sellers are optimising for the wrong keywords global tools like Helium 10 pull US search data, not Amazon.in search behaviour.",
            "Keyword gap analysis reveals which high-volume, buy-intent terms your top 3 competitors rank for and you don't.",
            "Search volume alone is a trap. On Amazon.in, a keyword with 8,000 monthly searches and low competition converts better than one with 80,000 searches and 400 competitors.",
            "Backend keyword fields on Amazon.in are underused by 80% of Indian SMB sellers fixing this alone can lift organic rank by 2–3 positions.",
            "India-first tools like Insydz track keyword ranking shifts on Amazon.in and Flipkart simultaneously global tools miss Flipkart entirely.",
            "Combining keyword research with competitor price tracking and review intelligence gives Indian sellers a complete, AI-powered growth picture.",
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
              <li key={t.id}><button className={`toc-link${activeSection===t.id?" active":""}`} onClick={() => go(t.id)}>{t.label}</button></li>
            ))}
          </ul>
          <div style={{ background:"linear-gradient(160deg,#0D1B2A 0%,#162B45 100%)", borderRadius:10, padding:18, marginTop:16 }}>
            <h4 className="sidebar-cta-title">Find Your Keyword Gaps — Free</h4>
            <p className="sidebar-cta-body">AI-powered keyword intelligence for Amazon.in, Flipkart &amp;. WhatsApp rank alerts included.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 14px" }}>
              {["Competitor keyword gap analysis","Rank tracking — all 3 platforms","WhatsApp alerts on rank drops","From ₹1,999/mo — or free forever"].map(f => (
                <li key={f} style={{ fontSize:11.5, color:"#CBD5E1", marginBottom:7, display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.4, fontFamily:"'Sora',sans-serif" }}>
                  <span style={{ color:"#A78BFA", fontWeight:800, flexShrink:0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => setLocation("/login")} style={{ display:"block", background:"#7C3AED", color:"white", textAlign:"center" as const, padding:10, borderRadius:8, fontWeight:700, fontSize:12.5, width:"100%", cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif" }}>
              Start Free — No Card Needed
            </button>
          </div>
          <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:14, marginTop:14 }}>
            <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:1, color:"#94A3B8", marginBottom:10 }}>Share This Guide</h4>
            <div style={{ display:"flex", gap:6 }}>
              {[{l:"WhatsApp",bg:"#25D366"},{l:"LinkedIn",bg:"#0A66C2"},{l:"Twitter",bg:"#1DA1F2"}].map(s => (
                <div key={s.l} style={{ flex:1, textAlign:"center" as const, padding:"7px 4px", borderRadius:7, fontSize:11, fontWeight:700, color:"white", background:s.bg, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>{s.l}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth:0 }}>
          <button className="mobile-toc-btn" onClick={() => setTocOpen(!tocOpen)}>
            📋 Table of Contents <span>{tocOpen?"▲":"▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen?" open":""}`}>
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>
            ))}
          </div>

          <article className="article-body">

            {/* In Simple Terms */}
            <div className="box box-indigo" style={{ margin:"0 0 28px" }}>
              <div className="box-label">In Simple Terms</div>
              <p>Instead of guessing which keywords to put in your product title and backend fields, a keyword research tool tells you precisely which terms drive actual sales on Amazon.in right now including the hidden buy-intent terms your competitors are ranking for and you've never even thought of.</p>
            </div>

            <h2 id="what-is">What is Amazon Keyword Research for India?</h2>
            <p>An Amazon keyword research tool for India is software that identifies the exact search terms Indian buyers type into Amazon.in and Flipkart before purchasing and reveals which of those terms your competitors are ranking for that your listing currently doesn't target. This is called keyword gap analysis, and it's the fastest route to organic rank improvement available to any Indian seller.</p>
            <p>Unlike generic global tools built for US or European marketplaces, India-focused keyword research accounts for regional language intent, rupee-based price-search patterns, and platform-specific search behaviour on Amazon.in, Flipkart simultaneously.</p>
            <p>Here's the scale of the problem: <strong>Indian sellers on Amazon.in collectively leave an estimated ₹500–800 crore in annual organic revenue on the table</strong> simply because their listings are not optimised for the search terms their buyers are actually using. AI-powered keyword dashboards surface the exact gaps that are costing you search visibility — showing you which competitor keywords to target first, ranked by revenue impact.</p>

            <h2 id="why-critical">Why is Keyword Research Critical for Indian Sellers?</h2>
            <h3>India's Search Behaviour is Unlike Any Other Market</h3>
            <p>India's e-commerce search behaviour is unlike any other market in the world. Buyers search in Hindi transliterations, regional colloquialisms, and hyper-specific price brackets. A buyer looking for a mobile stand might search "mobile holder for car dashboard under 300 rupees" a term with zero US equivalent and zero visibility in Helium 10's keyword database. An India-first tool surfaces this term with its actual Amazon.in search volume and competition score.</p>

            <h3>The Keyword Visibility Gap is Silent and Compounding</h3>
            <p>Most Indian sellers do keyword research once at launch and never revisit it. Meanwhile, their competitors are continuously adding new terms, capturing new search traffic, and rising in rank. By the time the revenue impact becomes visible in your seller dashboard, you've already lost 3–6 months of compounding organic traffic to a better-optimised competitor listing.</p>

            <div className="box box-amber">
              <div className="box-label">Real Seller Example</div>
              <p>A Pune-based mobile accessories seller was doing ₹2.8 lakh/month on Amazon.in. A competitor entered the same category and captured the "fast charging cable type c" keyword cluster 14 related search terms with a fully optimised listing. The Pune seller's revenue dropped to ₹1.1 lakh within 8 weeks. The competitor wasn't cheaper or better reviewed they were simply found first on 14 searches the original seller had never even tracked.</p>
            </div>

            <h3>Amazon's A10 Algorithm Penalises Keyword-Thin Listings</h3>
            <p>Amazon's ranking algorithm factors keyword relevance across product title, bullet points, description, backend search terms, and even Q&amp;A sections. A listing missing 40 relevant backend keywords is algorithmically invisible for those search terms regardless of its price competitiveness or review score. <strong>Backend keyword fields on Amazon.in are underused by 80% of Indian SMB sellers.</strong> Fixing this alone with the right India-specific terms can lift organic rank by 2–3 positions on multiple search queries simultaneously.</p>

            <h3>The Festive Season Keyword Window is Worth Months of Revenue</h3>
            <p>During Big Billion Days and Great Indian Festival, <strong>40–60% of annual e-commerce revenue concentrates into 4–7 days</strong>. Sellers who rank for festive search terms on Day 1 win disproportionately. A seller missing "Diwali gift set under 500" or "gifting hamper for office" in their backend fields on October 1st loses those searches entirely because listing optimisation changes take 2–3 weeks to index and influence rank.</p>

            <div className="box box-indigo">
              <div className="box-label">AI Overview Summary</div>
              <p>Amazon keyword research tools help Indian sellers identify which search terms drive buyer traffic on Amazon.in and Flipkart, reveal competitor keyword gaps, and recommend backend optimisation fixes especially critical for sellers managing 10–100 SKUs without a dedicated SEO analyst.</p>
            </div>

            <h2 id="how-it-works">How Does Amazon Keyword Research Work?</h2>
            <p>Modern tools have replaced the manual spreadsheet workflow with a 5-step automated intelligence loop:</p>

            <ArticleImg
              src="/keyword-research-pipeline.png"
              alt="5-step AI keyword research pipeline for Amazon India and Flipkart sellers"
              caption="The 5-step automated keyword intelligence loop from ASIN connection to WhatsApp-delivered rank drop alerts and AI listing recommendations"
            />

            <div className="steps">
              {[
                { n:1, t:"Connect Your Seller Account", d:"Link your Amazon.in or Flipkart seller account and add the ASINs you want to track. The tool begins pulling your current keyword rank positions immediately no manual setup required." },
                { n:2, t:"Competitor Keyword Crawling", d:"The tool identifies your top 5–10 competitors by category and crawls every keyword they rank for including long-tail, buy-intent, and regional language variants. This forms the basis of your keyword gap report." },
                { n:3, t:"Search Volume & Intent Scoring", d:"Each keyword is scored by monthly search volume, competition density, and buyer intent signal separating high-value 'buy now' terms from low-value browsing terms. India-specific data, not US benchmarks." },
                { n:4, t:"Ranking Tracker & Alert Triggered", d:"You receive a WhatsApp alert the moment your rank drops more than 3 positions on a tracked keyword, or when a competitor enters a keyword cluster you're currently winning." },
                { n:5, t:"AI Listing Optimisation Recommendation", d:"The platform delivers a concrete fix: 'Add \"fast charging type c 2m\" to your product title and backend field 3. Estimated rank improvement: P14 → P4. Monthly traffic gain: +520 clicks.' Not data decisions." },
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t}</strong><p>{s.d}</p></div>
                </div>
              ))}
            </div>

            <div className="box box-purple">
              <div className="box-label">Key Insight</div>
              <p>Keyword data without ranking context is useless. Knowing a term has 12,000 monthly searches means nothing if you're already ranking P2 for it. The gap terms your competitors rank for and you don't is where your growth actually lives.</p>
            </div>

            <h2 id="types">Types of Amazon Keywords Indian Sellers Must Track</h2>
            <p>Buy Intent Terms and Price Bracket Keywords deliver the highest conversion rates yet are the most commonly missed by Indian sellers optimising with global tools. Here's the full taxonomy every India seller needs to cover:</p>

            <ArticleImg
              src="/keyword-types-india.png"
              alt="Types of Amazon keywords for Indian sellers buy intent, price bracket, regional language, long-tail"
              caption="Six keyword categories Indian sellers must track ranked by conversion rate and competitive opportunity"
            />

            {/* <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Keyword Type</th>
                    <th>Example (India)</th>
                    <th>Conversion Rate</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordTypes.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:700, whiteSpace:"nowrap" as const }}><span style={{ marginRight:5 }}>{r.icon}</span>{r.type}</td>
                      <td style={{ color:"#475569", fontStyle:"italic" }}>{r.example}</td>
                      <td><span className="bg">{r.conv}</span></td>
                      <td>
                        {r.priority === "Critical"    && <span className="bp">Critical</span>}
                        {r.priority === "Important"   && <span className="bo">Important</span>}
                        {r.priority === "Opportunity" && <span style={{ background:"#F0FDF4", color:"#15803D", fontWeight:700, padding:"1px 6px", borderRadius:20, fontSize:"10.5px", display:"inline-block" }}>Opportunity</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}

            {/* <h3>Method Comparison — Speed vs Actionability vs Cost</h3>
            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr><th>Method</th><th>Speed</th><th>India Data Quality</th><th>Actionability</th><th style={{ background:"#7C3AED" }}>Cost</th></tr>
                </thead>
                <tbody>
                  <tr><td style={{ fontWeight:600 }}>Manual Search Bar Research</td><td style={{ color:"#94A3B8" }}>2–4 days</td><td style={{ color:"#94A3B8" }}>Partial</td><td style={{ color:"#94A3B8" }}>None</td><td style={{ color:"#94A3B8" }}>3–4 hrs/day</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Basic Free Tools (Sonar)</td><td style={{ color:"#94A3B8" }}>Same day</td><td style={{ color:"#94A3B8" }}>Limited</td><td style={{ color:"#94A3B8" }}>Low</td><td style={{ color:"#94A3B8" }}>Free – ₹500/mo</td></tr>
                  <tr><td style={{ fontWeight:600 }}>Global SaaS (Helium 10)</td><td style={{ color:"#94A3B8" }}>1–2 hours</td><td style={{ color:"#94A3B8" }}>No Flipkart</td><td style={{ color:"#94A3B8" }}>Medium</td><td style={{ color:"#94A3B8" }}>₹4,000–8,000/mo</td></tr>
                  <tr className="hl"><td>India-First AI (Insydz) ★</td><td style={{ color:"#6D28D9", fontWeight:700 }}>&lt; 1 hour</td><td style={{ color:"#6D28D9", fontWeight:700 }}>Amazon.in + Flipkart</td><td style={{ color:"#6D28D9", fontWeight:700 }}>High — Actionable AI</td><td style={{ color:"#6D28D9", fontWeight:700 }}>₹1,999–2,999/mo</td></tr>
                </tbody>
              </table>
            </div> */}

            <h2 id="mistakes">5 Common Mistakes Indian Sellers Make with Keyword Research</h2>
            <p>Each of these mistakes silently costs Indian sellers ranking positions and therefore revenue every week they go uncorrected.</p>

            <div className="mistakes">
              {[
                { n:1, t:"Using US Keyword Data for Amazon.in",
                  b:"Helium 10 and Jungle Scout pull search volume from Amazon.com not Amazon.in. A term with 40,000 monthly searches in the US might have 800 searches in India, and the inverse is equally true for India-specific terms. Using US data means you're optimising for the wrong market entirely." },
                { n:2, t:"Ignoring Long-Tail and Price-Bracket Keywords",
                  b:"Indian buyers are highly price-conscious searchers. Terms like \"under 999,\" \"below 2000,\" and \"best budget\" are high-intent commercial modifiers that dramatically improve conversion rates yet most Indian sellers never include price-bracket terms in their backend keyword fields." },
                { n:3, t:"Doing Keyword Research Once at Launch",
                  b:"Search trends on Amazon.in shift seasonally, festival to festival, and as new competitors enter categories. A keyword strategy built in January is partially obsolete by Diwali. Sellers who don't continuously update their keyword sets lose ground silently, one rank position at a time." },
                { n:4, t:"Leaving Backend Keyword Fields Empty or Duplicated",
                  b:"Amazon provides 250 bytes of backend search terms per ASIN invisible to buyers, visible to the algorithm. Most Indian SMB sellers either leave these fields empty or copy-paste their product title, wasting the entire field on duplicate terms. This is one of the easiest rank wins available and almost no one uses it correctly." },
                { n:5, t:"Tracking Rankings Only Not Competitor Keyword Movements",
                  b:"Knowing you're ranked P7 for \"office chair\" tells you where you are. Knowing your top competitor just started ranking P2 for \"lumbar support chair work from home\" a term you haven't even added to your listing tells you where you're about to fall behind. Competitor keyword monitoring is the difference between reactive and proactive SEO." },
              ].map(m => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body"><strong>{m.t}</strong><p>{m.b}</p></div>
                </div>
              ))}
            </div>

            <ArticleImg
              src="/keyword-gap-analysis-dashboard.png"
              alt="Keyword gap analysis dashboard for Indian sellers showing competitor keywords and rank positions"
              caption="Keyword gap analysis view each gap sorted by estimated monthly traffic loss, with backend field recommendations per ASIN"
            />

            <div className="verdict-banner">
              <div style={{ fontSize:"clamp(18px,4vw,22px)", flexShrink:0 }}>🎯</div>
              <p style={{ margin:0, fontFamily:"'Lora',serif", fontSize:"clamp(13px,2vw,15px)", color:"#4C1D95", lineHeight:1.7 }} className="dark:text-purple-300">
                Every week without structured keyword research is a week of organic traffic being silently redirected to a competitor who does it properly.
              </p>
            </div>

            <h2 id="best-practices">Best Practices for Indian Sellers: Weekly Execution Model</h2>
            <p>The most successful Indian sellers don't do keyword research in one-time sprints they run a structured weekly rhythm that keeps their listings consistently competitive without manual effort. Daily automated digests, weekly 30-minute reviews, and monthly strategic audits keep your keyword strategy compounding without requiring a full-time SEO analyst.</p>

            {/* <ArticleImg
              src="/keyword-weekly-execution.png"
              alt="Weekly keyword research execution model for Indian Amazon sellers — daily, weekly, monthly cadence"
              caption="The three-tier keyword intelligence cadence that keeps Indian sellers consistently ahead of category rank shifts"
            /> */}

            <div style={{ display:"flex", flexDirection:"column" as const, gap:12, margin:"16px 0 24px" }}>
              {[
                { phase:"Daily Automated (0 Minutes of Your Time)", color:"#16A34A", items:[
                  "Morning WhatsApp digest: top 5 rank changes across tracked ASINs",
                  "Act on Critical Rank Drop alerts any position loss of 5+ spots on buy-intent keywords",
                  "Competitor new keyword entry alert know when a rival starts ranking for a new term in your category",
                  "Buy Box status for top 10 SKUs rank and visibility combined",
                ]},
                { phase:"Weekly 30-Minute Review Session", color:"#7C3AED", items:[
                  "Full keyword gap report identify top 10 gaps between your rank and competitor rank",
                  "Update backend fields on 2–3 ASINs using AI-generated recommendations",
                  "Check new buy-intent terms emerging in your category this week",
                  "Identify out-of-stock competitors their keyword positions are temporarily vulnerable",
                  "Adjust 1–2 listing titles using AI recommendations from rank movement data",
                ]},
                { phase:"Monthly Strategic Audit (45 Minutes)", color:"#DB2777", items:[
                  "Keyword coverage audit before festive season are all seasonal terms in your backend fields?",
                  "New product gap analysis report which keyword clusters have high volume and low competition right now?",
                  "Revenue impact review compare organic traffic and conversion before vs after last month's keyword updates",
                  "Competitor new product keyword sets what terms are rivals' new launches targeting?",
                ]},
              ].map((section, si) => (
                <div key={si} style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:section.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0, fontFamily:"'Sora',sans-serif" }}>{si+1}</div>
                    <span style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(12px,2.5vw,14px)", fontWeight:700, color:"#0D1B2A" }}>{section.phase}</span>
                  </div>
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column" as const, gap:6 }}>
                    {section.items.map((item, ii) => (
                      <li key={ii} style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(11.5px,2vw,13px)", color:"#475569", lineHeight:1.6, display:"flex", alignItems:"flex-start", gap:7 }}>
                        <span style={{ color:section.color, fontWeight:800, fontSize:11, flexShrink:0, marginTop:2 }}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h3>Key Metrics to Track Monthly</h3>
            <div className="metrics">
              {[
                { icon:"📊", t:"Keyword Gap Count",               d:"Number of high-volume terms competitors rank for that you don't. Target: reduce by 20% each month." },
                { icon:"📈", t:"Average Rank Position (Top 20)",  d:"Track your mean rank across your top 20 buy-intent keywords. Direction matters more than absolute position." },
                { icon:"🎯", t:"Backend Field Utilisation",       d:"Are your 250 backend bytes fully used with non-duplicate, India-specific terms? Most sellers use <40%." },
                { icon:"🔍", t:"New Keyword Entries (Competitor)", d:"How many new terms did your top rivals start ranking for this month? Each is a gap risk." },
                { icon:"⚡", t:"Rank Drop Alert Response Time",   d:"How quickly do you update listings after a rank drop alert? Target: within 48 hours of alert." },
                { icon:"🚀", t:"Traffic Recovery Rate",           d:"After backend keyword updates, track organic sessions per ASIN over 30-day recovery window." },
              ].map(m => (
                <div className="metric" key={m.t}>
                  <div className="metric-icon">{m.icon}</div>
                  <div><div className="metric-t">{m.t}</div><div className="metric-d">{m.d}</div></div>
                </div>
              ))}
            </div>

            <div className="mid-cta">
              <div>
                <h3>Find Your Keyword Gaps in Under 30 Minutes Free</h3>
                <p>Connect Amazon.in &amp; Flipkart. Get your first keyword gap report today. WhatsApp rank alerts included.</p>
              </div>
              <button onClick={() => setLocation("/login")} style={{ flexShrink:0, background:"#7C3AED", color:"white", padding:"11px 22px", borderRadius:8, fontWeight:700, fontSize:"clamp(13px,2vw,14.5px)", whiteSpace:"nowrap" as const, cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif", width:"100%" }} className="sm:w-auto">Try Insydz Free →</button>
            </div>

            <h2 id="best-tools">Best Tools for Amazon Keyword Research in India (2026)</h2>
            <h3>Why Global Tools Fall Short for Indian Sellers</h3>
            <p>Not all tools are built equally and for Indian sellers, the platform choice is critical. Global tools like Helium 10 and Jungle Scout are built for Amazon.com. Their keyword databases, search volume data, and intent models are calibrated for US buyers. Adapting them for India means working with the wrong baseline US search volumes for Indian ASINs, no Flipkart coverage, and no understanding of Hindi or price-bracket search patterns that define Indian buyer behaviour.</p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Amazon.in</th>
                    <th>Flipkart</th>
                    <th>WhatsApp Alerts</th>
                    <th>Buy Intent Data</th>
                    <th style={{ background:"#7C3AED" }}>Price (INR/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {toolRows.map((r, i) => (
                    <tr key={i} className={r.tool.includes("Insydz")?"hl":""}>
                      <td style={{ fontWeight:r.tool.includes("Insydz")?800:600 }}>{r.tool}</td>
                      <td>{r.amz==="Yes"?<span className="bg">Yes</span>:<span className="bo">Partial</span>}</td>
                      <td>{r.flip==="Yes"?<span className="bg">Yes</span>:<span className="br">No</span>}</td>
                      <td>{r.mee==="Yes"?<span className="bg">Yes</span>:<span className="br">No</span>}</td>
                      <td>{r.wa==="Yes"?<span className="bg">Yes</span>:<span className="br">No</span>}</td>
                      <td>{r.intent}</td>
                      <td style={{ fontWeight:r.tool.includes("Insydz")?700:400, color:r.tool.includes("Insydz")?"#6D28D9":"inherit" }}>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Full Capability Comparison India Market</h3>
            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Manual Research</th>
                    <th>Global Tools (US-first)</th>
                    <th style={{ background:"#7C3AED" }}>Insydz India-First</th>
                  </tr>
                </thead>
                <tbody>
                  {compRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600, background:"#F8FAFC" }}>{r.cap}</td>
                      <td style={{ color:"#94A3B8" }}>{r.manual}</td>
                      <td style={{ color:"#94A3B8" }}>{r.global}</td>
                      <td style={{ fontWeight:700, color:"#6D28D9" }}>{r.insydz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display:"flex", flexDirection:"column" as const, gap:8, margin:"14px 0 24px" }}>
              {[
                { icon:"🔍", title:"Full Amazon.in + Flipkart keyword database",     body:"Rank positions tracked natively on both platforms not estimated from Amazon.com data. Flipkart keyword coverage is unique to India-first tools." },
                { icon:"🗣️", title:"Hindi and Hinglish keyword detection",           body:"Regional language search terms, transliterated Hindi queries, and Hinglish product descriptors are surfaced and scored by conversion intent not filtered out." },
                { icon:"💰", title:"Price-bracket keyword intelligence",             body:"'Under 999', 'below 2000', 'best budget' modifiers are detected and scored for India-specific purchase intent the highest-conversion keyword category most sellers miss." },
                { icon:"📲", title:"WhatsApp rank drop alerts within 60 minutes",   body:"Any rank drop of 3+ positions on a tracked buy-intent keyword triggers a WhatsApp alert with the affected ASIN, term, and a recommended backend field fix." },
                { icon:"🤖", title:"AI backend field recommendations",              body:"For each keyword gap identified, the platform generates the exact text to add to your Amazon.in backend search terms field no guesswork, no duplication." },
                { icon:"🎉", title:"Festive keyword intelligence",                  body:"Pre-festive keyword audits surface seasonal search terms specific to Big Billion Days, Great Indian Festival, Diwali, and Republic Day Sale 3 weeks before the revenue window opens." },
              ].map(f => (
                <div key={f.title} style={{ background:"#F5F3FF", border:"1px solid #DDD6FE", borderRadius:10, padding:"12px 14px", display:"flex", gap:10 }}>
                  <span style={{ fontSize:"clamp(16px,3vw,20px)", flexShrink:0, marginTop:2 }}>{f.icon}</span>
                  <div>
                    <strong style={{ display:"block", fontSize:"clamp(12px,2vw,14px)", color:"#0D1B2A", marginBottom:2, fontFamily:"'Sora',sans-serif" }}>{f.title}</strong>
                    <p style={{ margin:0, fontSize:"clamp(11.5px,2vw,13.5px)", color:"#374151", lineHeight:1.6, fontFamily:"'Sora',sans-serif" }}>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-pink">
              <div className="box-label">No Aggressive Pitch</div>
              <p>If you're an Indian seller on Amazon.in or Flipkart and you're not doing structured keyword research, you're optimising based on guesswork. The question isn't whether you need a tool it's which one is built for your market and budget. For most Indian SMB sellers, that answer is clearly an India-first platform.</p>
            </div>

            <h2 id="faq">Frequently Asked Questions</h2>
            <div style={{ marginTop:16 }}>
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item${openFaq===i?" open":""}`}>
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                    <span>{faq.q}</span>
                    <span className={`faq-icon${openFaq===i?" open":""}`}>+</span>
                  </div>
                  {openFaq===i && <div className="faq-a"><p>{faq.a}</p></div>}
                </div>
              ))}
            </div>

            {/* Related */}
            <div style={{ marginTop:48, paddingTop:28, borderTop:"2px solid #E2E8F0" }}>
              <h2 style={{ fontSize:"clamp(16px,3vw,20px)", fontWeight:800, color:"#0D1B2A", margin:"0 0 18px", border:"none", padding:0, fontFamily:"'Sora',sans-serif" }} className="dark:text-white">Related Guides</h2>
              <div className="related-grid">
                {[
                  { t:"Best Review Analysis Tools for Indian Sellers: Complete Guide 2026",              tag:"Review Intelligence",  bg:"linear-gradient(135deg,#16A34A,#15803D)",   em:"💬", r:"/resources/expert-blog/best-review-analysis-tool-india" },
                  { t:"Insydz vs Helium 10: Which is the Right Tool for Indian Sellers?",               tag:"Compare",              bg:"linear-gradient(135deg,#4F46E5,#7C3AED)",   em:"⚔️", r:"/compare/insydzvshelium" },
                  { t:"Best Competitor Price Tracking Tools for Indian Sellers: The 2026 Guide",        tag:"Price Tracking",       bg:"linear-gradient(135deg,#F97316,#EA580C)",   em:"📊", r:"/features/competitor-price-tracking-feature" },
                ].map(rc => (
                  <div key={rc.t} className="rel-card" onClick={() => setLocation(rc.r)}>
                    <div className="rel-thumb" style={{ background:rc.bg }}><span>{rc.em}</span></div>
                    <div className="rel-body">
                      <div className="rel-tag">{rc.tag}</div>
                      <div className="rel-title">{rc.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div className="final-cta-block">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
          India's Smartest Amazon Keyword Tool.
        </h2>
        <p className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Lora', serif", maxWidth: 520, margin: "0 auto 24px" }}>
          Find the exact keywords your competitors rank for on Amazon.in — with Hinglish data and Flipkart coverage no global tool provides.
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", marginBottom: 20 }}>
          {["Hinglish keyword data", "Amazon.in + Flipkart", "WhatsApp rank alerts", "Free to start"].map(t => (
            <div key={t} className="text-blue-100" style={{ fontSize:"clamp(11px,2vw,13.5px)", display:"flex", alignItems:"center", gap:6, fontFamily:"'Sora',sans-serif" }}>
              <span className="text-white" style={{ fontWeight: 800 }}>✓</span> {t}
            </div>
          ))}
        </div>
        <button
          onClick={() => setLocation("/login")}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
        >
          <Zap className="w-5 h-5 flex-shrink-0 inline mr-2" />
          Get My Keyword Report Free →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          No setup · Results in 5 min · Amazon.in + Flipkart covered
        </p>
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
                © 2026 <span className="text-purple-400 font-semibold">Insydz</span>. All rights reserved. Designed & Developed in India 🇮🇳
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


