"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2, Search, TrendingUp, TrendingDown, Minus,
  Plus, Trash2, RefreshCw, BarChart3, Target, Crown,
  Lock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Lightbulb, ShoppingBag, AlertCircle, ArrowUp, ArrowDown, Activity, Bot, Sparkles, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API = `${API_BASE}/api/keyword-tracker`;

function AIInsightCard({ insight, label = "AI Insight" }: { insight: string; label?: string }) {
  return (
    <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform" />
      <div className="flex-shrink-0 w-10 h-10 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0 relative">
        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />{label}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">{insight}</p>
      </div>
    </div>
  );
}

function RankBadge({ rank, change }: { rank: number | null; change: number | null }) {
  if (rank === null) return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Unranked</span>;
  const page = Math.ceil(rank / 10);
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-extrabold text-slate-900 text-base">#{rank}</span>
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Page {page}</span>
      {change !== null && change !== 0 && (
        <span className={cn("flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1", change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
          {change > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
          {Math.abs(change)}
        </span>
      )}
    </div>
  );
}

export default function KeywordIntelligencePage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [pid, setPid] = useState("");
  const [platform, setPlatform] = useState("amazon");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});
  const [historyKw, setHistoryKw] = useState<any>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API}/dashboard`, { credentials: "include" });
      if (res.ok) setDashboard(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    fetch(`${API_BASE}/categories?table=${platform}`)
      .then(r => r.json())
      .then(d => setCategories(d.map((c: any) => c.category)))
      .catch(() => setCategories([]));
  }, [platform]);

  const handleAdd = async () => {
    if (!keyword.trim() || !pid.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ keyword: keyword.trim(), asin_or_pid: pid.trim(), platform, category: category || null }),
      });
      if (res.ok) { setKeyword(""); setPid(""); fetchDashboard(); }
    } catch (err) { console.error(err); } finally { setAdding(false); }
  };

  const handleRefresh = async (kwId: number) => {
    setRefreshing(p => ({ ...p, [kwId]: true }));
    try {
      const res = await fetch(`${API}/keywords/${kwId}/refresh`, { method: "POST", credentials: "include" });
      if (res.ok) fetchDashboard();
    } catch (err) { console.error(err); } finally { setRefreshing(p => ({ ...p, [kwId]: false })); }
  };

  const handleDelete = async (kwId: number) => {
    if (!confirm("Remove this keyword?")) return;
    try {
      const res = await fetch(`${API}/keywords/${kwId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) fetchDashboard();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /><p className="text-sm font-bold text-slate-400">Syncing rank intelligence...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Keyword Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time rank tracking and AI-driven growth insights</p>
        </div>
        <Button onClick={fetchDashboard} variant="outline" size="sm" className="rounded-xl border-slate-200 shadow-sm"><RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Sync All</Button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Improving", value: dashboard.improving, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Declining", value: dashboard.declining, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Stable", value: dashboard.stable, icon: Minus, color: "text-slate-400", bg: "bg-slate-50" },
            { label: "Not Ranked", value: dashboard.not_ranked, icon: Activity, color: "text-sky-600", bg: "bg-sky-50" },
          ].map((s) => (
            <Card key={s.label} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", s.bg)}><s.icon className={cn("w-6 h-6", s.color)} /></div>
                <div><p className="text-2xl font-black text-slate-900">{s.value}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dashboard?.ai_insight && <AIInsightCard insight={dashboard.ai_insight} label="Strategic Portfolio Insight" />}

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800"><Plus className="h-5 w-5 text-sky-600" /> New Keyword Target</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-tight">Deploy tracking for new assets</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Target Keyword</Label><Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. noise cancelling pods" className="h-12 rounded-xl bg-slate-50 border-none" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">ASIN / Product ID</Label><Input value={pid} onChange={e => setPid(e.target.value)} placeholder="e.g. B0XYZ123" className="h-12 rounded-xl bg-slate-50 border-none" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Platform</Label><Select value={platform} onValueChange={setPlatform}><SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="amazon">Amazon</SelectItem><SelectItem value="flipkart">Flipkart</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase">Market Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none"><SelectValue placeholder="Market category" /></SelectTrigger><SelectContent className="rounded-xl">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <Button onClick={handleAdd} disabled={adding} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-all shadow-lg shadow-slate-200">{adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><Target className="h-4 w-4 mr-2" /> Deploy Rank Tracking</>}</Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-8"><CardTitle className="text-lg font-bold text-slate-800">Tracked Targets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-y border-slate-100">
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset & Keyword</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Position</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Check</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboard?.keywords.map((kw: any) => (
                  <tr key={kw.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col"><span className="font-bold text-slate-900">{kw.keyword}</span><span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-1 w-fit uppercase">{kw.asin_or_pid} · {kw.platform}</span></div>
                    </td>
                    <td className="px-8 py-6 text-right"><RankBadge rank={kw.current_rank} change={kw.rank_change} /></td>
                    <td className="px-8 py-6 text-right"><span className="text-xs text-slate-500 font-medium">{kw.last_checked_at ? new Date(kw.last_checked_at).toLocaleDateString() : "Never"}</span></td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleRefresh(kw.id)} disabled={refreshing[kw.id]} className="h-8 w-8 rounded-lg text-sky-600 hover:bg-sky-50"><RefreshCw className={cn("h-4 w-4", refreshing[kw.id] && "animate-spin")} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(kw.id)} className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
