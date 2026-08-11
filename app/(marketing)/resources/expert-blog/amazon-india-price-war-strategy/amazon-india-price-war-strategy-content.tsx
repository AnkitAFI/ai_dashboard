"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import HeroStats from "../components/HeroStats";
import RelatedReadingBox from "../components/Relatedreadingbox";

export const dynamic = "force-static";

import Link from "next/link";

// ── Inline link helper (used only where a hyperlink sits inside body copy) ────
const InLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={to}
      style={{
        color: "#F97316",
        textDecoration: "underline",
        textDecorationColor: "rgba(249, 115, 22, 0.3)",
        textUnderlineOffset: "3px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </Link>
  );
};

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaAmazonIndiaPriceWarStrategy = {
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
      "@id": "https://insydz.com/blog/amazon-india-price-war-strategy#article",
      headline:
        "Stuck in an Amazon India Price War? How to Compete Without Racing to the Bottom",
      author: {
        "@type": "Organization",
        name: "Insydz",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-08-06",
      dateModified: "2026-08-06",
      inLanguage: "en-IN",
    },
  ],
};

// ── Key takeaways (s1) ────────────────────────────────────────────────────────
const priceWarKeyTakeaways = [
  "Matching every competitor price drop is the instinctive response to an Amazon India price war — and usually the wrong one. It accelerates margin erosion without guaranteeing Buy Box recovery.",
  "Three strategies let you compete without racing to the bottom: listing differentiation, bundling, and owning the mid-range. Each fits a different product situation and review profile.",
  "A price war does not end faster because you match every cut. It ends when someone stops matching. The sellers who choose when to stop — rather than discovering it when they run out of margin — come out ahead.",
  "Real-time competitor price tracking tells you whether a competitor's drop is a sustained move or a temporary test — that distinction determines whether matching is necessary or whether holding is the smarter call.",
  "Sellers who held their floor during a price war and used the time to improve listing quality typically recovered rank faster once the category restabilised than those who matched every cut.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const priceWarTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What Is a Price War?" },
  { id: "s3", label: "Why Matching Is Wrong" },
  { id: "s4", label: "Strategy 1: Differentiate" },
  { id: "s5", label: "Strategy 2: Bundle" },
  { id: "s6", label: "Strategy 3: Own the Mid-Range" },
  { id: "s7", label: "Hold vs Match Decision" },
  { id: "s8", label: "Real-Time Intelligence" },
  { id: "s9", label: "FAQs" },
];

// ── Margin collapse table (s3) ────────────────────────────────────────────────
const marginTableColumns: TableColumn[] = [
  {
    key: "yourPrice",
    label: "YOUR PRICE",
    headerClassName: "bg-[#0D1B2A] text-white",
  },
  {
    key: "competitorPrice",
    label: "COMPETITOR PRICE",
    headerClassName: "bg-[#0D1B2A] text-white",
  },
  {
    key: "margin",
    label: "MARGIN PER UNIT",
    headerClassName: "bg-[#0D1B2A] text-white",
  },
  {
    key: "change",
    label: "MARGIN CHANGE",
    headerClassName: "bg-[#0D1B2A] text-white",
  },
];

