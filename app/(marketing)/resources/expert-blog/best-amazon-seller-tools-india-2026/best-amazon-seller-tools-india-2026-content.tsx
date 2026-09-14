"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import HeroSection from "../components/HeroSection";
import DataTable, { TableColumn, TableRow } from "../components/DataTable";
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import RelatedArticles from "../components/RelatedArticles";
import MobileTableOfContents from "../components/MobileTableOfContents";
import TOCSidebar from "../components/TOCSidebar";
import InsightCards, { InsightCard } from "../components/InsightCard";
import RelatedReadingBox from "../components/Relatedreadingbox";
import BlogImageSection from "../components/BlogImageSection";

export const dynamic = "force-static";

// ── TOC Items ──────────────────────────────────────────────────────────────────
const tocItems = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "What Sellers Search For" },
  { id: "s3", label: "The Five Categories" },
  { id: "s4", label: "Insydz vs Helium 10 vs Jungle Scout" },
  { id: "s5", label: "Where Global Tools Fall Short" },
  { id: "s6", label: "Choose by Your Stage" },
  { id: "s7", label: "Frequently Asked Questions" },
  { id: "s8", label: "Summary" },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "The best Amazon seller tools for India in 2026 fall into five categories: price tracking, keyword research, product research, PPC management, and review analytics.",
  "Most established names were built for the US market. The better test for an Indian seller is which tool understands rupee price points, GST margins, and Flipkart — not which one has the most features.",
  "Neither Helium 10 nor Jungle Scout covers Flipkart. Insydz covers both Amazon India and Flipkart from one Seller Central connection — INR pricing, GST margins, WhatsApp alerts, free plan.",
];

// ── Search Volume Chart Data (s2) ─────────────────────────────────────────────
const searchVolumeData = [
  { category: "Seller Tools (general)", volume: "3,600", width: "100%" },
  { category: "PPC Management", volume: "590", width: "16%" },
  { category: "SEO Tools", volume: "480", width: "13%" },
  { category: "Keyword Research", volume: "390", width: "11%" },
  { category: "Product Research", volume: "210", width: "6%" },
];

// ── Five Categories Items (s3) ────────────────────────────────────────────────
const fiveCategories = [
  {
    title: "1. Competitor price tracking and repricing",
    description:
      "Your Buy Box on Amazon and your listing rank on Flipkart move with price within hours. Tools built for India track competitors on both platforms with floor-price alerts to WhatsApp — so a small undercut does not cost four days of sales before anyone notices.",
  },
  {
    title: "2. Keyword research",
    description:
      "A tool on US data overstates demand for Indian categories. Niche keyword volumes on Amazon.in run well below US equivalents — look for India-specific search volume that also tracks rank on Flipkart, since Flipkart exposes no keyword rank data inside its own dashboard.",
  },
  {
    title: "3. Product research",
    description:
      "Score demand, competition, and margin together. A seller in Jaipur nearly imported a phone stand showing 4,000 searches — until an Opportunity Score flagged 63 existing sellers and a margin that turned negative after shipping.",
  },
  {
    title: "4. PPC management",
    description:
      "Where Indian sellers waste the most money — on clicks that never convert. The stronger tools track Total ACOS: ad spend against organic plus paid sales combined, not the isolated figure Amazon Ads reports by default.",
  },
  {
    title: "5. Listing SEO and review analytics",
    description:
      "Catch a review complaint cluster before it shows in sales — most listing problems surface in reviews two to three weeks before they surface in revenue.",
  },
];

// ── Comparison Table (s4) ──────────────────────────────────────────────────────
const comparisonColumns: TableColumn[] = [
  { key: "feature", label: "FEATURE" },
  { key: "insydz", label: "INSYDZ" },
  { key: "helium10", label: "HELIUM 10" },
  { key: "junglescout", label: "JUNGLE SCOUT" },
];

