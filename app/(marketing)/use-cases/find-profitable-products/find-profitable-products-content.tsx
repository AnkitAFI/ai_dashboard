// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { 
//   TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
//   TrendingUp, Search, Package, 
//   BarChart3, ChevronRight, AlertCircle, Clock,
//   Check, DollarSign, Eye, Sparkles,
//   ChevronDown, Filter, MapPin, Flame
// } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export const dynamic = "force-static";

// const comparisonRows = [
//   { feature: "Real demand on Amazon.in / Flipkart", manual: "⚠ Category browse only", insydz: "✓ Real search volume & sales velocity in INR" },
//   { feature: "Competition quality", manual: "⚠ Count top sellers manually", insydz: "✓ Competition gap score, weak sellers flagged" },
//   { feature: "Realistic profit margin", manual: "✗ Guesswork, no fee modelling", insydz: "✓ Profit/unit estimate including marketplace fees" },
//   { feature: "Demand trend", manual: "✗ No trend data, only snapshot", insydz: "✓ Demand velocity over 30/60/90 days" },
//   { feature: "Review gaps", manual: "✗ Would need to read 500+ reviews", insydz: "✓ AI review gap analysis — your differentiation brief" },
//   { feature: "Research time", manual: "✗ 2–4 weeks", insydz: "✓ Under 10 minutes" },
// ];

// const whatYouDiscover = [
//   { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Trending Products Before Saturation", desc: "See which categories are gaining search velocity on Amazon India and Flipkart so you can enter the market while competition is still low.", color: "from-green-500 to-emerald-500", link: "/features/demand-signals", linkLabel: "product demand analysis tool" },
//   { icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Profit Margin Estimates Per Unit", desc: "Insydz shows estimated profit per unit in INR factoring in Amazon.in and Flipkart fees, typical sourcing costs, and current price ranges. Know your numbers before you place a purchase order.", color: "from-blue-500 to-cyan-500", link: "/features/margin-calculator", linkLabel: "product margin calculator" },
//   { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competition Analysis & Gaps", desc: "Insydz flags categories where top sellers have weak ratings (below 4.0), low review counts, or listing quality gaps. These are your launch advantage points.", color: "from-purple-500 to-pink-500", link: "/features/product-research", linkLabel: "ecommerce product research tool" },
//   { icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Search Volume & Demand Data", desc: "Real demand signals from Indian marketplaces including festive season demand spikes for Diwali, Navratri, and Republic Day sale events.", color: "from-orange-500 to-red-500", link: "/features/demand-signals", linkLabel: "product demand analysis tool" },
//   { icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Best-Selling Categories", desc: "See which categories generate the highest GMV on Amazon India and Flipkart right now ranked by actual revenue performance.", color: "from-indigo-500 to-purple-500", link: "/features/product-research", linkLabel: "profitable product finder" },
//   { icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />, title: "AI Opportunity Score (1–100)", desc: "Every product opportunity gets a single AI score combining demand, competition, profitability, and timing. Higher score = stronger launch opportunity. No analysis paralysis just a clear ranked list.", color: "from-yellow-500 to-orange-500", link: "/use-cases/find-profitable-products", linkLabel: "product opportunity finder" },
// ];

// function Award(props: any) {
//   return <Sparkles {...props} />
// }

// const roiWithout = [
//   { label: "Initial inventory investment", value: "−₹3,00,000" },
//   { label: "Market oversaturated — 40% dead inventory", value: "−₹1,20,000" },
//   { label: "Ad spend to force visibility in competitive category", value: "−₹45,000" },
//   { label: "Dead inventory carrying cost and storage fees", value: "−₹22,000" },
//   { label: "Price drop required to clear stock (margin lost)", value: "−₹38,000" },
// ];

// const roiWith = [
//   { label: "Same budget validated with demand data", value: "₹3,00,000 invested wisely" },
//   { label: "Low-competition category page 1 in 14 days", value: "+organic rank from week 2" },
//   { label: "Differentiated product 4.6★ from month 1", value: "+conversion advantage" },
//   { label: "First-month sell-through (₹450 × 760 units)", value: "+₹3,42,000" },
//   { label: "2× reorders placed months 2–6", value: "+₹7,20,000" },
// ];

// const faqs = [
//   { id: "faq-1", q: "How does Insydz find profitable products on Amazon India and Flipkart?", a: "Insydz analyses millions of products across Amazon.in and Flipkart in real time combining demand signals, competition density, and profit margin estimates to generate an AI opportunity score from 1–100. Products with high demand, low competition, and healthy margins surface first." },
//   { id: "faq-2", q: "Can I find profitable products for both Amazon India and Flipkart?", a: "Yes. Insydz analyses product opportunities across both platforms simultaneously comparing demand levels and competition density for the same product, so you know which marketplace has the better opportunity right now." },
//   { id: "faq-3", q: "What makes a product 'profitable' according to Insydz?", a: "Four factors: demand strength, competition gap (weak top sellers?), margin viability (does price support profit after fees?), and timing (growing or saturating category?). Products scoring well on all four get a high AI opportunity score." },
//   { id: "faq-4", q: "Do I need product research experience to use Insydz?", a: "No. Enter your budget, target margin, and preferred categories. The AI surfaces opportunities in plain language: 'High demand, low competition estimated profit ₹450/unit.' No experience, spreadsheets, or specialist knowledge required." },
//   { id: "faq-5", q: "How often is product opportunity data updated?", a: "Continuously. Trending opportunities are flagged in real time. You can also set category alerts so you're notified when a new high-opportunity product appears even when you're not actively using the dashboard." },
//   { id: "faq-6", q: "Can I save products I'm interested in researching further?", a: "Yes. Save any opportunity to your watchlist and track how demand, competition, and margin scores change over time especially useful for validating seasonal trends before you commit to sourcing inventory for the Indian festive season." },
// ];

