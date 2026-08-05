"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import Breadcrumb from "../components/Breadcrumb";
import HeroSection from "../components/HeroSection";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import SectionQA from "../components/SectionQA";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import NumberedCards from "../components/NumberedCards";
import FeatureCTA from "../components/FeatureCTA";
import FAQ from "../components/FAQ";
import RelatedArticles from "../components/RelatedArticles";
import FinalCTA from "../components/FinalCTA";
import BlogImageSection from "../components/BlogImageSection";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";

export const dynamic = "force-static";

// ── Inline link helper (used only where a hyperlink sits inside body copy) ────
const InLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        router.push(to);
        window.scrollTo(0, 0);
      }}
      style={{
        color: "#ea580c",
        textDecoration: "underline",
        textDecorationColor: "rgba(249, 115, 22, 0.3)",
        textUnderlineOffset: "3px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </a>
  );
};

// ── TOC ───────────────────────────────────────────────────────────────────────
const TOC = [
  { id: "s1", label: "What Does Page 1 Ranking Mean?" },
  { id: "s2", label: "Why Page 1 Matters More Than You Think" },
  { id: "s3", label: "How the A9 Algorithm Works" },
  { id: "s4", label: "6 Core Ranking Factors Explained" },
  { id: "s5", label: "5 Critical Mistakes to Avoid" },
  { id: "s6", label: "4-Phase Page 1 Execution Plan" },
  { id: "s7", label: "Best Tools for Indian Sellers" },
  { id: "s8", label: "Key Takeaways" },
  { id: "s9", label: "FAQ" },
];

// ── Key Takeaways ─────────────────────────────────────────────────────────────
const keyTakeaways = [
  "Page 1 of Amazon.in captures over 70% of all buyer clicks for any search term — the revenue difference between page 1 and page 3 for the same keyword can be 10x, with zero difference in ad spend.",
  "Amazon's A9 algorithm is a two-stage filter: first relevance (keyword indexing), then performance (CVR, velocity, CTR). You must win both stages — optimising only one is not enough.",
  "Your product title carries the highest SEO weight on Amazon.in. Primary keywords must appear in the first 80 characters — marketing language belongs in bullet points, not the title.",
  "Backend search terms (250 bytes in Seller Central) are a major untapped opportunity for most Indian sellers — fill them with non-duplicate keywords, Hinglish variations, and long-tail phrases.",
  "Running ads before fixing your listing is the most expensive mistake in Amazon SEO — ads amplify conversion rate, not compensate for it. Optimise listing first, then scale spend.",
  "Weekly keyword rank tracking is non-negotiable for competitive categories. Catching ranking drops early costs a listing update; catching them late costs months of revenue.",
  "India-specific keyword tools matter because Amazon.in search patterns differ significantly from Amazon.com — Hinglish, regional buying intent, and platform-specific search require India-calibrated data.",
];

// ── Ranking factors table (s4) ────────────────────────────────────────────────
const rankingFactorsColumns: TableColumn[] = [
  {
    key: "factor",
    label: "RANKING FACTOR",
    headerClassName: "bg-[#0d1b2a] text-white",
  },
  {
    key: "measures",
    label: "WHAT AMAZON MEASURES",
    headerClassName: "bg-[#0d1b2a] text-white",
  },
  {
    key: "improve",
    label: "HOW TO IMPROVE IT",
    headerClassName: "bg-[#0d1b2a] text-white",
  },
  {
    key: "impact",
    label: "IMPACT LEVEL",
    headerClassName: "bg-[#0d1b2a] text-white",
  },
];

