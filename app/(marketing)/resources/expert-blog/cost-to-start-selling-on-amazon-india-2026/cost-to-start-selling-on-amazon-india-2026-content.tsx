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
import NumberedCards from "../components/NumberedCards";
import Breadcrumb from "../components/Breadcrumb";
import BlogImageSection from "../components/BlogImageSection";
import RelatedArticles from "../components/RelatedArticles";
import TableOfContents from "../components/TableOfContents";
import MobileTableOfContents from "../components/MobileTableOfContents";
import InsightCards, { InsightCard } from "../components/InsightCard";
import RelatedReadingBox from "../components/Relatedreadingbox";
import InlineNote from "../components/InlineNote";

export const dynamic = "force-static";

// ── TOC Items ──────────────────────────────────────────────────────────────────
const tocItems = [
  { id: "s1", label: "Key Takeaways" },
  { id: "s2", label: "How Much You Need" },
  { id: "s3", label: "Registration Costs" },
  { id: "s4", label: "Fees on Every Order" },
  { id: "s5", label: "Zero Referral Fee" },
  { id: "s6", label: "2026 Fee Changes" },
  { id: "s7", label: "Worked Example" },
  { id: "s8", label: "Costs Sellers Miss" },
  { id: "s9", label: "Budget by Stage" },
  { id: "s10", label: "Keeping Costs Low" },
  { id: "s11", label: "Frequently Asked Questions" },
  { id: "s12", label: "Summary" },
];

// ── Key Takeaways ──────────────────────────────────────────────────────────────
const keyTakeaways = [
  "Registration has no joining fee. GST registration is required for most sellers, and applying for it is free.",
  "Your real startup cost is inventory, packaging, and ads. Amazon's fees are charged only when you make a sale.",
  "Fees moved in 2026: 0% referral up to ₹1,000 in eligible categories, a higher closing fee from September 7, and cancellation fees based on order value from August 17.",
];

// ── Shared chip styles ─────────────────────────────────────────────────────────
const greenChip =
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold";
const totalRow =
  "font-bold !bg-slate-100 dark:!bg-slate-800 text-gray-900 dark:text-white";

// ── Budget Table (s2) ──────────────────────────────────────────────────────────
const budgetColumns: TableColumn[] = [
  { key: "item", label: "COST ITEM" },
  {
    key: "range",
    label: "PLANNING RANGE",
    headerClassName: "text-right whitespace-nowrap",
    cellClassName: "text-right whitespace-nowrap",
  },
  { key: "note", label: "WHAT TO KNOW" },
];

const budgetRows: TableRow[] = [
  {
    item: "Seller account registration",
    range: { type: "chip", label: "₹0", className: greenChip },
    note: "No joining fee",
  },
  {
    item: "GST registration",
    range: { type: "chip", label: "₹0", className: greenChip },
    note: "No government fee. A consultant is optional",
  },
  {
    item: "First inventory batch",
    range: "₹30,000 to ₹80,000",
    note: "Depends on unit cost and order size",
  },
  {
    item: "Launch advertising",
    range: "₹10,000 to ₹20,000",
    note: "Needed to gather first keyword data",
  },
  {
    rowClassName: totalRow,
    item: "Small start, total",
    range: "₹10,000 to ₹1 lakh or more",
    note: "Lean products, one SKU",
  },
  {
    rowClassName: totalRow,
    item: "FBA launch, total",
    range: "₹50,000 to ₹1.5 lakh",
    note: "Includes photos, fees, and ads",
  },
];

// ── Per-order Fee Cards (s4) ───────────────────────────────────────────────────
const orderFeeCards = [
  {
    title: "Referral fee",
    description:
      "A percentage of the selling price, set by category. It starts at 0%. Mobile phones are 5%, laptops 6%, and fashion jewellery above ₹1,000 is 22.5%.",
  },
  {
    title: "Closing fee",
    description:
      "A fixed fee per item, based on price band and fulfilment channel. It starts at ₹2 and rose from September 7, 2026.",
  },
  {
    title: "Weight handling fee (shipping)",
    description:
      "Starts at ₹37 per item shipped and varies by weight, distance, and volume. Amazon uses the higher of actual and volumetric weight, with a 500 g minimum for standard items. Self Ship sellers pay their own courier instead.",
  },
  {
    title: "FBA extras",
    description:
      "Pick and pack is ₹17 per unit up to 1 kg, and storage is ₹50 per cubic foot per month. Removing stock costs ₹10 per unit for standard shipping and ₹30 for expedited.",
  },
  {
    title: "GST on fees",
    description:
      "Amazon adds 18% GST on every fee above. If you are GST registered, you can usually claim it back as input tax credit.",
  },
];

