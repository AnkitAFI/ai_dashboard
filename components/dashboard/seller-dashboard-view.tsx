
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, Star, DollarSign,
  Zap, BarChart3, Users, Award, ShieldCheck, Loader2, RefreshCcw, ShoppingCart, Percent
} from "lucide-react";
import { useAuth } from '@/lib/auth-context';

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
          <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend.positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {trend.positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          <p className="text-xs text-slate-400 mt-2">{description}</p>
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

  const fetchStats = async () => {
    try {
      const resp = await fetch(`http://localhost:8000/api/seller/dashboard-stats?seller_id=${user?.seller_id}`, {
        credentials: "include",
      });
      if (!resp.ok) throw new Error("Failed to fetch stats");
      const data = await resp.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user?.seller_id) {
      fetchStats();
      interval = setInterval(() => {
        if (!stats || stats.status === "SYNCING" || stats?.metrics?.total_products === 0) {
          fetchStats();
        }
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [user?.seller_id, stats?.status, stats?.metrics?.total_products]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Analyzing your marketplace data...</p>
      </div>
    );
  }

  if (!stats) return null;

  const isSyncing = stats.status === "SYNCING";
  const hasNoData = stats.metrics?.total_products === 0;

  if (hasNoData && isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <RefreshCcw className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Synchronizing Your Store</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            We're currently fetching your Amazon products and metrics.
            This initial sync usually takes about 30–60 seconds.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 animate-pulse">
            Fetching Catalog
          </Badge>
          <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-purple-100 animate-pulse delay-700">
            Analyzing Sentiment
          </Badge>
        </div>
      </div>
    );
  }

  const { metrics, charts } = stats;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Intelligence</h1>
          <p className="text-slate-500 mt-1">
            Real-time performance metrics for Merchant ID:{" "}
            <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{user?.seller_id}</span>
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all border border-slate-100 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Sync Now"}
        </button>
      </div>

      {/* 8 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={metrics.total_products}
          icon={<Package className="w-6 h-6 text-blue-600" />}
          description="Active listings in your catalog"
          trend={{ value: "+2 new", positive: true }}
        />
        <MetricCard
          title="Avg Rating"
          value={`${metrics.avg_rating} / 5`}
          icon={<Star className="w-6 h-6 text-amber-500 fill-amber-500" />}
          description="Across all tracked products"
          trend={{ value: "+0.2", positive: true }}
        />
        <MetricCard
          title="Avg Price"
          value={`$${metrics.avg_price}`}
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          description="Mean listing price"
        />
        <MetricCard
          title="Prime Presence"
          value={`${metrics.prime_products_pct}%`}
          icon={<Zap className="w-6 h-6 text-purple-600 fill-purple-600" />}
          description="Percentage of Prime-eligible products"
        />
        <MetricCard
          title="Total Reviews"
          value={metrics.total_reviews.toLocaleString()}
          icon={<Users className="w-6 h-6 text-sky-600" />}
          description="Total customer feedback count"
          trend={{ value: "+342", positive: true }}
        />
        <MetricCard
          title="Seller Rating"
          value={`${metrics.avg_seller_rating} / 5`}
          icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
          description="Your store's average seller score"
        />
        <MetricCard
          title="Best Sellers"
          value={metrics.best_sellers_count}
          icon={<Award className="w-6 h-6 text-orange-500" />}
          description="Products with Best Seller badge"
        />
        <MetricCard
          title="Amazon's Choice"
          value={`${metrics.amazon_choice_pct}%`}
          icon={<ShieldCheck className="w-6 h-6 text-teal-600" />}
          description="Products with Amazon's Choice badge"
        />
      </div>

      {/* 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Sales Trend */}
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Estimated Sales Trend
            </CardTitle>
            <CardDescription>Estimated unit sales based on review velocity (6 months)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.sales_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} cursor={{ stroke: "#3b82f6", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marketplace Distribution */}
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              Marketplace Portfolio
            </CardTitle>
            <CardDescription>Product distribution across marketplaces</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.category_distribution} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {charts.category_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Review Sentiment */}
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Feedback Sentiment
            </CardTitle>
            <CardDescription>Derived from customer review ratings</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.review_sentiment} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontWeight: "bold" }} width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                  {charts.review_sentiment.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Positive" ? "#10b981" : entry.name === "Neutral" ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution — replaces BSR Trend, uses real product star ratings */}
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-600" />
              Product Rating Distribution
            </CardTitle>
            <CardDescription>Number of products by star rating</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.rating_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 13 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  formatter={(v: any) => [`${v} products`, "Count"]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={48}>
                  {charts.rating_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}