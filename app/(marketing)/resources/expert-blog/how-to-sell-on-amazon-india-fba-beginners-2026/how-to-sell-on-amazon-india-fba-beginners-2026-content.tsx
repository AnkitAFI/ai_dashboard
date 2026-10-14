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
import SectionQA from "../components/SectionQA";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import RelatedArticles from "../components/RelatedArticles";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";

export const dynamic = "force-static";

const linkCls = "text-red-600 dark:text-red-400 underline font-semibold";
const greenLinkCls =
  "text-green-700 dark:text-green-400 underline font-semibold";

// ── TOC Items ──────────────────────────────────────────────────────────────────
const tocItems = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What You Need" },
  { id: "s3", label: "7 Steps to Sell" },
  { id: "s4", label: "FBA, Easy Ship or Self Ship" },
  { id: "s5", label: "Beginner Mistakes" },
  { id: "s6", label: "Summary" },
  { id: "s7", label: "Frequently Asked Questions" },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "Registering on Amazon India needs a GST or PAN number and an active bank account. There is no registration fee. You only pay selling fees once orders come in, deducted from your payout.",
  "Selling on Amazon India is a 7-step process: pick a product, register on Seller Central, choose fulfilment, create a listing, price from real costs, send stock, and start ads.",
  "Amazon FBA suits fast moving products and can help you win the Add to Cart box. Easy Ship and Self Ship fit sellers who have storage space or sell low volume.",
  "Price from your total cost, not your listing price. Add product cost, selling fees, shipping or FBA charges and ad spend before you set a price.",
  "The most common beginner mistakes: pricing from listing price instead of total cost, overstocking before a listing has reviews, and checking Seller Central only once a week.",
];

// ── 7 Steps (s3) ───────────────────────────────────────────────────────────────
// NOTE: NumberedCards `description` must be typed React.ReactNode for the links.
const steps = [
  {
    title: "Pick one product with room for profit",
    description: (
      <>
        Look for steady demand, a price you can compete on and reviews that show
        what buyers dislike about current sellers. Our guide to{" "}
        <Link
          href="/resources/expert-blog/amazon-private-label-india-2026"
          className={linkCls}
        >
          private label in India
        </Link>{" "}
        covers how to choose and brand a product.
      </>
    ),
  },
  {
    title: "Register on Seller Central",
    description: (
      <>
        Create your account at{" "}
        <a
          href="https://sell.amazon.in/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          sell.amazon.in
        </a>{" "}
        and add your tax details and bank account. Seller Central is also your
        first Amazon seller dashboard, where you manage orders, listings and
        payments.
      </>
    ),
  },
  {
    title: "Choose how orders will be fulfilled",
    description:
      "Amazon offers FBA, Easy Ship and Self Ship. The table below explains the difference.",
  },
  {
    title: "Create a listing that buyers can find",
    description: (
      <>
        Use a clear title, five useful bullet points and sharp images. Put the
        words buyers search for in the title and bullets. If a listing is live
        but invisible, read why an{" "}
        <Link
          href="/resources/expert-blog/amazon-listing-not-ranking-india"
          className={linkCls}
        >
          Amazon listing is not ranking
        </Link>
        .
      </>
    ),
  },
  {
    title: "Price from your real costs",
    description: (
      <>
        Add product cost, selling fees, shipping or FBA charges and ad spend
        before you set a price. Use a simple sheet or an Amazon seller profit
        calculator. Since March 16, 2026, products priced up to ₹999 in eligible
        categories carry zero referral fee, as explained in our{" "}
        <Link
          href="/resources/expert-blog/amazon-zero-referral-fee"
          className={linkCls}
        >
          zero referral fee guide
        </Link>
        .
      </>
    ),
  },
  {
    title: "Send stock to Amazon if you use FBA",
    description:
      "Create a shipment in your seller account, ship the units, then mark the shipment as shipped. Amazon also offers an inbound pickup service for sellers who prefer not to drop stock off themselves.",
  },
  {
    title: "Start small ads and track results",
    description: (
      <>
        Run a modest Amazon PPC (pay per click advertising) campaign on your
        best keywords and stop the terms that bring no orders. To increase sales
        on Amazon, review keywords, reviews and price every week. Our post on{" "}
        <Link
          href="/resources/expert-blog/find-competitor-keywords-amazon-india"
          className={linkCls}
        >
          finding competitor keywords
        </Link>{" "}
        shows where to start.
      </>
    ),
  },
];