const rankingFactorsRows: TableRow[] = [
  {
    factor: { value: "Product Title", className: "font-semibold" },
    measures: "Keyword relevance in first 80 characters",
    improve: "Lead with primary keyword; add 2–3 attributes",
    impact: {
      type: "chip",
      label: "Critical",
      className: "bg-[#FEF2F2] text-[#DC2626]",
    },
  },
  {
    rowClassName: "bg-[#F8FAFC]",
    factor: { value: "Sales Velocity", className: "font-semibold" },
    measures: "Units sold per day, trend direction",
    improve: "Early-stage ads + deals to build sales history",
    impact: {
      type: "chip",
      label: "Critical",
      className: "bg-[#FEF2F2] text-[#DC2626]",
    },
  },
  {
    factor: { value: "Conversion Rate", className: "font-semibold" },
    measures: "% of listing views that result in purchase",
    improve: "Better images, competitive price, strong reviews",
    impact: {
      type: "chip",
      label: "Critical",
      className: "bg-[#FEF2F2] text-[#DC2626]",
    },
  },
  {
    rowClassName: "bg-[#F8FAFC]",
    factor: { value: "Backend Keywords", className: "font-semibold" },
    measures: "Hidden search terms (250 bytes in Seller Central)",
    improve: "Fill with Hinglish variants, long-tail, synonyms",
    impact: {
      type: "chip",
      label: "High",
      className: "bg-[#FEF3C7] text-[#92400E]",
    },
  },
  {
    factor: { value: "Click-Through Rate", className: "font-semibold" },
    measures: "% of impressions that result in listing visits",
    improve: "Stronger hero image; competitive pricing badge",
    impact: {
      type: "chip",
      label: "High",
      className: "bg-[#FEF3C7] text-[#92400E]",
    },
  },
  {
    rowClassName: "bg-[#F8FAFC]",
    factor: { value: "Bullet Points", className: "font-semibold" },
    measures: "Secondary keyword presence + conversion copy",
    improve: "Lead with buyer benefit, include 1–2 keywords each",
    impact: {
      type: "chip",
      label: "Medium",
      className: "bg-[#DBEAFE] text-[#1E40AF]",
    },
  },
];

// ── 5 mistakes (s5) ───────────────────────────────────────────────────────────
const mistakes = [
  {
    title: "Writing Titles for Yourself, Not the Algorithm",
    description:
      'A seller who titles their product "Premium Quality Handcrafted Copper Water Bottle Eco Friendly and Stylish" has written a marketing headline, not an SEO title. Amazon cannot rank you for "copper water bottle" if the exact phrase doesn\'t appear coherently in your title. The vocabulary buyers use to search and the vocabulary sellers use to describe are often entirely different — and the algorithm sides with buyers, not sellers.',
  },
  {
    title: "Leaving Backend Search Terms Empty or Duplicated",
    description:
      'In Seller Central, the "Search Terms" field gives you 250 bytes of hidden indexing power. A consistent pattern across Indian seller accounts shows 60–70% of sellers either leave this blank or fill it with duplicates already in their title. This is the equivalent of leaving a full-page ad slot blank. Filling it correctly with non-duplicate Hinglish variants, competitor brand names (where permitted), and long-tail phrases can unlock dozens of additional ranking positions with zero visible listing changes.',
  },
  {
    title: "Launching Ads Before Fixing the Listing",
    description:
      "Running Sponsored Products on an unoptimised listing is paying for traffic that won't convert. If your listing has poor images, thin bullet points, or no reviews — ads bring visitors who leave. Amazon's algorithm interprets this low conversion as a signal to reduce your organic ranking further. Fix the listing first, then amplify it with ads. This sequence is not negotiable.",
  },
  {
    title: "Ignoring Long-Tail Keywords Where the Real Intent Lives",
    description:
      'Most Indian sellers compete for 2–3 generic head keywords in their category ("water bottle", "yoga mat", "phone case") where competition is brutal and cost-per-click is high. The smarter play: rank for long-tail variations like "stainless steel water bottle 1 litre office use under ₹400" where buyer intent is specific, competition is low, and conversion rates are dramatically higher. Five page 1 long-tail rankings often deliver more revenue than one contested head keyword.',
  },
  {
    title: "Treating SEO as a One-Time Task",
    description:
      "Sellers who optimise a listing once and never revisit it lose rankings as competitors update their listings, new search trends emerge, and seasonal keywords shift. Category leaders review and update their listings quarterly at minimum and track keyword rankings weekly to catch drops before they compound into sustained revenue losses. Ranking is not a destination; it's a position you defend with data.",
  },
];

// ── Phase 1: Keyword Research items ───────────────────────────────────────────
const phase1Items = [
  {
    title: "Step 1",
    description:
      "Use a keyword research tool to find your primary keyword (highest volume, medium competition), 3–5 secondary keywords (related terms), and 10–15 long-tail keywords (specific, high-intent phrases).",
  },
  {
    title: "Step 2",
    description:
      "Run a competitor reverse ASIN lookup on your top 3 rivals to find keywords they rank for that you don't even have in your listing.",
  },
  {
    title: "Step 3",
    description:
      'Identify seasonal keywords relevant to your category (e.g., "Diwali gift ideas", "monsoon raincoat", "back to school stationery") and plan listing updates 4–6 weeks before the season.',
  },
  {
    title: "Step 4",
    description:
      "Map keywords to their intended placement: primary keyword in title, secondary keywords in bullets, long-tail and Hinglish variants in backend search terms.",
  },
];

