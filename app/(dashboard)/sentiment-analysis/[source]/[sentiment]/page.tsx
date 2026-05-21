"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, AlertCircle, ChevronLeft, ChevronRight, X, Loader2, ShoppingBag, Filter, ShieldCheck, Zap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";

function SentimentAnalysisPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggle } = useSidebar();

  const source = (params.source as string) || "flipkart";
  const sentiment = (params.sentiment as string) || "positive";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 24;

  const API_BASE = API_BASE_URL;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const table = source === "flipkart" ? "rapidapi_flipkart_products" : "rapidapi_amazon_products";
      const q = new URLSearchParams({
        table,
        sentiment,
        page: currentPage.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(searchParams.entries())
      });
      const res = await fetch(`${API_BASE}/api/products/by-sentiment?${q.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.total_pages);
        setTotalProducts(data.total_products);
      }
    } catch (err) { setError("Review data couldn't load. Please try again."); } finally { setLoading(false); }
  }, [source, sentiment, currentPage, searchParams, API_BASE]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-sky-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  if (loading && products.length === 0) return <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-sky-500 animate-spin" /><p className="text-sm font-bold text-slate-400">Decoding customer sentiment patterns...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100 text-slate-500"><ChevronLeft className="w-5 h-5 mr-1" /> Back</Button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{sentiment} Market Pulse</h1>
            <p className="text-sm text-slate-500 font-medium">Aggregated performance from <span className="text-sky-600 font-bold uppercase">{source}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("px-4 py-2 border-none text-xs font-bold uppercase tracking-widest", sentiment === "positive" ? "bg-emerald-50 text-emerald-600" : sentiment === "neutral" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>{totalProducts.toLocaleString()} Signals</Badge>
          <Button onClick={fetchProducts} variant="outline" size="sm" className="rounded-xl border-slate-200 shadow-sm"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p, i) => {
          const score = Math.round((p.sentiment_score || (p.rating / 5)) * 100);
          return (
            <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => router.push(`/product/${encodeURIComponent(p.product_title)}?source=${source}`)}>
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {p.image_url ? <img src={p.image_url} alt={p.product_title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-slate-200" /></div>}
                <div className="absolute top-4 right-4 bg-background opacity-100 backdrop-blur-none px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs font-black text-slate-900">{p.rating?.toFixed(1)}</span></div>
              </div>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-sky-600 transition-colors">{p.product_title}</p>
                <div className="flex justify-between items-center"><span className="text-lg font-black text-slate-900">₹{p.price?.toLocaleString()}</span><Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-400">{p.category}</Badge></div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Pulse Score</span><span>{score}%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-1000", getScoreColor(score))} style={{ width: `${score}%` }} /></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50"><div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-sky-500" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.review_count.toLocaleString()} Reviews</span></div><div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-4 h-4 text-sky-600" /></div></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-10 pb-20 border-t border-slate-100">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl border-slate-200">Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-xl border-slate-200">Next</Button>
        </div>
      </div>
    </div>
  );
}




export default function SentimentAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <SentimentAnalysisPageContent />
    </Suspense>
  );
}
