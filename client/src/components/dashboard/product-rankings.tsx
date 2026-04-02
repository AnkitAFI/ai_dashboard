
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { TrendingUp } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useFilters } from "@/components/dashboard/FiltersContext";
// import { useAISummary } from "@/hooks/useAISummary";

// interface TrendingProduct {
//   product_title?: string;
//   title?: string;
//   avg_rating?: number;
//   rating?: number;
//   star_rating?: number;
//   review_count?: number;
//   reviews?: number;
// }

// function ProductCard({
//   product,
//   index,
//   source,
// }: {
//   product: TrendingProduct;
//   index: number;
//   source: string;
// }) {
//   const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500"];
//   const gradients = [
//     "from-green-50 to-green-100",
//     "from-blue-50 to-blue-100",
//     "from-purple-50 to-purple-100",
//   ];

//   const productName = product.product_title || product.title || "Unknown Product";
//   const reviewCount = product.review_count || product.reviews || 0;
//   const rating = product.avg_rating || product.rating || product.star_rating || 0;

//   return (
//     <div
//       className={cn(
//         "flex items-center justify-between p-3 rounded-lg bg-gradient-to-r gap-3",
//         gradients[index % gradients.length]
//       )}
//     >
//       <div className="flex items-center space-x-3 flex-1 min-w-0">
//         <div
//           className={cn(
//             "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
//             colors[index % colors.length]
//           )}
//         >
//           {index + 1}
//         </div>
//         <div className="flex-1 min-w-0">
//           <p className="font-medium text-sm truncate" title={productName.replace(/"/g, "")}>
//             {productName.replace(/"/g, "")}
//           </p>
//           <p className="text-xs text-muted-foreground truncate">
//             {reviewCount} reviews • ⭐ {rating.toFixed(1)}
//           </p>
//         </div>
//       </div>
//       <div className="flex items-center gap-2 flex-shrink-0">
//         <Badge variant="outline" className="text-xs whitespace-nowrap">
//           {source === "flipkart" ? "Flipkart" : "Amazon"}
//         </Badge>
//         <TrendingUp className="h-5 w-5 text-green-600" />
//       </div>
//     </div>
//   );
// }

// export default function ProductRankings({
//   selectedSource,
// }: {
//   selectedSource: string;
// }) {
//   const BASE_URL = "http://localhost:8000";
//   const { filters } = useFilters();

//   const [flipkartProducts, setFlipkartProducts] = useState<TrendingProduct[]>([]);
//   const [amazonProducts, setAmazonProducts] = useState<TrendingProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const buildQueryParams = () => {
//     const params = new URLSearchParams();

//     if (filters.category && filters.category !== "All Categories") {
//       params.append("category", filters.category);
//     }

//     if (filters.priceRange[0] > 0) {
//       params.append("min_price", filters.priceRange[0].toString());
//     }
//     if (filters.priceRange[1] < 5000000) {
//       params.append("max_price", filters.priceRange[1].toString());
//     }

//     if (filters.rating > 0) {
//       params.append("min_rating", filters.rating.toString());
//     }

//     if (filters.dateRange !== "all") {
//       params.append("date_range", filters.dateRange);
//     }

//     if (filters.showTrendingOnly) {
//       params.append("trending_only", "true");
//     }

//     if (filters.sortBy) {
//       params.append("sort_by", filters.sortBy);
//     }

//     return params.toString();
//   };

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       setIsLoading(true);
//       try {
//         const table = filters.table || selectedSource;
//         const queryParams = buildQueryParams();
//         const topN = filters.topN || 10; // Use topN from filters

//         if (table === "both") {
//           // When showing both, split topN between sources (or use half for each)
//           const halfN = Math.ceil(topN / 2);
//           const [flipkartRes, amazonRes] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=flipkart&n=${halfN}&${queryParams}`),
//             fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${halfN}&${queryParams}`),
//           ]);

//           const [flipkartJson, amazonJson] = await Promise.all([
//             flipkartRes.json(),
//             amazonRes.json(),
//           ]);

//           setFlipkartProducts(flipkartJson.data || []);
//           setAmazonProducts(amazonJson.data || []);
//         } else if (table === "amazon_reviews") {
//           const res = await fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${queryParams}`);
//           const json = await res.json();
//           setFlipkartProducts([]);
//           setAmazonProducts(json.data || []);
//         } else {
//           const res = await fetch(`${BASE_URL}/top?table=flipkart&n=${topN}&${queryParams}`);
//           const json = await res.json();
//           setFlipkartProducts(json.data || []);
//           setAmazonProducts([]);
//         }
//       } catch (error) {
//         console.error("Error fetching trending products:", error);
//         setFlipkartProducts([]);
//         setAmazonProducts([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTrendingProducts();
//   }, [selectedSource, filters]);