// ── Phase 2: Listing Optimisation items ───────────────────────────────────────
const phase2Items = [
  {
    title: "Title",
    description:
      "Brand + Primary Keyword + 2–3 Key Attributes + Size or Variant. Keep under 200 characters. Put the most important keyword in the first 80 characters.",
  },
  {
    title: "Bullet Points",
    description:
      "Address the top 5 buyer questions or objections. Lead each bullet with a benefit, not a feature. Include 1–2 secondary keywords per bullet naturally.",
  },
  {
    title: "Backend Search Terms",
    description:
      "Fill all 250 bytes with non-duplicate, relevant keywords, common misspellings, and Hinglish variations. Do not repeat keywords already in your title.",
  },
  {
    title: "Images",
    description:
      "Minimum 6 images. Main image on white background, product fills 85% of frame. Secondary images: lifestyle, dimensions, feature callouts, use-case scenarios.",
  },
  {
    title: "A+ Content",
    description:
      "If brand-registered, use A+ Content. Include keywords naturally in the narrative text — this is indexed by Amazon and improves CTR with visual storytelling.",
  },
];

// ── Phase 3: Sales Velocity Building items ────────────────────────────────────
const phase3Items = [
  {
    title: "Step 1",
    description:
      "Run a targeted Sponsored Products campaign on your top 5 keywords for the first 2–4 weeks post-optimisation — not to profit, but to signal sales velocity to the A9 algorithm.",
  },
  {
    title: "Step 2",
    description:
      'Use Amazon\'s "Request a Review" button for every order — consistent review velocity helps ranking more than a burst of reviews followed by silence.',
  },
  {
    title: "Step 3",
    description:
      "Consider a launch-period deal or coupon (5–10% off) to boost CTR in search results during the initial ranking push.",
  },
  {
    title: "Step 4",
    description:
      "Monitor your conversion rate daily during this phase — if CVR drops below 8%, revisit bullet points and main image before scaling ad spend.",
  },
];

// ── Phase 4: Tracking and Iteration items ─────────────────────────────────────
const phase4Items = [
  {
    title: "Step 1",
    description:
      "Track your keyword rankings weekly — not just overall BSR. BSR is category-level; keyword rank tells you exactly where you stand for each target term.",
  },
  {
    title: "Step 2",
    description:
      "Monitor CTR and CVR in Seller Central's Brand Analytics — if CTR is low, test a new main image; if CVR is low, revisit bullet points and pricing.",
  },
  {
    title: "Step 3",
    description:
      "Quarterly: full listing audit against your top competitor's listing — where are they stronger? What keywords are they using that you aren't?",
  },
  {
    title: "Step 4",
    description:
      "Set up rank drop alerts (WhatsApp or email) so you know within 24 hours if a key ranking position shifts — early intervention prevents weeks-long ranking recovery.",
  },
];

// ── Global tools (s7) ─────────────────────────────────────────────────────────
const globalToolsItems = [
  {
    title: "Jungle Scout",
    description:
      "Excellent keyword research and rank tracking but database is US-centric. Amazon.in search volumes and Hinglish keyword patterns are significantly underrepresented. Plans start at approximately ₹3,800/month.",
  },
  {
    title: "Helium 10",
    description:
      "Comprehensive suite including Cerebro (reverse ASIN), Magnet (keyword discovery), and Keyword Tracker. Same India data limitations. Plans range from ₹3,300–8,300/month.",
  },
  {
    title: "Platform gap",
    description:
      "Neither tool covers Flipkart keyword intelligence — a significant limitation for Indian sellers running multi-platform businesses.",
  },
];