// export default function FindProfitableProductsPage() {
//   const router = useRouter();
//   const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

//   const handleGetStarted = () => router.push("/login");

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
//       {/* ══ HERO ══ */}
//       <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
//         <div className="absolute inset-0 opacity-20 sm:opacity-30">
//           <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400 rounded-full blur-3xl" />
//           <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-400 rounded-full blur-3xl" />
//         </div>

//         <div className="relative max-w-7xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
//             <div className="space-y-5 sm:space-y-6 lg:space-y-8">
//               <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
//                 </span>
//                 <span className="text-xs sm:text-sm font-medium text-blue-700">India's #1 Product Profitability Analysis Software 🇮🇳</span>
//               </div>

//               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
//                 Find Profitable Products
//                 <br />
//                 <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
//                   Before Your Competitors Do
//                 </span>
//               </h1>

//               <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
//                 India's most powerful <strong>product profitability analysis software</strong> for Amazon and Flipkart sellers with AI-powered insights that show you exactly what to sell next,
//                 <span className="text-blue-700 font-semibold"> backed by real demand data and margin calculations in INR.</span>
//               </p>

//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                 <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group">
//                   Discover Profitable Products Free
//                   <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//                 </Button>
//               </div>
//             </div>

//             {/* Hero Visual */}
//             <div className="relative mt-4 lg:mt-0">
//               <div className="relative bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl">
//                 <div className="space-y-3 sm:space-y-4">
//                   <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
//                     <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Top Opportunities Today</h3>
//                     <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold">12 New</span>
//                   </div>

//                   {[
//                     { name: "Smart Kitchen Gadgets", demand: "High", competition: "Low", profit: "₹450", score: "88/100", trend: "up" },
//                     { name: "Eco-Friendly Home Decor", demand: "Medium", competition: "Low", profit: "₹380", score: "74/100", trend: "up" },
//                     { name: "Tech Accessories", demand: "High", competition: "Medium", profit: "₹290", score: "65/100", trend: "stable" },
//                   ].map((product, i) => (
//                     <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md">
//                       <div className="flex items-start justify-between mb-2 sm:mb-3">
//                         <div className="min-w-0 flex-1">
//                           <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{product.name}</h4>
//                           <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
//                             <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded">Demand: {product.demand}</span>
//                             <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1.5 sm:px-2 py-0.5 rounded">Competition: {product.competition}</span>
//                           </div>
//                         </div>
//                         {product.trend === "up" ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0 ml-2" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />}
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600 dark:text-gray-400">Avg. Profit/Unit: <span className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">{product.profit}</span></span>
//                         <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">Score: {product.score}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
//                   <p className="text-white font-bold text-xs sm:text-sm">AI Powered</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ══ WHY SELLERS PICK WRONG PRODUCTS ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
//               Why Most Sellers Pick
//               <br />
//               <span className="text-red-600">The Wrong Products</span>
//             </h2>
//             <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
//               The biggest mistake Indian Amazon and Flipkart sellers make isn't in their operations it's in their product selection. Most sellers launch on instinct, copy competitors, or rely on outdated research methods.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
//             {[
//               { icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Guessing based on gut feeling, not real demand data", color: "from-red-500 to-orange-500" },
//               { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Entering oversaturated markets too late after competitors are entrenched", color: "from-orange-500 to-yellow-500" },
//               { icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Missing hidden profit opportunities that aren't obvious from browsing", color: "from-blue-500 to-indigo-500" },
//               { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Wasting weeks on manual research that still gives incomplete data", color: "from-indigo-500 to-purple-500" },
//             ].map((pain, i) => (
//               <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all group">
//                 <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
//                 <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-sm sm:text-base">{pain.title}</p>
//               </div>
//             ))}
//           </div>

//           <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
//             <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
//               <span className="text-red-600">67% of new sellers</span> fail in their first year
//             </p>
//             <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg leading-relaxed">
//               ...because they launch products without proper market research investing in inventory before validating demand, margins, or competition levels on Indian marketplaces.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* ══ MANUAL VS INSYDZ ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
//               Why Manual Product Research
//               <br />
//               <span className="text-red-600">Fails Indian Sellers</span>
//             </h2>
//             <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
//               Most sellers spend 2–4 weeks manually researching products before launch. Here's the critical data they miss.
//             </p>
//           </div>

//           <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl mb-6 sm:mb-8">
//             <div className="min-w-[480px]">
//               <div className="grid grid-cols-3">
//                 <div className="bg-gray-100 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">What You Need to Know</p></div>
//                 <div className="bg-gray-100 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-500 text-xs sm:text-sm text-left">Manual Research</p></div>
//                 <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-blue-500"><p className="font-bold text-white text-xs sm:text-sm text-left">✓ Insydz</p></div>
//                 {comparisonRows.map((row, i) => (
//                   <div key={i} className="contents">
//                     <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{row.feature}</p></div>
//                     <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 text-left ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{row.manual}</p></div>
//                     <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 text-left ${i % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/10" : "bg-blue-50/50 dark:bg-blue-900/10"}`}><p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 font-semibold leading-relaxed">{row.insydz}</p></div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-5 sm:p-6 shadow-md">
//             <div className="flex items-start gap-3 sm:gap-4">
//               <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
//                 <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//               </div>
//               <div>
//                 <p className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base leading-relaxed">India-First Differentiator</p>
//                 <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
//                   Global tools like Jungle Scout and Helium 10 are calibrated for Amazon.com not Amazon.in. Their demand estimates, competition scores, and profitability calculations are built on US marketplace behaviour. Indian category dynamics, price sensitivity, festive demand cycles, and marketplace fee structures are completely different. Insydz is the only <strong>product opportunity finder</strong> built on Indian marketplace data from the ground up.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ══ HOW IT WORKS ══ */}
//       <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-10 sm:mb-16">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
//               How Product Discovery Works
//               <br />
//               <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">with Insydz</span>
//             </h2>
//             <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
//               From zero to validated product opportunity in under 10 minutes no research experience needed.
//             </p>
//           </div>

