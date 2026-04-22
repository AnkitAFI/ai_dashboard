// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import Sidebar from "@/components/layout/sidebar";
// import { useAuth } from "@/App";
// import {
//   ArrowLeft, Lock, Crown, Star, MessageSquare, RefreshCw,
//   Menu, X, TrendingUp, CheckCircle, Zap, ShieldCheck,
//   ThumbsUp, ThumbsDown, Minus, Package, Users,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer,
// } from "recharts";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// // ── Tier Gate ─────────────────────────────────────────────────────────────────
// function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
//   const navigate = useNavigate();
//   return (
//     <div className="absolute inset-0 bg-white/85 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
//       <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "premium" ? "bg-blue-50" : "bg-amber-50"}`}>
//         <Lock className={`w-5 h-5 ${tier === "premium" ? "text-blue-500" : "text-amber-500"}`} />
//       </div>
//       <div className="text-center px-4">
//         <p className="font-bold text-slate-800 text-sm">{feature}</p>
//         <p className="text-xs text-slate-400 mt-0.5">
//           {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
//         </p>
//       </div>
//       <button
//         onClick={() => navigate("/subscription")}
//         className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
//       >
//         <Crown className="w-3 h-3" /> Upgrade
//       </button>
//     </div>
//   );
// }

// // ── Star Row ──────────────────────────────────────────────────────────────────
// function StarRow({ rating, count, total }: { rating: number; count: number; total: number }) {
//   const pct = total > 0 ? (count / total) * 100 : 0;
//   const color = rating >= 4 ? "#10b981" : rating === 3 ? "#f59e0b" : "#ef4444";
//   return (
//     <div className="flex items-center gap-2 text-xs">
//       <span className="text-slate-500 w-4 text-right font-mono">{rating}</span>
//       <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
//       <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
//         <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
//       </div>
//       <span className="text-slate-400 w-6 text-right">{count}</span>
//     </div>
//   );
// }

// // ── Review Card ───────────────────────────────────────────────────────────────
// function ReviewCard({ review }: { review: any }) {
//   const ratingColor =
//     review.rating >= 4 ? "text-emerald-600 bg-emerald-50"
//     : review.rating === 3 ? "text-amber-600 bg-amber-50"
//     : "text-red-600 bg-red-50";

//   return (
//     <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//       <div className="flex items-start justify-between gap-2 mb-2">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
//             {(review.author || "A").charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <p className="text-xs font-semibold text-slate-700">{review.author || "Anonymous"}</p>
//             <p className="text-[10px] text-slate-400">{review.date}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 flex-shrink-0">
//           {review.rating != null && (
//             <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor}`}>
//               ★ {review.rating}
//             </span>
//           )}
//           {review.has_response && (
//             <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
//               Replied
//             </span>
//           )}
//         </div>
//       </div>
//       <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{review.comment}</p>
//     </div>
//   );
// }

// // ── Sentiment Bar ─────────────────────────────────────────────────────────────
// function SentimentBar({ label, pct, icon: Icon, color }: { label: string; pct: number; icon: any; color: string }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ background: `${color}18` }}>
//         <Icon className="w-4 h-4" style={{ color }} />
//       </div>
//       <div className="flex-1">
//         <div className="flex items-center justify-between text-xs mb-1">
//           <span className="font-medium text-slate-600">{label}</span>
//           <span className="font-bold" style={{ color }}>{pct}%</span>
//         </div>
//         <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//           <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Custom Tooltip ────────────────────────────────────────────────────────────
// const ChartTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs">
//       <p className="font-semibold text-slate-600">{label} star</p>
//       <p className="text-sky-600 font-bold">{payload[0]?.value} reviews</p>
//     </div>
//   );
// };

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN
// // ══════════════════════════════════════════════════════════════════════════════
// export default function ReviewComparison() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const asin     = searchParams.get("asin") || "";
//   const sellerId = searchParams.get("seller_id") || user?.seller_id || "";

//   const [data, setData]         = useState<any>(null);
//   const [loading, setLoading]   = useState(false);
//   const [mobileMenu, setMobile] = useState(false);

//   const tier      = data?.tier || user?.subscriptionTier || "free";
//   const isBasic   = tier === "basic" || tier === "premium";
//   const isPremium = tier === "premium";

