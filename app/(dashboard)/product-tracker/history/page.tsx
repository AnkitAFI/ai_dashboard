"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, Trash2, Eye, Calendar, DollarSign, TrendingUp, AlertCircle, Package, AlertTriangle, ChevronLeft, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProductTrackerHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchHistory = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/product-tracker/history?user_email=${user.email}&limit=50`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setHistory(data.data?.items || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [user?.email, API_BASE]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const fetchDetails = async (id: number) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/product-tracker/analysis/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setSelectedAnalysis(data.data);
    } catch (err) { console.error(err); } finally { setDetailsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/product-tracker/analysis/${id}?user_email=${user?.email}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
      }
    } catch (err) { console.error(err); } finally { setIsDeleting(false); }
  };

  if (loading && history.length === 0) return <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /><p className="text-sm font-bold text-slate-400">Loading analysis archive...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/product-tracker")} variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100 text-slate-500"><ChevronLeft className="w-5 h-5 mr-1" /> Back</Button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Intelligence Archive</h1>
            <p className="text-sm text-slate-500 font-medium">Historical market opportunity assessments</p>
          </div>
        </div>
        <Badge className="px-4 py-2 bg-sky-50 text-sky-600 border-none font-bold">{history.length} Saved Records</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <Card key={item.id} className={cn("border-none shadow-sm rounded-2xl bg-white overflow-hidden cursor-pointer transition-all hover:shadow-md group", selectedAnalysis?.id === item.id && "ring-2 ring-sky-500")} onClick={() => fetchDetails(item.id)}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate w-48">{item.product_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                  </div>
                  <Badge className={cn("px-2 py-0.5 border-none text-[10px] font-black uppercase tracking-tight", item.source === "amazon" ? "bg-orange-50 text-orange-600" : "bg-sky-50 text-sky-600")}>{item.source}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-50">
                  <div className="flex flex-col"><span className="text-slate-400 uppercase tracking-tight text-[8px]">Profit</span><span className="text-emerald-600">{item.profit_margin.toFixed(1)}%</span></div>
                  <div className="flex flex-col items-end"><span className="text-slate-400 uppercase tracking-tight text-[8px]">Demand</span><span className="text-sky-600 uppercase">{item.market_demand}</span></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString()}</p>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="h-7 w-7 p-0 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {history.length === 0 && <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200"><Package className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-xs font-bold text-slate-400 uppercase">Archive Empty</p></div>}
        </div>

        <div className="lg:col-span-2">
          {detailsLoading ? (
            <Card className="h-full border-none shadow-sm rounded-3xl bg-white flex flex-col items-center justify-center gap-4"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /><p className="text-sm font-bold text-slate-400">Reconstructing analysis...</p></Card>
          ) : selectedAnalysis ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-sm rounded-3xl bg-white p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedAnalysis.product_name}</h2>
                    <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mt-1">{selectedAnalysis.category} • {selectedAnalysis.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opportunity Score</p>
                    <p className="text-4xl font-black text-sky-600">{selectedAnalysis.final_verdict?.opportunity_score || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-3 h-3" /> Pricing Strategy</p>
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-600">Base Cost</span><span className="font-black">₹{selectedAnalysis.base_cost.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-600">Rec. Price</span><span className="text-lg font-black text-sky-600">₹{selectedAnalysis.pricing.recommended_price.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200"><span className="text-[10px] font-bold text-slate-400 uppercase">Profit Margin</span><span className="text-lg font-black text-emerald-600">{selectedAnalysis.pricing.profit_margin.toFixed(1)}%</span></div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Market Traction</p>
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-600">Monthly Sales</span><span className="font-black">{selectedAnalysis.sales.estimated_monthly_sales} Units</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-600">Daily Velocity</span><span className="font-black text-indigo-600">{selectedAnalysis.sales.estimated_daily_sales.toFixed(1)}/day</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200"><span className="text-[10px] font-bold text-slate-400 uppercase">Demand Level</span><Badge className="bg-sky-100 text-sky-600 border-none font-bold uppercase text-[8px]">{selectedAnalysis.sales.market_demand}</Badge></div>
                  </div>
                </div>
                <div className="mt-8 p-8 bg-sky-950 rounded-3xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16" />
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center"><Eye className="w-4 h-4 text-sky-400" /></div><h3 className="text-lg font-bold">Strategic Directive</h3></div>
                    <p className="text-sky-100 text-sm leading-relaxed font-medium">{selectedAnalysis.ai_strategy}</p>
                  </div>
                </div>
                {selectedAnalysis.warnings?.length > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Risk Assessment</p>
                      <ul className="list-disc list-inside text-xs font-medium text-amber-800 space-y-1">{selectedAnalysis.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="h-full border-none shadow-sm rounded-3xl bg-white flex flex-col items-center justify-center gap-4 text-slate-300"><History className="w-16 h-16 opacity-20" /><p className="text-sm font-bold uppercase tracking-widest">Select an entry to view intelligence</p></Card>
          )}
        </div>
      </div>
    </div>
  );
}
