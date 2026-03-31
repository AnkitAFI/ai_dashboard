import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/App";
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
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface MarketScore {
  overall_score:      number;
  demand_score:       number;
  competition_score:  number;
  margin_score:       number;
  avg_price:          number;
  avg_rating:         number;
  avg_sales:          number;
  total_listings:     number;
  verdict:            string;
}

interface ChatMessage {
  id:                   string;
  message:              string;
  isUser:               boolean;
  timestamp:            Date;
  isStreaming?:         boolean;
  intents?:             string[];
  hasProactiveInsight?: boolean;
  followupQuestions?:   string[];
  marketScore?:         MarketScore | null;
  mode?:                string;
  extractedProduct?:    string | null;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const API_BASE = "https://api.insydz.com";

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
  profit:   <DollarSign  className="h-3 w-3" />,
  sales:    <BarChart3   className="h-3 w-3" />,
  default:  <Sparkles    className="h-3 w-3" />,
};

const MODE_LABELS: Record<string, { label: string; color: string }> = {
  viability: { label: "Viability Check", color: "bg-amber-100 text-amber-700"   },
  decision:  { label: "Decision Mode",   color: "bg-blue-100 text-blue-700"     },
  execution: { label: "How-To Mode",     color: "bg-green-100 text-green-700"   },
  deep_dive: { label: "Deep Dive",       color: "bg-purple-100 text-purple-700" },
  research:  { label: "Research Mode",   color: "bg-gray-100 text-gray-600"     },
};

