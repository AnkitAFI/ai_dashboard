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
// Change the colors for this whole blog here. Yellow matches the blog images.
const THEME = {
  accent: "#D97706", // main color (buttons, highlights, links, progress bar)
  highlight: "#F59E0B", // brighter yellow for the hero title highlight
  accentOnDark: "#FBBF24", // accent used for text/links in dark mode
  soft: "#FFFBEB", // light background for boxes
  softDark: "rgba(245,158,11,0.15)", // soft background in dark mode
  border: "#FDE68A", // card and chart borders
  borderDark: "rgba(245,158,11,0.3)", // borders in dark mode
  dark: "#241A08", // dark box and hero (dark mode) background
  ctaFrom: "#B45309", // FinalCTA gradient start
  ctaTo: "#D97706", // FinalCTA gradient end
  success: "#16A34A", // positive / green accents
  successSoft: "rgba(22,163,74,0.12)",
  warn: "#DC2626", // "Check Your Address First" box
  warnSoft: "#FEF2F2",
  neutral: "#64748B", // slate accents
  neutralSoft: "rgba(100,116,139,0.12)",
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
  { id: "s2", label: "What Beginners Search For" },
  { id: "s3", label: "Step 1: Pick a Product" },
  { id: "s4", label: "Step 2: GST, PAN and Bank Account" },
  { id: "s5", label: "Step 3: Choose Where to Sell" },
  { id: "s6", label: "Step 4: Open Your Seller Account" },
  { id: "s7", label: "What It Really Costs" },
  { id: "s8", label: "Your First 30 Days" },
  { id: "s9", label: "Summary" },
  { id: "s10", label: "Frequently Asked Questions" },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "Start with one light, easy to pack product, and check the top 10 listings for price, reviews and seller count before you buy stock.",
  "Most marketplace sellers need a PAN, a bank account in the business name and a regular GST registration. TCS is 0.5% of net taxable sales and can be claimed back.",
  "Neither Amazon nor Flipkart charges a joining fee. You pay referral, fixed and shipping fees on each sale.",
  "Amazon's first settlement arrives about 14 days after registration, then roughly weekly. Flipkart pays about 3 to 10 days after dispatch.",
  "Plan your first 30 days: register in week 1, list and test 5 to 10 products in weeks 2 and 3, and review costs in week 4.",
];

// ── Search Chart Data (s2) ─────────────────────────────────────────────────────
const searchData = [
  { label: "Flipkart seller account", volume: "33,100", width: "100%" },
  { label: "Sell on Flipkart", volume: "6,600", width: "20%" },
  { label: "Amazon seller registration", volume: "4,400", width: "13%" },
  { label: "Amazon seller charges", volume: "1,600", width: "5%" },
  { label: "How to sell on Flipkart", volume: "1,000", width: "3%" },
];

// ── Compiled-by list (s2) ──────────────────────────────────────────────────────
const compiledNotes = [
  "GST and TCS rules were checked against a 2026 compliance explainer, last updated November 16, 2026, and the official GST portal.",
  "Costs and payout timing come from published 2026 seller guides. They vary by category and seller tier.",
  "Both platforms change fees and forms often, so confirm the current details on their own seller pages before you apply.",
  "Last reviewed on November 17, 2026.",
];

// ── Where-to-sell Table (s5) ───────────────────────────────────────────────────
const routeColumns: TableColumn[] = [
  { key: "route", label: "ROUTE", cellClassName: "font-semibold" },
  { key: "cost", label: "UPFRONT COST" },
  { key: "best", label: "BEST FOR" },
  { key: "watch", label: "WATCH OUT FOR" },
];

const routeRows: TableRow[] = [
  {
    route: "Amazon India",
    cost: "No joining fee",
    best: "Branded and higher priced products",
    watch: "Referral fee from 0% to 30% by category",
  },
  {
    route: "Flipkart",
    cost: "No joining fee",
    best: "Fashion and products under ₹1,000",
    watch:
      "0% commission under ₹1,000, but fixed, shipping and return fees apply",
  },
  {
    route: "Meesho",
    cost: "Zero commission to list",
    best: "Low priced items for Tier 2 and Tier 3 buyers",
    watch: "Other charges show only in the supplier panel",
  },
  {
    route: "Own website",
    cost: "From ₹1,499 a month",
    best: "Brands with an existing audience",
    watch: "You must bring your own buyers",
  },
];

// ── Costs Table (s7) ───────────────────────────────────────────────────────────
const greenChip =
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold";
const totalRow =
  "font-bold !bg-slate-100 dark:!bg-slate-800 text-gray-900 dark:text-white";

