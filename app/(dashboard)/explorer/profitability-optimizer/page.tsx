// "use client";

// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { API_BASE_URL } from "@/lib/config";
// import axios from "axios";
// import { useAuth } from "@/lib/auth-context";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis,
//   CartesianGrid, Tooltip, ResponsiveContainer,
//   RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
// } from "recharts";
// import {
//   Calculator, TrendingUp, BarChart3, Activity, Bot,
//   Lock, Crown, CheckCircle, XCircle, X, RefreshCw,
//   Bookmark, Target, ShieldCheck, Zap, Send, RotateCcw, AlertCircle, Search,
// } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// const API = `${API_BASE_URL}/api`;

// axios.defaults.withCredentials = true;

// const CHART_STYLE = {
//   backgroundColor: "rgba(255,255,255,0.97)",
//   borderRadius: "12px",
//   border: "1.5px solid #e2e8f0",
//   boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
//   fontSize: 12,
//   padding: "8px 14px",
// };

// const WATERFALL_COLORS: Record<string, string> = {
//   product_cost: "#3b82f6",
//   shipping_to_fba: "#60a5fa",
//   fba_fee: "#f59e0b",
//   referral_fee: "#f97316",
//   ad_spend: "#8b5cf6",
//   storage_fee: "#6b7280",
//   return_cost: "#ef4444",
// };

// // ── Types ─────────────────────────────────────────────────────────────────────

// interface Inputs {
//   selling_price: number;
//   product_cost: number;
//   shipping_to_fba: number;
//   fba_fee: number;
//   ad_spend_per_unit: number;
//   monthly_units: number;
//   return_rate_pct: number;
//   storage_fee_per_unit: number;
//   referral_fee_pct: number;
//   category: string;
//   marketplace: string;
//   your_brand: string;
// }

// interface CostBreakdown {
//   product_cost: number;
//   shipping_to_fba: number;
//   fba_fee: number;
//   referral_fee: number;
//   ad_spend: number;
//   storage_fee: number;
//   return_cost: number;
// }

// interface CalcResult {
//   selling_price: number;
//   category: string;
//   marketplace: string;
//   tier: string;
//   tier_features: Record<string, boolean | number>;
//   profit_per_unit: number;
//   net_margin_pct: number;
//   monthly_profit: number;
//   yearly_profit?: number;
//   breakeven_units: number;
//   total_cost: number;
//   roi_pct?: number;
//   acos_pct?: number;
//   cost_breakdown?: CostBreakdown;
//   alerts?: { type: string; message: string }[];
// }

// interface SavedProductDB {
//   id: string;
//   name: string;
//   inputs: Inputs;
//   calc_snapshot: CalcResult;
//   profit_per_unit: number;
//   net_margin_pct: number;
//   monthly_profit: number;
//   created_at: string;
// }

// interface Toast {
//   id: number;
//   title: string;
//   description: string;
//   variant: "success" | "error";
// }

// // ── Safe value helpers ────────────────────────────────────────────────────────

// function inr(n: number | undefined | null): string {
//   const num = Number(n);
//   if (n === undefined || n === null || isNaN(num)) return "—";
//   return "₹" + Math.round(Math.abs(num)).toLocaleString("en-IN");
// }

// function pct(n: number | undefined | null): string {
//   const num = Number(n);
//   if (n === undefined || n === null || isNaN(num)) return "—";
//   return num.toFixed(1) + "%";
// }

// function str(v: unknown): string {
//   if (v === undefined || v === null) return "—";
//   if (typeof v === "object") return JSON.stringify(v);
//   return String(v);
// }

// function extractErr(e: unknown): string {
//   const err = e as Record<string, unknown>;
//   const detail = (err?.response as Record<string, unknown>)?.data
//     ? ((err.response as Record<string, unknown>).data as Record<string, unknown>)?.detail
//     : undefined;
//   if (detail === undefined || detail === null) {
//     return (err?.message as string) ?? "Something went wrong.";
//   }
//   if (Array.isArray(detail)) {
//     return detail
//       .map((x: unknown) =>
//         x !== null && typeof x === "object"
//           ? ((x as Record<string, unknown>).msg as string) ?? "error"
//           : String(x)
//       )
//       .join(", ");
//   }
//   if (typeof detail === "object") {
//     const d = detail as Record<string, unknown>;
//     return (d.message as string) ?? (d.msg as string) ?? "Error";
//   }
//   return String(detail);
// }

// // ── useOllamaStream ───────────────────────────────────────────────────────────

// function useOllamaStream() {
//   const [streaming, setStreaming] = useState(false);
//   const [text, setText] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const abortRef = useRef<AbortController | null>(null);

//   const start = useCallback(async (url: string, body: object) => {
//     if (abortRef.current) abortRef.current.abort();
//     abortRef.current = new AbortController();
//     setText("");
//     setError(null);
//     setStreaming(true);
//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(body),
//         signal: abortRef.current.signal,
//       });
//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         const code = (errData as Record<string, unknown>)?.detail;
//         const codeStr =
//           code !== null && typeof code === "object"
//             ? ((code as Record<string, unknown>).error as string) ?? "request_failed"
//             : "request_failed";
//         setError(codeStr);
//         setStreaming(false);
//         return;
//       }
//       const reader = res.body!.getReader();
//       const decoder = new TextDecoder();
//       let buf = "";
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         buf += decoder.decode(value, { stream: true });
//         const lines = buf.split("\n");
//         buf = lines.pop() ?? "";
//         for (const line of lines) {
//           if (!line.startsWith("data: ")) continue;
//           const data = line.slice(6).trim();
//           if (data === "[DONE]") break;
//           try {
//             const token = JSON.parse(data);
//             setText((prev) => prev + token);
//           } catch {
//             setText((prev) => prev + data);
//           }
//         }
//       }
//     } catch (e: unknown) {
//       if ((e as { name?: string })?.name !== "AbortError") setError("stream_interrupted");
//     } finally {
//       setStreaming(false);
//     }
//   }, []);

//   const stop = useCallback(() => { abortRef.current?.abort(); setStreaming(false); }, []);
//   const reset = useCallback(() => { setText(""); setError(null); }, []);
//   return { streaming, text, error, start, stop, reset };
// }

// // ── AlertBox ──────────────────────────────────────────────────────────────────

// function AlertBox({ type, message }: { type: string; message: string }) {
//   const styles: Record<string, string> = {
//     danger:  "bg-red-50 border-red-400 text-red-800",
//     warn:    "bg-amber-50 border-amber-400 text-amber-800",
//     success: "bg-emerald-50 border-emerald-400 text-emerald-800",
//   };
//   const icons: Record<string, JSX.Element> = {
//     danger:  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />,
//     warn:    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />,
//     success: <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />,
//   };
//   return (
//     <div className={`flex items-start gap-2 p-3 rounded-xl border-l-4 text-sm ${styles[type] ?? styles.warn}`}>
//       {icons[type] ?? icons.warn}
//       <span>{String(message ?? "")}</span>
//     </div>
//   );
// }

// // ── SliderRow ─────────────────────────────────────────────────────────────────

// function SliderRow({
//   label, value, min, max, step, format, locked, onChange,
// }: {
//   label: string; value: number; min: number; max: number;
//   step: number; format: (v: number) => string; locked?: boolean;
//   onChange: (v: number) => void;
// }) {
//   return (
//     <div className={`flex items-center gap-3 py-1.5 ${locked ? "opacity-40 pointer-events-none" : ""}`}>
//       <label className="text-xs text-slate-500 w-36 shrink-0 flex items-center gap-1">
//         {label}
//         {locked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
//       </label>
//       <input type="range" min={min} max={max} step={step} value={value}
//         onChange={(e) => onChange(Number(e.target.value))} disabled={locked}
//         className="flex-1 accent-blue-500 h-1.5"
//         data-track-id={`${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_input`} />
//       <span className="text-xs font-semibold text-slate-700 w-16 text-right tabular-nums">
//         {format(value)}
//       </span>
//     </div>
//   );
// }

// // ── AIPanel ───────────────────────────────────────────────────────────────────

// function AIPanel({
//   calcResult, inputs, scenarios, healthData,
//   isBasicPlus, isPremium, userId, onUpgrade,
// }: {
//   calcResult: CalcResult | null;
//   inputs: Inputs;
//   scenarios: unknown[] | null;
//   healthData: Record<string, unknown> | null;
//   isBasicPlus: boolean;
//   isPremium: boolean;
//   userId?: string;
//   onUpgrade: (f: string) => void;
// }) {
//   type AIStatus = {
//     status?: string;
//     model?: string;
//     setup_hint?: string;
//   };

//   const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
//   const [chatInput, setChatInput] = useState("");
//   const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
//   const [pendingChat, setPendingChat] = useState<string | null>(null);
//   const [activeMode, setActiveMode] = useState<"analyze" | "chat" | "scenario" | "health">("analyze");
//   const chatEndRef = useRef<HTMLDivElement>(null);

//   const analyzeStream = useOllamaStream();
//   const chatStream = useOllamaStream();
//   const scenarioStream = useOllamaStream();
//   const healthStream = useOllamaStream();

//   useEffect(() => {
//     fetch(`${API}/profitability/ai/status`).then((r) => r.json()).then(setAiStatus).catch(() => {});
//   }, []);

//   useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatStream.text, chatHistory]);

//   useEffect(() => {
//     if (!chatStream.streaming && chatStream.text && pendingChat) {
//       setChatHistory((h) => [...h, { role: "assistant", content: chatStream.text }]);
//       setPendingChat(null);
//     }
//   }, [chatStream.streaming]);

//   const ready = aiStatus?.status === "ready";

//   const runAnalyze = () => {
//     if (!isPremium) { onUpgrade("AI full analysis"); return; }
//     analyzeStream.reset();
//     analyzeStream.start(`${API}/profitability/ai/analyze`, { calc_result: calcResult ?? {}, inputs, user_id: userId });
//   };

//   const runChat = async () => {
//     if (!isBasicPlus) { onUpgrade("AI advisor chat"); return; }
//     const q = chatInput.trim();
//     if (!q || chatStream.streaming) return;
//     setChatInput("");
//     setChatHistory((h) => [...h, { role: "user", content: q }]);
//     setPendingChat(q);
//     chatStream.reset();
//     await chatStream.start(`${API}/profitability/ai/chat`, {
//       question: q, calc_context: { ...calcResult, ...inputs }, history: chatHistory, user_id: userId,
//     });
//   };

//   const runScenario = () => {
//     if (!isPremium) { onUpgrade("Scenario AI advice"); return; }
//     scenarioStream.reset();
//     scenarioStream.start(`${API}/profitability/ai/scenario-advice`, { scenarios: scenarios ?? [], base_inputs: inputs, user_id: userId });
//   };

//   const runHealth = () => {
//     if (!isPremium) { onUpgrade("Health action plan"); return; }
//     healthStream.reset();
//     healthStream.start(`${API}/profitability/ai/health-advice`, { health_data: healthData ?? {}, inputs, user_id: userId });
//   };

//   const statusColor = aiStatus?.status === "ready" ? "bg-green-400" : aiStatus?.status === "no_model" ? "bg-amber-400" : "bg-red-400";

//   // ── StreamBox: white card with dark text ──────────────────────────────────
//   function StreamBox({ stream }: { stream: ReturnType<typeof useOllamaStream> }) {
//     return (
//       <div className="mt-3 min-h-16 max-h-80 overflow-y-auto bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
//         {stream.streaming && !stream.text && (
//           <span className="text-slate-400 text-xs animate-pulse">Insydz is thinking...</span>
//         )}
//         {(stream.text || stream.streaming) && (
//           <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
//             <ReactMarkdown>{stream.text}</ReactMarkdown>
//             {stream.streaming && <span className="animate-pulse text-violet-500">▌</span>}
//           </div>
//         )}
//         {stream.error === "upgrade_required" && (
//           <span className="text-amber-600 text-xs font-medium">Available on Premium plan. Upgrade to unlock.</span>
//         )}
//         {stream.error === "ollama_offline" && (
//           <span className="text-red-600 text-xs font-medium">AI is temporarily unavailable. Please try again shortly.</span>
//         )}
//         {stream.error === "stream_interrupted" && (
//           <span className="text-red-600 text-xs font-medium">Analysis interrupted. Retry to continue — no data lost.</span>
//         )}
//         {stream.error && !["upgrade_required", "ollama_offline", "stream_interrupted"].includes(stream.error) && (
//           <span className="text-red-600 text-xs font-medium">Couldn't complete analysis. Please try again.</span>
//         )}
//       </div>
//     );
//   }

//   const MODES = [
//     { id: "analyze",  label: "Full analysis",     tier: "premium" as const },
//     { id: "chat",     label: "Ask anything",       tier: "basic"   as const },
//     { id: "scenario", label: "Scenario advice",    tier: "premium" as const },
//     { id: "health",   label: "Health action plan", tier: "premium" as const },
//   ];

//   const QUICK_Q = ["How do I reduce my ACOS?", "Should I raise price by 10%?", "What's eating my margin most?", "How do I hit 25% margin?"];

//   return (
//     <div className="space-y-4">


