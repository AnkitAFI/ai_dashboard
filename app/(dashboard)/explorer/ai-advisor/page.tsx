"use client";

import Chatbot from "@/components/chatbot/chatbot";
import { Sparkles, Bot } from "lucide-react";

export default function AiAdvisor() {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-sky-100/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-inner">
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              Insydz Advisor
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Get intelligent insights, strategic advice, and market analysis for your products.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
          <Bot className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">AI Powered Assistant</span>
        </div>
      </div>

      {/* Full Screen Chatbot Component */}
      <main className="flex-1 h-[calc(100vh-250px)] flex flex-col">
        <div className="flex-1 bg-background backdrop-blur-none rounded-3xl border border-sky-100 shadow-xl overflow-hidden flex flex-col">
          <Chatbot variant="fullscreen" />
        </div>
      </main>
    </div>
  );
}