//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
//             <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 -translate-y-1/2 z-0" />
//             {[
//               { step: 1, title: "Set Your Criteria", desc: "Tell Insydz your budget, target margin, and preferred categories. AI filters millions of products across Amazon India and Flipkart instantly.", visual: <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto" />, bg: "bg-blue-100 dark:bg-blue-900/20", isResults: false },
//               { step: 2, title: "AI Analyses Market Data", desc: "We analyse demand signals, competition density, pricing trends, profitability margins, and review gap opportunities calibrated for Indian marketplace behaviour.", visual: <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto animate-pulse" />, bg: "bg-purple-100 dark:bg-purple-900/20", isResults: false },
//               { step: 3, title: "Get Winning Products", desc: "", visual: null, bg: "bg-green-100 dark:bg-green-900/20", isResults: true },
//             ].map((step, i) => (
//               <div key={i} className="relative z-10">
//                 <div className="bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all h-full">
//                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg">{step.step}</div>
//                   <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-relaxed">{step.title}</h3>
//                   {step.isResults ? (
//                     <div className="grid grid-rows-3 gap-2 sm:gap-3 text-left">
//                       {[
//                         { cls: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700", icon: "text-green-600", text: '"High demand, low competition product found"' },
//                         { cls: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700", icon: "text-blue-600", text: '"Estimated profit: ₹450/unit"' },
//                         { cls: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700", icon: "text-indigo-600", text: '"Top sellers have 3.7 rating — gap to win"' },
//                       ].map((a, ai) => (
//                         <div key={ai} className={`flex items-center gap-2 ${a.cls} border rounded-lg p-3 transition-all hover:translate-x-1`}>
//                           <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${a.icon} flex-shrink-0`} />
//                           <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-300 leading-snug">
//                             {a.text}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <>
//                       <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{step.desc}</p>
//                       <div className={`${step.bg} rounded-2xl p-3 sm:p-4`}>{step.visual}</div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-8 sm:mt-12">
//             <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group">
//               Find Your First Profitable Product Free
//               <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* ══ WHAT YOU DISCOVER ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
//               What You Discover with
//               <br />
//               <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Product Research</span>
//             </h2>
//           </div>

//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
//             {whatYouDiscover.map((item, i) => (
//               <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all h-full flex flex-col">
//                 <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-md flex-shrink-0`}>{item.icon}</div>
//                 <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5 sm:mb-2 leading-relaxed">{item.title}</h3>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 flex-grow">{item.desc}</p>
//                 <Link href={item.link} className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline transition-colors">See {item.linkLabel} →</Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ INDIA-FIRST + SELLER SCENARIO ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
//               How Insydz Is Different
//               <br />
//               <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Built on Indian Marketplace Data</span>
//             </h2>
//           </div>

//           {/* Scenario */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 shadow-lg">
//             <div className="flex items-center gap-3 mb-4 sm:mb-6">
//               <div>
//                 <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Real Seller Scenario</p>
//                 <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed">Home Décor Seller, Jaipur</p>
//               </div>
//             </div>
//             <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">Priya sells home décor on Amazon India. In October, she was planning to launch LED strip lights for the Diwali season. Her instinct said "popular" but she had no data to back up how much to source or whether the market was already crowded.</p>
//             <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">Using Insydz's <strong>product demand analysis tool</strong>, she ran a 10-minute analysis. Results: "LED strip lights for bedroom" had 340% higher search velocity in Nov–Dec. But the top 4 sellers all had ratings below 3.9, primarily due to cable quality complaints and unclear installation guides.</p>
//             <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">Priya launched with upgraded braided cables and a Hindi installation card. Her listing converted at 4.8 stars from week two.</p>
//             <div className="grid grid-cols-3 gap-2 sm:gap-4">
//               {[{ label: "First Month GMV", value: "₹3.4 Lakhs" },{ label: "Rating from Week 2", value: "4.8 ★" },{ label: "Research Time", value: "10 minutes" }].map((stat, i) => (
//                 <div key={i} className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 text-center transition-all hover:scale-105">
//                   <p className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400 leading-relaxed">{stat.value}</p>
//                   <p className="text-xs text-gray-500 mt-1 leading-relaxed">{stat.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-relaxed">
//               4 India-First Advantages
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
//               Built specifically for Indian e-commerce sellers not adapted from global tools.
//             </p>
//           </div>

//           {/* 4 India-First Advantages */}
//           <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
//             {[
//               { icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Indian Demand Cycles", desc: "Calibrated for Diwali, Navratri, Republic Day not Black Friday or Prime Day.", color: "from-orange-500 to-red-500" },
//               { icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Accurate INR Profit Modelling", desc: "Margin estimates factor in Amazon India and Flipkart fee structures not US equivalents.", color: "from-green-500 to-emerald-500" },
//               { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Tier 1–3 City Demand Intelligence", desc: "Demand signals from all-India activity not just Delhi/Mumbai/Bengaluru.", color: "from-blue-500 to-cyan-500" },
//               { icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Review Gap Analysis", desc: "AI reads competitor reviews to surface product differentiation brief (250,000+ reviews analysed daily).", color: "from-purple-500 to-pink-500" },
//             ].map((adv, i) => (
//               <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 flex items-start gap-3 sm:gap-4 hover:border-blue-400 transition-all">
//                 <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${adv.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}>{adv.icon}</div>
//                 <div>
//                   <p className="font-bold text-gray-900 dark:text-white mb-1 text-sm sm:text-base leading-relaxed">{adv.title}</p>
//                   <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{adv.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ ROI ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
//               The Cost of Launching Without
//               <br />
//               <span className="text-red-600">Product Profitability Analysis</span>
//             </h2>
//             <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
//               Two sellers launch in the same category on Amazon India. Both invest ₹3L in initial inventory. The only difference: one uses Insydz's <strong>product opportunity finder</strong>. One doesn't.
//             </p>
//           </div>