//       {/* Mode tabs */}
//       <div className="flex gap-2 flex-wrap">
//         {MODES.map((m) => {
//           const locked = m.tier === "premium" ? !isPremium : !isBasicPlus;
//           return (
//             <button key={m.id}
//               onClick={() => locked ? onUpgrade(m.label) : setActiveMode(m.id as typeof activeMode)}
//               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
//                 activeMode === m.id
//                   ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/30"
//                   : locked
//                   ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed"
//                   : "bg-slate-800 text-slate-300 border-slate-700 hover:border-violet-500 hover:text-white"
//               }`}
//               data-track-id="ai_advisor_mode_btn"
//               data-filter-value={m.id}
//             >
//               {locked && <span className="text-amber-500 text-[10px]">🔒</span>}
//               {m.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Full analysis ── */}
//       {activeMode === "analyze" && (
//         <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//           <div className="flex items-start justify-between mb-2">
//             <div>
//               <p className="text-sm font-semibold text-slate-800">Full profitability analysis</p>
//               <p className="text-xs text-slate-400 mt-0.5">4 recommendations from your exact numbers</p>
//             </div>
//             <div className="flex gap-2">
//               {analyzeStream.text && (
//                 <button 
//                   onClick={analyzeStream.reset} 
//                   className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
//                   data-track-id="ai_run_analysis_clear_btn"
//                 >
//                   Clear
//                 </button>
//               )}
//               <button
//                 onClick={runAnalyze}
//                 disabled={analyzeStream.streaming || !calcResult || !ready}
//                 className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
//                 data-track-id="ai_run_analysis_btn"
//               >
//                 {analyzeStream.streaming ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...</> : "✦ Run analysis"}
//               </button>
//             </div>
//           </div>
//           {analyzeStream.text || analyzeStream.streaming || analyzeStream.error ? (
//             <StreamBox stream={analyzeStream} />
//           ) : (
//             <div className="mt-3 bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
//               <p className="text-slate-400 text-xs">Click "Run analysis" for AI recommendations</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Chat ── */}
//       {activeMode === "chat" && (
//         <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//           <div className="max-h-72 overflow-y-auto space-y-3 mb-4">
//             {chatHistory.length === 0 && (
//               <div className="py-4 text-center">
//                 <p className="text-slate-400 text-xs mb-3">Ask anything about your product's numbers</p>
//                 <div className="flex flex-wrap gap-2 justify-center">
//                   {QUICK_Q.map((q) => (
//                     <button
//                       key={q}
//                       onClick={() => setChatInput(q)}
//                       className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-violet-100 hover:text-violet-700 transition-colors border border-slate-200"
//                       data-track-id="ai_chat_quick_q_btn"
//                       data-filter-value={q}
//                     >
//                       {q}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//             {chatHistory.map((msg, i) => (
//               <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//                 <div className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed rounded-2xl ${
//                   msg.role === "user"
//                     ? "bg-violet-600 text-white rounded-br-sm"
//                     : "bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200"
//                 }`}>
//                   <div className="prose prose-sm max-w-none">
//                     <ReactMarkdown>{String(msg.content ?? "")}</ReactMarkdown>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {(chatStream.streaming || pendingChat) && (
//               <div className="flex justify-start">
//                 <div className="max-w-[85%] px-3.5 py-2.5 text-xs bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200 leading-relaxed">
//                   {chatStream.text ? (
//                     <div className="prose prose-sm max-w-none">
//                       <ReactMarkdown>{chatStream.text}</ReactMarkdown>
//                       {chatStream.streaming && <span className="animate-pulse text-violet-500">▌</span>}
//                     </div>
//                   ) : (
//                     <span className="animate-pulse text-slate-400">▌</span>
//                   )}
//                 </div>
//               </div>
//             )}
//             <div ref={chatEndRef} />
//           </div>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={chatInput}
//               onChange={(e) => setChatInput(e.target.value)}
//               onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runChat(); } }}
//               placeholder="Ask about your margins, pricing, ads..."
//               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
//               data-track-id="ai_chat_input"
//             />
//             <button
//               onClick={runChat}
//               disabled={chatStream.streaming || !chatInput.trim() || !ready}
//               className="px-3 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all"
//               data-track-id="ai_chat_submit_btn"
//             >
//               <Send className="w-3.5 h-3.5" />
//             </button>
//             {chatHistory.length > 0 && (
//               <button
//                 onClick={() => { setChatHistory([]); chatStream.reset(); setPendingChat(null); }}
//                 className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs transition-colors"
//                 data-track-id="ai_chat_clear_btn"
//               >
//                 <RotateCcw className="w-3.5 h-3.5" />
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── Scenario advice ── */}
//       {activeMode === "scenario" && (
//         <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//           <div className="flex items-start justify-between mb-2">
//             <div>
//               <p className="text-sm font-semibold text-slate-800">Which strategy should I pick?</p>
//               <p className="text-xs text-slate-400 mt-0.5">AI compares your 4 scenarios and recommends one</p>
//             </div>
//             <button
//               onClick={runScenario}
//               disabled={scenarioStream.streaming || !scenarios || !ready}
//               className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
//               data-track-id="ai_get_scenario_advice_btn"
//             >
//               {scenarioStream.streaming ? "Thinking..." : "✦ Get advice"}
//             </button>
//           </div>
//           {!scenarios && (
//             <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-xl p-4 border border-slate-100">
//               Open the Scenarios tab first to generate data.
//             </p>
//           )}
//           {(scenarioStream.text || scenarioStream.streaming || scenarioStream.error) && (
//             <StreamBox stream={scenarioStream} />
//           )}
//         </div>
//       )}

//       {/* ── Health advice ── */}
//       {activeMode === "health" && (
//         <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//           <div className="flex items-start justify-between mb-2">
//             <div>
//               <p className="text-sm font-semibold text-slate-800">5-step health improvement plan</p>
//               <p className="text-xs text-slate-400 mt-0.5">AI turns your health score into a prioritized action plan</p>
//             </div>
//             <button
//               onClick={runHealth}
//               disabled={healthStream.streaming || !healthData || !ready}
//               className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
//               data-track-id="ai_build_health_plan_btn"
//             >
//               {healthStream.streaming ? "Thinking..." : "✦ Build plan"}
//             </button>
//           </div>
//           {!healthData && (
//             <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-xl p-4 border border-slate-100">
//               Open the Business Health tab first.
//             </p>
//           )}
//           {(healthStream.text || healthStream.streaming || healthStream.error) && (
//             <StreamBox stream={healthStream} />
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ══════════════════════════════════════════════════════════════════════════════

// export default function ProfitabilityOptimizer() {
//   const { user } = useAuth();
//   const userId = user?.id;

//   const [inputs, setInputs] = useState<Inputs>({
//     selling_price: 2999, product_cost: 850, shipping_to_fba: 180, fba_fee: 200,
//     ad_spend_per_unit: 120, monthly_units: 300, return_rate_pct: 5,
//     storage_fee_per_unit: 15, referral_fee_pct: 9, category: "Baby Products", marketplace: "amazon", your_brand: "",
//   });

//   const [categories, setCategories]   = useState<string[]>([]);
//   const [activeTab, setActiveTab]     = useState<"calc" | "scenario" | "market" | "health" | "ai">("calc");
//   const [calcResult, setCalcResult]   = useState<CalcResult | null>(null);
//   const [scenarios, setScenarios]     = useState<unknown[] | null>(null);
//   const [sensitivity, setSensitivity] = useState<Record<string, unknown>[]>([]);
//   const [marketIntel, setMarketIntel] = useState<Record<string, unknown> | null>(null);
//   const [healthData, setHealthData]   = useState<Record<string, unknown> | null>(null);
//   const [tier, setTier]               = useState("free");
//   const [calcLoading, setCalcLoading] = useState(false);
//   const [tabLoading, setTabLoading]   = useState(false);

//   // ── Updated saved products state (DB-backed) ──────────────────────────────
//   const [savedProducts, setSaved]         = useState<SavedProductDB[]>([]);
//   const [saveModal, setSaveModal]         = useState(false);
//   const [saveName, setSaveName]           = useState("");
//   const [savingProduct, setSavingProduct] = useState(false);

//   const [upgradeModal, setUpgrade]    = useState({ open: false, feature: "" });
//   const [toasts, setToasts]           = useState<Toast[]>([]);

//   const [nicheKeyword, setNicheKeyword] = useState("");
//   const [fetchingNiche, setFetchingNiche] = useState(false);

//   const isBasicPlus = tier === "basic" || tier === "premium" || tier === "enterprise";
//   const isPremium   = tier === "premium" || tier === "enterprise";
//   const saveLimit   = tier === "free" ? 0 : tier === "basic" ? 5 : 9999;

//   const toast = (title: string, description: string, variant: "success" | "error" = "success") => {
//     const id = Date.now();
//     setToasts((p) => [...p, { id, title, description, variant }]);
//     setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
//   };

//   // ── fetchSavedProducts ────────────────────────────────────────────────────
//   const fetchSavedProducts = useCallback(async () => {
//     if (!userId) return;
//     try {
//       const res = await axios.get(`${API}/profitability/saved`);
//       setSaved(res.data as SavedProductDB[]);
//     } catch {
//       // silent
//     }
//   }, [userId]);

//   // ── Mount effects ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     fetchCategories(inputs.marketplace);
//     if (userId) {
//       fetchTierInfo();
//       fetchSavedProducts();
//     }
//   }, [userId]);

//   useEffect(() => { fetchCategories(inputs.marketplace); setMarketIntel(null); }, [inputs.marketplace]);
//   useEffect(() => {
//     setScenarios(null);
//     setMarketIntel(null);
//     setHealthData(null);
//   }, [inputs]);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       if (activeTab === "scenario" && isPremium) {
//         fetchScenarios();
//       }
//       if (activeTab === "market" && isPremium) {
//         fetchMarketIntel();
//       }
//       if (activeTab === "health" && isPremium) {
//         fetchHealth();
//       }
//     }, 500); // debounce

//     return () => clearTimeout(t);
//   }, [inputs, activeTab]);

//   const fetchCategories = async (marketplace: string) => {
//     try {
//       const res = await axios.get(`${API}/profitability/categories`, { params: { marketplace } });
//       const cats: string[] = res.data.categories ?? [];
//       setCategories(cats);
//       if (cats.length > 0) {
//         setInputs((p) => {
//           const hasBaby = cats.includes("Baby Products");
//           const defaultCat = hasBaby ? "Baby Products" : (cats[0] || "");
//           const currentValid = p.category && cats.includes(p.category);
//           return { ...p, category: currentValid ? p.category : defaultCat };
//         });
//       }
//     } catch { /* silent */ }
//   };

//   const handleNicheAutofill = async () => {
//     if (!nicheKeyword.trim()) return;
//     setFetchingNiche(true);
//     try {
//       // Pass base_cost = 0 to execute a completely unrestricted, true market-value search on the backend
//       const res = await axios.post(`${API}/profitability/niche-research`, {
//         product_name: nicheKeyword.trim(),
//         category: "All",
//         source: inputs.marketplace,
//         base_cost: 0,
//         user_email: user?.email || null,
//       });

//       if (res.data && res.data.success && res.data.data) {
//         const item = res.data.data;
//         const recommendedPrice = item.pricing?.recommended_price || 0;
        
//         let monthlySales = 300;
//         if (item.sales?.estimated_monthly_sales) {
//           const match = item.sales.estimated_monthly_sales.match(/(\d+)\s*-\s*(\d+)/);
//           if (match) {
//             monthlySales = Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
//           } else {
//             const singleNum = parseInt(item.sales.estimated_monthly_sales);
//             if (!isNaN(singleNum)) monthlySales = singleNum;
//           }
//         }

//         // Generate highly realistic, data-driven cost breakdowns based on standard e-commerce ratios
//         const calculatedCost = recommendedPrice ? Math.round(recommendedPrice * 0.30) : 150; // 30% COGS proxy
//         const calculatedFba = recommendedPrice ? Math.round(recommendedPrice * 0.08) : 50;    // 8% FBA fee
//         const calculatedShipping = recommendedPrice ? Math.round(recommendedPrice * 0.03) : 20; // 3% FBA shipping
//         const calculatedAdSpend = recommendedPrice ? Math.round(recommendedPrice * 0.10) : 50;  // 10% ad spend

//         setInputs((prev) => ({
//           ...prev,
//           category: item.category || prev.category,
//           selling_price: recommendedPrice || prev.selling_price,
//           product_cost: calculatedCost,
//           shipping_to_fba: calculatedShipping,
//           fba_fee: calculatedFba,
//           ad_spend_per_unit: calculatedAdSpend,
//           monthly_units: monthlySales || prev.monthly_units,
//         }));

//         toast(
//           "Niche Loaded",
//           `Auto-filled selling price (₹${recommendedPrice}) and sales volume (${monthlySales}) for "${nicheKeyword.trim()}"`,
//           "success"
//         );
//       } else {
//         toast("Search failed", "Could not fetch specific product data.", "error");
//       }
//     } catch (e) {
//       toast("Search failed", "Niche product database search failed.", "error");
//     } finally {
//       setFetchingNiche(false);
//     }
//   };

//   const fetchTierInfo = async () => {
//     try {
//       const res = await axios.get(`${API}/profitability/tier-info`);
//       setTier(String(res.data.tier ?? "free"));
//     } catch { /* silent */ }
//   };

//   useEffect(() => {
//     if (!inputs.category) return;
//     const t = setTimeout(runCalculate, 420);
//     return () => clearTimeout(t);
//   }, [inputs]);

//   const runCalculate = useCallback(async () => {
//     if (!inputs.category) return;
//     setCalcLoading(true);
//     try {
//       const res = await axios.post(`${API}/profitability/calculate`, { ...inputs });
//       setCalcResult(res.data as CalcResult);
//       setTier(String(res.data.tier ?? "free"));
//     } catch (e) {
//       toast("Calculation failed", extractErr(e), "error");
//     } finally {
//       setCalcLoading(false);
//     }
//   }, [inputs, userId]);

//   const fetchScenarios = async () => {
//     if (!isPremium) { setUpgrade({ open: true, feature: "Scenario planner" }); return; }
//     setTabLoading(true);
//     try {
//       const res = await axios.post(`${API}/profitability/scenarios`, { ...inputs });
//       setScenarios(res.data.scenarios);
//       setSensitivity(res.data.sensitivity);
//     } catch (e: unknown) {
//       if ((e as { response?: { status?: number } })?.response?.status === 403)
//         setUpgrade({ open: true, feature: "Scenario planner" });
//     } finally { setTabLoading(false); }
//   };

