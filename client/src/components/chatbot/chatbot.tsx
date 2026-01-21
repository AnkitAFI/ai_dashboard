

// import { useState, useRef, useEffect } from "react";
// import { useMutation } from "@tanstack/react-query";
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
//   Bot,
//   Send,
//   X,
//   MessageCircle,
//   Sparkles,
//   TrendingUp,
//   DollarSign,
//   BarChart3,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
 
// interface ChatMessage {
//   id: string;
//   message: string;
//   isUser: boolean;
//   timestamp: Date;
//   suggestions?: string[];
// }
 
// const QUICK_QUESTIONS = [
//   "What products are trending now?",
//   "Best profit margins?",
//   "How to improve sales?",
//   "Competitor analysis?",
//   "Market opportunities?",
//   "Price optimization tips?",
// ];
 
// const SUGGESTION_ICONS = {
//   trending: <TrendingUp className="h-3 w-3" />,
//   profit: <DollarSign className="h-3 w-3" />,
//   sales: <BarChart3 className="h-3 w-3" />,
//   default: <Sparkles className="h-3 w-3" />,
// };
 
// export default function Chatbot() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       id: "welcome",
//       message:
//         "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending?\n• Which category has the best ratings?",
//       isUser: false,
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [selectedSource, setSelectedSource] = useState("flipkart");

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
 
//   // ----------------- Mutation -----------------
//   // ----------------- Mutation -----------------
//   const chatMutation = useMutation({
//     mutationFn: async (message: string) => {
//       const controller = new AbortController();

//     // ⏳ FRONTEND TIMEOUT = 60 seconds
//       const timeoutId = setTimeout(() => controller.abort(), 60000);

//       try {
//         const response = await fetch("https://api.insydz.com/ai/query", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             question: message,
//             source: selectedSource,
//             limit: 50,
//           }),
//           signal: controller.signal, // <-- important!
//         });

//         clearTimeout(timeoutId);

//         return response.json();
//       } catch (error) {
//         clearTimeout(timeoutId); // always clear timeout
//         throw error; // let react-query handle onError
//       }
//    },

//    onSuccess: (data) => {
//      const aiMessage: ChatMessage = {
//        id: Date.now().toString(),
//        message: data.answer,
//        isUser: false,
//        timestamp: new Date(),
//      };
//      setMessages((prev) => [...prev, aiMessage]);
//      setIsTyping(false);
//    },

//    onError: (err) => {
//      const errorMessage: ChatMessage = {
//        id: Date.now().toString(),
//        message:
//          err?.name === "AbortError"
//            ? "⚠️ AI response timed out (60s). Please try again."
//            : "⚠️ I'm having trouble contacting the AI server.",
//        isUser: false,
//        timestamp: new Date(),
//      };

//      setMessages((prev) => [...prev, errorMessage]);
//      setIsTyping(false);
//    },
//   }); 

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };
 
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]);
 
//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);
 
//   // ----------------- Send Message -----------------
//   const sendMessage = (messageText?: string) => {
//     const text = messageText || inputMessage.trim();
//     if (!text) return;
 
//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       message: text,
//       isUser: true,
//       timestamp: new Date(),
//     };
 
//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsTyping(true);
//     chatMutation.mutate(text);
//   };
 
//   const formatTime = (date: Date) =>
//     date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });
 
//   const getSuggestionIcon = (suggestion: string) => {
//     const lower = suggestion.toLowerCase();
//     if (lower.includes("trend")) return SUGGESTION_ICONS.trending;
//     if (lower.includes("profit")) return SUGGESTION_ICONS.profit;
//     if (lower.includes("sales")) return SUGGESTION_ICONS.sales;
//     return SUGGESTION_ICONS.default;
//   };
 
//   // ----------------- Render -----------------
//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       {/* Floating Toggle Button */}
//       <Button
//         onClick={() => setIsOpen(!isOpen)}
//         className={cn(
//           "w-14 h-14 rounded-full text-white flex items-center justify-center",
//           "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all shadow-lg"
//         )}
//       >
//         {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
//       </Button>
 
