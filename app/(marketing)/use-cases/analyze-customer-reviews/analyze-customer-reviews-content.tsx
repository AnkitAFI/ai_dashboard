// "use client";

// import { useState } from 'react';
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   ChevronDown, ChevronRight, ArrowRight,
//   CheckCircle2, Globe, Bell, Zap,
//   TrendingUp, Users, Target, AlertCircle,
//   BarChart3, Package,
//   ShoppingBag, Store, Briefcase,
//   Code, Trophy, BookOpen,
//   Search, MessageCircle, TrendingDown,
//   Flame, Presentation, LayoutGrid,
//   Star, Filter, RefreshCw, ThumbsUp, ThumbsDown,
//   Minus, AlertTriangle, Clock, Languages
// } from 'lucide-react';
// import { Button } from "@/components/ui/button";

// export const dynamic = "force-static";

// // ── SCHEMA ────────────────────────────────────────────────────────────
// const SCHEMAS = [
//   {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     "itemListElement": [
//       { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
//       { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
//       { "@type": "ListItem", "position": 3, "name": "Analyze Customer Reviews", "item": "https://insydz.com/use-cases/analyze-customer-reviews" }
//     ]
//   },
//   {
//     "@context": "https://schema.org",
//     "@type": "FAQPage",
//     "mainEntity": [
//       {
//         "@type": "Question",
//         "name": "How does Insydz analyse customer reviews on Amazon India and Flipkart?",
//         "acceptedAnswer": { "@type": "Answer", "text": "Insydz's AI sentiment analysis tool pulls every review from your product or a competitor's listing, classifies each as positive, neutral, or negative, and extracts recurring complaint and praise themes — in both Hindi and English." }
//       },
//       {
//         "@type": "Question",
//         "name": "How many reviews can Insydz analyse at once?",
//         "acceptedAnswer": { "@type": "Answer", "text": "Insydz can analyse up to 300 reviews per minute per product. A complete sentiment analysis is ready in under 2 minutes." }
//       },
//       {
//         "@type": "Question",
//         "name": "Can I analyse competitor product reviews with Insydz?",
//         "acceptedAnswer": { "@type": "Answer", "text": "Yes. The competitor review gap analyser surfaces the most common complaints in any competitor's reviews so you know exactly what to fix or highlight in your own listing." }
//       },
//       {
//         "@type": "Question",
//         "name": "Does the review analysis work in Hindi and other regional Indian languages?",
//         "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz analyses reviews written in Hindi, Hinglish, and transliterated text — unlike global tools that only process English reviews." }
//       },
//       {
//         "@type": "Question",
//         "name": "How is Insydz different from reading Amazon or Flipkart reviews manually?",
//         "acceptedAnswer": { "@type": "Answer", "text": "Manual reading gives anecdotes. Insydz gives patterns — complaint clusters by frequency, sentiment shifts over time, and competitor review gaps — all in under 2 minutes." }
//       }
//     ]
//   }
// ];

// // ── NAVIGATION (shared with other pages) ─────────────────────────────
// type MenuItemWithBadge = {
//   name: string;
//   icon: JSX.Element;
//   badge?: string;
//   route?: string;
// };

// type NavigationMenu = {
//   Solutions: MenuItemWithBadge[];
//   "Use Cases": MenuItemWithBadge[];
//   Features: MenuItemWithBadge[];
//   "Free Tools": MenuItemWithBadge[];
//   Resources: MenuItemWithBadge[];
//   Integrations: MenuItemWithBadge[];
//   Compare: MenuItemWithBadge[];
//   About: MenuItemWithBadge[];
// };

// const navigationMenu: NavigationMenu = {
//   Solutions: [
//     { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
//     { name: "For Amazon Sellers (India)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
//     { name: "For Flipkart Sellers", icon: <Store className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
//     { name: "For E-commerce Agencies", icon: <Briefcase className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
//     { name: "For Brand Managers", icon: <Users className="w-4 h-4" />, route: "/solutions/brand-managers" },
//   ],
//   "Use Cases": [
//     { name: "All Use Cases", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases" },
//     { name: "Track Competitor Prices", icon: <TrendingDown className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
//     { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
//     { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
//     { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
//     { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
//   ],
//   Features: [
//     { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
//     { name: "Competitor Price Tracking", icon: <TrendingDown className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
//     { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
//     { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
//     { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
//     { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
//     { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
//     { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
//     { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
//   ],
//   "Free Tools": [
//     { name: "Free Amazon Product Analyzer", icon: <BarChart3 className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
//     { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
//     { name: "Free Competitor Price Checker", icon: <TrendingDown className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
//     { name: "Free Keyword Rank Checker", icon: <Search className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
//   ],
//   Resources: [
//     { name: "Expert Blog", icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
//   ],
//   Integrations: [
//     { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
//     { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
//     { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
//     { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
//   ],
//   Compare: [
//     { name: "Insydz vs Helium 10", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
//     { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
//     { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
//   ],
//   About: [
//     { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
//     { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
//     { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
//   ],
// };

// // ── PAGE DATA ─────────────────────────────────────────────────────────

// const problemCards = [
//   {
//     title: "Thousands of reviews to read",
//     desc: "Top products on Amazon India and Flipkart accumulate thousands of reviews. Reading them manually is not a strategy — it is a full-time job with no output.",
//     iconBg: "bg-red-50",
//     icon: <AlertCircle className="w-5 h-5 text-red-500" />,
//   },
//   {
//     title: "Critical issues buried in data",
//     desc: "A recurring complaint buried across 300 reviews can destroy your conversion rate. Without an AI review analysis tool, this pattern stays invisible until sales collapse.",
//     iconBg: "bg-orange-50",
//     icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
//   },
//   {
//     title: "No way to spot patterns",
//     desc: "Sentiment shifts happen gradually. Without a review insights platform, sellers miss the early signals that a product quality issue is emerging — weeks before it shows in ratings.",
//     iconBg: "bg-green-50",
//     icon: <TrendingDown className="w-5 h-5 text-green-500" />,
//   },
//   {
//     title: "Competitor gaps stay hidden",
//     desc: "Your competitor's negative reviews are a product improvement roadmap — but only if you can read them at scale. Manual review reading means never seeing the opportunity.",
//     iconBg: "bg-purple-50",
//     icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
//   },
// ];

