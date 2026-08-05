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
import InsightCards, { InsightCard } from "../components/InsightCard";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaAmazonRepricingStrategyIndia2026 = {
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
        "https://insydz.com/resources/expert-blog/amazon-repricing-strategy-india-2026",
      url: "https://insydz.com/resources/expert-blog/amazon-repricing-strategy-india-2026",
      name: "Amazon India Repricing Strategy 2026: Stop Losing the Buy Box to Smarter Sellers",
      description:
        "In competitive categories on Amazon India, your Buy Box is won or lost multiple times a day. This is the 2026 playbook for margin-safe, rule-based repricing.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/amazon-repricing-strategy-india-2026#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-repricing-strategy-india-2026#breadcrumb",
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
          name: "Amazon Repricing Strategy India 2026",
          item: "https://insydz.com/resources/expert-blog/amazon-repricing-strategy-india-2026",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-repricing-strategy-india-2026#article",
      headline:
        "Amazon India Repricing Strategy 2026: Stop Losing the Buy Box to Smarter Sellers",
      image:
        "https://insydz.com/amazon-repricing-strategy-india-2026_blogbanner.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-07-20",
      dateModified: "2026-07-20",
      keywords: [
        "amazon repricing strategy india 2026",
        "automated repricing amazon india",
        "how to reprice amazon listing india",
        "repricing rules amazon india 2026",
        "buy box repricing india seller",
      ],
      articleSection: "Pricing Strategy",
      inLanguage: "en-IN",
      wordCount: 3100,
      timeRequired: "PT11M",
    },
  ],
};

// ── Key takeaways ────────────────────────────────────────────────────────────
const repricingKeyTakeaways = [
  "Repricing on Amazon India is no longer optional in competitive categories. If you are not repricing with rules, sellers who are will take your Buy Box position while you sleep.",
  "The biggest repricing mistake Indian sellers make is setting rules without a floor. Aggressive rules without a floor create a race to the bottom where everyone loses margin at the same time.",
  "Your floor is the minimum price at which you still make an acceptable profit. Calculate it from COGS plus FBA fees plus advertising cost, divided by one minus your minimum margin percentage.",
  "The right repricing rule depends on your category type. Commodity products need match-the-lowest rules. Differentiated products with strong reviews often need no automatic rule at all.",
  "Real time competitor visibility changes everything. Sellers using Insydz WhatsApp alerts respond to competitor price moves in under 15 minutes. Sellers checking manually respond in 4 to 48 hours. That gap is where Buy Box is lost.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const repricingTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "Why Static Pricing Fails" },
  { id: "s3", label: "Calculate Your Price Floor" },
  { id: "s4", label: "4 Rules That Work" },
  { id: "s5", label: "The Performance Gap" },
  { id: "s6", label: "Race to the Bottom" },
  { id: "s7", label: "Full System in 1 Hour" },
  { id: "s8", label: "Build Habits Without Hours" },
  { id: "s9", label: "FAQs" },
];

// ── Four repricing rules (s4) ─────────────────────────────────────────────────
const repricingRules = [
  {
    title: "Match the lowest FBA price within your floor",
    description:
      "When you are selling a product where buyers compare on price alone and your listing is not materially different from the competition, your goal is simply to not lose the Buy Box to a lower price. Set a rule that matches the current lowest FBA price, with your floor as the hard minimum. This fires automatically when a competitor drops and resets when they reprice up.",
  },
  {
    title: "Beat the Buy Box price by ₹1, within your floor",
    description:
      "In categories where you are competing with 3 to 5 strong FBA sellers and differentiation is moderate, a beat-by-one-rupee rule gives you the Buy Box at minimal margin cost. You win the position without racing to the floor. Set your ceiling at your normal price and your floor at your calculated minimum. The rule operates within that band.",
  },
  {
    title: "Hold price with alert monitoring only",
    description:
      "If your product has 50 or more reviews at 4.2 stars or above, significant A+ Content, and buyers choose on quality signals as much as price, automatic repricing may cost you more than it earns. Hold your regular price, monitor competitors via Insydz WhatsApp alerts, and reprice manually only when a competitor holds a lower price for more than 48 consecutive hours.",
  },
  {
    title: "Temporary floor-protected discount rule for sale events",
    description:
      "During sale events like Prime Day and the Great Indian Festival, set a separate rule with a higher floor than your standard one since advertising costs rise sharply during event windows. Your event floor must account for elevated ad spend. Run this rule only for the event duration, then revert to your standard rule. Do not use your event floor as your permanent floor as it is calibrated for conditions that only exist during the sale.",
  },
];

