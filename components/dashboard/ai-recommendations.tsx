"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bot, Lightbulb, RefreshCw, Target, TrendingUp,
  Lock, Crown, AlertCircle, ShieldAlert, Zap, BarChart2,
} from "lucide-react";
import { useFilters } from "@/components/dashboard/filters-context";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";

interface IntelligenceData {
  market_pulse: string;
  opportunity: string;
  risk: string;
  verdict: string;
  micro_insights: string[];
  momentum_score: number;
  momentum_label: string;
  context_summary: string;
  cached: boolean;
  data_rows: number;
}

function MomentumRing({ score, label }: { score: number; label: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 30 ? "#3b82f6" : "#94a3b8";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-gray-500 mt-1 text-center leading-tight">{label}</span>
    </div>
  );
}

function RecommendationCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-4 text-white`}>
      <div className="flex items-center mb-2">
        {icon}
        <h4 className="font-semibold ml-2">{title}</h4>
      </div>
      <p className="text-sm text-white/90 leading-relaxed">{description}</p>
    </div>
  );
}

function MicroInsight({ text, index }: { text: string; index: number }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  const colors = ["text-violet-600", "text-blue-600", "text-emerald-600"];
  const bgColors = ["bg-violet-50", "bg-blue-50", "bg-emerald-50"];
  const borderColors = ["border-violet-200", "border-blue-200", "border-emerald-200"];

  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${bgColors[index % 3]} ${borderColors[index % 3]}`}>
      <span className={`text-xs font-bold mt-0.5 shrink-0 ${colors[index % 3]}`}>#{index + 1}</span>
      <p className="text-xs text-gray-700 leading-relaxed">
        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-gray-900">{part}</strong> : part)}
      </p>
    </div>
  );
}

export default function AIRecommendations({ selectedSource }: { selectedSource: string }) {
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const { trackAIChatUsage, canUseAIFeature, getAIUsage } = useSubscriptionSync();

  const hasAIRecommendations = canAccessFeature("hasChartAISummaries");
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number; month: string } | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!hasAIRecommendations) return;
    getAIUsage().then(usage => {
      setAiUsage(usage);
      if (usage.limit < UNLIMITED && usage.used >= usage.limit) setUsageLimitReached(true);
    });
  }, [hasAIRecommendations, getAIUsage]);

  const fetchIntelligence = async () => {
    const canUse = await canUseAIFeature();
    if (!canUse) { setUsageLimitReached(true); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    const mappedSource = (filters.table || selectedSource) === "amazon" ? "amazon" : "flipkart";

    try {
      const res = await fetch(`${BASE_URL}/ai/intelligence`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: mappedSource, filters }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: IntelligenceData = await res.json();
      setData(json);

      if (!json.cached) {
        await trackAIChatUsage();
        const updatedUsage = await getAIUsage();
        setAiUsage(updatedUsage);
        if (updatedUsage.limit < UNLIMITED && updatedUsage.used >= updatedUsage.limit) setUsageLimitReached(true);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Intelligence fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAIRecommendations && !usageLimitReached) fetchIntelligence();
  }, [selectedSource, filters, hasAIRecommendations, usageLimitReached, BASE_URL]);

  return (
    <Card className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-3xl p-6 sm:p-8 border-sky-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-600 rounded-xl"><Bot className="text-white h-5 w-5" /></div>
          <div><CardTitle className="text-lg font-bold text-sky-900">Decision Intelligence</CardTitle><p className="text-xs text-slate-500">NLP Insights for {selectedSource.toUpperCase()}</p></div>
        </div>
        <div className="flex items-center gap-2">
          {aiUsage && <Badge variant="outline" className="text-[10px]">{aiUsage.used}/{aiUsage.limit >= UNLIMITED ? "∞" : aiUsage.limit}</Badge>}
          <Button variant="ghost" size="sm" onClick={fetchIntelligence} disabled={loading || usageLimitReached} className="h-8 w-8 p-0 rounded-lg"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!hasAIRecommendations ? (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center"><p className="text-sm font-bold text-amber-900">AI Advisor Locked</p><Button size="sm" className="mt-2 bg-amber-600" onClick={() => window.location.href="/subscription"}>Upgrade Now</Button></div>
        ) : usageLimitReached ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-center"><p className="text-sm font-bold text-rose-900">Monthly Limit Reached</p><Button size="sm" variant="outline" className="mt-2 border-rose-200" onClick={() => window.location.href="/subscription"}>Upgrade Plan</Button></div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-sky-100">
              <MomentumRing score={data?.momentum_score || 0} label={data?.momentum_label || ""} />
              <div className="flex-1"><h4 className="text-sm font-bold text-sky-900 mb-1 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Market Overview</h4><p className="text-xs text-slate-600 leading-relaxed">{data?.market_pulse || "Analyzing market signals..."}</p></div>
            </div>
            {data?.micro_insights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.micro_insights.slice(0, 4).map((ins, i) => <MicroInsight key={i} text={ins} index={i} />)}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecommendationCard icon={<Target className="h-4 w-4" />} title="Opportunity" description={data?.opportunity || ""} gradient="from-emerald-500 to-teal-600" />
              <RecommendationCard icon={<ShieldAlert className="h-4 w-4" />} title="Risk Flag" description={data?.risk || ""} gradient="from-rose-500 to-red-600" />
            </div>
            <div className="p-3 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-100 flex items-start gap-3"><Zap className="h-4 w-4 mt-1 shrink-0" /><div><p className="text-[10px] font-bold uppercase opacity-80">Strategic Verdict</p><p className="text-sm font-medium">{data?.verdict}</p></div></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
