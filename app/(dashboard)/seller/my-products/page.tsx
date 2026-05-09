// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import SellerIdInput from "@/components/dashboard/seller-id-input";
// import { useAuth } from "@/lib/auth-context";
// import {
//   Loader2, Search, Star,
//   BarChart2, MessageSquare,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";

// const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

// export default function SellerProductsPage() {
//   const { user, refreshUser } = useAuth();
//   const router = useRouter();

//   const [localSellerId, setLocalSellerId] = useState<string | null>(null);
//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeFilter, setActiveFilter] = useState<"all" | "prime" | "best_seller">("all");

//   const activeSellerId = user?.seller_id || localSellerId;

//   const fetchProducts = async () => {
//     if (!activeSellerId) return;
//     setLoading(true);
//     try {
//       const resp = await fetch(
//         `${API_BASE}/api/seller/products?seller_id=${activeSellerId}`,
//         { credentials: "include" }
//       );
//       if (resp.ok) {
//         const data = await resp.json();
//         setProducts(data.products || []);
//       }
//     } catch (err) {
//       console.error("Failed to fetch products", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeSellerId) fetchProducts();
//   }, [activeSellerId]);

//   const filteredProducts = products.filter((p) => {
//     const matchesSearch =
//       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.asin.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesTab =
//       activeFilter === "all"
//         ? true
//         : activeFilter === "prime"
//         ? p.is_prime === true
//         : p.is_best_seller === true;
//     return matchesSearch && matchesTab;
//   });

//   const goToComparison = (
//     e: React.MouseEvent,
//     type: "price" | "review",
//     asin: string
//   ) => {
//     e.stopPropagation();
//     const params = new URLSearchParams({ asin, seller_id: activeSellerId || "" });
//     router.push(type === "price"
//       ? `/seller/price-comparison?${params.toString()}`
//       : `/seller/review-comparison?${params.toString()}`
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {!activeSellerId ? (
//         <div className="max-w-xl mx-auto">
//           <SellerIdInput
//             onSaved={(id) => {
//               setLocalSellerId(id);
//               refreshUser();
//             }}
//           />
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//           {/* Controls */}
//           <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h3 className="font-bold text-slate-800 text-lg">Product Catalog</h3>
//               <p className="text-sm text-slate-500">{filteredProducts.length} products found</p>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="relative">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <Input
//                   placeholder="Search products..."
//                   className="pl-9 w-full sm:w-64 bg-slate-50 border-none h-10 rounded-xl"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
//                 {(["all", "prime", "best_seller"] as const).map((f) => (
//                   <button
//                     key={f}
//                     onClick={() => setActiveFilter(f)}
//                     className={cn(
//                       "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
//                       activeFilter === f
//                         ? "bg-orange-500 text-white shadow-sm"
//                         : "text-slate-600 hover:text-slate-900"
//                     )}
//                   >
//                     {f === "all" ? "All" : f === "prime" ? "Prime" : "Best Seller"}
//                     <span className="opacity-80 text-xs ml-1">
//                       {f === "all"
//                         ? products.length
//                         : f === "prime"
//                         ? products.filter((p) => p.is_prime).length
//                         : products.filter((p) => p.is_best_seller).length}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             {loading ? (
//               <div className="flex flex-col items-center justify-center h-64 gap-3">
//                 <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
//                 <p className="text-slate-500 font-medium">Loading catalog...</p>
//               </div>
//             ) : products.length === 0 ? (
//               <div className="flex flex-col items-center justify-center p-12 text-center h-64">
//                 <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
//                   <Search className="w-8 h-8" />
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
//                 <p className="text-slate-500 max-w-sm">
//                   We couldn't find any tracked products for your Seller ID.
//                   Make sure you are tracking products in the Explorer mode first.
//                 </p>
//               </div>
//             ) : (
//               <table className="w-full text-sm text-left">
//                 <thead className="text-xs text-slate-500 border-b border-slate-100 font-semibold sticky top-0 bg-white z-10 uppercase tracking-wider">
//                   <tr>
//                     <th className="px-6 py-4 w-[34%]">Product</th>
//                     <th className="px-6 py-4">Price</th>
//                     <th className="px-6 py-4">Rating</th>
//                     <th className="px-6 py-4">Reviews</th>
//                     <th className="px-6 py-4">Sales</th>
//                     <th className="px-6 py-4">BSR</th>
//                     <th className="px-6 py-4">Type</th>
//                     <th className="px-6 py-4">Compare</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {filteredProducts.map((p, idx) => (
//                     <tr
//                       key={idx}
//                       className="hover:bg-slate-50/80 transition-colors"
//                     >
//                       {/* Product */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-4">
//                           <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
//                             {p.image ? (
//                               <img src={p.image} alt={p.title} className="w-full h-full object-contain p-1" />
//                             ) : (
//                               <span className="text-slate-300 font-bold text-lg">{p.title.charAt(0)}</span>
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p 
//                               className="font-semibold text-slate-800 line-clamp-1 cursor-pointer hover:text-sky-600 hover:underline transition-all" 
//                               title={p.title}
//                               onClick={() => router.push(`/product/${encodeURIComponent(p.title)}?from=seller&source=amazon`)}
//                             >
//                               {p.title}
//                             </p>
//                             <div className="flex items-center mt-1 gap-2 text-xs">
//                               <span className="text-slate-400 font-mono">{p.asin}</span>
//                               {p.is_prime && (
//                                 <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1 py-0 h-4">
//                                   PRIME
//                                 </Badge>
//                               )}
//                               {p.is_best_seller && (
//                                 <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1 py-0 h-4">
//                                   BEST SELLER
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Price */}
//                       <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
//                         {p.price
//                           ? p.price.toString().startsWith("₹") || p.price.toString().startsWith("$")
//                             ? p.price
//                             : `₹${p.price}`
//                           : "N/A"}
//                       </td>

//                       {/* Rating */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-1 font-bold text-slate-800">
//                           <Star className="w-4 h-4 text-orange-400 fill-orange-400 -mt-0.5" />
//                           {p.rating}
//                         </div>
//                       </td>

//                       {/* Reviews */}
//                       <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
//                         {p.reviews >= 1000
//                           ? `${(p.reviews / 1000).toFixed(1)}K`
//                           : p.reviews}
//                       </td>

//                       {/* Sales */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
//                           {p.sales}
//                         </span>
//                       </td>

//                       {/* BSR */}
//                       <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-xs">
//                         {p.bsr}
//                       </td>

//                       {/* Type */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {p.is_fba ? (
//                           <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 uppercase text-[10px] tracking-wider font-bold">
//                             FBA
//                           </Badge>
//                         ) : (
//                           <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 uppercase text-[10px] tracking-wider font-bold">
//                             FBM
//                           </Badge>
//                         )}
//                       </td>

//                       {/* Compare buttons — always visible, click to navigate */}
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={(e) => goToComparison(e, "price", p.asin)}
//                             className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
//                           >
//                             <BarChart2 className="w-3.5 h-3.5" />
//                             Price
//                           </button>
//                           <button
//                             onClick={(e) => goToComparison(e, "review", p.asin)}
//                             className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
//                           >
//                             <MessageSquare className="w-3.5 h-3.5" />
//                             Reviews
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           {/* Footer */}
//           {products.length > 0 && !loading && (
//             <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/50">
//               <p>Showing {filteredProducts.length} of {products.length} products</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

import SellerIdInput from "@/components/dashboard/seller-id-input";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2, Search, Star, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSelectedProduct } from "@/lib/selected-product-context";

function SellerProductsContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [localSellerId, setLocalSellerId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "prime" | "best_seller">("all");
  const [selectedAsin, setSelectedAsin] = useState<string | null>(null);

  const activeSellerId = user?.seller_id || localSellerId;

  const fetchProducts = async () => {
    if (!activeSellerId) return;
    setLoading(true);
    try {
      const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
      const resp = await fetch(
        `${BASE_URL}/api/seller/products?seller_id=${activeSellerId}`,
        { credentials: "include" }
      );
      if (resp.ok) {
        const data = await resp.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSellerId) fetchProducts();
  }, [activeSellerId]);

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

  const handleRowClick = (p: any) => {
    setSelectedAsin(p.asin);
    setSelected({ asin: p.asin, sellerId: activeSellerId || "" });
    const params = new URLSearchParams({ asin: p.asin, seller_id: activeSellerId || "" });
    // Navigate to price comparison by default; user can switch tabs there
    router.push(`/seller/price-comparison?${params}`);
  };

  return (
    <div className="space-y-6">
   
      
          
       

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
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-full sm:w-64 bg-slate-50 border-none h-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 border-b border-slate-100 font-semibold sticky top-0 bg-white z-10 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-[40%]">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Reviews</th>
                    <th className="px-6 py-4">Sales</th>
                    <th className="px-6 py-4">BSR</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((p, idx) => {
                    const isSelected = selectedAsin === p.asin;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleRowClick(p)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-sky-50 border-l-4 border-l-sky-500"
                            : "hover:bg-slate-50/80"
                        }`}
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
                              <p className={`font-semibold line-clamp-1 ${isSelected ? "text-sky-700" : "text-slate-800"}`} title={p.title}>
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

                        {/* Arrow indicator */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? "text-sky-500" : "text-slate-300"}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {products.length > 0 && !loading && (
            <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/50">
              <p>Showing {filteredProducts.length} of {products.length} products</p>
              <p className="text-slate-400">Click a row to analyse it</p>
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