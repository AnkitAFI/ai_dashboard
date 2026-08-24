"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import HeroSection from "../components/HeroSection";
import HeroStats from "../components/HeroStats";
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
import RelatedReadingBox from "../components/Relatedreadingbox";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaRakshaBandhan2026 = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: { "@type": "ImageObject", url: "https://insydz.com/logo.png" },
      description:
        "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers.",
    },
    {
      "@type": "Article",
      "@id": "https://insydz.com/resources/expert-blog/raksha-bandhan-2026-seller-guide#article",
      headline:
        "What Amazon & Flipkart Sellers Should Stock Before Rakhi",
      author: {
        "@type": "Organization",
        name: "Insydz",
        url: "https://insydz.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Insydz",
        url: "https://insydz.com",
      },
      datePublished: "2026-08-21",
      dateModified: "2026-08-21",
      inLanguage: "en-IN",
    },
  ],
};

// ── Key takeaways (s1) ────────────────────────────────────────────────────────
const rakshaBandhanKeyTakeaways = [
  "Raksha Bandhan 2026 falls on Friday, 28 August. The peak gifting search and order window on Amazon India and Flipkart runs 5 to 7 days before the festival — meaning the highest-traffic days are August 21 to 27. If you are reading this today, you are in the window.",
  "The categories that spike most sharply in the week before Raksha Bandhan are dry fruits and mithai gift sets, fashion accessories and jewellery, personal care and grooming kits, and electronics accessories. Gift box packaging and Rakhi combo bundles convert significantly better than standalone products during this window.",
  "FBA inbound processing takes 7 to 10 business days. If your FBA stock is not already at the fulfilment centre, switch priority SKUs to FBM with a committed delivery date before August 28 for this window.",
  "The demand window for Raksha Bandhan is short and sharp — typically 5 to 7 days — compared to the 8-day Freedom Festival or 2-day Prime Day. This means sellers who spot which products are trending 7 days before the festival have a meaningful advantage over those who react on the day itself.",
  "Flipkart typically sees strong Rakhi demand in fashion accessories, beauty, and regional sweet gift sets. For dual-platform sellers, preparation should cover both simultaneously — the demand window is the same across both platforms.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const rakshaBandhanTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What Is the Rakhi Demand Spike?" },
  { id: "s3", label: "Top Categories to Stock" },
  { id: "s4", label: "How to Find Trending Products" },
  { id: "s5", label: "Tracking vs Non-Tracking Gap" },
  { id: "s6", label: "Common Stocking Mistakes" },
  { id: "s7", label: "1-Hour Stock Checklist" },
  { id: "s8", label: "Using Insydz for Festive Signals" },
  { id: "s9", label: "FAQs" },
];

// ── Top categories (s3) ───────────────────────────────────────────────────────
const topCategories = [
  {
    title: "Dry fruits and mithai gift sets",
    description:
      "The strongest consistent category, particularly branded or premium-packaged dry fruit boxes. Gift box format at ₹299 to ₹799 price points converts best. Sellers who add a Rakhi gift tag or seasonal packaging see meaningful conversion lift over plain packaging.",
  },
  {
    title: "Fashion accessories and jewellery",
    description:
      "Bracelets, watches, wallets, and ethnic jewellery sets. Flipkart is particularly strong in this category. Gift wrapping availability is a significant conversion signal for buyers in this window.",
  },
  {
    title: "Personal care and grooming kits",
    description:
      "Grooming combo kits for brothers, skincare sets. Kits assembled from individual products and listed as a bundle typically outperform standalone products during Rakhi because they present as a complete gift.",
  },
  {
    title: "Electronics accessories",
    description:
      "Earphones, phone stands, portable chargers. Sub-₹500 items that are clearly usable gifts rather than utility purchases. Rakhi-specific listing copy ('a thoughtful gift for every brother') improves CTR in this category.",
  },
  {
    title: "Home decor and pooja items",
    description:
      "Rakhi thali sets, decorative items, festive home products. Volume is lower than the above categories but competition is also lower — a well-listed product in this niche can rank and convert well in the 5-day window.",
  },
];