//           <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-6 sm:mb-8">
//             {[
//               { title: "Without Insydz 6-Month Launch Outcome", rows: roiWithout, total: "Total Cost of Wrong Product Selection", totalValue: "−₹1,05,000", headerCls: "bg-red-50 dark:bg-red-900/30", textCls: "text-red-700 dark:text-red-400", valueCls: "text-red-600", totalBg: "bg-red-50 dark:bg-red-900/20", totalTextCls: "text-red-700", borderCls: "border-red-300 dark:border-red-700" },
//               { title: "With Insydz Same 6-Month Period", rows: roiWith, total: "6-Month Net Revenue", totalValue: "+₹10,62,000", headerCls: "bg-green-50 dark:bg-green-900/30", textCls: "text-green-700 dark:text-green-400", valueCls: "text-green-600", totalBg: "bg-green-50 dark:bg-green-900/20", totalTextCls: "text-green-700", borderCls: "border-green-300 dark:border-green-700" },
//             ].map((panel, pi) => (
//               <div key={pi} className={`rounded-2xl border-2 ${panel.borderCls} overflow-hidden shadow-lg h-full flex flex-col`}>
//                 <div className={`${panel.headerCls} px-4 sm:px-6 py-3 sm:py-4`}><p className={`font-bold ${panel.textCls} text-sm sm:text-base lg:text-lg leading-relaxed`}>{panel.title}</p></div>
//                 <div className="bg-white dark:bg-gray-900 flex-grow">
//                   {panel.rows.map((row, i) => (
//                     <div key={i} className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 gap-2 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
//                       <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">{row.label}</p>
//                       <p className={`text-xs sm:text-sm font-bold ${panel.valueCls} whitespace-nowrap flex-shrink-0 leading-relaxed`}>{row.value}</p>
//                     </div>
//                   ))}
//                   <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 ${panel.totalBg} gap-2`}>
//                     <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm flex-1 leading-relaxed">{panel.total}</p>
//                     <p className={`font-black ${panel.totalTextCls} text-base sm:text-lg ml-2 whitespace-nowrap flex-shrink-0 leading-relaxed`}>{panel.totalValue}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-400 rounded-2xl p-5 sm:p-6 text-center shadow-md">
//             <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-2 leading-relaxed">₹11.67L difference between a validated product launch and a gut-feel launch</p>
//             <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">Same budget. Same category. Same marketplaces. The only variable: whether you used <strong>product profitability analysis software</strong> before you sourced.</p>
//           </div>
//         </div>
//       </section>

//       {/* ══ FREE PLAN ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
//             Start Free.
//             <br />
//             <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">See Real Opportunities.</span>
//           </h2>
//           <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 leading-relaxed">Free Plan — ₹0 / Forever No credit card required</p>

//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-left shadow-xl">
//             <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-4 sm:mb-6 text-center leading-relaxed">Free Plan Includes:</h3>
//             <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
//               {["Product opportunity discovery on Amazon India and Flipkart","AI opportunity scores (1–100) for every product","Competition analysis & gaps","Profit margin estimates in INR","Search volume & demand data","Save products to watchlist"].map((feature, i) => (
//                 <div key={i} className="flex items-start gap-2 sm:gap-3">
//                   <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                   <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{feature}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left shadow-sm">
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 leading-relaxed">
//               <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
//               <span><strong className="text-gray-900 dark:text-white">Upgrade teaser:</strong> Paid plans unlock unlimited product research, full 90-day demand history, advanced margin modelling, review gap deep-dives, and real-time opportunity alerts for your saved categories.</span>
//             </p>
//           </div>

//           <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl transition-all group">
//             Discover Profitable Products Free
//             <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//           </Button>
//         </div>
//       </section>

//       {/* ══ ICP CTAs ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-6 text-white leading-relaxed">Stop Guessing.<br />Start Selling Winners.</h2>
//           <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-12 leading-relaxed">Join sellers who find profitable products with AI-powered research, not luck.</p>

//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
//             {[
//               { label: "New Sellers (Free Plan)", desc: "The free plan validates your first product idea before you spend a rupee on inventory. No experience needed the AI does the analysis, you make the call.", cta: "Start Free — No Card Needed →", action: handleGetStarted },
//               { label: "Growing Sellers (Growth Plan)", desc: "Doing ₹5L+ monthly and planning your next SKU? The Growth Plan unlocks unlimited research, full demand history, advanced margin modelling, and automated alerts.", cta: "Try Growth Plan →", action: () => router.push("/pricing") },
//               { label: "D2C Brands / Agencies (Demo)", desc: "Managing multiple product launches? Custom workflows, white-label opportunity reports, API access, and dedicated account support.", cta: "Book a Demo →", action: () => router.push("/about/contact-us") },
//             ].map((card, i) => (
//               <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 text-left flex flex-col transition-all hover:bg-white/15">
//                 <p className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base leading-relaxed">{card.label}</p>
//                 <p className="text-white/80 text-xs sm:text-sm mb-4 leading-relaxed flex-grow">{card.desc}</p>
//                 {card.cta === "Try Growth Plan →" ? (
//                   <Link href="/pricing" className="text-white font-semibold text-xs sm:text-sm hover:underline transition-colors">{card.cta}</Link>
//                 ) : card.cta === "Book a Demo →" ? (
//                   <Link href="/about/contact-us" className="text-white font-semibold text-xs sm:text-sm hover:underline transition-colors">{card.cta}</Link>
//                 ) : (
//                   <Link href="/login" className="text-white font-semibold text-xs sm:text-sm hover:underline transition-colors">{card.cta}</Link>
//                 )}
//               </div>
//             ))}
//           </div>

