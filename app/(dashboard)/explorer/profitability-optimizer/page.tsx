"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { API_BASE_URL } from "@/lib/config";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
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
  Bookmark, Target, ShieldCheck, Zap, Send, RotateCcw, AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const API = `${API_BASE_URL}/api`;

axios.defaults.withCredentials = true;

const CHART_STYLE = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderRadius: "12px",
  border: "1.5px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 14px",
};

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
    danger:  "bg-red-50 border-red-400 text-red-800",
    warn:    "bg-amber-50 border-amber-400 text-amber-800",
    success: "bg-emerald-50 border-emerald-400 text-emerald-800",
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
    <div className={`flex items-center gap-3 py-1.5 ${locked ? "opacity-40 pointer-events-none" : ""}`}>
      <label className="text-xs text-slate-500 w-36 shrink-0 flex items-center gap-1">
        {label}
        {locked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} disabled={locked}
        className="flex-1 accent-blue-500 h-1.5" />
      <span className="text-xs font-semibold text-slate-700 w-16 text-right tabular-nums">
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
  type AIStatus = {
    status?: string;
    model?: string;
    setup_hint?: string;
  };

  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [pendingChat, setPendingChat] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"analyze" | "chat" | "scenario" | "health">("analyze");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const analyzeStream = useOllamaStream();
  const chatStream = useOllamaStream();
  const scenarioStream = useOllamaStream();
  const healthStream = useOllamaStream();

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

  // ── StreamBox: white card with dark text ──────────────────────────────────
  function StreamBox({ stream }: { stream: ReturnType<typeof useOllamaStream> }) {
    return (
      <div className="mt-3 min-h-16 max-h-80 overflow-y-auto bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        {stream.streaming && !stream.text && (
          <span className="text-slate-400 text-xs animate-pulse">Insydz is thinking...</span>
        )}
        {(stream.text || stream.streaming) && (
          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
            <ReactMarkdown>{stream.text}</ReactMarkdown>
            {stream.streaming && <span className="animate-pulse text-violet-500">▌</span>}
          </div>
        )}
        {stream.error === "upgrade_required" && (
          <span className="text-amber-600 text-xs font-medium">Available on Premium plan. Upgrade to unlock.</span>
        )}
        {stream.error === "ollama_offline" && (
          <span className="text-red-600 text-xs font-medium">AI is temporarily unavailable. Please try again shortly.</span>
        )}
        {stream.error === "stream_interrupted" && (
          <span className="text-red-600 text-xs font-medium">Analysis interrupted. Retry to continue — no data lost.</span>
        )}
        {stream.error && !["upgrade_required", "ollama_offline", "stream_interrupted"].includes(stream.error) && (
          <span className="text-red-600 text-xs font-medium">Couldn't complete analysis. Please try again.</span>
        )}
      </div>
    );
  }

  const MODES = [
    { id: "analyze",  label: "Full analysis",     tier: "premium" as const },
    { id: "chat",     label: "Ask anything",       tier: "basic"   as const },
    { id: "scenario", label: "Scenario advice",    tier: "premium" as const },
    { id: "health",   label: "Health action plan", tier: "premium" as const },
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
                  ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-violet-500 hover:text-white"
              }`}
            >
              {locked && <span className="text-amber-500 text-[10px]">🔒</span>}
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Full analysis ── */}
      {activeMode === "analyze" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">Full profitability analysis</p>
              <p className="text-xs text-slate-400 mt-0.5">4 recommendations from your exact numbers</p>
            </div>
            <div className="flex gap-2">
              {analyzeStream.text && (
                <button onClick={analyzeStream.reset} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear</button>
              )}
              <button
                onClick={runAnalyze}
                disabled={analyzeStream.streaming || !calcResult || !ready}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
              >
                {analyzeStream.streaming ? <><RefreshCw className="w-3 h-3 animate-spin" /> Analyzing...</> : "✦ Run analysis"}
              </button>
            </div>
          </div>
          {analyzeStream.text || analyzeStream.streaming || analyzeStream.error ? (
            <StreamBox stream={analyzeStream} />
          ) : (
            <div className="mt-3 bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
              <p className="text-slate-400 text-xs">Click "Run analysis" for AI recommendations</p>
            </div>
          )}
        </div>
      )}

      {/* ── Chat ── */}
      {activeMode === "chat" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="max-h-72 overflow-y-auto space-y-3 mb-4">
            {chatHistory.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-slate-400 text-xs mb-3">Ask anything about your product's numbers</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_Q.map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-violet-100 hover:text-violet-700 transition-colors border border-slate-200"
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
                    : "bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200"
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{String(msg.content ?? "")}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {(chatStream.streaming || pendingChat) && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3.5 py-2.5 text-xs bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200 leading-relaxed">
                  {chatStream.text ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{chatStream.text}</ReactMarkdown>
                      {chatStream.streaming && <span className="animate-pulse text-violet-500">▌</span>}
                    </div>
                  ) : (
                    <span className="animate-pulse text-slate-400">▌</span>
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
              placeholder="Ask about your margins, pricing, ads..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
            />
            <button
              onClick={runChat}
              disabled={chatStream.streaming || !chatInput.trim() || !ready}
              className="px-3 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            {chatHistory.length > 0 && (
              <button
                onClick={() => { setChatHistory([]); chatStream.reset(); setPendingChat(null); }}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Scenario advice ── */}
      {activeMode === "scenario" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">Which strategy should I pick?</p>
              <p className="text-xs text-slate-400 mt-0.5">AI compares your 4 scenarios and recommends one</p>
            </div>
            <button
              onClick={runScenario}
              disabled={scenarioStream.streaming || !scenarios || !ready}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
            >
              {scenarioStream.streaming ? "Thinking..." : "✦ Get advice"}
            </button>
          </div>
          {!scenarios && (
            <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-xl p-4 border border-slate-100">
              Open the Scenarios tab first to generate data.
            </p>
          )}
          {(scenarioStream.text || scenarioStream.streaming || scenarioStream.error) && (
            <StreamBox stream={scenarioStream} />
          )}
        </div>
      )}

      {/* ── Health advice ── */}
      {activeMode === "health" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">5-step health improvement plan</p>
              <p className="text-xs text-slate-400 mt-0.5">AI turns your health score into a prioritized action plan</p>
            </div>
            <button
              onClick={runHealth}
              disabled={healthStream.streaming || !healthData || !ready}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs rounded-xl font-medium transition-all"
            >
              {healthStream.streaming ? "Thinking..." : "✦ Build plan"}
            </button>
          </div>
          {!healthData && (
            <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-xl p-4 border border-slate-100">
              Open the Business Health tab first.
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
  const { user } = useAuth();
  const userId = user?.id;

  const [inputs, setInputs] = useState<Inputs>({
    selling_price: 2999, product_cost: 850, shipping_to_fba: 180, fba_fee: 200,
    ad_spend_per_unit: 120, monthly_units: 300, return_rate_pct: 5,
    storage_fee_per_unit: 15, referral_fee_pct: 9, category: "", marketplace: "amazon", your_brand: "",
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

  // ── Updated saved products state (DB-backed) ──────────────────────────────
  const [savedProducts, setSaved]         = useState<SavedProductDB[]>([]);
  const [saveModal, setSaveModal]         = useState(false);
  const [saveName, setSaveName]           = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  const [upgradeModal, setUpgrade]    = useState({ open: false, feature: "" });
  const [toasts, setToasts]           = useState<Toast[]>([]);

  const isBasicPlus = tier === "basic" || tier === "premium";
  const isPremium   = tier === "premium";
  const saveLimit   = tier === "free" ? 0 : tier === "basic" ? 5 : 9999;

  const toast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description, variant }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };

  // ── fetchSavedProducts ────────────────────────────────────────────────────
  const fetchSavedProducts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API}/profitability/saved`);
      setSaved(res.data as SavedProductDB[]);
    } catch {
      // silent
    }
  }, [userId]);

  // ── Mount effects ─────────────────────────────────────────────────────────
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
      if (activeTab === "scenario" && isPremium) {
        fetchScenarios();
      }
      if (activeTab === "market" && isPremium) {
        fetchMarketIntel();
      }
      if (activeTab === "health" && isPremium) {
        fetchHealth();
      }
    }, 500); // debounce

    return () => clearTimeout(t);
  }, [inputs, activeTab]);

  const fetchCategories = async (marketplace: string) => {
    try {
      const res = await axios.get(`${API}/profitability/categories`, { params: { marketplace } });
      const cats: string[] = res.data.categories ?? [];
      setCategories(cats);
      if (cats.length > 0) setInputs((p) => ({ ...p, category: p.category || cats[0] || "" }));
    } catch { /* silent */ }
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

  const handleTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };  

  const inp = (key: keyof Inputs, value: number | string) => setInputs((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!userId) {
      toast("Not logged in", "Log in to save products.", "error");
      return;
    }
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
        name:          saveName.trim(),
        inputs:        inputs,
        calc_snapshot: calcResult,
      });
      setSaved((p) => [res.data as SavedProductDB, ...p]);
      setSaveModal(false);
      setSaveName("");
      toast("Saved!", `"${saveName}" saved to your account.`, "success");
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setUpgrade({ open: true, feature: "Save products" });
      } else {
        toast("Save failed", extractErr(e), "error");
      }
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
      {/* Title Section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-sky-900">Profitability Optimizer</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Real margins · Live market data</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-xs font-semibold ${tier === "premium" ? "bg-blue-100 text-blue-800" : tier === "basic" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
            {tier.toUpperCase()}
          </Badge>
          {calcResult && (
            <Button size="sm" variant="outline" onClick={handleSave} className="flex items-center gap-1.5 text-xs">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {upgradeModal.open && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{String(upgradeModal.feature)}</h3>
              <p className="text-slate-500 text-sm mb-5">Upgrade to unlock this feature.</p>
              <div className="grid grid-cols-2 gap-3 mb-5 text-left text-xs">
                {[
                  { tier: "Basic · ₹2,000/mo", feats: ["Full cost waterfall", "ROI & ACOS tracking", "Smart alerts", "Return rate modelling", "AI chat"] },
                  { tier: "Premium · ₹3,000/mo", feats: ["Scenario planner", "Live market intel", "Business health score", "AI full analysis", "Unlimited saves"] },
                ].map((plan) => (
                  <div key={plan.tier} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="font-semibold text-slate-700 mb-2">{plan.tier}</p>
                    {plan.feats.map((f) => (
                      <p key={f} className="text-slate-500 flex items-center gap-1 mb-0.5">
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Save product</h3>
            <p className="text-xs text-slate-400 mb-4">
              Saved to your account · accessible on any device
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Phone stand — Delhi supplier"
              className="w-full p-3 border border-slate-300 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && !savingProduct && confirmSave()}
              autoFocus
            />
            {calcResult && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Profit / unit</span>
                  <span className="font-semibold text-slate-700">{inr(calcResult.profit_per_unit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net margin</span>
                  <span className="font-semibold text-slate-700">{pct(calcResult.net_margin_pct)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly profit</span>
                  <span className="font-semibold text-slate-700">{inr(calcResult.monthly_profit)}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSaveModal(false)} disabled={savingProduct}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 text-white"
                onClick={confirmSave}
                disabled={!saveName.trim() || savingProduct}
              >
                {savingProduct ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...</> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 backdrop-blur-none ${t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
            {t.variant === "success" ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{String(t.title)}</p>
              <p className={`text-xs mt-0.5 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{String(t.description)}</p>
            </div>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {([
              { id: "calc",     label: "Calculator",   icon: <Calculator className="w-4 h-4" />,  min: "free"    },
              { id: "scenario", label: "Scenarios",    icon: <BarChart3 className="w-4 h-4" />,   min: "premium" },
              { id: "market",   label: "Market intel", icon: <TrendingUp className="w-4 h-4" />,  min: "premium" },
              { id: "health",   label: "Health",       icon: <Activity className="w-4 h-4" />,    min: "premium" },
              { id: "ai",       label: "AI Advisor",   icon: <Bot className="w-4 h-4" />,         min: "basic"   },
            ] as { id: string; label: string; icon: JSX.Element; min: string }[]).map((tab) => {
              const locked = (tab.min === "premium" && !isPremium) || (tab.min === "basic" && !isBasicPlus);
              return (
                <button key={tab.id}
                  onClick={() => locked ? setUpgrade({ open: true, feature: tab.label }) : handleTab(tab.id as typeof activeTab)}
                  className={`flex-1 min-w-[80px] py-3.5 px-3 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"}`}>
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
          <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-500" /> Cost inputs
                </CardTitle>
                {calcLoading && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-0.5 pt-0">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Marketplace</label>
                  <select value={inputs.marketplace} onChange={(e) => inp("marketplace", e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="amazon">Amazon</option>
                    <option value="flipkart">Flipkart</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <select value={inputs.category} onChange={(e) => inp("category", e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                    {categories.length === 0 && <option value="">Loading...</option>}
                  </select>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-2" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Core pricing</p>

              <SliderRow label="Selling price"   value={inputs.selling_price}     min={100}  max={10000} step={50}  format={inr}           onChange={(v) => inp("selling_price", v)} />
              <SliderRow label="Product cost"    value={inputs.product_cost}      min={50}   max={5000}  step={25}  format={inr}           onChange={(v) => inp("product_cost", v)} />
              <SliderRow label="Shipping to FBA" value={inputs.shipping_to_fba}   min={0}    max={800}   step={10}  format={inr}           onChange={(v) => inp("shipping_to_fba", v)} />
              <SliderRow label="FBA fee"         value={inputs.fba_fee}           min={0}    max={600}   step={10}  format={inr}           onChange={(v) => inp("fba_fee", v)} />
              <SliderRow label="Ad spend / unit" value={inputs.ad_spend_per_unit} min={0}    max={800}   step={5}   format={inr}           onChange={(v) => inp("ad_spend_per_unit", v)} />
              <SliderRow label="Monthly units"   value={inputs.monthly_units}     min={10}   max={5000}  step={10}  format={(v) => `${v}`} onChange={(v) => inp("monthly_units", v)} />
              <SliderRow label={`Referral (${Number(inputs.referral_fee_pct).toFixed(0)}%)`} value={inputs.referral_fee_pct} min={1} max={25} step={0.5} format={pct} onChange={(v) => inp("referral_fee_pct", v)} />

              <div className="h-px bg-slate-100 my-2" />
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Advanced</p>
                {!isBasicPlus && (
                  <span onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}
                    className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-amber-200 transition-colors">Basic+</span>
                )}
              </div>
              <SliderRow label="Return rate"    value={inputs.return_rate_pct}      min={0} max={40}  step={1} format={pct} locked={!isBasicPlus} onChange={(v) => inp("return_rate_pct", v)} />
              <SliderRow label="Storage / unit" value={inputs.storage_fee_per_unit} min={0} max={150} step={2} format={inr} locked={!isBasicPlus} onChange={(v) => inp("storage_fee_per_unit", v)} />
              {!isBasicPlus && (
                <button onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}
                  className="w-full mt-3 py-2 text-xs text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Unlock — Basic ₹2,000/mo
                </button>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            {calcResult && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { label: "Profit / unit",  val: inr(Number(calcResult.profit_per_unit)),  cls: Number(calcResult.profit_per_unit) > 0 ? (Number(calcResult.net_margin_pct) > 20 ? "text-green-600" : "text-amber-600") : "text-red-600" },
                    { label: "Net margin",     val: pct(Number(calcResult.net_margin_pct)),   cls: Number(calcResult.net_margin_pct) > 20 ? "text-green-600" : Number(calcResult.net_margin_pct) > 10 ? "text-amber-600" : "text-red-600" },
                    { label: "Monthly profit", val: inr(Number(calcResult.monthly_profit)),   cls: "text-blue-600", sub: calcResult.yearly_profit ? "~" + inr(Number(calcResult.yearly_profit)) + "/yr" : undefined },
                    { label: "Break-even",     val: String(Number(calcResult.breakeven_units) || 0) + " units", cls: "text-slate-700" },
                    { label: "ROI",            val: calcResult.roi_pct !== undefined ? pct(Number(calcResult.roi_pct)) : "—", cls: "text-purple-600", locked: !isBasicPlus },
                    { label: "True ACOS",      val: calcResult.acos_pct !== undefined ? pct(Number(calcResult.acos_pct)) : "—", cls: calcResult.acos_pct !== undefined && Number(calcResult.acos_pct) > 20 ? "text-amber-600" : "text-slate-700", locked: !isBasicPlus },
                  ] as { label: string; val: string; cls: string; sub?: string; locked?: boolean }[]).map((m, i) => (
                    <div key={i} className={`relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm ${m.locked ? "overflow-hidden" : ""}`}>
                      <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                      <p className={`text-xl font-black ${m.cls}`}>{m.val}</p>
                      {m.sub && <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>}
                      {m.locked && (
                        <div className="absolute inset-0 bg-background backdrop-blur-none flex items-center justify-center cursor-pointer rounded-2xl"
                          onClick={() => setUpgrade({ open: true, feature: m.label })}>
                          <span className="text-xs text-amber-600 font-semibold flex items-center gap-1"><Lock className="w-3 h-3" /> Basic</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      Cost waterfall
                      {!isBasicPlus && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Basic+</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isBasicPlus && waterfallData.length > 0 ? (
                      <div className="space-y-2.5">
                        {waterfallData.map((row) => {
                          const sp = Number(calcResult.selling_price) || 1;
                          const rowPct = Math.min((row.value / sp) * 100, 100);
                          return (
                            <div key={row.name} className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 w-28 shrink-0">{row.name}</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(rowPct * 2.5, 100)}%`, background: row.color }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700 w-14 text-right">{inr(row.value)}</span>
                              <span className="text-xs text-slate-400 w-8 text-right">{rowPct.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">Profit / unit</span>
                          <span className={`text-base font-black ${Number(calcResult.profit_per_unit) > 0 ? "text-green-600" : "text-red-600"}`}>
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
                              <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-full rounded-full bg-slate-300" style={{ width: "55%" }} /></div>
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <p className="text-sm font-semibold text-slate-700">Full cost breakdown</p>
                          <button className="text-xs px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow"
                            onClick={() => setUpgrade({ open: true, feature: "Cost waterfall" })}>Unlock — Basic ₹2,000/mo</button>
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
                  <Card key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                    <CardContent className="p-4">
                      <div className="w-2 h-2 rounded-full mb-2" style={{ background: String(s.color ?? "#888") }} />
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: String(s.color ?? "#888") }}>{String(s.label ?? "")}</p>
                      <p className={`text-2xl font-black ${Number(s.profit_per_unit) > 0 ? "text-slate-800" : "text-red-600"}`}>
                        {inr(Number(s.profit_per_unit))}<span className="text-xs font-normal text-slate-400">/unit</span>
                      </p>
                      <p className={`text-sm font-semibold mt-1 ${Number(s.net_margin_pct) > 15 ? "text-green-600" : "text-amber-600"}`}>{pct(Number(s.net_margin_pct))} margin</p>
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between"><span>Monthly</span><span className="font-semibold text-slate-700">{inr(Number(s.monthly_profit))}</span></div>
                        <div className="flex justify-between"><span>Units</span><span className="font-semibold text-slate-700">{Number(s.units || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>ROI</span><span className="font-semibold text-slate-700">{pct(Number(s.roi_pct))}</span></div>
                        <div className="flex justify-between"><span>ACOS</span><span className={`font-semibold ${Number(s.acos_pct) > 20 ? "text-amber-600" : "text-slate-700"}`}>{pct(Number(s.acos_pct))}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Price sensitivity — margin vs selling price</CardTitle>
                  <CardDescription>How net margin changes across a ±30% price range</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={sensitivity} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="price" tickFormatter={(v) => "₹" + (Number(v) / 1000).toFixed(1) + "k"} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} formatter={(v: unknown) => [Number(v).toFixed(1) + "%", "Net margin"]} labelFormatter={(v) => "Price: ₹" + String(v)} />
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
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl p-4 text-sm text-blue-800 font-medium">{String(marketIntel.insight ?? "")}</div>
              {marketIntel.your_price_position && (
                <div className={`p-4 rounded-2xl text-sm font-semibold border-2 flex items-center gap-2 ${marketIntel.your_price_position === "Above market" ? "bg-purple-50 border-purple-300 text-purple-800" : marketIntel.your_price_position === "Below market" ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-300 text-green-800"}`}>
                  <Target className="w-4 h-4 shrink-0" />
                  Your price ({inr(Number(marketIntel.your_price))}) is {String(marketIntel.your_price_position ?? "")} in this category
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {([
                  { label: "Avg price",      val: inr(Number(bench.avg_price)) },
                  { label: "Min price",       val: inr(Number(bench.min_price)) },
                  { label: "Max price",       val: inr(Number(bench.max_price)) },
                  { label: "Avg rating",      val: bench.avg_rating != null ? "★ " + Number(bench.avg_rating).toFixed(1) : "N/A" },
                  { label: "Avg sales / mo",  val: bench.avg_sales_volume != null ? Math.round(Number(bench.avg_sales_volume)).toLocaleString() : "N/A" },
                  { label: "MRP discount",    val: bench.mrp_discount_depth_pct != null ? Math.round(Number(bench.mrp_discount_depth_pct)) + "%" : "N/A" },
                ] as { label: string; val: string }[]).map((m, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-center">
                    <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                    <p className="text-base font-black text-slate-800">{m.val}</p>
                  </div>
                ))}
              </div>

              <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Your price vs market</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[
                      { name: "Market min", value: Number(bench.min_price ?? 0) },
                      { name: "Your price", value: Number(inputs.selling_price) },
                      { name: "Market avg", value: Number(bench.avg_price ?? 0) },
                      { name: "Market max", value: Number(bench.max_price ?? 0) },
                    ]} margin={{ left: 10, right: 10, top: 4, bottom: 4 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => "₹" + (Number(v) / 1000).toFixed(0) + "k"} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_STYLE} formatter={(v: unknown) => [inr(Number(v)), "Price"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                        {[0,1,2,3].map((i) => <Cell key={i} fill={["#94a3b8","#3b82f6","#f59e0b","#ef4444"][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {Array.isArray(marketIntel.price_bands) && (marketIntel.price_bands as unknown[]).length > 0 && (
                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Price band whitespace — from your DB</CardTitle>
                    <CardDescription>Green = fewer competitors · Red = crowded · Real data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(marketIntel.price_bands as Record<string, unknown>[]).map((b, i) => {
                      const opp = String(b.opportunity ?? "");
                      const c = opp === "High" ? "#10b981" : opp === "Medium" ? "#f59e0b" : opp === "Low" ? "#3b82f6" : "#ef4444";
                      const maxB = Math.max(...(marketIntel.price_bands as Record<string, unknown>[]).map((x) => Number(x.brand_count) || 0), 1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-600 w-40 shrink-0">{String(b.band ?? "")}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(Number(b.brand_count) / maxB) * 100}%`, background: c }} />
                          </div>
                          <span className="text-xs text-slate-500 w-20 text-right">{String(b.brand_count ?? "0")} brands</span>
                          <span className="text-xs font-semibold w-16 text-right" style={{ color: c }}>{opp}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {Array.isArray(bench.top_brands) && (bench.top_brands as unknown[]).length > 0 && (
                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Top competitors in {String(inputs.category)} — {String(inputs.marketplace)}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(bench.top_brands as string[]).map((b, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">#{i + 1} {String(b ?? "")}</span>
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
          {tabLoading && <Card className="bg-background rounded-2xl shadow-lg"><CardContent className="p-12 flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /><p className="text-slate-500 text-sm">Computing health score...</p></CardContent></Card>}
          {!tabLoading && healthData && (
            <>
              <div className={`relative rounded-3xl p-6 text-white overflow-hidden ${Number(healthData.overall_score) > 75 ? "bg-gradient-to-r from-emerald-500 to-green-600" : Number(healthData.overall_score) > 50 ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
                <div className="flex items-center gap-6">
                  <div className="shrink-0 text-center">
                    <p className="text-5xl font-black">{Math.round(Number(healthData.overall_score) || 0)}</p>
                    <p className="text-white/70 text-sm">/100</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Business health</p>
                    <p className="text-3xl font-black">{String(healthData.overall_label ?? "")}</p>
                    <p className="text-white/80 text-sm mt-1">Based on margin, ACOS, returns, volume, and ROI</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-500" /> Metric breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {(healthData.metrics as Record<string, unknown>[]).map((m, i) => {
                      const color = String(m.status) === "good" ? "#10b981" : String(m.status) === "warn" ? "#f59e0b" : "#ef4444";
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-slate-600 font-medium">{String(m.label ?? "")}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{String(m.detail ?? "")}</span>
                              <span className="font-bold text-slate-800 w-8 text-right">{Math.round(Number(m.score) || 0)}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Number(m.score) || 0}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Health radar</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={230}>
                      <RadarChart data={(healthData.metrics as Record<string, unknown>[]).map((m) => ({ subject: String(m.label ?? "").replace(" health","").replace(" risk","").replace(" momentum",""), value: Number(m.score) || 0 }))}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                        <Radar name="Health" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Action recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(healthData.recommendations as Record<string, unknown>[]).map((r, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow ${String(r.priority) === "high" || String(r.priority) === "critical" ? "bg-red-500" : "bg-amber-500"}`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{String(r.area ?? "")}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${String(r.priority) === "high" || String(r.priority) === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{String(r.priority ?? "")}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{String(r.action ?? "")}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">💡 {String(r.impact ?? "")}</p>
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