// ── Table: Tracking vs non-tracking gap (s5) ──────────────────────────────────
const gapTableColumns: TableColumn[] = [
  {
    key: "action",
    label: "ACTION",
    headerClassName: "bg-[#0C1A27] text-white",
  },
  {
    key: "tracking",
    label: "TREND-TRACKING SELLER",
    headerClassName: "bg-[#0C1A27] text-white",
  },
  {
    key: "nonTracking",
    label: "NON-TRACKING SELLER",
    headerClassName: "bg-[#0C1A27] text-white",
  },
  {
    key: "gap",
    label: "OUTCOME GAP",
    headerClassName: "bg-[#0C1A27] text-white",
  },
];

const gapTableRows: TableRow[] = [
  {
    rowClassName: "bg-[#EFF6FF]",
    action: {
      value: "Listing title update",
      className:
        "font-semibold text-[#2563EB] border-l-4 border-[#2563EB] pl-3",
    },
    tracking: "Updated Aug 21–22 with spiking Rakhi keywords",
    nonTracking: "Same title as rest of year",
    gap: {
      type: "chip",
      label: "Misses peak indexed window",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    action: "Bundle creation",
    tracking: "Rakhi combo bundle live before Aug 24",
    nonTracking: "Standalone product, no bundle",
    gap: {
      type: "chip",
      label: "Lower conversion vs bundle",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    rowClassName: "bg-[#EFF6FF]",
    action: {
      value: "PPC activation",
      className:
        "font-semibold text-[#2563EB] border-l-4 border-[#2563EB] pl-3",
    },
    tracking: "Campaign on Rakhi keywords live Aug 21",
    nonTracking: "Same always-on campaign",
    gap: {
      type: "chip",
      label: "Misses highest-intent searches",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    action: "Competitor monitoring",
    tracking: "WhatsApp alert if price cut during window",
    nonTracking: "Manual check — 12+ hrs lag",
    gap: {
      type: "chip",
      label: "Buy Box lost during demand spike",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    rowClassName: "bg-[#EFF6FF]",
    action: {
      value: "Post-festival strategy",
      className:
        "font-semibold text-[#2563EB] border-l-4 border-[#2563EB] pl-3",
    },
    tracking: "PPC sustain Aug 29–Sep 4 to lock rank",
    nonTracking: "Returns to normal Aug 29",
    gap: {
      type: "chip",
      label: "Rank gains temporary not permanent",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
];

// ── 1-hour stock checklist (s7) ───────────────────────────────────────────────
const stockChecklistSteps = [
  {
    title: "Check trending Rakhi keywords in your category today",
    description:
      "Open Insydz's festive trend checker and identify the top 3 spiking keywords in your category this week. These are the phrases to add to your listing title and activate in PPC campaigns. If you do not have a trend checker, check Amazon India's Movers and Shakers in your category and note the products rising fastest — their titles give you the keyword signals.",
  },
  {
    title: "Identify your top 3 to 5 gift-ready SKUs and update their titles",
    description:
      "Look at your catalogue for products that work as gifts — items under ₹500 that can be gift-wrapped or bundled. Update each priority SKU's title today with the top trending Rakhi keyword near the front. The title update takes 24 to 48 hours to index — a title updated today ranks on the keyword by August 23, in time for peak traffic August 24 to 27.",
  },
  {
    title: "Check FBA stock levels — switch low-stock SKUs to FBM immediately",
    description:
      "For each priority SKU, check your current FBA stock against your expected Rakhi demand. Any SKU with less than 5 days of festival-velocity stock should be switched to FBM with a committed delivery date before August 28. Do not wait to see if FBA inventory arrives in time — switch now and cancel the switch if the FBA shipment processes early.",
  },
  {
    title: "Enable gift wrapping and create one simple combo bundle",
    description:
      "Enable Amazon India's gift wrapping option on your priority SKUs — it costs nothing to enable and improves conversion for gifting-intent searches. Then create one simple bundle ASIN: two complementary items plus a gift box listed as 'Rakhi Special Combo.' A bundle ASIN sits outside direct price comparison and captures buyers shopping on gifting value, not just price.",
  },
  {
    title: "Set up competitor price monitoring for the demand window",
    description:
      "Add your top 3 competitors per priority category to Insydz and configure WhatsApp alerts for price changes. The Rakhi demand window attracts aggressive repricing — a competitor who drops their price on August 24 during peak traffic and wins Buy Box for 12 hours can cause a significant revenue loss. Real-time alerts mean you respond within the hour, not the next morning.",
  },
];

// ── Discover / feature cards (s8) ─────────────────────────────────────────────
const rakshaBandhanDiscoverCards: InsightCard[] = [
  {
    title: "Festive keyword trend checker",
    description:
      "Insydz surfaces which specific keywords are spiking in your category this week — at the subcategory level, not generic national trends. Update your listing title with the right phrase before competitors do and capture relevance signals during the indexing window.",
    chips: [{ label: "Trend Tracking", bg: "#EFF6FF", color: "#2563EB" }],
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
  },
  {
    title: "Real-time competitor price alerts",
    description:
      "WhatsApp alerts fire within minutes when a competitor reprices during the demand window — with their new price, your Buy Box impact, and their listing quality context. Make the hold vs match call in the same hour, not the next morning after the traffic has already peaked.",
    chips: [
      { label: "Competitor Intelligence", bg: "#F0FDF4", color: "#16A34A" },
    ],
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
  },
  {
    title: "Review trend monitoring",
    description: (
      <>
        Check the{" "}
        <Link
          href="/resources/expert-blog/amazon-review-analysis-guide-india"
          className="text-[#2563EB] underline hover:text-[#1d4ed8]"
        >
          review intelligence tool
        </Link>{" "}
        to see which quality complaints are appearing in your category&apos;s
        listings right now — complaints that are appearing more in competitor
        reviews are differentiation opportunities to address in your listing
        copy before the demand window peaks.
      </>
    ),
    chips: [{ label: "Review Intelligence", bg: "#FFFBEB", color: "#D97706" }],
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
  },
  {
    title: "Post-festival rank tracking",
    description: (
      <>
        After August 28, track your keyword rank positions daily. The{" "}
        <Link
          href="/resources/expert-blog/top-amazon-india-sellers-habits"
          className="text-[#2563EB] underline hover:text-[#1d4ed8]"
        >
          habit of top Amazon India sellers
        </Link>{" "}
        is to sustain 50 to 60% of festival velocity for 7 days after the event
        — a targeted PPC spend that locks in rank gains before Big Billion Days
        season begins in October.
      </>
    ),
    chips: [{ label: "Rank Tracking", bg: "#F5F3FF", color: "#7C3AED" }],
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const rakshaBandhanFaqs = [
  {
    q: "When is Raksha Bandhan 2026?",
    a: "Raksha Bandhan 2026 falls on Friday, 28 August. On Amazon India and Flipkart, the peak gifting search and order window runs 5 to 7 days before the festival — meaning the highest-traffic days for Rakhi-related searches are August 21 to 27. If you are reading this on or before August 22, you are still within the listing-update window before peak traffic.",
  },
  {
    q: "Which categories sell best during Raksha Bandhan on Amazon India and Flipkart?",
    a: "The top-performing categories during Raksha Bandhan are dry fruits and mithai gift sets, fashion accessories and jewellery, personal care and grooming kits, electronics accessories, and home decor. Rakhi-themed packaging and gift box formats significantly improve conversion across all of these categories during the festival window compared to standard packaging.",
  },
  {
    q: "How early should I stock Rakhi inventory on Amazon FBA?",
    a: "FBA inbound processing takes 7 to 10 business days. For Raksha Bandhan on August 28, inventory should have been dispatched to FBA by August 14 at the latest. If you missed that window, switch priority SKUs to FBM with a committed delivery date before August 28 immediately — do not wait to see if the FBA shipment arrives in time.",
  },
  {
    q: "Is Raksha Bandhan a good sales event for Flipkart sellers?",
    a: "Yes — Flipkart typically sees strong Rakhi demand in fashion accessories, beauty, and regional sweet gift sets. Flipkart's buyer base skews toward Tier 2 and Tier 3 cities where Raksha Bandhan gifting conventions are strong. Sellers on both platforms should prepare simultaneously since the demand window and peak traffic dates are the same.",
  },
  {
    q: "How do I find trending Rakhi products on Amazon India right now?",
    a: "Check Amazon India's Movers and Shakers in your category daily in the week before Raksha Bandhan. Items moving up the list rapidly are capturing search demand before most competitors notice. Insydz's festive trend feature surfaces which keywords are spiking in your specific category this week — so you can update your listing and activate PPC on the right terms before the peak, not during it.",
  },
  {
    q: "What should I do after Raksha Bandhan to protect my rank?",
    a: "Maintain 50 to 60% of festival sales velocity for 7 days after August 28 via targeted PPC. Amazon's algorithm uses a rolling velocity window — if sales drop back to normal on August 29 immediately, the rank gains from the festival are temporary. A modest post-festival PPC spend at your new, improved rank position locks in gains before Big Billion Days preparation season begins in September.",
  },
];

const rakshaBandhanRelatedCards = [
  {
    tag: "Freedom Festival",
    title: "Amazon Great Freedom Festival 2026: Complete Seller Prep Checklist",
    route: "/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide",
    image: "/Blog_32_banner.png",
  },
  {
    tag: "Margin Protection",
    title: "Protect Your Amazon India Margins During a Major Festive Sale",
    route: "/resources/expert-blog/prime-day-india-2026-seller-questions",
    image: "/prime-day-india-2026-seller-questions.png",
  },
  {
    tag: "Buy Box",
    title:
      "Amazon Buy Box Win Rate: How to Measure It and Why It Keeps Dropping",
    route: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
    image: "/Detect Competitor Price Undercutting on Amazon India.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function RakshaBandhan2026SellerGuideContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const id = "insydz-raksha-bandhan-2026-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaRakshaBandhan2026);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = rakshaBandhanTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(rakshaBandhanTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(rakshaBandhanTOC[i].id);
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
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Raksha Bandhan 2026 Seller Guide" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Festive Trends · Raksha Bandhan 2026 · Amazon India + Flipkart"
        title="What Amazon & Flipkart Sellers Should Stock Before Rakhi"
        description={
          <>
            Raksha Bandhan falls on 28 August 2026. The peak gifting window on
            Amazon India and Flipkart is August 21 to 27 — the 7 days before the
            festival. Sellers who spot which categories are trending, update
            their listings with the right Rakhi keywords, and stock gift-ready
            SKUs before competitors do will capture the full demand window.
            Those who prepare on August 25 will capture only the tail end.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="21 August 2026"
        readTime="9 min read"
        bgColor={{ light: "#EFF6FF", dark: "#0a1628" }}
        highlightColor="#2563EB"
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Hero stats */}
        <HeroStats
          resolvedTheme={resolvedTheme}
          accentColor="#16A34A"
          stats={[
            {
              value: "Aug 28",
              label:
                "Raksha Bandhan 2026 — peak gifting search window runs August 21 to 27",
            },
            {
              value: "5–7 days",
              label:
                "Short, sharp demand spike before Rakhi — act this week, not on the day itself",
            },
            {
              value: "5 categories",
              label:
                "Gifting, sweets, fashion, grooming, and electronics see the sharpest Rakhi spikes",
            },
            {
              value: "24–48 hrs",
              label:
                "Time for a listing title update to index on Amazon India — update now to rank before peak traffic",
            },
          ]}
        />

        {/* Hero image */}
        <BlogImageSection
          imageSrc="/Blog_34_banner.png"
          altText="Raksha Bandhan 2026 Seller Guide"
          caption="Insydz festive trend monitor on August 21, 2026 — 7 days before Raksha Bandhan. 'Rakhi gift for brother' is spiking 340% week on week. Sellers who add this phrase to their listing title today will be indexed for it before peak traffic August 24–27. The window for a first-mover relevance advantage closes by August 23."
        />

        <InfoBanner
          accentColor="#2563EB"
          backgroundColor="#EFF6FF"
          title="QUICK ANSWER"
          content="Raksha Bandhan 2026 falls on 28 August. The peak gifting search and order window on Amazon India and Flipkart runs August 21 to 27. The categories that spike most sharply are dry fruit gift sets, fashion accessories, grooming kits, and electronics accessories. If your FBA stock is not already at the fulfilment centre, switch priority SKUs to FBM with a committed delivery date before August 28. Update your listing titles with trending Rakhi keywords today — title changes take 24 to 48 hours to index and need to be live before August 23 to capture the full demand window."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={rakshaBandhanKeyTakeaways}
              accentColor="#2563EB"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={rakshaBandhanTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={rakshaBandhanTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="What Is the Raksha Bandhan Demand Spike on Amazon India and Flipkart?"
                paragraph1="Raksha Bandhan is one of India's most widely observed gifting festivals — celebrated across Tier 1, Tier 2, and Tier 3 cities with broadly similar gifting conventions. Unlike Diwali, where the gifting categories are diffuse and the lead time is long, Raksha Bandhan concentrates demand sharply into a narrow window: typically 5 to 7 days before the festival date, peaking 2 to 3 days before August 28."
                paragraph2="For Amazon India and Flipkart sellers, this creates a specific commercial pattern. Search volume for Rakhi gift-related terms rises steeply in the week before the festival, order velocity accelerates from approximately August 21, and the window closes sharply on August 27 as buyers shift to expecting same-day or next-day delivery. Sellers who are stocked, listed, and visible before August 21 capture the full window. Sellers who stock on August 24 or 25 capture only the tail end."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#2563EB"
              backgroundColor="#EFF6FF"
              title="Raksha Bandhan 2026 — Key Dates for Indian Sellers"
              content="August 21 (today): search demand begins rising — this is the window to update listings and activate PPC campaigns. August 21–24: peak search and add-to-cart window — buyers researching and buying in advance for delivery before the 28th. August 25–27: last-mile order window — buyers expecting guaranteed delivery before the festival. August 28: Raksha Bandhan — gifting day, minimal new orders, post-festival review velocity begins. August 29–September 4: post-festival rank lock-in window — sustain velocity to retain keyword rank gains."
            />

            <div id="s3">
              <SectionQA
                title="Which Categories See the Biggest Rakhi Sales Spike on Amazon India and Flipkart?"
                paragraph1="Not all categories benefit equally from Raksha Bandhan demand. The sharpest spikes are concentrated in categories that align with traditional Rakhi gifting conventions — items a sister might give a brother, or items families gift together — and in categories where gift packaging and bundle formats are easy to execute."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={topCategories}
              numberColor="#2563EB"
              backgroundColor="#F8FAFC"
              borderColor="#BFDBFE"
            />

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="Quick Wins Available This Week (Aug 21–24)"
              content={
                <>
                  Add &apos;Rakhi gift&apos; or &apos;Raksha Bandhan gift for brother&apos; to your listing title — this seasonal keyword is spiking now and a title update takes effect within 24 to 48 hours on Amazon India. Enable gift wrapping on your top SKUs — Amazon India&apos;s gift wrapping option costs ₹0 extra to enable and materially improves conversion for gifting-intent searches. Create a simple bundle — combine two or three complementary items into a bundle ASIN, listed as &apos;Rakhi Special Combo,&apos; so it sits outside direct price comparison. Check your review score — a listing entering peak traffic with unresolved complaint clusters will generate a disproportionate number of negative reviews during the demand window (see our <Link href="/resources/expert-blog/amazon-review-analysis-guide-india" className="text-[#16A34A] underline hover:text-[#15803d]">review analysis guide</Link>).
                </>
              }
            />

            <div id="s4">
              <SectionQA
                title="How Do You Know Which Rakhi Products Are Trending Right Now on Amazon India?"
                paragraph1="The challenge with a short, sharp demand window like Raksha Bandhan is that by the time a trend is obvious — a product is on the Amazon Best Sellers list, competitors have restocked, and the category is crowded — the window for a meaningful first-mover advantage has often closed. The sellers who benefit most from Rakhi demand are the ones who spot which specific products and keywords are beginning to spike 5 to 7 days before the festival, not the ones who react when the spike is already at its peak."
                paragraph2={
                  <>
                    There are two practical ways to find what is trending in your category right now. The first is manual: check Amazon India&apos;s Movers and Shakers in your category daily in the week before the festival. Items moving up the list rapidly are capturing search demand before most competitors notice. The second is automated: Insydz&apos;s <Link href="/features/festive-trend-checker" className="text-[#2563EB] underline hover:text-[#1d4ed8]">festive trend feature</Link> surfaces which keywords are spiking in your specific category this week — so you can update your listing copy and activate PPC campaigns on the right keywords before the peak, not during it.
                  </>
                }
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/Blog_34_image1.png"
              altText="Festive Trend Monitor — Insydz"
              caption="Insydz festive trend checker on August 21 — 7 days before Raksha Bandhan 2026. 'Rakhi gift for brother' is up 340% week on week. Sellers who add this phrase to their title today will be indexed for it before the peak demand window opens on August 24. Those who wait until August 25 will be competing on the keyword at peak competition with a listing that has not yet accumulated relevance signals."
            />

            <div id="s5">
              <SectionQA
                title="How Wide Is the Gap Between Sellers Who Track Festive Trends and Those Who Don't?"
                paragraph1="The gap shows up in conversion rate during the demand window. A seller whose listing uses the keywords buyers are actually searching right now — phrases that spiked in the 7 days before the festival — converts at a meaningfully higher rate than a seller running the same listing they use outside festive season. The product may be identical. The price may be similar. The difference is whether the listing matches the search intent of a buyer shopping with a gifting occasion in mind."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={gapTableColumns} rows={gapTableRows} />

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="Stock Now Action — What to Do Today if You Have Not Started"
              content={
                <>
                  If today is August 21 and you have not started Raksha Bandhan preparation: prioritise listing title updates and PPC activation today (applying our <Link href="/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide" className="text-[#D97706] underline hover:text-[#b45309]">festive event preparation guide</Link>), check FBA stock levels and switch low-stock priority SKUs to FBM with guaranteed delivery before August 28, and enable gift wrapping on your top 3 to 5 SKUs immediately. These three actions together take under 2 hours and cover the most significant conversion gaps.
                </>
              }
            />

            <FeatureCTA
              title="See which Rakhi keywords are spiking in your category right now — before your competitors act on them"
              description="Insydz's festive trend checker surfaces trending keywords in your category this week. Free to start, no credit card required."
              buttonText="Check Rakhi Trends Free on Insydz →"
              buttonHref="/login"
              backgroundColor="#0C1A27"
              buttonColor="#2563EB"
            />

            <div id="s6">
              <SectionQA
                title="What Are the Most Common Raksha Bandhan Stocking Mistakes Indian Sellers Make?"
                paragraph1="Most Rakhi stocking mistakes are versions of the same problem: reacting to the festival demand window rather than anticipating it. Because the window is short — 5 to 7 days — every day of late preparation costs a measurable share of the opportunity."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#DC2626"
              backgroundColor="#FEF2F2"
              title="Five Rakhi Stocking Mistakes to Avoid"
              content={
                <>
                  Dispatching FBA inventory after August 14 — inbound processing takes 7 to 10 business days, and inventory dispatched on August 17 or later carries real risk of not being receivable before August 28. Not updating listing titles and bullets for Rakhi search terms — the seasonal keyword update takes 24 to 48 hours to index, and every day without it is a missed impression. Pricing without a floor during the demand spike — festive windows attract aggressive repricing, so setting a price floor (as detailed in our <Link href="/resources/expert-blog/amazon-india-price-war-strategy" className="text-[#DC2626] underline hover:text-[#b91c1c]">price war strategy guide</Link>) is essential. Treating standalone products and gift bundles identically — a bundle sits outside direct price comparison and converts at a higher rate for gifting-intent buyers. Not monitoring competitor prices during the 5-day window — a competitor who wins Buy Box during peak traffic can cause a significant sales loss before you notice without real-time <Link href="/resources/expert-blog/amazon-buy-box-win-rate" className="text-[#DC2626] underline hover:text-[#b91c1c]">Buy Box win rate monitoring</Link>.
                </>
              }
            />

            <BlogImageSection
              imageSrc="/Blog_34_image2.png"
              altText="Post-Festival Rank Strategy — Aug 28–29"
              caption="Insydz post-festival rank tracker for a dry fruits and grooming kit seller after Raksha Bandhan 2025. The festival demand spike moved keyword rank on primary terms from #18 to #7 and #24 to #11. By maintaining 55% of event sales velocity for 7 days via targeted PPC, the seller locked in those positions before the Big Billion Days preparation season began in September — compounding the Rakhi investment into Q4 positioning."
            />

            <div id="s7">
              <SectionQA
                title="How Do You Build a Simple Raksha Bandhan Stock Checklist in One Hour?"
                paragraph1="The most effective preparation for a short demand window is not the most complex — it is the most targeted. Five steps, one hour, done before August 22 covers the actions that actually move conversion during the Rakhi window."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={stockChecklistSteps}
              numberColor="#2563EB"
              backgroundColor="#F8FAFC"
              borderColor="#BFDBFE"
            />

            <div id="s8">
              <SectionQA
                title="How Do You Use Insydz to Catch Festive Demand Signals Before Competitors?"
                paragraph1="The practical advantage of a festive trend tool is not just knowing what is trending — it is knowing what is trending in your specific category, at the keyword level, early enough to act. Generic trend data (like national search trend tools) tells you that 'Rakhi gifts' searches are rising. Category-specific trend data tells you that 'dry fruits gift box under 400 rupees' is the specific phrase spiking in your subcategory right now — which is the phrase to put in your title, not a generic seasonal term."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InsightCards cards={rakshaBandhanDiscoverCards} columns={2} />

            <div id="s9">
              <SectionQA
                title="Frequently Asked Questions: Raksha Bandhan 2026 for Amazon India and Flipkart Sellers"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#2563EB" faqs={rakshaBandhanFaqs} />

            <RelatedReadingBox
              label="📌 Related Reading on Insydz"
              accentColor="#2563EB"
              darkAccentColor="#60A5FA"
              backgroundColor="#EFF6FF"
              darkBackgroundColor="#0a1628"
              resolvedTheme={resolvedTheme}
              links={[
                {
                  text: "Amazon Great Freedom Festival 2026: The Indian Seller's Complete Preparation Checklist",
                  href: "/resources/expert-blog/amazon-great-freedom-festival-2026-seller-guide",
                },
                {
                  text: "How to Protect Your Amazon India Profit Margins During a Major Festive Sale",
                  href: "/resources/expert-blog/prime-day-india-2026-seller-questions",
                },
                {
                  text: "Stuck in an Amazon India Price War? Compete Without Racing to the Bottom",
                  href: "/resources/expert-blog/amazon-india-price-war-strategy",
                },
                {
                  text: "Amazon Buy Box Win Rate: How to Measure It and Why It Keeps Dropping",
                  href: "/resources/expert-blog/amazon-buy-box-win-rate",
                },
                {
                  text: "AI Review Intelligence Tool: Fix Listing Weaknesses Before Peak Traffic Hits",
                  href: "/resources/expert-blog/amazon-review-analysis-guide-india",
                },
              ]}
            />

            {/* More Festive Sale and Trend Intelligence */}
            <RelatedArticles
              title="More Festive Sale and Trend Intelligence"
              cards={rakshaBandhanRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Raksha Bandhan Is on 28 August. Your Competitors Are Tracking Trends Right Now."
        description="Insydz surfaces which Rakhi keywords are spiking in your category, tracks competitor pricing in real time, and alerts you via WhatsApp before the demand window closes. Free to start."
        primaryButtonText="Check Festive Trends on Insydz Free →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#2563EB"
        secondaryColor="#60A5FA"
        stats={[
          {
            value: "Aug 28",
            label:
              "Raksha Bandhan 2026 — peak Rakhi demand window August 21–27",
          },
          {
            value: "5–7 days",
            label: "Peak gifting search window before Raksha Bandhan each year",
          },
          {
            value: "5,000+",
            label: "Indian sellers using Insydz for festive trend tracking",
          },
          {
            value: "Free",
            label:
              "To start — festive trend checker, price monitoring, WhatsApp alerts",
          },
        ]}
      />
    </div>
  );
}
