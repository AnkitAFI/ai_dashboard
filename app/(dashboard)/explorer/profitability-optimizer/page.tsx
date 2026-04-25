"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
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
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

// ── Sub-components ────────────────────────────────────────────────────────────

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
    <div className={cn("flex items-start gap-2 p-3 rounded-xl border-l-4 text-sm", styles[type] ?? styles.warn)}>
      {icons[type] ?? icons.warn}
      <span>{String(message ?? "")}</span>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, format, locked, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; format: (v: number) => string; locked?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-1.5", locked && "opacity-40 pointer-events-none")}>
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
          <span className="text-amber-600 text-xs font-medium">⚠ Upgrade required.</span>
        )}
        {stream.error === "ollama_offline" && (
          <span className="text-red-600 text-xs font-medium">
            ⚠ Ollama offline. Run: <code className="bg-red-50 px-1 rounded border border-red-200">ollama serve</code>
          </span>
        )}
        {stream.error && !["upgrade_required", "ollama_offline"].includes(stream.error) && (
          <span className="text-red-600 text-xs font-medium">⚠ {stream.error}</span>
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
      <div className="flex items-center justify-between bg-slate-900 rounded-2xl px-5 py-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3">
            <div className={cn("w-2.5 h-2.5 rounded-full", statusColor)} style={ready ? { boxShadow: "0 0 8px rgba(74,222,128,0.7)" } : {}} />
            {ready && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 opacity-25 animate-ping" />}
          </div>
          <span className="text-sm font-mono text-slate-300">
            {!aiStatus ? "Checking Ollama..." : ready ? `${str(aiStatus.model)} · ready` : aiStatus.status === "no_model" ? "Ollama running · model missing" : "Ollama offline"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {aiStatus?.setup_hint && (
            <code className="text-xs text-amber-400 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-800/40">
              {aiStatus.setup_hint}
            </code>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {MODES.map((m) => {
          const locked = m.tier === "premium" ? !isPremium : !isBasicPlus;
          return (
            <button key={m.id}
              onClick={() => locked ? onUpgrade(m.label) : setActiveMode(m.id as typeof activeMode)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                activeMode === m.id
                  ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/30"
                  : locked
                  ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-violet-500 hover:text-white"
              )}
            >
              {locked && <span className="text-amber-500 text-[10px]">🔒</span>}
              {m.label}
            </button>
          );
        })}
      </div>

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
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed rounded-2xl",
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200"
                )}>
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

// ── Main Page Content ─────────────────────────────────────────────────────────

function ProfitabilityOptimizerContent() {
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
  const [mounted, setMounted]         = useState(false);

  const [savedProducts, setSaved]         = useState<SavedProductDB[]>([]);
  const [saveModal, setSaveModal]         = useState(false);
  const [saveName, setSaveName]           = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [loadingSaved, setLoadingSaved]   = useState(false);

  const [upgradeModal, setUpgrade]    = useState({ open: false, feature: "" });
  const [toasts, setToasts]           = useState<Toast[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const isBasicPlus = tier === "basic" || tier === "premium";
  const isPremium   = tier === "premium";
  const saveLimit   = tier === "free" ? 0 : tier === "basic" ? 5 : 9999;

  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, description, variant }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };

  const fetchSavedProducts = useCallback(async () => {
    if (!userId) return;
    setLoadingSaved(true);
    try {
      const res = await axios.get(`${API}/profitability/saved/${userId}`);
      setSaved(res.data as SavedProductDB[]);
    } catch { /* silent */ }
    finally { setLoadingSaved(false); }
  }, [userId]);

  useEffect(() => {
    fetchCategories(inputs.marketplace);
    if (userId) {
      fetchTierInfo();
      fetchSavedProducts();
    }
  }, [userId]);

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
      const res = await axios.get(`${API}/profitability/tier-info`, { params: { user_id: userId } });
      setTier(String(res.data.tier ?? "free"));
    } catch { /* silent */ }
  };

  const runCalculate = useCallback(async () => {
    if (!inputs.category) return;
    setCalcLoading(true);
    try {
      const res = await axios.post(`${API}/profitability/calculate`, { ...inputs, user_id: userId?.toString() || "" });
      setCalcResult(res.data as CalcResult);
      setTier(String(res.data.tier ?? "free"));
    } catch (e) {
      showToast("Calculation failed", extractErr(e), "error");
    } finally {
      setCalcLoading(false);
    }
  }, [inputs, userId]);

  useEffect(() => {
    if (!inputs.category) return;
    const t = setTimeout(runCalculate, 420);
    return () => clearTimeout(t);
  }, [inputs, runCalculate]);

  const fetchScenarios = async () => {
    if (!isPremium) { setUpgrade({ open: true, feature: "Scenario planner" }); return; }
    setTabLoading(true);
    try {
      const res = await axios.post(`${API}/profitability/scenarios`, { ...inputs, user_id: userId?.toString() || "" });
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
        params: { category: inputs.category, marketplace: inputs.marketplace, selling_price: inputs.selling_price, user_id: userId },
      });
      setMarketIntel(res.data as Record<string, unknown>);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 403)
        setUpgrade({ open: true, feature: "Market intelligence" });
      else showToast("Market data error", extractErr(e), "error");
    } finally { setTabLoading(false); }
  };

  const fetchHealth = async () => {
    if (!isPremium) { setUpgrade({ open: true, feature: "Business health" }); return; }
    setTabLoading(true);
    try {
      const res = await axios.post(`${API}/profitability/health`, { ...inputs, user_id: userId?.toString() || "" });
      setHealthData(res.data as Record<string, unknown>);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 403)
        setUpgrade({ open: true, feature: "Business health" });
    } finally { setTabLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab === "scenario" && isPremium) fetchScenarios();
      if (activeTab === "market"   && isPremium) fetchMarketIntel();
      if (activeTab === "health"   && isPremium) fetchHealth();
    }, 500);
    return () => clearTimeout(t);
  }, [inputs, activeTab, isPremium]);

  const inp = (key: keyof Inputs, value: number | string) => setInputs((p) => ({ ...p, [key]: value }));

  const confirmSave = async () => {
    if (!saveName.trim() || !calcResult || !userId) return;
    setSavingProduct(true);
    try {
      const res = await axios.post(`${API}/profitability/saved`, {
        user_id:       userId.toString(),
        name:          saveName.trim(),
        inputs:        inputs,
        calc_snapshot: calcResult,
      });
      setSaved((p) => [res.data as SavedProductDB, ...p]);
      setSaveModal(false);
      setSaveName("");
      showToast("Saved!", `"${saveName}" saved to your account.`, "success");
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 403) setUpgrade({ open: true, feature: "Save products" });
      else showToast("Save failed", extractErr(e), "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!userId) return;
    try {
      await axios.delete(`${API}/profitability/saved/${userId}/${productId}`);
      setSaved((p) => p.filter((x) => x.id !== productId));
      showToast("Deleted", "Product removed.", "success");
    } catch {
      showToast("Delete failed", "Could not remove product.", "error");
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
      {/* Modals & Toasts */}
      {upgradeModal.open && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-2xl bg-white rounded-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{String(upgradeModal.feature)}</h3>
              <p className="text-slate-500 text-sm mb-5">Upgrade to unlock this feature.</p>
              <div className="grid grid-cols-2 gap-3 mb-5 text-left text-[10px] sm:text-xs">
                {[
                  { tier: "Basic · ₹2k/mo", feats: ["Full cost waterfall", "ROI & ACOS tracking", "Smart alerts", "AI chat"] },
                  { tier: "Premium · ₹3k/mo", feats: ["Scenario planner", "Market intel", "Health score", "AI analysis"] },
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
                  <Crown className="w-4 h-4 mr-1" /> Upgrade
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {saveModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 shadow-2xl bg-white rounded-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Save product</h3>
            <p className="text-xs text-slate-400 mb-4">Synced across all your devices</p>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g. Phone stand — Delhi supplier" className="w-full p-3 border border-slate-300 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
            {calcResult && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Profit / unit</span><span className="font-semibold text-slate-700">{inr(calcResult.profit_per_unit)}</span></div>
                <div className="flex justify-between"><span>Net margin</span><span className="font-semibold text-slate-700">{pct(calcResult.net_margin_pct)}</span></div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSaveModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-600 text-white" onClick={confirmSave} disabled={!saveName.trim() || savingProduct}>
                {savingProduct ? "Saving..." : "Save"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={cn("flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 backdrop-blur-md", 
            t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300")}>
            {t.variant === "success" ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
            <div className="flex-1">
              <p className={cn("font-semibold text-sm", t.variant === "success" ? "text-green-900" : "text-red-900")}>{t.title}</p>
              <p className={cn("text-xs mt-0.5", t.variant === "success" ? "text-green-700" : "text-red-700")}>{t.description}</p>
            </div>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
        ))}
      </div>

      <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-xl rounded-2xl px-6 py-4 flex items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-sky-900">Profitability Optimizer</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Real margins · Live market data</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("text-xs font-semibold px-2.5 py-1", 
            tier === "premium" ? "bg-blue-100 text-blue-800" : tier === "basic" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}>
            {tier.toUpperCase()}
          </Badge>
          {calcResult && (
            <Button size="sm" variant="outline" onClick={() => userId ? setSaveModal(true) : showToast("Sign in required", "Sign in to save products.", "error")} className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Save</span>
            </Button>
          )}
        </div>
      </header>

      <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto space-y-5">
        <Card className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {([
              { id: "calc",     label: "Calculator",   icon: <Calculator className="w-4 h-4" />,  min: "free"    },
              { id: "scenario", label: "Scenarios",    icon: <BarChart3 className="w-4 h-4" />,   min: "premium" },
              { id: "market",   label: "Market intel", icon: <TrendingUp className="w-4 h-4" />,  min: "premium" },
              { id: "health",   label: "Health",       icon: <Activity className="w-4 h-4" />,    min: "premium" },
              { id: "ai",       label: "AI Advisor",   icon: <Bot className="w-4 h-4" />,         min: "basic"   },
            ] as const).map((tab) => {
              const locked = (tab.min === "premium" && !isPremium) || (tab.min === "basic" && !isBasicPlus);
              return (
                <button key={tab.id}
                  onClick={() => locked ? setUpgrade({ open: true, feature: tab.label }) : setActiveTab(tab.id)}
                  className={cn("flex-1 min-w-[100px] py-4 px-3 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2", 
                    activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50")}>
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                  {locked && <Lock className="w-3 h-3 text-amber-500" />}
                </button>
              );
            })}
          </div>
        </Card>

        {activeTab === "calc" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <Card className="lg:col-span-2 bg-white/90 border border-slate-200 rounded-2xl shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-500" /> Cost inputs
                  </CardTitle>
                  {calcLoading && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Marketplace</label>
                    <select value={inputs.marketplace} onChange={(e) => inp("marketplace", e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="amazon">Amazon.in</option>
                      <option value="flipkart">Flipkart</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Category</label>
                    <select value={inputs.category} onChange={(e) => inp("category", e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-2" />
                <SliderRow label="Selling price"   value={inputs.selling_price}     min={100}  max={10000} step={50}  format={inr}           onChange={(v) => inp("selling_price", v)} />
                <SliderRow label="Product cost"    value={inputs.product_cost}      min={50}   max={5000}  step={25}  format={inr}           onChange={(v) => inp("product_cost", v)} />
                <SliderRow label="Shipping to FBA" value={inputs.shipping_to_fba}   min={0}    max={800}   step={10}  format={inr}           onChange={(v) => inp("shipping_to_fba", v)} />
                <SliderRow label="FBA fee"         value={inputs.fba_fee}           min={0}    max={600}   step={10}  format={inr}           onChange={(v) => inp("fba_fee", v)} />
                <SliderRow label="Ad spend / unit" value={inputs.ad_spend_per_unit} min={0}    max={800}   step={5}   format={inr}           onChange={(v) => inp("ad_spend_per_unit", v)} />
                <SliderRow label="Monthly units"   value={inputs.monthly_units}     min={10}   max={5000}  step={10}  format={(v) => String(v)} onChange={(v) => inp("monthly_units", v)} />
                <SliderRow label={`Referral (${Number(inputs.referral_fee_pct).toFixed(0)}%)`} value={inputs.referral_fee_pct} min={1} max={25} step={0.5} format={pct} onChange={(v) => inp("referral_fee_pct", v)} />

                <div className="h-px bg-slate-100 my-2" />
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Advanced</p>
                  {!isBasicPlus && <Badge variant="secondary" className="bg-amber-100 text-amber-700 cursor-pointer" onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}>Basic+</Badge>}
                </div>
                <SliderRow label="Return rate"    value={inputs.return_rate_pct}      min={0} max={40}  step={1} format={pct} locked={!isBasicPlus} onChange={(v) => inp("return_rate_pct", v)} />
                <SliderRow label="Storage / unit" value={inputs.storage_fee_per_unit} min={0} max={150} step={2} format={inr} locked={!isBasicPlus} onChange={(v) => inp("storage_fee_per_unit", v)} />
                {!isBasicPlus && (
                  <Button variant="outline" className="w-full mt-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => setUpgrade({ open: true, feature: "Advanced inputs" })}>
                    <Lock className="w-3.5 h-3.5 mr-2" /> Unlock Advanced — ₹2,000/mo
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-3 space-y-4">
              {calcResult && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Profit / unit",  val: inr(calcResult.profit_per_unit),  cls: calcResult.profit_per_unit > 0 ? (calcResult.net_margin_pct > 20 ? "text-emerald-600" : "text-amber-600") : "text-red-600" },
                      { label: "Net margin",     val: pct(calcResult.net_margin_pct),   cls: calcResult.net_margin_pct > 20 ? "text-emerald-600" : calcResult.net_margin_pct > 10 ? "text-amber-600" : "text-red-600" },
                      { label: "Monthly profit", val: inr(calcResult.monthly_profit),   cls: "text-blue-600", sub: calcResult.yearly_profit ? `~${inr(calcResult.yearly_profit)}/yr` : undefined },
                      { label: "Break-even",     val: `${calcResult.breakeven_units} units`, cls: "text-slate-700" },
                      { label: "ROI",            val: pct(calcResult.roi_pct), cls: "text-purple-600", locked: !isBasicPlus },
                      { label: "True ACOS",      val: pct(calcResult.acos_pct), cls: (calcResult.acos_pct ?? 0) > 20 ? "text-amber-600" : "text-slate-700", locked: !isBasicPlus },
                    ].map((m, i) => (
                      <Card key={i} className="relative p-4 border border-slate-200 bg-white/90">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{m.label}</p>
                        <p className={cn("text-xl font-black", m.cls)}>{m.val}</p>
                        {m.sub && <p className="text-[10px] text-slate-400 mt-1">{m.sub}</p>}
                        {m.locked && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1.5px] flex items-center justify-center cursor-pointer rounded-2xl" onClick={() => setUpgrade({ open: true, feature: m.label })}>
                            <span className="text-xs text-amber-600 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Basic</span>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        Cost waterfall
                        {!isBasicPlus && <Badge variant="secondary" className="bg-amber-100 text-amber-700">Basic+</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isBasicPlus && waterfallData.length > 0 ? (
                        <div className="space-y-3">
                          {waterfallData.map((row) => {
                            const sp = calcResult.selling_price || 1;
                            const rowPct = Math.min((row.value / sp) * 100, 100);
                            return (
                              <div key={row.name} className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 w-28 shrink-0">{row.name}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(rowPct * 2.5, 100)}%`, background: row.color }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 w-14 text-right">{inr(row.value)}</span>
                                <span className="text-[10px] text-slate-400 w-8 text-right">{rowPct.toFixed(0)}%</span>
                              </div>
                            );
                          })}
                          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Net Profit</span>
                            <span className={cn("text-lg font-black", calcResult.profit_per_unit > 0 ? "text-emerald-600" : "text-red-600")}>
                              {inr(calcResult.profit_per_unit)} ({pct(calcResult.net_margin_pct)})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative py-6">
                          <div className="space-y-2.5 opacity-25 blur-sm pointer-events-none">
                            {["Product cost", "FBA fee", "Referral fee", "Ad spend"].map((n) => (
                              <div key={n} className="flex items-center gap-3">
                                <span className="text-xs w-28 text-slate-400">{n}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-full rounded-full bg-slate-300" style={{ width: "60%" }} /></div>
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <p className="text-sm font-semibold text-slate-700">Visual cost breakdown</p>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full" onClick={() => setUpgrade({ open: true, feature: "Cost waterfall" })}>Unlock — ₹2,000/mo</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {isBasicPlus && calcResult.alerts && calcResult.alerts.length > 0 && (
                    <div className="space-y-2">
                      {calcResult.alerts.map((a, i) => <AlertBox key={i} type={a.type} message={a.message} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "scenario" && (
          <div className="space-y-5">
            {tabLoading && <div className="py-20 text-center"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-slate-400 text-sm">Generating scenarios...</p></div>}
            {!tabLoading && scenarios && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(scenarios as any[]).map((s, i) => (
                    <Card key={i} className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <CardContent className="p-4">
                        <div className="w-2.5 h-2.5 rounded-full mb-3" style={{ background: s.color }} />
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>{s.label}</p>
                        <p className={cn("text-2xl font-black", s.profit_per_unit > 0 ? "text-slate-800" : "text-red-600")}>
                          {inr(s.profit_per_unit)}<span className="text-[10px] font-normal text-slate-400 ml-1">/unit</span>
                        </p>
                        <p className={cn("text-xs font-bold mt-1", s.net_margin_pct > 15 ? "text-emerald-600" : "text-amber-600")}>{pct(s.net_margin_pct)} margin</p>
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                          <div className="flex justify-between"><span>Monthly profit</span><span className="font-bold text-slate-700">{inr(s.monthly_profit)}</span></div>
                          <div className="flex justify-between"><span>ROI</span><span className="font-bold text-slate-700">{pct(s.roi_pct)}</span></div>
                          <div className="flex justify-between"><span>ACOS</span><span className={cn("font-bold", s.acos_pct > 25 ? "text-amber-600" : "text-slate-700")}>{pct(s.acos_pct)}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {mounted && (
                  <Card className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Price sensitivity</CardTitle>
                      <CardDescription className="text-xs">Margin impact across ±30% price variance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={sensitivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="price" tickFormatter={(v) => `₹${Math.round(v/1000)}k`} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={CHART_STYLE} formatter={(v: any) => [`${v.toFixed(1)}%`, "Margin"]} labelFormatter={(v) => `Price: ₹${v}`} />
                          <Line type="monotone" dataKey="margin_pct" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-5">
            {tabLoading && <div className="py-20 text-center"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-slate-400 text-sm">Fetching real-time market data...</p></div>}
            {!tabLoading && marketIntel && bench && (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl p-4 text-sm text-blue-800 font-medium">
                  {String(marketIntel.insight)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "Avg Price", val: inr(Number(bench.avg_price)) },
                    { label: "Min Price", val: inr(Number(bench.min_price)) },
                    { label: "Max Price", val: inr(Number(bench.max_price)) },
                    { label: "Avg Rating", val: bench.avg_rating ? `★ ${Number(bench.avg_rating).toFixed(1)}` : "—" },
                    { label: "Monthly Sales", val: bench.avg_sales_volume ? Math.round(Number(bench.avg_sales_volume)).toLocaleString() : "—" },
                    { label: "Avg Discount", val: bench.mrp_discount_depth_pct ? `${Math.round(Number(bench.mrp_discount_depth_pct))}%` : "—" },
                  ].map((m, i) => (
                    <Card key={i} className="p-3 bg-white border border-slate-200 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{m.label}</p>
                      <p className="text-base font-black text-slate-800">{m.val}</p>
                    </Card>
                  ))}
                </div>

                {mounted && (
                  <Card className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Price Positioning</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: "Min", value: Number(bench.min_price) },
                          { name: "Yours", value: inputs.selling_price },
                          { name: "Avg", value: Number(bench.avg_price) },
                          { name: "Max", value: Number(bench.max_price) },
                        ]} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                          <YAxis tickFormatter={(v) => `₹${Math.round(v/1000)}k`} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={CHART_STYLE} formatter={(v: any) => [inr(v), "Price"]} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                            {[0,1,2,3].map((i) => <Cell key={i} fill={["#94a3b8","#3b82f6","#f59e0b","#ef4444"][i]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "health" && (
          <div className="space-y-5">
            {tabLoading && <div className="py-20 text-center"><RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-slate-400 text-sm">Computing business health metrics...</p></div>}
            {!tabLoading && healthData && (
              <>
                <div className={cn("rounded-3xl p-8 text-white shadow-xl flex items-center gap-8", 
                  Number(healthData.overall_score) > 75 ? "bg-gradient-to-r from-emerald-500 to-green-600" : 
                  Number(healthData.overall_score) > 50 ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gradient-to-r from-amber-500 to-orange-600")}>
                  <div className="shrink-0 text-center">
                    <p className="text-6xl font-black">{Math.round(Number(healthData.overall_score))}</p>
                    <p className="text-white/60 text-sm font-bold">SCORE</p>
                  </div>
                  <div>
                    <Badge className="bg-white/20 text-white border-none text-xs px-3 py-1 mb-2">BUSINESS HEALTH</Badge>
                    <h3 className="text-4xl font-black tracking-tight">{String(healthData.overall_label)}</h3>
                    <p className="text-white/80 text-sm mt-1 max-w-md">Comprehensive analysis of your margins, unit velocity, and cost efficiency.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-500" /> Metric breakdown</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {(healthData.metrics as any[]).map((m, i) => {
                        const color = m.status === "good" ? "#10b981" : m.status === "warn" ? "#f59e0b" : "#ef4444";
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                              <span className="text-slate-600">{m.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-normal">{m.detail}</span>
                                <span className="text-slate-900 w-8 text-right">{Math.round(m.score)}</span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full transition-all duration-1000" style={{ width: `${m.score}%`, background: color }} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {mounted && (
                    <Card className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Health Radar</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                          <RadarChart data={(healthData.metrics as any[]).map(m => ({ subject: m.label.split(' ')[0], value: m.score }))}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                            <Radar name="Health" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Strategic roadmap</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(healthData.recommendations as any[]).map((r, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <div className={cn("shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-lg", 
                          r.priority === "critical" || r.priority === "high" ? "bg-red-500" : "bg-amber-500")}>{i + 1}</div>
                        <div>
                          <div className="flex gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">{r.area}</span>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", 
                              r.priority === "critical" || r.priority === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600")}>{r.priority}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-800 leading-snug">{r.action}</p>
                          <p className="text-xs text-emerald-600 font-medium mt-1">Impact: {r.impact}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {activeTab === "ai" && (
          <AIPanel
            calcResult={calcResult}
            inputs={inputs}
            scenarios={scenarios}
            healthData={healthData}
            isBasicPlus={isBasicPlus}
            isPremium={isPremium}
            userId={userId?.toString()}
            onUpgrade={(f) => setUpgrade({ open: true, feature: f })}
          />
        )}
      </div>
    </div>
  );
}

export default function ProfitabilityOptimizerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Optimizer...</div>}>
      <ProfitabilityOptimizerContent />
    </Suspense>
  );
}
