
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Bot, Lightbulb, RefreshCw, Target, TrendingUp } from "lucide-react";
// import { useFilters } from "@/components/dashboard/FiltersContext";

// interface RecommendationCardProps {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   gradient: string;
// }

// function RecommendationCard({ icon, title, description, gradient }: RecommendationCardProps) {
//   return (
//     <div className={`bg-gradient-to-br ${gradient} rounded-lg p-4 text-white`}>
//       <div className="flex items-center mb-2">
//         {icon}
//         <h4 className="font-semibold ml-2">{title}</h4>
//       </div>
//       <p className="text-sm text-white/90 leading-relaxed">{description}</p>
//     </div>
//   );
// }

// export default function AIRecommendations({ selectedSource }: { selectedSource: string }) {
//   const { filters } = useFilters();
//   const [summary, setSummary] = useState<string>("");
//   const [recommendations, setRecommendations] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const BASE_URL = "https://api.insydz.com";

//   const fetchAIRecommendations = async () => {
//     setLoading(true);
//     try {
//       // Build natural language filter context
//       let filterContext = "";
//       const parts: string[] = [];
      
//       if (filters.category && filters.category !== "All Categories") {
//         parts.push(`${filters.category} products`);
//       }
      
//       if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) {
//         parts.push(`priced ₹${filters.priceRange[0].toLocaleString()}-₹${filters.priceRange[1].toLocaleString()}`);
//       }
      
//       if (filters.rating > 0) {
//         parts.push(`${filters.rating}+ star rating`);
//       }
      
//       if (filters.showTrendingOnly) {
//         parts.push("trending items");
//       }

//       filterContext = parts.length > 0 ? `Analyzing ${parts.join(", ")}. ` : "";

//       // Map sources properly
//       const sourceMap: Record<string, string> = {
//         flipkart: "flipkart",
//         amazon: "amazon",
//         rapidapi_amazon_products: "amazon",
//         both: "both",
//       };

//       const mappedSource = sourceMap[filters.table || selectedSource] || "flipkart";
//       const displaySource = mappedSource === "both" ? "Flipkart and Amazon" : 
//                            mappedSource === "amazon" ? "Amazon" : "Flipkart";

//       // Natural conversational prompt
//       const prompt = `${filterContext}You're analyzing ${displaySource} market data. 

// Provide a conversational business analysis in this format:

// 1) First, give an overall market summary in 1-2 sentences (mention specific patterns, price ranges, or quality trends you observe)

// 2) Then identify ONE specific opportunity or insight (mention actual product categories or price points)

// 3) Finally, provide ONE actionable strategic recommendation

// Be conversational and specific. Use natural language like you're advising a friend.`;

//       console.log("🤖 Fetching AI recommendations for:", mappedSource);

//       const res = await fetch(`${BASE_URL}/ai/query`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           question: prompt,
//           source: mappedSource === "both" ? "flipkart" : mappedSource,
//           filters: filters, // Send filters to backend
//         }),
//       });

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//       }

//       const json = await res.json();
//       const answer = json.answer || "";

//       console.log("✅ AI Answer received:", answer);

//       // Parse natural language response
//       // Try to split by numbered lists or natural breaks
//       const lines = answer
//         .split(/\n+/)
//         .map((l: string) => l.trim())
//         .filter((l: string) => {
//           // Remove numbering and clean
//           const cleaned = l.replace(/^[\d\)\.\-\•]+\s*/, '').trim();
//           return cleaned.length > 20; // Only keep substantial content
//         })
//         .map((l: string) => l.replace(/^[\d\)\.\-\•]+\s*/, '').trim());