//   const table = filters.table || selectedSource;
//   const showBoth = table === "both";
//   const isAmazon = table === "amazon_reviews";

//   const allProducts = showBoth
//     ? [...flipkartProducts, ...amazonProducts]
//     : isAmazon
//     ? amazonProducts
//     : flipkartProducts;

//   const question =
//     showBoth
//       ? "Compare top trending Flipkart and Amazon products with key performance differences."
//       : isAmazon
//       ? "Summarize key patterns and insights from top trending Amazon products."
//       : "Summarize key patterns and insights from top trending Flipkart products.";

//   const sourceTable = isAmazon
//     ? "rapidapi_amazon_products"
//     : table === "flipkart"
//     ? "flipkart"
//     : "combined_sources";

//   const { summary, loading: summaryLoading } = useAISummary(
//     question,
//     sourceTable,
//     allProducts,
//     allProducts.length,
//     filters
//   );

//   return (
//     <div className="grid grid-cols-1 gap-6 mb-8">
//       <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
//         <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
//           <CardTitle className="text-lg font-semibold">
//             {showBoth
//               ? "Top Trending Products (Both Sources)"
//               : isAmazon
//               ? "Top Trending Products (Amazon)"
//               : "Top Trending Products (Flipkart)"}
//           </CardTitle>
//           <Badge variant="secondary" className="text-xs">
//             Live Data
//           </Badge>
//         </CardHeader>

//         <CardContent className="p-0">
//           {summaryLoading ? (
//             <p className="text-sm text-muted-foreground mb-3">
//               Generating Smart summary...
//             </p>
//           ) : summary ? (
//             <p className="text-sm font-medium mb-3 p-3 bg-muted/50 rounded-lg">
//               {summary}
//             </p>
//           ) : null}

