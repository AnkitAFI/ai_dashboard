"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { useTheme } from "next-themes";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import HeroSection from "../components/HeroSection";
import BlogImageSection from "../components/BlogImageSection";
import SectionQA from "../components/SectionQA";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import InsightCards from "../components/InsightCard";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  PlusSquare,
  Search,
} from "lucide-react";
import FeatureCTA from "../components/FeatureCTA";
import StepsList from "../components/NumberedCards";
import NumberedCards from "../components/NumberedCards";
import { title } from "process";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaAmazonListingNotRankingIndia = {
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
        "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
      url: "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
      name: "Amazon Listing Not Ranking in India? Fix It in 2026",
      description:
        "Your Amazon India listing is live but not ranking? Learn the real reasons products fail to rank and the practical fixes that improve visibility in 2026.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india#breadcrumb",
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
          name: "Amazon Listing Not Ranking India",
          item: "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india#article",
      headline:
        "Amazon Listing Not Ranking? 11 Reasons Your Product Is Invisible on Amazon India",
      description:
        "Discover why your Amazon India listing is not ranking despite being live. Learn how indexing, keyword relevance, conversions, pricing, reviews, and competition impact rankings.",
      image: "https://insydz.com/Banner_amazon-listing-not-ranking-india.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-06-24",
      dateModified: "2026-06-24",
      keywords: [
        "amazon listing not ranking india",
        "amazon india ranking issues",
        "why my amazon product is not ranking",
        "amazon keyword ranking problem",
        "amazon listing visibility india",
        "amazon seo india",
        "amazon product not showing in search",
        "amazon ranking factors india",
        "amazon keyword indexing issue",
        "improve amazon rankings india",
      ],
      articleSection: "Amazon SEO",
      inLanguage: "en-IN",
      wordCount: 4400,
      timeRequired: "PT12M",
    },
  ],
};

const keyTakeaways = [
  "Most Amazon India listing ranking problems are not caused by competition. They are caused by one of 7 fixable technical or content mistakes.",
  "Keyword indexing is the first thing to check. If you are not indexed, no amount of bid spend will generate organic rank for that term.",
  "Click through rate and conversion rate are both active ranking signals on Amazon. A listing that gets clicks but low orders will rank down over time.",
  "Listing suppression can be invisible in Seller Central unless you know where to look. A suppressed listing ranks for nothing.",
  "Category mapping is the most overlooked mistake for Indian sellers with products that fit multiple categories. Wrong category means you are invisible in filtered search, which is particularly costly for sellers in tier 2 and tier 3 cities where buyers browse categories more than they search.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────

const TOC_ITEMS = [
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "why-advice-fails", label: "Why Most Advice Doesn't Work" },
  { id: "seven-reasons", label: "7 Reasons Your Listing Isn't Ranking" },
  { id: "which-reason-first", label: "Which Reason to Check First" },
  {
    id: "optimised-listing",
    label: "What a Properly Optimised Listing Looks Like",
  },
  { id: "faq", label: "FAQs" },
];