//           <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-blue-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl transition-all group">
//             Discover Profitable Products Free
//             <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
//           </Button>
//           <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed">✓ No credit card required  ✓ Setup in 2 minutes  ✓ Cancel anytime</p>
//         </div>
//       </section>

//       {/* ══ FAQ ══ */}
//       <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-3xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-4 text-center text-gray-900 dark:text-white leading-relaxed">Product Research FAQs</h2>
//           <p className="text-center text-gray-500 mb-8 sm:mb-12 text-base sm:text-lg leading-relaxed">About Finding Profitable Products on Amazon & Flipkart India</p>
//           <div className="space-y-3 sm:space-y-4">
//             {faqs.map((faq) => (
//               <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-blue-300 transition-all shadow-sm">
//                 <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                   <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg leading-relaxed">{faq.q}</span>
//                   {expandedFaq === faq.id ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
//                 </button>
//                 {expandedFaq === faq.id && (
//                   <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-gray-50 dark:bg-gray-700/30 leading-relaxed">
//                     <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm sm:text-base">{faq.a}</p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ══ STICKY MOBILE CTA ══ */}
//       <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-blue-300 dark:border-blue-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
//         <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base transition-all">
//           Find Profitable Products Free
//         </Button>
//       </div>

//       {/* Spacer so sticky CTA doesn't cover footer content */}
//       <div className="lg:hidden h-16 sm:h-20" />
//     </div>
//   );
// }








"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  Smartphone, BarChart3, Package,
  ShoppingBag, Store, Briefcase,
  Code, Trophy, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown,
  Flame, Presentation, LayoutGrid,
  Star, Award, Database, Cpu, Filter, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

// ── SCHEMA ───────────────────────────────────────────────────────────
const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Find Profitable Products", "item": "https://insydz.com/use-cases/find-profitable-products" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Insydz find profitable products on Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz's product research tool analyses real search volumes, competitor pricing, review sentiment, and margin data from Amazon India and Flipkart simultaneously. Every product receives an Opportunity Score out of 100, combining demand, competition, and profit potential in INR." }
      },
      {
        "@type": "Question",
        "name": "How long does Insydz take to analyse and score products?",
        "acceptedAnswer": { "@type": "Answer", "text": "Most sellers complete their first product research session in under 2 hours. Set your budget, category, and margin criteria and Insydz filters, scores, and ranks matching opportunities automatically." }
      },
      {
        "@type": "Question",
        "name": "Can I find profitable products for both Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz is the only product profitability analysis software that covers both Amazon India and Flipkart in a single dashboard." }
      },
      {
        "@type": "Question",
        "name": "What makes a product profitable according to Insydz?",
        "acceptedAnswer": { "@type": "Answer", "text": "The product margin calculator scores profitability based on your input costs, Amazon India or Flipkart fees, estimated sourcing price, and current competitive pricing. A product is flagged as profitable when projected margin exceeds your defined floor." }
      },
      {
        "@type": "Question",
        "name": "How often is the product opportunity data updated?",
        "acceptedAnswer": { "@type": "Answer", "text": "The opportunity finder tool refreshes marketplace data daily. Search volume trends, competitor pricing, and inventory levels are updated every 24 hours." }
      }
    ]
  }
];

// ── NAVIGATION ────────────────────────────────────────────────────────
type MenuItemWithBadge = {
  name: string;
  icon: JSX.Element;
  badge?: string;
  route?: string;
};

