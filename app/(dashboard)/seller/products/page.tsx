"use client";

import { useState, useEffect, Suspense } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

import SellerIdInput from "@/components/dashboard/seller-id-input";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2, Search, Star,
  BarChart2, MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SmartSearchInput from "@/components/ui/smart-search-input";

function SellerProductsContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [localSellerId, setLocalSellerId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("IDLE");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "prime" | "best_seller">("all");

  const activeSellerId = user?.seller_id || localSellerId;

  const fetchProducts = async (silent = false) => {
    if (!activeSellerId) return;
    if (!silent) setLoading(true);
    try {
      const BASE_URL = (API_BASE_URL) || API_BASE_URL;
      const resp = await fetch(
        `${BASE_URL}/api/seller/products?seller_id=${activeSellerId}`,
        { credentials: "include" }
      );
      if (resp.ok) {
        const data = await resp.json();
        setProducts(data.products || []);
        if (data.status) {
          setSyncStatus(data.status);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSellerId) fetchProducts();
  }, [activeSellerId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSellerId && syncStatus === "SYNCING") {
      interval = setInterval(() => {
        fetchProducts(true);
      }, 3000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeSellerId, syncStatus]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.asin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeFilter === "all"
        ? true
        : activeFilter === "prime"
        ? p.is_prime === true
        : p.is_best_seller === true;
    return matchesSearch && matchesTab;
  });

  const goToComparison = (
    e: React.MouseEvent,
    type: "price" | "review",
    asin: string
  ) => {
    e.stopPropagation();
    const params = new URLSearchParams({ asin, seller_id: activeSellerId || "" });
    router.push(type === "price"
      ? `/seller/price-comparison?${params}`
      : `/seller/review-comparison?${params}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span>My Products</span>
            {syncStatus === "SYNCING" && (
              <Badge variant="outline" className="animate-pulse bg-blue-50 text-blue-600 border-blue-200 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                <span>Syncing store...</span>
              </Badge>
            )}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Click <span className="text-sky-600 font-semibold">Price</span> or{" "}
            <span className="text-violet-600 font-semibold">Reviews</span> on any product to compare
          </p>
        </div>
        {activeSellerId && (
          <div className="text-xs text-slate-500 bg-background opacity-100 px-3 py-1 rounded-full border">
            Last updated: just now
          </div>
        )}
      </div>

      {!activeSellerId ? (
        <SellerIdInput
          onSaved={(id) => {
            setLocalSellerId(id);
            refreshUser();
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Controls */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Product Catalog</h3>
              <p className="text-sm text-slate-500">{filteredProducts.length} products found</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SmartSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products..."
                className="w-full sm:w-64"
                inputClassName="bg-slate-50 border-slate-200 h-10"
                dictionary={products.flatMap((p: any) => [p.title, p.asin].filter(Boolean))}
                maxSuggestions={5}
              />
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                {(["all", "prime", "best_seller"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      activeFilter === f
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f === "all" ? "All" : f === "prime" ? "Prime" : "Best Seller"}
                    <span className="opacity-80 text-xs ml-1">
                      {f === "all"
                        ? products.length
                        : f === "prime"
                        ? products.filter((p) => p.is_prime).length
                        : products.filter((p) => p.is_best_seller).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                <p className="text-slate-500 font-medium">Loading catalog...</p>
              </div>
            ) : products.length === 0 ? (
              syncStatus === "SYNCING" ? (
                <div className="flex flex-col items-center justify-center p-12 text-center h-64 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                  <h3 className="text-lg font-bold text-slate-800">Synchronizing Store...</h3>
                  <p className="text-slate-500 max-w-sm text-sm">
                    We're currently fetching your Amazon products and metrics. This initial sync usually takes about 30–60 seconds.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
                  <p className="text-slate-500 max-w-sm">
                    We couldn't find any tracked products for your Seller ID.
                    Make sure you are tracking products in the Explorer mode first.
                  </p>
                </div>
              )
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 border-b border-slate-100 font-semibold sticky top-0 bg-white z-10 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-[34%]">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Reviews</th>
                    <th className="px-6 py-4">Sales</th>
                    <th className="px-6 py-4">BSR</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Compare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((p, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.image ? (
                              <img src={p.image} alt={p.title} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-slate-300 font-bold text-lg">{p.title.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 line-clamp-1" title={p.title}>
                              {p.title}
                            </p>
                            <div className="flex items-center mt-1 gap-2 text-xs">
                              <span className="text-slate-400 font-mono">{p.asin}</span>
                              {p.is_prime && (
                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1 py-0 h-4">
                                  PRIME
                                </Badge>
                              )}
                              {p.is_best_seller && (
                                <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1 py-0 h-4">
                                  BEST SELLER
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {p.price
                          ? p.price.toString().startsWith("₹") || p.price.toString().startsWith("$")
                            ? p.price
                            : `₹${p.price}`
                          : "N/A"}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <Star className="w-4 h-4 text-orange-400 fill-orange-400 -mt-0.5" />
                          {p.rating}
                        </div>
                      </td>

                      {/* Reviews */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {p.reviews >= 1000
                          ? `${(p.reviews / 1000).toFixed(1)}K`
                          : p.reviews}
                      </td>

                      {/* Sales */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                          {p.sales}
                        </span>
                      </td>

                      {/* BSR */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-xs">
                        {p.bsr}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.is_fba ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 uppercase text-[10px] tracking-wider font-bold">
                            FBA
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                            FBM
                          </Badge>
                        )}
                      </td>

                      {/* Compare buttons — always visible, click to navigate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => goToComparison(e, "price", p.asin)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            Price
                          </button>
                          <button
                            onClick={(e) => goToComparison(e, "review", p.asin)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Reviews
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {products.length > 0 && !loading && (
            <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/50">
              <p>Showing {filteredProducts.length} of {products.length} products</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SellerProducts() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <SellerProductsContent />
    </Suspense>
  );
}

