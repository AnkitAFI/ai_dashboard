"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, IndianRupee, ArrowUpDown, TrendingUp, ShoppingBag, Filter, LayoutGrid, List, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface TrendingProduct {
  id?: number;
  title?: string;
  product_title?: string;
  category?: string;
  category_name?: string;
  price?: number;
  avg_price?: number;
  rating?: number;
  avg_rating?: number;
  product_star_rating?: number;
  product_star_rating_numeric?: number;
  reviews?: number;
  total_reviews?: number;
  total_ratings?: number;
  product_num_ratings?: number;
  product_rating_count?: number;
  sales_volume?: string;
  avg_sales_volume?: number;
  source?: string;
  product_price?: string;
}

export default function SalesPage() {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [source, setSource] = useState<"flipkart" | "amazon">("flipkart");
  const [sortField, setSortField] = useState<"reviews" | "price" | "rating" | "sales">("sales");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [search, setSearch] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Parse sales_volume text like "9.4K+ bought"
  const parseSalesVolume = (salesText?: string, avgSales?: number): number => {
    if (avgSales) return avgSales;
    if (!salesText) return 0;
    const match = salesText.match(/([\d.]+)([KMB])?/i);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const multiplier = match[2]?.toUpperCase();
    switch (multiplier) {
      case 'K': return num * 1000;
      case 'M': return num * 1000000;
      case 'B': return num * 1000000000;
      default: return num;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const url = source === "flipkart"
      ? `${BASE_URL}/top?table=rapidapi_flipkart_products&n=500`
      : `${BASE_URL}/rapidapi/top-sales?limit=500`;

    try {
      const res = await axios.get(url);
      const data = res.data.data || res.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch top products intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [source]);

  const getFieldValue = (p: TrendingProduct, field: string) => {
    switch (field) {
      case "reviews":
        return p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0;
      case "price":
        return p.price ?? p.avg_price ?? 0;
      case "rating":
        return p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0;
      case "sales":
        return parseSalesVolume(p.sales_volume, p.avg_sales_volume);
      default:
        return 0;
    }
  };

  const filteredProducts = products.filter(p => {
    const title = (p.title || p.product_title || "").toLowerCase();
    return title.includes(search.toLowerCase());
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const factor = sortOrder === "asc" ? 1 : -1;
    return (getFieldValue(a, sortField) - getFieldValue(b, sortField)) * factor;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const toggleSort = (field: "reviews" | "price" | "rating" | "sales") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const formatSalesDisplay = (product: TrendingProduct): string => {
    const salesNum = getFieldValue(product, "sales");
    if (salesNum === 0 && product.sales_volume) return product.sales_volume;
    if (salesNum >= 1000000) return `${(salesNum / 1000000).toFixed(1)}M`;
    if (salesNum >= 1000) return `${(salesNum / 1000).toFixed(1)}K`;
    return salesNum.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-2 px-3 py-1 rounded-full bg-emerald-50 border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
            <TrendingUp className="w-3 h-3 mr-1" /> Velocity Insights
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Momentum</h1>
          <p className="text-sm text-slate-500 font-medium">Top performing products by real-time sales volume</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={source} onValueChange={(v) => setSource(v as any)}>
            <SelectTrigger className="w-40 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl font-bold">
              <SelectItem value="flipkart">Flipkart Store</SelectItem>
              <SelectItem value="amazon">Amazon Store</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} className="rounded-xl border-slate-200 shadow-sm font-bold">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Discovery Toolbar */}
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-2">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search trending products..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-11 h-12 rounded-2xl bg-slate-50 border-none shadow-inner font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["sales", "reviews", "price", "rating"].map((field) => (
              <Button
                key={field}
                variant={sortField === field ? "default" : "outline"}
                onClick={() => toggleSort(field as any)}
                className={`h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider px-4 ${
                  sortField === field ? "bg-slate-900 text-white shadow-lg" : "border-slate-100 text-slate-600"
                }`}
              >
                {field} {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-[400px] rounded-[2.5rem]" />)}
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{error}</h3>
          <Button onClick={fetchData} variant="link" className="text-sky-600 font-bold">Try again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((p, i) => (
            <Card key={i} className="group border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative h-48 bg-slate-50 flex items-center justify-center p-6">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-white/80 backdrop-blur-md text-slate-900 border-none font-black text-[9px] uppercase px-3 py-1 rounded-full">
                    Rank #{(currentPage - 1) * itemsPerPage + i + 1}
                  </Badge>
                </div>
                <div className="w-32 h-32 bg-white rounded-2xl shadow-sm flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag className="w-12 h-12 text-slate-200" />
                </div>
              </div>
              <CardContent className="p-8 space-y-4">
                <div className="min-h-[3rem]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{p.category || p.category_name || source}</p>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
                    {p.title || p.product_title}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Momentum</p>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-black text-lg">{formatSalesDisplay(p)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-1 text-amber-500 justify-end">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span className="font-black text-lg">{(p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center text-sky-700">
                    <IndianRupee className="w-4 h-4" />
                    <span className="font-black text-xl">{(p.price ?? p.avg_price ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {(p.reviews ?? p.total_reviews ?? 0).toLocaleString()} reviews
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex justify-center items-center gap-6 pt-8">
          <Button 
            variant="outline" 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl border-slate-200 font-bold h-12 px-8 shadow-sm"
          >
            Previous
          </Button>
          <span className="text-sm font-black text-slate-900">Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl border-slate-200 font-bold h-12 px-8 shadow-sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Legal Footer */}
      <p className="text-[9px] text-center text-slate-400 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed pt-12">
        <span className="font-black text-slate-500">Notice:</span> Sales telemetry varies by platform (Flipkart: Lifetime / Amazon: 30D). Market data provided by 3rd party nodes for strategic intelligence only.
      </p>
    </div>
  );
}
