
// import { useState, useEffect } from "react";
// import { useLocation } from "wouter";
// import axios from "axios";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Tag, BarChart2, Star, ChevronRight } from "lucide-react";

// interface Category {
//   category: string;
//   total_products: number;
//   avg_price: number | null;
//   avg_rating: number | null;
//   total_reviews: number;
//   source: string;
// }

// export default function Categories() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [tableFilter, setTableFilter] = useState<"flipkart" | "amazon" | "all">("all");
//   const [, setLocation] = useLocation();

//   useEffect(() => {
//     axios
//       .get("http://localhost:8000/analytics/category")
//       .then((res) => setCategories(res.data.categories))
//       .catch(() => setError("Failed to fetch category data"))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div className="flex h-screen items-center justify-center text-slate-400">
//         Loading categories...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex h-screen items-center justify-center text-red-500">
//         {error}
//       </div>
//     );

//   const filteredCategories = categories.filter((cat) => {
//     if (tableFilter === "all") return true;
//     return cat.source === tableFilter;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#E3F2FD] to-[#DFF5FF]">
//       <Sidebar />

//       <div className="ml-64 min-h-screen">
//         <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
//           <h2 className="text-2xl font-semibold text-slate-800">
//             Category Analytics
//           </h2>
//           <p className="text-sm text-slate-500">
//             Insights for all product categories in your store
//           </p>
//         </header>

//         <div className="p-6">
//           <div className="max-w-7xl mx-auto space-y-12">
//             {/* Header */}
//             <div className="text-center space-y-6">
//               <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4 shadow-inner">
//                 <Tag className="h-10 w-10 text-blue-500" />
//               </div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
//                 Product Categories
//               </h1>
//               <p className="text-lg text-slate-500 max-w-2xl mx-auto">
//                 Explore top-performing categories and jump directly to their product lists.
//               </p>
//             </div>

//             {/* Filter Dropdown */}
//             <div className="flex items-center gap-4 mb-6">
//               <label className="font-medium text-slate-700">Filter by Table:</label>
//               <select
//                 value={tableFilter}
//                 onChange={(e) => setTableFilter(e.target.value as any)}
//                 className="border border-slate-300 rounded-md px-2 py-1"
//               >
//                 <option value="all">All</option>
//                 <option value="flipkart">Flipkart</option>
//                 <option value="amazon">Amazon</option>
//               </select>
//             </div>

//             {/* Category Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredCategories.map((cat, index) => (
//                 <Card
//                   key={index}
//                   className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
//                 >
//                   <CardHeader className="flex flex-col items-center text-center space-y-2">
//                     <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-50 rounded-xl flex items-center justify-center">
//                       <BarChart2 className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <CardTitle className="text-lg font-semibold text-slate-800">
//                       {cat.category}
//                     </CardTitle>
//                     <CardDescription className="text-slate-500">
//                       {cat.total_products.toLocaleString()} products
//                     </CardDescription>
//                   </CardHeader>

//                   <CardContent className="flex flex-col gap-3 mt-2">
//                     <div className="flex items-center justify-between">
//                       <span className="text-emerald-600 font-semibold">
//                         ₹{cat.avg_price ? cat.avg_price.toFixed(2) : "N/A"} avg. price
//                       </span>
//                       <span className="flex items-center gap-1 text-yellow-500 font-medium">
//                         <Star className="h-4 w-4" /> {cat.avg_rating?.toFixed(1) ?? "N/A"}
//                       </span>
//                     </div>
//                     <div className="text-slate-500 text-sm">
//                       Total Reviews: {cat.total_reviews?.toLocaleString() ?? 0}
//                     </div>

//                     <button
//                       onClick={() =>
//                         setLocation(
//                           `/category-products/${cat.source}/${encodeURIComponent(cat.category)}`
//                         )
//                       }
//                       className="flex items-center justify-center mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg py-2 hover:from-blue-600 hover:to-cyan-600 shadow-md transition-all"
//                     >
//                       View Products <ChevronRight className="ml-2 h-5 w-5" />
//                     </button>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tag, BarChart2, Star, ChevronRight } from "lucide-react";

interface Category {
  category: string;
  total_products: number;
  avg_price: number | null;
  avg_rating: number | null;
  total_reviews: number;
  source: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableFilter, setTableFilter] = useState<"flipkart" | "amazon" | "all">(
    "all"
  );
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8000/analytics/category")
      .then((res) => setCategories(res.data.categories))
      .catch(() => setError("Failed to fetch category data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading categories...
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );

  const filteredCategories = categories.filter((cat) => {
    if (tableFilter === "all") return true;
    return cat.source === tableFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#E3F2FD] to-[#DFF5FF] flex flex-col lg:flex-row">
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>X</button>
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
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-2xl px-6 sm:px-12 py-4 sm:py-6 mb-6 flex items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <span className="text-xl font-bold">☰</span>
            </button>
            <div>
              <h2 className="text-3xl font-bold text-sky-900">
                Category Analytics
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Insights for all product categories in your store
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="px-4 sm:px-6 flex-1 overflow-y-auto pb-6 space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4 shadow-inner">
              <Tag className="h-10 w-10 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              Product Categories
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Explore top-performing categories and jump directly to their
              product lists.
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-slate-700">Filter by Table:</label>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value as any)}
              className="border border-slate-300 rounded-md px-2 py-1"
            >
              <option value="all">All</option>
              <option value="flipkart">Flipkart</option>
              <option value="amazon">Amazon</option>
            </select>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat, index) => (
              <Card
                key={index}
                className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <CardHeader className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-50 rounded-xl flex items-center justify-center">
                    <BarChart2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {cat.category}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {cat.total_products.toLocaleString()} products
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-semibold">
                      ₹{cat.avg_price ? cat.avg_price.toFixed(2) : "N/A"} avg. price
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500 font-medium">
                      <Star className="h-4 w-4" /> {cat.avg_rating?.toFixed(1) ?? "N/A"}
                    </span>
                  </div>
                  <div className="text-slate-500 text-sm">
                    Total Reviews: {cat.total_reviews?.toLocaleString() ?? 0}
                  </div>

                  <button
                    onClick={() =>
                      setLocation(
                        `/category-products/${cat.source}/${encodeURIComponent(
                          cat.category
                        )}`
                      )
                    }
                    className="flex items-center justify-center mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg py-2 hover:from-blue-600 hover:to-cyan-600 shadow-md transition-all"
                  >
                    View Products <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