//       if (lines.length >= 3) {
//         // Got all 3 parts
//         setSummary(lines[0]);
//         setRecommendations([lines[1], lines[2]]);
//       } else if (lines.length === 2) {
//         // Got 2 parts
//         setSummary(lines[0]);
//         setRecommendations([
//           lines[1],
//           `Focus on high-rated ${filters.category !== "All Categories" ? filters.category : "products"} to maximize customer trust and repeat purchases.`
//         ]);
//       } else if (lines.length === 1) {
//         // Got only summary
//         setSummary(lines[0]);
//         setRecommendations([
//           `Consider expanding into high-demand categories${filters.category !== "All Categories" ? ` beyond ${filters.category}` : ''} to capture more market share.`,
//           "Monitor competitor pricing and adjust strategy to maintain competitive advantage while preserving margins."
//         ]);
//       } else {
//         // Fallback - use entire response as summary
//         const fullText = answer.trim();
//         if (fullText.length > 50) {
//           setSummary(fullText.substring(0, 200) + (fullText.length > 200 ? "..." : ""));
//         } else {
//           setSummary(`${displaySource} market shows positive trends with strong customer engagement and competitive product offerings.`);
//         }
        
//         setRecommendations([
//           `Focus on ${filters.category !== "All Categories" ? filters.category : "top-performing"} products with 4+ stars to maximize conversion rates.`,
//           "Implement dynamic pricing based on real-time market analysis and competitor benchmarking."
//         ]);
//       }

//     } catch (err) {
//       console.error("❌ AI recommendation error:", err);
      
//       // Enhanced fallback with filter awareness
//       const categoryText = filters.category && filters.category !== "All Categories" 
//         ? ` in ${filters.category}` 
//         : "";
      
//       const priceText = filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000
//         ? ` within the ₹${filters.priceRange[0].toLocaleString()}-₹${filters.priceRange[1].toLocaleString()} range`
//         : "";

//       const ratingText = filters.rating > 0
//         ? ` with ${filters.rating}+ star ratings`
//         : "";

//       const sourceText = (filters.table || selectedSource) === "both"
//         ? "both Flipkart and Amazon"
//         : (filters.table || selectedSource) === "amazon" 
//         ? "Amazon"
//         : "Flipkart";

//       setSummary(
//         `Looking at ${sourceText}${categoryText}${priceText}${ratingText}, the market shows strong customer engagement with competitive pricing and consistent product quality. There's good demand across price segments with high-rated products leading sales.`
//       );
      
//       setRecommendations([
//         `Focus on high-performing products${categoryText}${ratingText || " with 4+ stars"} - they show 2-3x better conversion rates and stronger customer retention.`,
//         `Optimize pricing strategy${priceText ? " within your selected range" : ""} by monitoring competitor trends and adjusting for seasonal demand to maximize margins while staying competitive.`
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAIRecommendations();
//   }, [selectedSource, filters]);

//   const cardStyles = [
//     {
//       icon: <Target className="h-5 w-5" />,
//       gradient: "from-green-500 to-emerald-600",
//       title: "Key Opportunity",
//     },
//     {
//       icon: <TrendingUp className="h-5 w-5" />,
//       gradient: "from-blue-500 to-cyan-600",
//       title: "Action Plan",
//     },
//   ];

//   // Determine display source
//   const displaySource = 
//     (filters.table || selectedSource) === "both" ? "Both Platforms" :
//     (filters.table || selectedSource) === "amazon" ? "Amazon" :
//     "Flipkart";

//   return (
//     <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border mb-6">
//       <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
//         <div className="flex items-center">
//           <div className="p-3 bg-primary rounded-xl mr-4">
//             <Bot className="text-primary-foreground h-6 w-6" />
//           </div>
//           <div>
//             <CardTitle className="text-lg font-semibold">AI-Powered Insights</CardTitle>
//             <p className="text-sm text-muted-foreground">
//               Natural language analysis for{" "}
//               <span className="font-medium text-foreground">{displaySource}</span>
//               {filters.category && filters.category !== "All Categories" && (
//                 <span className="text-primary font-medium"> · {filters.category}</span>
//               )}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20">
//             🤖 NLP Powered
//           </Badge>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={fetchAIRecommendations}
//             disabled={loading}
//             title="Refresh insights"
//           >
//             <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//           </Button>
//         </div>
//       </CardHeader>