// const comparisonRows = [
//   { label: "Review language support", manual: "English only", insydz: "Hindi, Hinglish, and English — all platforms" },
//   { label: "Sentiment classification", manual: "Manual reading, subjective", insydz: "AI-scored positive / neutral / negative per review" },
//   { label: "Complaint theme detection", manual: "Not possible at scale", insydz: "Automatic complaint clusters ranked by frequency" },
//   { label: "Competitor review analysis", manual: "Manually reading competitor pages", insydz: "Competitor review gap analyser — instant" },
//   { label: "Festive pattern detection", manual: "Not available", insydz: "Diwali, Big Billion Days complaint surge alerts" },
//   { label: "Time to first insight", manual: "Hours to days", insydz: "Under 2 minutes" },
//   { label: "WhatsApp alerts on shifts", manual: "Not available", insydz: "Real-time alerts when negative sentiment spikes" },
// ];

// const steps = [
//   {
//     num: "Step 01",
//     title: "Connect Your Products",
//     desc: "Paste any Amazon India or Flipkart product URL or ASIN. Insydz pulls every review automatically — no spreadsheets, no copy-paste, no manual uploads.",
//     iconBg: "bg-purple-50",
//     icon: <Filter className="w-5 h-5 text-purple-600" />,
//   },
//   {
//     num: "Step 02",
//     title: "AI Analyses Everything",
//     desc: "Our AI sentiment analysis tool classifies every review, extracts recurring complaint and praise themes, and identifies competitor review gaps — in both Hindi and English.",
//     iconBg: "bg-indigo-50",
//     icon: <Zap className="w-5 h-5 text-indigo-600" />,
//   },
//   {
//     num: "Step 03",
//     title: "Get Clear Insights",
//     desc: "Receive a prioritised action list — top complaints to fix, top praises to amplify, and product improvements your competitor's negative reviews reveal. Act within minutes.",
//     iconBg: "bg-green-50",
//     icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
//   },
// ];

// const discoverCards = [
//   { title: "Sentiment Breakdown", desc: "Positive, neutral, and negative sentiment scored per product. Spot exactly which attributes drive praise and which drive complaints — at a glance.", kw: "AI sentiment analysis tool", kwBg: "bg-purple-50 text-purple-700", icon: <ThumbsUp className="w-5 h-5 text-purple-600" />, iconBg: "bg-purple-50" },
//   { title: "Top Complaint Clusters", desc: "Recurring complaints ranked by frequency — packaging, delivery, sizing, quality. Fix the top issue and watch your star rating climb within weeks.", kw: "review insights platform", kwBg: "bg-red-50 text-red-700", icon: <ThumbsDown className="w-5 h-5 text-red-500" />, iconBg: "bg-red-50" },
//   { title: "Top Praise Themes", desc: "The attributes buyers love most. Know exactly what to highlight in your listings and ads — backed by real buyer language from Amazon India and Flipkart.", kw: "customer review analysis tool", kwBg: "bg-orange-50 text-orange-700", icon: <Star className="w-5 h-5 text-amber-500" />, iconBg: "bg-amber-50" },
//   { title: "Competitor Review Gap Analysis", desc: "See what your competitors' buyers complain about most. Build a product that solves those exact problems and enter the category with a proven advantage.", kw: "AI review analysis tool", kwBg: "bg-green-50 text-green-700", icon: <Target className="w-5 h-5 text-green-600" />, iconBg: "bg-green-50" },
//   { title: "Review Trend Monitoring", desc: "Track how sentiment changes week-over-week. Catch a quality issue before it tanks your rating — and monitor competitor sentiment shifts for market signals.", kw: "Sentiment Analysis online", kwBg: "bg-sky-50 text-sky-700", icon: <TrendingUp className="w-5 h-5 text-sky-500" />, iconBg: "bg-sky-50" },
//   { title: "Hindi & English Review Analysis", desc: "Most Indian buyers write reviews in Hindi. Insydz is the only review insights platform that analyses Hindi and English reviews in a single dashboard.", kw: "Product Review Sentiment Checker", kwBg: "bg-amber-50 text-amber-700", icon: <Languages className="w-5 h-5 text-amber-500" />, iconBg: "bg-amber-50" },
// ];

// const indiaAdvantages = [
//   { title: "Hindi & Hinglish Sentiment Recognition", desc: "Analyses reviews written in Hindi, Hinglish, and transliterated text — missing sentiment that every global tool ignores.", color: "bg-purple-500/20", iconColor: "text-purple-300" },
//   { title: "Amazon India + Flipkart in One View", desc: "Compare review sentiment and complaint themes across both Indian marketplaces — the only tool that does this.", color: "bg-sky-500/20", iconColor: "text-sky-300" },
//   { title: "Festive Complaint Pattern Detection", desc: "Detects surges in complaint volume during Diwali, Big Billion Days, and other festive sales — fix issues before the peak window.", color: "bg-orange-500/20", iconColor: "text-orange-300" },
//   { title: "Competitor Review Gap Analyser", desc: "Surface product gaps from your competitor's negative reviews — a sourcing and listing advantage no manual reading could give you.", color: "bg-green-500/20", iconColor: "text-green-300" },
// ];

// const withoutRows = [
//   { label: "Avg. daily sessions on listing", val: "1,200", neg: true },
//   { label: "Conversion rate (unaddressed issue)", val: "1.4%", neg: true },
//   { label: "Monthly orders", val: "504", neg: true },
//   { label: "Avg. order value", val: "Rs 840", neg: true },
//   { label: "Monthly revenue", val: "Rs 4,23,360", neg: true },
// ];

// const withRows = [
//   { label: "Avg. daily sessions on listing", val: "1,200", neg: false },
//   { label: "Conversion rate (after fix)", val: "3.7%", neg: false },
//   { label: "Monthly orders", val: "1,332", neg: false },
//   { label: "Avg. order value", val: "Rs 840", neg: false },
//   { label: "Monthly revenue", val: "Rs 11,18,880", neg: false },
// ];