// ── 7 Reasons Data ────────────────────────────────────────────────────────────
const sevenReasons = [
  {
    number: "01",
    title: "Your Listing Is Not Indexed for the Target Keyword",
    body: "If Amazon has not indexed your listing for a keyword, you cannot rank for it. Period. You could have the best title, the best price, and the most reviews in the category. You will still be invisible on that term.",
    howToCheck:
      "Type your ASIN followed by the keyword into the Amazon India search bar, for example B09XY7ABC earphone. If your listing appears, you are indexed for that term. If it does not appear, add it to your backend search terms.",
    howToCheckHighlight: "B09XY7ABC earphone",
    theFix:
      "Add the keyword to your backend search terms field in Seller Central (Edit Listing, Keywords tab). Amazon re-indexes listings within 24 to 48 hours of a backend keyword save. If the keyword is a high priority one, also add it naturally to a bullet point or the product description for stronger indexing weight.",
  },
  {
    number: "02",
    title: "Poor Click Through Rate from Search Results",
    body: "Amazon measures whether buyers click your listing when they see it in search results. If your click through rate is low compared to competitors on the same keyword, Amazon gradually moves you down and promotes listings that get more clicks. This is one of the most underexplained ranking signals for Indian sellers.",
    howToCheck:
      "Search your main keyword on Amazon India and compare your listing against the top 5 results. If your main image is weaker or your price is noticeably higher than the top results, click through rate is likely dragging your rank down.",
    theFix:
      "Replace your main image with a white background shot where the product fills at least 85% of the frame. Rewrite your title so the first 60 characters contain the most important keyword and the clearest product description. If your price is significantly higher than the top results, check whether a small reduction pays off in rank improvement.",
  },
  {
    number: "03",
    title: "Low Conversion Rate Is Signalling Low Relevance",
    body: "Amazon's A9 algorithm treats conversion rate as evidence that your listing is relevant to a keyword. When buyers search a term, find your listing, and do not buy, Amazon reads this as a signal that your product is not what they were looking for on that term. Over time, your rank falls even if your listing was previously well placed.",
    howToCheck:
      "In Seller Central, go to Reports then Business Reports then Detail Page Sales and Traffic by ASIN. If your Order Session Percentage is below 6% for a mid range product, conversion is likely dragging your rank down. Compare to your category benchmark via Brand Analytics if you have access.",
    theFix:
      "The fastest conversion rate improvements come from three things: adding more product images (lifestyle and infographic shots, not just white background), increasing your review count through Amazon Vine or follow-up messaging, and ensuring your price is within 10 to 15% of the top competitor. Address whichever of these three is weakest first.",
  },
  {
    number: "04",
    title: "Your Listing Is Suppressed and You Do Not Know It",
    body: "A suppressed listing does not appear in search results at all. Amazon suppresses listings for pricing policy violations, missing mandatory attributes, image guideline breaches, and compliance flags. The listing is still visible in Seller Central as active, which is why many sellers do not notice it for days or weeks.",
    howToCheck:
      "In Seller Central, go to Inventory then Manage Inventory and look for yellow or red warning icons next to the ASIN. A yellow icon means a listing quality issue; red means the listing may be suppressed. Also search your product title in a private browser window on Amazon India to confirm.",
    theFix:
      "Click the warning icon to read the specific suppression reason. The three most common causes for Indian sellers are: price set too high compared to your own price history on Amazon, a missing mandatory attribute in the product detail fields, and a main image that does not meet the white background requirement. Fix the flagged issue and the listing re-indexes within 24 to 72 hours.",
  },
  {
    number: "05",
    title: "Backend Keywords Are Empty, Duplicated, or Stuffed",
    body: "The backend search terms field in Seller Central gives you 250 bytes of invisible keyword real estate. Amazon indexes these terms and uses them to determine what searches your listing is relevant for. Most Indian sellers either leave this field nearly empty, repeat keywords that are already in their title, or fill it with irrelevant terms hoping for extra traffic.",
    howToCheck:
      "Open Edit Listing in Seller Central and check the Search Terms field under the Keywords tab. Under 150 bytes means you are missing indexing opportunities. Words already in your title waste those bytes.",
    theFix:
      "Fill the backend field to near 250 bytes using keywords not already in your title or bullets, including Hindi transliterations, common misspellings, and buying intent terms. No punctuation, no repeated words. Save and wait 24 to 48 hours.",
  },
  {
    number: "06",
    title: "Insufficient Sales Velocity on the Target Keyword",
    body: "Amazon's algorithm promotes listings that generate sales on a specific keyword. If you have never made a sale through a particular search term, Amazon has no evidence that your listing is relevant to it, regardless of whether the keyword appears in your copy. This particularly affects new listings and listings that have been relaunched after a long period of inactivity.",
    howToCheck:
      "If your listing is less than 8 weeks old, or if you have not made a sale through Sponsored Products on your target keyword, sales velocity is likely the limiting factor. Look at your Sponsored Products search term reports to see which keywords have generated at least one sale. Those are the terms Amazon is starting to index you for organically.",
    theFix:
      "Run an exact match Sponsored Products campaign on your 3 to 5 most important keywords for 7 to 10 days with a competitive bid. Even 3 to 5 sales per keyword through Sponsored Products gives Amazon enough signal to begin ranking your listing organically for that term. This is the fastest legitimate path from no rank to page 1 for a new listing.",
  },
  {
    number: "07",
    title: "Wrong Category Mapping Reducing Visibility in Filtered Search",
    body: "When buyers use category filters on Amazon India, clicking into a specific department or subcategory, your listing only appears if it is mapped to that category. A product mapped to a parent category instead of the most specific relevant subcategory misses all filtered search traffic, which is often where the highest converting buyers are.",
    howToCheck:
      'Go to your listing on Amazon India and find the Best Sellers Rank line in the Product Details section. It should show a specific subcategory like "Wired Headphones", not just "Electronics". If it shows only a broad parent category, your Browse Node is too generic.',
    theFix:
      "Go to Edit Listing and select the most specific subcategory that accurately describes your product. If you cannot change the Browse Node yourself, raise a case with Amazon Seller Support providing the correct category path. Correct mapping typically improves filtered search visibility within 48 to 72 hours.",
  },
];