//           <div className="space-y-4">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 bg-muted rounded-lg"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <Skeleton className="w-8 h-8 rounded-full" />
//                     <div>
//                       <Skeleton className="h-4 w-32 mb-1" />
//                       <Skeleton className="h-3 w-20" />
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : showBoth ? (
//               <>
//                 {flipkartProducts.length > 0 && (
//                   <>
//                     <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
//                       Flipkart Top {flipkartProducts.length}
//                     </h3>
//                     {flipkartProducts.map((product, index) => (
//                       <ProductCard
//                         key={`flipkart-${index}`}
//                         product={product}
//                         index={index}
//                         source="flipkart"
//                       />
//                     ))}
//                   </>
//                 )}

//                 {amazonProducts.length > 0 && (
//                   <>
//                     <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
//                       Amazon Top {amazonProducts.length}
//                     </h3>
//                     {amazonProducts.map((product, index) => (
//                       <ProductCard
//                         key={`amazon-${index}`}
//                         product={product}
//                         index={index}
//                         source="amazon"
//                       />
//                     ))}
//                   </>
//                 )}
//               </>
//             ) : allProducts.length > 0 ? (
//               allProducts.map((product, index) => (
//                 <ProductCard
//                   key={index}
//                   product={product}
//                   index={index}
//                   source={isAmazon ? "amazon" : "flipkart"}
//                 />
//               ))
//             ) : (
//               <div className="text-center py-8 text-muted-foreground">
//                 <p>No trending products available</p>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { TrendingUp } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useFilters } from "@/components/dashboard/FiltersContext";
// import { useAISummary } from "@/hooks/useAISummary";

// interface TrendingProduct {
//   product_title?: string;
//   title?: string;
//   daily_sales?: number;
//   total_daily_sales?: number;
//   sales_volume?: string | number;
//   estimated_sales?: number;
//   avg_price?: number;
//   product_price?: number;
// }

// function ProductCard({
//   product,
//   index,
//   source,
// }: {
//   product: TrendingProduct;
//   index: number;
//   source: string;
// }) {
//   const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500"];
//   const gradients = [
//     "from-green-50 to-green-100",
//     "from-blue-50 to-blue-100",
//     "from-purple-50 to-purple-100",
//   ];

//   const productName = product.product_title || product.title || "Unknown Product";

//   // Get sales volume
//   const salesVolumeRaw = product.daily_sales || product.total_daily_sales || product.sales_volume || product.estimated_sales || 0;
//   const salesVolume = typeof salesVolumeRaw === 'string' 
//     ? parseFloat(salesVolumeRaw.replace(/[^0-9.]/g, '')) || 0 
//     : salesVolumeRaw;

//   const price = product.avg_price || product.product_price || 0;

//   return (
//     <div
//       className={cn(
//         "flex items-center justify-between p-3 rounded-lg bg-gradient-to-r gap-3",
//         gradients[index % gradients.length]
//       )}
//     >
//       <div className="flex items-center space-x-3 flex-1 min-w-0">
//         <div
//           className={cn(
//             "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
//             colors[index % colors.length]
//           )}
//         >
//           {index + 1}
//         </div>
//         <div className="flex-1 min-w-0">
//           <p className="font-medium text-sm truncate" title={productName.replace(/"/g, "")}>
//             {productName.replace(/"/g, "")}
//           </p>
//           <p className="text-xs text-muted-foreground truncate">
//             {Math.round(salesVolume).toLocaleString()} sales • ₹{price.toFixed(0)}
//           </p>
//         </div>
//       </div>
//       <div className="flex items-center gap-2 flex-shrink-0">
//         <Badge variant="outline" className="text-xs whitespace-nowrap">
//           {source === "flipkart" ? "Flipkart" : "Amazon"}
//         </Badge>
//         <TrendingUp className="h-5 w-5 text-green-600" />
//       </div>
//     </div>
//   );
// }

// export default function ProductRankings({
//   selectedSource,
// }: {
//   selectedSource: string;
// }) {
//   const BASE_URL = "http://localhost:8000";
//   const { filters } = useFilters();

//   const [flipkartProducts, setFlipkartProducts] = useState<TrendingProduct[]>([]);
//   const [amazonProducts, setAmazonProducts] = useState<TrendingProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const buildQueryParams = () => {
//     const params = new URLSearchParams();

//     if (filters.category && filters.category !== "All Categories") {
//       params.append("category", filters.category);
//     }

//     if (filters.priceRange[0] > 0) {
//       params.append("min_price", filters.priceRange[0].toString());
//     }
//     if (filters.priceRange[1] < 5000000) {
//       params.append("max_price", filters.priceRange[1].toString());
//     }

//     if (filters.rating > 0) {
//       params.append("min_rating", filters.rating.toString());
//     }

//     if (filters.dateRange !== "all") {
//       params.append("date_range", filters.dateRange);
//     }

//     if (filters.showTrendingOnly) {
//       params.append("trending_only", "true");
//     }

//     if (filters.sortBy) {
//       params.append("sort_by", filters.sortBy);
//     }

//     return params.toString();
//   };

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       setIsLoading(true);
//       try {
//         const table = filters.table || selectedSource;
//         const queryParams = buildQueryParams();
//         const topN = filters.topN || 10;

//         if (table === "both") {
//           const halfN = Math.ceil(topN / 2);
//           const [flipkartRes, amazonRes] = await Promise.all([
//             fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${halfN}&${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi/top-sales?limit=${halfN}&${queryParams}`),
//           ]);

//           const [flipkartJson, amazonJson] = await Promise.all([
//             flipkartRes.json(),
//             amazonRes.json(),
//           ]);

//           setFlipkartProducts(flipkartJson.data || []);
//           setAmazonProducts(amazonJson.data || []);
//         } else if (table === "amazon" || table === "rapidapi_amazon_products") {
//           const res = await fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`);
//           const json = await res.json();
//           setFlipkartProducts([]);
//           setAmazonProducts(json.data || []);
//         } else {
//           const res = await fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`);
//           const json = await res.json();
//           setFlipkartProducts(json.data || []);
//           setAmazonProducts([]);
//         }
//       } catch (error) {
//         console.error("Error fetching trending products:", error);
//         setFlipkartProducts([]);
//         setAmazonProducts([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTrendingProducts();
//   }, [selectedSource, filters]);

//   const table = filters.table || selectedSource;
//   const showBoth = table === "both";
//   const isAmazon = table === "amazon" || table === "rapidapi_amazon_products";

//   const allProducts = showBoth
//     ? [...flipkartProducts, ...amazonProducts]
//     : isAmazon
//     ? amazonProducts
//     : flipkartProducts;

//   const question = showBoth
//     ? "Compare top selling Flipkart and Amazon products by sales volume."
//     : isAmazon
//     ? "Summarize key patterns and insights from top selling Amazon products by sales volume."
//     : "Summarize key patterns and insights from top selling Flipkart products by sales volume.";

//   const sourceTable = isAmazon
//     ? "rapidapi_amazon_products"
//     : table === "flipkart" || table === "rapidapi_flipkart_products"
//     ? "rapidapi_flipkart_products"
//     : "combined_sources";

//   const { summary, loading: summaryLoading } = useAISummary(
//     question,
//     sourceTable,
//     allProducts,
//     allProducts.length,
//     filters
//   );

//   return (
//     <div className="grid grid-cols-1 gap-6 mb-8">
//       <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
//         <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
//           <CardTitle className="text-lg font-semibold">
//             {showBoth
//               ? "Top Trending Products (Both Sources)"
//               : isAmazon
//               ? "Top Trending Products (Amazon)"
//               : "Top Trending Products (Flipkart)"}
//           </CardTitle>
//           <Badge variant="secondary" className="text-xs">
//             Live Data
//           </Badge>
//         </CardHeader>

//         <CardContent className="p-0">
//           {summaryLoading ? (
//             <p className="text-sm text-muted-foreground mb-3">
//               Generating Smart summary...
//             </p>
//           ) : summary ? (
//             <p className="text-sm font-medium mb-3 p-3 bg-muted/50 rounded-lg">
//               {summary}
//             </p>
//           ) : null}

//           <div className="space-y-4">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 bg-muted rounded-lg"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <Skeleton className="w-8 h-8 rounded-full" />
//                     <div>
//                       <Skeleton className="h-4 w-32 mb-1" />
//                       <Skeleton className="h-3 w-20" />
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : showBoth ? (
//               <>
//                 {flipkartProducts.length > 0 && (
//                   <>
//                     <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
//                       Flipkart Top {flipkartProducts.length}
//                     </h3>
//                     {flipkartProducts.map((product, index) => (
//                       <ProductCard
//                         key={`flipkart-${index}`}
//                         product={product}
//                         index={index}
//                         source="flipkart"
//                       />
//                     ))}
//                   </>
//                 )}

//                 {amazonProducts.length > 0 && (
//                   <>
//                     <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
//                       Amazon Top {amazonProducts.length}
//                     </h3>
//                     {amazonProducts.map((product, index) => (
//                       <ProductCard
//                         key={`amazon-${index}`}
//                         product={product}
//                         index={index}
//                         source="amazon"
//                       />
//                     ))}
//                   </>
//                 )}
//               </>
//             ) : allProducts.length > 0 ? (
//               allProducts.map((product, index) => (
//                 <ProductCard
//                   key={index}
//                   product={product}
//                   index={index}
//                   source={isAmazon ? "amazon" : "flipkart"}
//                 />
//               ))
//             ) : (
//               <div className="text-center py-8 text-muted-foreground">
//                 <p>No trending products available</p>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }






import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Lock, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/components/dashboard/FiltersContext";
import { useAISummary } from "@/hooks/useAISummary";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/useSubscriptionLimits";

interface TrendingProduct {
  product_title?: string;
  title?: string;
  daily_sales?: number;
  total_daily_sales?: number;
  sales_volume?: string | number;
  estimated_sales?: number;
  avg_price?: number;
  product_price?: number;
}

function ProductCard({
  product,
  index,
  source,
}: {
  product: TrendingProduct;
  index: number;
  source: string;
}) {
  const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500"];
  const gradients = [
    "from-green-50 to-green-100",
    "from-blue-50 to-blue-100",
    "from-purple-50 to-purple-100",
  ];

  const productName = product.product_title || product.title || "Unknown Product";

  const salesVolumeRaw = product.daily_sales || product.total_daily_sales || product.sales_volume || product.estimated_sales || 0;
  const salesVolume = typeof salesVolumeRaw === 'string'
    ? parseFloat(salesVolumeRaw.replace(/[^0-9.]/g, '')) || 0
    : salesVolumeRaw;

  const price = product.avg_price || product.product_price || 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-gradient-to-r gap-3",
        gradients[index % gradients.length]
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
            colors[index % colors.length]
          )}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" title={productName.replace(/"/g, "")}>
            {productName.replace(/"/g, "")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {Math.round(salesVolume).toLocaleString()} sales • ₹{price.toFixed(0)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          {source === "flipkart" ? "Flipkart" : "Amazon"}
        </Badge>
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
    </div>
  );
}