// ── Fulfilment Table (s4) ──────────────────────────────────────────────────────
const fulfilColumns: TableColumn[] = [
  { key: "option", label: "OPTION", cellClassName: "font-semibold" },
  { key: "stores", label: "WHO STORES STOCK" },
  { key: "delivers", label: "WHO DELIVERS" },
  { key: "best", label: "BEST FOR" },
];

const fulfilRows: TableRow[] = [
  {
    option: "FBA",
    stores: "Amazon",
    delivers: "Amazon",
    best: "Fast moving products, Prime badge",
  },
  {
    option: "Easy Ship",
    stores: "You",
    delivers: "Amazon picks up and delivers",
    best: "Sellers with storage space",
  },
  {
    option: "Self Ship",
    stores: "You",
    delivers: "You",
    best: "Low volume or custom items",
  },
];

// ── FAQs (s7) ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "How much does it cost to start selling on Amazon India?",
    a: "Amazon's seller page lists no registration fee. You pay selling fees when orders come in, and Amazon deducts them from your sales payout. Your main starting costs are inventory, packaging and product photography, so plan your first batch around what you can comfortably afford to hold for a few weeks.",
  },
  {
    q: "Do I need a GST number to sell on Amazon?",
    a: "Amazon's seller page asks for a GST or PAN number and an active bank account to register. Whether you must hold a GST registration depends on your product category and your turnover, so confirm the rule for your business with your accountant before you create your first listing.",
  },
  {
    q: "Is Amazon FBA worth it for beginners?",
    a: "Often yes, for fast moving products. Amazon stores, packs and ships orders and handles returns and customer support, and the Prime badge can help you win the Add to Cart box. FBA adds its own fees, so test it with one small batch before you commit more stock.",
  },
  {
    q: "How often do Amazon sellers get paid?",
    a: "Amazon states that payment for your sales, minus seller fees, is deposited into your bank account every 7 days. Cash flow still needs planning, because you pay for stock first and receive sales money later, so keep enough working capital to reorder before you run out.",
  },
  {
    q: "Can I sell on Flipkart as well as Amazon?",
    a: "Yes, and many sellers do once their first marketplace is stable. Start with one platform and learn your costs, fees and ad results, then add Flipkart so you are not managing two learning curves at once. Compare the two marketplaces first, since fees and buyer habits differ.",
  },
];

// ── Related Articles ───────────────────────────────────────────────────────────
const relatedArticlesCards = [
  {
    tag: "Platform Choice",
    title: "Amazon vs Flipkart for Indian Sellers",
    route: "/resources/expert-blog/amazon-vs-flipkart-india-seller",
    image: "/Amazon vs Flipkart India Sellers.png",
  },
  {
    tag: "Pricing Strategy",
    title: "How to Survive an Amazon India Price War",
    route: "/resources/expert-blog/amazon-india-price-war-strategy",
    image: "/BLog_30_banner.png",
  },
  {
    tag: "Review Intelligence",
    title: "Handling Negative Reviews on Amazon India",
    route: "/resources/expert-blog/negative-reviews-amazon-india",
    image: "/How Negative Reviews Are Killing Your Amazon India Sales.png",
  },
];

