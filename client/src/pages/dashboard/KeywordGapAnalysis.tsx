// import { useState, useEffect, useMemo } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import Sidebar from "@/components/layout/sidebar";
// import { useAuth } from "@/App";
// import {
//   Lock, Crown, RefreshCw, Menu, X, Package,
//   Search, TrendingUp, CheckCircle, AlertTriangle,
//   Zap, Target, BarChart2, ChevronDown, ChevronUp,
//   Lightbulb, FileText, Star, ArrowRight, Info,
//   Sparkles, Eye, EyeOff, Filter,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// // ── Tier Gate ─────────────────────────────────────────────────────────────────
// function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
//   const navigate = useNavigate();
//   return (
//     <div className="absolute inset-0 bg-white/88 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
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

// // ── Coverage Score Ring ───────────────────────────────────────────────────────
// function CoverageRing({ score }: { score: number }) {
//   const r = 32, circ = 2 * Math.PI * r;
//   const offset = circ - (circ * score) / 100;
//   const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
//   const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";
//   return (
//     <div className="flex flex-col items-center gap-1.5">
//       <div className="relative w-24 h-24">
//         <svg className="w-24 h-24 -rotate-90" viewBox="0 0 72 72">
//           <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
//           <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
//             strokeDasharray={circ} strokeDashoffset={offset}
//             strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
//         </svg>
//         <div className="absolute inset-0 flex flex-col items-center justify-center">
//           <span className="text-xl font-black text-slate-800">{score}</span>
//           <span className="text-[9px] text-slate-400 font-semibold">/100</span>
//         </div>
//       </div>
//       <span className="text-xs font-bold" style={{ color }}>{label} Coverage</span>
//     </div>
//   );
// }

// // ── Priority Pill ─────────────────────────────────────────────────────────────
// function PriorityPill({ priority }: { priority: string }) {
//   const map: Record<string, string> = {
//     High:   "bg-red-50 text-red-600 border-red-200",
//     Medium: "bg-amber-50 text-amber-600 border-amber-200",
//     Low:    "bg-slate-50 text-slate-500 border-slate-200",
//   };
//   return (
//     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[priority] || map.Low}`}>
//       {priority}
//     </span>
//   );
// }

// // ── Opportunity Score Bar ─────────────────────────────────────────────────────
// function OpportunityBar({ score, keyword, reason }: { score: number; keyword: string; reason: string }) {
//   const color = score >= 8 ? "#ef4444" : score >= 6 ? "#f59e0b" : score >= 4 ? "#3b82f6" : "#94a3b8";
//   return (
//     <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 mb-1">
//           <span className="text-sm font-bold text-slate-800 font-mono">{keyword}</span>
//           <span className="text-xs font-black tabular-nums" style={{ color }}>{score}/10</span>
//         </div>
//         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
//           <div
//             className="h-full rounded-full transition-all duration-700"
//             style={{ width: `${score * 10}%`, background: color }}
//           />
//         </div>
//         <p className="text-[11px] text-slate-400">{reason}</p>
//       </div>
//     </div>
//   );
// }

// // ── Keyword Pill ──────────────────────────────────────────────────────────────
// function KwPill({ kw, variant }: { kw: string; variant: "gap" | "shared" | "unique" | "review" }) {
//   const styles = {
//     gap:    "bg-red-50 text-red-700 border-red-200",
//     shared: "bg-emerald-50 text-emerald-700 border-emerald-200",
//     unique: "bg-purple-50 text-purple-700 border-purple-200",
//     review: "bg-blue-50 text-blue-700 border-blue-200",
//   };
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-semibold font-mono ${styles[variant]}`}>
//       {kw}
//     </span>
//   );
// }

// // ── Heatmap Row ───────────────────────────────────────────────────────────────
// function HeatmapRow({ item, maxFreq }: { item: any; maxFreq: number }) {
//   const pct  = Math.max((item.freq / maxFreq) * 100, 3);
//   const color = item.in_yours ? "#0ea5e9" : item.freq / maxFreq >= 0.5 ? "#ef4444" : "#f59e0b";
//   return (
//     <div className="flex items-center gap-3 py-1.5">
//       <span className="text-xs font-mono text-slate-700 w-36 shrink-0 truncate">{item.keyword}</span>
//       <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
//         <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
//       </div>
//       <span className="text-xs text-slate-400 w-14 text-right shrink-0">
//         {item.freq} title{item.freq !== 1 ? "s" : ""}
//       </span>
//       <span className="w-16 text-right shrink-0">
//         {item.in_yours
//           ? <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">✓ Yours</span>
//           : <span className="text-[10px] font-semibold text-red-400">Missing</span>
//         }
//       </span>
//     </div>
//   );
// }

// // ── Expandable Section ────────────────────────────────────────────────────────
// function Section({ title, icon: Icon, children, defaultOpen = true, count, accent }: any) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
//       >
//         <div className="flex items-center gap-2">
//           <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || "bg-sky-50"}`}>
//             <Icon className="w-4 h-4 text-sky-600" />
//           </div>
//           <span className="font-bold text-slate-800 text-sm">{title}</span>
//           {count != null && (
//             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
//           )}
//         </div>
//         {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
//       </button>
//       {open && <div className="px-5 pb-5">{children}</div>}
//     </div>
//   );
// }

// // ── Gap Keywords Table ────────────────────────────────────────────────────────
// function GapKeywordsTable({ items }: { items: any[] }) {
//   const [filter, setFilter]   = useState<"All" | "High" | "Medium" | "Low">("All");
//   const [showBigrams, setShowBigrams] = useState(true);

//   const filtered = useMemo(() => {
//     return items.filter((k) => {
//       if (filter !== "All" && k.priority !== filter) return false;
//       if (!showBigrams && k.is_bigram) return false;
//       return true;
//     });
//   }, [items, filter, showBigrams]);

//   return (
//     <div>
//       {/* Filter bar */}
//       <div className="flex flex-wrap items-center gap-2 mb-4">
//         {(["All", "High", "Medium", "Low"] as const).map((f) => (
//           <button key={f}
//             onClick={() => setFilter(f)}
//             className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
//               filter === f
//                 ? f === "High" ? "bg-red-500 text-white border-red-500"
//                 : f === "Medium" ? "bg-amber-400 text-white border-amber-400"
//                 : f === "All" ? "bg-sky-500 text-white border-sky-500"
//                 : "bg-slate-400 text-white border-slate-400"
//                 : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
//             }`}
//           >
//             {f}
//           </button>
//         ))}
//         <button
//           onClick={() => setShowBigrams(!showBigrams)}
//           className={`ml-auto flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
//             showBigrams ? "bg-white text-slate-600 border-slate-200" : "bg-slate-100 text-slate-400 border-slate-200"
//           }`}
//         >
//           {showBigrams ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
//           2-word phrases
//         </button>
//       </div>

