import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot, Send, X, MessageCircle, Sparkles, TrendingUp,
  DollarSign, BarChart3, Lock, Crown, LogIn, RefreshCw, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface MarketScore {
  overall_score: number;
  demand_score: number;
  competition_score: number;
  margin_score: number;
  avg_price: number;
  avg_rating: number;
  avg_sales: number;
  total_listings: number;
  verdict: string;
}

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  intents?: string[];
  hasProactiveInsight?: boolean;
  followupQuestions?: string[];
  marketScore?: MarketScore | null;
  mode?: string;
  extractedProduct?: string | null;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const API_BASE = API_BASE_URL;

const QUICK_QUESTIONS = [
  "What products are trending now?",
  "Best profit margins?",
  "How to improve sales?",
  "Competitor analysis?",
  "Market opportunities?",
  "Price optimization tips?",
];

const SUGGESTION_ICONS: Record<string, JSX.Element> = {
  trending: <TrendingUp className="h-3 w-3" />,
  profit: <DollarSign className="h-3 w-3" />,
  sales: <BarChart3 className="h-3 w-3" />,
  default: <Sparkles className="h-3 w-3" />,
};

const MODE_LABELS: Record<string, { label: string; color: string }> = {
  viability: { label: "Viability Check", color: "bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 border dark:border-amber-900/40" },
  decision: { label: "Decision Mode", color: "bg-blue-100 dark:bg-blue-950/45 text-blue-700 dark:text-blue-400 border dark:border-blue-900/40" },
  execution: { label: "How-To Mode", color: "bg-green-100 dark:bg-green-950/45 text-green-700 dark:text-emerald-400 border dark:border-emerald-900/40" },
  deep_dive: { label: "Deep Dive", color: "bg-purple-100 dark:bg-purple-950/45 text-purple-700 dark:text-purple-400 border dark:border-purple-900/40" },
  research: { label: "Research Mode", color: "bg-gray-100 dark:bg-slate-800 text-gray-650 dark:text-slate-300 border dark:border-slate-700" },
};