const steps = [
  {
    title: "Filter by search frequency rank under 50,000 first",
    description:
      "On Amazon India, a search frequency rank under 50,000 represents a term searched frequently enough to drive meaningful traffic. Start your gap list here. Below 50,000 gives you 10 to 30 high priority targets for most categories.",
  },
  {
    title: "Filter out broad head terms with low buying intent",
    description:
      'A term like "earphones" has high search volume but low conversion because buyers are browsing, not buying. Prioritise gap keywords with buying signals: "buy earphones under 500", "earphones with warranty india". These convert at 2 to 3 times the rate of generic terms.',
  },
  {
    title: "Check the competitor's rank on the gap keyword",
    description:
      "If your competitor ranks #4 to #15 for a gap keyword, there is room to enter and compete. If they rank #1 to #3 on a high volume term, you may need Sponsored Products investment first before organic rank is realistic. Target the keywords where they rank #8 to #20 as your fastest wins.",
  },
  {
    title: "Separate Hindi gap keywords for separate prioritisation",
    description:
      "Hindi gap keywords compete in a different pool from English terms. Do not deprioritise them just because their search frequency rank appears lower. Competition for Hindi terms is typically 60 to 80 percent lower than for equivalent English terms, making them easier to rank for even from a standing start.",
  },
  {
    title: "Pick 5 to 8 gap keywords to act on this week",
    description:
      "More than 8 is too many to track meaningfully. Pick the 5 to 8 top gap keywords, add them to your listing, and run Sponsored Products on each for 7 days. Then check rank movement with Insydz and repeat with the next batch.",
  },
];

