"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Search, TrendingUp, Package, Plus,
  RefreshCw, CheckCircle2, XCircle, Target, BarChart3, Clock,
  Star, MessageSquare, ThumbsUp, Lock, Crown, AlertCircle,
  Send, Bot, User, Download, Bell, Globe, Zap, TrendingDown, Minus, Eye,
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, Sparkles, MapPin, Target as TargetIcon
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const { push } = require("next/navigation").useRouter();
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center z-10 gap-4 text-center p-6 border-2 border-dashed border-slate-100">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100", tier === "premium" ? "bg-indigo-600" : "bg-sky-600")}>
        <Lock className="w-6 h-6 text-white" />
      </div>
      <div>
        <h4 className="font-black text-slate-900 text-lg">{feature}</h4>
        <p className="text-sm text-slate-400 font-medium mt-1">{tier === "premium" ? "Premium Intelligence Required" : "Basic Intelligence Required"}</p>
      </div>
      <Button onClick={() => push("/subscription")} className="rounded-full bg-slate-900 hover:bg-black text-white font-bold px-8 py-6 h-auto shadow-xl">Upgrade Access</Button>
    </div>
  );
}

function RankTrackerContent() {
  const { user } = useAuth();
  const [sellerId, setSellerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [rankData, setRankData] = useState<any>(null);
  const [loadingRanks, setLoadingRanks] = useState(false);

  const tier = user?.subscriptionTier || "free";
  const isBasic = tier === "basic" || tier === "premium";
  const isPremium = tier === "premium";

  const fetchProducts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const sid = sellerId || user?.seller_id;
      if (!sid) return;
      const res = await fetch(`${API_BASE}/api/seller/products?seller_id=${sid}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [user?.id, sellerId, user?.seller_id]);

  useEffect(() => {
    if (user?.seller_id) {
      setSellerId(user.seller_id);
      fetchProducts();
    }
  }, [user?.seller_id, fetchProducts]);

  const analyzeProduct = async (product: any) => {
    setSelectedProduct(product);
    setLoadingRanks(true);
    try {
      // Mocking rank data for now, would be API call in real
      const res = await fetch(`${API_BASE}/api/keyword-tracker/product/${product.asin}?user_email=${user?.email}`, { credentials: "include" });
      if (res.ok) setRankData(await res.json());
    } catch (err) { console.error(err); } finally { setLoadingRanks(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Rank <span className="text-emerald-600">Intelligence</span></h1>
          <p className="text-base text-slate-500 font-medium mt-2">Precision tracking for your keyword positions across marketplaces</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="px-4 py-2 bg-emerald-100 text-emerald-700 border-none font-black uppercase text-xs tracking-widest">{tier}</Badge>
        </div>
      </div>

      {!selectedProduct ? (
        <div className="grid grid-cols-1 gap-10">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden p-10">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
               <div className="space-y-4 max-w-xl">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Select a product to start tracking rank performance</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Enter your Seller ID or pick from your tracked catalog to deploy deep rank analysis for specific search terms.</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <Input value={sellerId} onChange={e => setSellerId(e.target.value)} placeholder="Enter Seller ID..." className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold w-full md:w-64" />
                  <Button onClick={fetchProducts} disabled={loading} className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl">Fetch Assets</Button>
               </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Catalog...</p></div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {products.map((p, i) => (
                  <Card key={i} onClick={() => analyzeProduct(p)} className="group cursor-pointer border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all rounded-[2rem] bg-white overflow-hidden border border-slate-100 p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100">
                      {p.image ? <img src={p.image} alt="" className="w-full h-full object-contain p-2" /> : <Package className="w-8 h-8 text-slate-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{p.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{p.asin}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </Card>
                ))}
              </div>
            ) : sellerId && (
              <div className="py-20 text-center space-y-3"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto"><Search className="w-8 h-8 text-slate-200" /></div><p className="text-sm font-bold text-slate-400">No products found for this Seller ID.</p></div>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="rounded-xl hover:bg-slate-100 text-slate-400"><Minus className="w-5 h-5 mr-2" /> Back to Catalog</Button>
           </div>

           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {selectedProduct.image ? <img src={selectedProduct.image} alt="" className="w-full h-full object-contain p-3" /> : <Package className="w-10 h-10 text-slate-200" />}
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedProduct.title}</h2>
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <Badge className="bg-slate-100 text-slate-500 border-none font-bold font-mono">{selectedProduct.asin}</Badge>
                    <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500" /><span className="text-sm font-black text-slate-700">Active Tracking</span></div>
                 </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <Input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} placeholder="Add focus keyword..." className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold w-full md:w-64" />
                 <Button className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100 flex-shrink-0"><Plus className="w-5 h-5" /></Button>
              </div>
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div><h3 className="text-xl font-black text-slate-800">Keyword Performance</h3><p className="text-sm font-medium text-slate-400">Rank history for your primary search terms</p></div>
                    <Badge className="bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full border-none">Live Syncing</Badge>
                 </div>
                 <div className="h-[400px]">
                    {loadingRanks ? (
                       <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300"><Loader2 className="w-12 h-12 animate-spin" /><p className="text-xs font-black uppercase tracking-widest">Mining Data...</p></div>
                    ) : (
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{d: '1/10', r: 12}, {d: '5/10', r: 8}, {d: '10/10', r: 15}, {d: '15/10', r: 5}, {d: '20/10', r: 9}, {d: '25/10', r: 3}, {d: '30/10', r: 4}]}>
                             <defs><linearGradient id="rankGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                             <YAxis reversed axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                             <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                             <Area type="monotone" dataKey="r" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#rankGradient)" animationDuration={2000} />
                          </AreaChart>
                       </ResponsiveContainer>
                    )}
                 </div>
              </Card>

              <div className="space-y-6">
                 <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-indigo-950 p-10 relative overflow-hidden text-white">
                    {!isPremium && <TierGate tier="premium" feature="AI Rank Prediction" />}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-900 rounded-full -mr-24 -mt-24 opacity-30 blur-2xl" />
                    <h3 className="text-xl font-black mb-8 relative flex items-center gap-3"><Sparkles className="h-6 w-6 text-amber-400" /> Rank Forecast</h3>
                    <div className={cn("space-y-8 relative", !isPremium && "blur-md")}>
                       <div className="flex items-center justify-between p-6 bg-indigo-900/50 rounded-3xl border border-indigo-800/50">
                          <div><p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">7D Prediction</p><p className="text-3xl font-black">#2</p></div>
                          <div className="text-right"><Badge className="bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase">Improving</Badge></div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Strategic AI Insight</p>
                          <p className="text-sm font-medium leading-relaxed italic text-indigo-100">"Your rank is accelerating on 'noise cancelling earbuds' but losing ground on branded terms. Re-allocate 15% PPC budget to brand defense."</p>
                       </div>
                    </div>
                 </Card>

                 <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-8 space-y-6 relative overflow-hidden">
                    {!isBasic && <TierGate tier="basic" feature="Keyword Intelligence" />}
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><TargetIcon className="h-5 w-5 text-emerald-500" /> Active Keywords</h3>
                    <div className={cn("space-y-3", !isBasic && "blur-md")}>
                       {[
                         { kw: "noise cancelling pods", r: 4, c: +2 },
                         { kw: "wireless earbuds", r: 12, c: -3 },
                         { kw: "bluetooth earphones", r: 8, c: 0 },
                         { kw: "pro audio gear", r: 24, c: +5 },
                       ].map((k, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{k.kw}</span>
                            <div className="flex items-center gap-3">
                               <span className="text-sm font-black text-slate-900">#{k.r}</span>
                               {k.c !== 0 && (
                                 <span className={cn("flex items-center text-[10px] font-black", k.c > 0 ? "text-emerald-500" : "text-rose-500")}>
                                    {k.c > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(k.c)}
                                 </span>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function RankTrackerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" /><p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Synchronizing Rank Intelligence...</p></div>}>
      <RankTrackerContent />
    </Suspense>
  );
}