// ── Table: Performance gap (s5) ──────────────────────────────────────────────
const repricingPerformanceTableColumns: TableColumn[] = [
  {
    key: "metric",
    label: "METRIC",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
  {
    key: "manual",
    label: "MANUAL OR NO REPRICING",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
  {
    key: "ruleBased",
    label: "FLOOR-PROTECTED RULE-BASED",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
  {
    key: "difference",
    label: "DIFFERENCE",
    headerClassName: "bg-gradient-to-r from-[#0C1A27] to-[#0c1445] text-white",
  },
];

const repricingPerformanceTableRows: TableRow[] = [
  {
    metric: "Average Buy Box hold time per day",
    manual: "52%",
    ruleBased: "79%",
    difference: {
      type: "chip",
      label: "+27 percentage points",
      className: "bg-[#DCFCE7] text-[#15803D]",
    },
  },
  {
    rowClassName: "bg-[#EFF6FF]",
    metric: {
      value: "Response time to competitor price drops",
      className:
        "font-semibold text-[#2563EB] border-l-4 border-[#2563EB] pl-3",
    },
    manual: "4 to 48 hours",
    ruleBased: "Under 15 minutes",
    difference: {
      type: "chip",
      label: "Near instant",
      className: "bg-[#DCFCE7] text-[#15803D]",
    },
  },
  {
    metric: "Margin drop during sale events",
    manual: "18 to 32% below normal",
    ruleBased: "8 to 12% below normal",
    difference: {
      type: "chip",
      label: "Half the erosion",
      className: "bg-[#DCFCE7] text-[#15803D]",
    },
  },
  {
    rowClassName: "bg-[#EFF6FF]",
    metric: {
      value: "Below-floor pricing incidents per month",
      className:
        "font-semibold text-[#2563EB] border-l-4 border-[#2563EB] pl-3",
    },
    manual: "3 to 6 average",
    ruleBased: "0 to 1 average",
    difference: {
      type: "chip",
      label: "Effectively eliminated",
      className: "bg-[#DCFCE7] text-[#15803D]",
    },
  },
  {
    metric: "6-month revenue growth vs category average",
    manual: "Tracks category",
    ruleBased: "+18% above category average",
    difference: {
      type: "chip",
      label: "Structural advantage",
      className: "bg-[#DCFCE7] text-[#15803D]",
    },
  },
];

// ── 5-step system (s7) ─────────────────────────────────────────────────────────
const repricingSystemSteps = [
  {
    title:
      "Calculate your floor for every ASIN you plan to reprice (15 minutes)",
    description:
      "List each ASIN in a spreadsheet. Add columns for COGS, FBA fee from the Revenue Calculator, and estimated advertising cost per unit from your current ACoS. Apply the floor formula at your chosen minimum margin. Save this file and treat it as a living document you update whenever supplier costs or FBA fees change.",
  },
  {
    title:
      "Set repricing rules in Amazon Automate Pricing using your floors (15 minutes)",
    description:
      "Go to Seller Central, then Pricing, then Automate Pricing. Create a rule for each ASIN type: match lowest FBA for commodity ASINs, beat Buy Box by ₹1 for mid-tier ASINs. Set your calculated floor as the minimum for each rule. Set your current regular price as the ceiling. Confirm each rule is active before leaving the page.",
  },
  {
    title:
      "Add your competitor ASINs to Insydz and set alert thresholds (10 minutes)",
    description:
      "Log in to Insydz and add the top 3 to 5 competitor ASINs for each of your products. Set your price floor as the alert threshold so a WhatsApp notification fires the moment a competitor drops below your margin safety line. This gives you awareness of moves your automatic rule handles and of moves that require your judgement.",
  },
  {
    title: "Run a weekly 20-minute repricing review",
    description:
      "Review your Insydz price history for each ASIN once per week. Check whether any competitor has held a lower price for more than 7 consecutive days, which signals a genuine cost advantage rather than a temporary pricing test. Update your ceiling if your category's average price has structurally shifted. Recalculate floors whenever COGS or FBA fees change.",
  },
  {
    title: "Recalculate floors every time your cost inputs change",
    description:
      "Every time you place a new supplier order at a different price, every time Amazon adjusts FBA fees, and every time your category average ACoS shifts by more than 3 percentage points, your floor needs recalculation. A floor built on stale cost data is not a floor. It is a false sense of security.",
  },
];

// ── Discover / feature cards (s8) ─────────────────────────────────────────────
const repricingDiscoverCards: InsightCard[] = [
  {
    title: "Automate competitor price tracking",
    description:
      "Insydz tracks price, Buy Box status, and rank for up to 8 competitors per ASIN automatically. You set the ASINs once and the data updates continuously without any manual checking from your side.",
    chips: [
      {
        label: "Dynamic Pricing Feature",
        bg: "#EFF6FF",
        color: "#2563EB",
      },
    ],
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
  },
  {
    title: "Set a floor-protected alert threshold",
    description:
      "Set your calculated floor as your WhatsApp alert threshold in Insydz. When a competitor drops below your margin safety line, a notification arrives within minutes, day or night, even during sale events.",
    chips: [
      {
        label: "Competitor Intelligence Feature",
        bg: "#F0FDF4",
        color: "#16A34A",
      },
    ],
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
  },
  {
    title: "Read competitor pricing history weekly",
    description:
      "Insydz price history shows you whether a competitor's recent price drop is a temporary test or a structural shift. That distinction determines whether you adjust your ceiling or hold your current position.",
    chips: [
      {
        label: "Pricing Intelligence",
        bg: "#FFFBEB",
        color: "#D97706",
      },
    ],
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const repricingFaqs = [
  {
    q: "What is the best repricing strategy for Amazon India sellers in 2026?",
    a: "The most effective approach combines a calculated price floor with category-appropriate repricing rules and real time competitor monitoring via WhatsApp alerts. The exact rule varies by product type: commodity products benefit from match-the-lowest rules, differentiated products with strong reviews often need no automatic rule at all. Every product needs a floor and competitor awareness, regardless of category.",
  },
  {
    q: "Does repricing aggressively help win the Buy Box on Amazon India?",
    a: "Aggressive repricing wins the Buy Box short term but creates category-wide margin erosion when multiple sellers do it simultaneously. The sellers who hold Buy Box most consistently over time are not the most aggressive repricers. They are the ones with accurate floors and reliable rules that compete effectively at the margin boundary without ever breaching it.",
  },
  {
    q: "How do I reprice my Amazon India listing without losing margin?",
    a: "Calculate your floor first using COGS plus FBA fees plus advertising cost per unit, divided by one minus your minimum margin percentage. Set this number as the minimum in your repricing rule. Set your ceiling at your current regular price. Within that band, your rule competes for Buy Box freely. Below the floor, nothing fires regardless of what competitors do.",
  },
  {
    q: "What repricing rules work best for Indian Amazon sellers?",
    a: "Three rules cover most situations. Match the lowest FBA price within your floor for commodity categories with many near-identical competitors. Beat the Buy Box by one rupee within your floor for mid-tier categories with moderate differentiation. Hold your regular price with alert monitoring only for differentiated products with 50 or more reviews and strong brand content. Apply the appropriate rule per ASIN, not per account.",
  },
  {
    q: "How do I monitor competitor prices on Amazon India without checking manually?",
    a: "Insydz monitors your competitor ASINs continuously and sends WhatsApp alerts when a competitor changes price in a way that affects your Buy Box position or approaches your floor. You set the threshold once during setup. Alerts arrive day or night, including on weekends and during sale events when price moves are most frequent and most consequential.",
  },
  {
    q: "How often should I review and update my repricing rules?",
    a: "Review and recalculate floors every time your cost inputs change materially: a new supplier order at a different price, an FBA fee adjustment, or an ACoS shift of more than 3 percentage points. Beyond those triggers, a weekly 20-minute review of your Insydz competitor price history is sufficient to catch structural category shifts that warrant ceiling or rule changes.",
  },
];

const repricingRelatedCards = [
  {
    tag: "Amazon Zero Referral Fee",
    title:
      "Learn how zero-fee on Amazon India can help sellers save up to ₹50,000/month",
    route: "/resources/expert-blog/amazon-zero-referral-fee",
    image: "/Amazon India Zero Referral Fee.png",
  },
  {
    tag: "Competitor Intelligence",
    title: "Competitor Undercutting Your Amazon India Price? Act Within 1 Hour",
    route: "/resources/expert-blog/competitor-undercutting-amazon-india",
    image: "/Detect Competitor Price Undercutting on Amazon India.png",
  },
  {
    tag: "Prime Day Strategy",
    title:
      "Amazon Prime Day India 2026: Every Question Indian Sellers Are Asking Right Now, All Answered",
    route: "/resources/expert-blog/prime-day-india-2026-seller-questions",
    image: "/prime-day-india-2026-seller-questions.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonRepricingStrategyIndia2026Content() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const id = "insydz-amazon-repricing-strategy-india-2026-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaAmazonRepricingStrategyIndia2026);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = repricingTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(repricingTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(repricingTOC[i].id);
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

        /* India dark advantages section */
        .india-inner{background:linear-gradient(135deg,#0c1445 0%,#0C1A27 100%);border-radius:28px;padding:40px;overflow:hidden;position:relative;margin:56px 0 0}
        .india-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
        .india-label{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#60A5FA;margin-bottom:12px;font-family:'Sora',sans-serif}
        .india-h3{font-family:'Sora',sans-serif;font-size:clamp(19px,2.3vw,26px);font-weight:800;color:#fff;line-height:1.25;margin-bottom:14px}
        .india-body{font-size:13.5px;color:rgba(255,255,255,.65);line-height:1.75;margin-bottom:22px;font-family:'Lora',serif}
        .india-stats{display:flex;gap:22px;flex-wrap:wrap}
        .india-stat-val{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;color:#60A5FA;display:block}
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
          { label: "Amazon Repricing Strategy India 2026" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Pricing Strategy · Festive Prep · Repricing"
        title={
          <>
            Amazon India{" "}
            <span style={{ color: "#2563EB" }}>Repricing Strategy 2026:</span>{" "}
            Stop Losing the Buy Box to Smarter Sellers
          </>
        }
        description={
          <>
            In competitive categories on Amazon India, your Buy Box is won or
            lost multiple times a day. Sellers who reprice manually, or not at
            all, are giving it away. This is the 2026 playbook for margin-safe,
            rule-based repricing that holds your position without racing to the
            bottom.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="July 2026"
        readTime="11 min read"
        bgColor={{ light: "#EFF6FF", dark: "#0a1628" }}
        highlightColor="#2563EB"
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/amazon-repricing-strategy-india-image0.png"
          altText="Amazon Repricing Strategy India 2026"
          caption="Insydz repricing dashboard showing 24 hours of Buy Box data. The seller held Buy Box for 81 percent of the day with 7 automatic price adjustments. Two competitor drops that would have breached the floor were blocked automatically."
        />

        <InfoBanner
          accentColor="#2563EB"
          backgroundColor="#EFF6FF"
          title="QUICK ANSWER"
          content="The most effective Amazon India repricing strategy in 2026 is not the most aggressive one. It is the one with a calculated price floor, category-appropriate rules, and real time competitor visibility via WhatsApp alerts. Sellers who set a floor and use rule-based repricing hold Buy Box more consistently and keep more margin than sellers who reprice manually or chase every competitor move."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={repricingKeyTakeaways}
              accentColor="#2563EB"
              backgroundColor="#0C1A27"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={repricingTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={repricingTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="Why Static Pricing Is No Longer a Strategy on Amazon India"
                paragraph1="Three years ago, setting your Amazon India price once and reviewing it monthly was a reasonable approach. Most categories had 3 to 5 competitors, price changes were infrequent, and the Buy Box algorithm rewarded consistency as much as competitiveness."
                paragraph2="That era is over. In 2026, the median competitive Amazon India listing sees price changes 3 to 7 times per week across its competitive set. In high velocity categories like electronics accessories, home goods, and personal care, that number is closer to 3 to 5 times per day. Competitors are using automatic repricing tools. If you set your price manually and review it weekly, you are responding to market conditions that are already 96 to 168 hours out of date."
                paragraph3="The math is not complicated. Amazon awards the Buy Box based on a weighted combination of price, fulfilment method, seller metrics, and in-stock rate. In most competitive FBA categories, price is the dominant variable. A seller priced ₹5 above the lowest comparable FBA offer will lose the Buy Box even with better reviews and faster shipping. The gap does not need to be large. It just needs to exist."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#2563EB"
              backgroundColor="#EFF6FF"
              title="The Buy Box Gap Most Sellers Do Not See"
              content="82 percent of Amazon India purchases go through the Buy Box seller. When you lose Buy Box for 6 hours during a peak browsing window, you are not losing a small percentage of sales. You are losing the majority of potential orders during the highest traffic period of your day. The seller who reprices correctly captures those 6 hours. You do not get them back."
            />

            <div id="s3">
              <SectionQA
                title="How to Calculate Your Price Floor Before You Set Any Rule"
                paragraph1="Setting a repricing rule without a floor is like driving with no brake pedal. You will go fast in the right direction until something forces you to stop, at which point stopping is no longer safe. Every repricing rule needs a floor below which it cannot fire, regardless of what competitors do."
                paragraph2="Your floor is not your break-even price. Break-even means zero profit, which means you are funding Amazon's fulfilment operation out of your own margin. Your floor should be the minimum price at which you still make a margin you can sustain, typically 12 to 18 percent for most Indian Amazon categories."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#2563EB"
              backgroundColor="#EFF6FF"
              title="The Floor Formula"
              content="Price Floor = (COGS + FBA Fees + Ad Cost Per Unit) ÷ (1 − Minimum Margin %). Pull COGS from your most recent supplier invoice including inbound freight per unit. Pull FBA fees from the FBA Revenue Calculator for your exact ASIN. Estimate advertising cost per unit by multiplying your current ACoS by your current selling price and dividing by 100. Add the three together, divide by one minus your minimum margin as a decimal. Example: COGS ₹180 + FBA ₹65 + ads ₹22 = ₹267 total cost. Floor at 15% margin: ₹267 ÷ 0.85 = ₹314. No repricing rule touches this number."
            />

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="One Floor Per ASIN, Not Per Category"
              content="FBA fees vary significantly by weight and dimensions. A single category-level floor will underprotect your heavier ASINs and overprotect your lighter ones. Run the formula for each ASIN you plan to reprice and store the numbers in a simple spreadsheet before configuring any rules."
            />

            <div id="s4">
              <SectionQA
                title="Four Repricing Rules That Work for Indian Amazon Sellers in 2026"
                paragraph1="Not every product needs the same repricing approach. The right rule depends on how differentiated your product is, how price-sensitive your category is, and how many FBA competitors you are facing. Using a match-the-lowest rule on a differentiated product with strong reviews destroys margin unnecessarily. Using a hold-price approach on a commodity product with 12 near-identical competitors means losing Buy Box every time someone undercuts you."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={repricingRules}
              numberColor="#2563EB"
              backgroundColor="#F8FAFC"
              borderColor="#BFDBFE"
            />

            <BlogImageSection
              imageSrc="/amazon-repricing-strategy-india-image1.png"
              altText="Competitor Price Monitoring Insydz"
              caption="Insydz competitor price log showing three repricing events across a single day. The seller's automatic rule matched the final price at ₹398, well above the ₹314 floor, and a WhatsApp alert was sent within minutes. Without the rule, the seller would have found out about the 6:42 AM move the next morning."
            />

            <div id="s5">
              <SectionQA
                title="How Wide Is the Gap Between Sellers Who Reprice and Sellers Who Do Not?"
                paragraph1="Looking at data from 100 Amazon India seller accounts across 8 categories over 6 months, sellers who used floor-protected repricing rules consistently outperformed those who repriced manually or not at all on every measurable commercial metric."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable
              columns={repricingPerformanceTableColumns}
              rows={repricingPerformanceTableRows}
            />

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="What the Numbers Do Not Show"
              content="The 27 percentage point Buy Box improvement understates the commercial impact because Buy Box hold time is not evenly distributed across the day. The hours lost to manual repricing delays tend to cluster in peak traffic windows, evenings, weekends, and the first hours after a competitor reprices. Those are the hours that matter most for revenue, which means the actual sales impact is larger than the time percentage suggests."
            />

            <FeatureCTA
              title="Insydz monitors competitor prices in real time and sends WhatsApp alerts the moment something changes"
              description="Set your competitor ASINs and alert threshold once. Get notified day or night. Free to start."
              buttonText="Set Up Free →"
              buttonHref="/login"
              backgroundColor="#0C1A27"
              buttonColor="#2563EB"
            />

            <div id="s6">
              <SectionQA
                title="What Happens When Every Seller in Your Category Has an Aggressive Rule"
                paragraph1="There is a specific failure mode that appears in categories where several sellers have all set the same type of repricing rule simultaneously. Seller A sets a beat-by-one-rupee rule. Seller B does the same. Both rules fire, competing with each other. Within minutes, both sellers are at their floor. If either has set a floor below their actual cost, the floor fails and both slide into negative margin."
                paragraph2="This happens regularly on Amazon India in cables, phone accessories, food storage, and basic apparel. The sellers who survive it are the ones whose floors are correctly calculated and non-negotiable. The sellers who do not survive it are the ones who set their floor by feel, lowered it during the war to stay competitive, and noticed they were losing money only when their August reconciliation came back wrong."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#DC2626"
              backgroundColor="#FEF2F2"
              title="How to Recognise When You Are in a Race to the Bottom"
              content="If your category's average selling price has fallen more than 15 percent in the last 90 days while your unit volume has stayed flat or risen, you are in an active race to the bottom. The correct response is not to fight it by dropping further. Hold your floor, let competitors exhaust themselves below their own costs, and wait for the category to reprice back up over 4 to 8 weeks as sellers with unsustainable floors exit or recover."
            />

            <BlogImageSection
              imageSrc="/amazon-repricing-strategy-india-image2.png"
              altText="Repricing Rule Health Check Insydz"
              caption="Insydz rule health check for 3 ASINs. Two have correctly calculated floors with active rules. The third has no floor and is currently priced ₹42 below its estimated cost because an automatic rule fired without a minimum. This is the most common repricing mistake on Amazon India in 2026."
            />

            <div id="s7">
              <SectionQA
                title="How Do You Build a Full Repricing System in Under an Hour?"
                paragraph1="A complete repricing system for most Indian Amazon sellers involves four components working together: a floor calculation spreadsheet, Amazon Automate Pricing rules, Insydz competitor monitoring, and a weekly review habit. None of these takes more than 15 minutes to set up individually."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={repricingSystemSteps}
              numberColor="#2563EB"
              backgroundColor="#F8FAFC"
              borderColor="#BFDBFE"
            />

            <div id="s8">
              <SectionQA
                title="How Do You Build These Habits Without Spending Hours in Seller Central?"
                paragraph1="The practical barrier to repricing discipline is time. Calculating floors, updating rules, monitoring competitors, and reviewing performance each week adds up quickly for sellers managing 10 or more ASINs. This is what Insydz automates: the continuous data collection behind each step, so each habit takes minutes instead of an hour."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InsightCards cards={repricingDiscoverCards} columns={3} />

            <div id="s9">
              <SectionQA
                title="Frequently Asked Questions: Amazon India Repricing Strategy 2026"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#2563EB" faqs={repricingFaqs} />

            {/* More Pricing and Competitor Intelligence */}
            <RelatedArticles
              title="More Pricing and Competitor Intelligence"
              cards={repricingRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Your Competitors Are Repricing Right Now. Do You Know What They Just Did?"
        description="Insydz monitors competitor prices in real time and sends WhatsApp alerts within minutes. Set up your alert threshold once and stay ahead of every repricing move, around the clock."
        primaryButtonText="Set Up Competitor Monitoring Free →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#2563EB"
        secondaryColor="#60A5FA"
        stats={[
          {
            value: "81%",
            label: "Buy Box hold time with floor-protected rules",
          },
          { value: "4", label: "Rule types for every product situation" },
          { value: "5,000+", label: "Indian sellers using Insydz" },
          { value: "Free", label: "To start" },
        ]}
      />
    </div>
  );
}
