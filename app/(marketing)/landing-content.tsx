
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

// Matches the 3 seller stories shown in the design (star rating, marketplace tag,
// headline stat, quote, avatar + role) — dark card in the middle like the mockup.
const testimonials = [
  {
    stat: "+22% net profit",
    tag: "Amazon",
    tagBg: "bg-[#fff1e0] dark:bg-orange-900/40",
    tagColor: "text-[#9a3412] dark:text-orange-400",
    quote:
      "Insydz helped me find which products were quietly losing margin. Within two weeks I fixed my pricing. I did not need to guess anymore.",
    author: "Rahul Gupta",
    role: "Electronics, 3 years on Amazon",
    avatar: "RG",
    avatarBg: "bg-violet-100 dark:bg-violet-900/40",
    avatarColor: "text-violet-700 dark:text-violet-300",
    dark: false,
  },
  {
    stat: "Hours saved daily",
    tag: "Flipkart",
    tagBg: "bg-[#e3edff] dark:bg-blue-900/40",
    tagColor: "text-[#c9c2dd]",
    quote:
      "Competitor tracking is a game changer. I used to check prices by hand for hours. Now it is all there every morning, and Big Billion Days prep was much smoother.",
    author: "Priya Sharma",
    role: "Fashion and apparel, 5 years on Flipkart",
    avatar: "PS",
    avatarBg: "bg-[#fce7f3]",
    avatarColor: "text-[#9d174d]",
    dark: true,
  },
  {
    stat: "4 brands, 1 dashboard",
    tag: "Agency",
    tagBg: "bg-[#f3effd] dark:bg-violet-900/20",
    tagColor: "text-[#4b4560] dark:text-gray-300",
    quote:
      "Managing four brands across Amazon and Flipkart was hard. Now I have one dashboard and my clients get reports they can actually act on.",
    author: "Aarav Kumar",
    role: "Multi brand agency, Bengaluru",
    avatar: "AK",
    avatarBg: "bg-[#dcfce7]",
    avatarColor: "text-[#166534]",
    dark: false,
  },
];