const costColumns: TableColumn[] = [
  { key: "item", label: "ITEM" },
  {
    key: "amount",
    label: "AMOUNT",
    headerClassName: "text-right",
    cellClassName: "text-right whitespace-nowrap",
  },
];

const costRows: TableRow[] = [
  { item: "Selling price (GST inclusive)", amount: "₹699" },
  { item: "GST portion", amount: "₹33" },
  {
    item: "Commission",
    amount: { type: "chip", label: "₹0", className: greenChip },
  },
  { item: "Fixed fee", amount: "From ₹1" },
  { item: "Shipping", amount: "From about ₹37" },
  { item: "TCS at 0.5%", amount: "₹3 (claimable back)" },
  {
    rowClassName: totalRow,
    item: "Left before product cost",
    amount: "About ₹625",
  },
];

// ── First 30 Days Cards (s8) ───────────────────────────────────────────────────
const first30Cards: InsightCard[] = [
  {
    icon: "1",
    iconBg: "rgba(245,158,11,0.18)",
    iconColor: THEME.accent,
    title: "Week 1: Register",
    description:
      "Complete GST, PAN and bank setup, then submit your seller account application.",
    chips: [{ label: "Setup", bg: THEME.softDark, color: THEME.accent }],
    minHeight: 200,
    borderColor: THEME.border,
  },
  {
    icon: "2",
    iconBg: THEME.successSoft,
    iconColor: THEME.success,
    title: "Weeks 2 and 3: List and test",
    description:
      "Add 5 to 10 products. Check competitor prices and review themes before you set your own.",
    chips: [{ label: "Listing", bg: THEME.successSoft, color: THEME.success }],
    minHeight: 200,
    borderColor: THEME.border,
  },
  {
    icon: "3",
    iconBg: THEME.neutralSoft,
    iconColor: THEME.neutral,
    title: "Week 4: Review",
    description:
      "Compare fees, returns and payouts with your plan, then adjust prices or drop weak products.",
    chips: [{ label: "Review", bg: THEME.neutralSoft, color: THEME.neutral }],
    minHeight: 200,
    borderColor: THEME.border,
  },
];

// ── FAQs (s10) ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Do I need GST to start an online selling business in India?",
    a: "For most marketplace sellers, yes, because Amazon and Flipkart collect tax at source and generally ask for a GST registration. Small sellers below the 40 lakh rupee goods limit who sell within one state may use a lighter enrolment on ONDC or their own store. Confirm your case with a chartered accountant.",
  },
  {
    q: "How much money do I need to start selling online in India?",
    a: "Marketplaces charge no joining fee, so your main costs are stock, packaging and the fees on each sale. A first order of 5 to 10 products is enough to test demand. An own website adds a platform fee, such as Shopify Basic at 1,499 rupees a month on annual billing.",
  },
  {
    q: "Which is better for a beginner, Amazon or Flipkart?",
    a: "Neither wins for every product. Flipkart charges no commission on products under 1,000 rupees, which helps fashion and low priced items, while Amazon suits branded and higher priced products. Many sellers start on one, learn their real costs, and add the second platform later.",
  },
  {
    q: "How do online sellers get paid in India?",
    a: "Amazon settles about 14 days after registration and then roughly weekly, and the money reaches your bank 2 to 3 working days later. Flipkart pays about 3 to 10 days after dispatch, depending on seller tier. Cash on delivery orders pay out more slowly, so keep spare cash for the first weeks.",
  },
];

