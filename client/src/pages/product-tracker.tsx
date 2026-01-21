// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Target,
//   TrendingUp,
//   DollarSign,
//   Users,
//   MapPin,
//   AlertTriangle,
//   Lightbulb,
//   Menu,
//   X,
//   ShoppingBag,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import Sidebar from "@/components/layout/sidebar";

// interface AnalysisResult {
//   success: boolean;
//   product_name: string;
//   category: string;
//   source: string;
//   pricing: {
//     recommended_price: number;
//     min_price: number;
//     max_price: number;
//     profit_margin: number;
//     confidence: string;
//     market_avg_price: number;
//     market_min_price: number;
//     market_max_price: number;
//   };
//   sales: {
//     estimated_monthly_sales: string;
//     estimated_daily_sales: number;
//     market_demand: string;
//   };
//   competition: {
//     total_competitors: number;
//     avg_competitor_price: number;
//     avg_competitor_rating: number;
//     top_competitor: {
//       name: string;
//       price: number;
//       rating: number;
//       reviews: number;
//     } | null;
//   };
//   location_insights: Array<{
//     country: string;
//     market_share: string;
//     demand_level: string;
//   }>;
//   ai_strategy: string;
//   warnings: string[];
// }

// interface Toast {
//   id: number;
//   title: string;
//   description: string;
//   variant: "success" | "error";
// }

// export default function ProductTracker() {
//   const [productName, setProductName] = useState("");
//   const [category, setCategory] = useState("");
//   const [categories, setCategories] = useState<string[]>([]);
//   const [source, setSource] = useState("amazon");
//   const [baseCost, setBaseCost] = useState("");
//   const [userEmail, setUserEmail] = useState(""); // ✅ Added
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<AnalysisResult | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   // ✅ Load user email from localStorage on component mount
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       try {
//         const user = JSON.parse(storedUser);
//         setUserEmail(user.email || "");
//         console.log("✅ User loaded from localStorage:", user.email);
//       } catch (e) {
//         console.error("❌ Error parsing user data:", e);
//       }
//     } else {
//       console.log("⚠️ No user found in localStorage");
//     }
//   }, []);

//   // Fetch Categories
//   const fetchCategories = async (src: string) => {
//     try {
//       const res = await fetch(`https://api.insydz.com/categories?table=${src}`);
//       const data = await res.json();
//       const cats = data.map((c: any) => c.category);
//       setCategories(cats);
//       if (!cats.includes(category)) setCategory("");
//     } catch (err) {
//       console.error("Failed to fetch categories:", err);
//       setCategories([]);
//       setCategory("");
//     }
//   };

//   useEffect(() => {
//     fetchCategories(source);
//   }, [source]);

//   // Toasts
//   const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
//     const id = Date.now();
//     setToasts(prev => [...prev, { id, title, description, variant }]);
//     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
//   };

//   const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

//   // Handle Analyze
//   const handleAnalyze = async () => {
//     if (!productName || !category || !baseCost) {
//       showToast("Missing Information", "Please fill in all fields to analyze your product.", "error");
//       return;
//     }

//     const cost = parseFloat(baseCost);
//     if (isNaN(cost) || cost <= 0) {
//       showToast("Invalid Cost", "Please enter a valid cost price.", "error");
//       return;
//     }

//     if (cost > 50000) {
//       const confirmProceed = window.confirm(
//         `⚠️ Warning: Your cost is ₹${cost.toLocaleString()}. This seems very high. Are you sure this is correct?\n\n` +
//         `Common mistakes:\n• Did you accidentally add extra zeros?\n• Is this the cost per unit (not per carton)?`
//       );
//       if (!confirmProceed) return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       // ✅ CRITICAL FIX: Send user email with request
//       const requestBody = {
//         product_name: productName,
//         category,
//         source,
//         base_cost: cost,
//         user_email: userEmail || null  // Send email if logged in, else null
//       };

//       console.log("📤 Sending request to backend:", requestBody);

//       const response = await fetch("https://api.insydz.com/product-tracker/analyze", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         const errorMsg = data.detail || "Analysis failed";
//         showToast("Analysis Failed", errorMsg, "error");
//         throw new Error(errorMsg);
//       }

//       setResult(data);
      
//       // ✅ Show different message based on login status
//       if (userEmail) {
//         showToast(
//           "Analysis Complete!", 
//           `Your ${data.source} product analyzed & saved to ${userEmail}`, 
//           "success"
//         );
//       } else {
//         showToast(
//           "Analysis Complete!", 
//           `Analysis done! Login to save history.`, 
//           "success"
//         );
//       }

//       setTimeout(() => window.scrollTo({ top: 500, behavior: 'smooth' }), 100);

//     } catch (error: any) {
//       console.error("Analysis error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Badge Helpers
//   const getConfidenceBadgeColor = (confidence: string) => {
//     switch (confidence.toLowerCase()) {
//       case "high": return "bg-green-100 text-green-800 border-green-300";
//       case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       case "critical": return "bg-red-100 text-red-800 border-red-300";
//       default: return "bg-red-100 text-red-800 border-red-300";
//     }
//   };

//   const getDemandBadgeColor = (demand: string) => {
//     switch (demand.toLowerCase()) {
//       case "high": return "bg-emerald-100 text-emerald-800 border-emerald-300";
//       case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
//       default: return "bg-slate-100 text-slate-800 border-slate-300";
//     }
//   };

//   const getSourceColor = (src: string) =>
//     src.toLowerCase() === "amazon"
//       ? "bg-orange-100 text-orange-800 border-orange-300"
//       : "bg-yellow-100 text-yellow-800 border-yellow-300";

//   // Render
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">
//       {/* Toasts */}
//       <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
//         {toasts.map(t => (
//           <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-md animate-in slide-in-from-right ${
//             t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
//           }`}>
//             {t.variant === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
//             <div className="flex-1 min-w-0">
//               <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
//               <p className={`text-sm mt-1 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
//             </div>
//             <button onClick={() => removeToast(t.id)} className={`${t.variant === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`}>
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Mobile Menu Button */}
//       <button
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 rounded-xl shadow-md"
//         onClick={() => setIsMobileMenuOpen(true)}
//       >
//         <Menu className="w-6 h-6 text-slate-700" />
//       </button>

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
//         <Sidebar />
//       </aside>

//       {/* Mobile Sidebar Overlay */}
//       {isMobileMenuOpen && (
//         <>
//           <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300" style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}>
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}

//       {/* MAIN CONTENT */}
//       <div className="lg:ml-64 transition-all min-h-screen">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <Target className="h-8 w-8 text-blue-600" />
//             <div>
//               <h2 className="text-2xl font-semibold text-slate-800">Product Radar</h2>
//               <p className="text-sm text-slate-500">Analyze market opportunities for Amazon & Flipkart</p>
//             </div>
//           </div>
//         </header>

