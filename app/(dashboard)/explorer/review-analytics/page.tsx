"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, MessageSquare, TrendingUp, TrendingDown, Minus, Star, Search,
  ChevronRight, Filter, PieChart as PieChartIcon, BarChart3, Activity,
  AlertCircle, ShieldCheck, Zap, Sparkles, User, Lightbulb, Bot
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444"];

function ReviewAnalyticsContent() {
  const router = useRouter();
  const [source, setSource] = useState("amazon");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchGlobalStats = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking global stats for a high-level view
      const mockData = {
        total_reviews: 124500,
        distribution: [
          { name: "Positive", value: 65, color: "#10b981" },
          { name: "Neutral", value: 20, color: "#0ea5e9" },
          { name: "Negative", value: 10, color: "#f59e0b" },
          { name: "Critical", value: 5, color: "#ef4444" },
        ],
        top_complaints: [
          "Fragile packaging",
          "Delayed shipping in rural areas",
          "Complex setup instructions",
          "Battery life concerns"
        ],
        top_praise: [
          "Premium build quality",
          "Intuitive UI/UX",
          "Exceptional customer support",
          "Value for money"
        ]
      };
      setStats(mockData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGlobalStats(); }, [fetchGlobalStats]);

  const navigateToSentiment = (sentiment: string) => {
    router.push(`/sentiment-analysis/${source}/${sentiment}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Customer <span className="text-rose-600">Pulse</span></h1>
          <p className="text-base text-slate-500 font-medium mt-2">Aggregate sentiment patterns and linguistic analysis across the marketplace</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
           <button onClick={() => setSource("amazon")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", source === "amazon" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}>Amazon</button>
           <button onClick={() => setSource("flipkart")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", source === "flipkart" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}>Flipkart</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10 flex flex-col">
          <CardHeader className="p-0 mb-10"><CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800"><PieChartIcon className="h-6 w-6 text-rose-600" /> Global Sentiment Split</CardTitle><CardDescription className="text-sm font-medium text-slate-400">Distribution of customer feedback across {source.toUpperCase()}</CardDescription></CardHeader>
          <div className="h-[400px] flex-1 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats?.distribution} cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={8} dataKey="value" nameKey="name" animationDuration={1500}>
                    {stats?.distribution.map((entry: any, i: number) => <Cell key={i} fill={entry.color} className="outline-none" />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", padding: "12px 20px" }} />
                  <Legend iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-4xl font-black text-slate-900">{(stats?.total_reviews / 1000).toFixed(0)}k</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reviews Analyzed</p>
             </div>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-indigo-950 p-10 relative overflow-hidden text-white h-full">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-900 rounded-full -mr-24 -mt-24 opacity-30 blur-2xl" />
              <h3 className="text-xl font-black mb-8 relative flex items-center gap-3"><Bot className="h-6 w-6 text-sky-400" /> Linguistic Insights</h3>
              <div className="space-y-8 relative">
                 <div className="p-6 bg-indigo-900/50 rounded-3xl border border-indigo-800/50 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2"><Lightbulb className="w-3 h-3 text-amber-400" /> Sentiment Signal</p>
                    <p className="text-sm font-medium leading-relaxed italic text-indigo-100">"Consumers are increasingly frustrated with plastic packaging but highly praise build durability. Sustainable boxing could increase your positive sentiment by 12%."</p>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Market Sentiment Score</p>
                    <div className="flex items-center gap-4">
                       <div className="text-5xl font-black">78</div>
                       <div className="flex-1 space-y-2">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-sky-400" style={{ width: '78%' }} /></div>
                          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Higher than 64% of brands</p>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white p-10 space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><TrendingUp className="h-6 w-6 text-emerald-600" /> Top Customer Praise</h3>
            <div className="space-y-4">
               {stats?.top_praise.map((p: string, i: number) => (
                 <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100"><Star className="w-4 h-4 text-white fill-white" /></div>
                    <span className="text-sm font-bold text-slate-700">{p}</span>
                 </div>
               ))}
            </div>
         </Card>
         <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white p-10 space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><TrendingDown className="h-6 w-6 text-rose-600" /> Critical Pain Points</h3>
            <div className="space-y-4">
               {stats?.top_complaints.map((c: string, i: number) => (
                 <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-100">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-100"><AlertCircle className="w-4 h-4 text-white" /></div>
                    <span className="text-sm font-bold text-slate-700">{c}</span>
                 </div>
               ))}
            </div>
         </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[3rem] bg-slate-900 p-12 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-600 rounded-full -mr-[200px] -mt-[200px] opacity-10 blur-[80px]" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6 max-w-2xl text-center md:text-left">
               <h3 className="text-3xl font-black tracking-tight leading-tight">Explore Raw Customer Sentiment</h3>
               <p className="text-slate-400 text-lg font-medium leading-relaxed">Deep-dive into specific products and their customer feedback loops. Analyze the 'Why' behind every rating.</p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <Button onClick={() => navigateToSentiment('positive')} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 h-auto shadow-xl shadow-emerald-900/20">Positive Signals</Button>
                  <Button onClick={() => navigateToSentiment('negative')} className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black px-8 py-4 h-auto shadow-xl shadow-rose-900/20">Critical Feedback</Button>
               </div>
            </div>
            <div className="shrink-0">
               <div className="w-48 h-48 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center p-8 shadow-2xl">
                  <Activity className="w-12 h-12 text-rose-500 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Market Pulse</p>
                  <p className="text-2xl font-black text-white mt-1">REAL-TIME</p>
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}

export default function ReviewAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-6" /><p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Aggregating Sentiment Patterns...</p></div>}>
      <ReviewAnalyticsContent />
    </Suspense>
  );
}
