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
const schemaAnalyzeAmazonReviewsIndia = {
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
        "https://insydz.com/resources/expert-blog/analyze-amazon-reviews-india-tool",
      url: "https://insydz.com/resources/expert-blog/analyze-amazon-reviews-india-tool",
      name: "How to Analyze 500+ Amazon India Reviews in Minutes and Find Your Biggest Product Opportunity",
      description:
        "Learn the manual and AI powered methods to mine hundreds of Amazon India reviews for repeating pain points, missing feature gaps, and product launch signals.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/analyze-amazon-reviews-india-tool#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/analyze-amazon-reviews-india-tool#breadcrumb",
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
          name: "Analyze Amazon India Reviews",
          item: "https://insydz.com/resources/expert-blog/analyze-amazon-reviews-india-tool",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/analyze-amazon-reviews-india-tool#article",
      headline:
        "How to Analyze 500+ Amazon India Reviews in Minutes and Find Your Biggest Product Opportunity",
      image:
        "https://insydz.com/analyze-amazon-reviews-india-tool_blogbanner.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-06-24",
      dateModified: "2026-06-24",
      keywords: [
        "analyze amazon reviews india tool",
        "amazon review analysis tool india",
        "ai review mining amazon india",
        "bulk review analysis amazon india",
        "competitor review insight india",
      ],
      articleSection: "Review Intelligence",
      inLanguage: "en-IN",
      wordCount: 2450,
      timeRequired: "PT12M",
    },
  ],
};

// ── Key takeaways ────────────────────────────────────────────────────────────
const reviewsKeyTakeaways = [
  "Review analysis is the highest return research a seller can do, because the demand is already written down. You are not guessing what buyers want. You are counting it.",
  "Competitor reviews are more valuable than your own. They reveal what the market wants that nobody in the category is delivering yet.",
  "One and two star reviews are defect signals that tell you what is broken. Three star reviews are improvement signals that tell you what is almost right. The three star pile is the most underused goldmine.",
  "The missing feature pattern is a product launch signal. A feature requested in 30 or more reviews that no listing offers is a market gap you can fill with low risk.",
  "Manual analysis works for small sellers but caps out fast. AI review mining reads 500 or more reviews in minutes and surfaces Hindi and Hinglish patterns that manual reading and English only tools miss.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const reviewsTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "Why Review Analysis Wins" },
  { id: "s3", label: "The Manual Method" },
  { id: "s4", label: "The Four Review Patterns" },
  { id: "s5", label: "Turning Patterns Into Action" },
  { id: "s6", label: "The Missing Feature Signal" },
  { id: "s7", label: "AI Review Analysis at Scale" },
  { id: "s8", label: "FAQs" },
];

// ── Manual method steps (s3) ──────────────────────────────────────────────────
const reviewsManualMethodSteps = [
  {
    title: "Collect reviews by star rating, yours and your top two competitors",
    description:
      "Open the listings and work through the reviews filtered by star rating. Pull your own and, more importantly, your two strongest competitors. Their reviews are where the market gaps hide.",
  },
  {
    title: "Split into three piles: 1 to 2 star, 3 star, and 4 to 5 star",
    description:
      "The piles mean different things. One and two star reviews are defects. Three star reviews are near misses, the richest source of improvement ideas. Four and five star reviews tell you what buyers love, which you protect and put in your marketing.",
  },
  {
    title: "Put one review per row and tag it with a single theme word",
    description:
      "In a spreadsheet, paste each review into a row and add one theme tag: smell, sizing, packaging, battery, durability, missing feature, and so on. One word per review. Do not write notes. The discipline of a single tag is what makes counting possible.",
  },
  {
    title: "Count the themes and sort by frequency",
    description:
      "Use a count or a pivot to rank the themes from most to least common. The pattern that was invisible while reading appears instantly once counted. One mention is noise. Forty mentions of the same word is a decision.",
  },
  {
    title: "Mark which top themes already have a solution in the market",
    description:
      "For each top theme, check whether any listing already solves it. A frequent request that no product answers is your opportunity. A frequent complaint that everyone shares is a category wide fix you can win on quality.",
  },
];

// ── Table: The Four Review Patterns ──────────────────────────────────────────
const reviewsPatternTableColumns: TableColumn[] = [
  {
    key: "pattern",
    label: "PATTERN",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#1e0a3c] text-white",
  },
  {
    key: "whatBuyersWrite",
    label: "WHAT BUYERS WRITE",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#1e0a3c] text-white",
  },
  {
    key: "signal",
    label: "SIGNAL",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#1e0a3c] text-white",
  },
  {
    key: "action",
    label: "ACTION",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#1e0a3c] text-white",
  },
];