//         <div className="p-6">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Title Section */}
//             <div className="text-center space-y-4">
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
//                 AI-Powered Market Intelligence
//               </h1>
//               <p className="text-slate-500 text-lg">
//                 Get instant insights on pricing, competition, and sales forecasts for both Amazon & Flipkart
//               </p>
//               {/* ✅ Show logged-in user info */}
//               {userEmail ? (
//                 <p className="text-sm text-green-600 font-medium">
//                   ✓ Logged in as: {userEmail} (Analysis will be saved)
//                 </p>
//               ) : (
//                 <p className="text-sm text-orange-600 font-medium">
//                   ⚠️ Not logged in - Analysis won't be saved
//                 </p>
//               )}
//             </div>

//             {/* Input Form */}
//             <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//               <CardHeader>
//                 <CardTitle className="text-lg font-semibold text-slate-700">Product Information</CardTitle>
//                 <CardDescription className="text-slate-500">
//                   Enter your product details to get AI-powered market insights from {source === "amazon" ? "Amazon" : "Flipkart"}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Product Name */}
//                   <div className="space-y-2">
//                     <Label htmlFor="product-name">Product Name</Label>
//                     <Input id="product-name" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., Wireless Headphones" />
//                   </div>

//                   {/* Category */}
//                   <div className="space-y-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select value={category} onValueChange={setCategory}>
//                       <SelectTrigger id="category">
//                         <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.length === 0 ? (
//                           <SelectItem value="disabled" disabled>No categories available</SelectItem>
//                         ) : (
//                           categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Source */}
//                   <div className="space-y-2">
//                     <Label htmlFor="source">Marketplace</Label>
//                     <Select value={source} onValueChange={setSource}>
//                       <SelectTrigger id="source">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="amazon">
//                           <div className="flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon
//                           </div>
//                         </SelectItem>
//                         <SelectItem value="flipkart">
//                           <div className="flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart
//                           </div>
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Base Cost */}
//                   <div className="space-y-2">
//                     <Label htmlFor="base-cost">Your Cost Price (₹)</Label>
//                     <Input id="base-cost" type="number" value={baseCost} onChange={e => setBaseCost(e.target.value)} placeholder="e.g., 500" />
//                   </div>
//                 </div>

//                 <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
//                   {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing {source} Market...</> : <><Target className="h-4 w-4 mr-2" />Analyze on {source}</>}
//                 </Button>
//               </CardContent>
//             </Card>

//              {/* Results */}
//              {result && (
//               <div className="space-y-6">
//                 {/* Source Badge */}
//                 <div className="flex justify-center">
//                   <Badge className={`${getSourceColor(result.source)} text-base px-4 py-2`}>
//                     📊 Analysis for {result.source}
//                   </Badge>
//                 </div>

//                 {/* Warnings */}
//                 {result.warnings && result.warnings.length > 0 && (
//                   <Alert className={result.warnings[0].includes("✅") ? "border-green-300 bg-green-50" : result.warnings[0].includes("🚨") ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}>
//                     <AlertTriangle className="h-4 w-4" />
//                     <AlertDescription>
//                       <ul className="space-y-1">
//                         {result.warnings.map((warning, idx) => (
//                           <li key={idx} className="text-sm">{warning}</li>
//                         ))}
//                       </ul>
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 {/* Pricing Insights */}
//                 <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                         Pricing Strategy
//                       </CardTitle>
//                       <div className="flex gap-2">
//                         <Badge className={getSourceColor(result.source)}>
//                           {result.source}
//                         </Badge>
//                         <Badge className={getConfidenceBadgeColor(result.pricing.confidence)}>
//                           {result.pricing.confidence} Confidence
//                         </Badge>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
//                         <p className="text-sm text-slate-600 mb-1">Recommended Price</p>
//                         <p className="text-3xl font-bold text-blue-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
//                       </div>
                      
//                       <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
//                         <p className="text-sm text-slate-600 mb-1">Price Range</p>
//                         <p className="text-xl font-semibold text-slate-700">
//                           ₹{result.pricing.min_price.toLocaleString()} - ₹{result.pricing.max_price.toLocaleString()}
//                         </p>
//                       </div>
                      
//                       <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
//                         <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
//                         <p className="text-3xl font-bold text-green-600">{result.pricing.profit_margin.toFixed(1)}%</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Sales & Demand */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <TrendingUp className="h-5 w-5 text-purple-600" />
//                         Sales Forecast
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div>
//                         <p className="text-sm text-slate-600 mb-1">Estimated Monthly Sales</p>
//                         <p className="text-2xl font-bold text-slate-900">{result.sales.estimated_monthly_sales} units</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-slate-600 mb-1">Daily Average</p>
//                         <p className="text-xl font-semibold text-slate-700">{result.sales.estimated_daily_sales.toFixed(0)} units/day</p>
//                       </div>
//                       <Badge className={getDemandBadgeColor(result.sales.market_demand)}>
//                         {result.sales.market_demand} Demand
//                       </Badge>
//                     </CardContent>
//                   </Card>

//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <Users className="h-5 w-5 text-orange-600" />
//                         Competition Analysis
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Total Competitors</span>
//                         <span className="text-xl font-bold text-slate-900">{result.competition.total_competitors}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Avg Price</span>
//                         <span className="text-lg font-semibold text-slate-700">₹{result.competition.avg_competitor_price.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Avg Rating</span>
//                         <span className="text-lg font-semibold text-slate-700">{result.competition.avg_competitor_rating.toFixed(1)}★</span>
//                       </div>
                      