// ── 2026 Fee Change Cards (s6) ─────────────────────────────────────────────────
const feeChangeCards = [
  {
    title: "Closing fee increase from September 7",
    description:
      "Closing fees rose by ₹1 on products priced up to ₹500 and by ₹3 above that. The change applies to the Fulfilment Centre, Easy Ship, and Seller Flex channels, and Amazon cited higher fuel and logistics costs.",
  },
  {
    title: "Cancellation fee tied to order value from August 17",
    description:
      "For Easy Ship and Self Ship orders, the fee is now a percentage of order value: 10% below ₹10,000, 8% from ₹10,001 to ₹50,000, 5% up to ₹1 lakh, and 2% above. GST of 18% is added.",
  },
];

// ── Worked Example (s7) ────────────────────────────────────────────────────────
const feeChartData = [
  { label: "Referral fee (6.5%)", amount: "₹64.94", width: "78%" },
  { label: "Weight handling", amount: "₹54.00", width: "65%" },
  { label: "Closing fee", amount: "₹30.00", width: "36%" },
  { label: "GST on fees (18%)", amount: "₹29.87", width: "36%" },
  { label: "Pick and pack", amount: "₹17.00", width: "20%" },
];

const exampleColumns: TableColumn[] = [
  { key: "item", label: "LINE ITEM" },
  {
    key: "amount",
    label: "AMOUNT",
    headerClassName: "text-right",
    cellClassName: "text-right whitespace-nowrap",
  },
];

const exampleRows: TableRow[] = [
  { item: "Selling price", amount: "₹999.00" },
  { item: "Referral fee at 6.5%", amount: "₹64.94" },
  { item: "Closing fee, FBA, ₹501 to ₹1,000", amount: "₹30.00" },
  { item: "Weight handling, regional", amount: "₹54.00" },
  { item: "Pick and pack", amount: "₹17.00" },
  { item: "Subtotal before GST", amount: "₹165.94" },
  { item: "GST at 18%", amount: "₹29.87" },
  { rowClassName: totalRow, item: "Total Amazon fees", amount: "₹195.81" },
  {
    rowClassName: totalRow,
    item: "Left before product cost",
    amount: "₹803.19",
  },
];

// ── Hidden Cost Cards (s8) ─────────────────────────────────────────────────────
const hiddenCostCards = [
  {
    title: "Advertising",
    description:
      "Sponsored Products is pay per click and sits outside the fee schedule. For many sellers it becomes the largest cost after the product itself, and one calculator puts typical ACOS at 15% to 30% in competitive categories.",
  },
  {
    title: "Returns and refunds",
    description:
      "A refund fee exists, and ad spend is not returned when a sale is reversed. Amazon's STEP programme offers a refund fee waiver of up to ₹10 at the standard level, which shows the fee is real.",
  },
  {
    title: "Packaging and inbound freight",
    description:
      "Boxes, tape, labels, and transport to a fulfilment centre are yours to pay. Slim packaging also lowers volumetric weight, which cuts the shipping fee.",
  },
  {
    title: "Long term storage and removals",
    description:
      "Slow stock in a fulfilment centre attracts long term storage charges and removal fees. Order smaller batches until a product proves itself.",
  },
  {
    title: "Cancellation fees",
    description:
      "Missed ship confirmations and seller side cancellations now cost up to 10% of the order value on Easy Ship and Self Ship orders.",
  },
];

