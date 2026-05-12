// import { useState, useRef, useEffect, useCallback } from "react";
// import { useAuth } from "@/lib/auth-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Bot, Send, X, MessageCircle, Sparkles, TrendingUp,
//   DollarSign, BarChart3, Lock, Crown, LogIn, RefreshCw, Lightbulb,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useSubscriptionLimits, UNLIMITED } from "@/hooks/use-subscription-limits";
// import { useSubscriptionSync } from "@/hooks/use-subscription-sync";

// // ─────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────

// interface MarketScore {
//   overall_score: number;
//   demand_score: number;
//   competition_score: number;
//   margin_score: number;
//   avg_price: number;
//   avg_rating: number;
//   avg_sales: number;
//   total_listings: number;
//   verdict: string;
// }

// interface ChatMessage {
//   id: string;
//   message: string;
//   isUser: boolean;
//   timestamp: Date;
//   isStreaming?: boolean;
//   intents?: string[];
//   hasProactiveInsight?: boolean;
//   followupQuestions?: string[];
//   marketScore?: MarketScore | null;
//   mode?: string;
//   extractedProduct?: string | null;
// }

// // ─────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// const QUICK_QUESTIONS = [
//   "What products are trending now?",
//   "Best profit margins?",
//   "How to improve sales?",
//   "Competitor analysis?",
//   "Market opportunities?",
//   "Price optimization tips?",
// ];

// const SUGGESTION_ICONS: Record<string, JSX.Element> = {
//   trending: <TrendingUp className="h-3 w-3" />,
//   profit: <DollarSign className="h-3 w-3" />,
//   sales: <BarChart3 className="h-3 w-3" />,
//   default: <Sparkles className="h-3 w-3" />,
// };

// const MODE_LABELS: Record<string, { label: string; color: string }> = {
//   viability: { label: "Viability Check", color: "bg-amber-100 text-amber-700" },
//   decision: { label: "Decision Mode", color: "bg-blue-100 text-blue-700" },
//   execution: { label: "How-To Mode", color: "bg-green-100 text-green-700" },
//   deep_dive: { label: "Deep Dive", color: "bg-purple-100 text-purple-700" },
//   research: { label: "Research Mode", color: "bg-gray-100 text-gray-600" },
// };

// // ─────────────────────────────────────────────
// // MARKET SCORE CARD
// // ─────────────────────────────────────────────

// function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
//   return (
//     <div className="space-y-0.5">
//       <div className="flex justify-between text-[10px]">
//         <span className="text-gray-500">{label}</span>
//         <span className="font-semibold text-gray-700">{value}/100</span>
//       </div>
//       <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//         <div
//           className={cn("h-full rounded-full transition-all", color)}
//           style={{ width: `${value}%` }}
//         />
//       </div>
//     </div>
//   );
// }

// function MarketScoreCard({ score, product }: { score: MarketScore; product?: string | null }) {
//   const overallColor =
//     score.overall_score >= 70 ? "text-green-600" :
//       score.overall_score >= 50 ? "text-amber-600" :
//         "text-red-500";

//   return (
//     <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 shadow-sm">
//       <div className="flex items-center justify-between">
//         <span className="text-[11px] font-semibold text-gray-700">
//           Market Score{product ? ` · ${product}` : ""}
//         </span>
//         <span className={cn("text-base font-bold", overallColor)}>
//           {score.overall_score}/100
//         </span>
//       </div>
//       <div className="space-y-1.5">
//         <ScoreBar label="Demand" value={score.demand_score} color="bg-blue-500" />
//         <ScoreBar label="Low Competition" value={score.competition_score} color="bg-green-500" />
//         <ScoreBar label="Margin Room" value={score.margin_score} color="bg-purple-500" />
//       </div>
//       <div className="grid grid-cols-3 gap-1 pt-1 border-t border-gray-100">
//         <div className="text-center">
//           <p className="text-[10px] text-gray-400">Avg Price</p>
//           <p className="text-[11px] font-semibold text-gray-700">₹{score.avg_price.toLocaleString("en-IN")}</p>
//         </div>
//         <div className="text-center">
//           <p className="text-[10px] text-gray-400">Avg Rating</p>
//           <p className="text-[11px] font-semibold text-gray-700">{score.avg_rating}★</p>
//         </div>
//         <div className="text-center">
//           <p className="text-[10px] text-gray-400">Avg Sales</p>
//           <p className="text-[11px] font-semibold text-gray-700">~{score.avg_sales}/mo</p>
//         </div>
//       </div>
//       <div className={cn(
//         "text-center text-[11px] font-semibold py-1 rounded-md",
//         score.overall_score >= 70 ? "bg-green-50 text-green-700" :
//           score.overall_score >= 50 ? "bg-amber-50 text-amber-700" :
//             "bg-red-50 text-red-600"
//       )}>
//         {score.verdict}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // STREAMING HOOK
// // ─────────────────────────────────────────────

// function useStreamingChat() {
//   const abortRef = useRef<AbortController | null>(null);

//   const streamMessage = useCallback(async (
//     payload: object,
//     onToken: (token: string) => void,
//     onDone: (meta: {
//       session_id?: string;
//       intents?: string[];
//       mode?: string;
//       followup_questions?: string[];
//       market_score?: MarketScore | null;
//       had_proactive_insight?: boolean;
//       extracted_product?: string | null;
//     }) => void,
//     onError: (err: string) => void
//   ) => {
//     abortRef.current?.abort();
//     abortRef.current = new AbortController();

//     try {
//       const res = await fetch(`${API_BASE}/ai/query`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...payload, stream: true }),
//         signal: abortRef.current.signal,
//       });