export default function ProductRankings({
  selectedSource,
}: {
  selectedSource: string;
}) {
  const BASE_URL = "http://localhost:8000";
  const { filters } = useFilters();
  const { canAccessFeature, currentTier } = useSubscriptionLimits();

  const [flipkartProducts, setFlipkartProducts] = useState<TrendingProduct[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (filters.category && filters.category !== "All Categories") {
      params.append("category", filters.category);
    }

    if (filters.priceRange[0] > 0) {
      params.append("min_price", filters.priceRange[0].toString());
    }
    if (filters.priceRange[1] < 5000000) {
      params.append("max_price", filters.priceRange[1].toString());
    }

    if (filters.rating > 0) {
      params.append("min_rating", filters.rating.toString());
    }

    if (filters.dateRange !== "all") {
      params.append("date_range", filters.dateRange);
    }

    if (filters.showTrendingOnly) {
      params.append("trending_only", "true");
    }

    if (filters.sortBy) {
      params.append("sort_by", filters.sortBy);
    }

    return params.toString();
  };

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const queryParams = buildQueryParams();
        const topN = filters.topN || 10;

        if (table === "both") {
          const halfN = Math.ceil(topN / 2);
          const [flipkartRes, amazonRes] = await Promise.all([
            fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${halfN}&${queryParams}`),
            fetch(`${BASE_URL}/rapidapi/top-sales?limit=${halfN}&${queryParams}`),
          ]);

          const [flipkartJson, amazonJson] = await Promise.all([
            flipkartRes.json(),
            amazonRes.json(),
          ]);

          setFlipkartProducts(flipkartJson.data || []);
          setAmazonProducts(amazonJson.data || []);
        } else if (table === "amazon" || table === "rapidapi_amazon_products") {
          const res = await fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`);
          const json = await res.json();
          setFlipkartProducts([]);
          setAmazonProducts(json.data || []);
        } else {
          const res = await fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`);
          const json = await res.json();
          setFlipkartProducts(json.data || []);
          setAmazonProducts([]);
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
        setFlipkartProducts([]);
        setAmazonProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [selectedSource, filters]);

  const table = filters.table || selectedSource;
  const showBoth = table === "both";
  const isAmazon = table === "amazon" || table === "rapidapi_amazon_products";

  const allProducts = showBoth
    ? [...flipkartProducts, ...amazonProducts]
    : isAmazon
      ? amazonProducts
      : flipkartProducts;

  const hasAISummaries = canAccessFeature('hasChartAISummaries');

  const question = showBoth
    ? "Compare top selling Flipkart and Amazon products by sales volume."
    : isAmazon
      ? "Summarize key patterns and insights from top selling Amazon products by sales volume."
      : "Summarize key patterns and insights from top selling Flipkart products by sales volume.";

  const sourceTable = isAmazon
    ? "rapidapi_amazon_products"
    : table === "flipkart" || table === "rapidapi_flipkart_products"
      ? "rapidapi_flipkart_products"
      : "combined_sources";

  const { summary, loading: summaryLoading } = useAISummary(
    hasAISummaries ? question : "",
    sourceTable,
    allProducts,
    allProducts.length,
    filters
  );

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between mb-4 p-0">
          <CardTitle className="text-lg font-semibold">
            {showBoth
              ? "Market Movers (Both Sources)"
              : isAmazon
                ? "Market Movers (Amazon)"
                : "Market Movers (Flipkart)"}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Live Data
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {/* AI Summary Section with Subscription Gate */}
          {hasAISummaries ? (
            summaryLoading ? (
              <div className="mb-3 text-sm text-muted-foreground italic flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
                Generating Smart summary...
              </div>
            ) : summary ? (
              <div className="mb-3 text-sm font-medium p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{summary}</span>
              </div>
            ) : null
          ) : (
            <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-900">
                    🎯 AI Market Insights Locked
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {currentTier === 'free'
                      ? 'Upgrade to Basic to get AI-powered analysis of market trends and product performance'
                      : 'Get instant insights on top-performing products'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : showBoth ? (
              <>
                {flipkartProducts.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                      Flipkart Top {flipkartProducts.length}
                    </h3>
                    {flipkartProducts.map((product, index) => (
                      <ProductCard
                        key={`flipkart-${index}`}
                        product={product}
                        index={index}
                        source="flipkart"
                      />
                    ))}
                  </>
                )}

                {amazonProducts.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">
                      Amazon Top {amazonProducts.length}
                    </h3>
                    {amazonProducts.map((product, index) => (
                      <ProductCard
                        key={`amazon-${index}`}
                        product={product}
                        index={index}
                        source="amazon"
                      />
                    ))}
                  </>
                )}
              </>
            ) : allProducts.length > 0 ? (
              allProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  index={index}
                  source={isAmazon ? "amazon" : "flipkart"}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No trending products available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