const reviewsPatternTableRows: TableRow[] = [
  {
    rowClassName: "bg-[#F3E8FF]",
    pattern: {
      value: "Product defect",
      className:
        "font-semibold text-[#7C3AED] border-l-4 border-[#7C3AED] pl-3",
    },
    whatBuyersWrite: "Tore after two washes, stopped charging, runs small",
    signal: {
      type: "chip",
      label: "Quality fault",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
    action: "Supplier or quality change",
  },
  {
    pattern: "Listing mismatch",
    whatBuyersWrite: "Not as described, colour looked different",
    signal: {
      type: "chip",
      label: "Expectation gap",
      className: "bg-[#FEF3C7] text-[#92400E]",
    },
    action: "Fast listing edit",
  },
  {
    rowClassName: "bg-[#F3E8FF]",
    pattern: {
      value: "Missing feature",
      className:
        "font-semibold text-[#7C3AED] border-l-4 border-[#7C3AED] pl-3",
    },
    whatBuyersWrite: "Wish it came in cotton, no fragrance free option",
    signal: {
      type: "chip",
      label: "Market gap",
      className: "bg-[#EDE9FE] text-[#6D28D9]",
    },
    action: "New variant or product",
  },
  {
    pattern: "Packaging / delivery",
    whatBuyersWrite: "Arrived leaking, box crushed, very late",
    signal: {
      type: "chip",
      label: "Fulfilment",
      className: "bg-[#DCFCE7] text-[#15803D]",
    },
    action: "Packaging or FBA fix",
  },
];

// ── Case studies (s6) ─────────────────────────────────────────────────────────
const reviewsCaseStudies = [
  "Home care, missing feature: reviews repeatedly said the scent was overpowering. No fragrance free option existed. Action: launched a fragrance free variant. Result: number two in the category in 60 days.",
  "Apparel, listing mismatch: dozens of reviews said the fit ran small. Action: corrected the size chart, added a clear size up note, and updated the images. Result: returns fell and the rating climbed without touching the product.",
  "Kitchenware, packaging: a cluster of reviews reported items arriving cracked. Action: switched to honeycomb packaging and moved to FBA. Result: damage complaints dropped sharply within weeks.",
];

// ── What AI surfaces (s7) ─────────────────────────────────────────────────────
const reviewsAiSurfacesList = [
  "Patterns split across languages, where the same complaint appears in English on some reviews and Hindi or Hinglish on others, so neither pile alone looks significant.",
  "Slow building feature requests that never feel frequent in any single session but add up to a clear gap across the full set.",
  "Sentiment hidden inside positive reviews, where a four star review still contains a specific request worth acting on.",
  "Competitor weaknesses at the category level, comparing the recurring complaints across several rival listings at once.",
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const reviewsFaqs = [
  {
    q: "How can I analyze hundreds of Amazon reviews without reading each one?",
    a: "Group instead of read. Sort reviews by star rating, separate one and two star reviews from three star reviews, then tag each with a single theme word such as smell, sizing, or packaging. Counting the themes turns hundreds of reviews into a five line summary. An AI tool like Insydz does this across 500 or more reviews in minutes, extracting the top recurring pain points and feature requests automatically.",
  },
  {
    q: "What patterns in reviews indicate the biggest product improvement opportunity?",
    a: "The missing feature pattern is the strongest signal. When 30 or more reviews ask for the same thing that no listing in the category offers, that is a market gap and a product launch signal, not a complaint. Three star reviews are the richest source, because the buyer liked the product enough not to hate it but something specific held them back, and that something is your improvement roadmap.",
  },
  {
    q: "How do I use competitor reviews to differentiate my product?",
    a: "Competitor reviews show what the market wants that nobody is delivering yet. Read the negative and three star reviews of the category leaders, find the request that repeats most often, and build your product or listing around solving exactly that. If buyers keep asking a competitor for a fragrance free version that does not exist, that gap is your differentiation.",
  },
  {
    q: "What is AI review sentiment analysis and how does it work?",
    a: "It uses natural language processing to read every review, classify each comment as positive or negative, and group comments into themes such as quality, sizing, packaging, or missing features. Instead of you reading 500 reviews, the model extracts recurring pain points and feature requests and ranks them by frequency, surfacing patterns that are invisible when reviews are read one by one in date order.",
  },
  {
    q: "Can I use review data to plan a new product variant?",
    a: "Yes, and it is one of the safest ways to launch. A feature requested across many reviews with no existing product that offers it is pre validated demand. You already know buyers want it because they have written it down. Launching a variant that fills that gap carries far less risk than guessing, which is how a fragrance free variant or a larger size can become a category leader within weeks.",
  },
  {
    q: "How many reviews do I need before a pattern is reliable?",
    a: "There is no hard rule, but a theme that appears in roughly 10 percent or more of the reviews you analyze is worth taking seriously, and one that crosses 30 mentions is a strong signal. The more reviews you can include, the more reliable the count, which is why analyzing your competitors as well as yourself, across the full review history, gives a far clearer picture than a small recent sample.",
  },
];

const reviewsRelatedCards = [
  {
    tag: "Review Intelligence",
    title: "How Negative Reviews Are Silently Killing Your Amazon India Sales",
    route: "/resources/expert-blog/negative-reviews-amazon-india",
    image: "/How Negative Reviews Are Killing Your Amazon India Sales.png",
  },
  {
    tag: "Product Research",
    title:
      "The Missing Feature Method: Find a Product Gap From Competitor Reviews",
    route: "/resources/expert-blog/amazon-review-analysis-guide-india",
    image: "/Analyze Amazon Reviews.png",
  },
  {
    tag: "Analytics Tool",
    title:
      "Flipkart Seller Analytics Tool: Track Ratings, Reviews and Competitors",
    route: "/resources/expert-blog/flipkart-seller-analytics-tool-india",
    image: "/Flipkart Analytics Tool.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AnalyzeAmazonReviewsIndiaContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const id = "insydz-analyze-amazon-reviews-india-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaAnalyzeAmazonReviewsIndia);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = reviewsTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(reviewsTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(reviewsTOC[i].id);
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

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#7C3AED,#A78BFA);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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
        .toc-link:hover{color:#7C3AED;background:#F3E8FF;border-left-color:#C4B5FD}
        .toc-link.active{color:#7C3AED;background:#F3E8FF;border-left-color:#7C3AED}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(124,58,237,.1);color:#A78BFA;border-left-color:rgba(124,58,237,.4)}
        .dark .toc-link.active{background:rgba(124,58,237,.15);color:#A78BFA;border-left-color:#7C3AED}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8{scroll-margin-top:120px}

        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        /* India dark advantages section */
        .india-inner{background:linear-gradient(135deg,#0c1445 0%,#0C1A27 100%);border-radius:28px;padding:40px;overflow:hidden;position:relative;margin:56px 0 0}
        .india-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
        .india-label{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#A78BFA;margin-bottom:12px;font-family:'Sora',sans-serif}
        .india-h3{font-family:'Sora',sans-serif;font-size:clamp(19px,2.3vw,26px);font-weight:800;color:#fff;line-height:1.25;margin-bottom:14px}
        .india-body{font-size:13.5px;color:rgba(255,255,255,.65);line-height:1.75;margin-bottom:22px;font-family:'Lora',serif}
        .india-stats{display:flex;gap:22px;flex-wrap:wrap}
        .india-stat-val{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:#A78BFA;display:block}
        .india-stat-lbl{font-size:11.5px;color:rgba(255,255,255,.5);font-family:'Sora',sans-serif}
        .india-adv{display:flex;align-items:flex-start;gap:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;margin-bottom:12px}
        .india-adv-title{font-family:'Sora',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:3px}
        .india-adv-desc{font-size:12px;color:rgba(255,255,255,.5);line-height:1.55;font-family:'Sora',sans-serif}
        @media(max-width:768px){.india-grid{grid-template-columns:1fr}.india-inner{padding:26px 22px}}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Analyze Amazon India Reviews" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Review Intelligence · Data Story"
        title={
          <>
            How to Analyze 500+{" "}
            <span style={{ color: "#7C3AED" }}>Amazon India Reviews</span> in
            Minutes and Find Your Biggest Product Opportunity
          </>
        }
        description={
          <>
            A seller in Mumbai read 312 competitor reviews over three weekends.
            One pattern kept appearing: the scent was too strong. She launched a
            fragrance free variant, and within 60 days it became the second best
            seller in her category. This guide shows you the exact method, first
            by hand, then in minutes.
          </>
        }
        authorName="Insydz Research Team"
        authorUrl="/resources/expert-blog"
        publishDate="July 2026"
        readTime="12 min read"
        bgColor={{ light: "#F5F3FF", dark: "#1a0a2e" }}
        highlightColor="#7C3AED"
        // tags={["BOFU · Review Intelligence", "SEO Organic"]}
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/Analyze 500+ Reviews for Product Opportunities.png"
          altText="Analyze Amazon India Reviews"
          caption="Insydz AI review mining. 512 competitor reviews reduced to a ranked list of recurring themes. The top request, fragrance free, appears 47 times while no listing in the category offers it. That is not a complaint. It is a product launch signal."
        />

        <InfoBanner
          accentColor="#7C3AED"
          backgroundColor="#F5F3FF"
          title="QUICK ANSWER"
          content="To analyze hundreds of Amazon India reviews quickly, stop reading and start counting. Sort reviews by star rating, separate one and two star reviews (defect signals) from three star reviews (improvement signals), tag each with a single theme word, then count the themes and sort by frequency. The largest theme tells you what to fix or build. The strongest opportunity is the missing feature pattern: a request that appears in 30 or more reviews that no listing currently offers is pre validated demand for a new variant. Insydz does this across 500 or more reviews in minutes, extracting the top pain points and feature gaps automatically, including Hindi and Hinglish reviews that English only tools skip."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways: Analyzing Amazon India Reviews at Scale"
              items={reviewsKeyTakeaways}
              accentColor="#7C3AED"
              backgroundColor="#0C1A27"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={reviewsTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={reviewsTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="Why Is Review Analysis the Highest Return Research a Seller Can Do in India?"
                paragraph1="Most product research starts with a guess. You think buyers might want a feature, you build it, and you wait to find out if you were right. Review analysis inverts that. The buyers have already told you what they want, in their own words, on listings that already exist. The demand is written down. Your only job is to read it at scale and count what repeats."
                paragraph2="This is why it beats surveys, keyword tools, and intuition. A keyword tool tells you what people search for. A review tells you what disappointed them after they bought, which is far more specific and far more actionable. And unlike a survey, nobody is performing for you. A frustrated buyer writing a three star review is being completely honest about exactly what would have made the product a five."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#7C3AED"
              backgroundColor="#F5F3FF"
              title="Why Competitor Reviews Beat Your Own"
              content="Your own reviews tell you what you got wrong. Useful, but limited to your product. Your competitor's reviews tell you what the entire market is missing. When buyers keep asking a category leader for something the leader does not offer, that gap is open to anyone who fills it first. The most valuable hour you can spend is reading the three star reviews of the top three products in your category."
            />

            <SectionQA
              paragraph1="For Indian sellers this advantage is even larger, because many competitors are not doing this work at all. The seller who systematically mines reviews for the recurring request is operating with information the rest of the category is ignoring. That is a durable edge, and it costs nothing but method."
              resolvedTheme={resolvedTheme}
            />

            <div id="s3">
              <SectionQA
                title="The Manual Method: How to Analyze Reviews Free With a Spreadsheet"
                paragraph1="If you are just starting and have a few hundred reviews to work through, you do not need a tool. You need a spreadsheet and a rule: count, do not read. Here is the method that the Mumbai seller used, made repeatable."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={reviewsManualMethodSteps}
              numberColor="#7C3AED"
              backgroundColor="#F8FAFC"
              borderColor="#DDD6FE"
            />

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="The Three Star Insight Most Sellers Miss"
              content="Sellers obsess over one star reviews and ignore three star reviews. That is backwards. A one star review often comes from a defective unit or an angry edge case. A three star review comes from a buyer who almost loved the product. They are telling you the one thing that held them back from a five. Mine the three star pile and you get a precise improvement roadmap written by people who genuinely wanted to like your product."
            />

            <div id="s4">
              <SectionQA
                title="The Four Review Patterns That Actually Matter"
                paragraph1="Almost every theme you tag will fall into one of four patterns. Knowing which pattern you are looking at decides what you do next, because each one points to a different kind of action."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/analyze-amazon-reviews-india-1.png"
              altText="The Four Review Patterns"
              caption="The four review patterns. Defects need a product or supplier change, listing mismatches need a fast listing edit, packaging issues need a fulfilment fix, and missing features point to a new variant. Sorting themes into these four buckets turns a pile of complaints into a clear plan."
            />

            <DataTable
              columns={reviewsPatternTableColumns}
              rows={reviewsPatternTableRows}
            />

            <div id="s5">
              <SectionQA
                title="How Do You Turn Each Pattern Into a Specific Action?"
                paragraph1="A pattern is only useful if it changes what you do on Monday morning. Here is how each of the four patterns maps to a concrete next step, ordered from fastest to slowest."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="Pattern to Action Mapping"
              content="Listing mismatch, fix today: update the images, correct the colour or size description, rewrite the bullet that overpromised. Fastest and cheapest, often removing a surprising share of negatives within days. Packaging or delivery, fix this week: switch to sturdier packaging or move the item to FBA for more consistent handling, no product change required. Product defect, fix this quarter: raise the quality or material fault with your supplier, tighten incoming checks, and update the listing to set honest expectations in the meantime. Missing feature, plan a launch: if the request repeats across 30 or more reviews and no listing offers it, scope a new variant, the highest value action review analysis produces."
            />

            <SectionQA
              paragraph1="Notice the order. You do not start with the hardest, most expensive change. You start with the listing edit that takes ten minutes and stops new complaints, then work down toward the variant launch that takes weeks but opens a whole new line of sales."
              resolvedTheme={resolvedTheme}
            />

            <FeatureCTA
              title="Insydz analyzes 500+ reviews in minutes and extracts the top pain points automatically"
              description="Paste a competitor's ASIN and see the recurring complaints, feature requests, and market gaps ranked by frequency, in English, Hindi, and Hinglish."
              buttonText="Try Free on a Competitor ASIN →"
              buttonHref="/login"
              backgroundColor="#0C1A27"
              buttonColor="#7C3AED"
            />

            <div id="s6">
              <SectionQA
                title="The Missing Feature Pattern: Your Clearest Product Launch Signal"
                paragraph1="Of the four patterns, one is worth more than the rest combined. The missing feature pattern is the difference between fixing a product and launching one. When buyers repeatedly ask for something that does not exist anywhere in the category, they are handing you pre validated demand. You are not guessing whether the market wants it. The market has already written it down, many times over."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/analyze-amazon-reviews-india-2.png"
              altText="The Missing Feature Pattern Case Study"
              caption="From review pattern to category rank. A request that appeared 47 times with zero listings answering it became a fragrance free variant that reached number two in the category within 60 days. The pattern was the product brief."
            />

            <InfoBanner
              accentColor="#7C3AED"
              backgroundColor="#F5F3FF"
              title="Mini Case Studies: The Pattern and the Action"
              content={reviewsCaseStudies.join(" ")}
            />

            <SectionQA
              paragraph1="The pattern is consistent across all three. The seller did not invent a solution and hope. They read what buyers were already saying, counted it, and acted on the most frequent signal. The only variable was how fast they could find the pattern, which is exactly where AI changes the game."
              resolvedTheme={resolvedTheme}
            />

            <div id="s7">
              <SectionQA
                title="How Does AI Review Analysis Do This at Scale?"
                paragraph1="The manual method works, but it has a ceiling. Reading 300 reviews across three weekends is possible. Reading 3,000 across your whole category, every week, in two languages, is not. This is where AI review mining takes over, doing the same counting you would do by hand, only across every review at once and in minutes."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/analyze-amazon-reviews-india-3.png"
              altText="Manual vs AI Review Analysis"
              caption="The AI pipeline mirrors the manual method: read, classify, group, and rank. The difference is scale and language. It processes hundreds of reviews in minutes and reads Hindi and Hinglish natively, which is where a real share of Amazon India sentiment lives."
            />

            <SectionQA
              paragraph1="The value is not only speed. AI catches what manual reading misses. When you read 300 reviews by hand, fatigue sets in and the pattern you noticed on page one fades by page ten. The model has no fatigue, no recency bias, and no blind spot for the language you are less comfortable reading. It counts every mention equally, which is exactly what good pattern detection requires."
              resolvedTheme={resolvedTheme}
            />

            <KeyTakeawaysBox
              title="What AI Surfaces That Manual Reading Misses"
              items={reviewsAiSurfacesList}
              accentColor="#7C3AED"
              backgroundColor="#0C1A27"
            />

            <div id="s8">
              <SectionQA
                title="Frequently Asked Questions: Analyzing Amazon India Reviews"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#7C3AED" faqs={reviewsFaqs} />

            {/* More Review and Product Intelligence */}
            <RelatedArticles
              title="More Review and Product Intelligence"
              cards={reviewsRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Your Next Product Is Already Written in Your Competitor's Reviews. Go and Count It."
        description="Stop reading reviews one by one over weekends. Let Insydz mine 500 or more reviews in minutes, rank the recurring pain points, and surface the missing feature gap that the whole category has overlooked."
        primaryButtonText="Analyze Reviews Free →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#7C3AED"
        secondaryColor="#A78BFA"
        stats={[
          { value: "5,000+", label: "Indian sellers" },
          { value: "500+", label: "Reviews mined per ASIN" },
          { value: "Minutes", label: "Not weekends" },
          { value: "Free", label: "To start" },
        ]}
      />
    </div>
  );
}
