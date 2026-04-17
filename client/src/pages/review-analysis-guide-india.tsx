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
  { id:"what-is",        label:"What is a Review Analysis Tool?" },
  { id:"why-critical",   label:"Why Review Analysis is Critical" },
  { id:"how-it-works",   label:"How AI Review Analysis Works" },
  { id:"types",          label:"Types of Review Intelligence" },
  { id:"mistakes",       label:"5 Common Mistakes Brands Make" },
  { id:"best-practices", label:"Weekly Execution Model" },
  { id:"best-tools",     label:"Best Tools for India 2026" },
  { id:"faq",            label:"Frequently Asked Questions" },
];

const FAQS = [
  {
    q: "What is the best review analysis tool for Indian sellers?",
    a: "For Indian D2C brands selling on Amazon.in, Flipkart, the best review analysis tool is one built specifically for Indian marketplace reviews not adapted from a US-first social listening platform. The key differentiators are: native support for Amazon.in and Flipkart review APIs, Hindi and Hinglish sentiment processing, competitor ASIN review mining, and WhatsApp alert delivery. Insydz is built from the ground up for this use case, with a free plan that covers entry-level review intelligence and paid plans starting at ₹1,999/month.",
  },
  {
    q: "How is Amazon sentiment analysis different from social media listening?",
    a: "Social media listening tools track brand mentions on Twitter and Instagram. Amazon sentiment analysis processes structured product reviews understanding specific complaints about packaging, product defects, delivery, sizing, and feature gaps. For Indian D2C sellers, product review sentiment is far more actionable than social mentions: it reflects buyers who have already purchased, experienced the product, and taken time to document what went wrong. Social listening captures brand perception; review analysis captures product reality.",
  },
  {
    q: "Can I analyse competitor reviews — not just my own products?",
    a: "Yes. With India-first tools like Insydz. Competitor review mining allows you to add rival ASINs and automatically cluster their negative reviews into product gaps and complaint themes. This gives you a real-time feed of what your category's buyers wish was better which directly informs your product sourcing, listing copy, and pricing strategy. Most Indian D2C brands that start using competitor review mining consistently cite it as the highest-ROI feature in their intelligence stack.",
  },
  {
    q: "How quickly can review analysis improve my star rating?",
    a: "Brands acting on AI-identified complaint clusters within 14 days typically see measurable rating improvement within 30–60 days, as new positive reviews from fixed-product buyers dilute the previously high negative cluster. Listing copy changes — updating titles and bullets to address common objections and mirror positive review language show conversion rate lift within 2–4 weeks. Supply chain fixes (sourcing improvements, packaging upgrades) take 6–10 weeks to flow through to visible rating changes.",
  },
  {
    q: "Does review analysis work for Flipkart not just Amazon?",
    a: "Yes. With the right tool. Brandwatch, Sprinklr, and most global sentiment tools have zero Flipkart review data. India-first platforms like Insydz track review sentiment across all three Indian marketplaces simultaneously. This matters because complaint patterns differ by platform: Flipkart buyers disproportionately flag delivery and packaging issues; Amazon.in buyers engage more with product specifications and feature accuracy.",
  },
  {
    q: "How much do review analysis tools cost for Indian D2C brands?",
    a: "Global social listening tools (Brandwatch, Sprinklr) cost ₹15,000–40,000/month. Amazon Seller Central's built-in review tab is free but provides zero AI analysis. Insydz offers a free plan and paid plans from ₹1,999/month, covering full AI review analytics across Amazon.in, Flipkart with competitor mining, WhatsApp alerts, and Hinglish sentiment processing included from the Starter tier.",
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

export default function BestReviewAnalysisToolIndia() {
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

  const reviewTypes = [
    { icon:"🔴", type:"Product Defect Reviews",        desc:"Complaints about physical quality, breakage, missing parts, wrong specifications",               action:"Trigger supplier escalation; update listing title with defect-addressing copy",    impact:"Fixes return rate" },
    { icon:"📦", type:"Packaging & Delivery Reviews",  desc:"Damaged in transit, poor packing material, missing protective layers",                           action:"Flag to logistics; upgrade packaging; add fragile sticker protocol",              impact:"Protects star rating" },
    { icon:"📏", type:"Size & Fit Reviews",             desc:"'Smaller than expected', 'doesn't fit Indian sizing', measurement inaccuracies",                 action:"Add size chart; update dimensions in listing; add comparison image",              impact:"Cuts 20–30% of negatives" },
    { icon:"🔧", type:"Feature Gap Reviews",            desc:"Buyers wishing for a feature your competitor already offers",                                     action:"Product roadmap input or listing copy update to highlight existing features",      impact:"Conversion uplift 5–12%" },
    { icon:"🎯", type:"Competitor Gap Reviews",         desc:"Your rivals' reviews revealing what their customers consistently hate",                           action:"Counter-message those pain points directly in your listing bullets and title",     impact:"Market share gain" },
    { icon:"⭐", type:"Positive Theme Clusters",        desc:"Recurring phrases in 5-star reviews — what buyers love most in their exact language",             action:"Mirror that vocabulary in title, bullets, A+ content, and sponsored ad copy",      impact:"CTR + CVR lift" },
    { icon:"📉", type:"Review Velocity Signals",        desc:"Sudden drop in new review rate — may indicate suppression or listing quality issue",              action:"Trigger review request campaign; audit listing health score",                     impact:"Ranking protection" },
  ];

  const compRows = [
    { cap:"Amazon.in Review Coverage",      manual:"Manual only",          global:"Zero — US Amazon only",        insydz:"Full Amazon.in coverage" },
    { cap:"Flipkart Review Analysis",       manual:"Manual only",          global:"Not supported",                insydz:"Native integration" },
    { cap:"Hindi & Hinglish Processing",    manual:"No",                   global:"English only",                 insydz:"Native NLP for both" },
    { cap:"Competitor Review Mining",       manual:"1–3 hrs/product",      global:"US ASINs only",                insydz:"Automated, all 3 platforms" },
    { cap:"AI Complaint Clustering",        manual:"No",                   global:"Basic topic detection",        insydz:"Full issue taxonomy" },
    { cap:"WhatsApp Alerts",                manual:"Not available",        global:"Email only",                   insydz:"Within 60 min of new review" },
    { cap:"Listing Copy Recommendations",   manual:"Not available",        global:"Not available",                insydz:"Bullet rewrites from reviews" },
    { cap:"Festive Trend Intelligence",     manual:"Not available",        global:"Not available",                insydz:"Diwali, BBD, GIF patterns" },
    { cap:"Pricing",                        manual:"Your time (5+ hrs/wk)", global:"₹15,000–40,000/month",       insydz:"Free – ₹1,999/month" },
  ];

  const toolRows = [
    { tool:"Amazon Seller Central (built-in)", review:"Basic star filter only",    platforms:"Amazon.in only",            hinglish:"No",  wa:"No",  price:"Free" },
    { tool:"Brandwatch",                       review:"Social mentions only",       platforms:"Twitter, Instagram only",   hinglish:"No",  wa:"No",  price:"₹15,000–40,000" },
    { tool:"Helium 10 (Review Insights)",      review:"Amazon.com reviews only",    platforms:"Amazon.com only",           hinglish:"No",  wa:"No",  price:"₹3,300–8,300" },
    { tool:"Jungle Scout",                     review:"Limited review data",        platforms:"Amazon only",               hinglish:"No",  wa:"No",  price:"₹3,800–8,000" },
    { tool:"Insydz",                           review:"Full AI review intelligence", platforms:"Amazon.in + Flipkart", hinglish:"Yes", wa:"Yes", price:"Free – ₹1,999" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes imgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#db2777,#7c3aed);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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
        .article-body li::marker{color:#F97316}
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
        .box-indigo{background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px}
        .box-indigo .box-label{color:#4F46E5}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-pink{background:#500724;border-color:#9d174d}
        .dark .box-indigo{background:#1e1b4b;border-color:#3730a3}

        .steps{display:flex;flex-direction:column;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.steps{gap:12px;margin:20px 0 28px}}
        .step{display:flex;gap:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{background:#111827;border-color:#1f2937}
        .step-n{flex-shrink:0;width:30px;height:30px;background:#F97316;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
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
        table.dt tbody tr:hover td{background:#FFF7ED}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}
        table.dt tr.hl td{background:#FFF7ED!important;border-left:3px solid #F97316}
        table.dt tr.hl td:first-child{font-weight:700;color:#F97316}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bg{padding:2px 8px;font-size:11.5px}}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.br{padding:2px 8px;font-size:11.5px}}

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
        .faq-item.open{border-color:#F97316}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0D1B2A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px;gap:12px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F8FAFC}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#FFEDD5;color:#F97316;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        @media(min-width:640px){.faq-icon{width:22px;height:22px;font-size:16px}}
        .faq-icon.open{transform:rotate(45deg);background:#F97316;color:white}
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
        .rel-tag{font-size:10px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-tag{font-size:10.5px;margin-bottom:6px}}
        .rel-title{font-size:12px;font-weight:700;color:#0D1B2A;line-height:1.4;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-title{font-size:13px}}
        .dark .rel-title{color:#f9fafb}

        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#431407;color:#fb923c}

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
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#F97316;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        .metrics{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 22px}
        @media(min-width:480px){.metrics{grid-template-columns:1fr 1fr;gap:12px}}
        @media(min-width:640px){.metrics{gap:14px;margin:20px 0 28px}}
        .metric{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;display:flex;gap:10px;align-items:flex-start}
        @media(min-width:640px){.metric{padding:18px;gap:14px}}
        .dark .metric{background:#111827;border-color:#1f2937}
        .metric-icon{flex-shrink:0;width:32px;height:32px;border-radius:8px;background:#FFEDD5;display:flex;align-items:center;justify-content:center;font-size:16px}
        @media(min-width:640px){.metric-icon{width:38px;height:38px;border-radius:9px;font-size:18px}}
        .metric-t{font-size:12.5px;font-weight:700;color:#0D1B2A;margin-bottom:3px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.metric-t{font-size:13.5px}}
        .dark .metric-t{color:#f9fafb}
        .metric-d{font-size:11.5px;color:#64748B;line-height:1.5;font-family:'Sora',sans-serif}
        @media(min-width:640px){.metric-d{font-size:12.5px}}

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

        .verdict-banner{background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border:2px solid #FED7AA;border-radius:12px;padding:16px;margin:22px 0;display:flex;gap:12px;align-items:flex-start}
        @media(min-width:640px){.verdict-banner{padding:22px 24px;margin:28px 0;gap:16px}}
        .dark .verdict-banner{background:#431407;border-color:#78350f}

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
          <span style={{ color:"#94A3B8" }}>Best Review Analysis Tools India</span>
        </div>
      </div>

      {/* HERO */}
      <div className="article-hero">
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F0FDF4", color:"#16A34A", fontSize:"clamp(10px,2vw,11.5px)", fontWeight:700, letterSpacing:.6, textTransform:"uppercase" as const, padding:"4px 12px", borderRadius:20, marginBottom:14 }}>
          <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          D2C Growth &amp; Brand Intelligence
        </div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,4vw,40px)", fontWeight:800, lineHeight:1.18, color:"#0D1B2A", letterSpacing:"-.5px", marginBottom:14, maxWidth:820 }} className="dark:text-white">
          Best <span style={{ color:"#16A34A" }}>Review Analysis Tools</span> for Indian Sellers: Complete Guide (2026)
        </h1>
        <p style={{ fontFamily:"'Lora',serif", fontSize:"clamp(14px,2vw,17px)", color:"#475569", lineHeight:1.65, maxWidth:760, marginBottom:16 }} className="dark:text-gray-400">
          Your customers are telling you exactly what to fix and why they're switching to a competitor inside every review. Discover how India's top D2C brands use AI review intelligence to reduce returns and grow revenue.
        </p>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong style={{ color:"#0D1B2A" }}>Insydz Research Team</strong></div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />January 2026</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong>14 min read</strong></div>
          <span style={{ background:"#FFEDD5", color:"#F97316", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Updated for 2026</span>
          <span style={{ background:"#F0FDF4", color:"#16A34A", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>D2C Strategy Guide</span>
        </div>

        <div className="stat-strip" style={{ marginBottom:24 }}>
          {[
            ["18%",         "Return Rate Reduction with AI Review Analysis"],
            ["₹52,000/mo",  "Average Revenue Recovered in 90 Days"],
            ["91%",         "Indian Online Buyers Read Reviews Before Purchase"],
            ["₹1,999/mo",   "Insydz Starter Full Review Intelligence"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span style={{ display:"block", fontSize:"clamp(20px,4vw,26px)", fontWeight:800, color:"#16A34A", fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{num}</span>
              <span style={{ display:"block", fontSize:"clamp(10px,2vw,11.5px)", color:"#64748B", marginTop:4, lineHeight:1.4, fontWeight:500 }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Image */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px" }} className="sm:px-5 lg:px-6">
        <ArticleImg
          src="/review-analysis-hero.png?v=2"
          alt="Best review analysis tool for Indian sellers on Amazon.in and Flipkart AI dashboard"
          caption="Insydz AI review intelligence dashboard automatically clusters complaints, surfaces competitor gaps, and delivers WhatsApp alerts across Amazon.in, Flipkart"
        />
      </div>

      {/* KEY TAKEAWAYS */}
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"0 16px 28px" }} className="sm:px-5 lg:px-6">
        <div className="takeaway-box">
          <h3>Key Takeaways</h3>
          {[
            "Indian D2C brands implementing AI-powered review analysis reduce return rates by 18% and recover ₹52,000/month in lost revenue within 90 days of acting on the intelligence.",
            "91% of Indian online buyers read product reviews before purchasing. Your review score is not a vanity metric it is a direct conversion rate driver and ranking signal on both Amazon.in and Flipkart.",
            "Amazon's A10 algorithm and Flipkart's ranking engine use review velocity and star rating as direct input signals. A single unresolved complaint cluster can depress your organic ranking for months.",
            "The most sophisticated Indian D2C brands don't just analyse their own reviews they mine competitor reviews to find exact product gaps and positioning opportunities the market hasn't filled yet.",
            "During Big Billion Days and Great Indian Festival, review volume spikes 4–6× for most categories. An unresolved complaint cluster that generates 10 negative reviews per month generates 50–60 during festive season.",
            "Global social listening tools (Brandwatch, Sprinklr) have zero Flipkart review data. India-first tools are not a nice-to-have they are a requirement for accurate review intelligence.",
            "The best review analysis tools for Indian sellers process Hindi, Hinglish, and English natively not via forced translation that destroys sentiment accuracy before analysis even begins.",
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
            <h4 className="sidebar-cta-title">Start Free See Your Review Intelligence</h4>
            <p className="sidebar-cta-body">Amazon.in, Flipkart &amp;. Hindi + Hinglish + English. WhatsApp alerts included.</p>
            <ul style={{ listStyle:"none", padding:0, margin:"0 0 14px" }}>
              {["Competitor ASIN review mining","Hinglish + Hindi NLP processing","WhatsApp alerts for new clusters","Free plan — no credit card needed"].map(f => (
                <li key={f} style={{ fontSize:11.5, color:"#CBD5E1", marginBottom:7, display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.4, fontFamily:"'Sora',sans-serif" }}>
                  <span style={{ color:"#16A34A", fontWeight:800, flexShrink:0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => setLocation("/login")} style={{ display:"block", background:"#16A34A", color:"white", textAlign:"center" as const, padding:10, borderRadius:8, fontWeight:700, fontSize:12.5, width:"100%", cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif" }}>
              Start Free No Card Needed
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
            Table of Contents <span>{tocOpen?"▲":"▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen?" open":""}`}>
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>
            ))}
          </div>

          <article className="article-body">

            <div className="box box-indigo" style={{ margin:"0 0 28px" }}>
              <div className="box-label">In Simple Terms</div>
              <p>A review analysis tool for India is software that automatically reads, clusters, and scores every customer review across Amazon.in, Flipkart then surfaces the exact product defects, listing gaps, and competitor weaknesses hiding in plain sight. It turns 10,000 reviews you'd never have time to read into 5 specific decisions you can act on this week.</p>
            </div>

            <h2 id="what-is">What is a Review Analysis Tool for Indian Sellers?</h2>
            <p>A review analysis tool for India is software that automatically reads, clusters, and scores every customer review across Amazon.in, Flipkart surfacing the exact product and listing issues driving 1-star reviews before they compound into a rating drop that impacts your organic ranking and conversion rate.</p>
            <p>Unlike generic social listening tools built for brand mentions on Twitter or Instagram, India-focused review analysis tools are designed for marketplace product reviews the structured, purchase-verified feedback that directly influences your category ranking, buy box eligibility, and conversion rate on India's top e-commerce platforms.</p>
            <p>Indian D2C brands on Amazon.in receive an average of <strong>80–400 new reviews per month per ASIN</strong>. At that volume, manual review reading captures less than 10% of the signal. AI review intelligence dashboards surface the exact product and listing issues driving 1-star reviews before they compound into a rating drop that is expensive and slow to reverse.</p>

            <h2 id="why-critical">Why Review Analysis is Critical for Indian D2C Brands</h2>
            <h3>India's E-commerce Buyers Are the Most Review-Reliant in the World</h3>
            <p>A 2026 study found that <strong>91% of Indian online buyers read product reviews</strong> before purchasing — higher than the US (88%) and significantly higher than global averages. This makes your review score not a vanity metric, but a direct conversion rate driver and a primary trust signal for first-time buyers in a market where brand familiarity is still being established.</p>

            <h3>Rating Damage is Silent and Algorithmic</h3>
            <p>Amazon's A10 algorithm and Flipkart's ranking engine both use review velocity and star rating as direct input signals. When your rating drops below 4.0, you don't just lose buyer trust you lose organic rank, which reduces visibility, which reduces new sales, which reduces new reviews, which makes the rating harder to recover. A single unresolved complaint cluster can depress your organic ranking for 3 to 6 months before you even notice the connection.</p>

            <div className="box box-amber">
              <div className="box-label">Real Brand: Mumbai Home Decor D2C Seller</div>
              <p>A Mumbai-based D2C brand selling decorative lighting on Amazon.in and Flipkart was at 3.9 stars with 22% of their negative reviews citing 'bulb not included in box' a listing clarity issue, not a product defect. After AI review analysis surfaced this cluster, they updated their listing title, added a packaging insert, and updated the main image to show the bulb separately. Within 45 days, their rating recovered to 4.3 stars. The fix cost ₹0 in product changes and 2 hours of listing work.</p>
              <p><strong>The revenue impact: conversion rate improved 14%, driving ₹68,000/month in incremental sales from the same organic traffic.</strong></p>
            </div>

            <h3>Competitor Review Mining is an Untapped Product Strategy</h3>
            <p>The most sophisticated D2C brands in India aren't just analysing their own reviews — they're mining competitor reviews to find the exact product gaps and pain points their category's buyers wish were solved. If your top competitor has 400 reviews at 3.8 stars and 31% of negative reviews mention 'remote stops working after 2 months', that's not just their problem that's your positioning opportunity. Put 'remote with 12-month replacement guarantee' in your listing title and see what happens to your conversion rate.</p>

            <h3>The Festive Season Amplifies Every Unresolved Review Cluster</h3>
            <p>During Big Billion Days and Great Indian Festival, review volume spikes <strong>4–6× for most categories</strong>. An unresolved complaint cluster that generates 10 negative reviews per month generates 50–60 during the festive surge. Brands that enter the festive season with known complaint clusters unresolved don't just lose the sale — they lose the rating permanently, because the festive review damage is harder to dilute with positive reviews in the slower post-festive months.</p>

            <ArticleImg
              src="/review-analysis-india-platform.png"
              alt="Review analysis platform showing Amazon.in, Flipkart coverage for Indian sellers"
              caption="India-first review intelligence covers all three major marketplaces Amazon.in, Flipkart with native Hindi and Hinglish NLP processing"
            />

            <h2 id="how-it-works">How Does AI Review Analysis Work?</h2>
            <p>Modern tools have replaced the manual spreadsheet workflow with a 5-step automated intelligence loop:</p>

            <div className="steps">
              {[
                { n:1, t:"Connect Your Product ASINs", d:"Link your Amazon.in, Flipkart product pages. The tool begins ingesting all historical reviews and sets up real-time monitoring for new reviews yours and your competitor ASINs." },
                { n:2, t:"NLP Analysis & Topic Clustering", d:"The AI engine reads every review and uses natural language processing to identify recurring themes grouping semantically similar complaints and compliments into clusters like 'packaging damage', 'size inaccuracy', 'feature gap', and 'delivery issue'." },
                { n:3, t:"Sentiment Scoring & Rating Breakdown", d:"Each cluster is scored by sentiment polarity and weighted by frequency and recency. The tool builds a real-time rating breakdown showing exactly which complaint clusters are responsible for what percentage of your 1-star and 2-star reviews." },
                { n:4, t:"WhatsApp Alert on New Complaint Clusters", d:"The moment a new negative theme appears in more than 3 reviews within a 48-hour window, you receive a WhatsApp alert with the complaint summary, affected ASINs, and a recommended action. For Indian sellers, WhatsApp delivery means action happens not email digests that get read 3 days later." },
                { n:5, t:"Actionable AI Recommendation", d:"The platform delivers specific decisions: 'Update listing bullet point 2 and add packaging insert estimated rating improvement 0.3 stars in 60 days.' Not just data. Specific actions with projected outcomes." },
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body"><strong>{s.t}</strong><p>{s.d}</p></div>
                </div>
              ))}
            </div>

            <div className="box box-green">
              <div className="box-label">The Core Insight</div>
              <p>Reading reviews tells you what one buyer said. AI cluster analysis tells you that 31% of your negative reviews share the same root cause and that fixing it will measurably improve your rating within 45 days. The difference is the difference between customer service and product strategy.</p>
            </div>

            <h2 id="types">Types of Review Intelligence Indian Brands Must Track</h2>
            <p>Not all review insights are equal. Here's how AI clustering breaks down the signal from the noise across your Amazon.in and Flipkart product reviews:</p>

            <ArticleImg
              src="/review-intelligence-types.png"
              alt="Types of review intelligence for Indian D2C brands complaint clusters and signal taxonomy"
              caption="Seven categories of review intelligence automatically detected by AI each mapped to a specific product or listing action"
            />

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Review Intelligence Type</th>
                    <th>What the AI Detects</th>
                    <th>Action for Indian Sellers</th>
                    <th>Revenue Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewTypes.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:700, whiteSpace:"nowrap" as const }}><span style={{ marginRight:5 }}>{r.icon}</span>{r.type}</td>
                      <td style={{ color:"#475569" }}>{r.desc}</td>
                      <td style={{ color:"#475569" }}>{r.action}</td>
                      <td><span className="bg">{r.impact}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="box box-teal">
              <div className="box-label">India-First vs Global Tool Coverage</div>
              <p>India-first tools provide full marketplace review intelligence across Amazon.in, Flipkart global tools see only social media mentions, leaving the most purchase-verified, actionable customer intelligence completely invisible.</p>
            </div>

            <h2 id="mistakes">5 Common Mistakes Indian D2C Brands Make with Review Analysis</h2>
            <p>Each of these mistakes silently costs Indian D2C brands rating points and therefore conversion rate and revenue — every week they go uncorrected.</p>

            <div className="mistakes">
              {[
                { n:1, t:"Using the Star Average as a Health Metric",
                  b:"A 4.1-star average is not a health signal. The real signal is the complaint cluster percentage and its trend direction. A product at 4.1 stars with 28% of negative reviews mentioning one fixable defect is a product with a solvable problem. A product at 4.1 stars with complaints spread across 12 unrelated issues needs a fundamentally different intervention but you can't tell the difference from the number alone." },
                { n:2, t:"Only Analysing Their Own Reviews",
                  b:"Your competitors' reviews are free product research that most Indian D2C brands are leaving entirely untapped. The reviews your rivals' buyers leave are telling the entire category exactly what problems the current product standard doesn't solve. Sellers who read those reviews systematically consistently find 2–3 differentiation angles their competitors haven't addressed and put those angles directly in their listing title." },
                { n:3, t:"Reacting to Individual Reviews Instead of Clusters",
                  b:"A single 1-star review saying 'charging cable too short' is noise. Twenty reviews in 60 days all citing 'cable length issue' is a product specification problem with a sourcing solution. Sellers who react to individual reviews spend energy on customer service responses. Sellers who detect clusters spend energy on root-cause fixes that eliminate the source of the negative reviews entirely." },
                { n:4, t:"Treating Review Language as Separate From Listing Copy",
                  b:"The exact words buyers use in 5-star reviews are the exact search terms their buying-intent peers will type into the Amazon search bar. Mining positive review language and putting it directly into your listing title, bullets, and A+ content is the highest-conversion listing optimisation available and it's sitting in your own review section, unused." },
                { n:5, t:"Running a One-Time Audit Instead of Continuous Monitoring",
                  b:"Competitor listings change. New sellers enter with different defect patterns. Seasonal usage creates new complaint clusters: monsoon-related corrosion in electronics, AC compatibility issues in appliances, gifting suitability during Diwali season. A one-time audit gives you a snapshot. Continuous monitoring gives you a competitive radar that updates every 48 hours." },
              ].map(m => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body"><strong>{m.t}</strong><p>{m.b}</p></div>
                </div>
              ))}
            </div>

            <ArticleImg
              src="/review-analysis-dashboard-clusters.png?v=2"
              alt="AI review complaint cluster dashboard for Indian D2C brands on Amazon.in and Flipkart"
              caption="Complaint cluster breakdown by percentage showing which issues are growing vs shrinking and their projected impact on star rating trajectory"
            />

            <div className="verdict-banner">
              <div style={{ fontSize:"clamp(18px,4vw,22px)", flexShrink:0 }}>🎯</div>
              <p style={{ margin:0, fontFamily:"'Lora',serif", fontSize:"clamp(13px,2vw,15px)", color:"#92400E", lineHeight:1.7 }} className="dark:text-amber-300">
                Every week without review intelligence is a week of product and listing failures compounding silently while a competitor who is reading the same market data is acting on it.
              </p>
            </div>

            <h2 id="best-practices">Best Practices for Indian D2C Brands: Weekly Execution Model</h2>
            <p>The most successful Indian D2C brands on Amazon.in and Flipkart don't react to review damage they run a structured weekly rhythm that catches complaint clusters before they reach critical mass. Daily automated alerts, weekly 30-minute reviews, and monthly strategic audits keep your review intelligence compounding without requiring a full-time analyst.</p>

            <ArticleImg
              src="/review-weekly-execution-model.png"
              alt="Weekly review intelligence execution model for Indian D2C brands"
              caption="The three-tier review intelligence cadence daily alerts, weekly review, monthly strategic audit"
            />

            <div style={{ display:"flex", flexDirection:"column" as const, gap:12, margin:"16px 0 24px" }}>
              {[
                { phase:"Daily (Automated — 0 Minutes of Your Time)", color:"#16A34A", items:[
                  "New 1-star and 2-star reviews flagged via WhatsApp within 60 minutes of posting",
                  "New complaint clusters detected when 3+ reviews cite the same issue within 48 hours",
                  "Competitor review velocity alerts if a rival accumulates reviews unusually fast, you know within 24 hours",
                  "Listing health score updates based on new review language vs your current listing copy alignment",
                ]},
                { phase:"Weekly (30 Minutes Your Strategic Review Session)", color:"#4F46E5", items:[
                  "Review your weekly sentiment digest: which complaint category increased by more than 3 percentage points?",
                  "Check competitor review mining updates: have their top complaint clusters shifted?",
                  "Identify the one listing copy update that would address your highest-frequency complaint cluster",
                  "Update listing bullets with new positive review vocabulary that emerged this week",
                  "Flag any supply chain issues to your sourcing team based on durability or quality complaint trends",
                ]},
                { phase:"Monthly (45 Minutes Strategic Brand Review)", color:"#DB2777", items:[
                  "Full competitor review landscape audit: which rivals have improved their complaint profiles? Which have new vulnerabilities?",
                  "Map your top 3 complaint clusters to specific product improvement briefs for your supplier",
                  "Reconcile your listing copy against your current positive review language update wherever buyer vocabulary has drifted",
                  "Plan festive season listing updates: what did your category's reviews say after the last Diwali or Big Billion Days surge?",
                  "Set review velocity benchmarks for the next month based on historical category data",
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
                { icon:"📊", t:"Complaint Cluster % by Category",     d:"Percentage of 1–2 star reviews in each cluster. Target: below 8% per cluster before festive season." },
                { icon:"📈", t:"Cluster Trend Direction",             d:"Is your top complaint category growing or shrinking month-over-month? Direction matters more than absolute number." },
                { icon:"🎯", t:"Competitor Gap Coverage Score",       d:"What % of your competitors' top 3 complaint clusters does your listing directly address?" },
                { icon:"📝", t:"Review Vocabulary Match Rate",        d:"How much of your 5-star review language appears verbatim in your listing title and first 3 bullets?" },
                { icon:"⭐", t:"Rating Trend (Weekly Moving Average)", d:"A product at 4.1 trending to 4.3 is healthier than one at 4.4 trending to 4.2. Direction is the signal." },
                { icon:"🚀", t:"Review Velocity vs Category Average", d:"Sudden drops vs category baseline may indicate review suppression or listing quality flag." },
              ].map(m => (
                <div className="metric" key={m.t}>
                  <div className="metric-icon">{m.icon}</div>
                  <div><div className="metric-t">{m.t}</div><div className="metric-d">{m.d}</div></div>
                </div>
              ))}
            </div>

            <div className="mid-cta">
              <div>
                <h3>Start Your Review Intelligence in 30 Minutes Free</h3>
                <p>Connect Amazon.in, Flipkart &amp;. Get your first complaint cluster report today. WhatsApp alerts included.</p>
              </div>
              <button onClick={() => setLocation("/login")} style={{ flexShrink:0, background:"#16A34A", color:"white", padding:"11px 22px", borderRadius:8, fontWeight:700, fontSize:"clamp(13px,2vw,14.5px)", whiteSpace:"nowrap" as const, cursor:"pointer", border:"none", fontFamily:"'Sora',sans-serif", width:"100%" }} className="sm:w-auto">Try Insydz Free →</button>
            </div>

            <h2 id="best-tools">Best Tools for Amazon Review Analysis in India (2026)</h2>
            <h3>Why Global Tools Fall Short for Indian Sellers</h3>
            <p>Several established platforms offer review analysis as part of their broader e-commerce intelligence suites Helium 10's Review Insights, Jungle Scout's Review Automation, and social listening platforms like Brandwatch and Sprinklr. For Indian D2C sellers, an honest assessment: none of them were built for the Indian marketplace. Their primary data infrastructure is Amazon.com, and their sentiment models are trained on English-language reviews. For sellers whose buyers write in Hindi, Hinglish, and English and who need Flipkart coverage these tools are fundamentally blind to a large portion of the most relevant market signal.</p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Review Analysis</th>
                    <th>India Platform Coverage</th>
                    <th>Hinglish NLP</th>
                    <th>WhatsApp Alerts</th>
                    <th style={{ background:"#16A34A" }}>Price (INR/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {toolRows.map((r, i) => (
                    <tr key={i} className={r.tool==="Insydz"?"hl":""}>
                      <td style={{ fontWeight:r.tool==="Insydz"?800:600 }}>{r.tool}</td>
                      <td>{r.review}</td>
                      <td>{r.platforms}</td>
                      <td>{r.hinglish==="Yes"?<span className="bg">Yes</span>:<span className="br">No</span>}</td>
                      <td>{r.wa==="Yes"?<span className="bg">Yes</span>:<span className="br">No</span>}</td>
                      <td style={{ fontWeight:r.tool==="Insydz"?700:400, color:r.tool==="Insydz"?"#15803D":"inherit" }}>{r.price}</td>
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
                    <th>Manual Reading</th>
                    <th>Global Tools (US-first)</th>
                    <th style={{ background:"#16A34A" }}>Insydz India-First</th>
                  </tr>
                </thead>
                <tbody>
                  {compRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600, background:"#F8FAFC" }}>{r.cap}</td>
                      <td style={{ color:"#94A3B8" }}>{r.manual}</td>
                      <td style={{ color:"#94A3B8" }}>{r.global}</td>
                      <td style={{ fontWeight:700, color:"#15803D" }}>{r.insydz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display:"flex", flexDirection:"column" as const, gap:8, margin:"14px 0 24px" }}>
              {[
                { icon:"🗣️", title:"Native Hindi, Hinglish &amp; English NLP",              body:"Sentiment is scored in the language the review was written not after force-translation. 'Bilkul bekaar hai' is classified as strongly negative with the same accuracy as 'completely useless'." },
                { icon:"🏪", title:"Amazon.in + Flipkart simultaneously",         body:"Platform-specific complaint patterns are tracked and surfaced separately. Flipkart buyers disproportionately flag delivery issues;. You see the full picture." },
                { icon:"🔍", title:"Competitor ASIN review mining automated",           body:"Add any competitor's ASIN and Insydz clusters their reviews with the same taxonomy as yours. You see their top complaint categories, positive themes, and feature gaps in real time." },
                { icon:"📲", title:"WhatsApp-first alert delivery",                       body:"New complaint clusters and critical individual reviews reach you via WhatsApp within 60 minutes. For Indian SMB operators who check WhatsApp 50× a day, this is the difference between acting and archiving." },
                { icon:"✍️", title:"AI listing copy recommendations",                    body:"Specific bullet point rewrites generated from your positive review clusters and your competitors' negative review language the highest-conversion listing optimisation available." },
                { icon:"🎉", title:"Festive season trend intelligence",                   body:"Pre-festive complaint pattern audits so you know exactly which issues to resolve before Big Billion Days and Great Indian Festival review volume spikes 4–6×." },
              ].map(f => (
                <div key={f.title} style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"12px 14px", display:"flex", gap:10 }}>
                  <span style={{ fontSize:"clamp(16px,3vw,20px)", flexShrink:0, marginTop:2 }}>{f.icon}</span>
                  <div>
                    <strong style={{ display:"block", fontSize:"clamp(12px,2vw,14px)", color:"#0D1B2A", marginBottom:2, fontFamily:"'Sora',sans-serif" }} dangerouslySetInnerHTML={{ __html: f.title }} />
                    <p style={{ margin:0, fontSize:"clamp(11.5px,2vw,13.5px)", color:"#374151", lineHeight:1.6, fontFamily:"'Sora',sans-serif" }}>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-pink">
              <div className="box-label">The Honest Test</div>
              <p>A review analysis tool is only as useful as the reviews it can actually read. For Indian D2C brands, that means native Amazon.in data, Flipkart coverage, and Hinglish NLP. Tools that don't pass this test aren't giving you Indian market intelligence they're giving you a partial picture of a US market you're not competing in.</p>
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
                  { t:"AI Review Intelligence Tool for Amazon & Flipkart Sellers: Complete Guide", tag:"Review Intelligence", bg:"linear-gradient(135deg,#16A34A,#15803D)", em:"💬", r:"/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers" },
                  { t:"Insydz vs Helium 10: Which is the Right Tool for Indian Sellers?",           tag:"Compare",            bg:"linear-gradient(135deg,#4F46E5,#7C3AED)", em:"⚔️", r:"/compare/insydzvshelium" },
                  { t:"Amazon SEO Tool India: The Complete 2026 Guide for Indian Sellers",          tag:"SEO Guide",          bg:"linear-gradient(135deg,#0D9488,#0891B2)", em:"🔍", r:"/use-cases/improve-seo" },
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
          Your Reviews Are Telling You Something. Are You Listening?
        </h2>
        <p className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg" style={{ fontFamily: "'Lora', serif", maxWidth: 520, margin: "0 auto 24px" }}>
          Insydz analyses thousands of reviews in Hindi, Hinglish &amp; English — and tells you exactly what to fix, via WhatsApp.
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", marginBottom: 20 }}>
          {["Hindi + Hinglish support", "AI review intelligence", "WhatsApp alerts in 60 min", "Free forever"].map(t => (
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
          Get My Review Report Free →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          Amazon.in + Flipkart · No setup · No card needed
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