//   useEffect(() => {
//     if (!asin || !sellerId) return;
//     setLoading(true);
//     const params = new URLSearchParams({ asin, seller_id: sellerId });
//     if (user?.email) params.append("user_email", user.email);
//     fetch(`${BASE_URL}/api/comparison/reviews?${params}`, { credentials: "include" })
//       .then((r) => r.ok ? r.json() : null)
//       .then((d) => d && setData(d))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [asin, sellerId, user?.email]);

//   const ratingDist = data?.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//   const totalDist  = Object.values(ratingDist).reduce((a: any, b: any) => a + b, 0) as number;

//   const barData = Object.entries(ratingDist)
//     .sort(([a], [b]) => Number(b) - Number(a))
//     .map(([k, v]) => ({ star: `${k}★`, count: v as number, fill: Number(k) >= 4 ? "#10b981" : Number(k) === 3 ? "#f59e0b" : "#ef4444" }));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
//       {/* Mobile sidebar */}
//       {mobileMenu && (
//         <>
//           <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobile(false)} />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
//             <div className="flex justify-end p-4">
//               <button onClick={() => setMobile(false)}><X className="w-5 h-5" /></button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}
//       <aside className="hidden lg:block lg:w-64 fixed h-full z-30"><Sidebar /></aside>

//       <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
//         {/* Header */}
//         <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
//           <div className="flex items-center gap-3">
//             <button onClick={() => setMobile(true)} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
//               <Menu className="w-5 h-5 text-sky-900" />
//             </button>
//             {/* <button
//               onClick={() => navigate("/seller/products")}
//               className="flex items-center gap-2 text-slate-500 hover:text-sky-700 transition-colors text-sm font-medium"
//             >
//             </button> */}
//             <div className="w-px h-5 bg-slate-200" />
//             <div>
//               <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
//                 <MessageSquare className="w-5 h-5 text-sky-600" /> Review Comparison
//               </h2>
//               <p className="text-xs text-slate-500 hidden sm:block">Analyse your reviews and benchmark against competitors</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
//               {tier.toUpperCase()}
//             </Badge>
//             {!isPremium && (
//               <button
//                 onClick={() => navigate("/subscription")}
//                 className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all"
//               >
//                 <Crown className="w-3 h-3" /> Upgrade
//               </button>
//             )}
//           </div>
//         </header>

//         <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">

//           {/* No product */}
//           {!asin && (
//             <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
//               <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
//                 <MessageSquare className="w-8 h-8 text-sky-400" />
//               </div>
//               <div>
//                 <p className="text-lg font-bold text-slate-700">No product selected</p>
//                 <p className="text-sm text-slate-400 mt-1">Click any product from My Products to compare reviews.</p>
//               </div>
//               <button
//                 onClick={() => navigate("/seller/my-products")}
//                 className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors"
//               >
//                 Go to My Products
//               </button>
//             </div>
//           )}

//           {asin && loading && (
//             <div className="flex flex-col items-center justify-center h-64 gap-3">
//               <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
//               <p className="text-slate-500 font-medium">Loading review data…</p>
//             </div>
//           )}

//           {asin && !loading && data && (
//             <>
//               {/* ── Selected Product Card ─────────────────────────────────────── */}
//               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//                 <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
//                   {data.product_photo
//                     ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" />
//                     : <Package className="w-8 h-8 text-slate-300" />
//                   }
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-bold text-slate-800 text-base line-clamp-2">{data.product_title}</p>
//                   <div className="flex flex-wrap items-center gap-2 mt-1.5">
//                     <span className="text-xs text-slate-400 font-mono">{data.asin}</span>
//                     {data.is_prime && <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">PRIME</Badge>}
//                     {data.is_best_seller && <Badge className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1.5 py-0">BEST SELLER</Badge>}
//                   </div>
//                 </div>
//                 {/* Rating hero */}
//                 <div className="text-right flex-shrink-0">
//                   <div className="flex items-center gap-1 justify-end">
//                     <p className="text-3xl font-black text-amber-500">{data.star_rating?.toFixed(1) || "—"}</p>
//                     <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
//                   </div>
//                   <p className="text-xs text-slate-400 mt-0.5">
//                     {data.total_ratings?.toLocaleString() || "—"} ratings
//                   </p>
//                   {data.seller_rating && (
//                     <p className="text-xs text-slate-500 mt-0.5">Seller: ★ {data.seller_rating}</p>
//                   )}
//                 </div>
//               </div>

