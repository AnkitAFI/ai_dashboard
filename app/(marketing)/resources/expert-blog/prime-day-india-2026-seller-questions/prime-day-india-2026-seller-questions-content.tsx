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
const schemaPrimeDayIndia2026 = {
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
        "https://insydz.com/resources/expert-blog/amazon-prime-day-india-2026-seller-questions",
      url: "https://insydz.com/resources/expert-blog/amazon-prime-day-india-2026-seller-questions",
      name: "Amazon Prime Day India 2026: Every Question Indian Sellers Are Asking Right Now, All Answered",
      description:
        "Every question Indian Amazon sellers are asking about Prime Day 2026 answered in one place. Prep your store before it is too late.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/amazon-prime-day-india-2026-seller-questions#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-prime-day-india-2026-seller-questions#breadcrumb",
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
          name: "Prime Day India 2026 Seller Questions",
          item: "https://insydz.com/resources/expert-blog/amazon-prime-day-india-2026-seller-questions",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-prime-day-india-2026-seller-questions#article",
      headline:
        "Amazon Prime Day India 2026: Every Question Indian Sellers Are Asking Right Now, All Answered",
      image:
        "https://insydz.com/prime-day-india-2026-seller-questions_blogbanner.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-07-14",
      dateModified: "2026-07-14",
      keywords: [
        "amazon prime day india 2026 seller preparation questions",
        "prime day seller checklist india 2026",
        "how to prepare for prime day amazon india",
        "prime day listing optimization india 2026",
        "prime day stock preparation amazon india",
      ],
      articleSection: "Prime Day Strategy",
      inLanguage: "en-IN",
      wordCount: 3400,
      timeRequired: "PT13M",
    },
  ],
};

// ── Key takeaways ────────────────────────────────────────────────────────────
const primeDayKeyTakeaways = [
  "Amazon does not confirm Prime Day dates until 2 to 4 weeks before the event. Start your 6-week prep calendar now based on the expected July window rather than waiting for confirmation.",
  "Lightning Deal submission windows close 2 weeks before Prime Day for most categories. If you have not submitted yet, move to coupon and Prime Exclusive Discount strategy instead.",
  "The inventory formula: average daily sales × 3 (sale multiplier) × 7 (safety days). Adjust the multiplier based on your category's Prime Day history.",
  "Do not lower your price in the 30 days before Prime Day. Reference price is calculated from this window. Lowering early reduces the displayed discount percentage on your deal.",
  "Insydz sends WhatsApp alerts when a competitor drops below your price floor. During Prime Day, Buy Box can shift multiple times per hour. Set your floor before the event starts.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const primeDayTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "Q1: When Is Prime Day 2026?" },
  { id: "s3", label: "Q2: Lightning Deal Submission" },
  { id: "s4", label: "Q3: Inventory to Stock" },
  { id: "s5", label: "Q4: Raise or Lower Price?" },
  { id: "s6", label: "Q5: Competitor Price Moves" },
  { id: "s7", label: "Q6: PPC Budget Strategy" },
  { id: "s8", label: "Q7: Non-Prime Listings" },
  { id: "s9", label: "Q8: 2-Week Prep Checklist" },
  { id: "s10", label: "FAQs" },
];

// ── PPC steps (Q6) ────────────────────────────────────────────────────────────
const primeDayPPCSteps = [
  {
    title: "2 to 3 weeks before: Increase budget and load keywords",
    description:
      "Raise your daily budgets by 50 to 100 percent and ensure your target keywords are in active campaigns. Build keyword history and impression share while cost per click is still normal.",
  },
  {
    title: "During Prime Day: Monitor ACoS closely, do not overbid",
    description:
      "Keyword bids spike sharply during Prime Day as every seller competes for the same terms. Organic conversion is high. Set a maximum ACoS threshold and pause campaigns that breach it. Do not raise bids simply because you see more traffic.",
  },
  {
    title: "3 to 7 days after: Sustain moderate spend",
    description:
      "Post-Prime Day browse traffic is real. Many buyers see products during the sale but purchase in the days following. Maintain 70 to 80 percent of your Prime Day budget for the week after. Bids return to normal quickly, making this period more cost-efficient.",
  },
];