//   const fetchMarketIntel = async () => {
//     if (!isPremium) { setUpgrade({ open: true, feature: "Market intelligence" }); return; }
//     setTabLoading(true);
//     try {
//       const res = await axios.get(`${API}/profitability/market-intel`, {
//         params: { category: inputs.category, marketplace: inputs.marketplace, selling_price: inputs.selling_price },
//       });
//       setMarketIntel(res.data as Record<string, unknown>);
//     } catch (e: unknown) {
//       if ((e as { response?: { status?: number } })?.response?.status === 403)
//         setUpgrade({ open: true, feature: "Market intelligence" });
//       else toast("Market data error", extractErr(e), "error");
//     } finally { setTabLoading(false); }
//   };

//   const fetchHealth = async () => {
//     if (!isPremium) { setUpgrade({ open: true, feature: "Business health" }); return; }
//     setTabLoading(true);
//     try {
//       const res = await axios.post(`${API}/profitability/health`, { ...inputs });
//       setHealthData(res.data as Record<string, unknown>);
//     } catch (e: unknown) {
//       if ((e as { response?: { status?: number } })?.response?.status === 403)
//         setUpgrade({ open: true, feature: "Business health" });
//     } finally { setTabLoading(false); }
//   };

//   const handleTab = (tab: typeof activeTab) => {
//     setActiveTab(tab);
//   };  

//   const inp = (key: keyof Inputs, value: number | string) => setInputs((p) => ({ ...p, [key]: value }));

//   const handleSave = () => {
//     if (!userId) {
//       toast("Not logged in", "Log in to save products.", "error");
//       return;
//     }
//     if (saveLimit === 0) { setUpgrade({ open: true, feature: "Save products" }); return; }
//     if (savedProducts.length >= saveLimit) {
//       toast("Limit reached", `Upgrade to save more than ${saveLimit} products.`, "error");
//       return;
//     }
//     setSaveModal(true);
//   };

//   const confirmSave = async () => {
//     if (!saveName.trim() || !calcResult || !userId) return;
//     setSavingProduct(true);
//     try {
//       const res = await axios.post(`${API}/profitability/saved`, {
//         name:          saveName.trim(),
//         inputs:        inputs,
//         calc_snapshot: calcResult,
//       });
//       setSaved((p) => [res.data as SavedProductDB, ...p]);
//       setSaveModal(false);
//       setSaveName("");
//       toast("Saved!", `"${saveName}" saved to your account.`, "success");
//     } catch (e: unknown) {
//       const status = (e as { response?: { status?: number } })?.response?.status;
//       if (status === 403) {
//         setUpgrade({ open: true, feature: "Save products" });
//       } else {
//         toast("Save failed", extractErr(e), "error");
//       }
//     } finally {
//       setSavingProduct(false);
//     }
//   };

//   const waterfallData = useMemo(() => {
//     if (!calcResult?.cost_breakdown) return [];
//     const bd = calcResult.cost_breakdown;
//     return [
//       { name: "Product cost",   value: Number(bd.product_cost    || 0), color: WATERFALL_COLORS.product_cost },
//       { name: "Shipping → FBA", value: Number(bd.shipping_to_fba || 0), color: WATERFALL_COLORS.shipping_to_fba },
//       { name: "FBA fee",        value: Number(bd.fba_fee         || 0), color: WATERFALL_COLORS.fba_fee },
//       { name: "Referral fee",   value: Number(bd.referral_fee    || 0), color: WATERFALL_COLORS.referral_fee },
//       { name: "Ad spend",       value: Number(bd.ad_spend        || 0), color: WATERFALL_COLORS.ad_spend },
//       { name: "Storage",        value: Number(bd.storage_fee     || 0), color: WATERFALL_COLORS.storage_fee },
//       { name: "Returns",        value: Number(bd.return_cost     || 0), color: WATERFALL_COLORS.return_cost },
//     ].filter((d) => d.value > 0);
//   }, [calcResult]);

//   const bench = marketIntel?.benchmarks as Record<string, unknown> | undefined;

//   return (
//     <div className="space-y-6">
//       {/* Title Section */}
//       <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
//         <div>
//           <h1 className="text-xl sm:text-2xl font-bold text-sky-900">Profitability Optimizer</h1>
//           <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Real margins · Live market data</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Badge className={`text-xs font-semibold ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-blue-100 text-blue-800" : tier === "basic" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
//             {tier.toUpperCase()}
//           </Badge>
//           {calcResult && (
//             <Button size="sm" variant="outline" onClick={handleSave} className="flex items-center gap-1.5 text-xs" data-track-id="save-btn">
//               <Bookmark className="w-3.5 h-3.5" /> Save
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Upgrade Modal */}
//       {upgradeModal.open && (
//         <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
//             <div className="text-center">
//               <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
//                 <Lock className="h-7 w-7 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-slate-900 mb-1">{String(upgradeModal.feature)}</h3>
//               <p className="text-slate-500 text-sm mb-5">Upgrade to unlock this feature.</p>
//               <div className="grid grid-cols-2 gap-3 mb-5 text-left text-xs">
//                 {[
//                   { tier: "Basic · ₹1,999/mo", feats: ["Full cost waterfall", "ROI & ACOS tracking", "Smart alerts", "Return rate modelling", "AI chat"] },
//                   { tier: "Premium · ₹2,999/mo", feats: ["Scenario planner", "Live market intel", "Business health score", "AI full analysis", "Unlimited saves"] },
//                 ].map((plan) => (
//                   <div key={plan.tier} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
//                     <p className="font-semibold text-slate-700 mb-2">{plan.tier}</p>
//                     {plan.feats.map((f) => (
//                       <p key={f} className="text-slate-500 flex items-center gap-1 mb-0.5">
//                         <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {f}
//                       </p>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//               <div className="flex gap-3">
//                 <Button variant="outline" className="flex-1" onClick={() => setUpgrade({ open: false, feature: "" })}>Cancel</Button>
//                 <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white" onClick={() => (window.location.href = "/subscription")}>
//                   <Crown className="w-4 h-4 mr-1" /> Upgrade Now
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Save Modal */}
//       {saveModal && (
//         <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
//             <h3 className="text-lg font-bold text-slate-900 mb-1">Save product</h3>
//             <p className="text-xs text-slate-400 mb-4">
//               Saved to your account · accessible on any device
//             </p>
//             <input
//               type="text"
//               value={saveName}
//               onChange={(e) => setSaveName(e.target.value)}
//               placeholder="e.g. Phone stand — Delhi supplier"
//               className="w-full p-3 border border-slate-300 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
//               onKeyDown={(e) => e.key === "Enter" && !savingProduct && confirmSave()}
//               autoFocus
//             />
//             {calcResult && (
//               <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 text-xs text-slate-500 space-y-1">
//                 <div className="flex justify-between">
//                   <span>Profit / unit</span>
//                   <span className="font-semibold text-slate-700">{inr(calcResult.profit_per_unit)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Net margin</span>
//                   <span className="font-semibold text-slate-700">{pct(calcResult.net_margin_pct)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Monthly profit</span>
//                   <span className="font-semibold text-slate-700">{inr(calcResult.monthly_profit)}</span>
//                 </div>
//               </div>
//             )}
//             <div className="flex gap-3">
//               <Button variant="outline" className="flex-1" onClick={() => setSaveModal(false)} disabled={savingProduct}>
//                 Cancel
//               </Button>
//               <Button
//                 className="flex-1 bg-blue-600 text-white"
//                 onClick={confirmSave}
//                 disabled={!saveName.trim() || savingProduct}
//               >
//                 {savingProduct ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...</> : "Save"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toasts */}
//       <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
//         {toasts.map((t) => (
//           <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 backdrop-blur-none ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
//             {t.variant === "success" ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
//             <div className="flex-1">
//               <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{String(t.title)}</p>
//               <p className={`text-xs mt-0.5 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{String(t.description)}</p>
//             </div>
//             <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}><X className="w-4 h-4 text-slate-400" /></button>
//           </div>
//         ))}
//       </div>

//       {/* Tab bar */}
//       <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//         <CardContent className="p-0">
//           <div className="flex border-b border-slate-200 overflow-x-auto">
//             {([
//               { id: "calc",     label: "Calculator",   icon: <Calculator className="w-4 h-4" />,  min: "free"    },
//               { id: "scenario", label: "Scenarios",    icon: <BarChart3 className="w-4 h-4" />,   min: "premium" },
//               { id: "market",   label: "Market intel", icon: <TrendingUp className="w-4 h-4" />,  min: "premium" },
//               { id: "health",   label: "Health",       icon: <Activity className="w-4 h-4" />,    min: "premium" },
//               { id: "ai",       label: "AI Advisor",   icon: <Bot className="w-4 h-4" />,         min: "basic"   },
//             ] as { id: string; label: string; icon: JSX.Element; min: string }[]).map((tab) => {
//               const locked = (tab.min === "premium" && !isPremium) || (tab.min === "basic" && !isBasicPlus);
//               return (
//                 <button key={tab.id}
//                   onClick={() => locked ? setUpgrade({ open: true, feature: tab.label }) : handleTab(tab.id as typeof activeTab)}
//                   className={`flex-1 min-w-[80px] py-3.5 px-3 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"}`}
//                   data-track-id="profit_tab_btn"
//                   data-filter-value={tab.id}
//                 >
//                   {tab.icon}
//                   <span className="hidden sm:inline">{tab.label}</span>
//                   {locked && <Lock className="w-3 h-3 text-amber-500" />}
//                 </button>
//               );
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       {/* ══ CALCULATOR ══════════════════════════════════════════════════ */}
//       {activeTab === "calc" && (
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//           <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
//             <CardHeader className="pb-3">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-base flex items-center gap-2">
//                   <Calculator className="w-4 h-4 text-blue-500" /> Cost inputs
//                 </CardTitle>
//                 {calcLoading && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-0.5 pt-0">
//               {/* Specific Product Research */}
//               <div className="bg-sky-50/50 border border-sky-100/80 p-3.5 rounded-2xl mb-4 space-y-2.5">
//                 <label className="text-[10px] font-black text-sky-700 uppercase tracking-widest block">
//                   Specific Product Research
//                 </label>
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
//                     <input
//                       type="text"
//                       placeholder="e.g. Bamboo Desk Organizer"
//                       className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
//                       value={nicheKeyword}
//                       onChange={(e) => setNicheKeyword(e.target.value)}
//                       onKeyDown={(e) => e.key === "Enter" && handleNicheAutofill()}
//                     />
//                   </div>
//                   <Button
//                     size="sm"
//                     disabled={fetchingNiche || !nicheKeyword.trim()}
//                     onClick={handleNicheAutofill}
//                     className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl px-4 h-9 shadow-sm transition-all"
//                   >
//                     {fetchingNiche ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Search"}
//                   </Button>
//                 </div>
//                 <p className="text-[10px] text-slate-400 leading-normal">
//                   Enter a product concept to dynamically populate optimal selling price, monthly volume, and estimated FBA fees from live competitor data.
//                 </p>
//               </div>

//               <div className="mb-3">
//                 <label className="text-xs text-slate-500 block mb-1">Marketplace</label>
//                 <select value={inputs.marketplace} onChange={(e) => inp("marketplace", e.target.value)}
//                   className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
//                   data-track-id="marketplace_select"
//                   data-filter-value={inputs.marketplace}
//                 >
//                   <option value="amazon">Amazon</option>
//                   <option value="flipkart">Flipkart</option>
//                 </select>
//               </div>

//               <div className="h-px bg-slate-100 my-2" />
//               <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Core pricing</p>

//               <SliderRow label="Selling price"   value={inputs.selling_price}     min={100}  max={Math.max(10000, Math.ceil(inputs.selling_price * 1.5 / 5000) * 5000)} step={50}  format={inr}           onChange={(v) => inp("selling_price", v)} />
//               <SliderRow label="Product cost"    value={inputs.product_cost}      min={50}   max={Math.max(5000, Math.ceil(inputs.product_cost * 1.5 / 1000) * 1000)}  step={25}  format={inr}           onChange={(v) => inp("product_cost", v)} />
//               <SliderRow label="Shipping to FBA" value={inputs.shipping_to_fba}   min={0}    max={Math.max(800, Math.ceil(inputs.shipping_to_fba * 2 / 100) * 100)}   step={10}  format={inr}           onChange={(v) => inp("shipping_to_fba", v)} />
//               <SliderRow label="FBA fee"         value={inputs.fba_fee}           min={0}    max={Math.max(600, Math.ceil(inputs.fba_fee * 2 / 100) * 100)}   step={10}  format={inr}           onChange={(v) => inp("fba_fee", v)} />
//               <SliderRow label="Ad spend / unit" value={inputs.ad_spend_per_unit} min={0}    max={Math.max(800, Math.ceil(inputs.ad_spend_per_unit * 2 / 100) * 100)}   step={5}   format={inr}           onChange={(v) => inp("ad_spend_per_unit", v)} />
//               <SliderRow label="Monthly units"   value={inputs.monthly_units}     min={10}   max={Math.max(5000, Math.ceil(inputs.monthly_units * 1.5 / 500) * 500)}  step={10}  format={(v) => `${v}`} onChange={(v) => inp("monthly_units", v)} />
//               <SliderRow label={`Referral (${Number(inputs.referral_fee_pct).toFixed(0)}%)`} value={inputs.referral_fee_pct} min={1} max={25} step={0.5} format={pct} onChange={(v) => inp("referral_fee_pct", v)} />