// ── Stage Cards (s9) ───────────────────────────────────────────────────────────
const stageCards: InsightCard[] = [
  {
    icon: "🔍",
    iconBg: "rgba(16, 185, 129, 0.15)",
    iconColor: "#10B981",
    title: "Just exploring",
    minHeight: 220,
    description:
      "Register for free and list one product on Self Ship or Easy Ship. Keep stock small and use the Insydz free plan to check demand, competition, and margin before you buy.",
  },
  {
    icon: "📦",
    iconBg: "rgba(37, 99, 235, 0.15)",
    iconColor: "#2563EB",
    title: "First product live",
    minHeight: 220,
    description:
      "Budget for one inventory order, launch ads of ₹10,000 to ₹20,000, and a cash buffer until the first 7 day payout. Track margin per unit after GST, not just the settlement amount.",
  },
  {
    icon: "🚀",
    iconBg: "rgba(139, 92, 246, 0.15)",
    iconColor: "#8B5CF6",
    title: "FBA launch",
    minHeight: 220,
    description:
      "Plan ₹50,000 to ₹1.5 lakh in total. Amazon lets you try FBA at no additional cost for the first 3 months or 100 units, so start with your fastest moving product.",
  },
  {
    icon: "🛒",
    iconBg: "rgba(245, 158, 11, 0.15)",
    iconColor: "#F59E0B",
    title: "Selling on Amazon and Flipkart",
    minHeight: 220,
    description:
      "Cost per platform differs, so track margins separately. Insydz covers both marketplaces from one Seller Central connection, with INR pricing and GST aware margins.",
  },
];

// ── Cost-Saving Checklist (s10) ────────────────────────────────────────────────
const savingTips = [
  {
    title: "Use the zero referral band",
    description:
      "Price inside the zero referral band where your margin allows, and confirm your fee category first.",
  },
  {
    title: "Trim your packaging",
    description:
      "Trim packaging to reduce volumetric weight and drop into a lower shipping slab.",
  },
  {
    title: "Confirm shipments fast",
    description:
      "Confirm every shipment within 24 hours to avoid cancellation fees.",
  },
  {
    title: "Claim your credits",
    description:
      "Claim input tax credit on Amazon's fees and reconcile TCS every month.",
  },
  {
    title: "Test one product first",
    description:
      "Test one product before scaling. Compare landed cost, fees, and ad cost before you commit to stock.",
  },
];

// ── FAQs (s11) ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "How much does it cost to start selling on Amazon India in 2026?",
    a: "Registering is free, so your real cost is the first inventory order, packaging, and ads. Published guides suggest roughly ₹10,000 to ₹1 lakh for a small start and ₹50,000 to ₹1.5 lakh for an FBA launch. Amazon's fees apply only after a sale, with 18% GST added on top.",
  },
  {
    q: "Is Amazon seller registration free in India?",
    a: "Yes. Creating a seller account has no joining fee, and Amazon's public fees page lists no monthly subscription for standard accounts. You pay only when you sell, through referral, closing, and shipping fees plus GST. Plan details can change, so confirm them on the Seller Central signup screen before you pay anything.",
  },
  {
    q: "Do I need GST to sell on Amazon India?",
    a: "Yes, for most sellers. GST registration is required to sell taxable goods on Amazon India, and applying on the government portal is free. Sellers of only GST exempt goods, such as printed books, may register with PAN instead. Check your product's exemption status carefully before choosing that route.",
  },
  {
    q: "What is Amazon's referral fee in India in 2026?",
    a: "Referral fees depend on category and price. In many categories the fee is 0% for items priced up to ₹1,000, and above that it runs from about 2% to over 25% depending on the category. Mobile phones are 5% and laptops 6%. Confirm your exact fee category in Amazon's fee table before setting a price.",
  },
  {
    q: "How much will Amazon charge on a ₹999 product?",
    a: "For a ₹999 pet food product sold through FBA, the fees in our example come to ₹195.81 including GST. That covers a 6.5% referral fee, closing fee, weight handling, and pick and pack. It excludes product cost, packaging, ads, and returns, so your true margin will be lower.",
  },
  {
    q: "Is TCS an extra cost for Amazon sellers?",
    a: "No. Amazon collects 1% TCS on your net taxable sales under Section 52 of the CGST Act and deposits it against your GSTIN. It reduces your payout for now, but you claim it back as credit when filing GST returns. Track it separately from fees so your margin numbers stay accurate.",
  },
];

