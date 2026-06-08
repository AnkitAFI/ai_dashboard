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
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { useTheme } from "next-themes";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaPrivateLabel = {
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
      "@id": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026",
      "url": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026",
      "name": "Amazon Private Label Guide India 2026: Everything You Need to Know",
      "description": "Learn everything about starting an Amazon Private Label business in India for 2026. How to find products, source suppliers, and build a brand.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon Private Label India 2026", "item": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#article",
      "headline": "Amazon Private Label Guide India 2026: Everything You Need to Know",
      "description": "A comprehensive guide to starting an Amazon Private Label business in India for 2026. Replicating the success of top brands.",
      "image": "https://insydz.com/Amazon-Vine-India-image1.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-15",
      "dateModified": "2026-05-15",
      "keywords": ["amazon private label india","private label amazon 2026","sell on amazon india","ecommerce brand building india"],
      "articleSection": "Seller Tools & Strategy",
      "inLanguage": "en-IN",
      "wordCount": 4400,
      "timeRequired": "PT12M"
    }
  ]
};


// ── TOC ───────────────────────────────────────────────────────────────────────

// ── TOC ───────────────────────────────────────────────────────────────────────
const TOC = [
  { id:"guide-covers",             label:"What This Guide Covers" },
  { id:"what-is-private-label",    label:"The First Question to Ask" },
  { id:"product-selection",        label:"The 5 Most Common Causes" },
  { id:"common-pitfalls",          label:"24-Hour Diagnosis Checklist" },
  { id:"causes-fixes",             label:"Fix for Each Cause" },
  { id:"temporary-or-structural",  label:"Temporary vs Structural Drop" },
  { id:"prevent-drops",            label:"How to Prevent It Again" },
  { id:"faq",                      label:"FAQs" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Why do Amazon India sales drop suddenly with no obvious reason?",
    a: "The most common hidden causes are Buy Box loss, listing suppression Amazon does not notify you about, and a keyword ranking drop triggered by declining sales velocity. None of these appear as a clear alert in Seller Central — you have to check each one manually or use a tool like Insydz."
  },
  {
    q: "How do I check if a competitor undercut my price overnight?",
    a: "Go to your listing on Amazon India as a regular buyer and check who holds the Buy Box. If the price shown is lower than yours, a competitor has undercut you and taken it. Insydz sends price change alerts the same night so you catch this before your sessions fall the following morning."
  },
  {
    q: "Does a ranking drop always cause a sales drop?",
    a: "Not always. A ranking drop causes a traffic drop — fewer buyers see your listing. But if your conversion rate is also falling, that is a separate problem. Distinguishing between a traffic drop and a conversion drop is the most important first step, because the fix for each is completely different."
  },
  {
    q: "How long does it take to recover lost Amazon India rankings?",
    a: "A ranking drop from a temporary sales velocity dip typically recovers in 7 to 21 days if you act quickly on the root cause. Buy Box loss and listing suppression recover faster once fixed, often within 48 to 72 hours. Sustained competitor pressure takes longer and requires a deliberate pricing or listing quality response."
  },
  {
    q: "Can a spike in negative reviews alone cause a sales drop?",
    a: "Yes, but indirectly. A cluster of negative reviews drops your star rating, which lowers conversion rate, which reduces sales velocity, which then causes Amazon to lower your search ranking. This chain typically takes 5 to 14 days to fully play out — which is why review monitoring matters as much as rank tracking."
  },
  {
    q: "Should I immediately lower my price when sales drop suddenly?",
    a: "No. Cutting price without knowing the cause often makes things worse. If the cause is a listing suppression, price cuts help nothing. Diagnose first using the checklist in this guide, then act with precision on the actual problem."
  },
  {
    q: "How do I detect listing suppression on Amazon India?",
    a: "Search your ASIN on Amazon India in a private browsing window as a regular buyer. If your listing does not appear but is still active in Seller Central, it is suppressed. Open Manage Inventory and look for any yellow or red warning flags — the flag text will tell you the specific reason for the suppression."
  },
  {
    q: "Can Insydz help me monitor and prevent sudden Amazon India sales drops?",
    a: "Yes. Insydz tracks your keyword rankings daily and sends alerts when a competitor changes price or when your rank drops significantly. Instead of discovering a problem after two days of lost sales, you catch it the same morning it happens and act before the sales velocity drop compounds into a ranking drop."
  }
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonSalesDropContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("what-is-private-label");
  const [scrollPct, setScrollPct]   = useState(0);
  const [tocOpen, setTocOpen]       = useState(false);
  const [openFaq, setOpenFaq]       = useState<number | null>(0);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const id = "insydz-private-label-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id   = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaPrivateLabel);
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

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

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

        /* FAQ */
        .faq-item{border:1px solid #E5E7EB;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;transition:border-color .2s}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#F4500A}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0A0F1A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F5F3FF}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#EDE9FE;color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        .faq-icon.open{transform:rotate(45deg);background:#7C3AED;color:white}
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
        .toc-link:hover,.toc-link.active{color:#7C3AED;background:#F5F3FF;border-left-color:#7C3AED}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#1e1033;color:#a78bfa}

        /* stat strip */
        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E5E7EB;text-align:center;border-bottom:1px solid #E5E7EB}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}

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
      <MarketingHeader />

      {/* BREADCRUMB */}
      <div 
        className="breadcrumb" 
        style={{ 
          marginTop: 80,
          background: resolvedTheme === 'dark' ? "#0f172a" : "#F5F8FF",
          borderBottom: resolvedTheme === 'dark' ? "1px solid #1e293b" : "1px solid #E5E7EB",
          padding: "8px 0"
        }}
      >
        <div className="breadcrumb-inner" style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#94A3B8" }}>
          <Link href="/" style={{ color: resolvedTheme === 'dark' ? "#cbd5e1" : "#64748B", fontWeight:500, textDecoration:"none" }}>Home</Link>
          <span style={{ color: resolvedTheme === 'dark' ? "#475569" : "#cbd5e1" }}>›</span>
          <Link href="/resources/expert-blog" style={{ color: resolvedTheme === 'dark' ? "#cbd5e1" : "#64748B", fontWeight:500, textDecoration:"none" }}>Blog</Link>
          <span style={{ color: resolvedTheme === 'dark' ? "#475569" : "#cbd5e1" }}>›</span>
          <span style={{ color: resolvedTheme === 'dark' ? "#64748b" : "#94A3B8" }}>Amazon Private Label India 2026</span>
        </div>
      </div>

      {/* HERO SECTION - REVISED TO MATCH IMAGE */}
      <div 
        style={{ 
          background: resolvedTheme === 'dark' ? "#0f1120" : "#F1F2FF", 
          padding: "48px 0", 
          borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E2E8F0" 
        }} 
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px" }} className="w-full">
          
          <div className="w-full">
            <div style={{ 
              display:"inline-flex", 
              alignItems:"center", 
              background: resolvedTheme === 'dark' ? "#1e1b4b" : "#E0E2FF", 
              color: resolvedTheme === 'dark' ? "#818cf8" : "#6366F1", 
              fontSize:11, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", padding:"6px 16px", borderRadius:20, marginBottom:20, fontFamily:"'Sora',sans-serif" 
            }}>
              <span style={{ marginRight: 8, color: "#6366F1" }}>●</span> PRICING PAIN  · EMERGENCY DIAGNOSIS
            </div>
            
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px, 4.5vw, 48px)", fontWeight:900, lineHeight:1.1, color: resolvedTheme === 'dark' ? "white" : "#111827", letterSpacing:"-1px", marginBottom:20 }}>
              Why Did My <span style={{ color: "#6366F1" }}>Amazon India Sales Drop</span> Suddenly? A Step-by-Step Diagnosis Guide
            </h1>
            
            <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"8px 16px", marginBottom:32, fontSize: 13, color: resolvedTheme === 'dark' ? "#6b7280" : "#6B7280", fontFamily: "'Sora', sans-serif" }}>
              <span className="flex items-center gap-1">Insydz Research Team</span>
              <span>·</span>
              <span>May 2026</span>
              <span>·</span>
              <span>13 min read</span>
              <span>·</span>
              <span style={{ background: "#E0E2FF", color: "#6366F1", fontWeight: 700, padding: "2px 10px", borderRadius: 4 }}>MOFU · Competitor Intelligence</span>
              <span style={{ background: "#DCFCE7", color: "#059669", fontWeight: 700, padding: "2px 10px", borderRadius: 4 }}>Pricing Intelligence</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 h-auto">
                <Link href="/login">Diagnose Your Sales Drop Free →</Link>
              </Button>
              <Button asChild variant="outline" className={`font-bold px-8 py-3 rounded-full h-auto transition-colors ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-[#E0E2FF]/50 border-[#C7D2FE] text-[#6366F1] hover:bg-[#E0E2FF]'}`}>
                <Link href="/pricing">See Plans</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm w-full">
              <div className="p-4 sm:p-5 text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">5</div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  most common causes of a sudden Amazon India sales drop<br className="hidden xl:block" /> — only one needs a price cut
                </div>
              </div>
              
              <div className="p-4 sm:p-5 text-center border-b md:border-b-0 xl:border-r border-gray-200 dark:border-gray-800">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">24 hrs</div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  to complete a full diagnosis — before the drop compounds<br className="hidden xl:block" /> into a ranking problem
                </div>
              </div>
              
              <div className="p-4 sm:p-5 text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">#1 cause</div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Buy Box loss — the most common reason for an overnight<br className="hidden xl:block" /> sales crash sellers miss
                </div>
              </div>
              
              <div className="p-4 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">2 types</div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  traffic drop vs conversion drop — completely different<br className="hidden xl:block" /> causes, completely different fixes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-10" style={{ maxWidth: 1240, margin: "20px auto 0", padding: "0 16px" }}>
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <img 
            src="/Banner image.png" 
            alt="Amazon Sales Drop" 
            className="w-full h-auto block"
          />
        </div>
        <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
          Seller Central Business Reports — Sessions dropped from 2,103 to 847 while Order Session % held steady at 14.2%, pointing to a traffic problem not a conversion issue.
        </p>
      </div>

      {/* QUICK SUMMARY & TAKEAWAYS - MATCHING IMAGE */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        
        {/* Quick Answer Box */}
        <div style={{ 
          background: resolvedTheme === 'dark' ? "#111827" : "#F8F9FF", 
          borderLeft: "4px solid #6366F1", 
          borderRadius: 8, padding: "24px 32px", marginBottom: 40 
        }} className="dark:border-indigo-500">
          <div style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: "'Sora', sans-serif" }}>
            QUICK ANSWER
          </div>
          <p style={{ margin: 0, fontSize: 16, color: resolvedTheme === 'dark' ? "#d1d5db" : "#4B5563", lineHeight: 1.65, fontFamily: "'Lora', serif" }}>
            Before you do anything else: check your Buy Box status. Go to your listing on Amazon India as a regular buyer and see who is selling. If it is not you, that is almost certainly the cause. If you are still in the Buy Box, check your sessions in Seller Central Business Reports — sessions down means a traffic problem; sessions stable with orders down means a conversion problem. These two diagnoses need completely different fixes.
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div id="guide-covers" style={{ 
          background: "#0F172A", 
          borderRadius: 24, padding: "40px", marginBottom: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: "'Sora', sans-serif" }}>
            <span style={{ fontSize: 24 }}>📋</span> What This Guide Covers
          </h3>
          
          <div className="space-y-6">
            {[
              "Diagnose a traffic drop vs a conversion rate drop — they need different fixes.",
              "Check the five most common causes in order, starting with Buy Box loss.",
              "Apply the right fix for each cause using the Seller Central instructions in this guide.",
              "Set up monitoring so this never catches you by surprise again."
            ].map((text, i) => (
              <div key={i} className="flex gap-4">
                <div style={{ background: "#6366F1", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <p style={{ margin: 0, fontSize: 15, color: "#94A3B8", lineHeight: 1.6, fontFamily: "'Sora', sans-serif" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">

        {/* SIDEBAR */}
        <aside className="toc-sidebar" style={{ 
          background: resolvedTheme === 'dark' ? "#111827" : "#fff",
          borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
        }}>
          <h4 style={{ 
            fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", 
            color: resolvedTheme === 'dark' ? "#94a3b8" : "#64748B", marginBottom: "16px",
            fontFamily: "'Sora', sans-serif" 
          }}>Table of Contents</h4>
          <ul className="space-y-1" style={{ listStyle:"none", padding:0, margin:0 }}>
            {TOC.map(t => (
              <li key={t.id}>
                <button 
                  className={`toc-link${activeSection === t.id ? " active" : ""}`} 
                  onClick={() => go(t.id)}
                  style={{
                    color: activeSection === t.id ? "#7C3AED" : (resolvedTheme === 'dark' ? "#94a3b8" : "#64748B"),
                    background: activeSection === t.id ? (resolvedTheme === 'dark' ? "#1e1033" : "#F5F3FF") : "transparent",
                    borderLeft: activeSection === t.id ? "2px solid #7C3AED" : "2px solid transparent"
                  }}
                >{t.label}</button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth:0 }}>
          <button 
            className="mobile-toc-btn" 
            onClick={() => setTocOpen(!tocOpen)}
            style={{ 
              background: resolvedTheme === 'dark' ? "#111827" : "#fff",
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#111",
              borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
            }}
          >
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`} style={{ 
            background: resolvedTheme === 'dark' ? "#111827" : "#fff",
            borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
          }}>
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>
            ))}
          </div>

          <article className="article-body">

            <h2 id="what-is-private-label" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "0 0 28px"
            }}>
              What Is the First Thing You Should Do When Amazon India Sales Drop Suddenly?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              A sudden sales drop is almost always diagnosable. The sellers who recover fastest spend five minutes understanding what type of problem they have before touching anything.
            </p>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              Here is the one question that determines everything else you do next:
            </p>

            <div className="box box-purple" style={{ 
              background: resolvedTheme === 'dark' ? "#1e1b4b" : "#F5F3FF", 
              borderLeft: "6px solid #8B5CF6", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(139,92,246,0.08)"
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#7C3AED", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                💡  The Diagnostic Question
              </div>
              <p style={{ margin:"0 0 16px", fontSize:15.5, color: resolvedTheme === 'dark' ? "#cbd5e1" : "#4B5563", lineHeight:1.75, fontFamily: "'Sora', sans-serif" }}>
              <strong>Are fewer people finding my listing, or are they finding it and not buying? </strong> These have different causes and completely different fixes.
              </p>
            </div>

            <p style={{ margin:"0 0 16px", fontSize:15.5, color: resolvedTheme === 'dark' ? "#cbd5e1" : "#4B5563", lineHeight:1.75, fontFamily: "'Sora', sans-serif" }}>
              Open Seller Central → Reports → Business Reports → Detail Page Sales and Traffic by ASIN. Check <strong>Sessions</strong> and <strong>Order Session Percentage</strong>.
              </p>

            <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* Left Box */}
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6">
                <h4 className="text-red-600 dark:text-red-500 font-bold text-[17px] mb-5 flex items-center gap-2">
                  <span>📉</span> Sessions dropped
                </h4>
                <ul className="space-y-4 text-[15px] text-gray-700 dark:text-gray-300">
                  <li className="flex gap-3 items-start">
                    <span className="text-red-500 dark:text-red-400 mt-[2px]">→</span>
                    <span>Fewer people are finding your listing</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-500 dark:text-red-400 mt-[2px]">→</span>
                    <span className="leading-relaxed">Cause: ranking drop, listing suppression or Buy Box loss</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-500 dark:text-red-400 mt-[2px]">→</span>
                    <span>Fix: restore visibility first</span>
                  </li>
                </ul>
              </div>

              {/* Right Box */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-6">
                <h4 className="text-blue-600 dark:text-blue-500 font-bold text-[17px] mb-5 flex items-center gap-2">
                  <span>📊</span> Sessions stable, orders down
                </h4>
                <ul className="space-y-4 text-[15px] text-gray-700 dark:text-gray-300">
                  <li className="flex gap-3 items-start">
                    <span className="text-blue-500 dark:text-blue-400 mt-[2px]">→</span>
                    <span>People are finding you but not buying</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-blue-500 dark:text-blue-400 mt-[2px]">→</span>
                    <span className="leading-relaxed">Cause: price increase, negative reviews, or a better competitor listing</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-blue-500 dark:text-blue-400 mt-[2px]">→</span>
                    <span>Fix: improve the listing or the review situation</span>
                  </li>
                </ul>
              </div>

            </div>

              <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/Banner image.png" 
                  alt="Amazon Sales Drop" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Seller Central Business Reports — Sessions dropped from 2,103 to 847 while Order Session Percentage held steady at 14.2%, pointing clearly to a traffic problem rather than a conversion issue.
              </p>
              </div>
              

            <h2 id="product-selection" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              What Are the Most Common Causes of a Sudden Amazon India Sales Drop?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              Most sudden sales drops come down to one of five causes — work through them in this order.
            </p>

            <div className="my-6 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none font-sans">
              
              {/* Row 1 */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <div className="w-[72px] flex-shrink-0 bg-[#E53E3E] flex items-center justify-center text-white font-black text-2xl">
                  1
                </div>
                <div className="flex-1 py-2 px-3 md:py-2 md:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="pr-4">
                    <h4 className="font-extrabold text-[#111827] dark:text-gray-100 text-[15px]">Buy Box Loss</h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                      Another seller has taken the Buy Box. All of Amazon's default traffic goes to the Buy Box holder — if that is not you, your visibility drops to near zero regardless of ranking.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-0.5 bg-red-50 dark:bg-red-900/30 text-[#E53E3E] dark:text-red-400 text-[12px] font-bold rounded-full whitespace-nowrap">
                      Overnight crash
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <div className="w-[72px] flex-shrink-0 bg-[#DD6B20] flex items-center justify-center text-white font-black text-2xl">
                  2
                </div>
                <div className="flex-1 py-2 px-3 md:py-2 md:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="pr-4">
                    <h4 className="font-extrabold text-[#111827] dark:text-gray-100 text-[15px]">Keyword Ranking Drop</h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                      Your product slipped below page 1 on one or more important keywords. Amazon's algorithm may have responded to a sales velocity dip, a listing change, or a competitor gaining ground.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-[#DD6B20] dark:text-orange-400 text-[12px] font-bold rounded-full whitespace-nowrap">
                      Gradual then sudden
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <div className="w-[72px] flex-shrink-0 bg-[#D69E2E] flex items-center justify-center text-white font-black text-2xl">
                  3
                </div>
                <div className="flex-1 py-2 px-3 md:py-2 md:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="pr-4">
                    <h4 className="font-extrabold text-[#111827] dark:text-gray-100 text-[15px]">Listing Suppression</h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                      Amazon has hidden your listing from search results due to a pricing violation, incomplete attributes, or a compliance flag. The listing is still active in Seller Central but buyers cannot find it.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-0.5 bg-yellow-50 dark:bg-yellow-900/30 text-[#D69E2E] dark:text-yellow-400 text-[12px] font-bold rounded-full whitespace-nowrap">
                      Often invisible
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <div className="w-[72px] flex-shrink-0 bg-[#38A169] flex items-center justify-center text-white font-black text-2xl">
                  4
                </div>
                <div className="flex-1 py-2 px-3 md:py-2 md:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="pr-4">
                    <h4 className="font-extrabold text-[#111827] dark:text-gray-100 text-[15px]">Competitor Price Undercut</h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                      A competitor dropped their price overnight. If they took the Buy Box, that is cause 1. Even if you held it, price sensitive buyers may be choosing them in search results where both listings appear.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-0.5 bg-green-50 dark:bg-green-900/30 text-[#38A169] dark:text-green-400 text-[12px] font-bold rounded-full whitespace-nowrap">
                      Fixable fast
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 5 */}
              <div className="flex">
                <div className="w-[72px] flex-shrink-0 bg-[#3182CE] flex items-center justify-center text-white font-black text-2xl">
                  5
                </div>
                <div className="flex-1 py-2 px-3 md:py-2 md:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="pr-4">
                    <h4 className="font-extrabold text-[#111827] dark:text-gray-100 text-[15px]">Seasonal or External Shift</h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                      A sale event ended, a competitor restocked, or category demand shifted. This usually affects multiple ASINs simultaneously rather than isolating to one product.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#3182CE] dark:text-blue-400 text-[12px] font-bold rounded-full whitespace-nowrap">
                      Check category
                    </span>
                  </div>
                </div>
              </div>
              
            </div>

            {/* 5 Diagnostic Steps UI */}
            <div className="space-y-3 mb-8 font-sans">
              <h2 id="common-pitfalls" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              How Do You Diagnose a Sudden Amazon India Sales Drop in 24 Hours?
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
              Work through these in order — each step confirms or rules out a cause and points to the next. Most sellers find the answer by step 3.
            </p>
              {[ 
                {
                  num: 1,
                  title: "Check Sessions vs Order Session Percentage in Business Reports",
                  time: "5 min",
                  text: "Reports → Business Reports → Detail Page Sales and Traffic by ASIN. Is Sessions down, or stable while orders fell?",
                  alertLabel: "WHAT IT TELLS YOU",
                  alertText: "Sessions down = traffic problem. Stable sessions, orders down = conversion problem. The fix is completely different for each."
                },
                {
                  num: 2,
                  title: "Check Your Buy Box Status as a Real Buyer",
                  time: "3 min",
                  text: "Search for your product on Amazon India in a private browser window and look at who is listed as the seller on the right side. If it is not you, you have lost the Buy Box — Manage Inventory in Seller Central will confirm with a near zero Buy Box percentage.",
                  alertLabel: "IMMEDIATE FIX",
                  alertText: "Check your price vs the current Buy Box price. If a competitor is below you, assess whether matching makes sense. Verify they are a legitimate seller first — fake reseller offers do not deserve a price cut."
                },
                {
                  num: 3,
                  title: "Check for Listing Suppression",
                  time: "5 min",
                  text: "Search your ASIN in a private browsing window. Suppressed listings sometimes show to the seller but not to buyers. In Seller Central, check Manage Inventory for any yellow or red icons — click the warning to see the exact reason.",
                  alertLabel: "IMMEDIATE FIX",
                  alertText: "Click the warning icon to read the specific reason — usually a pricing violation, missing attribute, or image issue. Fix it and request a listing review via Seller Support."
                },
                {
                  num: 4,
                  title: "Check Your Keyword Rankings",
                  time: "10 min",
                  text: [
                    "In Insydz, check rank history for your top keywords. Any drop in the last 48 to 72 hours? Ranking drops typically appear in Sessions data one to two days after they happen.",
                    "If you are not tracking keywords yet, search your main keyword on Amazon India and see where you appear. Position 18 or beyond when you used to be in the top 5 is your answer."
                  ],
                  alertLabel: "IMMEDIATE FIX",
                  alertText: "Increase Sponsored Products bids to maintain traffic while organic rank recovers."
                },
                {
                  num: 5,
                  title: "Check Competitor Prices in Your Category",
                  time: "5 min",
                  text: "Search your main keyword on Amazon India and check the current prices of the top 5 listings. Insydz shows competitor price change history so you can see this at a glance.",
                  alertLabel: "IMMEDIATE FIX",
                  alertText: "If they took your Buy Box, you caught that in step 2. If you still hold it, assess whether the gap is large enough to divert buyers. A ₹30 gap on a ₹499 product matters; on ₹1,999, it usually does not."
                }
              ].map((step, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#111827] shadow-[0_2px_10px_rgba(0,0,0,0.01)] dark:shadow-none overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 flex-shrink-0 bg-[#F97316] text-white font-black text-[11px] flex items-center justify-center rounded-full">
                        {step.num}
                      </span>
                      <h3 className="font-extrabold text-[14px] text-[#0A0F1A] dark:text-gray-100 leading-tight !m-0">
                        {step.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {step.time}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-4 pt-2 pb-3 flex flex-col gap-2.5">
                    <div className="text-[13.5px] text-gray-600 dark:text-gray-300 leading-normal font-normal">
                      {Array.isArray(step.text) ? (
                        <div className="flex flex-col gap-1.5">
                          {step.text.map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>
                      ) : (
                        <p>{step.text}</p>
                      )}
                    </div>

                    {/* Alert Box */}
                    <div className="py-2.5 px-3 rounded-lg border-l-4 border-[#F97316] bg-[#FFFBEB] dark:bg-[#2d1b10]/40 flex flex-col gap-0.5">
                      <span className="text-[9.5px] font-black tracking-wider text-[#D97706] dark:text-amber-500 uppercase">
                        {step.alertLabel}
                      </span>
                      <p className="text-[12.5px] text-[#78350F] dark:text-amber-200/90 leading-normal font-medium">
                        {step.alertText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/image2 1.png" 
                  alt="Amazon Sales Drop" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Insydz competitor price alert — a ₹49 drop at 11:08 PM with a suggested response, before sessions fell the following morning.
              </p>
              </div>

            <h2 id="causes-fixes" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              What Does Each Cause Look Like and What Is the Right Fix?
            </h2>

            <div className="tbl-wrap" style={{ 
              marginBottom: 48, 
              background: resolvedTheme === 'dark' ? "#111827" : "#fff",
              borderRadius: 16,
              overflow: "hidden",
              border: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB"
            }}>
              <table className="dt" style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ background: resolvedTheme === 'dark' ? "#1e293b" : "#0F172A", color: "white" }}>
                  <tr>
                    <th style={{ padding: "16px 20px", fontSize: 13, fontFamily: "'Sora', sans-serif" }}>Cause</th>
                    <th style={{ padding: "16px 20px", fontSize: 13, fontFamily: "'Sora', sans-serif" }}>What it looks like in Seller Central</th>
                    <th style={{ padding: "16px 20px", fontSize: 13, fontFamily: "'Sora', sans-serif" }}>Immediate fix</th>
                    <th style={{ padding: "16px 20px", fontSize: 13, fontFamily: "'Sora', sans-serif", textAlign: "center" }}>Time to recover</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cause: "Buy Box loss", look: "Sessions down sharply. Buy Box % near zero.", fix: "Match or undercut their price if margins allow. Verify they are a legitimate seller first.", time: "24–48 hours", timeColor: "green", alert: true },
                    { cause: "Keyword ranking drop", look: "Sessions fell gradually. Rank moved from page 1 to page 2+", fix: "Increase Sponsored Products bids on top keywords temporarily. Do not change listing copy during a traffic crisis.", time: "7–21 days", timeColor: "yellow", alert: false },
                    { cause: "Listing suppression", look: "Sessions near zero. Listing invisible in search. Warning flag in Manage Inventory.", fix: "Fix the flagged issue and request a listing review in Seller Support.", time: "48–72 hours", timeColor: "green", alert: true },
                    { cause: "Competitor price undercut", look: "Sessions stable, Order Session % down. Competitor is cheaper in search results.", fix: "Match price or hold. If holding, strengthen listing quality to justify the gap.", time: "Depends on response", timeColor: "yellow", alert: false },
                    { cause: "Negative review spike", look: "Sessions stable, Order Session % declining. Star rating dropped recently.", fix: "Respond publicly to recent negative reviews and brief your supplier on any defect. Amazon Vine can help rebuild review balance.", time: "5–14 days minimum", timeColor: "red", alert: true },
                    { cause: "Seasonal or external shift", look: "Multiple ASINs affected. Sales dropped across the full category.", fix: "If the drop is category wide and follows a sale event, it is normal. Hold pricing — do not chase demand that has genuinely left the market.", time: "Depends on season", timeColor: "blue", alert: false }
                  ].map((row, i) => {
                    let timeBg = "", timeText = "";
                    if (row.timeColor === "green") { timeBg = resolvedTheme === 'dark' ? "#064e3b" : "#dcfce7"; timeText = resolvedTheme === 'dark' ? "#34d399" : "#059669"; }
                    else if (row.timeColor === "yellow") { timeBg = resolvedTheme === 'dark' ? "#422006" : "#fef3c7"; timeText = resolvedTheme === 'dark' ? "#fbbf24" : "#b45309"; }
                    else if (row.timeColor === "red") { timeBg = resolvedTheme === 'dark' ? "#450a0a" : "#fee2e2"; timeText = resolvedTheme === 'dark' ? "#f87171" : "#b91c1c"; }
                    else if (row.timeColor === "blue") { timeBg = resolvedTheme === 'dark' ? "#1e3a8a" : "#dbeafe"; timeText = resolvedTheme === 'dark' ? "#60a5fa" : "#1d4ed8"; }

                    return (
                      <tr key={i} style={{ 
                        background: i % 2 === 0 ? (resolvedTheme === 'dark' ? "transparent" : "#fff") : (resolvedTheme === 'dark' ? "#1e293b50" : "#F8FAFC"),
                        borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #F1F5F9"
                      }}>
                        <td style={{ 
                          padding: "18px 20px", 
                          fontWeight: 700, 
                          color: row.alert ? "#F97316" : (resolvedTheme === 'dark' ? "#f9fafb" : "#4B5563"), 
                          fontSize: 14, 
                          fontFamily: "'Sora', sans-serif",
                          borderLeft: row.alert ? "3px solid #F97316" : "3px solid transparent"
                        }}>
                          {row.cause}
                        </td>
                        <td style={{ padding: "18px 20px", color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: 14, lineHeight: 1.6, fontFamily: "'Sora', sans-serif", width: "30%" }}>{row.look}</td>
                        <td style={{ padding: "18px 20px", color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: 14, lineHeight: 1.6, fontFamily: "'Sora', sans-serif", width: "40%" }}>{row.fix}</td>
                        <td style={{ padding: "18px 20px", textAlign: "center" }}>
                          <span style={{ 
                            background: timeBg, 
                            color: timeText,
                            padding: "6px 12px", borderRadius: 16, fontSize: 12, fontWeight: 700,
                            whiteSpace: "nowrap"
                          }}>
                            {row.time}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="box box-red" style={{ 
              background: resolvedTheme === 'dark' ? "#450a0a20" : "#FFF5F5", 
              borderLeft: "4px solid #EF4444", 
              borderRadius: 8, padding: "24px 32px", margin: "48px 0",
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#EF4444", textTransform:"uppercase", letterSpacing:1.2, marginBottom:16, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                THE MISTAKE THAT MAKES EVERY SITUATION WORSE
              </div>
              <p style={{ margin:0, fontSize:15.5, color: resolvedTheme === 'dark' ? "#cbd5e1" : "#4B5563", lineHeight:1.75, fontFamily: "'Lora', serif" }}>
                <strong style={{ color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827" }}>Do not reprice before you know the cause.</strong> If your listing is suppressed, a price cut will not help — suppressed listings are invisible regardless of price. Diagnose first, then act with precision on the actual problem.
              </p>
            </div>

            <h2 id="temporary-or-structural" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "48px 0 24px"
            }}>
              How Do You Know If a Sales Drop Is Temporary or a Structural Problem?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              Not every drop needs intervention. Some resolve within 48 hours — the question is whether yours is a fluctuation or something structural.
            </p>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/image3 1.png" 
                  alt="Amazon Sales Drop" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Insydz 7 day timeline — the competitor's restock on Day -3 triggered a ranking drop, then a session decline, then the order crash on Day 0. Daily monitoring gave a 48 hour head start.
              </p>
            </div>

            <div className="mb-10 font-sans">
              <p style={{ color: resolvedTheme === 'dark' ? "#cbd5e1" : "#1E293B", fontSize: "16px", marginBottom: "16px", fontFamily: "'Sora', sans-serif" }}>
                Signs the drop is likely temporary:
              </p>
              <ul className="space-y-4 mb-8 ml-2" style={{ listStyle: "none", padding: 0 }}>
                {[
                  "Multiple ASINs affected simultaneously, or a major sale event just ended",
                  "Your ranking and Buy Box status are unchanged",
                  "The drop is 20% or less and has not continued past 48 hours"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#F97316] mt-[10px] flex-shrink-0"></span>
                    <span style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.6, fontFamily: "'Sora', sans-serif" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <p style={{ color: resolvedTheme === 'dark' ? "#cbd5e1" : "#1E293B", fontSize: "16px", marginBottom: "16px", fontFamily: "'Sora', sans-serif" }}>
                Signs of a structural problem that needs active intervention:
              </p>
              <ul className="space-y-4 ml-2" style={{ listStyle: "none", padding: 0 }}>
                {[
                  "Drop is 40% or more and has lasted over 24 hours",
                  "Only one ASIN is affected while the rest of your account is normal",
                  "Buy Box percentage has changed, or you cannot find your listing on page 1"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#F97316] mt-[10px] flex-shrink-0"></span>
                    <span style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.6, fontFamily: "'Sora', sans-serif" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2 id="prevent-drops" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "48px 0 24px"
            }}>
              How Do You Prevent Sudden Amazon India Sales Drops From Happening Again?
            </h2>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              The sellers who get hit hardest find out too late — by the time order count drops, the ranking damage has already compounded. Monitoring catches the signal before the symptom.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { n:1, t:"Set up daily keyword rank tracking", d:"A move from position 5 to 14 typically arrives 24 to 48 hours before the session drop — Insydz tracks this daily." },
                { n:2, t:"Turn on competitor price alerts", d:"Insydz sends an alert the same night a competitor drops price — you wake up knowing rather than spending two hours figuring out why." },
                { n:3, t:"Check Seller Central Business Reports weekly, not monthly", d:"Check Sessions and Order Session Percentage across your top 5 ASINs every Monday. Weekly, trends are easy to catch. Monthly, they are already costly." },
                { n:4, t:"Monitor your review velocity", d:"A rating drop from 4.3 to 4.0 stars is a slow moving early warning. Catch a review cluster in the first week and you can respond publicly before it hits conversion rate." },
                { n:5, t:"Never run inventory to zero without a restock plan", d:"Amazon quietly reduces visibility when inventory falls critically low. Keep at least 15 days of FBA cover on active ASINs." },
              ].map((s, i) => (
                <div key={i} style={{ 
                  background: resolvedTheme === 'dark' ? "#111827" : "white", 
                  border: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB", 
                  borderRadius: 12, padding: "24px", display: "flex", gap: 20, alignItems: "center",
                  boxShadow: resolvedTheme === 'dark' ? "none" : "0 2px 8px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ 
                    background: "#F97316", color: "white", width: 36, height: 36, borderRadius: "50%", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, flexShrink: 0, fontFamily: "'Sora', sans-serif" 
                  }}>
                    {s.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827", fontFamily: "'Sora', sans-serif" }}>{s.t}</h4>
                    <p style={{ margin: 0, fontSize: 13.5, color: resolvedTheme === 'dark' ? "#94a3b8" : "#64748B", lineHeight: 1.6 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              background: "#0F172A", 
              borderRadius: 16, padding: "32px 40px", marginBottom: "48px",
              display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24
            }}>
              <div style={{ flex: "1 1 400px" }}>
                <h4 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 8px", fontFamily: "'Sora', sans-serif" }}>
                  Insydz detects competitor price drops and ranking changes in real time
                </h4>
                <p style={{ color: "#94a3b8", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                  Check your listing free — see if there is a problem you have not noticed yet.
                </p>
              </div>
              <button style={{ 
                background: "#F97316", color: "white", border: "none", padding: "14px 28px", 
                borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#EA580C"}
              onMouseOut={(e) => e.currentTarget.style.background = "#F97316"}
              >
                Check Your Listing Free &rarr;
              </button>
            </div>

            <h2 id="faq" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div key={i} className="faq-item" style={{ 
                  background: resolvedTheme === 'dark' ? "#111827" : "#fff",
                  borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
                }}>
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ 
                    color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A",
                    background: openFaq === i ? (resolvedTheme === 'dark' ? "#1e293b" : "#F8FAFC") : "transparent"
                  }}>
                    {f.q}
                    <span className={`faq-icon${openFaq === i ? " open" : ""}`}>{openFaq === i ? "−" : "+"}</span>
                  </div>
                  {openFaq === i && <div className="faq-a" style={{ color: resolvedTheme === 'dark' ? "#9ca3af" : "#64748B" }}>{f.a}</div>}
                </div>
              ))}
            </div>

            {/* More Marketplace Playbooks */}
            <div style={{ marginTop: 48 }}>
              <h3 style={{ 
                fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, 
                color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827", marginBottom: 32, letterSpacing: "-0.5px"
              }}>
                More Marketplace Playbooks
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
                {[
                  { 
                    tag: "REVIEW STRATEGY", tagColor: "#059669",
                    title: "Amazon Vine India 2026: Cost, Worth & How to Enrol", 
                    route: "/resources/expert-blog/amazon-vine-program-india-2026",
                    image: "/Amazon-Vine-India-image1.png"
                  },
                  { 
                    tag: "SEO STRATEGY", tagColor: "#3B82F6",
                    title: "Amazon India Keyword Ranking: How to Track and Improve in 2026", 
                    route: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
                    image: "/twenty three.png"
                  },
                  { 
                    tag: "REVIEW INTELLIGENCE", tagColor: "#DC2626",
                    title: "AI Review Analysis Tool for Amazon India & Flipkart: Complete Guide", 
                    route: "/resources/expert-blog/amazon-review-analysis-guide-india",
                    image: "/01_hero_review_intelligence_banner.png"
                  },
                ].map((card, i) => (
                  <Link key={i} href={card.route} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ 
                      background: resolvedTheme === 'dark' ? "#111827" : "white",
                      borderRadius: 20, overflow: "hidden",
                      border: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #F1F5F9",
                      boxShadow: resolvedTheme === 'dark' ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
                      transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = resolvedTheme === 'dark' ? "none" : "0 4px 16px rgba(0,0,0,0.04)"; }}
                    >
                      <div style={{ overflow: "hidden", background: resolvedTheme === 'dark' ? "#1e293b" : "#f8fafc" }}>
                        <img src={card.image} alt={card.title} style={{ width: "100%", height: "auto", display: "block" }} />
                      </div>
                      <div style={{ padding: "20px 22px 24px" }}>
                        <span style={{ 
                          fontSize: 10, fontWeight: 800, color: card.tagColor, 
                          textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Sora', sans-serif", marginBottom: 8, display: "block"
                        }}>
                          {card.tag}
                        </span>
                        <h4 style={{ 
                          margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.4, 
                          color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827", fontFamily: "'Sora', sans-serif"
                        }}>
                          {card.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </article>
        </main>
      </div>


      {/* Final CTA */}
      <div style={{ 
        background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)", 
        padding: "clamp(48px,8vw,80px) 20px", 
        textAlign: "center", 
        margin: "60px 0 0",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ 
            fontFamily: "'Sora', sans-serif", fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 900, 
            color: "white", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 20 
          }}>
            Stop Finding Out About Problems Two Days Late
          </h2>
          
          <p style={{ 
            fontFamily: "'Sora', sans-serif", fontSize: "clamp(15px, 2vw, 17px)", 
            color: "#94a3b8", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 36px" 
          }}>
            Insydz tracks your keyword rankings and competitor prices in real time so you know the morning a problem starts — not after it has already cost you two days of revenue.
          </p>
          
          <div style={{ 
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 28px", 
            marginBottom: 40, fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "'Sora', sans-serif", fontWeight: 500 
          }}>
            {["Daily rank tracking", "Competitor price alerts", "Amazon India and Flipkart", "Free to start"].map((f, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#F97316", fontWeight: 900 }}>✓</span> {f}
              </span>
            ))}
          </div>
          
          <Link href="/login"
            style={{ 
              display: "inline-block", background: "#F97316", color: "white", 
              fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "clamp(14px, 1.5vw, 16px)", 
              padding: "16px 40px", borderRadius: 8, textDecoration: "none",
              boxShadow: "0 8px 30px rgba(249,115,22,0.2)", transition: "transform 0.2s, background 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "#EA580C"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#F97316"; }}
          >
            Check Your Listing Free on Insydz &rarr;
          </Link>
          
          <p style={{ 
            marginTop: 24, fontSize: 14, color: "#94a3b8", 
            fontFamily: "'Sora', sans-serif", fontWeight: 500 
          }}>
            5,000+ Indian sellers &middot; 2.5 Lakh+ reviews analysed &middot; 24/7 live market data
          </p>
        </div>
      </div>
      
    </div>
  );
}
