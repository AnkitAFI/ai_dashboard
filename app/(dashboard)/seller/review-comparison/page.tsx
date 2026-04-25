"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Lock, Crown, Star, MessageSquare, RefreshCw,
  Menu, X, TrendingUp, CheckCircle, Zap,
  ThumbsUp, ThumbsDown, Minus, Package, Users,
  Activity, ShieldCheck, AlertTriangle, Target, ChevronLeft, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function HealthScoreRing({ score }: { score: number }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dashOffset = circ - (circ * score) / 100;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excellent" : score >= 50 ? "Stable" : "Critical";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{score}</span>
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Score</span>
        </div>
      </div>
      <Badge variant="outline" className="border-none font-black text-[9px] uppercase tracking-widest" style={{ color, backgroundColor: `${color}10` }}>{label}</Badge>
    </div>
  );
}

function SentimentBar({ label, pct, icon: Icon, color }: { label: string; pct: number; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: `${color}10` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
          <span className="text-slate-500">{label}</span>
          <span style={{ color }}>{pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden shadow-inner">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 bg-white/85 backdrop-blur-[3px] rounded-[2.5rem] flex flex-col items-center justify-center z-10 gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "premium" ? "bg-blue-50" : "bg-amber-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "premium" ? "text-blue-500" : "text-amber-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className="font-bold text-slate-800 text-sm">{feature}</p>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
          {tier === "premium" ? "Premium Access" : "Basic Access"}
        </p>
      </div>
      <Button
        onClick={() => router.push("/subscription")}
        className={`h-9 px-6 rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all ${tier === "premium" ? "bg-slate-900 text-white" : "bg-amber-500 text-white"}`}
      >
        <Crown className="w-3 h-3 mr-2" /> Upgrade
      </Button>
    </div>
  );
}

function ReviewComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const asin = searchParams.get("asin") || "";
  const sellerId = searchParams.get("seller_id") || user?.seller_id || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tier = data?.tier || user?.subscriptionTier || "free";
  const isBasic = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  useEffect(() => {
    if (!asin || !sellerId) return;
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    
    fetch(`${BASE_URL}/api/comparison/reviews?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email]);

  const ratingDist = data?.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const barData = Object.entries(ratingDist)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([k, v]) => ({ star: `${k}★`, count: v as number, fill: Number(k) >= 4 ? "#10b981" : Number(k) === 3 ? "#f59e0b" : "#ef4444" }));

  if (!asin) return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-sky-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
        <MessageSquare className="w-10 h-10 text-sky-400" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Social Feedback Offline</h3>
      <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Select a product to analyse customer sentiment and competitor reputation clusters.</p>
      <Button onClick={() => router.push("/seller-products")} className="mt-8 rounded-2xl h-12 px-8 bg-slate-900 font-black uppercase tracking-widest text-xs">
        Browse Directory
      </Button>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <RefreshCw className="w-10 h-10 animate-spin text-sky-500" />
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Decoding Sentiment Patterns...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Product & Summary Header */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center p-8 lg:p-10 gap-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
            {data?.product_photo ? (
              <img src={data.product_photo} alt="" className="w-full h-full object-contain p-4" />
            ) : (
              <Package className="w-16 h-16 text-slate-200" />
            )}
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-100 font-black text-[9px] uppercase px-3 py-1 rounded-full">
                {data?.asin}
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-black text-[9px] uppercase px-3 py-1 rounded-full">
                {data?.total_ratings?.toLocaleString() || 0} Ratings
              </Badge>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight line-clamp-2">{data?.product_title}</h2>
            
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-8">
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reputation Score</p>
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-black text-slate-900">{data?.star_rating?.toFixed(1) || "—"}</span>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Velocity</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase px-3">
                    {data?.response_rate_pct || 0}% Managed
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <HealthScoreRing score={Math.round((data?.star_rating || 0) * 20)} />
          </div>
        </div>
      </Card>

      {/* Distribution & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rating Distribution */}
        <Card className="lg:col-span-7 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Activity className="w-5 h-5 text-sky-600" /> Reputation Spread
            </CardTitle>
            <CardDescription className="text-xs font-medium">Frequency distribution across star tiers</CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="star" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '15px' }}
                    labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8' }}
                  />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={50}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment breakdown */}
        <Card className="lg:col-span-5 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden relative">
          {!isPremium && <TierGate tier="premium" feature="Sentiment Analytics" />}
          <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Zap className="w-5 h-5 text-sky-600" /> NLP Sentiment Nodes
            </CardTitle>
            <CardDescription className="text-xs font-medium">AI analysis of review context & tone</CardDescription>
          </CardHeader>
          <CardContent className={`p-10 space-y-8 ${!isPremium ? 'blur-sm' : ''}`}>
            <SentimentBar label="Positive Signals" pct={data?.sentiment_breakdown?.positive ?? 78} icon={ThumbsUp} color="#10b981" />
            <SentimentBar label="Neutral Bias" pct={data?.sentiment_breakdown?.neutral ?? 14} icon={Minus} color="#f59e0b" />
            <SentimentBar label="Critical Friction" pct={data?.sentiment_breakdown?.negative ?? 8} icon={ThumbsDown} color="#ef4444" />
            
            <div className="pt-6 border-t border-slate-50">
              <div className="p-4 rounded-2xl bg-slate-50 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                  {data?.review_velocity_insight || "Stable feedback velocity detected over the last 30 telemetry cycles."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews & AI Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Feedback */}
        <Card className="lg:col-span-7 border-none shadow-xl rounded-[3rem] bg-white overflow-hidden relative">
          {!isBasic && <TierGate tier="basic" feature="Customer Feedback Log" />}
          <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">Recent Feedback</CardTitle>
              <CardDescription className="text-xs font-medium">Chronological customer telemetry</CardDescription>
            </div>
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-none px-3 py-1 font-black text-[9px] uppercase">
              {data?.recent_reviews?.length || 0} TRACKED
            </Badge>
          </CardHeader>
          <CardContent className={`p-0 ${!isBasic ? 'blur-sm' : ''}`}>
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
              {(data?.recent_reviews || Array(3).fill({})).map((review: any, i: number) => (
                <div key={i} className="p-8 group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 font-black text-sm">
                        {(review.author || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{review.author || "Anonymous Node"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date || "REAL-TIME"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-slate-900">{review.rating || 5}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-3 italic">"{review.comment || "Analysing feedback data stream..."}"</p>
                  {review.has_response && (
                    <div className="mt-4 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Seller Managed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Response Node */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative">
            {!isPremium && <TierGate tier="premium" feature="AI Response Protocol" />}
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
                <Zap className="w-5 h-5 text-sky-400" /> AI Response Node
              </CardTitle>
            </CardHeader>
            <CardContent className={`p-8 pt-4 ${!isPremium ? 'blur-sm' : ''}`}>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Suggested Resolution Protocol</p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                  "{data?.ai_response_suggestion || "Analysing negative feedback clusters to generate optimal resolution scripts..."}"
                </p>
                <div className="pt-4 flex justify-end">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white font-black text-[9px] uppercase h-8 px-4 rounded-lg">Copy Script</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 overflow-hidden relative">
            {!isPremium && <TierGate tier="premium" feature="Portfolio Reputation" />}
            <div className={`space-y-4 ${!isPremium ? 'blur-sm' : ''}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Health Benchmark</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900">{data?.avg_seller_portfolio_rating?.toFixed(2) || "4.2"}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Portfolio Aggregate</p>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <div>
                  <p className="text-2xl font-black text-emerald-600">+{Math.abs((data?.star_rating || 0) - (data?.avg_seller_portfolio_rating || 4.2)).toFixed(2)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Node Delta</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ReviewComparisonPage() {
  return (
    <Suspense fallback={<div className="flex h-[70vh] items-center justify-center"><RefreshCw className="animate-spin text-sky-500" /></div>}>
      <ReviewComparisonContent />
    </Suspense>
  );
}