//       {/* Chat Window */}
//       {isOpen && (
//         <Card className="absolute bottom-16 right-0 w-80 h-[26rem] shadow-2xl border border-gray-200 overflow-hidden flex flex-col rounded-2xl">
//           {/* Header */}
//           <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-3 flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Avatar className="h-8 w-8">
//                 <AvatarFallback className="bg-white/20 text-white">
//                   <Bot className="h-4 w-4" />
//                 </AvatarFallback>
//               </Avatar>
//               <div className="flex flex-col">
//                 <CardTitle className="text-sm font-medium">
//                   Insydz Assistant
//                 </CardTitle>
//                 <Badge
//                   variant="secondary"
//                   className="text-xs bg-white/20 border-0 text-white"
//                 >
//                   AI Powered
//                 </Badge>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setIsOpen(false)}
//               className="text-white h-8 w-8 p-0"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </CardHeader>
 
//           {/* Messages */}
//           <CardContent className="flex-1 flex flex-col overflow-hidden">
//             <ScrollArea className="flex-1 p-3" ref={scrollContainerRef}>
//               <div className="space-y-3">
//                 {messages.map((msg) => (
//                   <div
//                     key={msg.id}
//                     className={cn(
//                       "flex",
//                       msg.isUser ? "justify-end" : "justify-start"
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         "max-w-[75%] rounded-lg p-2 text-sm break-words whitespace-pre-wrap",
//                         msg.isUser
//                           ? "bg-primary text-white"
//                           : "bg-gray-100 text-gray-900"
//                       )}
//                     >
//                       <p>{msg.message}</p>
//                       <p className="text-xs mt-1 opacity-70 text-right">
//                         {formatTime(msg.timestamp)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
 
//                 {/* Typing Indicator */}
//                 {isTyping && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div
//                           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.1s" }}
//                         ></div>
//                         <div
//                           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.2s" }}
//                         ></div>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         AI is thinking...
//                       </span>
//                     </div>
//                   </div>
//                 )}
 
//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>
 
//             {/* Input Section */}
//             <div className="border-t bg-background p-3 space-y-2">
//               {/* Source Selector */}
//               <Select
//                 value={selectedSource}
//                 onValueChange={setSelectedSource}
//               >
//                 <SelectTrigger className="w-full text-xs">
//                   <SelectValue placeholder="Select data source" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="flipkart">🛍 Flipkart</SelectItem>
//                   <SelectItem value="rapidapi_amazon_products">
//                     💬 Amazon
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
 
//               <div className="flex space-x-2">
//                 <Input
//                   ref={inputRef}
//                   value={inputMessage}
//                   onChange={(e) => setInputMessage(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                   placeholder="Ask about trends, prices, or reviews..."
//                   className="flex-1 text-sm"
//                   disabled={chatMutation.isPending}
//                 />
//                 <Button
//                   onClick={() => sendMessage()}
//                   disabled={!inputMessage.trim() || chatMutation.isPending}
//                   size="sm"
//                   className="px-3"
//                 >
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// import { useState, useRef, useEffect } from "react";
// import { useMutation } from "@tanstack/react-query";
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
//   Bot,
//   Send,
//   X,
//   MessageCircle,
//   Sparkles,
//   TrendingUp,
//   DollarSign,
//   BarChart3,
// } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface ChatMessage {
//   id: string;
//   message: string;
//   isUser: boolean;
//   timestamp: Date;
//   suggestions?: string[];
// }

// const QUICK_QUESTIONS = [
//   "What products are trending now?",
//   "Best profit margins?",
//   "How to improve sales?",
//   "Competitor analysis?",
//   "Market opportunities?",
//   "Price optimization tips?",
// ];

// const SUGGESTION_ICONS = {
//   trending: <TrendingUp className="h-3 w-3" />,
//   profit: <DollarSign className="h-3 w-3" />,
//   sales: <BarChart3 className="h-3 w-3" />,
//   default: <Sparkles className="h-3 w-3" />,
// };

// export default function Chatbot() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       id: "welcome",
//       message:
//         "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending?\n• Which category has the best ratings?",
//       isUser: false,
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [selectedSource, setSelectedSource] = useState("flipkart");

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // ----------------- Mutation -----------------
  

//   const chatMutation = useMutation({
//     mutationFn: async (message: string) => {
//       const response = await fetch("https://api.insydz.com/ai/query", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           question: message,
//           source: selectedSource,
//           limit: 50,
//         }),
//       });
//       return response.json();
//     },
//     onSuccess: (data) => {
//       const aiMessage: ChatMessage = {
//         id: Date.now().toString(),
//         message: data.answer,
//         isUser: false,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//       setIsTyping(false);
//     },
//     onError: () => {
//       const errorMessage: ChatMessage = {
//         id: Date.now().toString(),
//         message:
//           "⚠️ I'm having trouble fetching data. Please make sure your FastAPI server is running.",
//         isUser: false,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//       setIsTyping(false);
//     },
//   });

