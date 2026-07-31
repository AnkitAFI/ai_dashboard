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
  Clock3,
  FileText,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import FeatureCTA from "../components/FeatureCTA";
import StepsList from "../components/NumberedCards";
import NumberedCards from "../components/NumberedCards";
import { title } from "process";
import Breadcrumb from "../components/Breadcrumb";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaTopAmazonIndiaSellersHabits = {
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
        "https://insydz.com/resources/expert-blog/top-amazon-india-sellers-habits",
      url: "https://insydz.com/resources/expert-blog/top-amazon-india-sellers-habits",
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
          "https://insydz.com/resources/expert-blog/top-amazon-india-sellers-habits#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/top-amazon-india-sellers-habits#breadcrumb",
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
          item: "https://insydz.com/resources/expert-blog/top-amazon-india-sellers-habits",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/top-amazon-india-sellers-habits#article",
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

const topAmazonIndiaSellersHabitsKeyTakeaways = [
  "100 Amazon India seller accounts studied across 8 product categories including kitchen, fashion accessories, mobile accessories, personal care, earphones, stationery, toys, and home basics.",
  "Study period: 6 months of account data from January to June 2026, accessed with seller permission through the Insydz platform.",
  "Top 10% defined as sellers with consistent rank growth, revenue growth, and review count growth across all 6 months, not just peak months.",
  "Bottom 50% defined as sellers with flat or declining rank, revenue, or review velocity across the same period.",
  "All 5 habits below were identified by comparing behaviour patterns between the two groups, not by asking sellers what they do.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────

const topAmazonIndiaSellersHabitsTOC = [
  { id: "study-methodology", label: "Study Methodology" },
  { id: "what-separates-top-10", label: "What Separates the Top 10%" },
  { id: "the-5-habits", label: "The 5 Habits" },
  { id: "top-10-vs-bottom-50", label: "Top 10% vs Bottom 50%" },
  { id: "the-common-thread", label: "The Common Thread" },
  { id: "score-yourself", label: "Score Yourself" },
  { id: "how-to-build-habits", label: "How to Build the Habits" },
  { id: "faq", label: "FAQs" },
];

const topAmazonIndiaSellersHabitsSteps = [
  {
    title: "Track 5 to 8 direct competitors every day",
    description:
      "Top 10% Amazon India sellers actively monitor the 5 to 8 ASINs competing for the same keywords and Buy Box every single day. They typically notice competitor price or listing changes within 4 hours, while bottom 50% sellers take an average of 3.2 days to react, often losing sales before they even notice.",
  },
  {
    title: "Refresh keywords every 30 days",
    description:
      "Treat keyword optimisation as a monthly routine. Review keyword rankings, monitor Search Frequency Rank changes, refresh backend search terms, and update Sponsored Products targeting. Around 88% of top 10% sellers follow this monthly process, compared with only 11% of bottom 50% sellers who update keywords after publishing their listing.",
  },
  {
    title: "Study competitor reviews, not just your own",
    description:
      "Instead of focusing only on their own negative reviews, top sellers analyse competitor reviews every month. They group recurring complaints into themes and proactively update their own listing images, bullets, and descriptions to address those issues before customers experience them. This habit is followed by 84% of top sellers but only 6% of the bottom 50%.",
  },
  {
    title: "Respond to ranking drops within 24 hours",
    description:
      "Top performers monitor keyword rankings daily and act immediately when an important keyword drops more than five positions. They identify the cause, adjust Sponsored Products bids, improve listing relevance where needed, and track recovery. Average sellers often notice ranking losses only after orders decline, typically 3 to 5 days later.",
  },
  {
    title: "Set a price floor before monitoring competitors",
    description:
      "Rather than matching every competitor discount, top sellers calculate a minimum profitable price for every active ASIN. If competitors price below that floor, they maintain pricing and compete through better listings, reviews, and conversion instead of sacrificing margins. Around 95% of top sellers use a defined price floor, compared with only 12% of bottom 50% sellers.",
  },
];

const topAmazonIndiaSellersHabitsColumns: TableColumn[] = [
  {
    key: "habit",
    label: "HABIT",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "topSellers",
    label: "TOP 10% SELLERS",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "bottomSellers",
    label: "BOTTOM 50% SELLERS",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "gap",
    label: "GAP",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
];

const topAmazonIndiaSellersHabitsRows: TableRow[] = [
  {
    rowClassName: "bg-[#F4F7FC]",

    habit: {
      value: "Daily competitor tracking (5+ ASINs)",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    topSellers: "92%",

    bottomSellers: "8%",

    gap: {
      type: "chip",
      label: "84 points",
      className:
        "bg-[#FBE2E2] text-[#DC2626] px-4 py-1 font-semibold rounded-full",
    },
  },

  {
    habit: "Monthly keyword refresh",

    topSellers: "88%",

    bottomSellers: "11%",

    gap: {
      type: "chip",
      label: "77 points",
      className:
        "bg-[#FBE2E2] text-[#DC2626] px-4 py-1 font-semibold rounded-full",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    habit: {
      value: "Systematic competitor review reading",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    topSellers: "84%",

    bottomSellers: "6%",

    gap: {
      type: "chip",
      label: "78 points",
      className:
        "bg-[#FBE2E2] text-[#DC2626] px-4 py-1 font-semibold rounded-full",
    },
  },

  {
    habit: "24-hour ranking drop response",

    topSellers: "79%",

    bottomSellers: "4%",

    gap: {
      type: "chip",
      label: "75 points",
      className:
        "bg-[#FBE2E2] text-[#DC2626] px-4 py-1 font-semibold rounded-full",
    },
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    habit: {
      value: "Written price floor per ASIN",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    topSellers: "95%",

    bottomSellers: "12%",

    gap: {
      type: "chip",
      label: "83 points",
      className:
        "bg-[#FBE2E2] text-[#DC2626] px-4 py-1 font-semibold rounded-full",
    },
  },
];

const topAmazonIndiaSellersScoreColumns1: TableColumn[] = [
  {
    key: "score",
    label: "YOUR SCORE",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "meaning",
    label: "WHAT IT MEANS",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "position",
    label: "LIKELY POSITION",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
  {
    key: "action",
    label: "FIRST ACTION",
    headerClassName: "bg-gradient-to-r from-[#07192d] to-[#081426] text-white",
  },
];

const topAmazonIndiaSellersScoreRows1: TableRow[] = [
  {
    rowClassName: "bg-white",

    score: "0 to 1",

    meaning: "Operating almost entirely on instinct and memory",

    position: {
      type: "chip",
      label: "Bottom 50%",
      className:
        "bg-[#FBE2E2] text-[#DC2626] px-4 py-1 font-semibold rounded-full",
    },

    action: "Start with Habit 1: set up daily competitor monitoring",
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    score: {
      value: "2 to 3",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    meaning: "Some data habits but inconsistently applied",

    position: {
      type: "chip",
      label: "Middle 40%",
      className:
        "bg-[#FDF0C7] text-[#A04B00] px-4 py-1 font-semibold rounded-full",
    },

    action:
      "Identify the 2 missing habits and set a calendar reminder to execute",
  },

  {
    rowClassName: "bg-white",

    score: "4",

    meaning: "Strong discipline, one habit gap to close",

    position: {
      type: "chip",
      label: "Top 20%",
      className:
        "bg-[#D8F0DD] text-[#067647] px-4 py-1 font-semibold rounded-full",
    },

    action: "Identify the missing habit and automate it",
  },

  {
    rowClassName: "bg-[#F4F7FC]",

    score: {
      value: "5",
      className:
        "font-semibold text-[#1D4ED8] border-l-4 border-[#2563EB] pl-3",
    },

    meaning: "All 5 habits in place and consistently executed",

    position: {
      type: "chip",
      label: "Top 10%",
      className:
        "bg-[#D8F0DD] text-[#067647] px-4 py-1 font-semibold rounded-full",
    },

    action: "Focus on deepening execution quality, not adding new habits",
  },
];

const topAmazonIndiaSellersHabitsDiscoveryCards = [
  {
    icon: <Clock3 size={24} />,
    iconBg: "#EEF4FF",
    iconColor: "#2563EB",

    title: "Automate the data collection",

    description: (
      <>
        The only way to sustain these habits is to stop collecting the data
        manually. Insydz monitors competitor price, rank, and review count for
        up to 8 ASINs daily and surfaces changes automatically, so each habit
        takes minutes instead of an hour.
      </>
    ),

    chips: [
      {
        label: "Habit 1 + 4 + 5",
        bg: "#EEF4FF",
        color: "#1D4ED8",
      },
    ],
  },

  {
    icon: <ArrowRight size={24} />,
    iconBg: "#ECFDF3",
    iconColor: "#16A34A",

    title: "Set a 30-day keyword review prompt",

    description: (
      <>
        Insydz flags keywords that have not been reviewed in 30 days and shows
        search frequency rank changes since your last update. You review, decide
        what to change, and update. The whole cycle takes under 15 minutes per
        ASIN per month.
      </>
    ),

    chips: [
      {
        label: "Habit 2",
        bg: "#ECFDF3",
        color: "#16A34A",
      },
    ],
  },

  {
    icon: <TrendingUp size={24} />,
    iconBg: "#FFFBEB",
    iconColor: "#D97706",

    title: "Read competitor reviews as data, not narrative",

    description: (
      <>
        Insydz groups competitor reviews by complaint theme automatically.
        Instead of reading 50 reviews, you see a ranked list of complaint
        clusters and act on the top one. The habit takes 5 minutes instead of an
        hour.
      </>
    ),

    chips: [
      {
        label: "Habit 3",
        bg: "#FFFBEB",
        color: "#D97706",
      },
    ],
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const topAmazonIndiaSellersHabitsFaqs = [
  {
    q: "What do the most profitable Amazon India sellers do that average sellers don't?",
    a: "Based on our study of 100 Amazon India seller accounts, the five habits separating the top 10% were tracking 5 to 8 competitors daily, refreshing keywords every 30 days, reading competitor reviews systematically, responding to ranking drops within 24 hours, and using pricing data to define a profitable price floor before reacting to competitor pricing. These habits were consistently present among top-performing sellers and largely absent among the bottom 50%.",
  },
  {
    q: "How often do top Amazon India sellers update their keyword strategy?",
    a: "Top 10% sellers treated keyword optimisation as a monthly process. Every 30 days they reviewed keyword rankings, analysed Search Frequency Rank changes, refreshed backend search terms, and updated Sponsored Products keyword lists. Average sellers typically optimised keywords only when creating the listing and rarely revisited them afterward.",
  },
  {
    q: "Do successful Amazon India sellers spend more on PPC or focus on organic rankings?",
    a: "Top-performing sellers did not choose between PPC and organic ranking—they used both together. PPC campaigns were used to build sales velocity for important keywords with the goal of improving organic rankings over the following 3 to 6 weeks. In our study, PPC spend as a percentage of revenue was nearly identical between top sellers and average sellers. The difference was how strategically that budget was used.",
  },
  {
    q: "How many competitors do top Amazon India sellers actively track?",
    a: "Top 10% sellers monitored 5 to 8 direct competitors for every important ASIN every day using tracking tools. Average sellers typically tracked none or one competitor manually and noticed important pricing or ranking changes an average of 3.2 days later. Top sellers usually detected those same changes within four hours.",
  },
  {
    q: "What is the single most important habit separating growing sellers from stagnant sellers?",
    a: "The strongest predictor in our study was daily competitor monitoring. Every seller in the top 10% had daily visibility into competitor pricing, rankings, and listing changes. Sellers in the bottom 50% reacted only after competitor actions had already affected their sales, making competitor tracking the highest-impact habit to adopt first.",
  },
  {
    q: "Can these habits be applied by sellers in tier 2 and tier 3 cities across India?",
    a: "Yes. Our study included sellers from 18 cities, including Surat, Jaipur, Ludhiana, Coimbatore, Nagpur, and several other tier 2 and tier 3 markets. These habits predicted success regardless of location. Whether you sell from Nashik, Mumbai, or any other city, consistent competitor tracking, keyword optimisation, review analysis, ranking monitoring, and pricing discipline produce the same competitive advantages.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function TopAmazonIndiaSellersHabitsContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("study-methodology");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = "insydz-top-amazon-india-sellers-habits-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaTopAmazonIndiaSellersHabits);
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
      for (let i = topAmazonIndiaSellersHabitsTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(
          topAmazonIndiaSellersHabitsTOC[i].id,
        );
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(topAmazonIndiaSellersHabitsTOC[i].id);
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

  interface TopAmazonIndiaSellersHabitsArticleImgProps {
    src: string;
    alt: string;
    caption?: string;
  }
  function TopAmazonIndiaSellersHabitsArticleImg({
    src,
    alt,
    caption,
  }: TopAmazonIndiaSellersHabitsArticleImgProps) {
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
        .toc-link {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #64748B;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          background: none;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease;
          margin-bottom: 4px;
          line-height: 1.4;
          border-left: 3px solid transparent;
          font-family: 'Sora', sans-serif;
        }
        @media(min-width: 1024px) {
          .toc-link {
            font-size: 14px;
            padding: 8px 18px;
          }
        }
        .toc-link:hover {
          color: #2563EB;
          background: #EFF6FF;
          border-left-color: #BFDBFE;
        }
        .toc-link.active {
          color: #2563EB;
          background: #EFF6FF;
          border-left-color: #2563EB;
        }
        .dark .toc-link {
          color: #9CA3AF;
        }
        .dark .toc-link:hover {
          background: rgba(37, 99, 235, 0.1);
          color: #60A5FA;
          border-left-color: rgba(37, 99, 235, 0.4);
        }
        .dark .toc-link.active {
          background: rgba(37, 99, 235, 0.15);
          color: #60A5FA;
          border-left-color: #3B82F6;
        }

        #study-methodology,
        #what-separates-top-10,
        #the-5-habits,
        #top-10-vs-bottom-50,
        #the-common-thread,
        #score-yourself,
        #how-to-build-habits,
        #faq {
          scroll-margin-top: 120px;
        }

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
            label: "Top Amazon India Sellers Habits",
          },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Data Story · Seller Benchmarking"
        title={
          <>
            5 Habits of Top{" "}
            <span style={{ color: "#6366F1" }}>10% Amazon India </span> Sellers
          </>
        }
        description={
          <>
            We looked at 100 Amazon India seller accounts across 8 categories
            over 6 months. The top 10% had 5 habits in common. The bottom 50%
            had almost none of them. Here is what the data showed.
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
        tags={[" Data Story", "Trending"]}
      />

      {/* Blog Image Section */}
      <BlogImageSection
        imageSrc="/Habits of Top Amazon India Sellers.png"
        altText="Top Amazon India Sellers Habits"
        caption="Insydz seller benchmark data across 100 Amazon India accounts. Each habit shows the percentage of top 10% sellers who practised it versus the bottom 50%. The gap is not marginal. It is structural."
      />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        <InfoBanner
          accentColor="#6366F1"
          backgroundColor="#DCE2FF"
          title="QUICK ANSWER"
          content="The top 10% of Amazon India sellers in our study shared 5 specific habits: they tracked 5 to 8 competitors daily, refreshed keywords every 30 days, read competitor reviews systematically, responded to ranking drops within 24 hours, and set a defined price floor before monitoring competitor pricing. None of these habits required more ad spend. All of them required consistent, reliable data. That is the common thread."
        />

        {/* Key Takeaways Box */}
        <div id="study-methodology">
          <KeyTakeawaysBox
            title=" Study Methodology"
            items={topAmazonIndiaSellersHabitsKeyTakeaways}
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
            TABLE OF CONTENTS
          </h4>
          <ul
            className="space-y-1"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {topAmazonIndiaSellersHabitsTOC.map((t) => (
              <li key={t.id}>
                <button
                  className={`toc-link${activeSection === t.id ? " active" : ""}`}
                  onClick={() => go(t.id)}
                  style={{
                    color:
                      activeSection === t.id
                        ? "#2563EB"
                        : resolvedTheme === "dark"
                          ? "#9CA3AF"
                          : "#64748B",
                    background:
                      activeSection === t.id
                        ? resolvedTheme === "dark"
                          ? "rgba(37, 99, 235, 0.15)"
                          : "#EFF6FF"
                        : "transparent",
                    borderLeft:
                      activeSection === t.id
                        ? "3px solid #2563EB"
                        : "3px solid transparent",
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
            {topAmazonIndiaSellersHabitsTOC.map((t) => (
              <button
                key={t.id}
                className={`toc-link${activeSection === t.id ? " active" : ""}`}
                style={{
                  display: "block",
                  marginBottom: 3,
                  color:
                    activeSection === t.id
                      ? "#2563EB"
                      : resolvedTheme === "dark"
                        ? "#9CA3AF"
                        : "#64748B",
                  background:
                    activeSection === t.id
                      ? resolvedTheme === "dark"
                        ? "rgba(37, 99, 235, 0.15)"
                        : "#EFF6FF"
                      : "transparent",
                  borderLeft:
                    activeSection === t.id
                      ? "3px solid #2563EB"
                      : "3px solid transparent",
                }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            <div id="what-separates-top-10">
              <SectionQA
                title="What Separates the Top 10% from the Rest, and Why Is It Not Ad Spend?"
                paragraph1="When we started the study, we expected the top performers to be the biggest PPC spenders. The data did not support it. PPC spend between the top 10% and the bottom 50% was nearly identical as a percentage of revenue."
                paragraph2="What separated the top 10% was consistent attention to specific data points. The five habits below were each practised by at least 79% of top 10% sellers, and by no more than 12% of the bottom 50%."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#6366F1"
              backgroundColor="#DCE2FF"
              title="📌 Before You Read the Habits"
              content="These habits are not secrets. Every seller reading this already knows they should monitor competitors and refresh keywords. The top 10% were simply more consistent about doing it on a defined schedule."
            />

            <div id="the-5-habits">
              <SectionQA
                title="What Are the 5 Habits of the Top 10% Amazon India Sellers?"
                paragraph1="Each habit below is presented with the data from our study: what the top 10% did, what the bottom 50% did instead, and the specific number that shows the gap between them."
                resolvedTheme={resolvedTheme}
              />
            </div>
            <NumberedCards
              items={topAmazonIndiaSellersHabitsSteps}
              numberColor="#2F63F5"
              backgroundColor="#F8FAFC"
              borderColor="#D7E3FF"
            />

            <BlogImageSection
              imageSrc="/top-amazon-india-sellers-habits_image1.png"
              altText="Top Amazon India Sellers Habits"
              caption="Insydz competitor review intelligence showing recurring complaint patterns across a competitor's negative reviews. Each pattern is a product gap or listing opportunity for a seller who reads it analytically rather than defensively."
            />

            <div id="top-10-vs-bottom-50">
              <SectionQA
                title="How Wide Is the Gap Between Top 10% and Bottom 50% Sellers?"
                paragraph1="These are the exact numbers from our study. Each row shows the share of sellers in each group who consistently practised that habit, not occasionally, but on the defined schedule described above."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={topAmazonIndiaSellersHabitsColumns}
              rows={topAmazonIndiaSellersHabitsRows}
            />

            <InfoBanner
              accentColor="#E67E22"
              title="⚡ The Defining Difference"
              content="Top sellers did not spend more on ads. PPC spend was nearly identical between the two groups as a percentage of revenue. The gap was entirely in data habits: the consistency of monitoring, refreshing, and responding on a defined schedule rather than reactively."
            />

            <FeatureCTA
              title="All 5 of these habits are built into Insydz"
              description="Daily competitor monitoring, keyword refresh tracking, review intelligence, rank alerts, and price floor settings, all in one free dashboard."
              buttonText="See How It Works Free →"
              buttonHref="/signup"
              backgroundColor="#111827"
              buttonColor="#6366F1"
            />

            <div id="the-common-thread">
              <SectionQA
                title="What Do All 5 Habits Have in Common?"
                paragraph1="Every one of the 5 habits requires reliable, current data on a consistent schedule. You cannot track 5 to 8 competitors daily without automated data, refresh keywords every 30 days without a rank tracker, or respond to ranking drops within 24 hours without an alert."
                paragraph2="This is why the bottom 50% did not practise these habits despite knowing about them. Manual execution of all 5 would take 45 to 90 minutes daily. Top 10% sellers automated the data collection, taking each habit from 45 minutes to under 5 minutes."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/top-amazon-india-sellers-habits_image2.png"
              altText="Top Amazon India Sellers Habits"
              caption="The self assessment checklist from our study. Top 10% sellers averaged 4.7 out of 5 habits. Bottom 50% averaged 0.4 out of 5. The gap is not knowledge. It is consistent execution."
            />

            <div id="score-yourself">
              <SectionQA
                title="How Do You Score Yourself Against the Top 10%?"
                paragraph1="Read each statement below and honestly assess whether you did it in the last 30 days, not whether you intend to, but whether you actually did."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={topAmazonIndiaSellersScoreColumns1}
              rows={topAmazonIndiaSellersScoreRows1}
            />

            <div id="how-to-build-habits">
              <SectionQA
                title="How Do You Actually Build These Habits Without Spending 90 Minutes a Day?"
                paragraph1="The honest answer is that manual execution of all 5 habits takes too long for most sellers to sustain. Checking 8 competitor ASINs daily, refreshing keywords monthly, reading competitor reviews, tracking rank positions, and maintaining price floors is a real job if done manually."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InsightCards
              columns={3}
              cards={topAmazonIndiaSellersHabitsDiscoveryCards}
            />

            <div id="faq">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#6366F1" faqs={topAmazonIndiaSellersHabitsFaqs} />

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
        title="You Now Know the 5 Habits. The Question Is Whether You Will Execute Them."
        description="Insydz automates the data collection behind all 5 habits so each one takes minutes instead of hours. Free to start, no card needed."
        primaryButtonText="Start Building These Habits Free →"
        primaryButtonHref="/signup"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#2454E6"
        secondaryColor="#4F6EF7"
        stats={[
          {
            value: "100",
            label: "Sellers studied",
          },
          {
            value: "5",
            label: "Habits identified",
          },
          {
            value: "5,000+",
            label: "Indian sellers using Insydz",
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
