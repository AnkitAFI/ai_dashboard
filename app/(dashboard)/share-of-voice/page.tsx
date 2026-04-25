"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Target, BarChart3, Search, RefreshCw, AlertCircle, CheckCircle, Users, Award, Filter,
  ChevronLeft, ChevronRight, Lock, Crown, XCircle, X, Zap, ShieldCheck, Map, Layers, Star, ArrowRight,
  TrendingDown, Minus, Info, Loader2, ShoppingBag, PieChart as PieChartIcon, Activity, Sparkles,
  BarChart2, MousePointer2, AlertTriangle, Target as TargetIcon
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, ScatterChart, Scatter, ZAxis,
  PolarRadiusAxis
} from "recharts";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6", "#f97316"];

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center p-6 border-2 border-dashed border-slate-100">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100", tier === "premium" ? "bg-indigo-600" : "bg-sky-600")}>
        <Lock className="w-6 h-6 text-white" />
      </div>
      <div>
        <h4 className="font-black text-slate-900 text-lg">{feature}</h4>
        <p className="text-sm text-slate-400 font-medium mt-1">{tier === "premium" ? "Premium Intelligence Required" : "Basic Intelligence Required"}</p>
      </div>
      <Button className="rounded-full bg-slate-900 hover:bg-black text-white font-bold px-8 py-6 h-auto shadow-xl">Upgrade Access</Button>
    </div>
  );
}

function ShareOfVoiceContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"category" | "keyword">("category");
  const [marketplace, setMarketplace] = useState<"flipkart" | "amazon">("flipkart");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [yourBrand, setYourBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [sovData, setSovData] = useState<any>(null);
  const [marketHealth, setMarketHealth] = useState<any>(null);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [keywordData, setKeywordData] = useState<any>(null);

  const tier = user?.subscriptionTier || "free";
  const isBasic = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sov/categories?marketplace=${marketplace}`);
      if (res.data.categories) setCategories(res.data.categories);
    } catch (err) { console.error(err); }
  }, [marketplace, API_BASE]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const analyzeCategory = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/api/sov/category/${encodeURIComponent(selectedCategory)}?marketplace=${marketplace}${yourBrand ? `&your_brand=${encodeURIComponent(yourBrand)}` : ""}`;
      const res = await axios.get(url, { withCredentials: true });
      setSovData(res.data);
      
      const healthUrl = `${API_BASE}/api/sov/market-health/${encodeURIComponent(selectedCategory)}?marketplace=${marketplace}${yourBrand ? `&your_brand=${encodeURIComponent(yourBrand)}` : ""}`;
      const healthRes = await axios.get(healthUrl, { withCredentials: true });
      setMarketHealth(healthRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const analyzeKeyword = async () => {
    if (!keywordSearch) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/api/sov/keyword/${encodeURIComponent(keywordSearch)}?marketplace=${marketplace}`;
      const res = await axios.get(url, { withCredentials: true });
      setKeywordData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Market Share <span className="text-sky-600">Intelligence</span></h1>
          <p className="text-base text-slate-500 font-medium mt-2">Deep-dive into SOV (Share of Voice) and competitor landscape dynamics</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="px-4 py-2 bg-sky-100 text-sky-700 border-none font-black uppercase text-xs tracking-widest">{tier}</Badge>
           {!isPremium && <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 shadow-xl shadow-indigo-100">Unlock Premium</Button>}
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
        <div className="flex bg-slate-50/50 p-2 gap-2">
          <button onClick={() => setActiveTab("category")} className={cn("flex-1 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2", activeTab === "category" ? "bg-white text-sky-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}><Layers className="w-4 h-4" /> Category SOV</button>
          <button onClick={() => setActiveTab("keyword")} className={cn("flex-1 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2", activeTab === "keyword" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}><Target className="w-4 h-4" /> Keyword SOV</button>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marketplace</label><select value={marketplace} onChange={(e: any) => setMarketplace(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"><option value="amazon">Amazon India</option><option value="flipkart">Flipkart India</option></select></div>
            {activeTab === "category" ? (
              <>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Category</label><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"><option value="">Select target market...</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Brand Analysis</label><input value={yourBrand} onChange={e => setYourBrand(e.target.value)} placeholder="e.g. Sony (Optional)" className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none" /></div>
              </>
            ) : (
              <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Focus Keyword</label><input value={keywordSearch} onChange={e => setKeywordSearch(e.target.value)} placeholder="e.g. true wireless earbuds" className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none" /></div>
            )}
          </div>
          <Button onClick={activeTab === "category" ? analyzeCategory : analyzeKeyword} disabled={loading} className={cn("w-full h-16 rounded-[1.25rem] text-white font-black text-base transition-all shadow-2xl", activeTab === "category" ? "bg-sky-600 hover:bg-sky-700 shadow-sky-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200")}>{loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <><Search className="h-5 w-5 mr-3" /> Generate Intelligence Report</>}</Button>
        </CardContent>
      </Card>

      {(sovData || keywordData) && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10 flex flex-col"><CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800"><PieChartIcon className="h-6 w-6 text-sky-600" /> Market Share Distribution</CardTitle><CardDescription className="text-sm font-medium text-slate-400">Share of Voice by Top 8 Brands</CardDescription></CardHeader><div className="h-[400px] flex-1"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={(activeTab === "category" ? sovData : keywordData).brands.slice(0, 8)} cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={8} dataKey="share_percentage" nameKey="brand" animationDuration={1500} animationBegin={300}>{ (activeTab === "category" ? sovData : keywordData).brands.slice(0, 8).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} className="outline-none" />) }</Pie><Tooltip contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", padding: "12px 20px" }} /><Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} /></PieChart></ResponsiveContainer></div></Card>
            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10 flex flex-col"><CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800"><BarChart3 className="h-6 w-6 text-indigo-600" /> Reputation Benchmark</CardTitle><CardDescription className="text-sm font-medium text-slate-400">Review count correlation to market share</CardDescription></CardHeader><div className="h-[400px] flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={(activeTab === "category" ? sovData : keywordData).brands.slice(0, 8)}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="brand" axisLine={false} tickLine={false} tick={{fill: "#94a3b8", fontSize: 11, fontWeight: 700}} /><YAxis axisLine={false} tickLine={false} tick={{fill: "#94a3b8", fontSize: 10}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'}} /><Bar dataKey="total_reviews" radius={[12, 12, 0, 0]} fill="#6366f1" barSize={40} animationDuration={1500} /></BarChart></ResponsiveContainer></div></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: "Market Leader", value: (activeTab === "category" ? sovData : keywordData).market_leader || "—", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
               { label: "Avg Price", value: `₹${(activeTab === "category" ? sovData : keywordData).avg_price || 0}`, icon: ShoppingBag, color: "text-sky-600", bg: "bg-sky-50" },
               { label: "Market Volatility", value: "Medium", icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
               { label: "Growth Potential", value: "High", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
             ].map((s, i) => (
               <Card key={i} className="border-none shadow-sm rounded-3xl bg-white p-6"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", s.bg)}><s.icon className={cn("w-6 h-6", s.color)} /></div><p className="text-2xl font-black text-slate-900">{s.value}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p></Card>
             ))}
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between"><div className="space-y-1"><CardTitle className="text-xl font-black text-slate-800">Competitive Leaderboard</CardTitle><CardDescription className="text-sm font-medium text-slate-400">Complete brand breakdown by visibility</CardDescription></div><Badge variant="outline" className="rounded-full px-4 py-1.5 border-slate-100 text-slate-500 font-bold">{(activeTab === "category" ? sovData : keywordData).brands.length} Brands Detected</Badge></CardHeader>
            <CardContent className="p-0 mt-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50/70 border-y border-slate-100"><th className="px-10 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Brand Name</th><th className="px-10 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">SOV Share</th><th className="px-10 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Reputation (Reviews)</th><th className="px-10 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Avg Rating</th><th className="px-10 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Market Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {(activeTab === "category" ? sovData : keywordData).brands.map((b: any, i: number) => (
                      <tr key={b.brand} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-sky-600 group-hover:text-white transition-all">{i + 1}</div><span className="font-black text-slate-800 text-base">{b.brand}</span></div></td>
                        <td className="px-10 py-6 text-right"><span className="font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl text-sm">{b.share_percentage.toFixed(1)}%</span></td>
                        <td className="px-10 py-6 text-right text-sm text-slate-500 font-bold">{b.total_reviews.toLocaleString()} <span className="text-[10px] text-slate-300 ml-1 font-medium">counts</span></td>
                        <td className="px-10 py-6 text-right"><div className="flex items-center justify-end gap-1.5 font-black text-amber-500 text-base"><Star className="w-4 h-4 fill-amber-500" /> {b.avg_rating || "N/A"}</div></td>
                        <td className="px-10 py-6 text-right"><Badge className={cn("px-3 py-1 rounded-full border-none font-black text-[10px] uppercase tracking-tighter", i < 3 ? "bg-emerald-100 text-emerald-700" : i < 10 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400")}>{i < 3 ? "Dominant" : i < 10 ? "Challenger" : "Niche"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10 relative overflow-hidden">
                {!isBasic && <TierGate tier="basic" feature="Market Health Diagnostics" />}
                <CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800"><ShieldCheck className="h-6 w-6 text-emerald-600" /> Competitive Health</CardTitle></CardHeader>
                <div className={cn("space-y-8", !isBasic && "blur-md")}>
                   <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Concentration Index (HHI)</p><p className="text-2xl font-black text-slate-900">{marketHealth?.concentration?.hhi_score?.toFixed(0) || 1200}</p></div>
                      <Badge className="bg-emerald-500 text-white rounded-xl px-4 py-1.5 font-black uppercase text-[10px]">{marketHealth?.concentration?.label || "Fragmented"}</Badge>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Barriers & Opportunity</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100"><p className="text-[10px] font-bold text-sky-600 uppercase mb-1">Entry Risk</p><p className="text-sm font-black text-slate-800">{marketHealth?.concentration?.entry_difficulty || "Low"}</p></div>
                         <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100"><p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Saturation</p><p className="text-sm font-black text-slate-800">34% (Healthy)</p></div>
                      </div>
                   </div>
                </div>
             </Card>

             <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-indigo-950 p-10 relative overflow-hidden text-white">
                {!isPremium && <TierGate tier="premium" feature="AI Strategic Roadmap" />}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-900 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl" />
                <CardHeader className="p-0 mb-8 relative"><CardTitle className="text-xl font-black flex items-center gap-3"><Zap className="h-6 w-6 text-amber-400" /> Strategic AI Advisory</CardTitle></CardHeader>
                <div className={cn("space-y-8 relative", !isPremium && "blur-md")}>
                   <div className="p-6 bg-indigo-900/50 rounded-3xl border border-indigo-800/50 backdrop-blur-sm">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Core Strategic Signal</p>
                      <p className="text-sm font-medium leading-relaxed italic text-indigo-50">"{marketHealth?.ai_strategy || "The market is ripe for entry with high-rating/low-price products. Aim for the 4.2+ rating band with sub-₹999 pricing to disrupt top incumbents."}"</p>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Growth Roadmap</p>
                      <div className="space-y-3">
                         {["Focus on 'Fast Delivery' value proposition", "Target 200+ reviews in first 45 days", "Execute aggressive discount for first 1k units"].map((step, i) => (
                           <div key={i} className="flex items-center gap-3 text-xs font-bold text-indigo-100 bg-white/5 p-3 rounded-xl border border-white/10"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> {step}</div>
                         ))}
                      </div>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShareOfVoicePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-6" /><p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Aggregating Market Intelligence...</p></div>}>
      <ShareOfVoiceContent />
    </Suspense>
  );
}