//       {/* Table */}
//       <div className="space-y-1">
//         {filtered.slice(0, 30).map((item, i) => (
//           <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
//             item.priority === "High" ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"
//           }`}>
//             <span className="text-xs font-mono font-bold text-slate-800 flex-1 min-w-0 truncate">
//               {item.keyword}
//               {item.is_partial && (
//                 <span className="ml-1.5 text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-semibold">words exist</span>
//               )}
//             </span>
//             <span className="text-xs text-slate-500 shrink-0">{item.comp_freq} competitor{item.comp_freq !== 1 ? "s" : ""}</span>
//             <PriorityPill priority={item.priority} />
//           </div>
//         ))}
//         {filtered.length === 0 && (
//           <p className="text-sm text-slate-400 text-center py-6">No keywords match this filter.</p>
//         )}
//         {filtered.length > 30 && (
//           <p className="text-xs text-slate-400 text-center pt-2">
//             Showing top 30 of {filtered.length} — upgrade or narrow filter
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// export default function KeywordGapAnalysis() {
//   const [searchParams] = useSearchParams();
//   const navigate       = useNavigate();
//   const { user }       = useAuth();

//   const asin     = searchParams.get("asin")      || "";
//   const sellerId = searchParams.get("seller_id") || user?.seller_id || "";

//   const [data, setData]       = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [mobileMenu, setMobile] = useState(false);

//   const tier      = data?.tier || user?.subscriptionTier || "free";
//   const isBasic   = tier === "basic" || tier === "premium";
//   const isPremium = tier === "premium";

//   useEffect(() => {
//     if (!asin || !sellerId) return;
//     setLoading(true);
//     const params = new URLSearchParams({ asin, seller_id: sellerId });
//     if (user?.email) params.append("user_email", user.email);
//     fetch(`${BASE_URL}/api/keyword-gap/analyse?${params}`, { credentials: "include" })
//       .then((r) => r.ok ? r.json() : null)
//       .then((d) => d && setData(d))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [asin, sellerId, user?.email]);

//   const gapKeywords    = data?.gap_keywords    || [];
//   const sharedKeywords = data?.shared_keywords || [];
//   const uniqueKeywords = data?.unique_keywords || [];
//   const reviewKeywords = data?.review_keywords || [];
//   const heatmap        = data?.heatmap         || [];
//   const aiScores       = data?.ai_opportunity_scores || [];
//   const actionPlan     = data?.ai_action_plan  || [];
//   const competitors    = data?.competitors_analysed || [];
//   const maxHeatFreq    = heatmap.length ? Math.max(...heatmap.map((h: any) => h.freq)) : 1;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex flex-col lg:flex-row">
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

//         {/* ── Header ─────────────────────────────────────────────────────── */}
//         <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
//           <div className="flex items-center gap-3">
//             <button onClick={() => setMobile(true)} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
//               <Menu className="w-5 h-5 text-sky-900" />
//             </button>
//             <div className="w-px h-5 bg-slate-200" />
//             <div>
//               <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
//                 <Search className="w-5 h-5 text-sky-600" /> Keyword Gap Analysis
//               </h2>
//               <p className="text-xs text-slate-500 hidden sm:block">Discover keywords your competitors use that you don't</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
//               {tier.toUpperCase()}
//             </Badge>
//             {!isPremium && (
//               <button onClick={() => navigate("/subscription")}
//                 className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
//                 <Crown className="w-3 h-3" /> Upgrade
//               </button>
//             )}
//           </div>
//         </header>

//         <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-5">

//           {/* ── No product selected ────────────────────────────────────── */}
//           {!asin && (
//             <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
//               <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
//                 <Search className="w-8 h-8 text-sky-400" />
//               </div>
//               <div>
//                 <p className="text-lg font-bold text-slate-700">No product selected</p>
//                 <p className="text-sm text-slate-400 mt-1">Select a product from My Products to analyse its keyword gaps.</p>
//               </div>
//               <button onClick={() => navigate("/seller/my-products")}
//                 className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
//                 Go to My Products
//               </button>
//             </div>
//           )}

//           {/* ── Loading ─────────────────────────────────────────────────── */}
//           {asin && loading && (
//             <div className="flex flex-col items-center justify-center h-64 gap-3">
//               <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
//               <div className="text-center">
//                 <p className="text-slate-600 font-semibold">Analysing keyword gaps…</p>
//                 <p className="text-xs text-slate-400 mt-1">Scanning competitor titles and mining opportunities</p>
//               </div>
//             </div>
//           )}

//           {/* ── Main content ─────────────────────────────────────────────── */}
//           {asin && !loading && data && (
//             <>
//               {/* Product card */}
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
//                     {/* Data quality badge */}
//                     {data.data_quality === "live" && (
//                       <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
//                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                         {data.competitor_count} competitors analysed
//                       </span>
//                     )}
//                     {data.data_quality === "limited" && (
//                       <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
//                         <AlertTriangle className="w-3 h-3" /> Limited data ({data.competitor_count})
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Coverage ring — basic+ */}
//                 {isBasic && data.coverage_score != null && (
//                   <div className="flex-shrink-0">
//                     <CoverageRing score={data.coverage_score} />
//                   </div>
//                 )}

//                 {/* Free tier: teaser */}
//                 {!isBasic && (
//                   <div className="flex-shrink-0 text-right">
//                     <p className="text-3xl font-black text-red-500">{data.gap_count_teaser ?? "—"}</p>
//                     <p className="text-xs text-slate-400 mt-0.5">keyword gaps found</p>
//                     <button onClick={() => navigate("/subscription")}
//                       className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors">
//                       Unlock all →
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* ── Free tier: Your keywords (always shown) ────────────── */}
//               <Section title="Your Title Keywords" icon={FileText} count={data.your_keyword_count} defaultOpen={true}>
//                 <p className="text-xs text-slate-400 mb-3">Every keyword extracted from your current product title</p>
//                 <div className="flex flex-wrap gap-1.5">
//                   {(data.your_keywords || []).map((kw: string, i: number) => (
//                     <KwPill key={i} kw={kw} variant="shared" />
//                   ))}
//                   {(data.your_keywords || []).length === 0 && (
//                     <p className="text-sm text-slate-400">No keywords found in title.</p>
//                   )}
//                 </div>
//               </Section>

