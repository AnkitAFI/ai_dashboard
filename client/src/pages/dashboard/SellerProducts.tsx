// import { useState, useEffect } from "react";
// import Sidebar from "@/components/layout/sidebar";
// import SellerIdInput from "@/components/dashboard/SellerIdInput";
// import { useAuth } from "@/App";
// import { Loader2, Menu, X, Search, ChevronDown, ArrowUpDown, Star, ShieldCheck } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";

// export default function SellerProducts() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { user, refreshUser } = useAuth();
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
//       const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
//       const resp = await fetch(`${BASE_URL}/api/seller/products?seller_id=${activeSellerId}`, {
//         credentials: "include",
//       });
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
//     if (activeSellerId) {
//       fetchProducts();
//     }
//   }, [activeSellerId]);

//   const filteredProducts = products.filter((p) => {
//     // Search filter
//     const matchesSearch =
//       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.asin.toLowerCase().includes(searchQuery.toLowerCase());

//     // Tab filter
//     const matchesTab =
//       activeFilter === "all" ? true :
//         activeFilter === "prime" ? p.is_prime === true :
//           activeFilter === "best_seller" ? p.is_best_seller === true : true;

//     return matchesSearch && matchesTab;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
//       {/* Mobile Menu Overlay */}
//       {isMobileMenuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transform transition-transform shadow-2xl">
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
//         <Sidebar />
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-sm 
//           px-4 sm:px-6 lg:px-8 py-4 sm:py-5 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center 
//           justify-between gap-4 sm:gap-0 sticky top-0 z-20">
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
//             >
//               <Menu className="w-5 h-5 text-sky-900" />
//             </button>
//             <div>
//               <h2 className="text-xl sm:text-2xl font-bold text-sky-900">
//                 My Products
//               </h2>
//               <p className="text-slate-600 text-xs sm:text-sm">
//                 Manage your product catalog, ratings, and performance
//               </p>
//             </div>
//           </div>
//           {activeSellerId && (
//             <div className="text-xs text-slate-500 bg-white/60 px-3 py-1 rounded-full border">
//               Last updated: just now
//             </div>
//           )}
//         </header>