//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const reader = res.body?.getReader();
//       if (!reader) throw new Error("No stream body");

//       const decoder = new TextDecoder();
//       let buffer = "";

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split("\n");
//         buffer = lines.pop() || "";
//         for (const line of lines) {
//           if (!line.startsWith("data: ")) continue;
//           try {
//             const json = JSON.parse(line.slice(6));
//             if (json.token !== undefined) onToken(json.token);
//             if (json.done) onDone(json);
//           } catch { }
//         }
//       }
//     } catch (err: any) {
//       if (err.name !== "AbortError") onError(err.message || "Stream failed");
//     }
//   }, []);

//   const abort = useCallback(() => abortRef.current?.abort(), []);
//   return { streamMessage, abort };
// }

// // ─────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────

// interface ChatbotProps {
//   variant?: "floating" | "fullscreen";
// }

// export default function Chatbot({ variant = "floating" }: ChatbotProps) {
//   const { user } = useAuth();
//   const { limits, currentTier } = useSubscriptionLimits();
//   const { trackAIChatUsage, getAIUsage } = useSubscriptionSync();
//   const { streamMessage, abort } = useStreamingChat();

//   const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0 });
//   const [isLoadingUsage, setIsLoadingUsage] = useState(true);
//   const [isOpen, setIsOpen] = useState(variant === "fullscreen");
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [selectedSource, setSelectedSource] = useState("flipkart");
//   const [sessionId, setSessionId] = useState<string | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const isFullScreen = variant === "fullscreen";
//   const isAuthenticated = !!user;
//   const isChatLocked = !isAuthenticated || (
//     limits.maxAIChatMessagesPerMonth < UNLIMITED &&
//     aiUsage.used >= aiUsage.limit
//   );

//   const makeWelcomeMsg = (authed: boolean): ChatMessage => ({
//     id: "welcome",
//     message: authed
//       ? "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending now?\n• Which category has the best ratings?\n• Can I sell wireless earbuds under ₹1500?"
//       : "👋 Welcome! Please login to use the AI Assistant and get personalized insights.",
//     isUser: false,
//     timestamp: new Date(),
//   });

//   useEffect(() => { setMessages([makeWelcomeMsg(isAuthenticated)]); }, [isAuthenticated]);

//   useEffect(() => {
//     if (!user) { setIsLoadingUsage(false); return; }
//     (async () => {
//       try {
//         const usage = await getAIUsage();
//         setAiUsage({ used: usage.used, limit: limits.maxAIChatMessagesPerMonth });
//       } catch {
//         setAiUsage({ used: user?.aiChatUsed || 0, limit: limits.maxAIChatMessagesPerMonth });
//       } finally {
//         setIsLoadingUsage(false);
//       }
//     })();
//   }, [user, limits.maxAIChatMessagesPerMonth]);

//   const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   useEffect(() => { scrollToBottom(); }, [messages, isTyping]);
//   useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

//   // Handle open state for fullscreen
//   useEffect(() => {
//     if (isFullScreen) setIsOpen(true);
//   }, [isFullScreen]);

//   // ─────────────────────────────────────────
//   // SEND
//   // ─────────────────────────────────────────
//   const sendMessage = async (messageText?: string) => {
//     if (isTyping || isStreaming) return;

//     if (!isAuthenticated) {
//       setMessages(prev => [...prev, {
//         id: Date.now().toString(),
//         message: "🔒 Please login to use the AI chatbot.\n\nClick the button below to sign in and start chatting!",
//         isUser: false, timestamp: new Date(),
//       }]);
//       return;
//     }

//     if (limits.maxAIChatMessagesPerMonth < UNLIMITED && aiUsage.used >= aiUsage.limit) {
//       const upgradeMsg = currentTier === 'free'
//         ? "🔒 Unlock AI Advisor with Basic or Premium plan to start chatting!"
//         : `🔒 You've reached your ${aiUsage.limit} AI chat limit for this month.\n\nUpgrade to ${currentTier === "basic" ? "Premium (unlimited)" : "a higher plan"} to continue.`;

//       setMessages(prev => [...prev, {
//         id: Date.now().toString(),
//         message: upgradeMsg,
//         isUser: false, timestamp: new Date(),
//       }]);
//       return;
//     }

//     const text = (messageText || inputMessage).trim();
//     if (!text) return;

//     setMessages(prev => [...prev, { id: Date.now().toString(), message: text, isUser: true, timestamp: new Date() }]);
//     setInputMessage("");

//     try { await trackAIChatUsage(); setAiUsage(prev => ({ ...prev, used: prev.used + 1 })); } catch { }

//     setIsTyping(true);
//     const streamId = `stream-${Date.now()}`;
//     let firstToken = true;

//     await streamMessage(
//       { question: text, source: selectedSource, limit: 50, session_id: sessionId, seller_profile: { name: user?.name || "" } },

//       // onToken
//       (token) => {
//         if (firstToken) {
//           firstToken = false;
//           setIsTyping(false);
//           setIsStreaming(true);
//           setMessages(prev => [...prev, { id: streamId, message: token, isUser: false, timestamp: new Date(), isStreaming: true }]);
//         } else {
//           setMessages(prev => prev.map(m => m.id === streamId ? { ...m, message: m.message + token } : m));
//         }
//       },

