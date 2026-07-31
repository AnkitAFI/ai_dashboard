"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  MessageCircle,
  Package,
  Trophy,
  Zap,
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ShoppingBag,
  Store,
  Briefcase,
  Users,
  Bell,
  Code,
  Globe,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Flame,
  Presentation,
  LayoutGrid,
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
          name: "Amazon Private Label India 2026",
          item: "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026",
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
  { id: "what-is-private-label", label: "What Exactly Is Private Label?" },
  { id: "product-selection", label: "Finding the Right Product" },
  { id: "sourcing", label: "Sourcing & Supplier Vetting" },
  { id: "branding", label: "Brand Registry & IP India" },
  { id: "listing-optimization", label: "High-Converting Listings" },
  { id: "launch-strategy", label: "The Perfect Launch Plan" },
  { id: "scaling", label: "Scaling to 7 Figures" },
  { id: "common-pitfalls", label: "Common Mistakes to Avoid" },
  { id: "tools-required", label: "Tool Comparison 2026" },
  { id: "faq", label: "Frequently Asked Questions" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How much money do I need to start a private label on Amazon India?",
    a: "A realistic starting budget is ₹1.5L to ₹3L. This covers first-batch inventory of 150–200 units (₹60,000–₹1.2L), custom packaging design (₹10,000–₹25,000), Amazon Vine India enrolment (₹19,200 for up to 30 verified reviews), and Sponsored Products spend across the 4-week launch window (₹20,000–₹40,000).",
  },
  {
    q: "Do I need a trademark to start selling private label on Amazon India?",
    a: "No trademark is needed to list products. But you need a trademark application number to enrol in Brand Registry, which unlocks A+ Content, Vine, and listing protection. File on IP India before or at launch — you need the application, not the grant.",
  },
  {
    q: "Which product categories work best for private label on Amazon India in 2026?",
    a: "Kitchen and home, personal care, fitness accessories, stationery, and baby products work best in 2026 — strong demand, weak incumbent reviews, and accessible Indian sourcing. Avoid electronics: established brand competition, warranty expectations, and BIS certification requirements make private label entry extremely difficult for new sellers.",
  },
  {
    q: "How long does it take to launch a private label product on Amazon India?",
    a: "Plan 8–14 weeks from product decision to your first sale. Allow 2–3 weeks for supplier shortlisting and sample orders, 3–4 weeks for production and custom packaging, 1–2 weeks for Brand Registry approval and listing creation, and 1 week for FBA receiving and pre-launch quality check.",
  },
  {
    q: "What is a good private label margin on Amazon India?",
    a: "Target 30%+ net margin after Amazon commission (8–15%), FBA fulfilment fees, COGS, and ad spend. For a ₹799 product: COGS ₹160, Amazon commission ₹104, FBA fees ₹146, ad spend ₹80 — leaving ₹309 net per unit (~39%). This margin absorbs festive season discounts and still makes sense at scale.",
  },
  {
    q: "Can I use Insydz to find private label product opportunities on Amazon India?",
    a: "Yes. Insydz's competitor review analysis shows exactly which product attributes buyers complain about in any category. These complaint clusters become your product differentiation brief — the fastest way to build a private label that enters the market with a proven advantage over existing listings.",
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
            Amazon Private Label India 2026
          </span>
        </div>
      </div>

      {/* HERO SECTION - REVISED TO MATCH IMAGE */}
      <div
        style={{
          background: resolvedTheme === "dark" ? "#0f1120" : "#F1F2FF",
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
                background: resolvedTheme === "dark" ? "#1e1b4b" : "#E0E2FF",
                color: resolvedTheme === "dark" ? "#818cf8" : "#6366F1",
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
              <span style={{ marginRight: 8, color: "#6366F1" }}>●</span>{" "}
              MARKETPLACE INTELLIGENCE · TOFU PLAYBOOK
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
              How to Launch a Private Label on{" "}
              <span style={{ color: "#6366F1" }}>Amazon India</span> (2026
              Guide)
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
              From product sourcing and Brand Registry to packaging, launch
              strategy, and margin math. Everything new and D2C sellers need to
              build a brand on Amazon India — in one playbook.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px 16px",
                marginBottom: 32,
                fontSize: 13,
                color: resolvedTheme === "dark" ? "#6b7280" : "#6B7280",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              <span className="flex items-center gap-1">
                Insydz Research Team
              </span>
              <span>·</span>
              <span>May 2026</span>
              <span>·</span>
              <span>13 min read</span>
              <span>·</span>
              <span
                style={{
                  background: "#E0E2FF",
                  color: "#6366F1",
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: 4,
                }}
              >
                TOFU · New & D2C Sellers
              </span>
              <span
                style={{
                  background: "#DCFCE7",
                  color: "#059669",
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: 4,
                }}
              >
                Marketplace Pillar
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 h-auto"
              >
                <Link href="/login">Find Your Product Opportunity Free →</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={`font-bold px-8 py-3 rounded-full h-auto transition-colors ${resolvedTheme === "dark" ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-[#E0E2FF]/50 border-[#C7D2FE] text-[#6366F1] hover:bg-[#E0E2FF]"}`}
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
              }}
              className="w-full"
            >
              <h4
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#6B7280",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 20,
                  textAlign: "center",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                PRIVATE LABEL LAUNCH SNAPSHOT — AMAZON INDIA 2026
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  {
                    val: "₹1.5L",
                    lbl: "Min. budget",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F8F9FF",
                    col: "#6366F1",
                  },
                  {
                    val: "8-14 wks",
                    lbl: "Time to sale",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F3F4F6",
                    col: "#7C3AED",
                  },
                  {
                    val: "30%+",
                    lbl: "Target margin",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F3F4F6",
                    col: "#7C3AED",
                  },
                  {
                    val: "7 steps",
                    lbl: "To live listing",
                    bg: resolvedTheme === "dark" ? "#1f2937" : "#F8F9FF",
                    col: "#6366F1",
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
                        color: s.col,
                        marginBottom: 2,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                {[
                  {
                    label: "Brand Registry Required",
                    value: "Yes — TM application",
                  },
                  { label: "Fulfilment Model", value: "FBA recommended" },
                  { label: "First Inventory Batch", value: "100–300 units" },
                  { label: "Best Source", value: "IndiaMart / TradeIndia" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-[#6B7280] font-medium">
                      {row.label}
                    </span>
                    <span
                      style={{
                        color: resolvedTheme === "dark" ? "white" : "#111827",
                        fontWeight: "bold",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #4F46E5 100%)",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "white",
                    lineHeight: 1.4,
                    fontWeight: 500,
                  }}
                >
                  The fastest way to build differentiation: analyse competitor
                  reviews on Insydz before you brief your supplier. Their
                  complaints are your product spec.
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
            To launch a private label on Amazon India, pick a product category
            using sales rank and competitor review data, source from an Indian
            manufacturer on IndiaMart, register a trademark for Brand Registry,
            create an FBA listing with optimised copy, and launch with Sponsored
            Products and Amazon Vine. Minimum starting budget:{" "}
            <strong>₹1.5L to ₹3L</strong>.
          </p>
        </div>

        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/private label on amazon india.png"
          altText="Private-Label-Amazon-India-image1"
          caption="A private label strategy on Amazon India requires deep keyword research to identify underserved niches, selecting a manufacturer, and optimising listings for Amazon's A9 algorithm. Insydz helps identify high-intent keywords and monitor competitor performance to refine your positioning and launch strategy."
        />

        {/* Key Takeaways Box */}
        <div
          style={{
            background: "#0F172A",
            borderRadius: 24,
            padding: "40px",
            marginBottom: 20,
            marginTop: 32,
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
              "Private label means selling your own branded product manufactured by a third party. You control pricing, branding, and listing — and build equity that a reselling business cannot.",
              "The best categories for Indian private label in 2026 are kitchen, home, personal care, fitness accessories, and stationery — high demand, weak incumbent reviews, and local sourcing available.",
              "Brand Registry requires a trademark application number from IP India. File your TM application before or at launch — you do not need it granted, just filed.",
              "Target a 30%+ net margin. For a ₹799 product: COGS ₹160, Amazon fees ₹250, ad spend ₹80 leaves ~₹309 net — a 39% margin that survives festive season discounts.",
              "Use competitor review analysis to build your product spec. The top complaint clusters in existing category listings are your differentiation brief — fix what they get wrong.",
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
              id="what-is-private-label"
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
              What Exactly Is Private Label, and Why Is It the Right Model for
              Amazon India in 2026?
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
              Private label means sourcing from a manufacturer, applying your
              own brand and packaging, and selling it as your own. You specify
              it, brand it, and own the customer relationship.
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
              Unlike reselling, private label builds equity. Your brand, your
              listing, your reviews — none of it can be taken away by another
              seller.
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
                💡 WHY PRIVATE LABEL WORKS IN INDIA RIGHT NOW
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
                India's e-commerce penetration is still low in tier-2 and tier-3
                cities — Jaipur, Surat, Coimbatore, Ludhiana. Buyers in these
                markets are moving online for the first time and have no
                established brand loyalty.
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 15.5,
                  color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                  lineHeight: 1.75,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                A private label product with 30 reviews and good images beats a
                generic listing with zero brand identity every time. The window
                to build a brand before category saturation is still open in
                2026.
              </p>
            </div>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img
                  src="/build-your-brand.png"
                  alt="Amazon Private Label vs Reselling Comparison 2026"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Private label vs reselling on Amazon India — model comparison
                and top performing categories for new brand builders in 2026.
              </p>
            </div>

            <h2
              id="product-selection"
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
              How Do You Find the Right Product for Private Label on Amazon
              India?
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
              Product selection determines whether your private label succeeds
              or fails. The framework Indian sellers use in 2026 combines demand
              validation with review gap analysis.
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
              Start with Amazon Best Sellers in categories where Indian
              manufacturers exist. Look for ASINs selling 200–800 units per
              month, priced ₹399–₹1,499, with under 200 reviews.
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
              Then read the 2-star and 3-star reviews. If 40% of the category
              leader's reviews mention "flimsy packaging" or "no Hindi
              instructions", those are the specs your product needs to beat.
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
                <Search className="w-3 h-3" /> USING INSYDZ FOR PRODUCT RESEARCH
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 15.5,
                  color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                  lineHeight: 1.75,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Paste any ASIN into Insydz and you see the top complaint
                clusters for that product, ranked by frequency. Those complaints
                become your product differentiation brief before you brief your
                manufacturer.
              </p>
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
                ⚠️ PRODUCT SELECTION RED FLAGS
              </div>
              <ul
                style={{ margin: 0, padding: 0, listStyle: "none" }}
                className="space-y-4"
              >
                {[
                  "Category leaders have 1,000+ reviews with 4.4+ average — too established to displace without a breakthrough product",
                  "Products that require a CE mark, BIS certification, or FSSAI licence — regulatory compliance adds 4–8 weeks and ₹30,000–₹80,000 in costs",
                  "Products where the top seller is a Flipkart or Amazon private label brand — fighting the platform itself is not a winnable strategy",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 15,
                      color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                      lineHeight: 1.6,
                      fontFamily: "'Lora', serif",
                    }}
                  >
                    <span
                      style={{ color: "#D97706", fontSize: 18, marginTop: -2 }}
                    >
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

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
              sets. Avoid electronics — established brands dominate with
              warranties private label cannot match.
            </p>

            {/* S4: Sourcing */}
            <h2
              id="sourcing"
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
              Where Do You Source Private Label Products in India, and How Do
              You Vet Suppliers?
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
              Indian private label sellers have a structural advantage over
              Amazon.com sellers: your manufacturer is domestic. No import
              duties, no 12-week shipping delays, no minimum order quantities
              designed for Western importers.
            </p>

            <h4
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#6366F1",
                marginBottom: "16px",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Where to Find Manufacturers
            </h4>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              IndiaMart and TradeIndia are the two primary directories. Search
              your category plus "OEM" or "white label" and filter for verified
              suppliers with GST registration.
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
              For kitchen and home try Rajkot or Surat; for fitness accessories,
              Pune; for textiles, Tiruppur.
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
              If you are within driving distance of the manufacturing cluster,
              visit the factory in person before committing to a production
              order.
            </p>

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
                ✅ SUPPLIER VETTING CHECKLIST
              </div>
              <ul
                style={{ margin: 0, padding: 0, listStyle: "none" }}
                className="space-y-4"
              >
                {[
                  "Verify GSTIN on the GST portal before any payment",
                  "Order samples from at least 3 suppliers — never choose on price alone",
                  "Request a WhatsApp video walk-through of the production floor",
                  "Ask for a proforma invoice confirming unit price and lead time before committing",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 15,
                      color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                      lineHeight: 1.6,
                      fontFamily: "'Lora', serif",
                    }}
                  >
                    <span
                      style={{ color: "#10B981", fontSize: 18, marginTop: -2 }}
                    >
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "40px",
                fontFamily: "'Lora', serif",
              }}
            >
              Negotiate MOQs to 100–200 units for your first run — do not commit
              to 500+ units until your listing proves a conversion rate above
              5%.
            </p>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img
                  src="/net-margin-amazon-private.png"
                  alt="Amazon Private Label Margin Model India"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Private label margin model for a ₹799 Amazon India product —
                COGS, FBA fees, commission, and ad spend calculated to a 39% net
                margin per unit sold.
              </p>
            </div>

            <h2
              id="branding"
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
              How Do You Register Your Brand and Get Amazon Brand Registry in
              India?
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
              Brand Registry is the most important unlock in your private label
              journey — A+ Content (lifts conversion 3–10%), Amazon Vine access,
              and protection from listing hijackers.
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  n: 1,
                  t: "Pick a Brand Name — Check IP India First",
                  d: "Search ipindia.gov.in to confirm your chosen name is available. Short, pronounceable names in both Hindi and English perform better with Indian buyers.",
                },
                {
                  n: 2,
                  t: "File Trademark in the Correct Class",
                  d: "File on IP India in the class matching your product (Class 21 for kitchenware, Class 3 for personal care, etc). Cost: ₹4,500 for individuals. Application number issued immediately.",
                },
                {
                  n: 3,
                  t: "Apply on brandregistry.amazon.in",
                  d: "Submit your brand name, trademark application number, and packaging photos showing the brand name. Amazon approves in 2–5 business days.",
                },
                {
                  n: 4,
                  t: "Unlock A+ Content, Vine, and Brand Analytics",
                  d: "Once approved, build your A+ Content module immediately — it increases conversion by 3–10% and is free to create. Enrol in Amazon Vine India for your first batch of verified reviews.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: resolvedTheme === "dark" ? "#111827" : "white",
                    border:
                      resolvedTheme === "dark"
                        ? "1px solid #1f2937"
                        : "1px solid #E5E7EB",
                    borderRadius: 20,
                    padding: "24px 28px",
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: "#6366F1",
                      color: "white",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: 16,
                        fontWeight: 800,
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.t}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
                        lineHeight: 1.5,
                      }}
                    >
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2
              id="listing-optimization"
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
              How Do You Create a Listing That Actually Converts for an Indian
              Buyer?
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
              Indian buyers make 70%+ of purchase decisions on the primary image
              and star rating — before reading a word. A generic title and
              mediocre images will lose to a competitor with half your reviews
              but great visuals.
            </p>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img
                  src="/zero-execuses-amazon-private.png"
                  alt="Amazon India Listing Quality Checklist"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Listing quality checklist for Amazon India private label — title
                structure, image count, A+ Content, and keyword fields that
                directly impact conversion and rank.
              </p>
            </div>

            <div
              className="tbl-wrap"
              style={{
                marginBottom: 48,
                background: resolvedTheme === "dark" ? "#111827" : "#fff",
                borderRadius: 16,
                overflow: "hidden",
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
              }}
            >
              <table
                className="dt"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead
                  style={{
                    background:
                      resolvedTheme === "dark" ? "#1e293b" : "#0F172A",
                    color: "white",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        color: "white",
                        padding: "16px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Listing Element
                    </th>
                    <th
                      style={{
                        color: "white",
                        padding: "16px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      What To Do
                    </th>
                    <th
                      style={{
                        color: "white",
                        padding: "16px 20px",
                        textAlign: "right",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      e: "Title",
                      d: "Primary keyword in first 80 characters. Include brand name, material, size, and key use case.",
                      p: "Critical",
                      pc: "#FEE2E2",
                      pt: "#991B1B",
                      c: true,
                    },
                    {
                      e: "Bullet Points",
                      d: "5 bullets. Each starts with a capitalised benefit (not a feature). Mirror complaint vocabulary from competitor reviews.",
                      p: "Critical",
                      pc: "#FEE2E2",
                      pt: "#991B1B",
                      c: true,
                    },
                    {
                      e: "Images",
                      d: "7 minimum: hero (white background), lifestyle, infographic with key specs, size/dimension chart, and comparison vs generic alternative.",
                      p: "Critical",
                      pc: "#FEE2E2",
                      pt: "#991B1B",
                      c: true,
                    },
                    {
                      e: "A+ Content",
                      d: "Build immediately after Brand Registry approval. Brand story module + feature comparison table. Free to create, lifts conversion 3–10%.",
                      p: "High",
                      pc: "#FEF3C7",
                      pt: "#92400E",
                      c: false,
                    },
                    {
                      e: "Backend Keywords",
                      d: 'Fill all 250 bytes of backend keyword fields. Include Hindi transliterations of your product name (e.g. "pani ki bottle" for water bottle).',
                      p: "High",
                      pc: "#FEF3C7",
                      pt: "#92400E",
                      c: false,
                    },
                    {
                      e: "Product Description",
                      d: "Add a Hindi paragraph at the end of the product description. Indian buyers from tier-2 cities respond significantly better to Hindi product descriptions.",
                      p: "Medium",
                      pc: "#F3E8FF",
                      pt: "#6B21A8",
                      c: false,
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        background:
                          i % 2 === 0
                            ? resolvedTheme === "dark"
                              ? "transparent"
                              : "#F8FAFC"
                            : "transparent",
                        borderBottom:
                          resolvedTheme === "dark"
                            ? "1px solid #1f2937"
                            : "1px solid #F1F5F9",
                        borderLeft: row.c
                          ? "4px solid #8B5CF6"
                          : "4px solid transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "18px 20px",
                          fontWeight: 800,
                          color: row.c
                            ? "#8B5CF6"
                            : resolvedTheme === "dark"
                              ? "#f9fafb"
                              : "#111827",
                          fontSize: 15,
                          fontFamily: "'Sora', sans-serif",
                        }}
                      >
                        {row.e}
                      </td>
                      <td
                        style={{
                          padding: "18px 20px",
                          color:
                            resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                          fontSize: 14,
                          lineHeight: 1.6,
                          fontFamily: "'Sora', sans-serif",
                        }}
                      >
                        {row.d}
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "right" }}>
                        <span
                          style={{
                            background:
                              resolvedTheme === "dark"
                                ? row.p === "Critical"
                                  ? "#450a0a"
                                  : row.p === "High"
                                    ? "#451a03"
                                    : "#2e1065"
                                : row.pc,
                            color:
                              resolvedTheme === "dark"
                                ? row.p === "Critical"
                                  ? "#fecaca"
                                  : row.p === "High"
                                    ? "#fef3c7"
                                    : "#f3e8ff"
                                : row.pt,
                            padding: "4px 12px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          {row.p}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2
              id="launch-strategy"
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
              What Is the Right Launch Strategy for a New Private Label on
              Amazon India?
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
              Launching without a plan is the most common reason private label
              products fail. Most sellers list, wait for organic sales, get no
              reviews, and quit within 30 days. The 4-week launch window is the
              most critical period your product will ever have.
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  n: 1,
                  t: "Enrol in Amazon Vine India on Day One",
                  d: "As soon as your listing is live with FBA inventory, enrol in Vine (₹19,200 for up to 30 reviews). This is non-negotiable for a private label launch. You need social proof before organic buyers arrive.",
                },
                {
                  n: 2,
                  t: "Run Sponsored Products at a Higher Bid for Weeks 1–4",
                  d: "Run an auto campaign and 2 manual exact-match campaigns on your top 5 keywords. Accept higher ACoS in weeks 1–4 to build rank, then optimise for profitability from week 5.",
                },
                {
                  n: 3,
                  t: "Share Your Listing on WhatsApp Before Going Live",
                  d: "Tell your network — customers, friends, colleagues — via WhatsApp that the product is live. Even 10–15 organic sales in week 1 signal relevance to Amazon's algorithm.",
                },
                {
                  n: 4,
                  t: "Track Keyword Rank Daily from Week 1",
                  d: "Use Insydz to track daily rank on your target keywords. Know when you cross threshold positions (#50, #30, #15) and which actions drove each jump.",
                },
                {
                  n: 5,
                  t: "Respond to Every Review in Weeks 1–8",
                  d: "Respond publicly to every 3-star or below review with a resolution offer. It shows future buyers you stand behind the product — and often prompts rating updates.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: resolvedTheme === "dark" ? "#111827" : "white",
                    border:
                      resolvedTheme === "dark"
                        ? "1px solid #3b0764"
                        : "1px solid #e9d5ff",
                    borderRadius: 20,
                    padding: "24px 28px",
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    boxShadow:
                      resolvedTheme === "dark"
                        ? "none"
                        : "0 4px 14px rgba(139, 92, 246, 0.03)",
                  }}
                >
                  <div
                    style={{
                      background: "#8B5CF6",
                      color: "white",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: 16,
                        fontWeight: 800,
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.t}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
                        lineHeight: 1.5,
                      }}
                    >
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: resolvedTheme === "dark" ? "#0f172a" : "#111827",
                borderRadius: 24,
                padding: "32px 40px",
                marginBottom: "48px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                border: resolvedTheme === "dark" ? "1px solid #1e293b" : "none",
              }}
            >
              <div style={{ flex: "1 1 400px" }}>
                <h4
                  style={{
                    color: "white",
                    fontSize: 20,
                    fontWeight: 800,
                    margin: "0 0 8px",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Track Your Private Label Rankings from Launch Day
                </h4>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 15,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  See exactly which keywords move as your reviews and sales
                  build — Insydz tracks daily on Amazon India and Flipkart.
                </p>
              </div>
              <button
                style={{
                  background: "#8B5CF6",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "'Sora', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#7C3AED")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#8B5CF6")
                }
              >
                Start Tracking Free &rarr;
              </button>
            </div>

            <h2
              id="scaling"
              style={{
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
              }}
            >
              Scaling: From 1 ASIN to a Full Brand
            </h2>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#d1d5db" : "#1E293B",
              }}
            >
              Once your first product is generating ₹2L in monthly profit, don't
              just sit on it. Reinvest that profit into your next product. A
              "brand" is a collection of complementary products that solve a
              specific customer problem.
            </p>

            <h2
              id="common-pitfalls"
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
              What Are the Most Common Mistakes New Private Label Sellers Make
              on Amazon India?
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

            <div className="space-y-4 mb-10">
              {[
                {
                  n: 1,
                  t: "Choosing a Product Based on Interest, Not Data",
                  d: "Sellers pick categories they personally use. Private label is a data decision — validated demand, weak reviews, local sourcing. Personal interest is irrelevant.",
                },
                {
                  n: 2,
                  t: "Ordering 500 Units Before Validating Conversion",
                  d: "Start with 150–200 units. Prove a conversion rate above 5% before reordering at scale. Ordering 500+ units of an unproven listing is an ₹80,000–₹1,50,000 gamble.",
                },
                {
                  n: 3,
                  t: "Launching Without Brand Registry",
                  d: "Without Brand Registry, any seller can add themselves to your listing. You lose control of pricing and reviews. File your trademark application before sending inventory to FBA.",
                },
                {
                  n: 4,
                  t: "Skipping Hindi in the Listing",
                  d: "Buyers in Patna, Nagpur, Rajkot, and Mysore convert better with Hindi in the product description. It is a 15-minute update that lifts conversion in tier-2 and tier-3 markets.",
                },
                {
                  n: 5,
                  t: "Not Tracking Rank After Launch",
                  d: "Most sellers check sales numbers and guess if the launch is working. Daily keyword rank tracking tells you exactly whether ads, Vine reviews, and listing edits are moving you in the right direction.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    background: resolvedTheme === "dark" ? "#111827" : "white",
                    border:
                      resolvedTheme === "dark"
                        ? "1px solid #3b0764"
                        : "1px solid #e9d5ff",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow:
                      resolvedTheme === "dark"
                        ? "none"
                        : "0 4px 14px rgba(139, 92, 246, 0.03)",
                  }}
                >
                  <div
                    style={{
                      background:
                        resolvedTheme === "dark" ? "#1e293b" : "#0F172A",
                      color: "white",
                      width: 54,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 18,
                      flexShrink: 0,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ flex: 1, padding: "18px 22px" }}>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: 15,
                        fontWeight: 800,
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.t}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2
              id="tools-required"
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
              Which Tool Should You Use to Track and Grow Your Private Label on
              Amazon India?
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
              Once live, the work shifts to rank tracking, review analysis, and
              competitor monitoring. Here is how tools compare for Indian
              private label sellers.
            </p>

            <div
              className="tbl-wrap"
              style={{
                marginBottom: 48,
                background: resolvedTheme === "dark" ? "#111827" : "#fff",
                borderRadius: 16,
                overflow: "auto",
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
              }}
            >
              <table
                className="dt"
                style={{
                  width: "100%",
                  minWidth: "800px",
                  borderCollapse: "collapse",
                  textAlign: "center",
                }}
              >
                <thead
                  style={{
                    background:
                      resolvedTheme === "dark" ? "#1e293b" : "#0F172A",
                    color: "white",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "16px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Capability
                    </th>
                    <th
                      style={{
                        background: "#7C3AED",
                        padding: "16px 20px",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Insydz
                    </th>
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Helium 10
                    </th>
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Jungle Scout
                    </th>
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Viral Launch
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      c: "Amazon India keyword rank tracking",
                      i: { t: "✓ Native", p: "g" },
                      h: { t: "Limited", p: "y" },
                      j: { t: "US focus", p: "r" },
                      v: { t: "US focus", p: "r" },
                    },
                    {
                      c: "Flipkart rank tracking",
                      i: { t: "✓ Yes", c: "g" },
                      h: { t: "No", c: "r" },
                      j: { t: "No", c: "r" },
                      v: { t: "No", c: "r" },
                    },
                    {
                      c: "Competitor review analysis",
                      i: { t: "✓ AI-powered", p: "g" },
                      h: { t: "Basic", p: "y" },
                      j: { t: "Basic", p: "y" },
                      v: { t: "Limited", p: "r" },
                    },
                    {
                      c: "Hindi review analysis",
                      i: { t: "✓ Yes", c: "g" },
                      h: { t: "No", c: "r" },
                      j: { t: "No", c: "r" },
                      v: { t: "No", c: "r" },
                    },
                    {
                      c: "Pricing for Indian sellers",
                      i: { t: "₹0-₹4,999/mo", p: "g" },
                      h: { t: "₹7,000+/mo", p: "r" },
                      j: { t: "₹5,500+/mo", p: "r" },
                      v: { t: "₹5,000+/mo", p: "r" },
                    },
                    {
                      c: "India-first support",
                      i: { t: "✓ WhatsApp", c: "g" },
                      h: { t: "Email only", c: "gy" },
                      j: { t: "Email only", c: "gy" },
                      v: { t: "Email only", c: "gy" },
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        background:
                          i % 2 === 0
                            ? resolvedTheme === "dark"
                              ? "transparent"
                              : "#F8FAFC"
                            : "transparent",
                        borderBottom:
                          resolvedTheme === "dark"
                            ? "1px solid #1f2937"
                            : "1px solid #F1F5F9",
                      }}
                    >
                      <td
                        style={{
                          padding: "18px 20px",
                          textAlign: "left",
                          fontWeight: 700,
                          color:
                            resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                          fontSize: 14,
                          fontFamily: "'Sora', sans-serif",
                        }}
                      >
                        {row.c}
                      </td>

                      {/* INSYDZ Column */}
                      <td
                        style={{
                          padding: "18px 20px",
                          borderLeft:
                            resolvedTheme === "dark"
                              ? "1px solid #3b0764"
                              : "1px solid #e9d5ff",
                          borderRight:
                            resolvedTheme === "dark"
                              ? "1px solid #3b0764"
                              : "1px solid #e9d5ff",
                          background:
                            resolvedTheme === "dark"
                              ? "#2e106510"
                              : "#f3e8ff30",
                        }}
                      >
                        {row.i.p ? (
                          <span
                            style={{
                              background:
                                row.i.p === "g"
                                  ? resolvedTheme === "dark"
                                    ? "#064e3b"
                                    : "#dcfce7"
                                  : "",
                              color:
                                row.i.p === "g"
                                  ? resolvedTheme === "dark"
                                    ? "#a7f3d0"
                                    : "#166534"
                                  : "",
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {row.i.t}
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                row.i.c === "g"
                                  ? resolvedTheme === "dark"
                                    ? "#34d399"
                                    : "#059669"
                                  : "",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {row.i.t}
                          </span>
                        )}
                      </td>

                      {/* HELIUM 10 */}
                      <td style={{ padding: "18px 20px" }}>
                        {row.h.p ? (
                          <span
                            style={{
                              background:
                                row.h.p === "y"
                                  ? resolvedTheme === "dark"
                                    ? "#451a03"
                                    : "#fef08a"
                                  : row.h.p === "r"
                                    ? resolvedTheme === "dark"
                                      ? "#450a0a"
                                      : "#fee2e2"
                                    : "",
                              color:
                                row.h.p === "y"
                                  ? resolvedTheme === "dark"
                                    ? "#fde047"
                                    : "#854d0e"
                                  : row.h.p === "r"
                                    ? resolvedTheme === "dark"
                                      ? "#fca5a5"
                                      : "#991b1b"
                                    : "",
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {row.h.t}
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                row.h.c === "r"
                                  ? resolvedTheme === "dark"
                                    ? "#f87171"
                                    : "#dc2626"
                                  : row.h.c === "gy"
                                    ? resolvedTheme === "dark"
                                      ? "#94a3b8"
                                      : "#64748b"
                                    : "",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {row.h.t}
                          </span>
                        )}
                      </td>

                      {/* JUNGLE SCOUT */}
                      <td style={{ padding: "18px 20px" }}>
                        {row.j.p ? (
                          <span
                            style={{
                              background:
                                row.j.p === "y"
                                  ? resolvedTheme === "dark"
                                    ? "#451a03"
                                    : "#fef08a"
                                  : row.j.p === "r"
                                    ? resolvedTheme === "dark"
                                      ? "#450a0a"
                                      : "#fee2e2"
                                    : "",
                              color:
                                row.j.p === "y"
                                  ? resolvedTheme === "dark"
                                    ? "#fde047"
                                    : "#854d0e"
                                  : row.j.p === "r"
                                    ? resolvedTheme === "dark"
                                      ? "#fca5a5"
                                      : "#991b1b"
                                    : "",
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {row.j.t}
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                row.j.c === "r"
                                  ? resolvedTheme === "dark"
                                    ? "#f87171"
                                    : "#dc2626"
                                  : row.j.c === "gy"
                                    ? resolvedTheme === "dark"
                                      ? "#94a3b8"
                                      : "#64748b"
                                    : "",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {row.j.t}
                          </span>
                        )}
                      </td>

                      {/* VIRAL LAUNCH */}
                      <td style={{ padding: "18px 20px" }}>
                        {row.v.p ? (
                          <span
                            style={{
                              background:
                                row.v.p === "y"
                                  ? resolvedTheme === "dark"
                                    ? "#451a03"
                                    : "#fef08a"
                                  : row.v.p === "r"
                                    ? resolvedTheme === "dark"
                                      ? "#450a0a"
                                      : "#fee2e2"
                                    : "",
                              color:
                                row.v.p === "y"
                                  ? resolvedTheme === "dark"
                                    ? "#fde047"
                                    : "#854d0e"
                                  : row.v.p === "r"
                                    ? resolvedTheme === "dark"
                                      ? "#fca5a5"
                                      : "#991b1b"
                                    : "",
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {row.v.t}
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                row.v.c === "r"
                                  ? resolvedTheme === "dark"
                                    ? "#f87171"
                                    : "#dc2626"
                                  : row.v.c === "gy"
                                    ? resolvedTheme === "dark"
                                      ? "#94a3b8"
                                      : "#64748b"
                                    : "",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {row.v.t}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img
                  src="/know-before-they-do-amazon-private.png"
                  alt="Insydz Amazon India Rank Tracking"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Insydz rank tracking for a private label yoga mat launch on
                Amazon India — from invisible (#72) to top-20 in 6 weeks, with
                rank jumps correlated to Vine reviews and listing changes.
              </p>
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
            "linear-gradient(135deg, #7C3AED 0%, #6366F1 40%, #4F46E5 100%)",
          padding: "clamp(48px,8vw,80px) 20px",
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
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              marginBottom: 16,
            }}
          >
            Ready to Launch Your Private Label on Amazon India?
          </h2>

          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(14px, 2vw, 17px)",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.6,
              maxWidth: 580,
              margin: "0 auto 28px",
            }}
          >
            Start by analysing competitor reviews in your target category —
            Insydz shows you the exact product gaps your private label should
            solve.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px 24px",
              marginBottom: 32,
              fontSize: 13,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
            }}
          >
            {[
              "Amazon India & Flipkart rank tracking",
              "AI competitor review analysis",
              "Hindi review processing",
              "Free to start",
            ].map((f, i) => (
              <span
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ color: "#a5f3fc" }}>✓</span> {f}
              </span>
            ))}
          </div>

          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "white",
              color: "#6366F1",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(14px, 1.5vw, 16px)",
              padding: "16px 40px",
              borderRadius: 100,
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
            }}
          >
            Find Your Product Opportunity Free →
          </Link>

          <p
            style={{
              marginTop: 20,
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
            }}
          >
            5,000+ Indian sellers trust Insydz · 2.5 Lakh+ reviews analysed ·
            24/7 live market data
          </p>
        </div>
      </div>
    </div>
  );
}
