"use client";

import Chatbot from "@/components/chatbot/chatbot";
import { Sparkles, Bot } from "lucide-react";

export default function AiAdvisorPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background opacity-100 backdrop-blur-none border border-sky-100 shadow-lg 
        rounded-none sm:rounded-2xl 
        px-4 sm:px-6 lg:px-8 
        py-4 sm:py-5 
        mb-4 sm:mb-6 
        flex items-center 
        justify-between gap-4 
        sticky top-0 sm:top-4 
        z-20 mx-0 sm:mx-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
              Insydz Advisor <Sparkles className="w-5 h-5 text-amber-500" />
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Get intelligent insights and market analysis for your products
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-full">
          <Bot className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">AI Powered Assistant</span>
        </div>
      </header>

      {/* Full Screen Chatbot Component */}
      <main className="flex-1 px-4 sm:px-6 pb-6 h-full flex flex-col">
        <div className="flex-1 bg-background backdrop-blur-none rounded-3xl border border-sky-100 shadow-xl overflow-hidden flex flex-col">
          <Chatbot variant="fullscreen" />
        </div>
      </main>
    </div>
  );
}