//                       {result.competition.top_competitor && (
//                         <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
//                           <p className="text-xs font-semibold text-orange-800 mb-2">Top Competitor on {result.source}</p>
//                           <p className="text-sm text-slate-700 mb-1 truncate">{result.competition.top_competitor.name}</p>
//                           <div className="flex gap-3 text-xs text-slate-600">
//                             <span>₹{result.competition.top_competitor.price.toLocaleString()}</span>
//                             <span>{result.competition.top_competitor.rating}★</span>
//                             <span>{result.competition.top_competitor.reviews.toLocaleString()} reviews</span>
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Location Insights */}
//                 {result.location_insights && result.location_insights.length > 0 && (
//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <MapPin className="h-5 w-5 text-red-600" />
//                         Market Distribution in India
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {result.location_insights.map((location, idx) => (
//                           <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200">
//                             <p className="font-semibold text-slate-900">{location.country}</p>
//                             <p className="text-2xl font-bold text-blue-600">{location.market_share}</p>
//                             <Badge variant="outline" className="mt-2">{location.demand_level} Demand</Badge>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 {/* AI Strategy */}
//                 <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                       <Lightbulb className="h-5 w-5 text-yellow-600" />
//                       AI-Powered Strategy for {result.source}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-slate-700 leading-relaxed whitespace-pre-line">{result.ai_strategy}</p>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Target,
//   TrendingUp,
//   DollarSign,
//   Users,
//   MapPin,
//   AlertTriangle,
//   Lightbulb,
//   Menu,
//   X,
//   ShoppingBag,
//   CheckCircle2,
//   XCircle,
//   History,
// } from "lucide-react";
// import Sidebar from "@/components/layout/sidebar";

// interface AnalysisResult {
//   success: boolean;
//   product_name: string;
//   category: string;
//   source: string;
//   pricing: {
//     recommended_price: number;
//     min_price: number;
//     max_price: number;
//     profit_margin: number;
//     confidence: string;
//     market_avg_price: number;
//     market_min_price: number;
//     market_max_price: number;
//   };
//   sales: {
//     estimated_monthly_sales: string;
//     estimated_daily_sales: number;
//     market_demand: string;
//   };
//   competition: {
//     total_competitors: number;
//     avg_competitor_price: number;
//     avg_competitor_rating: number;
//     top_competitor: {
//       name: string;
//       price: number;
//       rating: number;
//       reviews: number;
//     } | null;
//   };
//   location_insights: Array<{
//     country: string;
//     market_share: string;
//     demand_level: string;
//   }>;
//   ai_strategy: string;
//   warnings: string[];
// }

// interface Toast {
//   id: number;
//   title: string;
//   description: string;
//   variant: "success" | "error";
// }

// export default function ProductTracker() {
//   const [productName, setProductName] = useState("");
//   const [category, setCategory] = useState("");
//   const [categories, setCategories] = useState<string[]>([]);
//   const [source, setSource] = useState("amazon");
//   const [baseCost, setBaseCost] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<AnalysisResult | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   // Load user email from localStorage on component mount
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       try {
//         const user = JSON.parse(storedUser);
//         setUserEmail(user.email || "");
//         console.log("✅ User loaded from localStorage:", user.email);
//       } catch (e) {
//         console.error("❌ Error parsing user data:", e);
//       }
//     } else {
//       console.log("⚠️ No user found in localStorage");
//     }
//   }, []);

//   // Fetch Categories
//   const fetchCategories = async (src: string) => {
//     try {
//       const res = await fetch(`https://api.insydz.com/categories?table=${src}`);
//       const data = await res.json();
//       const cats = data.map((c: any) => c.category);
//       setCategories(cats);
//       if (!cats.includes(category)) setCategory("");
//     } catch (err) {
//       console.error("Failed to fetch categories:", err);
//       setCategories([]);
//       setCategory("");
//     }
//   };

//   useEffect(() => {
//     fetchCategories(source);
//   }, [source]);

//   // Toasts
//   const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
//     const id = Date.now();
//     setToasts(prev => [...prev, { id, title, description, variant }]);
//     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
//   };

//   const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

//   // Handle Analyze
//   const handleAnalyze = async () => {
//     if (!productName || !category || !baseCost) {
//       showToast("Missing Information", "Please fill in all fields to analyze your product.", "error");
//       return;
//     }

//     const cost = parseFloat(baseCost);
//     if (isNaN(cost) || cost <= 0) {
//       showToast("Invalid Cost", "Please enter a valid cost price.", "error");
//       return;
//     }

//     if (cost > 50000) {
//       const confirmProceed = window.confirm(
//         `⚠️ Warning: Your cost is ₹${cost.toLocaleString()}. This seems very high. Are you sure this is correct?\n\n` +
//         `Common mistakes:\n• Did you accidentally add extra zeros?\n• Is this the cost per unit (not per carton)?`
//       );
//       if (!confirmProceed) return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const requestBody = {
//         product_name: productName,
//         category,
//         source,
//         base_cost: cost,
//         user_email: userEmail || null
//       };

//       console.log("📤 Sending request to backend:", requestBody);

//       const response = await fetch("https://api.insydz.com/product-tracker/analyze", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         const errorMsg = data.detail || "Analysis failed";
//         showToast("Analysis Failed", errorMsg, "error");
//         throw new Error(errorMsg);
//       }

//       setResult(data);
      
//       if (userEmail) {
//         showToast(
//           "Analysis Complete!", 
//           `Your ${data.source} product analyzed & saved to ${userEmail}`, 
//           "success"
//         );
//       } else {
//         showToast(
//           "Analysis Complete!", 
//           `Analysis done! Login to save history.`, 
//           "success"
//         );
//       }

//       setTimeout(() => window.scrollTo({ top: 500, behavior: 'smooth' }), 100);

//     } catch (error: any) {
//       console.error("Analysis error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Badge Helpers
//   const getConfidenceBadgeColor = (confidence: string) => {
//     switch (confidence.toLowerCase()) {
//       case "high": return "bg-green-100 text-green-800 border-green-300";
//       case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       case "critical": return "bg-red-100 text-red-800 border-red-300";
//       default: return "bg-red-100 text-red-800 border-red-300";
//     }
//   };

//   const getDemandBadgeColor = (demand: string) => {
//     switch (demand.toLowerCase()) {
//       case "high": return "bg-emerald-100 text-emerald-800 border-emerald-300";
//       case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
//       default: return "bg-slate-100 text-slate-800 border-slate-300";
//     }
//   };

//   const getSourceColor = (src: string) =>
//     src.toLowerCase() === "amazon"
//       ? "bg-orange-100 text-orange-800 border-orange-300"
//       : "bg-yellow-100 text-yellow-800 border-yellow-300";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">
//       {/* Toasts */}
//       <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
//         {toasts.map(t => (
//           <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-md animate-in slide-in-from-right ${
//             t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
//           }`}>
//             {t.variant === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
//             <div className="flex-1 min-w-0">
//               <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
//               <p className={`text-sm mt-1 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
//             </div>
//             <button onClick={() => removeToast(t.id)} className={`${t.variant === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`}>
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Mobile Menu Button */}
//       <button
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 rounded-xl shadow-md"
//         onClick={() => setIsMobileMenuOpen(true)}
//       >
//         <Menu className="w-6 h-6 text-slate-700" />
//       </button>

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
//         <Sidebar />
//       </aside>

//       {/* Mobile Sidebar Overlay */}
//       {isMobileMenuOpen && (
//         <>
//           <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300" style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}>
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}

//       {/* MAIN CONTENT */}
//       <div className="lg:ml-64 transition-all min-h-screen">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <Target className="h-8 w-8 text-blue-600" />
//             <div>
//               <h2 className="text-2xl font-semibold text-slate-800">Product Radar</h2>
//               <p className="text-sm text-slate-500">Analyze market opportunities for Amazon & Flipkart</p>
//             </div>
//           </div>
//         </header>

//         <div className="p-6">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Title Section */}
//             <div className="text-center space-y-4">
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
//                 AI-Powered Market Intelligence
//               </h1>
//               <p className="text-slate-500 text-lg">
//                 Get instant insights on pricing, competition, and sales forecasts for both Amazon & Flipkart
//               </p>
//               {userEmail ? (
//                 <p className="text-sm text-green-600 font-medium">
//                   ✓ Logged in as: {userEmail} (Analysis will be saved)
//                 </p>
//               ) : (
//                 <p className="text-sm text-orange-600 font-medium">
//                   ⚠️ Not logged in - Analysis won't be saved
//                 </p>
//               )}
//             </div>

//             {/* Input Form */}
//             <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle className="text-lg font-semibold text-slate-700">Product Information</CardTitle>
//                     <CardDescription className="text-slate-500">
//                       Enter your product details to get AI-powered market insights from {source === "amazon" ? "Amazon" : "Flipkart"}
//                     </CardDescription>
//                   </div>
//                   <a
//                     href="/product-tracker/history"
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors duration-200"
//                   >
//                     <History className="h-4 w-4" />
//                     <span className="hidden sm:inline font-medium">Analytics History</span>
//                   </a>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Product Name */}
//                   <div className="space-y-2">
//                     <Label htmlFor="product-name">Product Name</Label>
//                     <Input id="product-name" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., Wireless Headphones" />
//                   </div>

//                   {/* Category */}
//                   <div className="space-y-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select value={category} onValueChange={setCategory}>
//                       <SelectTrigger id="category">
//                         <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.length === 0 ? (
//                           <SelectItem value="disabled" disabled>No categories available</SelectItem>
//                         ) : (
//                           categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Source */}
//                   <div className="space-y-2">
//                     <Label htmlFor="source">Marketplace</Label>
//                     <Select value={source} onValueChange={setSource}>
//                       <SelectTrigger id="source">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="amazon">
//                           <div className="flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon
//                           </div>
//                         </SelectItem>
//                         <SelectItem value="flipkart">
//                           <div className="flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart
//                           </div>
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Base Cost */}
//                   <div className="space-y-2">
//                     <Label htmlFor="base-cost">Your Cost Price (₹)</Label>
//                     <Input id="base-cost" type="number" value={baseCost} onChange={e => setBaseCost(e.target.value)} placeholder="e.g., 500" />
//                   </div>
//                 </div>

//                 <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
//                   {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing {source} Market...</> : <><Target className="h-4 w-4 mr-2" />Analyze on {source}</>}
//                 </Button>
//               </CardContent>
//             </Card>

//              {/* Results */}
//              {result && (
//               <div className="space-y-6">
//                 {/* Source Badge */}
//                 <div className="flex justify-center">
//                   <Badge className={`${getSourceColor(result.source)} text-base px-4 py-2`}>
//                     📊 Analysis for {result.source}
//                   </Badge>
//                 </div>

//                 {/* Warnings */}
//                 {result.warnings && result.warnings.length > 0 && (
//                   <Alert className={result.warnings[0].includes("✅") ? "border-green-300 bg-green-50" : result.warnings[0].includes("🚨") ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}>
//                     <AlertTriangle className="h-4 w-4" />
//                     <AlertDescription>
//                       <ul className="space-y-1">
//                         {result.warnings.map((warning, idx) => (
//                           <li key={idx} className="text-sm">{warning}</li>
//                         ))}
//                       </ul>
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 {/* Pricing Insights */}
//                 <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                         Pricing Strategy
//                       </CardTitle>
//                       <div className="flex gap-2">
//                         <Badge className={getSourceColor(result.source)}>
//                           {result.source}
//                         </Badge>
//                         <Badge className={getConfidenceBadgeColor(result.pricing.confidence)}>
//                           {result.pricing.confidence} Confidence
//                         </Badge>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
//                         <p className="text-sm text-slate-600 mb-1">Recommended Price</p>
//                         <p className="text-3xl font-bold text-blue-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
//                       </div>
                      
//                       <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
//                         <p className="text-sm text-slate-600 mb-1">Price Range</p>
//                         <p className="text-xl font-semibold text-slate-700">
//                           ₹{result.pricing.min_price.toLocaleString()} - ₹{result.pricing.max_price.toLocaleString()}
//                         </p>
//                       </div>
                      
//                       <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
//                         <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
//                         <p className="text-3xl font-bold text-green-600">{result.pricing.profit_margin.toFixed(1)}%</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Sales & Demand */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <TrendingUp className="h-5 w-5 text-purple-600" />
//                         Sales Forecast
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div>
//                         <p className="text-sm text-slate-600 mb-1">Estimated Monthly Sales</p>
//                         <p className="text-2xl font-bold text-slate-900">{result.sales.estimated_monthly_sales} units</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-slate-600 mb-1">Daily Average</p>
//                         <p className="text-xl font-semibold text-slate-700">{result.sales.estimated_daily_sales.toFixed(0)} units/day</p>
//                       </div>
//                       <Badge className={getDemandBadgeColor(result.sales.market_demand)}>
//                         {result.sales.market_demand} Demand
//                       </Badge>
//                     </CardContent>
//                   </Card>

//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <Users className="h-5 w-5 text-orange-600" />
//                         Competition Analysis
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Total Competitors</span>
//                         <span className="text-xl font-bold text-slate-900">{result.competition.total_competitors}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Avg Price</span>
//                         <span className="text-lg font-semibold text-slate-700">₹{result.competition.avg_competitor_price.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Avg Rating</span>
//                         <span className="text-lg font-semibold text-slate-700">{result.competition.avg_competitor_rating.toFixed(1)}★</span>
//                       </div>
                      
//                       {result.competition.top_competitor && (
//                         <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
//                           <p className="text-xs font-semibold text-orange-800 mb-2">Top Competitor on {result.source}</p>
//                           <p className="text-sm text-slate-700 mb-1 truncate">{result.competition.top_competitor.name}</p>
//                           <div className="flex gap-3 text-xs text-slate-600">
//                             <span>₹{result.competition.top_competitor.price.toLocaleString()}</span>
//                             <span>{result.competition.top_competitor.rating}★</span>
//                             <span>{result.competition.top_competitor.reviews.toLocaleString()} reviews</span>
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Location Insights */}
//                 {result.location_insights && result.location_insights.length > 0 && (
//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <MapPin className="h-5 w-5 text-red-600" />
//                         Market Distribution in India
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {result.location_insights.map((location, idx) => (
//                           <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200">
//                             <p className="font-semibold text-slate-900">{location.country}</p>
//                             <p className="text-2xl font-bold text-blue-600">{location.market_share}</p>
//                             <Badge variant="outline" className="mt-2">{location.demand_level} Demand</Badge>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 {/* AI Strategy */}
//                 <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                       <Lightbulb className="h-5 w-5 text-yellow-600" />
//                       AI-Powered Strategy for {result.source}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-slate-700 leading-relaxed whitespace-pre-line">{result.ai_strategy}</p>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useAuth } from "@/App"; 
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Target,
//   TrendingUp,
//   DollarSign,
//   Users,
//   MapPin,
//   AlertTriangle,
//   Lightbulb,
//   Menu,
//   X,
//   ShoppingBag,
//   CheckCircle2,
//   XCircle,
//   History,
// } from "lucide-react";
// import Sidebar from "@/components/layout/sidebar";

// interface AnalysisResult {
//   success: boolean;
//   product_name: string;
//   category: string;
//   source: string;
//   pricing: {
//     recommended_price: number;
//     min_price: number;
//     max_price: number;
//     profit_margin: number;
//     confidence: string;
//     market_avg_price: number;
//     market_min_price: number;
//     market_max_price: number;
//   };
//   sales: {
//     estimated_monthly_sales: string;
//     estimated_daily_sales: number;
//     market_demand: string;
//   };
//   competition: {
//     total_competitors: number;
//     avg_competitor_price: number;
//     avg_competitor_rating: number;
//     top_competitor: {
//       name: string;
//       price: number;
//       rating: number;
//       reviews: number;
//     } | null;
//   };
//   location_insights: Array<{
//     country: string;
//     market_share: string;
//     demand_level: string;
//   }>;
//   ai_strategy: string;
//   warnings: string[];
// }

// interface Toast {
//   id: number;
//   title: string;
//   description: string;
//   variant: "success" | "error";
// }

// export default function ProductTracker() {
//   const { user, isLoading } = useAuth();
//   const userEmail = user?.email || "";
//   const [productName, setProductName] = useState("");
//   const [category, setCategory] = useState("");
//   const [categories, setCategories] = useState<string[]>([]);
//   const [source, setSource] = useState("amazon");
//   const [baseCost, setBaseCost] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<AnalysisResult | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [toasts, setToasts] = useState<Toast[]>([]);


//   // Fetch Categories
//   const fetchCategories = async (src: string) => {
//     try {
//       const res = await fetch(`https://api.insydz.com/categories?table=${src}`);
//       const data = await res.json();
//       const cats = data.map((c: any) => c.category);
//       setCategories(cats);
//       if (!cats.includes(category)) setCategory("");
//     } catch (err) {
//       console.error("Failed to fetch categories:", err);
//       setCategories([]);
//       setCategory("");
//     }
//   };

//   useEffect(() => {
//     fetchCategories(source);
//   }, [source]);

//   // Toasts
//   const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
//     const id = Date.now();
//     setToasts(prev => [...prev, { id, title, description, variant }]);
//     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
//   };

//   const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

//   // Handle Analyze
//   const handleAnalyze = async () => {
//     if (!productName || !category || !baseCost) {
//       showToast("Missing Information", "Please fill in all fields to analyze your product.", "error");
//       return;
//     }

//     const cost = parseFloat(baseCost);
//     if (isNaN(cost) || cost <= 0) {
//       showToast("Invalid Cost", "Please enter a valid cost price.", "error");
//       return;
//     }

//     if (cost > 50000) {
//       const confirmProceed = window.confirm(
//         `⚠️ Warning: Your cost is ₹${cost.toLocaleString()}. This seems very high. Are you sure this is correct?\n\n` +
//         `Common mistakes:\n• Did you accidentally add extra zeros?\n• Is this the cost per unit (not per carton)?`
//       );
//       if (!confirmProceed) return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       const requestBody = {
//         product_name: productName,
//         category,
//         source,
//         base_cost: cost,
//         user_email: userEmail || null
//       };

//       console.log("📤 Sending request to backend:", requestBody);

//       const response = await fetch("https://api.insydz.com/product-tracker/analyze", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         const errorMsg = data.detail || "Analysis failed";
//         showToast("Analysis Failed", errorMsg, "error");
//         throw new Error(errorMsg);
//       }

//       setResult(data);
      
//       if (userEmail) {
//         showToast(
//           "Analysis Complete!", 
//           `Your ${data.source} product analyzed & saved to ${userEmail}`, 
//           "success"
//         );
//       } else {
//         showToast(
//           "Analysis Complete!", 
//           `Analysis done! Login to save history.`, 
//           "success"
//         );
//       }

//       setTimeout(() => window.scrollTo({ top: 500, behavior: 'smooth' }), 100);

//     } catch (error: any) {
//       console.error("Analysis error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Badge Helpers
//   const getConfidenceBadgeColor = (confidence: string) => {
//     switch (confidence.toLowerCase()) {
//       case "high": return "bg-green-100 text-green-800 border-green-300";
//       case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       case "critical": return "bg-red-100 text-red-800 border-red-300";
//       default: return "bg-red-100 text-red-800 border-red-300";
//     }
//   };

//   const getDemandBadgeColor = (demand: string) => {
//     switch (demand.toLowerCase()) {
//       case "high": return "bg-emerald-100 text-emerald-800 border-emerald-300";
//       case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
//       default: return "bg-slate-100 text-slate-800 border-slate-300";
//     }
//   };

//   const getSourceColor = (src: string) =>
//     src.toLowerCase() === "amazon"
//       ? "bg-orange-100 text-orange-800 border-orange-300"
//       : "bg-yellow-100 text-yellow-800 border-yellow-300";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">
//       {/* Toasts */}
//       <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
//         {toasts.map(t => (
//           <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-md animate-in slide-in-from-right ${
//             t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
//           }`}>
//             {t.variant === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
//             <div className="flex-1 min-w-0">
//               <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
//               <p className={`text-sm mt-1 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
//             </div>
//             <button onClick={() => removeToast(t.id)} className={`${t.variant === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`}>
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Mobile Menu Button */}
//       <button
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 rounded-xl shadow-md"
//         onClick={() => setIsMobileMenuOpen(true)}
//       >
//         <Menu className="w-6 h-6 text-slate-700" />
//       </button>

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
//         <Sidebar />
//       </aside>

//       {/* Mobile Sidebar Overlay */}
//       {isMobileMenuOpen && (
//         <>
//           <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300" style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}>
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}

//       {/* MAIN CONTENT */}
//       <div className="lg:ml-64 transition-all min-h-screen">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
//           <div className="flex items-center gap-3">
//             <Target className="h-8 w-8 text-blue-600" />
//             <div>
//               <h2 className="text-2xl font-semibold text-slate-800">Product Radar</h2>
//               <p className="text-sm text-slate-500">Analyze market opportunities for Amazon & Flipkart</p>
//             </div>
//           </div>
//         </header>

//         <div className="p-6">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Title Section */}
//             <div className="text-center space-y-4">
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
//                 AI-Powered Market Intelligence
//               </h1>
//               <p className="text-slate-500 text-lg">
//                 Get instant insights on pricing, competition, and sales forecasts for both Amazon & Flipkart
//               </p>
//               {isLoading ? (
//   <p className="text-sm text-gray-500 font-medium">Checking session...</p>
// ) : userEmail ? (
//   <p className="text-sm text-green-600 font-medium">
//     ✓ Logged in as: {userEmail} (Analysis will be saved)
//   </p>
// ) : (
//   <p className="text-sm text-orange-600 font-medium">
//     ⚠️ Not logged in - Analysis won't be saved
//   </p>
// )}

//             </div>

//             {/* Input Form */}
//             <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle className="text-lg font-semibold text-slate-700">Product Information</CardTitle>
//                     <CardDescription className="text-slate-500">
//                       Enter your product details to get AI-powered market insights from {source === "amazon" ? "Amazon" : "Flipkart"}
//                     </CardDescription>
//                   </div>
//                   <a
//                     href="/product-tracker/history"
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors duration-200"
//                   >
//                     <History className="h-4 w-4" />
//                     <span className="hidden sm:inline font-medium">Analytics History</span>
//                   </a>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Product Name */}
//                   <div className="space-y-2">
//                     <Label htmlFor="product-name">Product Name</Label>
//                     <Input id="product-name" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., Wireless Headphones" />
//                   </div>

//                   {/* Category */}
//                   <div className="space-y-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select value={category} onValueChange={setCategory}>
//                       <SelectTrigger id="category">
//                         <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.length === 0 ? (
//                           <SelectItem value="disabled" disabled>No categories available</SelectItem>
//                         ) : (
//                           categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Source */}
//                   <div className="space-y-2">
//                     <Label htmlFor="source">Marketplace</Label>
//                     <Select value={source} onValueChange={setSource}>
//                       <SelectTrigger id="source">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="amazon">
//                           <div className="flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon
//                           </div>
//                         </SelectItem>
//                         <SelectItem value="flipkart">
//                           <div className="flex items-center gap-2">
//                             <ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart
//                           </div>
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Base Cost */}
//                   <div className="space-y-2">
//                     <Label htmlFor="base-cost">Your Cost Price (₹)</Label>
//                     <Input id="base-cost" type="number" value={baseCost} onChange={e => setBaseCost(e.target.value)} placeholder="e.g., 500" />
//                   </div>
//                 </div>

