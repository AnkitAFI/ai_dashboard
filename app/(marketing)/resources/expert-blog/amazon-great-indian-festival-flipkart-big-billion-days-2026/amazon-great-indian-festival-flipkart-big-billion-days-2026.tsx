"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import FeatureCTA from "../components/FeatureCTA";
import HeroSection from "../components/HeroSection";
import HeroStats from "../components/HeroStats";
import SectionQA from "../components/SectionQA";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import RelatedArticles from "../components/RelatedArticles";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";

export const dynamic = "force-static";

const linkCls = "text-emerald-700 dark:text-emerald-400 underline font-semibold";

// ── TOC Items ──────────────────────────────────────────────────────────────────
const tocItems = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "When Do Both Sales Start?" },
  { id: "s3", label: "The 8 Day Plan Before October 8" },
  { id: "s4", label: "How Big Billion Days Changes Your Plan" },
  { id: "s5", label: "Mistakes That Cost Sellers Margin" },
  { id: "s6", label: "Frequently Asked Questions" },
];

// ── Hero Stats ─────────────────────────────────────────────────────────────────
const heroStats = [
  {
    value: "Oct 8",
    label:
      "Amazon Great Indian Festival start date. Flipkart's early access opens the same day",
  },
  {
    value: "8 days",
    label:
      "Left to set price floors, check stock, and fix listings before the sale starts",
  },
  {
    value: "20L+",
    label:
      "Amazon India sellers this festive season, more competitors means more price pressure",
  },
  {
    value: "24–48 hrs",
    label:
      "Time for a listing title update to index on Amazon India, update now to rank before peak traffic",
  },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "Amazon Great Indian Festival starts October 8. Flipkart Big Billion Days follows October 9, with early access for some buyers on October 8 itself, so treat October 8 as the real start of demand on both marketplaces.",
  "From today, sellers have eight days to prepare. Work in order: set a price floor for every SKU, check stock, fix your weakest listings, plan ad budgets by margin, then switch on alerts and stop editing.",
  "A price floor should cover product cost, marketplace fees, shipping, ad cost per order and a minimum margin. Below that number, extra sales usually lose money, whatever a competitor does.",
  "Amazon has not announced an end date for the Great Indian Festival. Plan stock and ad budgets without assuming a short window.",
  "Eight days is enough to set floors, check stock, fix listings and switch on alerts. It is not enough to launch a new product or wait on new inventory, so focus on the listings you already sell.",
];

// ── Dates Table (s2) ───────────────────────────────────────────────────────────
const datesColumns: TableColumn[] = [
  { key: "sale", label: "SALE", cellClassName: "font-semibold" },
  { key: "start", label: "START DATE", cellClassName: "whitespace-nowrap" },
  { key: "early", label: "EARLY ACCESS" },
  { key: "end", label: "END DATE" },
];

const datesRows: TableRow[] = [
  {
    sale: "Amazon Great Indian Festival 2026",
    start: "October 8",
    early: "Not stated",
    end: "Not announced",
  },
  {
    sale: "Flipkart Big Billion Days 2026",
    start: "October 9",
    early: "October 8 for Plus, Black and Flipkart credit card members",
    end: "Check Seller Hub",
  },
];

