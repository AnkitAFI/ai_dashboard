"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import HeroSection from "../components/HeroSection";
import SectionQA from "../components/SectionQA";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import FeatureCTA from "../components/FeatureCTA";
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import RelatedArticles from "../components/RelatedArticles";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaSwitchExcelAiAmazonIndia = {
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
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
      url: "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
      name: "I Ditched Excel for an AI Competitor Tracker on Amazon India. Here Is What Changed in 30 Days",
      description:
        "An Indian Amazon seller shares exactly what changed after ditching Excel for AI competitor tracking. Real results after 30 days.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#breadcrumb",
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
          name: "Switch Excel AI Amazon India",
          item: "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#article",
      headline:
        "I Ditched Excel for an AI Competitor Tracker on Amazon India. Here Is What Changed in 30 Days",
      image: "https://insydz.com/switch-excel-ai-amazon-india_blogbanner.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-06-10",
      dateModified: "2026-06-10",
      keywords: [
        "amazon india competitor tracking",
        "excel vs ai amazon seller",
        "amazon repricing tool india",
        "amazon buy box alerts",
        "amazon seller whatsapp alerts",
      ],
      articleSection: "Competitor Intelligence",
      inLanguage: "en-IN",
      wordCount: 3600,
      timeRequired: "PT10M",
    },
  ],
};

// ── Key takeaways ────────────────────────────────────────────────────────────
const switchExcelAiKeyTakeaways = [
  "Excel is a valid starting point for competitor tracking. It is a ceiling, not a system. It is static, requires manual updates, and cannot alert you when something changes between your update sessions.",
  "The hidden cost of manual tracking is not the 3 hours per week. It is the decisions you make on stale data during the other 165 hours of the week.",
  "WhatsApp alerts are the single feature that changes seller behaviour most immediately. Knowing about a competitor price drop within 15 minutes is operationally different from knowing about it 48 hours later.",
  "The cost comparison is straightforward: 3 hours per week at ₹500 per hour opportunity cost equals ₹6,000 per month in recovered time. Insydz costs ₹2,499 per month.",
  "Setup takes under 30 minutes. The first alert typically arrives within 24 hours of adding your first ASIN.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const switchExcelAiTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "Why Excel Fails" },
  { id: "s3", label: "What Excel Was Missing" },
  { id: "s4", label: "What Made Them Switch" },
  { id: "s5", label: "The First 7 Days" },
  { id: "s6", label: "30-Day Results" },
  { id: "s7", label: "The Cost Comparison" },
  { id: "s8", label: "FAQs" },
];

// ── First 7 days steps ────────────────────────────────────────────────────────
const switchExcelAiFirst7DaysSteps = [
  {
    title: "Day 1: First alert at 11:34 PM",
    description:
      "Competitor dropped ₹60 below the seller's price. WhatsApp alert received, seller held above their ₹540 floor, Buy Box retained. Previously would not have been noticed until Sunday.",
  },
  {
    title: "Day 3: Buy Box recovered in 90 minutes",
    description:
      "A competitor dropped below the seller's price at 7 PM on a Friday. Alert received and seller matched within 90 minutes, retaining the Buy Box for the entire weekend. Previously this would not have been visible until Monday.",
  },
  {
    title: "Day 5: New competitor listing spotted",
    description:
      "A new ASIN appeared in the category with 0 reviews and a ₹499 price. Insydz flagged it as a new competitor entry. The seller updated their listing bullets the same day to highlight their warranty and review count advantage.",
  },
  {
    title: "Day 7: The seller retired the spreadsheet",
    description:
      "After 7 days with 11 alerts received versus 1 they would have caught manually, the seller stopped their Sunday update habit entirely. The spreadsheet still exists. They have not opened it since.",
  },
];

