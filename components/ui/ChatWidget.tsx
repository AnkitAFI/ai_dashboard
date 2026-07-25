"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "bot";
  content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm Apex. How can I help you grow your e-commerce business today?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: inputValue },
    ];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send to our Next.js API route, which forwards to a local model
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      
      setMessages([
        ...newMessages,
        { role: "bot", content: data.reply || "I couldn't process your request right now. Please try again in a moment. If the issue continues, contact our team at support@insydz.com." },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "bot", content: "I'm having trouble connecting right now. Please try your question again in a moment. If you need immediate assistance, contact our team at support@insydz.com." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed z-50 transition-all duration-200 ${isOpen ? "inset-0 sm:inset-auto sm:bottom-4 sm:right-4" : "bottom-4 right-4"}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-[100dvh] sm:h-[500px] sm:mb-4"
          >
            <Card className="w-full h-full sm:w-[350px] shadow-2xl shadow-orange-900/10 border-primary/10 rounded-none sm:rounded-2xl border-0 sm:border flex flex-col overflow-hidden bg-white/95 backdrop-blur-md dark:bg-gray-950/95">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex flex-row justify-between items-center space-y-0 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner overflow-hidden border border-white/20">
                    <Image src="/chatbot_owl_v2.png" alt="Apex Owl" width={40} height={40} className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg font-bold">Apex</CardTitle>
                    <span className="text-xs text-orange-100 font-medium opacity-90">Powered by Insydz</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 bg-background">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl flex items-start gap-3 shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-tr-sm"
                          : "bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 rounded-tl-sm"
                      }`}
                    >
                      {msg.role === "bot" && (
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-800">
                          <Image src="/chatbot_owl_v2.png" alt="Apex Owl" width={24} height={24} className="object-cover" />
                        </div>
                      )}
                      <span className="text-sm whitespace-pre-wrap break-words w-full leading-relaxed">
                        {msg.content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tl-sm bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex items-center gap-3">
                       <Sparkles className="w-4 h-4 shrink-0 text-orange-500 animate-pulse" />
                       <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-orange-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-orange-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-orange-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                       </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <form 
                  className="flex w-full space-x-2 items-center" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <Input
                    placeholder="Ask Apex anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-orange-500 rounded-full px-4 h-11"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="rounded-full w-11 h-11 bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-transform active:scale-95">
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="w-14 h-14 rounded-full shadow-2xl shadow-orange-500/30 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-2 border-white/20 transition-all hover:scale-105 p-0 overflow-hidden relative"
            >
              <Image src="/chatbot_owl_v2.png" alt="Chat with Apex" fill sizes="56px" className="object-cover" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
