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
import { useSessionState } from "@/hooks/use-session-state";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useSelectedProduct } from "@/lib/selected-product-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
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
function TierGate({ tier, feature }: { tier: "basic" | "premium" | "enterprise"; feature: string }) {
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
      className="group flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all duration-200
        bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60
        hover:border-sky-400/60 dark:hover:border-sky-500/50 hover:bg-sky-50/80 dark:hover:bg-sky-950/30
        hover:text-sky-700 dark:hover:text-sky-300 hover:shadow-sm
        text-slate-600 dark:text-slate-400 backdrop-blur-sm"
    >
      <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-sky-200 dark:group-hover:shadow-sky-900 transition-shadow">
        <ChevronRight className="w-3 h-3 text-white" />
      </span>
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
      <div className="flex items-end justify-end gap-2.5">
        <div className="max-w-[78%] bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed shadow-md shadow-sky-200/50 dark:shadow-sky-900/30">
          {message.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-950/60 dark:to-blue-950/60 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
          <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5">
      {/* AI orb avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 flex items-center justify-center flex-shrink-0 mb-1 shadow-md shadow-blue-200/60 dark:shadow-blue-900/40 ring-2 ring-white/80 dark:ring-slate-900/80">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[82%] group">
        <div className={cn(
          "rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm",
          "bg-white dark:bg-slate-800/80 border border-slate-100/80 dark:border-slate-700/60 backdrop-blur-sm",
          message.loading ? "min-w-[72px]" : ""
        )}>
          {message.loading ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 bg-sky-300 dark:bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-cyan-300 dark:bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
        {/* Actions */}
        {!message.loading && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFeedback(message.id, "up")}
              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Helpful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFeedback(message.id, "down")}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
function ContextPanel({ context, selectedAsin, onSelectProduct, t }: {
  context:         SellerContext | null;
  selectedAsin:    string;
  onSelectProduct: (asin: string, title: string) => void;
  t:               any;
}) {
  if (!context) return null;

  return (
    <div className="w-64 shrink-0 space-y-3 hidden lg:block">
      {/* Store summary card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50/50 to-white dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900" />
        <div className="relative p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
              <BarChart2 className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sellerPages.yourStore', 'YOUR STORE')}</p>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Package className="w-3 h-3" />
                {t('sellerPages.products', "Products")}
              </div>
              <span className="text-sm font-black text-sky-600 dark:text-sky-400">{context.total_products}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Star className="w-3 h-3" />
                {t('sellerPages.avgRating', "Avg Rating")}
              </div>
              <span className="text-sm font-black text-amber-500">{context.avg_rating?.toFixed(1) || "—"}★</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product selector */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ask about a product</p>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          <button
            onClick={() => onSelectProduct("", "All products")}
            className={cn(
              "w-full text-left px-3 py-2 rounded-xl text-xs transition-all",
              selectedAsin === ""
                ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-800/60 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
            )}
          >
            All products
          </button>
          {context.products.map((p, i) => (
            <button
              key={`${p.asin}-${i}`}
              onClick={() => onSelectProduct(p.asin, p.title)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-xs transition-all",
                selectedAsin === p.asin
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-800/60 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
              )}
            >
              <span className="line-clamp-2 leading-relaxed">{p.title}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">{p.asin}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tips card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-800/30 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/20" />
        <div className="relative p-4">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2.5">
            <Lightbulb className="w-3.5 h-3.5" /> {t('sellerPages.tips', 'Tips')}
          </p>
          <div className="space-y-1.5 text-[11px] text-amber-700/80 dark:text-amber-400/70">
            <p className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-amber-400 dark:bg-amber-600" />• {t('sellerPages.tip1', 'Select a product to ask specific questions')}</p>
            <p className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-amber-400 dark:bg-amber-600" />• {t('sellerPages.tip2', 'Ask about pricing, reviews, or keywords')}</p>
            <p className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-amber-400 dark:bg-amber-600" />• {t('sellerPages.tip3', 'Compare your performance vs competitors')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Starter Suggestions ───────────────────────────────────────────────────────
const getStarterSuggestions = (t: any) => [
  t('sellerPages.ask1', "How is my store performing overall?"),
  t('sellerPages.ask2', "Which of my products has the worst reviews and what should I do?"),
  t('sellerPages.ask3', "Am I priced competitively against the market?"),
  t('sellerPages.ask4', "Which product should I focus on improving first?"),
  "What keywords am I missing from my top product?",
  "How do my review ratings compare to competitors?",
];

const getProductSuggestions = (title: string, t: any) => [
  `Why isn't ${title} selling better?`,
  `How should I price ${title} vs competitors?`,
  `What keywords is ${title} missing?`,
  `How are ${title} reviews compared to rivals?`,
  `Should I raise or lower the price of ${title}?`,
];

// ── Main Component ────────────────────────────────────────────────────────────
function AIAdvisorContent() {
  const { t } = useTranslation();
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
  const isBasic   = tier === "basic" || tier === "premium" || tier === "enterprise";
  const isPremium = tier === "premium" || tier === "enterprise";

  const [messages,      setMessages]      = useSessionState<Message[]>("seller_ai_messages", []);
  const [input,         setInput]         = useSessionState("seller_ai_input", "");
  const [streaming,     setStreaming]     = useState(false);
  const [context,       setContext]       = useSessionState<SellerContext | null>("seller_ai_context", null);
  const [contextLoading,setContextLoading]= useState(false);
  const [selectedAsin,  setSelectedAsin]  = useSessionState("seller_ai_asin", selected?.asin || "");
  const [selectedTitle, setSelectedTitle] = useSessionState("seller_ai_title", "");
  const [sessionId,     setSessionId]     = useSessionState("seller_ai_session", Math.random().toString(36).slice(2, 14));
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
    if (!sellerId || context) return;
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
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [{
        id:        genId(),
        role:      "assistant",
        content:   `${t('sellerPages.aiGreeting1', "Hey! I'm your AI store advisor. I have full access to your product data, pricing, reviews, and rank history.")}\n\n${t('sellerPages.aiGreeting2', "Ask me anything about your store — I'll give you straight answers backed by your actual data.")}`,
        timestamp: new Date(),
      }];
    });
  }, [sellerId, t]);

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
                content: "Something went wrong. Make sure Insydz is running and try again.",
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
    ? getProductSuggestions(selectedTitle.substring(0, 30), t)
    : getStarterSuggestions(t);

  const showSuggestions = messages.length <= 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-slate-800">
            <Menu className="w-5 h-5 text-sky-900 dark:text-sky-100" />
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-3">
            {/* Animated AI orb */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-200/60 dark:shadow-blue-900/40">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {t('sellerPages.aiAdvisorTitle', 'AI Advisor')}
                <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">LIVE</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{t('sellerPages.aiAdvisorSubtitle', 'Your personal store intelligence, powered by your data')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedAsin && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-900 px-2.5 py-1 rounded-full">
              <Package className="w-3 h-3" />
              {selectedTitle ? selectedTitle.substring(0, 25) + "…" : selectedAsin}
            </span>
          )}
          <Badge className={`text-xs font-bold ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : tier === "premium" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" : tier === "basic" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
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
            t={t}
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
                <div
                  className="flex-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-md overflow-hidden flex flex-col"
                  style={{ minHeight: 500, maxHeight: "calc(100vh - 280px)",
                    background: isDark
                      ? "linear-gradient(145deg, #0f172a 0%, #111827 60%, #0c1525 100%)"
                      : "linear-gradient(145deg, #f8fafc 0%, #f0f6ff 60%, #f5f9ff 100%)"
                  }}
                >
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
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
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" /> {t('sellerPages.tryAsking', 'Try asking')}
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
                  <div className="border-t border-slate-200/60 dark:border-slate-700/40 p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                    {/* Selected product context bar */}
                    {selectedAsin && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800/50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Package className="w-2.5 h-2.5" />
                          Asking about: {selectedTitle ? selectedTitle.substring(0, 40) + "…" : selectedAsin}
                        </span>
                        <button
                          onClick={() => handleSelectProduct("", "")}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          × Clear
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={
                            selectedAsin
                              ? `Ask about ${selectedTitle ? selectedTitle.substring(0, 25) + "…" : selectedAsin}…`
                              : t('sellerPages.askPlaceholder', "Ask anything about your store…")
                          }
                          rows={1}
                          disabled={streaming}
                          className="w-full resize-none bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40 dark:focus:ring-sky-700/50 focus:border-sky-400/60 dark:focus:border-sky-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-32 dark:text-slate-100 shadow-sm"
                          style={{ overflowY: "auto" }}
                          onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = "auto";
                            el.style.height = Math.min(el.scrollHeight, 128) + "px";
                          }}
                        />
                      </div>
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={streaming || !input.trim()}
                        className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-md shadow-sky-200/50 dark:shadow-sky-900/30 disabled:shadow-none hover:shadow-sky-300/60 hover:scale-105 shrink-0 border-none"
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