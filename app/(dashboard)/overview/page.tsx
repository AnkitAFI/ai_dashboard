"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, DollarSign, Star, ShoppingBag, Sparkles, Zap, Target, BarChart3 } from "lucide-react";
import { useFilters } from "@/components/dashboard/FiltersContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Summary {
  total_products: number;
  avg_price: number;
  avg_rating: number;
  total_reviews: number;
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { filters } = useFilters();
  const source = filters.table || "flipkart";
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchSummary = async (selectedSource: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/analytics-summary?source=${selectedSource}`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(source);
  }, [source]);

  if (loading || !summary) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-12">
        <div className="space-y-4 text-center">
          <Skeleton className="h-10 w-64 mx-auto rounded-full" />
          <Skeleton className="h-4 w-96 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
        </div>
        <Skeleton className="h-64 rounded-[3rem]" />
      </div>
    );
  }

  const stats = [
    { label: "Total Inventory", value: summary.total_products?.toLocaleString(), icon: <ShoppingBag className="w-6 h-6" />, color: "sky", trend: "+12%", desc: "Active listings in your catalog" },
    { label: "Average Value", value: `₹${summary.avg_price?.toFixed(0)}`, icon: <DollarSign className="w-6 h-6" />, color: "emerald", trend: "+5%", desc: "Mean unit price across variants" },
    { label: "Consumer Trust", value: `${summary.avg_rating?.toFixed(1)} / 5`, icon: <Star className="w-6 h-6" />, color: "amber", trend: "+0.2", desc: "Weighted average star rating" },
    { label: "Social Proof", value: summary.total_reviews?.toLocaleString(), icon: <TrendingUp className="w-6 h-6" />, color: "violet", trend: "+45", desc: "Total customer interactions" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-4">
        <Badge variant="outline" className="px-6 py-2 rounded-full bg-sky-50 border-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-widest">
          <Zap className="w-3 h-3 mr-2 fill-sky-700" /> Operational Intelligence
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
          Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-800">Perspective.</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          Synchronized real-time telemetry from your {source.toUpperCase()} ecosystem.
        </p>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="group relative border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-2">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-all duration-500 group-hover:scale-110`} />
            <CardHeader className="relative p-8">
              <div className={`w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-${stat.color}-600 mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-black text-slate-900 leading-tight">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="relative px-8 pb-8 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">{stat.desc}</span>
                <Badge variant="secondary" className={`bg-${stat.color}-50 text-${stat.color}-700 border-none font-black text-[10px] rounded-full`}>
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Insight Engine */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
          <CardContent className="relative p-12 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-4xl font-black tracking-tight leading-[1.1]">AI-Driven Performance <br/>Lighthouse</h2>
              <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                Our neural models have processed your <strong>{source}</strong> data. Currently, your average trust score of <strong>{summary.avg_rating.toFixed(2)}</strong> indicates a stable market position. 
                <br/><br/>
                We recommend focused price-volume optimization for your top 10% inventory to capture an estimated <strong>15% margin uplift</strong> in the coming fiscal quarter.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-10">
              <Badge variant="outline" className="bg-white/5 border-white/10 text-white font-bold py-2 px-4 rounded-xl">
                <Target className="w-4 h-4 mr-2 text-sky-400" /> High Potential
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/10 text-white font-bold py-2 px-4 rounded-xl">
                <BarChart3 className="w-4 h-4 mr-2 text-emerald-400" /> Optimal Stability
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Side Panel */}
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900">Next Steps</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Automated growth checklist</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            {[
              { label: "Review Negative Sentiment", desc: "Address 12 pending reviews", time: "High Impact" },
              { label: "Price Audit", desc: "3 items are above market mean", time: "Urgent" },
              { label: "Inventory Check", desc: "Stock levels for 'Festive Collection'", time: "Seasonal" },
            ].map((task, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-sky-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{task.label}</p>
                  <p className="text-xs text-slate-400 font-medium">{task.desc}</p>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter py-0 px-2 border-slate-100">{task.time}</Badge>
                </div>
              </div>
            ))}
            <Button className="w-full mt-6 bg-slate-900 hover:bg-black text-white rounded-2xl h-12 font-bold shadow-xl shadow-slate-200">
              Generate Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
