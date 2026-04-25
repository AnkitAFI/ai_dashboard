"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft, Star, ShoppingBag, ArrowUpRight, TrendingUp, Filter, Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Product {
  product_name: string;
  avg_price: number;
  min_price?: number | null;
  max_price?: number | null;
  total_reviews: number;
  avg_rating: number;
  source: string;
}

export default function CategoryProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const source = params.source as string;
  const category = decodeURIComponent(params.category as string);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 12;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!source || !category) return;
    setLoading(true);
    axios
      .get(
        `${BASE_URL}/category/products/${encodeURIComponent(category)}?source=${source}&limit=${limit}&offset=${(page - 1) * limit}`
      )
      .then((res) => {
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
      })
      .catch(() => setError("Failed to synchronize cluster intelligence."))
      .finally(() => setLoading(false));
  }, [source, category, page]);

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-sky-50 text-sky-700">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="px-2 py-0.5 rounded-full bg-sky-50 border-sky-100 text-sky-700 text-[9px] font-black uppercase tracking-widest">
                {source} Node
              </Badge>
              <Badge variant="outline" className="px-2 py-0.5 rounded-full bg-slate-50 border-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                Cluster Drill-down
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{category}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden lg:block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search in cluster..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-white border-slate-100 shadow-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Cluster Health Stats */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Cluster Size", value: products.length, sub: "Synchronized products", icon: <ShoppingBag className="w-5 h-5" />, color: "sky" },
            { label: "Avg Trust", value: (products.reduce((s, p) => s + p.avg_rating, 0) / products.length).toFixed(1), sub: "Weighted rating", icon: <Star className="w-5 h-5" />, color: "amber" },
            { label: "Value Mean", value: `₹${(products.reduce((s, p) => s + p.avg_price, 0) / products.length).toLocaleString(undefined, {maximumFractionDigits: 0})}`, sub: "Cluster average price", icon: <TrendingUp className="w-5 h-5" />, color: "emerald" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-md rounded-3xl bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Products Directory */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-slate-900">Intelligence Directory</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Real-time inventory analysis for this cluster</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-lg text-slate-400 hover:bg-slate-50"><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-lg text-sky-600 bg-sky-50"><List className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
            </div>
          ) : error ? (
            <div className="py-20 text-center text-rose-500 font-bold">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900">End of Cluster</h3>
              <p className="text-sm text-slate-400 mt-1">No further items detected in this specific hierarchy.</p>
              <Button onClick={() => setPage(1)} variant="link" className="text-sky-600 font-bold mt-4">Reset Pagination</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-5">Product Intelligence</th>
                    <th className="px-6 py-5">Trust Score</th>
                    <th className="px-6 py-5">Value Index</th>
                    <th className="px-6 py-5">Min / Max Delta</th>
                    <th className="px-10 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((p, i) => (
                    <tr key={i} className="group hover:bg-sky-50/30 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                            <ShoppingBag className="w-5 h-5 text-slate-300 group-hover:text-sky-500" />
                          </div>
                          <div className="max-w-md">
                            <Link 
                              href={`/product/${encodeURIComponent(p.product_name)}?source=${source}&category=${encodeURIComponent(category)}&page=${page}`}
                              className="text-sm font-black text-slate-900 hover:text-sky-600 transition-colors line-clamp-1"
                            >
                              {p.product_name}
                            </Link>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.total_reviews.toLocaleString()} Social Signals</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= Math.round(p.avg_rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs font-black text-slate-900">{p.avg_rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-black text-emerald-600">₹{p.avg_price.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3 text-[10px] font-bold">
                          <span className="text-sky-600 bg-sky-50 px-2 py-1 rounded-md">MIN: ₹{p.min_price?.toLocaleString() || '—'}</span>
                          <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md">MAX: ₹{p.max_price?.toLocaleString() || '—'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <Link 
                          href={`/product/${encodeURIComponent(p.product_name)}?source=${source}&category=${encodeURIComponent(category)}&page=${page}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white hover:bg-black transition-all hover:scale-110 shadow-lg shadow-slate-100"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {/* Pagination Footer */}
        {!loading && products.length > 0 && (
          <div className="bg-slate-50/50 px-10 py-6 flex items-center justify-between border-t border-slate-50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Displaying Cluster Page {page}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="rounded-xl border-slate-200 font-black text-[10px] uppercase h-10 px-6 bg-white"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                className="rounded-xl border-slate-200 font-black text-[10px] uppercase h-10 px-6 bg-white"
              >
                Next Node
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
