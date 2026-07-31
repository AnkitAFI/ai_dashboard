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
import { ArrowRight, FileText, Search, Shield } from "lucide-react";
import FeatureCTA from "../components/FeatureCTA";
import StepsList from "../components/NumberedCards";
import NumberedCards from "../components/NumberedCards";
import { title } from "process";
import Breadcrumb from "../components/Breadcrumb";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaNegativeReviewsAmazonIndia = {
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
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
      url: "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
      name: "How to Find Competitor Keywords on Amazon India",
      description:
        "Learn how to find competitor keywords on Amazon India, uncover hidden ranking opportunities, and improve your Amazon SEO using competitor keyword intelligence.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india#breadcrumb",
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
          name: "Find Competitor Keywords on Amazon India",
          item: "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india#article",
      headline:
        "How to Find Every Keyword Your Amazon India Competitor Is Ranking For (And Use It to Outrank Them)",
      description:
        "Discover exactly which keywords your Amazon India competitors rank for and use the gap to outrank them in 2026. Reverse ASIN research, keyword gap analysis, and listing optimisation.",
      image:
        "https://insydz.com/Banner_find-competitor-keywords-amazon-india.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-05-15",
      dateModified: "2026-05-15",
      keywords: [
        "amazon competitor keywords",
        "amazon keyword research india",
        "find competitor keywords amazon",
        "amazon seo india",
        "amazon keyword tracking",
        "amazon keyword intelligence",
      ],
      articleSection: "Seller Tools & Strategy",
      inLanguage: "en-IN",
      wordCount: 4400,
      timeRequired: "PT12M",
    },
  ],
};

const negativeReviewsKeyTakeaways = [
  "Your star rating is a conversion signal buyers act on in under a second. The drop from 4.2 to 3.9 looks small but sits right on the cliff where buyers default to a higher rated competitor.",
  "Reviews are also a ranking signal. Recent review velocity and average rating both feed how Amazon ranks and shows your listing, so a cluster of fresh negatives compounds quickly.",
  "One bad review is noise. The same complaint repeated across many reviews is a product, listing, or fulfilment signal. The pattern is the intelligence, not the individual review.",
  "Most negative reviews fall into fixable listing problems rather than true product faults. A wrong size chart or a misleading image creates more one star reviews than people realise.",
  "You cannot reply publicly to a review, but Brand Registered sellers can privately contact a critical reviewer through Seller Central and often get the review updated or removed.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────

const negativeReviewsTOC = [
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "ranking-signal", label: "Reviews as a Ranking Signal" },
  { id: "rating-cliff", label: "The 4.2 to 3.9 Cliff" },
  {
    id: "pattern-is-intelligence",
    label: "Why the Pattern Is the Intelligence",
  },
  { id: "reading-analytically", label: "Reading Reviews Analytically" },
  { id: "what-to-fix-first", label: "What to Fix First" },
  { id: "how-to-respond", label: "How to Respond Properly" },
  { id: "detecting-fake-reviews", label: "Detecting Fake Reviews" },
  { id: "faq", label: "FAQs" },
];

const negativeReviewsSteps = [
  {
    title: "Group your negatives by theme, not by date",
    description:
      "Pull every review at 3 stars and below and sort them into the five buckets: packaging, sizing, quality, listing mismatch, and delivery. Count each. This single step replaces hours of emotional reading with a five line summary you can act on.",
  },
  {
    title: "Identify the single largest cluster",
    description:
      "The biggest count is your priority. If packaging is 11 of 23 negatives, packaging is the fix that removes the most future one star reviews. Resist the urge to fix the loudest review. Fix the most common complaint.",
  },
  {
    title: "Classify the cluster as listing, product, or fulfilment",
    description:
      "Listing problems mean you set the wrong expectation. Product problems mean the item underperforms in use. Fulfilment problems mean damage or delay in transit. The classification decides both what you change and how quickly you can change it.",
  },
  {
    title: "Fix the listing issues first",
    description:
      "Update the size chart, replace the misleading image, correct the specification, and rewrite any bullet that overpromises. These changes go live in minutes and stop new reviews of the same type almost immediately. Most sellers find a meaningful share of their negatives were listing problems all along.",
  },
  {
    title: "Address product and fulfilment causes in parallel",
    description:
      "Raise durability and quality faults with your supplier and switch fragile items to sturdier packaging or to FBA where handling is more consistent. These take weeks rather than minutes, so start them now while the listing fixes are already working.",
  },
  {
    title: "Track rating velocity for the next 30 days",
    description:
      "Watch the share of incoming reviews that are positive. As fixes land, fresh positive reviews start lifting your average, and because Amazon weights recent reviews heavily, the recovery shows up faster than the slow decline did. Insydz tracks this daily so you know the fix is working before your rating fully recovers.",
  },
];