//       <CardContent className="p-0">
//         {/* Summary */}
//         <div className="mb-6 p-4 bg-white/70 dark:bg-black/20 rounded-lg border border-primary/10">
//           <h3 className="font-semibold mb-3 flex items-center text-base">
//             <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
//             Market Overview
//           </h3>
//           {loading ? (
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-4/5" />
//               <Skeleton className="h-4 w-3/4" />
//             </div>
//           ) : (
//             <p className="text-sm text-muted-foreground leading-relaxed">
//               {summary}
//             </p>
//           )}
//         </div>

//         {/* Recommendations */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {loading
//             ? Array.from({ length: 2 }).map((_, index) => (
//                 <div key={index} className="bg-white/70 rounded-lg p-4">
//                   <Skeleton className="h-5 w-5 mb-2" />
//                   <Skeleton className="h-4 w-32 mb-3" />
//                   <Skeleton className="h-3 w-full mb-2" />
//                   <Skeleton className="h-3 w-full mb-2" />
//                   <Skeleton className="h-3 w-2/3" />
//                 </div>
//               ))
//             : recommendations.map((rec, index) => (
//                 <RecommendationCard
//                   key={index}
//                   icon={cardStyles[index]?.icon || <Target className="h-5 w-5" />}
//                   title={cardStyles[index]?.title || `Insight ${index + 1}`}
//                   description={rec}
//                   gradient={cardStyles[index]?.gradient || "from-gray-500 to-gray-600"}
//                 />
//               ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Bot, Lightbulb, RefreshCw, Target, TrendingUp } from "lucide-react";
// import { useFilters } from "@/components/dashboard/FiltersContext";

// interface RecommendationCardProps {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   gradient: string;
// }

// function RecommendationCard({ icon, title, description, gradient }: RecommendationCardProps) {
//   return (
//     <div className={`bg-gradient-to-br ${gradient} rounded-lg p-4 text-white`}>
//       <div className="flex items-center mb-2">
//         {icon}
//         <h4 className="font-semibold ml-2">{title}</h4>
//       </div>
//       <p className="text-sm text-white/90 leading-relaxed">{description}</p>
//     </div>
//   );
// }

// export default function AIRecommendations({ selectedSource }: { selectedSource: string }) {
//   const { filters } = useFilters();
//   const [summary, setSummary] = useState<string>("");
//   const [recommendations, setRecommendations] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const BASE_URL = "https://api.insydz.com";

//   const fetchAIRecommendations = async () => {
//     setLoading(true);
//     try {
//       // Build natural language filter context
//       let filterContext = "";
//       const parts: string[] = [];
      
//       if (filters.category && filters.category !== "All Categories") {
//         parts.push(`${filters.category} products`);
//       }
      
//       if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) {
//         parts.push(`priced ₹${filters.priceRange[0].toLocaleString()}-₹${filters.priceRange[1].toLocaleString()}`);
//       }
      
//       if (filters.rating > 0) {
//         parts.push(`${filters.rating}+ star rating`);
//       }
      
//       if (filters.showTrendingOnly) {
//         parts.push("trending items");
//       }

//       filterContext = parts.length > 0 ? `Analyzing ${parts.join(", ")}. ` : "";

//       // Map sources properly
//       const sourceMap: Record<string, string> = {
//         flipkart: "flipkart",
//         amazon: "amazon",
//         rapidapi_amazon_products: "amazon",
//         both: "both",
//       };

//       const mappedSource = sourceMap[filters.table || selectedSource] || "flipkart";
//       const displaySource = mappedSource === "both" ? "Flipkart and Amazon" : 
//                            mappedSource === "amazon" ? "Amazon" : "Flipkart";

//       // Natural conversational prompt
//       const prompt = `${filterContext}You're analyzing ${displaySource} market data. 

// Provide a conversational business analysis in this format:

