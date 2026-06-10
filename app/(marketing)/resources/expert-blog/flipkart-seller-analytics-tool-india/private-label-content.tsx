"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, TrendingUp, Target, DollarSign, BarChart3,
  MessageCircle, Package, Trophy, Zap, BookOpen,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Store, Briefcase,
  Users, Bell, Code, Globe, ArrowLeft, Facebook, Twitter, Linkedin,
  Instagram, Flame, Presentation, LayoutGrid, AlertCircle, Activity,
  Plus, CheckCircle2, ArrowRight, LineChart,
  Clock
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
        { "@type": "ListItem", "position": 4, "name": "Flipkart Seller Analytics Tool", "item": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india" }
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
  { id:"key-takeaways",         label:"Key Takeaways" },
  { id:"why-analytics",         label:"Why Sellers Need Analytics" },
  { id:"what-to-track",         label:"What Analytics Tools Track" },
  { id:"flipkart-algorithm",    label:"Flipkart Algorithm Explained" },
  { id:"key-features",          label:"Key Features to Look For" },
  { id:"insydz-vs-helium10",    label:"Insydz vs Helium 10 / JungleScout" },
  { id:"competitor-pricing",    label:"Competitor Pricing Strategy" },
  { id:"common-mistakes",       label:"Common Mistakes" },
  { id:"real-results",          label:"Real Seller Results" },
  { id:"faq",                   label:"FAQs" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is a Flipkart seller analytics tool?",
    a: "A Flipkart seller analytics tool tracks your product's search ranking by keyword, monitors competitor prices and stock levels, and surfaces marketplace data insights so you can act before competitors do. Unlike Flipkart Seller Hub, which shows sales data, an analytics tool shows the inputs that drive those sales rank, pricing, and listing quality."
  },
  {
    q: "Can I track Flipkart competitor prices automatically?",
    a: "Yes. Insydz monitors Flipkart competitor prices daily and sends alerts when a competitor drops price, goes out of stock, or changes their listing. Manual price checking misses 70%+ of price changes automated monitoring catches them within hours so you can respond before your rank is affected."
  },
  {
    q: "How does Flipkart's search ranking algorithm work?",
    a: "Flipkart's algorithm weights five main signals: sales velocity (30%), price competitiveness (25%), listing completeness (20%), seller rating and fulfilment speed (15%), and review count and rating (10%). Sellers who track rank daily can see which of these signals are causing position changes and act directly on the right lever."
  },
  {
    q: "Is there a free Flipkart analytics tool for Indian sellers?",
    a: "Insydz offers a free plan covering rank tracking for up to 5 products across Amazon India and Flipkart. Paid plans start at ₹2,499 per month for unlimited tracking, competitor price monitoring, and AI review analysis. No credit card is required to start the free plan."
  },
  {
    q: "How is Insydz different from Helium 10 or Jungle Scout for Flipkart?",
    a: "Helium 10 and Jungle Scout are built for Amazon.com neither tracks Flipkart keywords, competitor prices, or Hindi reviews. Insydz is built specifically for Indian marketplaces: it tracks Amazon India and Flipkart in one dashboard, processes Hindi reviews with AI, and is priced for Indian seller budgets."
  },
  {
    q: "What data does a Flipkart analytics tool track?",
    a: "A comprehensive Flipkart analytics tool tracks: search rank by keyword (daily), competitor product prices and stock status, listing quality scores, review sentiment and complaint themes in Hindi and English, sales rank movement, and historical pricing trends across the Flipkart marketplace covering festive sale periods like Big Billion Days and Diwali."
  }
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonPrivateLabelContent() {
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
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start}}
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
          background: resolvedTheme === 'dark' ? "#0f1120" : "#F5F3FF", 
          padding: "48px 0", 
          borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E2E8F0" 
        }} 
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px" }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7">
            <div style={{ 
              display:"inline-flex", 
              alignItems:"center", 
              background: resolvedTheme === 'dark' ? "#1e1b4b" : "#EBE5FE", 
              color: resolvedTheme === 'dark' ? "#818cf8" : "#7C3AED", 
              fontSize:11, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", padding:"6px 16px", borderRadius:20, marginBottom:20, fontFamily:"'Sora',sans-serif" 
            }}>
              <span style={{ marginRight: 8, color: "#7C3AED" }}>●</span> FLIPKART SELLER ANALYTICS · BOFU GUIDE
            </div>
            
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px, 4.5vw, 48px)", fontWeight:900, lineHeight:1.1, color: resolvedTheme === 'dark' ? "white" : "#111827", letterSpacing:"-1px", marginBottom:20 }}>
              The <span style={{ color: "#7C3AED" }}>Flipkart Analytics Tool</span> Built for Indian Sellers in 2026
            </h1>
            
            <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: resolvedTheme === 'dark' ? "#9ca3af" : "#4B5563", lineHeight: 1.6, marginBottom: 24, maxWidth: 600, fontFamily: "'Lora', serif" }}>
              Track competitor prices, monitor search rankings, and decode the Flipkart algorithm all in one dashboard. India's only <strong>Flipkart seller software</strong> that covers pricing trends, marketplace data, and keyword rank movement in real time.
            </p>

            <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>Vikrant Singh</strong></div>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />May 2026</div>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /><strong>12 min read</strong></div>
            <span style={{ background:"#FFEDD5", color:"#F97316", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Updated for 2026</span>
            <span style={{ background:"#F5F3FF", color:"#7C3AED", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"2px 7px", borderRadius:4 }}>Tool Analysis</span>
          </div>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 h-auto">
                <Link href="/login">Track Your Flipkart Rankings Free →</Link>
              </Button>
              <Button asChild variant="outline" className={`font-bold px-8 py-3 rounded-full h-auto transition-colors ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-transparent border-[#C4B5FD] text-[#7C3AED] hover:bg-[#F5F3FF]'}`}>
                <Link href="/pricing">See Plans</Link>
              </Button>
            </div>
          </div>
          
          {/* Right Content - Snapshot Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div style={{ 
              background: resolvedTheme === 'dark' ? "#111827" : "white", 
              borderRadius: 24, padding: 24, 
              boxShadow: resolvedTheme === 'dark' ? "0 20px 50px rgba(0,0,0,0.3)" : "0 20px 50px rgba(0,0,0,0.05)", 
              border: resolvedTheme === 'dark' ? "1px solid #374151" : "1px solid #F3F4F6", 
              maxWidth: 420,
              width: "100%"
            }}>
              <div className="flex justify-between items-center mb-6">
                <h4 style={{ fontSize: 14, fontWeight: 800, color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827", fontFamily: "'Sora', sans-serif" }}>
                  Flipkart Rank Tracker — Insydz
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }}></span> Live
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { val: "₹2,499", lbl: "Starting / month", bg: resolvedTheme === 'dark' ? "#1f2937" : "#F8F9FA", col: "#7C3AED" },
                  { val: "Daily", lbl: "Rank updates", bg: resolvedTheme === 'dark' ? "#1f2937" : "#F8F9FA", col: "#16A34A" },
                  { val: "2", lbl: "Platforms tracked", bg: resolvedTheme === 'dark' ? "#1f2937" : "#F8F9FA", col: "#EA580C" },
                  { val: "5,000+", lbl: "Sellers using Insydz", bg: resolvedTheme === 'dark' ? "#1f2937" : "#F8F9FA", col: "#111827" },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, padding: "16px 12px", borderRadius: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: s.col === "#111827" && resolvedTheme === 'dark' ? "white" : s.col, marginBottom: 2, fontFamily: "'Sora', sans-serif" }}>{s.val}</div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: "#9CA3AF", lineHeight: 1.2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <h5 style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, fontFamily: "'Sora', sans-serif" }}>
                  LIVE KEYWORD RANK TRACKING
                </h5>
                <div className="space-y-3">
                  {[
                    { kw: "yoga mat 6mm flipkart", rank: "#7", diff: "↑12", color: "#16A34A" },
                    { kw: "steel water bottle india", rank: "#14", diff: "↑6", color: "#16A34A" },
                    { kw: "phone stand adjustable", rank: "#23", diff: "↓3", color: "#EA580C" },
                    { kw: "kitchen organiser rack", rank: "#5", diff: "↑18", color: "#16A34A" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center" style={{ fontSize: 13, borderBottom: i === 3 ? "none" : "1px solid #F1F5F9", paddingBottom: i === 3 ? 0 : 8 }}>
                      <span className="text-[#64748B]">{row.kw}</span>
                      <div className="flex gap-2 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                        <span style={{ color: row.color }}>{row.rank}</span>
                        <span style={{ color: row.color }}>{row.diff}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ background: "#7C3AED", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ margin: 0, fontSize: 12, color: "white", lineHeight: 1.5, fontWeight: 500 }}>
                  You moved from #23 to #5 on "kitchen organiser rack" after the listing update. Insydz caught it the next morning — your competitor hadn't noticed yet.
                </p>
              </div>
            </div>
          </div>
          
        </div>
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
            A Flipkart analytics tool tracks your product's search rank by keyword, monitors competitor prices and stock levels, and surfaces marketplace data insights so you can act before competitors do. Insydz is the only tool that covers both Flipkart and Amazon India in one dashboard, processes Hindi reviews, and is priced for Indian seller budgets starting free.          </p>
        </div>

        {/* Key Takeaways Box */}
        <div id="key-takeaways" style={{ 
          background: "#0F172A", 
          borderRadius: 24, padding: "40px", marginBottom: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: "'Sora', sans-serif" }}>
            <span style={{ fontSize: 24 }}>📋</span> Key Takeaways: Amazon Private Label India 2026
          </h3>
          
          <div className="space-y-6">
            {[
              "Flipkart's search algorithm rewards sales velocity, listing completeness, competitive pricing, and seller rating tracking these daily tells you what to fix before you lose rank.",
              "Manual price monitoring misses 70%+ of competitor price changes. Automated Flipkart competitor tracking catches price drops within hours, not days.",
              "Sellers using analytics tools on Flipkart outperform those who don't by an average 2.3× in revenue growth over 12 months because they act on data, not intuition.",
              "Helium 10 and Jungle Scout do not track Flipkart. Insydz is built specifically for Amazon India and Flipkart, with Hindi review processing and pricing built for Indian sellers.",
              "Start with keyword rank tracking it's the single metric that correlates most directly with organic revenue on Flipkart India."
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

            <h2 id="why-analytics" style={{ 
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
              Why Do Flipkart Sellers Need an Analytics Tool in 2026?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              Flipkart has over 300 million registered users and more than 1.4 lakh seller accounts competing for the same search positions. Selling on Flipkart without analytics is like driving on a highway at night with your headlights off you might stay on the road for a while, but you will not see the obstacle until it is too late.
            </p>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              The gap between Flipkart's top 10 and position 20 is not about product quality it is about data. Sellers in the top 10 track their rank daily and respond to competitor price changes within hours. Sellers outside the top 10 are guessing.
            </p>

            <div className="box box-purple" style={{ 
              background: resolvedTheme === 'dark' ? "#1e1b4b" : "#F5F3FF", 
              borderLeft: "6px solid #8B5CF6", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(139,92,246,0.08)"
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#7C3AED", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
              📊 The Data Gap on Flipkart India
              </div>
              <p style={{ margin:"0 0 16px", fontSize:15.5, color: resolvedTheme === 'dark' ? "#cbd5e1" : "#4B5563", lineHeight:1.75, fontFamily: "'Sora', sans-serif" }}>
                Flipkart does not give sellers keyword rank data inside their seller dashboard. You can see sales and returns but not where you rank for the keywords that drive those sales. Without a Flipkart analytics tool, you are optimising blind.
              </p>
            </div>

            <div className="my-10 space-y-10">
              {/* Three Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1 */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 bg-[#FDFDFE] dark:bg-gray-900/50">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4 leading-tight font-sans">
                    No keyword rank visibility
                  </h3>
                  <p className="text-[#64748B] dark:text-gray-400 text-[15px] leading-relaxed font-sans">
                    Flipkart Seller Hub shows sales not where you rank for the keywords driving them. Without rank data, you cannot know if your listing is gaining or losing ground each day.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 bg-[#FDFDFE] dark:bg-gray-900/50">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-6">
                    <Activity className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4 leading-tight font-sans">
                    Competitor price changes missed
                  </h3>
                  <p className="text-[#64748B] dark:text-gray-400 text-[15px] leading-relaxed font-sans">
                    Manual price checking catches maybe 30% of competitor price moves. On Flipkart, a competitor dropping ₹50 can push you from position #8 to #19 overnight invisible without automated tracking.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 bg-[#FDFDFE] dark:bg-gray-900/50">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4 leading-tight font-sans">
                    Pricing trends misread
                  </h3>
                  <p className="text-[#64748B] dark:text-gray-400 text-[15px] leading-relaxed font-sans">
                    Categories on Flipkart have seasonal pricing rhythms Big Billion Days, Republic Day Sale, Diwali. Without pricing trend data, sellers discount at the wrong times and leave margin on the table.
                  </p>
                </div>

              </div>

              {/* Yellow Banner */}
              <div className="bg-[#FFF8E7] dark:bg-[#45300B] border border-[#FDE047] dark:border-[#B45309] rounded-[32px] p-8 md:p-10 text-center">
                <h3 className="text-xl md:text-[22px] font-bold text-[#B45309] dark:text-[#FDE047] mb-3 font-sans">
                  Flipkart sellers using analytics tools grow revenue 2.3× faster than those who don't.
                </h3>
                <p className="text-[15px] md:text-base text-[#B45309] dark:text-[#FEF08A] font-medium font-sans">
                  The difference is not the product it's knowing your rank, your competitor's price, and your category trends before they change.
                </p>
              </div>
            </div>

            <h2 id="what-to-track" style={{ 
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
              What Does a Flipkart Analytics Tool Actually Track?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              The best Flipkart seller software tracks five distinct data layers each answering a different question about your marketplace position. Most sellers only use one or two. The sellers consistently in the top 5 use all of them together.
            </p>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              Here is what each layer tells you and why it matters:
            </p>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/Flip_image_1.png" 
                  alt="Insydz Analytics Dashboard" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Insydz analytics dashboard 5 tracking layers for Flipkart sellers: keyword rank, competitor price, review sentiment, pricing trends, and listing quality score.
              </p>
            </div>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              <strong>Keyword rank tracking: </strong> Where you appear in Flipkart search for each target keyword, updated daily. The most direct proxy for organic revenue rank #7 versus #20 for the same keyword can mean 4× the traffic.
            </p>
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
                <strong>Competitor price monitoring: </strong> Automated alerts when a competitor on your category listing changes their price, goes out of stock, or updates their title.
              </p>
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              <strong>Review sentiment analysis: </strong> AI-powered clustering of your own and competitors' reviews into complaint themes surfaces the product issues driving rating drops before they compound.
            </p>
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              <strong>Pricing trends: </strong> Category-level price history for Flipkart, so you can see how prices move around Big Billion Days, Republic Day Sale, and Diwali and plan your pricing strategy in advance rather than reacting.
            </p>
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              <strong>Listing quality score: </strong> A scored audit of your listing's title, images, description, and attribute completeness against Flipkart's algorithm requirements.
            </p>


            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "40px", fontFamily: "'Lora', serif" }}>
              Categories to consider: kitchen organisers, water bottles, stainless steel containers, personal care kits, and stationery sets. Avoid electronics established brands dominate with warranties private label cannot match.
            </p>

            {/* S4: Sourcing */}
            <h2 id="flipkart-algorithm" style={{ 
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
              How Does Flipkart's Search Ranking Algorithm Work in 2026?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "28px", fontFamily: "'Lora', serif" }}>
              Flipkart does not publish its ranking algorithm. But consistent analysis of rank movement data across thousands of Indian seller accounts reveals the factors that matter most and the weight each carries.
            </p>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/Flip_image_2.png" 
                  alt="Flipkart Search Ranking Algorithm Signals" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Flipkart search ranking algorithm signals approximate weightings derived from rank movement analysis across Insydz seller accounts on Flipkart India in 2026.
              </p>
            </div>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "28px", fontFamily: "'Lora', serif" }}>
              The practical implication: if your Flipkart rank drops without any changes to your listing, the most likely cause is a competitor improving their price competitiveness or sales velocity. A <strong>Flipkart competitor tracking tool</strong> catches this immediately without it, you are troubleshooting in the dark.
            </p>
            <div className="box box-amber" style={{ 
              background: resolvedTheme === 'dark' ? "#2d1b10" : "#FFFBEB", 
              borderLeft: "6px solid #D97706", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(217,119,6,0.08)"
             }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#D97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                ⚠️ PRODUCT SELECTION RED FLAGS
              </div>
              <div>A competitor in Surat drops their price by ₹40 on a Thursday by Friday morning they rank 8 positions above you. Your sales velocity falls, compounding the rank drop. Automated Flipkart price monitoring catches it within hours, before the cascade hits.</div>
            </div>

            <h2 id="key-features" style={{ 
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
              What Features Should a Flipkart Seller Analytics Tool Have?
            </h2>

            <div className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card 1 */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-[#FDFDFE] dark:bg-gray-900/50 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight font-sans">
                  Daily Keyword Rank Tracking
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-[14px] leading-relaxed font-sans mb-4 flex-grow">
                  Track exactly where your product appears in Flipkart search for every keyword that matters updated daily, not weekly. See rank movement alongside competitor actions to understand what caused each change.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#F5F3FF] dark:bg-purple-900/30 text-[#7C3AED]">
                    Core Feature
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-[#FDFDFE] dark:bg-gray-900/50 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] dark:bg-amber-900/20 flex items-center justify-center mb-4">
                  <Plus className="w-4 h-4 text-[#D97706]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight font-sans">
                  Competitor Price Monitoring
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-[14px] leading-relaxed font-sans mb-4 flex-grow">
                  Automated alerts when any competitor in your category changes price, goes out of stock, or changes fulfilment method. Set custom thresholds get notified when a competitor drops below your price by more than ₹30.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FFFBEB] dark:bg-amber-900/20 text-[#D97706]">
                    High Value
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-[#FDFDFE] dark:bg-gray-900/50 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] dark:bg-green-900/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight font-sans">
                  Listing Quality Scoring
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-[14px] leading-relaxed font-sans mb-4 flex-grow">
                  Get a scored audit of your Flipkart listing's title, images, description, attributes, and keyword density against Flipkart's content requirements with specific recommendations for what to fix first.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#F0FDF4] dark:bg-green-900/20 text-[#16A34A]">
                    Quick Wins
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-[#FDFDFE] dark:bg-gray-900/50 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <ArrowRight className="w-4 h-4 text-[#DC2626]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight font-sans">
                  AI Review Analysis — Hindi + English
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-[14px] leading-relaxed font-sans mb-4 flex-grow">
                  Cluster your own and competitor reviews into complaint themes and praise patterns in both Hindi and English. Surface product issues and positioning gaps before they show in your star rating.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF2F2] dark:bg-red-900/20 text-[#DC2626]">
                    India-First
                  </span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-[#FDFDFE] dark:bg-gray-900/50 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <LineChart className="w-4 h-4 text-[#2563EB]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight font-sans">
                  Pricing Trend Intelligence
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-[14px] leading-relaxed font-sans mb-4 flex-grow">
                  See how category prices on Flipkart move across the year Big Billion Days, Republic Day Sale, Diwali, Navratri. Know the average discount depth for your category weeks before each sale event.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#EFF6FF] dark:bg-blue-900/20 text-[#2563EB]">
                    Strategic
                  </span>
                </div>
              </div>

              {/* Card 6 */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 bg-[#FDFDFE] dark:bg-gray-900/50 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <LayoutGrid className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2 leading-tight font-sans">
                  Amazon + Flipkart in One Dashboard
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 text-[14px] leading-relaxed font-sans mb-4 flex-grow">
                  Track your full marketplace presence across both platforms without switching tools. Compare rank performance and competitor activity across Amazon India and Flipkart side by side in one view.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#F5F3FF] dark:bg-purple-900/30 text-[#7C3AED]">
                    Insydz Exclusive
                  </span>
                </div>
              </div>

            </div>

            <h2 id="insydz-vs-helium10" style={{ 
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
              How Does Insydz Compare to Other Flipkart Analytics Tools?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              Most tools Indian sellers encounter are built for Amazon.com. Here is an honest comparison of what is actually available for Flipkart seller analytics in 2026.
            </p>

            <div className="my-10 bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="bg-[#0F172A] text-white p-5 font-bold text-[13px] uppercase tracking-wider font-sans w-[28%]">
                        Feature
                      </th>
                      <th className="bg-[#6D28D9] text-white p-5 font-bold text-[13px] uppercase tracking-wider font-sans w-[18%]">
                        Insydz
                      </th>
                      <th className="bg-[#0F172A] text-white p-5 font-bold text-[13px] uppercase tracking-wider font-sans text-center w-[18%]">
                        Helium 10
                      </th>
                      <th className="bg-[#0F172A] text-white p-5 font-bold text-[13px] uppercase tracking-wider font-sans text-center w-[18%]">
                        Jungle Scout
                      </th>
                      <th className="bg-[#0F172A] text-white p-5 font-bold text-[13px] uppercase tracking-wider font-sans text-center w-[18%]">
                        Flipkart Seller Hub
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      {
                        f: "Flipkart keyword rank tracking",
                        p: true,
                        i: { t: <>✓ Daily</>, c: "green" },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "No", c: "red" }
                      },
                      {
                        f: "Amazon India rank tracking",
                        p: false,
                        i: { t: <>✓ Daily</>, c: "green" },
                        h: { t: "Limited", c: "yellow" },
                        j: { t: "US only", c: "red" },
                        s: { t: "No", c: "red" }
                      },
                      {
                        f: "Flipkart competitor price monitoring",
                        p: true,
                        i: { t: <>✓<br/>Automated</>, c: "green" },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "Manual only", c: "gray" }
                      },
                      {
                        f: "Hindi review analysis",
                        p: false,
                        i: { t: <>✓ AI-<br/>powered</>, c: "green" },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "No", c: "red" }
                      },
                      {
                        f: "Flipkart pricing trend history",
                        p: true,
                        i: { t: <>✓ Yes</>, c: "green" },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "Basic", c: "gray" }
                      },
                      {
                        f: "India-first support",
                        p: false,
                        i: { t: <>✓<br/>WhatsApp</>, c: "green" },
                        h: { t: "Email", c: "blue" },
                        j: { t: "Email", c: "blue" },
                        s: { t: "Ticket", c: "blue" }
                      },
                      {
                        f: "Starting price for Indian sellers",
                        p: true,
                        i: { t: <>Free /<br/>₹2,499</>, c: "green" },
                        h: { t: "₹7,000+/mo", c: "red" },
                        j: { t: "₹5,500+/mo", c: "red" },
                        s: { t: "Free (limited)", c: "green" }
                      }
                    ].map((row, idx) => {
                      const getStyle = (type: string) => {
                        switch(type) {
                          case 'green': return "bg-[#DCFCE7] text-[#16A34A] dark:bg-[#16A34A]/20 dark:text-[#4ADE80]";
                          case 'red': return "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]";
                          case 'yellow': return "bg-[#FEF3C7] text-[#D97706] dark:bg-[#D97706]/20 dark:text-[#FBBF24]";
                          case 'blue': return "bg-[#F1F5F9] text-[#475569] dark:bg-[#334155]/30 dark:text-[#94A3B8]";
                          case 'gray': return "text-[#64748B] dark:text-[#94A3B8]";
                          default: return "";
                        }
                      };
                      return (
                        <tr key={idx} className={`transition-colors ${row.p ? 'bg-[#FDFDFE] dark:bg-gray-900/20' : 'bg-white dark:bg-gray-900'}`}>
                          <td className={`p-5 ${row.p ? 'border-l-[4px] border-[#6D28D9]' : 'border-l-[4px] border-transparent'}`}>
                            <div className={`font-bold text-[15px] font-sans ${row.p ? 'text-[#6D28D9] dark:text-[#8B5CF6]' : 'text-[#4B5563] dark:text-[#D1D5DB]'}`}>
                              {row.f}
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`inline-block font-bold text-[13px] px-3 py-1 rounded-full ${getStyle(row.i.c)} leading-snug min-w-[80px]`}>
                              {row.i.t}
                            </span>
                          </td>
                          {['h', 'j', 's'].map(col => {
                            const data = row[col as keyof typeof row] as {t: string | JSX.Element, c: string};
                            return (
                              <td key={col} className="p-5 text-center">
                                <span className={`inline-block font-bold text-[13px] ${data.c === 'gray' ? '' : 'px-3 py-1.5 rounded-full'} ${getStyle(data.c)}`}>
                                  {data.t}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="my-10 bg-[#0F172A] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              <div className="flex-1">
                <div className="text-white text-[22px] md:text-[26px] font-bold font-sans mb-3 leading-tight" style={{ color: "white" }}>
                  Start Tracking Your Flipkart Rankings Today
                </div>
                <p className="text-[#94A3B8] text-[15px] font-sans leading-relaxed m-0" style={{ margin: 0 }}>
                  Free plan covers 5 products across Amazon India and Flipkart. No credit card needed.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <Button className="w-full md:w-auto bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-8 py-6 rounded-full text-[15px] shadow-lg transition-transform hover:scale-105" asChild>
                  <Link href="/login">Track Rankings Free →</Link>
                </Button>
              </div>
            </div>

            <h2 id="competitor-pricing" style={{ 
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
              How Do You Use Flipkart Competitor Tracking to Win on Pricing?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              Pricing on Flipkart is not static. Competitors change prices 3–8 times per week in competitive categories. The sellers who win are not the ones with the lowest price they are the ones who price strategically relative to the competitive set, using real-time data.
            </p>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/Flip_image_3.png" 
                  alt="Flipkart Competitor Price Alert Example" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Insydz competitor price alert a Flipkart price drop detected at 9:14 AM with suggested pricing action before the rank impact occurs.
              </p>
            </div>


            <p className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] mb-5 font-sans">
              A three-step pricing approach that works consistently for Flipkart sellers:
            </p>

            <ul className="space-y-5 mb-12" style={{ listStyle: "none", paddingLeft: 0 }}>
              <li className="flex items-start">
                <span className="text-[#6D28D9] dark:text-[#8B5CF6] text-[22px] leading-none mr-3.5 font-bold mt-[4px] flex-shrink-0">•</span>
                <span className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] font-sans">
                  <strong className="text-[#1E293B] dark:text-[#E2E8F0] font-bold">Set threshold alerts:</strong> Get notified when any competitor in your listing drops more than ₹30 below your price. This is the point where price competitiveness signals in Flipkart's algorithm typically start moving rank.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#6D28D9] dark:text-[#8B5CF6] text-[22px] leading-none mr-3.5 font-bold mt-[4px] flex-shrink-0">•</span>
                <span className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] font-sans">
                  <strong className="text-[#1E293B] dark:text-[#E2E8F0] font-bold">Read pricing trends before sale events:</strong> Check historical price data for your category in the 4 weeks before Big Billion Days, Diwali, and Republic Day Sale. Know the average discount depth your category takes so you can plan your pricing and inventory before the sale opens.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#6D28D9] dark:text-[#8B5CF6] text-[22px] leading-none mr-3.5 font-bold mt-[4px] flex-shrink-0">•</span>
                <span className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] font-sans">
                  <strong className="text-[#1E293B] dark:text-[#E2E8F0] font-bold">Track competitor stock levels:</strong> When a competitor goes out of stock, their sales velocity drops which creates an opening for you to gain rank without changing your price at all. Insydz flags competitor OOS events so you can capitalise within hours.
                </span>
              </li>
            </ul>


            <h2 id="common-mistakes" style={{ 
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
              What Are the Most Common Mistakes Flipkart Sellers Make Without Analytics?
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              These are the five mistakes that kill launches before they scale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Card 1 */}
              <div className="bg-[#FDFDFE] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 md:p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] dark:bg-red-900/30 flex items-center justify-center mb-6">
                  <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-3 leading-[1.4] font-sans">
                  Changing price without knowing rank impact
                </h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-[15px] leading-[1.7] font-sans m-0">
                  Sellers raise price by ₹50 to improve margin then watch rank fall from #9 to #22 over 10 days. Without rank tracking, they don't know the price change caused it until sales have already dropped significantly.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#FDFDFE] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 md:p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-orange-900/30 flex items-center justify-center mb-6">
                  <TrendingUp className="w-5 h-5 text-[#F97316]" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-3 leading-[1.4] font-sans">
                  Optimising the wrong keywords
                </h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-[15px] leading-[1.7] font-sans m-0">
                  Sellers invest in ranking for "kitchen organiser" when "modular kitchen shelf india" has less competition and comparable traffic. Without search ranking data, keyword strategy is based on guesswork, not evidence.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#FDFDFE] dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-[28px] p-7 md:p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] dark:bg-purple-900/30 flex items-center justify-center mb-6">
                  <Activity className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-3 leading-[1.4] font-sans">
                  Missing festive season pricing windows
                </h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-[15px] leading-[1.7] font-sans m-0">
                  Without Flipkart pricing trend data, sellers either discount too aggressively (destroying margin) or discount too little (losing the rank boost that festive sales velocity provides). The right discount depth is a data question.
                </p>
              </div>
            </div>

            <h2 id="real-results" style={{ 
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
              What Real Results Do Indian Sellers Get With Flipkart Analytics?
            </h2>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/Flip_image_4.png" 
                  alt="Flipkart Seller Analytics Case Study" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Insydz rank tracking for a Pune fitness seller on Flipkart from #31 to #6 in 5 weeks using competitor price alerts and strategic pricing during a competitor's stock outage.
              </p>
            </div>
            
            <div className="box box-green" style={{ 
              background: resolvedTheme === 'dark' ? "#064e3b20" : "#F0FDF4", 
              borderLeft: "6px solid #10B981", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(16,185,129,0.08)"
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#059669", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                BEFORE INSYDZ
              </div>
              <div>A Pune D2C fitness brand selling yoga mats was stuck at #31 for "yoga mat 6mm" on Flipkart. Sales were flat for 8 weeks. The seller didn't know they were out-priced by ₹50 by the top 5 results, and a key competitor's stock levels were fluctuating weekly.</div>
            </div>

            <div className="box box-amber" style={{ 
              background: resolvedTheme === 'dark' ? "#2d1b10" : "#FFFBEB", 
              borderLeft: "6px solid #D97706", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(217,119,6,0.08)"
             }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#D97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                ACTIONS TAKEN (WEEKS 1–5 WITH INSYDZ)
              </div>
              <p>On Day 3, an Insydz alert flagged a top-5 competitor going out of stock. The seller matched the next competitor's price (₹399 vs ₹449) for 72 hours to capture the OOS sales velocity window, then restored ₹449 and held the rank gain.</p>
            </div>

            <div className="box box-green" style={{ 
              background: resolvedTheme === 'dark' ? "#064e3b20" : "#F0FDF4", 
              borderLeft: "6px solid #10B981", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(16,185,129,0.08)"
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#059669", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                RESULTS AT WEEK 6
              </div>
              <div>Rank moved from #31 to #6. Revenue up 213% over 6 weeks, driven by three strategic price changes informed by Insydz competitor alerts. Total tool cost: ₹2,499/month.</div>
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

            {/* Related Reading on Insydz */}
            <div style={{
              marginTop: 48,
              background: resolvedTheme === 'dark' ? "rgba(124,58,237,0.06)" : "#F5F3FF",
              borderLeft: "4px solid #7C3AED",
              borderRadius: 16,
              padding: "28px 32px",
            }}>
              <p style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase" as const,
                letterSpacing: "1.5px",
                color: "#7C3AED",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span>📌</span> Related Reading on Insydz
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {[
                  { label: "How to Launch a Private Label Product on Amazon India in 2026", route: "/resources/expert-blog/amazon-private-label-india-2026" },
                  { label: "Amazon Vine Program India 2026: Cost, Worth & How to Enrol", route: "/resources/expert-blog/amazon-vine-program-india-2026" },
                  { label: "AI Review Intelligence Tool for Amazon & Flipkart: Complete Guide", route: "/resources/expert-blog/amazon-review-analysis-guide-india" },
                  { label: "Big Billion Days Prep Checklist for D2C Brands", route: "/resources/expert-blog/amazon-vs-flipkart-india-seller" },
                  { label: "Insydz vs Helium 10: Which is Better for Indian Sellers?", route: "/resources/expert-blog/insydz-vs-helium-10-india" },
                ].map((link, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ color: "#7C3AED", fontSize: 8, flexShrink: 0, position: "relative" as const, top: "-1px" }}>●</span>
                    <Link
                      href={link.route}
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: 15,
                        color: "#7C3AED",
                        textDecoration: "none",
                        lineHeight: 1.5,
                        transition: "color 0.2s",
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.color = "#5B21B6"; e.currentTarget.style.textDecoration = "underline"; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = "#7C3AED"; e.currentTarget.style.textDecoration = "none"; }}
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
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
        background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 40%, #5B21B6 100%)", 
        padding: "clamp(48px,8vw,80px) 20px clamp(40px,6vw,64px)", 
        textAlign: "center", 
        margin: "60px 0 0",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", top: "40%", left: "10%", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ 
            fontFamily: "'Sora', sans-serif", fontSize: "clamp(26px, 4.5vw, 42px)", fontWeight: 900, 
            color: "white", lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: 20,
          }}>
            Stop Guessing. Start Tracking Your Flipkart Rankings.
          </h2>
          
          <p style={{ 
            fontFamily: "'Lora', serif", fontSize: "clamp(14px, 2vw, 17px)", 
            color: "rgba(255,255,255,0.85)", lineHeight: 1.65, maxWidth: 620, margin: "0 auto 32px" 
          }}>
            India&apos;s only analytics tool built for both Amazon India and Flipkart. Track rank daily, monitor competitor prices, and act before the algorithm moves against you.
          </p>
          
          {/* Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 40 }}>
            <Link href="/login"
              style={{ 
                display: "inline-block", background: "white", color: "#7C3AED", 
                fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "clamp(14px, 1.5vw, 15px)", 
                padding: "14px 32px", borderRadius: 100, textDecoration: "none",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)", transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.25)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
            >
              Track Rankings Free →
            </Link>
            <Link href="/pricing"
              style={{ 
                display: "inline-block", background: "transparent", color: "white", 
                fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "clamp(14px, 1.5vw, 15px)", 
                padding: "14px 32px", borderRadius: 100, textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.4)",
                transition: "transform 0.2s, border-color 0.2s, background 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
            >
              See Full Pricing
            </Link>
          </div>
          
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, maxWidth: 640, margin: "0 auto" }}>
            {[
              { value: "5,000+", label: "Indian sellers" },
              { value: "Free", label: "To start · No card" },
              { value: "Daily", label: "Rank updates" },
              { value: "2", label: "Platforms tracked" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: "20px 12px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(20px, 3vw, 26px)",
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1.2,
                  marginBottom: 4,
                  fontStyle: "italic",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.3,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