//               <div className="h-px bg-slate-100 my-2" />
//               <div className="flex items-center justify-between mb-1.5">
//                 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Advanced</p>
//                 {!isBasicPlus && (
//                   <span onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}
//                     className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-200 transition-colors">Basic+</span>
//                 )}
//               </div>
//               <SliderRow label="Return rate"    value={inputs.return_rate_pct}      min={0} max={40}  step={1} format={pct} locked={!isBasicPlus} onChange={(v) => inp("return_rate_pct", v)} />
//               <SliderRow label="Storage / unit" value={inputs.storage_fee_per_unit} min={0} max={150} step={2} format={inr} locked={!isBasicPlus} onChange={(v) => inp("storage_fee_per_unit", v)} />
//               {!isBasicPlus && (
//                 <button onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}
//                   className="w-full mt-3 py-2 text-xs text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5">
//                   <Lock className="w-3.5 h-3.5" /> Unlock — Basic ₹1,999/mo
//                 </button>
//               )}
//             </CardContent>
//           </Card>

//           <div className="lg:col-span-3 space-y-4">
//             {calcResult && (
//               <>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                   {([
//                     { label: "Profit / unit",  val: inr(Number(calcResult.profit_per_unit)),  cls: Number(calcResult.profit_per_unit) > 0 ? (Number(calcResult.net_margin_pct) > 20 ? "text-green-600" : "text-amber-600") : "text-red-600" },
//                     { label: "Net margin",     val: pct(Number(calcResult.net_margin_pct)),   cls: Number(calcResult.net_margin_pct) > 20 ? "text-green-600" : Number(calcResult.net_margin_pct) > 10 ? "text-amber-600" : "text-red-600" },
//                     { label: "Monthly profit", val: inr(Number(calcResult.monthly_profit)),   cls: "text-blue-600", sub: calcResult.yearly_profit ? "~" + inr(Number(calcResult.yearly_profit)) + "/yr" : undefined },
//                     { label: "Break-even",     val: String(Number(calcResult.breakeven_units) || 0) + " units", cls: "text-slate-700" },
//                     { label: "ROI",            val: calcResult.roi_pct !== undefined ? pct(Number(calcResult.roi_pct)) : "—", cls: "text-purple-600", locked: !isBasicPlus },
//                     { label: "True ACOS",      val: calcResult.acos_pct !== undefined ? pct(Number(calcResult.acos_pct)) : "—", cls: calcResult.acos_pct !== undefined && Number(calcResult.acos_pct) > 20 ? "text-amber-600" : "text-slate-700", locked: !isBasicPlus },
//                   ] as { label: string; val: string; cls: string; sub?: string; locked?: boolean }[]).map((m, i) => (
//                     <div key={i} className={`relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm ${m.locked ? "overflow-hidden" : ""}`}>
//                       <p className="text-xs text-slate-400 mb-1">{m.label}</p>
//                       <p className={`text-xl font-black ${m.cls}`}>{m.val}</p>
//                       {m.sub && <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>}
//                       {m.locked && (
//                         <div className="absolute inset-0 bg-background backdrop-blur-none flex items-center justify-center cursor-pointer rounded-2xl"
//                           onClick={() => setUpgrade({ open: true, feature: m.label })}>
//                           <span className="text-xs text-amber-600 font-semibold flex items-center gap-1"><Lock className="w-3 h-3" /> Basic</span>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm flex items-center gap-2">
//                       Cost waterfall
//                       {!isBasicPlus && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Basic+</span>}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="pt-0">
//                     {isBasicPlus && waterfallData.length > 0 ? (
//                       <div className="space-y-2.5">
//                         {waterfallData.map((row) => {
//                           const sp = Number(calcResult.selling_price) || 1;
//                           const rowPct = Math.min((row.value / sp) * 100, 100);
//                           return (
//                             <div key={row.name} className="flex items-center gap-3">
//                               <span className="text-xs text-slate-500 w-28 shrink-0">{row.name}</span>
//                               <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
//                                 <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(rowPct * 2.5, 100)}%`, background: row.color }} />
//                               </div>
//                               <span className="text-xs font-semibold text-slate-700 w-14 text-right">{inr(row.value)}</span>
//                               <span className="text-xs text-slate-400 w-8 text-right">{rowPct.toFixed(0)}%</span>
//                             </div>
//                           );
//                         })}
//                         <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
//                           <span className="text-sm font-semibold text-slate-700">Profit / unit</span>
//                           <span className={`text-base font-black ${Number(calcResult.profit_per_unit) > 0 ? "text-green-600" : "text-red-600"}`}>
//                             {inr(Number(calcResult.profit_per_unit))} ({pct(Number(calcResult.net_margin_pct))})
//                           </span>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="relative min-h-[100px]">
//                         <div className="space-y-2 opacity-25 blur-sm pointer-events-none">
//                           {["Product cost", "FBA fee", "Referral fee", "Ad spend"].map((n) => (
//                             <div key={n} className="flex items-center gap-3">
//                               <span className="text-xs w-28 text-slate-400">{n}</span>
//                               <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-full rounded-full bg-slate-300" style={{ width: "55%" }} /></div>
//                             </div>
//                           ))}
//                         </div>
//                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
//                           <p className="text-sm font-semibold text-slate-700">Full cost breakdown</p>
//                           <button className="text-xs px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow"
//                             onClick={() => setUpgrade({ open: true, feature: "Cost waterfall" })}>Unlock — Basic ₹1,999/mo</button>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {isBasicPlus && calcResult.alerts && calcResult.alerts.length > 0 && (
//                   <div className="space-y-2">
//                     {calcResult.alerts.map((a, i) => <AlertBox key={i} type={String(a.type ?? "")} message={String(a.message ?? "")} />)}
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ══ SCENARIOS ════════════════════════════════════════════════════ */}
//       {activeTab === "scenario" && (
//         <div className="space-y-5">
//           {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">Building scenarios...</p></CardContent></Card>}
//           {!tabLoading && scenarios && (
//             <>
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                 {(scenarios as Record<string, unknown>[]).map((s, i) => (
//                   <Card key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
//                     <CardContent className="p-4">
//                       <div className="w-2 h-2 rounded-full mb-2" style={{ background: String(s.color ?? "#888") }} />
//                       <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: String(s.color ?? "#888") }}>{String(s.label ?? "")}</p>
//                       <p className={`text-2xl font-black ${Number(s.profit_per_unit) > 0 ? "text-slate-800" : "text-red-600"}`}>
//                         {inr(Number(s.profit_per_unit))}<span className="text-xs font-normal text-slate-400">/unit</span>
//                       </p>
//                       <p className={`text-sm font-semibold mt-1 ${Number(s.net_margin_pct) > 15 ? "text-green-600" : "text-amber-600"}`}>{pct(Number(s.net_margin_pct))} margin</p>
//                       <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
//                         <div className="flex justify-between"><span>Monthly</span><span className="font-semibold text-slate-700">{inr(Number(s.monthly_profit))}</span></div>
//                         <div className="flex justify-between"><span>Units</span><span className="font-semibold text-slate-700">{Number(s.units || 0).toLocaleString()}</span></div>
//                         <div className="flex justify-between"><span>ROI</span><span className="font-semibold text-slate-700">{pct(Number(s.roi_pct))}</span></div>
//                         <div className="flex justify-between"><span>ACOS</span><span className={`font-semibold ${Number(s.acos_pct) > 20 ? "text-amber-600" : "text-slate-700"}`}>{pct(Number(s.acos_pct))}</span></div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//               <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="text-sm">Price sensitivity — margin vs selling price</CardTitle>
//                   <CardDescription>How net margin changes across a ±30% price range</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={220}>
//                     <LineChart data={sensitivity} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                       <XAxis dataKey="price" tickFormatter={(v) => "₹" + (Number(v) / 1000).toFixed(1) + "k"} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
//                       <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
//                       <Tooltip contentStyle={CHART_STYLE} formatter={(v: unknown) => [Number(v).toFixed(1) + "%", "Net margin"]} labelFormatter={(v) => "Price: ₹" + String(v)} />
//                       <Line type="monotone" dataKey="margin_pct" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>
//             </>
//           )}
//         </div>
//       )}

//       {/* ══ MARKET INTEL ════════════════════════════════════════════════ */}
//       {activeTab === "market" && (
//         <div className="space-y-5">
//           {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">Fetching live market data from your DB...</p></CardContent></Card>}
//           {!tabLoading && marketIntel && bench && (
//             <>
//               <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl p-4 text-sm text-blue-800 font-medium">{String(marketIntel.insight ?? "")}</div>
//               {marketIntel.your_price_position && (
//                 <div className={`p-4 rounded-2xl text-sm font-semibold border-2 flex items-center gap-2 ${marketIntel.your_price_position === "Above market" ? "bg-purple-50 border-purple-300 text-purple-800" : marketIntel.your_price_position === "Below market" ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-300 text-green-800"}`}>
//                   <Target className="w-4 h-4 shrink-0" />
//                   Your price ({inr(Number(marketIntel.your_price))}) is {String(marketIntel.your_price_position ?? "")} in this category
//                 </div>
//               )}
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//                 {([
//                   { label: "Avg price",      val: inr(Number(bench.avg_price)) },
//                   { label: "Min price",       val: inr(Number(bench.min_price)) },
//                   { label: "Max price",       val: inr(Number(bench.max_price)) },
//                   { label: "Avg rating",      val: bench.avg_rating != null ? "★ " + Number(bench.avg_rating).toFixed(1) : "N/A" },
//                   { label: "Avg sales / mo",  val: bench.avg_sales_volume != null ? Math.round(Number(bench.avg_sales_volume)).toLocaleString() : "N/A" },
//                   { label: "MRP discount",    val: bench.mrp_discount_depth_pct != null ? Math.round(Number(bench.mrp_discount_depth_pct)) + "%" : "N/A" },
//                 ] as { label: string; val: string }[]).map((m, i) => (
//                   <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-center">
//                     <p className="text-xs text-slate-400 mb-1">{m.label}</p>
//                     <p className="text-base font-black text-slate-800">{m.val}</p>
//                   </div>
//                 ))}
//               </div>

//               <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                 <CardHeader className="pb-2"><CardTitle className="text-sm">Your price vs market</CardTitle></CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={180}>
//                     <BarChart data={[
//                       { name: "Market min", value: Number(bench.min_price ?? 0) },
//                       { name: "Your price", value: Number(inputs.selling_price) },
//                       { name: "Market avg", value: Number(bench.avg_price ?? 0) },
//                       { name: "Market max", value: Number(bench.max_price ?? 0) },
//                     ]} margin={{ left: 10, right: 10, top: 4, bottom: 4 }} barCategoryGap="30%">
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
//                       <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
//                       <YAxis tickFormatter={(v) => "₹" + (Number(v) / 1000).toFixed(0) + "k"} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
//                       <Tooltip contentStyle={CHART_STYLE} formatter={(v: unknown) => [inr(Number(v)), "Price"]} />
//                       <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
//                         {[0,1,2,3].map((i) => <Cell key={i} fill={["#94a3b8","#3b82f6","#f59e0b","#ef4444"][i]} />)}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>

//               {Array.isArray(marketIntel.price_bands) && (marketIntel.price_bands as unknown[]).length > 0 && (
//                 <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm">Price band whitespace — from your DB</CardTitle>
//                     <CardDescription>Green = fewer competitors · Red = crowded · Real data</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     {(marketIntel.price_bands as Record<string, unknown>[]).map((b, i) => {
//                       const opp = String(b.opportunity ?? "");
//                       const c = opp === "High" ? "#10b981" : opp === "Medium" ? "#f59e0b" : opp === "Low" ? "#3b82f6" : "#ef4444";
//                       const maxB = Math.max(...(marketIntel.price_bands as Record<string, unknown>[]).map((x) => Number(x.brand_count) || 0), 1);
//                       return (
//                         <div key={i} className="flex items-center gap-3">
//                           <span className="text-xs text-slate-600 w-40 shrink-0">{String(b.band ?? "")}</span>
//                           <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
//                             <div className="h-full rounded-full transition-all" style={{ width: `${(Number(b.brand_count) / maxB) * 100}%`, background: c }} />
//                           </div>
//                           <span className="text-xs text-slate-500 w-20 text-right">{String(b.brand_count ?? "0")} brands</span>
//                           <span className="text-xs font-semibold w-16 text-right" style={{ color: c }}>{opp}</span>
//                         </div>
//                       );
//                     })}
//                   </CardContent>
//                 </Card>
//               )}

//               {Array.isArray(bench.top_brands) && (bench.top_brands as unknown[]).length > 0 && (
//                 <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                   <CardHeader className="pb-2"><CardTitle className="text-sm">Top competitors in {String(inputs.category)} — {String(inputs.marketplace)}</CardTitle></CardHeader>
//                   <CardContent>
//                     <div className="flex flex-wrap gap-2">
//                       {(bench.top_brands as string[]).map((b, i) => (
//                         <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">#{i + 1} {String(b ?? "")}</span>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {/* ══ HEALTH ═══════════════════════════════════════════════════════ */}
//       {activeTab === "health" && (
//         <div className="space-y-5">
//           {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">Computing health score...</p></CardContent></Card>}
//           {!tabLoading && healthData && (
//             <>
//               <div className={`relative rounded-3xl p-6 text-white overflow-hidden ${Number(healthData.overall_score) > 75 ? "bg-gradient-to-r from-emerald-500 to-green-600" : Number(healthData.overall_score) > 50 ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
//                 <div className="flex items-center gap-6">
//                   <div className="shrink-0 text-center">
//                     <p className="text-5xl font-black">{Math.round(Number(healthData.overall_score) || 0)}</p>
//                     <p className="text-white/70 text-sm">/100</p>
//                   </div>
//                   <div>
//                     <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Business health</p>
//                     <p className="text-3xl font-black">{String(healthData.overall_label ?? "")}</p>
//                     <p className="text-white/80 text-sm mt-1">Based on margin, ACOS, returns, volume, and ROI</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                 <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                   <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-500" /> Metric breakdown</CardTitle></CardHeader>
//                   <CardContent className="space-y-4">
//                     {(healthData.metrics as Record<string, unknown>[]).map((m, i) => {
//                       const color = String(m.status) === "good" ? "#10b981" : String(m.status) === "warn" ? "#f59e0b" : "#ef4444";
//                       return (
//                         <div key={i}>
//                           <div className="flex items-center justify-between text-sm mb-1.5">
//                             <span className="text-slate-600 font-medium">{String(m.label ?? "")}</span>
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs text-slate-400">{String(m.detail ?? "")}</span>
//                               <span className="font-bold text-slate-800 w-8 text-right">{Math.round(Number(m.score) || 0)}</span>
//                             </div>
//                           </div>
//                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                             <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Number(m.score) || 0}%`, background: color }} />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                   <CardHeader className="pb-2"><CardTitle className="text-sm">Health radar</CardTitle></CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={230}>
//                       <RadarChart data={(healthData.metrics as Record<string, unknown>[]).map((m) => ({ subject: String(m.label ?? "").replace(" health","").replace(" risk","").replace(" momentum",""), value: Number(m.score) || 0 }))}>
//                         <PolarGrid stroke="#e2e8f0" />
//                         <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
//                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
//                         <Radar name="Health" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
//                       </RadarChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>
//               </div>

//               <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                 <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Action recommendations</CardTitle></CardHeader>
//                 <CardContent className="space-y-3">
//                   {(healthData.recommendations as Record<string, unknown>[]).map((r, i) => (
//                     <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
//                       <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow ${String(r.priority) === "high" || String(r.priority) === "critical" ? "bg-red-500" : "bg-amber-500"}`}>{i + 1}</div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 mb-1 flex-wrap">
//                           <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{String(r.area ?? "")}</span>
//                           <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${String(r.priority) === "high" || String(r.priority) === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{String(r.priority ?? "")}</span>
//                         </div>
//                         <p className="text-sm font-medium text-slate-800">{String(r.action ?? "")}</p>
//                         <p className="text-xs text-green-600 font-medium mt-1">💡 {String(r.impact ?? "")}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>
//             </>
//           )}
//         </div>
//       )}

//       {/* ══ AI ADVISOR ══════════════════════════════════════════════════ */}
//       {activeTab === "ai" && (
//         <AIPanel
//           calcResult={calcResult}
//           inputs={inputs}
//           scenarios={scenarios}
//           healthData={healthData}
//           isBasicPlus={isBasicPlus}
//           isPremium={isPremium}
//           userId={userId?.toString()}
//           onUpgrade={(feature: string) => setUpgrade({ open: true, feature })}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/lib/config";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Calculator, TrendingUp, BarChart3, Activity, Bot,
  Lock, Crown, CheckCircle, XCircle, X, RefreshCw,
  Bookmark, Target, ShieldCheck, Zap, Send, RotateCcw, AlertCircle, Search,
  Database,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const API = `${API_BASE_URL}/api`;

axios.defaults.withCredentials = true;

const getChartStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)",
  borderRadius: "12px",
  border: isDark ? "1.5px solid #1e293b" : "1.5px solid #e2e8f0",
  boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 14px",
  color: isDark ? "#f8fafc" : "#0f172a",
});