// 1) First, give an overall market summary in 1-2 sentences (mention specific patterns, price ranges, or quality trends you observe)

// 2) Then identify ONE specific opportunity or insight (mention actual product categories or price points)

// 3) Finally, provide ONE actionable strategic recommendation

// Be conversational and specific. Use natural language like you're advising a friend.`;

//       console.log("🤖 Fetching AI recommendations for:", mappedSource);

//       const res = await fetch(`${BASE_URL}/ai/query`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           question: prompt,
//           source: mappedSource === "both" ? "flipkart" : mappedSource,
//           filters: filters, // Send filters to backend
//         }),
//       });

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//       }

//       const json = await res.json();
//       const answer = json.answer || "";

//       console.log("✅ AI Answer received:", answer);

//       // Parse natural language response
//       // Try to split by numbered lists or natural breaks
//       const lines = answer
//         .split(/\n+/)
//         .map((l: string) => l.trim())
//         .filter((l: string) => {
//           // Remove numbering and clean
//           const cleaned = l.replace(/^[\d\)\.\-\•]+\s*/, '').trim();
//           return cleaned.length > 20; // Only keep substantial content
//         })
//         .map((l: string) => l.replace(/^[\d\)\.\-\•]+\s*/, '').trim());

//       if (lines.length >= 3) {
//         // Got all 3 parts
//         setSummary(lines[0]);
//         setRecommendations([lines[1], lines[2]]);
//       } else if (lines.length === 2) {
//         // Got 2 parts
//         setSummary(lines[0]);
//         setRecommendations([
//           lines[1],
//           `Focus on high-rated ${filters.category !== "All Categories" ? filters.category : "products"} to maximize customer trust and repeat purchases.`
//         ]);
//       } else if (lines.length === 1) {
//         // Got only summary
//         setSummary(lines[0]);
//         setRecommendations([
//           `Consider expanding into high-demand categories${filters.category !== "All Categories" ? ` beyond ${filters.category}` : ''} to capture more market share.`,
//           "Monitor competitor pricing and adjust strategy to maintain competitive advantage while preserving margins."
//         ]);
//       } else {
//         // Fallback - use entire response as summary
//         const fullText = answer.trim();
//         if (fullText.length > 50) {
//           setSummary(fullText.substring(0, 200) + (fullText.length > 200 ? "..." : ""));
//         } else {
//           setSummary(`${displaySource} market shows positive trends with strong customer engagement and competitive product offerings.`);
//         }
        
//         setRecommendations([
//           `Focus on ${filters.category !== "All Categories" ? filters.category : "top-performing"} products with 4+ stars to maximize conversion rates.`,
//           "Implement dynamic pricing based on real-time market analysis and competitor benchmarking."
//         ]);
//       }

//     } catch (err) {
//       console.error("❌ AI recommendation error:", err);
      
//       // Enhanced fallback with filter awareness
//       const categoryText = filters.category && filters.category !== "All Categories" 
//         ? ` in ${filters.category}` 
//         : "";
      
//       const priceText = filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000
//         ? ` within the ₹${filters.priceRange[0].toLocaleString()}-₹${filters.priceRange[1].toLocaleString()} range`
//         : "";

//       const ratingText = filters.rating > 0
//         ? ` with ${filters.rating}+ star ratings`
//         : "";

//       const sourceText = (filters.table || selectedSource) === "both"
//         ? "both Flipkart and Amazon"
//         : (filters.table || selectedSource) === "amazon" 
//         ? "Amazon"
//         : "Flipkart";

//       setSummary(
//         `Looking at ${sourceText}${categoryText}${priceText}${ratingText}, the market shows strong customer engagement with competitive pricing and consistent product quality. There's good demand across price segments with high-rated products leading sales.`
//       );
      
//       setRecommendations([
//         `Focus on high-performing products${categoryText}${ratingText || " with 4+ stars"} - they show 2-3x better conversion rates and stronger customer retention.`,
//         `Optimize pricing strategy${priceText ? " within your selected range" : ""} by monitoring competitor trends and adjusting for seasonal demand to maximize margins while staying competitive.`
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAIRecommendations();
//   }, [selectedSource, filters]);

