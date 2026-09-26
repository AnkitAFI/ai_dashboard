"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomBookDemoModal } from "@/components/ui/custom-book-demo-modal";
import {
  X,
  Zap,
  Check,
  Crown,
  Building2,
  Trophy,
  Target,
  DollarSign,
  Globe,
  BookOpen,
  Video,
  FileText,
  Users,
  Presentation,
  Star,
  ArrowRight,
  ShieldCheck,
  Link2,
  BarChart3,
  TrendingUp,
  Search,
  Megaphone,
  Tag,
  FileCheck2,
  Bell,
  Sparkles,
} from "lucide-react";

const FONT_STACK =
  "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif";

const heroBadges = [
  {
    icon: Megaphone,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-700 dark:text-violet-300",
    title: "Ad automation",
    subtitle: "ACoS down 3.2 pts",
    subtitleColor: "text-[#15803d] dark:text-green-400",
    rotate: -3,
  },
  {
    icon: Search,
    iconBg: "bg-[#e3edff] dark:bg-blue-900/40",
    iconColor: "text-[#1e40af] dark:text-blue-400",
    title: "Keyword research",
    subtitle: "1,240 keywords found",
    rotate: 2,
  },
  {
    icon: Users,
    title: "Competitor analysis",
    subtitle: "12 sellers tracked",
    dark: true,
    rotate: -3,
  },
  {
    icon: Tag,
    iconBg: "bg-[#dcfce7] dark:bg-green-900/40",
    iconColor: "text-[#166534] dark:text-green-400",
    title: "Price optimization",
    subtitle: "Suggested price ₹549",
    rotate: 3,
  },
  {
    icon: FileCheck2,
    iconBg: "bg-[#fce7f3] dark:bg-pink-900/40",
    iconColor: "text-[#9d174d] dark:text-pink-400",
    title: "Listing optimization",
    subtitle: "Listing score 92/100",
    rotate: -2,
  },
  {
    icon: Bell,
    iconBg: "bg-[#ffedd5] dark:bg-orange-900/40",
    iconColor: "text-[#9a3412] dark:text-orange-400",
    title: "Smart alerts",
    subtitle: "On WhatsApp, 24/7",
    rotate: 3,
  },
];

const testimonials = [
  {
    logo: "🛒",
    logoColor: "text-orange-600 dark:text-orange-400",
    logoBg: "bg-orange-50 dark:bg-orange-900/20",
    rating: "4.9",
    text: "Insydz helped me identify which products were quietly losing margin. Within two weeks I restructured my pricing and saw a 22% improvement in net profit. I didn't need to guess anymore — the data was right there.",
    author: "Rahul Gupta",
    handle: "Electronics · 3 yrs on Amazon",
    role: "Amazon Seller · Delhi",
    badge: "Amazon India",
  },
  {
    logo: "🏷️",
    logoColor: "text-pink-600 dark:text-pink-400",
    logoBg: "bg-pink-50 dark:bg-pink-900/20",
    rating: "5.0",
    text: "Competitor tracking on Insydz is a game changer. I used to spend hours manually checking prices — now it's all there every morning. Big Billion Days prep was so much smoother this year because of the alerts.",
    author: "Priya Sharma",
    handle: "Fashion & Apparel · 5 yrs on Flipkart",
    role: "Flipkart Seller · Mumbai",
    badge: "Flipkart",
  },
  {
    logo: "📊",
    logoColor: "text-blue-600 dark:text-blue-400",
    logoBg: "bg-blue-50 dark:bg-blue-900/20",
    rating: "4.8",
    text: "Managing 4 brands across Amazon and Flipkart was a nightmare before Insydz. Now I have one dashboard and my clients get reports they can actually act on. It has genuinely changed how I run my agency.",
    author: "Aarav Kumar",
    handle: "Multi-brand Agency · Bengaluru",
    role: "Brand Manager · Bengaluru",
    badge: "Amazon + Flipkart",
  },
  {
    logo: "🔍",
    logoColor: "text-violet-600 dark:text-violet-400",
    logoBg: "bg-violet-50 dark:bg-violet-900/20",
    rating: "4.7",
    text: "The AI keyword suggestions took my listings from page 4 to page 1 within a month. I was skeptical at first but the data doesn't lie — my organic sales doubled and my ad spend dropped 30%.",
    author: "Sneha Mehta",
    handle: "Home & Kitchen · 2 yrs on Amazon",
    role: "Amazon Seller · Pune",
    badge: "Amazon India",
  },
  {
    logo: "🏆",
    logoColor: "text-amber-600 dark:text-amber-400",
    logoBg: "bg-amber-50 dark:bg-amber-900/20",
    rating: "4.9",
    text: "Finally a tool built for Indian marketplaces, not just adapted from western tools. The Flipkart-specific insights are accurate and the support team actually understands our local market challenges.",
    author: "Vikram Reddy",
    handle: "Sports & Fitness · 4 yrs on Flipkart",
    role: "Flipkart Seller · Hyderabad",
    badge: "Flipkart",
  },
  {
    logo: "🚀",
    logoColor: "text-pink-600 dark:text-pink-400",
    logoBg: "bg-pink-50 dark:bg-pink-900/20",
    rating: "4.8",
    text: "We onboarded 12 new clients after showing them Insydz reports during pitches. The data precision and India-specific market intelligence gives us an edge no other tool provides. Our clients love the dashboards.",
    author: "Nidhi Joshi",
    handle: "E-commerce Agency · 12 clients",
    role: "E-commerce Agency · Ahmedabad",
    badge: "Amazon + Flipkart",
  },
];

