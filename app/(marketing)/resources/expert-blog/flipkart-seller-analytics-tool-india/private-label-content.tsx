"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  LayoutGrid,
  AlertCircle,
  Activity,
  Plus,
  CheckCircle2,
  ArrowRight,
  LineChart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { useTheme } from "next-themes";
import BlogImageSection from "../components/BlogImageSection";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaPrivateLabel = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: { "@type": "ImageObject", url: "https://insydz.com/logo.png" },
      sameAs: [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz",
      ],
      description:
        "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers.",
    },
    {
      "@type": "WebPage",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026",
      url: "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026",
      name: "Amazon Private Label Guide India 2026: Everything You Need to Know",
      description:
        "Learn everything about starting an Amazon Private Label business in India for 2026. How to find products, source suppliers, and build a brand.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: "https://insydz.com/resources",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Expert Blog",
          item: "https://insydz.com/resources/expert-blog",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Flipkart Seller Analytics Tool",
          item: "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#article",
      headline:
        "Amazon Private Label Guide India 2026: Everything You Need to Know",
      description:
        "A comprehensive guide to starting an Amazon Private Label business in India for 2026. Replicating the success of top brands.",
      image: "https://insydz.com/Amazon-Vine-India-image1.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-05-15",
      dateModified: "2026-05-15",
      keywords: [
        "amazon private label india",
        "private label amazon 2026",
        "sell on amazon india",
        "ecommerce brand building india",
      ],
      articleSection: "Seller Tools & Strategy",
      inLanguage: "en-IN",
      wordCount: 4400,
      timeRequired: "PT12M",
    },
  ],
};

// ── TOC ───────────────────────────────────────────────────────────────────────