//   const cardStyles = [
//     {
//       icon: <Target className="h-5 w-5" />,
//       gradient: "from-green-500 to-emerald-600",
//       title: "Key Opportunity",
//     },
//     {
//       icon: <TrendingUp className="h-5 w-5" />,
//       gradient: "from-blue-500 to-cyan-600",
//       title: "Action Plan",
//     },
//   ];

//   // Determine display source
//   const displaySource = 
//     (filters.table || selectedSource) === "both" ? "Both Platforms" :
//     (filters.table || selectedSource) === "amazon" ? "Amazon" :
//     "Flipkart";

//   return (
//     <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border mb-6">
//       <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
//         <div className="flex items-center">
//           <div className="p-3 bg-primary rounded-xl mr-4">
//             <Bot className="text-primary-foreground h-6 w-6" />
//           </div>
//           <div>
//             <CardTitle className="text-lg font-semibold">Decision Intelligence</CardTitle>
//             <p className="text-sm text-muted-foreground">
//               Natural language analysis for{" "}
//               <span className="font-medium text-foreground">{displaySource}</span>
//               {filters.category && filters.category !== "All Categories" && (
//                 <span className="text-primary font-medium"> · {filters.category}</span>
//               )}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20">
//             🤖 NLP Powered
//           </Badge>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={fetchAIRecommendations}
//             disabled={loading}
//             title="Refresh insights"
//           >
//             <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//           </Button>
//         </div>
//       </CardHeader>

//       <CardContent className="p-0">
//         {/* Summary */}
//         <div className="mb-6 p-4 bg-white/70 dark:bg-black/20 rounded-lg border border-primary/10">
//           <h3 className="font-semibold mb-3 flex items-center text-base">
//             <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
//             Market Overview
//           </h3>
//           {loading ? (
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-4/5" />
//               <Skeleton className="h-4 w-3/4" />
//             </div>
//           ) : (
//             <p className="text-sm text-muted-foreground leading-relaxed">
//               {summary}
//             </p>
//           )}
//         </div>

//         {/* Recommendations */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {loading
//             ? Array.from({ length: 2 }).map((_, index) => (
//                 <div key={index} className="bg-white/70 rounded-lg p-4">
//                   <Skeleton className="h-5 w-5 mb-2" />
//                   <Skeleton className="h-4 w-32 mb-3" />
//                   <Skeleton className="h-3 w-full mb-2" />
//                   <Skeleton className="h-3 w-full mb-2" />
//                   <Skeleton className="h-3 w-2/3" />
//                 </div>
//               ))
//             : recommendations.map((rec, index) => (
//                 <RecommendationCard
//                   key={index}
//                   icon={cardStyles[index]?.icon || <Target className="h-5 w-5" />}
//                   title={cardStyles[index]?.title || `Insight ${index + 1}`}
//                   description={rec}
//                   gradient={cardStyles[index]?.gradient || "from-gray-500 to-gray-600"}
//                 />
//               ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }




import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, RefreshCw, Target, TrendingUp, Lock, Crown, AlertCircle } from "lucide-react";
import { useFilters } from "@/components/dashboard/FiltersContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function RecommendationCard({ icon, title, description, gradient }: RecommendationCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-4 text-white`}>
      <div className="flex items-center mb-2">
        {icon}
        <h4 className="font-semibold ml-2">{title}</h4>
      </div>
      <p className="text-sm text-white/90 leading-relaxed">{description}</p>
    </div>
  );
}