//               {/* ── Free tier: Gap count teaser ─────────────────────────── */}
//               {!isBasic && (
//                 <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
//                   <TierGate tier="basic" feature="Full Keyword Gap Analysis" />
//                   <div className="blur-sm pointer-events-none">
//                     <div className="grid grid-cols-3 gap-4 mb-5">
//                       {[
//                         { label: "Gap Keywords", value: data.gap_count_teaser ?? "—", color: "text-red-500" },
//                         { label: "Coverage Score", value: "—/100", color: "text-amber-500" },
//                         { label: "Competitors Scanned", value: "—", color: "text-sky-600" },
//                       ].map((s) => (
//                         <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
//                           <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
//                           <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="space-y-2">
//                       {["memory card", "high speed", "4k uhd", "class 10", "waterproof"].map((kw, i) => (
//                         <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
//                           <span className="text-xs font-mono font-bold text-slate-800 flex-1">{kw}</span>
//                           <span className="text-xs text-slate-500">3 competitors</span>
//                           <PriorityPill priority="High" />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* ── Basic+: Stats bar ────────────────────────────────────── */}
//               {isBasic && (
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                   {[
//                     { label: "Gap Keywords",    value: String(data.gap_count_teaser ?? "—"), sub: "not in your title", color: "text-red-500" },
//                     { label: "Shared Keywords", value: String(sharedKeywords.length),        sub: "matching competitors", color: "text-emerald-600" },
//                     { label: "Your Unique KWs", value: String(uniqueKeywords.length),        sub: "only in your title", color: "text-purple-600" },
//                     { label: "Coverage Score",  value: `${data.coverage_score ?? "—"}/100`,  sub: "vs top 30 competitor KWs", color: "text-sky-600" },
//                   ].map((s) => (
//                     <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
//                       <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
//                       <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
//                       <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* ── Basic+: Gap keywords ─────────────────────────────────── */}
//               {isBasic && (
//                 <Section title="Missing Keywords (Gap)" icon={AlertTriangle} count={gapKeywords.length}
//                   accent="bg-red-50" defaultOpen={true}>
//                   <p className="text-xs text-slate-400 mb-4">
//                     Keywords your competitors use that are absent from your title.
//                     <span className="ml-1 text-red-500 font-semibold">Red = High priority</span> (50 %+ of competitors use it).
//                   </p>
//                   {gapKeywords.length > 0
//                     ? <GapKeywordsTable items={gapKeywords} />
//                     : <p className="text-sm text-slate-400 text-center py-6">No gap keywords found — excellent coverage!</p>
//                   }
//                 </Section>
//               )}

//               {/* ── Basic+: Keyword heatmap ──────────────────────────────── */}
//               {isBasic && (
//                 <Section title="Competitor Keyword Heatmap" icon={BarChart2} defaultOpen={false}>
//                   <p className="text-xs text-slate-400 mb-4">
//                     How often each keyword appears across all analysed competitor titles.
//                     <span className="ml-1 text-sky-500 font-semibold">Blue = in your title</span>,
//                     <span className="ml-1 text-red-500 font-semibold">Red = high-frequency gap</span>.
//                   </p>
//                   <div className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
//                     {heatmap.map((item: any, i: number) => (
//                       <HeatmapRow key={i} item={item} maxFreq={maxHeatFreq} />
//                     ))}
//                     {heatmap.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No heatmap data.</p>}
//                   </div>
//                 </Section>
//               )}

//               {/* ── Basic+: Shared + Unique keywords ────────────────────── */}
//               {isBasic && (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                   <Section title="Shared Keywords" icon={CheckCircle} count={sharedKeywords.length} accent="bg-emerald-50" defaultOpen={false}>
//                     <p className="text-xs text-slate-400 mb-3">Keywords you share with competitors — good coverage here.</p>
//                     <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
//                       {sharedKeywords.map((s: any, i: number) => (
//                         <div key={i} className="flex items-center gap-1">
//                           <KwPill kw={s.keyword} variant="shared" />
//                           {s.comp_freq > 1 && <span className="text-[9px] text-slate-400">×{s.comp_freq}</span>}
//                         </div>
//                       ))}
//                       {sharedKeywords.length === 0 && <p className="text-sm text-slate-400">None found.</p>}
//                     </div>
//                   </Section>

//                   <Section title="Your Unique Keywords" icon={Star} count={uniqueKeywords.length} accent="bg-purple-50" defaultOpen={false}>
//                     <p className="text-xs text-slate-400 mb-3">Keywords only in your title — these are your differentiators. Keep them.</p>
//                     <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
//                       {uniqueKeywords.map((kw: string, i: number) => (
//                         <KwPill key={i} kw={kw} variant="unique" />
//                       ))}
//                       {uniqueKeywords.length === 0 && <p className="text-sm text-slate-400">None found — you are closely aligned with competitors.</p>}
//                     </div>
//                   </Section>
//                 </div>
//               )}

//               {/* ── Basic+: Competitors analysed ────────────────────────── */}
//               {isBasic && competitors.length > 0 && (
//                 <Section title="Competitors Analysed" icon={Eye} count={competitors.length} defaultOpen={false}>
//                   <p className="text-xs text-slate-400 mb-4">Products whose titles were used for keyword gap analysis, ranked by similarity.</p>
//                   <div className="space-y-2">
//                     {competitors.map((c: any, i: number) => (
//                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
//                         <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
//                           {c.photo
//                             ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" />
//                             : <Package className="w-4 h-4 text-slate-300" />
//                           }
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-semibold text-slate-700 line-clamp-1">{c.title}</p>
//                           <div className="flex items-center gap-1.5 mt-0.5">
//                             <span className="text-[10px] text-slate-400 font-mono">{c.asin}</span>
//                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
//                               c.similarity >= 0.5 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                               : c.similarity >= 0.25 ? "bg-amber-50 text-amber-700 border-amber-200"
//                               : "bg-slate-50 text-slate-500 border-slate-200"
//                             }`}>
//                               {Math.round(c.similarity * 100)}% match
//                             </span>
//                             {c.is_prime && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">P</span>}
//                           </div>
//                         </div>
//                         {c.star_rating && (
//                           <div className="text-right shrink-0">
//                             <p className="text-xs font-black text-amber-500">{c.star_rating}★</p>
//                             {c.num_ratings && <p className="text-[10px] text-slate-400">{c.num_ratings.toLocaleString()}</p>}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </Section>
//               )}

//               {/* ── Premium: Review keywords ─────────────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//                 {!isPremium && <TierGate tier="premium" feature="Customer Review Keyword Mining" />}
//                 <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                   <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
//                     <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
//                       <Lightbulb className="w-4 h-4 text-blue-500" />
//                     </div>
//                     <span className="font-bold text-slate-800 text-sm">Customer Review Keyword Mining</span>
//                     {isPremium && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{reviewKeywords.length}</span>}
//                   </div>
//                   <div className="px-5 pb-5 pt-3">
//                     <p className="text-xs text-slate-400 mb-4">
//                       Keywords your customers actually use in reviews — often missed in titles but highly converting.
//                     </p>
//                     {reviewKeywords.length > 0 ? (
//                       <div className="space-y-2">
//                         {reviewKeywords.map((rk: any, i: number) => (
//                           <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
//                             <span className="text-xs font-mono font-bold text-slate-800 flex-1">{rk.keyword}</span>
//                             <span className="text-[10px] text-slate-500">{rk.review_freq} reviews</span>
//                             {rk.in_competitors > 0 && (
//                               <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded font-semibold">
//                                 {rk.in_competitors} comp
//                               </span>
//                             )}
//                             <PriorityPill priority={rk.priority} />
//                           </div>
//                         ))}
//                       </div>
//                     ) : isPremium ? (
//                       <p className="text-sm text-slate-400 text-center py-4">
//                         No review-specific keywords found — reviews may not have enough text.
//                       </p>
//                     ) : (
//                       <div className="space-y-2">
//                         {["fast delivery", "works great", "easy setup", "good value", "highly recommend"].map((kw, i) => (
//                           <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
//                             <span className="text-xs font-mono font-bold text-slate-800 flex-1">{kw}</span>
//                             <PriorityPill priority={i < 2 ? "High" : "Medium"} />
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Premium: AI opportunity scores ─────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//                 {!isPremium && <TierGate tier="premium" feature="AI Keyword Opportunity Scores" />}
//                 <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                   <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
//                     <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
//                       <Sparkles className="w-4 h-4 text-white" />
//                     </div>
//                     <span className="font-bold text-slate-800 text-sm">AI Keyword Opportunity Scores</span>
//                   </div>
//                   <div className="px-5 pb-5 pt-3">
//                     <p className="text-xs text-slate-400 mb-4">
//                       AI-ranked by opportunity value (1–10). Higher = more impactful to add to your listing.
//                     </p>
//                     {aiScores.length > 0 ? (
//                       aiScores.map((s: any, i: number) => (
//                         <OpportunityBar key={i} score={s.score} keyword={s.keyword} reason={s.reason} />
//                       ))
//                     ) : isPremium ? (
//                       <p className="text-sm text-slate-400 text-center py-4">AI scoring not available — no gap keywords found.</p>
//                     ) : (
//                       [{ score: 9, keyword: "high speed", reason: "Used by 4/5 competitors; core search term" },
//                        { score: 8, keyword: "class 10",   reason: "Specification term buyers search directly" },
//                        { score: 6, keyword: "waterproof", reason: "Feature differentiator" }].map((s, i) => (
//                         <OpportunityBar key={i} {...s} />
//                       ))
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Premium: AI listing rewrite ─────────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//                 {!isPremium && <TierGate tier="premium" feature="AI Listing Rewrite Suggestion" />}
//                 <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                   <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
//                     <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
//                       <Zap className="w-4 h-4 text-white" />
//                     </div>
//                     <span className="font-bold text-slate-800 text-sm">AI-Suggested Title Rewrite</span>
//                   </div>
//                   <div className="px-5 pb-5 pt-4">
//                     {data.ai_listing_rewrite ? (
//                       <>
//                         <div className="mb-3">
//                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Current Title</p>
//                           <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">{data.product_title}</p>
//                         </div>
//                         <ArrowRight className="w-4 h-4 text-slate-300 mx-auto my-2" />
//                         <div>
//                           <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">AI Suggested Title</p>
//                           <p className="text-sm font-semibold text-slate-800 bg-violet-50 rounded-xl px-4 py-3 border border-violet-200 leading-relaxed">
//                             {data.ai_listing_rewrite}
//                           </p>
//                         </div>
//                         <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
//                           <Info className="w-3 h-3" /> Always verify this complies with Amazon's title policy before using.
//                         </p>
//                       </>
//                     ) : isPremium ? (
//                       <p className="text-sm text-slate-400 text-center py-4">Rewrite not available — insufficient gap data.</p>
//                     ) : (
//                       <div>
//                         <div className="mb-3">
//                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Current Title</p>
//                           <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 line-clamp-2">{data.product_title}</p>
//                         </div>
//                         <ArrowRight className="w-4 h-4 text-slate-300 mx-auto my-2" />
//                         <div>
//                           <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">AI Suggested Title</p>
//                           <p className="text-sm font-semibold text-slate-400 bg-violet-50 rounded-xl px-4 py-3 border border-violet-100 blur-sm select-none">
//                             SANDISK 64GB Extreme PRO SDXC Memory Card High Speed Class 10 U3 V30 4K UHD Waterproof — SDSDXXU-064G
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Premium: Action plan ────────────────────────────────── */}
//               <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//                 {!isPremium && <TierGate tier="premium" feature="AI Prioritised Action Plan" />}
//                 <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
//                   <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
//                     <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
//                       <Target className="w-4 h-4 text-emerald-600" />
//                     </div>
//                     <span className="font-bold text-slate-800 text-sm">Prioritised Action Plan</span>
//                   </div>
//                   <div className="px-5 pb-5 pt-4">
//                     {actionPlan.length > 0 ? (
//                       <div className="space-y-3">
//                         {actionPlan.map((step: string, i: number) => (
//                           <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
//                             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
//                               <span className="text-xs font-black text-white">{i + 1}</span>
//                             </div>
//                             <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
//                           </div>
//                         ))}
//                       </div>
//                     ) : isPremium ? (
//                       <p className="text-sm text-slate-400 text-center py-4">Action plan not available.</p>
//                     ) : (
//                       <div className="space-y-3">
//                         {[
//                           "Add high-priority gap keywords to your title: \"high speed\", \"class 10\", \"4k uhd\"",
//                           "Use backend search terms in Seller Central for keywords that don't fit the title",
//                           "Keep your differentiators — they are unique to your listing",
//                         ].map((step, i) => (
//                           <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
//                             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
//                               <span className="text-xs font-black text-white">{i + 1}</span>
//                             </div>
//                             <p className="text-sm text-slate-500 leading-relaxed">{step}</p>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Upgrade CTA ─────────────────────────────────────────── */}
//               {!isPremium && (
//                 <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                   <div>
//                     <p className="font-bold text-base">Unlock Full Keyword Intelligence</p>
//                     <p className="text-blue-100 text-sm mt-0.5">
//                       {!isBasic
//                         ? "Get gap keywords, coverage score, heatmap & competitor analysis — Basic · ₹1,999/mo"
//                         : "Get AI opportunity scores, listing rewrite & action plan — Premium · ₹2,999/mo"}
//                     </p>
//                     <div className="flex flex-wrap gap-3 mt-2">
//                       {(!isBasic
//                         ? ["Gap keywords", "Coverage score", "Keyword heatmap", "Competitor breakdown"]
//                         : ["AI opportunity scores", "Listing rewrite", "Review keyword mining", "Action plan"]
//                       ).map((f) => (
//                         <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
//                           <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <button onClick={() => navigate("/subscription")}
//                     className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
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


import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/App";
import {
  Lock, Crown, RefreshCw, Menu, X, Package,
  Search, TrendingUp, CheckCircle, AlertTriangle,
  Zap, Target, BarChart2, ChevronDown, ChevronUp,
  Lightbulb, FileText, Star, ArrowRight, Info,
  Sparkles, Eye, EyeOff, Filter, Layers, Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Cluster icon + colour map ─────────────────────────────────────────────────
const CLUSTER_META: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  "Speed & Performance":   { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    emoji: "⚡" },
  "Storage Capacity":      { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   emoji: "💾" },
  "Compatibility":         { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", emoji: "🔌" },
  "Durability & Build":    { color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200",emoji: "🛡️" },
  "Format & Standard":     { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  emoji: "📋" },
  "Brand & Certification": { color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-200",    emoji: "✅" },
  "Use Case":              { color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-200",   emoji: "🎯" },
  "Gap Keywords":          { color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200",  emoji: "🔑" },
  "Other":                 { color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-100",  emoji: "📦" },
};

function clusterMeta(name: string) {
  return CLUSTER_META[name] || CLUSTER_META["Other"];
}

// ── Placement badge ───────────────────────────────────────────────────────────
function PlacementBadge({ placement }: { placement: string }) {
  const map: Record<string, string> = {
    title:   "bg-violet-100 text-violet-700 border-violet-200",
    bullets: "bg-amber-100 text-amber-700 border-amber-200",
    backend: "bg-sky-100 text-sky-700 border-sky-200",
  };
  const label: Record<string, string> = {
    title:   "→ Title",
    bullets: "→ Bullets",
    backend: "→ Backend",
  };
  const key = (placement || "backend").toLowerCase();
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[key] || map.backend}`}>
      {label[key] || "→ Backend"}
    </span>
  );
}

// ── Semantic distance indicator ───────────────────────────────────────────────
function SemanticBadge({ sim }: { sim: number }) {
  if (sim == null) return null;
  if (sim >= 0.5)
    return <span title="Semantically close — easy to add" className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">≈ Similar</span>;
  if (sim >= 0.25)
    return <span title="Partially related concept" className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">~ Partial</span>;
  return <span title="Genuinely new concept — high discovery value" className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">✦ New concept</span>;
}

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 bg-white/88 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "premium" ? "bg-blue-50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "premium" ? "text-blue-500" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-slate-800 text-sm">{feature}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
        </p>
      </div>
      <button
        onClick={() => navigate("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Coverage Score Ring ───────────────────────────────────────────────────────
function CoverageRing({ score }: { score: number }) {
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800">{score}</span>
          <span className="text-[9px] text-slate-400 font-semibold">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label} Coverage</span>
    </div>
  );
}

// ── Priority Pill ─────────────────────────────────────────────────────────────
function PriorityPill({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    High:   "bg-red-50 text-red-600 border-red-200",
    Medium: "bg-amber-50 text-amber-600 border-amber-200",
    Low:    "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[priority] || map.Low}`}>
      {priority}
    </span>
  );
}

// ── Opportunity Score Bar ─────────────────────────────────────────────────────
function OpportunityBar({ score, keyword, reason, add_to, is_spec }: {
  score: number; keyword: string; reason: string; add_to?: string; is_spec?: boolean;
}) {
  const color = score >= 8 ? "#ef4444" : score >= 6 ? "#f59e0b" : score >= 4 ? "#3b82f6" : "#94a3b8";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-slate-800 font-mono">{keyword}</span>
          <span className="text-xs font-black tabular-nums" style={{ color }}>{score}/10</span>
          {add_to && <PlacementBadge placement={add_to} />}
          {is_spec && (
            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">SPEC</span>
          )}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score * 10}%`, background: color }}
          />
        </div>
        <p className="text-[11px] text-slate-400">{reason}</p>
      </div>
    </div>
  );
}

// ── Keyword Pill ──────────────────────────────────────────────────────────────
function KwPill({ kw, variant }: { kw: string; variant: "gap" | "shared" | "unique" | "review" }) {
  const styles = {
    gap:    "bg-red-50 text-red-700 border-red-200",
    shared: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unique: "bg-purple-50 text-purple-700 border-purple-200",
    review: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-semibold font-mono ${styles[variant]}`}>
      {kw}
    </span>
  );
}

// ── Heatmap Row ───────────────────────────────────────────────────────────────
function HeatmapRow({ item, maxFreq }: { item: any; maxFreq: number }) {
  const pct  = Math.max((item.freq / maxFreq) * 100, 3);
  const color = item.in_yours ? "#0ea5e9" : item.freq / maxFreq >= 0.5 ? "#ef4444" : "#f59e0b";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs font-mono text-slate-700 w-36 shrink-0 truncate">{item.keyword}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-400 w-14 text-right shrink-0">
        {item.freq} title{item.freq !== 1 ? "s" : ""}
      </span>
      <span className="w-16 text-right shrink-0">
        {item.in_yours
          ? <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">✓ Yours</span>
          : <span className="text-[10px] font-semibold text-red-400">Missing</span>
        }
      </span>
    </div>
  );
}