// ── TOC ───────────────────────────────────────────────────────────────────────
const TOC = [
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "why-analytics", label: "Why Sellers Need Analytics" },
  { id: "what-to-track", label: "What Analytics Tools Track" },
  { id: "flipkart-algorithm", label: "Flipkart Algorithm Explained" },
  { id: "key-features", label: "Key Features to Look For" },
  { id: "insydz-vs-helium10", label: "Insydz vs Helium 10 / JungleScout" },
  { id: "competitor-pricing", label: "Competitor Pricing Strategy" },
  { id: "common-mistakes", label: "Common Mistakes" },
  { id: "real-results", label: "Real Seller Results" },
  { id: "faq", label: "FAQs" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is a Flipkart seller analytics tool?",
    a: "A Flipkart seller analytics tool tracks your product's search ranking by keyword, monitors competitor prices and stock levels, and surfaces marketplace data insights so you can act before competitors do. Unlike Flipkart Seller Hub, which shows sales data, an analytics tool shows the inputs that drive those sales rank, pricing, and listing quality.",
  },
  {
    q: "Can I track Flipkart competitor prices automatically?",
    a: "Yes. Insydz monitors Flipkart competitor prices daily and sends alerts when a competitor drops price, goes out of stock, or changes their listing. Manual price checking misses 70%+ of price changes automated monitoring catches them within hours so you can respond before your rank is affected.",
  },
  {
    q: "How does Flipkart's search ranking algorithm work?",
    a: "Flipkart's algorithm weights five main signals: sales velocity (30%), price competitiveness (25%), listing completeness (20%), seller rating and fulfilment speed (15%), and review count and rating (10%). Sellers who track rank daily can see which of these signals are causing position changes and act directly on the right lever.",
  },
  {
    q: "Is there a free Flipkart analytics tool for Indian sellers?",
    a: "Insydz offers a free plan covering rank tracking for up to 5 products across Amazon India and Flipkart. Paid plans start at ₹2,499 per month for unlimited tracking, competitor price monitoring, and AI review analysis. No credit card is required to start the free plan.",
  },
  {
    q: "How is Insydz different from Helium 10 or Jungle Scout for Flipkart?",
    a: "Helium 10 and Jungle Scout are built for Amazon.com neither tracks Flipkart keywords, competitor prices, or Hindi reviews. Insydz is built specifically for Indian marketplaces: it tracks Amazon India and Flipkart in one dashboard, processes Hindi reviews with AI, and is priced for Indian seller budgets.",
  },
  {
    q: "What data does a Flipkart analytics tool track?",
    a: "A comprehensive Flipkart analytics tool tracks: search rank by keyword (daily), competitor product prices and stock status, listing quality scores, review sentiment and complaint themes in Hindi and English, sales rank movement, and historical pricing trends across the Flipkart marketplace covering festive sale periods like Big Billion Days and Diwali.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonPrivateLabelContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("what-is-private-label");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = "insydz-private-label-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaPrivateLabel);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC[i].id);
          break;
        }
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
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          background: resolvedTheme === "dark" ? "#0f172a" : "#F5F8FF",
          borderBottom:
            resolvedTheme === "dark"
              ? "1px solid #1e293b"
              : "1px solid #E5E7EB",
          padding: "8px 0",
        }}
      >
        <div
          className="breadcrumb-inner"
          style={{ color: resolvedTheme === "dark" ? "#94a3b8" : "#94A3B8" }}
        >
          <Link
            href="/"
            style={{
              color: resolvedTheme === "dark" ? "#cbd5e1" : "#64748B",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Home
          </Link>
          <span
            style={{ color: resolvedTheme === "dark" ? "#475569" : "#cbd5e1" }}
          >
            ›
          </span>
          <Link
            href="/resources/expert-blog"
            style={{
              color: resolvedTheme === "dark" ? "#cbd5e1" : "#64748B",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Blog
          </Link>
          <span
            style={{ color: resolvedTheme === "dark" ? "#475569" : "#cbd5e1" }}
          >
            ›
          </span>
          <span
            style={{ color: resolvedTheme === "dark" ? "#64748b" : "#94A3B8" }}
          >
            Best Flipkart Analytics Tool
          </span>
        </div>
      </div>

      {/* HERO SECTION - REVISED TO MATCH IMAGE */}
      <div
        style={{
          background: resolvedTheme === "dark" ? "#0f1120" : "#F5F3FF",
          padding: "48px 0",
          borderBottom:
            resolvedTheme === "dark"
              ? "1px solid #1f2937"
              : "1px solid #E2E8F0",
        }}
      >
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Content */}
          <div className="lg:col-span-7">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: resolvedTheme === "dark" ? "#1e1b4b" : "#EBE5FE",
                color: resolvedTheme === "dark" ? "#818cf8" : "#7C3AED",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 20,
                marginBottom: 20,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              <span style={{ marginRight: 8, color: "#7C3AED" }}>●</span>{" "}
              FLIPKART SELLER ANALYTICS · BOFU GUIDE
            </div>

            <h1
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(28px, 4.5vw, 48px)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: resolvedTheme === "dark" ? "white" : "#111827",
                letterSpacing: "-1px",
                marginBottom: 20,
              }}
            >
              Best{" "}
              <span style={{ color: "#7C3AED" }}>Flipkart Analytics Tool</span>{" "}
              for Indian Sellers (2026)
            </h1>

            <p
              style={{
                fontSize: "clamp(15px, 2vw, 18px)",
                color: resolvedTheme === "dark" ? "#9ca3af" : "#4B5563",
                lineHeight: 1.6,
                marginBottom: 24,
                maxWidth: 600,
                fontFamily: "'Lora', serif",
              }}
            >
              Track competitor prices, monitor search rankings, and decode the
              Flipkart algorithm all in one dashboard. India's only{" "}
              <strong>Flipkart seller software</strong> that covers pricing
              trends, marketplace data, and keyword rank movement in real time.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap" as const,
                gap: "4px 14px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "clamp(11px,2vw,13px)",
                  color: "#64748B",
                }}
              >
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <strong
                  className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer"
                  onClick={() => router.push("/author/vikrant-singh")}
                >
                  Vikrant Singh
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "clamp(11px,2vw,13px)",
                  color: "#64748B",
                }}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                May 2026
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "clamp(11px,2vw,13px)",
                  color: "#64748B",
                }}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <strong>12 min read</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 h-auto"
              >
                <Link href="/login">Track Your Flipkart Rankings Free →</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={`font-bold px-8 py-3 rounded-full h-auto transition-colors ${resolvedTheme === "dark" ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-transparent border-[#C4B5FD] text-[#7C3AED] hover:bg-[#F5F3FF]"}`}
              >
                <Link href="/pricing">See Plans</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Snapshot Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              style={{
                background: resolvedTheme === "dark" ? "#111827" : "white",
                borderRadius: 24,
                padding: 24,
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 20px 50px rgba(0,0,0,0.3)"
                    : "0 20px 50px rgba(0,0,0,0.05)",
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #374151"
                    : "1px solid #F3F4F6",
                maxWidth: 420,
                width: "100%",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Flipkart Rank Tracker — Insydz
                </h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#DCFCE7",
                    color: "#16A34A",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#16A34A",
                    }}
                  ></span>{" "}
                  Live
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  {
                    val: "₹2,499",
                    lbl: "Starting / month",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F8F9FA",
                    col: "#7C3AED",
                  },
                  {
                    val: "Daily",
                    lbl: "Rank updates",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F8F9FA",
                    col: "#16A34A",
                  },
                  {
                    val: "2",
                    lbl: "Platforms tracked",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F8F9FA",
                    col: "#EA580C",
                  },
                  {
                    val: "5,000+",
                    lbl: "Sellers using Insydz",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F8F9FA",
                    col: "#111827",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: s.bg,
                      padding: "16px 12px",
                      borderRadius: 16,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color:
                          s.col === "#111827" && resolvedTheme === "dark"
                            ? "white"
                            : s.col,
                        marginBottom: 2,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#9CA3AF",
                        lineHeight: 1.2,
                      }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <h5
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 12,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  LIVE KEYWORD RANK TRACKING
                </h5>
                <div className="space-y-3">
                  {[
                    {
                      kw: "yoga mat 6mm flipkart",
                      rank: "#7",
                      diff: "↑12",
                      color: "#16A34A",
                    },
                    {
                      kw: "steel water bottle india",
                      rank: "#14",
                      diff: "↑6",
                      color: "#16A34A",
                    },
                    {
                      kw: "phone stand adjustable",
                      rank: "#23",
                      diff: "↓3",
                      color: "#EA580C",
                    },
                    {
                      kw: "kitchen organiser rack",
                      rank: "#5",
                      diff: "↑18",
                      color: "#16A34A",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center"
                      style={{
                        fontSize: 13,
                        borderBottom: i === 3 ? "none" : "1px solid #F1F5F9",
                        paddingBottom: i === 3 ? 0 : 8,
                      }}
                    >
                      <span className="text-[#64748B]">{row.kw}</span>
                      <div
                        className="flex gap-2 font-bold"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        <span style={{ color: row.color }}>{row.rank}</span>
                        <span style={{ color: row.color }}>{row.diff}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: "#7C3AED",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "white",
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  You moved from #23 to #5 on "kitchen organiser rack" after the
                  listing update. Insydz caught it the next morning — your
                  competitor hadn't noticed yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SUMMARY & TAKEAWAYS - MATCHING IMAGE */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        {/* Quick Answer Box */}
        <div
          style={{
            background: resolvedTheme === "dark" ? "#111827" : "#F8F9FF",
            borderLeft: "4px solid #6366F1",
            borderRadius: 8,
            padding: "24px 32px",
            marginBottom: 40,
          }}
          className="dark:border-indigo-500"
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#6366F1",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 12,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            QUICK ANSWER
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              color: resolvedTheme === "dark" ? "#d1d5db" : "#4B5563",
              lineHeight: 1.65,
              fontFamily: "'Lora', serif",
            }}
          >
            A Flipkart analytics tool tracks your product's search rank by
            keyword, monitors competitor prices and stock levels, and surfaces
            marketplace data insights so you can act before competitors do.
            Insydz is the only tool that covers both Flipkart and Amazon India
            in one dashboard, processes Hindi reviews, and is priced for Indian
            seller budgets starting free.{" "}
          </p>
        </div>

        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/Flipkart Analytics Tool.png"
          altText="Flipkart Analytics Tool"
          caption="Insydz dashboard for a Flipkart seller. It automatically ingests sales and inventory data via the Flipkart API and combines it with competitive intelligence from the Amazon marketplace."
        />

        {/* Key Takeaways Box */}
        <div
          id="key-takeaways"
          style={{
            background: "#0F172A",
            borderRadius: 24,
            padding: "40px",
            marginBottom: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "white",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <span style={{ fontSize: 24 }}>📋</span> Key Takeaways: Amazon
            Private Label India 2026
          </h3>

          <div className="space-y-6">
            {[
              "Flipkart's search algorithm rewards sales velocity, listing completeness, competitive pricing, and seller rating tracking these daily tells you what to fix before you lose rank.",
              "Manual price monitoring misses 70%+ of competitor price changes. Automated Flipkart competitor tracking catches price drops within hours, not days.",
              "Sellers using analytics tools on Flipkart outperform those who don't by an average 2.3× in revenue growth over 12 months because they act on data, not intuition.",
              "Helium 10 and Jungle Scout do not track Flipkart. Insydz is built specifically for Amazon India and Flipkart, with Hindi review processing and pricing built for Indian sellers.",
              "Start with keyword rank tracking it's the single metric that correlates most directly with organic revenue on Flipkart India.",
            ].map((text, i) => (
              <div key={i} className="flex gap-4">
                <div
                  style={{
                    background: "#6366F1",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: "#94A3B8",
                    lineHeight: 1.6,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* SIDEBAR */}
        <aside
          className="toc-sidebar"
          style={{
            background: resolvedTheme === "dark" ? "#111827" : "#fff",
            borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
          }}
        >
          <h4
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
              marginBottom: "16px",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Table of Contents
          </h4>
          <ul
            className="space-y-1"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {TOC.map((t) => (
              <li key={t.id}>
                <button
                  className={`toc-link${activeSection === t.id ? " active" : ""}`}
                  onClick={() => go(t.id)}
                  style={{
                    color:
                      activeSection === t.id
                        ? "#7C3AED"
                        : resolvedTheme === "dark"
                          ? "#94a3b8"
                          : "#64748B",
                    background:
                      activeSection === t.id
                        ? resolvedTheme === "dark"
                          ? "#1e1033"
                          : "#F5F3FF"
                        : "transparent",
                    borderLeft:
                      activeSection === t.id
                        ? "2px solid #7C3AED"
                        : "2px solid transparent",
                  }}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          <button
            className="mobile-toc-btn"
            onClick={() => setTocOpen(!tocOpen)}
            style={{
              background: resolvedTheme === "dark" ? "#111827" : "#fff",
              color: resolvedTheme === "dark" ? "#f9fafb" : "#111",
              borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
            }}
          >
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div
            className={`mobile-toc-panel${tocOpen ? " open" : ""}`}
            style={{
              background: resolvedTheme === "dark" ? "#111827" : "#fff",
              borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
            }}
          >
            {TOC.map((t) => (
              <button
                key={t.id}
                className="toc-link"
                style={{ display: "block", marginBottom: 3 }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            <h2
              id="why-analytics"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "0 0 28px",
              }}
            >
              Why Do Flipkart Sellers Need an Analytics Tool in 2026?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              Flipkart has over 300 million registered users and more than 1.4
              lakh seller accounts competing for the same search positions.
              Selling on Flipkart without analytics is like driving on a highway
              at night with your headlights off you might stay on the road for a
              while, but you will not see the obstacle until it is too late.
            </p>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              The gap between Flipkart's top 10 and position 20 is not about
              product quality it is about data. Sellers in the top 10 track
              their rank daily and respond to competitor price changes within
              hours. Sellers outside the top 10 are guessing.
            </p>

            <div
              className="box box-purple"
              style={{
                background: resolvedTheme === "dark" ? "#1e1b4b" : "#F5F3FF",
                borderLeft: "6px solid #8B5CF6",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(139,92,246,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#7C3AED",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                📊 The Data Gap on Flipkart India
              </div>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 15.5,
                  color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                  lineHeight: 1.75,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Flipkart does not give sellers keyword rank data inside their
                seller dashboard. You can see sales and returns but not where
                you rank for the keywords that drive those sales. Without a
                Flipkart analytics tool, you are optimising blind.
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
                    Flipkart Seller Hub shows sales not where you rank for the
                    keywords driving them. Without rank data, you cannot know if
                    your listing is gaining or losing ground each day.
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
                    Manual price checking catches maybe 30% of competitor price
                    moves. On Flipkart, a competitor dropping ₹50 can push you
                    from position #8 to #19 overnight invisible without
                    automated tracking.
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
                    Categories on Flipkart have seasonal pricing rhythms Big
                    Billion Days, Republic Day Sale, Diwali. Without pricing
                    trend data, sellers discount at the wrong times and leave
                    margin on the table.
                  </p>
                </div>
              </div>

              {/* Yellow Banner */}
              <div className="bg-[#FFF8E7] dark:bg-[#45300B] border border-[#FDE047] dark:border-[#B45309] rounded-[32px] p-8 md:p-10 text-center">
                <h3 className="text-xl md:text-[22px] font-bold text-[#B45309] dark:text-[#FDE047] mb-3 font-sans">
                  Flipkart sellers using analytics tools grow revenue 2.3×
                  faster than those who don't.
                </h3>
                <p className="text-[15px] md:text-base text-[#B45309] dark:text-[#FEF08A] font-medium font-sans">
                  The difference is not the product it's knowing your rank, your
                  competitor's price, and your category trends before they
                  change.
                </p>
              </div>
            </div>

            <h2
              id="what-to-track"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              What Does a Flipkart Analytics Tool Actually Track?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              The best Flipkart seller software tracks five distinct data layers
              each answering a different question about your marketplace
              position. Most sellers only use one or two. The sellers
              consistently in the top 5 use all of them together.
            </p>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              Here is what each layer tells you and why it matters:
            </p>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Keyword rank tracking: </strong> Where you appear in
              Flipkart search for each target keyword, updated daily. The most
              direct proxy for organic revenue rank #7 versus #20 for the same
              keyword can mean 4× the traffic.
            </p>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Competitor price monitoring: </strong> Automated alerts
              when a competitor on your category listing changes their price,
              goes out of stock, or updates their title.
            </p>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Review sentiment analysis: </strong> AI-powered clustering
              of your own and competitors' reviews into complaint themes
              surfaces the product issues driving rating drops before they
              compound.
            </p>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Pricing trends: </strong> Category-level price history for
              Flipkart, so you can see how prices move around Big Billion Days,
              Republic Day Sale, and Diwali and plan your pricing strategy in
              advance rather than reacting.
            </p>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Listing quality score: </strong> A scored audit of your
              listing's title, images, description, and attribute completeness
              against Flipkart's algorithm requirements.
            </p>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "40px",
                fontFamily: "'Lora', serif",
              }}
            >
              Categories to consider: kitchen organisers, water bottles,
              stainless steel containers, personal care kits, and stationery
              sets. Avoid electronics established brands dominate with
              warranties private label cannot match.
            </p>

            {/* S4: Sourcing */}
            <h2
              id="flipkart-algorithm"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              How Does Flipkart's Search Ranking Algorithm Work in 2026?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "28px",
                fontFamily: "'Lora', serif",
              }}
            >
              Flipkart does not publish its ranking algorithm. But consistent
              analysis of rank movement data across thousands of Indian seller
              accounts reveals the factors that matter most and the weight each
              carries.
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
                Flipkart search ranking algorithm signals approximate weightings
                derived from rank movement analysis across Insydz seller
                accounts on Flipkart India in 2026.
              </p>
            </div>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "28px",
                fontFamily: "'Lora', serif",
              }}
            >
              The practical implication: if your Flipkart rank drops without any
              changes to your listing, the most likely cause is a competitor
              improving their price competitiveness or sales velocity. A{" "}
              <strong>Flipkart competitor tracking tool</strong> catches this
              immediately without it, you are troubleshooting in the dark.
            </p>
            <div
              className="box box-amber"
              style={{
                background: resolvedTheme === "dark" ? "#2d1b10" : "#FFFBEB",
                borderLeft: "6px solid #D97706",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(217,119,6,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#D97706",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ⚠️ PRODUCT SELECTION RED FLAGS
              </div>
              <div>
                A competitor in Surat drops their price by ₹40 on a Thursday by
                Friday morning they rank 8 positions above you. Your sales
                velocity falls, compounding the rank drop. Automated Flipkart
                price monitoring catches it within hours, before the cascade
                hits.
              </div>
            </div>

            <h2
              id="key-features"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
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
                  Track exactly where your product appears in Flipkart search
                  for every keyword that matters updated daily, not weekly. See
                  rank movement alongside competitor actions to understand what
                  caused each change.
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
                  Automated alerts when any competitor in your category changes
                  price, goes out of stock, or changes fulfilment method. Set
                  custom thresholds get notified when a competitor drops below
                  your price by more than ₹30.
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
                  Get a scored audit of your Flipkart listing's title, images,
                  description, attributes, and keyword density against
                  Flipkart's content requirements with specific recommendations
                  for what to fix first.
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
                  Cluster your own and competitor reviews into complaint themes
                  and praise patterns in both Hindi and English. Surface product
                  issues and positioning gaps before they show in your star
                  rating.
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
                  See how category prices on Flipkart move across the year Big
                  Billion Days, Republic Day Sale, Diwali, Navratri. Know the
                  average discount depth for your category weeks before each
                  sale event.
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
                  Track your full marketplace presence across both platforms
                  without switching tools. Compare rank performance and
                  competitor activity across Amazon India and Flipkart side by
                  side in one view.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#F5F3FF] dark:bg-purple-900/30 text-[#7C3AED]">
                    Insydz Exclusive
                  </span>
                </div>
              </div>
            </div>

            <h2
              id="insydz-vs-helium10"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              How Does Insydz Compare to Other Flipkart Analytics Tools?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              Most tools Indian sellers encounter are built for Amazon.com. Here
              is an honest comparison of what is actually available for Flipkart
              seller analytics in 2026.
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
                        s: { t: "No", c: "red" },
                      },
                      {
                        f: "Amazon India rank tracking",
                        p: false,
                        i: { t: <>✓ Daily</>, c: "green" },
                        h: { t: "Limited", c: "yellow" },
                        j: { t: "US only", c: "red" },
                        s: { t: "No", c: "red" },
                      },
                      {
                        f: "Flipkart competitor price monitoring",
                        p: true,
                        i: {
                          t: (
                            <>
                              ✓<br />
                              Automated
                            </>
                          ),
                          c: "green",
                        },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "Manual only", c: "gray" },
                      },
                      {
                        f: "Hindi review analysis",
                        p: false,
                        i: {
                          t: (
                            <>
                              ✓ AI-
                              <br />
                              powered
                            </>
                          ),
                          c: "green",
                        },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "No", c: "red" },
                      },
                      {
                        f: "Flipkart pricing trend history",
                        p: true,
                        i: { t: <>✓ Yes</>, c: "green" },
                        h: { t: "No", c: "red" },
                        j: { t: "No", c: "red" },
                        s: { t: "Basic", c: "gray" },
                      },
                      {
                        f: "India-first support",
                        p: false,
                        i: {
                          t: (
                            <>
                              ✓<br />
                              WhatsApp
                            </>
                          ),
                          c: "green",
                        },
                        h: { t: "Email", c: "blue" },
                        j: { t: "Email", c: "blue" },
                        s: { t: "Ticket", c: "blue" },
                      },
                      {
                        f: "Starting price for Indian sellers",
                        p: true,
                        i: {
                          t: (
                            <>
                              Free /<br />
                              ₹2,499
                            </>
                          ),
                          c: "green",
                        },
                        h: { t: "₹7,000+/mo", c: "red" },
                        j: { t: "₹5,500+/mo", c: "red" },
                        s: { t: "Free (limited)", c: "green" },
                      },
                    ].map((row, idx) => {
                      const getStyle = (type: string) => {
                        switch (type) {
                          case "green":
                            return "bg-[#DCFCE7] text-[#16A34A] dark:bg-[#16A34A]/20 dark:text-[#4ADE80]";
                          case "red":
                            return "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]";
                          case "yellow":
                            return "bg-[#FEF3C7] text-[#D97706] dark:bg-[#D97706]/20 dark:text-[#FBBF24]";
                          case "blue":
                            return "bg-[#F1F5F9] text-[#475569] dark:bg-[#334155]/30 dark:text-[#94A3B8]";
                          case "gray":
                            return "text-[#64748B] dark:text-[#94A3B8]";
                          default:
                            return "";
                        }
                      };
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${row.p ? "bg-[#FDFDFE] dark:bg-gray-900/20" : "bg-white dark:bg-gray-900"}`}
                        >
                          <td
                            className={`p-5 ${row.p ? "border-l-[4px] border-[#6D28D9]" : "border-l-[4px] border-transparent"}`}
                          >
                            <div
                              className={`font-bold text-[15px] font-sans ${row.p ? "text-[#6D28D9] dark:text-[#8B5CF6]" : "text-[#4B5563] dark:text-[#D1D5DB]"}`}
                            >
                              {row.f}
                            </div>
                          </td>
                          <td className="p-5">
                            <span
                              className={`inline-block font-bold text-[13px] px-3 py-1 rounded-full ${getStyle(row.i.c)} leading-snug min-w-[80px]`}
                            >
                              {row.i.t}
                            </span>
                          </td>
                          {["h", "j", "s"].map((col) => {
                            const data = row[col as keyof typeof row] as {
                              t: string | JSX.Element;
                              c: string;
                            };
                            return (
                              <td key={col} className="p-5 text-center">
                                <span
                                  className={`inline-block font-bold text-[13px] ${data.c === "gray" ? "" : "px-3 py-1.5 rounded-full"} ${getStyle(data.c)}`}
                                >
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
                <div
                  className="text-white text-[22px] md:text-[26px] font-bold font-sans mb-3 leading-tight"
                  style={{ color: "white" }}
                >
                  Start Tracking Your Flipkart Rankings Today
                </div>
                <p
                  className="text-[#94A3B8] text-[15px] font-sans leading-relaxed m-0"
                  style={{ margin: 0 }}
                >
                  Free plan covers 5 products across Amazon India and Flipkart.
                  No credit card needed.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <Button
                  className="w-full md:w-auto bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-8 py-6 rounded-full text-[15px] shadow-lg transition-transform hover:scale-105"
                  asChild
                >
                  <Link href="/login">Track Rankings Free →</Link>
                </Button>
              </div>
            </div>

            <h2
              id="competitor-pricing"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              How Do You Use Flipkart Competitor Tracking to Win on Pricing?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              Pricing on Flipkart is not static. Competitors change prices 3–8
              times per week in competitive categories. The sellers who win are
              not the ones with the lowest price they are the ones who price
              strategically relative to the competitive set, using real-time
              data.
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
                Insydz competitor price alert a Flipkart price drop detected at
                9:14 AM with suggested pricing action before the rank impact
                occurs.
              </p>
            </div>

            <p className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] mb-5 font-sans">
              A three-step pricing approach that works consistently for Flipkart
              sellers:
            </p>

            <ul
              className="space-y-5 mb-12"
              style={{ listStyle: "none", paddingLeft: 0 }}
            >
              <li className="flex items-start">
                <span className="text-[#6D28D9] dark:text-[#8B5CF6] text-[22px] leading-none mr-3.5 font-bold mt-[4px] flex-shrink-0">
                  •
                </span>
                <span className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] font-sans">
                  <strong className="text-[#1E293B] dark:text-[#E2E8F0] font-bold">
                    Set threshold alerts:
                  </strong>{" "}
                  Get notified when any competitor in your listing drops more
                  than ₹30 below your price. This is the point where price
                  competitiveness signals in Flipkart's algorithm typically
                  start moving rank.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#6D28D9] dark:text-[#8B5CF6] text-[22px] leading-none mr-3.5 font-bold mt-[4px] flex-shrink-0">
                  •
                </span>
                <span className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] font-sans">
                  <strong className="text-[#1E293B] dark:text-[#E2E8F0] font-bold">
                    Read pricing trends before sale events:
                  </strong>{" "}
                  Check historical price data for your category in the 4 weeks
                  before Big Billion Days, Diwali, and Republic Day Sale. Know
                  the average discount depth your category takes so you can plan
                  your pricing and inventory before the sale opens.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#6D28D9] dark:text-[#8B5CF6] text-[22px] leading-none mr-3.5 font-bold mt-[4px] flex-shrink-0">
                  •
                </span>
                <span className="text-[#4B5563] dark:text-[#94A3B8] text-[15px] md:text-[16px] leading-[1.7] font-sans">
                  <strong className="text-[#1E293B] dark:text-[#E2E8F0] font-bold">
                    Track competitor stock levels:
                  </strong>{" "}
                  When a competitor goes out of stock, their sales velocity
                  drops which creates an opening for you to gain rank without
                  changing your price at all. Insydz flags competitor OOS events
                  so you can capitalise within hours.
                </span>
              </li>
            </ul>

            <h2
              id="common-mistakes"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              What Are the Most Common Mistakes Flipkart Sellers Make Without
              Analytics?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
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
                  Sellers raise price by ₹50 to improve margin then watch rank
                  fall from #9 to #22 over 10 days. Without rank tracking, they
                  don't know the price change caused it until sales have already
                  dropped significantly.
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
                  Sellers invest in ranking for "kitchen organiser" when
                  "modular kitchen shelf india" has less competition and
                  comparable traffic. Without search ranking data, keyword
                  strategy is based on guesswork, not evidence.
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
                  Without Flipkart pricing trend data, sellers either discount
                  too aggressively (destroying margin) or discount too little
                  (losing the rank boost that festive sales velocity provides).
                  The right discount depth is a data question.
                </p>
              </div>
            </div>

            <h2
              id="real-results"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
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
                Insydz rank tracking for a Pune fitness seller on Flipkart from
                #31 to #6 in 5 weeks using competitor price alerts and strategic
                pricing during a competitor's stock outage.
              </p>
            </div>

            <div
              className="box box-green"
              style={{
                background: resolvedTheme === "dark" ? "#064e3b20" : "#F0FDF4",
                borderLeft: "6px solid #10B981",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(16,185,129,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                BEFORE INSYDZ
              </div>
              <div>
                A Pune D2C fitness brand selling yoga mats was stuck at #31 for
                "yoga mat 6mm" on Flipkart. Sales were flat for 8 weeks. The
                seller didn't know they were out-priced by ₹50 by the top 5
                results, and a key competitor's stock levels were fluctuating
                weekly.
              </div>
            </div>

            <div
              className="box box-amber"
              style={{
                background: resolvedTheme === "dark" ? "#2d1b10" : "#FFFBEB",
                borderLeft: "6px solid #D97706",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(217,119,6,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#D97706",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ACTIONS TAKEN (WEEKS 1–5 WITH INSYDZ)
              </div>
              <p>
                On Day 3, an Insydz alert flagged a top-5 competitor going out
                of stock. The seller matched the next competitor's price (₹399
                vs ₹449) for 72 hours to capture the OOS sales velocity window,
                then restored ₹449 and held the rank gain.
              </p>
            </div>

            <div
              className="box box-green"
              style={{
                background: resolvedTheme === "dark" ? "#064e3b20" : "#F0FDF4",
                borderLeft: "6px solid #10B981",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(16,185,129,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                RESULTS AT WEEK 6
              </div>
              <div>
                Rank moved from #31 to #6. Revenue up 213% over 6 weeks, driven
                by three strategic price changes informed by Insydz competitor
                alerts. Total tool cost: ₹2,499/month.
              </div>
            </div>

            <h2
              id="faq"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div
                  key={i}
                  className="faq-item"
                  style={{
                    background: resolvedTheme === "dark" ? "#111827" : "#fff",
                    borderColor:
                      resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
                  }}
                >
                  <div
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                      background:
                        openFaq === i
                          ? resolvedTheme === "dark"
                            ? "#1e293b"
                            : "#F8FAFC"
                          : "transparent",
                    }}
                  >
                    {f.q}
                    <span className={`faq-icon${openFaq === i ? " open" : ""}`}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </div>
                  {openFaq === i && (
                    <div
                      className="faq-a"
                      style={{
                        color: resolvedTheme === "dark" ? "#9ca3af" : "#64748B",
                      }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related Reading on Insydz */}
            <div
              style={{
                marginTop: 48,
                background:
                  resolvedTheme === "dark"
                    ? "rgba(124,58,237,0.06)"
                    : "#F5F3FF",
                borderLeft: "4px solid #7C3AED",
                borderRadius: 16,
                padding: "28px 32px",
              }}
            >
              <p
                style={{
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
                }}
              >
                <span>📌</span> Related Reading on Insydz
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 14,
                }}
              >
                {[
                  {
                    label:
                      "How to Launch a Private Label Product on Amazon India in 2026",
                    route:
                      "/resources/expert-blog/amazon-private-label-india-2026",
                  },
                  {
                    label:
                      "Amazon Vine Program India 2026: Cost, Worth & How to Enrol",
                    route:
                      "/resources/expert-blog/amazon-vine-program-india-2026",
                  },
                  {
                    label:
                      "AI Review Intelligence Tool for Amazon & Flipkart: Complete Guide",
                    route:
                      "/resources/expert-blog/amazon-review-analysis-guide-india",
                  },
                  {
                    label: "Big Billion Days Prep Checklist for D2C Brands",
                    route:
                      "/resources/expert-blog/amazon-vs-flipkart-india-seller",
                  },
                  {
                    label:
                      "Insydz vs Helium 10: Which is Better for Indian Sellers?",
                    route: "/resources/expert-blog/insydz-vs-helium-10-india",
                  },
                ].map((link, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", alignItems: "baseline", gap: 10 }}
                  >
                    <span
                      style={{
                        color: "#7C3AED",
                        fontSize: 8,
                        flexShrink: 0,
                        position: "relative" as const,
                        top: "-1px",
                      }}
                    >
                      ●
                    </span>
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
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#5B21B6";
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "#7C3AED";
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Marketplace Playbooks */}
            <div style={{ marginTop: 48 }}>
              <h3
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(20px, 3vw, 26px)",
                  fontWeight: 900,
                  color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                  marginBottom: 32,
                  letterSpacing: "-0.5px",
                }}
              >
                More Marketplace Playbooks
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 24,
                }}
              >
                {[
                  {
                    tag: "REVIEW STRATEGY",
                    tagColor: "#059669",
                    title: "Amazon Vine India 2026: Cost, Worth & How to Enrol",
                    route:
                      "/resources/expert-blog/amazon-vine-program-india-2026",
                    image: "/Amazon-Vine-India-image1.png",
                  },
                  {
                    tag: "SEO STRATEGY",
                    tagColor: "#3B82F6",
                    title:
                      "Amazon India Keyword Ranking: How to Track and Improve in 2026",
                    route:
                      "/resources/expert-blog/how-to-rank-page-1-amazon-india",
                    image: "/twenty three.png",
                  },
                  {
                    tag: "REVIEW INTELLIGENCE",
                    tagColor: "#DC2626",
                    title:
                      "AI Review Analysis Tool for Amazon India & Flipkart: Complete Guide",
                    route:
                      "/resources/expert-blog/amazon-review-analysis-guide-india",
                    image: "/01_hero_review_intelligence_banner.png",
                  },
                ].map((card, i) => (
                  <Link
                    key={i}
                    href={card.route}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      style={{
                        background:
                          resolvedTheme === "dark" ? "#111827" : "white",
                        borderRadius: 20,
                        overflow: "hidden",
                        border:
                          resolvedTheme === "dark"
                            ? "1px solid #1f2937"
                            : "1px solid #F1F5F9",
                        boxShadow:
                          resolvedTheme === "dark"
                            ? "none"
                            : "0 4px 16px rgba(0,0,0,0.04)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 32px rgba(0,0,0,0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          resolvedTheme === "dark"
                            ? "none"
                            : "0 4px 16px rgba(0,0,0,0.04)";
                      }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          background:
                            resolvedTheme === "dark" ? "#1e293b" : "#f8fafc",
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                      <div style={{ padding: "20px 22px 24px" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: card.tagColor,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            fontFamily: "'Sora', sans-serif",
                            marginBottom: 8,
                            display: "block",
                          }}
                        >
                          {card.tag}
                        </span>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 800,
                            lineHeight: 1.4,
                            color:
                              resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
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
      <div
        style={{
          background:
            "linear-gradient(135deg, #7C3AED 0%, #6D28D9 40%, #5B21B6 100%)",
          padding: "clamp(48px,8vw,80px) 20px clamp(40px,6vw,64px)",
          textAlign: "center",
          margin: "60px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "10%",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(26px, 4.5vw, 42px)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              marginBottom: 20,
            }}
          >
            Stop Guessing. Start Tracking Your Flipkart Rankings.
          </h2>

          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(14px, 2vw, 17px)",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.65,
              maxWidth: 620,
              margin: "0 auto 32px",
            }}
          >
            India&apos;s only analytics tool built for both Amazon India and
            Flipkart. Track rank daily, monitor competitor prices, and act
            before the algorithm moves against you.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 14,
              marginBottom: 40,
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-block",
                background: "white",
                color: "#7C3AED",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(14px, 1.5vw, 15px)",
                padding: "14px 32px",
                borderRadius: 100,
                textDecoration: "none",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0,0,0,0.25)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
              }}
            >
              Track Rankings Free →
            </Link>
            <Link
              href="/pricing"
              style={{
                display: "inline-block",
                background: "transparent",
                color: "white",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(14px, 1.5vw, 15px)",
                padding: "14px 32px",
                borderRadius: 100,
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.4)",
                transition:
                  "transform 0.2s, border-color 0.2s, background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              See Full Pricing
            </Link>
          </div>

          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            {[
              { value: "5,000+", label: "Indian sellers" },
              { value: "Free", label: "To start · No card" },
              { value: "Daily", label: "Rank updates" },
              { value: "2", label: "Platforms tracked" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "20px 12px",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "clamp(20px, 3vw, 26px)",
                    fontWeight: 900,
                    color: "white",
                    lineHeight: 1.2,
                    marginBottom: 4,
                    fontStyle: "italic",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.3,
                  }}
                >
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

// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   Search,
//   Clock,
//   TrendingUp,
//   Target,
//   DollarSign,
//   BarChart3,
//   MessageCircle,
//   Package,
//   Trophy,
//   Zap,
//   BookOpen,
//   Video,
//   FileText,
//   Menu,
//   X,
//   Sun,
//   Moon,
//   ChevronDown,
//   ShoppingBag,
//   Store,
//   Briefcase,
//   Users,
//   Bell,
//   Code,
//   Globe,
//   ArrowLeft,
//   Facebook,
//   Twitter,
//   Linkedin,
//   Instagram,
//   Flame,
//   Presentation,
//   LayoutGrid,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import BlogImageSection from "../components/BlogImageSection";

// export const dynamic = "force-static";

// // ─── Schema ──────────────────────────────────────────────────────────────────
// const schemaData = {
//   "@context": "https://schema.org",
//   "@graph": [
//     {
//       "@type": "Organization",
//       "@id": "https://insydz.com/#organization",
//       name: "Insydz",
//       url: "https://insydz.com",
//       logo: { "@type": "ImageObject", url: "https://insydz.com/logo.png" },
//       sameAs: [
//         "https://www.instagram.com/growwithinsydz",
//         "https://www.linkedin.com/company/insydz/",
//         "https://www.facebook.com/profile.php?id=61586202582209",
//         "https://x.com/growwithinsydz",
//       ],
//     },
//     {
//       "@type": "Article",
//       "@id": "https://insydz.com/best-flipkart-analytics-tool#article",
//       headline:
//         "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)",
//       datePublished: "2026-01-15",
//       dateModified: "2026-03-01",
//       author: { "@type": "Organization", name: "Vikrant Singh" },
//       publisher: { "@id": "https://insydz.com/#organization" },
//       keywords:
//         "best Flipkart analytics tool, Flipkart seller software comparison, Flipkart tracking tools India, marketplace intelligence, competitor insights, pricing automation, seller dashboard",
//     },
//     {
//       "@type": "FAQPage",
//       "@id": "https://insydz.com/best-flipkart-analytics-tool#faq",
//       mainEntity: [
//         {
//           "@type": "Question",
//           name: "What is the best Flipkart analytics tool for India?",
//           acceptedAnswer: {
//             "@type": "Answer",
//             text: "The best Flipkart analytics tool for Indian sellers is one built natively for Flipkart marketplace data — not adapted from an Amazon-focused global tool.",
//           },
//         },
//         {
//           "@type": "Question",
//           name: "How is Flipkart analytics different from Amazon.in analytics?",
//           acceptedAnswer: {
//             "@type": "Answer",
//             text: "Flipkart has a distinct search algorithm, unique buyer intent patterns and pricing dynamics that differ from Amazon.in.",
//           },
//         },
//       ],
//     },
//   ],
// };

// // ─── Navigation ───────────────────────────────────────────────────────────────
// type MenuItemWithBadge = {
//   name: string;
//   icon: JSX.Element;
//   badge?: string;
//   route?: string;
// };
// type NavigationMenu = {
//   Solutions: MenuItemWithBadge[];
//   "Use Cases": MenuItemWithBadge[];
//   Features: MenuItemWithBadge[];
//   "Free Tools": MenuItemWithBadge[];
//   Resources: MenuItemWithBadge[];
//   Integrations: MenuItemWithBadge[];
//   Compare: MenuItemWithBadge[];
//   About: MenuItemWithBadge[];
// };

// const navigationMenu: NavigationMenu = {
//   Solutions: [
//     {
//       name: "All Solutions (Overview)",
//       icon: <ShoppingBag className="w-4 h-4" />,
//       route: "/solutions",
//     },
//     {
//       name: "For Amazon Sellers (India)",
//       icon: <ShoppingBag className="w-4 h-4" />,
//       route: "/solutions/amazon-sellers",
//     },
//     {
//       name: "For Flipkart Sellers",
//       icon: <Store className="w-4 h-4" />,
//       route: "/solutions/flipkart-sellers",
//     },
//     {
//       name: "For E-commerce Agencies",
//       icon: <Briefcase className="w-4 h-4" />,
//       route: "/solutions/ecommerce-agencies",
//     },
//     {
//       name: "For Brand Managers",
//       icon: <Users className="w-4 h-4" />,
//       route: "/solutions/brand-managers",
//     },
//   ],
//   "Use Cases": [
//     {
//       name: "All Use Cases",
//       icon: <TrendingUp className="w-4 h-4" />,
//       route: "/use-cases",
//     },
//     {
//       name: "Track Competitor Prices",
//       icon: <TrendingUp className="w-4 h-4" />,
//       route: "/use-cases/track-competitor-prices",
//     },
//     {
//       name: "Find Profitable Products",
//       icon: <Target className="w-4 h-4" />,
//       route: "/use-cases/find-profitable-products",
//     },
//     {
//       name: "Analyze Customer Reviews",
//       icon: <MessageCircle className="w-4 h-4" />,
//       route: "/use-cases/analyze-customer-reviews",
//     },
//     {
//       name: "Improve Amazon & Flipkart SEO",
//       icon: <Search className="w-4 h-4" />,
//       route: "/use-cases/improve-seo",
//     },
//     {
//       name: "Avoid Stockouts & Missed Sales",
//       icon: <Package className="w-4 h-4" />,
//       route: "/use-cases/avoid-stockouts",
//     },
//   ],
//   Features: [
//     {
//       name: "All Features",
//       icon: <LayoutGrid className="w-4 h-4" />,
//       route: "/features",
//     },
//     {
//       name: "Competitor Price Tracking",
//       icon: <DollarSign className="w-4 h-4" />,
//       route: "/features/competitor-price-tracking-feature",
//     },
//     {
//       name: "Review Analytics",
//       icon: <MessageCircle className="w-4 h-4" />,
//       route: "/features/review-analytics-feature",
//     },
//     {
//       name: "Price Optimization",
//       icon: <TrendingUp className="w-4 h-4" />,
//       route: "/features/price-optimization-feature",
//     },
//     {
//       name: "Keyword & Rank Tracking",
//       icon: <Search className="w-4 h-4" />,
//       route: "/features/keyword-rank-tracking-feature",
//     },
//     {
//       name: "Product Research",
//       icon: <Package className="w-4 h-4" />,
//       route: "/features/product-research-feature",
//     },
//     {
//       name: "AI Recommendations",
//       icon: <Zap className="w-4 h-4" />,
//       route: "/features/ai-recommendations-feature",
//     },
//     {
//       name: "WhatsApp Alerts",
//       icon: <Bell className="w-4 h-4" />,
//       badge: "NEW",
//       route: "/features/whatsapp-alerts-feature",
//     },
//     {
//       name: "Festive Trend Intelligence",
//       icon: <Flame className="w-4 h-4" />,
//       badge: "UPCOMING",
//       route: "/features/festive-trend-feature",
//     },
//   ],
//   "Free Tools": [
//     {
//       name: "Free Amazon Product Analyzer",
//       icon: <BarChart3 className="w-4 h-4" />,
//       route: "/free-tools/free-amazon-product-analyzer",
//     },
//     {
//       name: "Free Review Sentiment Checker",
//       icon: <MessageCircle className="w-4 h-4" />,
//       route: "/free-tools/free-review-sentiment-checker",
//     },
//     {
//       name: "Free Competitor Price Checker",
//       icon: <DollarSign className="w-4 h-4" />,
//       route: "/free-tools/free-competitor-price-checker",
//     },
//     {
//       name: "Free Keyword Rank Checker",
//       icon: <Search className="w-4 h-4" />,
//       badge: "NEW",
//       route: "/free-tools/free-keyword-rank-checker",
//     },
//   ],
//   Resources: [
//     {
//       name: "Expert Blog",
//       icon: <BookOpen className="w-4 h-4" />,
//       route: "/resources/expert-blog",
//     },
//   ],
//   Integrations: [
//     { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
//     { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
//     { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
//     { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
//   ],
//   Compare: [
//     {
//       name: "Insydz vs Helium 10",
//       icon: <Trophy className="w-4 h-4" />,
//       route: "/compare/insydzvshelium",
//     },
//     {
//       name: "Insydz vs Jungle Scout",
//       icon: <Trophy className="w-4 h-4" />,
//       route: "/compare/insydzvsjunglescout",
//     },
//     {
//       name: "Insydz vs Viral Launch",
//       icon: <Trophy className="w-4 h-4" />,
//       route: "/compare/insydzvsvirallaunch",
//     },
//   ],
//   About: [
//     {
//       name: "Our Vision",
//       icon: <Presentation className="w-4 h-4" />,
//       route: "/about/our-vision",
//     },
//     {
//       name: "Careers",
//       icon: <Globe className="w-4 h-4" />,
//       route: "/about/careers",
//     },
//     {
//       name: "Contact Us",
//       icon: <Users className="w-4 h-4" />,
//       route: "/about/contact-us",
//     },
//   ],
// };

// // ─── TOC ─────────────────────────────────────────────────────────────────────
// const TOC = [
//   { id: "what-is", label: "What is a Flipkart Analytics Tool?" },
//   { id: "why-critical", label: "Why Flipkart Analytics is Critical" },
//   { id: "how-it-works", label: "How Marketplace Intelligence Works" },
//   { id: "types", label: "7 Flipkart Data Types to Track" },
//   { id: "mistakes", label: "5 Mistakes Indian Sellers Make" },
//   { id: "comparison", label: "Methods Compared" },
//   { id: "weekly-model", label: "Weekly Execution Model" },
//   { id: "best-tools", label: "Best Tools for India 2026" },
//   { id: "faq", label: "Frequently Asked Questions" },
// ];

// // ─── FAQs ─────────────────────────────────────────────────────────────────────
// const FAQS = [
//   {
//     q: "What is the best Flipkart analytics tool for India?",
//     a: "The best Flipkart analytics tool for Indian sellers is one built natively for Flipkart marketplace data not adapted from an Amazon-focused global tool. Insydz is the only platform that provides simultaneous keyword rank tracking across Flipkart and Amazon.in, with WhatsApp alert delivery and AI-powered competitor insights covering the full Indian e-commerce landscape.",
//   },
//   {
//     q: "How is Flipkart analytics different from Amazon.in analytics?",
//     a: "Flipkart has a distinct search algorithm, unique buyer intent patterns especially around price brackets and SmartBuy and pricing dynamics that differ from Amazon.in. Tools built for Amazon.com or even Amazon.in often have zero Flipkart keyword coverage. Flipkart-specific analytics accounts for its own search volume data, category ranking logic, and SmartBuy badge behaviour.",
//   },
//   {
//     q: "What is keyword gap analysis for Flipkart sellers?",
//     a: "Keyword gap analysis identifies the high-volume Flipkart search terms your top competitors rank for and your listing doesn't. This gap represents lost organic traffic and lost revenue. Closing the gap is the fastest route to organic rank improvement on Flipkart.",
//   },
//   {
//     q: "Can I track competitor keywords on Flipkart?",
//     a: "Yes with India-first tools like Insydz. Global tools like Helium 10 and Jungle Scout have no Flipkart competitor keyword tracking. India-first platforms crawl your top 5–10 competitors' listings on Flipkart and surface which high-volume terms they rank for that you don't.",
//   },
//   {
//     q: "How much do Flipkart analytics tools cost in India?",
//     a: "Flipkart analytics tools range from free (basic, limited Flipkart data) to ₹4,000–8,000/month for global SaaS tools with no real Flipkart coverage, to ₹1,999–2,999/month for India-first AI platforms like Insydz that cover both Amazon.in and Flipkart natively with WhatsApp alerts included.",
//   },
//   {
//     q: "How often should I review my Flipkart analytics data?",
//     a: "Best-performing Indian Flipkart sellers run a three-tier rhythm: daily automated WhatsApp digests (zero minutes of your time), a weekly 30-minute review of keyword gaps and competitor movements, and a monthly 45-minute strategic audit before festive seasons.",
//   },
//   {
//     q: "Does pricing automation work on Flipkart?",
//     a: "Yes. Flipkart's SmartBuy badge and Featured Seller status are heavily influenced by competitive pricing. Pricing automation tools that monitor competitor prices on Flipkart in real time and trigger repricing rules can significantly improve SmartBuy badge win rate and overall category visibility.",
//   },
// ];

// // ─── Image component ──────────────────────────────────────────────────────────
// // ─── Inline link helper ──────────────────────────────────────────────────────
// const InLink = ({
//   to,
//   children,
// }: {
//   to: string;
//   children: React.ReactNode;
// }) => {
//   const router = useRouter();
//   return (
//     <a
//       href={to}
//       onClick={(e) => {
//         e.preventDefault();
//         router.push(to);
//         window.scrollTo(0, 0);
//       }}
//       style={{
//         color: "#ea580c",
//         textDecoration: "underline",
//         textDecorationColor: "#fed7aa",
//         textUnderlineOffset: "3px",
//         fontWeight: 600,
//         cursor: "pointer",
//         transition: "color 0.15s",
//       }}
//       onMouseEnter={(e) => (e.currentTarget.style.color = "#c2410c")}
//       onMouseLeave={(e) => (e.currentTarget.style.color = "#ea580c")}
//     >
//       {children}
//     </a>
//   );
// };

// function ArticleImg({
//   src,
//   alt,
//   caption,
// }: {
//   src: string;
//   alt: string;
//   caption: string;
// }) {
//   const [loaded, setLoaded] = useState(false);
//   return (
//     <div style={{ margin: "24px 0 0" }}>
//       <div
//         style={{
//           position: "relative",
//           borderRadius: 12,
//           overflow: "hidden",
//           background: "#f1f5f9",
//           minHeight: 200,
//         }}
//       >
//         {!loaded && (
//           <div
//             style={{
//               position: "absolute",
//               inset: 0,
//               background:
//                 "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
//               backgroundSize: "200% 100%",
//               animation: "imgShimmer 1.5s infinite",
//             }}
//           />
//         )}
//         <img
//           src={src}
//           alt={alt}
//           onLoad={() => setLoaded(true)}
//           style={{
//             width: "100%",
//             display: "block",
//             opacity: loaded ? 1 : 0,
//             transition: "opacity .3s",
//           }}
//         />
//       </div>
//       <p className="art-img-cap">{caption}</p>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function BestFlipkartAnalyticsTool() {
//   const router = useRouter();
//   const [activeSection, setActiveSection] = useState<string>("what-is");
//   const [scrollPct, setScrollPct] = useState<number>(0);
//   const [tocOpen, setTocOpen] = useState<boolean>(false);
//   const [openFaq, setOpenFaq] = useState<number | null>(0);
//   const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
//   const [scrolled, setScrolled] = useState<boolean>(false);
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", isDarkMode);
//   }, [isDarkMode]);

//   useEffect(() => {
//     const id = "insydz-fkat-schema";
//     if (!document.getElementById(id)) {
//       const s = document.createElement("script");
//       s.id = id;
//       s.type = "application/ld+json";
//       s.textContent = JSON.stringify(schemaData);
//       document.head.appendChild(s);
//     }
//     document.title =
//       "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)";
//     return () => {
//       document.getElementById(id)?.remove();
//     };
//   }, []);

//   useEffect(() => {
//     const fn = () => {
//       setScrolled(window.scrollY > 20);
//       const total = document.documentElement.scrollHeight - window.innerHeight;
//       setScrollPct(Math.min((window.scrollY / total) * 100, 100));
//       for (let i = TOC.length - 1; i >= 0; i--) {
//         const el = document.getElementById(TOC[i].id);
//         if (el && window.scrollY >= el.offsetTop - 130) {
//           setActiveSection(TOC[i].id);
//           break;
//         }
//       }
//     };
//     window.addEventListener("scroll", fn, { passive: true });
//     return () => window.removeEventListener("scroll", fn);
//   }, []);

//   useEffect(() => {
//     const fn = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node)
//       )
//         setActiveDropdown(null);
//     };
//     document.addEventListener("mousedown", fn);
//     return () => document.removeEventListener("mousedown", fn);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) setIsMenuOpen(false);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const go = (id: string) => {
//     document
//       .getElementById(id)
//       ?.scrollIntoView({ behavior: "smooth", block: "start" });
//     setTocOpen(false);
//   };
//   const handleMenuItemClick = (item: MenuItemWithBadge) => {
//     if (item.route) {
//       router.push(item.route);
//       setActiveDropdown(null);
//       setIsMenuOpen(false);
//     }
//   };
//   const toggleMobileMenu = (name: string) =>
//     setMobileActiveMenu((p) => (p === name ? null : name));

//   const DesktopDropdown = ({
//     label,
//     menuKey,
//     accent = "purple",
//   }: {
//     label: string;
//     menuKey: keyof NavigationMenu;
//     accent?: "purple" | "orange";
//   }) => {
//     const items = navigationMenu[menuKey];
//     const isActive = activeDropdown === label;
//     const ac = accent === "orange";
//     return (
//       <div className="relative">
//         <button
//           onMouseEnter={() => setActiveDropdown(label)}
//           className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
//         >
//           {label}
//           <ChevronDown
//             className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`}
//           />
//         </button>
//         {isActive && (
//           <div
//             onMouseLeave={() => setActiveDropdown(null)}
//             className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
//           >
//             {items.map((item, i) => (
//               <button
//                 key={i}
//                 onClick={() => handleMenuItemClick(item)}
//                 className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
//               >
//                 <span
//                   className={`flex-shrink-0 ${ac ? "text-orange-600" : "text-purple-600 dark:text-purple-400"}`}
//                 >
//                   {item.icon}
//                 </span>
//                 <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
//                   {item.name}
//                 </span>
//                 {item.badge && (
//                   <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
//                     {item.badge}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const keywordRows = [
//     {
//       type: "Buy Intent Terms",
//       example: '"buy mixer grinder online"',
//       vol: "Medium",
//       cvr: "High (14–20%)",
//       tag: "Critical",
//       tagClass: "tag-critical",
//     },
//     {
//       type: "Price Bracket Terms",
//       example: '"laptop under 40000 rupees"',
//       vol: "Medium–High",
//       cvr: "High (11–17%)",
//       tag: "Critical",
//       tagClass: "tag-critical",
//     },
//     {
//       type: "Category Head Terms",
//       example: '"wireless earphones"',
//       vol: "Very High",
//       cvr: "Medium (3–6%)",
//       tag: "Important",
//       tagClass: "tag-important",
//     },
//     {
//       type: "Long-Tail Specific",
//       example: '"tws earbuds noise cancel gym use"',
//       vol: "Low",
//       cvr: "Very High (22–30%)",
//       tag: "Critical",
//       tagClass: "tag-critical",
//     },
//     {
//       type: "Competitor Brand Terms",
//       example: '"boAt airdopes alternative under 2000"',
//       vol: "Medium",
//       cvr: "Medium (7–13%)",
//       tag: "Important",
//       tagClass: "tag-important",
//     },
//     {
//       type: "Regional Language",
//       example: '"earphones sasta wala" / Hindi variants',
//       vol: "Growing",
//       cvr: "Very High (16–24%)",
//       tag: "Opportunity",
//       tagClass: "tag-opportunity",
//     },
//     {
//       type: "Festive & Seasonal",
//       example: '"Big Billion Days deals electronics"',
//       vol: "High (seasonal)",
//       cvr: "Very High (event)",
//       tag: "Critical",
//       tagClass: "tag-critical",
//     },
//   ];

//   const toolRows = [
//     {
//       tool: "Helium 10",
//       fk: false,
//       az: "Partial",
//       wa: false,
//       intent: "US Only",
//       price: "₹4,000–8,000",
//       hl: false,
//     },
//     {
//       tool: "Jungle Scout",
//       fk: false,
//       az: "Partial",
//       wa: false,
//       intent: "US Only",
//       price: "₹4,500–7,000",
//       hl: false,
//     },
//     {
//       tool: "Sonar (Free)",
//       fk: false,
//       az: "Yes",
//       wa: false,
//       intent: "Basic",
//       price: "Free",
//       hl: false,
//     },
//     {
//       tool: "Insydz+",
//       fk: true,
//       az: "Yes",
//       wa: true,
//       intent: "AI-Powered",
//       price: "₹1,999–2,999",
//       hl: true,
//     },
//   ];

//   const capRows = [
//     {
//       cap: "Flipkart Keyword Data",
//       manual: "Manual only",
//       global: "Not supported",
//       insydz: "Native Flipkart",
//     },
//     {
//       cap: "Flipkart Rank Tracking",
//       manual: "Manual only",
//       global: "Not supported",
//       insydz: "Full coverage",
//     },
//     {
//       cap: "Competitor Keyword Gap Analysis",
//       manual: "3–5 days/FSN",
//       global: "Amazon.com focused",
//       insydz: "Automated, <1 hour",
//     },
//     {
//       cap: "Buy Intent & Price Bracket Terms",
//       manual: "No systematic detection",
//       global: "US intent data",
//       insydz: "India-calibrated AI",
//     },
//     {
//       cap: "Regional Language Keywords",
//       manual: "No",
//       global: "English only",
//       insydz: "Hindi + Hinglish",
//     },
//     {
//       cap: "Pricing Automation (SmartBuy)",
//       manual: "Manual guesswork",
//       global: "Not available",
//       insydz: "Real-time rules",
//     },
//     {
//       cap: "WhatsApp Rank Drop Alerts",
//       manual: "Not available",
//       global: "Email only",
//       insydz: "Within 60 min",
//     },
//     {
//       cap: "Festive Keyword Intelligence",
//       manual: "Not available",
//       global: "Not available",
//       insydz: "BBD, GIF, Diwali",
//     },
//     {
//       cap: "Cost",
//       manual: "4–5 hrs/day",
//       global: "₹4,000–8,000/mo",
//       insydz: "Free–₹2,999/mo",
//     },
//   ];

//   const features = [
//     {
//       title: "Full Flipkart Keyword Database",
//       body: "Rank positions tracked natively on Flipkart not estimated from Amazon.in data. Flipkart keyword coverage is unique to India-first tools and is the foundational capability everything else is built on.",
//     },
//     {
//       title: "Hindi and Hinglish Keyword Detection",
//       body: "Regional search terms, transliterated Hindi queries, and Hinglish product descriptors are surfaced and scored by conversion intent not filtered out as noise the way global tools treat them.",
//     },
//     {
//       title: "Price-Bracket Keyword Intelligence",
//       body: "'Under 999', 'below 5000', 'best budget' modifiers are detected and scored for India-specific purchase intent on Flipkart the highest-conversion keyword category most sellers miss entirely.",
//     },
//     {
//       title: "WhatsApp Rank Drop Alerts in 60 Min",
//       body: "Any rank drop of 3+ positions on a tracked Flipkart buy-intent keyword triggers a WhatsApp alert — with the affected FSN, the term, and a recommended listing fix.",
//     },
//     {
//       title: "AI Listing Optimisation",
//       body: "For each keyword gap identified on Flipkart, the platform generates the exact text to add to your listing title, bullets, and description no guesswork, no duplication.",
//     },
//     {
//       title: "Festive Keyword Intelligence",
//       body: "Pre-festive keyword audits surface seasonal search terms specific to Big Billion Days, Great Indian Festival, and Diwali 3 weeks before the revenue window opens.",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
//         *, *::before, *::after { box-sizing: border-box; }
//         html { scroll-behavior: smooth; }
//         body { overflow-x: hidden; }
//         @keyframes imgShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

//         /* ── Read progress ── */
//         .read-progress { position:fixed; top:64px; left:0; height:3px; background:linear-gradient(90deg,#7C3AED,#C026D3); z-index:200; transition:width .1s linear; border-radius:0 2px 2px 0; pointer-events:none; }
//         @media(min-width:640px){.read-progress{top:72px}}
//         @media(min-width:1024px){.read-progress{top:80px}}

//         .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
//         @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
//         @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
//         @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

//         .toc-sidebar{display:none}
//         @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
//         @media(min-width:1024px){ .toc-sidebar { top:80px; padding:22px; } }
//         .dark .toc-sidebar { background:#111827; border-color:#1f2937; }

//         /* ── Mobile TOC toggle ── */
//         .mobile-toc-btn { display:flex; width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; color:#111; cursor:pointer; align-items:center; justify-content:space-between; margin-bottom:14px; }
//         .dark .mobile-toc-btn { background:#111827; border-color:#1f2937; color:#f9fafb; }
//         @media(min-width:768px){ .mobile-toc-btn { display:none; } }
//         .mobile-toc-panel { display:none; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin-bottom:20px; }
//         .dark .mobile-toc-panel { background:#111827; border-color:#1f2937; }
//         .mobile-toc-panel.open { display:block; }

//         /* ── Article body typography ── */
//         .article-body { font-family:'Lora',serif; font-size:15px; line-height:1.78; color:#1E293B; }
//         @media(min-width:640px){ .article-body { font-size:15.5px; } }
//         @media(min-width:1024px){ .article-body { font-size:16px; } }
//         .dark .article-body { color:#d1d5db; }

//         .article-body h2 { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; color:#0D1B2A; margin:40px 0 12px; padding-bottom:10px; border-bottom:2px solid #e5e7eb; letter-spacing:-.3px; line-height:1.3; scroll-margin-top:72px; }
//         @media(min-width:640px){ .article-body h2 { font-size:20px; margin:48px 0 14px; scroll-margin-top:80px; } }
//         @media(min-width:1024px){ .article-body h2 { font-size:22px; margin:52px 0 14px; scroll-margin-top:84px; } }
//         .dark .article-body h2 { color:#f9fafb; border-color:#1f2937; }
//         .article-body h2:first-child { margin-top:0; }

//         .article-body h3 { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:#0D1B2A; margin:24px 0 8px; letter-spacing:-.2px; scroll-margin-top:72px; }
//         @media(min-width:640px){ .article-body h3 { font-size:16px; margin:28px 0 10px; } }
//         @media(min-width:1024px){ .article-body h3 { font-size:17px; margin:32px 0 10px; scroll-margin-top:84px; } }
//         .dark .article-body h3 { color:#f3f4f6; }

//         .article-body p { margin-bottom:14px; font-size:14.5px; line-height:1.78; }
//         @media(min-width:640px){ .article-body p { font-size:15px; margin-bottom:16px; } }
//         .article-body strong { font-weight:700; color:#0D1B2A; }
//         .dark .article-body strong { color:#f9fafb; }
//         .article-body a { color:#7C3AED; font-weight:500; text-decoration:underline; }

//         .art-img-cap { font-size:11px; color:#94A3B8; font-style:italic; text-align:center; margin-bottom:24px; padding:6px 10px; }
//         @media(min-width:640px){ .art-img-cap { font-size:12px; margin-bottom:28px; padding:8px 12px; } }

//         /* ── Callout boxes ── */
//         .box { border-radius:10px; padding:16px 18px; margin:18px 0; }
//         @media(min-width:640px){ .box { padding:20px 22px; margin:24px 0; } }
//         .box-label { font-size:10px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .box-label { font-size:11px; } }
//         .box p { margin:0; font-size:13.5px; line-height:1.72; font-family:'Lora',serif; }
//         @media(min-width:640px){ .box p { font-size:14.5px; } }
//         .box-purple   { background:#F5F3FF; border-left:4px solid #7C3AED; }
//         .box-purple   .box-label { color:#7C3AED; }
//         .box-purple   p { color:#4C1D95; }
//         .box-amber    { background:#FFFBEB; border-left:4px solid #D97706; }
//         .box-amber    .box-label { color:#D97706; }
//         .box-amber    p { color:#78350F; }
//         .box-green    { background:#F0FDF4; border-left:4px solid #16A34A; }
//         .box-green    .box-label { color:#16A34A; }
//         .box-green    p { color:#064E3B; }
//         .box-red      { background:#FEF2F2; border-left:4px solid #EF4444; }
//         .box-red      .box-label { color:#991B1B; }
//         .box-red      p { color:#7F1D1D; }
//         .box-indigo   { background:#EEF2FF; border:1px solid #C7D2FE; border-radius:10px; }
//         .box-indigo   .box-label { color:#4F46E5; }
//         .dark .box-purple  { background:#2e1065; border-color:#7c3aed; }
//         .dark .box-amber   { background:#1c1507; border-color:#78350f; }
//         .dark .box-green   { background:#052e16; border-color:#166534; }
//         .dark .box-red     { background:#450a0a; border-color:#991b1b; }
//         .dark .box-indigo  { background:#1e1b4b; border-color:#3730a3; }

//         /* ── Internal link box ── */
//         .int-link { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:8px; padding:12px 16px; margin:18px 0; display:flex; gap:10px; align-items:flex-start; }
//         .int-link p { font-size:13px; color:#4C1D95; margin:0; line-height:1.55; font-family:'Sora',sans-serif; }
//         .int-link a { color:#7C3AED; font-weight:600; text-decoration:underline; }
//         @media(min-width:640px){ .int-link { padding:14px 18px; } .int-link p { font-size:14px; } }

//         /* ── Steps ── */
//         .steps { display:flex; flex-direction:column; gap:10px; margin:16px 0 22px; }
//         @media(min-width:640px){ .steps { gap:12px; margin:20px 0 28px; } }
//         .step { display:flex; gap:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px 16px; }
//         @media(min-width:640px){ .step { gap:16px; padding:18px 20px; } }
//         .dark .step { background:#111827; border-color:#1f2937; }
//         .step-n { flex-shrink:0; width:30px; height:30px; background:#7C3AED; color:white; border-radius:50%; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .step-n { width:34px; height:34px; font-size:15px; } }
//         .step-body strong { display:block; font-size:13px; color:#0D1B2A; margin-bottom:3px; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .step-body strong { font-size:14.5px; } }
//         .dark .step-body strong { color:#f9fafb; }
//         .step-body p { margin:0; font-size:12.5px; color:#64748B; line-height:1.6; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .step-body p { font-size:13.5px; } }

//         /* ── Tables ── */
//         .tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.09); margin:18px 0 24px; }
//         @media(min-width:640px){ .tbl-wrap { margin:24px 0 32px; } }
//         table.dt { width:100%; border-collapse:collapse; font-size:11.5px; font-family:'Sora',sans-serif; min-width:480px; }
//         @media(min-width:640px){ table.dt { font-size:13px; min-width:560px; } }
//         table.dt thead tr { background:#0D1B2A; }
//         table.dt th { padding:10px 12px; color:white; font-weight:700; text-align:left; font-size:10.5px; letter-spacing:.2px; white-space:nowrap; }
//         @media(min-width:640px){ table.dt th { padding:13px 16px; font-size:12px; } }
//         table.dt tbody tr { border-bottom:1px solid #E2E8F0; transition:background .15s; }
//         table.dt tbody tr:nth-child(even) td { background:#F8FAFC; }
//         table.dt tbody tr:hover td { background:#F5F3FF; }
//         table.dt td { padding:10px 12px; vertical-align:middle; color:#1E293B; font-size:11.5px; }
//         @media(min-width:640px){ table.dt td { padding:12px 16px; font-size:13px; } }
//         .dark table.dt td { color:#d1d5db; }
//         .dark table.dt tbody tr { border-color:#1f2937; }
//         .dark table.dt tbody tr:nth-child(even) td { background:#0f172a; }
//         table.dt tr.hl td { background:#F5F3FF!important; border-left:3px solid #7C3AED; }
//         table.dt tr.hl td:first-child { font-weight:700; color:#7C3AED; }
//         .badge-tag { display:inline-block; padding:2px 9px; border-radius:20px; font-size:.72rem; font-weight:600; white-space:nowrap; font-family:'Sora',sans-serif; }
//         .tag-yes         { background:#D1FAE5; color:#065F46; }
//         .tag-no          { background:#FEE2E2; color:#991B1B; }
//         .tag-partial     { background:#FEF3C7; color:#92400E; }
//         .tag-recommended { background:#EDE9FE; color:#5B21B6; }
//         .tag-critical    { background:#FEE2E2; color:#991B1B; border:1px solid #FECACA; }
//         .tag-important   { background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; }
//         .tag-opportunity { background:#D1FAE5; color:#065F46; border:1px solid #A7F3D0; }
//         .insydz-col { color:#7C3AED; font-weight:700; }

//         /* ── Stat strip ── */
//         .stat-strip { display:flex; flex-wrap:wrap; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.07); }
//         .dark .stat-strip { border-color:#1f2937; background:#111827; }
//         .stat-item { flex:1; min-width:50%; padding:14px 16px; border-right:1px solid #E2E8F0; text-align:center; border-bottom:1px solid #E2E8F0; }
//         @media(min-width:640px){ .stat-item { min-width:140px; padding:18px 24px; border-bottom:none; } }
//         .dark .stat-item { border-color:#1f2937; }
//         .stat-item:last-child { border-right:none; }
//         @media(max-width:639px){ .stat-item:nth-child(2){border-right:none} .stat-item:nth-child(3){border-right:1px solid #E2E8F0} .stat-item:nth-child(4){border-right:none;border-bottom:none} .stat-item:nth-child(3){border-bottom:none} }

//         /* ── Hero banner ── */
//         .hero-banner { background:linear-gradient(135deg,#0F0F1A 0%,#1E1040 60%,#2D1B69 100%); border-radius:12px; padding:32px; margin:0 0 8px; display:grid; grid-template-columns:1fr; gap:24px; align-items:center; position:relative; overflow:hidden; }
//         @media(min-width:768px){ .hero-banner { grid-template-columns:1fr 260px; gap:32px; padding:40px; } }
//         @media(min-width:1024px){ .hero-banner { padding:48px; gap:40px; } }
//         .hero-banner::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 70% 50%,rgba(124,58,237,.18) 0%,transparent 60%); }
//         .hb-left { position:relative; z-index:1; }
//         .platform-pills { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
//         .pill { padding:3px 10px; border-radius:20px; font-size:.68rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; font-family:'Sora',sans-serif; }
//         .pill-fk { background:#FFF8F0; color:#F97316; }
//         .pill-az { background:#FFF3E0; color:#E67E00; }
//         .pill-me { background:#F3E8FF; color:#7C3AED; }
//         .hb-left h2 { font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:800; color:white; line-height:1.2; margin-bottom:10px; }
//         @media(min-width:640px){ .hb-left h2 { font-size:1.8rem; } }
//         @media(min-width:1024px){ .hb-left h2 { font-size:2rem; } }
//         .hb-left h2 .accent { color:#F97316; }
//         .hb-left p { color:rgba(255,255,255,.65); font-size:.9rem; line-height:1.65; }
//         .hb-right { position:relative; z-index:1; display:flex; flex-direction:column; gap:12px; }
//         @media(max-width:767px){ .hb-right { display:none; } }
//         .metric-card { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:14px 16px; backdrop-filter:blur(8px); }
//         .metric-card .mc-label { font-size:.66rem; color:rgba(255,255,255,.5); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin-bottom:4px; font-family:'Sora',sans-serif; }
//         .metric-card .mc-value { font-family:'Sora',sans-serif; font-size:1.5rem; font-weight:800; color:white; }
//         .metric-card .mc-sub { font-size:.76rem; color:rgba(255,255,255,.6); margin-top:2px; }
//         .alert-pill { background:rgba(16,185,129,.15); border:1px solid rgba(16,185,129,.3); border-radius:8px; padding:10px 14px; font-size:.76rem; color:#6EE7B7; font-family:'Sora',sans-serif; }

//         /* ── Dashboard mockup ── */
//         .dash-mock { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; margin:20px 0; }
//         .dark .dash-mock { background:#111827; border-color:#1f2937; }
//         .dash-header { background:#0F0F1A; color:white; padding:12px 16px; font-family:'Sora',sans-serif; font-weight:700; font-size:.875rem; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
//         .dash-badge-live { background:#10B981; color:white; font-size:.68rem; padding:2px 8px; border-radius:10px; font-family:'Sora',sans-serif; }
//         .dash-badge-plat { background:rgba(255,255,255,.1); color:rgba(255,255,255,.7); font-size:.68rem; padding:2px 8px; border-radius:10px; font-family:'Sora',sans-serif; }
//         .dash-body { padding:16px; }
//         .dash-metrics { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:14px; }
//         @media(min-width:640px){ .dash-metrics { grid-template-columns:repeat(4,1fr); } }
//         .dash-m { background:white; border:1px solid #E2E8F0; border-radius:8px; padding:12px; text-align:center; }
//         .dark .dash-m { background:#0f172a; border-color:#1f2937; }
//         .dash-m .dm-label { font-size:.65rem; color:#94A3B8; margin-bottom:4px; font-family:'Sora',sans-serif; }
//         .dash-m .dm-val { font-family:'Sora',sans-serif; font-size:1.4rem; font-weight:800; color:#0D1B2A; }
//         .dark .dash-m .dm-val { color:#f9fafb; }
//         .dash-m .dm-sub { font-size:.7rem; margin-top:2px; font-family:'Sora',sans-serif; }
//         .dash-alert { background:#FEF3C7; border:1px solid #F59E0B; border-radius:8px; padding:10px 14px; font-size:.82rem; color:#78350F; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; font-family:'Sora',sans-serif; }
//         .dash-fix-btn { background:#7C3AED; color:white; border:none; padding:5px 12px; border-radius:6px; font-size:.76rem; font-weight:700; cursor:pointer; flex-shrink:0; font-family:'Sora',sans-serif; }

//         /* ── Key Takeaways ── */
//         .takeaway-box { background:#0D1B2A; border-radius:10px; padding:22px 20px; margin:22px 0; }
//         @media(min-width:640px){ .takeaway-box { padding:28px 30px; margin:28px 0; } }
//         .takeaway-box h3 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:white; margin:0 0 14px; }
//         @media(min-width:640px){ .takeaway-box h3 { font-size:18px; margin:0 0 16px; } }
//         .takeaway-item { display:flex; align-items:flex-start; gap:8px; margin-bottom:9px; }
//         .takeaway-dot { flex-shrink:0; width:16px; height:16px; border-radius:50%; background:#7C3AED; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:white; margin-top:3px; }
//         .takeaway-text { font-family:'Lora',serif; font-size:13px; color:#CBD5E1; line-height:1.6; }
//         @media(min-width:640px){ .takeaway-text { font-size:14.5px; } }

//         /* ── Mistakes ── */
//         .mistakes { display:flex; flex-direction:column; gap:8px; margin:16px 0 22px; }
//         .mistake { border:1px solid #E2E8F0; border-radius:10px; display:flex; overflow:hidden; }
//         .dark .mistake { border-color:#1f2937; }
//         .mistake-n { flex-shrink:0; width:38px; background:#0D1B2A; color:white; font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .mistake-n { width:46px; font-size:17px; } }
//         .mistake-body { padding:12px 14px; }
//         @media(min-width:640px){ .mistake-body { padding:16px 18px; } }
//         .mistake-body strong { display:block; font-size:13px; color:#0D1B2A; margin-bottom:3px; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .mistake-body strong { font-size:14.5px; } }
//         .dark .mistake-body strong { color:#f9fafb; }
//         .mistake-body p { margin:0; font-size:12px; color:#64748B; line-height:1.65; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .mistake-body p { font-size:13.5px; } }

//         /* ── Exec blocks ── */
//         .exec-block { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:16px; margin-bottom:12px; }
//         @media(min-width:640px){ .exec-block { padding:22px 24px; } }
//         .dark .exec-block { background:#111827; border-color:#1f2937; }
//         .exec-block h4 { font-family:'Sora',sans-serif; font-weight:700; font-size:.92rem; margin-bottom:10px; display:flex; align-items:center; gap:8px; color:#0D1B2A; }
//         .dark .exec-block h4 { color:#f9fafb; }
//         .exec-badge { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:800; color:white; flex-shrink:0; }
//         .exec-d { background:#7C3AED; }
//         .exec-w { background:#F97316; }
//         .exec-m { background:#10B981; }
//         .exec-item { font-size:12px; color:#64748B; padding:3px 0; display:flex; align-items:baseline; gap:7px; font-family:'Sora',sans-serif; line-height:1.6; }
//         @media(min-width:640px){ .exec-item { font-size:13.5px; } }
//         .exec-item::before { content:'✓'; color:#7C3AED; font-weight:700; flex-shrink:0; }

//         /* ── Metrics grid ── */
//         .metrics { display:grid; grid-template-columns:1fr; gap:10px; margin:16px 0 22px; }
//         @media(min-width:480px){ .metrics { grid-template-columns:1fr 1fr; gap:12px; } }
//         .metric { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px; display:flex; gap:10px; align-items:flex-start; }
//         @media(min-width:640px){ .metric { padding:18px; gap:14px; } }
//         .dark .metric { background:#111827; border-color:#1f2937; }
//         .metric-icon { flex-shrink:0; width:32px; height:32px; border-radius:8px; background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:16px; }
//         .metric-t { font-size:12.5px; font-weight:700; color:#0D1B2A; margin-bottom:3px; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .metric-t { font-size:13.5px; } }
//         .dark .metric-t { color:#f9fafb; }
//         .metric-d { font-size:11.5px; color:#64748B; line-height:1.5; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .metric-d { font-size:12.5px; } }

//         /* ── Feature highlights ── */
//         .feat-highlight { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px; margin-bottom:10px; display:flex; gap:12px; align-items:flex-start; }
//         @media(min-width:640px){ .feat-highlight { padding:18px 20px; gap:14px; } }
//         .dark .feat-highlight { background:#111827; border-color:#1f2937; }
//         .feat-icon { font-size:1.3rem; flex-shrink:0; margin-top:2px; }
//         .feat-highlight h4 { font-family:'Sora',sans-serif; font-weight:700; font-size:.875rem; color:#0D1B2A; margin-bottom:3px; }
//         .dark .feat-highlight h4 { color:#f9fafb; }
//         .feat-highlight p { font-size:.84rem; color:#64748B; margin:0; line-height:1.6; font-family:'Sora',sans-serif; }

//         /* ── Mid CTA ── */
//         .mid-cta { background:linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%); border-radius:10px; padding:20px 22px; margin:32px 0; display:flex; flex-direction:column; gap:16px; }
//         @media(min-width:640px){ .mid-cta { padding:24px 28px; flex-direction:row; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; } }
//         .mid-cta h3 { font-size:16px; font-weight:800; color:white; margin-bottom:5px; letter-spacing:-.2px; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .mid-cta h3 { font-size:18px; } }
//         .mid-cta p { color:#94A3B8; font-size:12.5px; margin:0; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .mid-cta p { font-size:13.5px; } }

//         /* ── FAQ ── */
//         .faq-item { border:1px solid #E2E8F0; border-radius:10px; margin-bottom:8px; overflow:hidden; background:#fff; transition:border-color .2s; }
//         .dark .faq-item { background:#111827; border-color:#1f2937; }
//         .faq-item.open { border-color:#7C3AED; }
//         .faq-q { padding:14px 16px; font-size:13px; font-weight:700; color:#0D1B2A; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; user-select:none; font-family:'Sora',sans-serif; }
//         @media(min-width:640px){ .faq-q { padding:16px 20px; font-size:14.5px; gap:12px; } }
//         .dark .faq-q { color:#f9fafb; }
//         .faq-q:hover { background:#F8FAFC; }
//         .dark .faq-q:hover { background:#1f2937; }
//         .faq-icon { flex-shrink:0; width:20px; height:20px; border-radius:50%; background:#EDE9FE; color:#7C3AED; display:flex; align-items:center; justify-content:center; font-size:14px; transition:transform .2s; }
//         .faq-icon.open { transform:rotate(45deg); background:#7C3AED; color:white; }
//         .faq-a { padding:0 16px 14px; font-size:13px; color:#64748B; line-height:1.75; font-family:'Lora',serif; }
//         @media(min-width:640px){ .faq-a { padding:0 20px 16px; font-size:14px; } }
//         .dark .faq-a { color:#9ca3af; }

//         /* ── TOC links ── */
//         .toc-link { display:block; font-size:11.5px; font-weight:500; color:#64748B; padding:5px 8px; border-radius:6px; cursor:pointer; border:none; background:none; text-align:left; width:100%; transition:all .15s; margin-bottom:2px; line-height:1.4; border-left:2px solid transparent; }
//         @media(min-width:1024px){ .toc-link { font-size:12.5px; padding:6px 10px; } }
//         .toc-link:hover, .toc-link.active { color:#7C3AED; background:#F5F3FF; border-left-color:#7C3AED; }
//         .dark .toc-link { color:#9ca3af; }
//         .dark .toc-link:hover, .dark .toc-link.active { background:#2e1065; color:#a78bfa; }

//         // /* ── Related grid ── */
//         // .related-grid { display:grid; grid-template-columns:1fr; gap:12px; }
//         // @media(min-width:480px){ .related-grid { grid-template-columns:1fr 1fr; gap:14px; } }
//         // @media(min-width:768px){ .related-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
//         // .rel-card { border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; cursor:pointer; transition:box-shadow .2s,transform .2s; background:#fff; }
//         // .dark .rel-card { background:#111827; border-color:#1f2937; }
//         // .rel-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); transform:translateY(-2px); }
//         // .rel-thumb { width:100%; aspect-ratio:2.4/1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
//         // .rel-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
//         // .rel-body { padding:12px; }
//         // .rel-tag { font-size:10px; font-weight:700; color:#7C3AED; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; font-family:'Sora',sans-serif; }
//         // .rel-title { font-size:12px; font-weight:700; color:#0D1B2A; line-height:1.4; font-family:'Sora',sans-serif; }
//         // @media(min-width:640px){ .rel-title { font-size:13px; } }
//         // .dark .rel-title { color:#f9fafb; }

//         /* ── Related grid ── */
//         .related-grid { display:grid; grid-template-columns:1fr; gap:12px; }
//         @media(min-width:480px){ .related-grid { grid-template-columns:1fr 1fr; gap:14px; } }
//         @media(min-width:768px){ .related-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
//         .rel-card { border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; cursor:pointer; transition:box-shadow .2s,transform .2s; background:#fff; text-decoration:none !important; color:inherit; display:block; }
//         .dark .rel-card { background:#111827; border-color:#1f2937; }
//         .rel-card:hover,
//         .rel-card:focus,
//         .rel-card:visited { text-decoration:none !important; color:inherit; }
//         .rel-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.09); transform:translateY(-2px); }
//         .rel-thumb { width:100%; aspect-ratio:2.4/1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
//         .rel-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
//         .rel-body { padding:12px; }
//         .rel-tag { font-size:10px; font-weight:700; color:#7C3AED; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; font-family:'Sora',sans-serif; }
//         .rel-title { font-size:12px; font-weight:700; color:#0D1B2A; line-height:1.4; font-family:'Sora',sans-serif; text-decoration:none; }
//         @media(min-width:640px){ .rel-title { font-size:13px; } }
//         .dark .rel-title { color:#f9fafb; }

//         /* ── Final CTA ── */
//         .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

//         /* ── Breadcrumb ── */
//         .breadcrumb { background:#F8FAFC; border-bottom:1px solid #E2E8F0; padding:8px 0; }
//         .dark .breadcrumb { background:#0f172a; border-color:#1f2937; }
//         .breadcrumb-inner { max-width:1240px; margin:0 auto; padding:0 16px; display:flex; align-items:center; gap:4px; font-size:11.5px; color:#94A3B8; flex-wrap:wrap; }
//         @media(min-width:640px){ .breadcrumb-inner { padding:0 20px; gap:6px; font-size:12.5px; } }

//         /* ── Article hero ── */
//         .article-hero { max-width:1240px; margin:0 auto; padding:28px 16px 0; }
//         @media(min-width:640px){ .article-hero { padding:36px 20px 0; } }
//         @media(min-width:1024px){ .article-hero { padding:48px 24px 0; } }

//         /* ── Sidebar CTA ── */
//         .sidebar-cta-title { font-family:'Sora',sans-serif; font-size:14px; font-weight:800; color:white; margin-bottom:8px; line-height:1.35; }
//         @media(min-width:1024px){ .sidebar-cta-title { font-size:16px; } }
//         .sidebar-cta-body { font-size:11.5px; color:#94A3B8; margin-bottom:14px; line-height:1.6; font-family:'Sora',sans-serif; }

//         body { overflow-x:hidden; }
//       `}</style>

//       <div className="read-progress" style={{ width: `${scrollPct}%` }} />

//       {/* ── BREADCRUMB ─────────────────────────────────────────────────────────── */}
//       <div className="breadcrumb" style={{ marginTop: 80 }}>
//         <div className="breadcrumb-inner">
//           <button
//             onClick={() => router.push("/")}
//             style={{
//               color: "#64748B",
//               fontWeight: 500,
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               fontSize: "inherit",
//             }}
//           >
//             Home
//           </button>
//           <span>›</span>
//           <button
//             onClick={() => router.push("/resources/expert-blog")}
//             style={{
//               color: "#64748B",
//               fontWeight: 500,
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               fontSize: "inherit",
//             }}
//           >
//             Blog
//           </button>
//           <span>›</span>
//           <span style={{ color: "#94A3B8" }}>
//             Best Flipkart Analytics Tools India (2026)
//           </span>
//         </div>
//       </div>

//       {/* ── ARTICLE HERO ───────────────────────────────────────────────────────── */}
//       <div className="article-hero">
//         <div
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 6,
//             background: "#EDE9FE",
//             color: "#7C3AED",
//             fontSize: "clamp(10px,2vw,11.5px)",
//             fontWeight: 700,
//             letterSpacing: 0.6,
//             textTransform: "uppercase",
//             padding: "4px 12px",
//             borderRadius: 20,
//             marginBottom: 14,
//             fontFamily: "'Sora',sans-serif",
//           }}
//         >
//           <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
//           Flipkart Seller Tools &amp; Strategy
//         </div>
//         <h1
//           style={{
//             fontFamily: "'Sora',sans-serif",
//             fontSize: "clamp(22px,4vw,40px)",
//             fontWeight: 800,
//             lineHeight: 1.18,
//             color: "#0D1B2A",
//             letterSpacing: "-.5px",
//             marginBottom: 14,
//             maxWidth: 820,
//           }}
//           className="dark:text-white"
//         >
//           Best <span style={{ color: "#7C3AED" }}>Flipkart Analytics Tool</span>{" "}
//           India: Complete Guide for Sellers (2026)
//         </h1>
//         <p
//           style={{
//             fontFamily: "'Lora',serif",
//             fontSize: "clamp(14px,2.5vw,17px)",
//             color: "#475569",
//             lineHeight: 1.75,
//             maxWidth: 700,
//             marginBottom: 20,
//           }}
//           className="dark:text-gray-400"
//         >
//           Stop flying blind on Flipkart. The right analytics tool surfaces which
//           competitor keywords are stealing your rank, which SKUs are losing the
//           Buy Box, and exactly what to fix before the next Big Billion Days
//           window closes on you.
//         </p>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: "4px 14px",
//             marginBottom: 20,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 5,
//               fontSize: "clamp(11px,2vw,13px)",
//               color: "#64748B",
//             }}
//           >
//             <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//             <strong
//               className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer"
//               onClick={() => router.push("/author/vikrant-singh")}
//             >
//               Vikrant Singh
//             </strong>
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 5,
//               fontSize: "clamp(11px,2vw,13px)",
//               color: "#64748B",
//             }}
//           >
//             <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//             March 2026
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 5,
//               fontSize: "clamp(11px,2vw,13px)",
//               color: "#64748B",
//             }}
//           >
//             <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//             <strong>14 min read</strong>
//           </div>
//         </div>

//         {/* Stat strip */}
//         <div className="stat-strip" style={{ marginBottom: 24 }}>
//           {[
//             [
//               "71%",
//               "Flipkart Purchases Start From a Search Not a Homepage Browse",
//             ],
//             [
//               "₹42K/mo",
//               "Avg. Monthly Revenue Lost to Poor Marketplace Visibility",
//             ],
//             [
//               "4–6×",
//               "Traffic Increase With Proper Competitor Keyword Tracking",
//             ],
//             [
//               "Top 3",
//               "Search Positions Capture 58% of All Flipkart Category Clicks",
//             ],
//           ].map(([num, lbl]) => (
//             <div className="stat-item" key={num}>
//               <span
//                 style={{
//                   display: "block",
//                   fontSize: "clamp(20px,4vw,26px)",
//                   fontWeight: 800,
//                   color: "#7C3AED",
//                   fontFamily: "'Sora',sans-serif",
//                   lineHeight: 1,
//                 }}
//               >
//                 {num}
//               </span>
//               <span
//                 style={{
//                   display: "block",
//                   fontSize: "clamp(10px,2vw,11.5px)",
//                   color: "#64748B",
//                   marginTop: 4,
//                   lineHeight: 1.4,
//                   fontWeight: 500,
//                 }}
//               >
//                 {lbl}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── KEY TAKEAWAYS ─────────────────────────────────────────────────────── */}
//       <div
//         style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px 28px" }}
//         className="sm:px-5 lg:px-6"
//       >
//         <BlogImageSection
//           imageSrc="/Best-Flipkart-Analytics-Tool.png"
//           altText="Flipkart Analytics Dashboard with Competitor Tracking and Price Intelligence"
//           caption="Insydz Flipkart intelligence surfaces competitor keyword gaps, rank
//           positions, and pricing automation opportunities across Flipkart and
//           Amazon.in simultaneously."
//         />

//         <div className="takeaway-box">
//           <h3>Key Takeaways</h3>
//           {[
//             "Most Flipkart sellers optimise with Amazon-centric tools tools that have zero Flipkart keyword volume data, no SmartBuy badge logic, and no Flipkart-specific competitor tracking.",
//             "Competitor keyword gap analysis reveals which high-volume, buy-intent terms your top 3 Flipkart rivals rank for and you don't. This gap is where your revenue is being lost silently.",
//             "Pricing automation on Flipkart is not optional for high-competition categories. The SmartBuy badge goes to the most competitive price not the best-reviewed product.",
//             "Flipkart's search algorithm weighs listing quality differently from Amazon title keyword density, bullet structure, and image count all influence rank in ways global tools don't model.",
//             "India-first platforms like Insydz track rank shifts on Flipkart and Amazon.in simultaneously with WhatsApp alerts, not weekly email digests that arrive after the damage is done.",
//             "Combining Flipkart analytics with cross-platform pricing intelligence gives Indian sellers a complete, AI-powered view of marketplace performance.",
//           ].map((t, i) => (
//             <div className="takeaway-item" key={i}>
//               <div className="takeaway-dot">✓</div>
//               <div className="takeaway-text">{t}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── ARTICLE LAYOUT ────────────────────────────────────────────────────── */}
//       <div className="article-layout">
//         {/* SIDEBAR */}
//         <aside className="toc-sidebar">
//           <h4
//             style={{
//               fontFamily: "'Sora',sans-serif",
//               fontSize: 10,
//               fontWeight: 700,
//               textTransform: "uppercase",
//               letterSpacing: 1,
//               color: "#94A3B8",
//               marginBottom: 12,
//             }}
//           >
//             Table of Contents
//           </h4>
//           <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
//             {TOC.map((t) => (
//               <li key={t.id}>
//                 <button
//                   className={`toc-link${activeSection === t.id ? " active" : ""}`}
//                   onClick={() => go(t.id)}
//                 >
//                   {t.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </aside>

//         {/* MAIN */}
//         <main style={{ minWidth: 0 }}>
//           {/* Mobile TOC */}
//           <button
//             className="mobile-toc-btn"
//             onClick={() => setTocOpen(!tocOpen)}
//           >
//             Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
//           </button>
//           <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
//             {TOC.map((t) => (
//               <button
//                 key={t.id}
//                 className="toc-link"
//                 style={{ display: "block", marginBottom: 3 }}
//                 onClick={() => go(t.id)}
//               >
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           <article className="article-body">
//             {/* S1: What is */}
//             <h2 id="what-is">What is a Flipkart Analytics Tool?</h2>
//             <p>
//               A{" "}
//               <InLink to="/solutions/flipkart-sellers">
//                 best Flipkart analytics tool
//               </InLink>{" "}
//               is software that tracks exactly what Indian buyers search for on
//               Flipkart before they purchase and reveals which of those terms
//               your competitors rank for that your listing doesn't. This is
//               called <strong>marketplace intelligence</strong>, and it's the
//               fastest route to organic rank improvement available to any
//               Flipkart seller.
//             </p>
//             <p>
//               Unlike generic seller dashboards built for Amazon.com or Shopify,
//               Flipkart-native analytics accounts for India-specific search
//               intent: regional language queries, price-bracket buying patterns,
//               Flipkart's SmartBuy badge algorithm, and cross-platform rank
//               correlation between Flipkart and Amazon.in.
//             </p>
//             <p>
//               Here's the reality:{" "}
//               <strong>
//                 Indian sellers on Flipkart collectively leave an estimated
//                 ₹600–900 crore in annual organic revenue on the table
//               </strong>{" "}
//               simply because their listings are not optimised for the search
//               terms Indian buyers actually use on Flipkart.
//             </p>

//             <div className="box box-purple">
//               <div className="box-label">In Simple Terms</div>
//               <p>
//                 Instead of guessing which keywords to put in your product title
//                 and Flipkart listing fields, a Flipkart analytics tool tells you
//                 precisely which terms drive actual sales on Flipkart right now
//                 including the hidden buy-intent terms your top competitors are
//                 ranking for and you've never even thought of.
//               </p>
//             </div>

//             <div className="int-link">
//               <p>
//                 <strong>Part of the Flipkart Seller Guide Series:</strong> Read
//                 our complete Flipkart Seller Strategy pillar to understand how
//                 analytics fits into your full growth stack from listing
//                 optimisation to festive season planning.
//               </p>
//             </div>

//             {/* S2: Why Critical */}
//             <h2 id="why-critical">
//               Why Flipkart Analytics is Critical for Indian Sellers
//             </h2>
//             <h3>Flipkart's Search Behaviour is Distinctly Indian</h3>
//             <p>
//               Flipkart's buyer base searches differently from Amazon.in and
//               drastically differently from Amazon.com. Buyers search in Hindi
//               transliterations, use hyper-specific price brackets ("mixer
//               grinder under 3000"), and respond to regional colloquialisms that
//               have zero equivalent in Helium 10's global keyword database.
//               Keeping up with Flipkart marketplace analytics and seller
//               performance insights is essential for long-term growth.
//             </p>

//             <h3>The Ranking Gap is Silent and Compounding</h3>
//             <p>
//               Most Flipkart sellers do analytics once at launch and never
//               revisit it. Meanwhile, their competitors are continuously adding
//               new terms, capturing new search traffic, and rising in rank. By
//               the time the revenue impact becomes visible in your seller
//               dashboard, you've already lost 4–8 months of compounding organic
//               traffic.
//             </p>

//             <div className="box box-amber">
//               <div className="box-label">Real Seller Example</div>
//               <p>
//                 A Jaipur-based kitchenware seller was doing ₹3.4 lakh/month on
//                 Flipkart. A competitor entered the same category and captured
//                 the "non-stick tawa for induction" keyword cluster 22 related
//                 search terms with a fully optimised listing. The seller's
//                 revenue dropped to ₹1.6 lakh within 6 weeks. The competitor
//                 wasn't cheaper or better reviewed they were simply found first
//                 on 22 searches the original seller had never even tracked.
//               </p>
//             </div>

//             <h3>The Festive Season Window is Worth Months of Revenue</h3>
//             <p>
//               During Big Billion Days, Republic Day Sale, and Diwali,{" "}
//               <strong>
//                 35–55% of annual Flipkart e-commerce revenue concentrates into
//                 just 3–6 days.
//               </strong>{" "}
//               Sellers who rank for festive search terms on Day 1 win
//               disproportionately. Mastering{" "}
//               <InLink to="/">pricing automation on Flipkart</InLink> ensures you
//               remain competitive during these high-volume windows.
//             </p>

//             <div className="box box-green">
//               <div className="box-label">AI Overview Summary</div>
//               <p>
//                 Flipkart analytics tools help Indian sellers identify which
//                 search terms drive buyer traffic on Flipkart, reveal competitor
//                 keyword gaps, enable pricing automation for SmartBuy badge wins,
//                 and alert sellers to rank drops especially critical for sellers
//                 managing 10–150 SKUs without a dedicated marketplace analyst.
//               </p>
//             </div>

//             {/* S3: How it works */}
//             <h2 id="how-it-works">
//               How Does Flipkart Marketplace Intelligence Work?
//             </h2>
//             <p>
//               Modern flipkart tracking tools India have replaced the manual
//               spreadsheet workflow with a 5-step automated intelligence loop:
//             </p>

//             {/* Dashboard mockup */}
//             <div className="dash-mock">
//               <div className="dash-header">
//                 Insydz Flipkart Intelligence Dashboard
//                 <span className="dash-badge-live">Live</span>
//                 <span className="dash-badge-plat">Flipkart</span>
//                 <span className="dash-badge-plat">Amazon.in</span>
//               </div>
//               <div className="dash-body">
//                 <div className="dash-metrics">
//                   {[
//                     {
//                       label: "KEYWORDS TRACKED",
//                       val: "187",
//                       sub: "+23 this month",
//                       subColor: "#10B981",
//                     },
//                     {
//                       label: "AVG. RANK POSITION",
//                       val: "P8.2",
//                       sub: "+2 from last quarter",
//                       subColor: "#10B981",
//                     },
//                     {
//                       label: "KEYWORD GAP SCORE",
//                       val: "114",
//                       sub: "Competitors rank, you don't",
//                       subColor: "#EF4444",
//                     },
//                     {
//                       label: "BUY INTENT TERMS",
//                       val: "41",
//                       sub: "High-priority fixes",
//                       subColor: "#F97316",
//                     },
//                   ].map((m, i) => (
//                     <div className="dash-m" key={i}>
//                       <div className="dm-label">{m.label}</div>
//                       <div className="dm-val">{m.val}</div>
//                       <div className="dm-sub" style={{ color: m.subColor }}>
//                         {m.sub}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="dash-alert">
//                   <span>
//                     <strong>Keyword Alert:</strong> Competitor ranking #1 for
//                     "air fryer 4 litre under 4000" you're at position #17.
//                     Recommend: Add to title + listing. Est. traffic gain: +280
//                     clicks/month
//                   </span>
//                   {/* <button className="dash-fix-btn">Fix Now</button> */}
//                 </div>
//               </div>
//             </div>

//             <div className="steps">
//               {[
//                 {
//                   n: 1,
//                   t: "Connect Your Flipkart Seller Account",
//                   d: "Link your Flipkart Seller Hub account and add the FSN IDs you want to track. The tool begins pulling your current keyword rank positions immediately no manual setup or CSV uploads required.",
//                 },
//                 {
//                   n: 2,
//                   t: "Competitor Keyword Crawling",
//                   d: "The tool identifies your top 5–10 Flipkart competitors by category and crawls every keyword they rank for including long-tail, buy-intent, price-bracket, and regional Hindi variants.",
//                 },
//                 {
//                   n: 3,
//                   t: "Search Volume & Intent Scoring",
//                   d: "Each keyword is scored by Flipkart monthly search volume, competition density, and buyer intent signal separating high-value 'buy now' terms from low-value browsing terms.",
//                 },
//                 {
//                   n: 4,
//                   t: "Pricing Automation & SmartBuy Alert",
//                   d: "You receive a WhatsApp alert the moment a competitor undercuts you on a tracked SKU, or when a rival captures the SmartBuy badge with a recommended repricing rule to reclaim it.",
//                 },
//                 {
//                   n: 5,
//                   t: "AI Listing Optimisation Recommendation",
//                   d: "The platform delivers a concrete fix: 'Add air fryer 4 litre induction compatible to your Flipkart title. Estimated rank improvement: P17 → P4. Monthly traffic gain: +280 clicks.' Not data decisions.",
//                 },
//               ].map((s) => (
//                 <div className="step" key={s.n}>
//                   <div className="step-n">{s.n}</div>
//                   <div className="step-body">
//                     <strong>{s.t}</strong>
//                     <p>{s.d}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="box box-purple">
//               <div className="box-label">Key Insight</div>
//               <p>
//                 Flipkart analytics without ranking context is useless. Knowing a
//                 term has 18,000 monthly Flipkart searches means nothing if
//                 you're already ranking P2 for it. The gap terms your competitors
//                 rank for and you don't is where your Flipkart growth actually
//                 lives.
//               </p>
//             </div>

//             {/* S4: Types */}
//             <h2 id="types">Types of Flipkart Data Indian Sellers Must Track</h2>
//             <p>
//               Buy Intent Terms and Price Bracket Keywords deliver the highest
//               conversion rates on Flipkart yet are the most commonly missed by
//               Indian sellers using global tools.
//             </p>

//             <div className="tbl-wrap">
//               <table className="dt">
//                 <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
//                   <tr>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Data Type
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Example (India)
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Search Vol.
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Conversion Rate
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Priority
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {keywordRows.map((r, i) => (
//                     <tr key={i}>
//                       <td>
//                         <strong>{r.type}</strong>
//                       </td>
//                       <td style={{ fontStyle: "italic", color: "#6B7280" }}>
//                         {r.example}
//                       </td>
//                       <td>{r.vol}</td>
//                       <td>
//                         <strong>{r.cvr}</strong>
//                       </td>
//                       <td>
//                         <span className={`badge-tag ${r.tagClass}`}>
//                           {r.tag}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* S5: Mistakes */}
//             <h2 id="mistakes">
//               5 Common Mistakes Indian Sellers Make With Flipkart Analytics
//             </h2>
//             <div className="mistakes">
//               {[
//                 {
//                   n: 1,
//                   t: "Using Amazon.in Keyword Data for Flipkart Listings",
//                   p: "Amazon.in and Flipkart have completely different search indexes. A term with 40,000 monthly searches on Amazon.in may have 4,000 on Flipkart and vice versa.",
//                 },
//                 {
//                   n: 2,
//                   t: "Ignoring Pricing Automation Losing the SmartBuy Badge Silently",
//                   p: "Flipkart's SmartBuy badge is the single highest-converting placement on any product search page. Sellers who lose this badge to a ₹50 price undercut and don't know within the hour are hemorrhaging conversions daily.",
//                 },
//                 {
//                   n: 3,
//                   t: "Doing Analytics Once at Launch Then Never Again",
//                   p: (
//                     <>
//                       Flipkart search trends shift festival to festival. A
//                       keyword strategy built in February is partially obsolete
//                       by Onam season. Sellers who don't continuously update
//                       their keyword sets lose ground silently. Following a
//                       structured guide for{" "}
//                       <InLink to="/resources/expert-blog/flipkart-keyword-research-tool">
//                         Flipkart keyword research for Indian sellers
//                       </InLink>{" "}
//                       can prevent this organic decay.
//                     </>
//                   ),
//                 },
//                 {
//                   n: 4,
//                   t: "Tracking Rankings Only Missing Competitor Keyword Movements",
//                   p: "Knowing you're ranked P8 for a term tells you where you are. Knowing your top competitor just started ranking P1 for a term you haven't added to your listing tells you where you're about to fall behind.",
//                 },
//                 {
//                   n: 5,
//                   t: "Skipping Regional Language Keywords Entirely",
//                   p: "Hindi and Hinglish search queries on Flipkart are growing at over 28% year-on-year. Terms like 'sasta mobile under 8000' have high buy intent and very low competition from English-only optimised sellers.",
//                 },
//               ].map((m) => (
//                 <div className="mistake" key={m.n}>
//                   <div className="mistake-n">{m.n}</div>
//                   <div className="mistake-body">
//                     <strong>{m.t}</strong>
//                     <p>{m.p}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* S6: Comparison */}
//             <h2 id="comparison">Flipkart Analytics Methods Compared</h2>
//             <div className="tbl-wrap">
//               <table className="dt">
//                 <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
//                   <tr>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Method
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Speed
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Flipkart Data
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Actionability
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Cost
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Manual Seller Hub Research</td>
//                     <td style={{ color: "#EF4444", fontWeight: 700 }}>
//                       3–5 days
//                     </td>
//                     <td>Partial</td>
//                     <td>None — guesses</td>
//                     <td>4–5 hrs/day</td>
//                   </tr>
//                   <tr>
//                     <td>Basic Free Tools (Sonar)</td>
//                     <td style={{ color: "#F59E0B", fontWeight: 700 }}>
//                       Same day
//                     </td>
//                     <td>Limited</td>
//                     <td>Low — data only</td>
//                     <td>Free–₹500/mo</td>
//                   </tr>
//                   <tr>
//                     <td>Global SaaS (Helium 10)</td>
//                     <td style={{ color: "#10B981", fontWeight: 700 }}>
//                       1–2 hrs
//                     </td>
//                     <td>
//                       <span className="badge-tag tag-no">No Flipkart</span>
//                     </td>
//                     <td>Medium (Amazon only)</td>
//                     <td>₹4,000–8,000/mo</td>
//                   </tr>
//                   <tr className="hl">
//                     <td>
//                       <strong>
//                         India-First AI Tool (Insydz){" "}
//                         <span className="badge-tag tag-recommended">
//                           Recommended
//                         </span>
//                       </strong>
//                     </td>
//                     <td style={{ color: "#10B981", fontWeight: 700 }}>
//                       &lt; 1 hour
//                     </td>
//                     <td>
//                       <span className="badge-tag tag-yes">
//                         Amazon.in + Flipkart
//                       </span>
//                     </td>
//                     <td style={{ color: "#7C3AED", fontWeight: 700 }}>
//                       High — Actionable AI
//                     </td>
//                     <td>₹1,999–2,999/mo</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             <div className="box box-red">
//               <div className="box-label">Worth Noting</div>
//               <p>
//                 Every week without structured Flipkart analytics is a week of
//                 organic traffic being silently redirected to a competitor who
//                 does it properly. A 3-month delay in adopting an analytics tool
//                 can translate to 8–12 months of catch-up time on rank recovery.
//               </p>
//             </div>

//             {/* S7: Weekly model */}
//             <h2 id="weekly-model">
//               Best Practices: Weekly Execution Model for Flipkart Sellers
//             </h2>
//             <p>
//               The most successful Indian Flipkart sellers don't run analytics in
//               one-time sprints they run a structured weekly rhythm that keeps
//               their listings consistently competitive without manual effort.
//             </p>

//             <div className="steps">
//               {[
//                 {
//                   n: 1,
//                   t: "Daily Automated (0 Minutes of Your Time)",
//                   d: [
//                     "Morning WhatsApp digest: top 5 rank changes across tracked Flipkart FSNs",
//                     "Act on Critical Rank Drop alerts — any position loss of 5+ spots on buy-intent keywords",
//                     "Competitor new keyword entry alert — know when a rival starts ranking for a new term",
//                     "SmartBuy badge status for top 10 SKUs — pricing position and visibility combined",
//                   ],
//                 },
//                 {
//                   n: 2,
//                   t: "Weekly 30-Minute Review Session",
//                   d: [
//                     "Full keyword gap report — identify top 8 gaps between your rank and competitor rank on Flipkart",
//                     "Update listing fields on 2–4 FSNs using AI-generated keyword recommendations",
//                     "Check new buy-intent terms emerging in your Flipkart category this week",
//                     "Review pricing automation rules — adjust floor/ceiling for 1–2 high-competition SKUs",
//                   ],
//                 },
//                 {
//                   n: 3,
//                   t: "Monthly Strategic Audit (45 Minutes)",
//                   d: [
//                     "Keyword coverage audit before festive season — are all seasonal terms in your Flipkart title?",
//                     "New product gap analysis — which keyword clusters have high volume and low competition?",
//                     "Revenue impact review — compare organic traffic before vs after last month's keyword updates",
//                     "Competitor new product keyword sets — what terms are rivals' new Flipkart launches targeting?",
//                   ],
//                 },
//               ].map((s) => (
//                 <div className="step" key={s.n}>
//                   <div className="step-n">{s.n}</div>

//                   <div className="step-body">
//                     <strong>{s.t}</strong>

//                     {/* 👇 THIS is the key */}
//                     <div style={{ marginTop: "8px" }}>
//                       {s.d.map((item, i) => (
//                         <div className="exec-item" key={i}>
//                           {item}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Mid CTA */}
//             <div className="mid-cta">
//               <div>
//                 <h3>
//                   Find Your Flipkart Keyword Gaps in Under 30 Minutes Free
//                 </h3>
//                 <p>
//                   Connect Flipkart Seller Hub &amp; Amazon.in. Get your first
//                   competitor keyword gap report today. WhatsApp rank alerts
//                   included.
//                 </p>
//               </div>
//               <button
//                 onClick={() => router.push("/login")}
//                 style={{
//                   flexShrink: 0,
//                   background: "#7C3AED",
//                   color: "white",
//                   padding: "11px 22px",
//                   borderRadius: 8,
//                   fontWeight: 700,
//                   fontSize: "clamp(13px,2vw,14.5px)",
//                   whiteSpace: "nowrap",
//                   cursor: "pointer",
//                   border: "none",
//                   fontFamily: "'Sora',sans-serif",
//                   width: "100%",
//                 }}
//                 className="sm:w-auto"
//               >
//                 Try Insydz Free →
//               </button>
//             </div>

//             {/* S8: Best Tools */}
//             <h2 id="best-tools">
//               Best Tools for Flipkart Analytics in India (2026)
//             </h2>
//             <h3>Why Global Tools Fall Short for Flipkart Sellers</h3>
//             <p>
//               Global tools like Helium 10 and Jungle Scout are built for
//               Amazon.com. Their keyword databases, search volume data, and
//               intent models are calibrated for US buyers. For a detailed
//               head-to-head, see our Insydz vs Helium 10 Flipkart seller software
//               comparison, which highlights how{" "}
//               <InLink to="/use-cases/track-competitor-prices">
//                 competitor insights and pricing intelligence
//               </InLink>{" "}
//               can transform your strategy.
//             </p>

//             <div className="tbl-wrap">
//               <table className="dt">
//                 <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
//                   <tr>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Tool
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Flipkart Coverage
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Amazon.in
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       WhatsApp Alerts
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Buy Intent Data
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Price (INR/mo)
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {toolRows.map((r, i) => (
//                     <tr key={i} className={r.hl ? "hl" : ""}>
//                       <td>
//                         <strong>{r.tool}</strong>
//                         {r.hl && (
//                           <>
//                             {" "}
//                             <span className="badge-tag tag-recommended">
//                               Recommended
//                             </span>
//                           </>
//                         )}
//                       </td>
//                       <td>
//                         {r.fk ? (
//                           <span className="badge-tag tag-yes">
//                             Full Coverage
//                           </span>
//                         ) : (
//                           <span className="badge-tag tag-no">No</span>
//                         )}
//                       </td>
//                       <td>
//                         {r.az === "Yes" ? (
//                           <span className="badge-tag tag-yes">Yes</span>
//                         ) : (
//                           <span className="badge-tag tag-partial">{r.az}</span>
//                         )}
//                       </td>
//                       <td>
//                         {r.wa ? (
//                           <span className="badge-tag tag-yes">
//                             Within 60 min
//                           </span>
//                         ) : (
//                           <span className="badge-tag tag-no">No</span>
//                         )}
//                       </td>
//                       <td
//                         style={
//                           r.hl ? { color: "#7C3AED", fontWeight: 700 } : {}
//                         }
//                       >
//                         {r.intent}
//                       </td>
//                       <td
//                         style={
//                           r.hl ? { color: "#7C3AED", fontWeight: 700 } : {}
//                         }
//                       >
//                         {r.price}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <h3>Full Capability Comparison</h3>
//             <div className="tbl-wrap">
//               <table className="dt">
//                 <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
//                   <tr>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Capability
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Manual Research
//                     </th>
//                     <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
//                       Global Tools (US-first)
//                     </th>
//                     <th
//                       className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed"
//                       style={{ background: "#7C3AED" }}
//                     >
//                       Insydz India-First
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {capRows.map((r, i) => (
//                     <tr key={i}>
//                       <td>
//                         <strong>{r.cap}</strong>
//                       </td>
//                       <td style={{ color: "#9CA3AF" }}>{r.manual}</td>
//                       <td style={{ color: "#9CA3AF" }}>{r.global}</td>
//                       <td className="insydz-col">{r.insydz}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <h3>What Makes an India-First Flipkart Analytics Tool Different</h3>
//             {features.map((f, i) => (
//               <div className="feat-highlight" key={i}>
//                 <div>
//                   <h4>{f.title}</h4>
//                   <p>{f.body}</p>
//                 </div>
//               </div>
//             ))}

//             <div className="int-link">
//               <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>
//                 🔗
//               </span>
//               <p>
//                 Thinking about Insydz vs Helium 10 for your India business? Read
//                 our detailed Flipkart seller software comparison covering every
//                 feature that matters for Indian marketplace sellers.
//               </p>
//             </div>

//             {/* S9: FAQ */}
//             <h2 id="faq">Frequently Asked Questions</h2>
//             <div style={{ marginTop: 16 }}>
//               {FAQS.map((faq, i) => (
//                 <div
//                   key={i}
//                   className={`faq-item${openFaq === i ? " open" : ""}`}
//                 >
//                   <div
//                     className="faq-q"
//                     onClick={() => setOpenFaq(openFaq === i ? null : i)}
//                   >
//                     <span>{faq.q}</span>
//                     <span className={`faq-icon${openFaq === i ? " open" : ""}`}>
//                       +
//                     </span>
//                   </div>
//                   {openFaq === i && (
//                     <div className="faq-a">
//                       <p>{faq.a}</p>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Related */}
//             <div
//               style={{
//                 marginTop: 48,
//                 paddingTop: 28,
//                 borderTop: "2px solid #E2E8F0",
//               }}
//             >
//               <h2
//                 style={{
//                   fontSize: "clamp(16px,3vw,20px)",
//                   fontWeight: 800,
//                   color: "#0D1B2A",
//                   margin: "0 0 18px",
//                   border: "none",
//                   padding: 0,
//                   fontFamily: "'Sora',sans-serif",
//                 }}
//                 className="dark:text-white"
//               >
//                 Related Guides
//               </h2>
//               <div className="related-grid">
//                 <Link
//                   href="/resources/expert-blog/flipkart-keyword-research-tool"
//                   className="rel-card"
//                   title="Flipkart keyword research for Indian sellers"
//                 >
//                   <div className="rel-thumb">
//                     <img
//                       src="/01_hero_banner.png"
//                       alt="Flipkart Keyword Research Guide"
//                     />
//                   </div>
//                   <div className="rel-body">
//                     <div className="rel-tag">Keyword Research</div>
//                     <div className="rel-title">
//                       Flipkart Keyword Research for Indian Sellers: Complete
//                       2026 Guide
//                     </div>
//                   </div>
//                 </Link>
//                 <Link
//                   href="/resources/expert-blog/insydz-vs-helium-10-india"
//                   className="rel-card"
//                   title="Insydz vs Helium 10 for Indian sellers"
//                 >
//                   <div className="rel-thumb">
//                     <img
//                       src="/thirteen.png"
//                       alt="Insydz vs Helium 10 comparison"
//                     />
//                   </div>
//                   <div className="rel-body">
//                     <div className="rel-tag">Compare</div>
//                     <div className="rel-title">
//                       Insydz vs Helium 10: Which is the Right Tool for Indian
//                       Sellers?
//                     </div>
//                   </div>
//                 </Link>
//                 <Link
//                   href="/resources/expert-blog/amazon-competitor-price-tracking-tool"
//                   className="rel-card"
//                   title="Flipkart pricing automation strategy"
//                 >
//                   <div className="rel-thumb">
//                     <img
//                       src="/one.png"
//                       alt="Flipkart Pricing Automation Strategy"
//                     />
//                   </div>
//                   <div className="rel-body">
//                     <div className="rel-tag">Pricing Strategy</div>
//                     <div className="rel-title">
//                       Flipkart Pricing Automation: How to Win the SmartBuy Badge
//                       in 2026
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           </article>
//         </main>
//       </div>

//       {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
//       <div className="final-cta-block">
//         <h2
//           className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3"
//           style={{ fontFamily: "'Sora',sans-serif" }}
//         >
//           Flipkart's Best Sellers Know Something You Don't — Yet.
//         </h2>
//         <p
//           className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg"
//           style={{
//             fontFamily: "'Lora', serif",
//             maxWidth: 520,
//             margin: "0 auto 24px",
//           }}
//         >
//           Insydz gives you the AI-powered rank tracking, keyword gaps, and
//           WhatsApp alerts built exclusively for Flipkart India.
//         </p>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             flexWrap: "wrap",
//             gap: "6px 20px",
//             marginBottom: 20,
//           }}
//         >
//           {[
//             "Flipkart rank tracking",
//             "WhatsApp gap alerts",
//             "Amazon.in also covered",
//             "Free forever",
//           ].map((t) => (
//             <div
//               key={t}
//               className="text-blue-100"
//               style={{
//                 fontSize: "clamp(11px,2vw,13.5px)",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 6,
//                 fontFamily: "'Sora',sans-serif",
//               }}
//             >
//               <span className="text-white" style={{ fontWeight: 800 }}>
//                 ✓
//               </span>{" "}
//               {t}
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={() => router.push("/login")}
//           className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
//         >
//           <Zap className="w-5 h-5 flex-shrink-0 inline mr-2" />
//           Get My Flipkart Gap Report →
//         </button>
//         <p className="text-blue-200 text-xs mt-4">
//           No setup · Live in minutes · India-only intelligence
//         </p>
//       </div>

//       {/* Footer */}

//       <style>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-in {
//           animation: fade-in 1s ease-out;
//         }
//         .delay-1000 {
//           animation-delay: 1s;
//         }
//       `}</style>
//     </div>
//   );
// }
