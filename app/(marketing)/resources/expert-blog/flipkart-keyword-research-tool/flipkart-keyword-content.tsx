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
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";
import InsightCards, { InsightCard } from "../components/InsightCard";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaFlipkartKeyword = {
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
        "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool",
      url: "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool",
      name: "Flipkart Keyword Research Tool for Indian Sellers (2026)",
      description:
        "Master Flipkart keyword research with a rank tracking and keyword gap tool built for Indian sellers, including free ways to get started.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#breadcrumb",
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
          name: "Blog",
          item: "https://insydz.com/resources/expert-blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Flipkart Seller Tools",
          item: "https://insydz.com/blog/flipkart-sellers",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Flipkart Keyword Research Tool",
          item: "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/flipkart-keyword-research-tool#article",
      headline: "Flipkart Keyword Research Tool for Indian Sellers (2026)",
      image: "https://insydz.com/Flipkart Keyword Research Tool.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-07-28",
      dateModified: "2026-07-28",
      keywords: [
        "flipkart keyword research tool india 2026",
        "flipkart keyword tracker india",
        "flipkart seo keyword research",
        "flipkart rank tracking tool indian sellers",
        "flipkart keyword gap analysis",
      ],
      articleSection: "Flipkart SEO & Seller Strategy",
      inLanguage: "en-IN",
      wordCount: 2600,
      timeRequired: "PT10M",
    },
  ],
};

// ── Key takeaways (s1) ────────────────────────────────────────────────────────
const flipkartKeywordTakeaways = [
  "Flipkart keyword research means finding the exact words buyers type into search, and making sure your listing title and description use them the way Flipkart's algorithm expects.",
  "Most sellers guess their keywords from competitor titles; tracking actual rank movement over time tells you which guesses are working and which aren't.",
  "You can start keyword tracking on Insydz's free plan before committing to anything paid.",
];

// ── TOC ───────────────────────────────────────────────────────────────────────
const flipkartKeywordTOC = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What Is Flipkart Keyword Research?" },
  { id: "s3", label: "Why It Matters in 2026" },
  { id: "s4", label: "How Flipkart's Search Works" },
  { id: "s5", label: "What to Track" },
  { id: "s6", label: "Step-by-Step Method" },
  { id: "s7", label: "Keyword Placement" },
  { id: "s8", label: "Free Options" },
  { id: "s9", label: "Weekly SEO Checklist" },
  { id: "s10", label: "Common Mistakes" },
  { id: "s11", label: "FAQs" },
];

// ── What to track (s5) ────────────────────────────────────────────────────────
const flipkartWhatToTrack = [
  {
    title: "Current rank position for each keyword you're targeting",
    description:
      "Tracked daily, not checked manually once a week. A keyword sitting at position 4 today can slip to position 11 by the weekend if a competitor updates their title. Checking only every Monday means you're always finding out three or four days late.",
  },
  {
    title: "Keyword gaps",
    description:
      "Terms your competitors rank for that you don't, surfaced automatically instead of found by manually comparing titles one by one. Spotting a gap by hand means opening five competitor listings and reading every word; an automated gap report just shows you the list.",
  },
  {
    title: "Rank movement over time",
    description:
      "So a 6-position drop gets flagged the day it happens, not discovered a month later when the sales report already reflects it. A single day's delay in noticing a drop is rarely costly on its own; a month of not noticing usually is.",
  },
];

// ── Step-by-step method (s6) ──────────────────────────────────────────────────
const flipkartMethodSteps = [
  {
    title: "List your seed terms",
    description:
      "Start with the obvious words a buyer would use: the product type, brand, and one or two defining features. Don't overthink this step; it's just a starting list.",
  },
  {
    title: "Check what competitors are ranking for",
    description:
      "Look at the top 5 to 10 listings for your seed terms and note which additional words show up repeatedly in their titles. These are usually the terms actually driving traffic, not just guesses.",
  },
  {
    title: "Run a keyword gap check",
    description:
      "Compare your listing against competitors to see which of those terms you're missing entirely, rather than reading every title by hand.",
  },
  {
    title: "Update your title and description",
    description:
      "Work in your two or three highest-priority keywords naturally. A keyword stuffed in awkwardly typically hurts more than it helps.",
  },
  {
    title: "Track rank for two weeks before making further changes",
    description:
      "Keyword changes take a few days to show up in rank movement; changing your title every other day makes it impossible to tell what's actually working.",
  },
  {
    title: "Revisit quarterly, or before any major sale event",
    description:
      "Buyer search phrasing shifts over time, especially around festive periods. Check your keyword list before Big Billion Days and other major sale windows, not just once a year.",
  },
];