// ── 2-week prep checklist (Q8) ─────────────────────────────────────────────────
const primeDayChecklistItems = [
  {
    title: "Audit your main image for Prime Day search context",
    description:
      "Your product will appear alongside deal badges and discount callouts. A main image that looks low quality next to Prime Deal badged competitors loses the click before the buyer reads your listing. Ensure white background, product fills the frame, and the angle matches what buyers are searching for.",
  },
  {
    title: "Update your title with Prime Day intent keywords",
    description:
      'Check Search Query Performance in Seller Central for your top 5 converting search terms and ensure all appear in your title and bullets. Add category-specific buying terms your customers search during sale events such as "best deal" or "2026 edition."',
  },
  {
    title: "Apply a coupon visible in search results",
    description:
      "Even a 5 to 10 percent coupon creates a green badge in search results. During Prime Day, buyers actively filter by coupons and deals. A coupon badge increases click-through rate from organic search, especially for non-Prime eligible products that cannot appear in Lightning Deal sections.",
  },
  {
    title: "Ensure A+ Content is live and complete",
    description:
      "A+ Content increases conversion rate by 3 to 10 percent on average. If your A+ Content is in draft or incomplete, publishing 2 weeks before Prime Day gives it sufficient time to index. Prioritise the brand story module and comparison chart if you have multiple SKUs.",
  },
  {
    title: "Respond to all negative reviews from the last 90 days",
    description:
      "Buyers read recent negative reviews before purchasing on Prime Day. A seller who has responded thoughtfully to criticism signals reliability. This does not remove the review but changes the impression a browsing buyer forms when comparing your listing to a competitor.",
  },
  {
    title: "Load Sponsored Products with Prime Day intent keywords",
    description:
      "Add deal-intent and category-plus-event keywords to your Sponsored Products campaigns 2 weeks out. These need impression history to perform well during the event window. Campaigns with no prior history on a keyword underperform during Prime Day versus established keyword histories.",
  },
  {
    title: "Set up real time competitor price monitoring before the event",
    description:
      "This is the most overlooked item on most sellers' checklists. Configure Insydz to monitor your top 3 to 5 competitor ASINs and set WhatsApp alerts for price drops below your floor. Do this now, not on Prime Day morning when you have 40 other things to manage simultaneously.",
  },
];

