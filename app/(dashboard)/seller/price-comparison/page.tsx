"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Lock, Crown, Star, TrendingUp, TrendingDown,
  Minus, BarChart2, RefreshCw, Menu, X,
  Zap, CheckCircle, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Sparkles,
  Target, Activity, ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

function fmt(val: number | null | undefined, currency = "USD"): string {
  if (val == null) return "—";
  const sym = currency === "INR" ? "₹" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  return `${sym}${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtShort(val: number | null | undefined, currency = "USD"): string {
  if (val == null) return "—";
  const sym = currency === "INR" ? "₹" : "$";
  if (val >= 100000) return `${sym}${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${sym}${(val / 1000).toFixed(1)}K`;
  return `${sym}${val.toFixed(0)}`;
}

function TierGate({ tier, feature }: { tier: "basic" | "premium"; feature: string }) {
  const router = useRouter();
  return (
    <div className="absolute inset-0 bg-background backdrop-blur-none rounded-[2rem] flex flex-col items-center justify-center z-10 gap-3">
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

function PriceComparisonContent() {
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
  const currency = data?.currency || "USD";

  useEffect(() => {
    if (!asin || !sellerId) return;
    setLoading(true);
    const params = new URLSearchParams({ asin, seller_id: sellerId });
    if (user?.email) params.append("user_email", user.email);
    
    fetch(`${BASE_URL}/api/comparison/price?${params}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin, sellerId, user?.email]);

  const barData = data
    ? [
        { name: "Market Min", value: data.market_min, fill: "#94a3b8" },
        { name: "Your Price", value: data.current_price, fill: "#0ea5e9" },
        { name: "Market Avg", value: data.market_avg, fill: "#f59e0b" },
        { name: "Market Max", value: data.market_max, fill: "#ef4444" },
      ].filter((d) => d.value != null)
    : [];

  const densityColor: Record<string, string> = {
    High: "#ef4444", Medium: "#f59e0b", Low: "#10b981",
  };

  if (!asin) return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-sky-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
        <Target className="w-10 h-10 text-sky-400" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Strategy Targeting Offline</h3>
      <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Select a product from your intelligence directory to begin price benchmarking.</p>
      <Button onClick={() => router.push("/seller-products")} className="mt-8 rounded-2xl h-12 px-8 bg-slate-900 font-black uppercase tracking-widest text-xs">
        Browse Directory
      </Button>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <RefreshCw className="w-10 h-10 animate-spin text-sky-500" />
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Scanning Market Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Product Hero Card */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center p-8 lg:p-10 gap-8">
          <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
            {data?.product_photo ? (
              <img src={data.product_photo} alt="" className="w-full h-full object-contain p-4" />
            ) : (
              <Package className="w-12 h-12 text-slate-200" />
            )}
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-100 font-black text-[9px] uppercase px-3 py-1 rounded-full">
                {data?.asin}
              </Badge>
              {data?.is_prime && <Badge className="bg-blue-600 text-white border-none font-black text-[9px] uppercase px-3 py-1 rounded-full">Prime</Badge>}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight line-clamp-2 leading-tight">{data?.product_title}</h2>
            <div className="mt-4 flex items-center justify-center lg:justify-start gap-4">
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Node</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">{data?.competitor_count || 0} Matched SKU</span>
                </div>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data Quality</p>
                <Badge variant="outline" className="mt-0.5 bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[8px] uppercase px-2">High Fidelity</Badge>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-[2.5rem] p-8 text-center min-w-[200px] shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Current Value</p>
            <p className="text-4xl font-black text-sky-700">{fmt(data?.current_price, currency)}</p>
            {data?.discount_pct != null && (
              <p className="text-xs font-black text-emerald-600 mt-1 uppercase tracking-tighter">Save {data.discount_pct}% off MRP</p>
            )}
          </div>
        </div>
      </Card>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Market Min", value: fmt(data?.market_min, currency), sub: "Target for maximum velocity", icon: <TrendingDown className="w-4 h-4" />, color: "emerald" },
          { label: "Market Avg", value: fmt(data?.market_avg, currency), sub: "Standard cluster value", icon: <Minus className="w-4 h-4" />, color: "amber" },
          { label: "Market Max", value: fmt(data?.market_max, currency), sub: "Luxury cluster ceiling", icon: <TrendingUp className="w-4 h-4" />, color: "rose" },
          { label: "Price Range", value: `${fmtShort(data?.market_min, currency)} – ${fmtShort(data?.market_max, currency)}`, sub: "Delta bandwidth", icon: <Activity className="w-4 h-4" />, color: "sky" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden relative">
            {!isBasic && i > 0 && <TierGate tier="basic" feature={stat.label} />}
            <CardContent className={`p-8 ${!isBasic && i > 0 ? 'blur-sm' : ''}`}>
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bar Chart */}
        <Card className="lg:col-span-7 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden relative">
          {!isBasic && <TierGate tier="basic" feature="Market Positioning Map" />}
          <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-sky-600" /> Pricing Matrix
            </CardTitle>
            <CardDescription className="text-xs font-medium">Positioning relative to market benchmarks</CardDescription>
          </CardHeader>
          <CardContent className={`p-10 ${!isBasic ? 'blur-sm' : ''}`}>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                    tickFormatter={(value) => value.toUpperCase()}
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
                  <ReferenceLine y={data?.current_price} stroke="#0ea5e9" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'YOU', position: 'insideTopLeft', fill: '#0ea5e9', fontSize: 10, fontWeight: 900 }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={60}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Density & AI */}
        <div className="lg:col-span-5 space-y-8">
          {/* Price Band Density */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden relative">
            {!isBasic && <TierGate tier="basic" feature="Crowd Density Node" />}
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 flex items-center justify-between">
                Crowd Density <Badge variant="outline" className="bg-sky-50 text-sky-700 border-none">TOP {data?.price_percentile || 0}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className={`px-8 pb-8 space-y-5 ${!isBasic ? 'blur-sm' : ''}`}>
              {(data?.price_bands || Array(5).fill({})).map((band: any, i: number) => {
                const maxCount = Math.max(...(data?.price_bands || [{count: 1}]).map((x: any) => x.count || 1));
                return (
                  <div key={i} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                      <span>{band.label || "BAND " + i}</span>
                      <span className={band.your_price_in_band ? "text-sky-600" : ""}>{band.your_price_in_band ? "ACTIVE SECTOR" : (band.count || 0) + " UNITS"}</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${band.your_price_in_band ? 'bg-sky-500' : 'bg-slate-200'}`}
                        style={{ width: `${Math.max(((band.count || 0) / maxCount) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Tip */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative">
            {!isPremium && <TierGate tier="premium" feature="AI Pricing Logic" />}
            <CardContent className={`p-8 ${!isPremium ? 'blur-sm' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-background opacity-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-widest">AI Strategy Node</h4>
              </div>
              <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                "{data?.ai_pricing_tip || "Aggregating market intelligence for optimal placement..."}"
              </p>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence: 92%</span>
                <Badge className="bg-sky-500/20 text-sky-400 border-none font-black text-[9px]">PREMIUM</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



export default function PriceComparisonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <PriceComparisonContent />
    </Suspense>
  );
}
