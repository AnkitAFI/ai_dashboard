// "use client";

// import Chatbot from "@/components/chatbot/chatbot";
// import { Sparkles, Bot, Menu } from "lucide-react";
// import { useSidebar } from "@/components/layout/sidebar-context";

// export default function AiAdvisorPage() {
//   const { toggle } = useSidebar();
//   return (
//     <div className="flex-1 w-full min-h-screen flex flex-col">
//       {/* Header */}
//       <header className="bg-background opacity-100 backdrop-blur-none border border-sky-100 shadow-lg 
//         rounded-none sm:rounded-2xl 
//         px-4 sm:px-6 lg:px-8 
//         py-4 sm:py-5 
//         mb-4 sm:mb-6 
//         flex items-center 
//         justify-between gap-4 
//         sticky top-0 sm:top-4 
//         z-20 mx-0 sm:mx-6">
//         <div className="flex items-center gap-3 w-full sm:w-auto">
//           <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors">
//             <Menu className="w-5 h-5 text-sky-900" />
//           </button>
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
//               Insydz Advisor <Sparkles className="w-5 h-5 text-amber-500" />
//             </h2>
//             <p className="text-slate-600 text-xs sm:text-sm">
//               Get intelligent insights and market analysis for your products
//             </p>
//           </div>
//         </div>

//         <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
//           <Bot className="w-4 h-4 text-sky-600" />
//           <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">AI Powered Assistant</span>
//         </div>
//       </header>

//       {/* Full Screen Chatbot Component */}
//       <main className="flex-1 px-4 sm:px-6 pb-6 h-full flex flex-col">
//         <div className="flex-1 bg-background backdrop-blur-none rounded-3xl border border-sky-100 shadow-xl overflow-hidden flex flex-col">
//           <Chatbot variant="fullscreen" />
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";
import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useSelectedProduct } from "@/lib/selected-product-context";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Menu, Crown, RefreshCw, Package, Send,
  Bot, User, Sparkles, TrendingUp, Star,
  Hash, BarChart2, Zap, ChevronRight,
  AlertTriangle, CheckCircle, Lock,
  RotateCcw, Copy, ThumbsUp, ThumbsDown,
  MessageSquare, Lightbulb, Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const BASE_URL = API_BASE_URL;
const API = `${BASE_URL}/api/seller/ai-advisor`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
  loading?:  boolean;
}

interface SellerContext {
  seller_id:      string;
  total_products: number;
  products:       { asin: string; title: string; price: string; rating: number; sales_volume: string }[];
  avg_rating:     number;
  currency:       string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="absolute inset-0 bg-white/88 dark:bg-slate-900/85 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3">
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center shadow-sm",
        tier === "premium" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-500" : "bg-amber-50 dark:bg-amber-950/40 text-amber-500"
      )}>
        <Lock className="w-5 h-5" />
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{feature}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {tier === "premium" ? "Premium · ₹2,999/mo" : "Basic · ₹1,999/mo"}
        </p>
      </div>
      <button
        onClick={() => router.push("/subscription")}
        className={cn(
          "flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 border-none",
          tier === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
        )}
      >
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