//         <main className="px-4 sm:px-6 flex-1 pb-6 space-y-6">
//           {!activeSellerId ? (
//             <SellerIdInput
//               onSaved={(id) => {
//                 setLocalSellerId(id);
//                 refreshUser();
//               }}
//             />
//           ) : (
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//               {/* Product Catalog Header Controls */}
//               <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
//                 <div>
//                   <h3 className="font-bold text-slate-800 text-lg">Product Catalog</h3>
//                   <p className="text-sm text-slate-500">{filteredProducts.length} products found</p>
//                 </div>
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <div className="relative">
//                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                     <Input
//                       placeholder="Search products..."
//                       className="pl-9 w-full sm:w-64 bg-slate-50 border-none h-10 rounded-xl"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                   </div>
//                   <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
//                     <button
//                       onClick={() => setActiveFilter("all")}
//                       className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "all"
//                           ? "bg-orange-500 text-white shadow-sm"
//                           : "text-slate-600 hover:text-slate-900"
//                         }`}
//                     >
//                       All Products <span className="opacity-80 text-xs ml-1">{products.length}</span>
//                     </button>
//                     <button
//                       onClick={() => setActiveFilter("prime")}
//                       className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "prime"
//                           ? "bg-orange-500 text-white shadow-sm"
//                           : "text-slate-600 hover:text-slate-900"
//                         }`}
//                     >
//                       Prime <span className="opacity-80 text-xs ml-1">{products.filter(p => p.is_prime).length}</span>
//                     </button>
//                     <button
//                       onClick={() => setActiveFilter("best_seller")}
//                       className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeFilter === "best_seller"
//                           ? "bg-orange-500 text-white shadow-sm"
//                           : "text-slate-600 hover:text-slate-900"
//                         }`}
//                     >
//                       Best Seller <span className="opacity-80 text-xs ml-1">{products.filter(p => p.is_best_seller).length}</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Data Table */}
//               <div className="overflow-x-auto">
//                 {loading ? (
//                   <div className="flex flex-col items-center justify-center h-64 gap-3">
//                     <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
//                     <p className="text-slate-500 font-medium">Loading catalog...</p>
//                   </div>
//                 ) : products.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center p-12 text-center h-64">
//                     <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
//                       <Search className="w-8 h-8" />
//                     </div>
//                     <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
//                     <p className="text-slate-500 max-w-sm">We couldn't find any tracked products for your Seller ID. Make sure you are tracking products in the Explorer mode first.</p>
//                   </div>
//                 ) : (
//                   <table className="w-full text-sm text-left">
//                     <thead className="text-xs text-slate-500 border-b border-slate-100 font-semibold sticky top-0 bg-white z-10 uppercase tracking-wider">
//                       <tr>
//                         <th className="px-6 py-4 rounded-tl-xl w-[40%]">Product</th>
//                         <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 group">
//                           Price <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100" />
//                         </th>
//                         <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 group">
//                           Rating <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100" />
//                         </th>
//                         <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 group">
//                           Reviews <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100" />
//                         </th>
//                         <th className="px-6 py-4">Sales</th>
//                         <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 group">
//                           BSR <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100" />
//                         </th>
//                         <th className="px-6 py-4 rounded-tr-xl">Type</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-50">
//                       {filteredProducts.map((p, idx) => (
//                         <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
//                           <td className="px-6 py-4">
//                             <div className="flex items-center gap-4">
//                               <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
//                                 {p.image ? (
//                                   <img src={p.image} alt={p.title} className="w-full h-full object-contain p-1" />
//                                 ) : (
//                                   <span className="text-slate-300 font-bold text-lg">
//                                     {p.title.charAt(0)}
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="min-w-0">
//                                 <p className="font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={p.title}>
//                                   {p.title}
//                                 </p>
//                                 <div className="flex items-center mt-1 gap-2 text-xs">
//                                   <span className="text-slate-400 font-mono" title="ASIN">{p.asin}</span>
//                                   {p.is_prime && (
//                                     <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 px-1 py-0 h-4">
//                                       PRIME
//                                     </Badge>
//                                   )}
//                                   {p.is_best_seller && (
//                                     <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 px-1 py-0 h-4">
//                                       BEST SELLER
//                                     </Badge>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
//                             {p.price ? (p.price.toString().startsWith('₹') || p.price.toString().startsWith('$') ? p.price : `₹${p.price}`) : 'N/A'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-1 font-bold text-slate-800">
//                               <Star className="w-4 h-4 text-orange-400 fill-orange-400 -mt-0.5" />
//                               {p.rating}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
//                             {p.reviews >= 1000 ? `${(p.reviews / 1000).toFixed(1)}K` : p.reviews}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">{p.sales}</span>
//                           </td>
//                           <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-xs">
//                             {p.bsr}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {p.is_fba ? (
//                               <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 uppercase text-[10px] tracking-wider font-bold">
//                                 FBA
//                               </Badge>
//                             ) : (
//                               <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 uppercase text-[10px] tracking-wider font-bold">
//                                 FBM
//                               </Badge>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//               {/* Pagination (Mock) */}
//               {products.length > 0 && !loading && (
//                 <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/50">
//                   <p>Showing {filteredProducts.length} of {products.length} products</p>
//                   <p>Click a product to view detailed analysis</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }









import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar";
import SellerIdInput from "@/components/dashboard/SellerIdInput";
import { useAuth } from "@/App";
import {
  Loader2, Menu, X, Search, ArrowUpDown, Star,
  BarChart2, MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function SellerProducts() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [localSellerId, setLocalSellerId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "prime" | "best_seller">("all");

  const activeSellerId = user?.seller_id || localSellerId;

  const fetchProducts = async () => {
    if (!activeSellerId) return;
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
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
    navigate(type === "price"
      ? `/seller/price-comparison?${params}`
      : `/seller/review-comparison?${params}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transform transition-transform shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-sm px-4 sm:px-6 lg:px-8 py-4 sm:py-5 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-sky-900" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-sky-900">My Products</h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Click <span className="text-sky-600 font-semibold">Price</span> or{" "}
                <span className="text-violet-600 font-semibold">Reviews</span> on any product to compare
              </p>
            </div>
          </div>
          {activeSellerId && (
            <div className="text-xs text-slate-500 bg-white/60 px-3 py-1 rounded-full border">
              Last updated: just now
            </div>
          )}
        </header>

        <main className="px-4 sm:px-6 flex-1 pb-6 space-y-6">
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
        </main>
      </div>
    </div>
  );
}