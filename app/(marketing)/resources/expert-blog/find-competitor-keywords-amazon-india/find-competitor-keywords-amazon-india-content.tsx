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
import { ArrowRight, FileText, Search } from "lucide-react";
import FeatureCTA from "../components/FeatureCTA";
import StepsList from "../components/NumberedCards";
import NumberedCards from "../components/NumberedCards";
import { title } from "process";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaFindCompetitorKeywordsAmazonIndia = {
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

const keyTakeaways = [
  "The biggest ranking gains come from keywords you are not targeting at all, not from small improvements to keywords you already rank for.",
  "Reverse ASIN lookup shows every keyword a competitor's product ranks for in Amazon search, including terms you would never have thought to target.",
  "Backend search terms are the fastest way to add gap keywords without redesigning your listing. You can be indexed for 10 new terms in under 30 minutes.",
  "Search frequency rank is the best proxy for keyword demand on Amazon India. Focus first on gap keywords with a search frequency rank under 50,000.",
  "Hindi transliterations of product names are systematically under targeted by most sellers and offer low competition, high conversion opportunities, especially for tier 2 and tier 3 city buyers.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────

const TOC = [
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "what-changed", label: "What Changed in March 2026" },
  { id: "categories", label: "Which Categories Are Affected" },
  { id: "profit-math", label: "Real Math: Profit Per Unit" },
  { id: "drop-to-999", label: "Drop to ₹999 or Pocket Margin?" },
  { id: "competitor-reaction", label: "How Competitors Are Reacting" },
  { id: "reinvest-margin", label: "Reinvest the Freed Margin" },
  { id: "faq", label: "FAQs" },
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

const keywordGapColumns: TableColumn[] = [
  {
    key: "keyword",
    label: "KEYWORD",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "searchFreq",
    label: "SEARCH FREQ. RANK",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "competitorRank",
    label: "COMPETITOR RANK",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "yourRank",
    label: "YOUR RANK",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "gapType",
    label: "GAP TYPE",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
];

const keywordGapRows: TableRow[] = [
  {
    rowClassName: "bg-[#F4F7FC]",

    keyword: {
      value: "bluetooth earphones under 500",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    searchFreq: "12,400",
    competitorRank: "#4",
    yourRank: "Not ranked",

    gapType: {
      type: "chip",
      label: "Hard gap",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1",
    },
  },

  {
    keyword: "earphone with mic for calls",
    searchFreq: "28,700",
    competitorRank: "#7",
    yourRank: "#34",

    gapType: {
      type: "chip",
      label: "Weak rank",
      className: "bg-[#F6E7B7] text-[#A04B00] px-4 py-1",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    keyword: {
      value: "ईयरफोन 500 से कम (Hindi)",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    searchFreq: "41,200",
    competitorRank: "#3",
    yourRank: "Not ranked",

    gapType: {
      type: "chip",
      label: "Hard gap",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1",
    },
  },

  {
    keyword: "wired earphone with volume control",
    searchFreq: "67,800",
    competitorRank: "#6",
    yourRank: "#28",

    gapType: {
      type: "chip",
      label: "Weak rank",
      className: "bg-[#F6E7B7] text-[#A04B00] px-4 py-1",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    keyword: {
      value: "earphone for study music",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    searchFreq: "88,300",
    competitorRank: "#11",
    yourRank: "Not ranked",

    gapType: {
      type: "chip",
      label: "Hard gap",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1",
    },
  },

  {
    keyword: "tangle free earphone india",
    searchFreq: "112,400",
    competitorRank: "#5",
    yourRank: "#41",

    gapType: {
      type: "chip",
      label: "Weak rank",
      className: "bg-[#F6E7B7] text-[#A04B00] px-4 py-1",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    keyword: {
      value: "earphone 6 months warranty",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    searchFreq: "134,700",
    competitorRank: "#9",
    yourRank: "Not ranked",

    gapType: {
      type: "chip",
      label: "Hard gap",
      className: "bg-[#FBE2E2] text-[#C81E1E] px-4 py-1",
    },
  },

  {
    keyword: "best sound earphone 2026",
    searchFreq: "8,900",
    competitorRank: "#12",
    yourRank: "#9",

    gapType: {
      type: "chip",
      label: "You rank",
      className: "bg-[#D8F0DD] text-[#067647] px-4 py-1",
    },
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
    icon: <Search size={24} />,
    iconBg: "#EEF2FF",
    iconColor: "#2563EB",

    title: "Amazon Search Bar Method",

    description: (
      <>
        Type the first 1 to 2 words of your competitor's product category into
        the Amazon India search bar and watch the autocomplete suggestions
        appear.
        <br />
        <br />
        Each suggestion is a real search term buyers use. Compare these to your
        current listing keywords. Any term not in your listing is a gap worth
        considering.
      </>
    ),

    chips: [
      {
        label: "Free · 20 min",
        bg: "#EEF2FF",
        color: "#1D4ED8",
      },
    ],
  },

  {
    icon: <FileText size={24} />,
    iconBg: "#FEF3C7",
    iconColor: "#D97706",

    title: "Seller Central Brand Analytics",

    description: (
      <>
        Brand Registry sellers can access the Search Terms report in Brand
        Analytics. It shows search frequency rank for any term you type.
        <br />
        <br />
        Use this to validate the demand of gap keywords you have identified
        manually before adding them to your listing.
      </>
    ),

    chips: [
      {
        label: "Free with Brand Registry",
        bg: "#F7EFD8",
        color: "#9A5412",
      },
    ],
  },

  {
    icon: <ArrowRight size={24} />,
    iconBg: "#DDF5E8",
    iconColor: "#059669",

    title: "Insydz Reverse ASIN Lookup",

    description: (
      <>
        The complete method. Paste your competitor's ASIN and get their full
        keyword footprint: 50 to 150 keywords with search frequency rank, their
        rank position, and your current rank, all in one dashboard.
        <br />
        <br />
        The gap keywords are pre-filtered and sorted by priority.
      </>
    ),

    chips: [
      {
        label: "Complete · Free to start",
        bg: "#DDF5E8",
        color: "#065F46",
      },
    ],
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "How do I find keywords my Amazon competitor ranks for but I do not?",
    a: "Paste a competitor's ASIN into Insydz and it shows every search term they rank for alongside your current rank. Filter to keywords where you rank below position 20, sort by search frequency rank, and add the top 5 to 10 to your backend search terms today.",
  },
  {
    q: "What is reverse ASIN keyword research?",
    a: "Reverse ASIN research means looking up which keywords an ASIN currently ranks for in Amazon search results, rather than starting with keywords and checking rankings. You start with your competitor's product and work backward to discover all the search terms driving their organic visibility, including terms you would never have thought to target.",
  },
  {
    q: "Which keywords drive the most sales on Amazon India?",
    a: "Long-tail keywords with buying intent convert at 2 to 3 times the rate of broad head terms. Terms that include specifications, use cases, or words like 'best' or 'buy' signal purchase intent. For Amazon India specifically, Hindi transliterations of product names often have lower competition but strong conversion among tier-2 and tier-3 city buyers.",
  },
  {
    q: "How many keywords should I target per product listing?",
    a: "Your title and bullets support 8 to 15 primary and secondary keywords naturally. The backend search terms field gives 250 bytes for additional keywords that do not appear in visible copy. A well-optimised listing should be indexed for 40 to 80 unique search terms in total, including Hindi transliterations for Amazon India.",
  },
  {
    q: "Can I find competitor backend keywords legally?",
    a: "You cannot read backend keywords directly as Amazon keeps those private. Reverse ASIN tools work out which keywords an ASIN ranks for by checking search results across thousands of terms. This gives you a near-complete picture of their keyword footprint without accessing any private data.",
  },
  {
    q: "How long does it take to rank for a new keyword on Amazon India?",
    a: "Amazon indexes backend search terms within 24 to 48 hours of saving them. Organic rank improvement on those terms then depends on generating sales velocity. Running exact match Sponsored Products on the gap keyword for 5 to 7 days typically produces enough sales signals to move from unranked to page 2 or page 1 within 2 to 4 weeks.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function FindCompetitorKeywordsAmazonIndiaContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("what-is-private-label");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = "insydz-find-competitor-keywords-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(
      schemaFindCompetitorKeywordsAmazonIndia,
    );
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

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto}}
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
            Competitor Undercutting Your Amazon India Price
          </span>
        </div>
      </div>

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="PRICING INTELLIGENCE"
        title={
          <>
            How to Find Every Keyword Your{" "}
            <span style={{ color: "#6366F1" }}>
              Amazon <br /> India Competitor
            </span>{" "}
            Is Ranking For, and <br /> Use It to Outrank Them
          </>
        }
        description={
          <>
            Your competitor is ranking for 47 keywords you have never targeted.
            Some of them are your category's highest converting terms.
            <br />
            Knowing about it and acting on it are two very different things.
            This guide gives you the method.
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
        tags={["Keyword Intelligence", "SEO Organic"]}
      />

      {/* Blog Image Section */}
      <BlogImageSection
        imageSrc="/Blog2_find-competitor-keywords-amazon-india_BlogBanner.png"
        altText="Competitor Keywords Amazon India"
        caption="Insydz keyword gap analysis. Your ASIN ranks for 63 keywords while the category leader ranks for 110. The 47 keyword gap contains the highest priority ranking opportunities, including 19 high intent and 8 Hindi terms you are missing entirely."
      />

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
            To find keywords your Amazon India competitor ranks for that you do
            not: run a reverse ASIN lookup on your top competitor using Insydz.
            It shows every keyword their ASIN ranks for alongside your current
            rank for each term. Filter to keywords where you rank below position
            20 or do not appear at all. Sort by search frequency rank. Add the
            top 5 to 10 gap keywords to your backend search terms field today.
            That alone can move you from invisible to page 1 for those terms
            within 3 to 4 weeks.
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div id="key-takeaways">
          <KeyTakeawaysBox
            title="Key Takeaways: Competitor Keyword Research on Amazon India"
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
            <SectionQA
              title="Why Is Keyword Gap Analysis the Fastest Path to Organic Rank Gains?"
              paragraph1="Most Amazon India sellers optimise their listings in isolation, looking at their own title, bullets, and backend keywords and trying to improve what they already have. This has a ceiling: the words you have not thought of are not there to improve."
              paragraph2="Keyword gap analysis flips the approach. Instead of starting with your own listing, you start with your competitor's ranking keywords and ask what you are missing. The gap is a ready made list of proven demand: someone is already searching, your competitor is already capturing it, and you are not."
              resolvedTheme={resolvedTheme}
            />

            <InfoBanner
              accentColor="#6366F1"
              backgroundColor="#DCE2FF"
              title="The Opportunity Size"
              content="In a typical Amazon India product category, the top ranked ASIN ranks for 80 to 150 keywords while a well optimised mid range seller ranks for 40 to 70. The gap of 40 to 80 missing keywords is traffic you are entirely invisible to, even though buyers are already searching and buying on those terms in your category."
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
              One gap keyword discovery can move a listing from page 3 to page 1
              for that specific term. This is not theoretical. It happens within
              2 to 4 weeks of adding a high demand gap keyword to your backend
              search terms and generating a few sales on that term through
              Sponsored Products.
            </p>

            <SectionQA
              title="What Is Reverse ASIN Research and How Does It Work?"
              paragraph1="Reverse ASIN research means working backward from a product to its keywords. You start with your competitor's ASIN (their Amazon product ID) and ask: which search terms does this product currently appear for in Amazon search results?"
              paragraph2="The process works because Amazon's search index can be observed. When a buyer searches a term and a product appears, that product keyword relationship is recorded. Reverse ASIN tools check thousands of search terms one by one against a given ASIN and return the full list of terms where that ASIN ranks, along with its position for each term."
              resolvedTheme={resolvedTheme}
            />

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
                What You Get From a Reverse ASIN Lookup
              </h3>

              <ul
                style={{
                  paddingLeft: "24px",
                  margin: 0,
                  listStyleType: "disc",
                  listStylePosition: "outside",
                  fontSize: "16px",
                  lineHeight: 1.8,
                  fontFamily: "'Lora', serif",
                }}
              >
                {[
                  {
                    label: "Keyword list:",
                    text: "every search term the competitor's ASIN ranks for, usually 50 to 150 terms for a well optimised product",
                  },
                  {
                    label: "Search frequency rank:",
                    text: "how often that term is searched on Amazon India. Lower number means higher demand.",
                  },
                  {
                    label: "Competitor's rank position:",
                    text: "are they at position 3 or position 28? This tells you how hard they are to displace on each term.",
                  },
                  {
                    label: "Your rank position:",
                    text: "where you currently appear for the same term, or if you do not appear at all.",
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
              accentColor="#E67E22"
              title="⚠️ What You Cannot Get"
              content="You cannot read a competitor's backend keywords directly. What reverse ASIN tools find instead is the visible result: the search terms the ASIN actually ranks for in Amazon's results. This captures the majority of the keyword picture, including the effect of backend terms, even though those terms themselves stay hidden."
            />

            <BlogImageSection
              imageSrc="/Blog2_find-competitor-keywords-amazon-india_image2.png"
              altText="Competitor Keywords Amazon India"
              caption="Insydz reverse ASIN lookup. Competitor keyword footprint revealed with search frequency rank, their position, and your current rank. Gap keywords (not ranked) and weak keywords (ranked below 20) are prioritised automatically."
            />

            <SectionQA
              title="What Does the Keyword Gap Actually Look Like in a Real Category?"
              paragraph1="Here is what a keyword gap analysis looks like in the earphones category on Amazon India, comparing a mid range seller to the category leader. The numbers are realistic for this category in 2026."
              resolvedTheme={resolvedTheme}
            />

            <DataTable columns={keywordGapColumns} rows={keywordGapRows} />

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              The hard gap keywords (terms you do not rank for at all) are where
              the biggest ranking opportunity sits. Adding "bluetooth earphones
              under 500" and "ईयरफोन 500 से कम" to your backend search terms and
              running 3 to 5 days of exact match Sponsored Products on each term
              is typically enough to get Amazon to index your listing for those
              terms within 2 weeks.
            </p>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#E5FCF7"
              title="✅ The Hindi Keyword Advantage"
              content="Hindi search terms are systematically under targeted by most sellers because most keyword tools do not surface them. They typically have lower competition, decent search volume from tier-2 and tier-3 city buyers, and high conversion rates because Hindi searching buyers tend to have strong purchase intent. Adding 5 to 8 Hindi gap keywords is usually 30 minutes of work and pays off disproportionately."
            />

            <SectionQA
              title="How Do You Prioritise Which Gap Keywords to Target First?"
              paragraph1="Not all gap keywords are equal. A gap keyword with a search frequency rank of 12,000 deserves more immediate attention than one with a rank of 800,000. Here is a simple prioritisation framework."
              resolvedTheme={resolvedTheme}
            />
            <NumberedCards
              items={steps}
              numberColor="#2F63F5"
              backgroundColor="#F8FAFC"
              borderColor="#D7E3FF"
            />
            <FeatureCTA
              title="Insydz shows every keyword your competitor ranks for that you do not"
              description="Run a reverse ASIN lookup on your top competitor and see your keyword gap in under 60 seconds."
              buttonText="Try Free With Your ASIN →"
              buttonHref="/signup"
              backgroundColor="#111827"
              buttonColor="#6366F1"
            />
            <SectionQA
              title="How Do You Add Gap Keywords to Your Listing Correctly?"
              paragraph1="Each part of your Amazon listing serves a different role in keyword indexing. Here is exactly where each type of gap keyword belongs."
              resolvedTheme={resolvedTheme}
            />
            <BlogImageSection
              imageSrc="/Blog2_find-competitor-keywords-amazon-india_image3.png"
              altText="Competitor Keywords Amazon India"
              caption="Keyword placement map showing where each type of gap keyword belongs in your Amazon India listing. Backend search terms are the fastest entry point: 250 bytes of invisible keyword real estate indexed within 48 hours."
            />
            <DataTable columns={listingColumns} rows={listingRows} />
            <BlogImageSection
              imageSrc="/Blog2_find-competitor-keywords-amazon-india_image4.png"
              altText="Competitor Keywords Amazon India"
              caption="Insydz rank tracking. A Pune earphones seller added 6 gap keywords to backend search terms and moved from not ranked to top 10 for 3 of them within 3 weeks. Organic revenue up 38% on those terms alone."
            />
            <SectionQA
              title="How Do You Find Competitor Keywords Without a Paid Tool?"
              paragraph1="If you want to start today before setting up Insydz, here are the two free manual methods. They are slower and incomplete, but they work well enough to find the most obvious gaps."
              resolvedTheme={resolvedTheme}
            />

            <InsightCards columns={3} cards={keywordDiscoveryCards} />

            <SectionQA
              title="Frequently Asked Questions"
              resolvedTheme={resolvedTheme}
            />

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
        title="Your Competitor's Keyword Gap Is Your Next Page-1 Opportunity"
        description="Find every keyword your top competitor ranks for that you do not. Add the top gaps to your backend search terms today. Track rank movement daily with Insydz."
        primaryButtonText="Find Your Keyword Gap Free →"
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
            value: "47",
            label: "Avg. gap keywords found",
          },
          {
            value: "3 weeks",
            label: "Typical page-1 time",
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
