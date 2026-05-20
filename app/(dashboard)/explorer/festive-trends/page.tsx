// "use client";

// import { useState, useEffect, useRef, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Loader2, Sparkles, TrendingUp, AlertTriangle, Clock,
//   Lock, ChevronRight, Star, Zap, BarChart3, ArrowUpRight,
//   ArrowDownRight, Minus, Target,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { useAuth } from "@/lib/auth-context";
// import { cn } from "@/lib/utils";
// import { useToast } from "@/hooks/use-toast";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// // ─── Auth header helper ───────────────────────────────────────────────────────
// function authHeaders(userId: string | null): HeadersInit {
//   return {}; // No longer needed as we use session cookies
// }

// // ─── Tier helpers ─────────────────────────────────────────────────────────────

// const TIER_ORDER: Record<string, number> = { free: 0, basic: 1, premium: 2, enterprise: 3 };

// function hasTier(userTier: string, required: string): boolean {
//   return (TIER_ORDER[userTier?.toLowerCase()] ?? 0) >= (TIER_ORDER[required] ?? 99);
// }

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface FestiveEvent {
//   name: string;
//   intensity: "peak" | "high" | "medium" | "low";
//   emoji: string;
//   year: number;
//   start_date: string;
//   end_date: string;
//   days_away: number;
//   is_active: boolean;
//   is_upcoming: boolean;
// }

// interface CategoryOverview {
//   category_name: string;
//   avg_price: number | null;
//   avg_sales_volume: number | null;
//   avg_rating: number | null;
//   product_count: number;
//   locked: boolean;
// }

// interface CalendarData {
//   year: number;
//   events: FestiveEvent[];
//   upcoming: FestiveEvent[];
//   today: string;
// }

// interface OverviewData {
//   source: string;
//   top_categories: CategoryOverview[];
//   next_festival: FestiveEvent | null;
//   upgrade_message: string;
// }

// interface TrendPoint {
//   week?: string;
//   avg_price: number;
//   min_price?: number;
//   max_price?: number;
//   avg_sv?: number;
//   sample_size?: number;
// }

// interface StockRisk {
//   ratio?: number;
//   risk_level: "critical" | "high" | "medium" | "low" | "unknown";
//   avg_sv?: number;
//   max_sv?: number;
//   n_products?: number;
// }

// interface TrendData {
//   category_name: string;
//   source: string;
//   price_trend: TrendPoint[];
//   stock_risk: StockRisk;
//   velocity_all: { category_name: string; velocity: number; avg_price: number; products: number }[];
//   velocity_rank: number | null;
//   price_delta_pct: number | null;
//   next_festival: FestiveEvent | null;
//   data_points: number;
// }

// interface MarginScenario {
//   label: string;
//   price: number;
//   gross_margin: number;
//   gross_pct: number;
//   platform_fee: number;
//   net_margin: number;
//   net_pct: number;
//   viable: boolean;
// }

// interface MarginData {
//   base_cost: number;
//   market_range: { min: number; avg: number; max: number };
//   scenarios: MarginScenario[];
//   recommended_price: number;
//   recommended_label: string;
//   platform_fee_pct: number;
//   category_name?: string;
//   source?: string;
// }

// interface LaunchData {
//   optimal_week: string | null;
//   recommendation: string;
//   price_trend: TrendPoint[];
//   weeks_available: number;
//   best_score?: number;
//   category_name?: string;
//   source?: string;
// }

// // ─── Shared Utilities ─────────────────────────────────────────────────────────

// const fmt = (n: any, decimals = 0) => {
//   if (n == null) return "—";
//   return Number(n).toLocaleString("en-IN", {
//     maximumFractionDigits: decimals,
//     minimumFractionDigits: decimals,
//   });
// };

// const fmtPrice = (n: any) => (n == null ? "—" : `₹${fmt(n, 0)}`);

// const INTENSITY_COLORS: Record<string, string> = {
//   peak:   "bg-rose-100 text-rose-800 border-rose-200",
//   high:   "bg-amber-100 text-amber-800 border-amber-200",
//   medium: "bg-sky-100 text-sky-800 border-sky-200",
//   low:    "bg-slate-100 text-slate-600 border-slate-200",
// };

// const RISK_COLORS: Record<string, string> = {
//   critical: "text-rose-600 bg-rose-50",
//   high:     "text-orange-600 bg-orange-50",
//   medium:   "text-amber-600 bg-amber-50",
//   low:      "text-emerald-600 bg-emerald-50",
//   unknown:  "text-slate-500 bg-slate-50",
// };

// // ─── Components ───────────────────────────────────────────────────────────────

// function FestiveCalendarStrip({ events, upcoming }: { events: FestiveEvent[]; upcoming: FestiveEvent[] }) {
//   const active  = events?.filter(e => e.is_active) ?? [];
//   const soon    = upcoming?.filter(u => !u.is_active) ?? [];
//   const display = [...active, ...soon].slice(0, 6);
//   if (!display.length) return null;

//   return (
//     <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
//       {display.map((ev, i) => (
//         <div
//           key={i}
//           className={cn(
//             "flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border text-center min-w-[120px]",
//             ev.is_active
//               ? "bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-100"
//               : "bg-white border-slate-100"
//           )}
//         >
//           <span className="text-xl">{ev.emoji}</span>
//           <p className={cn("text-xs font-black truncate max-w-[100px]", ev.is_active ? "text-white" : "text-slate-800")}>
//             {ev.name}
//           </p>
//           <span className={cn(
//             "text-[10px] font-bold px-2 py-0.5 rounded-full border",
//             ev.is_active
//               ? "bg-white/20 text-white border-white/30"
//               : INTENSITY_COLORS[ev.intensity]
//           )}>
//             {ev.is_active ? "LIVE NOW" : `${ev.days_away}d away`}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CategoryCard({ cat, index }: { cat: CategoryOverview; index: number }) {
//   if (cat.locked) {
//     return (
//       <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 overflow-hidden">
//         <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 flex flex-col items-center justify-center gap-2 z-10">
//           <Lock className="w-5 h-5 text-slate-400" />
//           <p className="text-xs font-bold text-slate-500">Upgrade to Basic</p>
//         </div>
//         <div className="flex items-start justify-between gap-2 opacity-30">
//           <p className="text-sm font-black text-slate-800 leading-tight">{cat.category_name}</p>
//           <Badge variant="outline" className="text-[10px] font-bold shrink-0">#{index + 1}</Badge>
//         </div>
//         <p className="text-3xl font-black text-sky-600 blur-sm mt-2">₹ ——</p>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 hover:border-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-md">
//       <div className="flex items-start justify-between gap-2">
//         <p className="text-sm font-black text-slate-800 leading-tight">{cat.category_name}</p>
//         <Badge variant="outline" className="text-[10px] font-bold shrink-0">#{index + 1}</Badge>
//       </div>
//       <p className="text-3xl font-black text-sky-600 tracking-tighter">{fmtPrice(cat.avg_price)}</p>
//       <div className="flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-wider">
//         <span>{fmt(cat.avg_sales_volume)} avg sales</span>
//         <span>{fmt(cat.product_count)} products</span>
//       </div>
//       {cat.avg_rating != null && (
//         <div className="flex items-center gap-1 text-amber-500">
//           <Star className="w-3.5 h-3.5 fill-amber-400" />
//           <span className="text-xs font-black">{Number(cat.avg_rating).toFixed(1)}</span>
//         </div>
//       )}
//     </div>
//   );
// }

// function MiniSparkline({ data, valueKey = "avg_price" }: { data: TrendPoint[]; valueKey?: keyof TrendPoint }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (!data?.length || !canvasRef.current) return;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;
//     const W = canvas.width, H = canvas.height;
//     const vals = data.map(d => (d[valueKey] as number) || 0);
//     const mn = Math.min(...vals), mx = Math.max(...vals);
//     const range = mx - mn || 1;

//     ctx.clearRect(0, 0, W, H);
//     ctx.beginPath();
//     ctx.strokeStyle = "#0284c7";
//     ctx.lineWidth = 2;
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";
//     vals.forEach((v, i) => {
//       const x = (i / (vals.length - 1)) * W;
//       const y = H - ((v - mn) / range) * (H - 8) - 4;
//       i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
//     });
//     ctx.stroke();
//     ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
//     ctx.fillStyle = "rgba(2,132,199,0.08)";
//     ctx.fill();
//   }, [data, valueKey]);

//   if (!data?.length) return (
//     <div className="h-12 flex items-center justify-center text-xs text-slate-400">No data</div>
//   );
//   return <canvas ref={canvasRef} width={200} height={48} className="w-full h-12" />;
// }

// function StockRiskBadge({ risk }: { risk: StockRisk }) {
//   if (!risk) return null;
//   const label = risk.risk_level?.toUpperCase() ?? "UNKNOWN";
//   return (
//     <span className={cn("text-[10px] font-black px-3 py-1 rounded-full", RISK_COLORS[risk.risk_level] || RISK_COLORS.unknown)}>
//       {label} RISK
//     </span>
//   );
// }

// function PriceDeltaBadge({ pct }: { pct: number | null }) {
//   if (pct == null) return null;
//   if (pct > 0) return (
//     <span className="flex items-center gap-1 text-emerald-600 text-sm font-black">
//       <ArrowUpRight className="w-4 h-4" /> +{pct}%
//     </span>
//   );
//   if (pct < 0) return (
//     <span className="flex items-center gap-1 text-rose-600 text-sm font-black">
//       <ArrowDownRight className="w-4 h-4" /> {pct}%
//     </span>
//   );
//   return (
//     <span className="flex items-center gap-1 text-slate-400 text-sm font-black">
//       <Minus className="w-4 h-4" /> 0%
//     </span>
//   );
// }

// function LockedOverlay({ tier = "basic" }: { tier?: string }) {
//   const router = useRouter();
//   return (
//     <div className="absolute inset-0 rounded-[2rem] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
//       <Lock className="w-8 h-8 text-slate-400" />
//       <p className="text-sm font-black text-slate-700">
//         {tier === "basic" ? "Upgrade to Basic — ₹1,999/mo" : "Upgrade to Premium — ₹2,999/mo"}
//       </p>
//       <Button 
//         onClick={() => router.push("/subscription")}
//         size="sm" 
//         className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black"
//       >
//         Upgrade Now
//       </Button>
//     </div>
//   );
// }

// // ─── AI Forecast streaming panel ──────────────────────────────────────────────

// interface AIForecastPanelProps {
//   category: string;
//   source: string;
//   baseCost: string;
//   userTier: string;
//   userId: string | null;
// }

// function AIForecastPanel({ category, source, baseCost, userTier, userId }: AIForecastPanelProps) {
//   const { toast } = useToast();
//   const [streaming, setStreaming]       = useState(false);
//   const [text, setText]                 = useState("");
//   const [error, setError]               = useState<string | null>(null);
//   // null = unchecked, true = ready, false = offline
//   const [ollamaReady, setOllamaReady]   = useState<boolean | null>(null);
//   const locked = !hasTier(userTier, "premium");

//   useEffect(() => { setText(""); setError(null); }, [category, source]);

//   // Check Ollama status when the panel becomes relevant (basic+ tier)
//   useEffect(() => {
//     if (locked) return;
//     fetch(`${API_BASE}/api/festive/ai/status`, { credentials: "include" })
//       .then(r => r.ok ? r.json() : Promise.reject())
//       .then(data => setOllamaReady(data.ollama_running === true))
//       .catch(() => setOllamaReady(false));
//   }, [locked]);

//   const runForecast = async () => {
//     if (locked) {
//       toast({ title: "Premium Feature", description: "Please upgrade to Premium to use AI Festive Forecasts.", variant: "destructive" });
//       return;
//     }
//     if (!category || !baseCost) {
//       toast({ title: "Missing fields", description: "Select a category and enter your landing cost first.", variant: "destructive" });
//       return;
//     }
//     if (ollamaReady === false) {
//       toast({ title: "AI Offline", description: "Run `ollama serve` and `ollama pull llama3.2:3b` to enable AI forecasts.", variant: "destructive" });
//       return;
//     }

//     setStreaming(true); setText(""); setError(null);

//     try {
//       // Live router uses session auth only — no user_id in body
//       const res = await fetch(`${API_BASE}/api/festive/ai/forecast`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           category_name: category,
//           source,
//           base_cost: parseFloat(baseCost),
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         // 503 = Ollama offline
//         if (res.status === 503) {
//           setOllamaReady(false);
//           throw new Error(err?.detail?.fix ?? "AI service offline. Run: ollama serve");
//         }
//         throw new Error(err?.detail?.message ?? "AI service unavailable");
//       }

//       const reader = res.body?.getReader();
//       const decoder = new TextDecoder();
//       let buffer = "";

//       while (reader) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split("\n");
//         buffer = lines.pop() || "";
//         for (const line of lines) {
//           if (!line.startsWith("data: ")) continue;
//           const payload = line.replace("data: ", "").trim();
//           if (payload === "[DONE]") break;
//           try { setText(prev => prev + JSON.parse(payload)); } catch { /* skip */ }
//         }
//       }
//     } catch (e: any) {
//       setError(e.message);
//       toast({ title: "Forecast Error", description: e.message, variant: "destructive" });
//     } finally {
//       setStreaming(false);
//     }
//   };

//   return (
//     <div className="relative">
//       {locked && <LockedOverlay tier="premium" />}
//       <Card className="border-none shadow-[0_32px_64px_-12px_rgba(15,23,42,0.12)] rounded-[2.5rem] bg-slate-950 text-white overflow-hidden">
//         <CardHeader className="p-10 pb-0">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
//               <Zap className="w-6 h-6 text-sky-400" />
//             </div>
//             <div>
//               <CardTitle className="text-2xl font-black text-white">AI Festive Forecast</CardTitle>
//               <CardDescription className="text-sky-300/60 text-xs font-bold uppercase tracking-widest mt-1">
//                 Premium · Powered by Insydz
//               </CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-10 space-y-6">
//           {/* Ollama offline warning */}
//           {ollamaReady === false && (
//             <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
//               <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-amber-300 text-sm font-black">AI engine offline</p>
//                 <p className="text-amber-200/60 text-xs font-medium mt-0.5">
//                   Run <code className="bg-white/10 px-1 rounded">ollama serve</code> and{" "}
//                   <code className="bg-white/10 px-1 rounded">ollama pull llama3.2:3b</code> to enable forecasts.
//                 </p>
//               </div>
//             </div>
//           )}
//           {!text && !streaming && ollamaReady !== false && (
//             <p className="text-sky-100/60 text-sm leading-relaxed">
//               Get a personalised festive surge forecast — demand prediction, optimal pricing,
//               stock prep advice, and exact listing timing for your category.
//             </p>
//           )}
//           {streaming && !text && (
//             <div className="flex items-center gap-3 text-sky-300">
//               <Loader2 className="w-5 h-5 animate-spin" />
//               <span className="text-sm font-bold">Analysing market data…</span>
//             </div>
//           )}
//           {text && (
//             <div className="text-sky-50/90 text-sm leading-relaxed whitespace-pre-wrap font-mono border-l-4 border-sky-500/40 pl-6 py-2">
//               {text}
//               {streaming && <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-1" />}
//             </div>
//           )}
//           {error && (
//             <div className="text-rose-400 text-sm font-bold bg-rose-500/10 px-4 py-3 rounded-xl">{error}</div>
//           )}
//           <Button
//             onClick={runForecast}
//             disabled={streaming || locked || !category || !baseCost || ollamaReady === false}
//             className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-base disabled:opacity-50"
//           >
//             {streaming
//               ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating…</>
//               : <><Sparkles className="w-5 h-5 mr-2" /> Run AI Forecast</>}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ─── Margin Simulation Table ───────────────────────────────────────────────────

// function MarginSimTable({ data, userTier }: { data: MarginData | null; userTier: string }) {
//   const locked = !hasTier(userTier, "premium");
//   if (!data) return null;

//   return (
//     <div className="relative">
//       {locked && <LockedOverlay tier="premium" />}
//       <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white overflow-hidden">
//         <CardHeader className="p-8 pb-4">
//           <CardTitle className="text-lg font-black flex items-center gap-2">
//             <Target className="w-5 h-5 text-sky-600" /> Margin Simulation
//           </CardTitle>
//           <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//             Base cost: {fmtPrice(data.base_cost)} · After {data.platform_fee_pct}% platform fee
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="px-8 pb-8">
//           <div className="overflow-hidden rounded-2xl border border-slate-100">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {["Scenario", "Price", "Gross %", "Net %", ""].map((h, i) => (
//                     <th key={i} className={cn("p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", i > 0 ? "text-right" : "text-left")}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.scenarios?.map((sc, i) => (
//                   <tr key={i} className={cn("border-b border-slate-50 last:border-0", sc.label === data.recommended_label ? "bg-sky-50" : "bg-white")}>
//                     <td className="p-4 font-black text-slate-800">{sc.label}</td>
//                     <td className="p-4 text-right font-bold">{fmtPrice(sc.price)}</td>
//                     <td className="p-4 text-right font-bold text-slate-600">{sc.gross_pct}%</td>
//                     <td className={cn("p-4 text-right font-black", sc.net_pct > 0 ? "text-emerald-600" : "text-rose-600")}>{sc.net_pct}%</td>
//                     <td className="p-4 text-right">
//                       {sc.label === data.recommended_label && <Badge className="bg-sky-600 text-white text-[9px] font-black">Best</Badge>}
//                       {!sc.viable && <Badge variant="outline" className="text-rose-500 border-rose-200 text-[9px]">Loss</Badge>}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <p className="text-xs text-slate-400 font-bold mt-4">
//             Market range: {fmtPrice(data.market_range?.min)} – {fmtPrice(data.market_range?.max)} · avg {fmtPrice(data.market_range?.avg)}
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ─── Launch Window Card ────────────────────────────────────────────────────────

// function LaunchWindowCard({ data, userTier }: { data: LaunchData | null; userTier: string }) {
//   const locked = !hasTier(userTier, "premium");
//   if (!data) return null;

//   return (
//     <div className="relative">
//       {locked && <LockedOverlay tier="premium" />}
//       <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
//             <Clock className="w-5 h-5 text-indigo-600" />
//           </div>
//           <div>
//             <p className="text-sm font-black text-slate-800">Optimal Launch Window</p>
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium insight</p>
//           </div>
//         </div>
//         {data.optimal_week && <p className="text-3xl font-black text-indigo-600">{data.optimal_week}</p>}
//         <p className="text-sm text-slate-600 font-medium leading-relaxed">{data.recommendation}</p>
//         <MiniSparkline data={data.price_trend} valueKey="avg_price" />
//         <p className="text-[10px] text-slate-400 font-bold">{data.weeks_available} weeks of data analysed</p>
//       </Card>
//     </div>
//   );
// }

// // ─── Velocity Chart ────────────────────────────────────────────────────────────

// function VelocityChart({ data }: { data: { category_name: string; velocity: number }[] }) {
//   if (!data?.length) return null;
//   const max = Math.max(...data.map(d => d.velocity || 0)) || 1;

//   return (
//     <div className="space-y-2">
//       {data.slice(0, 8).map((cat, i) => (
//         <div key={i} className="flex items-center gap-3">
//           <p className="text-xs font-bold text-slate-600 w-36 truncate shrink-0">{cat.category_name}</p>
//           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
//             <div className="h-full rounded-full bg-sky-500" style={{ width: `${(cat.velocity / max) * 100}%` }} />
//           </div>
//           <p className="text-xs font-black text-slate-800 w-16 text-right shrink-0">{fmt(cat.velocity)}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Main page ─────────────────────────────────────────────────────────────────

// function FestiveTrendContent() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const userId = user?.id?.toString() ?? null;

//   // ─── Tier: /overview already returns user_tier from DB (live router v3) ─────
//   // We seed from /tier-info on mount, then update from every /overview response.
//   // This means we never have a stale tier even if the subscription changes mid-session.
//   const [userTier, setUserTier] = useState<string>("free");
//   const [tierLoading, setTierLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${API_BASE}/api/festive/tier-info`, {
//       credentials: "include"
//     })
//       .then(r => r.ok ? r.json() : Promise.reject())
//       .then(data => setUserTier(data.tier ?? "free"))
//       .catch(() => setUserTier("free"))
//       .finally(() => setTierLoading(false));
//   }, [userId]);
//   // ─────────────────────────────────────────────────────────────────────────

//   // Form state
//   const [source,     setSource]     = useState("amazon");
//   const [category,   setCategory]   = useState("");
//   const [baseCost,   setBaseCost]   = useState("");
//   const [categories, setCategories] = useState<string[]>([]);

//   // Data state
//   const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
//   const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
//   const [trendData,    setTrendData]    = useState<TrendData | null>(null);
//   const [launchData,   setLaunchData]   = useState<LaunchData | null>(null);
//   const [marginData,   setMarginData]   = useState<MarginData | null>(null);

//   // Loading flags
//   const [loadingOverview, setLoadingOverview] = useState(false);
//   const [loadingTrend,    setLoadingTrend]    = useState(false);
//   const [loadingLaunch,   setLoadingLaunch]   = useState(false);
//   const [loadingMargin,   setLoadingMargin]   = useState(false);

//   // ── Calendar (free, dynamic — uses ephem+hijridate on backend) ───────────
//   useEffect(() => {
//     fetch(`${API_BASE}/api/festive/calendar`)
//       .then(r => r.ok ? r.json() : Promise.reject())
//       .then(setCalendarData)
//       .catch(() => {});
//   }, []);

//   // ── Overview — also carries user_tier from DB (live router v3) ───────────
//   // We update userTier from the overview response so the UI stays in sync
//   // without a second /tier-info round-trip on every source change.
//   useEffect(() => {
//     setLoadingOverview(true);
//     fetch(`${API_BASE}/api/festive/overview?source=${source}`, {
//       credentials: "include"
//     })
//       .then(r => r.ok ? r.json() : Promise.reject())
//       .then(data => {
//         setOverviewData(data);
//         // Sync tier from overview if backend returns it (avoids stale UI)
//         if (data.user_tier) setUserTier(data.user_tier);
//       })
//       .catch(() => {})
//       .finally(() => setLoadingOverview(false));
//   }, [source, userId]);

//   // ── Categories (Basic+) ───────────────────────────────────────────────────
//   useEffect(() => {
//     if (!hasTier(userTier, "basic")) return;
//     fetch(`${API_BASE}/api/festive/categories?source=${source}`, { 
//       headers: authHeaders(userId),
//       credentials: "include"
//     })
//       .then(r => r.ok ? r.json() : Promise.reject())
//       .then((d: { category: string }[]) => setCategories(d.map(c => c.category)))
//       .catch(() => {});
//   }, [source, userTier, userId]);

//   // ── Run full trend analysis ────────────────────────────────────────────────
//   const runAnalysis = async () => {
//     if (!category) {
//       toast({ title: "Selection Required", description: "Please select a category to analyze." });
//       return;
//     }
//     if (!hasTier(userTier, "basic")) {
//       toast({ title: "Upgrade Required", description: "Category trend analysis requires Basic or Premium.", variant: "destructive" });
//       return;
//     }

//     setTrendData(null); setMarginData(null); setLaunchData(null);
//     const params  = new URLSearchParams({ category_name: category, source });
//     const opts    = { 
//       headers: authHeaders(userId),
//       credentials: "include" as RequestCredentials
//     };

//     // Trend (Basic+)
//     setLoadingTrend(true);
//     fetch(`${API_BASE}/api/festive/trend-analysis?${params}`, opts)
//       .then(async r => {
//         if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail?.message ?? "Failed");
//         return r.json();
//       })
//       .then(setTrendData)
//       .catch((err: any) => toast({ title: "Analysis Error", description: err.message, variant: "destructive" }))
//       .finally(() => setLoadingTrend(false));

//     // Premium features
//     if (hasTier(userTier, "premium")) {
//       if (baseCost) {
//         setLoadingMargin(true);
//         const mp = new URLSearchParams(params);
//         mp.append("base_cost", baseCost);
//         fetch(`${API_BASE}/api/festive/margin-sim?${mp}`, opts)
//           .then(r => r.ok ? r.json() : Promise.reject())
//           .then(setMarginData)
//           .catch(() => {})
//           .finally(() => setLoadingMargin(false));
//       }

//       setLoadingLaunch(true);
//       fetch(`${API_BASE}/api/festive/launch-window?${params}`, opts)
//         .then(r => r.ok ? r.json() : Promise.reject())
//         .then(setLaunchData)
//         .catch(() => {})
//         .finally(() => setLoadingLaunch(false));
//     }
//   };

//   const isLoading = loadingTrend || loadingLaunch || loadingMargin;

//   // Show a subtle loading state while tier is being confirmed from the server
//   if (tierLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[40vh]">
//         <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">

//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
//         <div>
//           <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
//             Festive <span className="text-sky-600">Trends</span>
//           </h1>
//           <p className="text-base text-slate-500 font-medium mt-2">
//             Ride India's festive demand cycles — price smarter, stock right, list on time
//           </p>
//         </div>
//         <div className={cn(
//           "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border h-12 flex items-center",
//           userTier === "premium"   ? "bg-indigo-50 text-indigo-700 border-indigo-200"
//           : userTier === "basic"   ? "bg-sky-50 text-sky-700 border-sky-200"
//           :                         "bg-slate-50 text-slate-600 border-slate-200"
//         )}>
//           {userTier} plan
//         </div>
//       </div>

//       {/* Calendar strip */}
//       {calendarData && (
//         <div className="space-y-3">
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Festive Events</p>
//           <FestiveCalendarStrip events={calendarData.events} upcoming={calendarData.upcoming} />
//         </div>
//       )}

//       {/* Config card */}
//       <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
//         <CardHeader className="p-10 pb-0">
//           <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
//             <BarChart3 className="h-6 w-6 text-sky-600" /> Trend Analysis Setup
//           </CardTitle>
//           <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
//             Configure your market parameters
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="p-10 space-y-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

//             {/* Marketplace */}
//             <div className="space-y-3">
//               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketplace</Label>
//               <select
//                 value={source}
//                 onChange={e => { setSource(e.target.value); setCategory(""); setTrendData(null); }}
//                 className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
//               >
//                 <option value="amazon">Amazon India</option>
//                 <option value="flipkart">Flipkart India</option>
//               </select>
//             </div>

//             {/* Category */}
//             <div className="space-y-3">
//               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                 Target Category {!hasTier(userTier, "basic") && <Lock className="inline w-3 h-3 ml-1" />}
//               </Label>
//               <select
//                 value={category}
//                 onChange={e => setCategory(e.target.value)}
//                 disabled={!hasTier(userTier, "basic")}
//                 className={cn(
//                   "w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none appearance-none",
//                   !hasTier(userTier, "basic") && "opacity-50 cursor-not-allowed"
//                 )}
//               >
//                 <option value="">
//                   {hasTier(userTier, "basic") ? "Select category…" : "Upgrade required"}
//                 </option>
//                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>

//             {/* Base Cost */}
//             <div className="space-y-3">
//               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                 Landing Cost (₹) {!hasTier(userTier, "premium") && <Lock className="inline w-3 h-3 ml-1 text-slate-300" />}
//               </Label>
//               <Input
//                 value={baseCost}
//                 onChange={e => setBaseCost(e.target.value)}
//                 type="number"
//                 placeholder="e.g. 500"
//                 min={1}
//                 className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50"
//                 disabled={!hasTier(userTier, "premium")}
//               />
//             </div>

//             {/* Analysis Window */}
//             <div className="space-y-3">
//               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analysis Window</Label>
//               <div className="h-14 flex items-center px-6 rounded-2xl bg-slate-50 text-sm font-bold text-slate-500">
//                 90 days (auto)
//               </div>
//             </div>
//           </div>

//           <Button
//             onClick={runAnalysis}
//             disabled={isLoading || !hasTier(userTier, "basic") || !category}
//             className="w-full h-16 rounded-[1.25rem] bg-sky-600 hover:bg-sky-700 text-white font-black text-base shadow-2xl shadow-sky-100 disabled:opacity-60"
//           >
//             {isLoading
//               ? <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Analysing…</>
//               : <><TrendingUp className="h-5 w-5 mr-3" /> Analyse Festive Trends</>}
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Overview: Top Categories */}
//       {overviewData && (
//         <div className="space-y-4">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//               Top Trending Categories · {overviewData.source === "flipkart" ? "Flipkart" : "Amazon"}
//             </p>
//             {overviewData.next_festival && (
//               <div className="flex items-center gap-2 text-sm text-slate-600">
//                 <span className="text-lg">{overviewData.next_festival.emoji}</span>
//                 <span className="font-bold">{overviewData.next_festival.name}</span>
//                 <Badge variant="outline" className={INTENSITY_COLORS[overviewData.next_festival.intensity]}>
//                   {overviewData.next_festival.days_away}d away
//                 </Badge>
//               </div>
//             )}
//           </div>