const WATERFALL_COLORS: Record<string, string> = {
  product_cost: "#3b82f6",
  shipping_to_fba: "#60a5fa",
  fba_fee: "#f59e0b",
  referral_fee: "#f97316",
  ad_spend: "#8b5cf6",
  storage_fee: "#6b7280",
  return_cost: "#ef4444",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Inputs {
  selling_price: number;
  product_cost: number;
  shipping_to_fba: number;
  fba_fee: number;
  ad_spend_per_unit: number;
  monthly_units: number;
  return_rate_pct: number;
  storage_fee_per_unit: number;
  referral_fee_pct: number;
  category: string;
  marketplace: string;
  your_brand: string;
}

interface CostBreakdown {
  product_cost: number;
  shipping_to_fba: number;
  fba_fee: number;
  referral_fee: number;
  ad_spend: number;
  storage_fee: number;
  return_cost: number;
}

interface CalcResult {
  selling_price: number;
  category: string;
  marketplace: string;
  tier: string;
  tier_features: Record<string, boolean | number>;
  profit_per_unit: number;
  net_margin_pct: number;
  monthly_profit: number;
  yearly_profit?: number;
  breakeven_units: number;
  total_cost: number;
  roi_pct?: number;
  acos_pct?: number;
  cost_breakdown?: CostBreakdown;
  alerts?: { type: string; message: string }[];
}

interface SavedProductDB {
  id: string;
  name: string;
  inputs: Inputs;
  calc_snapshot: CalcResult;
  profit_per_unit: number;
  net_margin_pct: number;
  monthly_profit: number;
  created_at: string;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

// ── Safe value helpers ────────────────────────────────────────────────────────

function inr(n: number | undefined | null): string {
  const num = Number(n);
  if (n === undefined || n === null || isNaN(num)) return "—";
  return "₹" + Math.round(Math.abs(num)).toLocaleString("en-IN");
}

function pct(n: number | undefined | null): string {
  const num = Number(n);
  if (n === undefined || n === null || isNaN(num)) return "—";
  return num.toFixed(1) + "%";
}

function str(v: unknown): string {
  if (v === undefined || v === null) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function extractErr(e: unknown): string {
  const err = e as Record<string, unknown>;
  const detail = (err?.response as Record<string, unknown>)?.data
    ? ((err.response as Record<string, unknown>).data as Record<string, unknown>)?.detail
    : undefined;
  if (detail === undefined || detail === null) {
    return (err?.message as string) ?? "Something went wrong.";
  }
  if (Array.isArray(detail)) {
    return detail
      .map((x: unknown) =>
        x !== null && typeof x === "object"
          ? ((x as Record<string, unknown>).msg as string) ?? "error"
          : String(x)
      )
      .join(", ");
  }
  if (typeof detail === "object") {
    const d = detail as Record<string, unknown>;
    return (d.message as string) ?? (d.msg as string) ?? "Error";
  }
  return String(detail);
}

// ── useOllamaStream ───────────────────────────────────────────────────────────

function useOllamaStream() {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (url: string, body: object) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setText("");
    setError(null);
    setStreaming(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const code = (errData as Record<string, unknown>)?.detail;
        const codeStr =
          code !== null && typeof code === "object"
            ? ((code as Record<string, unknown>).error as string) ?? "request_failed"
            : "request_failed";
        setError(codeStr);
        setStreaming(false);
        return;
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const token = JSON.parse(data);
            setText((prev) => prev + token);
          } catch {
            setText((prev) => prev + data);
          }
        }
      }
    } catch (e: unknown) {
      if ((e as { name?: string })?.name !== "AbortError") setError("stream_interrupted");
    } finally {
      setStreaming(false);
    }
  }, []);

  const stop = useCallback(() => { abortRef.current?.abort(); setStreaming(false); }, []);
  const reset = useCallback(() => { setText(""); setError(null); }, []);
  return { streaming, text, error, start, stop, reset };
}

// ── AlertBox ──────────────────────────────────────────────────────────────────

function AlertBox({ type, message }: { type: string; message: string }) {
  const styles: Record<string, string> = {
    danger:  "bg-red-50 dark:bg-red-950/20 border-red-400 dark:border-red-900/50 text-red-800 dark:text-red-400",
    warn:    "bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-900/50 text-amber-800 dark:text-amber-400",
    success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-450",
  };
  const icons: Record<string, JSX.Element> = {
    danger:  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    warn:    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />,
  };
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border-l-4 text-sm ${styles[type] ?? styles.warn}`}>
      {icons[type] ?? icons.warn}
      <span>{String(message ?? "")}</span>
    </div>
  );
}

// ── SliderRow ─────────────────────────────────────────────────────────────────

function SliderRow({
  label, value, min, max, step, format, locked, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; format: (v: number) => string; locked?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-3 py-1.5 ${locked ? "opacity-40 pointer-events-none" : ""}`}>
      <label className="text-xs text-slate-500 dark:text-slate-400 w-24 sm:w-36 shrink-0 flex items-center gap-1 truncate">
        {label}
        {locked && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} disabled={locked}
        className="flex-1 min-w-0 accent-blue-500 dark:accent-sky-500 h-1.5 dark:bg-slate-850"
        data-track-id={`${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_input`} />
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-14 sm:w-16 text-right tabular-nums shrink-0">
        {format(value)}
      </span>
    </div>
  );
}

// ── AIPanel ───────────────────────────────────────────────────────────────────

