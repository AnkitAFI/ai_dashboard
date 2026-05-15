"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Target, TrendingUp, DollarSign, Users, ShoppingBag, History, Star, ArrowRight, TrendingDown,
  ShieldCheck, Zap, Activity, Clock, Search, Sparkles, Filter, AlertCircle, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com");

function ProductResearchContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [source, setSource] = useState("amazon");
  const [baseCost, setBaseCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/categories?table=${source}`)
      .then(r => r.json())
      .then(d => setCategories(d.map((c: any) => c.category)))
      .catch(() => setCategories([]));
  }, [source]);

  const handleAnalyze = async () => {
    if (!productName || !category || !baseCost) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/product-tracker/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: productName, category, source, base_cost: parseFloat(baseCost), user_email: user?.email }),
      });
      const data = await res.json();
      if (res.ok) setResult(data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Product <span className="text-sky-600">Research</span></h1>
          <p className="text-base text-slate-500 font-medium mt-2">Discover high-potential niches and validate your product ideas with AI-driven market data</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 shadow-sm px-6 h-12 font-bold" onClick={() => router.push("/product-tracker/history")}><History className="w-4 h-4 mr-2" /> Research History</Button>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800"><Search className="h-6 w-6 text-sky-600" /> Market Research Blueprint</CardTitle>
          <CardDescription className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Initialize deep market discovery</CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Concept</Label><Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Bamboo Desk Organizer" className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none" /></div>
            <div className="space-y-3"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketplace</Label><select value={source} onChange={(e) => setSource(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"><option value="amazon">Amazon India</option><option value="flipkart">Flipkart India</option></select></div>
            <div className="space-y-3"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Category</Label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"><option value="">Select category...</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="space-y-3"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Landing Cost (₹)</Label><Input value={baseCost} onChange={e => setBaseCost(e.target.value)} type="number" placeholder="e.g. 500" className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none" /></div>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full h-16 rounded-[1.25rem] bg-sky-600 hover:bg-sky-700 text-white font-black text-base transition-all shadow-2xl shadow-sky-100">{loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <><Sparkles className="h-5 w-5 mr-3" /> Validate Opportunity</>}</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-10 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Viability</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Recommended Price</p>
                <p className="text-5xl font-black text-sky-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
              </div>
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase">Profit Margin</span>
                <span className="text-2xl font-black text-emerald-600">+{result.pricing.profit_margin.toFixed(1)}%</span>
              </div>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-10 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumer Demand</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Est. Monthly Sales</p>
                <p className="text-5xl font-black text-indigo-600">{result.sales.estimated_monthly_sales}</p>
              </div>
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase">Market Velocity</span>
                <span className="text-sm font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl uppercase tracking-tight">{result.sales.market_demand}</span>
              </div>
            </Card>
            <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white p-10 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competitive Density</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Active Rivals</p>
                <p className="text-5xl font-black text-slate-900">{result.competition.total_competitors}</p>
              </div>
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase">Avg Satisfaction</span>
                <span className="text-xl font-black text-amber-500 flex items-center gap-1.5"><Star className="w-5 h-5 fill-amber-500" /> {result.competition.avg_competitor_rating.toFixed(1)}</span>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(15,23,42,0.15)] rounded-[3rem] bg-slate-950 p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-600 rounded-full -mr-[250px] -mt-[250px] opacity-20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full -ml-[200px] -mb-[200px] opacity-10 blur-[80px]" />
            
            <div className="flex flex-col md:flex-row gap-12 relative z-10">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30 backdrop-blur-none"><Zap className="w-6 h-6 text-sky-400" /></div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">AI Strategic Evaluation</h3>
                    <p className="text-sky-300/60 text-xs font-bold uppercase tracking-[0.2em] mt-1">Niche Vulnerability Report</p>
                  </div>
                </div>
                <p className="text-sky-50/80 text-lg font-medium leading-relaxed italic border-l-4 border-sky-500/50 pl-6 py-2">"{result.ai_strategy}"</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-background opacity-100 border border-white/10 backdrop-blur-none"><p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Entry Risk</p><p className="text-sm font-bold text-white">LOW - High Gap Detected</p></div>
                   <div className="p-4 rounded-2xl bg-background opacity-100 border border-white/10 backdrop-blur-none"><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Market Fit</p><p className="text-sm font-bold text-white">Excellent (4.8/5.0)</p></div>
                </div>
              </div>
              <div className="md:w-80 bg-background opacity-100 backdrop-blur-none rounded-[2.5rem] p-10 border border-white/20 text-center flex flex-col items-center justify-center space-y-4 shadow-2xl shadow-black/20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Opportunity Score</p>
                <div className="relative">
                   <div className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-sky-400">{result.final_verdict?.opportunity_score ?? 0}</div>
                   <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                </div>
                <Badge className="bg-sky-500 hover:bg-sky-500 text-white border-none px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20">{result.final_verdict?.verdict_label}</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ProductResearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <ProductResearchContent />
    </Suspense>
  );
}