//           {loadingOverview ? (
//             <div className="flex items-center justify-center h-32">
//               <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {overviewData.top_categories?.map((cat, i) => (
//                 <CategoryCard key={i} cat={cat} index={i} />
//               ))}
//             </div>
//           )}

//           {!hasTier(userTier, "basic") && (
//             <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 flex items-center justify-between gap-4">
//               <div>
//                 <p className="text-sm font-black text-sky-800">Unlock all categories + 90-day trend charts</p>
//                 <p className="text-xs text-sky-600 font-medium mt-0.5">Basic plan — ₹1,999/month</p>
//               </div>
//               <Button 
//                 onClick={() => router.push("/subscription")}
//                 size="sm" 
//                 className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black shrink-0"
//               >
//                 Upgrade <ChevronRight className="w-4 h-4 ml-1" />
//               </Button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Trend Analysis Results */}
//       {trendData && (
//         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price trend</p>
//               <PriceDeltaBadge pct={trendData.price_delta_pct} />
//               <p className="text-xs text-slate-500 font-medium">vs last week</p>
//             </Card>
//             <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category rank</p>
//               <p className="text-3xl font-black text-slate-900">#{trendData.velocity_rank ?? "—"}</p>
//               <p className="text-xs text-slate-500 font-medium">by sales velocity</p>
//             </Card>
//             <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock risk</p>
//               <div className="pt-1"><StockRiskBadge risk={trendData.stock_risk} /></div>
//               <p className="text-xs text-slate-500 font-medium">ratio {trendData.stock_risk?.ratio ?? "—"}x</p>
//             </Card>
//             <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1">
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data points</p>
//               <p className="text-3xl font-black text-slate-900">{trendData.data_points}</p>
//               <p className="text-xs text-slate-500 font-medium">weekly snapshots</p>
//             </Card>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
//               <div>
//                 <p className="text-sm font-black text-slate-800">Price Trend — {trendData.category_name}</p>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">90-day rolling average</p>
//               </div>
//               <MiniSparkline data={trendData.price_trend} valueKey="avg_price" />
//               {trendData.price_trend?.length > 0 && (
//                 <div className="flex justify-between text-xs text-slate-500 font-bold">
//                   <span>Min: {fmtPrice(Math.min(...trendData.price_trend.map(d => d.avg_price)))}</span>
//                   <span>Max: {fmtPrice(Math.max(...trendData.price_trend.map(d => d.avg_price)))}</span>
//                 </div>
//               )}
//             </Card>
//             <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
//               <div>
//                 <p className="text-sm font-black text-slate-800">Category Velocity Leaderboard</p>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Avg sales volume</p>
//               </div>
//               <VelocityChart data={trendData.velocity_all} />
//             </Card>
//           </div>