const featureTabs = [
  {
    key: "ads",
    label: "Ad Automation",
    href: "/solutions/amazon-advertising",
    icon: Megaphone,
    heading: "Stop babysitting bids — let automation cut wasted spend",
    description:
      "Rules-based and AI bidding adjusts your campaigns every day, so ACoS comes down without you staring at a dashboard.",
    bullets: [
      "Automated bid adjustments by SKU",
      "Dayparting for peak conversion hours",
      "Wasted spend alerts before they add up",
    ],
    tools: ["Bid automation", "Campaign rules", "Spend alerts"],
    stats: [
      { label: "ACoS", value: "18.4%", change: "-3.2 pts" },
      { label: "Ad spend", value: "₹42,300", change: "-11%" },
      { label: "ROAS", value: "4.6x", change: "+0.8x" },
    ],
    tip: "Pause \"yoga mat cheap\" — CPC is up 40% with no conversions this week.",
  },
  {
    key: "keywords",
    label: "Keyword Research",
    href: "/features/keyword-rank-tracking-feature",
    icon: Search,
    heading: "Find the keywords your buyers actually search",
    description:
      "See search volume, track your rank every day and spot the terms your competitors win that you are missing.",
    bullets: [
      "Daily rank tracking on Amazon India and Flipkart",
      "Share of Voice for your category",
      "AI keyword suggestions for your listings",
    ],
    tools: ["Keyword research", "Rank tracking", "Share of Voice"],
    table: [
      { keyword: "cotton kurti for women", searches: "48,200", rank: "#4", change: "Up 7", trend: "up" },
      { keyword: "steel water bottle 1l", searches: "31,900", rank: "#2", change: "Up 3", trend: "up" },
      { keyword: "yoga mat anti slip", searches: "22,400", rank: "#11", change: "Down 5", trend: "down" },
      { keyword: "bedsheet double bed", searches: "19,700", rank: "#6", change: "Same", trend: "flat" },
      { keyword: "lunch box for office", searches: "14,300", rank: "#9", change: "Up 2", trend: "up" },
    ],
    tip: "Add \"anti slip yoga mat 6mm\" to your title to recover lost rank.",
  },
  {
    key: "competitor",
    label: "Competitor Analysis",
    href: "/features/competitor-price-tracking-feature",
    icon: Users,
    heading: "Know what competitors do before your customers do",
    description:
      "Track prices, stock and reviews on the sellers you compete with, on both Amazon and Flipkart.",
    bullets: [
      "Daily competitor price tracking",
      "Stock-out and new listing alerts",
      "Review and rating trend tracking",
    ],
    tools: ["Price tracking", "Stock alerts", "Review trends"],
    stats: [
      { label: "Sellers tracked", value: "12", change: "+2 this month" },
      { label: "Price undercuts", value: "3", change: "this week" },
      { label: "New listings", value: "5", change: "in your category" },
    ],
    tip: "3 competitors dropped price on \"steel water bottle 1l\" this week.",
  },
  {
    key: "price",
    label: "Price Optimization",
    href: "/features/price-optimization-feature",
    icon: Tag,
    heading: "Price to win the Buy Box without giving away margin",
    description:
      "AI suggested prices balance Buy Box share against your target margin, updated as the market moves.",
    bullets: [
      "AI price suggestions by product",
      "Buy Box win-rate tracking",
      "Margin guardrails you control",
    ],
    tools: ["Price suggestions", "Buy Box tracking", "Margin rules"],
    stats: [
      { label: "Suggested price", value: "₹549", change: "vs ₹579 now" },
      { label: "Buy Box share", value: "92%", change: "+4 pts" },
      { label: "Margin", value: "24%", change: "protected" },
    ],
    tip: "Suggested price ₹549 keeps Buy Box share above 90%.",
  },
  {
    key: "listing",
    label: "Listing Optimization",
    href: "/features/product-research-feature",
    icon: FileCheck2,
    heading: "Turn listings into your best converting asset",
    description:
      "Score every listing against what's ranking, and get specific fixes for title, bullets and images.",
    bullets: [
      "Listing health score out of 100",
      "Title and bullet point suggestions",
      "A+ content recommendations",
    ],
    tools: ["Listing score", "Content suggestions", "A+ content"],
    stats: [
      { label: "Listing score", value: "92/100", change: "+6 pts" },
      { label: "Titles flagged", value: "2", change: "need fixes" },
      { label: "A+ content", value: "Live", change: "on 18 SKUs" },
    ],
    tip: "Add 2 more lifestyle images to lift conversion by an estimated 6%.",
  },
  {
    key: "alerts",
    label: "Smart Alerts",
    href: "/features/whatsapp-alerts-feature",
    icon: Bell,
    heading: "Know the moment something needs your attention",
    description:
      "Price drops, Buy Box losses and rank changes land straight on WhatsApp, 24/7.",
    bullets: [
      "Real-time WhatsApp notifications",
      "Buy Box loss alerts",
      "Price and rank change alerts",
    ],
    tools: ["WhatsApp alerts", "Buy Box alerts", "Rank alerts"],
    stats: [
      { label: "Alerts today", value: "5", change: "3 need action" },
      { label: "Buy Box losses", value: "1", change: "12 min ago" },
      { label: "Response time", value: "24/7", change: "on WhatsApp" },
    ],
    tip: "You lost the Buy Box on \"cotton kurti for women\" 12 minutes ago.",
  },
];

const faqs = [
  {
    q: "Is Insydz really free to start?",
    a: "Yes. The Free plan costs ₹0 a month and includes basic dashboard access, tracking for up to 25 products and weekly reports. No credit card is needed to sign up.",
  },
  {
    q: "Does Insydz work for Flipkart sellers?",
    a: "Yes. You can view Flipkart data and insights right next to your Amazon account, in the same dashboard.",
  },
  {
    q: "Is my Amazon seller data safe?",
    a: "Insydz follows Amazon's Acceptable Use Policy. Market insights come from public marketplace data, and we never share, pool or sell private seller data.",
  },
  {
    q: "What can I do with Insydz?",
    a: "Automate ads, research keywords, track competitors, get price suggestions, improve listings and receive smart alerts, all from one place.",
  },
  {
    q: "Can I use Insydz for my agency clients?",
    a: "Yes. Agencies manage multiple clients in one view and share client-ready reports. The Enterprise plan adds white label options.",
  },
  {
    q: "Can I cancel or change my plan anytime?",
    a: "Yes. You can upgrade, downgrade or cancel whenever you like.",
  },
];

