"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import FeatureCTA from "../components/FeatureCTA";
import HeroSection from "../components/HeroSection";
import SectionQA from "../components/SectionQA";
import InlineNote from "../components/InlineNote";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import InsightCards, { InsightCard } from "../components/InsightCard";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";

export const dynamic = "force-static";

// ── THEME ──────────────────────────────────────────────────────────────────────
// Change the colors for this whole blog here. Red matches the blog images.
const THEME = {
  accent: "#DC2626", // main color (buttons, highlights, links, progress bar)
  highlight: "#E11D2A", // brighter red for the hero title highlight
  accentOnDark: "#F87171", // accent used for text/links in dark mode
  soft: "#FEF2F2", // light background for boxes
  softDark: "rgba(220,38,38,0.15)", // soft background in dark mode
  border: "#FECACA", // card and chart borders
  borderDark: "rgba(220,38,38,0.3)", // borders in dark mode
  dark: "#2A0A0C", // dark box and hero (dark mode) background
  ctaFrom: "#B91C1C", // FinalCTA gradient start
  ctaTo: "#DC2626", // FinalCTA gradient end
  flipkart: "#D97706", // amber used for the Flipkart card
  flipkartSoft: "rgba(217,119,6,0.14)",
  success: "#16A34A", // green used for the "run both" card
  successSoft: "rgba(22,163,74,0.12)",
};

// CSS variables so links, chart, TOC and progress bar follow THEME too
const themeVars = {
  "--t-accent": THEME.accent,
  "--t-accent-dark": THEME.accentOnDark,
  "--t-soft": THEME.soft,
  "--t-soft-dark": THEME.softDark,
  "--t-border": THEME.border,
  "--t-border-dark": THEME.borderDark,
} as CSSProperties;

const A = "theme-link";

// ── TOC Items ──────────────────────────────────────────────────────────────────
const tocItems = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What New Sellers Search For" },
  { id: "s3", label: "Registration and Documents" },
  { id: "s4", label: "Fees Side by Side" },
  { id: "s5", label: "Which Platform Fits" },
  { id: "s6", label: "Summary" },
  { id: "s7", label: "Frequently Asked Questions" },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "Flipkart usually gives new sellers better early margins on fashion and products under ₹1,000, since it charges no commission on those items.",
  "Amazon tends to suit branded or higher priced products and buyers who spend more per order.",
  "Both platforms ask for a PAN, a bank account and, for most sellers, a GST registration. The composition scheme is not available to ecommerce suppliers.",
  "Flipkart generally pays sooner, about 3 to 10 days after dispatch, while Amazon pays about 7 days after delivery, then weekly. Confirm the cycle in your own dashboard.",
  "Neither choice is permanent. Launch on one platform, learn your fees, returns and ad costs, then add the second.",
];

// ── Search Chart Data (s2) ─────────────────────────────────────────────────────
const searchData = [
  { label: "Sell on Flipkart", volume: "6,600", width: "100%" },
  { label: "Amazon seller registration", volume: "4,400", width: "67%" },
  { label: "Amazon seller charges", volume: "1,600", width: "24%" },
  { label: "How to sell on Flipkart", volume: "1,000", width: "15%" },
  { label: "Amazon FBA India", volume: "720", width: "11%" },
];

// ── Compiled-by list (s2) ──────────────────────────────────────────────────────
const compiledNotes = [
  "Fee and policy changes were checked against Flipkart's July 8, 2026 announcement and published seller fee notices.",
  "Registration rules were checked against current GST guidance and each platform's seller signup page.",
  "Payout timing varies by seller tier and category, so confirm it in your own dashboard before planning cash flow.",
  "Last reviewed on November 16, 2026.",
];

// ── Fees Table (s4) ────────────────────────────────────────────────────────────
const greenChip =
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold";
const greyChip =
  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold";

const feeColumns: TableColumn[] = [
  { key: "factor", label: "FACTOR", cellClassName: "font-semibold" },
  { key: "amazon", label: "AMAZON INDIA" },
  { key: "flipkart", label: "FLIPKART" },
];

const feeRows: TableRow[] = [
  {
    factor: "Documents",
    amazon: { type: "chip", label: "PAN, bank, GST", className: greyChip },
    flipkart: { type: "chip", label: "PAN, bank, GST", className: greyChip },
  },
  {
    factor: "Commission",
    amazon: "Category based referral fee",
    flipkart: {
      type: "chip",
      label: "0% on eligible items under ₹1,000 and all fashion",
      className: greenChip,
    },
  },
  {
    factor: "Other charges",
    amazon: "Closing fee, shipping and 18% GST on fees",
    flipkart: "Fixed fee, collection fee, shipping and returns",
  },
  {
    factor: "2026 change",
    amazon:
      "Fixed closing fee up ₹1 (under ₹500) or ₹3 (above ₹500) from September 7",
    flipkart: "Zero commission extended to all fashion on July 8",
  },
  {
    factor: "New seller penalties",
    amazon: "Standard account health rules apply from the start",
    flipkart: {
      type: "chip",
      label: "Waived for the first 90 days",
      className: greenChip,
    },
  },
  {
    factor: "Payout timing",
    amazon: "About 7 days after delivery, then weekly",
    flipkart: {
      type: "chip",
      label: "About 3 to 10 days after dispatch",
      className: greenChip,
    },
  },
  {
    factor: "Fulfilment",
    amazon: "FBA, Easy Ship, Seller Flex",
    flipkart: "Flipkart Fulfilment, Smart, self ship",
  },
];