const negativeReviewsKeywordGapColumns: TableColumn[] = [
  {
    key: "rating",
    label: "VISIBLE RATING",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "buyerRead",
    label: "HOW BUYERS READ IT",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "searchImpact",
    label: "SEARCH CLICK IMPACT",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "conversionImpact",
    label: "CONVERSION IMPACT",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
];

const negativeReviewsKeywordGapRows: TableRow[] = [
  {
    rowClassName: "bg-[#F4F7FC]",

    rating: {
      value: "4.5 and above",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    buyerRead: "Trusted, default choice",

    searchImpact: {
      type: "chip",
      label: "Baseline",
      className: "bg-[#D8F0DD] text-[#067647] px-4 py-1 font-semibold",
    },

    conversionImpact: {
      type: "chip",
      label: "Baseline",
      className: "bg-[#D8F0DD] text-[#067647] px-4 py-1 font-semibold",
    },
  },

  {
    rating: "4.2 to 4.4",

    buyerRead: "Still safe",

    searchImpact: {
      type: "chip",
      label: "Slight dip",
      className: "bg-[#D8F0DD] text-[#067647] px-4 py-1 font-semibold",
    },

    conversionImpact: {
      type: "chip",
      label: "Slight dip",
      className: "bg-[#D8F0DD] text-[#067647] px-4 py-1 font-semibold",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    rating: "4.0 to 4.1",

    buyerRead: "Acceptable, with hesitation",

    searchImpact: {
      type: "chip",
      label: "Noticeable",
      className: "bg-[#FDF0C7] text-[#A04B00] px-4 py-1 font-semibold",
    },

    conversionImpact: {
      type: "chip",
      label: "Noticeable",
      className: "bg-[#FDF0C7] text-[#A04B00] px-4 py-1 font-semibold",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    rating: {
      value: "3.8 to 3.9",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    buyerRead: "Reads as risky",

    searchImpact: {
      type: "chip",
      label: "Sharp drop",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1 font-semibold",
    },

    conversionImpact: {
      type: "chip",
      label: "Sharp drop",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1 font-semibold",
    },
  },

  {
    rating: "Below 3.8",

    buyerRead: "Avoided unless cheapest",

    searchImpact: {
      type: "chip",
      label: "Severe",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1 font-semibold",
    },

    conversionImpact: {
      type: "chip",
      label: "Severe",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1 font-semibold",
    },
  },
];

const negativeReviewsKeywordGapColumns1: TableColumn[] = [
  {
    key: "review",
    label: "WHAT THE REVIEW SAYS",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "meaning",
    label: "WHAT IT USUALLY MEANS",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "fix",
    label: "WHERE TO FIX",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "speed",
    label: "FIX SPEED",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
];

const chipFast =
  "bg-[#D8F0DD] text-[#067647] px-4 py-1 rounded-full font-semibold";

const chipMedium =
  "bg-[#FDF0C7] text-[#A04B00] px-4 py-1 rounded-full font-semibold";

const chipSlow =
  "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1 rounded-full font-semibold";

const chipVaries =
  "bg-[#E8EEF8] text-[#334155] px-4 py-1 rounded-full font-semibold";

const negativeReviewsKeywordGapRows1: TableRow[] = [
  {
    rowClassName: "bg-[#F4F7FC]",

    review: {
      value: "Arrived damaged or broken",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    meaning: "Packaging or transit handling",

    fix: {
      value: "Fulfilment /\npackaging",
      className: "whitespace-pre-line",
    },

    speed: {
      type: "chip",
      label: "Medium",
      className: chipMedium,
    },
  },

  {
    review: "Smaller or larger than expected",

    meaning: {
      value: "Size information set wrong\nexpectation",
      className: "whitespace-pre-line",
    },

    fix: {
      value: "Listing (size chart,\nimages)",
      className: "whitespace-pre-line",
    },

    speed: {
      type: "chip",
      label: "Fast",
      className: chipFast,
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    review: {
      value: "Stopped working after a few\nweeks",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3 whitespace-pre-line",
    },

    meaning: {
      value: "Genuine quality or durability\nfault",
      className: "whitespace-pre-line",
    },

    fix: "Product / supplier",

    speed: {
      type: "chip",
      label: "Slow",
      className: chipSlow,
    },
  },

  {
    review: "Not as shown in the pictures",

    meaning: {
      value: "Misleading images or\noverclaimed copy",
      className: "whitespace-pre-line",
    },

    fix: "Listing",

    speed: {
      type: "chip",
      label: "Fast",
      className: chipFast,
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    review: {
      value: "Delivered very late",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    meaning: {
      value: "Fulfilment method or stock\nlocation",
      className: "whitespace-pre-line",
    },

    fix: {
      value: "Fulfilment (consider\nFBA)",
      className: "whitespace-pre-line",
    },

    speed: {
      type: "chip",
      label: "Medium",
      className: chipMedium,
    },
  },

  {
    review: {
      value: "Generic 1 star, no text, sudden\ncluster",
      className: "whitespace-pre-line",
    },

    meaning: "Possible fake or competitor activity",

    fix: "Report to Amazon",

    speed: {
      type: "chip",
      label: "Varies",
      className: chipVaries,
    },
  },
];

const negativeReviewsDiscoveryCards = [
  {
    icon: <Search size={24} />,
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",

    title: "Detect the Warning Signs",

    description: (
      <>
        Watch for a sudden cluster of one star reviews with no written text or
        generic wording, reviews that arrive exactly as your rank improves, and
        accounts with no verified purchase or thin review history. Real
        complaints describe a specific problem. Planted ones rarely do.
      </>
    ),

    chips: [
      {
        label: "Spot the cluster",
        bg: "#FCE7E7",
        color: "#C81E1E",
      },
    ],
  },

  {
    icon: <FileText size={24} />,
    iconBg: "#FEF3C7",
    iconColor: "#D97706",

    title: "Report With Evidence",

    description: (
      <>
        Use the Report Abuse link on the review, or the Report a Violation tool
        available to Brand Registered sellers. Submit screenshots, dates, and
        the specific policy you believe is broken. Clear evidence and a calm,
        factual report get acted on faster than a frustrated complaint.
      </>
    ),

    chips: [
      {
        label: "Brand Registry helps",
        bg: "#FEF7E6",
        color: "#9A5412",
      },
    ],
  },

  {
    icon: <Shield size={24} />,
    iconBg: "#EEF4FF",
    iconColor: "#2563EB",

    title: "Do Not Over Attribute",

    description: (
      <>
        The risk is convincing yourself every bad review is sabotage. Most are
        not. Work the pattern first and treat fake reviews as the small residual
        that does not fit a real cause. Genuine fixable complaints are far more
        common, and far more valuable to act on.
      </>
    ),

    chips: [
      {
        label: "Stay honest",
        bg: "#E8F0FE",
        color: "#1D4ED8",
      },
    ],
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const negativeReviewsFaqs = [
  {
    q: "How many negative reviews does it take to hurt my Amazon ranking in India?",
    a: "There is no fixed number. What matters is the effect on your average rating and your recent review velocity. A few one-star reviews that pull your average below 4.0 do more damage than a larger number that keeps you above 4.3. Amazon weights recent reviews more heavily, so a short cluster of negatives can move both your visible rating and your ranking faster than the same reviews spread across a year.",
  },
  {
    q: "Can I respond to negative reviews on Amazon India?",
    a: "You cannot publicly comment on a product review anymore. If you are enrolled in Brand Registry, you can use the Customer Reviews tool in Seller Central to privately contact a buyer who left a critical review and offer a courtesy refund or support. For order-related issues you can use Buyer-Seller Messaging. Resolving the problem privately often leads the buyer to update or remove the review themselves.",
  },
  {
    q: "Does a rating below 4 stars significantly reduce sales?",
    a: "Yes. The drop below 4.0 is the sharpest part of the curve. Amazon India buyers read the star rating before anything else, and a listing showing 3.9 reads as risky while 4.0 reads as acceptable. The gap between 4.2 and 3.9 looks small but typically costs a meaningful share of clicks from search and a larger share of conversions, because hesitant buyers default to the higher-rated competitor.",
  },
  {
    q: "How do I identify the pattern in my negative reviews quickly?",
    a: "Stop reading reviews one by one in date order. Group them by theme instead: packaging and damage, size and fit, quality and durability, listing mismatch, and delivery. One review per theme is noise. Five or more naming the same theme is a signal you can act on. Insydz reads every review and surfaces these clusters automatically, so you see the dominant complaint without reading all of them manually.",
  },
  {
    q: "Can competitors plant fake negative reviews on my listing?",
    a: "It happens, though Amazon detects and removes much of it. Warning signs include a sudden cluster of one-star reviews with no text or generic wording, reviews that arrive right as your rank improves, and accounts with no verified purchase or thin history. If you see these signs, report the reviews through the Report Abuse link or the Report a Violation tool for Brand Registered sellers, with screenshots and dates as evidence.",
  },
  {
    q: "How fast can a damaged rating recover on Amazon India?",
    a: "Faster than it fell, if you fix the cause. Because Amazon weights recent reviews heavily, a steady run of fresh positive reviews lifts your average more quickly than the slow accumulation of old negatives held it down. Sellers who fix their dominant complaint cluster commonly see their rating climb back above 4.0 within four to eight weeks, provided the underlying problem is genuinely resolved.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function NegativeReviewsAmazonIndiaContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("what-is-private-label");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = "insydz-negative-reviews-amazon-india-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaNegativeReviewsAmazonIndia);
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
      for (let i = negativeReviewsTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(negativeReviewsTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(negativeReviewsTOC[i].id);
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
      for (let i = negativeReviewsTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(negativeReviewsTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(negativeReviewsTOC[i].id);
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

  interface NegativeReviewsArticleImgProps {
    src: string;
    alt: string;
    caption?: string;
  }
  function NegativeReviewsArticleImg({
    src,
    alt,
    caption,
  }: NegativeReviewsArticleImgProps) {
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
            label: "Negative Reviews Impact Amazon India Sales",
          },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Review Intelligence"
        title={
          <>
            How <span style={{ color: "#6366F1" }}>Negative Reviews </span>Are
            Killing <br />
            Your Amazon India Sales
          </>
        }
        description={
          <>
            You have 23 one star reviews. You have read three of them. The other
            20 contain the exact reason your sales are <br /> dropping, and you
            do not know what they say. This guide turns your reviews from an
            emotional problem into an <br /> analytical one, so you can find the
            pattern and fix it.
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
          imageSrc="/How Negative Reviews Are Killing Your Amazon India Sales.png"
          altText="Negative Reviews Impact Amazon India Sales"
          caption="Insydz review sentiment view. The same 23 negative reviews, grouped by theme. Eleven name packaging damage, six name sizing, four name durability. The dominant cluster tells you exactly what to fix first, which no single review ever does."
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
            Negative reviews hurt your Amazon India sales in two ways: they
            lower your star rating, which is a conversion signal buyers act on
            instantly, and they slow your review velocity, which Amazon reads as
            a ranking signal. The fix is not to read reviews one by one and feel
            discouraged. Group every review at 3 stars and below by theme, find
            the single largest complaint cluster, classify it as a listing,
            product, or fulfilment problem, and fix the listing issues first
            because they are fastest. Insydz reads every review and surfaces the
            dominant pattern automatically, so you act on the signal instead of
            drowning in individual complaints.
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div id="key-takeaways">
          <KeyTakeawaysBox
            title="Key Takeaways: Competitor Keyword Research on Amazon India"
            items={negativeReviewsKeyTakeaways}
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
            {negativeReviewsTOC.map((t) => (
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
            {negativeReviewsTOC.map((t) => (
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
            <div id="ranking-signal">
              <SectionQA
                title="Why Does Amazon Treat Your Reviews as a Ranking Signal, Not Just Reputation?"
                paragraph1="Most sellers think of reviews as reputation, a score that buyers glance at before deciding. That is half the picture. Amazon's search algorithm reads your reviews too, and it reads them as evidence of listing quality. A listing that keeps earning fresh positive reviews is, to the algorithm, a listing that satisfies buyers. A listing whose recent reviews skew negative is a listing the algorithm becomes cautious about ranking."
                paragraph2="Two properties of your reviews feed this. The first is your average star rating, which influences both how often your listing is shown and how often shoppers click it. The second is review velocity, the rate at which fresh reviews arrive. A sudden run of negative reviews changes both at once, which is why a bad patch compounds faster than the raw number of reviews suggests."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#6366F1"
              backgroundColor="#DCE2FF"
              title="📊 Why It Compounds"
              content="Negative reviews create a loop. Lower rating reduces clicks from search, fewer clicks reduces sales velocity, lower sales velocity reduces ranking, lower ranking reduces traffic, and a smaller, more frustrated buyer pool tends to leave a higher share of negative reviews. Left alone, the loop tightens. Broken early with a clear fix, it reverses just as steadily as it fell."
            />

            <p
              style={{
                margin: "0 0 16px",
                fontSize: 15.5,
                color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                lineHeight: 1.75,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              This is why treating reviews emotionally is the costly mistake.
              The seller who reads three angry reviews, feels stung, and closes
              the tab has learned nothing actionable. The seller who counts the
              themes across all of them has a repair brief. The rest of this
              guide is about becoming the second seller.
            </p>

            <div id="rating-cliff">
              <SectionQA
                title="What Does Dropping From 4.2 to 3.9 Stars Actually Do to Your Sales?"
                paragraph1="The number looks trivial. Three tenths of a star. In practice it crosses the most important psychological line on Amazon India: the gap between a listing that reads as four stars and one that reads as under four. Buyers scanning a results page read the rating before the title, before the price, before the image detail. A 4.0 reads as acceptable. A 3.9 reads as risky."
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* Blog Image Section */}
            <BlogImageSection
              imageSrc="/Negative Reviews Impact Amazon India Sales_image1.png"
              altText="Negative Reviews Impact Amazon India Sales"
              caption="Conversion index by visible star rating on Amazon India. The decline is gentle from 4.5 to 4.2, then turns sharp as the rating crosses below 4.0, where hesitant buyers move to the higher rated competitor. The figures are illustrative of the pattern, not a single category measurement."
            />

            <p
              style={{
                margin: "0 0 16px",
                fontSize: 15.5,
                color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                lineHeight: 1.75,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Two effects stack here. The first is click through from search:
              many buyers filter results mentally by the star badge and skip
              anything that reads under four. The second is conversion on the
              product page itself, where a sub four rating gives an already
              cautious buyer a reason to compare your listing against the next
              option. The buyer who would have bought at 4.2 hesitates at 3.9,
              and on Amazon hesitation almost always means they buy from someone
              else.
            </p>

            <DataTable
              columns={negativeReviewsKeywordGapColumns}
              rows={negativeReviewsKeywordGapRows}
            />

            <InfoBanner
              accentColor="#E67E22"
              title="⚠️ The Recency Trap"
              content="Amazon weights recent reviews more heavily in both the rating shown and the algorithm's read of your listing. This means a cluster of three or four fresh negatives can move your visible rating faster than dozens of old reviews held it steady. It cuts the other way too: a run of fresh positive reviews recovers your rating faster than the raw total of past reviews implies, which is why fixing the cause quickly matters so much."
            />

            <div id="pattern-is-intelligence">
              <SectionQA
                title="Why Is the Pattern in Your Reviews the Real Intelligence?"
                paragraph1="Here is the mistake almost every seller makes. They open their reviews, read the most recent few, react to whichever one is angriest, and close the page. They have now learned one buyer's bad day. They have not learned what is actually wrong with their product or listing."
                paragraph2="One negative review is noise. A buyer received a unit with a genuine defect, or had unrealistic expectations, or simply had a bad week. You cannot run a business off a single data point. But ten negative reviews that all mention the same thing, the box arrived crushed, the size ran small, the cable frayed in a month, are no longer noise. They are a signal with a clear cause, and the cause is something you can fix."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              title="⊘ WHAT READING ONE BY ONE HIDES"
              content="When you read reviews in date order, the pattern is invisible. A packaging complaint from March, a sizing complaint from April, and a durability complaint from May feel like three unrelated unlucky events. Counted together across all 23 reviews, the truth appears: 11 are packaging, 6 are sizing, 4 are durability. The dominant cluster was always there. Reading sequentially is simply the wrong tool to see it."
              accentColor="#EF4444"
              backgroundColor="#FEF2F2"
            />

            <p
              style={{
                margin: "0 0 20px",
                fontSize: 15.5,
                color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                lineHeight: 1.75,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              This is the core shift this guide asks of you. Stop treating
              reviews as individual verdicts to react to and start treating them
              as a dataset to count. The moment you group them by theme, the
              loudest single review stops mattering and the most common
              complaint takes over. That common complaint is your repair brief.
            </p>

            <div id="reading-analytically">
              <SectionQA
                title="How Do You Read Your Negative Reviews Analytically?"
                paragraph1="Analytical reading means sorting every review at 3 stars and below into a small set of themes, then counting. You are not trying to address each review. You are trying to find the one or two themes that explain most of your negatives. Almost every category's complaints fall into five buckets."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/Negative Reviews Impact Amazon India Sales_image2.png"
              altText="Negative Reviews Impact Amazon India Sales"
              caption="Complaint clustering. The same negative reviews sorted into five themes and counted. The packaging cluster is nearly half the total, which makes it the obvious first fix. No single review tells you this. Only the count does."
            />

            <DataTable
              columns={negativeReviewsKeywordGapColumns1}
              rows={negativeReviewsKeywordGapRows1}
            />

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#E5FCF7"
              title="✅ The Listing Mismatch Surprise"
              content="Sellers brace for the worst, that the product itself is bad. More often the largest cluster is a listing mismatch: a size chart that runs optimistic, a hero image that flatters the colour, a bullet that promises a feature the product does not quite deliver. These create real one star reviews from buyers who feel misled, even when the product is fine. They are also the fastest and cheapest fixes you have, which is good news hiding inside bad reviews."
            />

            <FeatureCTA
              title="Insydz reads every review and surfaces the pattern automatically"
              description="Stop reading reviews one by one. See your complaint clusters, your sentiment trend, and your rating velocity in one view, in under 60 seconds."
              buttonText="Try the Free Review Checker →"
              buttonHref="/signup"
              backgroundColor="#111827"
              buttonColor="#6366F1"
            />

            <div id="what-to-fix-first">
              <SectionQA
                title="What Should You Fix First: Listing, Product, or Fulfilment?"
                paragraph1="Once you know your dominant cluster, the next decision is sequencing. Not every fix takes the same time or money, so you fix in order of speed and impact. The rule is simple: fix the listing first because it is fastest, then chase product and fulfilment causes in parallel because they take longer."
                resolvedTheme={resolvedTheme}
              />
            </div>
            <NumberedCards
              items={negativeReviewsSteps}
              numberColor="#2F63F5"
              backgroundColor="#F8FAFC"
              borderColor="#D7E3FF"
            />

            <BlogImageSection
              imageSrc="/Negative Reviews Impact Amazon India Sales_image3.png"
              altText="Negative Reviews Impact Amazon India Sales"
              caption="Insydz rating velocity view. After a Jaipur seller fixed the packaging cluster behind 48% of their negatives, new one star reviews fell, fresh positives lifted the average from 3.9 back to 4.3, and conversion recovered. The figures illustrate a typical recovery pattern."
            />

            <div id="how-to-respond">
              <SectionQA
                title="How Do You Respond to Negative Reviews Properly on Amazon India?"
                paragraph1="First, an important correction to a common belief. You can no longer reply publicly to a product review. Amazon removed seller comments on reviews, so the old habit of posting a defensive reply underneath a one star review is no longer possible, and was rarely a good idea anyway. What you can still do, used well, often works better."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <section aria-labelledby="reverse-asin-heading">
              <h3
                id="reverse-asin-heading"
                style={{
                  color: "#1D4ED8",
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "28px",
                  lineHeight: 1.3,
                }}
              >
                What You Can Actually Do
              </h3>

              <ul
                style={{
                  paddingLeft: "24px",
                  marginBottom: "28px",
                  listStyleType: "disc",
                  listStylePosition: "outside",
                  fontSize: "16px",
                  lineHeight: 1.8,
                  fontFamily: "'Lora', serif",
                }}
              >
                {[
                  {
                    label: "Brand Registry Customer Reviews tool:",
                    text: "If you are enrolled in Brand Registry, Seller Central lets you privately contact a buyer who left a critical review of your branded product. You can offer a courtesy refund or a support message. A buyer whose problem is genuinely solved will often update or remove the review on their own.",
                  },
                  {
                    label: "Buyer Seller Messaging:",
                    text: "For order related issues such as a damaged or late delivery, reach the buyer through the order to resolve the specific problem. This addresses the cause directly rather than arguing about the review.",
                  },
                  {
                    label: "Report genuinely abusive or fake reviews:",
                    text: "Reviews that break Amazon's policies, contain abusive language, or look like competitor planted content can be reported for removal. More on detecting these below.",
                  },
                ].map(({ label, text }, i, arr) => (
                  <li
                    key={label}
                    style={{
                      marginBottom: i < arr.length - 1 ? "12px" : 0,
                      color: "#1D4ED8", // bullet inherits this
                    }}
                  >
                    <span
                      style={{
                        color: resolvedTheme === "dark" ? "#CBD5E1" : "#334155",
                      }}
                    >
                      <strong>{label}</strong> {text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <InfoBanner
              accentColor="#6366F1"
              backgroundColor="#DCE2FF"
              title="📌 What to Say, and What Not to Say"
              content="When you do reach a buyer privately, lead with acknowledgement, not defence. A short message that owns the problem, explains the fix you have made, and offers a refund or replacement repairs trust far more effectively than any justification. Do not argue, do not blame the buyer, and never offer anything in exchange for changing a review, which violates Amazon policy. Solve the real problem and let the buyer decide what to do with the review."
            />

            <p
              style={{
                margin: "0 0 16px",
                fontSize: 15.5,
                color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                lineHeight: 1.75,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              The deeper point is that responding to reviews one at a time is
              damage control, not strategy. The seller who privately resolves
              ten packaging complaints has spent real effort and still has a
              packaging problem. The seller who fixes the packaging has removed
              the source. Responding well matters, but it is downstream of
              fixing the pattern.
            </p>

            <div id="detecting-fake-reviews">
              <SectionQA
                title="Can Competitors Plant Fake Negative Reviews, and How Do You Detect Them?"
                paragraph1="It does happen, although Amazon's systems detect and remove a large share of it. If you have done the analytical work above and a portion of your negatives simply does not fit any real pattern, fake reviews are worth investigating. Here is how to spot them and what to do."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InsightCards columns={3} cards={negativeReviewsDiscoveryCards} />

            <InfoBanner
              accentColor="#E67E22"
              title="⚠️ A Word of Caution"
              content="Reporting a review only works when it genuinely breaks Amazon's policies. A negative review you simply disagree with is not abuse, and reporting honest criticism wastes the channel you will need when a real fake appears. Reserve reports for clear policy violations and let your product and listing fixes handle the honest negatives."
            />

            <div id="faq">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#6366F1" faqs={negativeReviewsFaqs} />

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
        title="Your Negative Reviews Already Told You What to Fix. You Just Have Not Counted Them Yet."
        description="Stop reading reviews one by one and feeling discouraged. Let Insydz group every review into a clear pattern, show you the one fix that removes the most one star reviews, and track your rating back above the cliff."
        primaryButtonText="Check Your Review Sentiment Free →"
        primaryButtonHref="/signup"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#2454E6"
        secondaryColor="#4F6EF7"
        stats={[
          {
            value: "5,000+",
            label: "Indian sellers",
          },
          {
            value: "5",
            label: "Themes explain most negatives",
          },
          {
            value: "6 weeks",
            label: "Typical rating recovery",
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