// ── 8 Day Plan (s3) ────────────────────────────────────────────────────────────
// NOTE: NumberedCards `description` must be typed React.ReactNode for the links.
const planSteps = [
  {
    title: "Set a price floor for every SKU",
    description: (
      <>
        <strong>September 30 to October 1.</strong> Add product cost,
        marketplace fees, shipping, ad cost per order and the minimum profit you
        accept. That total is the lowest price you will ever list at. Set it as
        the limit in any repricing rule, as covered in our{" "}
        <Link
          href="/resources/expert-blog/amazon-repricing-strategy-india-2026"
          className={linkCls}
        >
          repricing guide
        </Link>
        .
      </>
    ),
  },
  {
    title: "Check stock on both marketplaces",
    description: (
      <>
        <strong>October 1 to 2.</strong> Many sellers plan for about three times
        normal daily sales during a big event, as we noted in the{" "}
        <Link
          href="/resources/expert-blog/prime-day-india-2026-seller-questions"
          className={linkCls}
        >
          Prime Day guide
        </Link>
        . If you sell on both platforms, split units by where each product
        actually converts. Our{" "}
        <Link
          href="/resources/expert-blog/amazon-vs-flipkart-india-seller"
          className={linkCls}
        >
          Amazon vs Flipkart comparison
        </Link>{" "}
        shows how the two differ.
      </>
    ),
  },
  {
    title: "Fix the listings that will get the most traffic",
    description: (
      <>
        <strong>October 3 to 4.</strong> Read your last 90 days of negative
        reviews and remove the top complaint from the listing copy or images.
        Then check that your title carries the words festive buyers type. Start
        with the steps in{" "}
        <Link
          href="/resources/expert-blog/negative-reviews-amazon-india"
          className={linkCls}
        >
          this review guide
        </Link>
        .
      </>
    ),
  },
  {
    title: "Plan your ad budgets by margin",
    description: (
      <>
        <strong>October 5 to 6.</strong> Raise Amazon PPC (pay per click
        advertising) budgets only on products with healthy stock and margin.
        Pause ads on anything likely to sell out. See how{" "}
        <Link href="/solutions/amazon-advertising" className={linkCls}>
          Insydz supports Amazon advertising
        </Link>{" "}
        for reference.
      </>
    ),
  },
  {
    title: "Switch on alerts and stop editing",
    description: (
      <>
        <strong>October 7.</strong> Turn on competitor price and Buy Box alerts
        so changes reach you on your phone. Watch for{" "}
        <Link
          href="/resources/expert-blog/amazon-listing-hijacker-india"
          className={linkCls}
        >
          listing hijackers
        </Link>
        , since festive traffic attracts them. Then leave the listings alone
        until the sale starts.
      </>
    ),
  },
];

// ── FAQs (s6) ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "When does Amazon Great Indian Festival 2026 start?",
    a: "Amazon India announced on September 21, 2026 that the Great Indian Festival starts on October 8, 2026. Amazon has not stated a separate early access time for Prime members in that announcement, so check Seller Central for any updates to your deal slots.",
  },
  {
    q: "When does Flipkart Big Billion Days 2026 start?",
    a: "The main Flipkart Big Billion Days 2026 sale starts on October 9. Early access opens on October 8 for Flipkart Plus, Flipkart Black and Flipkart credit card members, so sellers should treat October 8 as the real start of demand.",
  },
  {
    q: "What is the Amazon Great Indian Festival 2026 end date?",
    a: "Amazon has not published an end date yet. Sellers should plan stock and ad budgets without assuming a short window, and review the Amazon India announcement page and Seller Central for updates as the sale gets closer.",
  },
  {
    q: "Should sellers cut prices for both sales?",
    a: "Only down to a price floor you have calculated in advance. The floor should cover product cost, marketplace fees, shipping, ad cost per order and a minimum margin. Below that number, extra sales usually lose money.",
  },
  {
    q: "Is it too late to prepare with only 8 days left?",
    a: "No. Eight days is enough to set price floors, check stock, fix listing problems and switch on alerts. It is not enough to launch a new product or wait on new inventory transfers, so focus on the listings you already sell.",
  },
];

// ── Related Articles ───────────────────────────────────────────────────────────
const relatedArticlesCards = [
  {
    tag: "Festive Trends",
    title: "Amazon Great Freedom Festival 2026: Seller Prep Guide",
    route:
      "/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide",
    image: "/prime-day-india-2026-seller-questions.png",
  },
  {
    tag: "Pricing Strategy",
    title: "Competitor Undercutting Your Amazon India Price? Act Within 1 Hour",
    route: "/resources/expert-blog/competitor-undercutting-amazon-india",
    image: "/Detect Competitor Price Undercutting on Amazon India.png",
  },
  {
    tag: "Seller Tools and Strategy",
    title: "5 Habits of Top 10% Amazon India Sellers",
    route: "/resources/expert-blog/top-amazon-india-sellers-habits",
    image: "/Habits of Top Amazon India Sellers.png",
  },
];