// ── Which Platform Fits Cards (s5) ─────────────────────────────────────────────
const fitCards: InsightCard[] = [
  {
    icon: "A",
    iconBg: THEME.softDark,
    iconColor: THEME.accent,
    title: "Start on Amazon if",
    description: (
      <>
        Your product is branded or priced above ₹1,000, and you want{" "}
        <strong>Amazon FBA India</strong> to handle storage and delivery. See
        the{" "}
        <Link href="/solutions/amazon-sellers" className={A}>
          Amazon seller tools
        </Link>{" "}
        Insydz offers.
      </>
    ),
    chips: [
      { label: "Branded and premium", bg: THEME.softDark, color: THEME.accent },
    ],
    minHeight: 260,
    borderColor: THEME.border,
  },
  {
    icon: "F",
    iconBg: THEME.flipkartSoft,
    iconColor: THEME.flipkart,
    title: "Start on Flipkart if",
    description: (
      <>
        You sell fashion, or other products under ₹1,000, or your buyers sit in
        Tier 2 and Tier 3 cities. Learning how to{" "}
        <strong>sell on Flipkart</strong> costs less at the start. See the{" "}
        <Link href="/solutions/flipkart-sellers" className={A}>
          Flipkart seller tools
        </Link>
        .
      </>
    ),
    chips: [
      {
        label: "Fashion and value",
        bg: THEME.flipkartSoft,
        color: THEME.flipkart,
      },
    ],
    minHeight: 260,
    borderColor: THEME.border,
  },
  {
    icon: "A+F",
    iconBg: THEME.successSoft,
    iconColor: THEME.success,
    title: "Run both once stable",
    description: (
      <>
        Price, rank and reviews then move on two platforms at once. Insydz
        tracks both together, with{" "}
        <Link href="/features/whatsapp-alerts-feature" className={A}>
          WhatsApp alerts
        </Link>{" "}
        for sudden changes.
      </>
    ),
    chips: [
      { label: "Dual platform", bg: THEME.successSoft, color: THEME.success },
    ],
    minHeight: 260,
    borderColor: THEME.border,
  },
];

// ── FAQs (s7) ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Is GST registration mandatory to sell on Amazon and Flipkart?",
    a: "For most sellers, yes. Both marketplaces generally require a regular GST registration even when turnover is below the usual threshold, and the composition scheme is not available to ecommerce sellers. A few exempt categories exist, so check the current list in Seller Central or Seller Hub before you register.",
  },
  {
    q: "Which platform pays new sellers faster, Amazon or Flipkart?",
    a: "Flipkart generally pays sooner. Published guides put Flipkart payouts at roughly 3 to 10 days after dispatch depending on seller tier, while Amazon usually settles about 7 days after delivery and then weekly. Timing varies by account and category, so confirm the cycle in your own dashboard before planning cash flow.",
  },
  {
    q: "Can a new seller sell on Amazon and Flipkart at the same time?",
    a: "Yes, and many sellers do. A sensible approach is to launch on one platform, learn your fees, returns and ad costs, then add the second. Running both is easier when price, rank and review data from each platform sits in one place instead of two separate dashboards.",
  },
];

