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
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import RelatedArticles from "../components/RelatedArticles";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";

export const dynamic = "force-static";

// ── THEME ──────────────────────────────────────────────────────────────────────
// Change the colors for this whole blog here. Purple matches the blog images.
const THEME = {
  accent: "#6D28D9", // main color (buttons, highlights, links, progress bar)
  accentOnDark: "#A78BFA", // accent used for text/links in dark mode
  soft: "#F5F3FF", // light background for boxes
  softDark: "rgba(124,58,237,0.15)", // soft background in dark mode
  border: "#DDD6FE", // card borders
  dark: "#1A0F3D", // dark box and hero (dark mode) background
  ctaFrom: "#5B21B6", // FinalCTA gradient start
  ctaTo: "#7C3AED", // FinalCTA gradient end
  success: "#16A34A", // "Where Insydz Fits" box
  successSoft: "#F0FDF4",
};

// CSS variables so links, TOC and progress bar follow THEME too
const themeVars = {
  "--t-accent": THEME.accent,
  "--t-accent-dark": THEME.accentOnDark,
  "--t-soft": THEME.soft,
  "--t-soft-dark": THEME.softDark,
} as CSSProperties;

const A = "theme-link";

// ── TOC Items ──────────────────────────────────────────────────────────────────
const tocItems = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "Why Ad Spend Is Not the Fix" },
  { id: "s3", label: "6 Ways to Grow Sales" },
  { id: "s4", label: "What to Track" },
  { id: "s5", label: "What to Fix First" },
  { id: "s6", label: "Conclusion" },
  { id: "s7", label: "Frequently Asked Questions" },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "More ad spend does not fix a weak listing. Amazon PPC charges you for clicks, not orders, so raise conversion first.",
  "Six levers grow sales without more budget: the main image and title, review based fixes, Buy Box and stock, Brand Registry tools, moving existing ad budget, and bundles.",
  "In the worked example, 1,000 visits converting at 6.5% instead of 5% gives 65 orders instead of 50, a 30% rise with no extra spend.",
  "Track Unit Session Percentage, Buy Box percentage and Sessions in your Seller Central Business Reports.",
  "Fix the listing in week one, check Buy Box and stock in week two, and reallocate ad budget in week three.",
];

// ── Six Ways (s3) ──────────────────────────────────────────────────────────────
// NOTE: NumberedCards `description` must be typed React.ReactNode for the links.
const sixWays = [
  {
    title: "Rework the main image and title",
    description: (
      <>
        The main image and title decide whether a shopper clicks at all. Show
        the product large and clear, and put the most important search words
        early in the title. Our guide on{" "}
        <Link
          href="/resources/expert-blog/amazon-listing-not-ranking-india"
          className={A}
        >
          why a listing is not ranking
        </Link>{" "}
        lists the checks.
      </>
    ),
  },
  {
    title: "Answer buyer doubts using your own reviews",
    description: (
      <>
        Read your last 90 days of negative reviews and group them by complaint.
        Then fix the top one in your images and bullets, such as size, material
        or what is in the box. Start with{" "}
        <Link
          href="/resources/expert-blog/negative-reviews-amazon-india"
          className={A}
        >
          handling negative reviews
        </Link>{" "}
        and our method for{" "}
        <Link
          href="/resources/expert-blog/amazon-review-analysis-guide-india"
          className={A}
        >
          analysing 500 reviews
        </Link>
        .
      </>
    ),
  },
  {
    title: "Protect your Buy Box and stock",
    description: (
      <>
        You cannot sell well if another offer holds the Add to Cart box or your
        stock runs out. Amazon says FBA can improve your chance of winning it,
        and a competitor price cut can take it from you quickly. See how to{" "}
        <Link
          href="/resources/expert-blog/competitor-undercutting-amazon-india"
          className={A}
        >
          respond to undercutting
        </Link>{" "}
        and set a floor with our{" "}
        <Link href="/use-cases/track-competitor-prices" className={A}>
          repricing guide
        </Link>
        .
      </>
    ),
  },
  {
    title: "Use free brand tools if you own a brand",
    description: (
      <>
        Amazon says{" "}
        <a
          href="https://sell.amazon.in/brands"
          target="_blank"
          rel="noopener noreferrer"
          className={A}
        >
          Brand Registry
        </a>{" "}
        unlocks tools that protect and build your brand. These include A+
        Content for the detail page and a free Store. Enrolment starts with an
        active or pending trademark.
      </>
    ),
  },
  {
    title: "Move the ad budget you already have",
    description: (
      <>
        Keep your total the same, but shift it. Pause search terms that spent
        money and brought no orders, and give that budget to terms that already
        convert. Our post on{" "}
        <Link
          href="/resources/expert-blog/find-competitor-keywords-amazon-india"
          className={A}
        >
          finding competitor keywords
        </Link>{" "}
        helps you pick the replacements.
      </>
    ),
  },
  {
    title: "Bundle products to raise order value",
    description:
      "Pair your product with a low cost accessory or sell a two pack. Revenue rises without a single extra click. Check your margin with an Amazon seller profit calculator before you launch the bundle.",
  },
];