//       // onDone
//       ({ session_id, intents, mode, followup_questions, market_score, had_proactive_insight, extracted_product }) => {
//         if (session_id) setSessionId(session_id);
//         setIsStreaming(false);
//         setIsTyping(false);
//         setMessages(prev => prev.map(m =>
//           m.id === streamId ? {
//             ...m,
//             isStreaming: false,
//             intents,
//             mode,
//             followupQuestions: followup_questions,
//             marketScore: market_score,
//             hasProactiveInsight: had_proactive_insight,
//             extractedProduct: extracted_product,
//           } : m
//         ));
//       },

//       // onError
//       () => {
//         setIsTyping(false);
//         setIsStreaming(false);
//         setMessages(prev => [
//           ...prev.filter(m => m.id !== streamId),
//           { id: Date.now().toString(), message: "⚠️ I'm having trouble fetching data. Please make sure your FastAPI server is running.", isUser: false, timestamp: new Date() },
//         ]);
//       }
//     );
//   };

//   const resetConversation = async () => {
//     if (sessionId) {
//       try {
//         await fetch(`${API_BASE}/ai/reset`, {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ session_id: sessionId }),
//         });
//       } catch { }
//     }
//     abort();
//     setSessionId(null);
//     setIsTyping(false);
//     setIsStreaming(false);
//     setMessages([makeWelcomeMsg(isAuthenticated)]);
//   };

//   const formatTime = (date: Date) =>
//     date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

//   const getSuggestionIcon = (s: string) => {
//     const l = s.toLowerCase();
//     if (l.includes("trend")) return SUGGESTION_ICONS.trending;
//     if (l.includes("profit")) return SUGGESTION_ICONS.profit;
//     if (l.includes("sales")) return SUGGESTION_ICONS.sales;
//     return SUGGESTION_ICONS.default;
//   };

//   const getUsageBadgeColor = () => {
//     if (!isAuthenticated) return "bg-gray-500";
//     if (aiUsage.limit >= UNLIMITED) return "bg-green-500";
//     const pct = (aiUsage.used / aiUsage.limit) * 100;
//     if (pct >= 100) return "bg-red-500";
//     if (pct >= 80) return "bg-orange-500";
//     return "bg-green-500";
//   };

//   // ─────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────
//   return (
//     <div className={cn(
//       isFullScreen ? "w-full h-full flex flex-col" : "fixed bottom-4 right-4 z-50"
//     )}>

//       {/* Toggle Button - Only in floating mode */}
//       {!isFullScreen && (
//         <div className="relative">
//           <Button
//             onClick={() => setIsOpen(!isOpen)}
//             className={cn(
//               "w-14 h-14 rounded-full text-white flex items-center justify-center",
//               "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all shadow-lg",
//               isChatLocked && "opacity-75"
//             )}
//           >
//             {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
//           </Button>
//           {!isAuthenticated && !isOpen && (
//             <div className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-1">
//               <LogIn className="h-3 w-3" />
//             </div>
//           )}
//           {isAuthenticated && isChatLocked && !isOpen && (
//             <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
//               <Lock className="h-3 w-3" />
//             </div>
//           )}
//           {isAuthenticated && !isChatLocked && aiUsage.limit < UNLIMITED && !isOpen && (
//             <div className={cn("absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold", getUsageBadgeColor())}>
//               {aiUsage.limit - aiUsage.used}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Chat Window */}
//       {isOpen && (
//         <Card className={cn(
//           "shadow-2xl border border-gray-200 overflow-hidden flex flex-col rounded-2xl transition-all duration-300",
//           isFullScreen 
//             ? "w-full flex-1 h-[calc(100vh-12rem)] min-h-[500px]" 
//             : "absolute bottom-16 right-0 w-80 h-[28rem]"
//         )}>

//           {/* Header */}
//           <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-3 flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Avatar className="h-8 w-8">
//                 <AvatarFallback className="bg-white/20 text-white">
//                   <Bot className="h-4 w-4" />
//                 </AvatarFallback>
//               </Avatar>
//               <div className="flex flex-col">
//                 <CardTitle className="text-sm font-medium">Insydz Advisor</CardTitle>
//                 <Badge variant="secondary" className="text-xs bg-white/20 border-0 text-white">
//                   {isTyping ? "thinking…" : isStreaming ? "typing…" : "AI Powered"}
//                 </Badge>
//               </div>
//             </div>
//             <div className="flex items-center gap-1">
//               {messages.length > 1 && (
//                 <Button variant="ghost" size="sm" onClick={resetConversation} title="New conversation" className="text-white h-8 w-8 p-0 hover:bg-white/20">
//                   <RefreshCw className="h-3.5 w-3.5" />
//                 </Button>
//               )}
//               {!isFullScreen && (
//                 <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white h-8 w-8 p-0">
//                   <X className="h-4 w-4" />
//                 </Button>
//               )}
//             </div>
//           </CardHeader>

//           {/* Usage / Auth Banner */}
//           {!isLoadingUsage && (
//             <div className={cn(
//               "px-3 py-2 text-xs flex items-center justify-between",
//               !isAuthenticated ? "bg-gray-50 text-gray-700"
//                 : isChatLocked ? "bg-red-50 text-red-700"
//                   : aiUsage.limit >= UNLIMITED ? "bg-green-50 text-green-700"
//                     : "bg-blue-50 text-blue-700"
//             )}>
//               <div className="flex items-center gap-1">
//                 {!isAuthenticated ? <LogIn className="h-3 w-3" />
//                   : isChatLocked ? <Lock className="h-3 w-3" />
//                     : aiUsage.limit >= UNLIMITED ? <Crown className="h-3 w-3" />
//                       : <Sparkles className="h-3 w-3" />}
//                 <span className="font-medium">
//                   {!isAuthenticated ? "Login Required"
//                     : aiUsage.limit >= UNLIMITED ? "Unlimited AI Chats"
//                       : isChatLocked ? (currentTier === 'free' ? "Unlock with Basic or Premium" : "Limit Reached")
//                         : `${aiUsage.used}/${aiUsage.limit} chats used`}
//                 </span>
//                 {sessionId && isAuthenticated && !isChatLocked && (
//                   <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
//                     memory on
//                   </span>
//                 )}
//               </div>
//               {!isAuthenticated ? (
//                 <a href="/login" className="text-xs underline hover:no-underline">Login</a>
//               ) : isChatLocked && (
//                 <a href="/subscription" className="text-xs underline hover:no-underline">Upgrade</a>
//               )}
//             </div>
//           )}