function AIPanel({
  calcResult, inputs, scenarios, healthData,
  isBasicPlus, isPremium, userId, onUpgrade,
}: {
  calcResult: CalcResult | null;
  inputs: Inputs;
  scenarios: unknown[] | null;
  healthData: Record<string, unknown> | null;
  isBasicPlus: boolean;
  isPremium: boolean;
  userId?: string;
  onUpgrade: (f: string) => void;
}) {
  const { t } = useTranslation();
  type AIStatus = {
    status?: string;
    model?: string;
    setup_hint?: string;
  };

  const [aiMounted, setAiMounted] = useState(false);
  useEffect(() => { setAiMounted(true); }, []);
  const { resolvedTheme: aiTheme } = useTheme();
  const isDark = aiMounted && aiTheme === "dark";

  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [pendingChat, setPendingChat] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"analyze" | "chat" | "scenario" | "health">("analyze");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const analyzeStream  = useOllamaStream();
  const chatStream     = useOllamaStream();
  const scenarioStream = useOllamaStream();
  const healthStream   = useOllamaStream();

  useEffect(() => {
    fetch(`${API}/profitability/ai/status`).then((r) => r.json()).then(setAiStatus).catch(() => {});
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatStream.text, chatHistory]);

  useEffect(() => {
    if (!chatStream.streaming && chatStream.text && pendingChat) {
      setChatHistory((h) => [...h, { role: "assistant", content: chatStream.text }]);
      setPendingChat(null);
    }
  }, [chatStream.streaming]);

  const ready = aiStatus?.status === "ready";

  const runAnalyze = () => {
    if (!isPremium) { onUpgrade("AI full analysis"); return; }
    analyzeStream.reset();
    analyzeStream.start(`${API}/profitability/ai/analyze`, { calc_result: calcResult ?? {}, inputs, user_id: userId });
  };

  const runChat = async () => {
    if (!isBasicPlus) { onUpgrade("AI advisor chat"); return; }
    const q = chatInput.trim();
    if (!q || chatStream.streaming) return;
    setChatInput("");
    setChatHistory((h) => [...h, { role: "user", content: q }]);
    setPendingChat(q);
    chatStream.reset();
    await chatStream.start(`${API}/profitability/ai/chat`, {
      question: q, calc_context: { ...calcResult, ...inputs }, history: chatHistory, user_id: userId,
    });
  };

  const runScenario = () => {
    if (!isPremium) { onUpgrade("Scenario AI advice"); return; }
    scenarioStream.reset();
    scenarioStream.start(`${API}/profitability/ai/scenario-advice`, { scenarios: scenarios ?? [], base_inputs: inputs, user_id: userId });
  };

  const runHealth = () => {
    if (!isPremium) { onUpgrade("Health action plan"); return; }
    healthStream.reset();
    healthStream.start(`${API}/profitability/ai/health-advice`, { health_data: healthData ?? {}, inputs, user_id: userId });
  };

  const statusColor = aiStatus?.status === "ready" ? "bg-green-400" : aiStatus?.status === "no_model" ? "bg-amber-400" : "bg-red-400";

  function StreamBox({ stream }: { stream: ReturnType<typeof useOllamaStream> }) {
    return (
      <div className="mt-3 min-h-16 max-h-80 overflow-y-auto bg-white dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        {stream.streaming && !stream.text && (
          <span className="text-slate-400 dark:text-slate-500 text-xs animate-pulse">Insydz is thinking...</span>
        )}
        {(stream.text || stream.streaming) && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 leading-relaxed">
            <ReactMarkdown>{stream.text}</ReactMarkdown>
            {stream.streaming && <span className="animate-pulse text-violet-500">▌</span>}
          </div>
        )}
        {stream.error === "upgrade_required" && (
          <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Available on Premium plan. Upgrade to unlock.</span>
        )}
        {stream.error === "ollama_offline" && (
          <span className="text-red-600 dark:text-red-400 text-xs font-medium">AI is temporarily unavailable. Please try again shortly.</span>
        )}
        {stream.error === "stream_interrupted" && (
          <span className="text-red-600 dark:text-red-400 text-xs font-medium">Analysis interrupted. Retry to continue — no data lost.</span>
        )}
        {stream.error && !["upgrade_required", "ollama_offline", "stream_interrupted"].includes(stream.error) && (
          <span className="text-red-600 dark:text-red-400 text-xs font-medium">Couldn't complete analysis. Please try again.</span>
        )}
      </div>
    );
  }

  const MODES = [
    { id: "analyze",  label: t('profitabilityOptimizer.ai.fullAnalysis', 'Full analysis'),     tier: "premium" as const },
    { id: "chat",     label: t('profitabilityOptimizer.ai.askAnything', 'Ask anything'),       tier: "basic"   as const },
    { id: "scenario", label: t('profitabilityOptimizer.ai.scenarioAdvice', 'Scenario advice'),    tier: "premium" as const },
    { id: "health",   label: t('profitabilityOptimizer.ai.healthActionPlan', 'Health action plan'), tier: "premium" as const },
  ];

  const QUICK_Q = ["How do I reduce my ACOS?", "Should I raise price by 10%?", "What's eating my margin most?", "How do I hit 25% margin?"];

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap">
        {MODES.map((m) => {
          const locked = m.tier === "premium" ? !isPremium : !isBasicPlus;
          return (
            <button key={m.id}
              onClick={() => locked ? onUpgrade(m.label) : setActiveMode(m.id as typeof activeMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                activeMode === m.id
                  ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/30"
                  : locked
                  ? isDark ? "bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : isDark ? "bg-slate-800 text-slate-300 border-slate-700 hover:border-violet-500 hover:text-white" : "bg-white text-slate-600 border-slate-200 hover:border-violet-400 hover:text-violet-700"
              }`}
              data-track-id="ai_advisor_mode_btn"
              data-filter-value={m.id}
            >
              {locked && <span className="text-amber-500 text-[10px]">🔒</span>}
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Full analysis */}
      {activeMode === "analyze" && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.ai.fullAnalysisTitle', 'Full profitability analysis')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('profitabilityOptimizer.ai.fullAnalysisDesc', '4 recommendations from your exact numbers')}</p>
            </div>
            <div className="flex gap-2">
              {analyzeStream.text && (
                <button onClick={analyzeStream.reset} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" data-track-id="ai_run_analysis_clear_btn">
                  Clear
                </button>
              )}
              <button
                onClick={runAnalyze}
                disabled={analyzeStream.streaming || !calcResult || !ready}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white text-xs rounded-xl font-medium transition-all"
                data-track-id="ai_run_analysis_btn"
              >
                {analyzeStream.streaming ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t('profitabilityOptimizer.ai.analyzing', 'Analyzing...')}</> : `✦ ${t('profitabilityOptimizer.ai.runAnalysisBtn', 'Run analysis')}`}
              </button>
            </div>
          </div>
          {analyzeStream.text || analyzeStream.streaming || analyzeStream.error ? (
            <StreamBox stream={analyzeStream} />
          ) : (
            <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-slate-400 dark:text-slate-500 text-xs">{t('profitabilityOptimizer.ai.clickRunAnalysis', 'Click "Run analysis" for AI recommendations')}</p>
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      {activeMode === "chat" && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-h-72 overflow-y-auto space-y-3 mb-4">
            {chatHistory.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-slate-400 dark:text-slate-500 text-xs mb-3">{t('profitabilityOptimizer.ai.askAnythingAbout', 'Ask anything about your product\'s numbers')}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_Q.map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:text-violet-700 dark:hover:text-violet-300 transition-colors border border-slate-200 dark:border-slate-700"
                      data-track-id="ai_chat_quick_q_btn"
                      data-filter-value={q}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed rounded-2xl ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{String(msg.content ?? "")}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {(chatStream.streaming || pendingChat) && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {chatStream.text ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{chatStream.text}</ReactMarkdown>
                      {chatStream.streaming && <span className="animate-pulse text-violet-500">▌</span>}
                    </div>
                  ) : (
                    <span className="animate-pulse text-slate-400 dark:text-slate-500">▌</span>
                  )}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runChat(); } }}
              placeholder={t('profitabilityOptimizer.ai.chatPlaceholder', 'Ask about your margins, pricing, ads...')}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              data-track-id="ai_chat_input"
            />
            <button
              onClick={runChat}
              disabled={chatStream.streaming || !chatInput.trim() || !ready}
              className="px-3 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl transition-all"
              data-track-id="ai_chat_submit_btn"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            {chatHistory.length > 0 && (
              <button
                onClick={() => { setChatHistory([]); chatStream.reset(); setPendingChat(null); }}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs transition-colors"
                data-track-id="ai_chat_clear_btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scenario advice */}
      {activeMode === "scenario" && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.ai.whichStrategy', 'Which strategy should I pick?')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('profitabilityOptimizer.ai.scenarioDesc', 'AI compares your 4 scenarios and recommends one')}</p>
            </div>
            <button
              onClick={runScenario}
              disabled={scenarioStream.streaming || !scenarios || !ready}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white text-xs rounded-xl font-medium transition-all"
              data-track-id="ai_get_scenario_advice_btn"
            >
              {scenarioStream.streaming ? t('profitabilityOptimizer.ai.thinking', 'Thinking...') : `✦ ${t('profitabilityOptimizer.ai.getAdvice', 'Get advice')}`}
            </button>
          </div>
          {!scenarios && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              {t('profitabilityOptimizer.ai.openScenariosFirst', 'Open the Scenarios tab first to generate data.')}
            </p>
          )}
          {(scenarioStream.text || scenarioStream.streaming || scenarioStream.error) && (
            <StreamBox stream={scenarioStream} />
          )}
        </div>
      )}

      {/* Health advice */}
      {activeMode === "health" && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.ai.healthPlan', '5-step health improvement plan')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('profitabilityOptimizer.ai.healthDesc', 'AI turns your health score into a prioritized action plan')}</p>
            </div>
            <button
              onClick={runHealth}
              disabled={healthStream.streaming || !healthData || !ready}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white text-xs rounded-xl font-medium transition-all"
              data-track-id="ai_build_health_plan_btn"
            >
              {healthStream.streaming ? t('profitabilityOptimizer.ai.thinking', 'Thinking...') : `✦ ${t('profitabilityOptimizer.ai.buildPlan', 'Build plan')}`}
            </button>
          </div>
          {!healthData && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              {t('profitabilityOptimizer.ai.openHealthFirst', 'Open the Business Health tab first.')}
            </p>
          )}
          {(healthStream.text || healthStream.streaming || healthStream.error) && (
            <StreamBox stream={healthStream} />
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function ProfitabilityOptimizer() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  const [inputs, setInputs] = useState<Inputs>({
    selling_price: 2999, product_cost: 850, shipping_to_fba: 180, fba_fee: 200,
    ad_spend_per_unit: 120, monthly_units: 300, return_rate_pct: 5,
    storage_fee_per_unit: 15, referral_fee_pct: 9, category: "Baby Products",
    marketplace: "amazon", your_brand: "",
  });

  const [categories, setCategories]   = useState<string[]>([]);
  const [activeTab, setActiveTab]     = useState<"calc" | "scenario" | "market" | "health" | "ai">("calc");
  const [calcResult, setCalcResult]   = useState<CalcResult | null>(null);
  const [scenarios, setScenarios]     = useState<unknown[] | null>(null);
  const [sensitivity, setSensitivity] = useState<Record<string, unknown>[]>([]);
  const [marketIntel, setMarketIntel] = useState<Record<string, unknown> | null>(null);
  const [healthData, setHealthData]   = useState<Record<string, unknown> | null>(null);
  const [tier, setTier]               = useState("free");
  const [calcLoading, setCalcLoading] = useState(false);
  const [tabLoading, setTabLoading]   = useState(false);

  const [savedProducts, setSaved]         = useState<SavedProductDB[]>([]);
  const [saveModal, setSaveModal]         = useState(false);
  const [saveName, setSaveName]           = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  const [upgradeModal, setUpgrade] = useState({ open: false, feature: "" });
  const [toasts, setToasts]        = useState<Toast[]>([]);

  // Niche search state
  const [nicheKeyword, setNicheKeyword]       = useState("");
  const [fetchingNiche, setFetchingNiche]     = useState(false);
  const [nicheDataSource, setNicheDataSource] = useState<"db" | "ai_estimate" | null>(null);
  const [nicheProductCount, setNicheProductCount] = useState<number>(0);
  const [nicheConfidence, setNicheConfidence] = useState<string>("");

  const isBasicPlus = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium   = tier === "premium" || tier === "enterprise";
  const saveLimit   = tier === "free" ? 0 : tier === "basic" ? 5 : 9999;

  const toast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description, variant }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };

  const fetchSavedProducts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API}/profitability/saved`);
      setSaved(res.data as SavedProductDB[]);
    } catch {
      // silent
    }
  }, [userId]);

  useEffect(() => {
    fetchCategories(inputs.marketplace);
    if (userId) {
      fetchTierInfo();
      fetchSavedProducts();
    }
  }, [userId]);

  useEffect(() => { fetchCategories(inputs.marketplace); setMarketIntel(null); }, [inputs.marketplace]);
  useEffect(() => {
    setScenarios(null);
    setMarketIntel(null);
    setHealthData(null);
  }, [inputs]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab === "scenario" && isPremium) fetchScenarios();
      if (activeTab === "market"   && isPremium) fetchMarketIntel();
      if (activeTab === "health"   && isPremium) fetchHealth();
    }, 500);
    return () => clearTimeout(t);
  }, [inputs, activeTab]);

  const fetchCategories = async (marketplace: string) => {
    try {
      const res = await axios.get(`${API}/profitability/categories`, { params: { marketplace } });
      const cats: string[] = res.data.categories ?? [];
      setCategories(cats);
      if (cats.length > 0) {
        setInputs((p) => {
          const hasBaby    = cats.includes("Baby Products");
          const defaultCat = hasBaby ? "Baby Products" : (cats[0] || "");
          const currentValid = p.category && cats.includes(p.category);
          return { ...p, category: currentValid ? p.category : defaultCat };
        });
      }
    } catch { /* silent */ }
  };

  // ── Niche autofill — prices come exclusively from real DB data ────────────
  const handleNicheAutofill = async () => {
    if (!nicheKeyword.trim()) return;
    setFetchingNiche(true);
    setNicheDataSource(null);
    setNicheProductCount(0);
    setNicheConfidence("");

    try {
      const res = await axios.post(`${API}/profitability/niche-research`, {
        product_name: nicheKeyword.trim(),
        category: "All",
        source: inputs.marketplace,
        base_cost: 0,
        user_email: user?.email || null,
      });

      if (res.data?.success && res.data?.data) {
        const item             = res.data.data;
        const pricing          = item.pricing || {};
        const recommendedPrice: number = pricing.recommended_price || 0;
        const dataSource: "db" | "ai_estimate" = item.data_source || "db";
        const productCount: number = pricing.product_count || item.similar_products?.length || 0;
        const confidence: string   = pricing.confidence || "";

        setNicheDataSource(dataSource);
        setNicheProductCount(productCount);
        setNicheConfidence(confidence);

        // Guard: if the backend couldn't compute a real price, stop here
        if (recommendedPrice <= 0) {
          toast(
            "No price data",
            "Competitors found but couldn't compute a reliable price. Try a more specific keyword.",
            "error"
          );
          return;
        }

        // Parse monthly sales from range string e.g. "240 - 360"
        let monthlySales = 300;
        const salesStr   = item.sales?.estimated_monthly_sales || "";
        const rangeMatch = salesStr.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/);
        if (rangeMatch) {
          const lo = parseInt(rangeMatch[1].replace(/,/g, ""));
          const hi = parseInt(rangeMatch[2].replace(/,/g, ""));
          monthlySales = Math.round((lo + hi) / 2);
        } else {
          const single = parseInt(salesStr.replace(/,/g, ""));
          if (!isNaN(single) && single > 0) monthlySales = single;
        }

        // Category-aware cost ratios — only applied once we have a real DB price
        const cat           = (item.category || inputs.category).toLowerCase();
        const isElectronics = /electronic|laptop|phone|mobile|gadget|camera|tablet|audio/.test(cat);
        const isApparel     = /cloth|fashion|apparel|wear|shirt|dress|shoe/.test(cat);

        const cogsPct     = isElectronics ? 0.35 : isApparel ? 0.25 : 0.30;
        const fbaPct      = isElectronics ? 0.10 : 0.08;
        const shippingPct = 0.03;
        const adsPct      = isElectronics ? 0.08 : 0.10;

        const calculatedCost     = Math.max(50, Math.round(recommendedPrice * cogsPct));
        const calculatedFba      = Math.max(30, Math.round(recommendedPrice * fbaPct));
        const calculatedShipping = Math.max(20, Math.round(recommendedPrice * shippingPct));
        const calculatedAdSpend  = Math.max(20, Math.round(recommendedPrice * adsPct));

        setInputs((prev) => ({
          ...prev,
          category:          item.category || prev.category,
          selling_price:     recommendedPrice,
          product_cost:      calculatedCost,
          shipping_to_fba:   calculatedShipping,
          fba_fee:           calculatedFba,
          ad_spend_per_unit: calculatedAdSpend,
          monthly_units:     monthlySales,
        }));

        const sourceLabel =
          dataSource === "db"
            ? `${productCount} live competitor${productCount !== 1 ? "s" : ""} analysed`
            : "AI estimate — verify before use";

        toast(
          "Niche loaded",
          `₹${recommendedPrice.toLocaleString("en-IN")} · ${monthlySales} units/mo · ${sourceLabel}`,
          "success"
        );
      } else {
        toast(
          "No results",
          res.data?.message || "No competitor products found. Try a different keyword.",
          "error"
        );
      }
    } catch (e) {
      toast("Search failed", extractErr(e), "error");
    } finally {
      setFetchingNiche(false);
    }
  };

  const fetchTierInfo = async () => {
    try {
      const res = await axios.get(`${API}/profitability/tier-info`);
      setTier(String(res.data.tier ?? "free"));
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (!inputs.category) return;
    const t = setTimeout(runCalculate, 420);
    return () => clearTimeout(t);
  }, [inputs]);

  const runCalculate = useCallback(async () => {
    if (!inputs.category) return;
    setCalcLoading(true);
    try {
      const res = await axios.post(`${API}/profitability/calculate`, { ...inputs });
      setCalcResult(res.data as CalcResult);
      setTier(String(res.data.tier ?? "free"));
    } catch (e) {
      toast("Calculation failed", extractErr(e), "error");
    } finally {
      setCalcLoading(false);
    }
  }, [inputs, userId]);

  const fetchScenarios = async () => {
    if (!isPremium) { setUpgrade({ open: true, feature: "Scenario planner" }); return; }
    setTabLoading(true);
    try {
      const res = await axios.post(`${API}/profitability/scenarios`, { ...inputs });
      setScenarios(res.data.scenarios);
      setSensitivity(res.data.sensitivity);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 403)
        setUpgrade({ open: true, feature: "Scenario planner" });
    } finally { setTabLoading(false); }
  };

  const fetchMarketIntel = async () => {
    if (!isPremium) { setUpgrade({ open: true, feature: "Market intelligence" }); return; }
    setTabLoading(true);
    try {
      const res = await axios.get(`${API}/profitability/market-intel`, {
        params: { category: inputs.category, marketplace: inputs.marketplace, selling_price: inputs.selling_price },
      });
      setMarketIntel(res.data as Record<string, unknown>);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 403)
        setUpgrade({ open: true, feature: "Market intelligence" });
      else toast("Market data error", extractErr(e), "error");
    } finally { setTabLoading(false); }
  };

  const fetchHealth = async () => {
    if (!isPremium) { setUpgrade({ open: true, feature: "Business health" }); return; }
    setTabLoading(true);
    try {
      const res = await axios.post(`${API}/profitability/health`, { ...inputs });
      setHealthData(res.data as Record<string, unknown>);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 403)
        setUpgrade({ open: true, feature: "Business health" });
    } finally { setTabLoading(false); }
  };

  const handleTab = (tab: typeof activeTab) => setActiveTab(tab);
  const inp = (key: keyof Inputs, value: number | string) => setInputs((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!userId) { toast("Not logged in", "Log in to save products.", "error"); return; }
    if (saveLimit === 0) { setUpgrade({ open: true, feature: "Save products" }); return; }
    if (savedProducts.length >= saveLimit) {
      toast("Limit reached", `Upgrade to save more than ${saveLimit} products.`, "error");
      return;
    }
    setSaveModal(true);
  };

  const confirmSave = async () => {
    if (!saveName.trim() || !calcResult || !userId) return;
    setSavingProduct(true);
    try {
      const res = await axios.post(`${API}/profitability/saved`, {
        name: saveName.trim(), inputs, calc_snapshot: calcResult,
      });
      setSaved((p) => [res.data as SavedProductDB, ...p]);
      setSaveModal(false);
      setSaveName("");
      toast("Saved!", `"${saveName}" saved to your account.`, "success");
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 403) setUpgrade({ open: true, feature: "Save products" });
      else toast("Save failed", extractErr(e), "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const waterfallData = useMemo(() => {
    if (!calcResult?.cost_breakdown) return [];
    const bd = calcResult.cost_breakdown;
    return [
      { name: "Product cost",   value: Number(bd.product_cost    || 0), color: WATERFALL_COLORS.product_cost },
      { name: "Shipping → FBA", value: Number(bd.shipping_to_fba || 0), color: WATERFALL_COLORS.shipping_to_fba },
      { name: "FBA fee",        value: Number(bd.fba_fee         || 0), color: WATERFALL_COLORS.fba_fee },
      { name: "Referral fee",   value: Number(bd.referral_fee    || 0), color: WATERFALL_COLORS.referral_fee },
      { name: "Ad spend",       value: Number(bd.ad_spend        || 0), color: WATERFALL_COLORS.ad_spend },
      { name: "Storage",        value: Number(bd.storage_fee     || 0), color: WATERFALL_COLORS.storage_fee },
      { name: "Returns",        value: Number(bd.return_cost     || 0), color: WATERFALL_COLORS.return_cost },
    ].filter((d) => d.value > 0);
  }, [calcResult]);

  const bench = marketIntel?.benchmarks as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-sky-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-sky-900 dark:text-sky-300">{t('profitabilityOptimizer.title', 'Price Optimizer')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">{t('profitabilityOptimizer.subtitle', 'Real margins · Live market data')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-xs font-semibold ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300" : tier === "basic" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
            {tier.toUpperCase()}
          </Badge>
          {calcResult && (
            <Button size="sm" variant="outline" onClick={handleSave} className="flex items-center gap-1.5 text-xs" data-track-id="save-btn">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {upgradeModal.open && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{String(upgradeModal.feature)}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Upgrade to unlock this feature.</p>
              <div className="grid grid-cols-2 gap-3 mb-5 text-left text-xs">
                {[
                  { tier: "Basic · ₹1,999/mo", feats: ["Full cost waterfall", "ROI & ACOS tracking", "Smart alerts", "Return rate modelling", "AI chat"] },
                  { tier: "Premium · ₹2,999/mo", feats: ["Scenario planner", "Live market intel", "Business health score", "AI full analysis", "Unlimited saves"] },
                ].map((plan) => (
                  <div key={plan.tier} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{plan.tier}</p>
                    {plan.feats.map((f) => (
                      <p key={f} className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {f}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setUpgrade({ open: false, feature: "" })}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white" onClick={() => (window.location.href = "/subscription")}>
                  <Crown className="w-4 h-4 mr-1" /> Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Save product</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Saved to your account · accessible on any device</p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Phone stand — Delhi supplier"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl text-sm mb-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && !savingProduct && confirmSave()}
              autoFocus
            />
            {calcResult && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex justify-between"><span>Profit / unit</span><span className="font-semibold text-slate-700 dark:text-slate-200">{inr(calcResult.profit_per_unit)}</span></div>
                <div className="flex justify-between"><span>Net margin</span><span className="font-semibold text-slate-700 dark:text-slate-200">{pct(calcResult.net_margin_pct)}</span></div>
                <div className="flex justify-between"><span>Monthly profit</span><span className="font-semibold text-slate-700 dark:text-slate-200">{inr(calcResult.monthly_profit)}</span></div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSaveModal(false)} disabled={savingProduct}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 text-white" onClick={confirmSave} disabled={!saveName.trim() || savingProduct}>
                {savingProduct ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...</> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 ${t.variant === "success" ? "bg-green-50 dark:bg-green-950/60 border-green-300 dark:border-green-800" : "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800"}`}>
            {t.variant === "success" ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900 dark:text-green-300" : "text-red-900 dark:text-red-300"}`}>{String(t.title)}</p>
              <p className={`text-xs mt-0.5 ${t.variant === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{String(t.description)}</p>
            </div>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}><X className="w-4 h-4 text-slate-400 dark:text-slate-500" /></button>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {([
              { id: "calc",     label: t('profitabilityOptimizer.tabs.calc', 'Calculator'),   icon: <Calculator className="w-4 h-4" />,  min: "free"    },
              { id: "scenario", label: t('profitabilityOptimizer.tabs.scenario', 'Scenarios'),    icon: <BarChart3 className="w-4 h-4" />,   min: "premium" },
              { id: "health",   label: t('profitabilityOptimizer.tabs.health', 'Health'),       icon: <Activity className="w-4 h-4" />,    min: "premium" },
              { id: "ai",       label: t('profitabilityOptimizer.tabs.ai', 'AI Advisor'),   icon: <Bot className="w-4 h-4" />,         min: "basic"   },
            ] as { id: string; label: string; icon: JSX.Element; min: string }[]).map((tab) => {
              const locked = (tab.min === "premium" && !isPremium) || (tab.min === "basic" && !isBasicPlus);
              return (
                <button key={tab.id}
                  onClick={() => locked ? setUpgrade({ open: true, feature: tab.label }) : handleTab(tab.id as typeof activeTab)}
                  className={`flex-1 min-w-[80px] py-3.5 px-3 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
                  data-track-id="profit_tab_btn"
                  data-filter-value={tab.id}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {locked && <Lock className="w-3 h-3 text-amber-500" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ══ CALCULATOR ══════════════════════════════════════════════════ */}
      {activeTab === "calc" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Calculator className="w-4 h-4 text-blue-500" /> {t('profitabilityOptimizer.calculator.costInputs', 'Cost inputs')}
                </CardTitle>
                {calcLoading && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-0.5 pt-0">

              {/* ── Specific Product Research ── */}
              <div className="bg-sky-50/50 dark:bg-sky-900/20 border border-sky-100/80 dark:border-sky-800/50 p-3.5 rounded-2xl mb-4 space-y-2.5">
                <label className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-widest block">
                  {t('profitabilityOptimizer.calculator.specificProductResearch', 'Specific Product Research')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 overflow-visible">
                    <SmartSearchInput
                      value={nicheKeyword}
                      onChange={(val) => {
                        setNicheKeyword(val);
                        // Clear badge when user types a new keyword
                        if (nicheDataSource) setNicheDataSource(null);
                      }}
                      placeholder="e.g. Bamboo Desk Organizer"
                      inputClassName="w-full py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                      onEnter={handleNicheAutofill}
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={fetchingNiche || !nicheKeyword.trim()}
                    onClick={handleNicheAutofill}
                    className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white text-xs font-bold rounded-xl px-4 h-9 shadow-sm transition-all"
                  >
                    {fetchingNiche ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {/* Data source badge — shown after search completes */}
                {nicheDataSource && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold w-fit ${
                    nicheDataSource === "db"
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}>
                    {nicheDataSource === "db" ? (
                      <>
                        <Database className="w-3 h-3" />
                        Live DB data · {nicheProductCount} competitor{nicheProductCount !== 1 ? "s" : ""}
                        {nicheConfidence ? ` · ${nicheConfidence} confidence` : ""}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        AI estimate — verify before listing
                      </>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  {nicheDataSource === "db"
                    ? "Prices computed from real competitor listings. Same search always returns the same price."
                    : "Enter a product to auto-fill price and sales volume from live competitor data."}
                </p>
              </div>

              <div className="mb-3">
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t('profitabilityOptimizer.calculator.marketplace', 'Marketplace')}</label>
                <select value={inputs.marketplace} onChange={(e) => inp("marketplace", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  data-track-id="marketplace_select"
                  data-filter-value={inputs.marketplace}
                >
                  <option value="amazon" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Amazon India</option>
                  <option value="flipkart" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Flipkart India</option>
                </select>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t('profitabilityOptimizer.calculator.corePricing', 'Core pricing')}</p>

              <SliderRow label={t('profitabilityOptimizer.calculator.sellingPrice', 'Selling price')}   value={inputs.selling_price}     min={100}  max={Math.max(10000, Math.ceil(inputs.selling_price * 1.5 / 5000) * 5000)} step={50}  format={inr}           onChange={(v) => inp("selling_price", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.productCost', 'Product cost')}    value={inputs.product_cost}      min={50}   max={Math.max(5000,  Math.ceil(inputs.product_cost * 1.5 / 1000) * 1000)}  step={25}  format={inr}           onChange={(v) => inp("product_cost", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.shippingToFba', 'Shipping to FBA')} value={inputs.shipping_to_fba}   min={0}    max={Math.max(800,   Math.ceil(inputs.shipping_to_fba * 2 / 100) * 100)}   step={10}  format={inr}           onChange={(v) => inp("shipping_to_fba", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.fbaFee', 'FBA fee')}         value={inputs.fba_fee}           min={0}    max={Math.max(600,   Math.ceil(inputs.fba_fee * 2 / 100) * 100)}           step={10}  format={inr}           onChange={(v) => inp("fba_fee", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.adSpendPerUnit', 'Ad spend / unit')} value={inputs.ad_spend_per_unit} min={0}    max={Math.max(800,   Math.ceil(inputs.ad_spend_per_unit * 2 / 100) * 100)} step={5}   format={inr}           onChange={(v) => inp("ad_spend_per_unit", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.monthlyUnits', 'Monthly units')}   value={inputs.monthly_units}     min={10}   max={Math.max(5000,  Math.ceil(inputs.monthly_units * 1.5 / 500) * 500)}   step={10}  format={(v) => `${v}`} onChange={(v) => inp("monthly_units", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.referralFee', 'Referral') + ` (${Number(inputs.referral_fee_pct).toFixed(0)}%)`} value={inputs.referral_fee_pct} min={1} max={25} step={0.5} format={pct} onChange={(v) => inp("referral_fee_pct", v)} />

              <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('profitabilityOptimizer.calculator.advanced', 'Advanced')}</p>
                {!isBasicPlus && (
                  <span onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}
                    className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors">Basic+</span>
                )}
              </div>
              <SliderRow label={t('profitabilityOptimizer.calculator.returnRate', 'Return rate')}    value={inputs.return_rate_pct}      min={0} max={40}  step={1} format={pct} locked={!isBasicPlus} onChange={(v) => inp("return_rate_pct", v)} />
              <SliderRow label={t('profitabilityOptimizer.calculator.storagePerUnit', 'Storage / unit')} value={inputs.storage_fee_per_unit} min={0} max={150} step={2} format={inr} locked={!isBasicPlus} onChange={(v) => inp("storage_fee_per_unit", v)} />
              {!isBasicPlus && (
                <button onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}
                  className="w-full mt-3 py-2 text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Unlock — Basic ₹1,999/mo
                </button>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            {calcResult && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { label: t('profitabilityOptimizer.calculator.profitPerUnit', 'Profit / unit'),  val: inr(Number(calcResult.profit_per_unit)),  cls: Number(calcResult.profit_per_unit) > 0 ? (Number(calcResult.net_margin_pct) > 20 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400") : "text-red-600 dark:text-red-400" },
                    { label: t('profitabilityOptimizer.calculator.netMargin', 'Net margin'),     val: pct(Number(calcResult.net_margin_pct)),   cls: Number(calcResult.net_margin_pct) > 20 ? "text-green-600 dark:text-green-400" : Number(calcResult.net_margin_pct) > 10 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400" },
                    { label: t('profitabilityOptimizer.calculator.monthlyProfit', 'Monthly profit'), val: inr(Number(calcResult.monthly_profit)),   cls: "text-blue-600 dark:text-blue-400", sub: calcResult.yearly_profit ? "~" + inr(Number(calcResult.yearly_profit)) + "/yr" : undefined },
                    { label: t('profitabilityOptimizer.calculator.breakEven', 'Break-even'),     val: String(Number(calcResult.breakeven_units) || 0) + ` ${t('profitabilityOptimizer.calculator.units', 'units')}`, cls: "text-slate-700 dark:text-slate-200" },
                    { label: t('profitabilityOptimizer.calculator.roi', 'ROI'),            val: calcResult.roi_pct !== undefined ? pct(Number(calcResult.roi_pct)) : "—", cls: "text-purple-600 dark:text-purple-400", locked: !isBasicPlus },
                    { label: t('profitabilityOptimizer.calculator.trueAcos', 'True ACOS'),      val: calcResult.acos_pct !== undefined ? pct(Number(calcResult.acos_pct)) : "—", cls: calcResult.acos_pct !== undefined && Number(calcResult.acos_pct) > 20 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200", locked: !isBasicPlus },
                  ] as { label: string; val: string; cls: string; sub?: string; locked?: boolean }[]).map((m, i) => (
                    <div key={i} className={`relative bg-white dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm ${m.locked ? "overflow-hidden" : ""}`}>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{m.label}</p>
                      <p className={`text-xl font-black ${m.cls}`}>{m.val}</p>
                      {m.sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{m.sub}</p>}
                      {m.locked && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center cursor-pointer rounded-2xl"
                          onClick={() => setUpgrade({ open: true, feature: m.label })}>
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1"><Lock className="w-3 h-3" /> Basic</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      {t('profitabilityOptimizer.calculator.costWaterfall', 'Cost waterfall')}
                      {!isBasicPlus && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Basic+</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isBasicPlus && waterfallData.length > 0 ? (
                      <div className="space-y-2.5">
                        {waterfallData.map((row) => {
                          const sp     = Number(calcResult.selling_price) || 1;
                          const rowPct = Math.min((row.value / sp) * 100, 100);
                          return (
                            <div key={row.name} className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 dark:text-slate-400 w-28 shrink-0">{row.name}</span>
                              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(rowPct * 2.5, 100)}%`, background: row.color }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-14 text-right">{inr(row.value)}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">{rowPct.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('profitabilityOptimizer.calculator.profitPerUnit', 'Profit / unit')}</span>
                          <span className={`text-base font-black ${Number(calcResult.profit_per_unit) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {inr(Number(calcResult.profit_per_unit))} ({pct(Number(calcResult.net_margin_pct))})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative min-h-[100px]">
                        <div className="space-y-2 opacity-25 blur-sm pointer-events-none">
                          {["Product cost", "FBA fee", "Referral fee", "Ad spend"].map((n) => (
                            <div key={n} className="flex items-center gap-3">
                              <span className="text-xs w-28 text-slate-400">{n}</span>
                              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2"><div className="h-full rounded-full bg-slate-300 dark:bg-slate-600" style={{ width: "55%" }} /></div>
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('profitabilityOptimizer.calculator.fullCostBreakdown', 'Full cost breakdown')}</p>
                          <button className="text-xs px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow"
                            onClick={() => setUpgrade({ open: true, feature: "Cost waterfall" })}>Unlock — Basic ₹1,999/mo</button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {isBasicPlus && calcResult.alerts && calcResult.alerts.length > 0 && (
                  <div className="space-y-2">
                    {calcResult.alerts.map((a, i) => <AlertBox key={i} type={String(a.type ?? "")} message={String(a.message ?? "")} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ SCENARIOS ════════════════════════════════════════════════════ */}
      {activeTab === "scenario" && (
        <div className="space-y-5">
          {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">Building scenarios...</p></CardContent></Card>}
          {!tabLoading && scenarios && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(scenarios as Record<string, unknown>[]).map((s, i) => (
                  <Card key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                    <CardContent className="p-4">
                      <div className="w-2 h-2 rounded-full mb-2" style={{ background: String(s.color ?? "#888") }} />
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: String(s.color ?? "#888") }}>{String(s.label ?? "")}</p>
                      <p className={`text-2xl font-black ${Number(s.profit_per_unit) > 0 ? "text-slate-800 dark:text-slate-100" : "text-red-600 dark:text-red-400"}`}>
                        {inr(Number(s.profit_per_unit))}<span className="text-xs font-normal text-slate-400 dark:text-slate-500">/{t('profitabilityOptimizer.calculator.unit', 'unit')}</span>
                      </p>
                      <p className={`text-sm font-semibold mt-1 ${Number(s.net_margin_pct) > 15 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>{pct(Number(s.net_margin_pct))} {t('profitabilityOptimizer.calculator.margin', 'margin')}</p>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between"><span>{t('profitabilityOptimizer.calculator.monthly', 'Monthly')}</span><span className="font-semibold text-slate-700 dark:text-slate-200">{inr(Number(s.monthly_profit))}</span></div>
                        <div className="flex justify-between"><span>{t('profitabilityOptimizer.calculator.units', 'Units')}</span><span className="font-semibold text-slate-700 dark:text-slate-200">{Number(s.units || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>{t('profitabilityOptimizer.calculator.roi', 'ROI')}</span><span className="font-semibold text-slate-700 dark:text-slate-200">{pct(Number(s.roi_pct))}</span></div>
                        <div className="flex justify-between"><span>{t('profitabilityOptimizer.calculator.acos', 'ACOS')}</span><span className={`font-semibold ${Number(s.acos_pct) > 20 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200"}`}>{pct(Number(s.acos_pct))}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.scenarios.priceSensitivity', 'Price sensitivity — margin vs selling price')}</CardTitle>
                  <CardDescription className="dark:text-slate-400">{t('profitabilityOptimizer.scenarios.priceSensitivityDesc', 'How net margin changes across a ±30% price range')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={sensitivity} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="price" tickFormatter={(v) => "₹" + (Number(v) / 1000).toFixed(1) + "k"} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={getChartStyle(isDark)} formatter={(v: unknown) => [Number(v).toFixed(1) + "%", "Net margin"]} labelFormatter={(v) => "Price: ₹" + String(v)} />
                      <Line type="monotone" dataKey="margin_pct" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ══ MARKET INTEL ════════════════════════════════════════════════ */}
      {activeTab === "market" && (
        <div className="space-y-5">
          {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">Fetching live market data from your DB...</p></CardContent></Card>}
          {!tabLoading && marketIntel && bench && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-2xl p-4 text-sm text-blue-800 dark:text-blue-300 font-medium">{String(marketIntel.insight ?? "")}</div>
              {marketIntel.your_price_position && (
                <div className={`p-4 rounded-2xl text-sm font-semibold border-2 flex items-center gap-2 ${marketIntel.your_price_position === "Above market" ? "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300" : marketIntel.your_price_position === "Below market" ? "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300" : "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"}`}>
                  <Target className="w-4 h-4 shrink-0" />
                  {t('profitabilityOptimizer.market.yourPrice', 'Your price')} ({inr(Number(marketIntel.your_price))}) {t('profitabilityOptimizer.market.is', 'is')} {String(marketIntel.your_price_position ?? "")} {t('profitabilityOptimizer.market.inThisCategory', 'in this category')}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {([
                  { label: t('profitabilityOptimizer.market.avgPrice', 'Avg price'),     val: inr(Number(bench.avg_price)) },
                  { label: t('profitabilityOptimizer.market.minPrice', 'Min price'),     val: inr(Number(bench.min_price)) },
                  { label: t('profitabilityOptimizer.market.maxPrice', 'Max price'),     val: inr(Number(bench.max_price)) },
                  { label: t('profitabilityOptimizer.market.avgRating', 'Avg rating'),    val: bench.avg_rating != null ? "★ " + Number(bench.avg_rating).toFixed(1) : "N/A" },
                  { label: t('profitabilityOptimizer.market.avgSalesMo', 'Avg sales/mo'),  val: bench.avg_sales_volume != null ? Math.round(Number(bench.avg_sales_volume)).toLocaleString() : "N/A" },
                  { label: t('profitabilityOptimizer.market.mrpDiscount', 'MRP discount'),  val: bench.mrp_discount_depth_pct != null ? Math.round(Number(bench.mrp_discount_depth_pct)) + "%" : "N/A" },
                ] as { label: string; val: string }[]).map((m, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/80 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{m.label}</p>
                    <p className="text-base font-black text-slate-800 dark:text-slate-100">{m.val}</p>
                  </div>
                ))}
              </div>

              <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.market.yourPriceVsMarket', 'Your price vs market')}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[
                      { name: "Market min", value: Number(bench.min_price ?? 0) },
                      { name: "Your price", value: Number(inputs.selling_price) },
                      { name: "Market avg", value: Number(bench.avg_price ?? 0) },
                      { name: "Market max", value: Number(bench.max_price ?? 0) },
                    ]} margin={{ left: 10, right: 10, top: 4, bottom: 4 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => "₹" + (Number(v) / 1000).toFixed(0) + "k"} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={getChartStyle(isDark)} formatter={(v: unknown) => [inr(Number(v)), "Price"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                        {[0, 1, 2, 3].map((i) => <Cell key={i} fill={["#94a3b8", "#3b82f6", "#f59e0b", "#ef4444"][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {Array.isArray(marketIntel.price_bands) && (marketIntel.price_bands as unknown[]).length > 0 && (
                <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.market.priceBandWhitespace', 'Price band whitespace — from your DB')}</CardTitle>
                    <CardDescription className="dark:text-slate-400">{t('profitabilityOptimizer.market.priceBandDesc', 'Green = fewer competitors · Red = crowded · Real data')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(marketIntel.price_bands as Record<string, unknown>[]).map((b, i) => {
                      const opp  = String(b.opportunity ?? "");
                      const c    = opp === "High" ? "#10b981" : opp === "Medium" ? "#f59e0b" : opp === "Low" ? "#3b82f6" : "#ef4444";
                      const maxB = Math.max(...(marketIntel.price_bands as Record<string, unknown>[]).map((x) => Number(x.brand_count) || 0), 1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-600 dark:text-slate-300 w-40 shrink-0">{String(b.band ?? "")}</span>
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(Number(b.brand_count) / maxB) * 100}%`, background: c }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">{String(b.brand_count ?? "0")} {t('profitabilityOptimizer.market.brands', 'brands')}</span>
                          <span className="text-xs font-semibold w-16 text-right" style={{ color: c }}>{opp}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {Array.isArray(bench.top_brands) && (bench.top_brands as unknown[]).length > 0 && (
                <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.market.topCompetitors', 'Top competitors in')} {String(inputs.category)} — {String(inputs.marketplace)}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(bench.top_brands as string[]).map((b, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">#{i + 1} {String(b ?? "")}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ HEALTH ═══════════════════════════════════════════════════════ */}
      {activeTab === "health" && (
        <div className="space-y-5">
          {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">{t('profitabilityOptimizer.health.computingScore', 'Computing health score...')}</p></CardContent></Card>}
          {!tabLoading && healthData && (
            <>
              <div className={`relative rounded-3xl p-6 text-white overflow-hidden ${Number(healthData.overall_score) > 75 ? "bg-gradient-to-r from-emerald-500 to-green-600" : Number(healthData.overall_score) > 50 ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
                <div className="flex items-center gap-6">
                  <div className="shrink-0 text-center">
                    <p className="text-5xl font-black">{Math.round(Number(healthData.overall_score) || 0)}</p>
                    <p className="text-white/70 text-sm">/100</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{t('profitabilityOptimizer.health.businessHealth', 'Business health')}</p>
                    <p className="text-3xl font-black">{String(healthData.overall_label ?? "")}</p>
                    <p className="text-white/80 text-sm mt-1">{t('profitabilityOptimizer.health.basedOn', 'Based on margin, ACOS, returns, volume, and ROI')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-100"><ShieldCheck className="w-4 h-4 text-purple-500" /> {t('profitabilityOptimizer.health.metricBreakdown', 'Metric breakdown')}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {(healthData.metrics as Record<string, unknown>[]).map((m, i) => {
                      const color = String(m.status) === "good" ? "#10b981" : String(m.status) === "warn" ? "#f59e0b" : "#ef4444";
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{String(m.label ?? "")}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 dark:text-slate-500">{String(m.detail ?? "")}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100 w-8 text-right">{Math.round(Number(m.score) || 0)}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Number(m.score) || 0}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-800 dark:text-slate-100">{t('profitabilityOptimizer.health.healthRadar', 'Health radar')}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={230}>
                      <RadarChart data={(healthData.metrics as Record<string, unknown>[]).map((m) => ({ subject: String(m.label ?? "").replace(" health", "").replace(" risk", "").replace(" momentum", ""), value: Number(m.score) || 0 }))}>
                        <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: isDark ? "#475569" : "#94a3b8" }} />
                        <Radar name="Health" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-100"><Zap className="w-4 h-4 text-amber-500" /> {t('profitabilityOptimizer.health.actionRecommendations', 'Action recommendations')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(healthData.recommendations as Record<string, unknown>[]).map((r, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow ${String(r.priority) === "high" || String(r.priority) === "critical" ? "bg-red-500" : "bg-amber-500"}`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">{String(r.area ?? "")}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${String(r.priority) === "high" || String(r.priority) === "critical" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}`}>{String(r.priority ?? "")}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{String(r.action ?? "")}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">💡 {String(r.impact ?? "")}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ══ AI ADVISOR ══════════════════════════════════════════════════ */}
      {activeTab === "ai" && (
        <AIPanel
          calcResult={calcResult}
          inputs={inputs}
          scenarios={scenarios}
          healthData={healthData}
          isBasicPlus={isBasicPlus}
          isPremium={isPremium}
          userId={userId?.toString()}
          onUpgrade={(feature: string) => setUpgrade({ open: true, feature })}
        />
      )}
    </div>
  );
}