// ── Metrics Table (s4) ─────────────────────────────────────────────────────────
const metricsColumns: TableColumn[] = [
  { key: "metric", label: "METRIC", cellClassName: "font-semibold" },
  { key: "tells", label: "WHAT IT TELLS YOU" },
  { key: "action", label: "WHAT TO DO" },
];

const metricsRows: TableRow[] = [
  {
    metric: "Unit Session Percentage",
    tells: "How many visits become orders",
    action: "Fix image, bullets and price if low",
  },
  {
    metric: "Buy Box percentage",
    tells: "How often your offer holds Add to Cart",
    action: "Check price, stock and competitors",
  },
  {
    metric: "Sessions",
    tells: "How much traffic the listing gets",
    action: "Work on title and keywords if low",
  },
];

// ── FAQs (s7) ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Can you increase sales on Amazon without running ads?",
    a: "Yes. Better images, clearer listings, stronger reviews, a winning price and steady stock all raise conversion, which means more orders from the same traffic. Ads still help new listings get seen, but fixing the listing first makes every ad rupee work harder.",
  },
  {
    q: "What is a good conversion rate on Amazon India?",
    a: "It varies by category and price, so compare your listing with similar products, not a single number. In Seller Central Business Reports, the Unit Session Percentage shows your conversion. If it sits below competitors selling at a similar price, fix the listing before you add budget.",
  },
  {
    q: "How do I win the Buy Box on Amazon India?",
    a: "Price, stock availability and fulfilment all matter. Amazon says FBA can improve your chance of winning the Add to Cart box. Keep stock in, track competitor prices daily and avoid dropping below your price floor just to match every cut.",
  },
  {
    q: "How long do listing changes take to improve sales?",
    a: "Image and bullet changes can show in your conversion within one to two weeks, once enough buyers have seen the new version. Review and rating gains take longer. Change one thing at a time so you can tell which edit made the difference.",
  },
  {
    q: "Is Amazon Brand Registry worth it for small sellers?",
    a: "If you own a brand, often yes. Amazon says Brand Registry unlocks tools to protect and build your brand, including A+ Content and a free Store. You need an active or pending trademark to start enrolment, so factor that cost and time in.",
  },
];

// ── Related Articles ───────────────────────────────────────────────────────────
const relatedArticlesCards = [
  {
    tag: "Seller Tools and Strategy",
    title: "5 Habits of Top 10% Amazon India Sellers",
    route: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
    image: "/Habits of Top Amazon India Sellers.png",
  },
  {
    tag: "Pricing Strategy",
    title: "How to Survive an Amazon India Price War",
    route: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
    image: "/Blog_30_banner.png",
  },
  {
    tag: "Reviews",
    title: "Amazon Vine Program India 2026: Is It Worth the Cost?",
    route: "/resources/expert-blog/amazon-vine-program-india-2026",
    image: "/Amazon Vine Program India.png",
  },
];