//   // ----------------- Scrolling -----------------
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]);

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);

//   // ----------------- Send Message -----------------
//   const sendMessage = (messageText?: string) => {
//     const text = messageText || inputMessage.trim();
//     if (!text) return;

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       message: text,
//       isUser: true,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsTyping(true);
//     chatMutation.mutate(text);
//   };

//   const formatTime = (date: Date) =>
//     date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });

//   const getSuggestionIcon = (suggestion: string) => {
//     const lower = suggestion.toLowerCase();
//     if (lower.includes("trend")) return SUGGESTION_ICONS.trending;
//     if (lower.includes("profit")) return SUGGESTION_ICONS.profit;
//     if (lower.includes("sales")) return SUGGESTION_ICONS.sales;
//     return SUGGESTION_ICONS.default;
//   };

//   // ----------------- Render -----------------
//   return (
//     <div className="fixed bottom-4 right-4 z-50">
//       {/* Floating Toggle Button */}
//       <Button
//         onClick={() => setIsOpen(!isOpen)}
//         className={cn(
//           "w-14 h-14 rounded-full text-white flex items-center justify-center",
//           "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all shadow-lg"
//         )}
//       >
//         {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
//       </Button>

//       {/* Chat Window */}
//       {isOpen && (
//         <Card className="absolute bottom-16 right-0 w-80 h-[26rem] shadow-2xl border border-gray-200 overflow-hidden flex flex-col rounded-2xl">
//           {/* Header */}
//           <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-3 flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Avatar className="h-8 w-8">
//                 <AvatarFallback className="bg-white/20 text-white">
//                   <Bot className="h-4 w-4" />
//                 </AvatarFallback>
//               </Avatar>
//               <div className="flex flex-col">
//                 <CardTitle className="text-sm font-medium">
//                   Insydz Assistant
//                 </CardTitle>
//                 <Badge
//                   variant="secondary"
//                   className="text-xs bg-white/20 border-0 text-white"
//                 >
//                   AI Powered
//                 </Badge>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setIsOpen(false)}
//               className="text-white h-8 w-8 p-0"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </CardHeader>

//           {/* Messages */}
//           <CardContent className="flex-1 flex flex-col overflow-hidden">
//             <ScrollArea className="flex-1 p-3" ref={scrollContainerRef}>
//               <div className="space-y-3">
//                 {messages.map((msg) => (
//                   <div
//                     key={msg.id}
//                     className={cn(
//                       "flex",
//                       msg.isUser ? "justify-end" : "justify-start"
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         "max-w-[75%] rounded-lg p-2 text-sm break-words whitespace-pre-wrap",
//                         msg.isUser
//                           ? "bg-primary text-white"
//                           : "bg-gray-100 text-gray-900"
//                       )}
//                     >
//                       <p>{msg.message}</p>
//                       <p className="text-xs mt-1 opacity-70 text-right">
//                         {formatTime(msg.timestamp)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Typing Indicator */}
//                 {isTyping && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div
//                           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.1s" }}
//                         ></div>
//                         <div
//                           className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.2s" }}
//                         ></div>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         AI is thinking...
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>

//             {/* Input Section */}
//             <div className="border-t bg-background p-3 space-y-2">
//               {/* Source Selector */}
//               <Select
//                 value={selectedSource}
//                 onValueChange={setSelectedSource}
//               >
//                 <SelectTrigger className="w-full text-xs">
//                   <SelectValue placeholder="Select data source" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="flipkart">🛍 Flipkart</SelectItem>
//                   <SelectItem value="rapidapi_amazon_products">
//                     💬 Amazon 
//                   </SelectItem>
//                 </SelectContent>
//               </Select>

//               <div className="flex space-x-2">
//                 <Input
//                   ref={inputRef}
//                   value={inputMessage}
//                   onChange={(e) => setInputMessage(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                   placeholder="Ask about trends, prices, or reviews..."
//                   className="flex-1 text-sm"
//                   disabled={chatMutation.isPending}
//                 />
//                 <Button
//                   onClick={() => sendMessage()}
//                   disabled={!inputMessage.trim() || chatMutation.isPending}
//                   size="sm"
//                   className="px-3"
//                 >
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }





import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
  Bot,
  Send,
  X,
  MessageCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  BarChart3,
  Lock,
  Crown,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_QUESTIONS = [
  "What products are trending now?",
  "Best profit margins?",
  "How to improve sales?",
  "Competitor analysis?",
  "Market opportunities?",
  "Price optimization tips?",
];

const SUGGESTION_ICONS = {
  trending: <TrendingUp className="h-3 w-3" />,
  profit: <DollarSign className="h-3 w-3" />,
  sales: <BarChart3 className="h-3 w-3" />,
  default: <Sparkles className="h-3 w-3" />,
};

export default function Chatbot() {
  const { user } = useAuth();
  const { limits, currentTier } = useSubscriptionLimits();
  const { trackAIChatUsage, getAIUsage } = useSubscriptionSync();

  // ✅ Get AI usage from auth context and backend
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0 });
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // ✅ Load AI usage on mount
  useEffect(() => {
    const loadUsage = async () => {
      try {
        const usage = await getAIUsage();
        setAiUsage({
          used: usage.used,
          limit: limits.maxAIChatMessagesPerMonth,
        });
      } catch (err) {
        console.error("Failed to load AI usage:", err);
        // Fallback to user data from auth context
        setAiUsage({
          used: user?.aiChatUsed || 0,
          limit: limits.maxAIChatMessagesPerMonth,
        });
      } finally {
        setIsLoadingUsage(false);
      }
    };

    if (user) {
      loadUsage();
    } else {
      setIsLoadingUsage(false);
    }
  }, [user, limits.maxAIChatMessagesPerMonth]);

  // ✅ Check if user is authenticated
  const isAuthenticated = !!user;

  // ✅ Check if chat is locked
  const isChatLocked = !isAuthenticated || (
    limits.maxAIChatMessagesPerMonth !== Infinity &&
    aiUsage.used >= aiUsage.limit
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: isAuthenticated
        ? "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending?\n• Which category has the best ratings?"
        : "👋 Welcome! Please login to use the AI Assistant and get personalized insights.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSource, setSelectedSource] = useState("flipkart");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Update welcome message when auth status changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "welcome") {
      setMessages([
        {
          id: "welcome",
          message: isAuthenticated
            ? "👋 Hi! I'm your AI Assistant.\n\nSelect a data source below (Flipkart or Amazon), and ask me anything like:\n• What products are trending?\n• Which category has the best ratings?"
            : "👋 Welcome! Please login to use the AI Assistant and get personalized insights.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isAuthenticated]);

  // ----------------- Mutation -----------------
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("https://api.insydz.com/ai/query", {
        method: "POST",
        credentials: "include", // ✅ Include session cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: message,
          source: selectedSource,
          limit: 50,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        message: data.answer,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        message:
          "⚠️ I'm having trouble fetching data. Please make sure your FastAPI server is running.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  // ----------------- Scrolling -----------------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ----------------- Send Message -----------------
  const sendMessage = async (messageText?: string) => {
    // ✅ Check if user is authenticated
    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: "🔒 Please login to use the AI chatbot.\n\nClick the button below to sign in and start chatting!",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // ✅ Check if chat is locked due to usage limits
    if (limits.maxAIChatMessagesPerMonth !== Infinity && 
        aiUsage.used >= aiUsage.limit) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: `🔒 You've reached your ${aiUsage.limit} AI chat limit for this month.\n\nUpgrade to ${
            currentTier === "free" ? "Basic (20 chats)" : "Premium (unlimited)"
          } to continue using AI features.`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // ✅ Track usage in database with session authentication
    try {
      await trackAIChatUsage();
      
      // Update local state
      setAiUsage((prev) => ({
        ...prev,
        used: prev.used + 1,
      }));

      console.log(`✅ AI chat tracked: ${aiUsage.used + 1}/${aiUsage.limit}`);
    } catch (err) {
      console.error("Failed to track AI usage:", err);
      // Continue anyway - don't block the chat
    }

    setIsTyping(true);
    chatMutation.mutate(text);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const getSuggestionIcon = (suggestion: string) => {
    const lower = suggestion.toLowerCase();
    if (lower.includes("trend")) return SUGGESTION_ICONS.trending;
    if (lower.includes("profit")) return SUGGESTION_ICONS.profit;
    if (lower.includes("sales")) return SUGGESTION_ICONS.sales;
    return SUGGESTION_ICONS.default;
  };

  // ✅ Usage badge color
  const getUsageBadgeColor = () => {
    if (!isAuthenticated) return "bg-gray-500";
    if (aiUsage.limit === Infinity) return "bg-green-500";
    const percentage = (aiUsage.used / aiUsage.limit) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  // ----------------- Render -----------------
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Toggle Button */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full text-white flex items-center justify-center",
            "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all shadow-lg",
            isChatLocked && "opacity-75"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>

        {/* Lock/Login Badge */}
        {!isAuthenticated && !isOpen && (
          <div className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-1">
            <LogIn className="h-3 w-3" />
          </div>
        )}

        {/* Lock Badge (for limit reached) */}
        {isAuthenticated && isChatLocked && !isOpen && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
            <Lock className="h-3 w-3" />
          </div>
        )}

        {/* Usage Badge */}
        {isAuthenticated && !isChatLocked && aiUsage.limit !== Infinity && !isOpen && (
          <div
            className={cn(
              "absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold",
              getUsageBadgeColor()
            )}
          >
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
                <CardTitle className="text-sm font-medium">
                  Insydz Assistant
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/20 border-0 text-white"
                >
                  AI Powered
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Usage/Auth Banner */}
          {!isLoadingUsage && (
            <div
              className={cn(
                "px-3 py-2 text-xs flex items-center justify-between",
                !isAuthenticated
                  ? "bg-gray-50 text-gray-700"
                  : isChatLocked
                  ? "bg-red-50 text-red-700"
                  : aiUsage.limit === Infinity
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              )}
            >
              <div className="flex items-center gap-1">
                {!isAuthenticated ? (
                  <LogIn className="h-3 w-3" />
                ) : isChatLocked ? (
                  <Lock className="h-3 w-3" />
                ) : aiUsage.limit === Infinity ? (
                  <Crown className="h-3 w-3" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span className="font-medium">
                  {!isAuthenticated
                    ? "Login Required"
                    : aiUsage.limit === Infinity
                    ? "Unlimited AI Chats"
                    : isChatLocked
                    ? "Limit Reached"
                    : `${aiUsage.used}/${aiUsage.limit} chats used`}
                </span>
              </div>
              {!isAuthenticated ? (
                <a
                  href="/login"
                  className="text-xs underline hover:no-underline"
                >
                  Login
                </a>
              ) : isChatLocked && (
                <a
                  href="/subscription"
                  className="text-xs underline hover:no-underline"
                >
                  Upgrade
                </a>
              )}
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-3" ref={scrollContainerRef}>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg p-2 text-sm break-words whitespace-pre-wrap",
                        msg.isUser
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Section */}
            <div className="border-t bg-background p-3 space-y-2">
              {/* Source Selector */}
              <Select
                value={selectedSource}
                onValueChange={setSelectedSource}
                disabled={isChatLocked}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flipkart">🛍 Flipkart</SelectItem>
                  <SelectItem value="rapidapi_amazon_products">
                    💬 Amazon
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isChatLocked && sendMessage()}
                  placeholder={
                    !isAuthenticated
                      ? "Login to chat..."
                      : isChatLocked
                      ? "Upgrade to continue..."
                      : "Ask about trends, prices, or reviews..."
                  }
                  className="flex-1 text-sm"
                  disabled={chatMutation.isPending || isChatLocked}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={
                    !inputMessage.trim() ||
                    chatMutation.isPending ||
                    isChatLocked
                  }
                  size="sm"
                  className="px-3"
                >
                  {!isAuthenticated ? (
                    <LogIn className="h-4 w-4" />
                  ) : isChatLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Login Prompt */}
              {!isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-900 mb-2">
                    🔒 Login to unlock AI-powered insights
                  </p>
                  <a href="/login">
                    <Button size="sm" className="w-full text-xs h-7">
                      <LogIn className="h-3 w-3 mr-1" />
                      Login to Chat
                    </Button>
                  </a>
                </div>
              )}

              {/* Upgrade Prompt */}
              {isAuthenticated && isChatLocked && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-2">
                  <p className="text-xs text-orange-900 mb-2">
                    🔒 You've used all {aiUsage.limit} free chats this month
                  </p>
                  <a href="/subscription">
                    <Button size="sm" className="w-full text-xs h-7">
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade Plan
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