type NavigationMenu = {
  Solutions: MenuItemWithBadge[];
  "Use Cases": MenuItemWithBadge[];
  Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[];
  Resources: MenuItemWithBadge[];
  Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[];
  About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers", icon: <Store className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies", icon: <Briefcase className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers", icon: <Users className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <TrendingDown className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer", icon: <BarChart3 className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <TrendingDown className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker", icon: <Search className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name: "Expert Blog", icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    { name: "Insydz vs Helium 10", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
    { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

// ── PAGE DATA ─────────────────────────────────────────────────────────

const wrongCards = [
  {
    title: "No demand validation",
    desc: "Sellers guess at demand without access to a product demand analysis tool. Real search volume on Amazon India and Flipkart stays invisible.",
    iconBg: "bg-red-50",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  {
    title: "No margin calculator",
    desc: "Without a product margin calculator, sellers discover poor margins only after sourcing. By that point the damage is already done.",
    iconBg: "bg-orange-50",
    icon: <IndianRupee className="w-5 h-5 text-orange-500" />,
  },
  {
    title: "Missing opportunity signals",
    desc: "Without an opportunity finder tool, sellers miss rising trends 3 to 4 weeks before they peak. That is exactly when first movers capture the highest margins.",
    iconBg: "bg-green-50",
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
  },
  {
    title: "No competitive context",
    desc: "Indian sellers choose saturated categories because they have no product opportunity analysis tool to benchmark real competition levels in INR markets.",
    iconBg: "bg-blue-50",
    icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
  },
];

const comparisonRows = [
  { label: "Demand data source", manual: "Amazon bestseller list (delayed)", insydz: "Live search volume on Amazon.in and Flipkart" },
  { label: "Margin calculation", manual: "Manual spreadsheet, error prone", insydz: "Automated product margin calculator in INR" },
  { label: "Competition analysis", manual: "Count listings manually", insydz: "AI-scored competition index per category" },
  { label: "Festive demand forecast", manual: "Not available", insydz: "Diwali, Big Billion Days, Republic Day forecasts" },
  { label: "Opportunity Scoring", manual: "Not available", insydz: "Opportunity Score out of 100 per SKU" },
  { label: "Time to research decision", manual: "3 to 4 weeks", insydz: "Under 2 hours" },
  { label: "Review language support", manual: "English only", insydz: "Hindi and English review sentiment analysis" },
];

const steps = [
  {
    num: "Step 01",
    title: "Set your criteria",
    desc: "Define your budget, target margin, and category. The product research tool filters millions of SKUs to only those that match your business parameters.",
    iconBg: "bg-blue-50",
    icon: <Filter className="w-5 h-5 text-blue-600" />,
  },
  {
    num: "Step 02",
    title: "AI analyses market data",
    desc: "Our product opportunity analysis tool scores every product across demand, competition, and margin. It combines real Amazon India and Flipkart data in one place.",
    iconBg: "bg-sky-50",
    icon: <Cpu className="w-5 h-5 text-sky-600" />,
  },
  {
    num: "Step 03",
    title: "Get winning products",
    desc: "Receive a ranked shortlist with Opportunity Scores. Each recommendation includes margin projections, trend trajectory, and competitor context.",
    iconBg: "bg-green-50",
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  },
];

const discoverCards = [
  { title: "Trending Products Before Launch", desc: "Identify products gaining momentum on Amazon India and Flipkart 3 to 4 weeks before they peak. First-mover advantage is captured with the opportunity finder tool.", kw: "profitable product finder", kwBg: "bg-blue-50 text-blue-700", icon: <TrendingUp className="w-5 h-5 text-blue-600" />, iconBg: "bg-blue-50" },
  { title: "Profit Margin Estimates in INR", desc: "The product margin calculator runs automatically for every SKU. It factors in Amazon fees, sourcing cost, and shipping so you know profit before placing a single order.", kw: "product margin calculator", kwBg: "bg-orange-50 text-orange-700", icon: <IndianRupee className="w-5 h-5 text-orange-500" />, iconBg: "bg-orange-50" },
  { title: "Competitor Analysis and Gaps", desc: "See exactly who ranks in your target category, what they charge, and where the gaps are. Surface categories where competition is low but demand is rising.", kw: "product opportunity analysis tool", kwBg: "bg-green-50 text-green-700", icon: <Search className="w-5 h-5 text-green-600" />, iconBg: "bg-green-50" },
  { title: "Search Volume and Demand Data", desc: "Real buyer search data from Amazon India and Flipkart. The product demand analysis tool shows monthly search trends so you know if demand is genuine or seasonal.", kw: "product demand analysis tool", kwBg: "bg-sky-50 text-sky-700", icon: <BarChart3 className="w-5 h-5 text-sky-500" />, iconBg: "bg-sky-50" },
  { title: "Best-Selling Categories", desc: "Category-level analysis surfaces where Indian buyers are spending most. Identify adjacent categories before your competitors discover them.", kw: "product research tool", kwBg: "bg-amber-50 text-amber-700", icon: <Star className="w-5 h-5 text-amber-500" />, iconBg: "bg-amber-50" },
  { title: "Opportunity Score out of 100", desc: "Every product gets a single Opportunity Score combining demand, competition, and margin. Instantly prioritise your shortlist using the product opportunity finder.", kw: "opportunity finder tool", kwBg: "bg-blue-50 text-blue-700", icon: <Target className="w-5 h-5 text-blue-600" />, iconBg: "bg-blue-50" },
];

const indiaAdvantages = [
  { title: "Indian Domain Data", desc: "Demand and pricing data sourced directly from Amazon India and Flipkart. Not extrapolated from Amazon.com.", color: "bg-blue-500/20", iconColor: "text-blue-300" },
  { title: "Accurate INR Profit Modelling", desc: "The product margin calculator accounts for Indian logistics, GST, and marketplace fees. Not US fulfilment rates.", color: "bg-sky-500/20", iconColor: "text-sky-300" },
  { title: "15-Day Festive Intelligence", desc: "Demand forecasts for Diwali, Big Billion Days, and Republic Day Sale delivered 12 to 15 days ahead of the spike.", color: "bg-orange-500/20", iconColor: "text-orange-300" },
  { title: "Review Gap Analyser", desc: "Hindi and English review analysis surfaces product weaknesses in your target category before you source.", color: "bg-green-500/20", iconColor: "text-green-300" },
];

const withoutRows = [
  { label: "Products sourced without validation", val: "3 products", neg: true },
  { label: "Average margin (guessed)", val: "8%", neg: true },
  { label: "Stranded inventory cost", val: "Rs 84,000", neg: true },
  { label: "Missed festive window revenue", val: "Rs 1,40,000", neg: true },
  { label: "Time spent on manual research", val: "18 hours/week", neg: true },
];

const withRows = [
  { label: "Products validated before sourcing", val: "5 products", neg: false },
  { label: "Average margin (data-backed)", val: "26%", neg: false },
  { label: "Stranded inventory cost", val: "Rs 0", neg: false },
  { label: "Festive window revenue captured", val: "Rs 3,10,000", neg: false },
  { label: "Time spent on research", val: "Under 2 hours/week", neg: false },
];

const pricingPlans = [
  {
    plan: "Free Plan",
    price: "Rs 0",
    period: "Forever, no credit card required",
    items: [
      "25 products tracked with full Opportunity Scores",
      "Product demand analysis tool, 30-day history",
      "Product margin calculator in INR",
      "Basic competitor analysis",
      "Profitable product finder access",
    ],
    cta: "Start Free Now",
    route: "/login",
    featured: false,
  },
  {
    plan: "Growth Plan",
    price: "Rs 1,999",
    period: "per month, billed in INR",
    items: [
      "Unlimited products with full Opportunity Scores",
      "Product opportunity analysis tool, 12-month history",
      "Advanced product margin calculator with festive adjustments",
      "Festive demand forecasting 15 days ahead",
      "WhatsApp alerts for trending products",
      "Hindi and English review analysis",
    ],
    cta: "Start Growth Plan",
    route: "/login",
    featured: true,
  },
  {
    plan: "Scale Plan",
    price: "Rs 2,999",
    period: "per month, billed in INR",
    items: [
      "Everything in Growth Plan",
      "Multi-marketplace opportunity finder tool",
      "Agency-level multi-account access",
      "Priority support in Hindi and English",
      "Custom product profitability analysis reports",
    ],
    cta: "Start Scale Plan",
    route: "/login",
    featured: false,
  },
];

const faqs = [
  {
    id: "faq-1",
    question: "How does Insydz find profitable products on Amazon India and Flipkart?",
    answer: "Insydz's product research tool analyses real search volumes, competitor pricing, review sentiment, and margin data from Amazon India and Flipkart simultaneously. Every product receives an Opportunity Score out of 100, combining demand, competition, and profit potential in INR so you can compare products objectively rather than guessing.",
  },
  {
    id: "faq-2",
    question: "How long does Insydz take to analyse and score products?",
    answer: "Most sellers complete their first product research session in under 2 hours. Set your budget, category, and margin criteria and Insydz filters, scores, and ranks matching opportunities automatically using the product opportunity analysis tool. No manual spreadsheets required.",
  },
  {
    id: "faq-3",
    question: "Can I find profitable products for both Amazon India and Flipkart?",
    answer: "Yes. Insydz is the only product profitability analysis software that covers both Amazon India and Flipkart in a single dashboard. You can compare Opportunity Scores across both marketplaces and identify products that perform well on one but have room to grow on the other.",
  },
  {
    id: "faq-4",
    question: "What makes a product profitable according to Insydz?",
    answer: "The product margin calculator scores profitability based on your input costs, Amazon India or Flipkart fees, estimated sourcing price, and current competitive pricing. A product is flagged as profitable when projected margin exceeds your defined floor, typically 20% or above for Indian marketplace sellers.",
  },
  {
    id: "faq-5",
    question: "How often is the product opportunity data updated?",
    answer: "The opportunity finder tool refreshes marketplace data daily. Search volume trends, competitor pricing, and inventory levels are updated every 24 hours. Festive season demand forecasts update every 48 hours as marketplace signals intensify closer to events like Diwali and Big Billion Days.",
  },
  {
    id: "faq-6",
    question: "Can products be shortlisted to be referred to in due course?",
    answer: "Yes. You can save any product to a watchlist and track how its Opportunity Score changes over time. Insydz sends WhatsApp alerts when a shortlisted product's demand spikes or a competitor's inventory drops, signalling the right moment to act.",
  },
];

// ── OPPORTUNITY CARD MOCK ─────────────────────────────────────────────
function OpportunityCard() {
  const bars = [
    { label: "Search Demand", pct: 88, color: "bg-blue-500" },
    { label: "Competition", pct: 32, color: "bg-amber-400" },
    { label: "Margin Potential", pct: 74, color: "bg-green-400" },
    { label: "Avg. Monthly Sales", pct: 91, color: "bg-sky-400" },
  ];
  return (
    <div className="hidden lg:block bg-white border border-blue-200 rounded-3xl p-6 shadow-2xl shadow-blue-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-900">Top Opportunity Today</span>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" /> Live
        </span>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-lg font-black text-blue-600 leading-none">87</span>
          <span className="text-xs text-gray-400">Score</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Stainless Steel Bottle 1L</p>
          <span className="text-xs text-gray-400">Amazon India, Kitchen</span>
        </div>
      </div>
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3 mb-2.5">
          <span className="text-xs text-gray-500 w-28 flex-shrink-0">{bar.label}</span>
          <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{bar.pct}%</span>
        </div>
      ))}
      <div className="mt-4 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-3">
        <p className="text-xs text-white leading-relaxed font-medium">
          Product demand analysis shows 2x growth ahead of festive season. Source now to get first-mover advantage.
        </p>
      </div>
    </div>
  );
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────
export default function FindProfitableProductsPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-fpp-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-fpp-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    isDarkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetStarted = () => router.push("/login");
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };
  const toggleMobileMenu = (menuName: string) =>
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-sky-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/use-cases" className="hover:text-blue-500 transition-colors">Use Cases</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 dark:text-gray-300">Find Profitable Products</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">
                  Product profitability analysis software
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
                Find{" "}
                <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                  Profitable Products
                </span>
                <br />
                Before Your
                <br />
                Competitors Do
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
                India's only <strong>product research tool</strong> built on real marketplace data. Surface high-demand, low-competition SKUs with Opportunity Scores, product margin calculators, and demand analysis before your rivals act.
              </p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold px-8 py-6 rounded-full shadow-2xl group"
              >
                Discover Profitable Products Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <OpportunityCard />
          </div>
        </div>
      </section>

      {/* ── WHY WRONG PRODUCTS ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">The problem</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why most sellers pick{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">the wrong products</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Sellers choose products based on gut feeling, not data. The result is inventory that sits still, margins that collapse, and capital that gets stranded.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {wrongCards.map((card, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col h-full">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>
                  {card.icon}
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
            <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
              <strong className="block text-lg font-black text-amber-700 dark:text-amber-400 mb-1">67% of new sellers fail in their first year</strong>
              The primary cause is poor product selection. Insydz's <strong>product profitability analysis software</strong> closes that gap before you spend a rupee.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Manual vs Insydz</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why manual product research{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">fails Indian sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Most sellers spend 3 to 4 weeks on manual research and still launch the wrong product. Insydz cuts that to hours.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-gray-500 dark:text-gray-400 font-bold text-sm bg-gray-900 dark:bg-gray-950">Research Method</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-bold text-sm bg-gray-700">Manual Research</th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-sky-500">
                    Insydz <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2 font-medium">India-First</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">{row.label}</td>
                    <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-sm">{row.manual}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{row.insydz}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product discovery process</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              How product discovery works{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From idea to a validated product launch in under 2 hours. No guesswork, no wasted sourcing budget.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-7 flex flex-col h-full">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block w-fit mb-4">{step.num}</span>
                <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{step.icon}</div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold px-8 py-6 rounded-full shadow-xl group">
              Find Your First Profitable Product Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── DISCOVER GRID ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product research intelligence</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              What you discover with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">product research</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six actionable data layers for every product opportunity. Each one answers a specific question before you source.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {discoverCards.map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col h-full">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}>{card.icon}</div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">{card.desc}</p>
                <span className={`text-xs font-medium px-3 py-1 rounded-full inline-block w-fit ${card.kwBg}`}>{card.kw}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDIA DIFFERENCE ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-12 items-start relative">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Built on Indian marketplace data</p>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">How Insydz is Different. Built on Indian Marketplace Data</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Global tools like Helium 10 and Jungle Scout use Amazon.com data. Indian sellers who rely on them get demand estimates calibrated for US consumers, US prices, and US festive patterns. Insydz is built entirely on Amazon India and Flipkart data with INR margins, Hindi review analysis, and Indian festive season forecasting built in.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { val: "Rs 5.4 Lakh", lbl: "Avg. annual sourcing waste prevented" },
                    { val: "4.8x", lbl: "Faster product selection" },
                    { val: "67 min", lbl: "Average time to first opportunity" },
                  ].map((s) => (
                    <div key={s.lbl}>
                      <div className="text-xl font-black text-blue-400 mb-1">{s.val}</div>
                      <div className="text-xs text-gray-500">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {indiaAdvantages.map((adv, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className={`w-8 h-8 rounded-lg ${adv.color} flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle2 className={`w-4 h-4 ${adv.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">{adv.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COST COMPARISON ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product profitability analysis software</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              The cost of launching without{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">product profitability analysis</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A real comparison. Same category, same investment window. One seller uses Insydz. One does not.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Without */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-red-200 dark:border-red-900 p-7">
              <span className="text-sm font-bold text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">Without Insydz, 6 Month Period</span>
              {withoutRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-red-500">{row.val}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-red-200 dark:border-red-900">
                <span className="text-xl font-black text-red-600">Total loss: Rs 2,24,000</span>
              </div>
            </div>
            {/* With */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-green-200 dark:border-green-900 p-7">
              <span className="text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-xl inline-block mb-5">With Insydz, 6 Month Period</span>
              {withRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{row.label}</span>
                  <span className="font-semibold text-green-600">{row.val}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-900">
                <span className="text-xl font-black text-green-600">Total gain: +Rs 3,10,000</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
            <p className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed">
              <strong className="block text-lg font-black text-blue-700 dark:text-blue-400 mb-1">Rs 5.34 Lakh difference between a validated product launch and a gut-feel launch.</strong>
              That is the value Insydz's <strong>product profitability analysis software</strong> provides to Indian sellers every 6 months.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Start free. See real opportunities.</span>
            </div>
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Free plan includes{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">product research</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every plan includes the product research tool, opportunity finder tool, and product margin calculator. No credit card required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`rounded-3xl p-7 flex flex-col h-full ${plan.featured ? "bg-gradient-to-br from-blue-600 to-sky-500" : "bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700"}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-white/70" : "text-blue-600"}`}>{plan.plan}</p>
                <p className={`text-3xl font-black mb-1 ${plan.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.price}</p>
                <p className={`text-xs mb-5 ${plan.featured ? "text-white/60" : "text-gray-400"}`}>{plan.period}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.items.map((item, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/85" : "text-gray-600 dark:text-gray-400"}`}>
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${plan.featured ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                        <CheckCircle2 className={`w-2.5 h-2.5 ${plan.featured ? "text-white" : "text-blue-500"}`} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.route} className={`block w-full text-center font-bold py-3 px-6 rounded-full text-sm transition-all mt-auto ${plan.featured ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:opacity-90"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-xs font-medium text-blue-700 uppercase tracking-widest">Product research FAQs</span>
          </div>
          <h2 className="text-4xl font-black mb-12 text-gray-900 dark:text-white">Common questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  aria-expanded={expandedFaq === faq.id}
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-700 to-sky-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 text-white">Stop Guessing. Start Selling Winners.</h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            India's only platform that combines product profitability analysis software, real demand data, and margin intelligence built for Amazon India and Flipkart.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white text-blue-700 font-bold px-12 py-6 rounded-full shadow-2xl group hover:bg-blue-50 mb-12">
            Discover Profitable Products Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              { val: "Free", lbl: "25 products to start" },
              { val: "67 min", lbl: "To first opportunity" },
              { val: "Rs 1,999", lbl: "Growth plan per month" },
            ].map((s) => (
              <div key={s.lbl} className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center min-w-36">
                <div className="text-xl font-black text-white mb-1">{s.val}</div>
                <div className="text-xs text-white/60">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out; }
      `}</style>
    </div>
  );
}