// const pricingPlans = [
//   {
//     plan: "Free Plan",
//     price: "Rs 0",
//     period: "Forever — no credit card required",
//     items: [
//       "3 products with full sentiment analysis",
//       "Top complaint and praise clusters",
//       "Hindi and English review support",
//       "Basic competitor review comparison",
//       "AI review analysis tool access",
//     ],
//     cta: "Start Free Now",
//     route: "/login",
//     featured: false,
//   },
//   {
//     plan: "Growth Plan",
//     price: "Rs 1,999",
//     period: "per month — billed in INR",
//     items: [
//       "Unlimited products analysed",
//       "Full sentiment breakdown and trend tracking",
//       "Competitor review gap analyser",
//       "Festive complaint pattern detection",
//       "WhatsApp alerts on sentiment shifts",
//       "Review insights platform — full access",
//     ],
//     cta: "Start Growth Plan",
//     route: "/login",
//     featured: true,
//   },
//   {
//     plan: "Scale Plan",
//     price: "Rs 4,999",
//     period: "per month — billed in INR",
//     items: [
//       "Everything in Growth Plan",
//       "Multi-marketplace review analysis",
//       "Agency-level multi-account access",
//       "Priority support in Hindi and English",
//       "Custom sentiment analysis reports",
//     ],
//     cta: "Start Scale Plan",
//     route: "/login",
//     featured: false,
//   },
// ];

// const faqs = [
//   { id: 1, question: "How does Insydz analyse customer reviews on Amazon India and Flipkart?", answer: "Insydz's AI sentiment analysis tool pulls every review from your product or a competitor's listing on Amazon India or Flipkart, classifies each as positive, neutral, or negative, and extracts recurring complaint and praise themes automatically — in both Hindi and English." },
//   { id: 2, question: "How many reviews can Insydz analyse at once?", answer: "Insydz can analyse up to 300 reviews per minute per product. For most Amazon India and Flipkart listings, a complete sentiment analysis is ready in under 2 minutes — no matter how many reviews exist on the listing." },
//   { id: 3, question: "Can I analyse competitor product reviews with Insydz?", answer: "Yes. The competitor review gap analyser lets you surface the most common complaints and gaps in any competitor's reviews. This tells you exactly what to build, fix, or highlight in your own product to capture dissatisfied buyers." },
//   { id: 4, question: "Does the review analysis work in Hindi and other regional Indian languages?", answer: "Yes. Insydz is built specifically for Indian marketplaces and analyses reviews written in Hindi, Hinglish, and transliterated text — not just English. This is a core advantage over global tools like Helium 10 and Jungle Scout that only process English reviews." },
//   { id: 5, question: "How is Insydz different from reading Amazon or Flipkart reviews manually?", answer: "Manual reading gives you anecdotes. Insydz gives you patterns. Our review insights platform processes thousands of reviews simultaneously, identifies complaint clusters by frequency, tracks sentiment shifts over time, and surfaces product gaps from competitor reviews — all in under 2 minutes." },
//   { id: 6, question: "Can I set alerts when negative sentiment appears in reviews?", answer: "Yes. Growth and Scale plan users receive WhatsApp alerts the moment a new complaint theme crosses a threshold on any tracked product. You catch quality issues before they impact your star rating — not after the damage is done." },
// ];

// export default function AnalyzeCustomerReviewsPage() {
//   const router = useRouter();
//   const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

//   const handleGetStarted = () => router.push("/login");

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950">

//       {/* Schema */}
//       {SCHEMAS.map((s, i) => (
//         <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
//       ))}

//       {/* ── BREADCRUMB ────────────────────────────────────────────────── */}
//       <div className="bg-gray-50 dark:bg-gray-900 border-b border-purple-100 dark:border-gray-800 py-2.5 px-4">
//         <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
//           <Link href="/" className="text-purple-600 hover:opacity-75">Home</Link>
//           <ChevronRight className="w-3 h-3" />
//           <Link href="/use-cases" className="text-purple-600 hover:opacity-75">Use Cases</Link>
//           <ChevronRight className="w-3 h-3" />
//           <span>Analyze Customer Reviews</span>
//         </div>
//       </div>

//       {/* ── HERO ──────────────────────────────────────────────────────── */}
//       <section className="bg-gradient-to-br from-purple-50 via-purple-100/60 to-blue-50 dark:from-gray-900 dark:via-purple-950/30 dark:to-gray-900 py-20 px-4 relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
//         <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_380px] gap-14 items-center relative">
//           <div>
//             {/* Primary keyword tag above H1 */}
//             <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-5">
//               <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//               <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">AI Sentiment Analysis Tool</span>
//             </div>
//             <h1 className="font-black text-gray-900 dark:text-white leading-tight mb-4" style={{ fontSize: "clamp(30px,4.5vw,50px)", letterSpacing: "-0.03em" }}>
//               Turn Customer Reviews Into{" "}
//               <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Actionable Insights</span>
//             </h1>
//             <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-8 leading-relaxed">
//               India's only <strong>customer review analysis tool</strong> built for Amazon India and Flipkart. Surface sentiment patterns, complaint themes, and product gaps in minutes — in Hindi and English.
//             </p>
//             <div className="flex items-center gap-3 flex-wrap">
//               <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold px-8 py-6 rounded-full shadow-xl group">
//                 Analyse Reviews Free for One Product <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//               </Button>
//               <Link href="/pricing" className="text-sm font-medium text-purple-600 border border-purple-300 px-5 py-3 rounded-full hover:border-purple-500 transition-colors">
//                 See Plans
//               </Link>
//             </div>
//           </div>