// ── Table 1: Lightning Deal eligibility ──────────────────────────────────────
const primeDayTable1Columns: TableColumn[] = [
  {
    key: "requirement",
    label: "REQUIREMENT",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "threshold",
    label: "MINIMUM THRESHOLD",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "notes",
    label: "NOTES",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
];

const primeDayTable1Rows: TableRow[] = [
  {
    requirement: "Star rating",
    threshold: "3.0 stars or higher",
    notes: "Based on ASIN-level rating, not account overall",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    requirement: {
      value: "Deal discount",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    threshold: "15% below reference price",
    notes: "Reference price = 30-day prior avg; do not lower early",
  },
  {
    requirement: "Inventory available",
    threshold: "Sufficient to meet deal demand",
    notes: "Amazon estimates this; low stock = ineligible",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    requirement: {
      value: "Fulfilment method",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    threshold: "FBA preferred",
    notes: "FBM ASINs are rarely surfaced for Lightning Deals",
  },
  {
    requirement: "Submission deadline",
    threshold: "2 weeks before Prime Day",
    notes: "Category-specific; check Seller Central deals tab",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    requirement: {
      value: "Account health",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    threshold: "Good standing",
    notes: "Policy violations can exclude ASINs from deal slots",
  },
];

// ── Table 2: Inventory formula ────────────────────────────────────────────────
const primeDayTable2Columns: TableColumn[] = [
  {
    key: "input",
    label: "INPUT",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "example",
    label: "EXAMPLE (10 SALES/DAY AVERAGE)",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
  {
    key: "yourCalc",
    label: "YOUR CALCULATION",
    headerClassName: "bg-gradient-to-r from-[#0D1B2A] to-[#162032] text-white",
  },
];

const primeDayTable2Rows: TableRow[] = [
  {
    input: "Average daily sales (last 30 days)",
    example: "10 units/day",
    yourCalc: "___",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    input: {
      value: "Sale multiplier",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    example: "× 3 (conservative) to × 5 (high-traffic category)",
    yourCalc: "× ___",
  },
  {
    input: "Safety days",
    example: "× 7",
    yourCalc: "× 7",
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    input: {
      value: "Total units needed at FBA",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    example: { value: "210 units minimum", className: "font-semibold" },
    yourCalc: { value: "= ___", className: "font-semibold text-[#16A34A]" },
  },
  {
    input: "Inventory send deadline",
    example: "3 to 4 weeks before Prime Day",
    yourCalc: "By ___",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const primeDayFaqs = [
  {
    q: "When is Amazon Prime Day 2026 in India officially?",
    a: "Amazon typically announces Prime Day dates 2 to 4 weeks before the event via Seller Central and email. The event is expected in July 2026 for a 48-hour window. Do not wait for the official announcement to begin preparation as every critical deadline falls 4 to 6 weeks before the event.",
  },
  {
    q: "What happens if I run out of FBA inventory during Prime Day?",
    a: "Running out of inventory means your listing goes out of stock, stops appearing in search results, all active deals are cancelled, and you miss the highest-traffic hours of the year. There is no way to replenish FBA stock during the event. This is why the inventory formula and the send deadline are the two most critical Prime Day preparations.",
  },
  {
    q: "Can a new seller with under 10 reviews participate in Prime Day?",
    a: "Yes. New sellers with under 10 reviews cannot submit Lightning Deals but can still participate through coupons, Prime Exclusive Discounts, and PPC campaigns. Prime Day traffic benefits all active listings. A new listing at a competitive price with a coupon will see meaningfully higher impressions during the event even without a Lightning Deal badge.",
  },
  {
    q: "How do I handle a competitor who keeps undercutting me during Prime Day?",
    a: "Set a price floor in Insydz below which you will not go, and use WhatsApp alerts to get notified within minutes of a competitor dropping below your threshold. Do not engage in a price war without a floor. Race-to-the-bottom repricing during Prime Day destroys margins on the highest-volume hours of your year. Protect your floor and accept that some Buy Box windows will go to an undercutting competitor while you hold margin.",
  },
  {
    q: "Should I pause PPC campaigns during Prime Day to save budget?",
    a: "Do not pause campaigns, but do set an ACoS ceiling per campaign. Pausing entirely loses impression share to competitors who are actively bidding. Instead, increase budgets to prevent campaign exhaustion, monitor ACoS hourly, and pause only specific keyword campaigns that breach your threshold. Keep broad and category campaigns running throughout the event.",
  },
  {
    q: "What is the difference between a Lightning Deal and a Prime Exclusive Discount?",
    a: "A Lightning Deal is a time-limited offer (4 to 12 hours) that appears in the Deals section with a countdown timer and a limited-quantity progress bar. It requires approval through Seller Central's Deals tab. A Prime Exclusive Discount is a permanent discount for Prime members, shown as a strike-through price and badge throughout the event. Lightning Deals have higher visibility but are harder to qualify for and have limited deal slots per category.",
  },
];

const primeDayRelatedCards = [
  {
    tag: "Competitor Intelligence",
    title: "Competitor Undercutting Your Amazon India Price? Act Within 1 Hour",
    route: "/resources/expert-blog/competitor-undercutting-amazon-india",
    image: "/Competitor Undercutting Your Amazon India Price_1.png",
  },
  {
    tag: "Review Strategy",
    title: "Amazon Vine Program India 2026: Cost, Worth and How to Enrol",
    route: "/resources/expert-blog/amazon-vine-program-india-2026",
    image: "/Amazon Vine Program India 2026.png",
  },
  {
    tag: "Keyword Intelligence",
    title: "How to Find Every Keyword Your Amazon India Competitor Ranks For",
    route: "/resources/expert-blog/find-competitor-keywords-amazon-india",
    image: "/image_1691x942.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function PrimeDayIndia2026SellerQuestionsContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const id = "insydz-prime-day-india-2026-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaPrimeDayIndia2026);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = primeDayTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(primeDayTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(primeDayTOC[i].id);
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

        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#F97316;background:#FFF7ED;border-left-color:#FDBA74}
        .toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(249,115,22,.1);color:#FB923C;border-left-color:rgba(249,115,22,.4)}
        .dark .toc-link.active{background:rgba(249,115,22,.15);color:#FB923C;border-left-color:#F97316}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9,#s10{scroll-margin-top:120px}

        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        /* metrics grid */
        .metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0 28px}
        .metric-card{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px 20px}
        .dark .metric-card{background:#111827;border-color:#1f2937}
        .mc-num{display:block;font-size:26px;font-weight:800;color:#F97316;line-height:1;margin-bottom:6px;font-family:'Sora',sans-serif}
        .mc-lbl{display:block;font-size:13px;color:#64748B;line-height:1.5;font-family:'Sora',sans-serif}
        .dark .mc-lbl{color:#9ca3af}
        .mc-sub{display:block;font-size:11.5px;color:#94A3B8;margin-top:3px;font-family:'Sora',sans-serif}
        @media(max-width:580px){.metrics{grid-template-columns:1fr}}

        .final-cta-block{background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);padding:clamp(48px,8vw,40px) 20px;text-align:center;margin:60px 0 0}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Prime Day India 2026: Seller Questions Answered" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Tools · Prime Day · New Seller Entry"
        title={
          <>
            <span style={{ color: "#F97316" }}>
              Amazon Prime Day India 2026:
            </span>{" "}
            Every Question Indian Sellers Are Asking Right Now, All Answered
          </>
        }
        description={
          <>
            Every question Indian Amazon sellers are asking about Prime Day 2026
            answered in one place: the inventory formula, Lightning Deal
            submission steps, PPC strategy, pricing timing, and a full 2-week
            prep checklist, written in the language of the questions sellers are
            actually asking right now.
          </>
        }
        authorName="Insydz Research Team"
        authorUrl="/resources/expert-blog"
        publishDate="July 2026"
        readTime="13 min read"
        bgColor={{ light: "#FFF7ED", dark: "#1c0900" }}
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
              num: "2–4 wks",
              lbl: "notice Amazon gives sellers before Prime Day dates are officially confirmed each year",
            },
            {
              num: "3–4 wks",
              lbl: "minimum FBA lead time to send inventory before Prime Day and clear inbound processing",
            },
            {
              num: "3x",
              lbl: "recommended sale multiplier in the Prime Day inventory formula for most competitive categories",
            },
            {
              num: "15%+",
              lbl: "minimum discount below reference price required to submit a Lightning Deal on Amazon India",
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
          title="IF YOU SEARCHED ANY OF THESE THIS WEEK"
          content={`"How much inventory should I stock for Prime Day?" · "When do Lightning Deal slots close?" · "Should I run PPC during Prime Day?" · "Will a competitor undercut me during Prime Day?" · "When should I lower my price?" This article has direct answers to all of these, written in the language of Amazon Seller Central India forum threads where these questions actually live.`}
        />

        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/prime-day-india-2026-seller-questions.png"
          altText="Amazon Prime Day India 2026 Seller Questions"
          caption="Prime Day preparation status tracker in Insydz. With 18 days remaining, Lightning Deal submission deadlines have passed for most categories. The two most critical remaining tasks are competitor price monitoring setup and PPC budget loading."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways Before You Read"
              items={primeDayKeyTakeaways}
              accentColor="#F97316"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={primeDayTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={primeDayTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="Q1: When Is Amazon Prime Day India 2026 and How Much Notice Will Sellers Get?"
                paragraph1="Prime Day 2026 in India is expected in July 2026, running for approximately 48 hours. Amazon typically announces official dates 2 to 4 weeks before the event via Seller Central notifications, email to registered sellers, and the Amazon India Seller Blog."
                paragraph2="That short confirmation window is the core problem. Inventory decisions, Lightning Deal submissions, PPC budget loading, and listing optimisation all need to be completed 4 to 6 weeks before Prime Day. Waiting for the official announcement to start preparation means missing every critical deadline."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="What to Do Right Now"
              content="Set your internal Prime Day preparation start date to 6 weeks before the expected July window. Check Seller Central under Events and Deals for your category's deal submission deadline, which is typically 2 weeks before the event and does not wait for the official date announcement."
            />

            <div id="s3">
              <SectionQA
                title="Q2: How Do I Submit My Product for a Lightning Deal on Amazon India Prime Day?"
                paragraph1="Lightning Deals are submitted through Seller Central under Advertising, then Deals. Not all ASINs are eligible. Amazon surfaces eligible products in this section automatically with a suggested deal price and a submission deadline. If your ASIN does not appear, it does not meet the eligibility criteria for this event window."
                paragraph2="To qualify, your ASIN generally needs a minimum 3-star average rating, sufficient FBA inventory, a deal price at least 15 percent below the reference price, and a healthy account standing. Amazon also considers your category's competition level when allocating deal slots."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={primeDayTable1Columns}
              rows={primeDayTable1Rows}
            />

            <InfoBanner
              accentColor="#0D9488"
              backgroundColor="#F0FDFA"
              title="If the Lightning Deal Window Has Closed"
              content="Move to a Prime Exclusive Discount or a coupon. Prime Exclusive Discounts show a strike-through price and badge visible to Prime members across search and product pages. Coupons show a green badge in search results and appear in the coupon filter. Both are still effective for capturing Prime Day traffic without needing a Lightning Deal slot."
            />

            <div id="s4">
              <SectionQA
                title="Q3: How Much Extra Inventory Should I Stock for Prime Day India 2026?"
                paragraph1="Use this formula as your baseline: Average Daily Sales × Sale Multiplier × Safety Days. For Prime Day, most competitive categories use a 3x sale multiplier and a 7-day safety buffer. That covers the 48-hour event plus post-event browse traffic that continues for 3 to 4 days after the sale ends."
                paragraph2="Pull your average daily sales from the last 30 days in Seller Central Business Reports. Multiply by 3. Multiply again by 7. This is the total units you need in Amazon warehouses before Prime Day starts. Send this inventory at least 3 to 4 weeks before the event to allow for inbound processing time."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={primeDayTable2Columns}
              rows={primeDayTable2Rows}
            />

            <InfoBanner
              accentColor="#4F46E5"
              backgroundColor="#EEF2FF"
              title="First Prime Day? Start at 2x, Not 3x"
              content="If this is your first Prime Day with an ASIN, use a 2x multiplier, not 3x or 5x. Overstock risks FBA storage fees if demand does not meet projections. Build up to higher multipliers with actual Prime Day sell-through data from your second event onward."
            />

            <BlogImageSection
              imageSrc="/amazon-prime-day-india-2026-seller-questions-image1.png"
              altText="Amazon Prime Day India 2026 Seller Questions"
              caption="Insydz real time price monitoring during Prime Day. Two competitors dropped price but the seller's floor held, Buy Box was retained, and the WhatsApp alert was delivered within 4 minutes. In a manual monitoring workflow this shift would not have been visible for hours."
            />

            <div id="s5">
              <SectionQA
                title="Q4: Should I Raise or Lower My Price Before Prime Day?"
                paragraph1="Do not lower your price in the 30 days before Prime Day. Amazon calculates the reference price used to display deal discounts from your selling history in the preceding 30 days. If you lower your price early, the reference price falls, which means your Prime Day discount percentage drops even if you offer the same deal price on the day."
                paragraph2="The correct strategy: hold your current price or raise it slightly in the 30 days before Prime Day, then apply your discount on the event day itself. This maximises the displayed percentage discount on your Lightning Deal, Prime Exclusive Discount, or coupon."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#DC2626"
              backgroundColor="#FEF2F2"
              title="The Most Common Pre-Prime Day Pricing Mistake"
              content="A seller who drops from ₹649 to ₹549 three weeks before Prime Day to 'stay competitive' has now set their 30-day reference price at ₹549. Their Prime Day deal at ₹479 shows only a 13 percent discount. Had they held ₹649, the same ₹479 deal would show 26 percent off. Same price. Worse outcome."
            />

            <div id="s6">
              <SectionQA
                title="Q5: How Do Competitor Price Moves During Prime Day Affect My Buy Box?"
                paragraph1="During Prime Day, competitors reprice aggressively and frequently. Unlike normal trading days where price changes happen 3 to 7 times per week, Prime Day can see multiple repricing events per hour across your competitive set. Buy Box can shift between sellers multiple times within a single hour-long traffic window."
                paragraph2="The window in which you hold the Buy Box during peak Prime Day hours is directly proportional to your revenue from the event. A seller who loses Buy Box for 4 hours during Day 1 peak traffic misses a disproportionate share of the event's total sales volume."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="How Insydz Helps During Prime Day"
              content="Insydz monitors competitor prices in real time and sends WhatsApp alerts within minutes of a price change that puts your Buy Box at risk. You set a price floor (the minimum you will not go below), and Insydz alerts you when a competitor drops below that threshold. You can respond within minutes rather than hours. Set this up before Prime Day starts, not during it."
            />

            <FeatureCTA
              title="Insydz monitors competitor pricing during Prime Day in real time and sends WhatsApp alerts"
              description="Set your price floor, get alerted within minutes of a Buy Box threat. Set it up free before Prime Day."
              buttonText="Set It Up Free Before Prime Day →"
              buttonHref="/login"
              backgroundColor="#0D1B2A"
              buttonColor="#F97316"
            />

            <div id="s7">
              <SectionQA
                title="Q6: Should I Increase PPC Budget Before, During, or After Prime Day?"
                paragraph1="PPC strategy around Prime Day is counterintuitive. Most sellers assume they should pour budget into ads during the event. The nuance is that organic conversion is significantly higher during Prime Day because buyers arrive in a purchase-intent state. Overpaying for clicks via inflated bids during peak hours reduces your overall return on ad spend."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={primeDayPPCSteps}
              numberColor="#F97316"
              backgroundColor="#F8FAFC"
              borderColor="#FFD8B0"
            />

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="Budget Loading Tip"
              content="Sponsored Products campaigns can run out of daily budget within the first hours of Prime Day. Set your Prime Day campaign budgets to 3x your normal daily cap and monitor hourly spend in Campaign Manager. A campaign that exhausts its budget at 9 AM misses the highest-traffic hours of the day."
            />

            <div id="s8">
              <SectionQA
                title="Q7: My Product Is Not Prime Eligible. Can I Still Benefit From Prime Day Traffic?"
                paragraph1="Yes. Non-Prime products still appear in standard search results during Prime Day. The platform sees a significant overall traffic lift, not just within Prime-exclusive deal sections. A well-positioned non-Prime listing at a competitive price with an active coupon will still see higher than average impressions and orders during the event."
                paragraph2="The practical difference is that you will not appear in deal filter results or badge-heavy browse sections. Compensate with maximum PPC visibility, competitive pricing, and a visible coupon badge in search results."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#0D9488"
              backgroundColor="#F0FDFA"
              title="Non-Prime Listing Checklist for Prime Day"
              content="Apply a coupon of 5 to 10 percent to get a green badge visible in search results, price competitively against Prime-eligible competitors without going below your floor, run Sponsored Products on your 3 to 5 highest-converting keywords, ensure your main image quality matches Prime-badged competitors it appears alongside, and monitor Buy Box status every few hours if your category is price-sensitive."
            />

            <BlogImageSection
              imageSrc="/amazon-prime-day-india-2026-seller-questions-image2.png"
              altText="Amazon Prime Day India 2026 Seller Questions"
              caption="A 2-week pre-Prime Day listing health check in Insydz. Four preparation items are complete. The outstanding item is competitor price monitoring via WhatsApp alerts, which needs to be configured before Prime Day starts, not during it."
            />

            <div id="s9">
              <SectionQA
                title="Q8: What Should I Do in the 2 Weeks Before Prime Day to Prepare My Listing?"
                paragraph1="The 2 weeks before Prime Day are the last window for listing changes to index and take effect. Anything changed the day before or on the day itself is unlikely to influence search ranking for the event."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={primeDayChecklistItems}
              variant="icon"
              icon="✓"
              numberColor="#16A34A"
              backgroundColor="#F8FAFC"
              borderColor="#BBF7D0"
            />

            <InfoBanner
              accentColor="#4F46E5"
              backgroundColor="#EEF2FF"
              title="Prime Day Preparation Checklist: Printable Summary"
              content="(1) Main image audit and update. (2) Title keyword update for sale intent. (3) Coupon applied and showing in search. (4) A+ Content live. (5) Negative reviews from last 90 days responded to. (6) Sponsored Products loaded with event keywords. (7) Competitor price monitoring active with WhatsApp alerts set to your price floor. Complete all 7 at least 10 days before Prime Day."
            />

            <div id="s10">
              <SectionQA
                title="Frequently Asked Questions: Amazon Prime Day India 2026"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#F97316" faqs={primeDayFaqs} />

            {/* More on Prime Day Strategy */}
            <RelatedArticles
              title="More on Prime Day Strategy"
              cards={primeDayRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Your Competitor's Prime Day Price Drop Is Coming. Will You Know About It in Time?"
        description="Insydz monitors competitor prices in real time and sends WhatsApp alerts within minutes. Set your price floor once, get alerted throughout Prime Day. Free to start before the event."
        primaryButtonText="Set Up Free Before Prime Day →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#F97316"
        secondaryColor="#FB923C"
        stats={[
          { value: "2–4 wks", label: "Official date notice" },
          { value: "3x", label: "Inventory sale multiplier" },
          { value: "15%+", label: "Lightning Deal min. discount" },
          { value: "₹2,499", label: "Per month, full access" },
        ]}
      />
    </div>
  );
}