// ── Expandable Section ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true, count, accent }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || "bg-sky-50"}`}>
            <Icon className="w-4 h-4 text-sky-600" />
          </div>
          <span className="font-bold text-slate-800 text-sm">{title}</span>
          {count != null && (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ── NEW: Semantic Gap Clusters ────────────────────────────────────────────────
function GapClusters({ clusters }: { clusters: Record<string, string[]> }) {
  const entries = Object.entries(clusters).filter(([, kws]) => kws.length > 0);
  if (entries.length === 0) return null;

  return (
    <Section title="Semantic Keyword Clusters" icon={Layers} defaultOpen={true} accent="bg-violet-50">
      <p className="text-xs text-slate-400 mb-4">
        Gap keywords grouped by concept. Each cluster represents a content area your listing is missing.
        Focus on clusters with the most keywords first.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([name, kws]) => {
            const meta = clusterMeta(name);
            return (
              <div key={name} className={`rounded-xl border p-3 ${meta.bg} ${meta.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black ${meta.color} flex items-center gap-1.5`}>
                    <span>{meta.emoji}</span> {name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 border ${meta.border} ${meta.color}`}>
                    {kws.length} keyword{kws.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {kws.slice(0, 6).map((kw, i) => (
                    <span key={i} className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-md bg-white/60 border ${meta.border} ${meta.color}`}>
                      {kw}
                    </span>
                  ))}
                  {kws.length > 6 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/40 ${meta.color}`}>
                      +{kws.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </Section>
  );
}

// ── Gap Keywords Table (updated with semantic_sim_to_yours) ───────────────────
function GapKeywordsTable({ items }: { items: any[] }) {
  const [filter, setFilter]       = useState<"All" | "High" | "Medium" | "Low">("All");
  const [showBigrams, setShowBigrams] = useState(true);
  const [showSemantic, setShowSemantic] = useState(true);

  const filtered = useMemo(() => {
    return items.filter((k) => {
      if (filter !== "All" && k.priority !== filter) return false;
      if (!showBigrams && k.is_bigram) return false;
      return true;
    });
  }, [items, filter, showBigrams]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["All", "High", "Medium", "Low"] as const).map((f) => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
              filter === f
                ? f === "High" ? "bg-red-500 text-white border-red-500"
                : f === "Medium" ? "bg-amber-400 text-white border-amber-400"
                : f === "All" ? "bg-sky-500 text-white border-sky-500"
                : "bg-slate-400 text-white border-slate-400"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowSemantic(!showSemantic)}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              showSemantic ? "bg-violet-50 text-violet-600 border-violet-200" : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            <Cpu className="w-3 h-3" /> Semantic
          </button>
          <button
            onClick={() => setShowBigrams(!showBigrams)}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              showBigrams ? "bg-white text-slate-600 border-slate-200" : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
          >
            {showBigrams ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            2-word
          </button>
        </div>
      </div>

      {/* Legend for semantic badges */}
      {showSemantic && (
        <div className="flex flex-wrap gap-2 mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-semibold mr-1 self-center">Semantic distance:</span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">≈ Similar</span>
          <span className="text-[9px] text-slate-400 self-center">easy to rephrase into title</span>
          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">✦ New concept</span>
          <span className="text-[9px] text-slate-400 self-center">genuinely missing content area</span>
        </div>
      )}

      {/* Table */}
      <div className="space-y-1">
        {filtered.slice(0, 30).map((item, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors flex-wrap ${
            item.priority === "High" ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"
          }`}>
            <span className="text-xs font-mono font-bold text-slate-800 flex-1 min-w-0 truncate">
              {item.keyword}
              {item.is_partial && (
                <span className="ml-1.5 text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-semibold">words exist</span>
              )}
            </span>
            <span className="text-xs text-slate-500 shrink-0">{item.comp_freq} comp</span>
            {showSemantic && item.semantic_sim_to_yours != null && (
              <SemanticBadge sim={item.semantic_sim_to_yours} />
            )}
            <PriorityPill priority={item.priority} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">No keywords match this filter.</p>
        )}
        {filtered.length > 30 && (
          <p className="text-xs text-slate-400 text-center pt-2">
            Showing top 30 of {filtered.length} — narrow filter to see more
          </p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function KeywordGapAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();

  const asin     = searchParams.get("asin")      || "";
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
    fetch(`${BASE_URL}/api/keyword-gap/analyse?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email]);

  const gapKeywords    = data?.gap_keywords    || [];
  const sharedKeywords = data?.shared_keywords || [];
  const uniqueKeywords = data?.unique_keywords || [];
  const reviewKeywords = data?.review_keywords || [];
  const heatmap        = data?.heatmap         || [];
  const aiScores       = data?.ai_opportunity_scores || [];
  const actionPlan     = data?.ai_action_plan  || [];
  const competitors    = data?.competitors_analysed || [];
  const gapClusters    = data?.gap_clusters    || {};           // NEW
  const maxHeatFreq    = heatmap.length ? Math.max(...heatmap.map((h: any) => h.freq)) : 1;
  const embeddingModel = data?.embedding_model || null;         // NEW

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex flex-col lg:flex-row">
      {mobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobile(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobile(false)}><X className="w-5 h-5" /></button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30"><Sidebar /></aside>

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobile(true)} className="lg:hidden p-2 rounded-lg hover:bg-sky-100">
              <Menu className="w-5 h-5 text-sky-900" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-600" /> Keyword Gap Analysis
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">Discover keywords your competitors use that you don't</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* NEW: embedding model badge */}
            {embeddingModel && embeddingModel !== "jaccard_fallback" && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-1 rounded-full">
                <Cpu className="w-3 h-3" /> Semantic AI
              </span>
            )}
            <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700" : tier === "basic" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {tier.toUpperCase()}
            </Badge>
            {!isPremium && (
              <button onClick={() => navigate("/subscription")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all">
                <Crown className="w-3 h-3" /> Upgrade
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-5">

          {/* ── No product selected ────────────────────────────────────── */}
          {!asin && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">No product selected</p>
                <p className="text-sm text-slate-400 mt-1">Select a product from My Products to analyse its keyword gaps.</p>
              </div>
              <button onClick={() => navigate("/seller/my-products")}
                className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors">
                Go to My Products
              </button>
            </div>
          )}

          {/* ── Loading ─────────────────────────────────────────────────── */}
          {asin && loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <div className="text-center">
                <p className="text-slate-600 font-semibold">Analysing keyword gaps…</p>
              </div>
            </div>
          )}

          {/* ── Main content ─────────────────────────────────────────────── */}
          {asin && !loading && data && (
            <>
              {/* Product card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {data.product_photo
                    ? <img src={data.product_photo} alt={data.product_title} className="w-full h-full object-contain p-1" />
                    : <Package className="w-8 h-8 text-slate-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-base line-clamp-2">{data.product_title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-400 font-mono">{data.asin}</span>
                    {data.is_prime && <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">PRIME</Badge>}
                    {data.is_best_seller && <Badge className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1.5 py-0">BEST SELLER</Badge>}
                    {data.data_quality === "live" && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {data.competitor_count} competitors analysed
                      </span>
                    )}
                    {data.data_quality === "limited" && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Limited data ({data.competitor_count})
                      </span>
                    )}
                    {/* NEW: semantic AI badge on product card */}
                    {embeddingModel && embeddingModel !== "jaccard_fallback" && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                        <Cpu className="w-3 h-3" /> Semantic similarity
                      </span>
                    )}
                  </div>
                </div>

                {isBasic && data.coverage_score != null && (
                  <div className="flex-shrink-0">
                    <CoverageRing score={data.coverage_score} />
                  </div>
                )}

                {!isBasic && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-black text-red-500">{data.gap_count_teaser ?? "—"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">keyword gaps found</p>
                    <button onClick={() => navigate("/subscription")}
                      className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors">
                      Unlock all →
                    </button>
                  </div>
                )}
              </div>

              {/* ── Free: Your keywords ────────────────────────────────── */}
              <Section title="Your Title Keywords" icon={FileText} count={data.your_keyword_count} defaultOpen={true}>
                <p className="text-xs text-slate-400 mb-3">Every keyword extracted from your current product title</p>
                <div className="flex flex-wrap gap-1.5">
                  {(data.your_keywords || []).map((kw: string, i: number) => (
                    <KwPill key={i} kw={kw} variant="shared" />
                  ))}
                  {(data.your_keywords || []).length === 0 && (
                    <p className="text-sm text-slate-400">No keywords found in title.</p>
                  )}
                </div>
              </Section>

              {/* ── Free: teaser gate ─────────────────────────────────── */}
              {!isBasic && (
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                  <TierGate tier="basic" feature="Full Keyword Gap Analysis" />
                  <div className="blur-sm pointer-events-none">
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      {[
                        { label: "Gap Keywords", value: data.gap_count_teaser ?? "—", color: "text-red-500" },
                        { label: "Coverage Score", value: "—/100", color: "text-amber-500" },
                        { label: "Competitors Scanned", value: "—", color: "text-sky-600" },
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                          <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {["memory card", "high speed", "4k uhd", "class 10", "waterproof"].map((kw, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                          <span className="text-xs font-mono font-bold text-slate-800 flex-1">{kw}</span>
                          <span className="text-xs text-slate-500">3 competitors</span>
                          <PriorityPill priority="High" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Basic+: Stats bar ─────────────────────────────────── */}
              {isBasic && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Gap Keywords",    value: String(data.gap_count_teaser ?? "—"), sub: "not in your title", color: "text-red-500" },
                    { label: "Shared Keywords", value: String(sharedKeywords.length),        sub: "matching competitors", color: "text-emerald-600" },
                    { label: "Your Unique KWs", value: String(uniqueKeywords.length),        sub: "only in your title", color: "text-purple-600" },
                    { label: "Coverage Score",  value: `${data.coverage_score ?? "—"}/100`,  sub: "vs top 40 competitor KWs", color: "text-sky-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Basic+: Gap keywords ──────────────────────────────── */}
              {isBasic && (
                <Section title="Missing Keywords (Gap)" icon={AlertTriangle} count={gapKeywords.length}
                  accent="bg-red-50" defaultOpen={true}>
                  <p className="text-xs text-slate-400 mb-4">
                    Keywords your competitors use that are absent from your title.
                    <span className="ml-1 text-red-500 font-semibold">Red = High priority</span> (50%+ of competitors).
                    Semantic badges show whether the concept is new or just rephrased.
                  </p>
                  {gapKeywords.length > 0
                    ? <GapKeywordsTable items={gapKeywords} />
                    : <p className="text-sm text-slate-400 text-center py-6">No gap keywords — excellent coverage!</p>
                  }
                </Section>
              )}

              {/* ── Basic+: NEW Semantic Gap Clusters ────────────────── */}
              {isBasic && Object.keys(gapClusters).length > 0 && (
                <GapClusters clusters={gapClusters} />
              )}

              {/* ── Basic+: Keyword heatmap ───────────────────────────── */}
              {isBasic && (
                <Section title="Competitor Keyword Heatmap" icon={BarChart2} defaultOpen={false}>
                  <p className="text-xs text-slate-400 mb-4">
                    How often each keyword appears across competitor titles.
                    <span className="ml-1 text-sky-500 font-semibold">Blue = in your title</span>,
                    <span className="ml-1 text-red-500 font-semibold">Red = high-frequency gap</span>.
                  </p>
                  <div className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                    {heatmap.map((item: any, i: number) => (
                      <HeatmapRow key={i} item={item} maxFreq={maxHeatFreq} />
                    ))}
                    {heatmap.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No heatmap data.</p>}
                  </div>
                </Section>
              )}

              {/* ── Basic+: Shared + Unique ───────────────────────────── */}
              {isBasic && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Section title="Shared Keywords" icon={CheckCircle} count={sharedKeywords.length} accent="bg-emerald-50" defaultOpen={false}>
                    <p className="text-xs text-slate-400 mb-3">Keywords you share with competitors — good coverage here.</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {sharedKeywords.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <KwPill kw={s.keyword} variant="shared" />
                          {s.comp_freq > 1 && <span className="text-[9px] text-slate-400">×{s.comp_freq}</span>}
                        </div>
                      ))}
                      {sharedKeywords.length === 0 && <p className="text-sm text-slate-400">None found.</p>}
                    </div>
                  </Section>

                  <Section title="Your Unique Keywords" icon={Star} count={uniqueKeywords.length} accent="bg-purple-50" defaultOpen={false}>
                    <p className="text-xs text-slate-400 mb-3">Keywords only in your title — your differentiators. Keep them.</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {uniqueKeywords.map((kw: string, i: number) => (
                        <KwPill key={i} kw={kw} variant="unique" />
                      ))}
                      {uniqueKeywords.length === 0 && <p className="text-sm text-slate-400">Closely aligned with competitors.</p>}
                    </div>
                  </Section>
                </div>
              )}

              {/* ── Basic+: Competitors analysed ──────────────────────── */}
              {isBasic && competitors.length > 0 && (
                <Section title="Competitors Analysed" icon={Eye} count={competitors.length} defaultOpen={false}>
                  <p className="text-xs text-slate-400 mb-4">
                    Products ranked by semantic similarity to your title.
                    {embeddingModel && embeddingModel !== "jaccard_fallback" &&
                      <span className="ml-1 text-violet-500 font-semibold">Scores use AI embeddings.</span>
                    }
                  </p>
                  <div className="space-y-2">
                    {competitors.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {c.photo
                            ? <img src={c.photo} alt="" className="w-full h-full object-contain p-0.5" />
                            : <Package className="w-4 h-4 text-slate-300" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 line-clamp-1">{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">{c.asin}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              c.similarity >= 0.5 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : c.similarity >= 0.3 ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}>
                              {Math.round(c.similarity * 100)}% match
                            </span>
                            {c.is_prime && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">P</span>}
                          </div>
                        </div>
                        {c.star_rating && (
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-amber-500">{c.star_rating}★</p>
                            {c.num_ratings && <p className="text-[10px] text-slate-400">{c.num_ratings.toLocaleString()}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* ── Premium: Review keywords ──────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="Customer Review Keyword Mining" />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Customer Review Keyword Mining</span>
                    {isPremium && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{reviewKeywords.length}</span>}
                  </div>
                  <div className="px-5 pb-5 pt-3">
                    <p className="text-xs text-slate-400 mb-4">
                      Keywords your customers actually use in reviews — often missed in titles but highly converting.
                    </p>
                    {reviewKeywords.length > 0 ? (
                      <div className="space-y-2">
                        {reviewKeywords.map((rk: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                            <span className="text-xs font-mono font-bold text-slate-800 flex-1">{rk.keyword}</span>
                            <span className="text-[10px] text-slate-500">{rk.review_freq} reviews</span>
                            {rk.in_competitors > 0 && (
                              <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded font-semibold">
                                {rk.in_competitors} comp
                              </span>
                            )}
                            <PriorityPill priority={rk.priority} />
                          </div>
                        ))}
                      </div>
                    ) : isPremium ? (
                      <p className="text-sm text-slate-400 text-center py-4">No review-specific keywords found.</p>
                    ) : (
                      <div className="space-y-2">
                        {["fast delivery", "works great", "easy setup", "good value", "highly recommend"].map((kw, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                            <span className="text-xs font-mono font-bold text-slate-800 flex-1">{kw}</span>
                            <PriorityPill priority={i < 2 ? "High" : "Medium"} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Premium: AI opportunity scores ────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="AI Keyword Opportunity Scores" />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">AI Keyword Opportunity Scores</span>
                  </div>
                  <div className="px-5 pb-5 pt-3">
                    <p className="text-xs text-slate-400 mb-1">
                      AI-ranked by opportunity value (1–10). Includes placement advice — where to add each keyword.
                    </p>
                    {/* NEW: placement legend */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <PlacementBadge placement="title" />
                      <PlacementBadge placement="bullets" />
                      <PlacementBadge placement="backend" />
                    </div>
                    {aiScores.length > 0 ? (
                      aiScores.map((s: any, i: number) => (
                        <OpportunityBar key={i} score={s.score} keyword={s.keyword} reason={s.reason} add_to={s.add_to} is_spec={s.is_spec} />
                      ))
                    ) : isPremium ? (
                      <p className="text-sm text-slate-400 text-center py-4">AI scoring not available — no gap keywords found.</p>
                    ) : (
                      [{ score: 9, keyword: "high speed", reason: "Used by 4/5 competitors; core search term", add_to: "title" },
                       { score: 8, keyword: "class 10",   reason: "Specification term buyers search directly", add_to: "title" },
                       { score: 6, keyword: "waterproof", reason: "Feature differentiator", add_to: "bullets" }].map((s, i) => (
                        <OpportunityBar key={i} {...s} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── Premium: AI listing rewrite ───────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="AI Listing Rewrite Suggestion" />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">AI-Suggested Title Rewrite</span>
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    {data.ai_listing_rewrite ? (
                      <>
                        <div className="mb-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Current Title</p>
                          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">{data.product_title}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 mx-auto my-2" />
                        <div>
                          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">AI Suggested Title</p>
                          <p className="text-sm font-semibold text-slate-800 bg-violet-50 rounded-xl px-4 py-3 border border-violet-200 leading-relaxed">
                            {data.ai_listing_rewrite}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                          <Info className="w-3 h-3" /> Always verify this complies with Amazon's title policy before using.
                        </p>
                      </>
                    ) : isPremium ? (
                      <p className="text-sm text-slate-400 text-center py-4">Rewrite not available — insufficient gap data.</p>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Current Title</p>
                          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 line-clamp-2">{data.product_title}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 mx-auto my-2" />
                        <div>
                          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-1.5">AI Suggested Title</p>
                          <p className="text-sm font-semibold text-slate-400 bg-violet-50 rounded-xl px-4 py-3 border border-violet-100 blur-sm select-none">
                            SANDISK 64GB Extreme PRO SDXC Memory Card High Speed Class 10 U3 V30 4K UHD Waterproof — SDSDXXU-064G
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Premium: Action plan ──────────────────────────────── */}
              <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="AI Prioritised Action Plan" />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Prioritised Action Plan</span>
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    {actionPlan.length > 0 ? (
                      <div className="space-y-3">
                        {actionPlan.map((step: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-black text-white">{i + 1}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    ) : isPremium ? (
                      <p className="text-sm text-slate-400 text-center py-4">Action plan not available.</p>
                    ) : (
                      <div className="space-y-3">
                        {[
                          "Add high-priority gap keywords to your title: \"high speed\", \"class 10\", \"4k uhd\"",
                          "Use backend search terms in Seller Central for keywords that don't fit the title",
                          "Keep your differentiators — they are unique to your listing",
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-black text-white">{i + 1}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Upgrade CTA ───────────────────────────────────────── */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-base">Unlock Full Keyword Intelligence</p>
                    <p className="text-blue-100 text-sm mt-0.5">
                      {!isBasic
                        ? "Get gap keywords, semantic clusters, coverage score & heatmap — Basic · ₹1,999/mo"
                        : "Get AI opportunity scores, listing rewrite, placement advice & action plan — Premium · ₹2,999/mo"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {(!isBasic
                        ? ["Gap keywords", "Semantic clusters", "Coverage score", "Keyword heatmap"]
                        : ["AI opportunity scores", "Placement advice", "Listing rewrite", "Action plan"]
                      ).map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs text-blue-100">
                          <CheckCircle className="w-3 h-3 text-blue-200" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigate("/subscription")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-sm shadow hover:shadow-md hover:scale-105 transition-all flex-shrink-0">
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