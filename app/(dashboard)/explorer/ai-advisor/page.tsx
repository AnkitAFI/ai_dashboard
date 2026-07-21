"use client";

import Chatbot from "@/components/chatbot/chatbot";
import { Sparkles, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AiAdvisor() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header Info */}
      <div className="flex-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-sky-100/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              {t("aiAdvisor.title", "Insydz Advisor")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-1">
              {t("aiAdvisor.subtitle", "Get intelligent insights, strategic advice, and market analysis for your products.")}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-slate-800 rounded-full shrink-0">
          <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-semibold text-sky-800 dark:text-sky-400 uppercase tracking-wider">{t("aiAdvisor.aiAssistant", "AI Powered Assistant")}</span>
        </div>
      </div>

      {/* Full Screen Chatbot Component */}
      <main className="flex-1 min-h-0 flex flex-col pb-4">
        <div className="flex-1 min-h-0 bg-background backdrop-blur-none rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden flex flex-col">
          <Chatbot variant="fullscreen" />
        </div>
      </main>
    </div>
  );
}