export default function HowToSellOnAmazonIndiaFBABeginners2026Content() {
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

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#D81D1F,#FB7185);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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
        .toc-link:hover{color:#D81D1F;background:#FEF0F0;border-left-color:#FCA5A5}
        .toc-link.active{color:#D81D1F;background:#FEF0F0;border-left-color:#D81D1F}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(216,29,31,.1);color:#F87171;border-left-color:rgba(216,29,31,.4)}
        .dark .toc-link.active{background:rgba(216,29,31,.15);color:#F87171;border-left-color:#D81D1F}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7{scroll-margin-top:120px}

        /* breadcrumb */
        .breadcrumb{background:#FFF5F5;border-bottom:1px solid #FEE2E2;padding:8px 0}
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
          { label: "How to Sell on Amazon India" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Seller Basics · Amazon FBA"
        title={
          <>
            How to Sell on Amazon (Step by Step Tutorial):{" "}
            <span style={{ color: "#D81D1F" }}>
              Amazon FBA for Beginners 2026
            </span>
          </>
        }
        description={
          <>
            Selling on Amazon India takes a few days to set up and a few months
            to get right. Most beginners lose money in the second part, not the
            first. This tutorial covers both, in the order you will actually do
            them.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="October 12, 2026"
        readTime="7 min read"
        bgColor={{
          light: "#FEF0F0",
          dark: "#1A0A0B",
        }}
        highlightColor="#D81D1F"
      />

      <div style={{ maxWidth: 1240, margin: "24px auto 0", padding: "0 16px" }}>
        {/* Quick Answer Banner */}
        <InfoBanner
          accentColor="#D81D1F"
          backgroundColor="#FEF0F0"
          title="⚡ QUICK ANSWER"
          content="To sell on Amazon India, register on Seller Central with a GST or PAN number and an active bank account, choose a fulfilment method, list your products, price them using your real costs, and send stock if you use Amazon FBA. Beginners usually do best with FBA on a small batch of one product."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={keyTakeaways}
              accentColor="#D81D1F"
              backgroundColor="#1A0A0B"
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
            {/* s2 — What you need */}
            <div id="s2">
              <SectionQA
                title="What Do You Need Before You Start Selling on Amazon?"
                paragraph1={
                  <>
                    Amazon's{" "}
                    <a
                      href="https://sell.amazon.in/sell-online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      seller registration page
                    </a>{" "}
                    asks for a GST or PAN number and an active bank account. It
                    does not list a registration fee. You pay selling fees when
                    you make sales, and Amazon deducts them from your payout.
                  </>
                }
                paragraph2="You also need a product, a way to store it, and enough cash to buy your first batch. Keep that batch small. Your first order teaches you more than any guide can."
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* s3 — 7 steps */}
            <div id="s3">
              <SectionQA
                title="How Do You Sell on Amazon India, Step by Step?"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={steps}
              numberColor="#D81D1F"
              backgroundColor="#FFF8F8"
              borderColor="#FCD5D5"
              variant="number"
            />

            <BlogImageSection
              imageSrc="/images/blogs/37-how-to-sell-on-amazon-india-fba-beginners-2026/37_blog_image_1.webp"
              altText="Seller journey from idea to first sale on Amazon India 2026 with a seller setup checklist"
              caption="The seven steps in this guide, start to finish: registration, one product, fulfilment, a listing, real-cost pricing, stock, and ads."
            />

            <InfoBanner
              accentColor="#D81D1F"
              backgroundColor="#FEF0F0"
              title="🧮 Worked Example of a Unit Profit Check"
              content={
                <>
                  <div style={{ marginBottom: 10 }}>
                    Selling price ₹899, product cost ₹450, shipping and FBA
                    charges ₹110, ad cost per order ₹60, referral fee ₹0 for an
                    eligible category. Profit per unit is <strong>₹279</strong>{" "}
                    before tax.
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>
                    These numbers are illustrative. Check your own fees in
                    Seller Central.
                  </div>
                </>
              }
            />

            {/* s4 — Fulfilment */}
            <div id="s4">
              <SectionQA
                title="Should Beginners Use Amazon FBA, Easy Ship or Self Ship?"
                paragraph1={
                  <>
                    Amazon FBA (Fulfilment by Amazon) means Amazon stores your
                    products, packs and ships orders, and handles returns and
                    customer support, as described on its{" "}
                    <a
                      href="https://sell.amazon.in/shipping-and-fulfillment/fulfillment-by-amazon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      FBA page
                    </a>
                    . Amazon says FBA can improve your chance of winning the Add
                    to Cart box. For beginners, that removes most daily work.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={fulfilColumns} rows={fulfilRows} />

            <p>
              FBA charges include storage, pick and pack, and weight handling
              fees, and Amazon deducts them from your proceeds. Stock kept for a
              long time can attract extra storage charges. Send only what you
              expect to sell.
            </p>

            {/* s5 — Mistakes */}
            <div id="s5">
              <SectionQA
                title="What Mistakes Do New Amazon Sellers Make?"
                paragraph1="The first is pricing from the listing price, not from total cost. Many beginners find out at payout that fees and ads took most of the margin. The second is buying too much stock before the listing has any reviews."
                paragraph2={
                  <>
                    The third is checking Seller Central once a week.
                    Competitors change prices and reviews change rankings faster
                    than that. Our{" "}
                    <Link
                      href="/resources/expert-blog/top-amazon-india-sellers-habits"
                      className={linkCls}
                    >
                      habits of top sellers
                    </Link>{" "}
                    post shows how experienced sellers monitor daily.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="⚡ Where Insydz Fits"
              content={
                <>
                  Insydz tracks competitor prices, keywords and reviews on
                  Amazon and Flipkart in one place, and sends{" "}
                  <Link
                    href="/features/whatsapp-alerts-feature"
                    className={greenLinkCls}
                  >
                    WhatsApp alerts
                  </Link>{" "}
                  when something changes. See our comparison of the{" "}
                  <Link
                    href="/resources/expert-blog/best-amazon-seller-tools-india-2026"
                    className={greenLinkCls}
                  >
                    best Amazon seller tools in India
                  </Link>
                  , or try the{" "}
                  <Link
                    href="/free-tools/free-amazon-product-analyzer"
                    className={greenLinkCls}
                  >
                    free Amazon product analyzer
                  </Link>
                  .
                </>
              }
            />

            {/* s6 — Summary */}
            <div id="s6">
              <SectionQA
                title="Summary: How to Sell on Amazon India"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <p>
              FBA charges include storage, pick and pack, and weight handling
              Selling on Amazon India breaks into two phases: a short setup
              phase and a longer discipline phase. Setup is seven steps:
              register with a GST or PAN number, pick one product, choose a
              fulfilment method, create a findable listing, price from your real
              costs, send stock to FBA if you use it, and start small ads. The
              discipline phase is where beginners actually lose money: pricing
              from the listing price instead of total cost, overstocking before
              reviews arrive, and checking Seller Central only once a week. Get
              the setup right and stay disciplined on cost and monitoring, and
              the rest compounds.
            </p>

            <FeatureCTA
              title="Check a product before you stock it"
              description="Connect your Amazon listings and see competitor prices, reviews and keywords in one dashboard. Free to start, no credit card."
              buttonText="Start Free on Insydz →"
              buttonHref="/login"
              backgroundColor="#1A0A0B"
              buttonColor="#D81D1F"
            />

            {/* s7 — FAQ */}
            <div id="s7">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
              <FAQ faqs={faqs} accentColor="#D81D1F" />
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
        title="Check a Product Before You Stock It"
        description="Connect your Amazon listings and see competitor prices, reviews and keywords in one dashboard. Free to start, no credit card."
        primaryButtonText="Start Free on Insydz →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#D81D1F"
        secondaryColor="#B91C1C"
      />
    </div>
  );
}
