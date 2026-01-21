// import { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { TrendingUp, DollarSign, Star, ShoppingBag } from "lucide-react";
 
// interface Summary {
//   total_products: number;
//   avg_price: number;
//   avg_rating: number;
//   total_reviews: number;
// }
 
// export default function Revenue() {
//   const [summary, setSummary] = useState<Summary | null>(null);
//   const [source, setSource] = useState<"flipkart" | "amazon" | "all">("flipkart");
//   const [loading, setLoading] = useState<boolean>(false);

//   const fetchSummary = async (selectedSource: string) => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`https://api.insydz.com/analytics-summary?source=${selectedSource}`);
//       setSummary(res.data);
//     } catch (err) {
//       console.error("Error fetching summary:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSummary(source);
//   }, [source]);

//   return (
//     <div className="min-h-screen bg-background">
//       <Sidebar />
 
//       <div className="ml-64 min-h-screen">
//         {/* Header */}
//         <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
//           <div>
//             <h2 className="text-xl font-semibold">Analytics Summary</h2>
//             <p className="text-sm text-muted-foreground">
//               Key performance insights powered by AI
//             </p>
//           </div>

//           {/* 🔽 Dropdown */}
//           <select
//             value={source}
//             onChange={(e) => setSource(e.target.value as "flipkart" | "amazon" | "all")}
//             className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary"
//           >
//             <option value="flipkart">Flipkart</option>
//             <option value="amazon">Amazon</option>
//             <option value="all">All</option>
//           </select>
//         </header>

//         {/* Loading State */}
//         {loading || !summary ? (
//           <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
//             Loading analytics data...
//           </div>
//         ) : (
//           <div className="p-6">
//             <div className="max-w-5xl mx-auto space-y-12">
//               {/* Hero Section */}
//               <div className="text-center space-y-6">
//                 <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-4">
//                   <TrendingUp className="h-10 w-10 text-primary" />
//                 </div>
//                 <h1 className="text-4xl font-bold text-foreground">Performance Overview</h1>
//                 <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                   Get a snapshot of your store’s performance with total products, pricing,
//                   ratings, and reviews — all updated in real-time.
//                 </p>
//               </div>

//               {/* Analytics Summary Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <ShoppingBag className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <CardTitle className="text-center text-blue-700 dark:text-blue-300">
//                       Total Products
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-blue-600 mt-2">
//                       {summary.total_products?.toLocaleString() ?? "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>

//                 <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <DollarSign className="h-6 w-6 text-green-600" />
//                     </div>
//                     <CardTitle className="text-center text-green-700 dark:text-green-300">
//                       Average Price
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-green-600 mt-2">
//                       ₹{summary.avg_price ? summary.avg_price.toFixed(2) : "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>

//                 <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <Star className="h-6 w-6 text-yellow-600" />
//                     </div>
//                     <CardTitle className="text-center text-yellow-700 dark:text-yellow-300">
//                       Average Rating
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-yellow-600 mt-2">
//                       {summary.avg_rating ? summary.avg_rating.toFixed(2) : "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>

//                 <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <TrendingUp className="h-6 w-6 text-purple-600" />
//                     </div>
//                     <CardTitle className="text-center text-purple-700 dark:text-purple-300">
//                       Total Reviews
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-purple-600 mt-2">
//                       {summary.total_reviews?.toLocaleString() ?? "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>
//               </div>

//               {/* Insight Message */}
//               <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
//                 <CardContent className="p-8 text-center">
//                   <h2 className="text-2xl font-bold mb-4">AI Insight</h2>
//                   <p className="text-lg text-muted-foreground leading-relaxed">
//                     Your <strong>{source}</strong> store is performing steadily with an
//                     average rating of{" "}
//                     <strong>{summary.avg_rating.toFixed(2)}</strong> and{" "}
//                     <strong>{summary.total_reviews.toLocaleString()}</strong> customer reviews.
//                     Continue optimizing product pricing to improve average margins.
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { TrendingUp, DollarSign, Star, ShoppingBag, Menu, X } from "lucide-react";

// interface Summary {
//   total_products: number;
//   avg_price: number;
//   avg_rating: number;
//   total_reviews: number;
// }
 
// export default function Revenue() {
//   const [summary, setSummary] = useState<Summary | null>(null);
//   const [source, setSource] = useState<"flipkart" | "amazon" | "all">("flipkart");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const fetchSummary = async (selectedSource: string) => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`https://api.insydz.com/analytics-summary?source=${selectedSource}`);
//       setSummary(res.data);
//     } catch (err) {
//       console.error("Error fetching summary:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSummary(source);
//   }, [source]);

//   return (
//     <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      
//       {/* Mobile Sidebar Overlay */}
//       {isMobileMenuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />

//           <aside
//             className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300"
//             style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}
//           >
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//      )}

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
//         <Sidebar />
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">

//         {/* Header */}
//         <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-20">
//           <div className="flex items-center gap-4">
//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
//             >
//               <Menu className="w-5 h-5 text-sky-900" />
//             </button>

//             <div>
//               <h2 className="text-xl font-semibold">Analytics Summary</h2>
//               <p className="text-sm text-muted-foreground">Key performance insights powered by AI</p>
//             </div>
//           </div>

//           <select
//             value={source}
//             onChange={(e) => setSource(e.target.value as "flipkart" | "amazon" | "all")}
//             className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary"
//           >
//             <option value="flipkart">Flipkart</option>
//             <option value="amazon">Amazon</option>
//             <option value="all">All</option>
//           </select>
//         </header>