//           {/* Hero sentiment card */}
//           <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-900 rounded-3xl p-5 shadow-2xl shadow-purple-100 dark:shadow-none">
//             <div className="flex items-center justify-between mb-4">
//               <span className="text-xs font-bold text-gray-900 dark:text-white">Sentiment Dashboard Analysis</span>
//               <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
//               </span>
//             </div>
//             {/* Sentiment pills */}
//             <div className="grid grid-cols-3 gap-2 mb-4">
//               {[
//                 { pct: "82%", lbl: "Positive", bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-600" },
//                 { pct: "11%", lbl: "Neutral", bg: "bg-yellow-50 dark:bg-yellow-900/20", color: "text-yellow-600" },
//                 { pct: "7%", lbl: "Negative", bg: "bg-red-50 dark:bg-red-900/20", color: "text-red-600" },
//               ].map((p) => (
//                 <div key={p.lbl} className={`${p.bg} rounded-xl p-2.5 text-center`}>
//                   <div className={`text-xl font-black ${p.color}`}>{p.pct}</div>
//                   <div className="text-xs text-gray-500 dark:text-gray-400">{p.lbl}</div>
//                 </div>
//               ))}
//             </div>
//             {/* Complaint themes */}
//             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Top Complaint Themes</p>
//             {[
//               { name: "Packaging damage", pct: 72, color: "bg-red-400", count: "142" },
//               { name: "Delivery delay", pct: 55, color: "bg-orange-400", count: "108" },
//               { name: "Size mismatch", pct: 38, color: "bg-yellow-400", count: "74" },
//             ].map((t) => (
//               <div key={t.name} className="flex items-center gap-2 mb-2">
//                 <div className={`w-2 h-2 rounded-full ${t.color} flex-shrink-0`} />
//                 <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{t.name}</span>
//                 <div className="w-20 h-1.5 bg-purple-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
//                   <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
//                 </div>
//                 <span className="text-xs font-semibold text-gray-500 w-7 text-right">{t.count}</span>
//               </div>
//             ))}
//             <div className="mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-3">
//               <p className="text-xs text-white/90 leading-relaxed font-medium">
//                 A product issue mentioned in 300 reviews is actively destroying your conversion rate. Fix it before your competitor does.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── WHY MANUAL FAILS ──────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-6">
//               <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//               <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">The problem</span>
//             </div>
//             <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
//               Why Reading Reviews Manually{" "}
//               <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Is Impossible</span>
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               Every detail matters — but no seller can read thousands of reviews, spot patterns across platforms, and act fast enough.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-4 gap-4 mb-10">
//             {problemCards.map((card, i) => (
//               <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-purple-100 dark:border-gray-700 rounded-3xl p-6 flex flex-col h-full">
//                 <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{card.icon}</div>
//                 <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{card.desc}</p>
//               </div>
//             ))}
//           </div>
//           <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl p-5 text-center">
//             <p className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed">
//               <strong className="block text-lg font-black text-amber-700 dark:text-amber-400 mb-1">A product issue mentioned in 300 reviews is actively destroying your conversion rate.</strong>
//               Sign up free to find and fix review patterns before they cost you sales. Our <strong>AI sentiment analysis tool</strong> surfaces issues before they compound — in Hindi and English.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-6">
//               <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//               <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">Review analysis process</span>
//             </div>
//             <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
//               How Review Analysis Works{" "}
//               <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">with Insydz</span>
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               From product to insights in 2 minutes. No manual reading required.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-6 mb-12">
//             {steps.map((step, i) => (
//               <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-7 flex flex-col h-full">
//                 <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full inline-block w-fit mb-4">{step.num}</span>
//                 <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{step.icon}</div>
//                 <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//           <div className="text-center">
//             <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold px-8 py-6 rounded-full shadow-xl group">
//               Analyse Your First Product Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* ── DISCOVER GRID ─────────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-14">
//             <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-6">
//               <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//               <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">Stop Guessing What Customers Want. Know for Sure.</span>
//             </div>
//             <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
//               What You Discover with{" "}
//               <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Review Analysis</span>
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               Six layers of insight from every product's review data — each one directly actionable for Indian marketplace sellers.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-5">
//             {discoverCards.map((card, i) => (
//               <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col h-full">
//                 <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{card.icon}</div>
//                 <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">{card.desc}</p>
//                 <span className={`text-xs font-medium px-3 py-1 rounded-full inline-block w-fit ${card.kwBg}`}>{card.kw}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── INDIA DIFFERENCE ──────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-12 overflow-hidden relative">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
//             <div className="grid md:grid-cols-2 gap-12 items-start relative">
//               <div>
//                 <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Built for Indian marketplace reviews</p>
//                 <h2 className="text-3xl font-black text-white mb-4 leading-tight">How Insydz is Different — Built for Indian Marketplace Reviews</h2>
//                 <p className="text-gray-400 leading-relaxed mb-8">
//                   Global tools like Helium 10 and Jungle Scout analyse English-only reviews from Amazon.com. Indian sellers get sentiment data calibrated for US buyers, not Indian consumers who write in Hindi, Hinglish, and regional expressions. Insydz analyses Amazon India and Flipkart reviews natively — with Hindi sentiment recognition, festive complaint patterns, and INR-context product gap analysis built in.
//                 </p>
//                 <div className="grid grid-cols-3 gap-6">
//                   {[
//                     { val: "300+", lbl: "Reviews analysed per minute" },
//                     { val: "2 min", lbl: "Average time to first insight" },
//                     { val: "2x", lbl: "Platforms covered simultaneously" },
//                   ].map((s) => (
//                     <div key={s.lbl}>
//                       <div className="text-xl font-black text-purple-400 mb-1">{s.val}</div>
//                       <div className="text-xs text-gray-500">{s.lbl}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 {indiaAdvantages.map((adv, i) => (
//                   <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
//                     <div className={`w-8 h-8 rounded-lg ${adv.color} flex items-center justify-center flex-shrink-0`}>
//                       <CheckCircle2 className={`w-4 h-4 ${adv.iconColor}`} />
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold text-white mb-1">{adv.title}</p>
//                       <p className="text-xs text-gray-400 leading-relaxed">{adv.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── COST COMPARISON ───────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-6">
//               <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//               <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">AI review analysis tool</span>
//             </div>
//             <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
//               What One Unread Review Pattern{" "}
//               <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Costs You Every Month</span>
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               A single unaddressed complaint theme — seen by 121 buyers across 52 reviews — resulted in this seller losing a conversion rate they never recovered.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-2 gap-6 mb-8">
//             {/* Without */}
//             <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-red-200 dark:border-red-900 p-7">
//               <span className="text-sm font-bold text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">Without Insight — Monthly Impact</span>
//               {withoutRows.map((row, i) => (
//                 <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
//                   <span className="font-semibold text-red-500">{row.val}</span>
//                 </div>
//               ))}
//               <div className="mt-4 pt-4 border-t-2 border-red-200 dark:border-red-900">
//                 <span className="text-xl font-black text-red-600">Total monthly loss: -Rs 1,89,000</span>
//               </div>
//             </div>
//             {/* With */}
//             <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-green-200 dark:border-green-900 p-7">
//               <span className="text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">With Insight — Issue Resolved in 3 Minutes</span>
//               {withRows.map((row, i) => (
//                 <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
//                   <span className="font-semibold text-green-600">{row.val}</span>
//                 </div>
//               ))}
//               <div className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-900">
//                 <span className="text-xl font-black text-green-600">Total monthly gain: +Rs 6,95,520</span>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center">
//             <p className="text-purple-900 dark:text-purple-300 text-sm leading-relaxed">
//               <strong className="block text-lg font-black text-purple-700 dark:text-purple-400 mb-1">Rs 3,47 Lakh saved over 6 months — from a single review pattern found in 3 minutes.</strong>
//               That is the value Insydz's <strong>customer review analysis tool</strong> provides to Indian sellers every month.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* ── PRICING ───────────────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-6">
//               <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//               <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">Start free. Know what customers really think.</span>
//             </div>
//             <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
//               Free plan includes{" "}
//               <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">review analysis</span>
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               Every plan includes the AI sentiment analysis tool, complaint cluster detection, and competitor review gap analysis. No credit card required.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-6">
//             {pricingPlans.map((plan, i) => (
//               <div key={i} className={`rounded-3xl p-7 flex flex-col h-full ${plan.featured ? "bg-gradient-to-br from-purple-600 to-indigo-600" : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"}`}>
//                 <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-white/70" : "text-purple-600"}`}>{plan.plan}</p>
//                 <p className={`text-3xl font-black mb-1 ${plan.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.price}</p>
//                 <p className={`text-xs mb-5 ${plan.featured ? "text-white/60" : "text-gray-400"}`}>{plan.period}</p>
//                 <ul className="space-y-2.5 mb-6 flex-1">
//                   {plan.items.map((item, j) => (
//                     <li key={j} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/85" : "text-gray-600 dark:text-gray-400"}`}>
//                       <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${plan.featured ? "bg-white/20" : "bg-purple-100 dark:bg-purple-900/30"}`}>
//                         <CheckCircle2 className={`w-2.5 h-2.5 ${plan.featured ? "text-white" : "text-purple-500"}`} />
//                       </div>
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//                 <Link href={plan.route} className={`block w-full text-center font-bold py-3 px-6 rounded-full text-sm transition-all mt-auto ${plan.featured ? "bg-white text-purple-700 hover:bg-purple-50" : "bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:opacity-90"}`}>
//                   {plan.cta}
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ───────────────────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-gradient-to-br from-purple-700 to-indigo-600">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-4xl font-black mb-4 text-white">Stop Guessing. Know for Sure.</h2>
//           <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
//             India's only platform that analyses Amazon India and Flipkart reviews in Hindi and English — and tells you exactly what to fix to grow revenue.
//           </p>
//           <Button onClick={handleGetStarted} size="lg" className="bg-white text-purple-700 font-bold px-12 py-6 rounded-full shadow-2xl group hover:bg-purple-50 mb-12">
//             Analyse Reviews Free for One Product <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//           </Button>
//           <div className="flex justify-center gap-6 flex-wrap">
//             {[
//               { val: "Free", lbl: "3 products to start" },
//               { val: "2 min", lbl: "To first insight" },
//               { val: "Rs 1,999", lbl: "Growth plan per month" },
//             ].map((s) => (
//               <div key={s.lbl} className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center min-w-36">
//                 <div className="text-xl font-black text-white mb-1">{s.val}</div>
//                 <div className="text-xs text-white/60">{s.lbl}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FAQ ───────────────────────────────────────────────────────── */}
//       <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-3xl mx-auto">
//           <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 py-1.5 mb-6">
//             <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
//             <span className="text-xs font-medium text-purple-700 uppercase tracking-widest">Review Analysis FAQs</span>
//           </div>
//           <h2 className="text-4xl font-black mb-12 text-gray-900 dark:text-white">Common questions</h2>
//           <div className="space-y-4">
//             {faqs.map((faq) => (
//               <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
//                 <button
//                   onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
//                   className="w-full px-6 py-5 flex items-center justify-between text-left"
//                   aria-expanded={expandedFaq === faq.id}
//                 >
//                   <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
//                   {expandedFaq === faq.id
//                     ? <ChevronDown className="w-5 h-5 text-purple-500 flex-shrink-0" />
//                     : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
//                 </button>
//                 {expandedFaq === faq.id && (
//                   <div className="px-6 pb-5">
//                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <style>{`
//         @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fade-in { animation: fade-in 1s ease-out; }
//       `}</style>
//     </div>
//   );
// }