// ─────────────────────────────────────────────
// MARKET SCORE CARD
// ─────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{value}/100</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
    score.overall_score >= 70 ? "text-green-600" :
    score.overall_score >= 50 ? "text-amber-600" :
    "text-red-500";

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-700">
          Market Score{product ? ` · ${product}` : ""}
        </span>
        <span className={cn("text-base font-bold", overallColor)}>
          {score.overall_score}/100
        </span>
      </div>
      <div className="space-y-1.5">
        <ScoreBar label="Demand"      value={score.demand_score}      color="bg-blue-500"   />
        <ScoreBar label="Low Competition" value={score.competition_score} color="bg-green-500"  />
        <ScoreBar label="Margin Room" value={score.margin_score}      color="bg-purple-500" />
      </div>
      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Avg Price</p>
          <p className="text-[11px] font-semibold text-gray-700">₹{score.avg_price.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Avg Rating</p>
          <p className="text-[11px] font-semibold text-gray-700">{score.avg_rating}★</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Avg Sales</p>
          <p className="text-[11px] font-semibold text-gray-700">~{score.avg_sales}/mo</p>
        </div>
      </div>
      <div className={cn(
        "text-center text-[11px] font-semibold py-1 rounded-md",
        score.overall_score >= 70 ? "bg-green-50 text-green-700" :
        score.overall_score >= 50 ? "bg-amber-50 text-amber-700" :
        "bg-red-50 text-red-600"
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
    onDone:  (meta: {
      session_id?:            string;
      intents?:               string[];
      mode?:                  string;
      followup_questions?:    string[];
      market_score?:          MarketScore | null;
      had_proactive_insight?: boolean;
      extracted_product?:     string | null;
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
          } catch {}
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

export default function Chatbot() {
  const { user } = useAuth();
  const { limits, currentTier } = useSubscriptionLimits();
  const { trackAIChatUsage, getAIUsage } = useSubscriptionSync();
  const { streamMessage, abort } = useStreamingChat();

  const [aiUsage, setAiUsage]               = useState({ used: 0, limit: 0 });
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isOpen, setIsOpen]                 = useState(false);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage]     = useState("");
  const [isTyping, setIsTyping]             = useState(false);
  const [isStreaming, setIsStreaming]       = useState(false);
  const [selectedSource, setSelectedSource] = useState("flipkart");
  const [sessionId, setSessionId]           = useState<string | null>(null);

  const messagesEndRef     = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef           = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!user;
  const isChatLocked    = !isAuthenticated || (
    limits.maxAIChatMessagesPerMonth < UNLIMITED &&
    aiUsage.used >= aiUsage.limit
  );

  const makeWelcomeMsg = (authed: boolean): ChatMessage => ({
    id: "welcome",
    message: authed
      ? "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending?\n• Which category has the best ratings?\n• Can I sell wireless earbuds under ₹1500?"
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
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: `🔒 You've reached your ${aiUsage.limit} AI chat limit for this month.\n\nUpgrade to ${
          currentTier === "free" ? "Basic (20 chats)" : "Premium (unlimited)"
        } to continue.`,
        isUser: false, timestamp: new Date(),
      }]);
      return;
    }

    const text = (messageText || inputMessage).trim();
    if (!text) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), message: text, isUser: true, timestamp: new Date() }]);
    setInputMessage("");

    try { await trackAIChatUsage(); setAiUsage(prev => ({ ...prev, used: prev.used + 1 })); } catch {}

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
            isStreaming:          false,
            intents,
            mode,
            followupQuestions:    followup_questions,
            marketScore:          market_score,
            hasProactiveInsight:  had_proactive_insight,
            extractedProduct:     extracted_product,
          } : m
        ));
      },

      // onError
      () => {
        setIsTyping(false);
        setIsStreaming(false);
        setMessages(prev => [
          ...prev.filter(m => m.id !== streamId),
          { id: Date.now().toString(), message: "⚠️ I'm having trouble fetching data. Please make sure your FastAPI server is running.", isUser: false, timestamp: new Date() },
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
      } catch {}
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
    if (l.includes("trend"))  return SUGGESTION_ICONS.trending;
    if (l.includes("profit")) return SUGGESTION_ICONS.profit;
    if (l.includes("sales"))  return SUGGESTION_ICONS.sales;
    return SUGGESTION_ICONS.default;
  };

  const getUsageBadgeColor = () => {
    if (!isAuthenticated) return "bg-gray-500";
    if (aiUsage.limit >= UNLIMITED) return "bg-green-500";
    const pct = (aiUsage.used / aiUsage.limit) * 100;
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80)  return "bg-orange-500";
    return "bg-green-500";
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="fixed bottom-4 right-4 z-50">

      {/* Toggle Button */}
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

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 h-[28rem] shadow-2xl border border-gray-200 overflow-hidden flex flex-col rounded-2xl">

          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-sm font-medium">Insydz Assistant</CardTitle>
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
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Usage / Auth Banner */}
          {!isLoadingUsage && (
            <div className={cn(
              "px-3 py-2 text-xs flex items-center justify-between",
              !isAuthenticated ? "bg-gray-50 text-gray-700"
              : isChatLocked   ? "bg-red-50 text-red-700"
              : aiUsage.limit >= UNLIMITED ? "bg-green-50 text-green-700"
              : "bg-blue-50 text-blue-700"
            )}>
              <div className="flex items-center gap-1">
                {!isAuthenticated ? <LogIn className="h-3 w-3" />
                 : isChatLocked   ? <Lock className="h-3 w-3" />
                 : aiUsage.limit >= UNLIMITED ? <Crown className="h-3 w-3" />
                 : <Sparkles className="h-3 w-3" />}
                <span className="font-medium">
                  {!isAuthenticated ? "Login Required"
                   : aiUsage.limit >= UNLIMITED ? "Unlimited AI Chats"
                   : isChatLocked ? "Limit Reached"
                   : `${aiUsage.used}/${aiUsage.limit} chats used`}
                </span>
                {sessionId && isAuthenticated && !isChatLocked && (
                  <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
                    memory on
                  </span>
                )}
              </div>
              {!isAuthenticated ? (
                <a href="/login" className="text-xs underline hover:no-underline">Login</a>
              ) : isChatLocked && (
                <a href="/subscription" className="text-xs underline hover:no-underline">Upgrade</a>
              )}
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-3" ref={scrollContainerRef}>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-lg p-2 text-sm break-words whitespace-pre-wrap",
                      msg.isUser ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                    )}>
                      <p>
                        {msg.message}
                        {msg.isStreaming && (
                          <span className="inline-block w-0.5 h-3.5 bg-gray-500 ml-0.5 align-middle animate-pulse" />
                        )}
                      </p>

                      {/* Market Score Card */}
                      {!msg.isUser && msg.marketScore && !msg.isStreaming && (
                        <MarketScoreCard score={msg.marketScore} product={msg.extractedProduct} />
                      )}

                      {/* Proactive insight badge */}
                      {msg.hasProactiveInsight && !msg.isStreaming && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <Lightbulb className="h-3 w-3" />
                          <span>Bonus insight included</span>
                        </div>
                      )}

                      {/* Mode badge */}
                      {!msg.isUser && msg.mode && !msg.isStreaming && MODE_LABELS[msg.mode] && (
                        <div className="mt-1.5">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", MODE_LABELS[msg.mode].color)}>
                            {MODE_LABELS[msg.mode].label}
                          </span>
                        </div>
                      )}

                      {/* Follow-up question chips */}
                      {!msg.isUser && msg.followupQuestions && msg.followupQuestions.length > 0 && !msg.isStreaming && (
                        <div className="mt-2 space-y-1">
                          <p className="text-[10px] text-gray-400 font-medium">Ask next:</p>
                          {msg.followupQuestions.map((q) => (
                            <button
                              key={q}
                              onClick={() => sendMessage(q)}
                              disabled={isTyping || isStreaming || isChatLocked}
                              className="block w-full text-left text-[11px] px-2 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-primary/40 rounded-md text-gray-700 transition-colors disabled:opacity-40"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-xs mt-1 opacity-70 text-right">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}

                {/* Typing dots */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Section */}
            <div className="border-t bg-background p-3 space-y-2">
              <Select value={selectedSource} onValueChange={setSelectedSource} disabled={isChatLocked}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flipkart">🛍 Flipkart</SelectItem>
                  <SelectItem value="amazon">💬 Amazon</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isChatLocked && sendMessage()}
                  placeholder={
                    !isAuthenticated ? "Login to chat..."
                    : isChatLocked   ? "Upgrade to continue..."
                    : "Ask about trends, prices, or reviews..."
                  }
                  className="flex-1 text-sm"
                  disabled={isTyping || isStreaming || isChatLocked}
                />
                <Button
                  onClick={() => isStreaming ? abort() : sendMessage()}
                  disabled={isChatLocked || isTyping || (!inputMessage.trim() && !isStreaming)}
                  size="sm"
                  className={cn("px-3", isStreaming && "bg-red-500 hover:bg-red-600 border-0")}
                >
                  {!isAuthenticated ? <LogIn className="h-4 w-4" />
                   : isChatLocked   ? <Lock className="h-4 w-4" />
                   : isTyping       ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                   : isStreaming    ? <X className="h-4 w-4" />
                   : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Quick question chips — first message only */}
              {messages.length === 1 && isAuthenticated && !isChatLocked && (
                <div className="flex flex-wrap gap-1">
                  {QUICK_QUESTIONS.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    >
                      {getSuggestionIcon(q)}
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-900 mb-2">🔒 Login to unlock AI-powered insights</p>
                  <a href="/login">
                    <Button size="sm" className="w-full text-xs h-7">
                      <LogIn className="h-3 w-3 mr-1" /> Login to Chat
                    </Button>
                  </a>
                </div>
              )}

              {isAuthenticated && isChatLocked && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-2">
                  <p className="text-xs text-orange-900 mb-2">🔒 You've used all {aiUsage.limit} free chats this month</p>
                  <a href="/subscription">
                    <Button size="sm" className="w-full text-xs h-7">
                      <Crown className="h-3 w-3 mr-1" /> Upgrade Plan
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