//         {/* Loading State */}
//         {loading || !summary ? (
//           <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
//             Loading analytics data...
//           </div>
//         ) : (
//           <div className="p-6 flex-1 overflow-y-auto">
//             <div className="max-w-5xl mx-auto space-y-12">

//               {/* Hero Section */}
//               <div className="text-center space-y-6">
//                 <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-4">
//                   <TrendingUp className="h-10 w-10 text-primary" />
//                 </div>
//                 <h1 className="text-4xl font-bold text-foreground">Performance Overview</h1>
//                 <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//                   Get a snapshot of your store’s performance with total products, pricing,
//                   ratings, and reviews — all updated in real-time.
//                 </p>
//               </div>

//               {/* Analytics Summary Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <ShoppingBag className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <CardTitle className="text-center text-blue-700 dark:text-blue-300">
//                       Total Products
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-blue-600 mt-2">
//                       {summary.total_products?.toLocaleString() ?? "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>

//                 <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <DollarSign className="h-6 w-6 text-green-600" />
//                     </div>
//                     <CardTitle className="text-center text-green-700 dark:text-green-300">
//                       Average Price
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-green-600 mt-2">
//                       ₹{summary.avg_price ? summary.avg_price.toFixed(2) : "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>

//                 <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <Star className="h-6 w-6 text-yellow-600" />
//                     </div>
//                     <CardTitle className="text-center text-yellow-700 dark:text-yellow-300">
//                       Average Rating
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-yellow-600 mt-2">
//                       {summary.avg_rating ? summary.avg_rating.toFixed(2) : "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>

//                 <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-700/20">
//                   <CardHeader className="flex flex-col items-center">
//                     <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
//                       <TrendingUp className="h-6 w-6 text-purple-600" />
//                     </div>
//                     <CardTitle className="text-center text-purple-700 dark:text-purple-300">
//                       Total Reviews
//                     </CardTitle>
//                     <CardDescription className="text-3xl font-bold text-purple-600 mt-2">
//                       {summary.total_reviews?.toLocaleString() ?? "—"}
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>
//               </div>

//               {/* AI Insight */}
//               <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
//                 <CardContent className="p-8 text-center">
//                   <h2 className="text-2xl font-bold mb-4">AI Insight</h2>
//                   <p className="text-lg text-muted-foreground leading-relaxed">
//                     Your <strong>{source}</strong> store is performing steadily with an
//                     average rating of <strong>{summary.avg_rating.toFixed(2)}</strong> and{" "}
//                     <strong>{summary.total_reviews.toLocaleString()}</strong> customer reviews.
//                     Continue optimizing product pricing to improve average margins.
//                   </p>
//                 </CardContent>
//               </Card>

//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, DollarSign, Star, ShoppingBag, Menu, X } from "lucide-react";

interface Summary {
  total_products: number;
  avg_price: number;
  avg_rating: number;
  total_reviews: number;
}

export default function Overview() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [source, setSource] = useState<"flipkart" | "amazon" | "all">("flipkart");
  const [loading, setLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchSummary = async (selectedSource: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://api.insydz.com/analytics-summary?source=${selectedSource}`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(source);
  }, [source]);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside
            className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300"
            style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}
          >
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
        <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-sky-900" />
            </button>

            <div>
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-sm text-muted-foreground">Key performance insights powered by AI</p>
            </div>
          </div>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value as "flipkart" | "amazon" | "all")}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary"
          >
            <option value="flipkart">Flipkart</option>
            <option value="amazon">Amazon</option>
            <option value="all">All</option>
          </select>
        </header>

        {/* Loading State */}
        {loading || !summary ? (
          <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
            Loading analytics data...
          </div>
        ) : (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-12">

              {/* Hero Section */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-4">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">Performance Overview</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get a snapshot of your store’s performance with total products, pricing,
                  ratings, and reviews — all updated in real-time.
                </p>
              </div>

              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-700/20">
                  <CardHeader className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-center text-blue-700 dark:text-blue-300">
                      Total Products
                    </CardTitle>
                    <CardDescription className="text-3xl font-bold text-blue-600 mt-2">
                      {summary.total_products?.toLocaleString() ?? "—"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-700/20">
                  <CardHeader className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-center text-green-700 dark:text-green-300">
                      Average Price
                    </CardTitle>
                    <CardDescription className="text-3xl font-bold text-green-600 mt-2">
                      ₹{summary.avg_price ? summary.avg_price.toFixed(2) : "—"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-700/20">
                  <CardHeader className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle className="text-center text-yellow-700 dark:text-yellow-300">
                      Average Rating
                    </CardTitle>
                    <CardDescription className="text-3xl font-bold text-yellow-600 mt-2">
                      {summary.avg_rating ? summary.avg_rating.toFixed(2) : "—"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-700/20">
                  <CardHeader className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-center text-purple-700 dark:text-purple-300">
                      Total Reviews
                    </CardTitle>
                    <CardDescription className="text-3xl font-bold text-purple-600 mt-2">
                      {summary.total_reviews?.toLocaleString() ?? "—"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* AI Insight */}
              <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">AI Insight</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Your <strong>{source}</strong> store is performing steadily with an
                    average rating of <strong>{summary.avg_rating.toFixed(2)}</strong> and{" "}
                    <strong>{summary.total_reviews.toLocaleString()}</strong> customer reviews.
                    Continue optimizing product pricing to improve average margins.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}