const keywordGapRows: TableRow[] = [
  {
    rowClassName: "bg-[#F9F6F2]",
    keyword: {
      value: "New listing, never ranked",
      className:
        "font-semibold text-[#B45309] border-l-4 border-[#F59E0B] pl-3",
    },
    searchFreq: "Reason 1\n(indexing)",
    competitorRank: "Reason 6\n(velocity)",
    gapType: {
      type: "chip",
      label: "No sales history",
      className: "bg-[#FEF3C7] text-[#B45309] px-4 py-1",
    },
  },
  {
    keyword: "Previously ranked, now dropped",
    searchFreq: "Reason 4\n(suppression)",
    competitorRank: "Reason 3\n(conversion)",
    gapType: {
      type: "chip",
      label: "Algo signal change",
      className: "bg-[#FEE2E2] text-[#DC2626] px-4 py-1",
    },
  },
  {
    rowClassName: "bg-[#F9F6F2]",
    keyword: {
      value: "Ranked on some keywords,\nnot others",
      className:
        "font-semibold text-[#B45309] border-l-4 border-[#F59E0B] pl-3",
    },
    searchFreq: "Reason 1\n(indexing)",
    competitorRank: "Reason 5\n(backend)",
    gapType: {
      type: "chip",
      label: "Keyword gap",
      className: "bg-[#FEF3C7] text-[#B45309] px-4 py-1",
    },
  },
  {
    keyword: "Good traffic, few sales",
    searchFreq: "Reason 3\n(conversion)",
    competitorRank: "Reason 2\n(CTR)",
    gapType: {
      type: "chip",
      label: "Listing quality",
      className: "bg-[#FEE2E2] text-[#DC2626] px-4 py-1",
    },
  },
  {
    rowClassName: "bg-[#F9F6F2]",
    keyword: {
      value: "Invisible in category browse",
      className:
        "font-semibold text-[#B45309] border-l-4 border-[#F59E0B] pl-3",
    },
    searchFreq: "Reason 7\n(category)",
    competitorRank: "Reason 4\n(suppression)",
    gapType: {
      type: "chip",
      label: "Wrong mapping",
      className: "bg-[#FEF3C7] text-[#B45309] px-4 py-1",
    },
  },
  {
    keyword: "Ranking fell after listing edit",
    searchFreq: "Reason 4\n(suppression)",
    competitorRank: "Reason 1\n(indexing)",
    gapType: {
      type: "chip",
      label: "Edit triggered issue",
      className: "bg-[#FEE2E2] text-[#DC2626] px-4 py-1",
    },
  },
];

const keywordGapColumns = [
  {
    key: "keyword",
    label: "LISTING SITUATION",
    width: "33%",
  },
  {
    key: "searchFreq",
    label: "CHECK FIRST",
    width: "22%",
  },
  {
    key: "competitorRank",
    label: "THEN CHECK",
    width: "22%",
  },
  {
    key: "gapType",
    label: "LIKELY ROOT CAUSE",
    width: "23%",
  },
];