// ── Keyword placement cards (s7) ──────────────────────────────────────────────
const flipkartPlacementCards: InsightCard[] = [
  {
    title: "Title",
    description:
      "Your highest-priority keyword should appear here, ideally near the front. This is the most heavily weighted field for keyword relevance.",
  },
  {
    title: "Key features / bullet points",
    description:
      "Your next two or three priority keywords belong here, each used naturally rather than repeated across every bullet.",
  },
  {
    title: "Description",
    description:
      "A good place for supporting long-tail phrases and keyword variations that didn't fit naturally into the title or bullets.",
  },
];

// ── Weekly SEO checklist (s9) ─────────────────────────────────────────────────
const flipkartWeeklyChecklist = [
  "Check rank position for your top 10 keywords. Note anything that moved more than a few positions.",
  "Scan the keyword gap report for any new terms competitors have started ranking for.",
  "Re-read your title and description against your top 3 keywords. Confirm they're still there, still in a natural order.",
  "Note any upcoming sale event or seasonal term and check whether your listing already includes it.",
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const flipkartKeywordFaqs = [
  {
    q: "Is there a free Flipkart keyword research tool?",
    a: "Yes. Insydz offers a free plan with no credit card required, which covers rank tracking for your core keywords so you can see whether your listing is actually visible for the terms you care about before committing to anything paid.",
  },
  {
    q: "How is Flipkart keyword research different from Amazon's?",
    a: "Flipkart's search algorithm, category structure, and buyer search phrasing are distinct from Amazon's. Keyword strategies built for Amazon typically need to be re-checked rather than copied over directly, since the two marketplaces attract different search behaviour and use different ranking signals.",
  },
  {
    q: "How often should I check my keyword rankings?",
    a: "Daily is ideal, since a rank drop is easiest to fix in the first day or two. The longer a drop goes unnoticed, the harder it is to recover the lost visibility, especially if a competitor has updated their listing in the meantime.",
  },
  {
    q: "Do I need a paid tool, or can I do keyword research manually?",
    a: "You can start manually by comparing top listings' titles, but tracking rank movement over time is what actually shows whether your keyword choices are working. A one-time check tells you where you are today; tracking tells you whether you are improving.",
  },
  {
    q: "Should I use the same keywords in my title and description?",
    a: "Not exactly the same ones. Use your highest-priority keyword in the title, and let the description carry supporting long-tail variations instead of repeating the title word-for-word. Flipkart's ranking signals respond to natural relevance across a listing, not repetition of a single phrase.",
  },
  {
    q: "Do keyword rankings change around festive sales like Big Billion Days?",
    a: "Yes. Buyer search phrasing shifts noticeably around major sale events, which is exactly why a quarterly or pre-sale revisit of your keyword list matters more than setting it once and leaving it.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlipkartKeywordContent() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const id = "insydz-flipkart-keyword-research-tool-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaFlipkartKeyword);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = flipkartKeywordTOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(flipkartKeywordTOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(flipkartKeywordTOC[i].id);
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

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        .toc-link{display:block;font-size:13px;font-weight:500;color:#64748B;padding:8px 16px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s ease;margin-bottom:4px;line-height:1.4;border-left:3px solid transparent;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.toc-link{font-size:14px;padding:8px 18px}}
        .toc-link:hover{color:#F97316;background:#FFF7ED;border-left-color:#FDBA74}
        .toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(249,115,22,.1);color:#FB923C;border-left-color:rgba(249,115,22,.4)}
        .dark .toc-link.active{background:rgba(249,115,22,.15);color:#FB923C;border-left-color:#F97316}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9,#s10,#s11{scroll-margin-top:120px}

        .art-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin:10px 0 8px;padding:0 10px}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      <MarketingHeader />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/expert-blog" },
          { label: "Flipkart Seller Tools", href: "/blog/flipkart-sellers" },
          { label: "Flipkart Keyword Research Tool 2026" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Flipkart SEO · Keyword Research · Rank Tracking"
        title="Flipkart Keyword Research Tool for Indian Sellers (2026)"
        description={
          <>
            Most sellers guess their keywords from competitor titles. This guide
            shows you how to find the exact words buyers use, track whether your
            listing is actually ranking for them, and fix the gaps before they
            cost you sales, including free ways to get started.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="July 2026"
        readTime="10 min read"
        bgColor={{ light: "#FFF7ED", dark: "#1c0900" }}
        tags={["SEO Guide · Flipkart", "Free Plan Available"]}
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Hero stats */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 32,
            background: resolvedTheme === "dark" ? "#111827" : "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05)",
          }}
        >
          {[
            {
              num: "Daily",
              lbl: "rank tracking so a position drop on Monday shows up Monday, not the following week in your sales report",
            },
            {
              num: "Top 5",
              lbl: "competitor listings are where the highest-traffic keywords on Flipkart are hiding, not in keyword tools",
            },
            {
              num: "₹0",
              lbl: "to start keyword tracking on Insydz, free plan with no credit card required to see your current rank positions",
            },
            {
              num: "100%",
              lbl: "Flipkart-specific, not adapted from an Amazon tool, because Flipkart buyer search phrasing is not the same",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 160,
                padding: "18px 24px",
                borderRight: i < 3 ? "1px solid #E2E8F0" : "none",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#F97316",
                  lineHeight: 1,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {s.num}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  color: "#64748B",
                  marginTop: 5,
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {s.lbl}
              </span>
            </div>
          ))}
        </div>

        <InfoBanner
          accentColor="#F97316"
          backgroundColor="#FFF7ED"
          title="QUICK ANSWER"
          content="Flipkart keyword research means finding the exact words buyers type into search and making sure your listing title and description use them the way Flipkart's algorithm expects. Most sellers guess their keywords from competitor titles. Tracking actual rank movement over time tells you which guesses are working and which aren't. You can start on Insydz's free plan with no credit card before committing to anything paid."
        />

        {/* Blog Image Section */}
        <BlogImageSection
          imageSrc="/Flipkart Keyword Research Tool.png"
          altText="Flipkart Keyword Research Tool dashboard showing search volume, keyword ranking, and AI-powered SEO suggestions."
          caption="Insydz keyword rank tracker for a Flipkart seller in the tiffin box category. 'Office lunch box 2 tier' was not previously in the listing title. Once the keyword gap was flagged and added to the title, the listing entered the top 22 results within the tracking window."
        />

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={flipkartKeywordTakeaways}
              accentColor="#F97316"
            />
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* Desktop Sidebar */}
        <TableOfContents
          tocItems={flipkartKeywordTOC}
          activeSection={activeSection}
          go={go}
          resolvedTheme={resolvedTheme}
        />

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC */}
          <MobileTableOfContents
            tocItems={flipkartKeywordTOC}
            activeSection={activeSection}
            go={go}
            resolvedTheme={resolvedTheme}
          />

          <article className="article-body">
            <div id="s2">
              <SectionQA
                title="What Is Flipkart Keyword Research?"
                paragraph1="Flipkart keyword research is the process of finding which search terms your buyers actually use, and checking whether your listings are visible for them. It's different from Amazon keyword research: Flipkart's search behaviour, category structure, and buyer phrasing patterns aren't identical, so a strategy copied from Amazon usually underperforms here."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <div id="s3">
              <SectionQA
                title="Why Keyword Research Matters for Flipkart Sellers in 2026"
                paragraph1="Most listings don't lose visibility because the product is wrong. They lose it because the title and description are optimised for the wrong words. Without tracking, you only find out about any of this once sales have already dropped."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#0D9488"
              backgroundColor="#F0FDFA"
              title="Common Visibility Traps"
              content="A product ranks well for a broad term but misses the specific long-tail phrases buyers actually search. A competitor updates their title with a better keyword match and quietly takes your rank position. A seasonal search term spikes, say around a sale event, and listings without that exact phrase miss the traffic entirely."
            />

            <div id="s4">
              <SectionQA
                title="How Flipkart's Search Considers Keywords"
                paragraph1="Flipkart's search ranking weighs keyword relevance in your title and description alongside your pricing competitiveness, review quality, and sales history, not keywords in isolation. That's why the sellers who improve rank fastest are the ones tracking keyword position alongside price and review data, not keywords on their own."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <div id="s5">
              <SectionQA
                title="What to Track: Keyword Attributes That Matter"
                paragraph1="A proper keyword research setup should show you three things, updated continuously rather than checked when you remember to."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={flipkartWhatToTrack}
              numberColor="#F97316"
              backgroundColor="#F8FAFC"
              borderColor="#FFD8B0"
            />

            <InfoBanner
              accentColor="#4F46E5"
              backgroundColor="#EEF2FF"
              title="Insydz's Keyword & Rank Tracker and Keyword Gap Analysis"
              content="These features cover exactly this, with WhatsApp alerts when a tracked keyword's rank drops, and AI recommendations suggesting which keyword gaps are worth acting on first."
            />

            <div id="s6">
              <SectionQA
                title="How to Do Flipkart Keyword Research: A Step-by-Step Method"
                paragraph1="If you're starting from nothing, work through it in this order."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={flipkartMethodSteps}
              numberColor="#F97316"
              backgroundColor="#F8FAFC"
              borderColor="#FFD8B0"
            />

            <div id="s7">
              <SectionQA
                title="Where to Place Your Keywords in a Flipkart Listing"
                paragraph1="Once you know which keywords matter, placement affects how much weight each one carries. Avoid repeating the same keyword in every field just to 'be safe'. Flipkart's ranking signals respond to natural relevance across a listing, not repetition of a single phrase."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InsightCards cards={flipkartPlacementCards} columns={3} />

            <div id="s8">
              <SectionQA
                title="Free Flipkart Keyword Research Options"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="Start Free, Decide Later"
              content="If you're just getting started, you don't need to commit to a paid plan first. Insydz offers a free plan with no credit card required, which is enough to start tracking rank for your core keywords and see how your listings compare to competitors before deciding if you need more."
            />

            <div id="s9">
              <SectionQA
                title="A Weekly Flipkart SEO Checklist"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <KeyTakeawaysBox
              title="Run This Every Week"
              items={flipkartWeeklyChecklist}
              accentColor="#F97316"
            />

            <div id="s10">
              <SectionQA
                title="Common Mistakes Sellers Make With Flipkart Keywords"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#DC2626"
              backgroundColor="#FEF2F2"
              title="Watch Out For These"
              content="Copying competitor titles directly instead of checking which specific words are actually driving their rank. Setting keywords once and never revisiting them, when buyer search phrasing shifts, especially around festive periods. Ignoring keyword gaps, not knowing which terms competitors rank for that you're missing entirely. Treating keyword research as separate from pricing and reviews, when a keyword fix rarely works in isolation if price or review issues are also dragging rank down."
            />

            <div id="s11">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <FAQ accentColor="#F97316" faqs={flipkartKeywordFaqs} />
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <FinalCTA
        title="Start Tracking Your Flipkart Keywords"
        description="See where you're ranking today and which keyword gaps are costing you visibility. Start free, no credit card required. 5,000+ Indian sellers use Insydz across Amazon India and Flipkart · ₹2,499/month for full access."
        primaryButtonText="Start Tracking My Flipkart Keywords Free →"
        primaryButtonHref="/login"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#F97316"
        secondaryColor="#FB923C"
        stats={[
          { value: "Daily", label: "Keyword rank tracking" },
          { value: "Gaps", label: "Analysis vs top competitors" },
          { value: "WhatsApp", label: "Alerts when rank drops" },
          { value: "Free", label: "Plan, no credit card needed" },
        ]}
      />
    </div>
  );
}