const comparisonRows: TableRow[] = [
  {
    feature: "Amazon India coverage",
    insydz: {
      type: "chip",
      label: "India-native data",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold",
    },
    helium10: "Global, US-centric",
    junglescout: "Global, US-centric",
  },
  {
    feature: "Flipkart coverage",
    insydz: {
      type: "chip",
      label: "Yes",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold",
    },
    helium10: {
      type: "chip",
      label: "No",
      className:
        "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
    junglescout: {
      type: "chip",
      label: "No",
      className:
        "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
  },
  {
    feature: "Currency",
    insydz: {
      type: "chip",
      label: "INR",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold",
    },
    helium10: "USD",
    junglescout: "USD",
  },
  {
    feature: "PPC management",
    insydz: "Early access",
    helium10: "Yes (Adtomic)",
    junglescout: "Limited",
  },
  {
    feature: "WhatsApp alerts",
    insydz: {
      type: "chip",
      label: "Yes",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold",
    },
    helium10: {
      type: "chip",
      label: "No",
      className:
        "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
    junglescout: {
      type: "chip",
      label: "No",
      className:
        "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
  },
  {
    feature: "Starting price",
    insydz: {
      type: "chip",
      label: "Free plan",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold",
    },
    helium10: "From $99/mo",
    junglescout: "From $29/mo",
  },
];

// ── Stage Cards (s6) ──────────────────────────────────────────────────────────
const stageCards: InsightCard[] = [
  {
    icon: "🌱",
    iconBg: "rgba(16, 185, 129, 0.15)",
    iconColor: "#10B981",
    title: "New sellers",
    description:
      "Not yet selling? Start at Amazon's own seller signup or Flipkart Seller Hub. Already live? Use free tools to validate a product before spending on inventory — the Opportunity Score flags demand, competition, and margin traps before you source.",
  },
  {
    icon: "📈",
    iconBg: "rgba(37, 99, 235, 0.15)",
    iconColor: "#2563EB",
    title: "Growing sellers",
    description: (
      <>
        ₹5 lakh to ₹50 lakh a month gets the most value from combined price
        tracking, keyword tracking, and PPC in one place — these signals affect
        each other daily. A{" "}
        <Link
          href="/resources/expert-blog/amazon-competitor-price-tracking-tool"
          className="text-blue-600 dark:text-blue-400 underline font-semibold"
        >
          Buy Box loss
        </Link>{" "}
        often precedes a keyword rank drop by 24 to 48 hours.
      </>
    ),
  },
  {
    icon: "👥",
    iconBg: "rgba(139, 92, 246, 0.15)",
    iconColor: "#8B5CF6",
    title: "Agencies",
    description: (
      <>
        Managing several accounts should prioritise a single multi-client
        dashboard over five separate logins. See the{" "}
        <Link
          href="/resources/expert-blog/agency-client-reporting-automation"
          className="text-blue-600 dark:text-blue-400 underline font-semibold"
        >
          agency reporting guide
        </Link>{" "}
        for multi-client automation.
      </>
    ),
  },
  {
    icon: "🛒",
    iconBg: "rgba(245, 158, 11, 0.15)",
    iconColor: "#F59E0B",
    title: "Dual-platform sellers",
    description:
      "Make Flipkart-native coverage the first filter when evaluating any tool. A platform that covers Amazon India but leaves Flipkart as a manual exercise costs more in time than it saves in features.",
  },
];

// ── FAQs (s7) ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "What are the best Amazon seller tools for Indian sellers in 2026?",
    a: "The five categories to cover: competitor price tracking, keyword research, product research, PPC management, and review analytics. For Amazon India and Flipkart, tools built on India-native data with INR pricing and dual-marketplace coverage outperform global tools like Helium 10 and Jungle Scout.",
  },
  {
    q: "Do Helium 10 and Jungle Scout work for Amazon India?",
    a: "Both provide partial support but were built for the US marketplace in USD. Neither covers Flipkart, neither accounts for GST, and their keyword data for Amazon India is less accurate than India-native tools.",
  },
  {
    q: "Is there a free Amazon seller tool for India?",
    a: "Yes — Insydz offers a free plan covering competitor price monitoring, Buy Box tracking, and keyword rank for Amazon India and Flipkart. No credit card required.",
  },
  {
    q: "What is the best keyword research tool for Amazon India?",
    a: "One that pulls search volume from Amazon.in specifically, not Amazon.com data applied to India. Search volumes for Indian categories run significantly lower — a US-calibrated tool will consistently overstate demand.",
  },
  {
    q: "How do Amazon seller tools handle Flipkart?",
    a: "Most global tools — including Helium 10 and Jungle Scout — do not support Flipkart. Insydz covers both Amazon India and Flipkart in one dashboard from a single Seller Central connection.",
  },
  {
    q: "What should I look for when choosing a tool for India?",
    a: "India-native search data, INR pricing with GST margins, Flipkart coverage, WhatsApp alerts, and a free INR plan. A tool covering all five is significantly more useful than one covering two or three.",
  },
];

// ── Related Reading Links ─────────────────────────────────────────────────────
const relatedReadingLinks = [
  {
    text: "Insydz vs Helium 10: Which Tool Fits Indian Sellers Better?",
    href: "/compare/insydz-vs-helium-10",
  },
  {
    text: "Amazon India Repricing Strategy 2026: Set Rules, Floors, and Hold Buy Box",
    href: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
  },
  {
    text: "AI Review Intelligence Tool: Fix Listing Weaknesses Before Peak Traffic Hits",
    href: "/resources/expert-blog/amazon-review-analysis-guide-india",
  },
  {
    text: "How to Find Every Keyword Your Amazon India Competitor Is Ranking For",
    href: "/resources/expert-blog/find-competitor-keywords-amazon-india",
  },
  {
    text: "Best Flipkart Analytics Tool for Indian Sellers (2026)",
    href: "/resources/expert-blog/best-flipkart-analytics-tool",
  },
];

// ── Related Articles ──────────────────────────────────────────────────────────
const relatedArticlesCards = [
  {
    tag: "Tool Comparison",
    title: "Insydz vs Helium 10: Which Fits Indian Sellers Better?",
    route: "/compare/insydz-vs-helium-10",
    image: "/Insydz-vs-Helium-10.png",
  },
  {
    tag: "Repricing",
    title: "Amazon India Repricing 2026: Rules, Floors, Buy Box",
    route: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
    image: "/amazon-repricing-strategy-india-image0.png",
  },
  {
    tag: "Flipkart Tools",
    title: "Best Flipkart Analytics Tool for Indian Sellers (2026)",
    route: "/resources/expert-blog/best-flipkart-analytics-tool",
    image: "/Best-Flipkart-Analytics-Tool.png",
  },
];

export default function BestAmazonSellerToolsIndia2026Content() {
  const { resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("s1");
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (const item of tocItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1A] text-slate-900 dark:text-slate-100 transition-colors">
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
          { label: "Best Amazon Seller Tools India 2026", href: "#" },
        ]}
      />

      {/* Hero Section */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Seller Tools & Strategy · Tool Comparison · India 2026"
        title="What Are the Best Amazon Seller Tools for Indian Sellers in 2026?"
        description="Five tool categories every Amazon India and Flipkart seller should cover, where global names like Helium 10 and Jungle Scout hold up, and where they fall short for INR pricing and Flipkart."
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="September 2026"
        readTime="5 min read"
        tags={["Tool Comparison", "India 2026"]}
        bgColor={{
          light:
            "linear-gradient(150deg, #EFF6FF 0%, #DBEAFE 50%, #EEF2FF 100%)",
          dark: "linear-gradient(150deg, #0C1A27 0%, #0c1445 50%, #1e1b4b 100%)",
        }}
        highlightColor="#2563EB"
      />

      {/* ── Custom Graphic Banner (Matching Image attached) ───────────────── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 my-8">
        <BlogImageSection
          imageSrc="/best-amazon-seller-tools-india.png"
          altText="Amazon India Seller Tool Comparison"
          caption="Insydz India tool coverage check for 2026. Four of the five criteria Indian sellers need most — Amazon India native data, Flipkart coverage, INR and GST margins, and WhatsApp alerts — are either unique to Insydz or unavailable in Helium 10 or Jungle Scout."
        />
      </div>

      {/* Quick Answer Banner */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mb-8">
        <InfoBanner
          title="⚡ Quick Answer"
          content="The best Amazon seller tools for Indian sellers in 2026 fall into five categories: competitor price tracking, keyword research, product research, PPC management, and review analytics. Most established names were built for the US marketplace. For Amazon India and Flipkart, the better test is which tool understands rupee price points, GST-inclusive margins, and festive demand cycles — not which one has the most features. Insydz is the only platform that covers both Amazon India and Flipkart from one connection, with a free plan and no credit card required."
          accentColor="#2563EB"
          backgroundColor="#EFF6FF"
        />
      </div>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mb-8">
        {/* s1: Key Takeaways */}
        <section id="s1" className="scroll-mt-28 space-y-6">
          <KeyTakeawaysBox
            title="Key Takeaways"
            items={keyTakeaways}
            accentColor="#2563EB"
            backgroundColor={isDark ? "#0C1A27" : "#0F172A"}
          />

          <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            Search best amazon seller tools and most lists read the same way: a
            comparison of ten to fifteen tools, few of which mention India. That
            is the gap this guide fills — tools organised by what an Indian
            seller actually needs to check, in what order, and where a global
            tool starts to fall short.
          </p>
        </section>
      </div>

      {/* Mobile TOC */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:hidden mb-6">
        <MobileTableOfContents
          tocItems={tocItems}
          activeSection={activeSection}
          go={scrollToSection}
        />
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sticky Sidebar (Left Column) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-28">
            <TOCSidebar
              items={tocItems}
              activeSection={activeSection}
              onNavigate={scrollToSection}
            />

            {/* Sidebar CTA Box */}
            {/* <div className="bg-gradient-to-br from-[#0C1A27] to-[#0a1a3c] text-white rounded-2xl p-6 shadow-xl border border-blue-900/50 space-y-4">
              <h3 className="font-extrabold text-lg leading-snug">
                The Only Seller Tool Built for Amazon India and Flipkart
                Together
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                INR pricing, GST-aware margins, Flipkart coverage, and WhatsApp
                alerts in one dashboard. Free plan available, no credit card
                required.
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Competitor
                  price tracking, both platforms
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span>{" "}
                  India-native keyword research
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Product
                  research with Opportunity Score
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Review
                  analytics and listing alerts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Free to
                  start, no credit card
                </li>
              </ul>
              <Link
                href="/login"
                className="block text-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full transition-colors shadow-md"
              >
                Start Free on Insydz
              </Link>
            </div> */}
          </aside>

          {/* Main Article Content (Right Column) */}
          <main className="lg:col-span-8 space-y-10">
            {/* s2: What Are Indian Sellers Searching For? */}
            <section id="s2" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                What Are Indian Sellers Actually Searching For?
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                Before picking a category, it helps to see where actual search
                demand sits among Indian sellers.
              </p>

              {/* Monthly Search Volume Box */}
              <div className="bg-slate-50 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span>🔍</span> Monthly Search Volume by Category — Amazon
                  India (2026)
                </div>

                <div className="space-y-3">
                  {searchVolumeData.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-1 border-b border-slate-200 dark:border-slate-800 last:border-0"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 w-44 shrink-0">
                        {row.category}
                      </span>
                      <div className="flex-1 mx-4 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                          style={{ width: row.width }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 w-16 text-right">
                        {row.volume}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  Average monthly search volume, highest-volume query per
                  category. Source: Insydz keyword research data, 2026. Amazon
                  India-focused terms only.
                </p>
              </div>
            </section>

            {/* s3: Five Categories */}
            <section id="s3" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                What Are the Five Categories Every Indian Seller Needs?
              </h2>

              <NumberedCards
                items={fiveCategories}
                numberColor="#2563EB"
                backgroundColor={isDark ? "#0F172A" : "#F8FAFC"}
                borderColor={isDark ? "#1E293B" : "#D7E3FF"}
                variant="number"
              />
            </section>

            {/* s4: Comparison Table */}
            <section id="s4" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                How Do Insydz, Helium 10, and Jungle Scout Compare?
              </h2>

              <DataTable columns={comparisonColumns} rows={comparisonRows} />

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
                See the full{" "}
                <Link
                  href="/compare/insydz-vs-helium-10"
                  className="text-blue-600 dark:text-blue-400 underline font-semibold"
                >
                  Insydz vs Helium 10 comparison
                </Link>{" "}
                for a deeper breakdown.
              </p>
            </section>

            {/* s5: Where Global Tools Fall Short */}
            <section id="s5" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                Where Do Global Tools Fall Short for India?
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                Most Amazon seller software built for the US market treats
                Amazon India as an afterthought — and neither major global
                player tracks Flipkart. For a seller running both marketplaces,
                that means exporting two sets of data by hand every week. Tools
                built from the ground up for this market — INR pricing,
                GST-aware fee math, Big Billion Days demand patterns — close
                that gap without the manual work.
              </p>

              <InfoBanner
                title="⚡ The Defining Difference"
                content="It also matters how a tool connects to your account. A platform using Amazon's official Selling Partner API only ever gets read access to what you approve — unlike sharing your Seller Central password directly, which is a security risk. Always confirm a tool uses the Selling Partner API before connecting."
                accentColor="#16A34A"
                backgroundColor="#F0FDF4"
              />
            </section>

            {/* s6: Choose by Stage */}
            <section id="s6" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                How Do You Choose Based on Your Stage?
              </h2>

              <InsightCards cards={stageCards} columns={2} />

              <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                The fastest way to decide is to try one tool and watch what it
                actually surfaces in the first week. Insydz's free plan runs
                Amazon India and Flipkart price tracking, keyword tracking, and
                product research side by side — no card required.
              </p>
            </section>

            {/* s7: FAQs */}
            <section id="s7" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                Frequently Asked Questions
              </h2>

              <FAQ faqs={faqs} accentColor="#2563EB" />
            </section>

            {/* s8: Summary */}
            <section id="s8" className="scroll-mt-28 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/20 pb-3">
                Summary: Choosing the Right Amazon Seller Tool for India in 2026
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                The best Amazon seller tool for an Indian seller is not the one
                with the most global features — it is the one built around how
                Amazon India and Flipkart actually work. That means five
                categories covered: competitor price tracking, keyword research,
                product research, PPC management, and review analytics. It means
                India-native search volume data instead of US figures applied to
                Indian categories. It means INR pricing with GST-aware margins,
                Flipkart coverage alongside Amazon India, and WhatsApp alerts
                that reach you the moment something changes.
              </p>

              <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                Helium 10 and Jungle Scout remain capable tools for sellers
                focused on the US marketplace, but both fall short on the
                specifics that matter most for India — currency, GST, and
                Flipkart chief among them. Insydz was built to close exactly
                that gap, with a free plan that lets you test price tracking,
                keyword rank, and product research on your own ASINs before
                committing to anything paid.
              </p>

              <RelatedReadingBox
                label="📌 Related Reading on Insydz"
                links={relatedReadingLinks}
                accentColor="#2563EB"
                backgroundColor="#EFF6FF"
              />

              <RelatedArticles
                title="More Seller Tools and Strategy"
                cards={relatedArticlesCards}
                resolvedTheme={resolvedTheme}
              />
            </section>
          </main>
        </div>
      </div>

      {/* Bottom Final CTA */}
      <FinalCTA
        title="Your Competitors Are Using Better Tools Right Now. Here Is How to Close the Gap."
        description="Insydz is the only seller analytics platform built from the ground up for Amazon India and Flipkart — INR pricing, GST-aware margins, WhatsApp alerts, and dual-marketplace coverage in one free plan."
        primaryButtonText="Start Free on Insydz →"
        primaryButtonHref="/login"
        primaryColor="#1D4ED8"
        secondaryColor="#4F46E5"
      />
    </div>
  );
}