//           {(loadingLaunch || loadingMargin || launchData || marginData) && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {loadingLaunch
//                 ? <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></Card>
//                 : <LaunchWindowCard data={launchData} userTier={userTier} />
//               }
//               {loadingMargin
//                 ? <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-sky-400" /></Card>
//                 : <MarginSimTable data={marginData} userTier={userTier} />
//               }
//             </div>
//           )}

//           {!hasTier(userTier, "premium") && (
//             <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 flex items-center justify-between gap-4">
//               <div>
//                 <p className="text-sm font-black text-indigo-800">Unlock Launch Window, Margin Simulation &amp; AI Forecast</p>
//                 <p className="text-xs text-indigo-600 font-medium mt-0.5">Premium plan — ₹2,999/month</p>
//               </div>
//               <Button 
//                 onClick={() => router.push("/subscription")}
//                 size="sm" 
//                 className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shrink-0"
//               >
//                 Upgrade <ChevronRight className="w-4 h-4 ml-1" />
//               </Button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* AI Forecast */}
//       {(hasTier(userTier, "basic") || trendData) && (
//         <AIForecastPanel
//           category={category}
//           source={source}
//           baseCost={baseCost}
//           userTier={userTier}
//           userId={userId}
//         />
//       )}
//     </div>
//   );
// }