"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, MessageCircle, Search,
  ChevronRight, Star, AlertCircle, ChevronDown,
  ThumbsUp, ThumbsDown, Award, TrendingDown,
  AlertTriangle, Clock, Languages, Filter,
  Briefcase, Globe, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const FAQItem = ({
  q, a, index, openFaq, toggleFaq
}: {
  q: string; a: string; index: number; openFaq: number | null; toggleFaq: (i: number) => void;
}) => (
  <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm">
    <button
      onClick={() => toggleFaq(index)}
      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
    >
      <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg leading-relaxed">{q}</span>
      <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
    </button>
    {openFaq === index && (
      <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-3 sm:pt-4 text-xs sm:text-sm sm:text-base">{a}</p>
      </div>
    )}
  </div>
);

export default function AnalyzeCustomerReviewsPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => router.push("/login");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    {
      q: "How does Insydz analyse customer reviews on Amazon India and Flipkart?",
      a: "Insydz's AI sentiment analysis tool pulls every review from your product or a competitor's listing, classifies each as positive, neutral, or negative, and extracts recurring complaint and praise themes — in both Hindi and English. Complete analysis is ready in under 2 minutes.",
    },
    {
      q: "Can I analyse competitor product reviews with Insydz?",
      a: "Yes. Add any competitor ASIN or Flipkart listing and the AI analyses their reviews the same way it analyses yours. The competitor review gap analyser surfaces the most common complaints — turning their weaknesses into your product advantage before you even launch.",
    },
    {
      q: "How many reviews can Insydz analyse at once?",
      a: "Insydz can analyse up to 300 reviews per minute per product. For most Amazon India and Flipkart listings, a complete sentiment analysis is ready in under 2 minutes — no manual reading required.",
    },
    {
      q: "Does the review analysis work in Hindi and regional Indian languages?",
      a: "Yes. Insydz reads English, Hindi, Hinglish, and other Indian regional languages. Reviews in mixed language — very common among Indian buyers — are accurately processed and included in all analysis. This is a core advantage over global tools that only process English reviews.",
    },
    {
      q: "How is Insydz different from reading reviews manually?",
      a: "Manual reading gives anecdotes. Insydz gives patterns. Our review insights platform processes thousands of reviews simultaneously, identifies complaint clusters by frequency, tracks sentiment shifts over time, and surfaces product gaps from competitor reviews — all in under 2 minutes.",
    },
    {
      q: "Can Insydz alert me when new negative review patterns appear?",
      a: "Yes. Set ongoing monitoring for any product and receive WhatsApp alerts when a new negative theme crosses a threshold — before it becomes a visible rating drop and an organic rank penalty.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">

      {/* ══ HERO ══ */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-15 sm:opacity-20">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">

              {/* Primary keyword badge above H1 */}
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-purple-700">Customer Review Analysis Tool — Paired with India's Competitor Price Tracking Tool</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Turn Customer Reviews Into
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  Actionable Insights
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>customer review analysis tool</strong> for Amazon and Flipkart sellers. Paired with the leading <strong>competitor price tracking tool</strong>, Insydz gives you the complete picture — what customers say and what competitors do —
                <span className="text-purple-700 dark:text-purple-400 font-semibold"> so you can improve products, fix issues, and boost ratings.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group"
                >
                  Analyse Reviews Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-700 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all"
                >
                  See How It Works
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl transition-all hover:shadow-purple-500/10">
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm leading-relaxed">AI-Powered</p>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-base sm:text-lg leading-relaxed">Review Sentiment Analysis</h3>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {[
                    { icon: <ThumbsUp className="w-5 h-5 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 mx-auto mb-1 sm:mb-2" />, pct: "82%", label: "Positive", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700", textCls: "text-green-600 dark:text-green-400" },
                    { icon: <Star className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-1 sm:mb-2" />, pct: "11%", label: "Neutral", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700", textCls: "text-yellow-600 dark:text-yellow-400" },
                    { icon: <ThumbsDown className="w-5 h-5 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 mx-auto mb-1 sm:mb-2" />, pct: "7%", label: "Negative", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700", textCls: "text-red-600 dark:text-red-400" },
                  ].map((s, i) => (
                    <div key={i} className={`text-center p-2.5 sm:p-4 ${s.bg} border rounded-xl transition-all`}>
                      {s.icon}
                      <div className={`text-lg sm:text-2xl font-bold ${s.textCls} leading-relaxed`}>{s.pct}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">Top Complaint Clusters</p>
                  {[
                    { label: "Packaging damage", count: 142, pct: 100, color: "bg-red-500" },
                    { label: "Delivery delay", count: 108, pct: 76, color: "bg-orange-500" },
                    { label: "Size mismatch", count: 74, pct: 52, color: "bg-yellow-500" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.count} reviews</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY MANUAL FAILS ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Reading Reviews Manually
              <br />
              <span className="text-red-600 dark:text-red-500">Is Impossible</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Every Indian Amazon and Flipkart seller knows reviews matter. Most intend to read them. Almost none can keep up.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Thousands of reviews to read", desc: "and they grow every day", color: "from-red-500 to-orange-500" },
              { icon: <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Critical issues buried in noise", desc: "one real complaint hidden among 500 reviews", color: "from-orange-500 to-yellow-500" },
              { icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, title: "No way to spot patterns", desc: "you read 20 and miss the pattern in 300", color: "from-purple-500 to-pink-500" },
              { icon: <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitors learn faster", desc: "acting on insights you do not even know exist", color: "from-pink-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1 text-xs sm:text-base">{pain.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{pain.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg mb-5 sm:mb-6">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-2 sm:mb-3 leading-relaxed">
              A product issue mentioned in <span className="text-red-600 dark:text-red-400">300 reviews</span> is actively destroying your conversion rate.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed text-sm sm:text-base">
              Right now. And you will not find it by reading reviews one by one. By the time it becomes visible as a rating drop, you have already lost months of sales momentum. Our <strong>customer review analysis tool</strong> surfaces these patterns before they compound — and connects directly with our <strong>competitor price tracking tool</strong> so you see complaints and competitor moves in the same dashboard.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1.5 sm:mb-2 leading-relaxed">What most review tools do not tell you:</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">
              Most sellers who do analyse reviews use a simple star-filter or keyword search — which means they find what they are already looking for, not what they are missing. The complaints that damage conversion rates most are the ones phrased in 50 different ways across 400 reviews — none loud enough to notice alone, together impossible to ignore.
            </p>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Review Analysis Works
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">From product to insights in under 2 minutes. No research background required.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              { step: "1", title: "Connect Your Products", desc: "Paste any Amazon India or Flipkart product URL or ASIN. Insydz pulls every review automatically — no spreadsheets, no copy-paste, no manual uploads. Setup under 60 seconds.", icon: <Filter className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
              { step: "2", title: "AI Analyses Everything", desc: "AI reads every single review — in Hindi and English. Identifies sentiment, clusters similar complaints, flags praise themes, and surfaces competitor review gaps automatically.", icon: <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />, bg: "bg-pink-50 dark:bg-pink-900/20" },
              { step: "3", title: "Get Clear Insights", desc: "Plain-language ranked dashboard: Top complaint, top praise, competitor gap. Every insight is actionable — fix the top issue and your star rating begins climbing within weeks.", icon: <Award className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg flex-shrink-0">{item.step}</div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-relaxed">{item.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow">{item.desc}</p>
                <div className={`${item.bg} rounded-2xl p-3 sm:p-4 flex justify-center mt-auto`}>{item.icon}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group">
              Analyse Your First Product Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU DISCOVER ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Stop Guessing What Customers Want.
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Know for Sure.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "AI Sentiment Analysis Tool", title: "1. Sentiment Breakdown", desc: "See what percentage of reviews are positive, neutral, and negative — and compare against competitors. Track sentiment trends over time.", link: { text: "See how AI sentiment analysis works", href: "/features/review-analytics-feature" }, color: "from-green-500 to-emerald-500" },
              { icon: <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Pattern Detection", title: "2. Top Complaint Clusters", desc: "AI groups similar complaints — 'packet was torn', 'packaging damaged', 'box came broken' — all count as one problem. Most frequent issue appears first with review count.", link: null, color: "from-red-500 to-orange-500" },
              { icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Listing Intelligence", title: "3. Top Praise Themes", desc: "Know which product attributes buyers love most. Use those insights to rewrite listing bullets and title copy — backed by real buyer language, not assumptions.", link: null, color: "from-yellow-500 to-orange-500" },
              { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Competitive Intelligence", title: "4. Competitor Review Gap Analysis", desc: "Add any competitor ASIN. Insydz surfaces their top complaints — which become your product differentiation brief. Solve a proven problem before you even launch.", link: null, color: "from-blue-500 to-cyan-500" },
              { icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "WhatsApp Alerts", title: "5. Review Trend Monitoring", desc: "Track how sentiment and complaint themes change month by month. WhatsApp alert when a new negative theme appears — before it becomes a visible rating drop.", link: null, color: "from-purple-500 to-pink-500" },
              { icon: <Languages className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "India-First", title: "6. Hindi and Hinglish Review Analysis", desc: "Indian buyers write reviews in English, Hindi, and Hinglish. Insydz reads all of them — so you are not missing the insights your English-only competitors can never access.", link: null, color: "from-orange-500 to-red-500" },
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>{feature.icon}</div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide leading-relaxed">{feature.badge}</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2 sm:mb-3 leading-relaxed">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{feature.desc}</p>
                {feature.link && (
                  <button onClick={() => router.push(feature.link!.href)} className="mt-2 sm:mt-3 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold hover:underline text-left leading-relaxed">{feature.link.text}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INDIA-FIRST ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              How Insydz Is Different
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Built for Indian Marketplace Reviews</span>
            </h2>
          </div>

          {/* Real scenario */}
          <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-8 sm:mb-12 transition-all hover:shadow-2xl">
            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-4 md:mb-0">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 sm:mb-3 leading-relaxed">Real Seller Scenario — Personal Care Brand, Pune</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                  Ananya runs a premium face wash brand on Amazon India. Her product held a 4.1 rating for three months. Return rates were creeping up to 14% month-on-month. She assumed it was a listing issue. When she ran Insydz's <strong className="text-gray-900 dark:text-white">customer review analysis tool</strong> on her 680 reviews, the AI surfaced a single dominant complaint in 3 minutes: <strong className="text-gray-900 dark:text-white">pump dispenser leaks during delivery</strong> — mentioned across 127 reviews in various phrasings, including Hindi reviews she had never read.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  She passed the finding to her supplier. New pump mechanism. Updated packaging. Three weeks to implement. <strong className="text-gray-900 dark:text-white">Result: rating climbed 4.1 to 4.6. Returns dropped from 14% to 5%.</strong> The fix cost Rs 12 per unit. The return problem had been costing Rs 28,000 per month. Research time: 3 minutes. She also uses Insydz's <strong className="text-gray-900 dark:text-white">competitor price tracking tool</strong> to monitor rivals simultaneously — catching both product and pricing threats in one platform.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-relaxed">3 India-First Advantages</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">Built specifically for Indian marketplaces, buyer behaviour, and regional diversity.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Multilingual Processing", desc: "Reads English, Hindi, Hinglish, and regional languages — no Indian buyer feedback lost, no sentiment missed", color: "from-purple-500 to-pink-500" },
              { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Indian Complaint Pattern Recognition", desc: "Trained on Indian marketplace data — understands COD packaging complaints, festive gifting expectations, and return behaviours", color: "from-blue-500 to-cyan-500" },
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitor Analysis in Minutes", desc: "Analyse any Amazon India or Flipkart competitor — turn their complaints into your competitive advantage", color: "from-orange-500 to-red-500" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all h-full flex flex-col">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg flex-shrink-0`}>{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 leading-relaxed">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-xl">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">Capability</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">Manual Reading</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">Insydz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { capability: "Reviews covered", manual: "20 to 50 sample only", insydz: "Every review — 50 to 50,000+" },
                  { capability: "Pattern detection", manual: "None — impressionistic", insydz: "AI clusters complaints automatically" },
                  { capability: "Hindi and Hinglish reviews", manual: "Usually skipped", insydz: "Fully read and included" },
                  { capability: "Time to insight", manual: "4 to 8 hours per product", insydz: "Under 2 minutes" },
                  { capability: "Competitor analysis", manual: "Practically impossible", insydz: "Any ASIN, 2 minutes" },
                  { capability: "Ongoing monitoring", manual: "None", insydz: "WhatsApp alerts for new patterns" },
                ].map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 dark:border-gray-700 transition-colors ${i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}`}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm leading-relaxed">{row.capability}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-left text-red-500 dark:text-red-400 font-medium text-xs sm:text-sm leading-relaxed">{row.manual}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-left text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm leading-relaxed">{row.insydz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ ROI ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              What One Unread Review Pattern
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Costs You Every Month</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A single undetected product quality issue hiding across 127 reviews in varying phrasings costs Indian sellers far more than they realise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-10">
            {[
              {
                title: "Without Insight — Monthly Impact",
                icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
                titleCls: "text-red-600 dark:text-red-400",
                borderCls: "border-red-200 dark:border-red-800",
                rows: [
                  { label: "14% return rate on Rs 2 lakh monthly revenue", value: "Rs 28,000 lost" },
                  { label: "4.1 vs 4.6 rating conversion rate difference", value: "Rs 18,000 lost sales" },
                  { label: "Negative review accumulation — organic rank penalty", value: "Rs 12,000 traffic lost" },
                  { label: "Extra ad spend to compensate for lower organic rank", value: "Rs 9,000 additional" },
                ],
                totalLabel: "Total monthly cost of one unread complaint pattern",
                totalValue: "Rs 67,000",
                totalValueCls: "text-red-600 dark:text-red-400",
                totalBorderCls: "border-red-200 dark:border-red-800",
                valueCls: "text-red-600 dark:text-red-400",
              },
              {
                title: "With Insydz — Issue Detected in 3 Minutes",
                icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
                titleCls: "text-green-600 dark:text-green-400",
                borderCls: "border-green-200 dark:border-green-800",
                rows: [
                  { label: "Issue detected in week 3 instead of month 4", value: "3 months earlier" },
                  { label: "Rs 12 per unit packaging fix in 3 weeks", value: "Rs 12 per unit" },
                  { label: "Returns drop 14% to 5% — monthly recovery", value: "+Rs 25,200 per month" },
                  { label: "Rating climbs 4.1 to 4.6 — conversion uplift", value: "+Rs 16,000 per month" },
                  { label: "Organic rank recovery — reduced ad dependency", value: "+Rs 9,000 per month saved" },
                ],
                totalLabel: "Net monthly value recovered",
                totalValue: "+Rs 50,200",
                totalValueCls: "text-green-600 dark:text-green-400",
                totalBorderCls: "border-green-200 dark:border-green-800",
                valueCls: "text-green-600 dark:text-green-400",
              },
            ].map((panel, pi) => (
              <div key={pi} className={`bg-white dark:bg-gray-900 border-2 ${panel.borderCls} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col h-full transition-all hover:shadow-2xl`}>
                <h3 className={`text-base sm:text-xl font-black ${panel.titleCls} mb-4 sm:mb-6 flex items-center gap-2 leading-relaxed`}>{panel.icon} {panel.title}</h3>
                <div className="space-y-2 sm:space-y-3 flex-grow">
                  {panel.rows.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-2">
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{item.label}</span>
                      <span className={`font-bold ${panel.valueCls} flex-shrink-0 text-xs sm:text-sm leading-relaxed`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-between pt-4 sm:pt-6 border-t-2 ${panel.totalBorderCls} gap-2 mt-4`}>
                  <span className="font-black text-gray-900 dark:text-white text-xs sm:text-sm flex-1 leading-relaxed">{panel.totalLabel}</span>
                  <span className={`font-black ${panel.totalValueCls} text-base sm:text-xl ml-2 sm:ml-4 flex-shrink-0 leading-relaxed`}>{panel.totalValue}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300 mb-2 leading-relaxed">Rs 3.47 Lakh saved over 6 months</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg leading-relaxed">from catching one product issue 3 months earlier using Insydz's AI <strong>customer review analysis tool</strong>. The packaging fix cost Rs 12 per unit.</p>
          </div>
        </div>
      </section>

      {/* ══ FREE PLAN ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Start Free. Know What Customers
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Really Think.</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-xl transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 leading-relaxed">Rs 0</span>
              <span className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed">/ Forever — No credit card required</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-relaxed">Free Plan Includes:</p>
            <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              {[
                "AI review analysis for 3 products",
                "Sentiment breakdown — positive, neutral, negative",
                "Top complaint clusters with review counts",
                "Top praise themes identified",
                "Amazon India and Flipkart listings",
                "Hindi and Hinglish review processing",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-400 mb-1.5 sm:mb-2 leading-relaxed">Upgrade to unlock:</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Unlimited product analysis, competitor ASIN review analysis, continuous monitoring, WhatsApp alerts for new complaint patterns, full 90-day review trend history, and access to the <strong>competitor price tracking tool</strong> — all in one Growth Plan.</p>
            </div>
            <Button onClick={handleGetStarted} size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group">
              Analyse Reviews Free — No Card Needed
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">Stop Guessing. Know for Sure.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For New Sellers</h3>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 sm:mb-3 leading-relaxed">Free Plan</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Before you list, analyse competitor reviews to understand what buyers already complain about. Build those fixes into your product from day one. Launch with proven differentiation — not guesswork.</p>
              <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full text-sm py-5 transition-all">Start Free — No Card Needed</Button>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-700 border-2 border-purple-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all relative overflow-hidden flex flex-col h-full group hover:scale-[1.02]">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-md z-10">Most Popular</div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-relaxed">For Growing Sellers</h3>
              <p className="text-xs font-semibold text-purple-100 mb-2 sm:mb-3 leading-relaxed">Growth Plan</p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Doing Rs 5 lakh or more monthly? Every 0.1 drop in star rating costs measurable conversion. Growth Plan: unlimited analysis, continuous monitoring, WhatsApp alerts before problems become rating drops.</p>
              <Link href="/pricing" className="w-full bg-white hover:bg-gray-100 text-purple-700 font-bold rounded-full text-sm inline-block text-center py-2.5 px-4 transition-all">Try Growth Plan</Link>
            </div>

            <div className="bg-white dark:bg-gray-900 border-2 border-pink-200 dark:border-pink-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all sm:col-span-2 lg:col-span-1 flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For D2C Brands and Agencies</h3>
              <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-2 sm:mb-3 leading-relaxed">Strategic Demo</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Full portfolio review monitoring, cross-product sentiment comparison, competitor review mining, white-label insight reports, API access.</p>
              <Link href="/solutions/ecommerce-agencies" className="w-full border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold rounded-full text-sm inline-block text-center py-2 px-4 transition-all">Book a Demo</Link>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-8 text-xs sm:text-sm leading-relaxed">No credit card required &nbsp;·&nbsp; Setup in 60 seconds &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Review Analysis <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">FAQs</span>
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} openFaq={openFaq} toggleFaq={toggleFaq} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white leading-relaxed">
            Stop Guessing What Customers Want.
            <br />
            <span className="text-purple-100">Know for Sure.</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            India's most powerful customer review analysis tool — paired with the leading <strong className="text-white">competitor price tracking tool</strong> for Amazon India and Flipkart. Free to start.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-purple-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group transition-all">
            Analyse Reviews Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed">No credit card required &nbsp;·&nbsp; Setup in 60 seconds &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-purple-300 dark:border-purple-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base transition-all">
          Analyse Reviews Free
        </Button>
      </div>

      {/* Spacer so sticky CTA does not cover footer content */}
      <div className="lg:hidden h-16 sm:h-20" />
    </div>
  );
}