export default function HowToStartOnlineSellingBusinessIndiaContent() {
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

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9,#s10{scroll-margin-top:120px}

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
          { label: "How to Start an Online Selling Business in India" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Seller Guide · Getting Started"
        title={
          <>
            How to Start an{" "}
            <span style={{ color: THEME.highlight }}>
              Online Selling Business
            </span>{" "}
            in India: A Beginner&rsquo;s Guide
          </>
        }
        description={
          <>
            A step by step roadmap covering GST, documents, where to sell, real
            costs and your first 30 days, checked against 2026 rules.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="November 17, 2026"
        readTime="7 min read"
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
          content="To start an online selling business in India, pick one product, set up a PAN, a business bank account and a GST registration, then open a seller account on Amazon or Flipkart. Neither platform charges a joining fee. You pay referral, fixed and shipping fees on each sale, so check competitor prices before you buy stock."
        />

        {/* Roadmap Graphic (image_1) */}
        <BlogImageSection
          imageSrc="/images/blogs/39-how-to-start-online-selling-business-india/39_blog_image_1.webp"
          altText="30 day seller launch roadmap: pick a product, GST PAN and bank, choose a marketplace, create listings, review and improve"
          caption="The five steps in this guide, from picking a product to reviewing your first month."
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
              Most people who want to sell online stall before the first
              listing. The same three questions come up every time: do I need
              GST, which platform costs less, and how much money do I need? This
              guide answers them in the order you will face them.
            </p>

            {/* s2 — What beginners search for */}
            <div id="s2">
              <SectionQA
                title="What Do Beginners Search For?"
                paragraph1={
                  <>
                    Account setup is the first hurdle. Searches for a{" "}
                    <strong>flipkart seller account</strong> far outnumber
                    searches about seller fees, and the Flipkart route is where
                    most beginners ask for help first.
                  </>
                }
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
                  text: "Source: Insydz keyword research, 2026. The Flipkart seller account figure likely includes people looking for login help, so read it as interest, not as a count of new sellers.",
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

            {/* s3 — Step 1 */}
            <div id="s3">
              <SectionQA
                title="Step 1: Pick a Product You Can Check Before You Buy"
                paragraph1="Start with one product group, not a full catalogue. Choose something light, easy to pack and not fragile, so shipping and returns stay cheap."
                paragraph2={
                  <>
                    Then do your <strong>Amazon product research</strong>. Open
                    the top 10 listings for your product and note the price
                    range, review count and rating. Check how many sellers share
                    each listing, because crowded listings are harder for a new
                    seller to win.
                  </>
                }
                paragraph3={
                  <>
                    Insydz offers a{" "}
                    <Link
                      href="/free-tools/free-amazon-product-analyzer"
                      className={A}
                    >
                      free Amazon product analyzer
                    </Link>{" "}
                    and a{" "}
                    <Link
                      href="/free-tools/free-competitor-price-checker"
                      className={A}
                    >
                      competitor price checker
                    </Link>{" "}
                    for this step. For title keywords, see our guide to the{" "}
                    <Link
                      href="/resources/expert-blog/best-amazon-keyword-research-tool-india"
                      className={A}
                    >
                      best Amazon keyword research tools in India
                    </Link>
                    .
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* s4 — Step 2 */}
            <div id="s4">
              <SectionQA
                title="Step 2: Set Up GST, PAN and a Bank Account"
                paragraph1={
                  <>
                    Marketplaces approve you on three things: a PAN, a bank
                    account in the business name and, for most sellers, a GST
                    registration. Registration is generally required because
                    marketplaces collect tax at source (TCS, a small share held
                    back from each sale). This{" "}
                    <a
                      href="https://www.patronaccounting.com/blog/gst-registration-mandatory-amazon-flipkart-sellers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      explainer from Patron Accounting
                    </a>{" "}
                    sets out the legal basis.
                  </>
                }
                paragraph2="The TCS rate is 0.5% of net taxable sales, halved from 1% in July 2024. You can claim it back through your GST filing."
                paragraph3={
                  <>
                    Apply for a regular registration on the official{" "}
                    <a
                      href="https://www.gst.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      GST portal
                    </a>
                    . The composition scheme (a simplified tax option for small
                    businesses) is not open to ecommerce sellers. A few exempt
                    products, such as books, can be listed without a GSTIN, so
                    check the current list in your seller dashboard.
                  </>
                }
                paragraphs={[
                  <>
                    Also consider a free Udyam registration, the
                    government&rsquo;s small business certificate, on the
                    official{" "}
                    <a
                      href="https://udyamregistration.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      Udyam portal
                    </a>
                    . It is not required to start, but it is useful for loans
                    and government schemes later.
                  </>,
                ]}
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor={THEME.warn}
              backgroundColor={THEME.warnSoft}
              title="Check Your Address First"
              content="On Amazon.in, your pickup address must be in the same state as your GST registration. Decide the address before you apply."
            />

            {/* s5 — Step 3 */}
            <div id="s5">
              <SectionQA
                title="Step 3: Choose Where to Sell"
                paragraph1="Marketplaces bring ready buyers, so most beginners start there. An own website gives you more control but needs your own traffic."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={routeColumns} rows={routeRows} />

            <InlineNote
              resolvedTheme={resolvedTheme}
              fontSize={13}
              margin="-16px 0 20px"
              parts={[
                {
                  text: "Shopify Basic price is on annual billing. Figures come from published 2026 guides, so verify them on each platform.",
                },
              ]}
            />

            <p>
              Many sellers start on one marketplace, learn their real costs,
              then add a second. Our guide to{" "}
              <Link
                href="/resources/expert-blog/amazon-vs-flipkart-india-seller"
                className={A}
              >
                Amazon vs Flipkart for Indian sellers
              </Link>{" "}
              compares the two in more detail.
            </p>

            {/* s6 — Step 4 */}
            <div id="s6">
              <SectionQA
                title="Step 4: Open Your Seller Account and List"
                paragraph1={
                  <>
                    To <strong>sell on Flipkart</strong>, start at{" "}
                    <a
                      href="https://seller.flipkart.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      Flipkart Seller Hub
                    </a>
                    . If you are wondering{" "}
                    <strong>how to become seller on Flipkart</strong>, the form
                    asks for your GSTIN, PAN, bank details and a pickup address.
                  </>
                }
                paragraph2={
                  <>
                    For <strong>Amazon seller registration</strong>, use the{" "}
                    <a
                      href="https://sell.amazon.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      Amazon Seller Central signup
                    </a>{" "}
                    and keep the same details ready.
                  </>
                }
                paragraph3={
                  <>
                    Once approved, create one listing per product variant, with
                    your main keyword in the title and photos that meet your
                    category&rsquo;s rules. Add a GTIN (a barcode number) if the
                    product is branded, because listings that miss the rules can
                    be hidden from buyers. To see which words competitors rank
                    for, read how to{" "}
                    <Link
                      href="/resources/expert-blog/find-competitor-keywords-amazon-india"
                      className={A}
                    >
                      find competitor keywords on Amazon India
                    </Link>
                    .
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* s7 — Costs */}
            <div id="s7">
              <SectionQA
                title="What Does It Really Cost to Start Selling Online?"
                paragraph1="Neither marketplace charges a joining fee. You pay on each sale instead. This table shows where a ₹699 order goes on Flipkart under the zero commission rule for items under ₹1,000."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={costColumns} rows={costRows} />

            <InlineNote
              resolvedTheme={resolvedTheme}
              fontSize={13}
              margin="-16px 0 20px"
              parts={[
                {
                  text: "Illustrative example from a published 2026 guide. Actual fees depend on category, weight and seller tier.",
                },
              ]}
            />

            <p>
              <strong>Amazon seller charges</strong> work differently. The
              referral fee runs from 0% to 30% by category, a closing fee and
              shipping fee are added, and 18% GST applies on the fees. Returns,
              packing and the product itself come out of what is left, so price
              with the full picture.
            </p>
            <p>
              Payout timing also affects your cash. Amazon&rsquo;s first
              settlement arrives about 14 days after registration, then roughly
              weekly, and the money reaches your bank 2 to 3 working days later.
            </p>
            <p>
              Flipkart pays about 3 to 10 days after dispatch, depending on
              seller tier. Cash on delivery orders pay out more slowly.
            </p>

            {/* s8 — First 30 days */}
            <div id="s8">
              <SectionQA
                title="What Should You Do in Your First 30 Days?"
                resolvedTheme={resolvedTheme}
              />
              <InsightCards cards={first30Cards} columns={3} />
            </div>

            <p>
              Once listings are live, Insydz tracks price, rank and reviews on{" "}
              <Link href="/solutions/amazon-sellers" className={A}>
                Amazon
              </Link>{" "}
              and Flipkart together, with{" "}
              <Link href="/features/whatsapp-alerts-feature" className={A}>
                WhatsApp alerts
              </Link>{" "}
              for sudden changes. The full list is on the{" "}
              <Link href="/features" className={A}>
                features page
              </Link>
              .
            </p>

            {/* s9 — Summary */}
            <div id="s9">
              <SectionQA
                title="Summary: How to Start an Online Selling Business in India"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor={THEME.accent}
              backgroundColor={THEME.soft}
              title="📝 In Short"
              content="Pick one light, easy to pack product and check the top 10 listings before you buy stock. Set up a PAN, a bank account in the business name and a regular GST registration, then choose one marketplace and open your seller account. Neither Amazon nor Flipkart charges a joining fee, so your costs are stock, packaging and the fees on each sale. Use your first 30 days to register, list and test 5 to 10 products, and then review fees, returns and payouts before you scale."
            />

            {/* s10 — FAQ */}
            <div id="s10">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
              <FAQ faqs={faqs} accentColor={THEME.accent} />
            </div>

            <div style={{ marginTop: 40 }}>
              <FeatureCTA
                title="Ready to check your first product before you invest in stock?"
                description="Start free and compare price, rank and review data on Amazon and Flipkart from one dashboard, with no card required."
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
        title="Check Your First Product Before You Stock It"
        description="Start free and compare price, rank and review data on Amazon and Flipkart from one dashboard, with WhatsApp alerts for sudden changes. No card required."
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