export default function AIRecommendations({ selectedSource }: { selectedSource: string }) {
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const { trackAIChatUsage, canUseAIFeature, getAIUsage } = useSubscriptionSync();

  const hasAIRecommendations = canAccessFeature("hasChartAISummaries");

  const [summary, setSummary] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number; month: string } | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState(false);

  const BASE_URL = "https://api.insydz.com";

  // Load AI usage on mount
  useEffect(() => {
    const loadUsage = async () => {
      const usage = await getAIUsage();
      setAiUsage(usage);
      
      if (usage.limit !== Infinity && usage.used >= usage.limit) {
        setUsageLimitReached(true);
      }
    };
    
    if (hasAIRecommendations) {
      loadUsage();
    }
  }, [hasAIRecommendations]);

  const fetchAIRecommendations = async () => {
    const canUse = await canUseAIFeature();
    if (!canUse) {
      setUsageLimitReached(true);
      return;
    }

    setLoading(true);
    try {
      let filterContext = "";
      const parts: string[] = [];
      
      if (filters.category && filters.category !== "All Categories") {
        parts.push(`${filters.category} products`);
      }
      
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) {
        parts.push(`priced ₹${filters.priceRange[0].toLocaleString()}-₹${filters.priceRange[1].toLocaleString()}`);
      }
      
      if (filters.rating > 0) {
        parts.push(`${filters.rating}+ star rating`);
      }
      
      if (filters.showTrendingOnly) {
        parts.push("trending items");
      }

      filterContext = parts.length > 0 ? `Analyzing ${parts.join(", ")}. ` : "";

      const sourceMap: Record<string, string> = {
        flipkart: "flipkart",
        amazon: "amazon",
        rapidapi_amazon_products: "amazon",
        both: "both",
      };

      const mappedSource = sourceMap[filters.table || selectedSource] || "flipkart";
      const displaySource = mappedSource === "both" ? "Flipkart and Amazon" : 
                           mappedSource === "amazon" ? "Amazon" : "Flipkart";

      const prompt = `${filterContext}You're analyzing ${displaySource} market data. 

Provide a conversational business analysis in this format:

1) First, give an overall market summary in 1-2 sentences (mention specific patterns, price ranges, or quality trends you observe)

2) Then identify ONE specific opportunity or insight (mention actual product categories or price points)

3) Finally, provide ONE actionable strategic recommendation

Be conversational and specific. Use natural language like you're advising a friend.`;

      const res = await fetch(`${BASE_URL}/ai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          source: mappedSource === "both" ? "flipkart" : mappedSource,
          filters: filters,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const answer = json.answer || "";

      await trackAIChatUsage();
      
      const updatedUsage = await getAIUsage();
      setAiUsage(updatedUsage);
      
      if (updatedUsage.limit !== Infinity && updatedUsage.used >= updatedUsage.limit) {
        setUsageLimitReached(true);
      }

      const lines = answer
        .split(/\n+/)
        .map((l: string) => l.trim())
        .filter((l: string) => {
          const cleaned = l.replace(/^[\d\)\.\-\•]+\s*/, '').trim();
          return cleaned.length > 20;
        })
        .map((l: string) => l.replace(/^[\d\)\.\-\•]+\s*/, '').trim());

      if (lines.length >= 3) {
        setSummary(lines[0]);
        setRecommendations([lines[1], lines[2]]);
      } else if (lines.length === 2) {
        setSummary(lines[0]);
        setRecommendations([
          lines[1],
          `Focus on high-rated ${filters.category !== "All Categories" ? filters.category : "products"} to maximize customer trust.`
        ]);
      } else if (lines.length === 1) {
        setSummary(lines[0]);
        setRecommendations([
          `Consider expanding into high-demand categories${filters.category !== "All Categories" ? ` beyond ${filters.category}` : ''}.`,
          "Monitor competitor pricing and adjust strategy to maintain competitive advantage."
        ]);
      } else {
        const fullText = answer.trim();
        if (fullText.length > 50) {
          setSummary(fullText.substring(0, 200) + (fullText.length > 200 ? "..." : ""));
        } else {
          setSummary(`${displaySource} market shows positive trends with strong customer engagement.`);
        }
        
        setRecommendations([
          `Focus on ${filters.category !== "All Categories" ? filters.category : "top-performing"} products with 4+ stars.`,
          "Implement dynamic pricing based on real-time market analysis."
        ]);
      }

    } catch (err) {
      console.error("❌ AI recommendation error:", err);
      
      const categoryText = filters.category && filters.category !== "All Categories" 
        ? ` in ${filters.category}` 
        : "";
      
      const priceText = filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000
        ? ` within the ₹${filters.priceRange[0].toLocaleString()}-₹${filters.priceRange[1].toLocaleString()} range`
        : "";

      const ratingText = filters.rating > 0
        ? ` with ${filters.rating}+ star ratings`
        : "";

      const sourceText = (filters.table || selectedSource) === "both"
        ? "both Flipkart and Amazon"
        : (filters.table || selectedSource) === "amazon" 
        ? "Amazon"
        : "Flipkart";

      setSummary(
        `Looking at ${sourceText}${categoryText}${priceText}${ratingText}, the market shows strong customer engagement.`
      );
      
      setRecommendations([
        `Focus on high-performing products${categoryText}${ratingText || " with 4+ stars"}.`,
        `Optimize pricing strategy${priceText ? " within your selected range" : ""}.`
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAIRecommendations && !usageLimitReached) {
      fetchAIRecommendations();
    }
  }, [selectedSource, filters, hasAIRecommendations]);

  const cardStyles = [
    {
      icon: <Target className="h-5 w-5" />,
      gradient: "from-green-500 to-emerald-600",
      title: "Key Opportunity",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-600",
      title: "Action Plan",
    },
  ];

  const displaySource = 
    (filters.table || selectedSource) === "both" ? "Both Platforms" :
    (filters.table || selectedSource) === "amazon" ? "Amazon" :
    "Flipkart";

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border mb-6">
      <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
        <div className="flex items-center">
          <div className="p-3 bg-primary rounded-xl mr-4">
            <Bot className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Decision Intelligence</CardTitle>
            <p className="text-sm text-muted-foreground">
              Natural language analysis for{" "}
              <span className="font-medium text-foreground">{displaySource}</span>
              {filters.category && filters.category !== "All Categories" && (
                <span className="text-primary font-medium"> · {filters.category}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-blue-500/20">
            🤖 NLP Powered
          </Badge>

          {aiUsage && (
            <Badge variant={usageLimitReached ? "destructive" : "outline"} className="text-xs">
              {aiUsage.used}/{aiUsage.limit === Infinity ? "∞" : aiUsage.limit} Uses
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAIRecommendations}
            disabled={loading || usageLimitReached}
            title={usageLimitReached ? "Monthly limit reached" : "Refresh insights"}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!hasAIRecommendations ? (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  🤖 AI Business Advisor Locked
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Upgrade to {currentTier === "free" ? "Basic" : "Premium"} to unlock AI-powered recommendations.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-amber-400 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.location.href = "/subscription"}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        ) : usageLimitReached ? (
          <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  Monthly AI Limit Reached
                </p>
                <p className="text-sm text-red-700 mt-1">
                  You've used all {aiUsage?.limit} AI requests for this month. Upgrade for more!
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-red-400 text-red-700 hover:bg-red-100"
                  onClick={() => window.location.href = "/subscription"}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-white/70 dark:bg-black/20 rounded-lg border border-primary/10">
              <h3 className="font-semibold mb-3 flex items-center text-base">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                Market Overview
              </h3>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summary}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="bg-white/70 rounded-lg p-4">
                      <Skeleton className="h-5 w-5 mb-2" />
                      <Skeleton className="h-4 w-32 mb-3" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))
                : recommendations.map((rec, index) => (
                    <RecommendationCard
                      key={index}
                      icon={cardStyles[index]?.icon || <Target className="h-5 w-5" />}
                      title={cardStyles[index]?.title || `Insight ${index + 1}`}
                      description={rec}
                      gradient={cardStyles[index]?.gradient || "from-gray-500 to-gray-600"}
                    />
                  ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}