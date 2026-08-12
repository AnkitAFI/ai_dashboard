"use client";
import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect, Suspense } from "react";
import { useSessionState } from "@/hooks/use-session-state";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import SellerIdInput from "@/components/dashboard/seller-id-input";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2, Search, Star, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useSelectedProduct } from "@/lib/selected-product-context";

function SellerProductsContent() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [localSellerId, setLocalSellerId] = useSessionState<string | null>("seller_my_products_id", null);
  const [products, setProducts] = useSessionState<any[]>("seller_my_products_data", []);
  const [lastFetchedSellerId, setLastFetchedSellerId] = useSessionState<string>("seller_my_products_last_seller_id", "");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useSessionState("seller_my_products_search", "");
  const [activeFilter, setActiveFilter] = useSessionState<"all" | "prime" | "best_seller">("seller_my_products_filter", "all");
  const [selectedAsin, setSelectedAsin] = useSessionState<string | null>("seller_my_products_asin", null);
  const [currentPage, setCurrentPage] = useSessionState("seller_my_products_page", 1);
  const itemsPerPage = 10;

  const activeSellerId = user?.seller_id || localSellerId;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProducts = async () => {
    if (!activeSellerId) return;
    if (products.length > 0 && lastFetchedSellerId === activeSellerId) return;
    
    setLoading(true);
    try {
      const BASE_URL = API_BASE_URL;
      const resp = await fetch(
        `${BASE_URL}/api/seller/products?seller_id=${activeSellerId}`,
        { credentials: "include" }
      );
      if (resp.ok) {
        const data = await resp.json();
        setProducts(data.products || []);
        setLastFetchedSellerId(activeSellerId);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSellerId) fetchProducts();
  }, [activeSellerId, products, lastFetchedSellerId]);

  // Reset page when search or tab filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const { setSelected } = useSelectedProduct();

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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleRowClick = (p: any) => {
    setSelectedAsin(p.asin);
    setSelected({ asin: p.asin, sellerId: activeSellerId || "" });
    const params = new URLSearchParams({ asin: p.asin, seller_id: activeSellerId || "" });
    // Navigate to price comparison by default; user can switch tabs there
    router.push(`/seller/price-comparison?${params}`);
  };

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6">

      {/* Premium Hero Header */}
      {/* Hero */}
      <div className="text-left space-y-1 mb-6">
        <h1 className="page-title">
          {t('sellerPages.catalogTitle', 'Seller Product Catalog')}
        </h1>
        <p className="page-subtitle">
          {t('sellerPages.catalogSubtitle', 'Manage your tracked seller inventory and launch competitive benchmarks.')}
        </p>
      </div>

      {!activeSellerId ? (
        <SellerIdInput
          onSaved={(id) => {
            setLocalSellerId(id);
            refreshUser();
          }}
        />
      ) : (
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          {/* Controls */}
          <div className={`p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t('sellerPages.productCatalog', 'Product Catalog')}</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{filteredProducts.length} {t('sellerPages.catalogProductsFound', 'products found')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SmartSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('sellerPages.searchProducts', 'Search products...')}
                className="w-full sm:w-64"
                inputClassName={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200'} h-10`}
                dictionary={products.flatMap((p: any) => [p.title, p.asin].filter(Boolean))}
                maxSuggestions={5}
              />
              <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {(["all", "prime", "best_seller"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      activeFilter === f
                        ? "bg-orange-500 text-white shadow-sm"
                        : isDark
                          ? "text-slate-300 hover:text-slate-100"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="capitalize">
                      {f === 'all' ? t('sellerPages.all', 'All') : f === 'prime' ? t('sellerPages.prime', 'Prime') : t('sellerPages.bestSeller', 'Best Seller')}
                    </span>
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
                <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                  <Search className="w-8 h-8" />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>No products found</h3>
                <p className={`max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  We couldn't find any tracked products for your Seller ID.
                  Make sure you are tracking products in the Explorer mode first.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className={`text-xs font-semibold sticky top-0 z-10 uppercase tracking-wider border-b ${isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-500 border-slate-100'}`}>
                  <tr>
                    <th className="px-6 py-4 w-[40%]">{t('sales.product', 'Product')}</th>
                    <th className="px-6 py-4">{t('sales.price', 'Price')}</th>
                    <th className="px-6 py-4">{t('sales.rating', 'Rating')}</th>
                    <th className="px-6 py-4">{t('sales.reviews', 'Reviews')}</th>
                    <th className="px-6 py-4">{t('sales.sales', 'Sales')}</th>
                    <th className="px-6 py-4">BSR</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                  {currentItems.map((p, idx) => {
                    const isSelected = selectedAsin === p.asin;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleRowClick(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? isDark ? "bg-sky-900/20 border-l-4 border-l-sky-500" : "bg-sky-50 border-l-4 border-l-sky-500"
                            : isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                              {p.image ? (
                                <img src={p.image} alt={p.title} className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className={`font-bold text-lg ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>{p.title.charAt(0)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-semibold line-clamp-1 ${
                                isSelected 
                                  ? isDark ? "text-sky-400" : "text-sky-700" 
                                  : isDark ? "text-slate-200" : "text-slate-800"
                              }`} title={p.title}>
                                {p.title}
                              </p>
                              <div className="flex items-center mt-1 gap-2 text-xs">
                                <span className={`font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.asin}</span>
                                {p.is_prime && (
                                  <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                    PRIME
                                  </Badge>
                                )}
                                {p.is_best_seller && (
                                  <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                    BEST SELLER
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className={`px-6 py-4 font-bold whitespace-nowrap ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {p.price
                            ? p.price.toString().startsWith("₹") || p.price.toString().startsWith("$")
                              ? p.price
                              : `₹${p.price}`
                            : "N/A"}
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <Star className="w-4 h-4 text-orange-400 fill-orange-400 -mt-0.5" />
                            {p.rating}
                          </div>
                        </td>

                        {/* Reviews */}
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {p.reviews >= 1000
                            ? `${(p.reviews / 1000).toFixed(1)}K`
                            : p.reviews}
                        </td>

                        {/* Sales */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-bold px-2.5 py-1 rounded-md text-xs ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                            {p.sales}
                          </span>
                        </td>

                        {/* BSR */}
                        <td className={`px-6 py-4 whitespace-nowrap font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {p.bsr}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.is_fba ? (
                            <Badge variant="outline" className={`uppercase text-[10px] tracking-wider font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                              FBA
                            </Badge>
                          ) : (
                            <Badge variant="outline" className={`uppercase text-[10px] tracking-wider font-bold ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              FBM
                            </Badge>
                          )}
                        </td>

                        {/* Arrow indicator */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <ChevronRight className={`w-4 h-4 transition-colors ${
                            isSelected 
                              ? isDark ? "text-sky-400" : "text-sky-500" 
                              : isDark ? "text-slate-600" : "text-slate-300"
                          }`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer & Pagination */}
          {filteredProducts.length > 0 && !loading && (
            <div className={`p-4 border-t text-xs flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'bg-slate-800/30 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-100 text-slate-500'}`}>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <p>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                  {filteredProducts.length !== products.length && ` (filtered from ${products.length} total)`}
                </p>
                <span className={`hidden sm:inline ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>|</span>
                <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Click a row to analyze it</p>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-lg border disabled:opacity-50 disabled:pointer-events-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  >
                    <ChevronLeft className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  </button>
                  <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-lg border disabled:opacity-50 disabled:pointer-events-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  >
                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  </button>
                </div>
              )}
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