// ── Related Reading Links ──────────────────────────────────────────────────────
const relatedReadingLinks = [
  {
    text: "What Are the Best Amazon Seller Tools for Indian Sellers in 2026?",
    href: "/resources/expert-blog/best-amazon-seller-tools-india-2026",
  },
  {
    text: "Insydz vs Helium 10: Which Tool Fits Indian Sellers Better?",
    href: "/compare/insydz-vs-helium-10",
  },
  {
    text: "Amazon India Repricing Strategy 2026: Set Rules, Floors, and Hold Buy Box",
    href: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
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

// ── Related Articles ───────────────────────────────────────────────────────────
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

export default function CostToStartSellingOnAmazonIndia2026Content() {
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
        .toc-link:hover{color:#F97316;background:#FFF7ED;border-left-color:#FDBA74}
        .toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9CA3AF}
        .dark .toc-link:hover{background:rgba(249,115,22,.1);color:#FB923C;border-left-color:rgba(249,115,22,.4)}
        .dark .toc-link.active{background:rgba(249,115,22,.15);color:#FB923C;border-left-color:#F97316}

        #s1,#s2,#s3,#s4,#s5,#s6,#s7,#s8,#s9,#s10,#s11,#s12{scroll-margin-top:120px}

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
          { label: "Cost to Start Selling on Amazon India 2026" },
        ]}
      />

      {/* HERO SECTION */}
      <HeroSection
        resolvedTheme={resolvedTheme}
        badgeText="Seller Guide & Strategy · Cost Breakdown · India 2026"
        title={
          <>
            How Much Does It Cost to Start Selling on{" "}
            <span style={{ color: "#D97706" }}>Amazon India in 2026?</span>
          </>
        }
        description={
          <>
            Every cost a new Amazon India seller should plan for, from
            registration and GST to referral fees, closing fees, and ads, with a
            worked example on a ₹999 product and the costs most sellers miss.
          </>
        }
        authorName="Vikrant Singh"
        authorUrl="/author/vikrant-singh"
        publishDate="September 2026"
        readTime="7 min read"
        bgColor={{
          light: "#FFFBEB",
          dark: "#1C1917",
        }}
        highlightColor="#D97706"
      />

      <div style={{ maxWidth: 1240, margin: "16px auto", padding: "0 16px" }}>
        {/* Custom Graphic Banner */}
        <BlogImageSection
          imageSrc="/images/blogs/cost-to-start-selling-on-amazon-india-2026/cost-to-start-selling-on-amazon-india-2026.png"
          altText="Cost snapshot for Indian sellers starting on Amazon India in 2026"
          caption="Insydz cost summary for 2026. Fee data checked against the Amazon.in Fees and Pricing page on September 29, 2026."
        />

        {/* Quick Answer Banner */}
        <div className="mt-8">
          <InfoBanner
            accentColor="#D97706"
            backgroundColor="#FFFBEB"
            title="⚡ QUICK ANSWER"
            content="Starting on Amazon India costs nothing to register, and a realistic first budget is roughly ₹10,000 to ₹1.5 lakh, most of it going to stock and ads rather than Amazon. Once you sell, Amazon charges a referral fee, a closing fee, a shipping or weight handling fee, and 18% GST on those fees. Since March 2026, many categories carry a 0% referral fee on items up to ₹1,000, which is the biggest saving for new sellers."
          />
        </div>

        {/* Key Takeaways Box */}
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 12px 0" }}
        >
          <div id="s1">
            <KeyTakeawaysBox
              title="Key Takeaways"
              items={keyTakeaways}
              accentColor="#D97706"
              backgroundColor="#1C1917"
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
              Search how much does it cost to sell on Amazon India and most
              answers stop at a list of fees. A new seller needs something more
              useful: a total for the first month, and a way to check whether a
              product still earns money after fees. This guide gives both, in
              rupees, with the September 2026 changes included.
            </p>

            {/* s2 — Budget */}
            <div id="s2">
              <SectionQA
                title="How Much Money Do You Need to Start Selling on Amazon India?"
                paragraph1="The account costs nothing, so the money goes into stock, packaging, photos, and ads. Published seller guides put a small start at roughly ₹10,000 to ₹1 lakh, and a properly funded FBA launch at ₹50,000 to ₹1.5 lakh."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <DataTable columns={budgetColumns} rows={budgetRows} />

            <p>
              These are planning ranges from third party seller guides, not
              Amazon figures. Your category and product cost decide where you
              land. A safe method is to fix your first inventory order, then add
              an ad budget and a buffer for the first payout.
            </p>
            <p>
              Amazon pays sellers 7 days after delivery on the standard level,
              so your cash returns quickly once orders flow.
            </p>

            {/* s3 — Registration */}
            <div id="s3">
              <SectionQA
                title="What Does It Cost to Register as an Amazon India Seller?"
                paragraph1="Creating the account is free. You need a PAN, a GSTIN unless you sell only exempt goods, a bank account, an email ID, a mobile number, and a pickup address that matches your GST state."
                paragraph2="GST registration is mandatory for most sellers of taxable goods, and the government portal charges nothing. Sellers who deal only in GST exempt goods, such as printed books, can register with PAN details instead."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#D97706"
              backgroundColor="#FFFBEB"
              title="💡 Check Before You Pay"
              content="Amazon's public fees page lists no monthly subscription, and several 2026 guides say new accounts pay none. Plan details can change, so confirm them on the Seller Central signup screen before you pay anything."
            />

            {/* s4 — Fees on every order */}
            <div id="s4">
              <SectionQA
                title="What Fees Does Amazon Charge on Every Order?"
                paragraph1="Every sale carries up to five cost lines. The first three apply to almost all orders, and the last two depend on how you ship."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={orderFeeCards}
              numberColor="#D97706"
              backgroundColor="#FFFBEB"
              borderColor="#FDE68A"
              variant="number"
            />

            {/* s5 — Zero referral */}
            <div id="s5">
              <SectionQA
                title="Is the Referral Fee Really Zero for Products Under ₹1,000?"
                paragraph1="For many categories, yes. Amazon highlights zero referral fees on over 12.5 crore products, and third party reports say the limit rose to ₹1,000 across more than 1,800 categories from March 16, 2026."
                paragraph2="It does not apply everywhere. Amazon's own fee table shows flat rates for mobile phones, laptops, and televisions, and slab rates for books. Always check your exact fee category, not the aisle where the product appears."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <InfoBanner
              accentColor="#16A34A"
              backgroundColor="#F0FDF4"
              title="⚡ The Defining Difference"
              content="Zero referral does not mean zero fees. Closing fee, shipping, FBA charges, and GST on those fees still apply to every order."
            />

            {/* s6 — 2026 changes */}
            <div id="s6">
              <SectionQA
                title="What Changed in August and September 2026?"
                paragraph1="Two updates matter for anyone building a budget this month. Both raise the cost of small mistakes."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={feeChangeCards}
              numberColor="#D97706"
              backgroundColor="#FFFBEB"
              borderColor="#FDE68A"
              variant="number"
            />

            <p>
              The practical lesson is simple. Keep stock counts accurate and
              confirm shipments inside the 24 hour window, because a seller side
              cancellation now costs real money.
            </p>

            {/* s7 — Worked example */}
            <div id="s7">
              <SectionQA
                title="What Does a ₹999 Product Really Cost to Sell?"
                paragraph1="Take a pet food product priced at ₹999 and sold through FBA, weighing 500 g to 1 kg, shipped within the same region. The referral rate for this category above ₹300 is 6.5%."
                resolvedTheme={resolvedTheme}
              />
            </div>

            {/* Fee share chart */}
            <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6 shadow-sm space-y-4 my-6">
              <div className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span>💰</span> Amazon Fees as a Share of a ₹999 Selling Price
              </div>

              <div className="space-y-3">
                {feeChartData.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-1 border-b border-amber-200/60 dark:border-amber-900/40 last:border-0"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 w-32 sm:w-44 shrink-0">
                      {row.label}
                    </span>
                    <div className="flex-1 mx-3 sm:mx-4 bg-amber-100 dark:bg-amber-900/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 dark:bg-amber-400 h-2.5 rounded-full"
                        style={{ width: row.width }}
                      ></div>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 w-16 sm:w-20 text-right">
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                Illustrative example. Fees total ₹195.81, or about 19.6% of the
                price, before product cost, packaging, ads, and returns.
              </p>
            </div>

            <DataTable columns={exampleColumns} rows={exampleRows} />

            <p>
              If the same price belonged to a zero referral category, the
              referral line drops to ₹0 and the fees fall by about ₹76 including
              GST. The other lines stay. Confirm the closing fee and weight
              handling amounts for your product in Amazon's current fee table,
              because slabs differ by category and channel.
            </p>
            <p>
              One more line appears in your payout. Amazon collects 1% TCS on
              net taxable sales, but that is a tax you claim back as credit, so
              it is not a fee.
            </p>

            {/* s8 — Hidden costs */}
            <div id="s8">
              <SectionQA
                title="Which Costs Do New Sellers Usually Miss?"
                paragraph1="The fee page shows Amazon's charges. It does not show what growth and mistakes cost you."
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={hiddenCostCards}
              numberColor="#D97706"
              backgroundColor="#FFFBEB"
              borderColor="#FDE68A"
              variant="number"
            />

            {/* s9 — Budget by stage */}
            <div id="s9">
              <SectionQA
                title="How Should You Plan Your Budget Based on Your Stage?"
                paragraph1="The cost of starting depends less on Amazon and more on how much stock and advertising you commit to first."
                resolvedTheme={resolvedTheme}
              />
              <InsightCards cards={stageCards} columns={2} />
            </div>

            {/* s10 — Keeping costs low */}
            <div id="s10">
              <SectionQA
                title="How Can You Keep Amazon Selling Costs Low?"
                resolvedTheme={resolvedTheme}
              />
            </div>

            <NumberedCards
              items={savingTips}
              numberColor="#16A34A"
              backgroundColor="#F0FDF4"
              borderColor="#BBF7D0"
              variant="icon"
              icon="✓"
            />

            <InlineNote
              resolvedTheme={resolvedTheme}
              accentColor="#D97706"
              parts={[
                {
                  text: "Not sure which tool to use for that comparison? See the ",
                },
                {
                  text: "Amazon seller tools guide",
                  href: "/resources/expert-blog/best-amazon-seller-tools-india-2026",
                },
                { text: "." },
              ]}
            />

            {/* s11 — FAQ */}
            <div id="s11">
              <SectionQA
                title="Frequently Asked Questions"
                resolvedTheme={resolvedTheme}
              />
              <FAQ faqs={faqs} accentColor="#D97706" />
            </div>

            {/* s12 — Summary */}
            <div id="s12">
              <SectionQA
                title="Summary: What It Costs to Start on Amazon India in 2026"
                paragraph1="Amazon India costs nothing to join, so your real starting cost is inventory, packaging, and ads. A small start can sit near ₹10,000 to ₹1 lakh, and an FBA launch near ₹50,000 to ₹1.5 lakh. On every sale, plan for a referral fee, closing fee, shipping or FBA charges, and 18% GST."
                paragraph2="The 2026 changes reward careful sellers. Zero referral fees help products up to ₹1,000, while the higher closing fee and order value cancellation fee punish sloppy operations. Insydz gives you INR pricing, GST aware margins, and a free plan to test your numbers on your own ASINs before you spend on stock."
                resolvedTheme={resolvedTheme}
              />

              <RelatedReadingBox
                label="📌 Related Reading on Insydz"
                links={relatedReadingLinks}
                accentColor="#D97706"
                backgroundColor="#FFFBEB"
                resolvedTheme={resolvedTheme}
              />

              <InlineNote
                resolvedTheme={resolvedTheme}
                fontSize={13}
                margin="24px 0 0"
                parts={[
                  {
                    text: "Sources: Amazon.in Fees and Pricing page (checked September 29, 2026), Business Standard on the September 2026 fee changes, and 2026 seller guides from GoNukkad, RegisterKaro, IIDT Escala, and Blooprint for budget ranges and the worked example. Fees change often, so confirm current rates in Seller Central before pricing.",
                  },
                ]}
              />

              <RelatedArticles
                title="More Seller Tools and Strategy"
                cards={relatedArticlesCards}
                resolvedTheme={resolvedTheme}
              />
            </div>
          </article>
        </main>
      </div>

      {/* Bottom Final CTA */}
      <FinalCTA
        title="Know Your Real Margin Before You Order Stock."
        description="Insydz is a seller analytics platform built for Amazon India and Flipkart, with INR pricing, GST aware margins, WhatsApp alerts, and a free plan."
        primaryButtonText="Start Free on Insydz →"
        primaryButtonHref="/login"
        primaryColor="#D97706"
        secondaryColor="#B45309"
      />
    </div>
  );
}