export default function GreatIndianFestivalBBD2026Content() {
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
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#01905B,#10B981);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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

        /* TOC links */
        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#01905B;background:#E9F8EC;border-left-color:#34D399}
        .toc-link.active{color:#01905B;background:#E9F8EC;border-left-color:#01905B}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(1,144,91,.15);color:#34D399;border-left-color:rgba(1,144,91,.4)}
        .dark .toc-link.active{background:rgba(1,144,91,.2);color:#34D399;border-left-color:#01905B}

        #s1,#s2,#s3,#s4,#s5,#s6{scroll-margin-top:120px}

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
          { label: "Great Indian Festival and Big Billion Days 2026" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Festive Trends · Seller Guide"
        title={
          <>
            Amazon Great Indian Festival and Flipkart Big Billion Days 2026.{" "}
            <span style={{ color: "#01905B" }}>
              What should sellers do before October 8?
            </span>
          </>
        }
        description={
          <>
            Amazon Great Indian Festival starts on October 8. Flipkart Big
            Billion Days follows on October 9, with early access for some buyers
            on October 8 itself. From today, that leaves you eight days.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="September 2026"
        readTime="6 min read"
        // tags={["Festive Trends", "Seller Guide"]}
        bgColor={{
          light: "#E9F8EC",
          dark: "#0E281F",
        }}
        highlightColor="#01905B"
      />

      <div style={{ maxWidth: 1240, margin: "24px auto 0", padding: "0 16px" }}>
        {/* Hero Stats */}
        <HeroStats
          stats={heroStats}
          accentColor="#01905B"
          resolvedTheme={resolvedTheme}
          marginBottom={24}
        />

        {/* Quick Answer Banner */}
        <InfoBanner
          accentColor="#01905B"
          backgroundColor="#E9F8EC"
          title="⚡ QUICK ANSWER"
          content="Amazon announced the October 8 start on September 21, and Flipkart's main sale opens October 9. Before October 8, set a price floor for every SKU, check stock, fix your weakest listings, plan ad budgets, and switch on competitor alerts. Amazon has not announced an end date yet."
        />

        {/* Countdown Graphic */}
        <BlogImageSection
          imageSrc="/images/blogs/36-amazon-great-indian-festival-flipkart-big-billion-days-2026/36_blog_image_1.webp"
          altText="8 day countdown to Amazon Great Indian Festival 2026 with prep checklist"
          caption="An illustrative 8 day prep timeline. Follow the same sequence in the plan below, and use your own dates from today."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={keyTakeaways}
              accentColor="#01905B"
              backgroundColor="#0E281F"
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
            {/* s2 — Dates */}
            <div id="s2">
              <SectionQA
                title="When Is Amazon Great Indian Festival 2026, and When Is Flipkart Big Billion Days?"
                paragraph1={
                  <>
                    Amazon India confirmed the Great Indian Festival 2026 start
                    date on its{" "}
                    <a
                      href="https://www.aboutamazon.in/news/retail/amazon-great-indian-festival-2026-dates"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      official announcement page
                    </a>
                    . Flipkart's dates were reported by{" "}
                    <a
                      href="https://www.businesstoday.in/technology/news/story/flipkart-big-billion-days-2026-sale-starts-october-9-early-access-and-offers-revealed-555842-2026-09-16"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      Business Today
                    </a>{" "}
                    on September 16.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={datesColumns} rows={datesRows} />

            <p>
              Amazon also says its seller base has crossed 20 lakh, with more
              than 3 lakh new sellers joining in the past year. More sellers in
              your category means more price pressure from day one. Many
              shoppers search for this event as the Amazon Diwali sale, so
              expect gift and home categories to move first.
            </p>

            {/* s3 — 8 day plan */}
            <div id="s3">
              <SectionQA
                title="What Should Sellers Do in the 8 Days Before October 8?"
                paragraph1="You cannot fix everything in eight days, so work in this order. Each step protects margin before it chases volume."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={planSteps}
              numberColor="#01905B"
              backgroundColor="#F0FDF4"
              borderColor="#A7F3D0"
              variant="number"
            />

            <InfoBanner
              accentColor="#01905B"
              backgroundColor="#E9F8EC"
              title="🧮 Worked Example of a Price Floor"
              content={
                <>
                  <div style={{ marginBottom: 10 }}>
                    Product cost ₹400, marketplace fees ₹110, shipping ₹60, ad
                    cost per order ₹30, minimum profit ₹100. The price floor is{" "}
                    <strong>₹700</strong>.
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>
                    These numbers are illustrative. Use your own fee and
                    shipping data from Seller Central and Seller Hub.
                  </div>
                </>
              }
            />

            {/* s4 — Big Billion Days */}
            <div id="s4">
              <SectionQA
                title="How Does Flipkart Big Billion Days Change Your Plan?"
                paragraph1="Flipkart's early access opens on October 8, the same day Amazon starts. If you sell on both, you face two peak days at once, not one after the other. Buyers compare prices across both sites, so a gap on either one can cost you the sale."
                paragraph2={
                  <>
                    Check your Flipkart stock, prices and returns settings in{" "}
                    <a
                      href="https://seller.flipkart.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      Seller Hub
                    </a>
                    , and your Amazon setup in{" "}
                    <a
                      href="https://sell.amazon.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      Seller Central
                    </a>
                    . For a Flipkart specific view, read our guide to{" "}
                    <Link
                      href="/resources/expert-blog/flipkart-seller-analytics-tool"
                      className={linkCls}
                    >
                      Flipkart seller analytics
                    </Link>{" "}
                    or visit the{" "}
                    <Link
                      href="/solutions/flipkart-sellers"
                      className={linkCls}
                    >
                      Flipkart sellers page
                    </Link>
                    .
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/images/blogs/36-amazon-great-indian-festival-flipkart-big-billion-days-2026/36_blog_image_1.webp"
              altText="Amazon Great Indian Festival and Flipkart Big Billion Days early access both start October 8"
              caption="Both sales converge on October 8. Sellers on Amazon and Flipkart face two peak days at once, not one after the other."
            />

            {/* s5 — Mistakes */}
            <div id="s5">
              <SectionQA
                title="Which Mistakes Cost Sellers the Most Margin in a Festive Sale?"
                paragraph1={
                  <>
                    The first is matching every competitor discount. A price war
                    rarely ends until someone stops following, so decide your
                    floor before it starts. Our{" "}
                    <Link
                      href="/resources/expert-blog/amazon-india-price-war-strategy"
                      className={linkCls}
                    >
                      price war guide
                    </Link>{" "}
                    explains the options.
                  </>
                }
                paragraph2="The second is checking dashboards once a day. A rival can drop a price at night and hold the Buy Box until morning. The third is switching ads off the day the sale ends, when ranking gains are still fresh."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#01905B"
              backgroundColor="#E9F8EC"
              title="⚡ Where Insydz Fits"
              content={
                <>
                  Insydz tracks competitor prices on Amazon and Flipkart in one
                  dashboard and sends{" "}
                  <Link
                    href="/features/whatsapp-alerts-feature"
                    className={linkCls}
                  >
                    WhatsApp alerts
                  </Link>{" "}
                  when a price or Buy Box changes. The{" "}
                  <Link
                    href="/features/festive-trend-feature"
                    className={linkCls}
                  >
                    Festive Trend
                  </Link>{" "}
                  feature shows which categories are rising ahead of the event.
                </>
              }
            />

            <FeatureCTA
              title="Set up your alerts before October 8"
              description="Connect your Amazon and Flipkart listings and get price alerts on WhatsApp. Free to start, no credit card."
              buttonText="Start free on Insydz →"
              buttonHref="/login"
              backgroundColor="#0E281F"
              buttonColor="#01905B"
            />

            {/* s6 — FAQ */}
            <div id="s6">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
              <FAQ faqs={faqs} accentColor="#01905B" />
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
        title="Set Up Your Alerts Before October 8"
        description="Connect your Amazon and Flipkart listings and get price alerts on WhatsApp. Free to start, no credit card."
        primaryButtonText="Start free on Insydz →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#01905B"
        secondaryColor="#047857"
      />
    </div>
  );
}
