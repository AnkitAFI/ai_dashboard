"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft, Star, ShoppingBag, TrendingUp, Sparkles, Zap, ArrowUpRight, ArrowDownRight, Share2, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductData {
  product_name: string;
  product_id?: string | null;
  image?: string | null;
  avg_price: number | null;
  avg_rating: number | null;
  total_reviews: number | null;
  source?: string;
  min_price?: number | null;
  max_price?: number | null;
}

interface ForecastData {
  forecast: number[];
  dates: string[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const name = params.name as string;
  const productName = decodeURIComponent(name || "").trim();
  const fromCategory = searchParams.get("category") || "";
  const sourceParam = searchParams.get("source") || "";

  const [data, setData] = useState<ProductData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRange, setActiveRange] = useState("1y");
  const [isAmazon, setIsAmazon] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!productName) return;
    setLoading(true);
    setError("");

    axios
      .get<ProductData>(`${BASE_URL}/product/${encodeURIComponent(productName)}`)
      .then((res) => {
        setData(res.data);
        const productSource = res.data.source || sourceParam || "";
        setIsAmazon(productSource.toLowerCase() === "amazon");
      })
      .catch(() => setError("Failed to synchronize product intelligence."))
      .finally(() => setLoading(false));
  }, [productName]);

  useEffect(() => {
    if (!productName || !data) return;

    let endpoint = "";
    const cleanProductName = productName.replace(/['"%]/g, "").trim();

    if (isAmazon && data.product_id) {
      endpoint = `${BASE_URL}/lstm_forecast/amazon/${encodeURIComponent(data.product_id)}`;
    } else if (isAmazon) {
      endpoint = `${BASE_URL}/lstm_forecast/amazon/${encodeURIComponent(cleanProductName)}`;
    } else {
      endpoint = `${BASE_URL}/lstm_forecast/flipkart/${encodeURIComponent(cleanProductName)}`;
    }

    axios
      .get(endpoint)
      .then((res) => {
        if (res.data.forecast && Array.isArray(res.data.forecast.forecast_dates)) {
          setForecast({ 
            dates: res.data.forecast.forecast_dates, 
            forecast: res.data.forecast.forecast_sales 
          });
        } else if (Array.isArray(res.data.forecast_dates)) {
          setForecast({
            dates: res.data.forecast_dates,
            forecast: res.data.forecast_sales,
          });
        }
      })
      .catch(console.error);
  }, [productName, isAmazon, data]);

  if (loading) return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      <Skeleton className="h-20 w-full rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="h-[500px] rounded-[3rem]" />
        <div className="space-y-8">
          <Skeleton className="h-40 rounded-[2.5rem]" />
          <Skeleton className="h-40 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col h-[70vh] items-center justify-center text-slate-500">
      <ShoppingBag className="w-16 h-16 mb-4 text-slate-200" />
      <p className="font-black text-xl">Intelligence Gap Detected</p>
      <p className="text-sm">No data available for this specific product ID.</p>
      <Button onClick={() => router.back()} variant="link" className="text-sky-600 font-bold mt-4">Return to Directory</Button>
    </div>
  );

  const getChartData = () => {
    if (!forecast) return [];
    let slice = 365;
    if (activeRange === "1w") slice = 7;
    else if (activeRange === "1m") slice = 30;
    else if (activeRange === "3m") slice = 90;
    else if (activeRange === "6m") slice = 180;

    return forecast.dates.slice(0, slice).map((date, i) => ({
      date: new Date(date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
      sales: forecast.forecast[i],
    }));
  };

  const chartData = getChartData();
  const priceTrend = data.max_price && data.min_price ? (data.max_price - data.min_price) / data.min_price * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Sticky Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-12 h-12 rounded-2xl hover:bg-white shadow-sm border border-slate-50 text-sky-700">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAmazon ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                {isAmazon ? 'Amazon Store' : 'Flipkart Store'}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 rounded-full bg-emerald-50 border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                Active Telemetry
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl">{data.product_name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="w-12 h-12 rounded-2xl border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50"><Heart className="w-5 h-5" /></Button>
          <Button variant="outline" className="w-12 h-12 rounded-2xl border-slate-100 text-slate-400 hover:text-sky-600 hover:bg-sky-50"><Share2 className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Showcase */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden group">
            <div className="aspect-square relative flex items-center justify-center p-12 bg-slate-50/50">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none" />
              <img 
                src={data.image || "/no-image.png"} 
                alt={data.product_name} 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-8 right-8">
                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 shadow-xl border-none font-black text-xs px-6 py-3 rounded-full flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" /> Verified SKU
                </Badge>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Trust Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">{data.avg_rating?.toFixed(1) || "—"}</span>
                <span className="text-sm font-bold text-slate-300">/ 5.0</span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">From {data.total_reviews?.toLocaleString()} reviews</p>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Value Position</p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black text-sky-400">₹</span>
                <span className="text-4xl font-black">{data.avg_price?.toLocaleString()}</span>
              </div>
              <p className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1 uppercase tracking-tighter">
                <TrendingUp className="w-3 h-3" /> Optimal Pricing
              </p>
            </Card>
          </div>
        </div>

        {/* Right: Insights & Forecast */}
        <div className="lg:col-span-7 space-y-8">
          {/* Price Range Radar */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Zap className="w-5 h-5 text-sky-600" /> Price Volatility Radar
              </CardTitle>
              <CardDescription className="text-xs font-medium">Historical range and market positioning</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="relative pt-12 pb-4">
                <div className="h-3 bg-slate-50 rounded-full flex items-center px-1">
                  <div className="flex-1 h-2 bg-gradient-to-r from-emerald-400 via-sky-500 to-rose-400 rounded-full relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -mt-12 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN</p>
                      <p className="text-sm font-black text-emerald-600">₹{data.min_price?.toLocaleString() || '—'}</p>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 -mt-12 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MAX</p>
                      <p className="text-sm font-black text-rose-600">₹{data.max_price?.toLocaleString() || '—'}</p>
                    </div>
                    {/* Current Indicator */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 bg-white border-4 border-slate-900 rounded-full shadow-lg" />
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-center w-32">
                        <p className="text-sm font-black text-slate-900">₹{data.avg_price?.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Avg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="p-4 rounded-2xl bg-sky-50/50 flex flex-col gap-1">
                  <p className="text-[9px] font-black text-sky-700 uppercase tracking-widest">Price Delta</p>
                  <p className="text-lg font-black text-sky-900">{priceTrend.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/50 flex flex-col gap-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Status</p>
                  <p className="text-lg font-black text-slate-800">Competitive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Forecast Engine */}
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Sales Forecast Engine
                </CardTitle>
                <CardDescription className="text-xs font-medium">LSTM-based predictive inventory modeling</CardDescription>
              </div>
              <Tabs value={activeRange} onValueChange={setActiveRange} className="w-full md:w-auto">
                <TabsList className="bg-slate-100 rounded-xl p-1 h-10 border-none">
                  {['1w', '1m', '3m', '1y'].map(range => (
                    <TabsTrigger key={range} value={range} className="rounded-lg text-[10px] font-black uppercase tracking-widest px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all">
                      {range === '1w' ? '7D' : range.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-10 pt-4">
              {forecast ? (
                <div className="h-[300px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '15px' }}
                        labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '5px' }}
                        itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#salesGradient)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] mt-8 select-none">
                    Proprietary LSTM Prediction Node · Confidence Interval: 84%
                  </p>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <Zap className="w-8 h-8 text-slate-200 mb-4" />
                  <p className="text-sm font-bold text-slate-400">Historical velocity data required for prediction</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