// ── Suggestion Chip ───────────────────────────────────────────────────────────
function SuggestionChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 hover:border-sky-300 dark:hover:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-900 hover:text-sky-700 dark:hover:text-sky-400 transition-all text-left"
    >
      <ChevronRight className="w-3 h-3 shrink-0 text-slate-400 dark:text-slate-505" />
      {text}
    </button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  onCopy,
  onFeedback,
}: {
  message:    Message;
  onCopy:     (text: string) => void;
  onFeedback: (id: string, type: "up" | "down") => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[75%] bg-sky-600 dark:bg-sky-750 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed shadow-sm">
          {message.content}
        </div>
        <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center flex-shrink-0 mb-1">
          <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[80%] group">
        <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ${message.loading ? "min-w-[80px]" : ""}`}>
          {message.loading ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm
              prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:font-bold prose-headings:text-sm
              prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-p:text-slate-800 dark:prose-p:text-slate-200
              prose-code:bg-slate-100 dark:prose-code:bg-slate-950 prose-code:px-1 prose-code:rounded prose-code:text-xs">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {/* Actions — only for non-loading assistant messages */}
        {!message.loading && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFeedback(message.id, "up")}
              className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 dark:text-slate-505 hover:text-emerald-600 dark:hover:text-emerald-450 transition-colors"
              title="Helpful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFeedback(message.id, "down")}
              className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 dark:text-slate-505 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Not helpful"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Context Panel ─────────────────────────────────────────────────────────────
function ContextPanel({ context, selectedAsin, onSelectProduct }: {
  context:         SellerContext | null;
  selectedAsin:    string;
  onSelectProduct: (asin: string, title: string) => void;
}) {
  if (!context) return null;

  return (
    <div className="w-64 shrink-0 space-y-3 hidden lg:block">
      {/* Store summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
        <p className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide mb-3">Your Store</p>
        <div className="space-y-2">
          {[
            { label: "Products", value: String(context.total_products), icon: Package, color: "text-sky-600 dark:text-sky-400" },
            { label: "Avg Rating", value: `${context.avg_rating?.toFixed(1) || "—"}★`, icon: Star, color: "text-amber-500 dark:text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <s.icon className="w-3 h-3" />
                {s.label}
              </div>
              <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
        <p className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide mb-3">Ask about a product</p>
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          <button
            onClick={() => onSelectProduct("", "All products")}
            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all ${
              selectedAsin === ""
                ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-900"
                : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
            }`}
          >
            All products
          </button>
          {context.products.map((p, i) => (
            <button
              key={`${p.asin}-${i}`}
              onClick={() => onSelectProduct(p.asin, p.title)}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all ${
                selectedAsin === p.asin
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-900"
                  : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
              }`}
            >
              <span className="line-clamp-2 leading-relaxed">{p.title}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 font-mono mt-0.5 block">{p.asin}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick tips */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-950 dark:to-slate-900/50 rounded-2xl border border-sky-100 dark:border-slate-800/80 p-4">
        <p className="text-xs font-bold text-sky-700 dark:text-sky-450 mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" /> Tips
        </p>
        <div className="space-y-1.5 text-[11px] text-sky-700 dark:text-sky-450">
          <p>• Select a product to ask specific questions</p>
          <p>• Ask about pricing, reviews, or keywords</p>
          <p>• Compare your performance vs competitors</p>
        </div>
      </div>
    </div>
  );
}

// ── Starter Suggestions ───────────────────────────────────────────────────────
const STARTER_SUGGESTIONS = [
  "How is my store performing overall?",
  "Which of my products has the worst reviews and what should I do?",
  "Am I priced competitively against the market?",
  "Which product should I focus on improving first?",
  "What keywords am I missing from my top product?",
  "How do my review ratings compare to competitors?",
];

const PRODUCT_SUGGESTIONS = (title: string) => [
  `Why isn't ${title} selling better?`,
  `How should I price ${title} vs competitors?`,
  `What keywords is ${title} missing?`,
  `How are ${title} reviews compared to rivals?`,
  `Should I raise or lower the price of ${title}?`,
];

// ── Main Component ────────────────────────────────────────────────────────────
function AIAdvisorContent() {
  const router     = useRouter();
  const { user }   = useAuth();
  const { toggle } = useSidebar();
  const { selected } = useSelectedProduct();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  const sellerId  = selected?.sellerId || user?.seller_id || "";
  const userEmail = user?.email || "";
  const userId    = user?.id?.toString() || "";

  const tier      = user?.subscriptionTier || "free";
  const isBasic   = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState("");
  const [streaming,     setStreaming]      = useState(false);
  const [context,       setContext]        = useState<SellerContext | null>(null);
  const [contextLoading,setContextLoading] = useState(false);
  const [selectedAsin,  setSelectedAsin]  = useState(selected?.asin || "");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [sessionId,     setSessionId]     = useState(() => Math.random().toString(36).slice(2, 14));
  const [copiedId,      setCopiedId]      = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const abortRef       = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load seller context
  useEffect(() => {
    if (!sellerId) return;
    setContextLoading(true);
    fetch(`${API}/context?seller_id=${sellerId}&user_email=${encodeURIComponent(userEmail)}`, {
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setContext(d))
      .catch(console.error)
      .finally(() => setContextLoading(false));
  }, [sellerId, userEmail]);

  // Greeting on mount
  useEffect(() => {
    if (!sellerId) return;
    const greeting: Message = {
      id:        genId(),
      role:      "assistant",
      content:   "Hey! I'm your AI store advisor. I have full access to your product data, pricing, reviews, and rank history.\n\nAsk me anything about your store — I'll give you straight answers backed by your actual data.",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [sellerId]);

  const sendMessage = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question || streaming) return;

    // Add user message
    const userMsg: Message = {
      id:        genId(),
      role:      "user",
      content:   question,
      timestamp: new Date(),
    };

    // Add loading assistant message
    const loadingId = genId();
    const loadingMsg: Message = {
      id:        loadingId,
      role:      "assistant",
      content:   "",
      timestamp: new Date(),
      loading:   true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setStreaming(true);

    // Abort any existing stream
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortRef.current.signal,
        body: JSON.stringify({
          question,
          seller_id:    sellerId,
          user_email:   userEmail,
          user_id:      userId,
          session_id:   sessionId,
          focus_asin:   selectedAsin || null,
          focus_title:  selectedTitle || null,
          stream:       true,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const dec    = new TextDecoder();
      let buf      = "";
      let fullText = "";

      // Replace loading bubble with streaming bubble
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, loading: false, content: "" }
            : m
        )
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") break;
          try {
            const parsed = JSON.parse(d);
            if (typeof parsed === "string") {
              fullText += parsed;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === loadingId ? { ...m, content: fullText } : m
                )
              );
            }
          } catch {
            // non-JSON chunk — skip
          }
        }
      }

    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                loading: false,
                content: "Something went wrong. Make sure Ollama is running (`ollama serve`) and try again.",
              }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }, [streaming, sellerId, userEmail, userId, sessionId, selectedAsin, selectedTitle]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    // Could send to backend for improvement tracking
    console.log("Feedback:", id, type);
  };

  const handleSelectProduct = (asin: string, title: string) => {
    setSelectedAsin(asin);
    setSelectedTitle(title);
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(Math.random().toString(36).slice(2, 14));
    const greeting: Message = {
      id:        genId(),
      role:      "assistant",
      content:   "Conversation cleared. What would you like to know?",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  };

  const suggestions = selectedAsin && selectedTitle
    ? PRODUCT_SUGGESTIONS(selectedTitle.substring(0, 30))
    : STARTER_SUGGESTIONS;

  const showSuggestions = messages.length <= 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-sky-100 dark:border-slate-800 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-slate-800">
            <Menu className="w-5 h-5 text-sky-900 dark:text-sky-100" />
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              AI Advisor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Your personal store intelligence, powered by your data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedAsin && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-900 px-2.5 py-1 rounded-full">
              <Package className="w-3 h-3" />
              {selectedTitle ? selectedTitle.substring(0, 25) + "…" : selectedAsin}
            </span>
          )}
          <Badge className={`text-xs font-bold ${tier === "premium" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" : tier === "basic" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
            {tier.toUpperCase()}
          </Badge>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all"
            title="Clear conversation"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
          {!isPremium && (
            <button
              onClick={() => router.push("/subscription")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow hover:shadow-md transition-all"
            >
              <Crown className="w-3 h-3" /> Upgrade
            </button>
          )}
        </div>
      </header>

      {/* No seller ID */}
      {!sellerId && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center mt-8">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-950/40 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-sky-400 dark:text-sky-300" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">No seller account connected</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Go to My Products and connect your Seller ID first.</p>
          </div>
          <button
            onClick={() => router.push("/seller/my-products")}
            className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-semibold hover:bg-sky-700 transition-colors border-none"
          >
            Connect Seller ID
          </button>
        </div>
      )}

      {sellerId && (
        <div className="flex-1 py-6 flex gap-5 items-start">
          {/* Context panel */}
          <ContextPanel
            context={context}
            selectedAsin={selectedAsin}
            onSelectProduct={handleSelectProduct}
          />

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* Free tier gate */}
            {!isBasic && (
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden mb-5">
                <TierGate tier="basic" feature="AI Advisor — Seller Intelligence" />
                <div className="blur-sm pointer-events-none space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-350">Hey! I've analysed your store. Your top product is priced 12% above market average — here's what I'd do about it…</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-end gap-2">
                    <div className="bg-sky-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-sm shadow-sm">
                      <p className="text-sm">Which product should I focus on improving first?</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white text-center">
                  <p className="font-bold text-sm">Unlock AI Advisor — Basic · ₹1,999/mo</p>
                  <p className="text-amber-100 text-xs mt-1">Ask anything about your store. Get answers backed by your real product data.</p>
                </div>
              </div>
            )}

            {isBasic && (
              <>
                {/* Messages */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 500, maxHeight: "calc(100vh - 280px)" }}>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        onCopy={handleCopy}
                        onFeedback={handleFeedback}
                      />
                    ))}

                    {/* Starter suggestions */}
                    {showSuggestions && (
                      <div className="pt-2">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Try asking
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {suggestions.slice(0, 4).map((s, i) => (
                            <SuggestionChip key={i} text={s} onClick={() => sendMessage(s)} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                    {/* Selected product context bar */}
                    {selectedAsin && (
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-955/45 border border-sky-200 dark:border-sky-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Package className="w-2.5 h-2.5" />
                          Asking about: {selectedTitle ? selectedTitle.substring(0, 40) + "…" : selectedAsin}
                        </span>
                        <button
                          onClick={() => handleSelectProduct("", "")}
                          className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-305"
                        >
                          × Clear
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3 items-end">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          selectedAsin
                            ? `Ask about ${selectedTitle ? selectedTitle.substring(0, 25) + "…" : selectedAsin}…`
                            : "Ask anything about your store…"
                        }
                        rows={1}
                        disabled={streaming}
                        className="flex-1 resize-none bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-800 focus:border-sky-300 dark:focus:border-sky-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-32 dark:text-slate-100"
                        style={{ overflowY: "auto" }}
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = Math.min(el.scrollHeight, 128) + "px";
                        }}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={streaming || !input.trim()}
                        className="flex items-center gap-1.5 px-4 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-bold rounded-xl transition-all shrink-0 border-none"
                      >
                        {streaming
                          ? <RefreshCw className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
                      Press Enter to send · Shift+Enter for new line
                    </p>
                  </div>
                </div>

                {/* Upgrade CTA for basic */}
                {!isPremium && (
                  <div className="mt-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Unlock deeper AI insights — Premium
                      </p>
                      <p className="text-blue-100 text-xs mt-0.5">
                        AI can access your rank history, 30-day trends, and competitor data — ₹2,999/mo
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/subscription")}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-full font-bold text-xs shadow hover:shadow-md hover:scale-105 transition-all shrink-0 border-none"
                    >
                      <Crown className="w-3.5 h-3.5" /> Upgrade
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIAdvisorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    }>
      <AIAdvisorContent />
    </Suspense>
  );
}