const marginTableRows: TableRow[] = [
  {
    rowClassName: "bg-[#FFF7ED]",
    yourPrice: {
      value: "₹799 (start)",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    competitorPrice: "₹849",
    margin: { value: "₹120 (15%)", className: "text-[#16A34A] font-semibold" },
    change: "Baseline",
  },
  {
    yourPrice: "₹699 (matched)",
    competitorPrice: "₹699",
    margin: { value: "₹20 (2.5%)", className: "text-[#D97706] font-semibold" },
    change: {
      type: "chip",
      label: "-83%",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
  {
    rowClassName: "bg-[#FFF7ED]",
    yourPrice: {
      value: "₹649 (matched again)",
      className:
        "font-semibold text-[#F97316] border-l-4 border-[#F97316] pl-3",
    },
    competitorPrice: "₹649",
    margin: { value: "-₹30 (loss)", className: "text-[#DC2626] font-semibold" },
    change: {
      type: "chip",
      label: "Below floor",
      className: "bg-[#FEE2E2] text-[#B91C1C]",
    },
  },
];

// ── Strategy 1 differentiation steps (s4) ─────────────────────────────────────
const differentiationSteps = [
  {
    title: "Read your competitor's 1-star and 2-star reviews",
    description:
      "Every complaint a buyer leaves on a competitor's listing is a reason to choose you — if your listing addresses it directly. A competitor's reviews full of complaints about poor packaging or fast wear become your opportunity to lead with durability and protective packaging in your own listing copy.",
  },
  {
    title: "Put your review advantage in your listing, not just your rating",
    description:
      "If you have 200 reviews at 4.4 stars and your competitor has 40 at 3.8, buyers can see that — but your listing should also make the quality gap tangible. A-plus content that shows specific use cases, addresses common objections, and demonstrates product quality converts at a higher rate than a listing that competes on specifications alone.",
  },
  {
    title: "Check whether your images are doing competitive work",
    description:
      "Category-leading images show the product being used, not just the product on a white background. A buyer comparing two identical-spec tiffin boxes at different prices will choose the one whose images show the product being opened, packed, and carried — because it reduces purchase uncertainty in a way that a spec list cannot.",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const priceWarFaqs = [
  {
    q: "How do I know if I am in a price war on Amazon India?",
    a: "The clearest signal is a pattern of competitors matching or undercutting your price within hours of each change you make. A one-time undercut is not a price war. A sustained back-and-forth where every drop triggers another is. If your category's average selling price has fallen more than 15% in 90 days while unit volumes have stayed flat, you are in an active war.",
  },
  {
    q: "Should I always match a competitor price drop on Amazon India?",
    a: "No. Matching makes sense when your product is commoditised and price is the dominant buying signal. It does not make sense when the undercut comes from a seller with a weaker listing, fewer reviews, or lower fulfilment quality — buyers can see all of that alongside price. And it never makes sense below your calculated floor, regardless of what happens to Buy Box share.",
  },
  {
    q: "How long do Amazon India price wars typically last?",
    a: "Most price wars in commodity categories burn out within four to eight weeks as sellers with insufficient margin exit or pause. Sellers who hold their floor and track competitor prices daily are positioned to recover rank quickly when the category restabilises — and they do so with margin intact, unlike those who matched every cut.",
  },
  {
    q: "What is the fastest way to exit a price war on Amazon India?",
    a: "Bundling is usually the fastest exit — it creates a new listing that sits outside the direct price comparison and attracts a buyer choosing on value rather than lowest price. Differentiation through reviews and listing quality is slower but more durable. Using both together — bundle to exit the war, differentiate to prevent the next one — is the most effective combination.",
  },
  {
    q: "How does real-time competitor price tracking help during a price war?",
    a: "It tells you whether a competitor's price drop is a sustained move or a temporary test, and whether their listing quality gives them a real Buy Box advantage at that price. That distinction determines whether matching is necessary or whether holding is the smarter call. Without real-time data, you are always responding to information that is hours or days old.",
  },
  {
    q: "Does a price war affect keyword rank on Amazon India?",
    a: "Indirectly, yes. Losing the Buy Box during a price war reduces your sales velocity, which is a ranking signal on Amazon India. Sellers who manage to hold Buy Box through a price war — by staying competitive enough at the margin without dropping below their floor — typically recover rank faster when the war ends than those who matched every cut and sacrificed both margin and positioning.",
  },
];

// ── Related guides (per user-specified table) ─────────────────────────────────
const priceWarRelatedCards = [
  {
    tag: "Repricing Rules",
    title: "Amazon India Repricing Strategy 2026: Stop Losing the Buy Box",
    route: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
    image: "/amazon-repricing-strategy-india-image0.png",
  },
  {
    tag: "Competitor Intelligence",
    title: "Competitor Undercutting Your Amazon India Price? Act Within 1 Hour",
    route: "/resources/expert-blog/competitor-undercutting-amazon-india",
    image: "/Detect Competitor Price Undercutting on Amazon India.png",
  },
  {
    tag: "Margin Protection",
    title: "How Negative Reviews Are Killing Your Amazon India Sales",
    route: "/resources/expert-blog/negative-reviews-amazon-india",
    image: "/How Negative Reviews Are Killing Your Amazon India Sales.png",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonIndiaPriceWarStrategyContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const id = "insydz-amazon-india-price-war-strategy-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaAmazonIndiaPriceWarStrategy);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = priceWarTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(priceWarTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(priceWarTOC[i].id);
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
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#F97316,#FB923C);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
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
        .article-body ul{padding-left:22px;margin-bottom:16px}
        .article-body li{margin-bottom:8px}
        .article-body li::marker{color:#F97316}

        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#F97316;background:#FFF7ED;border-left-color:#FDBA74}
        .toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(249,115,22,.1);color:#FB923C;border-left-color:rgba(249,115,22,.4)}
        .dark .toc-link.active{background:rgba(249,115,22,.15);color:#FB923C;border-left-color:#F97316}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9{scroll-margin-top:120px}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}

        .related-reading-box{background:#F0FDFA;border-left:4px solid #0D9488;border-radius:10px;padding:20px 22px;margin:32px 0}
        .related-reading-box .rr-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:#0D9488;margin-bottom:10px}
        .related-reading-box ul{margin:0;padding-left:18px}
        .related-reading-box li{font-size:14.5px;margin-bottom:8px;line-height:1.6}
        .dark .related-reading-box{background:#042f2e;border-color:#134e4a}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Amazon India Price War Strategy" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Pricing Strategy · Festive Prep · Competitor Intelligence"
        title={
          <>
            How to Survive an{" "}
            <span style={{ color: "#F97316" }}>Amazon India Price War</span>{" "}
            (2026)
          </>
        }
        description={
          <>
            An Amazon India price war does not end faster when you match every
            cut. It ends when someone stops matching. Here are the three
            strategies that let you compete without racing to the bottom:
            differentiate, bundle, or own the mid-range.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="August 2026"
        readTime="11 min read"
        bgColor={{ light: "#FFF7ED", dark: "#1c0900" }}
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Hero stats */}
        <HeroStats
          resolvedTheme={resolvedTheme}
          accentColor="#F97316"
          stats={[
            {
              value: "83%",
              label:
                "margin collapse from a 12.5% price drop at 15% net margin — the math most sellers never run before matching",
            },
            {
              value: "3 strategies",
              label:
                "to compete without racing to the bottom — differentiate, bundle, or own the mid-range position",
            },
            {
              value: "4–8 weeks",
              label:
                "typical duration of a commodity category price war on Amazon India before margin forces sellers to exit",
            },
            {
              value: "Real-time",
              label:
                "competitor price alerts via WhatsApp — know within minutes, not hours, whether to hold or match",
            },
          ]}
        />

        <InfoBanner
          accentColor="#F97316"
          backgroundColor="#FFF7ED"
          title="QUICK ANSWER"
          content="An Amazon India price war does not end faster when you match every cut. It ends when someone stops matching. The three strategies that let you compete without racing to the bottom are: differentiating your listing so price is not the only signal buyers use, bundling to exit the direct comparison entirely, and owning the mid-range position rather than chasing the floor. Which one to use depends on your review count, listing quality, and how commoditised your category actually is."
        />

        {/* Hero image */}
        <BlogImageSection
          imageSrc="/Blog_30_banner.png"
          altText="Amazon India Price War Strategy"
          caption="Insydz competitor price monitor showing a live price war in a tiffin box category. Two competitors dropped from ₹849 to ₹699 in 72 hours. The seller held at ₹799 above their ₹740 floor because the review gap (4.4 vs 3.8 stars) justified the premium — and retained 64% Buy Box share without matching a single drop."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={priceWarKeyTakeaways}
              accentColor="#F97316"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={priceWarTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={priceWarTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="What Is an Amazon India Price War and Why Do They Start?"
                paragraph1="A price war is not a single undercut — every competitive category has those. A price war is a sustained cycle where one seller's price drop triggers a matching drop from competitors, which triggers another cut, and so on, until the category's average selling price has fallen far enough that margins become unsustainable for at least some of the participants."
                paragraph2="On Amazon India, price wars typically start in one of three ways. First, a new seller enters a category with artificially low launch pricing and does not raise it. Second, a seller with a cost advantage (lower COGS, direct factory sourcing) deliberately prices below the category average to drive out competitors. Third, a seller with an automated repricing rule set without a price floor accidentally triggers a spiral that pulls every competitor with a similar rule into a race toward zero."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <div
              style={{
                background: "#F0FDFA",
                borderLeft: "4px solid #0D9488",
                borderRadius: 10,
                padding: "20px 22px",
                margin: "24px 0",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  color: "#0D9488",
                  marginBottom: 8,
                }}
              >
                The Third Type Is the Most Common — and the Most Avoidable
              </div>
              <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.72 }}>
                Automated repricing rules without price floors are the single
                most common cause of category-wide margin collapse on Amazon
                India in 2026. If you have repricing rules active, setting a
                calculated floor is non-negotiable. The guide on{" "}
                <InLink to="/blog/amazon-repricing-strategy-india-2026">
                  how to set a price floor and build repricing rules
                </InLink>{" "}
                covers this in detail.
              </p>
            </div>

            <div id="s3">
              <SectionQA
                title="Why Matching Every Price Drop Is the Wrong Response"
                paragraph1="The instinct to match is understandable. Losing Buy Box share is visible and immediate. The margin cost of matching is abstract and shows up later. But the math of matching is brutal once you run it."
                paragraph2="Consider a product priced at ₹799 with a 15% net margin — roughly ₹120 per unit. A competitor drops their price to ₹699, a ₹100 reduction. If you match, your margin drops from ₹120 to ₹20 — a 83% margin collapse from what looks like a 12.5% price reduction. If the competitor drops again to ₹649, you are below break-even."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={marginTableColumns} rows={marginTableRows} />

            <p>
              Beyond the margin math, matching every cut teaches your competitor
              that cutting works. Each drop that triggers a response is
              confirmation that the strategy is effective. You are, in effect,
              funding the playbook being used against you.
            </p>

            <div
              style={{
                background: "#FFFBEB",
                borderLeft: "4px solid #D97706",
                borderRadius: 10,
                padding: "20px 22px",
                margin: "24px 0",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  color: "#D97706",
                  marginBottom: 8,
                }}
              >
                When Matching IS the Right Call
              </div>
              <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.72 }}>
                Matching makes sense when: your product is genuinely
                commoditised with no meaningful differentiation, your competitor
                has equivalent reviews and listing quality, and the matched
                price is still above your calculated floor. Outside of those
                three conditions, matching is usually the wrong move. If you
                have not set a floor, do that first — the full formula is in the{" "}
                <InLink to="/blog/amazon-repricing-strategy-india-2026">
                  repricing strategy guide
                </InLink>
                .
              </p>
            </div>

            <div id="s4">
              <SectionQA
                title="Strategy 1 — Differentiate Your Listing So Price Is Not the Only Signal"
                paragraph1="The reason price wars work is that buyers compare on price when they cannot compare on anything else. If your listing title, images, A-plus content, and review profile give buyers meaningful signals beyond price, a ₹50 to ₹100 premium becomes defensible."
                paragraph2="This is not about cosmetic changes. It is about identifying the specific reasons buyers are choosing your product over competitors — or choosing competitors over you — and making those reasons visible in your listing."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={differentiationSteps}
              numberColor="#F97316"
              backgroundColor="#F8FAFC"
              borderColor="#FFD8B0"
            />

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="The Differentiation Test"
              content="Open your listing and your top competitor's listing side by side. If a buyer could not tell the difference other than price, price is all they will buy on. If your listing gives them three reasons to choose you that have nothing to do with the number, you have differentiation. The goal is not to eliminate price sensitivity — it is to reduce it enough that a reasonable premium is defensible."
            />

            <div id="s5">
              <SectionQA
                title="Strategy 2 — Bundle and Reframe to Exit the Direct Comparison"
                paragraph1="A bundle is not just a way to add volume — it is a way to create a product that sits outside the direct price comparison. A standalone steel tiffin box at ₹799 competes directly against every other standalone steel tiffin box. A tiffin box bundled with a carry bag and a meal prep guide at ₹999 competes against nothing at that specific combination, because no competitor has that exact bundle."
                paragraph2={`Bundling works because it changes the buyer\'s comparison frame. Instead of "which tiffin box is cheapest," the buyer asks "which combination gives me the most for my money" — and that question favours the seller who defined the combination, not the one competing on the cheapest unit.`}
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/Blog_30_image1.png"
              altText="Bundling Strategy — Exit the Comparison"
              caption="Insydz bundle margin analysis for a tiffin box seller. The standalone unit, priced at ₹699 to stay competitive in a price war, generates ₹20 margin per unit. The bundle — same base product plus a carry bag and meal prep insert — sells at ₹999 with ₹180 margin per unit and has no direct price competitor to undercut it."
            />

            <p>
              The practical steps for building a bundle that exits the price
              comparison:
            </p>
            <ul>
              <li>
                <strong>
                  Choose a complementary add-on with low COGS and high perceived
                  value.
                </strong>{" "}
                A printed care guide, a storage bag, a second accessory item.
                The add-on should cost less than ₹80–100 to source but make the
                bundle worth ₹150–200 more than the standalone.
              </li>
              <li>
                <strong>Create a separate listing for the bundle.</strong> Do
                not adjust the standalone listing's price — run both. The
                standalone competes where it must; the bundle captures buyers
                shopping on value.
              </li>
              <li>
                <strong>
                  Price the bundle so the per-unit math works even if no one
                  buys the standalone.
                </strong>{" "}
                Bundle pricing should not depend on the standalone selling — it
                should stand alone as a viable margin position.
              </li>
            </ul>

            <div id="s6">
              <SectionQA
                title="Strategy 3 — Own the Mid-Range Instead of Chasing the Floor"
                paragraph1="Most Amazon India price wars are fought at two ends: the floor (where sellers with unsustainable costs are racing) and the premium (where differentiated sellers with strong reviews sit). The mid-range — the band between the category floor and the established premium — is frequently under-served and represents a viable competitive position for sellers who cannot yet command a premium but are unwilling to fund a race to the floor."
                paragraph2="Owning the mid-range means holding a price that is visibly above the floor, offering clearly better listing quality and reviews than the floor sellers, but positioned below the established category premium so buyers who have price sensitivity but want something better than the cheapest option land on you."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <BlogImageSection
              imageSrc="/Blog_30_image2.png"
              altText="Mid-Range Positioning — The Ignored Band"
              caption="Insydz category price map for a tiffin box category mid-price war. Six sellers are fighting at ₹599–699 with an average 3.6-star rating. One premium seller sits at ₹1,199 and is unreachable for value-conscious buyers. The mid-range at ₹799 with 4.3 stars has only two competitors and the best quality-to-price ratio in the category — the most defensible position to hold."
            />

            <div id="s7">
              <SectionQA
                title="How to Know When to Hold vs Match During a Price War"
                paragraph1="The decision to hold your price or match a competitor's drop should be based on data, not instinct. Four questions determine the right call."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <ul>
              <li>
                <strong>
                  Is the competitor's listing quality lower than yours?
                </strong>{" "}
                If they have significantly fewer reviews, lower rating, weaker
                images, or missing A-plus content, buyers can see that alongside
                the price difference. A ₹50–100 premium is often survivable when
                your listing quality gap is visible.
              </li>
              <li>
                <strong>Is this drop sustained or a temporary test?</strong> A
                competitor who drops ₹100 and holds it for a week is signalling
                cost structure. One who drops and recovers within 48 hours is
                testing Buy Box response.{" "}
                <InLink to="/blog/competitor-undercutting-amazon-india">
                  Tracking competitor prices in real time
                </InLink>{" "}
                is the only way to distinguish these without waiting to see
                which it is.
              </li>
              <li>
                <strong>
                  Is their new price above or below your calculated floor?
                </strong>{" "}
                If they are pricing below what you can profitably match,
                matching is not an option regardless of what happens to your Buy
                Box share. The guide on{" "}
                <InLink to="/blog/amazon-repricing-strategy-india-2026">
                  how to set a price floor
                </InLink>{" "}
                covers how to calculate this precisely.
              </li>
              <li>
                <strong>
                  Are you still holding enough Buy Box share to matter?
                </strong>{" "}
                If you are retaining 55–65% Buy Box share at your current price,
                the premium is working. If Buy Box drops below 30%, a partial
                adjustment — not a full match — is worth testing.
              </li>
            </ul>

            <FeatureCTA
              title="Know whether a competitor's price drop is a real threat or a temporary test — before you respond"
              description="Insydz tracks competitor prices in real time and sends WhatsApp alerts the moment something changes. Free to start."
              buttonText="Set Up Competitor Tracking Free →"
              buttonHref="/login"
              backgroundColor="#0D1B2A"
              buttonColor="#F97316"
            />

            <div id="s8">
              <SectionQA
                title="What Real-Time Competitor Intelligence Changes About Your Response"
                paragraph1="The practical problem with price war strategy is speed. A competitor drops their price at 7 AM. If you find out at 9 PM when you check your dashboard, you have already lost 14 hours of Buy Box during what is typically the highest-traffic part of a weekday. You have also lost the ability to distinguish a sustained drop from a test, because the data you have is a snapshot, not a trend."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <p>
              Real-time{" "}
              <InLink to="/features/competitor-price-tracking-feature">
                competitor intelligence
              </InLink>{" "}
              changes three things in a price war:
            </p>
            <ul>
              <li>
                <strong>Response time.</strong> A WhatsApp alert within minutes
                of a competitor repricing means you make the hold-vs-match
                decision in the same hour, not the next day.
              </li>
              <li>
                <strong>Pattern recognition.</strong> Seeing a competitor's
                price history across 72 hours tells you whether they are testing
                or committing. A single data point does not.
              </li>
              <li>
                <strong>Confidence in holding.</strong> Knowing that your
                competitor's review score is 3.8 stars while yours is 4.4 — and
                that they have cut to ₹699 — is the information that makes
                holding at ₹799 a deliberate strategy rather than a guess.
              </li>
            </ul>

            <p>
              The{" "}
              <InLink to="/resources/expert-blog/top-amazon-india-sellers-habits">
                habits of top Amazon India sellers
              </InLink>{" "}
              consistently show the same pattern: the sellers who come out of
              price wars with the most market share are not the most aggressive
              pricers — they are the most informed ones. They know what
              competitors are doing and why before they respond, and that
              knowledge is what separates a price war strategy from a price war
              reaction.
            </p>

            <div id="s9">
              <SectionQA
                title="Frequently Asked Questions: Amazon India Price War Strategy"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#F97316" faqs={priceWarFaqs} />

            <RelatedReadingBox
              label="📌 Related Reading on Insydz"
              accentColor="#F97316"
              darkAccentColor="#FB923C"
              backgroundColor="#fff8f2ff"
              darkBackgroundColor="#1F1206"
              resolvedTheme={resolvedTheme}
              links={[
                {
                  text: "Competitor Undercutting Your Amazon India Price? How to Find Out and What to Do in 1 Hour",
                  href: "/resources/expert-blog/competitor-undercutting-amazon-india",
                },
                {
                  text: "How Negative Reviews Are Silently Killing Your Amazon India Sales — and How to Stop It",
                  href: "/resources/expert-blog/negative-reviews-amazon-india",
                },
                {
                  text: "How to Launch a Private Label on Amazon India in 2026: The Complete Seller's Playbook",
                  href: "/resources/expert-blog/amazon-private-label-india-2026",
                },
                {
                  text: "Amazon India Repricing Strategy 2026: How to Set Rules, Floors, and Hold Buy Box",
                  href: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
                },
                {
                  text: "We Studied 100 Amazon India Seller Accounts: What the Top 10% Do Differently",
                  href: "/resources/expert-blog/top-amazon-india-sellers-habits",
                },
              ]}
            />

            {/* More Pricing and Competitor Intelligence */}
            <RelatedArticles
              title="More Pricing and Competitor Intelligence"
              cards={priceWarRelatedCards}
              resolvedTheme={resolvedTheme}
            />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Your Competitor Just Dropped Their Price. Do You Know Whether to Match It?"
        description="Insydz sends WhatsApp alerts within minutes — with listing quality context, Buy Box impact, and a suggested response. Start free, no credit card required. 5,000+ Indian sellers use Insydz · Amazon India and Flipkart · ₹2,499/month full access"
        primaryButtonText="Start Tracking Competitor Prices Free →"
        primaryButtonHref="/login"
        primaryColor="#F97316"
        secondaryColor="#FB923C"
        stats={[
          {
            value: "✓",
            label: "Real-time competitor price alerts via WhatsApp",
          },
          {
            value: "✓",
            label: "3 strategies to compete without racing to the floor",
          },
          { value: "✓", label: "Price floor alerts to block margin breaches" },
          { value: "✓", label: "Free plan, no credit card needed" },
        ]}
      />
    </div>
  );
}