//                 <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
//                   {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing {source} Market...</> : <><Target className="h-4 w-4 mr-2" />Analyze on {source}</>}
//                 </Button>
//               </CardContent>
//             </Card>

//              {/* Results */}
//              {result && (
//               <div className="space-y-6">
//                 {/* Source Badge */}
//                 <div className="flex justify-center">
//                   <Badge className={`${getSourceColor(result.source)} text-base px-4 py-2`}>
//                     📊 Analysis for {result.source}
//                   </Badge>
//                 </div>

//                 {/* Warnings */}
//                 {result.warnings && result.warnings.length > 0 && (
//                   <Alert className={result.warnings[0].includes("✅") ? "border-green-300 bg-green-50" : result.warnings[0].includes("🚨") ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}>
//                     <AlertTriangle className="h-4 w-4" />
//                     <AlertDescription>
//                       <ul className="space-y-1">
//                         {result.warnings.map((warning, idx) => (
//                           <li key={idx} className="text-sm">{warning}</li>
//                         ))}
//                       </ul>
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 {/* Pricing Insights */}
//                 <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                         Pricing Strategy
//                       </CardTitle>
//                       <div className="flex gap-2">
//                         <Badge className={getSourceColor(result.source)}>
//                           {result.source}
//                         </Badge>
//                         <Badge className={getConfidenceBadgeColor(result.pricing.confidence)}>
//                           {result.pricing.confidence} Confidence
//                         </Badge>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
//                         <p className="text-sm text-slate-600 mb-1">Recommended Price</p>
//                         <p className="text-3xl font-bold text-blue-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
//                       </div>
                      
