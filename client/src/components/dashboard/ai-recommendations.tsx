import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Lightbulb, RefreshCw, Target, TrendingUp,
  Lock, Crown, AlertCircle, ShieldAlert, Zap, BarChart2,
} from "lucide-react";
import { useFilters } from "@/components/dashboard/FiltersContext";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

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

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

// ─────────────────────────────────────────────
// MOMENTUM RING
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// RECOMMENDATION CARD  (original structure preserved)
// ─────────────────────────────────────────────

function RecommendationCard({ icon, title, description, gradient }: RecommendationCardProps) {
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

// ─────────────────────────────────────────────
// MICRO INSIGHT  — inline bold markdown renderer
// ─────────────────────────────────────────────

function MicroInsight({ text, index }: { text: string; index: number }) {
  // Render **bold** markdown
  const parts = text.split(/\*\*(.*?)\*\*/g);
  const colors = ["text-violet-600", "text-blue-600", "text-emerald-600"];
  const bgColors = ["bg-violet-50", "bg-blue-50", "bg-emerald-50"];
  const borderColors = ["border-violet-200", "border-blue-200", "border-emerald-200"];

  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${bgColors[index]} ${borderColors[index]}`}>
      <span className={`text-xs font-bold mt-0.5 shrink-0 ${colors[index]}`}>#{index + 1}</span>
      <p className="text-xs text-gray-700 leading-relaxed">
        {parts.map((part, i) =>
          i % 2 === 1
            ? <strong key={i} className="text-gray-900">{part}</strong>
            : part
        )}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const BASE_URL = "http://localhost:8000";

export default function AIRecommendations({ selectedSource }: { selectedSource: string }) {
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const { trackAIChatUsage, canUseAIFeature, getAIUsage } = useSubscriptionSync();

  const hasAIRecommendations = canAccessFeature("hasChartAISummaries");

  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number; month: string } | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState(false);

  // Abort controller to cancel in-flight requests on filter change
  const abortRef = useRef<AbortController | null>(null);

  // ── Load usage on mount ──
  useEffect(() => {
    if (!hasAIRecommendations) return;
    (async () => {
      const usage = await getAIUsage();
      setAiUsage(usage);
      if (usage.limit < UNLIMITED && usage.used >= usage.limit) {
        setUsageLimitReached(true);
      }
    })();
  }, [hasAIRecommendations]);

  // ── Fetch intelligence ──
  const fetchIntelligence = async () => {
    const canUse = await canUseAIFeature();
    if (!canUse) { setUsageLimitReached(true); return; }

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);

    const sourceMap: Record<string, string> = {
      flipkart: "flipkart",
      amazon: "amazon",
      rapidapi_amazon_products: "amazon",
      both: "flipkart",   // fallback for "both"
    };
    const mappedSource = sourceMap[filters.table || selectedSource] || "flipkart";

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

      // Only track usage if not served from cache
      if (!json.cached) {
        await trackAIChatUsage();
        const updatedUsage = await getAIUsage();
        setAiUsage(updatedUsage);
        if (updatedUsage.limit < UNLIMITED && updatedUsage.used >= updatedUsage.limit) {
          setUsageLimitReached(true);
        }
      }

    } catch (err: any) {
      if (err.name === "AbortError") return;   // cancelled — don't update state
      console.error("Intelligence fetch error:", err);

      // Graceful fallback — set minimal data so the UI doesn't crash
      const cat = filters.category && filters.category !== "All Categories" ? filters.category : "the selected market";
      const src = mappedSource === "amazon" ? "Amazon" : "Flipkart";
      setData({
        market_pulse: `${src} data for ${cat} is being analysed. Try refreshing.`,
        opportunity: "Broaden your filters to surface more opportunities.",
        risk: "Unable to assess risk — check your filter selection.",
        verdict: "Refresh to get the latest intelligence for these filters.",
        micro_insights: [],
        momentum_score: 0,
        momentum_label: "Loading…",
        context_summary: `${src} · ${cat}`,
        cached: false,
        data_rows: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Re-fetch on filter / source change ──
  useEffect(() => {
    if (hasAIRecommendations && !usageLimitReached) {
      fetchIntelligence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, filters, hasAIRecommendations]);

  // ── Derived display values ──
  const displaySource =
    (filters.table || selectedSource) === "both" ? "Both Platforms" :
      (filters.table || selectedSource) === "amazon" ? "Amazon" : "Flipkart";

  const cardStyles = [
    { icon: <Target className="h-5 w-5" />, gradient: "from-green-500 to-emerald-600", title: "Key Opportunity" },
    { icon: <TrendingUp className="h-5 w-5" />, gradient: "from-blue-500 to-cyan-600", title: "Action Plan" },
  ];

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border mb-6">
      <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
        <div className="flex items-center">
          <div className="p-3 bg-primary rounded-xl mr-4">
            <Bot className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Decision Intelligence</CardTitle>
            <p className="text-sm text-muted-foreground">
              Natural language analysis for{" "}
              <span className="font-medium text-foreground">{displaySource}</span>
              {filters.category && filters.category !== "All Categories" && (
                <span className="text-primary font-medium"> · {filters.category}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20">
            🤖 NLP Powered
          </Badge>

          {aiUsage && (
            <Badge variant={usageLimitReached ? "destructive" : "outline"} className="text-xs">
              {aiUsage.used}/{aiUsage.limit >= UNLIMITED ? "∞" : aiUsage.limit} Uses
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchIntelligence}
            disabled={loading || usageLimitReached}
            title={usageLimitReached ? "Monthly limit reached" : "Refresh insights"}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">

        {/* ── LOCKED ── */}
        {!hasAIRecommendations ? (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">🤖 AI Business Advisor Locked</p>
                <p className="text-sm text-amber-700 mt-1">
                  Upgrade to {currentTier === "free" ? "Basic" : "Premium"} to unlock AI-powered recommendations.
                </p>
                <Button size="sm" variant="outline" className="mt-3 border-amber-400 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.location.href = "/subscription"}>
                  <Crown className="w-4 h-4 mr-1" /> Upgrade Now
                </Button>
              </div>
            </div>
          </div>

          /* ── LIMIT REACHED ── */
        ) : usageLimitReached ? (
          <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Monthly AI Limit Reached</p>
                <p className="text-sm text-red-700 mt-1">
                  You've used all {aiUsage?.limit} AI requests for this month. Upgrade for more!
                </p>
                <Button size="sm" variant="outline" className="mt-3 border-red-400 text-red-700 hover:bg-red-100"
                  onClick={() => window.location.href = "/subscription"}>
                  <Crown className="w-4 h-4 mr-1" /> Upgrade Plan
                </Button>
              </div>
            </div>
          </div>

          /* ── MAIN CONTENT ── */
        ) : (
          <>
            {/* ── TOP ROW: Momentum ring + Market Pulse ── */}
            <div className="mb-5 p-4 bg-white/70 dark:bg-black/20 rounded-lg border border-primary/10">
              <div className="flex items-start gap-4">

                {/* Momentum Ring */}
                <div className="shrink-0">
                  {loading ? (
                    <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
                  ) : (
                    <MomentumRing
                      score={data?.momentum_score ?? 0}
                      label={data?.momentum_label ?? ""}
                    />
                  )}
                </div>

                {/* Market Pulse text */}
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center text-base">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                    Market Overview
                  </h3>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {data?.market_pulse}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── MICRO INSIGHTS ── */}
            {(loading || (data?.micro_insights && data.micro_insights.length > 0)) && (
              <div className="mb-5">
                <h3 className="font-semibold text-sm flex items-center mb-2">
                  <BarChart2 className="h-4 w-4 mr-2 text-blue-600" />
                  Data Signals
                </h3>
                {loading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.micro_insights.map((insight, i) => (
                      <MicroInsight key={i} text={insight} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── OPPORTUNITY + RISK cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white/70 rounded-lg p-4">
                    <Skeleton className="h-5 w-5 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))
              ) : (
                <>
                  <RecommendationCard
                    icon={cardStyles[0].icon}
                    title={cardStyles[0].title}
                    description={data?.opportunity || ""}
                    gradient={cardStyles[0].gradient}
                  />
                  <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg p-4 text-white">
                    <div className="flex items-center mb-2">
                      <ShieldAlert className="h-5 w-5" />
                      <h4 className="font-semibold ml-2">Risk Flag</h4>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">{data?.risk}</p>
                  </div>
                </>
              )}
            </div>

            {/* ── VERDICT bar ── */}
            <div className="p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg flex items-start gap-2">
              <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary mb-0.5">Strategic Verdict</p>
                {loading
                  ? <Skeleton className="h-4 w-full" />
                  : <p className="text-sm text-foreground leading-relaxed">{data?.verdict}</p>
                }
              </div>
            </div>

            {/* ── Cache / data footer ── */}
            {!loading && data && (
              <p className="text-[10px] text-muted-foreground text-right mt-2">
                {data.cached ? "⚡ Cached result" : `✓ Live · ${data.data_rows} data points analysed`}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