//               {/* ── Free Tier: Rating Overview + Distribution ─────────────────── */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                 {/* Rating summary */}
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
//                   <h3 className="font-bold text-slate-800 text-sm mb-4">Rating Overview</h3>
//                   <div className="flex items-center gap-5 mb-5">
//                     <div className="text-center">
//                       <p className="text-5xl font-black text-amber-500">{data.star_rating?.toFixed(1) || "—"}</p>
//                       <div className="flex items-center gap-0.5 mt-1 justify-center">
//                         {[1, 2, 3, 4, 5].map((s) => (
//                           <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(data.star_rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
//                         ))}
//                       </div>
//                       <p className="text-xs text-slate-400 mt-1">{data.total_ratings?.toLocaleString()} total</p>
//                     </div>
//                     <div className="flex-1 space-y-1.5">
//                       {[5, 4, 3, 2, 1].map((r) => (
//                         <StarRow key={r} rating={r} count={ratingDist[r] || 0} total={totalDist} />
//                       ))}
//                     </div>
//                   </div>
//                   {data.seller_rating && (
//                     <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
//                       <span className="text-slate-500 font-medium">Seller Rating</span>
//                       <span className="font-bold text-slate-800 flex items-center gap-1">
//                         <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
//                         {data.seller_rating} ({data.seller_ratings_total?.toLocaleString()} ratings)
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Rating distribution chart */}
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
//                   <h3 className="font-bold text-slate-800 text-sm mb-4">Rating Distribution</h3>
//                   <ResponsiveContainer width="100%" height={180}>
//                     <BarChart data={barData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }} barCategoryGap="25%">
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
//                       <XAxis dataKey="star" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
//                       <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
//                       <Tooltip content={<ChartTooltip />} />
//                       <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
//                         {barData.map((entry, i) => (
//                           <Cell key={i} fill={entry.fill} />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* ── Basic+: Recent Reviews ────────────────────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                 {!isBasic && <TierGate tier="basic" feature="Recent Customer Reviews" />}
//                 <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-bold text-slate-800 text-sm">Recent Customer Reviews</h3>
//                     {data.response_rate_label && (
//                       <span className={`text-xs font-bold px-3 py-1 rounded-full border ${(data.response_rate_pct || 0) > 50 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
//                         {data.response_rate_label} responded
//                       </span>
//                     )}
//                   </div>
//                   {(data.recent_reviews || Array(3).fill({ comment: "Review text would appear here…", rating: 5, author: "Customer", date: "—", has_response: false })).length > 0 ? (
//                     <div className="space-y-3">
//                       {(data.recent_reviews || []).map((r: any, i: number) => (
//                         <ReviewCard key={i} review={r} />
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-slate-400 text-center py-8">No recent reviews tracked.</p>
//                   )}
//                 </div>
//               </div>