// ── Insydz feature list (s7) ──────────────────────────────────────────────────
const insydzFeatures = [
  "Keyword research powered by Amazon.in-specific data, including Hinglish variants and India-specific buying intent patterns that global tools miss entirely.",
  "Competitor reverse ASIN analysis — see exactly which keywords your rivals are ranking for, and which gaps you can target first to gain ground.",
  "Daily keyword rank tracking with WhatsApp alerts when you drop positions, so you catch ranking losses within hours, not weeks.",
  'Listing optimisation recommendations in plain language — not just a score, but actionable next steps like "Add this keyword to your title because it has 18,000 monthly searches and your top 3 competitors all use it."',
  "Flipkart keyword intelligence alongside Amazon.in — one tool for both platforms.",
  "Pricing from ₹1999/month with a forever-free plan for sellers starting out.",
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "How long does it take to rank on page 1 of Amazon India?",
    a: "For new listings in moderately competitive categories, well-optimised listings typically reach page 1 for long-tail keywords within 3–6 weeks, and for primary keywords within 6–12 weeks assuming consistent sales velocity and an optimised listing from the start. Highly competitive categories (electronics, fashion, kitchen) may take 12–20 weeks for primary keyword page 1 positions. Long-tail keywords, regardless of category, typically rank faster and are the recommended entry point for sellers newer to SEO.",
  },
  {
    q: "Does lowering my price help me rank higher on Amazon.in?",
    a: "Partially — Amazon factors in price competitiveness, but it's not the dominant ranking signal. Drastically reducing your price to rank faster erodes margin without a proportional ranking benefit. The better lever is improving conversion rate through listing quality — better images, stronger title, more compelling bullet points. A product priced 15% above the category median with a 14% CVR will outrank a product priced at the median with a 7% CVR.",
  },
  {
    q: "What is the most important part of listing optimization tips for Amazon for Indian sellers?",
    a: "The product title and backend search terms together have the highest impact on ranking on Amazon India. The title determines which searches Amazon considers you relevant for — your primary keyword must appear in the first 80 characters. Backend search terms (250 bytes) are the single biggest untapped opportunity for most Indian sellers — the majority leave them blank or populated with duplicates. Filling them correctly with Hinglish variants, long-tail phrases, and competitor brand names (where permitted) can unlock significant additional organic visibility with no visible listing change.",
  },
  {
    q: "How many keywords should I target in my Amazon listing?",
    a: "Focus on 1 primary keyword in your title, 3–5 secondary keywords spread across bullet points, and 10–20 long-tail keywords in your backend search terms. Total keyword count matters less than selection quality — 15 high-intent, accurately-matched keywords will outperform 50 loosely related ones. Keyword stuffing in the title reduces CTR, which feeds back as a negative ranking signal. Aim for natural language in the title with your primary keyword placed prominently in the first 80 characters.",
  },
  {
    q: "Can I rank on page 1 without running paid ads on Amazon India?",
    a: "Yes. But it takes longer. Organic ranking relies on accumulating sales velocity and conversion signals over time. Paid ads accelerate this by driving early sales that signal to the A9 algorithm. For sellers with limited budgets, focus on listing optimisation first, then run a small targeted Sponsored Products campaign on your top 3 keywords once the listing is ready. Organic ranking is more sustainable long-term — once achieved, it costs nothing to maintain compared to the ongoing cost of paid placement.",
  },
];

