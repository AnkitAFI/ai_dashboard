"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import HeroSection from "../components/HeroSection";
import SectionQA from "../components/SectionQA";
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import RelatedArticles from "../components/RelatedArticles";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";
import InsightCards, { InsightCard } from "../components/InsightCard";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import FeatureCTA from "../components/FeatureCTA";
import HeroStats from "../components/HeroStats";
import RelatedReadingBox from "../components/Relatedreadingbox";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaAmazonGreatFreedomFestival2026 = {
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
        "https://insydz.com/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide",
      url: "https://insydz.com/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide",
      name: "Amazon Great Freedom Festival 2026: The Indian Seller's Complete Preparation Checklist",
      description:
        "Amazon Great Freedom Festival 2026 starts August 8. Here is the complete seller preparation checklist — pricing, inventory, listing, and competitor monitoring.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide#breadcrumb",
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
          name: "Amazon Freedom Festival 2026 Seller Guide",
          item: "https://insydz.com/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide#article",
      headline:
        "Amazon Great Freedom Festival 2026: The Indian Seller's Complete Preparation Checklist",
      image:
        "https://insydz.com/amazon-great-freedom-festival-2026-seller-guide_banner.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-08-10",
      dateModified: "2026-08-10",
      keywords: [
        "amazon great freedom festival 2026 seller guide",
        "amazon independence day sale india seller preparation",
        "amazon freedom festival india 2026",
        "how to prepare amazon freedom festival india",
        "amazon india august sale 2026 sellers",
      ],
      articleSection: "Festive Sale Strategy",
      inLanguage: "en-IN",
      wordCount: 2800,
      timeRequired: "PT12M",
    },
  ],
};

// ── Key takeaways ────────────────────────────────────────────────────────────
const freedomKeyTakeaways = [
  "Amazon's Great Freedom Festival runs August 8–15, anchored around India's Independence Day. It is the third-largest Indian ecommerce sale event by seller revenue, after Prime Day and Big Billion Days.",
  "Sellers who maximise the event prepare across five areas in the 30 days before: pricing floors, FBA inventory, listing quality, competitor monitoring, and review health. Missing any one reduces your conversion during the days when your traffic is highest.",
  "The most common Freedom Festival mistake is entering the sale without a price floor. High-traffic events accelerate price wars — without a floor, automated repricing rules can destroy a full quarter of margin in 8 days.",
  "FBA inventory must leave your warehouse at least 14 days before the sale starts. For an August 8 opening, your shipment needs to dispatch by July 24 to guarantee availability on day one.",
  "Flipkart runs its Freedom Sale in the same August 8–15 window. For dual-platform sellers, preparation should cover both simultaneously.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const freedomTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What Is Great Freedom Festival?" },
  { id: "s3", label: "30-Day Preparation Timeline" },
  { id: "s4", label: "Pricing Without Destroying Margin" },
  { id: "s5", label: "Prepared vs Unprepared Sellers" },
  { id: "s6", label: "Listing Quality & Review Health" },
  { id: "s7", label: "Real-Time Monitoring" },
  { id: "s8", label: "Build Habits Without Hours" },
  { id: "s9", label: "FAQs" },
];