function FloatingBadge({
  icon: Icon,
  title,
  subtitle,
  iconBg = "bg-violet-100 dark:bg-violet-900/40",
  iconColor = "text-violet-700 dark:text-violet-300",
  subtitleColor = "text-[#5f5875] dark:text-gray-400",
  dark = false,
  rotate = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconBg?: string;
  iconColor?: string;
  subtitleColor?: string;
  dark?: boolean;
  rotate?: number;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 shadow-[0_18px_36px_rgba(40,20,90,0.12)] ${dark ? "bg-[#1a1033]" : "bg-white dark:bg-gray-950"
        }`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${dark ? "bg-white dark:bg-gray-950/10" : iconBg
          }`}
      >
        <Icon className={`h-5 w-5 ${dark ? "text-violet-300" : iconColor}`} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={`text-[15px] font-extrabold ${dark ? "text-white" : "text-[#1a1033] dark:text-gray-50"}`}>
          {title}
        </span>
        <span className={`text-xs font-semibold ${dark ? "text-[#c9c2dd]" : subtitleColor}`}>
          {subtitle}
        </span>
      </span>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[13px] font-extrabold tracking-[0.1em] text-violet-600 dark:text-violet-400">
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-8 py-4 text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(124,58,237,0.38)] ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#d9cff0] dark:border-gray-700 bg-white dark:bg-gray-950 px-7 py-[15px] text-[15px] font-bold text-[#1a1033] dark:text-gray-50 transition-colors hover:bg-[#faf8fe] dark:bg-gray-900 ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export default function LandingContent() {
  const router = useRouter();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState(featureTabs[0].key);
  const activeTab = featureTabs.find((t) => t.key === activeFeatureTab) ?? featureTabs[0];

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handlePlanSelect = (planId: string) => {
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-950 text-[#1a1033] dark:text-gray-50 overflow-x-clip"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Hero Section */}
      <section
        id="Home"
        className="relative overflow-hidden bg-[#fcfaff] dark:bg-gray-900 pt-28 pb-16 lg:pt-32 lg:pb-20 scroll-mt-20"
      >
        {/* Decorative concentric circles */}
        <div className="pointer-events-none absolute left-1/2 top-[420px] hidden -translate-x-1/2 lg:block">
          <div className="h-[560px] w-[560px] rounded-full border border-[#ece4fb] dark:border-gray-800" />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[470px] hidden -translate-x-[46%] lg:block">
          <div className="h-[380px] w-[380px] rounded-full border border-[#e4d8fa] dark:border-gray-800 bg-[#f6f1ff] dark:bg-gray-800/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <Link
              href="/login"
              className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#e4dcf5] dark:border-gray-800 bg-white dark:bg-gray-950 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-[#3b3552] dark:text-gray-300 shadow-[0_4px_14px_rgba(76,29,149,0.06)] sm:gap-3 sm:text-sm"
            >
              <span className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-2.5 py-1 text-[11px] font-extrabold text-violet-700 dark:text-violet-300">
                ALL IN ONE
              </span>
              <span>Run your Amazon & Flipkart business from one place</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1a1033] dark:text-gray-50 sm:text-5xl lg:text-[56px]">
              One platform to{" "}
              <span className="relative inline-block">
                grow faster
                <svg
                  className="pointer-events-none absolute left-0 -bottom-2 w-full"
                  height="10"
                  viewBox="0 0 400 18"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 12 C 90 2, 220 2, 396 10"
                    fill="none"
                    stroke="#db2777"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              on{" "}
              <span className="inline-block -rotate-2 rounded-2xl bg-[#fff1e0] dark:bg-orange-900/40 px-3 py-1 text-[#9a3412] dark:text-orange-400">
                Amazon
              </span>{" "}
              and{" "}
              <span className="inline-block rotate-2 rounded-2xl bg-[#e3edff] dark:bg-blue-900/40 px-3 py-1 text-[#1e40af] dark:text-blue-400">
                Flipkart
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Ad automation, keyword research, competitor analysis, price and listing
              optimization. Every everyday selling task, in one simple dashboard.
            </p>

            <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row">
              <PrimaryButton href="/signup">
                Start free
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <Link
                href="/login"
                className="text-[15px] font-bold text-[#1a1033] dark:text-gray-50 underline decoration-[#d9cff0] decoration-2 underline-offset-4 sm:hidden"
              >
                Log in
              </Link>
            </div>

            <p className="text-sm font-semibold text-[#4b4560] dark:text-gray-300">
              ⚡ Get instant WhatsApp alerts for price drops, Buy Box losses &amp; keyword rank changes
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-center text-sm font-semibold text-[#5f5875] dark:text-gray-400">
              <span className="flex items-center gap-2">
                <span className="flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-violet-100 dark:bg-violet-900/40 text-[10px] font-extrabold text-violet-700 dark:text-violet-300">
                    RK
                  </span>
                  <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-pink-100 dark:bg-pink-900/40 text-[10px] font-extrabold text-pink-700 dark:text-pink-300">
                    AS
                  </span>
                  <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-green-100 dark:bg-green-900/40 text-[10px] font-extrabold text-green-700 dark:text-green-300">
                    PM
                  </span>
                </span>
                <span>
                  <strong className="text-[#1a1033] dark:text-gray-50">5,000+</strong> sellers
                </span>
              </span>
              <span className="h-1 w-1 rounded-full bg-[#c9c2dd]" />
              <span>
                <strong className="text-[#1a1033] dark:text-gray-50">2.5L+</strong> reviews analysed
              </span>
              <span className="h-1 w-1 rounded-full bg-[#c9c2dd]" />
              <span>Free plan, no credit card needed</span>
            </div>
          </div>

          {/* Compact Overview visual for phones (iPhone 12 Pro etc.) and tablets (iPad) —
              the full 3-column floating-badge layout below needs real desktop width, so
              this simpler stacked version covers everything under the lg breakpoint. */}
          <div className="mx-auto mt-10 block max-w-md sm:mt-12 sm:max-w-xl lg:hidden">
            <div className="relative overflow-hidden rounded-[22px] border border-[#e9e3f5] bg-white dark:bg-gray-950 shadow-[0_24px_50px_rgba(40,20,90,0.14)]">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-6 sm:py-4">
                <span className="flex items-center gap-2 text-sm font-extrabold sm:text-base">
                  <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-400 sm:h-5 sm:w-5" />
                  Overview
                </span>
                <span className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-[#fff1e0] dark:bg-orange-900/40 px-2.5 py-1 text-[10px] font-bold text-[#9a3412] dark:text-orange-400 sm:px-3 sm:py-1.5 sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    Amazon connected
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e3edff] dark:bg-blue-900/40 px-2.5 py-1 text-[10px] font-bold text-[#1e40af] dark:text-blue-400 sm:px-3 sm:py-1.5 sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    Flipkart data
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-[#f0ebf8] px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  <div className="text-[11px] font-semibold text-[#5f5875] dark:text-gray-400 sm:text-xs">Total sales</div>
                  <div className="text-lg font-extrabold tracking-[-0.02em] sm:text-2xl">₹14.2L</div>
                  <div className="text-[11px] font-bold text-[#15803d] dark:text-green-400 sm:text-xs">+18% this month</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#5f5875] dark:text-gray-400 sm:text-xs">Orders</div>
                  <div className="text-lg font-extrabold tracking-[-0.02em] sm:text-2xl">3,482</div>
                  <div className="text-[11px] font-bold text-[#15803d] dark:text-green-400 sm:text-xs">+11%</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#5f5875] dark:text-gray-400 sm:text-xs">Ad ROAS</div>
                  <div className="text-lg font-extrabold tracking-[-0.02em] sm:text-2xl">4.6x</div>
                  <div className="text-[11px] font-bold text-[#15803d] dark:text-green-400 sm:text-xs">+0.8x</div>
                </div>
              </div>

              <div className="border-t border-[#f0ebf8] p-4 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
                  <span className="text-xs font-bold sm:text-sm">Sales by marketplace</span>
                  <span className="flex gap-2.5 text-[11px] font-semibold text-[#5f5875] dark:text-gray-400 sm:gap-3 sm:text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-violet-600" />
                      Amazon
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-pink-300" />
                      Flipkart
                    </span>
                  </span>
                </div>
                <div className="flex h-24 items-end gap-2 sm:h-32 sm:gap-3">
                  {[
                    [45, 28],
                    [55, 32],
                    [50, 38],
                    [68, 42],
                    [80, 50],
                    [100, 58],
                  ].map(([amz, fk], i) => (
                    <div key={i} className="flex h-full flex-1 items-end gap-1">
                      <div className="flex-1 rounded-t-md bg-violet-600" style={{ height: `${amz}%` }} />
                      <div className="flex-1 rounded-t-md bg-pink-300" style={{ height: `${fk}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature badges as a horizontally-scrollable strip — works well with a thumb
                swipe on both iPhone and iPad, and never causes page-level overflow. */}
            <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:px-0">
              {heroBadges.map((b, i) => (
                <div key={i} className="w-[220px] shrink-0 sm:w-[240px]">
                  <FloatingBadge {...b} rotate={0} />
                </div>
              ))}
            </div>
          </div>

          {/* Overview diagram with floating feature badges — full "Sales by marketplace" bar chart */}
          <div className="mx-auto mt-16 hidden max-w-6xl grid-cols-[1fr_1.9fr_1fr] items-center gap-6 lg:grid">
            <div className="flex flex-col gap-6">
              <FloatingBadge
                icon={Megaphone}
                iconBg="bg-violet-100 dark:bg-violet-900/40"
                iconColor="text-violet-700 dark:text-violet-300"
                title="Ad automation"
                subtitle="ACoS down 3.2 pts"
                subtitleColor="text-[#15803d] dark:text-green-400"
                rotate={-3}
              />
              <FloatingBadge
                icon={Search}
                iconBg="bg-[#e3edff] dark:bg-blue-900/40"
                iconColor="text-[#1e40af] dark:text-blue-400"
                title="Keyword research"
                subtitle="1,240 keywords found"
                rotate={2}
              />
              <FloatingBadge
                icon={Users}
                title="Competitor analysis"
                subtitle="12 sellers tracked"
                dark
                rotate={-3}
              />
            </div>

            <div className="relative z-10 overflow-hidden rounded-[28px] border border-[#e9e3f5] bg-white dark:bg-gray-950 shadow-[0_40px_80px_rgba(40,20,90,0.18)]">
              <div className="flex items-center justify-between px-6 py-4">
                <span className="flex items-center gap-2 text-base font-extrabold">
                  <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Overview
                </span>
                <span className="flex gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-[#fff1e0] dark:bg-orange-900/40 px-3 py-1.5 text-xs font-bold text-[#9a3412] dark:text-orange-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    Amazon connected
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e3edff] dark:bg-blue-900/40 px-3 py-1.5 text-xs font-bold text-[#1e40af] dark:text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    Flipkart data
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-[#f0ebf8] px-6 py-5">
                <div>
                  <div className="text-xs font-semibold text-[#5f5875] dark:text-gray-400">Total sales</div>
                  <div className="text-2xl font-extrabold tracking-[-0.02em]">₹14.2L</div>
                  <div className="text-xs font-bold text-[#15803d] dark:text-green-400">+18% this month</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#5f5875] dark:text-gray-400">Orders</div>
                  <div className="text-2xl font-extrabold tracking-[-0.02em]">3,482</div>
                  <div className="text-xs font-bold text-[#15803d] dark:text-green-400">+11%</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#5f5875] dark:text-gray-400">Ad ROAS</div>
                  <div className="text-2xl font-extrabold tracking-[-0.02em]">4.6x</div>
                  <div className="text-xs font-bold text-[#15803d] dark:text-green-400">+0.8x</div>
                </div>
              </div>

              <div className="border-t border-[#f0ebf8] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold">Sales by marketplace</span>
                  <span className="flex gap-3 text-xs font-semibold text-[#5f5875] dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-violet-600" />
                      Amazon
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-pink-300" />
                      Flipkart
                    </span>
                  </span>
                </div>
                <div className="flex h-36 items-end gap-4">
                  {[
                    [45, 28],
                    [55, 32],
                    [50, 38],
                    [68, 42],
                    [80, 50],
                    [100, 58],
                  ].map(([amz, fk], i) => (
                    <div key={i} className="flex h-full flex-1 items-end gap-1.5">
                      <div className="flex-1 rounded-t-md bg-violet-600" style={{ height: `${amz}%` }} />
                      <div className="flex-1 rounded-t-md bg-pink-300" style={{ height: `${fk}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <FloatingBadge
                icon={Tag}
                iconBg="bg-[#dcfce7] dark:bg-green-900/40"
                iconColor="text-[#166534] dark:text-green-400"
                title="Price optimization"
                subtitle="Suggested price ₹549"
                rotate={3}
              />
              <FloatingBadge
                icon={FileCheck2}
                iconBg="bg-[#fce7f3] dark:bg-pink-900/40"
                iconColor="text-[#9d174d] dark:text-pink-400"
                title="Listing optimization"
                subtitle="Listing score 92/100"
                rotate={-2}
              />
              <FloatingBadge
                icon={Bell}
                iconBg="bg-[#ffedd5] dark:bg-orange-900/40"
                iconColor="text-[#9a3412] dark:text-orange-400"
                title="Smart alerts"
                subtitle="On WhatsApp, 24/7"
                rotate={3}
              />
            </div>
          </div>
        </div>
      </section>


      {/* Trust bar */}
      <section className="border-y border-[#eee9f7] bg-white dark:bg-gray-950 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold tracking-[0.08em] text-[#5f5875] dark:text-gray-400">
              WORKS WITH
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#fff1e0] dark:bg-orange-900/40 px-3.5 py-2 text-sm font-bold text-[#9a3412] dark:text-orange-400">
                Amazon India
              </span>
              <span className="rounded-full bg-[#e3edff] dark:bg-blue-900/40 px-3.5 py-2 text-sm font-bold text-[#1e40af] dark:text-blue-400">
                Flipkart
              </span>
              <span className="rounded-full bg-[#dcfce7] dark:bg-green-900/40 px-3.5 py-2 text-sm font-bold text-[#166534] dark:text-green-400">
                WhatsApp
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-10">
            <div>
              <div className="text-2xl font-extrabold tracking-[-0.02em]">5,000+</div>
              <div className="text-[13px] font-semibold text-[#5f5875] dark:text-gray-400">sellers trust Insydz</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-[-0.02em]">2.5L+</div>
              <div className="text-[13px] font-semibold text-[#5f5875] dark:text-gray-400">reviews analysed</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-[-0.02em]">24/7</div>
              <div className="text-[13px] font-semibold text-[#5f5875] dark:text-gray-400">live market data</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/20 px-4 py-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/40">
              <ShieldCheck className="h-5 w-5 text-green-700 dark:text-green-300" />
            </span>
            <span>
              <span className="block text-sm font-extrabold">Your data stays private</span>
              <span className="text-[13px] leading-relaxed text-[#4b4560] dark:text-gray-300">
                We follow Amazon&apos;s Acceptable Use Policy and never share or pool private seller data.
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Up and running in three simple steps
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              No setup calls, no spreadsheets. Most sellers see their first insights on day one.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Link2,
                bg: "bg-violet-100 dark:bg-violet-900/40",
                color: "text-violet-700 dark:text-violet-300",
                num: "01",
                title: "Connect your Amazon account",
                desc: "Sign up free and link your Amazon seller account securely. Add the Flipkart products you want to track.",
              },
              {
                icon: BarChart3,
                bg: "bg-[#e3edff] dark:bg-blue-900/40",
                color: "text-[#1e40af] dark:text-blue-400",
                num: "02",
                title: "See everything in one place",
                desc: "Sales, ads, keywords and competitor moves come together in one dashboard, with AI suggestions on what to do next.",
              },
              {
                icon: TrendingUp,
                bg: "bg-[#dcfce7] dark:bg-green-900/40",
                color: "text-[#166534] dark:text-green-400",
                num: "03",
                title: "Act and grow your sales",
                desc: "Fix prices, improve listings and cut wasted ad spend. Get an alert the moment something important changes.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-[24px] border border-[#eee9f7] p-8 shadow-[0_12px_30px_rgba(40,20,90,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg}`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </span>
                  <span className="text-4xl font-extrabold tracking-[-0.03em] text-[#ece4fb]">{s.num}</span>
                </div>
                <h3 className="text-lg font-extrabold">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#4b4560] dark:text-gray-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section — tabbed diagram */}
      <section id="Features" className="scroll-mt-20 bg-[#f6f1ff] dark:bg-gray-800/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>FEATURES</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Every selling task, one platform
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Six connected tools that cover your whole Amazon and Flipkart business, from ads to listings.
            </p>
          </div>

          <div className="mx-auto mb-10 flex max-w-6xl items-center gap-1 overflow-x-auto rounded-full border border-[#e9e3f5] bg-white dark:bg-gray-950 p-1.5">
            {featureTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveFeatureTab(t.key)}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[13px] font-bold transition-colors sm:text-sm ${activeTab.key === t.key
                  ? "bg-[#1a1033] text-white"
                  : "text-[#3b3552] dark:text-gray-300 hover:bg-[#faf8fe] dark:bg-gray-900"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 items-center gap-10 rounded-[28px] border border-[#e9e3f5] bg-white dark:bg-gray-950 p-8 shadow-[0_20px_50px_rgba(40,20,90,0.06)] lg:grid-cols-2 lg:p-12">
            <div className="flex flex-col gap-5">
              <h3 className="text-2xl font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-3xl">
                {activeTab.heading}
              </h3>
              <p className="text-[17px] leading-relaxed text-[#4b4560] dark:text-gray-300">{activeTab.description}</p>
              <div className="flex flex-col gap-2.5">
                {activeTab.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#4b4560] dark:text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="mr-1 text-sm font-extrabold">Tools:</span>
                {activeTab.tools.map((tool, i) => (
                  <span key={i} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white">
                    {tool}
                  </span>
                ))}
              </div>
              <SecondaryButton href={activeTab.href} className="w-fit">
                Explore {activeTab.label.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </SecondaryButton>
            </div>

            {/* Diagram */}
            <div className="overflow-hidden rounded-[20px] border border-[#eee9f7] bg-[#faf8fe] dark:bg-gray-900">
              {activeTab.table ? (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="whitespace-nowrap text-sm font-extrabold">Keyword tracker</span>
                    <span className="whitespace-nowrap rounded-full bg-[#fff1e0] dark:bg-orange-900/40 px-3 py-1 text-xs font-bold text-[#9a3412] dark:text-orange-400">
                      Amazon India
                    </span>
                  </div>
                  <div className="grid min-w-[480px] grid-cols-[2.2fr_1fr_1fr_1fr] gap-2 bg-[#f3effd] dark:bg-violet-900/20 px-5 py-2.5 text-[11px] font-extrabold tracking-[0.05em] text-[#5f5875] dark:text-gray-400">
                    <span>KEYWORD</span>
                    <span>SEARCHES</span>
                    <span>YOUR RANK</span>
                    <span>CHANGE</span>
                  </div>
                  {activeTab.table.map((row, i) => (
                    <div
                      key={i}
                      className="grid min-w-[480px] grid-cols-[2.2fr_1fr_1fr_1fr] items-center gap-2 border-t border-[#f0ebf8] px-5 py-3 text-sm"
                    >
                      <span className="whitespace-nowrap font-bold">{row.keyword}</span>
                      <span className="whitespace-nowrap">{row.searches}</span>
                      <span className="whitespace-nowrap font-extrabold">{row.rank}</span>
                      <span
                        className={`w-fit justify-self-start whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-extrabold ${row.trend === "up"
                          ? "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400"
                          : row.trend === "down"
                            ? "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]"
                            : "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300"
                          }`}
                      >
                        {row.change}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
                  {activeTab.stats?.map((s, i) => (
                    <div key={i} className="rounded-2xl border border-[#eee9f7] bg-white dark:bg-gray-950 p-4">
                      <div className="text-xs font-semibold text-[#5f5875] dark:text-gray-400">{s.label}</div>
                      <div className="text-xl font-extrabold">{s.value}</div>
                      <div className="text-xs font-bold text-[#15803d] dark:text-green-400">{s.change}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="m-5 flex items-center gap-3 rounded-2xl bg-[#1a1033] px-4 py-3.5 text-white">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-950/10">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                </span>
                <span className="text-[13px] leading-relaxed">
                  <strong>AI tip:</strong> {activeTab.tip}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Masterclasses Section */}
      <section className="bg-[#fdf2f8] dark:bg-pink-900/20 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-3 text-left">
              <Eyebrow>VIDEO MASTERCLASSES</Eyebrow>
              <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl">
                Video guides
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
                Free walkthroughs and playbooks from real sellers, including festive season prep
                for Diwali and Big Billion Days.
              </p>
            </div>
            <SecondaryButton href="/resources/video-guides" className="self-start md:self-auto">
              View all videos
              <ArrowRight className="h-4 w-4" />
            </SecondaryButton>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                image: "/insydz-opportunity-finder-thumbnail.png",
                video: "/videos/Insydz%20Feature%20-%20Opportunity%20Finder.mp4",
                tag: "Product research",
                duration: "06:12",
                title: "Find winning products with Opportunity Finder",
                desc: "Spot hidden market gaps, pricing gaps and demand signals on Amazon and Flipkart in seconds.",
              },
              {
                image: "/insydz-complete-navigation-guide-thumbnail.png",
                video: "/videos/Insydz%20-%20%20Complete%20Navigation%20Guide.mp4",
                tag: "Getting started",
                duration: "08:45",
                title: "Insydz complete navigation guide",
                desc: "Set up your account and explore every seller tool, step by step.",
              },
              {
                image: "/insydz-market-visibility-thumbnail.png",
                video: "/videos/Insydz’s%20Market%20Visibility.mp4",
                tag: "Competitor analysis",
                duration: "05:30",
                title: "See your whole category with Market Visibility",
                desc: "Understand market gaps, keyword opportunities and exactly how to scale.",
              },
            ].map((v, i) => (
              <div
                key={i}
                className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#eee9f7] bg-white dark:bg-gray-950 shadow-[0_12px_30px_rgba(40,20,90,0.05)]"
              >
                <div
                  className="relative aspect-video w-full cursor-pointer bg-cover bg-center"
                  style={{ backgroundImage: `url('${v.image}')` }}
                  onClick={() => setPlayingVideo(v.video)}
                >
                  <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white backdrop-blur-sm">
                    {v.tag}
                  </span>
                  <span className="absolute bottom-4 left-4 rounded bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
                    {v.duration}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-gray-950/90 shadow-lg">
                      <svg className="ml-1 h-5 w-5 fill-current text-violet-600 dark:text-violet-400" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-grow flex-col gap-3 p-6">
                  <h3
                    className="cursor-pointer text-lg font-extrabold leading-snug hover:text-violet-600 dark:text-violet-400"
                    onClick={() => setPlayingVideo(v.video)}
                  >
                    {v.title}
                  </h3>
                  <p className="flex-grow text-sm leading-relaxed text-[#5f5875] dark:text-gray-400">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>WHO IT IS FOR</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Built for every e-commerce growth team
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Whether you sell one product or manage a portfolio of brands, Insydz fits the way
              you work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/solutions/amazon-sellers",
                icon: Trophy,
                bg: "bg-[#fff1e0] dark:bg-orange-900/40",
                color: "text-[#9a3412] dark:text-orange-400",
                title: "Amazon sellers",
                desc: "Win the Buy Box and grow sales on Amazon India.",
              },
              {
                href: "/solutions/flipkart-sellers",
                icon: Trophy,
                bg: "bg-[#e3edff] dark:bg-blue-900/40",
                color: "text-[#1e40af] dark:text-blue-400",
                title: "Flipkart sellers",
                desc: "Your Flipkart command centre for daily decisions.",
              },
              {
                href: "/solutions/ecommerce-agencies",
                icon: Users,
                bg: "bg-violet-100 dark:bg-violet-900/40",
                color: "text-violet-700 dark:text-violet-300",
                title: "E-commerce agencies",
                desc: "Manage many clients without the chaos.",
              },
              {
                href: "/solutions/brand-managers",
                icon: Presentation,
                bg: "bg-[#dcfce7] dark:bg-green-900/40",
                color: "text-[#166534] dark:text-green-400",
                title: "Brand managers",
                desc: "Make confident, data backed decisions.",
              },
            ].map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="flex flex-col gap-4 rounded-[24px] border border-[#eee9f7] p-7 transition-shadow hover:shadow-[0_12px_30px_rgba(40,20,90,0.06)]"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg}`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </span>
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                <div className="flex items-start gap-2 text-sm leading-relaxed text-[#4b4560] dark:text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span>{c.desc}</span>
                </div>
                <span className="mt-auto flex items-center gap-1.5 text-sm font-extrabold text-[#1a1033] dark:text-gray-50">
                  See how it helps <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section id="Compare" className="scroll-mt-20 bg-[#fdf2f8] dark:bg-pink-900/20 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>WHY INSYDZ</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Why Indian sellers choose Insydz
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Global tools were built for the US market. Insydz is built for how India buys and sells.
            </p>
          </div>

          <div className="mb-14 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {[
              { icon: Target, text: "Streamlined, simple UX", bg: "bg-[#e3edff] dark:bg-blue-900/40", color: "text-[#1e40af] dark:text-blue-400" },
              { icon: Zap, text: "Superior AI insights", bg: "bg-violet-100 dark:bg-violet-900/40", color: "text-violet-700 dark:text-violet-300" },
              { icon: DollarSign, text: "Exceptional value", bg: "bg-[#dcfce7] dark:bg-green-900/40", color: "text-[#166534] dark:text-green-400" },
              { icon: Globe, text: "India first expertise", bg: "bg-[#fff1e0] dark:bg-orange-900/40", color: "text-[#9a3412] dark:text-orange-400" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 rounded-[20px] border border-[#eee9f7] bg-white dark:bg-gray-950 p-6 text-center"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <p className="text-sm font-bold">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                href: "/compare/insydzvshelium",
                vs: "vs Helium 10",
                bg: "bg-[#fff1e0] dark:bg-orange-900/40",
                color: "text-[#9a3412] dark:text-orange-400",
                border: "border-[#f2ddb8]",
                points: [
                  "Indian marketplace coverage Helium 10 can't match",
                  "Premium features at a fraction of the cost",
                  "₹ denominated pricing intelligence built for India",
                ],
              },
              {
                href: "/compare/insydzvsjunglescout",
                vs: "vs Jungle Scout",
                bg: "bg-[#e3edff] dark:bg-blue-900/40",
                color: "text-[#1e40af] dark:text-blue-400",
                border: "border-[#c9dbfb]",
                points: [
                  "Amazon India + Flipkart in one dashboard",
                  "Real-time competitive intelligence for Indian markets",
                  "AI insights that understand Indian buyer behaviour",
                ],
              },
              {
                href: "/compare/insydzvsvirallaunch",
                vs: "vs Viral Launch",
                bg: "bg-[#dcfce7] dark:bg-green-900/40",
                color: "text-[#166534] dark:text-green-400",
                border: "border-[#bcecc7]",
                points: [
                  "Agency-optimized workflows for Indian businesses",
                  "Superior data precision for marketplaces",
                  "Localized market intelligence built for how Indian businesses scale",
                ],
              },
            ].map((c, i) => (
              <div
                key={i}
                className={`flex flex-col gap-5 rounded-[24px] border-2 ${c.border} bg-white dark:bg-gray-950 p-8`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg}`}>
                    <Trophy className={`h-6 w-6 ${c.color}`} />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold">Insydz</h3>
                    <p className="text-sm text-[#5f5875] dark:text-gray-400">{c.vs}</p>
                  </div>
                </div>
                <ul className="flex flex-1 flex-col gap-3">
                  {c.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#4b4560] dark:text-gray-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <SecondaryButton href={c.href} className="w-full">
                  Show more <ArrowRight className="h-4 w-4" />
                </SecondaryButton>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <PrimaryButton href="/login">Start your free trial</PrimaryButton>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="Resources" className="scroll-mt-20 bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Eyebrow>LEARN</Eyebrow>
              <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px] lg:whitespace-nowrap">
                Learn Insydz in minutes
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Free walkthroughs and playbooks from real sellers, including festive season prep
              for Diwali and Big Billion Days.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/resources/expert-blog",
                icon: BookOpen,
                bg: "bg-[#e3edff] dark:bg-blue-900/40",
                color: "text-[#1e40af] dark:text-blue-400",
                title: "Expert blog",
                desc: "Strategies for Amazon India and Flipkart.",
                cta: "Read",
              },
              {
                href: "/resources/case-studies",
                icon: FileText,
                bg: "bg-violet-100 dark:bg-violet-900/40",
                color: "text-violet-700 dark:text-violet-300",
                title: "Success stories",
                desc: "Real numbers from Indian sellers.",
                cta: "View",
              },
              {
                href: "/resources/videos",
                icon: Video,
                bg: "bg-[#fce7f3] dark:bg-pink-900/40",
                color: "text-[#9d174d] dark:text-pink-400",
                title: "Video masterclasses",
                desc: "Step-by-step platform walkthroughs, seller workshops, marketplace strategy sessions.",
                cta: "Start learning",
              },
              {
                href: "/resources/guides",
                icon: BookOpen,
                bg: "bg-[#dcfce7] dark:bg-green-900/40",
                color: "text-[#166534] dark:text-green-400",
                title: "Strategic playbooks",
                desc: "Festive prep, Buy Box recovery and more.",
                cta: "Get",
              },
            ].map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="flex h-full flex-col gap-4 rounded-[24px] border border-[#eee9f7] p-7 shadow-[0_10px_30px_rgba(40,20,90,0.04)] transition-shadow hover:shadow-[0_16px_40px_rgba(40,20,90,0.08)]"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg}`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </span>
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                <p className="flex-grow text-sm leading-relaxed text-[#4b4560] dark:text-gray-300">{c.desc}</p>
                <span className={`mt-auto flex items-center gap-1.5 text-sm font-extrabold ${c.color}`}>
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="About" className="scroll-mt-20 bg-[#f6f1ff] dark:bg-gray-800/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>ABOUT INSYDZ</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              About Insydz
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              We&apos;re democratizing e-commerce intelligence for the Indian market, building
              tools that empower the next generation of digital entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                bg: "bg-violet-100 dark:bg-violet-900/40",
                color: "text-violet-700 dark:text-violet-300",
                title: "Seller focused",
                desc: "Every feature we build starts with a conversation with a real seller navigating the Indian marketplace landscape.",
              },
              {
                icon: Presentation,
                bg: "bg-[#fce7f3] dark:bg-pink-900/40",
                color: "text-[#9d174d] dark:text-pink-400",
                title: "Data precision",
                desc: "We believe in raw data accuracy. Our proprietary engine cleans and processes millions of data points for marketplaces.",
              },
              {
                icon: Zap,
                bg: "bg-[#e3edff] dark:bg-blue-900/40",
                color: "text-[#1e40af] dark:text-blue-400",
                title: "AI driven",
                desc: "Beyond just tracking, we provide AI recommendations that help you act on data before your competitors do.",
              },
            ].map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-4 rounded-[24px] bg-white dark:bg-gray-950 p-8 text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${c.bg}`}>
                  <c.icon className={`h-8 w-8 ${c.color}`} />
                </div>
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                <p className="text-sm leading-relaxed text-[#4b4560] dark:text-gray-300">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>WHERE WE ARE</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Building India&apos;s most trusted seller analytics platform
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Supporting data-driven decisions for Indian sellers across every marketplace.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              { title: "Early", subtitle: "Product stage" },
              { title: "India", subtitle: "Primary market" },
              { title: "Multiple", subtitle: "Marketplaces supported" },
              { title: "Growing", subtitle: "Seller adoption" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-[24px] border border-[#eee9f7] p-8 text-center"
              >
                <div className="mb-2 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-3xl font-extrabold tracking-[-0.02em] text-transparent">
                  {stat.title}
                </div>
                <div className="text-sm font-semibold text-[#5f5875] dark:text-gray-400">{stat.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="Testimonials" className="scroll-mt-20 bg-[#fcfaff] dark:bg-gray-900 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>SELLER STORIES</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Sellers are growing with Insydz
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Real results from Indian sellers and agencies on Amazon and Flipkart.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex h-full flex-col justify-between rounded-[24px] border border-[#eee9f7] bg-white dark:bg-gray-950 p-7 shadow-[0_10px_30px_rgba(40,20,90,0.04)]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${t.logoBg}`}>
                    {t.logo}
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-[#f3effd] dark:bg-violet-900/20 px-3 py-1">
                    <span className="text-sm font-bold text-[#3b3552] dark:text-gray-300">{t.rating}</span>
                    <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                  </span>
                </div>

                <p className="mb-6 flex-grow text-[15px] italic leading-relaxed text-[#4b4560] dark:text-gray-300">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div>
                  <h4 className="text-base font-extrabold">{t.author}</h4>
                  <p className="text-sm font-medium text-[#5f5875] dark:text-gray-400">{t.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="Pricing" className="scroll-mt-20 bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>PRICING</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Simple pricing that grows with you
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Start free. Upgrade only when you need more. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* Free */}
            <div className="flex flex-col gap-5 rounded-[24px] border border-[#eee9f7] p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e3edff] dark:bg-blue-900/40">
                <Zap className="h-5 w-5 text-[#1e40af] dark:text-blue-400" />
              </span>
              <span className="text-lg font-extrabold">Free</span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-[-0.02em]">₹0</span>
                  <span className="text-sm text-[#8a849c]">/month</span>
                </div>
                <p className="mt-1 text-sm text-[#4b4560] dark:text-gray-300">Perfect for getting started</p>
              </div>
              <SecondaryButton onClick={handleGetStarted} className="w-full">
                Get started free
              </SecondaryButton>
              <ul className="flex flex-col gap-2.5 border-t border-[#f0ebf8] pt-5 text-sm text-[#4b4560] dark:text-gray-300">
                {[
                  "Basic dashboard access",
                  "Track up to 25 products",
                  "Top 5 products filter",
                  "5 AI chat messages a month",
                  "5 notifications",
                  "Weekly reports",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Basic — Most Popular */}
            <div className="relative flex flex-col gap-5 rounded-[24px] border-2 border-violet-600 p-8 shadow-[0_24px_60px_rgba(124,58,237,0.18)]">
              <span className="absolute -top-[15px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-1.5 text-xs font-extrabold text-white">
                MOST POPULAR
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
                <Crown className="h-5 w-5 text-violet-700 dark:text-violet-300" />
              </span>
              <span className="text-lg font-extrabold">Basic</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-[-0.02em]">₹1,999</span>
                  <span className="text-sm text-[#8a849c]">/month</span>
                  <span className="text-sm text-[#8a849c] line-through">₹3,999</span>
                </div>
                <p className="mt-1 text-sm text-[#4b4560] dark:text-gray-300">Ideal for growing businesses</p>
              </div>
              <PrimaryButton onClick={() => handlePlanSelect("basic")} className="w-full">
                Upgrade to Basic
              </PrimaryButton>
              <ul className="flex flex-col gap-2.5 border-t border-[#f0ebf8] pt-5 text-sm text-[#4b4560] dark:text-gray-300">
                {[
                  "Everything in Free",
                  "Track up to 500 products",
                  "Top 20 products filter",
                  "20 AI chat messages a month",
                  "15 notifications",
                  "AI chart summaries",
                  "Basic competitor alerts",
                  "Daily reports and email support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="flex flex-col gap-5 rounded-[24px] border border-[#eee9f7] p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fef3c7] dark:bg-amber-900/20">
                <Crown className="h-5 w-5 text-[#92400e]" />
              </span>
              <span className="text-lg font-extrabold">Premium</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-[-0.02em]">₹2,999</span>
                  <span className="text-sm text-[#8a849c]">/month</span>
                  <span className="text-sm text-[#8a849c] line-through">₹7,999</span>
                </div>
                <p className="mt-1 text-sm text-[#4b4560] dark:text-gray-300">For serious professionals</p>
              </div>
              <button
                onClick={() => handlePlanSelect("premium")}
                className="w-full rounded-full bg-[#1a1033] px-6 py-[15px] text-[15px] font-extrabold text-white transition-opacity hover:opacity-90"
              >
                Upgrade to Premium
              </button>
              <ul className="flex flex-col gap-2.5 border-t border-[#f0ebf8] pt-5 text-sm text-[#4b4560] dark:text-gray-300">
                {[
                  "Everything in Basic",
                  "Unlimited product tracking",
                  "Top 100 products filter",
                  "Unlimited AI chat and notifications",
                  "Advanced AI chatbot",
                  "Real-time data and alerts",
                  "Priority support",
                  "Advanced analytics",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col gap-5 rounded-[24px] border border-[#eee9f7] p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3f0fa] dark:bg-violet-900/20">
                <Building2 className="h-5 w-5 text-[#3b3552] dark:text-gray-300" />
              </span>
              <span className="text-lg font-extrabold">Enterprise</span>
              <div>
                <div className="text-3xl font-extrabold tracking-[-0.02em]">Custom</div>
                <p className="mt-1 text-sm text-[#4b4560] dark:text-gray-300">Tailored for SMBs and agencies</p>
              </div>
              <SecondaryButton onClick={handleGetStarted} className="w-full">
                Contact sales
              </SecondaryButton>
              <ul className="flex flex-col gap-2.5 border-t border-[#f0ebf8] pt-5 text-sm text-[#4b4560] dark:text-gray-300">
                {["Everything in Premium", "White label options", "Premium support", "Multiple client accounts"].map(
                  (item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#fcfaff] dark:bg-gray-900 py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="flex flex-col items-start gap-6 text-left">
            <div className="flex flex-col items-start gap-3">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="max-w-sm text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-4xl">
                Questions sellers ask before starting
              </h2>
              <p className="max-w-sm text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
                Short, honest answers. Still unsure? Talk to our team.
              </p>
            </div>
            <CustomBookDemoModal
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-8 py-4 text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(124,58,237,0.38)]"
              text={<>Book a demo <ArrowRight className="h-4 w-4" /></>}
            />
          </div>

          <div className="border-t border-[#eee9f7]">
            {faqs.map((f, i) => (
              <details key={i} className="group border-b border-[#eee9f7] py-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f3effd] dark:bg-violet-900/20 text-xl font-bold text-violet-600 dark:text-violet-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3.5 pr-12 text-[15px] leading-relaxed text-[#4b4560] dark:text-gray-300">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3b0f8a] via-[#1a1033] to-[#5b1265] px-8 py-16 sm:px-16">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full bg-pink-600/20" />

          <div className="relative z-10 flex flex-col items-start gap-8 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6">
              <h3 className="max-w-xl text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[44px]">
                Growing on Amazon and Flipkart has{" "}
                <strong className="font-extrabold">never been easier.</strong>
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {["Cut wasted ad spend", "Find keywords you are missing", "Beat competitor prices"].map((t, i) => (
                  <span key={i} className="flex items-center gap-2.5 text-[15px] font-semibold text-violet-100">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col gap-3">
              <Link
                href="/login"
                className="rounded-full bg-white dark:bg-gray-950 px-9 py-4 text-center text-[17px] font-extrabold text-[#1a1033] dark:text-gray-50 shadow-2xl transition-transform hover:-translate-y-0.5"
              >
                Create free account
              </Link>
              <CustomBookDemoModal
                className="rounded-full border border-white/40 px-8 py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-white hover:text-[#1a1033] dark:hover:text-gray-50 dark:hover:bg-gray-950/5"
                text="Book a demo"
              />
              <span className="text-center text-xs text-[#c9c2dd]">
                Free plan. No credit card needed.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is handled by MarketingLayout */}

      {/* Video Modal Player Overlay */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2.5 text-white backdrop-blur-md hover:bg-black/80"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video w-full">
              <video src={playingVideo} className="h-full w-full object-contain" controls autoPlay />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}