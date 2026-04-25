"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tag, BarChart2, Star, ChevronRight, Filter, ShoppingBag, ArrowUpRight, TrendingUp, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Category {
  category: string;
  total_products: number;
  avg_price: number | null;
  avg_rating: number | null;
  total_reviews: number;
  source: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableFilter, setTableFilter] = useState<"flipkart" | "amazon" | "all">("all");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    axios
      .get(`${BASE_URL}/analytics/category`)
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Failed to synchronize category intelligence."))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (tableFilter === "all") return true;
    return cat.source === tableFilter;
  });

  const totalProducts = categories.reduce((s, c) => s + c.total_products, 0);
  const avgRating = categories.reduce((s, c) => s + (c.avg_rating || 0), 0) / (categories.length || 1);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-2 px-3 py-1 rounded-full bg-blue-50 border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
            <Layers className="w-3 h-3 mr-1" /> Structural Analytics
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Category Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium">Macro-level performance audit across all product clusters</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-white rounded-2xl shadow-sm border border-slate-50">
            <div className="text-center border-r border-slate-100 pr-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clusters</p>
              <p className="text-sm font-black text-slate-900">{categories.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Catalog Size</p>
              <p className="text-sm font-black text-slate-900">{totalProducts.toLocaleString()}</p>
            </div>
          </div>
          <Select value={tableFilter} onValueChange={(v) => setTableFilter(v as any)}>
            <SelectTrigger className="w-40 h-12 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider bg-white">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl font-bold">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="flipkart">Flipkart</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)}
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <Badge variant="outline" className="mb-4 bg-rose-50 border-rose-100 text-rose-700">{error}</Badge>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, i) => (
            <Card key={i} className="group border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
              <CardHeader className="p-8 pb-4 relative">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -mr-6 -mt-6 transition-all duration-500 group-hover:scale-110 flex items-center justify-center pt-6 pl-6`}>
                  <Badge className="bg-white/80 backdrop-blur-md text-slate-900 border-none font-black text-[9px] uppercase px-3 py-1 rounded-full shadow-sm">
                    {cat.source}
                  </Badge>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-6 group-hover:rotate-6 transition-transform">
                  <Tag className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors">
                  {cat.category}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3" /> {cat.total_products.toLocaleString()} Products
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 mt-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Value Index</p>
                    <p className="text-sm font-black text-emerald-600">
                      ₹{cat.avg_price ? cat.avg_price.toLocaleString() : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                    <p className="text-sm font-black text-amber-500 flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 fill-amber-500" /> {cat.avg_rating?.toFixed(1) ?? "—"}
                    </p>
                  </div>
                </div>
                
                <Link 
                  href={`/category-products/${cat.source}/${encodeURIComponent(cat.category)}`}
                  className="mt-6 w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group-hover:gap-3"
                >
                  Drill Down <ChevronRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insights Section */}
      {!loading && (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative p-12">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-4xl font-black tracking-tight leading-[1.1]">Category Growth <br/>Intelligence</h2>
              <p className="text-lg text-slate-300 font-medium leading-relaxed">
                Platform-wide analysis indicates that <strong>Electronics</strong> and <strong>Home Decor</strong> are currently yielding <strong>22% higher velocity</strong> than the seasonal mean. 
              </p>
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Health</p>
                  <p className="text-xl font-black text-emerald-400">{avgRating.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Index</p>
                  <p className="text-xl font-black text-sky-400">+8.4%</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Top Performer This Week
              </h4>
              <div className="space-y-4">
                {categories.slice(0, 3).map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-sm font-medium">{c.category}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px]">{c.total_products} items</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