// ── Table: Prepared vs Unprepared (s5) ──────────────────────────────────────
const freedomComparisonColumns: TableColumn[] = [
  {
    key: "area",
    label: "PREPARATION AREA",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
  {
    key: "prepared",
    label: "PREPARED SELLER (TOP QUARTILE)",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
  {
    key: "unprepared",
    label: "UNPREPARED SELLER (BOTTOM QUARTILE)",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
  {
    key: "impact",
    label: "IMPACT",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
];

const freedomComparisonRows: TableRow[] = [
  {
    rowClassName: "bg-[#E7F1EB]",
    area: {
      value: "Price floor",
      className:
        "font-semibold text-[#16A34A] border-l-4 border-[#16A34A] pl-3",
    },
    prepared: "Calculated before sale, entered in repricing rules",
    unprepared: "No floor set — matches every competitor drop",
    impact: {
      type: "chip",
      label: "Margin collapse risk",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    area: "FBA inventory",
    prepared: "Dispatched July 24 — available Day 1",
    unprepared: "Dispatched July 30 — stuck in queue Days 1–4",
    impact: {
      type: "chip",
      label: "Missed peak days",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    rowClassName: "bg-[#E7F1EB]",
    area: {
      value: "Listing quality",
      className:
        "font-semibold text-[#16A34A] border-l-4 border-[#16A34A] pl-3",
    },
    prepared: "Review complaints addressed before August 8",
    unprepared: "Unresolved complaints amplified by 3x traffic",
    impact: {
      type: "chip",
      label: "3x negative reviews",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    area: "Competitor monitoring",
    prepared: "WhatsApp alerts — responds in minutes",
    unprepared: "Manual check next morning — 12 hrs late",
    impact: {
      type: "chip",
      label: "Buy Box lost overnight",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    rowClassName: "bg-[#E7F1EB]",
    area: {
      value: "Post-event rank",
      className:
        "font-semibold text-[#16A34A] border-l-4 border-[#16A34A] pl-3",
    },
    prepared: "Sustained PPC for 7 days — rank gains locked",
    unprepared: "Returns to normal Day 1 — rank gains lost",
    impact: {
      type: "chip",
      label: "No lasting benefit",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
];

// ── 5-step timeline (s3) ───────────────────────────────────────────────────────
const freedomTimelineSteps = [
  {
    title: "July 9 (30 days before) — Calculate price floors for every ASIN",
    description:
      "Pull COGS, FBA fees, and your estimated event advertising cost per unit. Apply the floor formula: (COGS + FBA fees + ad cost) ÷ (1 minus your minimum margin). Set this in your repricing rules before touching any pricing.",
  },
  {
    title: "July 11 (28 days before) — Run a review intelligence check",
    description:
      "Run a review analysis on your ASINs and top 5 competitor ASINs. A sale event sends peak traffic to listings with unresolved quality complaints. Find complaint clusters now so you have 3 weeks to address them before they cost you during peak traffic.",
  },
  {
    title: "July 18 (21 days before) — Complete listing optimisation",
    description:
      "Your listing must be final before FBA inventory goes in — listing changes after inventory is received can trigger a review period. This is also the deadline for submitting Lightning Deals or Coupons — Amazon India's deal submission windows typically close 7 to 10 days before the sale opens.",
  },
  {
    title: "July 24 (14 days before — FBA hard deadline) — Dispatch inventory",
    description:
      "Amazon FBA inbound processing takes 7 to 10 business days, plus handling time. Add a 4-day buffer and you have a July 24 dispatch deadline for guaranteed availability on August 8. Inventory dispatched after July 28 carries real risk of not being receivable by day one of the sale.",
  },
  {
    title: "August 1 (7 days before) — Set up real-time competitor monitoring",
    description:
      "Add your top 3 to 5 competitor ASINs per product to Insydz and configure WhatsApp alerts for price changes. During the Freedom Festival, competitor prices can change 3 to 5 times per day in active categories. Manual checking is not viable.",
  },
];

// ── Discover / feature cards (s5) ─────────────────────────────────────────────
const freedomHabitCards: InsightCard[] = [
  {
    icon: "📅",
    title: "Price floor calculator",
    description:
      "Set your event floor once in Insydz using your COGS, FBA fees, and event ACoS estimate. The floor fires automatically in your repricing rules — no daily manual check required.",
  },
  {
    icon: "🔔",
    title: "WhatsApp competitor alerts",
    description:
      "Insydz monitors your competitor ASINs continuously and sends a WhatsApp notification the moment a price change happens — with the competitor's new price, Buy Box impact, and their review score alongside it.",
  },
  {
    icon: "⭐",
    title: "Weekly review intelligence",
    description:
      "A 20-minute weekly review check in Insydz surfaces new complaint clusters and competitor feature requests. Run it once before the sale and once the week after — enough to catch everything actionable.",
  },
  {
    icon: "📈",
    title: "Post-event rank tracking",
    description:
      "Insydz tracks your keyword rank positions daily. After the Freedom Festival, check which rank gains are holding and which are reverting — so your PPC spend goes to the positions worth defending.",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const freedomFaqs = [
  {
    q: "When is Amazon's Great Freedom Festival 2026?",
    a: "Amazon's Great Freedom Festival 2026 runs from approximately August 8 to August 15, anchored around India's Independence Day on August 15. Exact dates are announced by Amazon India 3 to 4 weeks before the event.",
  },
  {
    q: "How is Amazon's Great Freedom Festival different from Prime Day?",
    a: "Prime Day (July) is open to Prime members only and is Amazon's global flagship event. The Great Freedom Festival (August) is open to all Amazon India shoppers and tends to generate stronger volume in mass-market categories like home goods, kitchenware, fashion, and daily use products — categories that are dominant in Tier 2 and Tier 3 Indian cities.",
  },
  {
    q: "How early should I start preparing for the Amazon Freedom Festival as a seller?",
    a: "Start 30 days before the sale window. FBA inbound shipments should arrive at least 14 days before the sale starts. Listing optimisation, competitor monitoring setup, and pricing floor calculation should all be done in the first two weeks of your preparation window.",
  },
  {
    q: "Should I lower my price significantly for the Freedom Festival?",
    a: "Not necessarily, and not without calculating your floor first. The Freedom Festival is high-traffic, which means both more buyers and more aggressive competitor repricing. Setting a calculated price floor before the sale starts is non-negotiable — selling more units at a loss during a sale event is one of the most common ways Indian sellers damage their full-year margin.",
  },
  {
    q: "Does Flipkart also have a Freedom Sale at the same time?",
    a: "Yes. Flipkart runs its Freedom Sale in the same August 8 to 15 window, targeting the same Independence Day shopping intent. For sellers on both platforms, preparation should cover both simultaneously.",
  },
  {
    q: "What is the biggest mistake sellers make during the Amazon Freedom Festival?",
    a: "Running out of stock during peak traffic days. FBA inventory levels that were calculated on normal sales velocity are typically insufficient for a major sale event. The second most common mistake is entering the sale without a price floor and getting pulled into a margin-destroying price war by automated repricing rules.",
  },
];

const freedomRelatedCards = [
  {
    tag: "Pricing Strategy",
    title: "Amazon Repricing Strategy 2026: Stop Losing the Buy Box",
    route: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
    image: "/amazon-repricing-strategy-india-image0.png",
  },
  {
    tag: "Price War Strategy",
    title: "Amazon India Price Wars: Compete Without Losing Margin",
    route: "/resources/expert-blog/amazon-india-price-war-strategy",
    image: "/Blog_30_banner.png",
  },
  {
    tag: "Prime Day Strategy",
    title: "Amazon Prime Day India 2026: Every Question Answered",
    route: "/resources/expert-blog/prime-day-india-2026-seller-questions",
    image: "/prime-day-india-2026-seller-questions.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonGreatFreedomFestival2026SellerGuideContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const id = "insydz-amazon-great-freedom-festival-2026-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaAmazonGreatFreedomFestival2026);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      let found = false;
      for (let i = freedomTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(freedomTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(freedomTOC[i].id);
          found = true;
          break;
        }
      }
      if (!found) {
        setActiveSection("s1");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#16A34A,#4ADE80);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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

        .article-body p,.article-body li{font-family:'Lora',serif;margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}

        .article-body h1,.article-body h2,.article-body h3,.article-body h4,.article-body th,.article-body td{font-family:'Sora',sans-serif}
        .article-body h2{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#0A0F1A;margin:40px 0 12px;padding-bottom:10px;border-bottom:2px solid #E5E7EB;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:120px}
        @media(min-width:640px){.article-body h2{font-size:20px;margin:48px 0 14px}}
        @media(min-width:1024px){.article-body h2{font-size:22px;margin:52px 0 14px}}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .article-body h2:first-child{margin-top:0}

        /* breadcrumb */
        .breadcrumb{background:#E7F1EB;border-bottom:1px solid #D1E2D7;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#16A34A;background:#E7F1EB;border-left-color:#86EFAC}
        .toc-link.active{color:#16A34A;background:#E7F1EB;border-left-color:#16A34A}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(22,163,74,.1);color:#4ADE80;border-left-color:rgba(22,163,74,.4)}
        .dark .toc-link.active{background:rgba(22,163,74,.15);color:#4ADE80;border-left-color:#16A34A}

        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9{scroll-margin-top:120px}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Amazon Freedom Festival 2026 Seller Guide" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Festive Sale Prep · August 2026 · Amazon India"
        title={
          <>
            Amazon Great Freedom Festival 2026:{" "}
            <span style={{ color: "#16A34A" }}>
              The Indian Seller&apos;s Complete Preparation Checklist
            </span>
          </>
        }
        description={
          <>
            Amazon&apos;s Great Freedom Festival runs August 8–15 — India&apos;s
            third biggest ecommerce sale event after Prime Day and Big Billion
            Days. Sellers who win it consistently prepare across five areas
            before August 8: pricing floors, FBA inventory, listing quality,
            competitor monitoring, and review health. This is the full playbook.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="August 2026"
        readTime="12 min read"
        bgColor={{ light: "#E7F1EB", dark: "#0b1c13" }}
        highlightColor="#16A34A"
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Hero stats */}
        <HeroStats
          resolvedTheme={resolvedTheme}
          accentColor="#16A34A"
          stats={[
            {
              value: "Aug 8–15",
              label:
                "Great Freedom Festival 2026 event window across all Amazon India mass-market categories",
            },
            {
              value: "30 Days",
              label:
                "ideal preparation timeline to audit price floors, listing images, and review sentiment",
            },
            {
              value: "14 Days",
              label:
                "FBA hard deadline for warehouse dispatch to guarantee availability on opening day",
            },
            {
              value: "2.8x",
              label:
                "average sales increase for fully prepared sellers vs 1.4x for unprepared sellers",
            },
          ]}
        />

        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/Blog_32_banner.png"
          altText="Amazon Freedom Festival 2026 Seller Preparation"
          caption="Insydz Freedom Festival readiness dashboard. Price floors and FBA inventory ready. Fixing listing images and review complaints before peak traffic opens delivers lasting rank benefits."
        />

        <InfoBanner
          accentColor="#16A34A"
          backgroundColor="#E7F1EB"
          title="QUICK ANSWER"
          content="Amazon's Great Freedom Festival runs August 8–15 and is open to all Amazon India shoppers — not just Prime members. Sellers who win it consistently do five things before August 8: calculate a price floor so they don't lose margin in the price war, send FBA inventory at least 14 days early, fix their listing's top review complaints, set up real-time competitor monitoring, and plan a post-event ranking strategy. Sellers who skip this can still see a revenue spike — but often at worse margin than a normal week, with no lasting rank benefit."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={freedomKeyTakeaways}
              accentColor="#16A34A"
              backgroundColor="#0C1A27"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={freedomTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={freedomTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="What Is Amazon's Great Freedom Festival and Why Does It Matter for Indian Sellers?"
                paragraph1="Amazon India rebranded its Independence Day Sale as the Great Freedom Festival in 2022. It runs annually around August 15 — India's Independence Day — typically opening on August 8 and running through August 15. In 2026, the sale window is expected to follow the same calendar."
                paragraph2="For Indian sellers, the Great Freedom Festival occupies a specific commercial niche. Unlike Prime Day, which is global and member-gated, the Freedom Festival is open to all Amazon India shoppers. It generates particularly strong volumes in mass-market categories: home goods, kitchenware, personal care, fashion basics, and daily-use products. Tier 2 and Tier 3 city buyers participate at higher rates during the Freedom Festival than during Prime Day."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#E7F1EB"
              title="How It Compares to the Other Major Sale Events"
              content="Prime Day (July) is Amazon's global flagship — highest traffic, skewed toward premium categories and Prime member demographics. Big Billion Days (October) is Flipkart's heavyweight. The Great Freedom Festival sits between: broader buyer base than Prime Day, smaller absolute traffic than Big Billion Days, but consistently one of the highest-conversion windows of the year for mass-market Indian categories. For kitchenware, personal care, and home products sellers, the Freedom Festival often outperforms Prime Day on actual units sold."
            />

            <div id="s3">
              <SectionQA
                title="The 30-Day Preparation Timeline — What to Do and When"
                paragraph1="Everything that matters for a sale event is decided before it starts. The sellers who enter the Freedom Festival unprepared cannot fix their listing images, restock FBA, or calculate price floors on August 8. Work through these milestones in order."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={freedomTimelineSteps}
              numberColor="#16A34A"
              backgroundColor="#F8FAFC"
              borderColor="#C6E6D2"
            />

            <div id="s4">
              <SectionQA
                title="How to Price for the Freedom Festival Without Destroying Your Margin"
                paragraph1="The Freedom Festival is a high-pressure pricing environment. Every seller in your category is under pressure to discount. Buyers are comparing prices across 10 to 15 listings simultaneously. And if you have any repricing rules active, those rules are firing continuously as competitors move — often pulling prices downward in a cascade."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#DC2626"
              backgroundColor="#FEF2F2"
              title="⚠️ The Most Expensive Freedom Festival Mistake"
              content="Entering the sale without a calculated price floor. A seller who sets an automated 'match the lowest FBA price' rule without a floor during a high-traffic event can find themselves at break-even or below by day 2 — because every competitor with the same rule is pulling the category floor down simultaneously."
            />

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#E7F1EB"
              title="Three Pricing Principles for the Freedom Festival"
              content={
                <div className="space-y-3 pt-1">
                  <p>
                    <strong>1. Set your event floor before your event price:</strong>{" "}
                    Your floor during the Freedom Festival must account for elevated advertising costs. Event ACoS is typically 20 to 40% higher than normal — which means your cost per unit is higher during the sale than outside it. Recalculate your floor using event ACoS estimates, not your normal monthly average.
                  </p>
                  <p>
                    <strong>2. Decide your discount before competitors move, not in response to them:</strong>{" "}
                    If you plan to run a ₹100 coupon, set it before the sale opens. Making pricing decisions reactively during a sale is the fastest route to margin erosion.
                  </p>
                  <p>
                    <strong>3. Not every product needs a deep discount:</strong>{" "}
                    Products with strong reviews and listing quality often see conversion improve during a sale simply from the increased traffic — without any price change.
                  </p>
                </div>
              }
            />

            <div id="s5">
              <SectionQA
                title="How Wide Is the Gap Between Sellers Who Prepare and Sellers Who Don't?"
                paragraph1="Every Freedom Festival produces the same distribution of seller outcomes. The top quartile — sellers who entered with price floors, optimised listings, stocked FBA, and real-time monitoring — consistently outperforms the bottom quartile not just on revenue, but on margin and on post-event rank position."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={freedomComparisonColumns}
              rows={freedomComparisonRows}
            />

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="⚠️ Inventory Planning — The Two Disasters to Avoid"
              content={
                <div className="space-y-3 pt-1">
                  <p>
                    <strong>• Stockout (Days 3–5):</strong> The Freedom Festival drives 3 to 5x normal daily sales velocity. Calculate your event quantity as daily velocity × event multiplier × 8 days, plus 20% buffer. A rank drop from a stockout during a major sale takes 4 to 8 weeks to recover.
                  </p>
                  <p>
                    <strong>• Overstock (post-sale):</strong> Excess FBA units after the event sit in storage at peak rates in September — right as you need to stock for Big Billion Days. Calculate on your 75th percentile forecast, not your optimistic one.
                  </p>
                </div>
              }
            />

            <FeatureCTA
              title="Get your Amazon India listings ready for the Great Freedom Festival before August 8"
              description="Insydz tracks competitor prices, monitors review clusters, and alerts you in real time via WhatsApp. Free to start — no credit card, no trial expiry."
              buttonText="Prepare Free on Insydz →"
              buttonHref="/login"
              backgroundColor="#0C1A27"
              buttonColor="#16A34A"
            />

            <div id="s6">
              <SectionQA
                title="What Happens to Listing Quality During a High-Traffic Sale Event?"
                paragraph1="A sale event amplifies whatever your listing already is. A well-optimised listing converts significantly better during a sale than outside it — the traffic increase compounds the conversion rate improvement. An unoptimised listing with an unresolved complaint cluster converts poorly even with 3x the normal traffic. And critically: a listing entering a sale event with an unresolved quality complaint generates 3x the normal number of negative reviews per week, because it is receiving 3x the normal traffic."
                paragraph2="Run through four checks before July 21. Changes made after July 25 may not index fully before August 8."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="Listing Readiness — Four Checks Before July 21"
              content={
                <div className="space-y-3 pt-1">
                  <p>
                    <strong>• Images:</strong> Hero image clear on white background, at least 5 images uploaded, secondary images showing product in use and dimensions. Listings with fewer than 5 images convert 18% worse in our data.
                  </p>
                  <p>
                    <strong>• Title and bullets:</strong> Primary keyword in first 5 words of title, key features in first 3 bullets, buyer language used — phrases from your positive reviews, not internal product specs.
                  </p>
                  <p>
                    <strong>• A-plus content:</strong> Live and addressing the top 2 complaint themes from your review analysis. A-plus content improves conversion 8 to 12% on average — the highest-ROI listing investment before a sale.
                  </p>
                  <p>
                    <strong>• Review score and trend:</strong> 4.0 stars or above — below 4.0, conversion drops sharply during event traffic. No open complaint clusters from the last 60 days.
                  </p>
                </div>
              }
            />

            {/* Blog Image Section */}
            <BlogImageSection
              imageSrc="/Blog_32_image1.png"
              altText="Amazon Freedom Festival 2026 Seller Preparation"
              caption="Insydz review alert on Day 3 of the Freedom Festival for a seller who had an unresolved lid seal complaint going into the event. Normal week: 3 one-star reviews. Freedom Festival: 18 in 72 hours. The complaint was visible in the pre-sale review analysis 3 weeks earlier. Fixing it before August 8 would have prevented 15 of these 18 reviews."
            />

            <div id="s7">
              <SectionQA
                title="What Happens When You Don't Set Up Real-Time Monitoring Before the Sale?"
                paragraph1="The structural problem with checking Seller Central manually once a day during a sale event is that it is always retrospective. A competitor drops their price at 7 PM on August 9. If you find out at 9 AM on August 10 when you open your dashboard, you have lost 14 hours of Buy Box during the highest-traffic period of the year. You have also lost the information advantage that would have told you whether to hold or match."
                paragraph2="Real-time monitoring through Insydz changes the timeline. Your top competitor ASINs are tracked continuously. A WhatsApp alert fires within minutes of a price change. You receive the price, the Buy Box impact, and the competitor's current listing quality alongside it — so you can make the hold vs match decision the same hour, not the next morning."
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* Blog Image Section */}
            <BlogImageSection
              imageSrc="/Blog_32_image2.png"
              altText="Amazon Freedom Festival 2026 Seller Preparation"
              caption="Insydz post-event rank tracker for a tiffin box seller. The Freedom Festival drove sales velocity that moved rank from #8 to #3 and #14 to #6 for primary keywords. By maintaining 60% of event sales velocity for 7 days post-sale through targeted PPC, the seller locked in those positions before Amazon's algorithm reverted them."
            />

            <div id="s8">
              <SectionQA
                title="How Do You Build These Habits Without Spending Hours in Seller Central?"
                paragraph1="The preparation and monitoring work described in this guide does not require hours in Seller Central every day. It requires the right tools set up once, with alerts configured so the information comes to you — not the other way around."
                resolvedTheme={resolvedTheme}
              />
              <InsightCards cards={freedomHabitCards} columns={3} />
            </div>

            <div id="s9">
              <SectionQA
                title="Frequently Asked Questions: Amazon Great Freedom Festival 2026"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#16A34A" faqs={freedomFaqs} />

            <RelatedReadingBox
              label="📌 Related Reading on Insydz"
              accentColor="#16A34A"
              darkAccentColor="#4ADE80"
              backgroundColor="#E7F1EB"
              darkBackgroundColor="#0b1c13"
              resolvedTheme={resolvedTheme}
              links={[
                {
                  text: "Amazon Repricing Strategy 2026: Stop Losing the Buy Box",
                  href: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
                },
                {
                  text: "Amazon India Price Wars: Compete Without Losing Margin",
                  href: "/resources/expert-blog/amazon-india-price-war-strategy",
                },
                {
                  text: "Amazon Listing Hijackers India: Detect & Remove Fast",
                  href: "/resources/expert-blog/amazon-listing-hijacker-india",
                },
                {
                  text: "5 Habits of Top 10% Amazon India Sellers",
                  href: "/resources/expert-blog/top-amazon-india-sellers-habits",
                },
                {
                  text: "Amazon Prime Day India 2026: Every Question Answered",
                  href: "/resources/expert-blog/prime-day-india-2026-seller-questions",
                },
              ]}
            />

            {/* More Related Articles */}
            <RelatedArticles
              title="More Festive & Pricing Intelligence"
              cards={freedomRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Prepare Your Amazon & Flipkart Listings for Freedom Festival 2026"
        description="Insydz monitors competitor prices in real time, tracks review sentiment, and sends WhatsApp alerts before Buy Box shifts happen. Prepare your listings free."
        primaryButtonText="Start Free Preparation →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#16A34A"
        secondaryColor="#4ADE80"
        stats={[
          {
            value: "2.8x",
            label: "Average sales increase for prepared sellers",
          },
          { value: "30 Days", label: "Prep timeline playbook" },
          { value: "5,000+", label: "Indian sellers using Insydz" },
          { value: "Free", label: "To start" },
        ]}
      />
    </div>
  );
}