//               {/* ── Basic+: Response Rate Card ────────────────────────────────── */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                 <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                   {!isBasic && <TierGate tier="basic" feature="Seller Response Rate" />}
//                   <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
//                     <h3 className="font-bold text-slate-800 text-sm mb-3">Seller Response Rate</h3>
//                     <div className="flex items-end gap-3">
//                       <p className="text-4xl font-black text-sky-600">
//                         {data.response_rate_pct != null ? `${data.response_rate_pct}%` : "—"}
//                       </p>
//                       <p className="text-sm text-slate-500 pb-1">{data.response_rate_label || "of reviews"}</p>
//                     </div>
//                     <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
//                       <div
//                         className="h-full rounded-full bg-sky-500 transition-all duration-700"
//                         style={{ width: `${data.response_rate_pct || 0}%` }}
//                       />
//                     </div>
//                     <p className="text-xs text-slate-400 mt-2">
//                       {(data.response_rate_pct || 0) > 50
//                         ? "✓ Strong response rate — builds buyer trust"
//                         : "↑ Respond to more reviews to improve seller score"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Premium: Portfolio rating */}
//                 <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                   {!isPremium && <TierGate tier="premium" feature="Portfolio Rating Benchmark" />}
//                   <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                     <h3 className="font-bold text-slate-800 text-sm mb-3">Your Portfolio Average</h3>
//                     <div className="flex items-end gap-3">
//                       <p className="text-4xl font-black text-amber-500">
//                         {data.avg_seller_portfolio_rating?.toFixed(2) || "—"}
//                       </p>
//                       <Star className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" />
//                     </div>
//                     <p className="text-xs text-slate-500 mt-2">
//                       Average across {data.seller_product_count || "—"} tracked products
//                     </p>
//                     {data.star_rating && data.avg_seller_portfolio_rating && (
//                       <div className="mt-3 bg-slate-50 rounded-xl p-2.5 text-xs flex items-center justify-between">
//                         <span className="text-slate-500">This product vs portfolio</span>
//                         <span className={`font-bold ${data.star_rating >= data.avg_seller_portfolio_rating ? "text-emerald-600" : "text-red-500"}`}>
//                           {data.star_rating >= data.avg_seller_portfolio_rating ? "↑ Above avg" : "↓ Below avg"}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Premium: Sentiment Breakdown ─────────────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                 {!isPremium && <TierGate tier="premium" feature="Sentiment Breakdown" />}
//                 <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                   <h3 className="font-bold text-slate-800 text-sm mb-4">Review Sentiment Breakdown</h3>
//                   <div className="space-y-3">
//                     <SentimentBar
//                       label="Positive (4–5 ★)"
//                       pct={data.sentiment_breakdown?.positive ?? 80}
//                       icon={ThumbsUp}
//                       color="#10b981"
//                     />
//                     <SentimentBar
//                       label="Neutral (3 ★)"
//                       pct={data.sentiment_breakdown?.neutral ?? 12}
//                       icon={Minus}
//                       color="#f59e0b"
//                     />
//                     <SentimentBar
//                       label="Negative (1–2 ★)"
//                       pct={data.sentiment_breakdown?.negative ?? 8}
//                       icon={ThumbsDown}
//                       color="#ef4444"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ── Premium: Competitor Review Comparison ─────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                 {!isPremium && <TierGate tier="premium" feature="Competitor Review Comparison" />}
//                 <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                   <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
//                     <Users className="w-4 h-4 text-sky-500" /> Top Competitors by Review Count
//                   </h3>
//                   <div className="space-y-3">
//                     {/* Your product row */}
//                     <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
//                       <div className="w-8 h-8 rounded-lg bg-white border border-sky-100 flex items-center justify-center overflow-hidden flex-shrink-0">
//                         {data.product_photo
//                           ? <img src={data.product_photo} alt="" className="w-full h-full object-contain p-0.5" />
//                           : <Package className="w-4 h-4 text-slate-300" />
//                         }
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs font-bold text-sky-700 line-clamp-1">{(data.product_title || "").substring(0, 52)}…</p>
//                         <p className="text-[10px] text-slate-400 font-mono">{data.asin} · YOU</p>
//                       </div>
//                       <div className="text-right flex-shrink-0">
//                         <p className="text-sm font-black text-amber-500">{data.star_rating?.toFixed(1)}</p>
//                         <p className="text-[10px] text-slate-400">{data.total_ratings?.toLocaleString()} ratings</p>
//                       </div>
//                     </div>
//                     {/* Competitor rows */}
//                     {(data.competitor_reviews || []).map((c: any, i: number) => (
//                       <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
//                         <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
//                           {c.photo
//                             ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" />
//                             : <Package className="w-4 h-4 text-slate-300" />
//                           }
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-semibold text-slate-700 line-clamp-1">{c.title}</p>
//                           <p className="text-[10px] text-slate-400 font-mono">{c.asin}</p>
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className={`text-sm font-black ${c.rating >= (data.star_rating || 0) ? "text-red-500" : "text-emerald-500"}`}>
//                             {c.rating?.toFixed(1) || "—"}
//                           </p>
//                           <p className="text-[10px] text-slate-400">{c.num_ratings?.toLocaleString()} ratings</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Premium: AI Response Suggestion ──────────────────────────── */}
//               {data.ai_response_suggestion && (
//                 <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                   {!isPremium && <TierGate tier="premium" feature="AI Response Suggestion" />}
//                   <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                     <div className="flex gap-3">
//                       <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
//                         <Zap className="w-4 h-4 text-white" />
//                       </div>
//                       <div>
//                         <p className="font-bold text-slate-800 text-sm mb-1">AI-Generated Response for Negative Review</p>
//                         <p className="text-sm text-slate-600 leading-relaxed">{data.ai_response_suggestion}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* ── Premium: Review Velocity Insight ─────────────────────────── */}
//               {isPremium && data.review_velocity_insight && (
//                 <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-4 flex items-start gap-3">
//                   <TrendingUp className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-sky-800">{data.review_velocity_insight}</p>
//                 </div>
//               )}

