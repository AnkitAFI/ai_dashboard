"use client";

import Chatbot from "@/components/chatbot/chatbot";
import { Sparkles, Bot } from "lucide-react";

export default function AiAdvisor() {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
            Insydz Advisor <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Get intelligent insights and market analysis for your products
          </p>
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