//           {/* Messages */}
//           <CardContent className="flex-1 flex flex-col overflow-hidden p-0 bg-white">
//             <ScrollArea className="flex-1 p-3 px-4" ref={scrollContainerRef}>
//               <div className="space-y-4 max-w-4xl mx-auto">
//                 {messages.map((msg) => (
//                   <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2")}>
//                     <div className={cn(
//                       "max-w-[85%] rounded-2xl p-3 text-sm break-words shadow-sm",
//                       msg.isUser 
//                         ? "bg-primary text-white rounded-tr-none" 
//                         : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
//                     )}>
//                       <div className="whitespace-pre-wrap leading-relaxed">
//                         {msg.message}
//                         {msg.isStreaming && (
//                           <span className="inline-block w-1.5 h-4 bg-primary ml-1 align-middle animate-pulse" />
//                         )}
//                       </div>

//                       {/* Market Score Card */}
//                       {!msg.isUser && msg.marketScore && !msg.isStreaming && (
//                         <MarketScoreCard score={msg.marketScore} product={msg.extractedProduct} />
//                       )}

//                       {/* Proactive insight badge */}
//                       {msg.hasProactiveInsight && !msg.isStreaming && (
//                         <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold bg-amber-50 rounded-md p-1.5 border border-amber-100 transition-all hover:bg-amber-100">
//                           <Lightbulb className="h-3.5 w-3.5" />
//                           <span>AI Proactive Insight Included</span>
//                         </div>
//                       )}

//                       {/* Mode badge */}
//                       {!msg.isUser && msg.mode && !msg.isStreaming && MODE_LABELS[msg.mode] && (
//                         <div className="mt-2">
//                           <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", MODE_LABELS[msg.mode].color)}>
//                             {MODE_LABELS[msg.mode].label}
//                           </span>
//                         </div>
//                       )}

//                       {/* Follow-up question chips */}
//                       {!msg.isUser && msg.followupQuestions && msg.followupQuestions.length > 0 && !msg.isStreaming && (
//                         <div className="mt-3 space-y-2">
//                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suggested Actions:</p>
//                           <div className="flex flex-wrap gap-2">
//                             {msg.followupQuestions.map((q) => (
//                               <button
//                                 key={q}
//                                 onClick={() => sendMessage(q)}
//                                 disabled={isTyping || isStreaming || isChatLocked}
//                                 className="text-left text-[11px] px-3 py-1.5 bg-white hover:bg-primary hover:text-white border border-slate-200 rounded-full transition-all duration-200 shadow-sm disabled:opacity-40"
//                               >
//                                 {q}
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <p className={cn(
//                         "text-[10px] mt-2 opacity-50 font-medium",
//                         msg.isUser ? "text-right" : "text-left"
//                       )}>
//                         {formatTime(msg.timestamp)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Typing dots */}
//                 {isTyping && (
//                   <div className="flex justify-start animate-in fade-in">
//                     <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-3 flex items-center space-x-3">
//                       <div className="flex space-x-1.5">
//                         <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
//                         <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
//                         <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
//                       </div>
//                       <span className="text-xs text-slate-500 font-medium">Assistant is thinking...</span>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>

//             {/* Input Section */}
//             <div className="border-t bg-slate-50/50 p-4 space-y-3">
//               <div className="max-w-4xl mx-auto space-y-3">
//                 <Select value={selectedSource} onValueChange={setSelectedSource} disabled={isChatLocked}>
//                   <SelectTrigger className="w-40 text-xs bg-white h-8">
//                     <SelectValue placeholder="Data Source" />
//                   </SelectTrigger>
//                   <SelectContent className="rounded-xl border-slate-200 shadow-xl">
//                     <SelectItem value="flipkart">🛍 Flipkart Data</SelectItem>
//                     <SelectItem value="amazon">💬 Amazon Data</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <div className="flex space-x-2">
//                   <Input
//                     ref={inputRef}
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && !isChatLocked && sendMessage()}
//                     placeholder={
//                       !isAuthenticated ? "Please login to unlock AI Advisor..."
//                         : isChatLocked ? (currentTier === 'free' ? "Unlock with Basic or Premium plan..." : "Usage limit reached. Upgrade to continue...")
//                           : "Type your query here (e.g., 'What are the top electronics trending on Flipkart?')..."
//                     }
//                     className="flex-1 text-sm bg-white border-slate-200 focus:ring-primary h-11 rounded-xl shadow-sm"
//                     disabled={isTyping || isStreaming || isChatLocked}
//                   />
//                   <Button
//                     onClick={() => isStreaming ? abort() : sendMessage()}
//                     disabled={isChatLocked || isTyping || (!inputMessage.trim() && !isStreaming)}
//                     size="icon"
//                     className={cn(
//                       "h-11 w-11 rounded-xl shadow-md transition-all",
//                       isStreaming ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
//                     )}
//                   >
//                     {!isAuthenticated ? <LogIn className="h-5 w-5" />
//                       : isChatLocked ? <Lock className="h-5 w-5" />
//                         : isTyping ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                           : isStreaming ? <X className="h-5 w-5" />
//                             : <Send className="h-5 w-5" />}
//                   </Button>
//                 </div>

//                 {/* Quick actions for fullscreen */}
//                 {messages.length === 1 && isAuthenticated && !isChatLocked && (
//                   <div className="flex flex-wrap gap-2 justify-center py-1">
//                     {QUICK_QUESTIONS.map((q) => (
//                       <button
//                         key={q}
//                         onClick={() => sendMessage(q)}
//                         className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 transition-all shadow-sm font-medium"
//                       >
//                         {getSuggestionIcon(q)}
//                         {q}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {!isAuthenticated && (
//                 <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
//                   <p className="text-xs text-blue-900 font-medium">🔒 Unlock real-time competitor insights with AI Advisor</p>
//                   <a href="/login">
//                     <Button size="sm" className="h-8 shadow-sm">
//                       <LogIn className="h-3.5 w-3.5 mr-2" /> Login
//                     </Button>
//                   </a>
//                 </div>
//               )}

//               {isAuthenticated && isChatLocked && (
//                 <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between">
//                   <p className="text-xs text-orange-900 font-medium">
//                     {currentTier === 'free' 
//                       ? "🔒 Unlock AI Advisor with Basic or Premium plan."
//                       : `⚠️ AI Chat usage limit (${aiUsage.limit}) reached for this month`}
//                   </p>
//                   <a href="/subscription">
//                     <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8 shadow-sm">
//                       <Crown className="h-3.5 w-3.5 mr-2" /> Upgrade
//                     </Button>
//                   </a>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }


import { useState, useRef, useEffect, useCallback } from "react";
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
  Mic, MicOff, Volume2, VolumeX, Square, Loader2,
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
  isVoice?: boolean;       // message came from mic
  audioBase64?: string;    // WAV audio for this AI message
}