export default function IncreaseSalesAmazonIndiaWithoutAdSpendContent() {
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
          { label: "Increase Sales Without Ad Spend" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Seller Growth · Conversion"
        title={
          <>
            How Can You Increase Sales on Amazon India{" "}
            <span style={{ color: THEME.accent }}>
              Without Increasing Ad Spend?
            </span>
          </>
        }
        description={
          <>
            When sales stall, the usual reaction is to raise the ad budget. That
            works only if the listing turns clicks into orders. If it does not,
            every extra rupee buys more visitors who leave.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="October 24, 2026"
        readTime="6 min read"
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
          content="To increase sales on Amazon India without more ad spend, raise your conversion rate. Improve the main image and title, answer buyer doubts using review feedback, protect your Buy Box and stock, use Brand Registry tools, move existing ad budget to terms that sell, and bundle products to lift order value."
        />

        {/* Overview Graphic (image_1) */}
        <BlogImageSection
          imageSrc="/images/blogs/38-increase-sales-amazon-india-without-ad-spend/38_blog_image_1.webp"
          altText="Six ways to increase Amazon India sales without more ad spend: listing conversion, review insights, Buy Box and stock, and ad budget reallocation"
          caption="The levers in this guide: fix listing conversion, act on review feedback, protect your Buy Box and stock, and move the ad budget you already have."
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
            {/* s2 — Why ad spend is not the fix */}
            <div id="s2">
              <SectionQA
                title="Why Does More Ad Spend Not Always Mean More Sales?"
                paragraph1="Amazon PPC (pay per click advertising) charges you for clicks, not orders. A listing that converts 5 in every 100 visitors gives you 5 orders from 100 clicks. If you lift that to 8, the same 100 clicks give you 8 orders, and your ad cost per order falls by more than a third."
                paragraph2="That is why fixing conversion comes before raising budget. It makes your current traffic, paid and organic, worth more."
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* s3 — Six ways */}
            <div id="s3">
              <SectionQA
                title="How Do You Increase Sales on Amazon India Without Raising Ad Spend?"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={sixWays}
              numberColor={THEME.accent}
              backgroundColor={THEME.soft}
              borderColor={THEME.border}
              variant="number"
            />

            <InfoBanner
              accentColor={THEME.accent}
              backgroundColor={THEME.soft}
              title="🧮 Worked Example"
              content={
                <>
                  <div style={{ marginBottom: 10 }}>
                    A listing gets 1,000 visits a month and converts at 5%,
                    which is 50 orders. After an image and bullet fix it
                    converts at 6.5%, which is 65 orders. Ad spend and traffic
                    did not change, but orders rose by <strong>30%</strong>.
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>
                    These numbers are illustrative. Test one change at a time.
                  </div>
                </>
              }
            />

            {/* s4 — What to track */}
            <div id="s4">
              <SectionQA
                title="What Should You Track in Your Amazon Seller Dashboard?"
                paragraph1={
                  <>
                    Your Amazon seller dashboard in{" "}
                    <a
                      href="https://sellercentral.amazon.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={A}
                    >
                      Seller Central
                    </a>{" "}
                    has Business Reports that show where sales are leaking.
                    Three figures matter most.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={metricsColumns} rows={metricsRows} />

            <p>
              Seller Central shows these numbers, but only for your own
              listings. Amazon seller tools add the competitor side, so you can
              see why a rival is converting better.
            </p>

            {/* s5 — What to fix first */}
            <div id="s5">
              <SectionQA
                title="What Should You Fix First?"
                paragraph1="Start with the listing, because it costs nothing. Check the main image and top review complaint in week one. Look at Buy Box and stock in week two, and reallocate ad budget in week three."
                paragraph2={
                  <>
                    If sales have fallen recently, read our guide to{" "}
                    <Link
                      href="/resources/expert-blog/amazon-listing-not-ranking-india"
                      className={A}
                    >
                      why Amazon sales drop
                    </Link>{" "}
                    first. It helps you find the cause before you change
                    anything.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor={THEME.success}
              backgroundColor={THEME.successSoft}
              title="⚡ Where Insydz Fits"
              content={
                <>
                  Insydz shows competitor prices, keywords and review themes on
                  Amazon and Flipkart in one dashboard, and sends{" "}
                  <Link href="/features/whatsapp-alerts-feature" className={A}>
                    WhatsApp alerts
                  </Link>{" "}
                  when your Buy Box or a rival price changes. Compare options in
                  our roundup of the{" "}
                  <Link
                    href="/resources/expert-blog/best-amazon-seller-tools-india-2026"
                    className={A}
                  >
                    best Amazon seller tools in India
                  </Link>
                  .
                </>
              }
            />

            {/* s6 — Conclusion */}
            <div id="s6">
              <SectionQA
                title="Conclusion"
                paragraph1="More ad spend should be the last lever you pull, not the first. Fix the listing, protect your Buy Box and stock, and move the budget you already have. Change one thing at a time, watch your Unit Session Percentage, and let the numbers show what works."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FeatureCTA
              title="Find where your sales are leaking"
              description="Connect your Amazon listings and see competitor prices, keywords and review themes in one place. Free to start, no credit card."
              buttonText="Start Free on Insydz →"
              buttonHref="/login"
              backgroundColor={THEME.dark}
              buttonColor={THEME.accent}
            />

            {/* s7 — FAQ */}
            <div id="s7">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
              <FAQ faqs={faqs} accentColor={THEME.accent} />
            </div>

            <RelatedArticles
              title="Related Reading"
              cards={relatedArticlesCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Bottom Final CTA */}
      <FinalCTA
        title="Find Where Your Sales Are Leaking"
        description="Connect your Amazon listings and see competitor prices, keywords and review themes in one place. Free to start, no credit card."
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