// export default function FestiveTrendsPage() {
//   return (
//     <Suspense fallback={
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="animate-spin h-8 w-8 text-sky-600" />
//       </div>
//     }>
//       <FestiveTrendContent />
//     </Suspense>
//   );
// }






"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Sparkles, TrendingUp, AlertTriangle, Clock,
  Lock, ChevronRight, Star, Zap, BarChart3, ArrowUpRight,
  ArrowDownRight, Minus, Target, RefreshCw, Wifi, WifiOff,
  ShoppingBag, Package, IndianRupee, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// All API calls use session cookies — no Authorization header needed.
// The backend reads user identity from the session cookie set at login.
// ─────────────────────────────────────────────────────────────────────────────

const FETCH_OPTS: RequestInit = {
  credentials: "include",
};

const JSON_FETCH_OPTS: RequestInit = {
  ...FETCH_OPTS,
  headers: { "Content-Type": "application/json" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tier helpers
// Tier order matches backend: free=0, basic=1, premium=2, enterprise=3
// ─────────────────────────────────────────────────────────────────────────────

const TIER_ORDER: Record<string, number> = { free: 0, basic: 1, premium: 2, enterprise: 3 };

function hasTier(userTier: string, required: string): boolean {
  return (TIER_ORDER[userTier?.toLowerCase().trim()] ?? 0) >= (TIER_ORDER[required] ?? 99);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types — aligned with backend response shapes
// ─────────────────────────────────────────────────────────────────────────────

interface FestiveEvent {
  name: string;
  intensity: "peak" | "high" | "medium" | "low";
  emoji: string;
  year: number;
  start_date: string;
  end_date: string;
  days_away: number;
  is_active: boolean;
  is_upcoming: boolean;
}

interface CategoryOverview {
  category_name: string;
  avg_price: number | null;
  avg_sales_volume: number | null;
  avg_rating: number | null;
  product_count: number;
  locked: boolean;
}

interface CalendarData {
  year: number;
  events: FestiveEvent[];
  upcoming: FestiveEvent[];
  today: string;
}

interface OverviewData {
  source: string;
  top_categories: CategoryOverview[];
  next_festival: FestiveEvent | null;
  user_tier: string;           // ← backend always returns this in /overview
  upgrade_message: string;
}

interface TierInfo {
  tier: string;
  user_id: string | null;
  is_basic: boolean;
  is_premium: boolean;
}

interface TrendPoint {
  week?: string;
  avg_price: number;
  min_price?: number;
  max_price?: number;
  avg_sv?: number;
  sample_size?: number;
}

interface StockRisk {
  ratio?: number;
  risk_level: "critical" | "high" | "medium" | "low" | "unknown";
  avg_sv?: number;
  max_sv?: number;
  n_products?: number;
  category_name?: string;
  source?: string;
}

interface TrendData {
  category_name: string;
  source: string;
  price_trend: TrendPoint[];
  stock_risk: StockRisk;
  velocity_all: { category_name: string; velocity: number; avg_price: number; products: number }[];
  velocity_rank: number | null;
  price_delta_pct: number | null;
  next_festival: FestiveEvent | null;
  data_points: number;
}

interface MarginScenario {
  label: string;
  price: number;
  gross_margin: number;
  gross_pct: number;
  platform_fee: number;
  net_margin: number;
  net_pct: number;
  viable: boolean;
}

interface MarginData {
  base_cost: number;
  market_range: { min: number; avg: number; max: number };
  scenarios: MarginScenario[];
  recommended_price: number;
  recommended_label: string;
  // platform_fee_pct: Amazon=15, Flipkart=12 (set server-side)
  platform_fee_pct: number;
  category_name?: string;
  source?: string;
}

interface LaunchData {
  optimal_week: string | null;
  recommendation: string;
  price_trend: TrendPoint[];
  weeks_available: number;
  best_score?: number;
  category_name?: string;
  source?: string;
}

interface OllamaStatus {
  ollama_running: boolean;
  model: string;
  status: "ready" | "offline";
  fix: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error handling — parse backend HTTPException detail shapes
// ─────────────────────────────────────────────────────────────────────────────

async function parseApiError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (!detail) return `HTTP ${res.status}`;
    if (typeof detail === "string") return detail;
    if (detail.message) return detail.message;
    if (detail.error === "subscription_expired")
      return `Subscription expired at ${detail.expired_at ?? "unknown date"}. Please renew.`;
    if (detail.error === "upgrade_required")
      return `This feature requires ${detail.required_tier ?? "a higher"} plan.`;
    if (detail.error === "unauthenticated")
      return "Please sign in to access this feature.";
    return JSON.stringify(detail);
  } catch {
    return `HTTP ${res.status}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined, decimals = 0): string => {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const fmtPrice = (n: number | null | undefined): string =>
  n == null ? "—" : `₹${fmt(n, 0)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Style constants
// ─────────────────────────────────────────────────────────────────────────────

const INTENSITY_COLORS: Record<string, string> = {
  peak:   "bg-rose-100 text-rose-800 border-rose-200",
  high:   "bg-amber-100 text-amber-800 border-amber-200",
  medium: "bg-sky-100 text-sky-800 border-sky-200",
  low:    "bg-slate-100 text-slate-600 border-slate-200",
};

const RISK_COLORS: Record<string, string> = {
  critical: "text-rose-600 bg-rose-50 border-rose-200",
  high:     "text-orange-600 bg-orange-50 border-orange-200",
  medium:   "text-amber-600 bg-amber-50 border-amber-200",
  low:      "text-emerald-600 bg-emerald-50 border-emerald-200",
  unknown:  "text-slate-500 bg-slate-50 border-slate-200",
};

const TIER_BADGE: Record<string, string> = {
  premium:    "bg-violet-50 text-violet-700 border-violet-200",
  basic:      "bg-sky-50 text-sky-700 border-sky-200",
  enterprise: "bg-amber-50 text-amber-700 border-amber-200",
  free:       "bg-slate-50 text-slate-600 border-slate-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FestiveCalendarStrip({
  events,
  upcoming,
}: {
  events: FestiveEvent[];
  upcoming: FestiveEvent[];
}) {
  const active  = events?.filter(e => e.is_active) ?? [];
  const soon    = upcoming?.filter(u => !u.is_active) ?? [];
  const display = [...active, ...soon].slice(0, 7);
  if (!display.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {display.map((ev, i) => (
        <div
          key={`${ev.name}-${i}`}
          className={cn(
            "flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border text-center min-w-[116px] transition-all",
            ev.is_active
              ? "bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-200/60 scale-105"
              : "bg-white border-slate-100 hover:border-sky-200 hover:shadow-sm"
          )}
        >
          <span className="text-2xl leading-none">{ev.emoji}</span>
          <p className={cn(
            "text-[11px] font-extrabold truncate max-w-[96px] leading-tight",
            ev.is_active ? "text-white" : "text-slate-800"
          )}>
            {ev.name}
          </p>
          <span className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider",
            ev.is_active
              ? "bg-white/25 text-white border-white/30"
              : INTENSITY_COLORS[ev.intensity]
          )}>
            {ev.is_active ? "LIVE" : `${ev.days_away}d`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryCard — handles locked state (free users: only index 0 unlocked)
// ─────────────────────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  index,
  onSelect,
  selected,
}: {
  cat: CategoryOverview;
  index: number;
  onSelect?: (name: string) => void;
  selected?: boolean;
}) {
  if (cat.locked) {
    return (
      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 overflow-hidden select-none">
        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/70 flex flex-col items-center justify-center gap-1.5 z-10 rounded-2xl">
          <Lock className="w-5 h-5 text-slate-400" />
          <p className="text-[11px] font-extrabold text-slate-500">Upgrade to Basic</p>
        </div>
        <div className="opacity-20 pointer-events-none">
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-sm font-extrabold text-slate-800 leading-tight">{cat.category_name}</p>
            <Badge variant="outline" className="text-[9px] font-bold shrink-0">#{index + 1}</Badge>
          </div>
          <p className="text-3xl font-black text-sky-600">₹ ——</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect?.(cat.category_name)}
      className={cn(
        "text-left w-full rounded-2xl border p-6 space-y-2.5 transition-all cursor-pointer shadow-sm",
        selected
          ? "border-sky-500 bg-sky-50 shadow-sky-100"
          : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-extrabold text-slate-800 leading-tight">{cat.category_name}</p>
        <Badge variant="outline" className={cn("text-[9px] font-bold shrink-0", selected && "border-sky-400 text-sky-700")}>
          #{index + 1}
        </Badge>
      </div>
      <p className="text-3xl font-black text-sky-600 tracking-tighter">{fmtPrice(cat.avg_price)}</p>
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" /> {fmt(cat.avg_sales_volume)} avg/mo
        </span>
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" /> {fmt(cat.product_count)}
        </span>
      </div>
      {cat.avg_rating != null && (
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="text-xs font-extrabold">{Number(cat.avg_rating).toFixed(1)}</span>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas sparkline
// ─────────────────────────────────────────────────────────────────────────────

function MiniSparkline({
  data,
  valueKey = "avg_price",
  color = "#0284c7",
}: {
  data: TrendPoint[];
  valueKey?: keyof TrendPoint;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data?.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const vals = data.map(d => (d[valueKey] as number) || 0);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const range = mx - mn || 1;

    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `${color}22`);
    grad.addColorStop(1, `${color}04`);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    vals.forEach((v, i) => {
      const x = (i / Math.max(vals.length - 1, 1)) * W;
      const y = H - ((v - mn) / range) * (H - 10) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill area
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Dot at last point
    if (vals.length > 0) {
      const lx = W;
      const ly = H - ((vals[vals.length - 1] - mn) / range) * (H - 10) - 5;
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [data, valueKey, color]);

  if (!data?.length)
    return <div className="h-14 flex items-center justify-center text-xs text-slate-300">No data</div>;
  return <canvas ref={canvasRef} width={320} height={56} className="w-full h-14" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat badges
// ─────────────────────────────────────────────────────────────────────────────

function StockRiskBadge({ risk }: { risk: StockRisk }) {
  if (!risk) return null;
  const level = risk.risk_level ?? "unknown";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider",
      RISK_COLORS[level] ?? RISK_COLORS.unknown
    )}>
      <AlertTriangle className="w-3 h-3" />
      {level} risk
    </span>
  );
}

function PriceDeltaBadge({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  if (pct > 0) return (
    <span className="flex items-center gap-1 text-emerald-600 text-lg font-extrabold">
      <ArrowUpRight className="w-5 h-5" />+{pct}%
    </span>
  );
  if (pct < 0) return (
    <span className="flex items-center gap-1 text-rose-600 text-lg font-extrabold">
      <ArrowDownRight className="w-5 h-5" />{pct}%
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-slate-400 text-lg font-extrabold">
      <Minus className="w-5 h-5" />0%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Locked overlay (Premium / Basic gates)
// ─────────────────────────────────────────────────────────────────────────────

function LockedOverlay({ tier = "basic" }: { tier?: "basic" | "premium" }) {
  const router = useRouter();
  const label  = tier === "premium" ? "Premium — ₹2,999/mo" : "Basic — ₹1,999/mo";
  return (
    <div className="absolute inset-0 rounded-[2rem] bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Lock className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-extrabold text-slate-700">Upgrade to {label}</p>
      <Button
        onClick={() => router.push("/subscription")}
        size="sm"
        className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-5"
      >
        Upgrade Now
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade nudge banner
// ─────────────────────────────────────────────────────────────────────────────

function UpgradeBanner({
  tier,
  message,
  price,
}: {
  tier: "basic" | "premium";
  message: string;
  price: string;
}) {
  const router = useRouter();
  const colors =
    tier === "premium"
      ? "border-violet-100 bg-violet-50 text-violet-800"
      : "border-sky-100 bg-sky-50 text-sky-800";
  const btn =
    tier === "premium"
      ? "bg-violet-600 hover:bg-violet-700"
      : "bg-sky-600 hover:bg-sky-700";

  return (
    <div className={cn("rounded-2xl border p-5 flex items-center justify-between gap-4", colors)}>
      <div>
        <p className="text-sm font-extrabold">{message}</p>
        <p className={cn("text-xs font-medium mt-0.5", tier === "premium" ? "text-violet-600" : "text-sky-600")}>
          {price}
        </p>
      </div>
      <Button
        onClick={() => router.push("/subscription")}
        size="sm"
        className={cn("rounded-xl text-white font-extrabold shrink-0", btn)}
      >
        Upgrade <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Forecast panel (Premium, SSE via Ollama llama3.2:3b)
// ─────────────────────────────────────────────────────────────────────────────

interface AIForecastPanelProps {
  category: string;
  source: string;
  baseCost: string;
  userTier: string;
}

function AIForecastPanel({ category, source, baseCost, userTier }: AIForecastPanelProps) {
  const { toast }  = useToast();
  const [streaming, setStreaming]     = useState(false);
  const [text,      setText]          = useState("");
  const [error,     setError]         = useState<string | null>(null);
  // null=unchecked, true=ready, false=offline
  const [ollamaReady, setOllamaReady] = useState<boolean | null>(null);
  const locked = !hasTier(userTier, "premium");

  // Reset output when inputs change
  useEffect(() => { setText(""); setError(null); }, [category, source]);

  // Poll Ollama status when panel is visible to a premium user
  useEffect(() => {
    if (locked) return;
    let cancelled = false;
    const check = () => {
      fetch(`${API_BASE}/api/festive/ai/status`, FETCH_OPTS)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then((d: OllamaStatus) => {
          if (!cancelled) setOllamaReady(d.ollama_running === true);
        })
        .catch(() => { if (!cancelled) setOllamaReady(false); });
    };
    check();
    return () => { cancelled = true; };
  }, [locked]);

  const runForecast = async () => {
    if (locked) {
      toast({ title: "Premium Feature", description: "Upgrade to Premium to use AI Forecasts.", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Missing Category", description: "Select a category first.", variant: "destructive" });
      return;
    }
    if (!baseCost || Number(baseCost) <= 0) {
      toast({ title: "Missing Landing Cost", description: "Enter your landing cost (₹) to run a forecast.", variant: "destructive" });
      return;
    }
    if (ollamaReady === false) {
      toast({ title: "AI Engine Offline", description: "Run `ollama serve` + `ollama pull llama3.2:3b`.", variant: "destructive" });
      return;
    }

    setStreaming(true);
    setText("");
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/festive/ai/forecast`, {
        method: "POST",
        ...JSON_FETCH_OPTS,
        body: JSON.stringify({
          category_name: category,
          source,
          base_cost: parseFloat(baseCost),
        }),
      });

      if (!res.ok) {
        // 503 = Ollama offline (backend _check_ollama)
        if (res.status === 503) {
          setOllamaReady(false);
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail?.fix ?? "AI engine offline. Run: ollama serve");
        }
        throw new Error(await parseApiError(res));
      }

      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try { setText(prev => prev + JSON.parse(payload)); } catch { /* skip malformed */ }
        }
      }
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Forecast Error", description: e.message, variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  };

  const canRun = !locked && !!category && !!baseCost && Number(baseCost) > 0 && ollamaReady !== false;

  return (
    <div className="relative">
      {locked && <LockedOverlay tier="premium" />}
      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(15,23,42,0.14)] rounded-[2.5rem] bg-slate-950 text-white overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                <Zap className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold text-white">AI Festive Forecast</CardTitle>
                <CardDescription className="text-sky-400/60 text-[10px] font-extrabold uppercase tracking-widest mt-1">
                  Premium
                </CardDescription>
              </div>
            </div>
            {/* Ollama status indicator */}
            {/* <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-full border uppercase tracking-wider",
              ollamaReady === true  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              ollamaReady === false ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                     "bg-slate-700 text-slate-500 border-slate-600"
            )}>
              {ollamaReady === true  ? <Wifi className="w-3 h-3" />    : null}
              {ollamaReady === false ? <WifiOff className="w-3 h-3" /> : null}
              {ollamaReady === null  ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {ollamaReady === true ? "Ready" : ollamaReady === false ? "Offline" : "Checking"}
            </div> */}
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-6">
          {/* Offline warning */}
          {ollamaReady === false && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-sm font-extrabold">AI engine offline</p>
                <p className="text-amber-200/60 text-xs font-medium mt-1 leading-relaxed">
                  Start Ollama:{" "}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-200">ollama serve</code>
                  {" "}then pull the model:{" "}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-200">ollama pull llama3.2:3b</code>
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!text && !streaming && ollamaReady !== false && (
            <p className="text-sky-100/50 text-sm leading-relaxed">
              Get a personalised festive surge forecast covering demand prediction, optimal pricing,
              stock preparation, and exact listing timing — all computed from your category's live market data.
            </p>
          )}

          {/* Loading state */}
          {streaming && !text && (
            <div className="flex items-center gap-3 text-sky-300/80">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-bold">Analysing market data…</span>
            </div>
          )}

          {/* Streamed output */}
          {text && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
              <p className="text-[10px] font-extrabold text-sky-400/60 uppercase tracking-widest mb-3">
                AI Analysis Output
              </p>
              <div className="text-sky-50/85 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {text}
                {streaming && (
                  <span className="inline-block w-2 h-[1.1em] bg-sky-400 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-4">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={runForecast}
              disabled={streaming || !canRun}
              className="flex-1 h-14 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm disabled:opacity-40 transition-all"
            >
              {streaming ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating…</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Run AI Forecast</>
              )}
            </Button>
            {text && !streaming && (
              <Button
                onClick={() => { setText(""); setError(null); }}
                variant="ghost"
                className="h-14 px-5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {!category && (
            <p className="text-slate-600 text-xs text-center">
              Select a category above to enable the forecast
            </p>
          )}
          {category && (!baseCost || Number(baseCost) <= 0) && (
            <p className="text-slate-600 text-xs text-center">
              Enter your landing cost (₹) above to enable the forecast
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Margin simulation table (Premium)
// platform_fee_pct: Amazon=15%, Flipkart=12% — computed by backend
// ─────────────────────────────────────────────────────────────────────────────

function MarginSimTable({ data, userTier }: { data: MarginData | null; userTier: string }) {
  const locked = !hasTier(userTier, "premium");
  if (!data) return null;

  return (
    <div className="relative">
      {locked && <LockedOverlay tier="premium" />}
      <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold">Margin Simulation</CardTitle>
              <CardDescription className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                Base cost: {fmtPrice(data.base_cost)} · {data.platform_fee_pct}% platform fee
                {data.source === "amazon" ? " (Amazon)" : data.source === "flipkart" ? " (Flipkart)" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Scenario", "Price", "Gross", "Net", ""].map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        "p-4 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest",
                        i > 0 ? "text-right" : "text-left"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.scenarios?.map((sc, i) => {
                  const isRec = sc.label === data.recommended_label;
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-slate-50 last:border-0 transition-colors",
                        isRec ? "bg-sky-50/70" : "bg-white hover:bg-slate-50/50"
                      )}
                    >
                      <td className="p-4 font-extrabold text-slate-800 text-[13px]">{sc.label}</td>
                      <td className="p-4 text-right font-bold text-slate-700">{fmtPrice(sc.price)}</td>
                      <td className="p-4 text-right font-bold text-slate-500">{sc.gross_pct}%</td>
                      <td className={cn(
                        "p-4 text-right font-extrabold",
                        sc.net_pct > 0 ? "text-emerald-600" : "text-rose-500"
                      )}>
                        {sc.net_pct}%
                      </td>
                      <td className="p-4 text-right">
                        {isRec && (
                          <Badge className="bg-sky-600 text-white text-[9px] font-extrabold px-2 py-0.5">
                            Best
                          </Badge>
                        )}
                        {!sc.viable && (
                          <Badge variant="outline" className="text-rose-500 border-rose-200 text-[9px]">
                            Loss
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 font-bold">
            Market range: {fmtPrice(data.market_range?.min)} –{" "}
            {fmtPrice(data.market_range?.max)} · avg {fmtPrice(data.market_range?.avg)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Launch Window card (Premium)
// Smoothed 3-week rolling average on backend; best_score returned for debug.
// ─────────────────────────────────────────────────────────────────────────────

function LaunchWindowCard({ data, userTier }: { data: LaunchData | null; userTier: string }) {
  const locked = !hasTier(userTier, "premium");
  if (!data) return null;

  return (
    <div className="relative">
      {locked && <LockedOverlay tier="premium" />}
      <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-800">Optimal Launch Window</p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Premium · Price inflection analysis
            </p>
          </div>
        </div>

        {data.optimal_week ? (
          <p className="text-3xl font-extrabold text-indigo-600 tracking-tight">{data.optimal_week}</p>
        ) : (
          <p className="text-sm text-slate-400 font-medium italic">No clear window detected</p>
        )}

        <p className="text-sm text-slate-600 font-medium leading-relaxed">{data.recommendation}</p>

        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Price trend</p>
          <MiniSparkline data={data.price_trend} valueKey="avg_price" color="#6366f1" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <span>{data.weeks_available} weeks analysed</span>
          {data.best_score != null && (
            <span>score: {data.best_score}</span>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Velocity bar chart
// ─────────────────────────────────────────────────────────────────────────────

function VelocityChart({
  data,
  highlighted,
}: {
  data: { category_name: string; velocity: number }[];
  highlighted?: string;
}) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.velocity || 0)) || 1;

  return (
    <div className="space-y-2.5">
      {data.slice(0, 8).map((cat, i) => (
        <div key={i} className="flex items-center gap-3">
          <p className={cn(
            "text-xs font-bold w-36 truncate shrink-0",
            cat.category_name === highlighted ? "text-sky-700 font-extrabold" : "text-slate-500"
          )}>
            {cat.category_name}
          </p>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                cat.category_name === highlighted ? "bg-sky-600" : "bg-sky-400/60"
              )}
              style={{ width: `${(cat.velocity / max) * 100}%` }}
            />
          </div>
          <p className={cn(
            "text-xs w-16 text-right shrink-0",
            cat.category_name === highlighted ? "text-sky-700 font-extrabold" : "text-slate-600 font-bold"
          )}>
            {fmt(cat.velocity)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

function FestiveTrendContent() {
  const router   = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Tier ──────────────────────────────────────────────────────────────────
  // Seeded from /festive/tier-info on mount, then kept fresh from every
  // /festive/overview response (which returns user_tier from DB directly).
  // This means the UI reflects subscription changes without a page reload.
  const [userTier,    setUserTier]    = useState<string>("free");
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/festive/tier-info`, FETCH_OPTS)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: TierInfo) => setUserTier(d.tier ?? "free"))
      .catch(() => setUserTier("free"))
      .finally(() => setTierLoading(false));
  }, [user?.id]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [source,     setSource]     = useState<"amazon" | "flipkart">("amazon");
  const [category,   setCategory]   = useState("");
  const [baseCost,   setBaseCost]   = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [trendData,    setTrendData]    = useState<TrendData | null>(null);
  const [launchData,   setLaunchData]   = useState<LaunchData | null>(null);
  const [marginData,   setMarginData]   = useState<MarginData | null>(null);

  // ── Loading flags ──────────────────────────────────────────────────────────
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingTrend,    setLoadingTrend]    = useState(false);
  const [loadingLaunch,   setLoadingLaunch]   = useState(false);
  const [loadingMargin,   setLoadingMargin]   = useState(false);

  // ── Calendar — FREE, no auth needed ──────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/festive/calendar`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setCalendarData)
      .catch(() => {});
  }, []);

  // ── Overview — FREE; response includes user_tier from DB ─────────────────
  // Tier from /overview is authoritative — syncs UI if subscription changed.
  useEffect(() => {
    setLoadingOverview(true);
    fetch(`${API_BASE}/api/festive/overview?source=${source}`, FETCH_OPTS)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: OverviewData) => {
        setOverviewData(d);
        if (d.user_tier) setUserTier(d.user_tier);
      })
      .catch(() => {})
      .finally(() => setLoadingOverview(false));
  }, [source, user?.id]);

  // ── Categories — BASIC+ only ──────────────────────────────────────────────
  useEffect(() => {
    if (!hasTier(userTier, "basic")) { setCategories([]); return; }
    fetch(`${API_BASE}/api/festive/categories?source=${source}`, FETCH_OPTS)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { category: string }[]) => setCategories(d.map(c => c.category)))
      .catch(() => setCategories([]));
  }, [source, userTier, user?.id]);

  // ── Run full trend analysis ───────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!category) {
      toast({ title: "Select a category", description: "Choose a target category to analyse.", variant: "destructive" });
      return;
    }
    if (!hasTier(userTier, "basic")) {
      toast({ title: "Basic plan required", description: "Upgrade to Basic to run trend analysis.", variant: "destructive" });
      return;
    }

    // Reset previous results
    setTrendData(null);
    setMarginData(null);
    setLaunchData(null);

    const params = new URLSearchParams({ category_name: category, source });

    // ── Trend + Stock Risk (BASIC+) ─────────────────────────────────────────
    setLoadingTrend(true);
    try {
      const res = await fetch(`${API_BASE}/api/festive/trend-analysis?${params}`, FETCH_OPTS);
      if (!res.ok) throw new Error(await parseApiError(res));
      setTrendData(await res.json());
    } catch (e: any) {
      toast({ title: "Analysis Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingTrend(false);
    }

    // ── Premium features — only if user has premium ────────────────────────
    if (!hasTier(userTier, "premium")) return;

    // Launch Window (no base_cost needed)
    setLoadingLaunch(true);
    fetch(`${API_BASE}/api/festive/launch-window?${params}`, FETCH_OPTS)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(setLaunchData)
      .catch(async (err) => {
        const msg = err instanceof Response ? await parseApiError(err) : String(err);
        toast({ title: "Launch Window Error", description: msg, variant: "destructive" });
      })
      .finally(() => setLoadingLaunch(false));

    // Margin Simulation (requires base_cost > 0)
    if (baseCost && Number(baseCost) > 0) {
      setLoadingMargin(true);
      const mp = new URLSearchParams(params);
      mp.set("base_cost", baseCost);
      fetch(`${API_BASE}/api/festive/margin-sim?${mp}`, FETCH_OPTS)
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(setMarginData)
        .catch(async (err) => {
          const msg = err instanceof Response ? await parseApiError(err) : String(err);
          toast({ title: "Margin Sim Error", description: msg, variant: "destructive" });
        })
        .finally(() => setLoadingMargin(false));
    }
  }, [category, source, baseCost, userTier, toast]);

  const isLoading = loadingTrend || loadingLaunch || loadingMargin;

  // ── Category quick-select from overview cards ─────────────────────────────
  const selectCategory = (name: string) => {
    if (hasTier(userTier, "basic")) setCategory(name);
  };

  // ── Loading state while tier is being fetched ─────────────────────────────
  if (tierLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
      </div>
    );
  }

  const isPremium = hasTier(userTier, "premium");
  const isBasic   = hasTier(userTier, "basic");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Festive <span className="text-sky-600">Trends</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-base">
            Ride India's festive demand cycles — price smarter, stock right, list on time
          </p>
        </div>
        <div className={cn(
          "self-start sm:self-auto px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-widest border",
          TIER_BADGE[userTier.toLowerCase()] ?? TIER_BADGE.free
        )}>
          {userTier} plan
        </div>
      </div>

      {/* ── Festival calendar strip (FREE, dynamic) ─────────────────────────── */}
      {calendarData && (
        <div className="space-y-3">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Upcoming Festive Events · {calendarData.year}
          </p>
          <FestiveCalendarStrip events={calendarData.events} upcoming={calendarData.upcoming} />
        </div>
      )}

      {/* ── Analysis config card ─────────────────────────────────────────────── */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <CardTitle className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
            <BarChart3 className="h-6 w-6 text-sky-600" /> Trend Analysis Setup
          </CardTitle>
          <CardDescription className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
            Configure your market parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Marketplace */}
            <div className="space-y-3">
              <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <ShoppingBag className="w-3 h-3" /> Marketplace
              </Label>
              <select
                value={source}
                onChange={e => {
                  setSource(e.target.value as "amazon" | "flipkart");
                  setCategory("");
                  setTrendData(null);
                  setMarginData(null);
                  setLaunchData(null);
                }}
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none appearance-none transition-all hover:bg-slate-100 cursor-pointer"
              >
                <option value="amazon">Amazon India</option>
                <option value="flipkart">Flipkart India</option>
              </select>
            </div>

            {/* Category — requires Basic+ */}
            <div className="space-y-3">
              <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Target Category
                {!isBasic && <Lock className="w-3 h-3" />}
              </Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={!isBasic}
                className={cn(
                  "w-full h-14 px-5 rounded-2xl bg-slate-50 border border-transparent text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none appearance-none transition-all",
                  !isBasic ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-100 cursor-pointer"
                )}
              >
                <option value="">
                  {isBasic ? "Select category…" : "Basic plan required"}
                </option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Base / landing cost — requires Premium (used by margin-sim + AI) */}
            <div className="space-y-3">
              <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <IndianRupee className="w-3 h-3" /> Landing Cost (₹)
                {!isPremium && <Lock className="w-3 h-3 text-slate-300" />}
              </Label>
              <Input
                value={baseCost}
                onChange={e => setBaseCost(e.target.value)}
                type="number"
                placeholder={isPremium ? "e.g. 500" : "Premium only"}
                min={1}
                disabled={!isPremium}
                className={cn(
                  "h-14 px-6 rounded-2xl bg-slate-50 border-transparent text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all",
                  !isPremium && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>

            {/* Analysis window — fixed at 90 days */}
            <div className="space-y-3">
              <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                Analysis Window
              </Label>
              <div className="h-14 flex items-center px-6 rounded-2xl bg-slate-50 text-sm font-bold text-slate-400 select-none">
                90 days (fixed)
              </div>
            </div>
          </div>

          <Button
            onClick={runAnalysis}
            disabled={isLoading || !isBasic || !category}
            className="w-full h-16 rounded-[1.25rem] bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-2xl shadow-sky-100/60 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Analysing…</>
            ) : (
              <><TrendingUp className="h-5 w-5 mr-3" /> Analyse Festive Trends</>
            )}
          </Button>

          {!isBasic && (
            <p className="text-center text-xs text-slate-400 font-medium">
              Category trend analysis requires Basic or Premium plan
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Overview: top 3 categories (FREE) ─────────────────────────────────── */}
      {overviewData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Top Trending Categories · {overviewData.source === "flipkart" ? "Flipkart" : "Amazon"}
            </p>
            {overviewData.next_festival && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">{overviewData.next_festival.emoji}</span>
                <span className="font-bold text-slate-700">{overviewData.next_festival.name}</span>
                <Badge
                  variant="outline"
                  className={INTENSITY_COLORS[overviewData.next_festival.intensity]}
                >
                  {overviewData.next_festival.days_away}d away
                </Badge>
              </div>
            )}
          </div>

          {loadingOverview ? (
            <div className="flex items-center justify-center h-36">
              <Loader2 className="w-7 h-7 animate-spin text-sky-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overviewData.top_categories?.map((cat, i) => (
                <CategoryCard
                  key={i}
                  cat={cat}
                  index={i}
                  onSelect={selectCategory}
                  selected={category === cat.category_name}
                />
              ))}
            </div>
          )}

          {!isBasic && (
            <UpgradeBanner
              tier="basic"
              message="Unlock all categories + 90-day trend charts"
              price="Basic plan — ₹1,999/month"
            />
          )}
        </div>
      )}

      {/* ── Trend results (BASIC+) ────────────────────────────────────────────── */}
      {(loadingTrend || trendData) && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {loadingTrend ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
            </div>
          ) : trendData && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Price Trend</p>
                  <PriceDeltaBadge pct={trendData.price_delta_pct} />
                  <p className="text-xs text-slate-400 font-medium">vs previous week</p>
                </Card>
                <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Velocity Rank</p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    #{trendData.velocity_rank ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">by avg sales volume</p>
                </Card>
                <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Stock Risk</p>
                  <div className="pt-1">
                    <StockRiskBadge risk={trendData.stock_risk} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    peak/avg ratio: {trendData.stock_risk?.ratio ?? "—"}×
                  </p>
                </Card>
                <Card className="border-none shadow-md rounded-2xl bg-white p-6 space-y-1.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Data Points</p>
                  <p className="text-3xl font-extrabold text-slate-900">{trendData.data_points}</p>
                  <p className="text-xs text-slate-400 font-medium">weekly snapshots</p>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      Price Trend — {trendData.category_name}
                    </p>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                      90-day weekly average
                    </p>
                  </div>
                  <MiniSparkline data={trendData.price_trend} valueKey="avg_price" />
                  {trendData.price_trend?.length > 0 && (
                    <div className="flex justify-between text-xs text-slate-500 font-bold">
                      <span>Min {fmtPrice(Math.min(...trendData.price_trend.map(d => d.avg_price)))}</span>
                      <span>Max {fmtPrice(Math.max(...trendData.price_trend.map(d => d.avg_price)))}</span>
                    </div>
                  )}
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-8 space-y-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">Category Velocity Leaderboard</p>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                      Avg monthly sales volume
                    </p>
                  </div>
                  <VelocityChart data={trendData.velocity_all} highlighted={trendData.category_name} />
                </Card>
              </div>

              {/* Premium cards — launch window + margin sim */}
              {(loadingLaunch || loadingMargin || launchData || marginData) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {loadingLaunch ? (
                    <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-center h-52">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </Card>
                  ) : (
                    <LaunchWindowCard data={launchData} userTier={userTier} />
                  )}

                  {loadingMargin ? (
                    <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 flex items-center justify-center h-52">
                      <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                    </Card>
                  ) : (
                    <MarginSimTable data={marginData} userTier={userTier} />
                  )}
                </div>
              )}

              {/* Show locked premium cards if user is not premium */}
              {!isPremium && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LaunchWindowCard data={{ optimal_week: null, recommendation: "", price_trend: [], weeks_available: 0 }} userTier={userTier} />
                  <MarginSimTable
                    data={{
                      base_cost: 0,
                      market_range: { min: 0, avg: 0, max: 0 },
                      scenarios: [
                        { label: "Floor", price: 0, gross_margin: 0, gross_pct: 0, platform_fee: 0, net_margin: 0, net_pct: 0, viable: false },
                        { label: "Market avg", price: 0, gross_margin: 0, gross_pct: 0, platform_fee: 0, net_margin: 0, net_pct: 0, viable: false },
                      ],
                      recommended_price: 0,
                      recommended_label: "Market avg",
                      platform_fee_pct: 15,
                    }}
                    userTier={userTier}
                  />
                </div>
              )}

              {!isPremium && (
                <UpgradeBanner
                  tier="premium"
                  message="Unlock Launch Window, Margin Simulation & AI Forecast"
                  price="Premium plan — ₹2,999/month"
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ── AI Forecast (PREMIUM, Ollama SSE) ────────────────────────────────── */}
      {(isBasic || trendData) && (
        <AIForecastPanel
          category={category}
          source={source}
          baseCost={baseCost}
          userTier={userTier}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page wrapper with Suspense boundary (required for useSearchParams etc.)
// ─────────────────────────────────────────────────────────────────────────────

export default function FestiveTrendsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin h-8 w-8 text-sky-500" />
        </div>
      }
    >
      <FestiveTrendContent />
    </Suspense>
  );
}