export default function AmazonVsFlipkartNewSellers2026Content() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      let found = false;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocItems[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(tocItems[i].id);
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
    <div
      className="min-h-screen bg-white dark:bg-gray-950 transition-colors"
      style={themeVars}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:var(--t-accent);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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

        /* Links follow THEME */
        .theme-link{color:var(--t-accent);text-decoration:underline;text-underline-offset:3px;font-weight:600}
        .dark .theme-link{color:var(--t-accent-dark)}

        /* Search chart follows THEME */
        .chart-box{background:var(--t-soft);border:1px solid var(--t-border);border-radius:16px;padding:24px;margin:24px 0 8px}
        .dark .chart-box{background:var(--t-soft-dark);border-color:var(--t-border-dark)}
        .chart-title{font-family:'Sora',sans-serif;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--t-accent);margin-bottom:14px}
        .dark .chart-title{color:var(--t-accent-dark)}
        .chart-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--t-border);font-family:'Sora',sans-serif;font-size:14px}
        .chart-row:last-child{border-bottom:0}
        .dark .chart-row{border-color:var(--t-border-dark)}
        .chart-label{font-weight:600;width:132px;flex-shrink:0;color:#1E293B}
        @media(min-width:640px){.chart-label{width:190px}}
        .dark .chart-label{color:#e5e7eb}
        .chart-track{flex:1;height:10px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden}
        .dark .chart-track{background:rgba(255,255,255,.1)}
        .chart-fill{height:10px;border-radius:999px;background:var(--t-accent);min-width:6px}
        .dark .chart-fill{background:var(--t-accent-dark)}
        .chart-value{font-weight:700;width:60px;text-align:right;color:var(--t-accent)}
        .dark .chart-value{color:var(--t-accent-dark)}

        /* TOC links follow THEME */
        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:var(--t-accent);background:var(--t-soft);border-left-color:var(--t-accent)}
        .toc-link.active{color:var(--t-accent);background:var(--t-soft);border-left-color:var(--t-accent)}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:var(--t-soft-dark);color:var(--t-accent-dark);border-left-color:var(--t-accent-dark)}
        .dark .toc-link.active{background:var(--t-soft-dark);color:var(--t-accent-dark);border-left-color:var(--t-accent-dark)}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7{scroll-margin-top:120px}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Amazon vs Flipkart for New Sellers in 2026" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Seller Guide · Platform Comparison"
        title={
          <>
            Amazon vs Flipkart:{" "}
            <span style={{ color: THEME.highlight }}>
              Which Platform Should New Sellers Choose in 2026?
            </span>
          </>
        }
        description={
          <>
            A practical comparison for first time sellers covering GST rules,
            fees, payouts, fulfilment and the 2026 policy changes that affect
            your first margin. It also shows which platform suits your category,
            so you can decide where to list first and when to add the second.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="November 24, 2026"
        readTime="5 min read"
        bgColor={{
          light: THEME.soft,
          dark: THEME.dark,
        }}
        highlightColor={THEME.accent}
      />

      <div style={{ maxWidth: 1240, margin: "24px auto 0", padding: "0 16px" }}>
        {/* Quick Answer Banner */}
        <InfoBanner
          accentColor={THEME.accent}
          backgroundColor={THEME.soft}
          title="⚡ QUICK ANSWER"
          content="Flipkart usually gives new sellers better early margins if they sell fashion or products under ₹1,000, because it charges no commission on those items. Amazon tends to suit branded or higher priced products and buyers who spend more per order. Neither choice is permanent, and many sellers end up running both."
        />

        {/* Platform Snapshot Graphic (image_1) */}
        <BlogImageSection
          imageSrc="/images/blogs/40-amazon-vs-flipkart-new-sellers-2026/40_blog_image_1.webp"
          altText="Seller platform snapshot comparing Amazon India and Flipkart on commission, payouts and best fit for new sellers"
          caption="The main differences covered in this guide: commission, payout timing and which products suit each platform."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={keyTakeaways}
              accentColor={THEME.accent}
              backgroundColor={THEME.dark}
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={tocItems}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={tocItems}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <p>
              Most first time sellers do not need a permanent answer. They need
              to know where to start. Searches such as{" "}
              <strong>sell on Flipkart</strong> and{" "}
              <strong>Amazon seller registration</strong> show that people
              compare both platforms before committing, and the 2026 fee changes
              have made that comparison closer than it used to be.
            </p>

            {/* s2 — What new sellers search for */}
            <div id="s2">
              <SectionQA
                title="What Do New Sellers Search For?"
                paragraph1="These are the queries new sellers type most often when they are deciding where to list. Interest is split between both platforms, which is why a one sided answer rarely helps."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <div className="chart-box">
              <div className="chart-title">
                🔍 Average Monthly Searches in India
              </div>
              {searchData.map((row) => (
                <div key={row.label} className="chart-row">
                  <span className="chart-label">{row.label}</span>
                  <div className="chart-track">
                    <div className="chart-fill" style={{ width: row.width }} />
                  </div>
                  <span className="chart-value">{row.volume}</span>
                </div>
              ))}
            </div>

            <InlineNote
              resolvedTheme={resolvedTheme}
              fontSize={13}
              margin="8px 0 24px"
              parts={[
                {
                  text: "Source: Insydz keyword research, 2026. Volumes show interest in each query, not platform market share.",
                },
              ]}
            />

            <InfoBanner
              accentColor={THEME.accent}
              backgroundColor={THEME.soft}
              title="How This Guide Was Compiled"
              content={
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    listStyleType: "disc",
                  }}
                >
                  {compiledNotes.map((note) => (
                    <li key={note} style={{ marginBottom: 6 }}>
                      {note}
                    </li>
                  ))}
                </ul>
              }
            />

            {/* s3 — Registration */}
            <div id="s3">
              <SectionQA
                title="What Registration and Documents Do You Need?"
                paragraph1="Both platforms ask for the same core documents: a PAN, a bank account and, for most sellers, a GST registration. The GST rule catches many beginners, because a regular registration is generally needed even when turnover is low, and the composition scheme is not available to ecommerce suppliers."
                paragraph2={
                  <>
                    Register on the{" "}
                    <a
                      href="https://www.gst.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      GST portal
                    </a>{" "}
                    first. Then start your{" "}
                    <strong>flipkart seller account registration</strong> on{" "}
                    <a
                      href="https://seller.flipkart.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      Flipkart Seller Hub
                    </a>
                    , or begin{" "}
                    <a
                      href="https://sell.amazon.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      Amazon seller signup
                    </a>{" "}
                    if Amazon is your first choice.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* s4 — Fees */}
            <div id="s4">
              <SectionQA
                title="How Do Amazon and Flipkart Fees Compare?"
                paragraph1="Referral rates differ by category on both platforms, so use each official fee calculator for your own product. What changed in 2026 is how each platform treats low priced items and brand new sellers."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={feeColumns} rows={feeRows} />

            <InlineNote
              resolvedTheme={resolvedTheme}
              fontSize={13}
              margin="-16px 0 20px"
              parts={[
                {
                  text: "Payout and penalty details are reported by third party guides and vary by seller tier. Verify in your dashboard.",
                },
              ]}
            />

            <p>
              <strong>Amazon seller charges</strong> moved up in September.
              Fixed closing fees rose across FBA, Easy Ship and{" "}
              <strong>Amazon Seller Flex</strong>, as summarised in this{" "}
              <a
                href="https://www.gonukkad.com/blog/amazon-flipkart-seller-fees-penalties"
                target="_blank"
                rel="noopener noreferrer"
                className={A}
              >
                fee revision report
              </a>
              .
            </p>

            <InfoBanner
              accentColor={THEME.accent}
              backgroundColor={THEME.soft}
              title="What Changed on Flipkart"
              content={
                <>
                  Flipkart removed commission on every fashion product, whatever
                  the price, after earlier limiting the waiver to items up to
                  ₹1,000. Fixed, collection, shipping and return fees still
                  apply, so check your full cost per order. The details are in{" "}
                  <a
                    href="https://stories.flipkart.com/announcement/flipkart-expands-zero-commission-across-fashion-empowering-sellers-and-accelerating-the-growth-of-india-s-fashion-ecosystem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={A}
                  >
                    Flipkart&rsquo;s announcement
                  </a>
                  .
                </>
              }
            />

            {/* s5 — Which platform fits */}
            <div id="s5">
              <SectionQA
                title="Which Platform Fits Your Category?"
                resolvedTheme={resolvedTheme}
              />
              <InsightCards cards={fitCards} columns={3} />
            </div>

            <p>
              Whichever you pick, start with a small catalogue. Check competitor
              prices and review themes before you buy stock, using the{" "}
              <Link
                href="/free-tools/free-amazon-product-analyzer"
                className={A}
              >
                free Amazon product analyzer
              </Link>
              . If you choose Amazon and do not have an account yet, Insydz can
              also help with seller account creation.
            </p>

            {/* s6 — Summary */}
            <div id="s6">
              <SectionQA
                title="Summary: Amazon vs Flipkart for New Sellers"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor={THEME.accent}
              backgroundColor={THEME.soft}
              title="📝 In Short"
              content="Both platforms ask for the same documents: a PAN, a bank account and, for most sellers, a GST registration. Flipkart usually suits fashion and products under ₹1,000, with no commission on those items and faster payouts. Amazon tends to suit branded or higher priced products and buyers who spend more per order. Start on one platform, learn your fees, returns and ad costs, then add the second."
            />

            {/* s7 — FAQ */}
            <div id="s7">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
              <FAQ faqs={faqs} accentColor={THEME.accent} />
            </div>

            <div style={{ marginTop: 40 }}>
              <FeatureCTA
                title="Not sure which platform will pay off?"
                description="Start free and compare price, rank and review data on both from one dashboard, with no card required."
                buttonText="Start Free →"
                buttonHref="/login"
                backgroundColor={THEME.dark}
                buttonColor={THEME.accent}
              />
            </div>
          </article>
        </main>
      </div>

      {/* Bottom Final CTA */}
      <FinalCTA
        title="Compare Both Platforms From One Dashboard"
        description="Start free and compare price, rank and review data on both Amazon and Flipkart, with WhatsApp alerts for sudden changes. No card required."
        primaryButtonText="Start Free on Insydz →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor={THEME.ctaFrom}
        secondaryColor={THEME.ctaTo}
      />
    </div>
  );
}