// ── Related guides ─────────────────────────────────────────────────────────────
const relatedCards = [
  {
    tag: "Marketplace Strategy",
    title: "Amazon vs Flipkart: Which Marketplace is Better in India? (2026)",
    route: "/resources/expert-blog/amazon-vs-flipkart-india-sellers",
    image: "/Amazon vs Flipkart India Sellers.png",
  },
  {
    tag: "Flipkart SEO",
    title:
      "Flipkart Keyword Research Tool & SEO Optimization Guide for Sellers (2026)",
    route: "/resources/expert-blog/flipkart-keyword-research-tool",
    image: "/Flipkart Keyword Research Tool.png",
  },
  {
    tag: "Compare",
    title: "Insydz vs Helium 10: Which Is the Right Tool for Indian Sellers?",
    route: "/compare/insydzvshelium",
    image: "/Insydz-vs-Helium-10.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HowToRankPage1AmazonIndia() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
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
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#2563EB,#60A5FA);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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
        .article-body h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:#2563EB;margin:28px 0 9px}
        .dark .article-body h3{color:#60A5FA}

        .article-body p{margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}

        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#2563EB;background:#EFF6FF;border-left-color:#93C5FD}
        .toc-link.active{color:#2563EB;background:#EFF6FF;border-left-color:#2563EB}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(37,99,235,.1);color:#60A5FA;border-left-color:rgba(37,99,235,.4)}
        .dark .toc-link.active{background:rgba(37,99,235,.15);color:#60A5FA;border-left-color:#2563EB}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9{scroll-margin-top:120px}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}

        .metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0 28px}
        .metric-card{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px 20px}
        .dark .metric-card{background:#111827;border-color:#1f2937}
        .mc-num{display:block;font-size:20px;font-weight:800;color:#2563EB;line-height:1;margin-bottom:6px;font-family:'Sora',sans-serif}
        .mc-lbl{display:block;font-size:13px;color:#64748B;line-height:1.5;font-family:'Sora',sans-serif}
        .dark .mc-lbl{color:#9ca3af}
        @media(max-width:480px){.metrics{grid-template-columns:1fr}}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* <MarketingHeader /> */}

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "How to Rank on Page 1" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Amazon India Ranking Guide"
        title={
          <>
            How to <span style={{ color: "#2563EB" }}>Rank on Page 1 </span>
            of Amazon India: The Complete Guide for Sellers (2026)
          </>
        }
        description={
          <>
            Learn exactly how to rank on page 1 of Amazon India using the A9
            algorithm, keyword optimization &amp; competitor intelligence. An
            actionable 4-phase guide for Indian sellers.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="February 2026"
        readTime="15 min read"
        bgColor={{ light: "#EFF6FF", dark: "#0a1628" }}
        highlightColor="#2563EB"
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
              num: "70%",
              lbl: "of Amazon.in clicks go to page 1 — page 2 gets just 15%",
            },
            {
              num: "10x",
              lbl: "more daily organic sales: page 1 vs page 3 for the same keyword",
            },
            {
              num: "40%",
              lbl: "more active Amazon.in sellers over the past 3 years",
            },
            {
              num: "6–12 wks",
              lbl: "to reach page 1 for primary keywords with optimised listing",
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
                  color: "#2563EB",
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

        {/* Hero image */}
        <BlogImageSection
          imageSrc="/How-to-Rank-on-Page-1.png"
          altText="Insydz Rank Tracker — real-time page 1 ranking positions and AI-powered listing recommendations for Amazon.in sellers"
          caption="Insydz Rank Tracker real-time page 1 ranking positions and AI-powered listing recommendations for Amazon.in sellers"
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 12px 0" }}
        >
          <div id="s8">
            <KeyTakeawaysBox
              title="Key Takeaways for Indian Amazon Sellers"
              items={keyTakeaways}
              accentColor="#2563EB"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={TOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={TOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            {/* ── S1 ───────────────────────────────────────────────────── */}
            <div id="s1">
              <h2>
                What Does Ranking on Page 1 of Amazon India Actually Mean?
              </h2>
            </div>
            <p>
              To{" "}
              <InLink to="/solutions/amazon-sellers">
                rank on page 1 amazon india
              </InLink>{" "}
              means getting your product to appear within the first 16–24
              results when a buyer searches for your category on Amazon.in — the
              prime real estate where 70% of all clicks occur. Sellers who
              occupy this space capture the majority of organic demand without
              paying for every click. Sellers outside it are essentially
              invisible, regardless of product quality or price.
            </p>
            <p>
              The scale of the opportunity is significant: the difference
              between ranking on page 1 vs. page 3 for the same keyword can mean
              a <strong>10x gap in daily organic sales</strong>, with zero
              additional ad spend required once the ranking is established. This
              is compounding leverage — a well-optimised listing earns revenue
              around the clock, unlike a Sponsored Products campaign that stops
              the moment you pause it.
            </p>

            <InfoBanner
              accentColor="#0D9488"
              backgroundColor="#F0FDFA"
              title="In Simple Terms"
              content="Page 1 ranking on Amazon.in means your product shows up first when buyers search for what you're selling. Amazon decides who shows up there based on how relevant your listing is to the buyer's search query and how likely your product is to result in a purchase. Both factors are within your control and this guide explains exactly how to optimise them."
            />

            {/* ── S2 ───────────────────────────────────────────────────── */}
            <div id="s2">
              <SectionQA
                title="Why Ranking on Page 1 of Amazon India Matters More Than You Think"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <h3>The Page 1 Revenue Cliff</h3>
            <p>
              Amazon.in buyer behaviour follows a steep drop-off after the first
              page. Research consistently shows that page 1 captures over 70% of
              all clicks for any given search query. Page 2 gets around 15%.
              Everything after page 2 shares the remaining crumbs. The
              implication for ad spend is equally stark: sellers who rank poorly
              organically compensate by running Sponsored Products campaigns
              continuously — paying ₹8–25 per click for visibility they could
              earn for free with better listing optimisation.
            </p>

            <h3>Indian Buyers Search at Scale and They Search Specifically</h3>
            <p>
              Amazon.in processes hundreds of millions of search queries every
              month across categories from electronics to kirana goods. Indian
              buyers have become increasingly specific in their searches: not
              just "water bottle" but "insulated water bottle for office 1 litre
              steel under 400". These long-tail queries have lower competition
              and higher purchase intent — and a page 1 ranking for even three
              or four of them can meaningfully move your monthly revenue.
            </p>

            <h3>Competition Is Intensifying Every Quarter</h3>
            <p>
              The number of active sellers on Amazon.in has grown 40% over the
              past three years. In most categories, the seller who ranked on
              page 1 two years ago with a basic listing is now being displaced
              by sellers who treat listing optimisation as a systematic, ongoing
              process rather than a one-time setup task. Complacency is the
              fastest route off page 1.
            </p>

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="Real Seller Example — Surat Textile Seller"
              content="A Surat-based textile seller was doing ₹2.4 lakh/month selling cotton bedsheets. After a keyword audit, they identified 11 high-volume keywords their top competitors ranked for that were completely absent from their listing. Within 8 weeks of implementing the changes, organic revenue grew to ₹4.1 lakh/month — a 72% increase with no change in ad spend."
            />

            <InfoBanner
              accentColor="#4F46E5"
              backgroundColor="#EEF2FF"
              title="AI Overview Summary"
              content="Ranking on page 1 of Amazon India requires optimising your product listing for the amazon search algorithm india across four core signals: keyword relevance (title, bullets, backend), sales velocity, conversion rate, and click-through rate. Tools like Insydz provide the India-specific keyword data and daily rank tracking needed to systematically build and maintain page 1 positions on Amazon.in."
            />

            {/* ── S3 ───────────────────────────────────────────────────── */}
            <div id="s3">
              <h2>How Amazon India's A9 Algorithm Actually Works</h2>
            </div>
            <p>
              The{" "}
              <a
                href="https://en.wikipedia.org/wiki/Amazon_(company)#A9"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#ea580c",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Amazon A9 algorithm
              </a>{" "}
              has two jobs: find products relevant to what the buyer searched,
              then rank them by which ones are most likely to result in a
              purchase. Understanding this two-step logic is the key to ranking
              on page 1 of Amazon India — because the algorithm isn't just
              looking at your keywords, it's looking at your entire commercial
              track record.
            </p>

            <BlogImageSection
              imageSrc="/Rank_page_1-Blog4_image2.png"
              altText="Amazon A9 algorithm ranking signals — relevance and performance factors that determine page 1 position on Amazon.in"
              caption="Amazon A9 algorithm ranking signals relative weights that determine your page 1 position on Amazon.in"
            />

            <h3>Step 1 — Relevance: Can Amazon Find Your Product?</h3>
            <p>
              <strong>Keyword Indexing:</strong> Amazon scans your product
              title, bullet points, product description, and backend search
              terms to understand what your product is. If a keyword doesn't
              appear anywhere in your listing, Amazon will not rank you for it
              regardless of how relevant your product actually is. This is why
              keyword research must precede listing writing, not follow it.
            </p>
            <p>
              <strong>Title Weight:</strong> Your product title carries the
              highest SEO weight in the A9 algorithm. The first 80 characters of
              your title are most critical — Amazon prioritises these for
              indexing and they're what buyers see in compressed mobile search
              results. Marketing language like "premium quality" or "best in
              class" wastes these characters without adding ranking value.
            </p>
            <p>
              <strong>Backend Search Terms:</strong> Amazon gives you 250 bytes
              of hidden search terms in Seller Central. These are invisible to
              buyers but fully indexed by the algorithm. Most sellers either
              leave these blank or fill them with duplicate keywords already in
              their title — both are significant missed opportunities.
            </p>

            <h3>Step 2 — Performance: Will Your Product Convert?</h3>
            <p>
              <strong>Sales Velocity:</strong> Amazon tracks how many units you
              sell per day. Higher sales velocity signals a popular, trustworthy
              product and Amazon rewards it with better ranking.
            </p>
            <p>
              <strong>Conversion Rate (CVR):</strong> Of all the buyers who view
              your listing, what percentage actually buy? A product with a 12%
              CVR will outrank a product with a 6% CVR for the same keyword even
              if they have identical titles and backend keywords. CVR is
              improved through better images, stronger bullet points,
              competitive pricing, and social proof from reviews.
            </p>
            <p>
              The A9 algorithm is a feedback loop, not a one-time optimisation.
              Better keywords → more impressions → more clicks → more
              conversions → higher ranking → even more impressions. Breaking
              into this loop requires a well-optimised listing from day one,
              supported by targeted early-stage advertising to build{" "}
              <InLink to="/">CTR optimization and conversion signals</InLink>{" "}
              over time.
            </p>

            {/* ── S4 ───────────────────────────────────────────────────── */}
            <div id="s4">
              <SectionQA
                title="The 6 Core Ranking Factors on Amazon.in Explained"
                paragraph1="Understanding the A9 algorithm in detail allows you to systematically improve each ranking factor. Here is how each factor works and what it means in practice for Indian sellers."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/Rank_page_1-Blog4_image3.png"
              altText="Insydz Listing Health Dashboard — tracking all 6 A9 ranking factors with actionable improvement scores for Amazon.in sellers"
              caption="Insydz Listing Health Dashboard tracking all 6 A9 ranking factors with actionable improvement scores for Amazon.in sellers"
            />

            <DataTable
              columns={rankingFactorsColumns}
              rows={rankingFactorsRows}
            />

            {/* ── S5 ───────────────────────────────────────────────────── */}
            <div id="s5">
              <SectionQA
                title="5 Critical Mistakes That Keep Indian Sellers Off Page 1"
                paragraph1="These five mistakes are the most common reasons Indian sellers fail to break into page 1 and stay there. Each one is entirely preventable once you understand the mechanics behind it."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={mistakes}
              numberColor="#2563EB"
              backgroundColor="#F8FAFC"
              borderColor="#BFDBFE"
            />

            <InfoBanner
              accentColor="#DB2777"
              backgroundColor="#FDF2F8"
              title="⚠ Counterintuitive Truth"
              content="Running more ads will not fix a broken listing. Ads amplify what's already there. If your listing converts at 4%, ads just bring more people who don't buy and you pay for each one. The correct sequence is always: optimise the listing organically first, then scale with paid traffic once you know the listing converts."
            />

            <FeatureCTA
              title="Find Your Keyword Gaps in Minutes"
              description="Insydz gives Indian sellers the exact keywords their top competitors rank for that they don't even have in their listing yet."
              buttonText="Start Free at insydz.com →"
              buttonHref="/login"
              backgroundColor="#0D1B2A"
              buttonColor="#F97316"
            />

            {/* ── S6 ───────────────────────────────────────────────────── */}
            <div id="s6">
              <SectionQA
                title="Best Practices: A Page 1 Ranking Execution Plan for Indian Sellers"
                paragraph1="The sellers who consistently hold page 1 positions on Amazon.in don't rely on guesswork — they follow a structured four-phase process. Here is the complete execution framework, from initial keyword research through ongoing tracking and iteration."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/Rank_page_1-Blog4_image4.png"
              altText="Insydz 4-phase page 1 execution plan — keyword research, listing optimisation, velocity building, track and iterate"
              caption="Insydz 4-phase page 1 execution plan a structured, data-driven workflow for sustained organic rank growth on Amazon.in"
            />

            <SectionQA
              title="Phase 1: Keyword Research (Before Touching Your Listing)"
              paragraph1="Foundation cannot be skipped."
              resolvedTheme={resolvedTheme}
            />
            <NumberedCards
              items={phase1Items}
              numberColor="#EC4899"
              backgroundColor="#F8FAFC"
              borderColor="#FBCFE8"
            />

            <SectionQA
              title="Phase 2: Listing Optimisation (One-Time Foundation)"
              paragraph1="Title, bullets, backend, images, A+ content."
              resolvedTheme={resolvedTheme}
            />
            <NumberedCards
              items={phase2Items}
              numberColor="#D97706"
              backgroundColor="#F8FAFC"
              borderColor="#FDE68A"
            />

            <SectionQA
              title="Phase 3: Sales Velocity Building"
              paragraph1="Weeks 1–4 post-optimisation."
              resolvedTheme={resolvedTheme}
            />
            <NumberedCards
              items={phase3Items}
              numberColor="#0D9488"
              backgroundColor="#F8FAFC"
              borderColor="#99F6E4"
            />

            <SectionQA
              title="Phase 4: Tracking and Iteration (Ongoing)"
              paragraph1="Weekly tracking, quarterly audits."
              resolvedTheme={resolvedTheme}
            />
            <NumberedCards
              items={phase4Items}
              numberColor="#7C3AED"
              backgroundColor="#F8FAFC"
              borderColor="#DDD6FE"
            />

            <h3>Key Metrics to Track Weekly</h3>
            <div className="metrics">
              {[
                {
                  num: "Keyword Rank",
                  lbl: "Track daily position for each target keyword — not just overall BSR",
                },
                {
                  num: "CTR",
                  lbl: "Click-through rate in search — low CTR signals weak main image or title",
                },
                {
                  num: "CVR",
                  lbl: "Conversion rate below 8% means your listing isn't convincing buyers",
                },
                {
                  num: "Organic Split",
                  lbl: "% of sales from organic vs. paid — growth in organic share signals healthy ranking",
                },
              ].map((m) => (
                <div className="metric-card" key={m.num}>
                  <span className="mc-num">{m.num}</span>
                  <span className="mc-lbl">{m.lbl}</span>
                </div>
              ))}
            </div>

            {/* ── S7 ───────────────────────────────────────────────────── */}
            <div id="s7">
              <h2>Best Tools for Amazon India Ranking in 2026</h2>
            </div>

            <h3>Global Tools: Strong Capabilities, Indian Market Gaps</h3>
            <p>
              Jungle Scout, Helium 10's Cerebro and Magnet, and DataHawk are
              well-regarded for keyword research and rank tracking on Amazon.
              For Indian sellers evaluating these tools, three material gaps
              affect their usefulness:
            </p>

            <NumberedCards
              items={globalToolsItems}
              numberColor="#64748B"
              backgroundColor="#F8FAFC"
              borderColor="#E2E8F0"
            />

            <BlogImageSection
              imageSrc="/Rank_page1_Blog4_image5.png"
              altText="Insydz vs global tools — India-specific keyword intelligence, Flipkart SEO, and WhatsApp rank alerts built for Amazon.in sellers"
              caption="Insydz vs. global tools India-specific keyword intelligence, Flipkart SEO, and WhatsApp rank alerts built for Amazon.in sellers"
            />

            <h3>Insydz: Page 1 Ranking Intelligence Built for Amazon.in</h3>
            <p>
              Insydz takes a connected approach to Amazon ranking rather than
              treating SEO as a standalone function — it ties keyword
              intelligence to competitor pricing, review sentiment, and market
              trends in one dashboard. For sellers focused specifically on
              ranking on page 1 of Amazon India, the tool provides:
            </p>

            <KeyTakeawaysBox
              title="What Insydz Provides"
              items={insydzFeatures}
              accentColor="#2563EB"
            />

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="Real Outcome from Insydz"
              content="A kitchen appliances seller used the competitor keyword gap tool to identify 14 high-volume keywords their top competitors ranked for that were missing from their listing entirely. After adding these keywords to their title, bullet points, and backend search terms, their average keyword rank improved from #18 to #6 across target terms and organic sessions increased 340% within 6 weeks, with no change in ad spend."
            />

            {/* ── S9 ───────────────────────────────────────────────────── */}
            <div id="s9">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#2563EB" faqs={faqs} />

            {/* Related Guides */}
            <RelatedArticles
              title="Related Guides"
              cards={relatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Page 1 Is a System. Insydz Runs It."
        description="Track your Amazon.in keyword ranks daily, catch drops instantly on WhatsApp, and close the gaps your competitors are exploiting. No setup · Amazon.in + Flipkart · Results in minutes"
        primaryButtonText="Find My Keyword Gaps →"
        primaryButtonHref="/login"
        primaryColor="#F97316"
        secondaryColor="#EF4444"
        stats={[
          { value: "✓", label: "Daily rank tracking" },
          { value: "✓", label: "WhatsApp alerts" },
          { value: "✓", label: "India keyword data" },
          { value: "✓", label: "Free plan available" },
        ]}
      />
    </div>
  );
}
