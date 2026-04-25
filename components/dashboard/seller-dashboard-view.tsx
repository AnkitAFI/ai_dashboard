"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, Star, DollarSign,
  Zap, BarChart3, Users, Award, ShieldCheck, Loader2, RefreshCcw, ShoppingCart, Percent
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: { value: string; positive: boolean };
}

function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-sky-50 transition-colors">{icon}</div>
          {trend && (
            <div className={cn("flex items-center text-[10px] font-bold px-2 py-1 rounded-full", trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
              {trend.positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h3>
          <p className="text-[10px] text-slate-400 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchStats = async () => {
    if (!user?.seller_id) return;
    try {
      const resp = await fetch(`${BASE_URL}/api/seller/dashboard-stats?seller_id=${user.seller_id}`, { credentials: "include" });
      if (!resp.ok) throw new Error("Failed to fetch stats");
      setStats(await resp.json());
    } catch (err) { console.error(err); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    if (user?.seller_id) {
      fetchStats();
      const interval = setInterval(() => {
        if (!stats || stats.status === "SYNCING" || stats?.metrics?.total_products === 0) fetchStats();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user?.seller_id, stats?.status, stats?.metrics?.total_products, BASE_URL]);

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /><p className="text-sm font-bold text-slate-400">Loading catalog intelligence...</p></div>;
  if (!stats) return null;

  const isSyncing = stats.status === "SYNCING";
  const hasNoData = stats.metrics?.total_products === 0;

  if (hasNoData && isSyncing) return <div className="flex flex-col items-center justify-center py-20 gap-6 text-center"><div className="relative"><Loader2 className="w-16 h-16 text-sky-500 animate-spin" /><RefreshCcw className="w-6 h-6 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" /></div><div className="space-y-2"><h2 className="text-xl font-extrabold text-slate-900">Synchronizing Your Store</h2><p className="text-sm text-slate-500 max-w-sm mx-auto">We're fetching your Amazon products and metrics. This initial sync usually takes 30-60 seconds.</p></div></div>;

  const { metrics, charts } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Seller Intelligence</h2>
          <p className="text-xs text-slate-500">Merchant ID: <span className="font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">{user?.seller_id}</span></p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); fetchStats(); }} disabled={refreshing} className="rounded-xl border-slate-200 shadow-sm"><RefreshCcw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} /> {refreshing ? "Syncing..." : "Sync Now"}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Products" value={metrics.total_products} icon={<Package className="w-5 h-5 text-sky-600" />} description="Active listings" trend={{ value: "+2 new", positive: true }} />
        <MetricCard title="Avg Rating" value={`${metrics.avg_rating} / 5`} icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />} description="Catalog feedback" trend={{ value: "+0.2", positive: true }} />
        <MetricCard title="Avg Price" value={`₹${metrics.avg_price}`} icon={<DollarSign className="w-5 h-5 text-emerald-600" />} description="Mean list price" />
        <MetricCard title="Prime Presence" value={`${metrics.prime_products_pct}%`} icon={<Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />} description="FBA eligible" />
        <MetricCard title="Total Reviews" value={metrics.total_reviews.toLocaleString()} icon={<Users className="w-5 h-5 text-sky-600" />} description="Lifetime feedback" />
        <MetricCard title="Seller Rating" value={`${metrics.avg_seller_rating} / 5`} icon={<BarChart3 className="w-5 h-5 text-indigo-600" />} description="Store reputation" />
        <MetricCard title="Best Sellers" value={metrics.best_sellers_count} icon={<Award className="w-5 h-5 text-orange-500" />} description="Badge holders" />
        <MetricCard title="Amazon Choice" value={`${metrics.amazon_choice_pct}%`} icon={<ShieldCheck className="w-5 h-5 text-teal-600" />} description="Keyword wins" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl bg-white"><CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-sky-600" /> Sales Trend</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={charts.sales_trend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "#94a3b8", fontSize: 10}} /><YAxis axisLine={false} tickLine={false} tick={{fill: "#94a3b8", fontSize: 10}} /><Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} /><Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white"><CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-indigo-600" /> Marketplace Distribution</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.category_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">{charts.category_distribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: "16px" }} /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white"><CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Feedback Sentiment</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={charts.review_sentiment} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: "#475569", fontWeight: "bold", fontSize: 10}} width={70} /><Tooltip /><Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>{charts.review_sentiment.map((e: any, i: number) => <Cell key={i} fill={e.name === "Positive" ? "#10b981" : e.name === "Neutral" ? "#f59e0b" : "#ef4444"} />)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white"><CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><Percent className="h-4 w-4 text-sky-600" /> Rating Distribution</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={charts.rating_distribution}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "#94a3b8", fontSize: 10}} /><YAxis axisLine={false} tickLine={false} tick={{fill: "#94a3b8", fontSize: 10}} /><Tooltip /><Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>{charts.rating_distribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
      </div>
    </div>
  );
}