//                       <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
//                         <p className="text-sm text-slate-600 mb-1">Price Range</p>
//                         <p className="text-xl font-semibold text-slate-700">
//                           ₹{result.pricing.min_price.toLocaleString()} - ₹{result.pricing.max_price.toLocaleString()}
//                         </p>
//                       </div>
                      
//                       <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
//                         <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
//                         <p className="text-3xl font-bold text-green-600">{result.pricing.profit_margin.toFixed(1)}%</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Sales & Demand */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <TrendingUp className="h-5 w-5 text-purple-600" />
//                         Sales Forecast
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div>
//                         <p className="text-sm text-slate-600 mb-1">Estimated Monthly Sales</p>
//                         <p className="text-2xl font-bold text-slate-900">{result.sales.estimated_monthly_sales} units</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-slate-600 mb-1">Daily Average</p>
//                         <p className="text-xl font-semibold text-slate-700">{result.sales.estimated_daily_sales.toFixed(0)} units/day</p>
//                       </div>
//                       <Badge className={getDemandBadgeColor(result.sales.market_demand)}>
//                         {result.sales.market_demand} Demand
//                       </Badge>
//                     </CardContent>
//                   </Card>

//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <Users className="h-5 w-5 text-orange-600" />
//                         Competition Analysis
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Total Competitors</span>
//                         <span className="text-xl font-bold text-slate-900">{result.competition.total_competitors}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Avg Price</span>
//                         <span className="text-lg font-semibold text-slate-700">₹{result.competition.avg_competitor_price.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-sm text-slate-600">Avg Rating</span>
//                         <span className="text-lg font-semibold text-slate-700">{result.competition.avg_competitor_rating.toFixed(1)}★</span>
//                       </div>
                      