type VoiceState = "idle" | "recording" | "transcribing" | "playing";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  viability: { label: "Viability Check", color: "bg-amber-100 text-amber-700" },
  decision: { label: "Decision Mode", color: "bg-blue-100 text-blue-700" },
  execution: { label: "How-To Mode", color: "bg-green-100 text-green-700" },
  deep_dive: { label: "Deep Dive", color: "bg-purple-100 text-purple-700" },
  research: { label: "Research Mode", color: "bg-gray-100 text-gray-600" },
};

// Supported MIME types for MediaRecorder, in preference order
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function getSupportedMimeType(): string {
  for (const type of PREFERRED_MIME_TYPES) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm"; // fallback
}

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
        <ScoreBar label="Demand" value={score.demand_score} color="bg-blue-500" />
        <ScoreBar label="Low Competition" value={score.competition_score} color="bg-green-500" />
        <ScoreBar label="Margin Room" value={score.margin_score} color="bg-purple-500" />
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
// VOICE WAVEFORM ANIMATION
// ─────────────────────────────────────────────

function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-4">
      {[1, 2, 3, 4, 3].map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-white transition-all",
            active ? "animate-pulse" : "opacity-50"
          )}
          style={{
            height: active ? `${h * 4}px` : "4px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
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
      audio_base64?: string | null;
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
// VOICE HOOK  (STT + TTS)
// ─────────────────────────────────────────────

function useVoice() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── STT: Record mic → transcribe via /ai/stt ──
  const startRecording = useCallback(async (): Promise<void> => {
    chunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(100); // collect in 100ms chunks
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return reject(new Error("No recorder"));

      recorder.onstop = async () => {
        // Stop mic tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());

        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";

        const formData = new FormData();
        formData.append("audio", blob, `recording.${ext}`);
        formData.append("language", "");  // auto-detect

        try {
          const res = await fetch(`${API_BASE}/ai/stt`, {
            method: "POST",
            credentials: "include",
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `STT failed: ${res.status}`);
          }
          const data = await res.json();
          resolve(data.transcript || "");
        } catch (e: any) {
          reject(e);
        }
      };

      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
  }, []);

  // ── TTS: Play audio from base64 WAV ──
  const playAudio = useCallback((base64Wav: string): Promise<void> => {
    return new Promise((resolve) => {
      stopAudio();
      const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve(); // non-fatal
      audio.play().catch(() => resolve());
    });
  }, []);

  // ── TTS: Fetch TTS from server for a text string ──
  const fetchAndPlayTTS = useCallback(async (text: string, voice: string = "af_bella"): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/ai/tts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, speed: 1.0 }),
      });
      if (!res.ok) return; // TTS failure is silent
      const wavBlob = await res.blob();
      const url = URL.createObjectURL(wavBlob);
      stopAudio();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      await audio.play().catch(() => { });
    } catch {
      // TTS is best-effort — never block the UI
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const isPlaying = useCallback(() => {
    return !!(audioRef.current && !audioRef.current.paused);
  }, []);

  return { startRecording, stopRecording, cancelRecording, playAudio, fetchAndPlayTTS, stopAudio, isPlaying };
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
  const voice = useVoice();

  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0 });
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isOpen, setIsOpen] = useState(variant === "fullscreen");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedSource, setSelectedSource] = useState("flipkart");
  const [selectedVoice, setSelectedVoice] = useState("af_bella");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [ttsEnabled, setTtsEnabled] = useState(true);   // auto-play AI responses
  const [voiceError, setVoiceError] = useState<string>("");
  const [micSupported, setMicSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFullScreen = variant === "fullscreen";
  const isAuthenticated = !!user;
  const isChatLocked = !isAuthenticated || (
    limits.maxAIChatMessagesPerMonth < UNLIMITED &&
    aiUsage.used >= aiUsage.limit
  );
  const isBusy = isTyping || isStreaming || voiceState === "recording" || voiceState === "transcribing";

  // Check mic support on mount
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicSupported(false);
    }
  }, []);

  const makeWelcomeMsg = (authed: boolean): ChatMessage => ({
    id: "welcome",
    message: authed
      ? "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything — or tap 🎤 to speak your question!\n\n• What products are trending now?\n• Which category has the best ratings?\n• Can I sell wireless earbuds under ₹1500?"
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
  useEffect(() => { if (isFullScreen) setIsOpen(true); }, [isFullScreen]);

  // ─────────────────────────────────────────
  // VOICE: Record → Transcribe → Send
  // ─────────────────────────────────────────
  const handleMicPress = async () => {
    if (isChatLocked || !isAuthenticated) return;
    setVoiceError("");

    if (voiceState === "recording") {
      // Stop and transcribe
      setVoiceState("transcribing");
      try {
        const transcript = await voice.stopRecording();
        setVoiceState("idle");
        if (transcript) {
          setInputMessage(transcript);
          // Auto-send after a tiny delay so the user sees the transcript
          setTimeout(() => sendMessage(transcript, true), 300);
        } else {
          setVoiceError("Nothing heard — try again.");
        }
      } catch (e: any) {
        setVoiceState("idle");
        setVoiceError(e.message || "Transcription failed.");
      }
      return;
    }

    // Start recording
    try {
      await voice.startRecording();
      setVoiceState("recording");
    } catch (e: any) {
      setVoiceError("Mic access denied — please allow microphone in browser settings.");
      setVoiceState("idle");
    }
  };

  const cancelVoice = () => {
    voice.cancelRecording();
    voice.stopAudio();
    setVoiceState("idle");
    setVoiceError("");
  };

  const handleTtsToggle = () => {
    if (voiceState === "playing") {
      voice.stopAudio();
      setVoiceState("idle");
    }
    setTtsEnabled((v) => !v);
  };

  // ─────────────────────────────────────────
  // SEND
  // ─────────────────────────────────────────
  const sendMessage = async (messageText?: string, fromVoice = false) => {
    if (isBusy && voiceState !== "idle") return;

    if (!isAuthenticated) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: "🔒 Please login to use the AI chatbot.\n\nClick the button below to sign in and start chatting!",
        isUser: false, timestamp: new Date(),
      }]);
      return;
    }

    if (limits.maxAIChatMessagesPerMonth < UNLIMITED && aiUsage.used >= aiUsage.limit) {
      const upgradeMsg = currentTier === "free"
        ? "🔒 Unlock AI Advisor with Basic or Premium plan to start chatting!"
        : `🔒 You've reached your ${aiUsage.limit} AI chat limit for this month.\n\nUpgrade to ${currentTier === "basic" ? "Premium (unlimited)" : "a higher plan"} to continue.`;
      setMessages(prev => [...prev, { id: Date.now().toString(), message: upgradeMsg, isUser: false, timestamp: new Date() }]);
      return;
    }

    const text = (messageText || inputMessage).trim();
    if (!text) return;
    const wasVoice = fromVoice;

    setMessages(prev => [...prev, {
      id: Date.now().toString(), message: text, isUser: true,
      timestamp: new Date(), isVoice: wasVoice,
    }]);
    setInputMessage("");

    try { await trackAIChatUsage(); setAiUsage(prev => ({ ...prev, used: prev.used + 1 })); } catch { }

    setIsTyping(true);
    const streamId = `stream-${Date.now()}`;
    let firstToken = true;

    // Request TTS from backend only when ttsEnabled
    const payload = {
      question: text,
      source: selectedSource,
      voice: selectedVoice,
      limit: 50,
      session_id: sessionId,
      seller_profile: { name: user?.name || "" },
      tts: ttsEnabled,   // ← tells backend to include audio_base64
    };

    await streamMessage(
      payload,

      // onToken
      (token) => {
        if (firstToken) {
          firstToken = false;
          setIsTyping(false);
          setIsStreaming(true);
          setMessages(prev => [...prev, {
            id: streamId, message: token, isUser: false,
            timestamp: new Date(), isStreaming: true,
          }]);
        } else {
          setMessages(prev => prev.map(m => m.id === streamId ? { ...m, message: m.message + token } : m));
        }
      },

      // onDone
      async ({ session_id, intents, mode, followup_questions, market_score, had_proactive_insight, extracted_product, audio_base64 }) => {
        if (session_id) setSessionId(session_id);
        setIsStreaming(false);
        setIsTyping(false);

        setMessages(prev => prev.map(m =>
          m.id === streamId ? {
            ...m,
            isStreaming: false, intents, mode,
            followupQuestions: followup_questions,
            marketScore: market_score,
            hasProactiveInsight: had_proactive_insight,
            extractedProduct: extracted_product,
            audioBase64: audio_base64 ?? undefined,
          } : m
        ));

        // Auto-play TTS if enabled
        if (ttsEnabled && audio_base64) {
          setVoiceState("playing");
          await voice.playAudio(audio_base64);
          setVoiceState("idle");
        }
      },

      // onError
      () => {
        setIsTyping(false);
        setIsStreaming(false);
        setMessages(prev => [
          ...prev.filter(m => m.id !== streamId),
          {
            id: Date.now().toString(),
            message: "⚠️ I'm having trouble fetching data. Please make sure your FastAPI server is running.",
            isUser: false, timestamp: new Date(),
          },
        ]);
      }
    );
  };

  // ─────────────────────────────────────────
  // PLAY specific message audio (replay button)
  // ─────────────────────────────────────────
  const replayAudio = async (msg: ChatMessage) => {
    voice.stopAudio();
    setVoiceState("playing");
    if (msg.audioBase64) {
      await voice.playAudio(msg.audioBase64);
    } else {
      // Fallback: fetch TTS on demand
      await voice.fetchAndPlayTTS(msg.message, selectedVoice);
    }
    setVoiceState("idle");
  };

  const stopPlayback = () => {
    voice.stopAudio();
    setVoiceState("idle");
  };

  // ─────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────
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
    cancelVoice();
    setSessionId(null);
    setIsTyping(false);
    setIsStreaming(false);
    setVoiceError("");
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
  // MIC BUTTON
  // ─────────────────────────────────────────
  const MicButton = () => {
    if (!micSupported) return null;

    const isRecording = voiceState === "recording";
    const isTranscribing = voiceState === "transcribing";

    return (
      <Button
        type="button"
        onClick={handleMicPress}
        disabled={isChatLocked || isTyping || isStreaming || isTranscribing}
        size="icon"
        title={isRecording ? "Tap to stop recording" : "Tap to speak"}
        className={cn(
          "h-11 w-11 rounded-xl shadow-md transition-all flex-shrink-0",
          isRecording
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : isTranscribing
              ? "bg-amber-500 hover:bg-amber-500 cursor-wait"
              : "bg-slate-700 hover:bg-slate-800"
        )}
      >
        {isTranscribing ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : isRecording ? (
          <div className="flex items-center justify-center">
            <VoiceWaveform active />
          </div>
        ) : (
          <Mic className="h-5 w-5 text-white" />
        )}
      </Button>
    );
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className={cn(
      isFullScreen ? "w-full h-full flex flex-col" : "fixed bottom-4 right-4 z-50"
    )}>

      {/* Toggle Button - floating only */}
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
          "shadow-2xl border border-gray-200 overflow-hidden flex flex-col rounded-2xl transition-all duration-300",
          isFullScreen
            ? "w-full flex-1 h-[calc(100vh-12rem)] min-h-[500px]"
            : "absolute bottom-16 right-0 w-80 h-[28rem]"
        )}>

          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-sm font-medium">Insydz Advisor</CardTitle>
                <Badge variant="secondary" className="text-xs bg-white/20 border-0 text-white">
                  {voiceState === "recording" ? "🎤 Listening…"
                    : voiceState === "transcribing" ? "⏳ Transcribing…"
                      : voiceState === "playing" ? "🔊 Speaking…"
                        : isTyping ? "thinking…"
                          : isStreaming ? "typing…"
                            : "AI Powered · Voice Ready"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* TTS toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTtsToggle}
                title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
                className="text-white h-8 w-8 p-0 hover:bg-white/20"
              >
                {voiceState === "playing"
                  ? <Square className="h-3.5 w-3.5" />
                  : ttsEnabled
                    ? <Volume2 className="h-3.5 w-3.5" />
                    : <VolumeX className="h-3.5 w-3.5 opacity-60" />}
              </Button>
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

          {/* Usage / Auth Banner */}
          {!isLoadingUsage && (
            <div className={cn(
              "px-3 py-2 text-xs flex items-center justify-between",
              !isAuthenticated ? "bg-gray-50 text-gray-700"
                : isChatLocked ? "bg-red-50 text-red-700"
                  : aiUsage.limit >= UNLIMITED ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
            )}>
              <div className="flex items-center gap-1">
                {!isAuthenticated ? <LogIn className="h-3 w-3" />
                  : isChatLocked ? <Lock className="h-3 w-3" />
                    : aiUsage.limit >= UNLIMITED ? <Crown className="h-3 w-3" />
                      : <Sparkles className="h-3 w-3" />}
                <span className="font-medium">
                  {!isAuthenticated ? "Login Required"
                    : aiUsage.limit >= UNLIMITED ? "Unlimited AI Chats"
                      : isChatLocked ? (currentTier === "free" ? "Unlock with Basic or Premium" : "Limit Reached")
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

          {/* Voice error banner */}
          {voiceError && (
            <div className="px-3 py-1.5 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <span className="text-[11px] text-red-600">{voiceError}</span>
              <button onClick={() => setVoiceError("")} className="text-red-400 hover:text-red-600 ml-2">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Recording indicator bar */}
          {voiceState === "recording" && (
            <div className="px-3 py-2 bg-red-500 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white text-xs font-medium">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Recording… tap mic again to send
              </div>
              <button onClick={cancelVoice} className="text-white/80 hover:text-white text-xs underline">
                Cancel
              </button>
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0 bg-white">
            <ScrollArea className="flex-1 p-3 px-4" ref={scrollContainerRef}>
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl p-3 text-sm break-words shadow-sm",
                      msg.isUser
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
                    )}>
                      {/* Voice indicator on user message */}
                      {msg.isUser && msg.isVoice && (
                        <div className="flex items-center gap-1 mb-1 opacity-70">
                          <Mic className="h-2.5 w-2.5" />
                          <span className="text-[9px] font-medium uppercase tracking-wide">Voice</span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-primary ml-1 align-middle animate-pulse" />
                        )}
                      </div>

                      {/* Market Score Card */}
                      {!msg.isUser && msg.marketScore && !msg.isStreaming && (
                        <MarketScoreCard score={msg.marketScore} product={msg.extractedProduct} />
                      )}

                      {/* Proactive insight badge */}
                      {msg.hasProactiveInsight && !msg.isStreaming && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold bg-amber-50 rounded-md p-1.5 border border-amber-100">
                          <Lightbulb className="h-3.5 w-3.5" />
                          <span>AI Proactive Insight Included</span>
                        </div>
                      )}

                      {/* Mode badge + replay audio button */}
                      {!msg.isUser && !msg.isStreaming && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {msg.mode && MODE_LABELS[msg.mode] && (
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", MODE_LABELS[msg.mode].color)}>
                              {MODE_LABELS[msg.mode].label}
                            </span>
                          )}
                          {/* Replay TTS button */}
                          {(msg.audioBase64 || !msg.isStreaming) && ttsEnabled && (
                            <button
                              onClick={() =>
                                voiceState === "playing" ? stopPlayback() : replayAudio(msg)
                              }
                              title={voiceState === "playing" ? "Stop" : "Play response"}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {voiceState === "playing"
                                ? <><Square className="h-2.5 w-2.5" /> Stop</>
                                : <><Volume2 className="h-2.5 w-2.5" /> Listen</>}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Follow-up chips */}
                      {!msg.isUser && msg.followupQuestions && msg.followupQuestions.length > 0 && !msg.isStreaming && (
                        <div className="mt-3 space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suggested Actions:</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.followupQuestions.map((q) => (
                              <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                disabled={isBusy || isChatLocked}
                                className="text-left text-[11px] px-3 py-1.5 bg-white hover:bg-primary hover:text-white border border-slate-200 rounded-full transition-all duration-200 shadow-sm disabled:opacity-40"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className={cn(
                        "text-[10px] mt-2 opacity-50 font-medium",
                        msg.isUser ? "text-right" : "text-left"
                      )}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing dots */}
                {isTyping && (
                  <div className="flex justify-start animate-in fade-in">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-3 flex items-center space-x-3">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Assistant is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Section */}
            <div className="border-t bg-slate-50/50 p-4 space-y-3">
              <div className="max-w-4xl mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Select value={selectedSource} onValueChange={setSelectedSource} disabled={isChatLocked}>
                      <SelectTrigger className="w-28 text-xs bg-white h-8 border-slate-200">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="flipkart">🛍 Flipkart</SelectItem>
                        <SelectItem value="amazon">💬 Amazon</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isChatLocked}>
                      <SelectTrigger className="w-32 text-xs bg-white h-8 border-slate-200">
                        <SelectValue placeholder="Voice" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="af_bella">👩 English</SelectItem>
                        <SelectItem value="af_sarah">👩 Sarah</SelectItem>
                        <SelectItem value="hindi">🇮🇳 Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice status pill */}
                  {voiceState === "playing" && (
                    <div className="flex items-center gap-1.5 text-[11px] text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-2.5 py-1">
                      <Volume2 className="h-3 w-3 animate-pulse" />
                      Speaking…
                      <button onClick={stopPlayback} className="ml-1 hover:text-purple-900">
                        <Square className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {/* Mic button */}
                  <MicButton />

                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isChatLocked && !isBusy && sendMessage()}
                    placeholder={
                      voiceState === "recording" ? "🎤 Recording… tap mic to send"
                        : voiceState === "transcribing" ? "Transcribing…"
                          : !isAuthenticated ? "Please login to unlock AI Advisor..."
                            : isChatLocked ? (currentTier === "free" ? "Unlock with Basic or Premium plan..." : "Usage limit reached. Upgrade to continue...")
                              : "Type or 🎤 speak your question…"
                    }
                    className="flex-1 text-sm bg-white border-slate-200 focus:ring-primary h-11 rounded-xl shadow-sm"
                    disabled={isBusy || isChatLocked}
                    readOnly={voiceState === "recording" || voiceState === "transcribing"}
                  />

                  {/* Send / Abort button */}
                  <Button
                    onClick={() => isStreaming ? abort() : sendMessage()}
                    disabled={isChatLocked || isTyping || voiceState === "recording" || voiceState === "transcribing" || (!inputMessage.trim() && !isStreaming)}
                    size="icon"
                    className={cn(
                      "h-11 w-11 rounded-xl shadow-md transition-all flex-shrink-0",
                      isStreaming ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {!isAuthenticated ? <LogIn className="h-5 w-5" />
                      : isChatLocked ? <Lock className="h-5 w-5" />
                        : isTyping ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          : isStreaming ? <X className="h-5 w-5" />
                            : <Send className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Voice hint */}
                {isAuthenticated && !isChatLocked && micSupported && voiceState === "idle" && messages.length === 1 && (
                  <p className="text-[10px] text-center text-slate-400">
                    🎤 Tap the mic to ask by voice · 🔊 AI will speak responses automatically
                  </p>
                )}

                {/* Quick actions for new conversations */}
                {messages.length === 1 && isAuthenticated && !isChatLocked && voiceState === "idle" && (
                  <div className="flex flex-wrap gap-2 justify-center py-1">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 transition-all shadow-sm font-medium"
                      >
                        {getSuggestionIcon(q)}
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAuthenticated && (
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-blue-900 font-medium">🔒 Unlock real-time competitor insights with AI Advisor</p>
                  <a href="/login">
                    <Button size="sm" className="h-8 shadow-sm">
                      <LogIn className="h-3.5 w-3.5 mr-2" /> Login
                    </Button>
                  </a>
                </div>
              )}

              {isAuthenticated && isChatLocked && (
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-orange-900 font-medium">
                    {currentTier === "free"
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