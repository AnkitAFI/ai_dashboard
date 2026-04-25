"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Target, TrendingUp, DollarSign, Users, ShoppingBag, History, Star, ArrowRight, TrendingDown,
  ShieldCheck, Zap, Activity, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProductTrackerPage() {
  const { user } = useAuth();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [source, setSource] = useState("amazon");
  const [baseCost, setBaseCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_BASE}/categories?table=${source}`)
      .then(r => r.json())
      .then(d => setCategories(d.map((c: any) => c.category)))
      .catch(() => setCategories([]));
  }, [source, API_BASE]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Market Opportunity Radar</h1>
          <p className="text-sm text-slate-500 font-medium">Data-driven analysis for your next big product launch</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 shadow-sm" onClick={() => window.location.href = "/product-tracker/history"}><History className="w-4 h-4 mr-2" /> View History</Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800"><Target className="h-5 w-5 text-sky-600" /> Market Analysis Profile</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-tight">Initialize opportunity assessment</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Product Concept</Label><Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Ergonomic Office Chair" className="h-12 rounded-xl bg-slate-50 border-none" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Marketplace</Label><Select value={source} onValueChange={setSource}><SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="amazon">Amazon</SelectItem><SelectItem value="flipkart">Flipkart</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Market Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent className="rounded-xl">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Estimated Landing Cost (₹)</Label><Input value={baseCost} onChange={e => setBaseCost(e.target.value)} type="number" placeholder="e.g. 1500" className="h-12 rounded-xl bg-slate-50 border-none" /></div>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-lg shadow-sky-100">{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><Activity className="h-4 w-4 mr-2" /> Run Market Radar</>}</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Strategy</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500">Recommended Price</p>
                <p className="text-4xl font-black text-sky-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Profit Margin</span>
                <span className="text-lg font-black text-emerald-600">{result.pricing.profit_margin.toFixed(1)}%</span>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Demand</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500">Est. Monthly Sales</p>
                <p className="text-4xl font-black text-indigo-600">{result.sales.estimated_monthly_sales}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Demand Level</span>
                <span className="text-sm font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">{result.sales.market_demand}</span>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competitive Landscape</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500">Total Competitors</p>
                <p className="text-4xl font-black text-slate-900">{result.competition.total_competitors}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Avg Market Rating</span>
                <span className="text-lg font-black text-amber-500 flex items-center gap-1"><Star className="w-4 h-4 fill-amber-500" /> {result.competition.avg_competitor_rating.toFixed(1)}</span>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-sky-950 p-8 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-900 rounded-full -mr-32 -mt-32 opacity-20" />
            <div className="flex flex-col md:flex-row gap-8 relative">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30"><Zap className="w-5 h-5 text-sky-400" /></div>
                  <h3 className="text-xl font-bold">AI Strategic Directive</h3>
                </div>
                <p className="text-sky-100 leading-relaxed font-medium">{result.ai_strategy}</p>
              </div>
              <div className="md:w-64 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-2">Launch Score</p>
                <p className="text-6xl font-black">{result.final_verdict?.opportunity_score ?? 0}</p>
                <Badge className="mt-4 bg-sky-500 hover:bg-sky-500 text-white border-none px-4 py-1 font-bold">{result.final_verdict?.verdict_label}</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