//                       {result.competition.top_competitor && (
//                         <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
//                           <p className="text-xs font-semibold text-orange-800 mb-2">Top Competitor on {result.source}</p>
//                           <p className="text-sm text-slate-700 mb-1 truncate">{result.competition.top_competitor.name}</p>
//                           <div className="flex gap-3 text-xs text-slate-600">
//                             <span>₹{result.competition.top_competitor.price.toLocaleString()}</span>
//                             <span>{result.competition.top_competitor.rating}★</span>
//                             <span>{result.competition.top_competitor.reviews.toLocaleString()} reviews</span>
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Location Insights */}
//                 {result.location_insights && result.location_insights.length > 0 && (
//                   <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                         <MapPin className="h-5 w-5 text-red-600" />
//                         Market Distribution in India
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {result.location_insights.map((location, idx) => (
//                           <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200">
//                             <p className="font-semibold text-slate-900">{location.country}</p>
//                             <p className="text-2xl font-bold text-blue-600">{location.market_share}</p>
//                             <Badge variant="outline" className="mt-2">{location.demand_level} Demand</Badge>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 {/* AI Strategy */}
//                 <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
//                       <Lightbulb className="h-5 w-5 text-yellow-600" />
//                       AI-Powered Strategy for {result.source}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-slate-700 leading-relaxed whitespace-pre-line">{result.ai_strategy}</p>
//                   </CardContent>
//                 </Card>
//                  {/* Disclaimer */}
//           <div className="mt-1 pt-1 border-t border-slate-100">
//             <p className="text-[10px] text-center text-slate-400 leading-tight opacity-60">
//               <span className="font-medium">Disclaimer:</span> The data and insights presented in this dashboard are for informational purposes only. 
//               While we strive for accuracy, we cannot guarantee the completeness or reliability of the information. 
//               Please verify critical data independently before making business decisions.
//             </p>
//           </div>
                  
              
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/App"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Menu,
  X,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  History,
  Crown,
  Lock,
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

interface AnalysisResult {
  success: boolean;
  product_name: string;
  category: string;
  source: string;
  pricing: {
    recommended_price: number;
    min_price: number;
    max_price: number;
    profit_margin: number;
    confidence: string;
    market_avg_price: number;
    market_min_price: number;
    market_max_price: number;
  };
  sales: {
    estimated_monthly_sales: string;
    estimated_daily_sales: number;
    market_demand: string;
  };
  competition: {
    total_competitors: number;
    avg_competitor_price: number;
    avg_competitor_rating: number;
    top_competitor: {
      name: string;
      price: number;
      rating: number;
      reviews: number;
    } | null;
  };
  location_insights: Array<{
    country: string;
    market_share: string;
    demand_level: string;
  }>;
  ai_strategy: string;
  warnings: string[];
}

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

interface UsageLimits {
  count: number;
  limit: number;
  remaining: number;
  subscription_tier: string;
}

export default function ProductTracker() {
  const { user, isLoading } = useAuth();
  const userEmail = user?.email || "";
  const userId = user?.id;
  
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [source, setSource] = useState("amazon");
  const [baseCost, setBaseCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // ✅ NEW: Usage tracking states
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ✅ Fetch usage limits on component mount
  useEffect(() => {
    if (userId) {
      fetchUsageLimits();
    }
  }, [userId]);

  // ✅ Fetch current usage limits
  const fetchUsageLimits = async () => {
    if (!userId) return;
    
    setLoadingUsage(true);
    try {
      const response = await fetch(`https://api.insydz.com/users/${userId}/analysis-usage`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsageLimits({
          count: data.count,
          limit: data.limit === -1 ? Infinity : data.limit,
          remaining: data.remaining === -1 ? Infinity : data.remaining,
          subscription_tier: data.subscription_tier
        });
      }
    } catch (error) {
      console.error("Failed to fetch usage limits:", error);
    } finally {
      setLoadingUsage(false);
    }
  };

  // ✅ Check if user can analyze
  const canAnalyze = usageLimits 
    ? usageLimits.limit === Infinity || usageLimits.count < usageLimits.limit
    : true; // Allow if not logged in

  // ✅ Get tier-based limits for display
  const getTierLimits = (tier: string) => {
    const limits: Record<string, number> = {
      'free': 5,
      'basic': 20,
      'premium': Infinity,
      'enterprise': Infinity
    };
    return limits[tier.toLowerCase()] || 5;
  };

  // ✅ Get upgrade message
  const getUpgradeMessage = () => {
    if (!usageLimits) return "";
    
    const tier = usageLimits.subscription_tier.toLowerCase();
    if (tier === 'free') {
      return "Upgrade to Basic for 20 analyses per month";
    } else if (tier === 'basic') {
      return "Upgrade to Premium for unlimited analyses";
    }
    return "Upgrade for more features";
  };

  // Fetch Categories
  const fetchCategories = async (src: string) => {
    try {
      const res = await fetch(`https://api.insydz.com/categories?table=${src}`);
      const data = await res.json();
      const cats = data.map((c: any) => c.category);
      setCategories(cats);
      if (!cats.includes(category)) setCategory("");
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
      setCategory("");
    }
  };

  useEffect(() => {
    fetchCategories(source);
  }, [source]);

  // Toasts
  const showToast = (title: string, description: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // Handle Analyze
  const handleAnalyze = async () => {
    // ✅ Check if user has reached limit
    if (userId && !canAnalyze) {
      setShowUpgradeModal(true);
      showToast(
        "Analysis Limit Reached", 
        `You've used all ${usageLimits?.limit} analyses this month. Upgrade for more!`,
        "error"
      );
      return;
    }

    if (!productName || !category || !baseCost) {
      showToast("Missing Information", "Please fill in all fields to analyze your product.", "error");
      return;
    }

    const cost = parseFloat(baseCost);
    if (isNaN(cost) || cost <= 0) {
      showToast("Invalid Cost", "Please enter a valid cost price.", "error");
      return;
    }

    if (cost > 50000) {
      const confirmProceed = window.confirm(
        `⚠️ Warning: Your cost is ₹${cost.toLocaleString()}. This seems very high. Are you sure this is correct?\n\n` +
        `Common mistakes:\n• Did you accidentally add extra zeros?\n• Is this the cost per unit (not per carton)?`
      );
      if (!confirmProceed) return;
    }

    setLoading(true);
    setResult(null);

    try {
      const requestBody = {
        product_name: productName,
        category,
        source,
        base_cost: cost,
        user_email: userEmail || null
      };

      console.log("📤 Sending request to backend:", requestBody);

      const response = await fetch("https://api.insydz.com/product-tracker/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || "Analysis failed";
        
        // ✅ Check if it's a limit error
        if (response.status === 403 && errorMsg.includes("limit")) {
          setShowUpgradeModal(true);
        }
        
        showToast("Analysis Failed", errorMsg, "error");
        throw new Error(errorMsg);
      }

      setResult(data);
      
      // ✅ Refresh usage limits after successful analysis
      if (userId) {
        await fetchUsageLimits();
      }
      
      if (userEmail) {
        showToast(
          "Analysis Complete!", 
          `Your ${data.source} product analyzed & saved to ${userEmail}`, 
          "success"
        );
      } else {
        showToast(
          "Analysis Complete!", 
          `Analysis done! Login to save history.`, 
          "success"
        );
      }

      setTimeout(() => window.scrollTo({ top: 500, behavior: 'smooth' }), 100);

    } catch (error: any) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Badge Helpers
  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high": return "bg-green-100 text-green-800 border-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-red-100 text-red-800 border-red-300";
    }
  };

  const getDemandBadgeColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case "high": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getSourceColor = (src: string) =>
    src.toLowerCase() === "amazon"
      ? "bg-orange-100 text-orange-800 border-orange-300"
      : "bg-yellow-100 text-yellow-800 border-yellow-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">
      {/* ✅ Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Analysis Limit Reached</h3>
              <p className="text-slate-600 mb-4">
                You've used all <span className="font-bold text-red-600">{usageLimits?.limit}</span> product analyses this month on the <span className="font-semibold">{usageLimits?.subscription_tier.toUpperCase()}</span> plan.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {getUpgradeMessage()}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => window.location.href = "/subscription"}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 backdrop-blur-md animate-in slide-in-from-right ${
            t.variant === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}>
            {t.variant === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${t.variant === "success" ? "text-green-900" : "text-red-900"}`}>{t.title}</p>
              <p className={`text-sm mt-1 ${t.variant === "success" ? "text-green-700" : "text-red-700"}`}>{t.description}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className={`${t.variant === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 rounded-xl shadow-md"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform duration-300">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64 transition-all min-h-screen">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">Product Radar</h2>
              <p className="text-sm text-slate-500">Analyze market opportunities for Amazon & Flipkart</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Title Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                AI-Powered Market Intelligence
              </h1>
              <p className="text-slate-500 text-lg">
                Get instant insights on pricing, competition, and sales forecasts for both Amazon & Flipkart
              </p>
              
              {/* ✅ User Status & Usage Display */}
              {isLoading ? (
                <p className="text-sm text-gray-500 font-medium">Checking session...</p>
              ) : userEmail ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Logged in as: {userEmail} (Analysis will be saved)
                  </p>
                  
                  {/* ✅ Usage Stats Card */}
                  {usageLimits && (
                    <div className="bg-white rounded-xl p-4 max-w-md mx-auto border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600 font-medium">Analyses This Month</p>
                        <Badge className="bg-blue-100 text-blue-800">
                          {usageLimits.subscription_tier.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-3 mr-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              !canAnalyze ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}
                            style={{ 
                              width: usageLimits.limit === Infinity 
                                ? '100%' 
                                : `${Math.min((usageLimits.count / usageLimits.limit) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {usageLimits.count} / {usageLimits.limit === Infinity ? '∞' : usageLimits.limit}
                        </span>
                      </div>
                      
                      {!canAnalyze && usageLimits.limit !== Infinity && (
                        <Alert className="border-red-300 bg-red-50 mt-3">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-xs text-red-700">
                            Limit reached! <a href="/subscription" className="underline font-semibold">Upgrade</a> for more analyses.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {canAnalyze && usageLimits.remaining !== Infinity && usageLimits.remaining <= 2 && (
                        <p className="text-xs text-orange-600 font-medium mt-2">
                          ⚠️ Only {usageLimits.remaining} analyses remaining
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Not logged in - Analysis won't be saved and limits won't apply
                </p>
              )}
            </div>

            {/* Input Form */}
            <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-700">Product Information</CardTitle>
                    <CardDescription className="text-slate-500">
                      Enter your product details to get AI-powered market insights from {source === "amazon" ? "Amazon" : "Flipkart"}
                    </CardDescription>
                  </div>
                  <a
                    href="/product-tracker/history"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors duration-200"
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Analytics History</span>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input 
                      id="product-name" 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)} 
                      placeholder="e.g., Wireless Headphones"
                      disabled={!!userId && !canAnalyze}

                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={category} 
                      onValueChange={setCategory}
                      disabled={!!userId && !canAnalyze}

                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="disabled" disabled>No categories available</SelectItem>
                        ) : (
                          categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source */}
                  <div className="space-y-2">
                    <Label htmlFor="source">Marketplace</Label>
                    <Select 
                      value={source} 
                      onValueChange={setSource}
                      disabled={!!userId && !canAnalyze}

                    >
                      <SelectTrigger id="source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amazon">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon
                          </div>
                        </SelectItem>
                        <SelectItem value="flipkart">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Base Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="base-cost">Your Cost Price (₹)</Label>
                    <Input 
                      id="base-cost" 
                      type="number" 
                      value={baseCost} 
                      onChange={e => setBaseCost(e.target.value)} 
                      placeholder="e.g., 500"
                      disabled={!!userId && !canAnalyze}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading || (!!userId && !canAnalyze)}

                  className={`w-full ${
                    userId && !canAnalyze
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing {source} Market...
                    </>
                  ) : userId && !canAnalyze ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Limit Reached - Upgrade to Continue
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Analyze on {source}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <div className="space-y-6">
                {/* Source Badge */}
                <div className="flex justify-center">
                  <Badge className={`${getSourceColor(result.source)} text-base px-4 py-2`}>
                    📊 Analysis for {result.source}
                  </Badge>
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <Alert className={result.warnings[0].includes("✅") ? "border-green-300 bg-green-50" : result.warnings[0].includes("🚨") ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="space-y-1">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pricing Insights */}
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Pricing Strategy
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getSourceColor(result.source)}>
                          {result.source}
                        </Badge>
                        <Badge className={getConfidenceBadgeColor(result.pricing.confidence)}>
                          {result.pricing.confidence} Confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-slate-600 mb-1">Recommended Price</p>
                        <p className="text-3xl font-bold text-blue-600">₹{result.pricing.recommended_price.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">Price Range</p>
                        <p className="text-xl font-semibold text-slate-700">
                          ₹{result.pricing.min_price.toLocaleString()} - ₹{result.pricing.max_price.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                        <p className="text-3xl font-bold text-green-600">{result.pricing.profit_margin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales & Demand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Sales Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Estimated Monthly Sales</p>
                        <p className="text-2xl font-bold text-slate-900">{result.sales.estimated_monthly_sales} units</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Daily Average</p>
                        <p className="text-xl font-semibold text-slate-700">{result.sales.estimated_daily_sales.toFixed(0)} units/day</p>
                      </div>
                      <Badge className={getDemandBadgeColor(result.sales.market_demand)}>
                        {result.sales.market_demand} Demand
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                        <Users className="h-5 w-5 text-orange-600" />
                        Competition Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Competitors</span>
                        <span className="text-xl font-bold text-slate-900">{result.competition.total_competitors}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Avg Price</span>
                        <span className="text-lg font-semibold text-slate-700">₹{result.competition.avg_competitor_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Avg Rating</span>
                        <span className="text-lg font-semibold text-slate-700">{result.competition.avg_competitor_rating.toFixed(1)}★</span>
                      </div>
                      
                      {result.competition.top_competitor && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-xs font-semibold text-orange-800 mb-2">Top Competitor on {result.source}</p>
                          <p className="text-sm text-slate-700 mb-1 truncate">{result.competition.top_competitor.name}</p>
                          <div className="flex gap-3 text-xs text-slate-600">
                            <span>₹{result.competition.top_competitor.price.toLocaleString()}</span>
                            <span>{result.competition.top_competitor.rating}★</span>
                            <span>{result.competition.top_competitor.reviews.toLocaleString()} reviews</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Location Insights */}
                {result.location_insights && result.location_insights.length > 0 && (
                  <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-white/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                        <MapPin className="h-5 w-5 text-red-600" />
                        Market Distribution in India
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {result.location_insights.map((location, idx) => (
                          <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200">
                            <p className="font-semibold text-slate-900">{location.country}</p>
                            <p className="text-2xl font-bold text-blue-600">{location.market_share}</p>
                            <Badge variant="outline" className="mt-2">{location.demand_level} Demand</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Strategy */}
                <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      AI-Powered Strategy for {result.source}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{result.ai_strategy}</p>
                  </CardContent>
                </Card>
                 {/* Disclaimer */}
          <div className="mt-1 pt-1 border-t border-slate-100">
            <p className="text-[10px] text-center text-slate-400 leading-tight opacity-60">
              <span className="font-medium">Disclaimer:</span> The data and insights presented in this dashboard are for informational purposes only. 
              While we strive for accuracy, we cannot guarantee the completeness or reliability of the information. 
              Please verify critical data independently before making business decisions.
            </p>
          </div>
                  
              
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}