//               {/* ── Upgrade CTA ───────────────────────────────────────────────── */}
//               {!isPremium && (
//                 <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                   <div>
//                     <p className="font-bold text-base">Unlock Full Review Intelligence</p>
//                     <p className="text-blue-100 text-sm mt-0.5">
//                       {!isBasic
//                         ? "See recent reviews, response rates and seller insights — Basic · ₹1,999/mo"
//                         : "Get sentiment analysis, competitor reviews & AI response suggestions — Premium · ₹2,999/mo"}
//                     </p>
//                     <div className="flex flex-wrap gap-3 mt-2">
//                       {(!isBasic
//                         ? ["Recent reviews", "Response rate tracking", "Seller rating overview"]
//                         : ["Sentiment breakdown", "Competitor comparison", "AI response drafts", "Review velocity insights"]
//                       ).map((f) => (
//                         <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
//                           <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => navigate("/subscription")}
//                     className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0"
//                   >
//                     <Crown className="w-4 h-4" /> Upgrade Now
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/App";
import {
  Lock, Crown, Star, MessageSquare, RefreshCw,
  Menu, X, TrendingUp, CheckCircle, Zap,
  ThumbsUp, ThumbsDown, Minus, Package, Users,
  Activity, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 bg-white/85 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "premium" ? "bg-blue-50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "premium" ? "text-blue-500" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-slate-800 text-sm">{feature}</p>
        <p className="text-xs text-slate-400 mt-0.5">{tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}</p>
      </div>
      <button onClick={() => navigate("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
function HealthScoreRing({ score }: { score: number }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dashOffset = circ - (circ * score) / 100;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs Work";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-800">{score}</span>
          <span className="text-[8px] text-slate-400 font-medium">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function StarRow({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const color = rating >= 4 ? "#10b981" : rating === 3 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 w-4 text-right font-mono">{rating}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-slate-400 w-6 text-right">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  const ratingColor = review.rating >= 4 ? "text-emerald-600 bg-emerald-50" : review.rating === 3 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
            {(review.author || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">{review.author || "Anonymous"}</p>
            <p className="text-[10px] text-slate-400">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {review.rating != null && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor}`}>★ {review.rating}</span>
          )}
          {review.has_response && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Replied</span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{review.comment}</p>
    </div>
  );
}

function SentimentBar({ label, pct, icon: Icon, color }: { label: string; pct: number; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-slate-600">{label}</span>
          <span className="font-bold" style={{ color }}>{pct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function SimilarityPill({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const cls = pct >= 50 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 25 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>{pct}% match</span>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs">
      <p className="font-semibold text-slate-600">{label} star</p>
      <p className="text-sky-600 font-bold">{payload[0]?.value} reviews</p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function ReviewComparison() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const asin     = searchParams.get("asin") || "";
  const sellerId = searchParams.get("seller_id") || user?.seller_id || "";

  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [mobileMenu, setMobile] = useState(false);

  const tier      = data?.tier || user?.subscriptionTier || "free";
  const isBasic   = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  useEffect(() => {
    if (!asin || !sellerId) return;
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    fetch(`${BASE_URL}/api/comparison/reviews?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email]);

  const ratingDist = data?.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalDist  = Object.values(ratingDist).reduce((a: any, b: any) => a + b, 0) as number;
  const barData = Object.entries(ratingDist)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([k, v]) => ({ star: `${k}★`, count: v as number, fill: Number(k) >= 4 ? "#10b981" : Number(k) === 3 ? "#f59e0b" : "#ef4444" }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
      {mobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobile(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex justify-end p-4"><button onClick={() => setMobile(false)}><X className="w-5 h-5" /></button></div>
            <Sidebar />
          </aside>
        </>
      )}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30"><Sidebar /></aside>

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobile(true)} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
              <Menu className="w-5 h-5 text-sky-900" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" /> Review Comparison
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">Analyse your reviews and benchmark against similar products</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {tier.toUpperCase()}
            </Badge>
            {!isPremium && (
              <button onClick={() => navigate("/subscription")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {!asin && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">No product selected</p>
                <p className="text-sm text-slate-400 mt-1">Click any product from My Products to compare reviews.</p>
              </div>
              <button onClick={() => navigate("/seller/my-products")} className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
                Go to My Products
              </button>
            </div>
          )}

          {asin && loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-slate-500 font-medium">Analysing reviews & finding similar competitors…</p>
            </div>
          )}

          {asin && !loading && data && (
            <>
              {/* ── Product Card ──────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {data.product_photo ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" /> : <Package className="w-8 h-8 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-base line-clamp-2">{data.product_title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-400 font-mono">{data.asin}</span>
                    {data.is_prime && <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">PRIME</Badge>}
                    {data.is_best_seller && <Badge className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1.5 py-0">BEST SELLER</Badge>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-4">
                  {isPremium && data.review_health_score != null && (
                    <HealthScoreRing score={data.review_health_score} />
                  )}
                  <div>
                    <div className="flex items-center gap-1 justify-end">
                      <p className="text-3xl font-black text-amber-500">{data.star_rating?.toFixed(1) || "—"}</p>
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{data.total_ratings?.toLocaleString() || "—"} ratings</p>
                    {data.seller_rating && <p className="text-xs text-slate-500 mt-0.5">Seller: ★ {data.seller_rating}</p>}
                  </div>
                </div>
              </div>

              {/* ── Rating Overview + Chart ───────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Rating Overview</h3>
                  <div className="flex items-center gap-5 mb-5">
                    <div className="text-center">
                      <p className="text-5xl font-black text-amber-500">{data.star_rating?.toFixed(1) || "—"}</p>
                      <div className="flex items-center gap-0.5 mt-1 justify-center">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(data.star_rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{data.total_ratings?.toLocaleString()} total</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5,4,3,2,1].map((r) => <StarRow key={r} rating={r} count={ratingDist[r] || 0} total={totalDist} />)}
                    </div>
                  </div>
                  {data.seller_rating && (
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Seller Rating</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {data.seller_rating} ({data.seller_ratings_total?.toLocaleString()} ratings)
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Rating Distribution</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="star" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" radius={[6,6,0,0]} maxBarSize={48}>
                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Basic+: Recent Reviews ────────────────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                {!isBasic && <TierGate tier="basic" feature="Recent Customer Reviews" />}
                <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-sm">Recent Customer Reviews</h3>
                    {data.response_rate_label && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${(data.response_rate_pct || 0) > 50 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                        {data.response_rate_label} responded
                      </span>
                    )}
                  </div>
                  {(data.recent_reviews || []).length > 0
                    ? <div className="space-y-3">{(data.recent_reviews || []).map((r: any, i: number) => <ReviewCard key={i} review={r} />)}</div>
                    : <p className="text-sm text-slate-400 text-center py-8">No recent reviews tracked.</p>
                  }
                </div>
              </div>

              {/* ── Basic+/Premium Cards ──────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Response rate */}
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                  {!isBasic && <TierGate tier="basic" feature="Seller Response Rate" />}
                  <div className={!isBasic ? "blur-sm pointer-events-none" : ""}>
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Seller Response Rate</h3>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-black text-sky-600">{data.response_rate_pct != null ? `${data.response_rate_pct}%` : "—"}</p>
                      <p className="text-sm text-slate-500 pb-1">{data.response_rate_label || "of reviews"}</p>
                    </div>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-sky-500 transition-all duration-700" style={{ width: `${data.response_rate_pct || 0}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {(data.response_rate_pct || 0) > 50 ? "✓ Strong response rate — builds buyer trust" : "↑ Respond to more reviews to improve seller score"}
                    </p>
                  </div>
                </div>
                {/* Portfolio rating */}
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                  {!isPremium && <TierGate tier="premium" feature="Portfolio Rating Benchmark" />}
                  <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Your Portfolio Average</h3>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-black text-amber-500">{data.avg_seller_portfolio_rating?.toFixed(2) || "—"}</p>
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Average across {data.seller_product_count || "—"} tracked products</p>
                    {data.star_rating && data.avg_seller_portfolio_rating && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 text-xs flex items-center justify-between">
                        <span className="text-slate-500">This product vs portfolio</span>
                        <span className={`font-bold ${data.star_rating >= data.avg_seller_portfolio_rating ? "text-emerald-600" : "text-red-500"}`}>
                          {data.star_rating >= data.avg_seller_portfolio_rating ? "↑ Above avg" : "↓ Below avg"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Premium: Sentiment ───────────────────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="Sentiment Breakdown" />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Review Sentiment Breakdown</h3>
                  <div className="space-y-3">
                    <SentimentBar label="Positive (4–5 ★)" pct={data.sentiment_breakdown?.positive ?? 80} icon={ThumbsUp} color="#10b981" />
                    <SentimentBar label="Neutral (3 ★)" pct={data.sentiment_breakdown?.neutral ?? 12} icon={Minus} color="#f59e0b" />
                    <SentimentBar label="Negative (1–2 ★)" pct={data.sentiment_breakdown?.negative ?? 8} icon={ThumbsDown} color="#ef4444" />
                  </div>
                </div>
              </div>

              {/* ── Premium: Smart Competitor Reviews ────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="Competitor Review Comparison" />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-500" /> Most Similar Competitors by Reviews
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Matched by product similarity, not just category</p>
                  <div className="space-y-2">
                    {/* Your product row */}
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <div className="w-8 h-8 rounded-lg bg-white border border-sky-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {data.product_photo ? <img src={data.product_photo} alt="" className="w-full h-full object-contain p-0.5" /> : <Package className="w-4 h-4 text-slate-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-sky-700 line-clamp-1">{(data.product_title || "").substring(0, 52)}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{data.asin} · YOU</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-amber-500">{data.star_rating?.toFixed(1)}</p>
                        <p className="text-[10px] text-slate-400">{data.total_ratings?.toLocaleString()} ratings</p>
                      </div>
                    </div>
                    {(data.competitor_reviews || []).map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" /> : <Package className="w-4 h-4 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 line-clamp-1">{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">{c.asin}</span>
                            {c.similarity_score > 0 && <SimilarityPill score={c.similarity_score} />}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-black ${c.rating >= (data.star_rating || 0) ? "text-red-500" : "text-emerald-500"}`}>
                            {c.rating?.toFixed(1) || "—"}
                            {c.rating_delta != null && (
                              <span className="text-[10px] ml-1">{c.rating_delta > 0 ? `+${c.rating_delta}` : c.rating_delta}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{c.num_ratings?.toLocaleString()} ratings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Premium: AI Response Suggestion ──────────────────────────── */}
              {(data.ai_response_suggestion || !isPremium) && (
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                  {!isPremium && <TierGate tier="premium" feature="AI Response Suggestion" />}
                  <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm mb-1">AI-Drafted Review Response</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{data.ai_response_suggestion || "Generating personalized response…"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Premium: Review Velocity Insight ─────────────────────────── */}
              {isPremium && data.review_velocity_insight && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-4 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-sky-700 mb-0.5">Review Velocity Insight</p>
                    <p className="text-sm text-sky-800">{data.review_velocity_insight}</p>
                  </div>
                </div>
              )}

              {/* ── Upgrade CTA ───────────────────────────────────────────────── */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-base">Unlock Full Review Intelligence</p>
                    <p className="text-blue-100 text-sm mt-0.5">
                      {!isBasic
                        ? "See recent reviews, response rates and seller insights — Basic · ₹1,999/mo"
                        : "Get sentiment analysis, smart competitor matching & AI response suggestions — Premium · ₹2,999/mo"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {(!isBasic
                        ? ["Recent reviews", "Response rate tracking", "Seller rating overview"]
                        : ["Sentiment breakdown", "Smart competitor matching", "AI response drafts", "Review health score", "Velocity insights"]
                      ).map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                          <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigate("/subscription")} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
                    <Crown className="w-4 h-4" /> Upgrade Now
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}