const featureTabs = [
  {
    key: "ads",
    label: "Ad Automation",
    href: "/solutions/amazon-advertising",
    icon: Megaphone,
    eyebrow: "Amazon PPC automation",
    heading: "Automate your Amazon ads and cut wasted ad spend",
    description:
      "Ad Automation manages your Amazon Sponsored Products campaigns for you. It adjusts bids and budgets to match your ACoS and ROAS goals, so more of your ad spend turns into sales.",
    bulletsHeading: "What you can do",
    bullets: [
      "Find and pause keywords that spend money but bring no sales",
      "Set automatic bid and budget rules for each campaign",
      "Track ACoS, ROAS and ad spend daily in one dashboard",
      "Move budget to the campaigns that sell the most",
    ],
    bestFor: "Sellers who run Amazon PPC ads and want a lower ACoS without daily manual work.",
    tools: ["Bid automation", "Budget rules", "ACoS tracking"],
    tableTitle: "Campaign performance",
    tableHeaders: ["CAMPAIGN", "SPEND", "ACOS", "STATUS"],
    tableRows: [
      { col1: "Kurti sets, exact", col2: "₹18,400", col3: "14.2%", col4: "Healthy", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
      { col1: "Bottles, broad", col2: "₹12,900", col3: "48.0%", col4: "Overspending", statusClass: "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]" },
      { col1: "Yoga mats, auto", col2: "₹7,300", col3: "22.6%", col4: "Healthy", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
      { col1: "Bedsheets, phrase", col2: "₹5,100", col3: "31.4%", col4: "Watch", statusClass: "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300" },
    ],
    tip: "Pause 6 keywords in \"Bottles, broad\" to save about ₹4,200 a week.",
  },
  {
    key: "keywords",
    label: "Keyword Research",
    href: "/features/keyword-rank-tracking-feature",
    icon: Search,
    eyebrow: "Amazon and Flipkart keyword research",
    heading: "Find high search volume keywords your buyers actually use",
    description:
      "Keyword Research shows what shoppers search for on Amazon India and Flipkart, how many times a month they search it and where your product ranks. Use it to choose the right keywords for your listings and ads.",
    bulletsHeading: "What you can do",
    bullets: [
      "See monthly search volume for any keyword",
      "Track your keyword rank daily on Amazon India and Flipkart",
      "Find keywords your competitors rank for that you are missing",
      "Get AI keyword suggestions for titles, bullet points and ads",
    ],
    bestFor: "Sellers launching new products or trying to reach page one of search results.",
    tools: ["Keyword research", "Rank tracking", "Share of Voice"],
    tableTitle: "Keyword tracker",
    tableHeaders: ["KEYWORD", "SEARCHES", "YOUR RANK", "CHANGE"],
    tableRows: [
      { col1: "cotton kurti for women", col2: "48,200", col3: "#4", col4: "Up 7", trend: "up" },
      { col1: "steel water bottle 1l", col2: "31,900", col3: "#2", col4: "Up 3", trend: "up" },
      { col1: "yoga mat anti slip", col2: "22,400", col3: "#11", col4: "Down 5", trend: "down" },
      { col1: "bedsheet double bed", col2: "19,700", col3: "#6", col4: "Same", trend: "flat" },
      { col1: "lunch box for office", col2: "14,300", col3: "#9", col4: "Up 2", trend: "up" },
    ],
    tip: "Add \"anti slip yoga mat 6mm\" to your title to recover lost rank.",
  },
  {
    key: "competitor",
    label: "Competitor Analysis",
    href: "/features/competitor-price-tracking-feature",
    icon: Users,
    eyebrow: "Competitor tracking",
    heading: "Track competitor prices, reviews and rankings every day",
    description:
      "Competitor Analysis watches the sellers you compete with on Amazon and Flipkart. See every price change, new listing and review trend, and find the market gaps where you can grow.",
    bulletsHeading: "What you can do",
    bullets: [
      "Monitor competitor prices and Buy Box changes daily",
      "Compare ratings, reviews and search rankings side by side",
      "Find new product opportunities with Opportunity Finder",
      "Measure your category Share of Voice with Market Visibility",
    ],
    bestFor: "Sellers in crowded categories where competitors change prices often.",
    tools: ["Opportunity Finder", "Market Visibility", "Price tracking"],
    tableTitle: "Competitors on your top product",
    tableHeaders: ["SELLER", "PRICE", "RATING", "CHANGE"],
    tableRows: [
      { col1: "Seller A", col2: "₹509", col3: "4.2", col4: "Price cut ₹40", statusClass: "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]" },
      { col1: "Seller B", col2: "₹549", col3: "4.4", col4: "No change", statusClass: "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300" },
      { col1: "Seller C", col2: "₹575", col3: "3.9", col4: "New listing", statusClass: "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300" },
      { col1: "You", col2: "₹549", col3: "4.5", col4: "Buy Box", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
    ],
    tip: "Seller A cut prices this morning. Match at ₹519 to keep the Buy Box.",
  },
  {
    key: "price",
    label: "Price Optimization",
    href: "/features/price-optimization-feature",
    icon: Tag,
    eyebrow: "Buy Box pricing",
    heading: "Set the right price to win the Buy Box and protect your profit",
    description:
      "Price Optimization suggests the best selling price for each product. It checks competitor prices, demand and your margin, so you win the Buy Box without selling at a loss.",
    bulletsHeading: "What you can do",
    bullets: [
      "Get a suggested price for every product",
      "Check your profit margin before you change a price",
      "Track Buy Box wins and losses for each listing",
      "Spot products where you can safely raise your price",
    ],
    bestFor: "Sellers who share listings with other sellers or face frequent price wars.",
    tools: ["Price suggestions", "Margin guard", "Buy Box tracking"],
    tableTitle: "Price suggestions",
    tableHeaders: ["PRODUCT", "NOW", "SUGGESTED", "IMPACT"],
    tableRows: [
      { col1: "Steel bottle, 1 litre", col2: "₹589", col3: "₹549", col4: "Win Buy Box", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
      { col1: "Cotton kurti set", col2: "₹799", col3: "₹829", col4: "+₹30 margin", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
      { col1: "Yoga mat 6mm", col2: "₹699", col3: "₹699", col4: "Keep price", statusClass: "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300" },
      { col1: "Lunch box, steel", col2: "₹449", col3: "₹429", col4: "Win Buy Box", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
    ],
    tip: "You can raise the kurti set to ₹829 and still be the lowest priced seller in its category.",
  },
  {
    key: "listing",
    label: "Listing Optimization",
    href: "/features/product-research-feature",
    icon: FileCheck2,
    eyebrow: "Product listing optimization",
    heading: "Optimize product listings to rank higher and sell more",
    description:
      "Listing Optimization gives every product listing a quality score and shows exactly what to fix in your titles, bullet points, images and keywords. Better listings rank higher in search and turn more visitors into buyers.",
    bulletsHeading: "What you can do",
    bullets: [
      "Get a listing score from 0 to 100 for every product",
      "Get keyword rich title and bullet point suggestions",
      "Find missing keywords, images and product details",
      "See your score improve after each fix",
    ],
    bestFor: "Sellers with many products who need to know which listings to fix first.",
    tools: ["Listing score", "Content suggestions", "Keyword gaps"],
    tableTitle: "Listing health",
    tableHeaders: ["PRODUCT", "SCORE", "ISSUE", "FIX"],
    tableRows: [
      { col1: "Cotton kurti set", col2: "92", col3: "None", col4: "Done", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
      { col1: "Yoga mat 6mm", col2: "64", col3: "Short title", col4: "Fix now", statusClass: "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]" },
      { col1: "Steel bottle, 1 litre", col2: "78", col3: "3 images", col4: "Add 2", statusClass: "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300" },
      { col1: "Bedsheet, double", col2: "71", col3: "Weak bullets", col4: "Fix now", statusClass: "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]" },
    ],
    tip: "Two quick fixes on the yoga mat listing could lift its score to 85.",
  },
  {
    key: "alerts",
    label: "Smart Alerts",
    href: "/features/whatsapp-alerts-feature",
    icon: Bell,
    eyebrow: "Real time seller alerts",
    heading: "Get instant WhatsApp alerts before problems cost you sales",
    description:
      "Smart Alerts watch your Amazon and Flipkart store around the clock. When a competitor cuts prices, you lose the Buy Box or a keyword rank drops, you get an alert on WhatsApp and in your dashboard.",
    bulletsHeading: "What you can do",
    bullets: [
      "Price drop alerts when competitors change their prices",
      "Buy Box loss alerts for every listing",
      "Keyword rank change and low stock alerts",
      "All alerts sorted by priority, so you fix the most urgent first",
    ],
    bestFor: "Busy sellers who cannot check their dashboard all day.",
    tools: ["WhatsApp alerts", "Buy Box alerts", "Rank alerts"],
    tableTitle: "Today's alerts",
    tableHeaders: ["ALERT", "PRODUCT", "TIME", "PRIORITY"],
    tableRows: [
      { col1: "Buy Box lost", col2: "Steel bottle", col3: "11:02", col4: "High", statusClass: "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]" },
      { col1: "Price drop by rival", col2: "Kurti set", col3: "09:41", col4: "High", statusClass: "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]" },
      { col1: "Rank improved", col2: "Yoga mat", col3: "08:15", col4: "Info", statusClass: "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400" },
      { col1: "Low stock", col2: "Lunch box", col3: "07:30", col4: "Medium", statusClass: "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300" },
    ],
    tip: "You have 2 high priority alerts. Both can be fixed with a price change.",
  },
];

// Rows for the "What you get" comparison table in the Compare section.
const compareRows = [
  { label: "Amazon India marketplace coverage", insydz: "Full", global: "Often limited" },
  { label: "Flipkart data in the same dashboard", insydz: "Included", global: "Usually not available" },
  { label: "Pricing in Indian rupees", insydz: "From ₹0", global: "Usually billed in USD" },
  { label: "Festive season and Indian buyer trends", insydz: "Built in", global: "Not India focused" },
  { label: "Agency workflows for Indian businesses", insydz: "Included", global: "Varies by plan" },
  { label: "Support that knows Indian marketplaces", insydz: "Yes", global: "Global support teams" },
];

const whyInsydz = [
  { icon: Globe, text: "India first expertise", bg: "bg-violet-100 dark:bg-violet-900/40", color: "text-violet-700 dark:text-violet-300" },
  { icon: Sparkles, text: "Superior AI insights", bg: "bg-[#fce7f3] dark:bg-pink-900/40", color: "text-[#9d174d] dark:text-pink-400" },
  { icon: ShieldCheck, text: "Exceptional value", bg: "bg-[#dcfce7] dark:bg-green-900/40", color: "text-[#166534] dark:text-green-400" },
  { icon: BarChart3, text: "Streamlined, simple UX", bg: "bg-[#e3edff] dark:bg-blue-900/40", color: "text-[#1e40af] dark:text-blue-400" },
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
    <span className="text-base font-extrabold tracking-[0.1em] text-violet-600 dark:text-violet-400 sm:text-lg">
      {children}
    </span>
  );
}

function StarRow() {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
      ))}
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
  // Default to "Ad Automation" as it is the first tab.
  const [activeFeatureTab, setActiveFeatureTab] = useState("ads");
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
              className="mx-auto inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-[#e4dcf5] dark:border-gray-800 bg-white dark:bg-gray-950 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-[#3b3552] dark:text-gray-300 shadow-[0_4px_14px_rgba(76,29,149,0.06)] sm:gap-3 sm:text-sm"
            >
              <span className="shrink-0 rounded-full bg-violet-100 dark:bg-violet-900/40 px-2.5 py-1 text-[11px] font-extrabold text-violet-700 dark:text-violet-300">
                ALL IN ONE
              </span>
              <span className="truncate">Run Your Amazon & Flipkart Business<span className="hidden sm:inline"> from One Place</span></span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
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
              <CustomBookDemoModal
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#d9cff0] dark:border-gray-700 bg-white dark:bg-gray-950 px-7 py-[15px] text-[15px] font-bold text-[#1a1033] dark:text-gray-50 transition-colors hover:bg-[#faf8fe] dark:bg-gray-900"
                text="Book a demo"
              />
              <Link
                href="/login"
                className="text-[15px] font-bold text-[#1a1033] dark:text-gray-50 underline decoration-[#d9cff0] decoration-2 underline-offset-4 sm:hidden"
              >
                Log in
              </Link>
            </div>

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




      {/* How It Works Section */}
      <section className="bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px] lg:whitespace-nowrap">
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
            <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Every selling task, one platform
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300 lg:whitespace-nowrap">
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
              {activeTab.eyebrow && (
                <span className="w-fit rounded-full bg-[#f3effd] dark:bg-violet-900/20 px-3 py-1 text-[11px] font-extrabold tracking-[0.05em] text-[#3b3552] dark:text-gray-300">
                  {activeTab.eyebrow}
                </span>
              )}
              <h3 className="text-2xl font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-3xl">
                {activeTab.heading}
              </h3>
              <p className="text-[17px] leading-relaxed text-[#4b4560] dark:text-gray-300">{activeTab.description}</p>
              
              <div className="flex flex-col gap-2.5">
                {activeTab.bulletsHeading && (
                  <div className="text-[15px] font-extrabold text-[#1a1033] dark:text-white">
                    {activeTab.bulletsHeading}
                  </div>
                )}
                {activeTab.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#4b4560] dark:text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {activeTab.bestFor && (
                <div className="flex items-start gap-3 rounded-[16px] border border-[#eee9f7] bg-[#faf8fe] p-4 text-[14px] leading-relaxed dark:border-gray-800 dark:bg-gray-900">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <p className="text-[#4b4560] dark:text-gray-300">
                    <strong className="text-[#1a1033] dark:text-white">Best for:</strong> {activeTab.bestFor}
                  </p>
                </div>
              )}

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
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="whitespace-nowrap text-sm font-extrabold">{activeTab.tableTitle}</span>
                    {activeTab.key === 'alerts' ? (
                      <span className="whitespace-nowrap rounded-full bg-[#dcfce7] dark:bg-green-900/40 px-3 py-1 text-xs font-bold text-[#166534] dark:text-green-400">
                        WhatsApp
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-[#fff1e0] dark:bg-orange-900/40 px-3 py-1 text-xs font-bold text-[#9a3412] dark:text-orange-400">
                        Amazon India
                      </span>
                    )}
                  </div>
                  <div className="grid min-w-[480px] grid-cols-[2.2fr_1fr_1fr_1fr] gap-2 bg-[#f3effd] dark:bg-violet-900/20 px-5 py-2.5 text-[11px] font-extrabold tracking-[0.05em] uppercase text-[#5f5875] dark:text-gray-400">
                    {activeTab.tableHeaders.map((header, i) => (
                      <span key={i}>{header}</span>
                    ))}
                  </div>
                  {activeTab.tableRows.map((row: any, i) => (
                    <div
                      key={i}
                      className="grid min-w-[480px] grid-cols-[2.2fr_1fr_1fr_1fr] items-center gap-2 border-t border-[#f0ebf8] px-5 py-3 text-sm"
                    >
                      <span className="whitespace-nowrap font-bold">{row.col1}</span>
                      <span className="whitespace-nowrap">{row.col2}</span>
                      <span className="whitespace-nowrap font-extrabold">{row.col3}</span>
                      <span
                        className={`w-fit justify-self-start whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                          row.statusClass 
                            ? row.statusClass 
                            : row.trend === "up"
                              ? "bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400"
                              : row.trend === "down"
                                ? "bg-[#fee2e2] dark:bg-red-900/20 text-[#b91c1c]"
                                : "bg-[#f3f0fa] dark:bg-violet-900/20 text-[#3b3552] dark:text-gray-300"
                        }`}
                      >
                        {row.col4}
                      </span>
                    </div>
                  ))}
                </div>

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
              <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl">
                Video guides
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-[#4b4560] dark:text-gray-300 lg:whitespace-nowrap">
                Free walkthroughs and playbooks from real sellers, including festive season prep for Diwali and Big Billion Days.
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
            <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Built for every e-commerce growth team
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300 lg:whitespace-nowrap">
              Whether you sell one product or manage a portfolio of brands, Insydz fits the way you work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/solutions/amazon-sellers",
                icon: Trophy,
                title: "Amazon sellers",
                desc: "Win the Buy Box and grow sales on Amazon India.",
              },
              {
                href: "/solutions/flipkart-sellers",
                icon: Trophy,
                title: "Flipkart sellers",
                desc: "Your Flipkart command centre for daily decisions.",
              },
              {
                href: "/solutions/ecommerce-agencies",
                icon: Users,
                title: "E-commerce agencies",
                desc: "Manage many clients without the chaos.",
              },
              {
                href: "/solutions/brand-managers",
                icon: Presentation,
                title: "Brand managers",
                desc: "Make confident, data backed decisions.",
              },
            ].map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="flex flex-col gap-5 rounded-[24px] border border-fuchsia-200 bg-white p-7 shadow-[0_12px_40px_-12px_rgba(217,70,239,0.15)] transition-all hover:shadow-[0_20px_50px_-10px_rgba(217,70,239,0.25)] hover:-translate-y-1 dark:border-fuchsia-900/50 dark:bg-gray-900/50"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-md shadow-pink-500/20">
                    <c.icon className="h-6 w-6 text-white" />
                  </span>
                  <h3 className="text-[20px] font-extrabold tracking-tight text-[#1a1033] dark:text-white leading-tight">
                    {c.title}
                  </h3>
                </div>
                <div className="flex items-start gap-3 text-[15.5px] leading-relaxed text-[#4b4560] dark:text-gray-300">
                  <Check className="mt-[3px] h-[18px] w-[18px] shrink-0 text-emerald-500" strokeWidth={2.5} />
                  <span>{c.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Section — matches the design's "Why Indian sellers choose Insydz" table layout */}
      <section id="Compare" className="scroll-mt-20 bg-[#fdf2f8] dark:bg-pink-900/20 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.3fr] lg:items-start">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-start gap-3 text-left">
                <Eyebrow>WHY INSYDZ</Eyebrow>
                <h2 className="max-w-md text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
                  Why Indian sellers choose Insydz
                </h2>
                <p className="max-w-md text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
                  Global tools were built for the US market. Insydz is built for how India buys
                  and sells.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {whyInsydz.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-2xl border border-[#eee9f7] bg-white dark:bg-gray-950 p-3.5"
                  >
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </span>
                    <span className="text-sm font-extrabold">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-extrabold">Detailed comparisons</span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/compare/insydzvshelium"
                    className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#d9cff0] bg-white dark:bg-gray-950 px-4 py-2.5 text-sm font-bold"
                  >
                    vs Helium 10 <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/compare/insydzvsjunglescout"
                    className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#d9cff0] bg-white dark:bg-gray-950 px-4 py-2.5 text-sm font-bold"
                  >
                    vs Jungle Scout <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/compare/insydzvsvirallaunch"
                    className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#d9cff0] bg-white dark:bg-gray-950 px-4 py-2.5 text-sm font-bold"
                  >
                    vs Viral Launch <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column — comparison table */}
            <div className="overflow-hidden rounded-[24px] border border-[#e9e3f5] bg-white dark:bg-gray-950 shadow-[0_20px_50px_rgba(40,20,90,0.07)]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr] items-center gap-2 bg-[#f6f1ff] dark:bg-violet-900/20 px-6 py-5 text-sm font-extrabold">
                <span className="text-[#5f5875] dark:text-gray-400">WHAT YOU GET</span>
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect x="4" y="18" width="5" height="10" rx="1.5" fill="#7c3aed" />
                    <rect x="13.5" y="12" width="5" height="16" rx="1.5" fill="#db2777" />
                    <rect x="23" y="5" width="5" height="23" rx="1.5" fill="#7c3aed" />
                  </svg>
                  Insydz
                </span>
                <span className="text-[#5f5875] dark:text-gray-400">Global tools</span>
              </div>
              {compareRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1.6fr_1fr_1fr] items-center gap-2 px-6 py-4 text-[15px] ${i > 0 ? "border-t border-[#f0ebf8]" : ""
                    }`}
                >
                  <span className="font-bold">{row.label}</span>
                  <span className="flex items-center gap-2 font-extrabold text-[#15803d] dark:text-green-400">
                    <Check className="h-4 w-4" />
                    {row.insydz}
                  </span>
                  <span className="text-[#5f5875] dark:text-gray-400">{row.global}</span>
                </div>
              ))}
              <div className="flex flex-col gap-3 border-t border-[#f0ebf8] bg-[#fcfaff] dark:bg-gray-900 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#4b4560] dark:text-gray-300">
                  Paid plans from <strong className="text-[#1a1033] dark:text-gray-50">₹1,999 per month</strong>
                </span>
                <PrimaryButton href="/login">
                  Start your free trial <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="Resources" className="scroll-mt-20 bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center gap-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <Eyebrow>LEARN</Eyebrow>
              <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px] lg:whitespace-nowrap">
                Learn Insydz in minutes
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300 lg:whitespace-nowrap">
              Free walkthroughs and playbooks from real sellers, including festive season prep for Diwali and Big Billion Days.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/resources/expert-blog",
                icon: BookOpen,
                title: "Expert blog",
                desc: "Strategies for Amazon India and Flipkart.",
              },
              {
                href: "/resources/case-studies",
                icon: FileText,
                title: "Success stories",
                desc: "Real numbers from Indian sellers.",
              },
              {
                href: "/resources/videos",
                icon: Video,
                title: "Video masterclasses",
                desc: "Step-by-step platform walkthroughs, seller workshops, marketplace strategy sessions.",
              },
              {
                href: "/resources/guides",
                icon: BookOpen,
                title: "Strategic playbooks",
                desc: "Festive prep, Buy Box recovery and more.",
              },
            ].map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="flex flex-col gap-5 rounded-[24px] border border-fuchsia-200 bg-white p-7 shadow-[0_12px_40px_-12px_rgba(217,70,239,0.15)] transition-all hover:shadow-[0_20px_50px_-10px_rgba(217,70,239,0.25)] hover:-translate-y-1 dark:border-fuchsia-900/50 dark:bg-gray-900/50"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-md shadow-pink-500/20">
                    <c.icon className="h-6 w-6 text-white" />
                  </span>
                  <h3 className="text-[20px] font-extrabold tracking-tight text-[#1a1033] dark:text-white leading-tight">
                    {c.title}
                  </h3>
                </div>
                <div className="flex items-start gap-3 text-[15.5px] leading-relaxed text-[#4b4560] dark:text-gray-300">
                  <Check className="mt-[3px] h-[18px] w-[18px] shrink-0 text-emerald-500" strokeWidth={2.5} />
                  <span>{c.desc}</span>
                </div>
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
            <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
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



      {/* Testimonials Section — the 3 seller stories from the design, star ratings + dark middle card */}
      <section id="Testimonials" className="scroll-mt-20 bg-[#fcfaff] dark:bg-gray-900 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>SELLER STORIES</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
              Sellers are growing with Insydz
            </h2>
            <p className="text-lg leading-relaxed text-[#4b4560] dark:text-gray-300">
              Real results from Indian sellers and agencies on Amazon and Flipkart.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className={`flex flex-col gap-4 rounded-[24px] p-7 ${t.dark
                  ? "bg-[#1a1033] text-white"
                  : "border border-[#eee9f7] bg-white dark:bg-gray-950 text-[#1a1033] dark:text-gray-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <StarRow />
                  <span className={`text-xs font-bold ${t.dark ? "text-[#c9c2dd]" : "text-[#4b4560] dark:text-gray-300"}`}>
                    {t.tag}
                  </span>
                </div>

                <div className={`text-[32px] font-extrabold tracking-[-0.02em] sm:text-4xl ${t.dark ? "text-[#c4b5fd]" : "text-violet-600 dark:text-violet-400"}`}>
                  {t.stat}
                </div>

                <blockquote className={`flex-grow text-[15px] leading-relaxed ${t.dark ? "text-[#c9c2dd]" : "text-[#4b4560] dark:text-gray-300"}`}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold ${t.avatarBg} ${t.avatarColor}`}>
                    {t.avatar}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-extrabold">{t.author}</span>
                    <span className={`text-[13px] ${t.dark ? "text-[#c9c2dd]" : "text-[#4b4560] dark:text-gray-300"}`}>{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="Pricing" className="scroll-mt-20 bg-white dark:bg-gray-950 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>PRICING</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl lg:text-[44px] lg:whitespace-nowrap">
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
              <SecondaryButton href="/about/contact-us" className="w-full">
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
              <h2 className="max-w-sm text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] sm:text-4xl">
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