// ─────────────────────────────────────────────
// MARKET SCORE CARD
// ─────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-gray-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-gray-700 dark:text-slate-200">{value}/100</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MarketScoreCard({ score, product }: { score: MarketScore; product?: string | null }) {
  const overallColor =
    score.overall_score >= 70 ? "text-green-600 dark:text-green-400" :
      score.overall_score >= 50 ? "text-amber-600 dark:text-amber-450" :
        "text-red-500 dark:text-red-400";

  return (
    <div className="mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-3 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">
          Market Score{product ? ` · ${product}` : ""}
        </span>
        <span className={cn("text-base font-bold", overallColor)}>
          {score.overall_score}/100
        </span>
      </div>
      <div className="space-y-1.5">
        <ScoreBar label="Demand" value={score.demand_score} color="bg-blue-500" />
        <ScoreBar label="Low Competition" value={score.competition_score} color="bg-green-500" />
        <ScoreBar label="Margin Room" value={score.margin_score} color="bg-purple-500" />
      </div>
      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-gray-100 dark:border-slate-800">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 dark:text-slate-500">Avg Price</p>
          <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">₹{score.avg_price.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 dark:text-slate-500">Avg Rating</p>
          <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">{score.avg_rating}★</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 dark:text-slate-500">Avg Sales</p>
          <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">~{score.avg_sales}/mo</p>
        </div>
      </div>
      <div className={cn(
        "text-center text-[11px] font-semibold py-1 rounded-md",
        score.overall_score >= 70 ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" :
          score.overall_score >= 50 ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400" :
            "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
      )}>
        {score.verdict}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STREAMING HOOK
// ─────────────────────────────────────────────

function useStreamingChat() {
  const abortRef = useRef<AbortController | null>(null);

  const streamMessage = useCallback(async (
    payload: object,
    onToken: (token: string) => void,
    onDone: (meta: {
      session_id?: string;
      intents?: string[];
      mode?: string;
      followup_questions?: string[];
      market_score?: MarketScore | null;
      had_proactive_insight?: boolean;
      extracted_product?: string | null;
    }) => void,
    onError: (err: string) => void
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/ai/query`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, stream: true }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.token !== undefined) onToken(json.token);
            if (json.done) onDone(json);
          } catch { }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") onError(err.message || "Stream failed");
    }
  }, []);

  const abort = useCallback(() => abortRef.current?.abort(), []);
  return { streamMessage, abort };
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

interface ChatbotProps {
  variant?: "floating" | "fullscreen";
}

export default function Chatbot({ variant = "floating" }: ChatbotProps) {
  const { user } = useAuth();
  const { limits, currentTier } = useSubscriptionLimits();
  const { trackAIChatUsage, getAIUsage } = useSubscriptionSync();
  const { streamMessage, abort } = useStreamingChat();

  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0 });
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isOpen, setIsOpen] = useState(variant === "fullscreen");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedSource, setSelectedSource] = useState("flipkart");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFullScreen = variant === "fullscreen";
  const isAuthenticated = !!user;
  const isChatLocked = !isAuthenticated || (
    limits.maxAIChatMessagesPerMonth < UNLIMITED &&
    aiUsage.used >= aiUsage.limit
  );

  const makeWelcomeMsg = (authed: boolean): ChatMessage => ({
    id: "welcome",
    message: authed
      ? "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending now?\n• Which category has the best ratings?\n• Can I sell wireless earbuds under ₹1500?"
      : "👋 Welcome! Please login to use the AI Assistant and get personalized insights.",
    isUser: false,
    timestamp: new Date(),
  });

  useEffect(() => { setMessages([makeWelcomeMsg(isAuthenticated)]); }, [isAuthenticated]);

  useEffect(() => {
    if (!user) { setIsLoadingUsage(false); return; }
    (async () => {
      try {
        const usage = await getAIUsage();
        setAiUsage({ used: usage.used, limit: limits.maxAIChatMessagesPerMonth });
      } catch {
        setAiUsage({ used: user?.aiChatUsed || 0, limit: limits.maxAIChatMessagesPerMonth });
      } finally {
        setIsLoadingUsage(false);
      }
    })();
  }, [user, limits.maxAIChatMessagesPerMonth]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  // Handle open state for fullscreen
  useEffect(() => {
    if (isFullScreen) setIsOpen(true);
  }, [isFullScreen]);

  // ─────────────────────────────────────────
  // SEND
  // ─────────────────────────────────────────
  const sendMessage = async (messageText?: string) => {
    if (isTyping || isStreaming) return;

    if (!isAuthenticated) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: "🔒 Please login to use the AI chatbot.\n\nClick the button below to sign in and start chatting!",
        isUser: false, timestamp: new Date(),
      }]);
      return;
    }

    if (limits.maxAIChatMessagesPerMonth < UNLIMITED && aiUsage.used >= aiUsage.limit) {
      const upgradeMsg = currentTier === 'free'
        ? "🔒 Unlock AI Advisor with Basic or Premium plan to start chatting!"
        : `🔒 You've reached your ${aiUsage.limit} AI chat limit for this month.\n\nUpgrade to ${currentTier === "basic" ? "Premium (unlimited)" : "a higher plan"} to continue.`;

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: upgradeMsg,
        isUser: false, timestamp: new Date(),
      }]);
      return;
    }

    const text = (messageText || inputMessage).trim();
    if (!text) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), message: text, isUser: true, timestamp: new Date() }]);
    setInputMessage("");

    try { await trackAIChatUsage(); setAiUsage(prev => ({ ...prev, used: prev.used + 1 })); } catch { }

    setIsTyping(true);
    const streamId = `stream-${Date.now()}`;
    let firstToken = true;

    await streamMessage(
      { question: text, source: selectedSource, limit: 50, session_id: sessionId, seller_profile: { name: user?.name || "" } },

      // onToken
      (token) => {
        if (firstToken) {
          firstToken = false;
          setIsTyping(false);
          setIsStreaming(true);
          setMessages(prev => [...prev, { id: streamId, message: token, isUser: false, timestamp: new Date(), isStreaming: true }]);
        } else {
          setMessages(prev => prev.map(m => m.id === streamId ? { ...m, message: m.message + token } : m));
        }
      },

      // onDone
      ({ session_id, intents, mode, followup_questions, market_score, had_proactive_insight, extracted_product }) => {
        if (session_id) setSessionId(session_id);
        setIsStreaming(false);
        setIsTyping(false);
        setMessages(prev => prev.map(m =>
          m.id === streamId ? {
            ...m,
            isStreaming: false,
            intents,
            mode,
            followupQuestions: followup_questions,
            marketScore: market_score,
            hasProactiveInsight: had_proactive_insight,
            extractedProduct: extracted_product,
          } : m
        ));
      },

      // onError
      () => {
        setIsTyping(false);
        setIsStreaming(false);
        setMessages(prev => [
          ...prev.filter(m => m.id !== streamId),
          { id: Date.now().toString(), message: "AI is temporarily unavailable. Please try again shortly.", isUser: false, timestamp: new Date() },
        ]);
      }
    );
  };

  const resetConversation = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/ai/reset`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch { }
    }
    abort();
    setSessionId(null);
    setIsTyping(false);
    setIsStreaming(false);
    setMessages([makeWelcomeMsg(isAuthenticated)]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const getSuggestionIcon = (s: string) => {
    const l = s.toLowerCase();
    if (l.includes("trend")) return SUGGESTION_ICONS.trending;
    if (l.includes("profit")) return SUGGESTION_ICONS.profit;
    if (l.includes("sales")) return SUGGESTION_ICONS.sales;
    return SUGGESTION_ICONS.default;
  };

  const getUsageBadgeColor = () => {
    if (!isAuthenticated) return "bg-gray-500";
    if (aiUsage.limit >= UNLIMITED) return "bg-green-500";
    const pct = (aiUsage.used / aiUsage.limit) * 100;
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className={cn(
      isFullScreen ? "w-full h-full flex flex-col" : "fixed bottom-4 right-4 z-50"
    )}>

      {/* Toggle Button - Only in floating mode */}
      {!isFullScreen && (
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-14 h-14 rounded-full text-white flex items-center justify-center",
              "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all shadow-lg",
              isChatLocked && "opacity-75"
            )}
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </Button>
          {!isAuthenticated && !isOpen && (
            <div className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-1">
              <LogIn className="h-3 w-3" />
            </div>
          )}
          {isAuthenticated && isChatLocked && !isOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
              <Lock className="h-3 w-3" />
            </div>
          )}
          {isAuthenticated && !isChatLocked && aiUsage.limit < UNLIMITED && !isOpen && (
            <div className={cn("absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold", getUsageBadgeColor())}>
              {aiUsage.limit - aiUsage.used}
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "overflow-hidden flex flex-col transition-all duration-300",
          isFullScreen 
            ? "w-full h-full flex-1 min-h-[500px] border-0 shadow-none rounded-none bg-transparent" 
            : "absolute bottom-16 right-0 w-80 h-[28rem] shadow-2xl border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900"
        )}>

          {/* Header */}
          {!isFullScreen && (
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/20 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle className="text-sm font-medium">Insydz Advisor</CardTitle>
                  <Badge variant="secondary" className="text-xs bg-white/20 border-0 text-white">
                    {isTyping ? "thinking…" : isStreaming ? "typing…" : "AI Powered"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={resetConversation} title="New conversation" className="text-white h-8 w-8 p-0 hover:bg-white/20">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                {!isFullScreen && (
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
          )}

          {/* Usage / Auth Banner */}
          {!isLoadingUsage && (
            <div className={cn(
              "px-3 py-2 text-xs flex items-center justify-between border-b border-gray-100 dark:border-slate-800",
              !isAuthenticated ? "bg-gray-50 dark:bg-slate-900/60 text-gray-700 dark:text-slate-400"
                : isChatLocked ? "bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                  : aiUsage.limit >= UNLIMITED ? "bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                    : "bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-sky-400"
            )}>
              <div className="flex items-center gap-1">
                {!isAuthenticated ? <LogIn className="h-3 w-3" />
                  : isChatLocked ? <Lock className="h-3 w-3" />
                    : aiUsage.limit >= UNLIMITED ? <Crown className="h-3 w-3" />
                      : <Sparkles className="h-3 w-3" />}
                <span className="font-medium">
                  {!isAuthenticated ? "Login Required"
                    : aiUsage.limit >= UNLIMITED ? "Unlimited AI Chats"
                      : isChatLocked ? (currentTier === 'free' ? "Unlock with Basic or Premium" : "Limit Reached")
                        : `${aiUsage.used}/${aiUsage.limit} chats used`}
                </span>
                {sessionId && isAuthenticated && !isChatLocked && (
                  <span className="ml-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-medium">
                    memory on
                  </span>
                )}
              </div>
              {!isAuthenticated ? (
                <a href="/login" className="text-xs underline hover:no-underline text-blue-600 dark:text-sky-450">Login</a>
              ) : isChatLocked && (
                <a href="/subscription" className="text-xs underline hover:no-underline text-orange-600 dark:text-amber-450">Upgrade</a>
              )}
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0 bg-white dark:bg-slate-950">
            <ScrollArea className="flex-1 p-3 sm:p-6" ref={scrollContainerRef}>
              <div className={cn(
                "mx-auto w-full px-2",
                isFullScreen ? "max-w-6xl space-y-8 pb-8" : "max-w-full space-y-4 pb-4"
              )}>
                {messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex animate-in fade-in slide-in-from-bottom-2",
                    isFullScreen ? "gap-4 sm:gap-6 w-full" : (msg.isUser ? "justify-end" : "justify-start gap-2")
                  )}>
                    {/* Avatar for AI (and User if fullscreen) */}
                    {(isFullScreen || !msg.isUser) && (
                      <Avatar className={cn(
                        "shrink-0 shadow-sm border border-slate-100 dark:border-slate-800",
                        isFullScreen ? "h-10 w-10 mt-1" : "h-8 w-8 mt-auto hidden sm:flex",
                        msg.isUser && !isFullScreen && "hidden"
                      )}>
                        {msg.isUser ? (
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-600 dark:text-cyan-400">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}

                    <div className={cn(
                      "flex flex-col gap-2",
                      isFullScreen 
                        ? "flex-1 min-w-0" 
                        : cn("max-w-[85%]", msg.isUser ? "items-end" : "items-start")
                    )}>
                      <div className={cn(
                        "break-words",
                        isFullScreen
                          ? "text-[15px] leading-relaxed text-slate-800 dark:text-slate-200"
                          : cn(
                              "rounded-2xl p-3 text-sm shadow-sm",
                              msg.isUser 
                                ? "bg-primary text-white rounded-tr-sm" 
                                : "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-sm"
                            )
                      )}>
                        <div className="whitespace-pre-wrap">
                          {msg.message}
                          {msg.isStreaming && (
                            <span className={cn(
                              "inline-block align-middle animate-pulse",
                              isFullScreen ? "w-2 h-5 bg-primary/60 ml-1 rounded-sm" : "w-1.5 h-4 bg-white/80 ml-1"
                            )} />
                          )}
                        </div>

                        {/* Proactive insight badge */}
                        {msg.hasProactiveInsight && !msg.isStreaming && (
                          <div className={cn(
                            "mt-3 flex items-center gap-1.5 font-semibold transition-all",
                            isFullScreen 
                              ? "text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 border border-amber-100 dark:border-amber-900/30 w-fit" 
                              : "text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-md p-1.5 border border-amber-100 dark:border-amber-900/30"
                          )}>
                            <Lightbulb className={isFullScreen ? "h-4 w-4" : "h-3.5 w-3.5"} />
                            <span>AI Proactive Insight Included</span>
                          </div>
                        )}

                        {/* Mode badge */}
                        {!msg.isUser && msg.mode && !msg.isStreaming && MODE_LABELS[msg.mode] && (
                          <div className={cn("mt-2", isFullScreen && "mt-3")}>
                            <span className={cn(
                              "font-bold uppercase tracking-wider rounded-full",
                              MODE_LABELS[msg.mode].color,
                              isFullScreen ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5"
                            )}>
                              {MODE_LABELS[msg.mode].label}
                            </span>
                          </div>
                        )}

                        {/* Follow-up question chips */}
                        {!msg.isUser && msg.followupQuestions && msg.followupQuestions.length > 0 && !msg.isStreaming && (
                          <div className={cn("mt-3 space-y-2", isFullScreen && "mt-5 space-y-3")}>
                            <p className={cn(
                              "font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",
                              isFullScreen ? "text-xs" : "text-[10px]"
                            )}>Suggested Actions:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.followupQuestions.map((q) => (
                                <button
                                  key={q}
                                  onClick={() => sendMessage(q)}
                                  disabled={isTyping || isStreaming || isChatLocked}
                                  className={cn(
                                    "text-left bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-primary dark:hover:bg-primary hover:text-white border border-slate-200 dark:border-slate-800 transition-all duration-200 shadow-sm disabled:opacity-40",
                                    isFullScreen ? "text-sm px-4 py-2 rounded-full" : "text-[11px] px-3 py-1.5 rounded-full"
                                  )}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!isFullScreen && (
                        <p className={cn(
                          "text-[10px] mt-1 opacity-50 font-medium",
                          msg.isUser ? "text-right" : "text-left"
                        )}>
                          {formatTime(msg.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing dots */}
                {isTyping && (
                  <div className={cn(
                    "flex animate-in fade-in",
                    isFullScreen ? "gap-4 sm:gap-6 w-full" : "justify-start gap-2"
                  )}>
                    {(isFullScreen || true) && (
                      <Avatar className={cn(
                        "shrink-0 shadow-sm border border-slate-100 dark:border-slate-800",
                        isFullScreen ? "h-10 w-10 mt-1" : "h-8 w-8 mt-auto hidden sm:flex"
                      )}>
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-600 dark:text-cyan-400">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "flex items-center space-x-3",
                      isFullScreen 
                        ? "p-2" 
                        : "bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-sm p-3"
                    )}>
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assistant is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>

            {/* Input Section */}
            <div className="border-t dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-6 shrink-0">
              <div className={cn(
                "mx-auto flex flex-col gap-3 w-full px-2",
                isFullScreen ? "max-w-6xl" : "max-w-full"
              )}>
                {/* Quick actions for fullscreen */}
                {messages.length === 1 && isAuthenticated && !isChatLocked && (
                  <div className="flex flex-wrap gap-2 justify-center pb-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="flex items-center gap-1.5 text-xs px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all rounded-full shadow-sm font-medium"
                      >
                        {getSuggestionIcon(q)}
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <Select value={selectedSource} onValueChange={setSelectedSource} disabled={isChatLocked}>
                    <SelectTrigger className="w-36 sm:w-40 text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 h-11 rounded-full border-0 shadow-none hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Data Source" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 shadow-xl">
                      <SelectItem value="flipkart">🛍 Flipkart Data</SelectItem>
                      <SelectItem value="amazon">💬 Amazon Data</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isChatLocked && sendMessage()}
                    placeholder={
                      !isAuthenticated ? "Please login to unlock AI Advisor..."
                        : isChatLocked ? (currentTier === 'free' ? "Unlock with Basic or Premium plan..." : "Usage limit reached...")
                          : "Type your query here..."
                    }
                    className="flex-1 text-sm bg-transparent border-0 text-slate-800 dark:text-slate-100 focus-visible:ring-0 shadow-none min-w-0 px-2 h-11"
                    disabled={isTyping || isStreaming || isChatLocked}
                  />

                  {isFullScreen && messages.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={resetConversation} title="Reset Chat" className="h-11 w-11 rounded-full shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  )}

                  <Button
                    onClick={() => isStreaming ? abort() : sendMessage()}
                    disabled={isChatLocked || isTyping || (!inputMessage.trim() && !isStreaming)}
                    size="icon"
                    className={cn(
                      "h-11 w-11 rounded-full shadow-md transition-all shrink-0",
                      isStreaming ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {!isAuthenticated ? <LogIn className="h-4 w-4" />
                      : isChatLocked ? <Lock className="h-4 w-4" />
                        : isTyping ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          : isStreaming ? <X className="h-4 w-4" />
                            : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 dark:from-blue-950/15 to-purple-50 dark:to-purple-950/15 border border-blue-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-blue-900 dark:text-blue-300 font-medium">🔒 Unlock real-time competitor insights with AI Advisor</p>
                  <a href="/login">
                     <Button size="sm" className="h-8 shadow-sm">
                      <LogIn className="h-3.5 w-3.5 mr-2" /> Login
                    </Button>
                  </a>
                </div>
              )}

              {isAuthenticated && isChatLocked && (
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 dark:from-orange-950/15 to-red-50 dark:to-red-950/15 border border-orange-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-orange-900 dark:text-orange-355 font-medium">
                    {currentTier === 'free' 
                      ? "🔒 Unlock AI Advisor with Basic or Premium plan."
                      : `⚠️ AI Chat usage limit (${aiUsage.limit}) reached for this month`}
                  </p>
                  <a href="/subscription">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8 shadow-sm">
                      <Crown className="h-3.5 w-3.5 mr-2" /> Upgrade
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