const listingColumns: TableColumn[] = [
  {
    key: "location",
    label: "LISTING LOCATION",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "keywordType",
    label: "KEYWORD TYPE TO ADD",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "capacity",
    label: "MAX CAPACITY",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "indexTime",
    label: "TIME TO INDEX",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
];

const listingRows: TableRow[] = [
  {
    rowClassName: "bg-[#F4F7FC]",
    location: {
      value: "Title (first 80 chars)",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },
    keywordType: "Primary gap keyword only, must read naturally",
    capacity: "1–2 keywords max",
    indexTime: {
      type: "chip",
      label: "Immediate",
      className: "bg-[#D8F0DD] text-[#067647]",
    },
  },
  {
    location: "Bullet points",
    keywordType: "Secondary gap keywords woven into benefit statements",
    capacity: "3–5 additional keywords",
    indexTime: {
      type: "chip",
      label: "24 hours",
      className: "bg-[#D8F0DD] text-[#067647]",
    },
  },
  {
    rowClassName: "bg-[#F4F7FC]",
    location: {
      value: "Backend search terms",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },
    keywordType: "All remaining gap keywords incl. Hindi terms",
    capacity: "250 bytes (~40 keywords)",
    indexTime: {
      type: "chip",
      label: "24–48 hours",
      className: "bg-[#D8F0DD] text-[#067647]",
    },
  },
  {
    location: "Product description",
    keywordType: "Long-tail gap keywords used in full sentences",
    capacity: "3–5 additional keywords",
    indexTime: {
      type: "chip",
      label: "2–5 days",
      className: "bg-[#F6E7B7] text-[#A04B00]",
    },
  },
  {
    rowClassName: "bg-[#F4F7FC]",
    location: {
      value: "A+ Content headers",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },
    keywordType: "Top gap keywords used as section titles",
    capacity: "2–4 additional keywords",
    indexTime: {
      type: "chip",
      label: "2–5 days",
      className: "bg-[#F6E7B7] text-[#A04B00]",
    },
  },
];

const keywordDiscoveryCards = [
  {
    icon: <FileText size={24} />,
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    title: "Title and Bullets",
    description: (
      <>
        Title first 80 characters contain primary keyword and clearest product
        description. Each bullet starts with a benefit, not a feature. Two to
        three secondary keywords woven in naturally across the five bullets.
      </>
    ),
    chips: [
      {
        label: "Visible ranking signal",
        bg: "#FEF3C7",
        color: "#C25B00",
      },
    ],
  },
  {
    icon: <PlusSquare size={24} />,
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    title: "Backend Keywords",
    description: (
      <>
        Backend search terms field filled to at least 230 bytes. No word
        repeated from title. Hindi transliterations included. No punctuation. No
        competitor brand names. Saved and verified indexed within 48 hours.
      </>
    ),
    chips: [
      {
        label: "Invisible, high impact",
        bg: "#DCFCE7",
        color: "#16A34A",
      },
    ],
  },
  {
    icon: <CheckCircle2 size={24} />,
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    title: "Images and Conversion",
    description: (
      <>
        Main image on pure white, product fills 85% of frame. At least 5
        additional images including one lifestyle shot and one infographic. 4.0
        stars or above. Price within 15% of top competitor.
      </>
    ),
    chips: [
      {
        label: "CTR and conversion",
        bg: "#DBEAFE",
        color: "#2563EB",
      },
    ],
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Why is my Amazon listing not appearing in search results in India?",
    a: "The seven most common reasons are: not indexed for the keyword, poor click-through rate, low conversion rate, listing suppression, missing or incorrect backend keywords, insufficient sales velocity, and wrong category mapping. Most sellers fix the wrong problem because they have not diagnosed which one is actually causing their issue.",
  },
  {
    q: "How do I check if my listing is indexed for a keyword?",
    a: "Type your ASIN followed by the keyword in the Amazon India search bar, for example: B09XY7ABC earphone. If your listing appears, you are indexed. If not, add the keyword to your backend search terms and check again after 24 to 48 hours.",
  },
  {
    q: "Does low conversion rate cause ranking drop on Amazon?",
    a: "Yes. Amazon's A9 algorithm treats conversion rate as a direct relevance signal. If buyers find your listing in search results but do not buy, Amazon reads this as evidence your listing is not relevant to that keyword. Over time, low conversion relative to competitors causes your position to fall even if your listing was previously well placed.",
  },
  {
    q: "How long does it take for a new Amazon listing to rank?",
    a: "A new listing typically takes 3 to 6 weeks to rank organically for competitive keywords. The fastest route is to generate sales velocity through Sponsored Products exact match campaigns on your target keywords. Once Amazon sees consistent sales on a keyword, it begins to rank your listing organically for that term within 2 to 4 weeks.",
  },
  {
    q: "Can duplicate listings hurt my ranking in India?",
    a: "Yes. Duplicate ASINs split your sales velocity and reviews across multiple listings rather than concentrating them on one. Amazon rewards consistent performance on a single ASIN. If you have multiple listings for the same product, merge them via Amazon Seller Support and consolidate all reviews onto the surviving ASIN.",
  },
  {
    q: "Can Insydz help me find why my Amazon India listing is not ranking?",
    a: "Yes. Insydz checks keyword indexing status, rank position, and listing quality flags for your ASIN, and shows the keyword gap between you and your top competitor. You can see exactly which keywords you are indexed for, which you are missing, and where a competitor is outranking you. Start with the free rank checker.",
  },
];

// ── SevenReasonsCards sub-component ──────────────────────────────────────────
interface ReasonItem {
  number: string;
  title: string;
  body: string;
  howToCheck: string;
  howToCheckHighlight?: string;
  theFix: string;
}

function SevenReasonsCards({
  reasons,
  resolvedTheme,
}: {
  reasons: ReasonItem[];
  resolvedTheme: string | undefined;
}) {
  const isDark = resolvedTheme === "dark";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        margin: "32px 0 40px",
      }}
    >
      {reasons.map((reason) => (
        <div
          key={reason.number}
          style={{
            border: isDark ? "1px solid #1f2937" : "1px solid #E5E7EB",
            borderRadius: 14,
            overflow: "hidden",
            background: isDark ? "#111827" : "#fff",
            boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: isDark ? "#1c1a09" : "#FEF9EC",
              borderBottom: isDark ? "1px solid #2d2a0f" : "1px solid #F5E9B8",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 28,
                fontWeight: 900,
                color: "#D97706",
                letterSpacing: "-1px",
                lineHeight: 1,
                minWidth: 44,
              }}
            >
              {reason.number}
            </span>
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: isDark ? "#f3f4f6" : "#0A0F1A",
                margin: 0,
                lineHeight: 1.35,
                letterSpacing: "-0.2px",
              }}
            >
              {reason.title}
            </h3>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px 0" }}>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 15,
                lineHeight: 1.78,
                color: isDark ? "#cbd5e1" : "#334155",
                margin: "0 0 20px",
              }}
            >
              {reason.body}
            </p>

            {/* How to Check */}
            <div
              style={{
                background: isDark ? "#0f172a" : "#F8FAFC",
                border: isDark ? "1px solid #1e293b" : "1px solid #E2E8F0",
                borderRadius: 8,
                padding: "14px 18px",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: isDark ? "#94a3b8" : "#64748B",
                  marginBottom: 8,
                }}
              >
                HOW TO CHECK
              </div>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 14,
                  lineHeight: 1.72,
                  color: isDark ? "#cbd5e1" : "#334155",
                  margin: 0,
                }}
              >
                {reason.howToCheckHighlight
                  ? (() => {
                      const parts = reason.howToCheck.split(
                        reason.howToCheckHighlight,
                      );
                      return (
                        <>
                          {parts[0]}
                          <strong
                            style={{
                              fontFamily: "'Sora', sans-serif",
                              color: isDark ? "#f9fafb" : "#0A0F1A",
                            }}
                          >
                            {reason.howToCheckHighlight}
                          </strong>
                          {parts[1]}
                        </>
                      );
                    })()
                  : reason.howToCheck}
              </p>
            </div>

            {/* The Fix */}
            <div
              style={{
                background: isDark ? "#052e16" : "#F0FDF4",
                borderLeft: "4px solid #16A34A",
                borderRadius: "0 8px 8px 0",
                padding: "14px 18px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: "#16A34A",
                  marginBottom: 8,
                }}
              >
                THE FIX
              </div>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 14,
                  lineHeight: 1.72,
                  color: isDark ? "#bbf7d0" : "#166534",
                  margin: 0,
                }}
              >
                {reason.theFix}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonListingNotRankingIndiaContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("key-takeaways");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = "insydz-amazon-listing-not-ranking-india-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaAmazonListingNotRankingIndia);
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
      for (let i = TOC_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC_ITEMS[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC_ITEMS[i].id);
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

  interface ArticleImgProps {
    src: string;
    alt: string;
    caption?: string;
  }
  function ArticleImg({ src, alt, caption }: ArticleImgProps) {
    const [loaded, setLoaded] = useState(false);
    return (
      <figure className="article-img-wrap">
        {!loaded && <div className="img-shimmer" />}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "auto",
            display: loaded ? "block" : "none",
          }}
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
            Amazon Listing Not Ranking India
          </span>
        </div>
      </div>

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Listing SEO"
        title={
          <>
            Amazon India Listing Not Ranking? <br />
            <span style={{ color: "#6366F1" }}>7 Reasons and Fixes</span>{" "}
          </>
        }
        description={
          <>
            You optimised your title. You added keywords. You are still on page
            4. The problem is <br /> almost never what sellers think it is. Here
            are the 7 fixable reasons most Indian <br /> sellers never find,
            each with a diagnosis check and a specific fix.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="June 2026"
        readTime="11 min read"
        bgColor={{
          light: "#F1F2FF",
          dark: "#0f1120",
        }}
      />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/Amazon India Listing Not Ranking.png"
          altText="Amazon Listing Not Ranking India"
          caption="Insydz rank diagnostic on a real ASIN. Three issues found: keyword not indexed, backend field only 19% used, and wrong category mapping. Any one of these is enough to keep a listing off page 1."
        />

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
            The most common reason an Amazon India listing is not ranking is one
            of three things: the listing is not indexed for the target keyword,
            the backend search terms field is nearly empty, or the category is
            mapped incorrectly. Start by checking indexing: type your ASIN
            followed by the keyword in Amazon India's search bar. If your
            listing does not appear, it is not indexed and adding that keyword
            to your backend terms will fix it within 24 to 48 hours.
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div id="key-takeaways">
          <KeyTakeawaysBox
            title="Key Takeaways: Why Your Amazon India Listing Is Not Ranking"
            items={keyTakeaways}
            accentColor="#6366F1"
          />
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
            {TOC_ITEMS.map((t) => (
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
            {TOC_ITEMS.map((t) => (
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
            <div id="why-advice-fails">
              <SectionQA
                title="Why Does Most Amazon India Listing Advice Not Work?"
                paragraph1="Most SEO advice for Amazon listings is generic: add keywords to your title, write good bullet points, get more reviews. Sellers follow this advice and still end up on page 3 wondering what went wrong."
                paragraph2="Generic advice does not diagnose the actual problem. The 7 reasons a listing fails to rank are each different, each checkable, and each with a specific fix. Work through each in order and stop when you find yours."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#6366F1"
              backgroundColor="#DCE2FF"
              title="📌 How to Use This Guide"
              content="Each reason includes what the problem is, how to check for it, and how to fix it. Newer listings should start at Reason 1 and Reason 6. Listings that previously ranked and then dropped should start at Reason 3 and Reason 4."
            />

            {/* ── 7 REASONS SECTION ── */}
            <div id="seven-reasons">
              <SectionQA
                title="What Are the 7 Reasons Your Amazon India Listing Is Not Ranking?"
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* 7 Reasons Cards rendered directly below the section title */}
            <SevenReasonsCards
              reasons={sevenReasons}
              resolvedTheme={resolvedTheme}
            />

            <BlogImageSection
              imageSrc="/Blog1_amazon-listing-not-ranking-india_image2.png"
              altText="Keyword Gap Amazon India"
              caption="Seller Central Business Reports showing 3.1% Order Session Percentage against a category average of 8.4%. This conversion gap is a direct ranking signal Amazon uses to decide how prominently to show this listing."
            />

            <div id="which-reason-first">
              <SectionQA
                title="Which Reason Should You Check First?"
                paragraph1="Not all 7 reasons are equally likely depending on your listing's situation. Here is the order to check them based on how old your listing is and what has changed recently."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={keywordGapColumns} rows={keywordGapRows} />

            <BlogImageSection
              imageSrc="/Blog1_amazon-listing-not-ranking-india_image3.png"
              altText="Keyword Gap Amazon India"
              caption="Insydz rank tracking showing movement after fixing 3 of the 7 reasons on a real earphones listing. Three weeks after fixing backend keywords, category mapping, and running exact match Sponsored Products, the listing moved from not ranked to page 1 on two terms."
            />

            <div id="optimised-listing">
              <SectionQA
                title="What Does a Properly Optimised Amazon India Listing Look Like?"
                paragraph1="After fixing the relevant reason from the list above, use this benchmark to check your listing is fully optimised so the same problem does not return."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InsightCards columns={3} cards={keywordDiscoveryCards} />

            <div id="faq">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#6366F1" faqs={faqs} />

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
      <FinalCTA
        title="Stop Guessing Why Your Listing Is Not Ranking. Find Out in 60 Seconds."
        description="Insydz checks keyword indexing, rank position, and the gap between your listing and your top competitor. Free rank checker, no card needed."
        primaryButtonText="Check Your Listing Free →"
        primaryButtonHref="/signup"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#C55A00"
        secondaryColor="#F59E0B"
        stats={[
          {
            value: "7",
            label: "Fixable reasons",
          },
          {
            value: "48 hrs",
            label: "Backend fix indexes",
          },
          {
            value: "5,000+",
            label: "Indian sellers",
          },
          {
            value: "Free",
            label: "To start",
          },
        ]}
      />
    </div>
  );
}