// ── Table 1: What Excel showed vs reality ────────────────────────────────────
const switchExcelAiTable1Columns: TableColumn[] = [
  {
    key: "dataPoint",
    label: "DATA POINT",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "excelShowed",
    label: "WHAT EXCEL SHOWED",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "actuallyHappening",
    label: "WHAT WAS ACTUALLY HAPPENING",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
];

const switchExcelAiTable1Rows: TableRow[] = [
  {
    dataPoint: "Competitor prices",
    excelShowed: "As of Sunday 8 PM only",
    actuallyHappening: "Changing 3 to 7 times per week",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    dataPoint: {
      value: "Weekend price drops",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    excelShowed: "Not visible until Monday",
    actuallyHappening: "Friday and Saturday drops missed entirely",
  },
  {
    dataPoint: "New competitor listings",
    excelShowed: "Never captured",
    actuallyHappening: "Appearing mid week without notice",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    dataPoint: {
      value: "Buy Box status",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    excelShowed: "No visibility at all",
    actuallyHappening: "Lost and recovered without the seller knowing",
  },
  {
    dataPoint: "Review spikes",
    excelShowed: "Counted once per week",
    actuallyHappening: "Competitor Vine campaigns launching mid week",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    dataPoint: {
      value: "Ranking shifts",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    excelShowed: "Not tracked",
    actuallyHappening: "Key search terms moving daily",
  },
];

// ── Table 2: Cost comparison ─────────────────────────────────────────────────
const switchExcelAiTable2Columns: TableColumn[] = [
  {
    key: "costItem",
    label: "COST ITEM",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "excel",
    label: "MANUAL EXCEL TRACKING",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "insydz",
    label: "INSYDZ",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
];

const switchExcelAiTable2Rows: TableRow[] = [
  {
    costItem: "Hours per week on tracking",
    excel: "3 hours manual",
    insydz: "0 hours",
  },
  { costItem: "Monthly tracking hours", excel: "12 hours", insydz: "0 hours" },
  {
    costItem: "Opportunity cost at ₹500/hr",
    excel: "₹6,000/month",
    insydz: "₹0",
  },
  {
    costItem: "Cost of missed Buy Box events (avg 1/month)",
    excel: "₹8,000+",
    insydz: "Near zero (alerts prevent)",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    costItem: {
      value: "Total monthly cost",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    excel: { value: "₹14,000+", className: "font-semibold" },
    insydz: { value: "₹2,499", className: "font-semibold text-[#16A34A]" },
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const switchExcelAiFaqs = [
  {
    q: "Why is Excel not enough for tracking Amazon India competitors in 2026?",
    a: "Excel is static and updated on a schedule, while Amazon India pricing changes in real time. By the time you open your spreadsheet, competitor price changes may already be 12 to 48 hours old. During that window, you could lose the Buy Box or miss a pricing opportunity without knowing.",
  },
  {
    q: "How much time do sellers typically save by switching to an AI tool?",
    a: "Sellers who maintained manual tracking spreadsheets typically save 2 to 4 hours per week after switching. At a conservative ₹500 per hour opportunity cost, that is ₹1,000 to ₹2,000 per week in recovered time, more than Insydz costs per month.",
  },
  {
    q: "What data can an AI tool capture that Excel cannot?",
    a: "An AI competitor tracker captures price changes in real time, rank movement, Buy Box win and loss events, new competitor listings, and keyword ranking shifts. None of these appear in a spreadsheet until a human manually checks, typically 12 to 48 hours after they have already affected your sales.",
  },
  {
    q: "Is it expensive to switch from manual tracking to an AI tool in India?",
    a: "Insydz costs ₹2,499 per month with no per user seats and no USD conversion. For a seller spending 3 hours per week on manual tracking, the time cost alone at ₹500 per hour exceeds ₹6,000 per month, more than double the tool cost. The tool pays for itself in recovered time within the first week for most sellers.",
  },
  {
    q: "How long does it take to set up an AI competitor tracking tool?",
    a: "Setting up Insydz takes under 30 minutes. Add your ASINs, add the competitors to track, set your price floor, and configure WhatsApp alerts. Monitoring runs automatically from there and most sellers receive their first alert within 24 hours.",
  },
  {
    q: "Can I still use Excel alongside an AI tool?",
    a: "Yes, and you should. Excel is the right tool for unit economics, P&L modelling, and inventory planning, but not for competitor monitoring where data changes faster than any manual update schedule. Use each tool for what it does well.",
  },
];

const switchExcelAiRelatedCards = [
  {
    tag: "Competitor Intelligence",
    title: "Competitor Undercutting Your Amazon India Price? Act Within 1 Hour",
    route: "/resources/expert-blog/competitor-undercutting-amazon-india",
    image: "/Competitor Undercutting Your Amazon India Price_1.png",
  },
  {
    tag: "Data Story",
    title: "What the Top 10% of Amazon India Sellers Do Differently",
    route: "/resources/expert-blog/top-amazon-india-sellers-habits",
    image: "/top-amazon-india-sellers-habits_blogbanner.png",
  },
  {
    tag: "Keyword Intelligence",
    title: "How to Find Every Keyword Your Competitor Ranks For",
    route: "/resources/expert-blog/find-competitor-keywords-amazon-india",
    image: "/image_1691x942.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function SwitchExcelAiAmazonIndiaContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const id = "insydz-switch-excel-ai-amazon-india-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaSwitchExcelAiAmazonIndia);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = switchExcelAiTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(switchExcelAiTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(switchExcelAiTOC[i].id);
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
        
        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#F97316,#FB923C);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
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

        .article-body h2{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#0A0F1A;margin:40px 0 12px;padding-bottom:10px;border-bottom:2px solid #E5E7EB;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:120px}
        @media(min-width:640px){.article-body h2{font-size:20px;margin:48px 0 14px}}
        @media(min-width:1024px){.article-body h2{font-size:22px;margin:52px 0 14px}}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .article-body h2:first-child{margin-top:0}

        .article-body p{margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}

        /* TOC links */
        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#F97316;background:#FFF7ED;border-left-color:#FDBA74}
        .toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(249,115,22,.1);color:#FB923C;border-left-color:rgba(249,115,22,.4)}
        .dark .toc-link.active{background:rgba(249,115,22,.15);color:#FB923C;border-left-color:#F97316}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8{scroll-margin-top:120px}

        /* quote box */
        .quote-box{background:#FFFBEB;border-left:4px solid #D97706;border-radius:10px;padding:20px 22px;margin:24px 0}
        .quote-box .box-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#B45309;margin-bottom:8px}
        .quote-box p{margin:0;font-size:14.5px;line-height:1.72;font-style:italic;color:#1E293B}
        .dark .quote-box{background:#1c1507;border-color:#78350f}
        .dark .quote-box p{color:#e5e7eb}

        /* graphic panels */
        .blog-graphic-hero,.blog-graphic{border-radius:14px;overflow:hidden;margin:24px 0}
        .g{position:relative;min-height:400px;padding:40px 36px;display:flex;align-items:center;overflow:hidden}
        .gl{position:relative;z-index:10;max-width:60%}
        .gl-eyebrow{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:18px}
        .eb{width:26px;height:2px;background:rgba(255,255,255,.35);border-radius:1px;flex-shrink:0}
        .gl-h{font-size:44px;font-weight:900;color:#fff;line-height:.98;letter-spacing:-2px;margin-bottom:16px;font-family:'Sora',sans-serif}
        .y{color:#FDE68A}.or{color:#FDBA74}.gr2{color:#6EE7B7}
        .gl-sub{font-size:13px;font-weight:400;color:rgba(255,255,255,.55);line-height:1.72;max-width:320px}
        .gr-c{position:relative;z-index:5;margin-left:auto;display:flex;align-items:center}
        .orb{position:absolute;border-radius:50%;pointer-events:none}
        .wc{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 20px 48px rgba(0,0,0,.28)}
        .wc-bar{background:#f8fafc;border-bottom:1px solid #eef1f6;padding:8px 12px;display:flex;align-items:center;gap:5px}
        .cd{width:8px;height:8px;border-radius:50%}
        .cd-r{background:#ff5f57}.cd-y{background:#febc2e}.cd-g{background:#28c840}
        .wc-title{font-size:9.5px;font-weight:700;color:#6b7280;margin-left:5px}
        .b-live{margin-left:auto;background:#dcfce7;color:#15803d;font-size:8px;font-weight:800;padding:2px 7px;border-radius:20px}
        .bg-excel{background:linear-gradient(135deg,#0a1628 0%,#1e3a5f 40%,#1D4ED8 100%)}
        .bg-switch{background:linear-gradient(135deg,#0F172A 0%,#7C2D12 40%,#F97316 100%)}
        .bg-results{background:linear-gradient(135deg,#022c22 0%,#065F46 45%,#16A34A 100%)}
        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}
        @media(max-width:768px){.g{flex-direction:column;padding:32px 24px;gap:24px}.gl{max-width:100%}.gr-c{margin-left:0}.gl-h{font-size:32px}}

        /* metrics grid */
        .metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0 28px}
        .metric-card{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px 20px}
        .dark .metric-card{background:#111827;border-color:#1f2937}
        .mc-num{display:block;font-size:26px;font-weight:800;color:#F97316;line-height:1;margin-bottom:6px;font-family:'Sora',sans-serif}
        .mc-lbl{display:block;font-size:13px;color:#64748B;line-height:1.5;font-family:'Sora',sans-serif}
        .dark .mc-lbl{color:#9ca3af}
        .mc-sub{display:block;font-size:11.5px;color:#94A3B8;margin-top:3px;font-family:'Sora',sans-serif}
        @media(max-width:580px){.metrics{grid-template-columns:1fr}}

        /* related box */
        .related-box{background:#F0FDFA;border-left:4px solid #0D9488;border-radius:10px;padding:20px 22px;margin-top:32px}
        .related-box .box-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#0D9488;margin-bottom:8px}
        .related-box ul{margin:0;padding-left:18px}
        .related-box li{font-size:14px;margin-bottom:6px;line-height:1.6}
        .related-box a{color:#0D9488;font-weight:600;text-decoration:underline;text-underline-offset:3px}
        .dark .related-box{background:#042f2e;border-color:#134e4a}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .final-cta-block{background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);padding:clamp(48px,8vw,40px) 20px;text-align:center;margin:60px 0 0}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Blog",
            href: "/resources/expert-blog",
          },
          {
            label: "Switched from Excel to AI",
          },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="BOFU · Tool Comparison · Narrative"
        title={
          <>
            <span style={{ color: "#F97316" }}>Excel</span> to{" "}
            <span style={{ color: "#F97316" }}>AI Competitor Tracker</span> on{" "}
            <br />
            Amazon India: 30 Days
          </>
        }
        description={
          <>
            After 30 days with an AI competitor tracker, this seller saved 3
            hours per week in manual tracking time, recovered Buy Box losses 8x
            faster, and made every pricing decision with current data instead of
            data that was 12 to 48 hours stale.
          </>
        }
        authorName="Insydz Research Team"
        authorUrl="/resources/expert-blog"
        publishDate="June 2026"
        readTime="10 min read"
        bgColor={{ light: "#FFF7ED", dark: "#1c0900" }}
        tags={["BOFU · Convert", "30 Day Results"]}
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Hero stats */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 32,
            background: resolvedTheme === "dark" ? "#111827" : "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05)",
          }}
        >
          {[
            {
              num: "3 hrs",
              lbl: "saved per week in manual tracking time — 12 hours recovered per month",
            },
            {
              num: "8x",
              lbl: "faster Buy Box recovery — from 38 hours average down to under 4 hours",
            },
            {
              num: "23",
              lbl: "competitor price alerts in 30 days — 17 arrived outside business hours",
            },
            {
              num: "₹2,499",
              lbl: "per month vs ₹14,000+ monthly cost of staying on Excel",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 160,
                padding: "18px 24px",
                borderRight: i < 3 ? "1px solid #E2E8F0" : "none",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#F97316",
                  lineHeight: 1,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {s.num}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  color: "#64748B",
                  marginTop: 5,
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {s.lbl}
              </span>
            </div>
          ))}
        </div>

        <InfoBanner
          accentColor="#F97316"
          backgroundColor="#FFF7ED"
          title="QUICK ANSWER"
          content="After 30 days with an AI competitor tracker, this seller saved 3 hours per week in manual tracking time, recovered Buy Box losses 8x faster, and made every pricing decision with current data instead of data that was 12 to 48 hours stale. The tool cost ₹2,499 per month. The recovered time alone was worth more than ₹6,000 per month at a conservative ₹500 per hour opportunity cost."
        />

        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/Excel to AI Competitor Tracker on Amazon India_ 30 Days.png"
          altText="Switch Excel AI Amazon India"
          caption="A WhatsApp alert from Insydz at 11:34 PM when a competitor dropped price below the seller's Buy Box threshold. In a manual Excel workflow this would not have been visible until the next scheduled update, potentially 48 hours later."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={switchExcelAiKeyTakeaways}
              accentColor="#F97316"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={switchExcelAiTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={switchExcelAiTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="Why Do Sellers Start With Excel, and Why Does It Eventually Fail Them?"
                paragraph1="Excel is not the problem. It is a brilliant tool for static data: P&L calculations, inventory planning, unit economics. The problem is using it for something it was not designed for, tracking data that changes while you are not looking at it."
                paragraph2="Most Amazon India sellers start with a spreadsheet because it is free, familiar, and gives a sense of control. You build a tab with competitor ASINs, add columns for price, rating, and review count, and update it once or twice a week. For a new seller with 2 to 3 competitors and a slow moving category, this works fine."
                paragraph3="It stops working when your category gets competitive, when competitors start using repricing tools, or when a price war starts at 10 PM on a Friday and your next spreadsheet update is Sunday evening."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#F97316"
              backgroundColor="#FFF7ED"
              title="How One Seller Described It"
              content={`"The spreadsheet was not tracking my competitors. It was recording where they had been 48 hours ago. I was making decisions based on a photo of a moving car." — Amazon India seller, kitchen accessories, Pune, 3 years experience`}
            />

            <div id="s3">
              <SectionQA
                title="What Was the Seller Tracking in Excel, and What Was Slipping Through?"
                paragraph1="Before the switch, the seller maintained a spreadsheet with 8 competitor ASINs in the steel tiffin box category. Updated every Sunday evening, it tracked price, star rating, review count, and in stock status. Here is what that captured versus what was actually happening."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={switchExcelAiTable1Columns}
              rows={switchExcelAiTable1Rows}
            />

            <SectionQA
              paragraph1="The seller estimated they were catching roughly 15 percent of meaningful competitor events: the ones that fell inside the 2-hour Sunday evening update window. The other 85 percent went unnoticed until they showed up as lower sales the following week."
              resolvedTheme={resolvedTheme}
            />

            <InfoBanner
              accentColor="#0D9488"
              backgroundColor="#F0FDFA"
              title="The Stale Data Problem"
              content="It is not just that Excel misses events. It is that you make decisions based on what you last recorded, not what is actually true right now. A seller who matched a competitor's price on Sunday is acting on data that was already 48 hours old when they opened the spreadsheet."
            />

            <div id="s4">
              <SectionQA
                title="What Finally Made Them Switch?"
                paragraph1="It was a Saturday night in February. A competitor dropped the price on the exact same steel tiffin SKU from ₹649 to ₹479, a 26 percent cut that captured the Buy Box. The seller did not know about it until Monday morning when they found orders down 60 percent versus the previous weekend."
                paragraph2="The competitor held that lower price for 38 hours across the entire weekend window, the highest traffic period for kitchen products on Amazon India. The seller calculated approximately 140 lost orders, or ₹90,860 in missed revenue. All because a spreadsheet does not send alerts at 11 PM on Saturday."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#4F46E5"
              backgroundColor="#EEF2FF"
              title="The Calculation That Made It Obvious"
              content="The tool the seller switched to costs ₹2,499 per month. The single Buy Box loss event from that Saturday alone was worth ₹90,860 in missed revenue. The annual subscription cost of the tool was less than the cost of one missed weekend."
            />

            <BlogImageSection
              imageSrc="/switch-excel-image1.png"
              altText="Switch Excel AI Amazon India"
              caption="First 7 days of Insydz monitoring across 8 competitor ASINs. 11 price change alerts. 7 arrived outside business hours. The old Excel workflow would have captured 1 of these 11 events."
            />

            <div id="s5">
              <SectionQA
                title="What Did the First 7 Days With an AI Tool Feel Like?"
                paragraph1="Setup took 22 minutes. The seller added all 8 competitor ASINs, set a price floor of ₹540 per unit, and connected their WhatsApp number for alerts. The first alert arrived 14 hours later at 11:34 PM on a Wednesday: a competitor had dropped from ₹649 to ₹589."
                paragraph2="Within 7 days, the seller received 11 price change alerts and 7 arrived outside 9 AM to 6 PM. The old Excel workflow would have captured only 1 of those 11 events. The other 10 would have been invisible until they had already shifted the competitive landscape."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="The WhatsApp Effect"
              content="WhatsApp alerts changed the seller's relationship with their data. Price monitoring became ambient awareness rather than a Sunday task. The seller described it as 'the difference between checking the weather once a week and just looking out the window.'"
            />

            <NumberedCards
              items={switchExcelAiFirst7DaysSteps}
              numberColor="#F97316"
              backgroundColor="#F8FAFC"
              borderColor="#FFD8B0"
            />

            <div id="s6">
              <SectionQA
                title="What Do the 30-Day Results Actually Show?"
                paragraph1="After 30 days, the seller pulled together the measurable changes in their account. These are real metrics from one seller's account, not averages, not estimates, not projected numbers."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <div className="metrics">
              <div className="metric-card">
                <span className="mc-num">3 hrs</span>
                <span className="mc-lbl">
                  Saved per week in manual tracking time
                </span>
                <span className="mc-sub">12 hours recovered per month</span>
              </div>
              <div className="metric-card">
                <span className="mc-num">8x</span>
                <span className="mc-lbl">
                  Faster Buy Box recovery after competitor price drops
                </span>
                <span className="mc-sub">
                  From avg 38 hours to under 4 hours
                </span>
              </div>
              <div className="metric-card">
                <span className="mc-num">23</span>
                <span className="mc-lbl">
                  Competitor price change alerts in 30 days
                </span>
                <span className="mc-sub">
                  17 arrived outside business hours
                </span>
              </div>
              <div className="metric-card">
                <span className="mc-num">₹0</span>
                <span className="mc-lbl">
                  Spent on pricing decisions made below the floor
                </span>
                <span className="mc-sub">
                  Previously happened 2 to 3 times per month
                </span>
              </div>
            </div>

            <FeatureCTA
              title="Insydz replaces your competitor tracking spreadsheet with real time AI monitoring"
              description="WhatsApp alerts, price floor protection, and daily rank tracking. Free to try, no credit card."
              buttonText="Try Free, No Card →"
              buttonHref="/login"
              backgroundColor="#0D1B2A"
              buttonColor="#F97316"
            />

            <div id="s7">
              <SectionQA
                title="Does the Tool Cost Actually Justify Itself? Here Is the Math."
                paragraph1="This is the question most sellers sit with before switching. The tool costs money and Excel is free. Here is the full cost comparison made as transparent as possible."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={switchExcelAiTable2Columns}
              rows={switchExcelAiTable2Rows}
            />

            <SectionQA
              paragraph1="The comparison is not close. The tool pays for itself in recovered time within the first week for any seller spending more than 90 minutes per week on manual tracking. For sellers in competitive categories, a single missed weekend Buy Box loss likely exceeds the annual subscription cost."
              resolvedTheme={resolvedTheme}
            />

            <BlogImageSection
              imageSrc="/switch-excel-image2.png"
              altText="Switch Excel AI Amazon India"
              caption="30-day summary for one Amazon India seller. Weekly tracking time dropped from 3 hours to zero. Buy Box recovery time dropped from 38 hours to under 4 hours. Below-floor pricing decisions dropped from 2 to 3 per month to zero."
            />

            <div id="s8">
              <SectionQA
                title="Frequently Asked Questions: Switching From Excel to an AI Competitor Tracker"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#F97316" faqs={switchExcelAiFaqs} />

            {/* More Competitor Intelligence */}
            <RelatedArticles
              title="More Competitor Intelligence"
              cards={switchExcelAiRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Your Competitor Just Dropped Their Price. Do You Know About It Yet?"
        description="Insydz tells you within minutes, on WhatsApp, any time of day. Replace your spreadsheet with real time AI monitoring. Free to start, no credit card."
        primaryButtonText="Replace My Spreadsheet Free →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#F97316"
        secondaryColor="#FB923C"
        stats={[
          { value: "3 hrs", label: "Saved per week" },
          { value: "8x", label: "Faster Buy Box recovery" },
          { value: "23", label: "Alerts in 30 days" },
          { value: "₹2,499", label: "Per month, full access" },
        ]}
      />
    </div>
  );
}
